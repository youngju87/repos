/**
 * Core Module Exports
 *
 * This module provides the core scanning functionality:
 * - Browser management and pooling
 * - Page scanning
 * - Network, script, data layer, and console collection
 */

// Browser management
export {
  BrowserManager,
  getDefaultBrowserManager,
  shutdownDefaultBrowserManager,
} from './browser';
export type {
  BrowserType,
  BrowserPoolConfig,
  BrowserLaunchConfig,
  ContextOptions,
  BrowserPoolStats,
  ContextLease,
} from './browser';

// Scanning
export {
  PageScanner,
  createScanner,
  scanUrl,
  scanUrls,
  DEFAULT_SCAN_OPTIONS,
  DEFAULT_VIEWPORT,
  MOBILE_VIEWPORT,
  TABLET_VIEWPORT,
  DEVICE_PROFILES,
  mergeOptions,
  validateOptions,
  createDeviceOptions,
  createMobileOptions,
  createDesktopOptions,
} from './scanner';

// Collectors
export {
  NetworkCollector,
  ScriptCollector,
  DataLayerCollector,
  ConsoleCollector,
} from './collectors';
export type {
  Collector,
  CollectorOptions,
  NetworkCollectorOptions,
  ScriptCollectorOptions,
  DataLayerCollectorOptions,
  ConsoleCollectorOptions,
  ConsoleData,
} from './collectors';

// Utilities
export {
  AVTError,
  BrowserError,
  NavigationError,
  TimeoutError,
  CollectorError,
  isAVTError,
  wrapError,
  delay,
  Timer,
  withTimeout,
  safeStringify,
  parseQueryString,
  parseUrl,
  matchUrlPattern,
} from './utils';

// Injection scripts (for advanced use cases)
export {
  generateDataLayerObserverScript,
  generateScriptObserverScript,
  generateErrorCaptureScript,
  DEFAULT_DATA_LAYER_NAMES,
} from './injection';
