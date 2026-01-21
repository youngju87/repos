/**
 * Console Collector
 *
 * Captures console messages and page errors during execution.
 * Useful for:
 * - Detecting JavaScript errors
 * - Capturing analytics debug output
 * - Identifying page issues
 */
import type { Page } from 'playwright';
import type { Collector, ConsoleCollectorOptions } from './types';
import type { ConsoleMessage, ConsoleMessageType, PageError } from '../../types';
/**
 * Collected console and error data
 */
export interface ConsoleData {
    messages: ConsoleMessage[];
    errors: PageError[];
}
/**
 * Console Collector Class
 */
export declare class ConsoleCollector implements Collector<ConsoleData> {
    private page;
    private options;
    private attached;
    private messages;
    private errors;
    private cleanupFunctions;
    private injectionScript;
    constructor(options?: ConsoleCollectorOptions);
    /**
     * Attach to a page and start collecting
     */
    attach(page: Page): Promise<void>;
    /**
     * Handle a console message from Playwright
     */
    private handleConsoleMessage;
    /**
     * Handle a page error from Playwright
     */
    private handlePageError;
    /**
     * Map Playwright console type to our type
     */
    private mapConsoleType;
    /**
     * Detach from the page
     */
    detach(): Promise<void>;
    /**
     * Collect all console messages and errors
     */
    collect(): Promise<ConsoleData>;
    /**
     * Get only console messages
     */
    getMessages(): Promise<ConsoleMessage[]>;
    /**
     * Get only errors
     */
    getErrors(): Promise<PageError[]>;
    /**
     * Get messages of a specific type
     */
    getMessagesByType(type: ConsoleMessageType): Promise<ConsoleMessage[]>;
    /**
     * Get error messages only
     */
    getErrorMessages(): Promise<ConsoleMessage[]>;
    /**
     * Get warning messages only
     */
    getWarningMessages(): Promise<ConsoleMessage[]>;
    /**
     * Check if any errors occurred
     */
    hasErrors(): boolean;
    /**
     * Reset collector state
     */
    reset(): void;
    /**
     * Check if collector is attached
     */
    isAttached(): boolean;
    /**
     * Get count of messages
     */
    getMessageCount(): number;
    /**
     * Get count of errors
     */
    getErrorCount(): number;
    /**
     * Search messages for a pattern
     */
    findMessages(pattern: string | RegExp): Promise<ConsoleMessage[]>;
}
//# sourceMappingURL=ConsoleCollector.d.ts.map