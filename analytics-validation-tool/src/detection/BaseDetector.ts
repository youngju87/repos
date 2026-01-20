/**
 * Base Detector
 *
 * Provides common utilities and a base implementation for tag detectors.
 * Concrete detectors can extend this class or implement TagDetector directly.
 */

import type {
  TagDetector,
  TagInstance,
  TagCategory,
  KnownPlatform,
  LoadMethod,
  DetectionMethod,
  DetectionEvidence,
  TagConfiguration,
  EvidenceContext,
} from './types';
import type { NetworkRequest, ScriptTag } from '../types';
import { generateId } from '../types';
import { extractQueryParams, parsePayload, getNestedValue } from './EvidenceExtractor';

/**
 * Base Detector Class
 *
 * Provides utilities and scaffolding for detector implementations.
 */
export abstract class BaseDetector implements TagDetector {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly platform: KnownPlatform | string;
  abstract readonly category: TagCategory;
  abstract readonly version: string;
  readonly priority: number = 50; // Default priority

  /**
   * Quick presence check - override in subclass
   */
  abstract mightBePresent(context: EvidenceContext): boolean;

  /**
   * Full detection - override in subclass
   */
  abstract detect(context: EvidenceContext): Promise<TagInstance[]>;

  // =========================================================================
  // UTILITY METHODS
  // =========================================================================

  /**
   * Create a new TagInstance with defaults
   */
  protected createTagInstance(
    overrides: Partial<TagInstance> = {}
  ): TagInstance {
    const now = Date.now();

    return {
      id: generateId(),
      platform: this.platform,
      platformName: this.name,
      category: this.category,
      loadMethod: 'unknown',
      confidence: 0,
      detectionMethods: [],
      evidence: [],
      config: {},
      scriptUrls: [],
      endpoints: [],
      networkRequestIds: [],
      dataLayerEventIds: [],
      firstSeenAt: now,
      lastSeenAt: now,
      isActive: false,
      hasErrors: false,
      ...overrides,
    };
  }

  /**
   * Create detection evidence
   */
  protected createEvidence(
    method: DetectionMethod,
    matched: string,
    value: string,
    confidence: number,
    context?: Record<string, unknown>
  ): DetectionEvidence {
    return {
      method,
      matched,
      value,
      confidence,
      context,
    };
  }

  /**
   * Calculate combined confidence from multiple evidence pieces
   *
   * Uses a diminishing returns formula so multiple low-confidence
   * signals can combine to higher confidence.
   */
  protected calculateConfidence(evidenceList: DetectionEvidence[]): number {
    if (evidenceList.length === 0) return 0;

    // Sort by confidence descending
    const sorted = [...evidenceList].sort((a, b) => b.confidence - a.confidence);

    // Use diminishing returns: each additional evidence adds less
    let combined = 0;
    let remaining = 1;

    for (const evidence of sorted) {
      const contribution = evidence.confidence * remaining;
      combined += contribution;
      remaining *= 1 - evidence.confidence * 0.5; // Diminishing factor
    }

    return Math.min(combined, 1); // Cap at 1
  }

  /**
   * Determine load method based on evidence
   */
  protected determineLoadMethod(
    scriptUrls: string[],
    context: EvidenceContext
  ): LoadMethod {
    // Check if loaded via GTM
    for (const url of scriptUrls) {
      const script = context.scriptsByUrl.get(url.toLowerCase());
      if (script?.dynamicallyInjected) {
        // Check for TMS patterns in other scripts
        if (context.hasScriptMatching('googletagmanager.com/gtm.js')) {
          return 'gtm';
        }
        if (context.hasScriptMatching('tags.tiqcdn.com')) {
          return 'tealium';
        }
        if (context.hasScriptMatching('assets.adobedtm.com')) {
          return 'adobe-launch';
        }
        if (context.hasScriptMatching('cdn.segment.com')) {
          return 'segment';
        }
        return 'dynamic';
      }
    }

    // Check if hardcoded in page
    for (const url of scriptUrls) {
      const script = context.scriptsByUrl.get(url.toLowerCase());
      if (script && !script.dynamicallyInjected) {
        return 'direct';
      }
    }

    return 'unknown';
  }

  /**
   * Extract timestamp from request or use current time
   */
  protected getTimestamp(request?: NetworkRequest): number {
    return request?.initiatedAt || Date.now();
  }

  /**
   * Check if URL matches any of the patterns
   */
  protected matchesAnyPattern(url: string, patterns: (string | RegExp)[]): boolean {
    const lowerUrl = url.toLowerCase();
    for (const pattern of patterns) {
      if (typeof pattern === 'string') {
        if (lowerUrl.includes(pattern.toLowerCase())) {
          return true;
        }
      } else if (pattern.test(lowerUrl)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Extract ID from URL using regex
   */
  protected extractIdFromUrl(url: string, pattern: RegExp): string | null {
    const match = url.match(pattern);
    return match?.[1] || null;
  }

  /**
   * Extract IDs from query parameters
   */
  protected extractIdsFromParams(
    request: NetworkRequest,
    paramNames: string[]
  ): Record<string, string> {
    const ids: Record<string, string> = {};
    const params = request.queryParams || extractQueryParams(request.url);

    for (const name of paramNames) {
      if (params[name]) {
        ids[name] = params[name];
      }
    }

    return ids;
  }

  /**
   * Find first script matching pattern
   */
  protected findScript(
    context: EvidenceContext,
    pattern: string | RegExp
  ): ScriptTag | undefined {
    for (const url of context.scriptUrls) {
      if (typeof pattern === 'string') {
        if (url.includes(pattern.toLowerCase())) {
          return context.scriptsByUrl.get(url);
        }
      } else if (pattern.test(url)) {
        return context.scriptsByUrl.get(url);
      }
    }
    return undefined;
  }

  /**
   * Find all scripts matching pattern
   */
  protected findScripts(
    context: EvidenceContext,
    pattern: string | RegExp
  ): ScriptTag[] {
    const scripts: ScriptTag[] = [];
    for (const url of context.scriptUrls) {
      const matches =
        typeof pattern === 'string'
          ? url.includes(pattern.toLowerCase())
          : pattern.test(url);

      if (matches) {
        const script = context.scriptsByUrl.get(url);
        if (script) {
          scripts.push(script);
        }
      }
    }
    return scripts;
  }

  /**
   * Merge multiple tag instances (same platform) into one
   */
  protected mergeInstances(instances: TagInstance[]): TagInstance {
    if (instances.length === 0) {
      return this.createTagInstance();
    }

    if (instances.length === 1) {
      return instances[0];
    }

    const merged = this.createTagInstance();

    // Collect all unique values
    const allMethods = new Set<DetectionMethod>();
    const allEvidence: DetectionEvidence[] = [];
    const allScriptUrls = new Set<string>();
    const allEndpoints = new Set<string>();
    const allRequestIds = new Set<string>();
    const allDataLayerIds = new Set<string>();
    const allErrors: string[] = [];

    let minTimestamp = Date.now();
    let maxTimestamp = 0;
    let hasActive = false;
    let hasErrors = false;

    // Primary config from highest confidence instance
    let bestConfig: TagConfiguration = {};
    let bestConfidence = 0;

    for (const instance of instances) {
      // Methods
      for (const method of instance.detectionMethods) {
        allMethods.add(method);
      }

      // Evidence
      allEvidence.push(...instance.evidence);

      // URLs and IDs
      for (const url of instance.scriptUrls) {
        allScriptUrls.add(url);
      }
      for (const endpoint of instance.endpoints) {
        allEndpoints.add(endpoint);
      }
      for (const id of instance.networkRequestIds) {
        allRequestIds.add(id);
      }
      for (const id of instance.dataLayerEventIds) {
        allDataLayerIds.add(id);
      }

      // Timestamps
      minTimestamp = Math.min(minTimestamp, instance.firstSeenAt);
      maxTimestamp = Math.max(maxTimestamp, instance.lastSeenAt);

      // Status
      hasActive = hasActive || instance.isActive;
      hasErrors = hasErrors || instance.hasErrors;

      if (instance.errors) {
        allErrors.push(...instance.errors);
      }

      // Config from best instance
      if (instance.confidence > bestConfidence) {
        bestConfig = instance.config;
        bestConfidence = instance.confidence;
      }
    }

    // Apply merged values
    merged.detectionMethods = Array.from(allMethods);
    merged.evidence = allEvidence;
    merged.scriptUrls = Array.from(allScriptUrls);
    merged.endpoints = Array.from(allEndpoints);
    merged.networkRequestIds = Array.from(allRequestIds);
    merged.dataLayerEventIds = Array.from(allDataLayerIds);
    merged.firstSeenAt = minTimestamp;
    merged.lastSeenAt = maxTimestamp;
    merged.isActive = hasActive;
    merged.hasErrors = hasErrors;
    merged.errors = allErrors.length > 0 ? allErrors : undefined;
    merged.config = bestConfig;
    merged.confidence = this.calculateConfidence(allEvidence);

    // Use most specific load method
    merged.loadMethod = this.selectLoadMethod(instances.map((i) => i.loadMethod));

    return merged;
  }

  /**
   * Select most specific load method from list
   */
  private selectLoadMethod(methods: LoadMethod[]): LoadMethod {
    const priority: LoadMethod[] = [
      'gtm',
      'adobe-launch',
      'tealium',
      'segment',
      'other-tms',
      'direct',
      'dynamic',
      'unknown',
    ];

    for (const method of priority) {
      if (methods.includes(method)) {
        return method;
      }
    }

    return 'unknown';
  }
}

/**
 * Confidence thresholds
 */
export const CONFIDENCE = {
  /** Very strong signal (e.g., exact script URL match) */
  HIGH: 0.9,
  /** Strong signal (e.g., API endpoint match) */
  MEDIUM_HIGH: 0.75,
  /** Moderate signal (e.g., payload structure match) */
  MEDIUM: 0.6,
  /** Weak signal (e.g., cookie name match) */
  MEDIUM_LOW: 0.4,
  /** Very weak signal (e.g., generic pattern) */
  LOW: 0.25,
  /** Minimal signal */
  MINIMAL: 0.1,
} as const;

/**
 * Common URL patterns for quick reference
 */
export const COMMON_PATTERNS = {
  // Google
  GTM_SCRIPT: /googletagmanager\.com\/gtm\.js/i,
  GTAG_SCRIPT: /googletagmanager\.com\/gtag\/js/i,
  GA4_COLLECT: /google-analytics\.com\/g\/collect/i,
  GA_COLLECT: /google-analytics\.com\/(collect|r\/collect|j\/collect)/i,

  // Adobe
  ADOBE_LAUNCH: /assets\.adobedtm\.com/i,
  ADOBE_ANALYTICS: /\/(b|ss)\/[^/]+\/[0-9]+\//i,
  OMNITURE: /omtrdc\.net/i,

  // Meta
  FB_PIXEL: /connect\.facebook\.net.*fbevents\.js/i,
  FB_TRACK: /facebook\.com\/tr/i,

  // Segment
  SEGMENT_CDN: /cdn\.segment\.(com|io)/i,
  SEGMENT_API: /api\.segment\.(com|io)/i,

  // Tealium
  TEALIUM_SCRIPT: /tags\.tiqcdn\.com/i,
  TEALIUM_COLLECT: /collect\.tealiumiq\.com/i,
} as const;
