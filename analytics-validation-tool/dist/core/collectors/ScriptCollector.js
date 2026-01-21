"use strict";
/**
 * Script Collector
 *
 * Captures all script tags from the page, including:
 * - Static scripts in HTML
 * - Dynamically injected scripts
 * - Inline vs external scripts
 * - Load timing and status
 * - Script attributes (async, defer, type, etc.)
 *
 * Uses a combination of:
 * - Pre-injected mutation observer (for real-time tracking)
 * - DOM queries (for final collection)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptCollector = void 0;
const errors_1 = require("../utils/errors");
const scriptObserver_1 = require("../injection/scriptObserver");
/**
 * Default options for script collector
 */
const DEFAULT_OPTIONS = {
    debug: false,
    maxInlineScriptLength: 50000, // 50KB
    captureInlineContent: true,
};
/**
 * Script Collector Class
 */
class ScriptCollector {
    page = null;
    options;
    attached = false;
    injectionScript;
    constructor(options = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.injectionScript = (0, scriptObserver_1.generateScriptObserverScript)();
    }
    /**
     * Attach to a page
     *
     * Note: This should be called BEFORE navigation to capture all scripts.
     * The observer script is added via addInitScript which runs before page content.
     */
    async attach(page) {
        if (this.attached) {
            throw new errors_1.CollectorError('ScriptCollector', 'Already attached to a page');
        }
        this.page = page;
        try {
            // Add the observer script to run before any page scripts
            await page.addInitScript(this.injectionScript);
            this.attached = true;
            if (this.options.debug) {
                console.log('[ScriptCollector] Attached to page');
            }
        }
        catch (error) {
            throw new errors_1.CollectorError('ScriptCollector', `Failed to attach: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Detach from the page
     */
    async detach() {
        if (!this.attached) {
            return;
        }
        // Cleanup the observer in the page
        if (this.page) {
            try {
                await this.page.evaluate(() => {
                    const observer = window
                        .__AVT_SCRIPT_OBSERVER__;
                    if (observer && typeof observer.cleanup === 'function') {
                        observer.cleanup();
                    }
                });
            }
            catch {
                // Page may already be closed
            }
        }
        this.page = null;
        this.attached = false;
        if (this.options.debug) {
            console.log('[ScriptCollector] Detached from page');
        }
    }
    /**
     * Collect all captured script data
     */
    async collect() {
        if (!this.page) {
            throw new errors_1.CollectorError('ScriptCollector', 'Not attached to a page');
        }
        try {
            // Get data from the injected observer
            const observerData = await this.page.evaluate(() => {
                const observer = window.__AVT_SCRIPT_OBSERVER__;
                if (observer && typeof observer.getData === 'function') {
                    return observer.getData();
                }
                return { scripts: [] };
            });
            // Also do a final DOM query to catch any scripts we might have missed
            const domScripts = await this.collectFromDOM();
            // Merge and deduplicate
            const allScripts = this.mergeScripts(observerData.scripts || [], domScripts);
            if (this.options.debug) {
                console.log(`[ScriptCollector] Collected ${allScripts.length} scripts`);
            }
            return allScripts;
        }
        catch (error) {
            throw new errors_1.CollectorError('ScriptCollector', `Failed to collect: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Collect scripts directly from the DOM
     */
    async collectFromDOM() {
        if (!this.page)
            return [];
        const maxInlineLength = this.options.maxInlineScriptLength;
        const captureInline = this.options.captureInlineContent;
        return this.page.evaluate(({ maxInlineLength, captureInline }) => {
            const scripts = document.querySelectorAll('script');
            const result = [];
            let order = 0;
            scripts.forEach((script) => {
                const isInline = !script.src;
                // Get data attributes
                const dataAttributes = {};
                if (script.dataset) {
                    for (const key in script.dataset) {
                        dataAttributes[key] = script.dataset[key] || '';
                    }
                }
                // Check if in head
                let inHead = false;
                let parent = script.parentElement;
                while (parent) {
                    if (parent.tagName === 'HEAD') {
                        inHead = true;
                        break;
                    }
                    parent = parent.parentElement;
                }
                // Get inline content if applicable
                let content;
                let contentTruncated = false;
                if (isInline && captureInline) {
                    const text = script.textContent || '';
                    if (text.length > maxInlineLength) {
                        content = text.substring(0, maxInlineLength);
                        contentTruncated = true;
                    }
                    else {
                        content = text;
                    }
                }
                result.push({
                    id: script.__avt_script_id__ ||
                        `dom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    src: script.src || undefined,
                    isInline,
                    content,
                    contentTruncated,
                    type: script.type || undefined,
                    async: script.async,
                    defer: script.defer,
                    noModule: script.noModule || false,
                    crossOrigin: script.crossOrigin || undefined,
                    integrity: script.integrity || undefined,
                    documentOrder: order++,
                    inHead,
                    dynamicallyInjected: script.__avt_dynamic__ || false,
                    detectedAt: Date.now(),
                    loadedAt: undefined, // Can't determine from DOM alone
                    loadFailed: false,
                    loadError: undefined,
                    dataAttributes,
                    elementId: script.id || undefined,
                    className: script.className || undefined,
                });
            });
            return result;
        }, { maxInlineLength, captureInline });
    }
    /**
     * Merge scripts from observer and DOM, removing duplicates
     */
    mergeScripts(observerScripts, domScripts) {
        const seen = new Set();
        const result = [];
        // Add observer scripts first (they have more accurate timing)
        for (const script of observerScripts) {
            const key = this.getScriptKey(script);
            if (!seen.has(key)) {
                seen.add(key);
                result.push(script);
            }
        }
        // Add any DOM scripts we might have missed
        for (const script of domScripts) {
            const key = this.getScriptKey(script);
            if (!seen.has(key)) {
                seen.add(key);
                result.push(script);
            }
        }
        // Sort by document order
        return result.sort((a, b) => a.documentOrder - b.documentOrder);
    }
    /**
     * Generate a unique key for a script for deduplication
     */
    getScriptKey(script) {
        if (script.src) {
            return `external:${script.src}`;
        }
        // For inline scripts, use a hash of content + position
        const contentHash = script.content
            ? script.content.substring(0, 100)
            : '';
        return `inline:${script.documentOrder}:${contentHash}`;
    }
    /**
     * Reset collector state
     */
    reset() {
        // Observer state is in the page context, will be reset on next navigation
    }
    /**
     * Check if collector is attached
     */
    isAttached() {
        return this.attached;
    }
    /**
     * Get external scripts only
     */
    async getExternalScripts() {
        const scripts = await this.collect();
        return scripts.filter((s) => !s.isInline);
    }
    /**
     * Get inline scripts only
     */
    async getInlineScripts() {
        const scripts = await this.collect();
        return scripts.filter((s) => s.isInline);
    }
    /**
     * Get dynamically injected scripts only
     */
    async getDynamicScripts() {
        const scripts = await this.collect();
        return scripts.filter((s) => s.dynamicallyInjected);
    }
    /**
     * Check if a specific script source is present
     */
    async hasScript(srcPattern) {
        const scripts = await this.collect();
        const pattern = new RegExp(srcPattern.replace(/\*/g, '.*'), 'i');
        return scripts.some((s) => s.src && pattern.test(s.src));
    }
}
exports.ScriptCollector = ScriptCollector;
//# sourceMappingURL=ScriptCollector.js.map