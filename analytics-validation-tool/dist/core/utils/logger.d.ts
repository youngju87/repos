/**
 * Structured Logging System
 *
 * Provides consistent logging interface across the application.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface LogContext {
    [key: string]: unknown;
}
export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: number;
    context?: LogContext;
    error?: Error;
}
/**
 * Logger interface for structured logging
 */
export interface Logger {
    debug(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, error?: Error, context?: LogContext): void;
    child(defaultContext: LogContext): Logger;
}
/**
 * Console-based logger implementation
 */
export declare class ConsoleLogger implements Logger {
    private defaultContext;
    private minLevel;
    constructor(minLevel?: LogLevel, defaultContext?: LogContext);
    debug(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, error?: Error, context?: LogContext): void;
    child(defaultContext: LogContext): Logger;
    private log;
    private shouldLog;
    private format;
}
/**
 * No-op logger for production when logging is disabled
 */
export declare class NullLogger implements Logger {
    debug(): void;
    info(): void;
    warn(): void;
    error(): void;
    child(): Logger;
}
/**
 * Set the global logger instance
 */
export declare function setGlobalLogger(logger: Logger): void;
/**
 * Get the global logger instance
 */
export declare function getLogger(context?: LogContext): Logger;
/**
 * Create a logger with default context
 */
export declare function createLogger(minLevel?: LogLevel, defaultContext?: LogContext): Logger;
//# sourceMappingURL=logger.d.ts.map