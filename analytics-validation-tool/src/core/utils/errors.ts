/**
 * Custom Error Types for Analytics Validation Tool
 *
 * Structured errors enable better error handling and reporting.
 */

/**
 * Base error class for all AVT errors
 */
export class AVTError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: number;

  constructor(message: string, code: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'AVTError';
    this.code = code;
    this.context = context;
    this.timestamp = Date.now();

    // Maintains proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

/**
 * Error during browser operations
 */
export class BrowserError extends AVTError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'BROWSER_ERROR', context);
    this.name = 'BrowserError';
  }
}

/**
 * Error when browser pool is exhausted
 */
export class BrowserPoolExhaustedError extends AVTError {
  constructor(message: string = 'Browser pool exhausted', context?: Record<string, unknown>) {
    super(message, 'BROWSER_POOL_EXHAUSTED', context);
    this.name = 'BrowserPoolExhaustedError';
  }
}

/**
 * Error during page navigation
 */
export class NavigationError extends AVTError {
  public readonly url: string;
  public readonly httpStatus?: number;

  constructor(
    message: string,
    url: string,
    httpStatus?: number,
    context?: Record<string, unknown>
  ) {
    super(message, 'NAVIGATION_ERROR', { ...context, url, httpStatus });
    this.name = 'NavigationError';
    this.url = url;
    this.httpStatus = httpStatus;
  }
}

/**
 * Error when page load times out
 */
export class TimeoutError extends AVTError {
  public readonly timeoutMs: number;
  public readonly operation: string;

  constructor(operation: string, timeoutMs: number, context?: Record<string, unknown>) {
    super(`Operation '${operation}' timed out after ${timeoutMs}ms`, 'TIMEOUT_ERROR', {
      ...context,
      operation,
      timeoutMs,
    });
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
    this.operation = operation;
  }
}

/**
 * Error during data collection
 */
export class CollectorError extends AVTError {
  public readonly collectorName: string;

  constructor(collectorName: string, message: string, context?: Record<string, unknown>) {
    super(`[${collectorName}] ${message}`, 'COLLECTOR_ERROR', {
      ...context,
      collectorName,
    });
    this.name = 'CollectorError';
    this.collectorName = collectorName;
  }
}

/**
 * Error during network interception
 */
export class NetworkInterceptionError extends AVTError {
  public readonly requestId?: string;
  public readonly url?: string;

  constructor(message: string, requestId?: string, url?: string, context?: Record<string, unknown>) {
    super(message, 'NETWORK_INTERCEPTION_ERROR', { ...context, requestId, url });
    this.name = 'NetworkInterceptionError';
    this.requestId = requestId;
    this.url = url;
  }
}

/**
 * Error when scan configuration is invalid
 */
export class ConfigurationError extends AVTError {
  public readonly configPath?: string;

  constructor(message: string, configPath?: string, context?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', { ...context, configPath });
    this.name = 'ConfigurationError';
    this.configPath = configPath;
  }
}

/**
 * Error during script injection
 */
export class InjectionError extends AVTError {
  public readonly scriptName: string;

  constructor(scriptName: string, message: string, context?: Record<string, unknown>) {
    super(`Failed to inject '${scriptName}': ${message}`, 'INJECTION_ERROR', {
      ...context,
      scriptName,
    });
    this.name = 'InjectionError';
    this.scriptName = scriptName;
  }
}

/**
 * Type guard to check if an error is an AVTError
 */
export function isAVTError(error: unknown): error is AVTError {
  return error instanceof AVTError;
}

/**
 * Wrap an unknown error in an AVTError
 */
export function wrapError(error: unknown, defaultCode: string = 'UNKNOWN_ERROR'): AVTError {
  if (isAVTError(error)) {
    return error;
  }

  if (error instanceof Error) {
    const wrapped = new AVTError(error.message, defaultCode, {
      originalName: error.name,
      originalStack: error.stack,
    });
    wrapped.stack = error.stack;
    return wrapped;
  }

  return new AVTError(String(error), defaultCode);
}
