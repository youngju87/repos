/**
 * Analytics Validation Tool
 *
 * Production-grade analytics validation platform for scanning websites,
 * detecting analytics tags, and validating implementations.
 *
 * @packageDocumentation
 */

// =============================================================================
// CORE SCANNING
// =============================================================================

export {
  // Browser management
  BrowserManager,
  getDefaultBrowserManager,
  shutdownDefaultBrowserManager,
  // Scanning
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
  // Collectors
  NetworkCollector,
  ScriptCollector,
  DataLayerCollector,
  ConsoleCollector,
  BaseCollector,
  // Utilities
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
  // Logging
  getLogger,
  setGlobalLogger,
  ConsoleLogger,
  NullLogger,
  // Validation utilities
  validateUrl,
  validatePositiveNumber,
  validateArray,
  validateString,
  ValidationError,
  // Retry
  withRetry,
  retryOnErrors,
  retryWithTimeout,
  Retry,
  DEFAULT_RETRY_OPTIONS,
  // Injection scripts
  generateDataLayerObserverScript,
  generateScriptObserverScript,
  generateErrorCaptureScript,
  DEFAULT_DATA_LAYER_NAMES,
} from './core';

export type {
  // Core types
  PageScanResult,
  ScanOptions,
  NetworkRequest,
  ScriptTag,
  DataLayerEvent,
  ConsoleMessage,
  PageError,
  Cookie,
  ScanSummary,
  PageTimings,
  // Browser types
  BrowserType,
  BrowserPoolConfig,
  BrowserLaunchConfig,
  ContextOptions,
  BrowserPoolStats,
  ContextLease,
  // Collector types
  Collector,
  CollectorOptions,
  NetworkCollectorOptions,
  ScriptCollectorOptions,
  DataLayerCollectorOptions,
  ConsoleCollectorOptions,
  ConsoleData,
  BaseCollectorOptions,
  CollectorState,
  // Utility types
  Logger,
  LogLevel,
  LogContext,
  RetryOptions,
} from './core';

// =============================================================================
// TAG DETECTION
// =============================================================================

export {
  // Core detection
  DetectionEngine,
  detectTags,
  // Registry
  DetectorRegistry,
  getDefaultRegistry,
  resetDefaultRegistry,
  // Evidence extraction
  buildEvidenceContext,
  extractQueryParams,
  urlMatches,
  parsePayload,
  // Base detector
  BaseDetector,
  CONFIDENCE,
  COMMON_PATTERNS,
  // Built-in detectors
  BUILT_IN_DETECTORS,
  registerBuiltInDetectors,
  getDetector,
  GA4Detector,
  GTMDetector,
  AdobeAnalyticsDetector,
  MetaPixelDetector,
  SegmentDetector,
  UnknownTagDetector,
} from './detection';

// Re-export with specific names to avoid conflicts
export { getNestedValue as getNestedValueDetection } from './detection';
export { extractDomain as extractDomainDetection } from './detection';

export type {
  // Detection types
  DetectionEngineConfig,
  KnownPlatform,
  TagCategory,
  LoadMethod,
  DetectionMethod,
  DetectionEvidence,
  TagConfiguration,
  TagInstance,
  DetectionSummary,
  TagDetectionResult,
  EvidenceContext,
  TagDetector,
  DetectorRegistration,
  UrlPattern,
  PayloadPattern,
  GlobalPattern,
  DeclarativeDetectorDef,
} from './detection';

// =============================================================================
// VALIDATION
// =============================================================================

export {
  // Core validation
  buildValidationContext,
  evaluateCondition,
  checkConditions,
  // Rule loader
  RuleLoader,
  loadRules,
  // Validation engine
  ValidationEngine,
  createDefaultValidationEngine,
  createValidationEngine,
  registerBuiltInHandlers,
  // Handlers
  PresenceHandler,
  PayloadHandler,
  OrderHandler,
  ConsentHandler,
  DataLayerHandler,
} from './validation';

export type {
  // Validation types
  ValidationEngineConfig,
  ValidationSeverity,
  ValidationContext,
  ValidationEvidence,
  ValidationResult,
  ValidationReport,
  RuleDefinition,
  PresenceRuleDef,
  PayloadRuleDef,
  OrderRuleDef,
  ConsentRuleDef,
  DataLayerRuleDef,
  AnyRuleDef,
  RuleTypeHandler,
  RuleLoaderOptions,
  RuleSource,
} from './validation';

// =============================================================================
// REPORTING
// =============================================================================

export {
  // Report builder
  ReportBuilder,
  // Formatters
  JSONFormatter,
  MarkdownFormatter,
  ConsoleFormatter,
  // Alert dispatchers
  SlackDispatcher,
  WebhookDispatcher,
  AlertManager,
  // CI detection
  detectCIContext,
  getExitCode,
} from './reporting';

export type {
  // Reporting types
  ReportBuilderConfig,
  RunReport,
  PageReport,
  Issue,
  IssueSummary,
  ReportStatus,
  AlertConfig,
  AlertThreshold,
  AlertContext,
  AlertDispatcher,
  ReportFormatter,
  CIContext,
  RunThresholds,
  RunBaseline,
  BaselineComparison,
} from './reporting';

// =============================================================================
// JOURNEY & FUNNEL SIMULATION
// =============================================================================

export {
  // Journey engine
  JourneyEngine,
  // Journey loader
  JourneyLoader,
  // Action handlers
  ActionHandlerRegistry,
  registerBuiltInActionHandlers,
  getDefaultActionRegistry,
  NavigateActionHandler,
  ClickActionHandler,
  TypeActionHandler,
  SubmitActionHandler,
  WaitActionHandler,
  AssertActionHandler,
  ScreenshotActionHandler,
} from './journey';

export type {
  // Journey types
  JourneyEngineConfig,
  JourneyAction,
  JourneyActionType,
  NavigateAction,
  ClickAction,
  TypeAction,
  SubmitAction,
  WaitAction,
  AssertAction,
  ScreenshotAction,
  JourneyStep,
  JourneyDefinition,
  ActionResult,
  StepResult,
  JourneyResult,
  ActionHandler,
  JourneyLoaderOptions,
} from './journey';

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

export {
  auditUrl,
  auditUrls,
  quickValidate,
  getAuditScore,
  urlPassesValidation,
} from './convenience';

export type { AuditResult, BatchAuditOptions } from './convenience';
