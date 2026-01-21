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
export class ConsoleLogger implements Logger {
  private defaultContext: LogContext;
  private minLevel: LogLevel;

  constructor(minLevel: LogLevel = 'info', defaultContext: LogContext = {}) {
    this.minLevel = minLevel;
    this.defaultContext = defaultContext;
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, context, error);
  }

  child(defaultContext: LogContext): Logger {
    return new ConsoleLogger(this.minLevel, {
      ...this.defaultContext,
      ...defaultContext,
    });
  }

  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context: { ...this.defaultContext, ...context },
      error,
    };

    const formatted = this.format(entry);

    switch (level) {
      case 'debug':
        console.debug(formatted);
        break;
      case 'info':
        console.info(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        if (error) {
          console.error(error);
        }
        break;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const minIndex = levels.indexOf(this.minLevel);
    const currentIndex = levels.indexOf(level);
    return currentIndex >= minIndex;
  }

  private format(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    const contextStr =
      entry.context && Object.keys(entry.context).length > 0
        ? ` ${JSON.stringify(entry.context)}`
        : '';

    return `[${timestamp}] ${level} ${entry.message}${contextStr}`;
  }
}

/**
 * No-op logger for production when logging is disabled
 */
export class NullLogger implements Logger {
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
  child(): Logger {
    return this;
  }
}

/**
 * Global logger instance
 */
let globalLogger: Logger = new ConsoleLogger('info');

/**
 * Set the global logger instance
 */
export function setGlobalLogger(logger: Logger): void {
  globalLogger = logger;
}

/**
 * Get the global logger instance
 */
export function getLogger(context?: LogContext): Logger {
  if (context) {
    return globalLogger.child(context);
  }
  return globalLogger;
}

/**
 * Create a logger with default context
 */
export function createLogger(
  minLevel: LogLevel = 'info',
  defaultContext?: LogContext
): Logger {
  return new ConsoleLogger(minLevel, defaultContext);
}
