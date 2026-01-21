/**
 * Base Collector
 *
 * Abstract base class for all collectors providing:
 * - Consistent lifecycle management (attach/detach)
 * - Common error handling
 * - Event emission infrastructure
 * - Logging integration
 * - Resource cleanup tracking
 */

import type { Page } from 'playwright';
import type { Collector, CollectorOptions, Unsubscribe, EventHandler } from './types';
import { CollectorError } from '../utils/errors';
import { getLogger, Logger } from '../utils/logger';

/**
 * Base collector options with logging
 */
export interface BaseCollectorOptions extends CollectorOptions {
  /** Custom logger instance */
  logger?: Logger;
}

/**
 * Collector state
 */
export type CollectorState = 'idle' | 'attaching' | 'attached' | 'collecting' | 'detaching' | 'error';

/**
 * Abstract base class for collectors
 */
export abstract class BaseCollector<T, TOptions extends BaseCollectorOptions = BaseCollectorOptions>
  implements Collector<T>
{
  /** Collector name for logging */
  protected abstract readonly name: string;

  /** Current page reference */
  protected page: Page | null = null;

  /** Collector options */
  protected options: TOptions;

  /** Current state */
  protected state: CollectorState = 'idle';

  /** Logger instance */
  protected logger: Logger;

  /** Event handlers */
  private eventHandlers: Map<string, EventHandler<unknown>[]> = new Map();

  /** Cleanup functions to run on detach */
  protected cleanupFunctions: Unsubscribe[] = [];

  /** Error that occurred during operation */
  protected lastError: Error | null = null;

  constructor(options: TOptions, defaultOptions: TOptions, collectorName: string) {
    this.options = { ...defaultOptions, ...options };
    this.logger = options.logger || getLogger({ component: collectorName });
  }

  /**
   * Attach to a page and start collecting
   */
  async attach(page: Page): Promise<void> {
    if (this.state === 'attached' || this.state === 'attaching') {
      throw new CollectorError(this.name, 'Already attached or attaching to a page');
    }

    this.state = 'attaching';
    this.page = page;
    this.lastError = null;

    try {
      this.logger.debug('Attaching to page');
      await this.doAttach(page);
      this.state = 'attached';
      this.logger.debug('Attached successfully');
    } catch (error) {
      this.state = 'error';
      this.lastError = error as Error;
      this.logger.error('Failed to attach', error as Error);

      // Attempt cleanup
      await this.cleanupOnError();

      throw new CollectorError(
        this.name,
        `Failed to attach: ${error instanceof Error ? error.message : String(error)}`,
        { originalError: error }
      );
    }
  }

  /**
   * Implementation-specific attach logic
   */
  protected abstract doAttach(page: Page): Promise<void>;

  /**
   * Detach from the page
   */
  async detach(): Promise<void> {
    if (this.state === 'idle' || this.state === 'detaching') {
      return;
    }

    this.state = 'detaching';

    try {
      this.logger.debug('Detaching from page');

      // Run cleanup functions
      await this.runCleanupFunctions();

      // Implementation-specific cleanup
      await this.doDetach();

      this.page = null;
      this.state = 'idle';
      this.logger.debug('Detached successfully');
    } catch (error) {
      this.logger.warn('Error during detach', { error: String(error) });
      // Still mark as idle to allow re-attachment
      this.state = 'idle';
      this.page = null;
    }
  }

  /**
   * Implementation-specific detach logic
   */
  protected abstract doDetach(): Promise<void>;

  /**
   * Collect gathered data
   */
  async collect(): Promise<T> {
    if (this.state !== 'attached') {
      throw new CollectorError(this.name, `Cannot collect in state: ${this.state}`);
    }

    this.state = 'collecting';

    try {
      this.logger.debug('Collecting data');
      const result = await this.doCollect();
      this.state = 'attached';
      this.logger.debug('Collection complete', { count: this.getResultCount(result) });
      return result;
    } catch (error) {
      this.state = 'attached'; // Remain attached for retry
      this.logger.error('Collection failed', error as Error);
      throw new CollectorError(
        this.name,
        `Collection failed: ${error instanceof Error ? error.message : String(error)}`,
        { originalError: error }
      );
    }
  }

  /**
   * Implementation-specific collection logic
   */
  protected abstract doCollect(): Promise<T>;

  /**
   * Get count of items in result (for logging)
   */
  protected getResultCount(result: T): number {
    if (Array.isArray(result)) {
      return result.length;
    }
    return 1;
  }

  /**
   * Reset collector state
   */
  reset(): void {
    this.eventHandlers.clear();
    this.lastError = null;
    this.doReset();
    this.logger.debug('Reset complete');
  }

  /**
   * Implementation-specific reset logic
   */
  protected abstract doReset(): void;

  /**
   * Check if collector is attached
   */
  isAttached(): boolean {
    return this.state === 'attached' || this.state === 'collecting';
  }

  /**
   * Get current state
   */
  getState(): CollectorState {
    return this.state;
  }

  /**
   * Get last error
   */
  getLastError(): Error | null {
    return this.lastError;
  }

  /**
   * Subscribe to events
   */
  protected on<E>(event: string, handler: EventHandler<E>): Unsubscribe {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.push(handler as EventHandler<unknown>);
    this.eventHandlers.set(event, handlers);

    return () => {
      const currentHandlers = this.eventHandlers.get(event) || [];
      const idx = currentHandlers.indexOf(handler as EventHandler<unknown>);
      if (idx !== -1) {
        currentHandlers.splice(idx, 1);
      }
    };
  }

  /**
   * Emit an event
   */
  protected emit<E>(event: string, data: E): void {
    const handlers = this.eventHandlers.get(event) || [];
    for (const handler of handlers) {
      try {
        handler(data);
      } catch (error) {
        this.logger.warn('Event handler error', { event, error: String(error) });
      }
    }
  }

  /**
   * Register a cleanup function
   */
  protected registerCleanup(cleanup: Unsubscribe): void {
    this.cleanupFunctions.push(cleanup);
  }

  /**
   * Run all cleanup functions
   */
  private async runCleanupFunctions(): Promise<void> {
    for (const cleanup of this.cleanupFunctions) {
      try {
        cleanup();
      } catch (error) {
        this.logger.warn('Cleanup function error', { error: String(error) });
      }
    }
    this.cleanupFunctions = [];
  }

  /**
   * Cleanup after an error
   */
  private async cleanupOnError(): Promise<void> {
    try {
      await this.runCleanupFunctions();
      await this.doDetach();
    } catch {
      // Ignore cleanup errors during error handling
    }
    this.page = null;
    this.state = 'idle';
  }

  /**
   * Execute with timeout
   */
  protected async withTimeout<R>(
    operation: Promise<R>,
    timeoutMs: number,
    operationName: string
  ): Promise<R> {
    return Promise.race([
      operation,
      new Promise<R>((_, reject) =>
        setTimeout(
          () => reject(new Error(`${operationName} timed out after ${timeoutMs}ms`)),
          timeoutMs
        )
      ),
    ]);
  }
}
