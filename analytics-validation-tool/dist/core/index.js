"use strict";
/**
 * Core Module Exports
 *
 * This module provides the core scanning functionality:
 * - Browser management and pooling
 * - Page scanning
 * - Network, script, data layer, and console collection
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_RETRY_OPTIONS = exports.Retry = exports.retryWithTimeout = exports.retryOnErrors = exports.withRetry = exports.ValidationError = exports.validateString = exports.validateArray = exports.validatePositiveNumber = exports.validateUrl = exports.NullLogger = exports.ConsoleLogger = exports.setGlobalLogger = exports.getLogger = exports.matchUrlPattern = exports.parseUrl = exports.parseQueryString = exports.safeStringify = exports.withTimeout = exports.Timer = exports.delay = exports.wrapError = exports.isAVTError = exports.CollectorError = exports.TimeoutError = exports.NavigationError = exports.BrowserError = exports.AVTError = exports.BaseCollector = exports.ConsoleCollector = exports.DataLayerCollector = exports.ScriptCollector = exports.NetworkCollector = exports.createDesktopOptions = exports.createMobileOptions = exports.createDeviceOptions = exports.validateOptions = exports.mergeOptions = exports.DEVICE_PROFILES = exports.TABLET_VIEWPORT = exports.MOBILE_VIEWPORT = exports.DEFAULT_VIEWPORT = exports.DEFAULT_SCAN_OPTIONS = exports.scanUrls = exports.scanUrl = exports.createScanner = exports.PageScanner = exports.shutdownDefaultBrowserManager = exports.getDefaultBrowserManager = exports.BrowserManager = void 0;
exports.DEFAULT_DATA_LAYER_NAMES = exports.generateErrorCaptureScript = exports.generateScriptObserverScript = exports.generateDataLayerObserverScript = void 0;
// Browser management
var browser_1 = require("./browser");
Object.defineProperty(exports, "BrowserManager", { enumerable: true, get: function () { return browser_1.BrowserManager; } });
Object.defineProperty(exports, "getDefaultBrowserManager", { enumerable: true, get: function () { return browser_1.getDefaultBrowserManager; } });
Object.defineProperty(exports, "shutdownDefaultBrowserManager", { enumerable: true, get: function () { return browser_1.shutdownDefaultBrowserManager; } });
// Scanning
var scanner_1 = require("./scanner");
Object.defineProperty(exports, "PageScanner", { enumerable: true, get: function () { return scanner_1.PageScanner; } });
Object.defineProperty(exports, "createScanner", { enumerable: true, get: function () { return scanner_1.createScanner; } });
Object.defineProperty(exports, "scanUrl", { enumerable: true, get: function () { return scanner_1.scanUrl; } });
Object.defineProperty(exports, "scanUrls", { enumerable: true, get: function () { return scanner_1.scanUrls; } });
Object.defineProperty(exports, "DEFAULT_SCAN_OPTIONS", { enumerable: true, get: function () { return scanner_1.DEFAULT_SCAN_OPTIONS; } });
Object.defineProperty(exports, "DEFAULT_VIEWPORT", { enumerable: true, get: function () { return scanner_1.DEFAULT_VIEWPORT; } });
Object.defineProperty(exports, "MOBILE_VIEWPORT", { enumerable: true, get: function () { return scanner_1.MOBILE_VIEWPORT; } });
Object.defineProperty(exports, "TABLET_VIEWPORT", { enumerable: true, get: function () { return scanner_1.TABLET_VIEWPORT; } });
Object.defineProperty(exports, "DEVICE_PROFILES", { enumerable: true, get: function () { return scanner_1.DEVICE_PROFILES; } });
Object.defineProperty(exports, "mergeOptions", { enumerable: true, get: function () { return scanner_1.mergeOptions; } });
Object.defineProperty(exports, "validateOptions", { enumerable: true, get: function () { return scanner_1.validateOptions; } });
Object.defineProperty(exports, "createDeviceOptions", { enumerable: true, get: function () { return scanner_1.createDeviceOptions; } });
Object.defineProperty(exports, "createMobileOptions", { enumerable: true, get: function () { return scanner_1.createMobileOptions; } });
Object.defineProperty(exports, "createDesktopOptions", { enumerable: true, get: function () { return scanner_1.createDesktopOptions; } });
// Collectors
var collectors_1 = require("./collectors");
Object.defineProperty(exports, "NetworkCollector", { enumerable: true, get: function () { return collectors_1.NetworkCollector; } });
Object.defineProperty(exports, "ScriptCollector", { enumerable: true, get: function () { return collectors_1.ScriptCollector; } });
Object.defineProperty(exports, "DataLayerCollector", { enumerable: true, get: function () { return collectors_1.DataLayerCollector; } });
Object.defineProperty(exports, "ConsoleCollector", { enumerable: true, get: function () { return collectors_1.ConsoleCollector; } });
Object.defineProperty(exports, "BaseCollector", { enumerable: true, get: function () { return collectors_1.BaseCollector; } });
// Utilities
var utils_1 = require("./utils");
Object.defineProperty(exports, "AVTError", { enumerable: true, get: function () { return utils_1.AVTError; } });
Object.defineProperty(exports, "BrowserError", { enumerable: true, get: function () { return utils_1.BrowserError; } });
Object.defineProperty(exports, "NavigationError", { enumerable: true, get: function () { return utils_1.NavigationError; } });
Object.defineProperty(exports, "TimeoutError", { enumerable: true, get: function () { return utils_1.TimeoutError; } });
Object.defineProperty(exports, "CollectorError", { enumerable: true, get: function () { return utils_1.CollectorError; } });
Object.defineProperty(exports, "isAVTError", { enumerable: true, get: function () { return utils_1.isAVTError; } });
Object.defineProperty(exports, "wrapError", { enumerable: true, get: function () { return utils_1.wrapError; } });
Object.defineProperty(exports, "delay", { enumerable: true, get: function () { return utils_1.delay; } });
Object.defineProperty(exports, "Timer", { enumerable: true, get: function () { return utils_1.Timer; } });
Object.defineProperty(exports, "withTimeout", { enumerable: true, get: function () { return utils_1.withTimeout; } });
Object.defineProperty(exports, "safeStringify", { enumerable: true, get: function () { return utils_1.safeStringify; } });
Object.defineProperty(exports, "parseQueryString", { enumerable: true, get: function () { return utils_1.parseQueryString; } });
Object.defineProperty(exports, "parseUrl", { enumerable: true, get: function () { return utils_1.parseUrl; } });
Object.defineProperty(exports, "matchUrlPattern", { enumerable: true, get: function () { return utils_1.matchUrlPattern; } });
// Logging
Object.defineProperty(exports, "getLogger", { enumerable: true, get: function () { return utils_1.getLogger; } });
Object.defineProperty(exports, "setGlobalLogger", { enumerable: true, get: function () { return utils_1.setGlobalLogger; } });
Object.defineProperty(exports, "ConsoleLogger", { enumerable: true, get: function () { return utils_1.ConsoleLogger; } });
Object.defineProperty(exports, "NullLogger", { enumerable: true, get: function () { return utils_1.NullLogger; } });
// Validation
Object.defineProperty(exports, "validateUrl", { enumerable: true, get: function () { return utils_1.validateUrl; } });
Object.defineProperty(exports, "validatePositiveNumber", { enumerable: true, get: function () { return utils_1.validatePositiveNumber; } });
Object.defineProperty(exports, "validateArray", { enumerable: true, get: function () { return utils_1.validateArray; } });
Object.defineProperty(exports, "validateString", { enumerable: true, get: function () { return utils_1.validateString; } });
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return utils_1.ValidationError; } });
// Retry
Object.defineProperty(exports, "withRetry", { enumerable: true, get: function () { return utils_1.withRetry; } });
Object.defineProperty(exports, "retryOnErrors", { enumerable: true, get: function () { return utils_1.retryOnErrors; } });
Object.defineProperty(exports, "retryWithTimeout", { enumerable: true, get: function () { return utils_1.retryWithTimeout; } });
Object.defineProperty(exports, "Retry", { enumerable: true, get: function () { return utils_1.Retry; } });
Object.defineProperty(exports, "DEFAULT_RETRY_OPTIONS", { enumerable: true, get: function () { return utils_1.DEFAULT_RETRY_OPTIONS; } });
// Injection scripts (for advanced use cases)
var injection_1 = require("./injection");
Object.defineProperty(exports, "generateDataLayerObserverScript", { enumerable: true, get: function () { return injection_1.generateDataLayerObserverScript; } });
Object.defineProperty(exports, "generateScriptObserverScript", { enumerable: true, get: function () { return injection_1.generateScriptObserverScript; } });
Object.defineProperty(exports, "generateErrorCaptureScript", { enumerable: true, get: function () { return injection_1.generateErrorCaptureScript; } });
Object.defineProperty(exports, "DEFAULT_DATA_LAYER_NAMES", { enumerable: true, get: function () { return injection_1.DEFAULT_DATA_LAYER_NAMES; } });
//# sourceMappingURL=index.js.map