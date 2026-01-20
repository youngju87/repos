/**
 * GA4 (Google Analytics 4) Detector
 *
 * Detects Google Analytics 4 implementation through:
 * - gtag.js script
 * - G-XXXXXXX measurement IDs
 * - /g/collect endpoint calls
 * - gtag() function calls
 * - dataLayer interactions
 */

import { BaseDetector, CONFIDENCE, COMMON_PATTERNS } from '../BaseDetector';
import type {
  TagInstance,
  EvidenceContext,
  DetectionEvidence,
  TagConfiguration,
} from '../types';
import type { NetworkRequest } from '../../types';
import { extractQueryParams } from '../EvidenceExtractor';

export class GA4Detector extends BaseDetector {
  readonly id = 'ga4';
  readonly name = 'Google Analytics 4';
  readonly platform = 'ga4' as const;
  readonly category = 'analytics' as const;
  readonly version = '1.0.0';
  readonly priority = 80; // High priority - common tag

  // GA4 specific patterns
  private readonly MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{6,10}$/;
  private readonly GTAG_CONFIG_PATTERN = /gtag\s*\(\s*['"]config['"]\s*,\s*['"]([^'"]+)['"]/g;
  private readonly GA4_COLLECT_PATTERN = /google-analytics\.com\/g\/collect/i;
  private readonly GTAG_SCRIPT_PATTERN = /googletagmanager\.com\/gtag\/js\?id=(G-[A-Z0-9]+)/i;

  /**
   * Quick check for GA4 presence
   */
  mightBePresent(context: EvidenceContext): boolean {
    // Check for gtag.js script
    if (context.hasScriptMatching('googletagmanager.com/gtag/js')) {
      return true;
    }

    // Check for GA4 collect endpoint
    if (context.hasRequestMatching('/g/collect')) {
      return true;
    }

    // Check for G- measurement ID in any script
    for (const { content } of context.inlineScripts) {
      if (/G-[A-Z0-9]{6,10}/.test(content)) {
        return true;
      }
    }

    // Check for GA cookies
    if (context.hasCookie('_ga') || context.hasCookie(/_ga_G/)) {
      return true;
    }

    return false;
  }

  /**
   * Full GA4 detection
   */
  async detect(context: EvidenceContext): Promise<TagInstance[]> {
    const evidence: DetectionEvidence[] = [];
    const measurementIds = new Set<string>();
    const scriptUrls: string[] = [];
    const endpoints: string[] = [];
    const requestIds: string[] = [];
    let firstSeen = Date.now();
    let lastSeen = 0;
    let isActive = false;

    // 1. Detect gtag.js script
    const gtagEvidence = this.detectGtagScript(context, measurementIds, scriptUrls);
    evidence.push(...gtagEvidence);

    // 2. Detect G- IDs in inline scripts
    const inlineEvidence = this.detectInlineConfig(context, measurementIds);
    evidence.push(...inlineEvidence);

    // 3. Detect collect endpoint calls
    const collectEvidence = this.detectCollectCalls(
      context,
      measurementIds,
      endpoints,
      requestIds
    );
    evidence.push(...collectEvidence);

    // Update timestamps and active status from requests
    for (const id of requestIds) {
      const requests = context.scan.networkRequests.filter((r) => r.id === id);
      for (const req of requests) {
        if (req.initiatedAt < firstSeen) firstSeen = req.initiatedAt;
        if (req.initiatedAt > lastSeen) lastSeen = req.initiatedAt;
        if (!req.failed) isActive = true;
      }
    }

    // 4. Detect via cookies
    const cookieEvidence = this.detectCookies(context, measurementIds);
    evidence.push(...cookieEvidence);

    // 5. Detect dataLayer gtag events
    const dataLayerEvidence = this.detectDataLayerEvents(context);
    evidence.push(...dataLayerEvidence);

    // If no evidence, return empty
    if (evidence.length === 0) {
      return [];
    }

    // Build configuration
    const config: TagConfiguration = {
      primaryId: measurementIds.size > 0 ? Array.from(measurementIds)[0] : undefined,
      additionalIds: measurementIds.size > 1 ? Array.from(measurementIds).slice(1) : undefined,
      properties: {
        measurementIds: Array.from(measurementIds),
      },
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
      loadedVia: loadMethod === 'gtm' ? 'Google Tag Manager' : undefined,
      isActive,
      hasErrors: false,
    });

    return [instance];
  }

  /**
   * Detect gtag.js script
   */
  private detectGtagScript(
    context: EvidenceContext,
    measurementIds: Set<string>,
    scriptUrls: string[]
  ): DetectionEvidence[] {
    const evidence: DetectionEvidence[] = [];

    for (const url of context.scriptUrls) {
      const match = url.match(this.GTAG_SCRIPT_PATTERN);
      if (match) {
        const script = context.scriptsByUrl.get(url);
        scriptUrls.push(script?.src || url);

        if (match[1] && this.MEASUREMENT_ID_PATTERN.test(match[1])) {
          measurementIds.add(match[1]);

          evidence.push(
            this.createEvidence(
              'script-url',
              'gtag.js with measurement ID',
              match[1],
              CONFIDENCE.HIGH,
              { scriptUrl: url, measurementId: match[1] }
            )
          );
        } else {
          evidence.push(
            this.createEvidence(
              'script-url',
              'gtag.js script',
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
   * Detect GA4 configuration in inline scripts
   */
  private detectInlineConfig(
    context: EvidenceContext,
    measurementIds: Set<string>
  ): DetectionEvidence[] {
    const evidence: DetectionEvidence[] = [];

    for (const { content, script } of context.inlineScripts) {
      // Look for gtag('config', 'G-XXXXX') calls
      const configMatches = content.matchAll(this.GTAG_CONFIG_PATTERN);
      for (const match of configMatches) {
        const id = match[1];
        if (this.MEASUREMENT_ID_PATTERN.test(id)) {
          measurementIds.add(id);

          evidence.push(
            this.createEvidence(
              'script-content',
              'gtag config call',
              id,
              CONFIDENCE.HIGH,
              { scriptId: script.id, configCall: match[0] }
            )
          );
        }
      }

      // Look for raw G- IDs
      const idMatches = content.matchAll(/['"]?(G-[A-Z0-9]{6,10})['"]?/g);
      for (const match of idMatches) {
        const id = match[1];
        if (!measurementIds.has(id)) {
          measurementIds.add(id);

          evidence.push(
            this.createEvidence(
              'script-content',
              'GA4 measurement ID',
              id,
              CONFIDENCE.MEDIUM,
              { scriptId: script.id }
            )
          );
        }
      }
    }

    return evidence;
  }

  /**
   * Detect GA4 collect endpoint calls
   */
  private detectCollectCalls(
    context: EvidenceContext,
    measurementIds: Set<string>,
    endpoints: string[],
    requestIds: string[]
  ): DetectionEvidence[] {
    const evidence: DetectionEvidence[] = [];

    const collectRequests = context.getRequestsMatching(this.GA4_COLLECT_PATTERN);

    for (const request of collectRequests) {
      requestIds.push(request.id);

      // Extract endpoint base
      try {
        const url = new URL(request.url);
        const endpoint = `${url.origin}${url.pathname}`;
        if (!endpoints.includes(endpoint)) {
          endpoints.push(endpoint);
        }
      } catch {
        endpoints.push(request.url.split('?')[0]);
      }

      // Extract measurement ID from payload
      const params = request.queryParams || extractQueryParams(request.url);
      const tid = params['tid'];

      if (tid && this.MEASUREMENT_ID_PATTERN.test(tid)) {
        measurementIds.add(tid);

        evidence.push(
          this.createEvidence(
            'network-payload',
            'GA4 collect with measurement ID',
            tid,
            CONFIDENCE.HIGH,
            {
              requestId: request.id,
              url: request.url,
              eventName: params['en'],
            }
          )
        );
      } else {
        evidence.push(
          this.createEvidence(
            'network-endpoint',
            'GA4 collect endpoint',
            request.url,
            CONFIDENCE.MEDIUM_HIGH,
            { requestId: request.id }
          )
        );
      }
    }

    return evidence;
  }

  /**
   * Detect GA4 cookies
   */
  private detectCookies(
    context: EvidenceContext,
    measurementIds: Set<string>
  ): DetectionEvidence[] {
    const evidence: DetectionEvidence[] = [];

    // _ga cookie
    if (context.hasCookie('_ga')) {
      evidence.push(
        this.createEvidence(
          'cookie',
          '_ga cookie',
          '_ga',
          CONFIDENCE.MEDIUM_LOW,
          { cookieName: '_ga' }
        )
      );
    }

    // _ga_G-XXXXX cookies (measurement ID specific)
    for (const name of context.cookieNames) {
      const match = name.match(/^_ga_(g[a-z0-9]+)$/i);
      if (match) {
        const possibleId = 'G-' + match[1].toUpperCase().replace('G', '');

        evidence.push(
          this.createEvidence(
            'cookie',
            'GA4 session cookie',
            name,
            CONFIDENCE.MEDIUM,
            { cookieName: name, possibleMeasurementId: possibleId }
          )
        );
      }
    }

    return evidence;
  }

  /**
   * Detect gtag-related dataLayer events
   */
  private detectDataLayerEvents(context: EvidenceContext): DetectionEvidence[] {
    const evidence: DetectionEvidence[] = [];

    const dataLayerEvents = context.dataLayerEvents.get('dataLayer') || [];

    for (const event of dataLayerEvents) {
      if (typeof event.data === 'object' && event.data !== null) {
        const data = event.data as Record<string, unknown>;

        // Check for gtm.js event (indicates GTM loading gtag)
        if (data.event === 'gtm.js') {
          evidence.push(
            this.createEvidence(
              'data-layer',
              'gtm.js event',
              'gtm.js',
              CONFIDENCE.MEDIUM_LOW,
              { eventId: event.id }
            )
          );
        }

        // Check for gtag/js event
        if (data.event === 'gtag.js') {
          evidence.push(
            this.createEvidence(
              'data-layer',
              'gtag.js event',
              'gtag.js',
              CONFIDENCE.MEDIUM,
              { eventId: event.id }
            )
          );
        }
      }
    }

    return evidence;
  }
}
