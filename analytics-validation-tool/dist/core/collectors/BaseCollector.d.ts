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
import { Logger } from '../utils/logger';
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
export declare abstract class BaseCollector<T, TOptions extends BaseCollectorOptions = BaseCollectorOptions> implements Collector<T> {
    /** Collector name for logging */
    protected abstract readonly name: string;
    /** Current page reference */
    protected page: Page | null;
    /** Collector options */
    protected options: TOptions;
    /** Current state */
    protected state: CollectorState;
    /** Logger instance */
    protected logger: Logger;
    /** Event handlers */
    private eventHandlers;
    /** Cleanup functions to run on detach */
    protected cleanupFunctions: Unsubscribe[];
    /** Error that occurred during operation */
    protected lastError: Error | null;
    constructor(options: TOptions, defaultOptions: TOptions, collectorName: string);
    /**
     * Attach to a page and start collecting
     */
    attach(page: Page): Promise<void>;
    /**
     * Implementation-specific attach logic
     */
    protected abstract doAttach(page: Page): Promise<void>;
    /**
     * Detach from the page
     */
    detach(): Promise<void>;
    /**
     * Implementation-specific detach logic
     */
    protected abstract doDetach(): Promise<void>;
    /**
     * Collect gathered data
     */
    collect(): Promise<T>;
    /**
     * Implementation-specific collection logic
     */
    protected abstract doCollect(): Promise<T>;
    /**
     * Get count of items in result (for logging)
     */
    protected getResultCount(result: T): number;
    /**
     * Reset collector state
     */
    reset(): void;
    /**
     * Implementation-specific reset logic
     */
    protected abstract doReset(): void;
    /**
     * Check if collector is attached
     */
    isAttached(): boolean;
    /**
     * Get current state
     */
    getState(): CollectorState;
    /**
     * Get last error
     */
    getLastError(): Error | null;
    /**
     * Subscribe to events
     */
    protected on<E>(event: string, handler: EventHandler<E>): Unsubscribe;
    /**
     * Emit an event
     */
    protected emit<E>(event: string, data: E): void;
    /**
     * Register a cleanup function
     */
    protected registerCleanup(cleanup: Unsubscribe): void;
    /**
     * Run all cleanup functions
     */
    private runCleanupFunctions;
    /**
     * Cleanup after an error
     */
    private cleanupOnError;
    /**
     * Execute with timeout
     */
    protected withTimeout<R>(operation: Promise<R>, timeoutMs: number, operationName: string): Promise<R>;
}
//# sourceMappingURL=BaseCollector.d.ts.map