/**
 * Core Module Exports
 *
 * This module provides the core scanning functionality:
 * - Browser management and pooling
 * - Page scanning
 * - Network, script, data layer, and console collection
 */
export type { PageScanResult, ScanOptions, NetworkRequest, ScriptTag, DataLayerEvent, ConsoleMessage, PageError, Cookie, ScanSummary, PageTimings, } from '../types';
export { BrowserManager, getDefaultBrowserManager, shutdownDefaultBrowserManager, } from './browser';
export type { BrowserType, BrowserPoolConfig, BrowserLaunchConfig, ContextOptions, BrowserPoolStats, ContextLease, } from './browser';
export { PageScanner, createScanner, scanUrl, scanUrls, DEFAULT_SCAN_OPTIONS, DEFAULT_VIEWPORT, MOBILE_VIEWPORT, TABLET_VIEWPORT, DEVICE_PROFILES, mergeOptions, validateOptions, createDeviceOptions, createMobileOptions, createDesktopOptions, } from './scanner';
export { NetworkCollector, ScriptCollector, DataLayerCollector, ConsoleCollector, BaseCollector, } from './collectors';
export type { Collector, CollectorOptions, NetworkCollectorOptions, ScriptCollectorOptions, DataLayerCollectorOptions, ConsoleCollectorOptions, ConsoleData, BaseCollectorOptions, CollectorState, } from './collectors';
export { AVTError, BrowserError, NavigationError, TimeoutError, CollectorError, isAVTError, wrapError, delay, Timer, withTimeout, safeStringify, parseQueryString, parseUrl, matchUrlPattern, getLogger, setGlobalLogger, ConsoleLogger, NullLogger, validateUrl, validatePositiveNumber, validateArray, validateString, ValidationError, withRetry, retryOnErrors, retryWithTimeout, Retry, DEFAULT_RETRY_OPTIONS, } from './utils';
export type { Logger, LogLevel, LogContext, RetryOptions, } from './utils';
export { generateDataLayerObserverScript, generateScriptObserverScript, generateErrorCaptureScript, DEFAULT_DATA_LAYER_NAMES, } from './injection';
//# sourceMappingURL=index.d.ts.map