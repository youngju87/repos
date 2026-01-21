"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdobeAnalyticsDetector = void 0;
const BaseDetector_1 = require("../BaseDetector");
class AdobeAnalyticsDetector extends BaseDetector_1.BaseDetector {
    id = 'adobe-analytics';
    name = 'Adobe Analytics';
    platform = 'adobe-analytics';
    category = 'analytics';
    version = '1.0.0';
    priority = 80;
    // Adobe Analytics patterns
    TRACKING_CALL_PATTERN = /\/b\/ss\/([^/]+)\/[0-9]+\//i;
    APPMEASUREMENT_PATTERN = /appmeasurement[._-]?(\d)?\.js/i;
    S_CODE_PATTERN = /s[_-]?code\.js/i;
    OMNITURE_PATTERN = /omtrdc\.net/i;
    DEMDEX_PATTERN = /demdex\.net/i;
    /**
     * Quick check for Adobe Analytics presence
     */
    mightBePresent(context) {
        // Check for AppMeasurement script
        if (context.hasScriptMatching('appmeasurement') ||
            context.hasScriptMatching('s_code')) {
            return true;
        }
        // Check for /b/ss/ tracking calls
        if (context.hasRequestMatching('/b/ss/')) {
            return true;
        }
        // Check for omtrdc.net domain
        if (context.hasRequestMatching('omtrdc.net')) {
            return true;
        }
        // Check for s object in inline scripts
        for (const { content } of context.inlineScripts) {
            if (/\bs\.t\s*\(|\bs\.tl\s*\(|\bs\.account\s*=/.test(content)) {
                return true;
            }
        }
        // Check for Adobe Launch
        if (context.hasScriptMatching('assets.adobedtm.com')) {
            return true;
        }
        return false;
    }
    /**
     * Full Adobe Analytics detection
     */
    async detect(context) {
        const evidence = [];
        const reportSuiteIds = new Set();
        const scriptUrls = [];
        const endpoints = [];
        const requestIds = [];
        let firstSeen = Date.now();
        let lastSeen = 0;
        let isActive = false;
        let version;
        let hasAdobeLaunch = false;
        // 1. Detect AppMeasurement/s_code scripts
        const scriptEvidence = this.detectScripts(context, scriptUrls);
        evidence.push(...scriptEvidence);
        // 2. Detect /b/ss/ tracking calls
        const trackingEvidence = this.detectTrackingCalls(context, reportSuiteIds, endpoints, requestIds);
        evidence.push(...trackingEvidence);
        // 3. Detect inline s object configuration
        const inlineEvidence = this.detectInlineConfig(context, reportSuiteIds);
        evidence.push(...inlineEvidence);
        // 4. Detect Adobe Launch
        const launchEvidence = this.detectAdobeLaunch(context, scriptUrls);
        evidence.push(...launchEvidence);
        if (launchEvidence.length > 0) {
            hasAdobeLaunch = true;
        }
        // 5. Detect Visitor ID Service
        const visitorEvidence = this.detectVisitorId(context);
        evidence.push(...visitorEvidence);
        // Update timestamps from requests
        for (const id of requestIds) {
            const requests = context.scan.networkRequests.filter((r) => r.id === id);
            for (const req of requests) {
                if (req.initiatedAt < firstSeen)
                    firstSeen = req.initiatedAt;
                if (req.initiatedAt > lastSeen)
                    lastSeen = req.initiatedAt;
                if (!req.failed)
                    isActive = true;
            }
        }
        // If no evidence, return empty
        if (evidence.length === 0) {
            return [];
        }
        // Build configuration
        const config = {
            primaryId: reportSuiteIds.size > 0 ? Array.from(reportSuiteIds)[0] : undefined,
            additionalIds: reportSuiteIds.size > 1 ? Array.from(reportSuiteIds).slice(1) : undefined,
            properties: {
                reportSuiteIds: Array.from(reportSuiteIds),
                hasAdobeLaunch,
            },
        };
        // Determine load method
        let loadMethod = this.determineLoadMethod(scriptUrls, context);
        if (hasAdobeLaunch) {
            loadMethod = 'adobe-launch';
        }
        // Create tag instance
        const instance = this.createTagInstance({
            confidence: this.calculateConfidence(evidence),
            detectionMethods: [...new Set(evidence.map((e) => e.method))],
            evidence,
            config,
            version,
            scriptUrls,
            endpoints,
            networkRequestIds: requestIds,
            firstSeenAt: firstSeen || Date.now(),
            lastSeenAt: lastSeen || Date.now(),
            loadMethod,
            loadedVia: hasAdobeLaunch ? 'Adobe Launch' : undefined,
            isActive,
            hasErrors: false,
        });
        return [instance];
    }
    /**
     * Detect AppMeasurement and s_code scripts
     */
    detectScripts(context, scriptUrls) {
        const evidence = [];
        for (const url of context.scriptUrls) {
            const script = context.scriptsByUrl.get(url);
            // AppMeasurement.js
            if (this.APPMEASUREMENT_PATTERN.test(url)) {
                if (script?.src)
                    scriptUrls.push(script.src);
                evidence.push(this.createEvidence('script-url', 'AppMeasurement.js', url, BaseDetector_1.CONFIDENCE.HIGH, { scriptUrl: url }));
            }
            // s_code.js
            if (this.S_CODE_PATTERN.test(url)) {
                if (script?.src)
                    scriptUrls.push(script.src);
                evidence.push(this.createEvidence('script-url', 's_code.js (legacy)', url, BaseDetector_1.CONFIDENCE.HIGH, { scriptUrl: url }));
            }
        }
        return evidence;
    }
    /**
     * Detect /b/ss/ tracking calls
     */
    detectTrackingCalls(context, reportSuiteIds, endpoints, requestIds) {
        const evidence = [];
        // Find /b/ss/ requests
        const trackingRequests = context.getRequestsMatching('/b/ss/');
        for (const request of trackingRequests) {
            requestIds.push(request.id);
            // Extract report suite ID from URL path
            const match = request.url.match(this.TRACKING_CALL_PATTERN);
            if (match) {
                const rsid = match[1];
                // RSIDs can be comma-separated for multi-suite tagging
                const rsids = rsid.split(',');
                for (const id of rsids) {
                    reportSuiteIds.add(id.trim());
                }
                // Extract endpoint
                try {
                    const url = new URL(request.url);
                    const endpoint = `${url.origin}/b/ss/`;
                    if (!endpoints.includes(endpoint)) {
                        endpoints.push(endpoint);
                    }
                }
                catch {
                    // Invalid URL
                }
                evidence.push(this.createEvidence('network-endpoint', 'Adobe Analytics tracking call', rsid, BaseDetector_1.CONFIDENCE.HIGH, {
                    requestId: request.id,
                    reportSuiteIds: rsids,
                    url: request.url,
                }));
            }
        }
        // Also check omtrdc.net requests
        const omtrdcRequests = context.getRequestsMatching(this.OMNITURE_PATTERN);
        for (const request of omtrdcRequests) {
            if (!requestIds.includes(request.id)) {
                requestIds.push(request.id);
                evidence.push(this.createEvidence('network-endpoint', 'omtrdc.net domain', request.url, BaseDetector_1.CONFIDENCE.MEDIUM_HIGH, { requestId: request.id }));
            }
        }
        return evidence;
    }
    /**
     * Detect inline s object configuration
     */
    detectInlineConfig(context, reportSuiteIds) {
        const evidence = [];
        for (const { content, tag } of context.inlineScripts) {
            // Look for s.account (report suite configuration)
            const accountMatch = content.match(/s\.account\s*=\s*['"]([^'"]+)['"]/);
            if (accountMatch) {
                const rsids = accountMatch[1].split(',');
                for (const id of rsids) {
                    reportSuiteIds.add(id.trim());
                }
                evidence.push(this.createEvidence('script-content', 's.account configuration', accountMatch[1], BaseDetector_1.CONFIDENCE.HIGH, { scriptId: tag.id, reportSuiteIds: rsids }));
            }
            // Look for s.t() or s.tl() calls
            if (/\bs\.t\s*\(/.test(content)) {
                evidence.push(this.createEvidence('script-content', 's.t() tracking call', 's.t()', BaseDetector_1.CONFIDENCE.MEDIUM, { scriptId: tag.id }));
            }
            if (/\bs\.tl\s*\(/.test(content)) {
                evidence.push(this.createEvidence('script-content', 's.tl() link tracking call', 's.tl()', BaseDetector_1.CONFIDENCE.MEDIUM, { scriptId: tag.id }));
            }
            // Look for trackingServer configuration
            const serverMatch = content.match(/s\.trackingServer\s*=\s*['"]([^'"]+)['"]/);
            if (serverMatch) {
                evidence.push(this.createEvidence('script-content', 's.trackingServer configuration', serverMatch[1], BaseDetector_1.CONFIDENCE.MEDIUM_HIGH, { scriptId: tag.id, trackingServer: serverMatch[1] }));
            }
        }
        return evidence;
    }
    /**
     * Detect Adobe Launch / DTM
     */
    detectAdobeLaunch(context, scriptUrls) {
        const evidence = [];
        for (const url of context.scriptUrls) {
            if (url.includes('assets.adobedtm.com')) {
                const script = context.scriptsByUrl.get(url);
                if (script?.src)
                    scriptUrls.push(script.src);
                // Extract property ID if possible
                const propertyMatch = url.match(/\/launch-([^/.]+)/);
                evidence.push(this.createEvidence('script-url', 'Adobe Launch script', url, BaseDetector_1.CONFIDENCE.MEDIUM_HIGH, {
                    scriptUrl: url,
                    propertyId: propertyMatch?.[1],
                }));
            }
        }
        return evidence;
    }
    /**
     * Detect Adobe Visitor ID Service
     */
    detectVisitorId(context) {
        const evidence = [];
        // Check for demdex.net (Visitor ID service)
        const demdexRequests = context.getRequestsMatching(this.DEMDEX_PATTERN);
        if (demdexRequests.length > 0) {
            evidence.push(this.createEvidence('network-endpoint', 'Adobe Visitor ID Service (demdex)', 'demdex.net', BaseDetector_1.CONFIDENCE.MEDIUM, { requestCount: demdexRequests.length }));
        }
        // Check for AMCV cookie
        if (context.hasCookie(/^AMCV_/)) {
            evidence.push(this.createEvidence('cookie', 'AMCV cookie (Visitor ID)', 'AMCV_*', BaseDetector_1.CONFIDENCE.MEDIUM, {}));
        }
        // Check for VisitorAPI in scripts
        if (context.hasScriptMatching('visitorapi')) {
            evidence.push(this.createEvidence('script-url', 'VisitorAPI.js', 'VisitorAPI', BaseDetector_1.CONFIDENCE.MEDIUM, {}));
        }
        return evidence;
    }
}
exports.AdobeAnalyticsDetector = AdobeAnalyticsDetector;
//# sourceMappingURL=AdobeAnalyticsDetector.js.map