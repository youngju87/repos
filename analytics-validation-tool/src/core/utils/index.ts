/**
 * Utilities Module Exports
 */

export {
  AVTError,
  BrowserError,
  BrowserPoolExhaustedError,
  NavigationError,
  TimeoutError,
  CollectorError,
  NetworkInterceptionError,
  ConfigurationError,
  InjectionError,
  isAVTError,
  wrapError,
} from './errors';

export {
  delay,
  timeout,
  withTimeout,
  Timer,
  measure,
  debounce,
  throttle,
  waitFor,
} from './timing';

export {
  safeStringify,
  safeParse,
  truncate,
  parseQueryString,
  parseUrl,
  extractDomain,
  matchUrlPattern,
  deepClone,
  deepMerge,
  getNestedProperty,
} from './serialization';

export {
  Logger,
  LogLevel,
  LogContext,
  LogEntry,
  ConsoleLogger,
  NullLogger,
  setGlobalLogger,
  getLogger,
  createLogger,
} from './logger';

export {
  ValidationError,
  validateUrl,
  validatePositiveNumber,
  validateArray,
  validateObject,
  validateEnum,
  validateString,
  validateBoolean,
  validateOptional,
  validateDataLayerName,
  validateRegexPattern,
} from './validation';

export {
  withRetry,
  retryOnErrors,
  retryWithTimeout,
  Retry,
  DEFAULT_RETRY_OPTIONS,
} from './retry';

export type { RetryOptions } from './retry';
