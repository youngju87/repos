"use strict";
/**
 * Data Layer Collector
 *
 * Captures data layer state and mutations for analytics validation.
 * Supports multiple data layer implementations:
 * - Google Tag Manager's dataLayer (array-based with push)
 * - Adobe's digitalData (W3C Customer Experience Digital Data)
 * - Tealium's utag_data
 * - Custom data layer objects
 *
 * Uses pre-injected observers to capture:
 * - Initial data layer state
 * - All push events with timing
 * - State snapshots at key lifecycle points
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataLayerCollector = void 0;
const errors_1 = require("../utils/errors");
const dataLayerObserver_1 = require("../injection/dataLayerObserver");
/**
 * Default options for data layer collector
 */
const DEFAULT_OPTIONS = {
    debug: false,
    dataLayerNames: dataLayerObserver_1.DEFAULT_DATA_LAYER_NAMES,
    captureStackTraces: true,
};
/**
 * Data Layer Collector Class
 */
class DataLayerCollector {
    page = null;
    options;
    attached = false;
    injectionScript;
    constructor(options = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.injectionScript = (0, dataLayerObserver_1.generateDataLayerObserverScript)(this.options.dataLayerNames);
    }
    /**
     * Attach to a page
     *
     * Note: This should be called BEFORE navigation to capture initial state
     * and all push events from the beginning.
     */
    async attach(page) {
        if (this.attached) {
            throw new errors_1.CollectorError('DataLayerCollector', 'Already attached to a page');
        }
        this.page = page;
        try {
            // Add the observer script to run before any page scripts
            await page.addInitScript(this.injectionScript);
            this.attached = true;
            if (this.options.debug) {
                console.log('[DataLayerCollector] Attached to page');
                console.log(`[DataLayerCollector] Watching: ${this.options.dataLayerNames.join(', ')}`);
            }
        }
        catch (error) {
            throw new errors_1.CollectorError('DataLayerCollector', `Failed to attach: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Detach from the page
     */
    async detach() {
        if (!this.attached) {
            return;
        }
        this.page = null;
        this.attached = false;
        if (this.options.debug) {
            console.log('[DataLayerCollector] Detached from page');
        }
    }
    /**
     * Collect all data layer events and snapshots
     */
    async collect() {
        if (!this.page) {
            throw new errors_1.CollectorError('DataLayerCollector', 'Not attached to a page');
        }
        try {
            // Get data from the injected observer
            const data = await this.page.evaluate(() => {
                const observer = window.__AVT_DATA_LAYER_OBSERVER__;
                if (observer && typeof observer.getData === 'function') {
                    return observer.getData();
                }
                return { events: [], snapshots: [] };
            });
            // Also try to get current state directly for any data layers we might have missed
            const currentState = await this.getCurrentState();
            // Merge current state snapshots if they don't exist
            for (const snapshot of currentState) {
                const exists = data.snapshots.some((s) => s.name === snapshot.name && s.phase === snapshot.phase);
                if (!exists) {
                    data.snapshots.push(snapshot);
                }
            }
            if (this.options.debug) {
                console.log(`[DataLayerCollector] Collected ${data.events.length} events`);
                console.log(`[DataLayerCollector] Collected ${data.snapshots.length} snapshots`);
            }
            return data;
        }
        catch (error) {
            throw new errors_1.CollectorError('DataLayerCollector', `Failed to collect: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Get current state of all data layers directly from the page
     */
    async getCurrentState() {
        if (!this.page)
            return [];
        const dataLayerNames = this.options.dataLayerNames;
        return this.page.evaluate((names) => {
            const snapshots = [];
            for (const name of names) {
                const dl = window[name];
                if (dl !== undefined) {
                    snapshots.push({
                        name,
                        contents: Array.isArray(dl) ? [...dl] : [dl],
                        timestamp: Date.now(),
                        phase: 'final',
                    });
                }
            }
            return snapshots;
        }, dataLayerNames);
    }
    /**
     * Get only the data layer events (pushes)
     */
    async getEvents() {
        const data = await this.collect();
        return data.events;
    }
    /**
     * Get only the snapshots
     */
    async getSnapshots() {
        const data = await this.collect();
        return data.snapshots;
    }
    /**
     * Get events for a specific data layer
     */
    async getEventsForDataLayer(name) {
        const data = await this.collect();
        return data.events.filter((e) => e.dataLayerName === name);
    }
    /**
     * Get the current value of a specific data layer
     */
    async getDataLayerValue(name) {
        if (!this.page) {
            throw new errors_1.CollectorError('DataLayerCollector', 'Not attached to a page');
        }
        return this.page.evaluate((dlName) => {
            const dl = window[dlName];
            if (dl === undefined)
                return null;
            return Array.isArray(dl) ? [...dl] : [dl];
        }, name);
    }
    /**
     * Check if a specific event was pushed to a data layer
     */
    async hasEvent(dataLayerName, predicate) {
        const events = await this.getEventsForDataLayer(dataLayerName);
        return events.some((e) => predicate(e.data));
    }
    /**
     * Find events matching a predicate
     */
    async findEvents(predicate) {
        const data = await this.collect();
        return data.events.filter(predicate);
    }
    /**
     * Get events by event name (for GTM-style dataLayer)
     *
     * GTM dataLayer events typically have an 'event' property
     */
    async getEventsByName(eventName) {
        const data = await this.collect();
        return data.events.filter((e) => {
            if (typeof e.data === 'object' && e.data !== null) {
                return e.data.event === eventName;
            }
            return false;
        });
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
     * Get the configured data layer names
     */
    getDataLayerNames() {
        return [...this.options.dataLayerNames];
    }
    /**
     * Add additional data layer names to observe
     * Note: Must be called before attach() to take effect
     */
    addDataLayerName(name) {
        if (!this.options.dataLayerNames.includes(name)) {
            this.options.dataLayerNames.push(name);
            // Regenerate injection script with new names
            this.injectionScript = (0, dataLayerObserver_1.generateDataLayerObserverScript)(this.options.dataLayerNames);
        }
    }
}
exports.DataLayerCollector = DataLayerCollector;
//# sourceMappingURL=DataLayerCollector.js.map