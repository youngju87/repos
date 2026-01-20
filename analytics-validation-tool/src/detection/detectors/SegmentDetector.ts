/**
 * Segment Detector
 *
 * Detects Segment implementation through:
 * - analytics.js script from Segment CDN
 * - analytics.track/identify/page calls
 * - api.segment.io endpoint calls
 * - Write key
 */

import { BaseDetector, CONFIDENCE } from '../BaseDetector';
import type {
  TagInstance,
  EvidenceContext,
  DetectionEvidence,
  TagConfiguration,
} from '../types';
import { extractQueryParams, parsePayload } from '../EvidenceExtractor';

export class SegmentDetector extends BaseDetector {
  readonly id = 'segment';
  readonly name = 'Segment';
  readonly platform = 'segment' as const;
  readonly category = 'cdp' as const;
  readonly version = '1.0.0';
  readonly priority = 75;

  // Segment patterns
  private readonly SEGMENT_CDN_PATTERN = /cdn\.segment\.(com|io)/i;
  private readonly SEGMENT_API_PATTERN = /api\.segment\.(com|io)/i;
  private readonly WRITE_KEY_PATTERN = /^[a-zA-Z0-9]{20,}$/;
  private readonly ANALYTICS_LOAD_PATTERN =
    /analytics\.load\s*\(\s*['"]([^'"]+)['"]/;
  private readonly ANALYTICS_METHOD_PATTERN =
    /analytics\.(track|identify|page|group|alias)\s*\(/g;

  /**
   * Quick check for Segment presence
   */
  mightBePresent(context: EvidenceContext): boolean {
    // Check for Segment CDN script
    if (context.hasScriptMatching('cdn.segment')) {
      return true;
    }

    // Check for Segment API calls
    if (context.hasRequestMatching('api.segment')) {
      return true;
    }

    // Check for analytics.load in inline scripts
    for (const { content } of context.inlineScripts) {
      if (/analytics\.load\s*\(/.test(content)) {
        return true;
      }
    }

    // Check for ajs_ cookies
    if (context.hasCookie(/^ajs_/)) {
      return true;
    }

    return false;
  }

  /**
   * Full Segment detection
   */
  async detect(context: EvidenceContext): Promise<TagInstance[]> {
    const evidence: DetectionEvidence[] = [];
    const writeKeys = new Set<string>();
    const scriptUrls: string[] = [];
    const endpoints: string[] = [];
    const requestIds: string[] = [];
    const trackedMethods = new Set<string>();
    let firstSeen = Date.now();
    let lastSeen = 0;
    let isActive = false;

    // 1. Detect Segment CDN script
    const scriptEvidence = this.detectSegmentScript(context, scriptUrls, writeKeys);
    evidence.push(...scriptEvidence);

    // 2. Detect analytics.load() and method calls
    const analyticsEvidence = this.detectAnalyticsCalls(
      context,
      writeKeys,
      trackedMethods
    );
    evidence.push(...analyticsEvidence);

    // 3. Detect API calls
    const apiEvidence = this.detectApiCalls(context, endpoints, requestIds);
    evidence.push(...apiEvidence);

    // 4. Detect cookies
    const cookieEvidence = this.detectCookies(context);
    evidence.push(...cookieEvidence);

    // Update timestamps from requests
    for (const id of requestIds) {
      const requests = context.scan.networkRequests.filter((r) => r.id === id);
      for (const req of requests) {
        if (req.initiatedAt < firstSeen) firstSeen = req.initiatedAt;
        if (req.initiatedAt > lastSeen) lastSeen = req.initiatedAt;
        if (!req.failed) isActive = true;
      }
    }

    // If no evidence, return empty
    if (evidence.length === 0) {
      return [];
    }

    // Build configuration
    const config: TagConfiguration = {
      primaryId: writeKeys.size > 0 ? Array.from(writeKeys)[0] : undefined,
      additionalIds: writeKeys.size > 1 ? Array.from(writeKeys).slice(1) : undefined,
      properties: {
        writeKeys: Array.from(writeKeys),
        trackedMethods: Array.from(trackedMethods),
      },
      enabledFeatures: Array.from(trackedMethods),
    };

    // Determine load method
    const loadMethod = this.determineLoadMethod(scriptUrls, context);

    // Create tag instance
    const instance = this.createTagInstance({
      confidence: this.calculateConfidence(evidence),
      detectionMethods: [...new Set(evidence.map((e) => e.method))],
      evidence,
      config,
      scriptUrls,
      endpoints,
      networkRequestIds: requestIds,
      firstSeenAt: firstSeen || Date.now(),
      lastSeenAt: lastSeen || Date.now(),
      loadMethod,
      isActive,
      hasErrors: false,
    });

    return [instance];
  }

  /**
   * Detect Segment CDN script
   */
  private detectSegmentScript(
    context: EvidenceContext,
    scriptUrls: string[],
    writeKeys: Set<string>
  ): DetectionEvidence[] {
    const evidence: DetectionEvidence[] = [];

    for (const url of context.scriptUrls) {
      if (this.SEGMENT_CDN_PATTERN.test(url)) {
        const script = context.scriptsByUrl.get(url);
        if (script?.src) scriptUrls.push(script.src);

        // Try to extract write key from URL
        const keyMatch = url.match(/analytics\.js\/v1\/([^/]+)/);
        if (keyMatch && this.WRITE_KEY_PATTERN.test(keyMatch[1])) {
          writeKeys.add(keyMatch[1]);

          evidence.push(
            this.createEvidence(
              'script-url',
              'Segment analytics.js with write key',
              keyMatch[1],
              CONFIDENCE.HIGH,
              { scriptUrl: url, writeKey: keyMatch[1] }
            )
          );
        } else {
          evidence.push(
            this.createEvidence(
              'script-url',
              'Segment CDN script',
              url,
              CONFIDENCE.MEDIUM_HIGH,
              { scriptUrl: url }
            )
          );
        }
      }
    }

    return evidence;
  }

  /**
   * Detect analytics.load() and other method calls
   */
  private detectAnalyticsCalls(
    context: EvidenceContext,
    writeKeys: Set<string>,
    trackedMethods: Set<string>
  ): DetectionEvidence[] {
    const evidence: DetectionEvidence[] = [];

    for (const { content, script } of context.inlineScripts) {
      // Detect analytics.load('WRITE_KEY')
      const loadMatch = content.match(this.ANALYTICS_LOAD_PATTERN);
      if (loadMatch) {
        const key = loadMatch[1];
        if (this.WRITE_KEY_PATTERN.test(key)) {
          writeKeys.add(key);

          evidence.push(
            this.createEvidence(
              'script-content',
              'analytics.load call',
              key,
              CONFIDENCE.HIGH,
              { scriptId: script.id, writeKey: key }
            )
          );
        }
      }

      // Detect analytics.track/identify/page/etc
      const methodMatches = content.matchAll(this.ANALYTICS_METHOD_PATTERN);
      for (const match of methodMatches) {
        const method = match[1];
        trackedMethods.add(method);

        evidence.push(
          this.createEvidence(
            'script-content',
            `analytics.${method} call`,
            method,
            CONFIDENCE.MEDIUM,
            { scriptId: script.id, method }
          )
        );
      }

      // Check for Segment snippet structure
      if (
        content.includes('analytics') &&
        content.includes('segment') &&
        content.includes('load')
      ) {
        evidence.push(
          this.createEvidence(
            'script-content',
            'Segment installation snippet',
            'segment snippet',
            CONFIDENCE.MEDIUM,
            { scriptId: script.id }
          )
        );
      }
    }

    return evidence;
  }

  /**
   * Detect Segment API calls
   */
  private detectApiCalls(
    context: EvidenceContext,
    endpoints: string[],
    requestIds: string[]
  ): DetectionEvidence[] {
    const evidence: DetectionEvidence[] = [];

    const apiRequests = context.getRequestsMatching(this.SEGMENT_API_PATTERN);

    for (const request of apiRequests) {
      requestIds.push(request.id);

      // Determine endpoint type
      let endpointType = 'unknown';
      if (request.url.includes('/v1/t')) {
        endpointType = 'track';
      } else if (request.url.includes('/v1/i')) {
        endpointType = 'identify';
      } else if (request.url.includes('/v1/p')) {
        endpointType = 'page';
      } else if (request.url.includes('/v1/g')) {
        endpointType = 'group';
      } else if (request.url.includes('/v1/a')) {
        endpointType = 'alias';
      } else if (request.url.includes('/v1/b')) {
        endpointType = 'batch';
      }

      // Extract endpoint
      try {
        const url = new URL(request.url);
        const endpoint = `${url.origin}${url.pathname}`;
        if (!endpoints.includes(endpoint)) {
          endpoints.push(endpoint);
        }
      } catch {
        // Invalid URL
      }

      evidence.push(
        this.createEvidence(
          'network-endpoint',
          `Segment ${endpointType} API call`,
          request.url,
          CONFIDENCE.HIGH,
          {
            requestId: request.id,
            endpointType,
          }
        )
      );
    }

    return evidence;
  }

  /**
   * Detect Segment cookies
   */
  private detectCookies(context: EvidenceContext): DetectionEvidence[] {
    const evidence: DetectionEvidence[] = [];

    // ajs_user_id cookie
    if (context.hasCookie('ajs_user_id')) {
      evidence.push(
        this.createEvidence('cookie', 'ajs_user_id cookie', 'ajs_user_id', CONFIDENCE.MEDIUM, {
          cookieName: 'ajs_user_id',
        })
      );
    }

    // ajs_anonymous_id cookie
    if (context.hasCookie('ajs_anonymous_id')) {
      evidence.push(
        this.createEvidence(
          'cookie',
          'ajs_anonymous_id cookie',
          'ajs_anonymous_id',
          CONFIDENCE.MEDIUM,
          { cookieName: 'ajs_anonymous_id' }
        )
      );
    }

    return evidence;
  }
}
