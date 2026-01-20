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
import { CollectorError } from '../utils/errors';
import {
  generateDataLayerObserverScript,
  DEFAULT_DATA_LAYER_NAMES,
} from '../injection/dataLayerObserver';

/**
 * Default options for data layer collector
 */
const DEFAULT_OPTIONS: Required<DataLayerCollectorOptions> = {
  debug: false,
  dataLayerNames: DEFAULT_DATA_LAYER_NAMES,
  captureStackTraces: true,
};

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
export class DataLayerCollector implements Collector<ObserverData> {
  private page: Page | null = null;
  private options: Required<DataLayerCollectorOptions>;
  private attached = false;
  private injectionScript: string;

  constructor(options: DataLayerCollectorOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.injectionScript = generateDataLayerObserverScript(this.options.dataLayerNames);
  }

  /**
   * Attach to a page
   *
   * Note: This should be called BEFORE navigation to capture initial state
   * and all push events from the beginning.
   */
  async attach(page: Page): Promise<void> {
    if (this.attached) {
      throw new CollectorError('DataLayerCollector', 'Already attached to a page');
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
    } catch (error) {
      throw new CollectorError(
        'DataLayerCollector',
        `Failed to attach: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Detach from the page
   */
  async detach(): Promise<void> {
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
  async collect(): Promise<ObserverData> {
    if (!this.page) {
      throw new CollectorError('DataLayerCollector', 'Not attached to a page');
    }

    try {
      // Get data from the injected observer
      const data = await this.page.evaluate(() => {
        const observer = (window as unknown as {
          __AVT_DATA_LAYER_OBSERVER__?: {
            getData: () => { events: DataLayerEvent[]; snapshots: DataLayerSnapshot[] };
          };
        }).__AVT_DATA_LAYER_OBSERVER__;

        if (observer && typeof observer.getData === 'function') {
          return observer.getData();
        }

        return { events: [], snapshots: [] };
      });

      // Also try to get current state directly for any data layers we might have missed
      const currentState = await this.getCurrentState();

      // Merge current state snapshots if they don't exist
      for (const snapshot of currentState) {
        const exists = data.snapshots.some(
          (s) => s.name === snapshot.name && s.phase === snapshot.phase
        );
        if (!exists) {
          data.snapshots.push(snapshot);
        }
      }

      if (this.options.debug) {
        console.log(`[DataLayerCollector] Collected ${data.events.length} events`);
        console.log(`[DataLayerCollector] Collected ${data.snapshots.length} snapshots`);
      }

      return data;
    } catch (error) {
      throw new CollectorError(
        'DataLayerCollector',
        `Failed to collect: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get current state of all data layers directly from the page
   */
  private async getCurrentState(): Promise<DataLayerSnapshot[]> {
    if (!this.page) return [];

    const dataLayerNames = this.options.dataLayerNames;

    return this.page.evaluate((names) => {
      const snapshots: DataLayerSnapshot[] = [];

      for (const name of names) {
        const dl = (window as unknown as Record<string, unknown>)[name];
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
  async getEvents(): Promise<DataLayerEvent[]> {
    const data = await this.collect();
    return data.events;
  }

  /**
   * Get only the snapshots
   */
  async getSnapshots(): Promise<DataLayerSnapshot[]> {
    const data = await this.collect();
    return data.snapshots;
  }

  /**
   * Get events for a specific data layer
   */
  async getEventsForDataLayer(name: string): Promise<DataLayerEvent[]> {
    const data = await this.collect();
    return data.events.filter((e) => e.dataLayerName === name);
  }

  /**
   * Get the current value of a specific data layer
   */
  async getDataLayerValue(name: string): Promise<unknown[] | null> {
    if (!this.page) {
      throw new CollectorError('DataLayerCollector', 'Not attached to a page');
    }

    return this.page.evaluate((dlName) => {
      const dl = (window as unknown as Record<string, unknown>)[dlName];
      if (dl === undefined) return null;
      return Array.isArray(dl) ? [...dl] : [dl];
    }, name);
  }

  /**
   * Check if a specific event was pushed to a data layer
   */
  async hasEvent(
    dataLayerName: string,
    predicate: (event: unknown) => boolean
  ): Promise<boolean> {
    const events = await this.getEventsForDataLayer(dataLayerName);
    return events.some((e) => predicate(e.data));
  }

  /**
   * Find events matching a predicate
   */
  async findEvents(predicate: (event: DataLayerEvent) => boolean): Promise<DataLayerEvent[]> {
    const data = await this.collect();
    return data.events.filter(predicate);
  }

  /**
   * Get events by event name (for GTM-style dataLayer)
   *
   * GTM dataLayer events typically have an 'event' property
   */
  async getEventsByName(eventName: string): Promise<DataLayerEvent[]> {
    const data = await this.collect();
    return data.events.filter((e) => {
      if (typeof e.data === 'object' && e.data !== null) {
        return (e.data as Record<string, unknown>).event === eventName;
      }
      return false;
    });
  }

  /**
   * Reset collector state
   */
  reset(): void {
    // Observer state is in the page context, will be reset on next navigation
  }

  /**
   * Check if collector is attached
   */
  isAttached(): boolean {
    return this.attached;
  }

  /**
   * Get the configured data layer names
   */
  getDataLayerNames(): string[] {
    return [...this.options.dataLayerNames];
  }

  /**
   * Add additional data layer names to observe
   * Note: Must be called before attach() to take effect
   */
  addDataLayerName(name: string): void {
    if (!this.options.dataLayerNames.includes(name)) {
      this.options.dataLayerNames.push(name);
      // Regenerate injection script with new names
      this.injectionScript = generateDataLayerObserverScript(this.options.dataLayerNames);
    }
  }
}
