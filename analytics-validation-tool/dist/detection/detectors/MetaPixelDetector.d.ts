/**
 * Meta (Facebook) Pixel Detector
 *
 * Detects Meta Pixel implementation through:
 * - fbevents.js script
 * - fbq() function calls
 * - /tr/ tracking endpoint
 * - _fbp cookie
 * - Pixel IDs
 */
import { BaseDetector } from '../BaseDetector';
import type { TagInstance, EvidenceContext } from '../types';
export declare class MetaPixelDetector extends BaseDetector {
    readonly id = "meta-pixel";
    readonly name = "Meta Pixel";
    readonly platform: "meta-pixel";
    readonly category: "advertising";
    readonly version = "1.0.0";
    readonly priority = 70;
    private readonly FBEVENTS_SCRIPT_PATTERN;
    private readonly FB_TRACK_PATTERN;
    private readonly PIXEL_ID_PATTERN;
    private readonly FBQ_INIT_PATTERN;
    private readonly FBQ_TRACK_PATTERN;
    /**
     * Quick check for Meta Pixel presence
     */
    mightBePresent(context: EvidenceContext): boolean;
    /**
     * Full Meta Pixel detection
     */
    detect(context: EvidenceContext): Promise<TagInstance[]>;
    /**
     * Detect fbevents.js script
     */
    private detectFbEventsScript;
    /**
     * Detect fbq() function calls
     */
    private detectFbqCalls;
    /**
     * Detect /tr/ tracking calls
     */
    private detectTrackingCalls;
    /**
     * Detect Meta cookies
     */
    private detectCookies;
}
//# sourceMappingURL=MetaPixelDetector.d.ts.map