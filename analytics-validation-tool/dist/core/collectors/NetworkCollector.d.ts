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
import type { Page } from 'playwright';
import type { Collector, NetworkCollectorOptions, Unsubscribe, EventHandler } from './types';
import type { NetworkRequest } from '../../types';
/**
 * Network Collector Class
 */
export declare class NetworkCollector implements Collector<NetworkRequest[]> {
    private page;
    private cdpSession;
    private requests;
    private completedRequests;
    private options;
    private attached;
    private eventHandlers;
    private cleanupFunctions;
    constructor(options?: NetworkCollectorOptions);
    /**
     * Attach to a page and start collecting network data
     */
    attach(page: Page): Promise<void>;
    /**
     * Set up Chrome DevTools Protocol event listeners
     */
    private setupCDPListeners;
    /**
     * Set up Playwright event listeners as fallback
     */
    private setupPlaywrightListeners;
    /**
     * Create a NetworkRequest from CDP event data
     */
    private createRequestFromCDP;
    /**
     * Parse URL safely
     */
    private parseUrl;
    /**
     * Normalize headers to lowercase keys
     */
    private normalizeHeaders;
    /**
     * Map CDP initiator type to our type
     */
    private mapInitiatorType;
    /**
     * Map CDP resource type to our type
     */
    private mapResourceType;
    /**
     * Check if URL appears to be an analytics/tracking request
     */
    private isAnalyticsUrl;
    /**
     * Parse request body based on content type
     */
    private parseRequestBody;
    /**
     * Check if request should be excluded
     */
    private shouldExcludeRequest;
    /**
     * Finalize a request and move it to completed list
     */
    private finalizeRequest;
    /**
     * Subscribe to request events
     */
    onRequest(handler: EventHandler<NetworkRequest>): Unsubscribe;
    /**
     * Emit an event to all handlers
     */
    private emit;
    /**
     * Detach from the page
     */
    detach(): Promise<void>;
    /**
     * Collect all captured requests
     */
    collect(): Promise<NetworkRequest[]>;
    /**
     * Reset collector state
     */
    reset(): void;
    /**
     * Check if collector is attached
     */
    isAttached(): boolean;
    /**
     * Get count of captured requests
     */
    getRequestCount(): number;
    /**
     * Get analytics requests only
     */
    getAnalyticsRequests(): NetworkRequest[];
}
//# sourceMappingURL=NetworkCollector.d.ts.map