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
import { BaseDetector } from '../BaseDetector';
import type { TagInstance, EvidenceContext } from '../types';
export declare class GA4Detector extends BaseDetector {
    readonly id = "ga4";
    readonly name = "Google Analytics 4";
    readonly platform: "ga4";
    readonly category: "analytics";
    readonly version = "1.0.0";
    readonly priority = 80;
    private readonly MEASUREMENT_ID_PATTERN;
    private readonly GTAG_CONFIG_PATTERN;
    private readonly GA4_COLLECT_PATTERN;
    private readonly GTAG_SCRIPT_PATTERN;
    /**
     * Quick check for GA4 presence
     */
    mightBePresent(context: EvidenceContext): boolean;
    /**
     * Full GA4 detection
     */
    detect(context: EvidenceContext): Promise<TagInstance[]>;
    /**
     * Detect gtag.js script
     */
    private detectGtagScript;
    /**
     * Detect GA4 configuration in inline scripts
     */
    private detectInlineConfig;
    /**
     * Detect GA4 collect endpoint calls
     */
    private detectCollectCalls;
    /**
     * Detect GA4 cookies
     */
    private detectCookies;
    /**
     * Detect gtag-related dataLayer events
     */
    private detectDataLayerEvents;
}
//# sourceMappingURL=GA4Detector.d.ts.map