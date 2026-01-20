/**
 * Console Collector
 *
 * Captures console messages and page errors during execution.
 * Useful for:
 * - Detecting JavaScript errors
 * - Capturing analytics debug output
 * - Identifying page issues
 */

import type { Page, ConsoleMessage as PlaywrightConsoleMessage } from 'playwright';
import type { Collector, ConsoleCollectorOptions, Unsubscribe } from './types';
import type { ConsoleMessage, ConsoleMessageType, PageError } from '../../types';
import { CollectorError } from '../utils/errors';
import { generateErrorCaptureScript } from '../injection/errorCapture';
import { truncate } from '../utils/serialization';

/**
 * Default options for console collector
 */
const DEFAULT_OPTIONS: Required<ConsoleCollectorOptions> = {
  debug: false,
  captureTypes: ['log', 'debug', 'info', 'warn', 'error', 'warning', 'trace'],
  maxMessages: 1000,
  maxMessageLength: 10000,
};

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
export class ConsoleCollector implements Collector<ConsoleData> {
  private page: Page | null = null;
  private options: Required<ConsoleCollectorOptions>;
  private attached = false;
  private messages: ConsoleMessage[] = [];
  private errors: PageError[] = [];
  private cleanupFunctions: Unsubscribe[] = [];
  private injectionScript: string;

  constructor(options: ConsoleCollectorOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.injectionScript = generateErrorCaptureScript();
  }

  /**
   * Attach to a page and start collecting
   */
  async attach(page: Page): Promise<void> {
    if (this.attached) {
      throw new CollectorError('ConsoleCollector', 'Already attached to a page');
    }

    this.page = page;
    this.reset();

    try {
      // Add error capture script for uncaught errors
      await page.addInitScript(this.injectionScript);

      // Set up console message listener
      const onConsole = (msg: PlaywrightConsoleMessage) => {
        this.handleConsoleMessage(msg);
      };

      // Set up page error listener
      const onPageError = (error: Error) => {
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
    } catch (error) {
      throw new CollectorError(
        'ConsoleCollector',
        `Failed to attach: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Handle a console message from Playwright
   */
  private handleConsoleMessage(msg: PlaywrightConsoleMessage): void {
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
      text = truncate(text, this.options.maxMessageLength);
    }

    // Try to get arguments (may fail for some message types)
    let args: unknown[] | undefined;
    try {
      // Note: This is synchronous and may not resolve all argument values
      args = undefined; // Playwright doesn't easily expose serialized args
    } catch {
      args = undefined;
    }

    const message: ConsoleMessage = {
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
  private handlePageError(error: Error): void {
    const pageError: PageError = {
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
  private mapConsoleType(type: string): ConsoleMessageType {
    const typeMap: Record<string, ConsoleMessageType> = {
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
  async detach(): Promise<void> {
    if (!this.attached) {
      return;
    }

    // Run cleanup functions
    for (const cleanup of this.cleanupFunctions) {
      try {
        cleanup();
      } catch {
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
  async collect(): Promise<ConsoleData> {
    if (!this.page) {
      throw new CollectorError('ConsoleCollector', 'Not attached to a page');
    }

    // Get any errors captured by the injected script
    try {
      const injectedErrors = await this.page.evaluate(() => {
        const capture = (window as unknown as {
          __AVT_ERROR_CAPTURE__?: {
            getData: () => { errors: PageError[] };
          };
        }).__AVT_ERROR_CAPTURE__;

        if (capture && typeof capture.getData === 'function') {
          return capture.getData();
        }

        return { errors: [] };
      });

      // Merge with errors from Playwright listeners, deduplicating
      for (const error of injectedErrors.errors) {
        const exists = this.errors.some(
          (e) => e.message === error.message && Math.abs(e.timestamp - error.timestamp) < 1000
        );
        if (!exists) {
          this.errors.push(error);
        }
      }
    } catch {
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
  async getMessages(): Promise<ConsoleMessage[]> {
    const data = await this.collect();
    return data.messages;
  }

  /**
   * Get only errors
   */
  async getErrors(): Promise<PageError[]> {
    const data = await this.collect();
    return data.errors;
  }

  /**
   * Get messages of a specific type
   */
  async getMessagesByType(type: ConsoleMessageType): Promise<ConsoleMessage[]> {
    const data = await this.collect();
    return data.messages.filter((m) => m.type === type);
  }

  /**
   * Get error messages only
   */
  async getErrorMessages(): Promise<ConsoleMessage[]> {
    return this.getMessagesByType('error');
  }

  /**
   * Get warning messages only
   */
  async getWarningMessages(): Promise<ConsoleMessage[]> {
    return this.getMessagesByType('warning');
  }

  /**
   * Check if any errors occurred
   */
  hasErrors(): boolean {
    return this.errors.length > 0 || this.messages.some((m) => m.type === 'error');
  }

  /**
   * Reset collector state
   */
  reset(): void {
    this.messages = [];
    this.errors = [];
  }

  /**
   * Check if collector is attached
   */
  isAttached(): boolean {
    return this.attached;
  }

  /**
   * Get count of messages
   */
  getMessageCount(): number {
    return this.messages.length;
  }

  /**
   * Get count of errors
   */
  getErrorCount(): number {
    return this.errors.length;
  }

  /**
   * Search messages for a pattern
   */
  async findMessages(pattern: string | RegExp): Promise<ConsoleMessage[]> {
    const data = await this.collect();
    const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
    return data.messages.filter((m) => regex.test(m.text));
  }
}
