"use strict";
/**
 * Analytics Validation Tool
 *
 * Production-grade analytics validation platform for scanning websites,
 * detecting analytics tags, and validating implementations.
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_RETRY_OPTIONS = exports.Retry = exports.retryWithTimeout = exports.retryOnErrors = exports.withRetry = exports.ValidationError = exports.validateString = exports.validateArray = exports.validatePositiveNumber = exports.validateUrl = exports.NullLogger = exports.ConsoleLogger = exports.setGlobalLogger = exports.getLogger = exports.matchUrlPattern = exports.parseUrl = exports.parseQueryString = exports.safeStringify = exports.withTimeout = exports.Timer = exports.delay = exports.wrapError = exports.isAVTError = exports.CollectorError = exports.TimeoutError = exports.NavigationError = exports.BrowserError = exports.AVTError = exports.BaseCollector = exports.ConsoleCollector = exports.DataLayerCollector = exports.ScriptCollector = exports.NetworkCollector = exports.createDesktopOptions = exports.createMobileOptions = exports.createDeviceOptions = exports.validateOptions = exports.mergeOptions = exports.DEVICE_PROFILES = exports.TABLET_VIEWPORT = exports.MOBILE_VIEWPORT = exports.DEFAULT_VIEWPORT = exports.DEFAULT_SCAN_OPTIONS = exports.scanUrls = exports.scanUrl = exports.createScanner = exports.PageScanner = exports.shutdownDefaultBrowserManager = exports.getDefaultBrowserManager = exports.BrowserManager = void 0;
exports.getExitCode = exports.detectCIContext = exports.AlertManager = exports.WebhookDispatcher = exports.SlackDispatcher = exports.ConsoleFormatter = exports.MarkdownFormatter = exports.JSONFormatter = exports.ReportBuilder = exports.DataLayerHandler = exports.ConsentHandler = exports.OrderHandler = exports.PayloadHandler = exports.PresenceHandler = exports.registerBuiltInHandlers = exports.createValidationEngine = exports.createDefaultValidationEngine = exports.ValidationEngine = exports.loadRules = exports.RuleLoader = exports.checkConditions = exports.evaluateCondition = exports.buildValidationContext = exports.extractDomainDetection = exports.getNestedValueDetection = exports.UnknownTagDetector = exports.SegmentDetector = exports.MetaPixelDetector = exports.AdobeAnalyticsDetector = exports.GTMDetector = exports.GA4Detector = exports.getDetector = exports.registerBuiltInDetectors = exports.BUILT_IN_DETECTORS = exports.COMMON_PATTERNS = exports.CONFIDENCE = exports.BaseDetector = exports.parsePayload = exports.urlMatches = exports.extractQueryParams = exports.buildEvidenceContext = exports.resetDefaultRegistry = exports.getDefaultRegistry = exports.DetectorRegistry = exports.detectTags = exports.DetectionEngine = exports.DEFAULT_DATA_LAYER_NAMES = exports.generateErrorCaptureScript = exports.generateScriptObserverScript = exports.generateDataLayerObserverScript = void 0;
exports.urlPassesValidation = exports.getAuditScore = exports.quickValidate = exports.auditUrls = exports.auditUrl = exports.ScreenshotActionHandler = exports.AssertActionHandler = exports.WaitActionHandler = exports.SubmitActionHandler = exports.TypeActionHandler = exports.ClickActionHandler = exports.NavigateActionHandler = exports.getDefaultActionRegistry = exports.registerBuiltInActionHandlers = exports.ActionHandlerRegistry = exports.JourneyLoader = exports.JourneyEngine = void 0;
// =============================================================================
// CORE SCANNING
// =============================================================================
var core_1 = require("./core");
// Browser management
Object.defineProperty(exports, "BrowserManager", { enumerable: true, get: function () { return core_1.BrowserManager; } });
Object.defineProperty(exports, "getDefaultBrowserManager", { enumerable: true, get: function () { return core_1.getDefaultBrowserManager; } });
Object.defineProperty(exports, "shutdownDefaultBrowserManager", { enumerable: true, get: function () { return core_1.shutdownDefaultBrowserManager; } });
// Scanning
Object.defineProperty(exports, "PageScanner", { enumerable: true, get: function () { return core_1.PageScanner; } });
Object.defineProperty(exports, "createScanner", { enumerable: true, get: function () { return core_1.createScanner; } });
Object.defineProperty(exports, "scanUrl", { enumerable: true, get: function () { return core_1.scanUrl; } });
Object.defineProperty(exports, "scanUrls", { enumerable: true, get: function () { return core_1.scanUrls; } });
Object.defineProperty(exports, "DEFAULT_SCAN_OPTIONS", { enumerable: true, get: function () { return core_1.DEFAULT_SCAN_OPTIONS; } });
Object.defineProperty(exports, "DEFAULT_VIEWPORT", { enumerable: true, get: function () { return core_1.DEFAULT_VIEWPORT; } });
Object.defineProperty(exports, "MOBILE_VIEWPORT", { enumerable: true, get: function () { return core_1.MOBILE_VIEWPORT; } });
Object.defineProperty(exports, "TABLET_VIEWPORT", { enumerable: true, get: function () { return core_1.TABLET_VIEWPORT; } });
Object.defineProperty(exports, "DEVICE_PROFILES", { enumerable: true, get: function () { return core_1.DEVICE_PROFILES; } });
Object.defineProperty(exports, "mergeOptions", { enumerable: true, get: function () { return core_1.mergeOptions; } });
Object.defineProperty(exports, "validateOptions", { enumerable: true, get: function () { return core_1.validateOptions; } });
Object.defineProperty(exports, "createDeviceOptions", { enumerable: true, get: function () { return core_1.createDeviceOptions; } });
Object.defineProperty(exports, "createMobileOptions", { enumerable: true, get: function () { return core_1.createMobileOptions; } });
Object.defineProperty(exports, "createDesktopOptions", { enumerable: true, get: function () { return core_1.createDesktopOptions; } });
// Collectors
Object.defineProperty(exports, "NetworkCollector", { enumerable: true, get: function () { return core_1.NetworkCollector; } });
Object.defineProperty(exports, "ScriptCollector", { enumerable: true, get: function () { return core_1.ScriptCollector; } });
Object.defineProperty(exports, "DataLayerCollector", { enumerable: true, get: function () { return core_1.DataLayerCollector; } });
Object.defineProperty(exports, "ConsoleCollector", { enumerable: true, get: function () { return core_1.ConsoleCollector; } });
Object.defineProperty(exports, "BaseCollector", { enumerable: true, get: function () { return core_1.BaseCollector; } });
// Utilities
Object.defineProperty(exports, "AVTError", { enumerable: true, get: function () { return core_1.AVTError; } });
Object.defineProperty(exports, "BrowserError", { enumerable: true, get: function () { return core_1.BrowserError; } });
Object.defineProperty(exports, "NavigationError", { enumerable: true, get: function () { return core_1.NavigationError; } });
Object.defineProperty(exports, "TimeoutError", { enumerable: true, get: function () { return core_1.TimeoutError; } });
Object.defineProperty(exports, "CollectorError", { enumerable: true, get: function () { return core_1.CollectorError; } });
Object.defineProperty(exports, "isAVTError", { enumerable: true, get: function () { return core_1.isAVTError; } });
Object.defineProperty(exports, "wrapError", { enumerable: true, get: function () { return core_1.wrapError; } });
Object.defineProperty(exports, "delay", { enumerable: true, get: function () { return core_1.delay; } });
Object.defineProperty(exports, "Timer", { enumerable: true, get: function () { return core_1.Timer; } });
Object.defineProperty(exports, "withTimeout", { enumerable: true, get: function () { return core_1.withTimeout; } });
Object.defineProperty(exports, "safeStringify", { enumerable: true, get: function () { return core_1.safeStringify; } });
Object.defineProperty(exports, "parseQueryString", { enumerable: true, get: function () { return core_1.parseQueryString; } });
Object.defineProperty(exports, "parseUrl", { enumerable: true, get: function () { return core_1.parseUrl; } });
Object.defineProperty(exports, "matchUrlPattern", { enumerable: true, get: function () { return core_1.matchUrlPattern; } });
// Logging
Object.defineProperty(exports, "getLogger", { enumerable: true, get: function () { return core_1.getLogger; } });
Object.defineProperty(exports, "setGlobalLogger", { enumerable: true, get: function () { return core_1.setGlobalLogger; } });
Object.defineProperty(exports, "ConsoleLogger", { enumerable: true, get: function () { return core_1.ConsoleLogger; } });
Object.defineProperty(exports, "NullLogger", { enumerable: true, get: function () { return core_1.NullLogger; } });
// Validation utilities
Object.defineProperty(exports, "validateUrl", { enumerable: true, get: function () { return core_1.validateUrl; } });
Object.defineProperty(exports, "validatePositiveNumber", { enumerable: true, get: function () { return core_1.validatePositiveNumber; } });
Object.defineProperty(exports, "validateArray", { enumerable: true, get: function () { return core_1.validateArray; } });
Object.defineProperty(exports, "validateString", { enumerable: true, get: function () { return core_1.validateString; } });
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return core_1.ValidationError; } });
// Retry
Object.defineProperty(exports, "withRetry", { enumerable: true, get: function () { return core_1.withRetry; } });
Object.defineProperty(exports, "retryOnErrors", { enumerable: true, get: function () { return core_1.retryOnErrors; } });
Object.defineProperty(exports, "retryWithTimeout", { enumerable: true, get: function () { return core_1.retryWithTimeout; } });
Object.defineProperty(exports, "Retry", { enumerable: true, get: function () { return core_1.Retry; } });
Object.defineProperty(exports, "DEFAULT_RETRY_OPTIONS", { enumerable: true, get: function () { return core_1.DEFAULT_RETRY_OPTIONS; } });
// Injection scripts
Object.defineProperty(exports, "generateDataLayerObserverScript", { enumerable: true, get: function () { return core_1.generateDataLayerObserverScript; } });
Object.defineProperty(exports, "generateScriptObserverScript", { enumerable: true, get: function () { return core_1.generateScriptObserverScript; } });
Object.defineProperty(exports, "generateErrorCaptureScript", { enumerable: true, get: function () { return core_1.generateErrorCaptureScript; } });
Object.defineProperty(exports, "DEFAULT_DATA_LAYER_NAMES", { enumerable: true, get: function () { return core_1.DEFAULT_DATA_LAYER_NAMES; } });
// =============================================================================
// TAG DETECTION
// =============================================================================
var detection_1 = require("./detection");
// Core detection
Object.defineProperty(exports, "DetectionEngine", { enumerable: true, get: function () { return detection_1.DetectionEngine; } });
Object.defineProperty(exports, "detectTags", { enumerable: true, get: function () { return detection_1.detectTags; } });
// Registry
Object.defineProperty(exports, "DetectorRegistry", { enumerable: true, get: function () { return detection_1.DetectorRegistry; } });
Object.defineProperty(exports, "getDefaultRegistry", { enumerable: true, get: function () { return detection_1.getDefaultRegistry; } });
Object.defineProperty(exports, "resetDefaultRegistry", { enumerable: true, get: function () { return detection_1.resetDefaultRegistry; } });
// Evidence extraction
Object.defineProperty(exports, "buildEvidenceContext", { enumerable: true, get: function () { return detection_1.buildEvidenceContext; } });
Object.defineProperty(exports, "extractQueryParams", { enumerable: true, get: function () { return detection_1.extractQueryParams; } });
Object.defineProperty(exports, "urlMatches", { enumerable: true, get: function () { return detection_1.urlMatches; } });
Object.defineProperty(exports, "parsePayload", { enumerable: true, get: function () { return detection_1.parsePayload; } });
// Base detector
Object.defineProperty(exports, "BaseDetector", { enumerable: true, get: function () { return detection_1.BaseDetector; } });
Object.defineProperty(exports, "CONFIDENCE", { enumerable: true, get: function () { return detection_1.CONFIDENCE; } });
Object.defineProperty(exports, "COMMON_PATTERNS", { enumerable: true, get: function () { return detection_1.COMMON_PATTERNS; } });
// Built-in detectors
Object.defineProperty(exports, "BUILT_IN_DETECTORS", { enumerable: true, get: function () { return detection_1.BUILT_IN_DETECTORS; } });
Object.defineProperty(exports, "registerBuiltInDetectors", { enumerable: true, get: function () { return detection_1.registerBuiltInDetectors; } });
Object.defineProperty(exports, "getDetector", { enumerable: true, get: function () { return detection_1.getDetector; } });
Object.defineProperty(exports, "GA4Detector", { enumerable: true, get: function () { return detection_1.GA4Detector; } });
Object.defineProperty(exports, "GTMDetector", { enumerable: true, get: function () { return detection_1.GTMDetector; } });
Object.defineProperty(exports, "AdobeAnalyticsDetector", { enumerable: true, get: function () { return detection_1.AdobeAnalyticsDetector; } });
Object.defineProperty(exports, "MetaPixelDetector", { enumerable: true, get: function () { return detection_1.MetaPixelDetector; } });
Object.defineProperty(exports, "SegmentDetector", { enumerable: true, get: function () { return detection_1.SegmentDetector; } });
Object.defineProperty(exports, "UnknownTagDetector", { enumerable: true, get: function () { return detection_1.UnknownTagDetector; } });
// Re-export with specific names to avoid conflicts
var detection_2 = require("./detection");
Object.defineProperty(exports, "getNestedValueDetection", { enumerable: true, get: function () { return detection_2.getNestedValue; } });
var detection_3 = require("./detection");
Object.defineProperty(exports, "extractDomainDetection", { enumerable: true, get: function () { return detection_3.extractDomain; } });
// =============================================================================
// VALIDATION
// =============================================================================
var validation_1 = require("./validation");
// Core validation
Object.defineProperty(exports, "buildValidationContext", { enumerable: true, get: function () { return validation_1.buildValidationContext; } });
Object.defineProperty(exports, "evaluateCondition", { enumerable: true, get: function () { return validation_1.evaluateCondition; } });
Object.defineProperty(exports, "checkConditions", { enumerable: true, get: function () { return validation_1.checkConditions; } });
// Rule loader
Object.defineProperty(exports, "RuleLoader", { enumerable: true, get: function () { return validation_1.RuleLoader; } });
Object.defineProperty(exports, "loadRules", { enumerable: true, get: function () { return validation_1.loadRules; } });
// Validation engine
Object.defineProperty(exports, "ValidationEngine", { enumerable: true, get: function () { return validation_1.ValidationEngine; } });
Object.defineProperty(exports, "createDefaultValidationEngine", { enumerable: true, get: function () { return validation_1.createDefaultValidationEngine; } });
Object.defineProperty(exports, "createValidationEngine", { enumerable: true, get: function () { return validation_1.createValidationEngine; } });
Object.defineProperty(exports, "registerBuiltInHandlers", { enumerable: true, get: function () { return validation_1.registerBuiltInHandlers; } });
// Handlers
Object.defineProperty(exports, "PresenceHandler", { enumerable: true, get: function () { return validation_1.PresenceHandler; } });
Object.defineProperty(exports, "PayloadHandler", { enumerable: true, get: function () { return validation_1.PayloadHandler; } });
Object.defineProperty(exports, "OrderHandler", { enumerable: true, get: function () { return validation_1.OrderHandler; } });
Object.defineProperty(exports, "ConsentHandler", { enumerable: true, get: function () { return validation_1.ConsentHandler; } });
Object.defineProperty(exports, "DataLayerHandler", { enumerable: true, get: function () { return validation_1.DataLayerHandler; } });
// =============================================================================
// REPORTING
// =============================================================================
var reporting_1 = require("./reporting");
// Report builder
Object.defineProperty(exports, "ReportBuilder", { enumerable: true, get: function () { return reporting_1.ReportBuilder; } });
// Formatters
Object.defineProperty(exports, "JSONFormatter", { enumerable: true, get: function () { return reporting_1.JSONFormatter; } });
Object.defineProperty(exports, "MarkdownFormatter", { enumerable: true, get: function () { return reporting_1.MarkdownFormatter; } });
Object.defineProperty(exports, "ConsoleFormatter", { enumerable: true, get: function () { return reporting_1.ConsoleFormatter; } });
// Alert dispatchers
Object.defineProperty(exports, "SlackDispatcher", { enumerable: true, get: function () { return reporting_1.SlackDispatcher; } });
Object.defineProperty(exports, "WebhookDispatcher", { enumerable: true, get: function () { return reporting_1.WebhookDispatcher; } });
Object.defineProperty(exports, "AlertManager", { enumerable: true, get: function () { return reporting_1.AlertManager; } });
// CI detection
Object.defineProperty(exports, "detectCIContext", { enumerable: true, get: function () { return reporting_1.detectCIContext; } });
Object.defineProperty(exports, "getExitCode", { enumerable: true, get: function () { return reporting_1.getExitCode; } });
// =============================================================================
// JOURNEY & FUNNEL SIMULATION
// =============================================================================
var journey_1 = require("./journey");
// Journey engine
Object.defineProperty(exports, "JourneyEngine", { enumerable: true, get: function () { return journey_1.JourneyEngine; } });
// Journey loader
Object.defineProperty(exports, "JourneyLoader", { enumerable: true, get: function () { return journey_1.JourneyLoader; } });
// Action handlers
Object.defineProperty(exports, "ActionHandlerRegistry", { enumerable: true, get: function () { return journey_1.ActionHandlerRegistry; } });
Object.defineProperty(exports, "registerBuiltInActionHandlers", { enumerable: true, get: function () { return journey_1.registerBuiltInActionHandlers; } });
Object.defineProperty(exports, "getDefaultActionRegistry", { enumerable: true, get: function () { return journey_1.getDefaultActionRegistry; } });
Object.defineProperty(exports, "NavigateActionHandler", { enumerable: true, get: function () { return journey_1.NavigateActionHandler; } });
Object.defineProperty(exports, "ClickActionHandler", { enumerable: true, get: function () { return journey_1.ClickActionHandler; } });
Object.defineProperty(exports, "TypeActionHandler", { enumerable: true, get: function () { return journey_1.TypeActionHandler; } });
Object.defineProperty(exports, "SubmitActionHandler", { enumerable: true, get: function () { return journey_1.SubmitActionHandler; } });
Object.defineProperty(exports, "WaitActionHandler", { enumerable: true, get: function () { return journey_1.WaitActionHandler; } });
Object.defineProperty(exports, "AssertActionHandler", { enumerable: true, get: function () { return journey_1.AssertActionHandler; } });
Object.defineProperty(exports, "ScreenshotActionHandler", { enumerable: true, get: function () { return journey_1.ScreenshotActionHandler; } });
// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================
var convenience_1 = require("./convenience");
Object.defineProperty(exports, "auditUrl", { enumerable: true, get: function () { return convenience_1.auditUrl; } });
Object.defineProperty(exports, "auditUrls", { enumerable: true, get: function () { return convenience_1.auditUrls; } });
Object.defineProperty(exports, "quickValidate", { enumerable: true, get: function () { return convenience_1.quickValidate; } });
Object.defineProperty(exports, "getAuditScore", { enumerable: true, get: function () { return convenience_1.getAuditScore; } });
Object.defineProperty(exports, "urlPassesValidation", { enumerable: true, get: function () { return convenience_1.urlPassesValidation; } });
//# sourceMappingURL=index.js.map