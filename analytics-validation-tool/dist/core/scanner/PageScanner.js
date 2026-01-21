"use strict";
/**
 * Page Scanner
 *
 * Main orchestrator for scanning a single page. Coordinates:
 * - Browser context acquisition
 * - Collector attachment
 * - Page navigation
 * - Data collection
 * - Result aggregation
 *
 * This is the primary entry point for scanning operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageScanner = void 0;
exports.createScanner = createScanner;
exports.scanUrl = scanUrl;
exports.scanUrls = scanUrls;
const types_1 = require("../../types");
const BrowserManager_1 = require("../browser/BrowserManager");
const NetworkCollector_1 = require("../collectors/NetworkCollector");
const ScriptCollector_1 = require("../collectors/ScriptCollector");
const DataLayerCollector_1 = require("../collectors/DataLayerCollector");
const ConsoleCollector_1 = require("../collectors/ConsoleCollector");
const ScanOptions_1 = require("./ScanOptions");
const errors_1 = require("../utils/errors");
const timing_1 = require("../utils/timing");
/**
 * Page Scanner Class
 */
class PageScanner {
    browserManager;
    debug;
    constructor(browserManager, debug = false) {
        this.browserManager = browserManager || (0, BrowserManager_1.getDefaultBrowserManager)();
        this.debug = debug;
    }
    /**
     * Scan a single URL
     */
    async scan(url, options = {}) {
        const scanId = (0, types_1.generateId)();
        const timer = new timing_1.Timer();
        const mergedOptions = (0, ScanOptions_1.mergeOptions)(options);
        // Validate options
        const validationErrors = (0, ScanOptions_1.validateOptions)(mergedOptions);
        if (validationErrors.length > 0) {
            return this.createErrorResult(scanId, url, timer, mergedOptions, validationErrors.join('; '));
        }
        // Validate URL
        try {
            new URL(url);
        }
        catch {
            return this.createErrorResult(scanId, url, timer, mergedOptions, `Invalid URL: ${url}`);
        }
        let contextLease = null;
        let page = null;
        // Initialize collectors
        const networkCollector = new NetworkCollector_1.NetworkCollector({
            debug: this.debug,
            captureResponseBodies: mergedOptions.captureResponseBodies,
            maxResponseBodySize: mergedOptions.maxResponseBodySize,
        });
        const scriptCollector = new ScriptCollector_1.ScriptCollector({
            debug: this.debug,
        });
        const dataLayerCollector = new DataLayerCollector_1.DataLayerCollector({
            debug: this.debug,
            dataLayerNames: mergedOptions.dataLayerNames,
        });
        const consoleCollector = new ConsoleCollector_1.ConsoleCollector({
            debug: this.debug,
        });
        try {
            // Acquire browser context
            timer.mark('context-acquire-start');
            contextLease = await this.browserManager.acquireContext(this.buildContextOptions(mergedOptions));
            timer.mark('context-acquired');
            if (this.debug) {
                console.log(`[PageScanner] Acquired context for ${url}`);
            }
            // Create page
            page = await contextLease.context.newPage();
            timer.mark('page-created');
            // Set up page configuration
            await this.configurePage(page, mergedOptions);
            // Attach collectors BEFORE navigation
            timer.mark('collectors-attach-start');
            await Promise.all([
                networkCollector.attach(page),
                scriptCollector.attach(page),
                dataLayerCollector.attach(page),
                consoleCollector.attach(page),
            ]);
            timer.mark('collectors-attached');
            // Inject custom script before navigation if provided
            if (mergedOptions.injectScriptBefore) {
                await page.addInitScript(mergedOptions.injectScriptBefore);
            }
            // Navigate to URL
            timer.mark('navigation-start');
            const navigationResult = await this.navigateToUrl(page, url, mergedOptions);
            timer.mark('navigation-complete');
            // Wait for additional conditions
            await this.waitForConditions(page, mergedOptions);
            timer.mark('wait-complete');
            // Execute custom script after load if provided
            if (mergedOptions.injectScriptAfter) {
                await page.evaluate(mergedOptions.injectScriptAfter);
            }
            // Collect data from all collectors
            timer.mark('collection-start');
            const [networkRequests, scripts, dataLayerData, consoleData] = await Promise.all([
                networkCollector.collect(),
                scriptCollector.collect(),
                dataLayerCollector.collect(),
                consoleCollector.collect(),
            ]);
            timer.mark('collection-complete');
            // Get page metadata
            const pageMetadata = await this.collectPageMetadata(page);
            // Get cookies
            const cookies = await this.collectCookies(contextLease.context);
            // Get storage if needed
            const storage = await this.collectStorage(page);
            // Capture screenshot if requested
            let screenshot;
            if (mergedOptions.captureScreenshot) {
                screenshot = await this.captureScreenshot(page);
            }
            // Build timings
            const timings = this.buildTimings(timer, navigationResult.timings);
            // Build summary
            const summary = this.buildSummary(networkRequests, scripts, dataLayerData.events, consoleData.messages, consoleData.errors);
            // Build result
            const result = {
                id: scanId,
                url,
                finalUrl: navigationResult.finalUrl,
                success: true,
                startedAt: timer.getStartTimestamp(),
                completedAt: Date.now(),
                timings,
                httpStatus: navigationResult.httpStatus,
                pageTitle: pageMetadata.title,
                metaTags: pageMetadata.metaTags,
                networkRequests,
                scripts,
                dataLayerEvents: dataLayerData.events,
                dataLayerSnapshots: dataLayerData.snapshots,
                consoleMessages: consoleData.messages,
                errors: consoleData.errors,
                cookies,
                localStorage: storage.localStorage,
                sessionStorage: storage.sessionStorage,
                screenshot,
                config: mergedOptions,
                summary,
            };
            if (this.debug) {
                console.log(`[PageScanner] Scan complete: ${url}`);
                console.log(`[PageScanner] Requests: ${summary.totalRequests}, Scripts: ${summary.totalScripts}`);
            }
            return result;
        }
        catch (error) {
            const wrappedError = (0, errors_1.wrapError)(error);
            return this.createErrorResult(scanId, url, timer, mergedOptions, wrappedError.message);
        }
        finally {
            // Detach collectors
            await Promise.all([
                networkCollector.detach().catch(() => { }),
                scriptCollector.detach().catch(() => { }),
                dataLayerCollector.detach().catch(() => { }),
                consoleCollector.detach().catch(() => { }),
            ]);
            // Close page
            if (page) {
                await page.close().catch(() => { });
            }
            // Release context
            if (contextLease) {
                await contextLease.release().catch(() => { });
            }
        }
    }
    /**
     * Build context options from scan options
     */
    buildContextOptions(options) {
        return {
            viewport: options.viewport,
            userAgent: options.userAgent,
            extraHTTPHeaders: options.extraHeaders,
            geolocation: options.geolocation,
            locale: options.locale,
            timezoneId: options.timezone,
            javaScriptEnabled: options.javaScriptEnabled,
            httpCredentials: options.httpAuth,
            ignoreHTTPSErrors: true,
            deviceScaleFactor: options.viewport?.deviceScaleFactor,
            hasTouch: options.viewport?.hasTouch,
            isMobile: options.viewport?.isMobile,
        };
    }
    /**
     * Configure page settings
     */
    async configurePage(page, options) {
        // Set cookies if provided
        if (options.cookies && options.cookies.length > 0) {
            await page.context().addCookies(options.cookies.map((c) => ({
                name: c.name,
                value: c.value,
                domain: c.domain,
                path: c.path || '/',
                expires: c.expires,
                httpOnly: c.httpOnly,
                secure: c.secure,
                sameSite: c.sameSite,
            })));
        }
        // Block resources if specified
        if (options.blockResourceTypes && options.blockResourceTypes.length > 0) {
            const blockedTypes = options.blockResourceTypes;
            await page.route('**/*', (route) => {
                const resourceType = route.request().resourceType();
                if (blockedTypes.includes(resourceType)) {
                    route.abort();
                }
                else {
                    route.continue();
                }
            });
        }
        // Block URL patterns if specified
        if (options.blockUrlPatterns && options.blockUrlPatterns.length > 0) {
            for (const pattern of options.blockUrlPatterns) {
                await page.route(pattern, (route) => route.abort());
            }
        }
    }
    /**
     * Navigate to URL and return navigation result
     */
    async navigateToUrl(page, url, options) {
        const timings = {};
        try {
            const response = await page.goto(url, {
                waitUntil: options.waitUntil,
                timeout: options.timeout,
            });
            timings.navigationStart = Date.now();
            if (!response) {
                throw new errors_1.NavigationError('No response received', url);
            }
            const finalUrl = page.url();
            const httpStatus = response.status();
            // Get performance timings from the page
            try {
                const perfTimings = await page.evaluate(() => {
                    const perf = performance.getEntriesByType('navigation')[0];
                    if (!perf)
                        return null;
                    return {
                        domContentLoaded: perf.domContentLoadedEventEnd,
                        loadEvent: perf.loadEventEnd,
                        ttfb: perf.responseStart - perf.requestStart,
                    };
                });
                if (perfTimings) {
                    timings.domContentLoaded = perfTimings.domContentLoaded;
                    timings.loadEvent = perfTimings.loadEvent;
                    timings.ttfb = perfTimings.ttfb;
                }
            }
            catch {
                // Performance API may not be available
            }
            // Get paint timings
            try {
                const paintTimings = await page.evaluate(() => {
                    const entries = performance.getEntriesByType('paint');
                    const fp = entries.find((e) => e.name === 'first-paint');
                    const fcp = entries.find((e) => e.name === 'first-contentful-paint');
                    return {
                        firstPaint: fp?.startTime,
                        firstContentfulPaint: fcp?.startTime,
                    };
                });
                if (paintTimings.firstPaint) {
                    timings.firstPaint = paintTimings.firstPaint;
                }
                if (paintTimings.firstContentfulPaint) {
                    timings.firstContentfulPaint = paintTimings.firstContentfulPaint;
                }
            }
            catch {
                // Paint timing may not be available
            }
            return { finalUrl, httpStatus, timings };
        }
        catch (error) {
            if (error instanceof Error && error.name === 'TimeoutError') {
                throw new errors_1.TimeoutError('Page navigation', options.timeout || ScanOptions_1.DEFAULT_SCAN_OPTIONS.timeout);
            }
            throw new errors_1.NavigationError(`Navigation failed: ${error instanceof Error ? error.message : String(error)}`, url);
        }
    }
    /**
     * Wait for additional conditions after initial load
     */
    async waitForConditions(page, options) {
        // Wait for specific selector if provided
        if (options.waitForSelector) {
            try {
                await page.waitForSelector(options.waitForSelector, {
                    timeout: options.timeout,
                });
            }
            catch (error) {
                if (this.debug) {
                    console.log(`[PageScanner] Selector wait timed out: ${options.waitForSelector}`);
                }
                // Don't fail the scan, just log and continue
            }
        }
        // Additional wait time
        if (options.additionalWaitTime && options.additionalWaitTime > 0) {
            await (0, timing_1.delay)(options.additionalWaitTime);
        }
    }
    /**
     * Collect page metadata
     */
    async collectPageMetadata(page) {
        try {
            return await page.evaluate(() => {
                const metaTags = {};
                // Get all meta tags
                document.querySelectorAll('meta').forEach((meta) => {
                    const name = meta.getAttribute('name') || meta.getAttribute('property');
                    const content = meta.getAttribute('content');
                    if (name && content) {
                        metaTags[name] = content;
                    }
                });
                return {
                    title: document.title || undefined,
                    metaTags,
                };
            });
        }
        catch {
            return { title: undefined, metaTags: {} };
        }
    }
    /**
     * Collect cookies from context
     */
    async collectCookies(context) {
        try {
            const cookies = await context.cookies();
            return cookies.map((c) => ({
                name: c.name,
                value: c.value,
                domain: c.domain,
                path: c.path,
                expires: c.expires,
                httpOnly: c.httpOnly,
                secure: c.secure,
                sameSite: c.sameSite,
            }));
        }
        catch {
            return [];
        }
    }
    /**
     * Collect storage data from page
     */
    async collectStorage(page) {
        try {
            return await page.evaluate(() => {
                const getStorage = (storage) => {
                    const result = {};
                    for (let i = 0; i < storage.length; i++) {
                        const key = storage.key(i);
                        if (key) {
                            result[key] = storage.getItem(key) || '';
                        }
                    }
                    return result;
                };
                return {
                    localStorage: getStorage(localStorage),
                    sessionStorage: getStorage(sessionStorage),
                };
            });
        }
        catch {
            return {};
        }
    }
    /**
     * Capture page screenshot
     */
    async captureScreenshot(page) {
        try {
            const buffer = await page.screenshot({ fullPage: false });
            return buffer.toString('base64');
        }
        catch {
            return undefined;
        }
    }
    /**
     * Build timing metrics
     */
    buildTimings(timer, pageTimings) {
        return {
            navigationStart: pageTimings.navigationStart || timer.getStartTimestamp(),
            domContentLoaded: pageTimings.domContentLoaded,
            loadEvent: pageTimings.loadEvent,
            firstPaint: pageTimings.firstPaint,
            firstContentfulPaint: pageTimings.firstContentfulPaint,
            ttfb: pageTimings.ttfb,
            scanDuration: timer.elapsed(),
        };
    }
    /**
     * Build scan summary
     */
    buildSummary(networkRequests, scripts, dataLayerEvents, consoleMessages, errors) {
        const analyticsRequests = networkRequests.filter((r) => r.isAnalyticsRequest);
        const externalScripts = scripts.filter((s) => !s.isInline);
        const inlineScripts = scripts.filter((s) => s.isInline);
        const dynamicScripts = scripts.filter((s) => s.dynamicallyInjected);
        const failedRequests = networkRequests.filter((r) => r.failed);
        const consoleErrors = consoleMessages.filter((m) => m.type === 'error');
        // Calculate total page weight from response sizes
        let totalPageWeight = 0;
        for (const req of networkRequests) {
            if (req.responseBody) {
                totalPageWeight += req.responseBody.length;
            }
        }
        return {
            totalRequests: networkRequests.length,
            failedRequests: failedRequests.length,
            analyticsRequests: analyticsRequests.length,
            totalScripts: scripts.length,
            externalScripts: externalScripts.length,
            inlineScripts: inlineScripts.length,
            dynamicScripts: dynamicScripts.length,
            dataLayerPushes: dataLayerEvents.filter((e) => e.source === 'push').length,
            consoleErrors: consoleErrors.length,
            pageErrors: errors.length,
            totalPageWeight,
        };
    }
    /**
     * Create an error result
     */
    createErrorResult(scanId, url, timer, options, errorMessage) {
        return {
            id: scanId,
            url,
            finalUrl: url,
            success: false,
            error: errorMessage,
            startedAt: timer.getStartTimestamp(),
            completedAt: Date.now(),
            timings: {
                navigationStart: timer.getStartTimestamp(),
                scanDuration: timer.elapsed(),
            },
            networkRequests: [],
            scripts: [],
            dataLayerEvents: [],
            dataLayerSnapshots: [],
            consoleMessages: [],
            errors: [],
            cookies: [],
            config: options,
            summary: {
                totalRequests: 0,
                failedRequests: 0,
                analyticsRequests: 0,
                totalScripts: 0,
                externalScripts: 0,
                inlineScripts: 0,
                dynamicScripts: 0,
                dataLayerPushes: 0,
                consoleErrors: 0,
                pageErrors: 0,
                totalPageWeight: 0,
            },
        };
    }
    /**
     * Scan multiple URLs in parallel
     */
    async scanBatch(urls, options = {}, concurrency = 3) {
        const results = [];
        const queue = [...urls];
        const workers = Array(Math.min(concurrency, urls.length))
            .fill(null)
            .map(async () => {
            while (queue.length > 0) {
                const url = queue.shift();
                if (url) {
                    const result = await this.scan(url, options);
                    results.push(result);
                }
            }
        });
        await Promise.all(workers);
        return results;
    }
}
exports.PageScanner = PageScanner;
/**
 * Create a PageScanner with default configuration
 */
function createScanner(debug = false) {
    return new PageScanner(undefined, debug);
}
/**
 * Convenience function to scan a single URL
 */
async function scanUrl(url, options = {}) {
    const scanner = createScanner();
    return scanner.scan(url, options);
}
/**
 * Convenience function to scan multiple URLs
 */
async function scanUrls(urls, options = {}, concurrency = 3) {
    const scanner = createScanner();
    return scanner.scanBatch(urls, options, concurrency);
}
//# sourceMappingURL=PageScanner.js.map