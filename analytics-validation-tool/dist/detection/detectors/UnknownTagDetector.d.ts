/**
 * Unknown Tag Detector
 *
 * Detects analytics/tracking tags that don't match known platforms.
 * This is a catch-all detector that identifies likely analytics tags
 * based on heuristics rather than specific patterns.
 *
 * Detection heuristics:
 * - Network requests to common analytics domains
 * - Scripts from tracking CDNs
 * - Requests with tracking-like query parameters
 * - Pixel/beacon requests
 */
import { BaseDetector } from '../BaseDetector';
import type { TagInstance, EvidenceContext } from '../types';
export declare class UnknownTagDetector extends BaseDetector {
    readonly id = "unknown-tag";
    readonly name = "Unknown Tag";
    readonly platform: "unknown";
    readonly category: "custom";
    readonly version = "1.0.0";
    readonly priority = 1;
    private readonly TRACKING_DOMAINS;
    private readonly TRACKING_KEYWORDS;
    private readonly TRACKING_PARAMS;
    private readonly KNOWN_PLATFORMS;
    /**
     * Quick check - always return true for unknown detector
     * This runs last, so we always check for unknown tags
     */
    mightBePresent(_context: EvidenceContext): boolean;
    /**
     * Full detection of unknown analytics tags
     */
    detect(context: EvidenceContext): Promise<TagInstance[]>;
    /**
     * Group analytics-like requests by domain
     */
    private groupAnalyticsRequestsByDomain;
    /**
     * Check if URL is from a known platform
     */
    private isKnownPlatform;
    /**
     * Check if request looks like analytics
     */
    private looksLikeAnalytics;
    /**
     * Analyze domain for tracking indicators
     */
    private analyzeDomain;
    /**
     * Analyze individual request
     */
    private analyzeRequest;
    /**
     * Find scripts from a specific domain
     */
    private findScriptsForDomain;
}
//# sourceMappingURL=UnknownTagDetector.d.ts.map