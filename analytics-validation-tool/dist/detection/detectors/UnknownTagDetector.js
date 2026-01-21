"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownTagDetector = void 0;
const BaseDetector_1 = require("../BaseDetector");
const EvidenceExtractor_1 = require("../EvidenceExtractor");
class UnknownTagDetector extends BaseDetector_1.BaseDetector {
    id = 'unknown-tag';
    name = 'Unknown Tag';
    platform = 'unknown';
    category = 'custom';
    version = '1.0.0';
    priority = 1; // Lowest priority - run last
    // Heuristic patterns for detecting unknown analytics tags
    TRACKING_DOMAINS = [
        'analytics',
        'tracking',
        'pixel',
        'beacon',
        'telemetry',
        'stats',
        'metrics',
        'collect',
        'events',
        'conversion',
        'tag',
        'cdn',
    ];
    TRACKING_KEYWORDS = [
        'track',
        'collect',
        'pixel',
        'beacon',
        'event',
        'analytics',
        'conversion',
        'impression',
        'click',
        'view',
    ];
    TRACKING_PARAMS = [
        'event',
        'e',
        'ev',
        'pid',
        'uid',
        'cid',
        'sid',
        'tid',
        'timestamp',
        'ts',
        'track',
        'action',
    ];
    // Known platforms to exclude (checked by domain)
    KNOWN_PLATFORMS = [
        'google-analytics.com',
        'googletagmanager.com',
        'facebook.com',
        'facebook.net',
        'segment.com',
        'segment.io',
        'omtrdc.net',
        'demdex.net',
        'adobedtm.com',
        'tiqcdn.com',
        'tealiumiq.com',
    ];
    /**
     * Quick check - always return true for unknown detector
     * This runs last, so we always check for unknown tags
     */
    mightBePresent(_context) {
        return true;
    }
    /**
     * Full detection of unknown analytics tags
     */
    async detect(context) {
        const unknownTags = [];
        // Group requests by domain to create tag instances per vendor
        const requestsByDomain = this.groupAnalyticsRequestsByDomain(context);
        for (const [domain, requests] of requestsByDomain) {
            const evidence = [];
            const scriptUrls = [];
            const endpoints = [];
            const requestIds = [];
            let firstSeen = Date.now();
            let lastSeen = 0;
            // Analyze domain for tracking indicators
            const domainEvidence = this.analyzeDomain(domain);
            evidence.push(...domainEvidence);
            // Analyze requests
            for (const request of requests) {
                requestIds.push(request.id);
                if (request.initiatedAt < firstSeen)
                    firstSeen = request.initiatedAt;
                if (request.initiatedAt > lastSeen)
                    lastSeen = request.initiatedAt;
                // Extract endpoint
                try {
                    const url = new URL(request.url);
                    const endpoint = `${url.origin}${url.pathname}`;
                    if (!endpoints.includes(endpoint)) {
                        endpoints.push(endpoint);
                    }
                }
                catch {
                    // Invalid URL
                }
                // Analyze request characteristics
                const requestEvidence = this.analyzeRequest(request);
                evidence.push(...requestEvidence);
            }
            // Look for associated scripts from this domain
            const domainScripts = this.findScriptsForDomain(context, domain);
            for (const script of domainScripts) {
                if (script.src)
                    scriptUrls.push(script.src);
            }
            // Only create tag if we have meaningful evidence
            if (evidence.length === 0 || this.calculateConfidence(evidence) < BaseDetector_1.CONFIDENCE.MINIMAL) {
                continue;
            }
            // Build configuration
            const config = {
                properties: {
                    domain,
                    requestCount: requests.length,
                    endpoints: endpoints.slice(0, 5), // Top 5 endpoints
                },
            };
            // Create tag instance
            const instance = this.createTagInstance({
                platformName: `Unknown Tag (${domain})`,
                confidence: this.calculateConfidence(evidence),
                detectionMethods: [...new Set(evidence.map((e) => e.method))],
                evidence,
                config,
                scriptUrls,
                endpoints,
                networkRequestIds: requestIds,
                firstSeenAt: firstSeen,
                lastSeenAt: lastSeen,
                loadMethod: 'unknown',
                isActive: requests.some((r) => !r.failed),
                hasErrors: requests.some((r) => r.failed),
            });
            unknownTags.push(instance);
        }
        return unknownTags;
    }
    /**
     * Group analytics-like requests by domain
     */
    groupAnalyticsRequestsByDomain(context) {
        const byDomain = new Map();
        for (const request of context.scan.networkRequests) {
            // Skip known platforms
            if (this.isKnownPlatform(request.url)) {
                continue;
            }
            // Check if request looks like analytics
            if (!this.looksLikeAnalytics(request)) {
                continue;
            }
            const domain = (0, EvidenceExtractor_1.extractDomain)(request.url);
            if (!domain)
                continue;
            const existing = byDomain.get(domain) || [];
            existing.push(request);
            byDomain.set(domain, existing);
        }
        return byDomain;
    }
    /**
     * Check if URL is from a known platform
     */
    isKnownPlatform(url) {
        const lowerUrl = url.toLowerCase();
        return this.KNOWN_PLATFORMS.some((platform) => lowerUrl.includes(platform));
    }
    /**
     * Check if request looks like analytics
     */
    looksLikeAnalytics(request) {
        const url = request.url.toLowerCase();
        // Check for tracking keywords in URL
        for (const keyword of this.TRACKING_KEYWORDS) {
            if (url.includes(keyword)) {
                return true;
            }
        }
        // Check for tracking query parameters
        if (request.queryParams) {
            for (const param of this.TRACKING_PARAMS) {
                if (param in request.queryParams) {
                    return true;
                }
            }
        }
        // Check resource type (pixels, beacons)
        if (request.resourceType === 'image' || request.resourceType === 'ping' || request.resourceType === 'beacon') {
            // 1x1 pixel likely tracking
            const hasTracking = this.TRACKING_KEYWORDS.some((k) => url.includes(k));
            if (hasTracking)
                return true;
        }
        // Check if request is to a third-party analytics domain
        const domain = (0, EvidenceExtractor_1.extractDomain)(request.url);
        if (domain) {
            for (const keyword of this.TRACKING_DOMAINS) {
                if (domain.includes(keyword)) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Analyze domain for tracking indicators
     */
    analyzeDomain(domain) {
        const evidence = [];
        const lowerDomain = domain.toLowerCase();
        // Check domain contains tracking keywords
        for (const keyword of this.TRACKING_DOMAINS) {
            if (lowerDomain.includes(keyword)) {
                evidence.push(this.createEvidence('network-endpoint', `Domain contains tracking keyword: ${keyword}`, domain, BaseDetector_1.CONFIDENCE.LOW, { domain, keyword }));
                break; // Only add once per domain
            }
        }
        return evidence;
    }
    /**
     * Analyze individual request
     */
    analyzeRequest(request) {
        const evidence = [];
        const url = request.url.toLowerCase();
        // Check URL path for tracking keywords
        for (const keyword of this.TRACKING_KEYWORDS) {
            if (url.includes(keyword)) {
                evidence.push(this.createEvidence('network-endpoint', `URL contains tracking keyword: ${keyword}`, keyword, BaseDetector_1.CONFIDENCE.MINIMAL, { requestId: request.id, keyword }));
                break;
            }
        }
        // Check for tracking query parameters
        if (request.queryParams) {
            let hasTrackingParam = false;
            for (const param of this.TRACKING_PARAMS) {
                if (param in request.queryParams) {
                    hasTrackingParam = true;
                    break;
                }
            }
            if (hasTrackingParam) {
                evidence.push(this.createEvidence('network-payload', 'Request has tracking parameters', Object.keys(request.queryParams).join(', '), BaseDetector_1.CONFIDENCE.LOW, { requestId: request.id }));
            }
        }
        // Check resource type
        if (request.resourceType === 'beacon' || request.resourceType === 'ping') {
            evidence.push(this.createEvidence('network-endpoint', 'Beacon/ping resource type', request.resourceType, BaseDetector_1.CONFIDENCE.MEDIUM_LOW, { requestId: request.id }));
        }
        // Check for 1x1 pixel (image with suspicious name)
        if (request.resourceType === 'image') {
            const hasPixelIndicator = url.includes('pixel') ||
                url.includes('track') ||
                url.includes('beacon') ||
                url.includes('1x1');
            if (hasPixelIndicator) {
                evidence.push(this.createEvidence('network-endpoint', 'Tracking pixel image', request.url, BaseDetector_1.CONFIDENCE.MEDIUM, { requestId: request.id }));
            }
        }
        return evidence;
    }
    /**
     * Find scripts from a specific domain
     */
    findScriptsForDomain(context, domain) {
        const scripts = [];
        for (const url of context.scriptUrls) {
            const scriptDomain = (0, EvidenceExtractor_1.extractDomain)(url);
            if (scriptDomain === domain) {
                const script = context.scriptsByUrl.get(url);
                if (script) {
                    scripts.push(script);
                }
            }
        }
        return scripts;
    }
}
exports.UnknownTagDetector = UnknownTagDetector;
//# sourceMappingURL=UnknownTagDetector.js.map