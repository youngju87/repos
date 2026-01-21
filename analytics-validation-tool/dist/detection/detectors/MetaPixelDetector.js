"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaPixelDetector = void 0;
const BaseDetector_1 = require("../BaseDetector");
const EvidenceExtractor_1 = require("../EvidenceExtractor");
class MetaPixelDetector extends BaseDetector_1.BaseDetector {
    id = 'meta-pixel';
    name = 'Meta Pixel';
    platform = 'meta-pixel';
    category = 'advertising';
    version = '1.0.0';
    priority = 70;
    // Meta Pixel patterns
    FBEVENTS_SCRIPT_PATTERN = /connect\.facebook\.net.*fbevents\.js/i;
    FB_TRACK_PATTERN = /facebook\.com\/tr/i;
    PIXEL_ID_PATTERN = /^\d{15,16}$/;
    FBQ_INIT_PATTERN = /fbq\s*\(\s*['"]init['"]\s*,\s*['"](\d+)['"]/g;
    FBQ_TRACK_PATTERN = /fbq\s*\(\s*['"]track['"]\s*,\s*['"]([^'"]+)['"]/g;
    /**
     * Quick check for Meta Pixel presence
     */
    mightBePresent(context) {
        // Check for fbevents.js
        if (context.hasScriptMatching('fbevents.js')) {
            return true;
        }
        // Check for /tr/ tracking endpoint
        if (context.hasRequestMatching('facebook.com/tr')) {
            return true;
        }
        // Check for fbq function in inline scripts
        for (const { content } of context.inlineScripts) {
            if (/\bfbq\s*\(/.test(content)) {
                return true;
            }
        }
        // Check for _fbp cookie
        if (context.hasCookie('_fbp')) {
            return true;
        }
        return false;
    }
    /**
     * Full Meta Pixel detection
     */
    async detect(context) {
        const evidence = [];
        const pixelIds = new Set();
        const scriptUrls = [];
        const endpoints = [];
        const requestIds = [];
        const trackedEvents = new Set();
        let firstSeen = Date.now();
        let lastSeen = 0;
        let isActive = false;
        // 1. Detect fbevents.js script
        const scriptEvidence = this.detectFbEventsScript(context, scriptUrls);
        evidence.push(...scriptEvidence);
        // 2. Detect fbq() calls in inline scripts
        const fbqEvidence = this.detectFbqCalls(context, pixelIds, trackedEvents);
        evidence.push(...fbqEvidence);
        // 3. Detect /tr/ tracking calls
        const trackingEvidence = this.detectTrackingCalls(context, pixelIds, endpoints, requestIds, trackedEvents);
        evidence.push(...trackingEvidence);
        // 4. Detect cookies
        const cookieEvidence = this.detectCookies(context);
        evidence.push(...cookieEvidence);
        // Update timestamps from requests
        for (const id of requestIds) {
            const requests = context.scan.networkRequests.filter((r) => r.id === id);
            for (const req of requests) {
                if (req.initiatedAt < firstSeen)
                    firstSeen = req.initiatedAt;
                if (req.initiatedAt > lastSeen)
                    lastSeen = req.initiatedAt;
                if (!req.failed && req.status && req.status < 400) {
                    isActive = true;
                }
            }
        }
        // If no evidence, return empty
        if (evidence.length === 0) {
            return [];
        }
        // Build configuration
        const config = {
            primaryId: pixelIds.size > 0 ? Array.from(pixelIds)[0] : undefined,
            additionalIds: pixelIds.size > 1 ? Array.from(pixelIds).slice(1) : undefined,
            properties: {
                pixelIds: Array.from(pixelIds),
                trackedEvents: Array.from(trackedEvents),
            },
            enabledFeatures: Array.from(trackedEvents),
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
            isActive,
            hasErrors: false,
        });
        return [instance];
    }
    /**
     * Detect fbevents.js script
     */
    detectFbEventsScript(context, scriptUrls) {
        const evidence = [];
        for (const url of context.scriptUrls) {
            if (this.FBEVENTS_SCRIPT_PATTERN.test(url)) {
                const script = context.scriptsByUrl.get(url);
                if (script?.src)
                    scriptUrls.push(script.src);
                evidence.push(this.createEvidence('script-url', 'Meta Pixel fbevents.js', url, BaseDetector_1.CONFIDENCE.HIGH, { scriptUrl: url }));
            }
        }
        return evidence;
    }
    /**
     * Detect fbq() function calls
     */
    detectFbqCalls(context, pixelIds, trackedEvents) {
        const evidence = [];
        for (const { content, tag } of context.inlineScripts) {
            // Detect fbq('init', 'PIXEL_ID')
            const initMatches = content.matchAll(this.FBQ_INIT_PATTERN);
            for (const match of initMatches) {
                const pixelId = match[1];
                if (this.PIXEL_ID_PATTERN.test(pixelId)) {
                    pixelIds.add(pixelId);
                    evidence.push(this.createEvidence('script-content', 'fbq init call', pixelId, BaseDetector_1.CONFIDENCE.HIGH, { scriptId: tag.id, pixelId }));
                }
            }
            // Detect fbq('track', 'EventName')
            const trackMatches = content.matchAll(this.FBQ_TRACK_PATTERN);
            for (const match of trackMatches) {
                const eventName = match[1];
                trackedEvents.add(eventName);
                evidence.push(this.createEvidence('script-content', 'fbq track call', eventName, BaseDetector_1.CONFIDENCE.MEDIUM, { scriptId: tag.id, eventName }));
            }
            // Generic fbq detection
            if (/\bfbq\s*\(/.test(content) && evidence.length === 0) {
                evidence.push(this.createEvidence('script-content', 'fbq function reference', 'fbq()', BaseDetector_1.CONFIDENCE.MEDIUM_LOW, { scriptId: tag.id }));
            }
            // Check for Meta Pixel snippet structure
            if (content.includes('fbq') &&
                content.includes('facebook.net') &&
                content.includes('fbevents.js')) {
                evidence.push(this.createEvidence('script-content', 'Meta Pixel installation snippet', 'fbevents snippet', BaseDetector_1.CONFIDENCE.MEDIUM_HIGH, { scriptId: tag.id }));
            }
        }
        return evidence;
    }
    /**
     * Detect /tr/ tracking calls
     */
    detectTrackingCalls(context, pixelIds, endpoints, requestIds, trackedEvents) {
        const evidence = [];
        const trackingRequests = context.getRequestsMatching(this.FB_TRACK_PATTERN);
        for (const request of trackingRequests) {
            requestIds.push(request.id);
            // Extract endpoint
            endpoints.push('https://www.facebook.com/tr/');
            // Parse query parameters
            const params = request.queryParams || (0, EvidenceExtractor_1.extractQueryParams)(request.url);
            // Extract pixel ID
            const id = params['id'];
            if (id && this.PIXEL_ID_PATTERN.test(id)) {
                pixelIds.add(id);
            }
            // Extract event name
            const ev = params['ev'];
            if (ev) {
                trackedEvents.add(ev);
            }
            evidence.push(this.createEvidence('network-endpoint', 'Meta Pixel tracking call', `id:${id || 'unknown'}, ev:${ev || 'unknown'}`, BaseDetector_1.CONFIDENCE.HIGH, {
                requestId: request.id,
                pixelId: id,
                eventName: ev,
                url: request.url,
            }));
        }
        return evidence;
    }
    /**
     * Detect Meta cookies
     */
    detectCookies(context) {
        const evidence = [];
        // _fbp cookie (browser ID)
        if (context.hasCookie('_fbp')) {
            evidence.push(this.createEvidence('cookie', '_fbp cookie', '_fbp', BaseDetector_1.CONFIDENCE.MEDIUM, {
                cookieName: '_fbp',
            }));
        }
        // _fbc cookie (click ID)
        if (context.hasCookie('_fbc')) {
            evidence.push(this.createEvidence('cookie', '_fbc cookie', '_fbc', BaseDetector_1.CONFIDENCE.MEDIUM_LOW, {
                cookieName: '_fbc',
            }));
        }
        return evidence;
    }
}
exports.MetaPixelDetector = MetaPixelDetector;
//# sourceMappingURL=MetaPixelDetector.js.map