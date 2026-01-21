/**
 * Base Detector
 *
 * Provides common utilities and a base implementation for tag detectors.
 * Concrete detectors can extend this class or implement TagDetector directly.
 */
import type { TagDetector, TagInstance, TagCategory, KnownPlatform, LoadMethod, DetectionMethod, DetectionEvidence, EvidenceContext } from './types';
import type { NetworkRequest, ScriptTag } from '../types';
/**
 * Base Detector Class
 *
 * Provides utilities and scaffolding for detector implementations.
 */
export declare abstract class BaseDetector implements TagDetector {
    abstract readonly id: string;
    abstract readonly name: string;
    abstract readonly platform: KnownPlatform | string;
    abstract readonly category: TagCategory;
    abstract readonly version: string;
    readonly priority: number;
    /**
     * Quick presence check - override in subclass
     */
    abstract mightBePresent(context: EvidenceContext): boolean;
    /**
     * Full detection - override in subclass
     */
    abstract detect(context: EvidenceContext): Promise<TagInstance[]>;
    /**
     * Create a new TagInstance with defaults
     */
    protected createTagInstance(overrides?: Partial<TagInstance>): TagInstance;
    /**
     * Create detection evidence
     */
    protected createEvidence(method: DetectionMethod, matched: string, value: string, confidence: number, context?: Record<string, unknown>): DetectionEvidence;
    /**
     * Calculate combined confidence from multiple evidence pieces
     *
     * Uses a diminishing returns formula so multiple low-confidence
     * signals can combine to higher confidence.
     */
    protected calculateConfidence(evidenceList: DetectionEvidence[]): number;
    /**
     * Determine load method based on evidence
     */
    protected determineLoadMethod(scriptUrls: string[], context: EvidenceContext): LoadMethod;
    /**
     * Extract timestamp from request or use current time
     */
    protected getTimestamp(request?: NetworkRequest): number;
    /**
     * Check if URL matches any of the patterns
     */
    protected matchesAnyPattern(url: string, patterns: (string | RegExp)[]): boolean;
    /**
     * Extract ID from URL using regex
     */
    protected extractIdFromUrl(url: string, pattern: RegExp): string | null;
    /**
     * Extract IDs from query parameters
     */
    protected extractIdsFromParams(request: NetworkRequest, paramNames: string[]): Record<string, string>;
    /**
     * Find first script matching pattern
     */
    protected findScript(context: EvidenceContext, pattern: string | RegExp): ScriptTag | undefined;
    /**
     * Find all scripts matching pattern
     */
    protected findScripts(context: EvidenceContext, pattern: string | RegExp): ScriptTag[];
    /**
     * Merge multiple tag instances (same platform) into one
     */
    protected mergeInstances(instances: TagInstance[]): TagInstance;
    /**
     * Select most specific load method from list
     */
    private selectLoadMethod;
}
/**
 * Confidence thresholds
 */
export declare const CONFIDENCE: {
    /** Very strong signal (e.g., exact script URL match) */
    readonly HIGH: 0.9;
    /** Strong signal (e.g., API endpoint match) */
    readonly MEDIUM_HIGH: 0.75;
    /** Moderate signal (e.g., payload structure match) */
    readonly MEDIUM: 0.6;
    /** Weak signal (e.g., cookie name match) */
    readonly MEDIUM_LOW: 0.4;
    /** Very weak signal (e.g., generic pattern) */
    readonly LOW: 0.25;
    /** Minimal signal */
    readonly MINIMAL: 0.1;
};
/**
 * Common URL patterns for quick reference
 */
export declare const COMMON_PATTERNS: {
    readonly GTM_SCRIPT: RegExp;
    readonly GTAG_SCRIPT: RegExp;
    readonly GA4_COLLECT: RegExp;
    readonly GA_COLLECT: RegExp;
    readonly ADOBE_LAUNCH: RegExp;
    readonly ADOBE_ANALYTICS: RegExp;
    readonly OMNITURE: RegExp;
    readonly FB_PIXEL: RegExp;
    readonly FB_TRACK: RegExp;
    readonly SEGMENT_CDN: RegExp;
    readonly SEGMENT_API: RegExp;
    readonly TEALIUM_SCRIPT: RegExp;
    readonly TEALIUM_COLLECT: RegExp;
};
//# sourceMappingURL=BaseDetector.d.ts.map