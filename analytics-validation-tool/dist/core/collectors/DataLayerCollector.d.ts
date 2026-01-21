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
import type { Page } from 'playwright';
import type { Collector, DataLayerCollectorOptions } from './types';
import type { DataLayerEvent, DataLayerSnapshot } from '../../types';
/**
 * Data collected from the injected observer
 */
interface ObserverData {
    events: DataLayerEvent[];
    snapshots: DataLayerSnapshot[];
}
/**
 * Data Layer Collector Class
 */
export declare class DataLayerCollector implements Collector<ObserverData> {
    private page;
    private options;
    private attached;
    private injectionScript;
    constructor(options?: DataLayerCollectorOptions);
    /**
     * Attach to a page
     *
     * Note: This should be called BEFORE navigation to capture initial state
     * and all push events from the beginning.
     */
    attach(page: Page): Promise<void>;
    /**
     * Detach from the page
     */
    detach(): Promise<void>;
    /**
     * Collect all data layer events and snapshots
     */
    collect(): Promise<ObserverData>;
    /**
     * Get current state of all data layers directly from the page
     */
    private getCurrentState;
    /**
     * Get only the data layer events (pushes)
     */
    getEvents(): Promise<DataLayerEvent[]>;
    /**
     * Get only the snapshots
     */
    getSnapshots(): Promise<DataLayerSnapshot[]>;
    /**
     * Get events for a specific data layer
     */
    getEventsForDataLayer(name: string): Promise<DataLayerEvent[]>;
    /**
     * Get the current value of a specific data layer
     */
    getDataLayerValue(name: string): Promise<unknown[] | null>;
    /**
     * Check if a specific event was pushed to a data layer
     */
    hasEvent(dataLayerName: string, predicate: (event: unknown) => boolean): Promise<boolean>;
    /**
     * Find events matching a predicate
     */
    findEvents(predicate: (event: DataLayerEvent) => boolean): Promise<DataLayerEvent[]>;
    /**
     * Get events by event name (for GTM-style dataLayer)
     *
     * GTM dataLayer events typically have an 'event' property
     */
    getEventsByName(eventName: string): Promise<DataLayerEvent[]>;
    /**
     * Reset collector state
     */
    reset(): void;
    /**
     * Check if collector is attached
     */
    isAttached(): boolean;
    /**
     * Get the configured data layer names
     */
    getDataLayerNames(): string[];
    /**
     * Add additional data layer names to observe
     * Note: Must be called before attach() to take effect
     */
    addDataLayerName(name: string): void;
}
export {};
//# sourceMappingURL=DataLayerCollector.d.ts.map