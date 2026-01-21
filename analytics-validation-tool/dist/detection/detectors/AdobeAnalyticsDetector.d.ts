/**
 * Adobe Analytics Detector
 *
 * Detects Adobe Analytics implementation through:
 * - AppMeasurement.js / s_code.js scripts
 * - /b/ss/ tracking calls
 * - s object and s.t()/s.tl() calls
 * - Report Suite IDs
 * - Adobe Launch / DTM integration
 */
import { BaseDetector } from '../BaseDetector';
import type { TagInstance, EvidenceContext } from '../types';
export declare class AdobeAnalyticsDetector extends BaseDetector {
    readonly id = "adobe-analytics";
    readonly name = "Adobe Analytics";
    readonly platform: "adobe-analytics";
    readonly category: "analytics";
    readonly version = "1.0.0";
    readonly priority = 80;
    private readonly TRACKING_CALL_PATTERN;
    private readonly APPMEASUREMENT_PATTERN;
    private readonly S_CODE_PATTERN;
    private readonly OMNITURE_PATTERN;
    private readonly DEMDEX_PATTERN;
    /**
     * Quick check for Adobe Analytics presence
     */
    mightBePresent(context: EvidenceContext): boolean;
    /**
     * Full Adobe Analytics detection
     */
    detect(context: EvidenceContext): Promise<TagInstance[]>;
    /**
     * Detect AppMeasurement and s_code scripts
     */
    private detectScripts;
    /**
     * Detect /b/ss/ tracking calls
     */
    private detectTrackingCalls;
    /**
     * Detect inline s object configuration
     */
    private detectInlineConfig;
    /**
     * Detect Adobe Launch / DTM
     */
    private detectAdobeLaunch;
    /**
     * Detect Adobe Visitor ID Service
     */
    private detectVisitorId;
}
//# sourceMappingURL=AdobeAnalyticsDetector.d.ts.map