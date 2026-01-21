/**
 * Segment Detector
 *
 * Detects Segment implementation through:
 * - analytics.js script from Segment CDN
 * - analytics.track/identify/page calls
 * - api.segment.io endpoint calls
 * - Write key
 */
import { BaseDetector } from '../BaseDetector';
import type { TagInstance, EvidenceContext } from '../types';
export declare class SegmentDetector extends BaseDetector {
    readonly id = "segment";
    readonly name = "Segment";
    readonly platform: "segment";
    readonly category: "cdp";
    readonly version = "1.0.0";
    readonly priority = 75;
    private readonly SEGMENT_CDN_PATTERN;
    private readonly SEGMENT_API_PATTERN;
    private readonly WRITE_KEY_PATTERN;
    private readonly ANALYTICS_LOAD_PATTERN;
    private readonly ANALYTICS_METHOD_PATTERN;
    /**
     * Quick check for Segment presence
     */
    mightBePresent(context: EvidenceContext): boolean;
    /**
     * Full Segment detection
     */
    detect(context: EvidenceContext): Promise<TagInstance[]>;
    /**
     * Detect Segment CDN script
     */
    private detectSegmentScript;
    /**
     * Detect analytics.load() and other method calls
     */
    private detectAnalyticsCalls;
    /**
     * Detect Segment API calls
     */
    private detectApiCalls;
    /**
     * Detect Segment cookies
     */
    private detectCookies;
}
//# sourceMappingURL=SegmentDetector.d.ts.map