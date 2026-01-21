/**
 * GTM (Google Tag Manager) Detector
 *
 * Detects Google Tag Manager implementation through:
 * - gtm.js script
 * - GTM-XXXXXXX container IDs
 * - dataLayer presence and structure
 * - GTM-specific events
 */
import { BaseDetector } from '../BaseDetector';
import type { TagInstance, EvidenceContext } from '../types';
export declare class GTMDetector extends BaseDetector {
    readonly id = "gtm";
    readonly name = "Google Tag Manager";
    readonly platform: "gtm";
    readonly category: "tag-manager";
    readonly version = "1.0.0";
    readonly priority = 100;
    private readonly CONTAINER_ID_PATTERN;
    private readonly GTM_SCRIPT_PATTERN;
    private readonly GTM_NOSCRIPT_PATTERN;
    /**
     * Quick check for GTM presence
     */
    mightBePresent(context: EvidenceContext): boolean;
    /**
     * Full GTM detection
     */
    detect(context: EvidenceContext): Promise<TagInstance[]>;
    /**
     * Detect gtm.js script
     */
    private detectGTMScript;
    /**
     * Detect inline GTM installation snippet
     */
    private detectInlineSnippet;
    /**
     * Detect GTM-specific dataLayer structure
     */
    private detectDataLayer;
    /**
     * Detect GTM noscript iframe (for additional confidence)
     */
    private detectNoscriptIframe;
}
//# sourceMappingURL=GTMDetector.d.ts.map