/**
 * Browser Manager
 *
 * Manages a pool of browser instances for efficient scanning.
 * Features:
 * - Browser instance pooling
 * - Context isolation
 * - Automatic cleanup of idle browsers
 * - Graceful shutdown
 */
import type { BrowserPoolConfig, ContextOptions, BrowserPoolStats, ContextLease } from './types';
/**
 * Browser Manager Class
 *
 * Manages browser lifecycle and provides context pooling for scans.
 */
export declare class BrowserManager {
    private readonly config;
    private readonly browsers;
    private readonly contexts;
    private readonly waitQueue;
    private cleanupInterval?;
    private isShuttingDown;
    private initialized;
    constructor(config?: Partial<BrowserPoolConfig>);
    /**
     * Initialize the browser manager and warm up the pool
     */
    initialize(): Promise<void>;
    /**
     * Launch a new browser instance
     */
    private launchBrowser;
    /**
     * Get Playwright browser type launcher
     */
    private getBrowserType;
    /**
     * Handle browser disconnect event
     */
    private handleBrowserDisconnect;
    /**
     * Acquire a browser context lease
     */
    acquireContext(options?: ContextOptions): Promise<ContextLease>;
    /**
     * Find an available browser with capacity
     */
    private findAvailableBrowser;
    /**
     * Create a new context in a browser
     */
    private createContext;
    /**
     * Release a context back to the pool
     */
    releaseContext(contextId: string): Promise<void>;
    /**
     * Process the wait queue when a context becomes available
     */
    private processWaitQueue;
    /**
     * Cleanup idle browsers and old browsers
     */
    private cleanup;
    /**
     * Close a specific browser
     */
    private closeBrowser;
    /**
     * Get pool statistics
     */
    getStats(): BrowserPoolStats;
    /**
     * Check if the manager is healthy
     */
    isHealthy(): boolean;
    /**
     * Shutdown the browser manager gracefully
     */
    shutdown(): Promise<void>;
}
export declare function getDefaultBrowserManager(): BrowserManager;
export declare function shutdownDefaultBrowserManager(): Promise<void>;
//# sourceMappingURL=BrowserManager.d.ts.map