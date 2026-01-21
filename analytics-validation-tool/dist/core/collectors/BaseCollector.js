"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCollector = void 0;
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
/**
 * Abstract base class for collectors
 */
class BaseCollector {
    /** Current page reference */
    page = null;
    /** Collector options */
    options;
    /** Current state */
    state = 'idle';
    /** Logger instance */
    logger;
    /** Event handlers */
    eventHandlers = new Map();
    /** Cleanup functions to run on detach */
    cleanupFunctions = [];
    /** Error that occurred during operation */
    lastError = null;
    constructor(options, defaultOptions, collectorName) {
        this.options = { ...defaultOptions, ...options };
        this.logger = options.logger || (0, logger_1.getLogger)({ component: collectorName });
    }
    /**
     * Attach to a page and start collecting
     */
    async attach(page) {
        if (this.state === 'attached' || this.state === 'attaching') {
            throw new errors_1.CollectorError(this.name, 'Already attached or attaching to a page');
        }
        this.state = 'attaching';
        this.page = page;
        this.lastError = null;
        try {
            this.logger.debug('Attaching to page');
            await this.doAttach(page);
            this.state = 'attached';
            this.logger.debug('Attached successfully');
        }
        catch (error) {
            this.state = 'error';
            this.lastError = error;
            this.logger.error('Failed to attach', error);
            // Attempt cleanup
            await this.cleanupOnError();
            throw new errors_1.CollectorError(this.name, `Failed to attach: ${error instanceof Error ? error.message : String(error)}`, { originalError: error });
        }
    }
    /**
     * Detach from the page
     */
    async detach() {
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
        }
        catch (error) {
            this.logger.warn('Error during detach', { error: String(error) });
            // Still mark as idle to allow re-attachment
            this.state = 'idle';
            this.page = null;
        }
    }
    /**
     * Collect gathered data
     */
    async collect() {
        if (this.state !== 'attached') {
            throw new errors_1.CollectorError(this.name, `Cannot collect in state: ${this.state}`);
        }
        this.state = 'collecting';
        try {
            this.logger.debug('Collecting data');
            const result = await this.doCollect();
            this.state = 'attached';
            this.logger.debug('Collection complete', { count: this.getResultCount(result) });
            return result;
        }
        catch (error) {
            this.state = 'attached'; // Remain attached for retry
            this.logger.error('Collection failed', error);
            throw new errors_1.CollectorError(this.name, `Collection failed: ${error instanceof Error ? error.message : String(error)}`, { originalError: error });
        }
    }
    /**
     * Get count of items in result (for logging)
     */
    getResultCount(result) {
        if (Array.isArray(result)) {
            return result.length;
        }
        return 1;
    }
    /**
     * Reset collector state
     */
    reset() {
        this.eventHandlers.clear();
        this.lastError = null;
        this.doReset();
        this.logger.debug('Reset complete');
    }
    /**
     * Check if collector is attached
     */
    isAttached() {
        return this.state === 'attached' || this.state === 'collecting';
    }
    /**
     * Get current state
     */
    getState() {
        return this.state;
    }
    /**
     * Get last error
     */
    getLastError() {
        return this.lastError;
    }
    /**
     * Subscribe to events
     */
    on(event, handler) {
        const handlers = this.eventHandlers.get(event) || [];
        handlers.push(handler);
        this.eventHandlers.set(event, handlers);
        return () => {
            const currentHandlers = this.eventHandlers.get(event) || [];
            const idx = currentHandlers.indexOf(handler);
            if (idx !== -1) {
                currentHandlers.splice(idx, 1);
            }
        };
    }
    /**
     * Emit an event
     */
    emit(event, data) {
        const handlers = this.eventHandlers.get(event) || [];
        for (const handler of handlers) {
            try {
                handler(data);
            }
            catch (error) {
                this.logger.warn('Event handler error', { event, error: String(error) });
            }
        }
    }
    /**
     * Register a cleanup function
     */
    registerCleanup(cleanup) {
        this.cleanupFunctions.push(cleanup);
    }
    /**
     * Run all cleanup functions
     */
    async runCleanupFunctions() {
        for (const cleanup of this.cleanupFunctions) {
            try {
                cleanup();
            }
            catch (error) {
                this.logger.warn('Cleanup function error', { error: String(error) });
            }
        }
        this.cleanupFunctions = [];
    }
    /**
     * Cleanup after an error
     */
    async cleanupOnError() {
        try {
            await this.runCleanupFunctions();
            await this.doDetach();
        }
        catch {
            // Ignore cleanup errors during error handling
        }
        this.page = null;
        this.state = 'idle';
    }
    /**
     * Execute with timeout
     */
    async withTimeout(operation, timeoutMs, operationName) {
        return Promise.race([
            operation,
            new Promise((_, reject) => setTimeout(() => reject(new Error(`${operationName} timed out after ${timeoutMs}ms`)), timeoutMs)),
        ]);
    }
}
exports.BaseCollector = BaseCollector;
//# sourceMappingURL=BaseCollector.js.map