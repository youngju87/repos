/**
 * Browser-related type definitions
 */

import type { Browser, BrowserContext } from 'playwright';

/**
 * Supported browser types
 */
export type BrowserType = 'chromium' | 'firefox' | 'webkit';

/**
 * Browser instance wrapper with metadata
 */
export interface ManagedBrowser {
  /** Unique identifier for this browser instance */
  id: string;

  /** The underlying Playwright browser instance */
  browser: Browser;

  /** Browser type */
  type: BrowserType;

  /** When this browser was launched */
  launchedAt: number;

  /** Number of active contexts */
  activeContexts: number;

  /** Maximum contexts allowed */
  maxContexts: number;

  /** Whether this browser is available for new contexts */
  isAvailable: boolean;

  /** Whether this browser is being closed */
  isClosing: boolean;

  /** Last activity timestamp */
  lastActivityAt: number;
}

/**
 * Browser context wrapper with metadata
 */
export interface ManagedContext {
  /** Unique identifier for this context */
  id: string;

  /** The underlying Playwright browser context */
  context: BrowserContext;

  /** ID of the parent browser */
  browserId: string;

  /** When this context was created */
  createdAt: number;

  /** Number of active pages */
  activePages: number;

  /** Whether this context is being closed */
  isClosing: boolean;
}

/**
 * Browser launch configuration
 */
export interface BrowserLaunchConfig {
  /** Browser type to use */
  browserType: BrowserType;

  /** Whether to run headless */
  headless: boolean;

  /** Additional browser launch arguments */
  args?: string[];

  /** Path to browser executable */
  executablePath?: string;

  /** Proxy configuration for all requests */
  proxy?: {
    server: string;
    username?: string;
    password?: string;
    /** Comma-separated list of hosts to bypass proxy */
    bypass?: string;
  };

  /** Slow down operations by specified ms (for debugging) */
  slowMo?: number;

  /** Downloads directory path */
  downloadsPath?: string;

  /** Whether to ignore HTTPS errors */
  ignoreHTTPSErrors?: boolean;

  /** Browser timeout in ms */
  timeout?: number;
}

/**
 * Browser pool configuration
 */
export interface BrowserPoolConfig {
  /** Minimum number of browsers to keep warm */
  minBrowsers: number;

  /** Maximum number of browsers allowed */
  maxBrowsers: number;

  /** Maximum contexts per browser */
  maxContextsPerBrowser: number;

  /** Idle timeout before closing unused browsers (ms) */
  browserIdleTimeout: number;

  /** Maximum browser age before recycling (ms) */
  maxBrowserAge: number;

  /** Launch configuration for browsers */
  launchConfig: BrowserLaunchConfig;
}

/**
 * Context creation options
 */
export interface ContextOptions {
  /** Viewport configuration */
  viewport?: {
    width: number;
    height: number;
  };

  /** User agent override */
  userAgent?: string;

  /** Extra HTTP headers */
  extraHTTPHeaders?: Record<string, string>;

  /** Geographic location */
  geolocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };

  /** Locale (e.g., 'en-US') */
  locale?: string;

  /** Timezone ID (e.g., 'America/New_York') */
  timezoneId?: string;

  /** Permissions to grant (e.g., ['geolocation']) */
  permissions?: string[];

  /** Whether to bypass CSP */
  bypassCSP?: boolean;

  /** Whether JavaScript is enabled */
  javaScriptEnabled?: boolean;

  /** HTTP credentials for authentication */
  httpCredentials?: {
    username: string;
    password: string;
  };

  /** Whether to ignore HTTPS errors */
  ignoreHTTPSErrors?: boolean;

  /** Offline mode */
  offline?: boolean;

  /** Color scheme preference */
  colorScheme?: 'light' | 'dark' | 'no-preference';

  /** Reduced motion preference */
  reducedMotion?: 'reduce' | 'no-preference';

  /** Accept downloads */
  acceptDownloads?: boolean;

  /** Device scale factor */
  deviceScaleFactor?: number;

  /** Whether the viewport supports touch */
  hasTouch?: boolean;

  /** Whether the viewport is mobile */
  isMobile?: boolean;
}

/**
 * Browser pool statistics
 */
export interface BrowserPoolStats {
  /** Total browsers in pool */
  totalBrowsers: number;

  /** Browsers currently available */
  availableBrowsers: number;

  /** Total active contexts across all browsers */
  totalContexts: number;

  /** Number of requests waiting for a browser */
  queuedRequests: number;

  /** Average browser age in ms */
  averageBrowserAge: number;

  /** Pool utilization percentage */
  utilization: number;
}

/**
 * Lease for a browser context
 */
export interface ContextLease {
  /** Leased context */
  context: BrowserContext;

  /** Context ID */
  contextId: string;

  /** Browser ID */
  browserId: string;

  /** Release the context back to the pool */
  release: () => Promise<void>;
}
