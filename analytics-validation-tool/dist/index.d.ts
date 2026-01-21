/**
 * Analytics Validation Tool
 *
 * Production-grade analytics validation platform for scanning websites,
 * detecting analytics tags, and validating implementations.
 *
 * @packageDocumentation
 */
export { BrowserManager, getDefaultBrowserManager, shutdownDefaultBrowserManager, PageScanner, createScanner, scanUrl, scanUrls, DEFAULT_SCAN_OPTIONS, DEFAULT_VIEWPORT, MOBILE_VIEWPORT, TABLET_VIEWPORT, DEVICE_PROFILES, mergeOptions, validateOptions, createDeviceOptions, createMobileOptions, createDesktopOptions, NetworkCollector, ScriptCollector, DataLayerCollector, ConsoleCollector, BaseCollector, AVTError, BrowserError, NavigationError, TimeoutError, CollectorError, isAVTError, wrapError, delay, Timer, withTimeout, safeStringify, parseQueryString, parseUrl, matchUrlPattern, getLogger, setGlobalLogger, ConsoleLogger, NullLogger, validateUrl, validatePositiveNumber, validateArray, validateString, ValidationError, withRetry, retryOnErrors, retryWithTimeout, Retry, DEFAULT_RETRY_OPTIONS, generateDataLayerObserverScript, generateScriptObserverScript, generateErrorCaptureScript, DEFAULT_DATA_LAYER_NAMES, } from './core';
export type { PageScanResult, ScanOptions, NetworkRequest, ScriptTag, DataLayerEvent, ConsoleMessage, PageError, Cookie, ScanSummary, PageTimings, BrowserType, BrowserPoolConfig, BrowserLaunchConfig, ContextOptions, BrowserPoolStats, ContextLease, Collector, CollectorOptions, NetworkCollectorOptions, ScriptCollectorOptions, DataLayerCollectorOptions, ConsoleCollectorOptions, ConsoleData, BaseCollectorOptions, CollectorState, Logger, LogLevel, LogContext, RetryOptions, } from './core';
export { DetectionEngine, detectTags, DetectorRegistry, getDefaultRegistry, resetDefaultRegistry, buildEvidenceContext, extractQueryParams, urlMatches, parsePayload, BaseDetector, CONFIDENCE, COMMON_PATTERNS, BUILT_IN_DETECTORS, registerBuiltInDetectors, getDetector, GA4Detector, GTMDetector, AdobeAnalyticsDetector, MetaPixelDetector, SegmentDetector, UnknownTagDetector, } from './detection';
export { getNestedValue as getNestedValueDetection } from './detection';
export { extractDomain as extractDomainDetection } from './detection';
export type { DetectionEngineConfig, KnownPlatform, TagCategory, LoadMethod, DetectionMethod, DetectionEvidence, TagConfiguration, TagInstance, DetectionSummary, TagDetectionResult, EvidenceContext, TagDetector, DetectorRegistration, UrlPattern, PayloadPattern, GlobalPattern, DeclarativeDetectorDef, } from './detection';
export { buildValidationContext, evaluateCondition, checkConditions, RuleLoader, loadRules, ValidationEngine, createDefaultValidationEngine, createValidationEngine, registerBuiltInHandlers, PresenceHandler, PayloadHandler, OrderHandler, ConsentHandler, DataLayerHandler, } from './validation';
export type { ValidationEngineConfig, ValidationSeverity, ValidationContext, ValidationEvidence, ValidationResult, ValidationReport, RuleDefinition, PresenceRuleDef, PayloadRuleDef, OrderRuleDef, ConsentRuleDef, DataLayerRuleDef, AnyRuleDef, RuleTypeHandler, RuleLoaderOptions, RuleSource, } from './validation';
export { ReportBuilder, JSONFormatter, MarkdownFormatter, ConsoleFormatter, SlackDispatcher, WebhookDispatcher, AlertManager, detectCIContext, getExitCode, } from './reporting';
export type { ReportBuilderConfig, RunReport, PageReport, Issue, IssueSummary, ReportStatus, AlertConfig, AlertThreshold, AlertContext, AlertDispatcher, ReportFormatter, CIContext, RunThresholds, RunBaseline, BaselineComparison, } from './reporting';
export { JourneyEngine, JourneyLoader, ActionHandlerRegistry, registerBuiltInActionHandlers, getDefaultActionRegistry, NavigateActionHandler, ClickActionHandler, TypeActionHandler, SubmitActionHandler, WaitActionHandler, AssertActionHandler, ScreenshotActionHandler, } from './journey';
export type { JourneyEngineConfig, JourneyAction, JourneyActionType, NavigateAction, ClickAction, TypeAction, SubmitAction, WaitAction, AssertAction, ScreenshotAction, JourneyStep, JourneyDefinition, ActionResult, StepResult, JourneyResult, ActionHandler, JourneyLoaderOptions, } from './journey';
export { auditUrl, auditUrls, quickValidate, getAuditScore, urlPassesValidation, } from './convenience';
export type { AuditResult, BatchAuditOptions } from './convenience';
//# sourceMappingURL=index.d.ts.map