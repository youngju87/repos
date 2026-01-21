"use strict";
/**
 * GTM (Google Tag Manager) Detector
 *
 * Detects Google Tag Manager implementation through:
 * - gtm.js script
 * - GTM-XXXXXXX container IDs
 * - dataLayer presence and structure
 * - GTM-specific events
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GTMDetector = void 0;
const BaseDetector_1 = require("../BaseDetector");
class GTMDetector extends BaseDetector_1.BaseDetector {
    id = 'gtm';
    name = 'Google Tag Manager';
    platform = 'gtm';
    category = 'tag-manager';
    version = '1.0.0';
    priority = 100; // Highest priority - TMS should be detected first
    // GTM specific patterns
    CONTAINER_ID_PATTERN = /^GTM-[A-Z0-9]{6,8}$/;
    GTM_SCRIPT_PATTERN = /googletagmanager\.com\/gtm\.js\?id=(GTM-[A-Z0-9]+)/i;
    GTM_NOSCRIPT_PATTERN = /googletagmanager\.com\/ns\.html\?id=(GTM-[A-Z0-9]+)/i;
    /**
     * Quick check for GTM presence
     */
    mightBePresent(context) {
        // Check for gtm.js script
        if (context.hasScriptMatching('googletagmanager.com/gtm.js')) {
            return true;
        }
        // Check for GTM container ID in scripts
        for (const { content } of context.inlineScripts) {
            if (/GTM-[A-Z0-9]{6,8}/.test(content)) {
                return true;
            }
        }
        // Check for dataLayer with gtm.start
        const dataLayerEvents = context.dataLayerEvents.get('dataLayer') || [];
        for (const event of dataLayerEvents) {
            if (typeof event.data === 'object' && event.data !== null) {
                const data = event.data;
                if (data['gtm.start'] || data.event === 'gtm.js') {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Full GTM detection
     */
    async detect(context) {
        const evidence = [];
        const containerIds = new Set();
        const scriptUrls = [];
        let firstSeen = Date.now();
        let isActive = false;
        // 1. Detect gtm.js script
        const scriptEvidence = this.detectGTMScript(context, containerIds, scriptUrls);
        evidence.push(...scriptEvidence);
        // 2. Detect inline GTM snippet
        const inlineEvidence = this.detectInlineSnippet(context, containerIds);
        evidence.push(...inlineEvidence);
        // 3. Detect dataLayer structure
        const dataLayerEvidence = this.detectDataLayer(context);
        evidence.push(...dataLayerEvidence);
        // 4. Detect noscript iframe
        const noscriptEvidence = this.detectNoscriptIframe(context, containerIds);
        evidence.push(...noscriptEvidence);
        // If no evidence, return empty
        if (evidence.length === 0) {
            return [];
        }
        // Get timestamp from first script detection
        for (const url of scriptUrls) {
            const script = context.scriptsByUrl.get(url.toLowerCase());
            if (script?.detectedAt && script.detectedAt < firstSeen) {
                firstSeen = script.detectedAt;
            }
            if (script?.loadedAt) {
                isActive = true;
            }
        }
        // Check dataLayer for activity
        const dataLayerEvents = context.dataLayerEvents.get('dataLayer') || [];
        if (dataLayerEvents.length > 0) {
            isActive = true;
            const firstEvent = dataLayerEvents[0];
            if (firstEvent.timestamp < firstSeen) {
                firstSeen = firstEvent.timestamp;
            }
        }
        // Build configuration
        const config = {
            primaryId: containerIds.size > 0 ? Array.from(containerIds)[0] : undefined,
            additionalIds: containerIds.size > 1 ? Array.from(containerIds).slice(1) : undefined,
            properties: {
                containerIds: Array.from(containerIds),
                dataLayerName: 'dataLayer',
                hasDataLayer: dataLayerEvents.length > 0,
                dataLayerEventCount: dataLayerEvents.length,
            },
        };
        // Create tag instance
        const instance = this.createTagInstance({
            confidence: this.calculateConfidence(evidence),
            detectionMethods: [...new Set(evidence.map((e) => e.method))],
            evidence,
            config,
            scriptUrls,
            endpoints: [],
            networkRequestIds: [],
            firstSeenAt: firstSeen,
            lastSeenAt: Date.now(),
            loadMethod: 'direct', // GTM itself is typically direct-loaded
            isActive,
            hasErrors: false,
        });
        return [instance];
    }
    /**
     * Detect gtm.js script
     */
    detectGTMScript(context, containerIds, scriptUrls) {
        const evidence = [];
        for (const url of context.scriptUrls) {
            const match = url.match(this.GTM_SCRIPT_PATTERN);
            if (match) {
                const script = context.scriptsByUrl.get(url);
                scriptUrls.push(script?.src || url);
                const containerId = match[1];
                if (this.CONTAINER_ID_PATTERN.test(containerId)) {
                    containerIds.add(containerId);
                    evidence.push(this.createEvidence('script-url', 'GTM container script', containerId, BaseDetector_1.CONFIDENCE.HIGH, { scriptUrl: url, containerId }));
                }
            }
        }
        return evidence;
    }
    /**
     * Detect inline GTM installation snippet
     */
    detectInlineSnippet(context, containerIds) {
        const evidence = [];
        // GTM installation snippet patterns
        const snippetPatterns = [
            // Standard GTM snippet
            /\(function\s*\(\s*w\s*,\s*d\s*,\s*s\s*,\s*l\s*,\s*i\s*\)/,
            // GTM with dataLayer push
            /dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\]/,
            // GTM container reference
            /['"]GTM-[A-Z0-9]{6,8}['"]/,
        ];
        for (const { content, tag } of context.inlineScripts) {
            // Check for GTM snippet structure
            let hasSnippet = false;
            for (const pattern of snippetPatterns) {
                if (pattern.test(content)) {
                    hasSnippet = true;
                    break;
                }
            }
            if (hasSnippet) {
                // Extract container ID
                const idMatch = content.match(/['"]?(GTM-[A-Z0-9]{6,8})['"]?/);
                if (idMatch) {
                    const containerId = idMatch[1];
                    containerIds.add(containerId);
                    evidence.push(this.createEvidence('script-content', 'GTM installation snippet', containerId, BaseDetector_1.CONFIDENCE.HIGH, { scriptId: tag.id }));
                }
                else {
                    evidence.push(this.createEvidence('script-content', 'GTM snippet structure', 'GTM snippet detected', BaseDetector_1.CONFIDENCE.MEDIUM, { scriptId: tag.id }));
                }
            }
        }
        return evidence;
    }
    /**
     * Detect GTM-specific dataLayer structure
     */
    detectDataLayer(context) {
        const evidence = [];
        const dataLayerEvents = context.dataLayerEvents.get('dataLayer') || [];
        let hasGtmStart = false;
        let hasGtmJs = false;
        let hasGtmDom = false;
        let hasGtmLoad = false;
        for (const event of dataLayerEvents) {
            if (typeof event.data === 'object' && event.data !== null) {
                const data = event.data;
                // GTM initialization event
                if (data['gtm.start']) {
                    hasGtmStart = true;
                }
                // GTM lifecycle events
                if (data.event === 'gtm.js') {
                    hasGtmJs = true;
                }
                if (data.event === 'gtm.dom') {
                    hasGtmDom = true;
                }
                if (data.event === 'gtm.load') {
                    hasGtmLoad = true;
                }
            }
        }
        if (hasGtmStart) {
            evidence.push(this.createEvidence('data-layer', 'gtm.start timestamp', 'gtm.start', BaseDetector_1.CONFIDENCE.HIGH, { hasGtmJs, hasGtmDom, hasGtmLoad }));
        }
        if (hasGtmJs || hasGtmDom || hasGtmLoad) {
            evidence.push(this.createEvidence('data-layer', 'GTM lifecycle events', `gtm.js:${hasGtmJs}, gtm.dom:${hasGtmDom}, gtm.load:${hasGtmLoad}`, BaseDetector_1.CONFIDENCE.MEDIUM_HIGH, { hasGtmJs, hasGtmDom, hasGtmLoad }));
        }
        return evidence;
    }
    /**
     * Detect GTM noscript iframe (for additional confidence)
     */
    detectNoscriptIframe(context, containerIds) {
        const evidence = [];
        // Check network requests for ns.html
        const noscriptRequests = context.getRequestsMatching('googletagmanager.com/ns.html');
        for (const request of noscriptRequests) {
            const match = request.url.match(this.GTM_NOSCRIPT_PATTERN);
            if (match) {
                const containerId = match[1];
                containerIds.add(containerId);
                evidence.push(this.createEvidence('network-endpoint', 'GTM noscript iframe', containerId, BaseDetector_1.CONFIDENCE.MEDIUM, { url: request.url }));
            }
        }
        return evidence;
    }
}
exports.GTMDetector = GTMDetector;
//# sourceMappingURL=GTMDetector.js.map