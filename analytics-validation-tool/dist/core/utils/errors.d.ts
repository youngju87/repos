/**
 * Custom Error Types for Analytics Validation Tool
 *
 * Structured errors enable better error handling and reporting.
 */
/**
 * Base error class for all AVT errors
 */
export declare class AVTError extends Error {
    readonly code: string;
    readonly context?: Record<string, unknown>;
    readonly timestamp: number;
    constructor(message: string, code: string, context?: Record<string, unknown>);
    toJSON(): Record<string, unknown>;
}
/**
 * Error during browser operations
 */
export declare class BrowserError extends AVTError {
    constructor(message: string, context?: Record<string, unknown>);
}
/**
 * Error when browser pool is exhausted
 */
export declare class BrowserPoolExhaustedError extends AVTError {
    constructor(message?: string, context?: Record<string, unknown>);
}
/**
 * Error during page navigation
 */
export declare class NavigationError extends AVTError {
    readonly url: string;
    readonly httpStatus?: number;
    constructor(message: string, url: string, httpStatus?: number, context?: Record<string, unknown>);
}
/**
 * Error when page load times out
 */
export declare class TimeoutError extends AVTError {
    readonly timeoutMs: number;
    readonly operation: string;
    constructor(operation: string, timeoutMs: number, context?: Record<string, unknown>);
}
/**
 * Error during data collection
 */
export declare class CollectorError extends AVTError {
    readonly collectorName: string;
    constructor(collectorName: string, message: string, context?: Record<string, unknown>);
}
/**
 * Error during network interception
 */
export declare class NetworkInterceptionError extends AVTError {
    readonly requestId?: string;
    readonly url?: string;
    constructor(message: string, requestId?: string, url?: string, context?: Record<string, unknown>);
}
/**
 * Error when scan configuration is invalid
 */
export declare class ConfigurationError extends AVTError {
    readonly configPath?: string;
    constructor(message: string, configPath?: string, context?: Record<string, unknown>);
}
/**
 * Error during script injection
 */
export declare class InjectionError extends AVTError {
    readonly scriptName: string;
    constructor(scriptName: string, message: string, context?: Record<string, unknown>);
}
/**
 * Type guard to check if an error is an AVTError
 */
export declare function isAVTError(error: unknown): error is AVTError;
/**
 * Wrap an unknown error in an AVTError
 */
export declare function wrapError(error: unknown, defaultCode?: string): AVTError;
//# sourceMappingURL=errors.d.ts.map