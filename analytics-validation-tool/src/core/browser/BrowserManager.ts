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

import { chromium, firefox, webkit, Browser, BrowserContext } from 'playwright';
import type {
  BrowserType,
  BrowserPoolConfig,
  ContextOptions,
  ManagedBrowser,
  ManagedContext,
  BrowserPoolStats,
  ContextLease,
} from './types';
import { BrowserError, BrowserPoolExhaustedError } from '../utils/errors';
import { generateId } from '../../types';

/**
 * Default pool configuration
 */
const DEFAULT_POOL_CONFIG: BrowserPoolConfig = {
  minBrowsers: 1,
  maxBrowsers: 5,
  maxContextsPerBrowser: 10,
  browserIdleTimeout: 60000, // 1 minute
  maxBrowserAge: 300000, // 5 minutes
  launchConfig: {
    browserType: 'chromium',
    headless: true,
    args: [
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-sandbox',
    ],
  },
};

/**
 * Browser Manager Class
 *
 * Manages browser lifecycle and provides context pooling for scans.
 */
export class BrowserManager {
  private readonly config: BrowserPoolConfig;
  private readonly browsers: Map<string, ManagedBrowser> = new Map();
  private readonly contexts: Map<string, ManagedContext> = new Map();
  private readonly waitQueue: Array<{
    resolve: (lease: ContextLease) => void;
    reject: (error: Error) => void;
    options: ContextOptions;
  }> = [];

  private cleanupInterval?: ReturnType<typeof setInterval>;
  private isShuttingDown = false;
  private initialized = false;

  constructor(config: Partial<BrowserPoolConfig> = {}) {
    this.config = {
      ...DEFAULT_POOL_CONFIG,
      ...config,
      launchConfig: {
        ...DEFAULT_POOL_CONFIG.launchConfig,
        ...config.launchConfig,
      },
    };
  }

  /**
   * Initialize the browser manager and warm up the pool
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Launch minimum number of browsers
    const launchPromises: Promise<ManagedBrowser>[] = [];
    for (let i = 0; i < this.config.minBrowsers; i++) {
      launchPromises.push(this.launchBrowser());
    }

    await Promise.all(launchPromises);

    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup().catch((err) => {
        console.error('Browser cleanup error:', err);
      });
    }, 30000); // Run cleanup every 30 seconds

    this.initialized = true;
  }

  /**
   * Launch a new browser instance
   */
  private async launchBrowser(): Promise<ManagedBrowser> {
    const { launchConfig } = this.config;
    const browserType = this.getBrowserType(launchConfig.browserType);

    const launchOptions = {
      headless: launchConfig.headless,
      args: launchConfig.args,
      executablePath: launchConfig.executablePath,
      proxy: launchConfig.proxy,
      slowMo: launchConfig.slowMo,
      downloadsPath: launchConfig.downloadsPath,
      timeout: launchConfig.timeout,
    };

    let browser: Browser;
    try {
      browser = await browserType.launch(launchOptions);
    } catch (error) {
      throw new BrowserError(
        `Failed to launch ${launchConfig.browserType} browser: ${error instanceof Error ? error.message : String(error)}`,
        { launchConfig }
      );
    }

    const managedBrowser: ManagedBrowser = {
      id: generateId(),
      browser,
      type: launchConfig.browserType,
      launchedAt: Date.now(),
      activeContexts: 0,
      maxContexts: this.config.maxContextsPerBrowser,
      isAvailable: true,
      isClosing: false,
      lastActivityAt: Date.now(),
    };

    // Handle browser disconnect
    browser.on('disconnected', () => {
      this.handleBrowserDisconnect(managedBrowser.id);
    });

    this.browsers.set(managedBrowser.id, managedBrowser);
    return managedBrowser;
  }

  /**
   * Get Playwright browser type launcher
   */
  private getBrowserType(type: BrowserType) {
    switch (type) {
      case 'chromium':
        return chromium;
      case 'firefox':
        return firefox;
      case 'webkit':
        return webkit;
      default:
        throw new BrowserError(`Unsupported browser type: ${type}`);
    }
  }

  /**
   * Handle browser disconnect event
   */
  private handleBrowserDisconnect(browserId: string): void {
    const browser = this.browsers.get(browserId);
    if (!browser) return;

    // Close all contexts associated with this browser
    for (const [contextId, context] of this.contexts) {
      if (context.browserId === browserId) {
        this.contexts.delete(contextId);
      }
    }

    this.browsers.delete(browserId);

    // If not shutting down and below minimum, launch a replacement
    if (!this.isShuttingDown && this.browsers.size < this.config.minBrowsers) {
      this.launchBrowser().catch((err) => {
        console.error('Failed to launch replacement browser:', err);
      });
    }
  }

  /**
   * Acquire a browser context lease
   */
  async acquireContext(options: ContextOptions = {}): Promise<ContextLease> {
    if (this.isShuttingDown) {
      throw new BrowserError('Browser manager is shutting down');
    }

    if (!this.initialized) {
      await this.initialize();
    }

    // Try to find an available browser
    let managedBrowser = this.findAvailableBrowser();

    // If no browser available, try to launch a new one
    if (!managedBrowser) {
      if (this.browsers.size < this.config.maxBrowsers) {
        managedBrowser = await this.launchBrowser();
      } else {
        // Queue the request
        return new Promise((resolve, reject) => {
          this.waitQueue.push({ resolve, reject, options });

          // Set a timeout for queued requests
          setTimeout(() => {
            const index = this.waitQueue.findIndex((w) => w.resolve === resolve);
            if (index !== -1) {
              this.waitQueue.splice(index, 1);
              reject(new BrowserPoolExhaustedError('Timed out waiting for available browser'));
            }
          }, 30000);
        });
      }
    }

    return this.createContext(managedBrowser, options);
  }

  /**
   * Find an available browser with capacity
   */
  private findAvailableBrowser(): ManagedBrowser | undefined {
    for (const browser of this.browsers.values()) {
      if (
        browser.isAvailable &&
        !browser.isClosing &&
        browser.activeContexts < browser.maxContexts
      ) {
        return browser;
      }
    }
    return undefined;
  }

  /**
   * Create a new context in a browser
   */
  private async createContext(
    managedBrowser: ManagedBrowser,
    options: ContextOptions
  ): Promise<ContextLease> {
    const contextOptions = {
      viewport: options.viewport ?? { width: 1920, height: 1080 },
      userAgent: options.userAgent,
      extraHTTPHeaders: options.extraHTTPHeaders,
      geolocation: options.geolocation,
      locale: options.locale,
      timezoneId: options.timezoneId,
      permissions: options.permissions,
      bypassCSP: options.bypassCSP,
      javaScriptEnabled: options.javaScriptEnabled ?? true,
      httpCredentials: options.httpCredentials,
      ignoreHTTPSErrors: options.ignoreHTTPSErrors ?? true,
      offline: options.offline,
      colorScheme: options.colorScheme,
      reducedMotion: options.reducedMotion,
      acceptDownloads: options.acceptDownloads,
      deviceScaleFactor: options.deviceScaleFactor,
      hasTouch: options.hasTouch,
      isMobile: options.isMobile,
    };

    let context: BrowserContext;
    try {
      context = await managedBrowser.browser.newContext(contextOptions);
    } catch (error) {
      throw new BrowserError(
        `Failed to create browser context: ${error instanceof Error ? error.message : String(error)}`,
        { browserId: managedBrowser.id, options }
      );
    }

    const managedContext: ManagedContext = {
      id: generateId(),
      context,
      browserId: managedBrowser.id,
      createdAt: Date.now(),
      activePages: 0,
      isClosing: false,
    };

    this.contexts.set(managedContext.id, managedContext);
    managedBrowser.activeContexts++;
    managedBrowser.lastActivityAt = Date.now();

    // Update availability
    if (managedBrowser.activeContexts >= managedBrowser.maxContexts) {
      managedBrowser.isAvailable = false;
    }

    // Create and return the lease
    const lease: ContextLease = {
      context,
      contextId: managedContext.id,
      browserId: managedBrowser.id,
      release: () => this.releaseContext(managedContext.id),
    };

    return lease;
  }

  /**
   * Release a context back to the pool
   */
  async releaseContext(contextId: string): Promise<void> {
    const managedContext = this.contexts.get(contextId);
    if (!managedContext || managedContext.isClosing) {
      return;
    }

    managedContext.isClosing = true;

    try {
      await managedContext.context.close();
    } catch (error) {
      // Context may already be closed
    }

    this.contexts.delete(contextId);

    const managedBrowser = this.browsers.get(managedContext.browserId);
    if (managedBrowser) {
      managedBrowser.activeContexts--;
      managedBrowser.lastActivityAt = Date.now();
      managedBrowser.isAvailable = true;

      // Process waiting queue
      this.processWaitQueue();
    }
  }

  /**
   * Process the wait queue when a context becomes available
   */
  private processWaitQueue(): void {
    if (this.waitQueue.length === 0) return;

    const managedBrowser = this.findAvailableBrowser();
    if (!managedBrowser) return;

    const waiter = this.waitQueue.shift();
    if (!waiter) return;

    this.createContext(managedBrowser, waiter.options)
      .then(waiter.resolve)
      .catch(waiter.reject);
  }

  /**
   * Cleanup idle browsers and old browsers
   */
  private async cleanup(): Promise<void> {
    const now = Date.now();
    const browsersToClose: string[] = [];

    for (const [id, browser] of this.browsers) {
      // Skip if browser has active contexts
      if (browser.activeContexts > 0) {
        continue;
      }

      // Check idle timeout
      const idleTime = now - browser.lastActivityAt;
      if (idleTime > this.config.browserIdleTimeout) {
        // Keep minimum browsers
        if (this.browsers.size > this.config.minBrowsers) {
          browsersToClose.push(id);
          continue;
        }
      }

      // Check max age
      const age = now - browser.launchedAt;
      if (age > this.config.maxBrowserAge) {
        // Recycle old browsers, but maintain minimum
        if (this.browsers.size > this.config.minBrowsers) {
          browsersToClose.push(id);
        }
      }
    }

    // Close identified browsers
    for (const id of browsersToClose) {
      await this.closeBrowser(id);
    }
  }

  /**
   * Close a specific browser
   */
  private async closeBrowser(browserId: string): Promise<void> {
    const managedBrowser = this.browsers.get(browserId);
    if (!managedBrowser || managedBrowser.isClosing) {
      return;
    }

    managedBrowser.isClosing = true;
    managedBrowser.isAvailable = false;

    // Close all contexts first
    const contextCloses: Promise<void>[] = [];
    for (const [contextId, context] of this.contexts) {
      if (context.browserId === browserId) {
        contextCloses.push(this.releaseContext(contextId));
      }
    }
    await Promise.all(contextCloses);

    try {
      await managedBrowser.browser.close();
    } catch (error) {
      // Browser may already be closed
    }

    this.browsers.delete(browserId);
  }

  /**
   * Get pool statistics
   */
  getStats(): BrowserPoolStats {
    let totalContexts = 0;
    let totalAge = 0;
    let availableCount = 0;

    for (const browser of this.browsers.values()) {
      totalContexts += browser.activeContexts;
      totalAge += Date.now() - browser.launchedAt;
      if (browser.isAvailable && !browser.isClosing) {
        availableCount++;
      }
    }

    const totalBrowsers = this.browsers.size;
    const maxCapacity = this.config.maxBrowsers * this.config.maxContextsPerBrowser;
    const utilization = maxCapacity > 0 ? (totalContexts / maxCapacity) * 100 : 0;

    return {
      totalBrowsers,
      availableBrowsers: availableCount,
      totalContexts,
      queuedRequests: this.waitQueue.length,
      averageBrowserAge: totalBrowsers > 0 ? totalAge / totalBrowsers : 0,
      utilization: Math.round(utilization * 100) / 100,
    };
  }

  /**
   * Check if the manager is healthy
   */
  isHealthy(): boolean {
    if (this.isShuttingDown) return false;
    if (!this.initialized) return false;
    if (this.browsers.size === 0) return false;

    // Check if at least one browser is responsive
    for (const browser of this.browsers.values()) {
      if (!browser.isClosing && browser.browser.isConnected()) {
        return true;
      }
    }

    return false;
  }

  /**
   * Shutdown the browser manager gracefully
   */
  async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;

    // Stop cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Reject all waiting requests
    for (const waiter of this.waitQueue) {
      waiter.reject(new BrowserError('Browser manager is shutting down'));
    }
    this.waitQueue.length = 0;

    // Close all browsers
    const closePromises: Promise<void>[] = [];
    for (const [id] of this.browsers) {
      closePromises.push(this.closeBrowser(id));
    }

    await Promise.all(closePromises);
    this.initialized = false;
  }
}

/**
 * Singleton instance for convenience
 * (Use custom instance for different configurations)
 */
let defaultManager: BrowserManager | undefined;

export function getDefaultBrowserManager(): BrowserManager {
  if (!defaultManager) {
    defaultManager = new BrowserManager();
  }
  return defaultManager;
}

export async function shutdownDefaultBrowserManager(): Promise<void> {
  if (defaultManager) {
    await defaultManager.shutdown();
    defaultManager = undefined;
  }
}
