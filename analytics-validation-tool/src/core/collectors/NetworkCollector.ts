/**
 * Network Collector
 *
 * Captures all network requests and responses during page execution.
 * Uses Playwright's CDP session for rich network data including:
 * - Request/response headers
 * - Request/response bodies
 * - Timing information
 * - Initiator information
 *
 * Supports interception of:
 * - fetch() requests
 * - XMLHttpRequest
 * - sendBeacon()
 * - Image pixel requests
 * - Script loads
 * - All other network traffic
 */

import type { Page, CDPSession, Request, Response } from 'playwright';
import type { Collector, NetworkCollectorOptions, Unsubscribe, EventHandler } from './types';
import type { NetworkRequest, ResourceType, HttpMethod, RequestInitiator } from '../../types';
import { CollectorError } from '../utils/errors';
import { generateId } from '../../types';
import { parseQueryString, truncate, matchUrlPattern } from '../utils/serialization';

/**
 * Known analytics URL patterns for classification
 */
const ANALYTICS_URL_PATTERNS = [
  // Google Analytics
  '*google-analytics.com/*',
  '*analytics.google.com/*',
  '*/g/collect*',
  '*/j/collect*',
  '*/r/collect*',
  '*googletagmanager.com/*',

  // Adobe Analytics
  '*omtrdc.net/*',
  '*2o7.net/*',
  '*demdex.net/*',

  // Facebook/Meta
  '*facebook.com/tr*',
  '*facebook.net/*',

  // Other common platforms
  '*doubleclick.net/*',
  '*adsrvr.org/*',
  '*criteo.com/*',
  '*hotjar.com/*',
  '*clarity.ms/*',
  '*mixpanel.com/*',
  '*segment.io/*',
  '*segment.com/*',
  '*amplitude.com/*',
  '*heap.io/*',
  '*fullstory.com/*',
  '*mouseflow.com/*',
  '*crazyegg.com/*',
  '*optimizely.com/*',
  '*launchdarkly.com/*',

  // Tealium
  '*tealiumiq.com/*',
  '*tiqcdn.com/*',

  // Generic patterns
  '*collect*',
  '*beacon*',
  '*tracking*',
  '*analytics*',
  '*telemetry*',
];

/**
 * Default options for network collector
 */
const DEFAULT_OPTIONS: Required<NetworkCollectorOptions> = {
  debug: false,
  captureResponseBodies: true,
  maxResponseBodySize: 1024 * 1024, // 1MB
  excludePatterns: [],
  excludeResourceTypes: [],
  captureRequestBodies: true,
  maxRequestBodySize: 1024 * 100, // 100KB
};

/**
 * Network Collector Class
 */
export class NetworkCollector implements Collector<NetworkRequest[]> {
  private page: Page | null = null;
  private cdpSession: CDPSession | null = null;
  private requests: Map<string, Partial<NetworkRequest>> = new Map();
  private completedRequests: NetworkRequest[] = [];
  private options: Required<NetworkCollectorOptions>;
  private attached = false;
  private eventHandlers: Map<string, EventHandler<NetworkRequest>[]> = new Map();
  private cleanupFunctions: Unsubscribe[] = [];

  constructor(options: NetworkCollectorOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Attach to a page and start collecting network data
   */
  async attach(page: Page): Promise<void> {
    if (this.attached) {
      throw new CollectorError('NetworkCollector', 'Already attached to a page');
    }

    this.page = page;
    this.reset();

    try {
      // Get CDP session for advanced network interception
      this.cdpSession = await page.context().newCDPSession(page);

      // Enable network domain with detailed options
      await this.cdpSession.send('Network.enable', {
        maxPostDataSize: this.options.maxRequestBodySize,
        maxResourceBufferSize: this.options.maxResponseBodySize,
        maxTotalBufferSize: this.options.maxResponseBodySize * 10,
      });

      // Set up CDP event listeners
      this.setupCDPListeners();

      // Also set up Playwright event listeners for additional coverage
      this.setupPlaywrightListeners();

      this.attached = true;

      if (this.options.debug) {
        console.log('[NetworkCollector] Attached to page');
      }
    } catch (error) {
      throw new CollectorError(
        'NetworkCollector',
        `Failed to attach: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Set up Chrome DevTools Protocol event listeners
   */
  private setupCDPListeners(): void {
    if (!this.cdpSession) return;

    // Request will be sent
    const onRequestWillBeSent = (params: {
      requestId: string;
      request: {
        url: string;
        method: string;
        headers: Record<string, string>;
        postData?: string;
      };
      timestamp: number;
      type: string;
      initiator: {
        type: string;
        url?: string;
        lineNumber?: number;
        columnNumber?: number;
        stack?: { callFrames: Array<{ url: string; lineNumber: number; columnNumber: number }> };
      };
      redirectResponse?: unknown;
      frameId: string;
    }) => {
      const request = this.createRequestFromCDP(params);
      this.requests.set(params.requestId, request);

      if (this.options.debug) {
        console.log(`[NetworkCollector] Request: ${params.request.method} ${params.request.url}`);
      }
    };

    // Response received
    const onResponseReceived = (params: {
      requestId: string;
      response: {
        url: string;
        status: number;
        statusText: string;
        headers: Record<string, string>;
        mimeType: string;
        fromDiskCache?: boolean;
        fromServiceWorker?: boolean;
      };
      timestamp: number;
      type: string;
      frameId: string;
    }) => {
      const request = this.requests.get(params.requestId);
      if (request) {
        request.status = params.response.status;
        request.statusText = params.response.statusText;
        request.responseHeaders = this.normalizeHeaders(params.response.headers);
        request.responseReceivedAt = Date.now();
        request.fromCache =
          params.response.fromDiskCache || params.response.fromServiceWorker || false;
      }
    };

    // Loading finished - request completed successfully
    const onLoadingFinished = async (params: { requestId: string; timestamp: number; encodedDataLength: number }) => {
      const request = this.requests.get(params.requestId);
      if (!request) return;

      request.completedAt = Date.now();
      request.failed = false;

      if (request.initiatedAt) {
        request.duration = request.completedAt - request.initiatedAt;
      }

      // Try to get response body
      if (this.options.captureResponseBodies && this.cdpSession) {
        try {
          const bodyResult = await this.cdpSession.send('Network.getResponseBody', {
            requestId: params.requestId,
          });

          const body = bodyResult.base64Encoded
            ? Buffer.from(bodyResult.body, 'base64').toString('utf-8')
            : bodyResult.body;

          if (body.length > this.options.maxResponseBodySize) {
            request.responseBody = truncate(body, this.options.maxResponseBodySize);
            request.responseBodyTruncated = true;
          } else {
            request.responseBody = body;
            request.responseBodyTruncated = false;
          }
        } catch {
          // Response body may not be available for all requests
        }
      }

      this.finalizeRequest(params.requestId);
    };

    // Loading failed
    const onLoadingFailed = (params: {
      requestId: string;
      timestamp: number;
      errorText: string;
      canceled?: boolean;
    }) => {
      const request = this.requests.get(params.requestId);
      if (!request) return;

      request.completedAt = Date.now();
      request.failed = true;
      request.failureReason = params.canceled ? 'Request canceled' : params.errorText;

      if (request.initiatedAt) {
        request.duration = request.completedAt - request.initiatedAt;
      }

      this.finalizeRequest(params.requestId);
    };

    // Request served from cache
    const onRequestServedFromCache = (params: { requestId: string }) => {
      const request = this.requests.get(params.requestId);
      if (request) {
        request.fromCache = true;
      }
    };

    // Attach listeners
    this.cdpSession.on('Network.requestWillBeSent', onRequestWillBeSent);
    this.cdpSession.on('Network.responseReceived', onResponseReceived);
    this.cdpSession.on('Network.loadingFinished', onLoadingFinished);
    this.cdpSession.on('Network.loadingFailed', onLoadingFailed);
    this.cdpSession.on('Network.requestServedFromCache', onRequestServedFromCache);

    // Track cleanup functions
    this.cleanupFunctions.push(() => {
      this.cdpSession?.off('Network.requestWillBeSent', onRequestWillBeSent);
      this.cdpSession?.off('Network.responseReceived', onResponseReceived);
      this.cdpSession?.off('Network.loadingFinished', onLoadingFinished);
      this.cdpSession?.off('Network.loadingFailed', onLoadingFailed);
      this.cdpSession?.off('Network.requestServedFromCache', onRequestServedFromCache);
    });
  }

  /**
   * Set up Playwright event listeners as fallback
   */
  private setupPlaywrightListeners(): void {
    if (!this.page) return;

    // These serve as fallback and for additional context
    const onRequest = (request: Request) => {
      // CDP should handle this, but we update frame info
      const url = request.url();

      // Find matching request by URL
      for (const [id, req] of this.requests) {
        if (req.url === url && !req.isMainFrame) {
          req.isMainFrame = request.isNavigationRequest();
          break;
        }
      }
    };

    const onResponse = (response: Response) => {
      // Additional response handling if needed
    };

    this.page.on('request', onRequest);
    this.page.on('response', onResponse);

    this.cleanupFunctions.push(() => {
      this.page?.off('request', onRequest);
      this.page?.off('response', onResponse);
    });
  }

  /**
   * Create a NetworkRequest from CDP event data
   */
  private createRequestFromCDP(params: {
    requestId: string;
    request: {
      url: string;
      method: string;
      headers: Record<string, string>;
      postData?: string;
    };
    timestamp: number;
    type: string;
    initiator: {
      type: string;
      url?: string;
      lineNumber?: number;
      columnNumber?: number;
      stack?: { callFrames: Array<{ url: string; lineNumber: number; columnNumber: number }> };
    };
    frameId: string;
  }): Partial<NetworkRequest> {
    const url = params.request.url;
    const parsedUrl = this.parseUrl(url);

    const initiator: RequestInitiator = {
      type: this.mapInitiatorType(params.initiator.type),
      url: params.initiator.url,
      lineNumber: params.initiator.lineNumber,
      columnNumber: params.initiator.columnNumber,
      stack: params.initiator.stack
        ? params.initiator.stack.callFrames
            .map((f) => `    at ${f.url}:${f.lineNumber}:${f.columnNumber}`)
            .join('\n')
        : undefined,
    };

    const request: Partial<NetworkRequest> = {
      id: generateId(),
      url,
      method: params.request.method as HttpMethod,
      resourceType: this.mapResourceType(params.type),
      requestHeaders: this.normalizeHeaders(params.request.headers),
      queryParams: parsedUrl?.search ? parseQueryString(parsedUrl.search) : undefined,
      initiatedAt: Date.now(),
      initiator,
      failed: false,
      fromCache: false,
      isMainFrame: false, // Will be updated
      frameId: params.frameId,
      isAnalyticsRequest: this.isAnalyticsUrl(url),
    };

    // Capture request body
    if (this.options.captureRequestBodies && params.request.postData) {
      const postData = params.request.postData;
      if (postData.length > this.options.maxRequestBodySize) {
        request.requestBody = truncate(postData, this.options.maxRequestBodySize);
      } else {
        request.requestBody = postData;
      }

      // Try to parse body
      request.requestBodyParsed = this.parseRequestBody(
        postData,
        params.request.headers['Content-Type'] || params.request.headers['content-type']
      );
    }

    return request;
  }

  /**
   * Parse URL safely
   */
  private parseUrl(url: string): URL | null {
    try {
      return new URL(url);
    } catch {
      return null;
    }
  }

  /**
   * Normalize headers to lowercase keys
   */
  private normalizeHeaders(headers: Record<string, string>): Record<string, string> {
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      normalized[key.toLowerCase()] = value;
    }
    return normalized;
  }

  /**
   * Map CDP initiator type to our type
   */
  private mapInitiatorType(
    type: string
  ): 'parser' | 'script' | 'preload' | 'SignedExchange' | 'preflight' | 'other' {
    switch (type.toLowerCase()) {
      case 'parser':
        return 'parser';
      case 'script':
        return 'script';
      case 'preload':
        return 'preload';
      case 'signedexchange':
        return 'SignedExchange';
      case 'preflight':
        return 'preflight';
      default:
        return 'other';
    }
  }

  /**
   * Map CDP resource type to our type
   */
  private mapResourceType(type: string): ResourceType {
    const typeMap: Record<string, ResourceType> = {
      Document: 'document',
      Stylesheet: 'stylesheet',
      Image: 'image',
      Media: 'media',
      Font: 'font',
      Script: 'script',
      TextTrack: 'texttrack',
      XHR: 'xhr',
      Fetch: 'fetch',
      EventSource: 'eventsource',
      WebSocket: 'websocket',
      Manifest: 'manifest',
      Ping: 'ping',
      Beacon: 'beacon',
    };

    return typeMap[type] || 'other';
  }

  /**
   * Check if URL appears to be an analytics/tracking request
   */
  private isAnalyticsUrl(url: string): boolean {
    const lowerUrl = url.toLowerCase();

    for (const pattern of ANALYTICS_URL_PATTERNS) {
      if (matchUrlPattern(lowerUrl, pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Parse request body based on content type
   */
  private parseRequestBody(
    body: string,
    contentType?: string
  ): Record<string, unknown> | undefined {
    if (!body) return undefined;

    try {
      // JSON
      if (contentType?.includes('application/json') || body.startsWith('{') || body.startsWith('[')) {
        return JSON.parse(body);
      }

      // Form URL encoded
      if (
        contentType?.includes('application/x-www-form-urlencoded') ||
        body.includes('=')
      ) {
        return parseQueryString(body) as Record<string, unknown>;
      }
    } catch {
      // Return undefined if parsing fails
    }

    return undefined;
  }

  /**
   * Check if request should be excluded
   */
  private shouldExcludeRequest(request: Partial<NetworkRequest>): boolean {
    // Check URL patterns
    for (const pattern of this.options.excludePatterns) {
      if (request.url && matchUrlPattern(request.url, pattern)) {
        return true;
      }
    }

    // Check resource types
    if (
      request.resourceType &&
      this.options.excludeResourceTypes.includes(request.resourceType)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Finalize a request and move it to completed list
   */
  private finalizeRequest(requestId: string): void {
    const request = this.requests.get(requestId);
    if (!request) return;

    // Check exclusions
    if (this.shouldExcludeRequest(request)) {
      this.requests.delete(requestId);
      return;
    }

    // Ensure all required fields are present
    const finalRequest: NetworkRequest = {
      id: request.id || generateId(),
      url: request.url || '',
      method: request.method || 'GET',
      resourceType: request.resourceType || 'other',
      requestHeaders: request.requestHeaders || {},
      requestBody: request.requestBody,
      requestBodyParsed: request.requestBodyParsed,
      queryParams: request.queryParams,
      status: request.status,
      statusText: request.statusText,
      responseHeaders: request.responseHeaders,
      responseBody: request.responseBody,
      responseBodyTruncated: request.responseBodyTruncated,
      initiatedAt: request.initiatedAt || Date.now(),
      responseReceivedAt: request.responseReceivedAt,
      completedAt: request.completedAt,
      duration: request.duration,
      initiator: request.initiator || { type: 'other' },
      failed: request.failed || false,
      failureReason: request.failureReason,
      fromCache: request.fromCache || false,
      isAnalyticsRequest: request.isAnalyticsRequest,
      redirectChain: request.redirectChain,
      frameId: request.frameId,
      isMainFrame: request.isMainFrame || false,
    };

    this.completedRequests.push(finalRequest);
    this.requests.delete(requestId);

    // Emit event
    this.emit('request', finalRequest);
  }

  /**
   * Subscribe to request events
   */
  onRequest(handler: EventHandler<NetworkRequest>): Unsubscribe {
    const handlers = this.eventHandlers.get('request') || [];
    handlers.push(handler);
    this.eventHandlers.set('request', handlers);

    return () => {
      const idx = handlers.indexOf(handler);
      if (idx !== -1) {
        handlers.splice(idx, 1);
      }
    };
  }

  /**
   * Emit an event to all handlers
   */
  private emit(event: string, data: NetworkRequest): void {
    const handlers = this.eventHandlers.get(event) || [];
    for (const handler of handlers) {
      try {
        handler(data);
      } catch (error) {
        if (this.options.debug) {
          console.error(`[NetworkCollector] Event handler error:`, error);
        }
      }
    }
  }

  /**
   * Detach from the page
   */
  async detach(): Promise<void> {
    if (!this.attached) {
      return;
    }

    // Run cleanup functions
    for (const cleanup of this.cleanupFunctions) {
      try {
        cleanup();
      } catch {
        // Ignore cleanup errors
      }
    }
    this.cleanupFunctions = [];

    // Disable network domain
    if (this.cdpSession) {
      try {
        await this.cdpSession.send('Network.disable');
        await this.cdpSession.detach();
      } catch {
        // Session may already be detached
      }
      this.cdpSession = null;
    }

    this.page = null;
    this.attached = false;

    if (this.options.debug) {
      console.log('[NetworkCollector] Detached from page');
    }
  }

  /**
   * Collect all captured requests
   */
  async collect(): Promise<NetworkRequest[]> {
    // Finalize any remaining in-progress requests
    for (const [requestId, request] of this.requests) {
      request.completedAt = Date.now();
      request.failed = true;
      request.failureReason = 'Request incomplete at collection time';
      this.finalizeRequest(requestId);
    }

    // Sort by initiation time
    return [...this.completedRequests].sort((a, b) => a.initiatedAt - b.initiatedAt);
  }

  /**
   * Reset collector state
   */
  reset(): void {
    this.requests.clear();
    this.completedRequests = [];
    this.eventHandlers.clear();
  }

  /**
   * Check if collector is attached
   */
  isAttached(): boolean {
    return this.attached;
  }

  /**
   * Get count of captured requests
   */
  getRequestCount(): number {
    return this.completedRequests.length + this.requests.size;
  }

  /**
   * Get analytics requests only
   */
  getAnalyticsRequests(): NetworkRequest[] {
    return this.completedRequests.filter((r) => r.isAnalyticsRequest);
  }
}
