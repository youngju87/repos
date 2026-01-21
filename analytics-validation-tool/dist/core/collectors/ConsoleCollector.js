"use strict";
/**
 * Console Collector
 *
 * Captures console messages and page errors during execution.
 * Useful for:
 * - Detecting JavaScript errors
 * - Capturing analytics debug output
 * - Identifying page issues
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleCollector = void 0;
const errors_1 = require("../utils/errors");
const errorCapture_1 = require("../injection/errorCapture");
const serialization_1 = require("../utils/serialization");
/**
 * Default options for console collector
 */
const DEFAULT_OPTIONS = {
    debug: false,
    captureTypes: ['log', 'debug', 'info', 'warn', 'error', 'warning', 'trace'],
    maxMessages: 1000,
    maxMessageLength: 10000,
};
/**
 * Console Collector Class
 */
class ConsoleCollector {
    page = null;
    options;
    attached = false;
    messages = [];
    errors = [];
    cleanupFunctions = [];
    injectionScript;
    constructor(options = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.injectionScript = (0, errorCapture_1.generateErrorCaptureScript)();
    }
    /**
     * Attach to a page and start collecting
     */
    async attach(page) {
        if (this.attached) {
            throw new errors_1.CollectorError('ConsoleCollector', 'Already attached to a page');
        }
        this.page = page;
        this.reset();
        try {
            // Add error capture script for uncaught errors
            await page.addInitScript(this.injectionScript);
            // Set up console message listener
            const onConsole = (msg) => {
                this.handleConsoleMessage(msg);
            };
            // Set up page error listener
            const onPageError = (error) => {
                this.handlePageError(error);
            };
            page.on('console', onConsole);
            page.on('pageerror', onPageError);
            this.cleanupFunctions.push(() => {
                page.off('console', onConsole);
                page.off('pageerror', onPageError);
            });
            this.attached = true;
            if (this.options.debug) {
                console.log('[ConsoleCollector] Attached to page');
            }
        }
        catch (error) {
            throw new errors_1.CollectorError('ConsoleCollector', `Failed to attach: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Handle a console message from Playwright
     */
    handleConsoleMessage(msg) {
        // Check message limit
        if (this.messages.length >= this.options.maxMessages) {
            return;
        }
        const type = this.mapConsoleType(msg.type());
        // Check if we should capture this type
        if (!this.options.captureTypes.includes(type)) {
            return;
        }
        // Get location info
        const location = msg.location();
        // Get text, truncating if necessary
        let text = msg.text();
        if (text.length > this.options.maxMessageLength) {
            text = (0, serialization_1.truncate)(text, this.options.maxMessageLength);
        }
        // Try to get arguments (may fail for some message types)
        let args;
        try {
            // Note: This is synchronous and may not resolve all argument values
            args = undefined; // Playwright doesn't easily expose serialized args
        }
        catch {
            args = undefined;
        }
        const message = {
            type,
            text,
            args,
            url: location.url || undefined,
            lineNumber: location.lineNumber || undefined,
            columnNumber: location.columnNumber || undefined,
            timestamp: Date.now(),
        };
        this.messages.push(message);
        if (this.options.debug) {
            console.log(`[ConsoleCollector] ${type}: ${text.substring(0, 100)}`);
        }
    }
    /**
     * Handle a page error from Playwright
     */
    handlePageError(error) {
        const pageError = {
            message: error.message,
            name: error.name,
            stack: error.stack,
            timestamp: Date.now(),
            errorType: 'javascript',
        };
        // Try to extract location from stack
        if (error.stack) {
            const match = error.stack.match(/at\s+(?:.*?\s+)?(?:\()?([^:\s]+):(\d+):(\d+)/);
            if (match) {
                pageError.url = match[1];
                pageError.lineNumber = parseInt(match[2], 10);
                pageError.columnNumber = parseInt(match[3], 10);
            }
        }
        this.errors.push(pageError);
        if (this.options.debug) {
            console.log(`[ConsoleCollector] Error: ${error.message}`);
        }
    }
    /**
     * Map Playwright console type to our type
     */
    mapConsoleType(type) {
        const typeMap = {
            log: 'log',
            debug: 'debug',
            info: 'info',
            error: 'error',
            warning: 'warning',
            warn: 'warning',
            dir: 'dir',
            dirxml: 'dirxml',
            table: 'table',
            trace: 'trace',
            clear: 'clear',
            count: 'count',
            assert: 'assert',
            profile: 'profile',
            profileEnd: 'profileEnd',
            timeEnd: 'timeEnd',
        };
        return typeMap[type] || 'log';
    }
    /**
     * Detach from the page
     */
    async detach() {
        if (!this.attached) {
            return;
        }
        // Run cleanup functions
        for (const cleanup of this.cleanupFunctions) {
            try {
                cleanup();
            }
            catch {
                // Ignore cleanup errors
            }
        }
        this.cleanupFunctions = [];
        this.page = null;
        this.attached = false;
        if (this.options.debug) {
            console.log('[ConsoleCollector] Detached from page');
        }
    }
    /**
     * Collect all console messages and errors
     */
    async collect() {
        if (!this.page) {
            throw new errors_1.CollectorError('ConsoleCollector', 'Not attached to a page');
        }
        // Get any errors captured by the injected script
        try {
            const injectedErrors = await this.page.evaluate(() => {
                const capture = window.__AVT_ERROR_CAPTURE__;
                if (capture && typeof capture.getData === 'function') {
                    return capture.getData();
                }
                return { errors: [] };
            });
            // Merge with errors from Playwright listeners, deduplicating
            for (const error of injectedErrors.errors) {
                const exists = this.errors.some((e) => e.message === error.message && Math.abs(e.timestamp - error.timestamp) < 1000);
                if (!exists) {
                    this.errors.push(error);
                }
            }
        }
        catch {
            // Page may be closed or navigated away
        }
        // Sort by timestamp
        const sortedMessages = [...this.messages].sort((a, b) => a.timestamp - b.timestamp);
        const sortedErrors = [...this.errors].sort((a, b) => a.timestamp - b.timestamp);
        if (this.options.debug) {
            console.log(`[ConsoleCollector] Collected ${sortedMessages.length} messages`);
            console.log(`[ConsoleCollector] Collected ${sortedErrors.length} errors`);
        }
        return {
            messages: sortedMessages,
            errors: sortedErrors,
        };
    }
    /**
     * Get only console messages
     */
    async getMessages() {
        const data = await this.collect();
        return data.messages;
    }
    /**
     * Get only errors
     */
    async getErrors() {
        const data = await this.collect();
        return data.errors;
    }
    /**
     * Get messages of a specific type
     */
    async getMessagesByType(type) {
        const data = await this.collect();
        return data.messages.filter((m) => m.type === type);
    }
    /**
     * Get error messages only
     */
    async getErrorMessages() {
        return this.getMessagesByType('error');
    }
    /**
     * Get warning messages only
     */
    async getWarningMessages() {
        return this.getMessagesByType('warning');
    }
    /**
     * Check if any errors occurred
     */
    hasErrors() {
        return this.errors.length > 0 || this.messages.some((m) => m.type === 'error');
    }
    /**
     * Reset collector state
     */
    reset() {
        this.messages = [];
        this.errors = [];
    }
    /**
     * Check if collector is attached
     */
    isAttached() {
        return this.attached;
    }
    /**
     * Get count of messages
     */
    getMessageCount() {
        return this.messages.length;
    }
    /**
     * Get count of errors
     */
    getErrorCount() {
        return this.errors.length;
    }
    /**
     * Search messages for a pattern
     */
    async findMessages(pattern) {
        const data = await this.collect();
        const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
        return data.messages.filter((m) => regex.test(m.text));
    }
}
exports.ConsoleCollector = ConsoleCollector;
//# sourceMappingURL=ConsoleCollector.js.map