/**
 * Analytics Validation Tool - Core Type Definitions
 *
 * These types define the data structures used throughout the scanning layer.
 * They are designed to be:
 * - JSON-serializable for storage and transmission
 * - Platform-agnostic (no GA4/Adobe-specific assumptions)
 * - Comprehensive enough for downstream validation
 */

// =============================================================================
// NETWORK TYPES
// =============================================================================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export type ResourceType =
  | 'document'
  | 'stylesheet'
  | 'image'
  | 'media'
  | 'font'
  | 'script'
  | 'texttrack'
  | 'xhr'
  | 'fetch'
  | 'eventsource'
  | 'websocket'
  | 'manifest'
  | 'other'
  | 'beacon'
  | 'ping';

export interface NetworkRequest {
  /** Unique identifier for this request */
  id: string;

  /** Full request URL */
  url: string;

  /** HTTP method */
  method: HttpMethod;

  /** Resource type as determined by the browser */
  resourceType: ResourceType;

  /** Request headers */
  requestHeaders: Record<string, string>;

  /** Request body (if present and capturable) */
  requestBody?: string;

  /** Parsed request body for form data or JSON */
  requestBodyParsed?: Record<string, unknown>;

  /** URL query parameters parsed */
  queryParams?: Record<string, string>;

  /** Response HTTP status code */
  status?: number;

  /** Response status text */
  statusText?: string;

  /** Response headers */
  responseHeaders?: Record<string, string>;

  /** Response body (may be truncated for large responses) */
  responseBody?: string;

  /** Whether response body was truncated */
  responseBodyTruncated?: boolean;

  /** Timestamp when request was initiated (epoch ms) */
  initiatedAt: number;

  /** Timestamp when response headers were received */
  responseReceivedAt?: number;

  /** Timestamp when request completed */
  completedAt?: number;

  /** Request duration in milliseconds */
  duration?: number;

  /** Information about what initiated this request */
  initiator: RequestInitiator;

  /** Whether the request failed */
  failed: boolean;

  /** Failure reason if failed */
  failureReason?: string;

  /** Whether response was served from cache */
  fromCache: boolean;

  /** Whether this appears to be an analytics/tracking request */
  isAnalyticsRequest?: boolean;

  /** Redirect chain URLs if redirected */
  redirectChain?: string[];

  /** Frame ID where request originated */
  frameId?: string;

  /** Whether this is from the main frame */
  isMainFrame: boolean;
}

export interface RequestInitiator {
  /** Type of initiator */
  type: 'parser' | 'script' | 'preload' | 'SignedExchange' | 'preflight' | 'other';

  /** URL of the initiating script (if applicable) */
  url?: string;

  /** Line number in initiating script */
  lineNumber?: number;

  /** Column number in initiating script */
  columnNumber?: number;

  /** Stack trace if available */
  stack?: string;
}

// =============================================================================
// SCRIPT TYPES
// =============================================================================

export interface ScriptTag {
  /** Unique identifier for this script */
  id: string;

  /** Script source URL (empty for inline) */
  src?: string;

  /** Whether this is an inline script */
  isInline: boolean;

  /** Inline script content (truncated if very large) */
  content?: string;

  /** Whether content was truncated */
  contentTruncated?: boolean;

  /** Script type attribute */
  type?: string;

  /** Whether async attribute is present */
  async: boolean;

  /** Whether defer attribute is present */
  defer: boolean;

  /** Whether nomodule attribute is present */
  noModule: boolean;

  /** Crossorigin attribute value */
  crossOrigin?: string;

  /** Integrity hash if present */
  integrity?: string;

  /** Position in document order */
  documentOrder: number;

  /** Whether script is in <head> */
  inHead: boolean;

  /** Whether script was dynamically injected */
  dynamicallyInjected: boolean;

  /** Timestamp when script was detected */
  detectedAt: number;

  /** Timestamp when script load completed (external only) */
  loadedAt?: number;

  /** Whether script failed to load */
  loadFailed?: boolean;

  /** Error message if load failed */
  loadError?: string;

  /** Data attributes on the script tag */
  dataAttributes: Record<string, string>;

  /** ID attribute if present */
  elementId?: string;

  /** Class attribute if present */
  className?: string;
}

// =============================================================================
// DATA LAYER TYPES
// =============================================================================

export interface DataLayerEvent {
  /** Unique identifier for this event */
  id: string;

  /** Name of the data layer (e.g., 'dataLayer', 'digitalData') */
  dataLayerName: string;

  /** The data that was pushed */
  data: unknown;

  /** Timestamp when push occurred */
  timestamp: number;

  /** Whether this was from initial page state or a push */
  source: 'initial' | 'push';

  /** Index in the data layer array */
  index: number;

  /** Stack trace of the push call (if available) */
  stackTrace?: string;
}

export interface DataLayerSnapshot {
  /** Name of the data layer */
  name: string;

  /** Full contents of the data layer at snapshot time */
  contents: unknown[];

  /** Timestamp of snapshot */
  timestamp: number;

  /** When this snapshot was taken */
  phase: 'initial' | 'dom-ready' | 'load' | 'final';
}

// =============================================================================
// CONSOLE & ERROR TYPES
// =============================================================================

export type ConsoleMessageType =
  | 'log'
  | 'debug'
  | 'info'
  | 'error'
  | 'warning'
  | 'dir'
  | 'dirxml'
  | 'table'
  | 'trace'
  | 'clear'
  | 'count'
  | 'assert'
  | 'profile'
  | 'profileEnd'
  | 'timeEnd';

export interface ConsoleMessage {
  /** Message type */
  type: ConsoleMessageType;

  /** Message text */
  text: string;

  /** Message arguments (serialized) */
  args?: unknown[];

  /** Source URL */
  url?: string;

  /** Line number */
  lineNumber?: number;

  /** Column number */
  columnNumber?: number;

  /** Timestamp */
  timestamp: number;
}

export interface PageError {
  /** Error message */
  message: string;

  /** Error name/type */
  name?: string;

  /** Stack trace */
  stack?: string;

  /** Source URL */
  url?: string;

  /** Line number */
  lineNumber?: number;

  /** Column number */
  columnNumber?: number;

  /** Timestamp */
  timestamp: number;

  /** Error type classification */
  errorType: 'javascript' | 'network' | 'resource' | 'security' | 'other';
}

// =============================================================================
// TIMING TYPES
// =============================================================================

export interface PageTimings {
  /** Navigation start timestamp */
  navigationStart: number;

  /** DOM content loaded timestamp */
  domContentLoaded?: number;

  /** Load event timestamp */
  loadEvent?: number;

  /** First paint timestamp */
  firstPaint?: number;

  /** First contentful paint timestamp */
  firstContentfulPaint?: number;

  /** Time to first byte */
  ttfb?: number;

  /** Total scan duration */
  scanDuration: number;
}

// =============================================================================
// SCAN CONFIGURATION TYPES
// =============================================================================

export interface Viewport {
  width: number;
  height: number;
  deviceScaleFactor?: number;
  isMobile?: boolean;
  hasTouch?: boolean;
}

export interface DeviceProfile {
  name: string;
  viewport: Viewport;
  userAgent: string;
}

export type WaitUntilOption = 'load' | 'domcontentloaded' | 'networkidle' | 'commit';

export interface ScanOptions {
  /** Viewport configuration */
  viewport?: Viewport;

  /** User agent string override */
  userAgent?: string;

  /** Device profile to emulate */
  device?: DeviceProfile;

  /** Cookies to set before navigation */
  cookies?: Cookie[];

  /** Extra HTTP headers to send */
  extraHeaders?: Record<string, string>;

  /** When to consider navigation complete */
  waitUntil?: WaitUntilOption;

  /** Additional wait time after initial load (ms) */
  additionalWaitTime?: number;

  /** Wait for specific selector to appear */
  waitForSelector?: string;

  /** Maximum time to wait for page load (ms) */
  timeout?: number;

  /** Whether to capture response bodies */
  captureResponseBodies?: boolean;

  /** Maximum response body size to capture (bytes) */
  maxResponseBodySize?: number;

  /** Data layer names to observe */
  dataLayerNames?: string[];

  /** Whether to capture screenshots */
  captureScreenshot?: boolean;

  /** JavaScript to execute before page load */
  injectScriptBefore?: string;

  /** JavaScript to execute after page load */
  injectScriptAfter?: string;

  /** Proxy configuration */
  proxy?: ProxyConfig;

  /** Whether to block certain resource types */
  blockResourceTypes?: ResourceType[];

  /** URL patterns to block */
  blockUrlPatterns?: string[];

  /** Geographic location to emulate */
  geolocation?: { latitude: number; longitude: number };

  /** Timezone to emulate */
  timezone?: string;

  /** Locale to emulate */
  locale?: string;

  /** Whether to enable JavaScript */
  javaScriptEnabled?: boolean;

  /** HTTP authentication credentials */
  httpAuth?: { username: string; password: string };
}

export interface Cookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export interface ProxyConfig {
  server: string;
  username?: string;
  password?: string;
  bypass?: string[];
}

// =============================================================================
// SCAN RESULT TYPES
// =============================================================================

export interface PageScanResult {
  /** Unique scan identifier */
  id: string;

  /** Original URL requested */
  url: string;

  /** Final URL after redirects */
  finalUrl: string;

  /** Whether the scan completed successfully */
  success: boolean;

  /** Error message if scan failed */
  error?: string;

  /** Scan start timestamp */
  startedAt: number;

  /** Scan completion timestamp */
  completedAt: number;

  /** Page timing metrics */
  timings: PageTimings;

  /** HTTP status of the main document */
  httpStatus?: number;

  /** Page title */
  pageTitle?: string;

  /** Meta tags from the page */
  metaTags?: Record<string, string>;

  /** All captured network requests */
  networkRequests: NetworkRequest[];

  /** All detected script tags */
  scripts: ScriptTag[];

  /** Data layer events captured */
  dataLayerEvents: DataLayerEvent[];

  /** Data layer snapshots at various phases */
  dataLayerSnapshots: DataLayerSnapshot[];

  /** Console messages */
  consoleMessages: ConsoleMessage[];

  /** Page errors */
  errors: PageError[];

  /** Cookies at end of scan */
  cookies: Cookie[];

  /** Local storage contents (if captured) */
  localStorage?: Record<string, string>;

  /** Session storage contents (if captured) */
  sessionStorage?: Record<string, string>;

  /** Screenshot (base64 encoded, if captured) */
  screenshot?: string;

  /** Scan configuration used */
  config: ScanOptions;

  /** Summary statistics */
  summary: ScanSummary;
}

export interface ScanSummary {
  /** Total number of network requests */
  totalRequests: number;

  /** Number of failed requests */
  failedRequests: number;

  /** Number of requests that appear to be analytics */
  analyticsRequests: number;

  /** Total number of scripts */
  totalScripts: number;

  /** Number of external scripts */
  externalScripts: number;

  /** Number of inline scripts */
  inlineScripts: number;

  /** Number of dynamically injected scripts */
  dynamicScripts: number;

  /** Number of data layer pushes */
  dataLayerPushes: number;

  /** Number of console errors */
  consoleErrors: number;

  /** Number of page errors */
  pageErrors: number;

  /** Total page weight in bytes */
  totalPageWeight: number;
}

// =============================================================================
// BROWSER MANAGEMENT TYPES
// =============================================================================

export interface BrowserConfig {
  /** Browser type to use */
  browserType: 'chromium' | 'firefox' | 'webkit';

  /** Whether to run headless */
  headless: boolean;

  /** Browser launch arguments */
  args?: string[];

  /** Path to browser executable */
  executablePath?: string;

  /** Download path for browser */
  downloadsPath?: string;

  /** Proxy for all requests */
  proxy?: ProxyConfig;

  /** Slow down operations by specified ms */
  slowMo?: number;

  /** Maximum number of browser instances in pool */
  poolSize?: number;

  /** Maximum contexts per browser */
  maxContextsPerBrowser?: number;

  /** Browser instance timeout (ms) */
  browserTimeout?: number;
}

export interface BrowserPoolStats {
  /** Total browsers in pool */
  totalBrowsers: number;

  /** Currently active browsers */
  activeBrowsers: number;

  /** Available browsers */
  availableBrowsers: number;

  /** Total contexts in use */
  totalContexts: number;

  /** Queued scan requests */
  queuedRequests: number;
}

// =============================================================================
// COLLECTOR INTERFACES
// =============================================================================

export interface Collector<T> {
  /** Attach collector to a page */
  attach(page: unknown): Promise<void>;

  /** Detach collector from page */
  detach(): Promise<void>;

  /** Collect and return gathered data */
  collect(): Promise<T>;

  /** Reset collector state */
  reset(): void;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface Timestamped {
  timestamp: number;
}

/** Generate a unique ID */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
