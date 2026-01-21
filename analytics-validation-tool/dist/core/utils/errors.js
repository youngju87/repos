"use strict";
/**
 * Custom Error Types for Analytics Validation Tool
 *
 * Structured errors enable better error handling and reporting.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InjectionError = exports.ConfigurationError = exports.NetworkInterceptionError = exports.CollectorError = exports.TimeoutError = exports.NavigationError = exports.BrowserPoolExhaustedError = exports.BrowserError = exports.AVTError = void 0;
exports.isAVTError = isAVTError;
exports.wrapError = wrapError;
/**
 * Base error class for all AVT errors
 */
class AVTError extends Error {
    code;
    context;
    timestamp;
    constructor(message, code, context) {
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
    toJSON() {
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
exports.AVTError = AVTError;
/**
 * Error during browser operations
 */
class BrowserError extends AVTError {
    constructor(message, context) {
        super(message, 'BROWSER_ERROR', context);
        this.name = 'BrowserError';
    }
}
exports.BrowserError = BrowserError;
/**
 * Error when browser pool is exhausted
 */
class BrowserPoolExhaustedError extends AVTError {
    constructor(message = 'Browser pool exhausted', context) {
        super(message, 'BROWSER_POOL_EXHAUSTED', context);
        this.name = 'BrowserPoolExhaustedError';
    }
}
exports.BrowserPoolExhaustedError = BrowserPoolExhaustedError;
/**
 * Error during page navigation
 */
class NavigationError extends AVTError {
    url;
    httpStatus;
    constructor(message, url, httpStatus, context) {
        super(message, 'NAVIGATION_ERROR', { ...context, url, httpStatus });
        this.name = 'NavigationError';
        this.url = url;
        this.httpStatus = httpStatus;
    }
}
exports.NavigationError = NavigationError;
/**
 * Error when page load times out
 */
class TimeoutError extends AVTError {
    timeoutMs;
    operation;
    constructor(operation, timeoutMs, context) {
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
exports.TimeoutError = TimeoutError;
/**
 * Error during data collection
 */
class CollectorError extends AVTError {
    collectorName;
    constructor(collectorName, message, context) {
        super(`[${collectorName}] ${message}`, 'COLLECTOR_ERROR', {
            ...context,
            collectorName,
        });
        this.name = 'CollectorError';
        this.collectorName = collectorName;
    }
}
exports.CollectorError = CollectorError;
/**
 * Error during network interception
 */
class NetworkInterceptionError extends AVTError {
    requestId;
    url;
    constructor(message, requestId, url, context) {
        super(message, 'NETWORK_INTERCEPTION_ERROR', { ...context, requestId, url });
        this.name = 'NetworkInterceptionError';
        this.requestId = requestId;
        this.url = url;
    }
}
exports.NetworkInterceptionError = NetworkInterceptionError;
/**
 * Error when scan configuration is invalid
 */
class ConfigurationError extends AVTError {
    configPath;
    constructor(message, configPath, context) {
        super(message, 'CONFIGURATION_ERROR', { ...context, configPath });
        this.name = 'ConfigurationError';
        this.configPath = configPath;
    }
}
exports.ConfigurationError = ConfigurationError;
/**
 * Error during script injection
 */
class InjectionError extends AVTError {
    scriptName;
    constructor(scriptName, message, context) {
        super(`Failed to inject '${scriptName}': ${message}`, 'INJECTION_ERROR', {
            ...context,
            scriptName,
        });
        this.name = 'InjectionError';
        this.scriptName = scriptName;
    }
}
exports.InjectionError = InjectionError;
/**
 * Type guard to check if an error is an AVTError
 */
function isAVTError(error) {
    return error instanceof AVTError;
}
/**
 * Wrap an unknown error in an AVTError
 */
function wrapError(error, defaultCode = 'UNKNOWN_ERROR') {
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
//# sourceMappingURL=errors.js.map