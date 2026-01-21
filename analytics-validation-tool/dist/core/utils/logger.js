"use strict";
/**
 * Structured Logging System
 *
 * Provides consistent logging interface across the application.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NullLogger = exports.ConsoleLogger = void 0;
exports.setGlobalLogger = setGlobalLogger;
exports.getLogger = getLogger;
exports.createLogger = createLogger;
/**
 * Console-based logger implementation
 */
class ConsoleLogger {
    defaultContext;
    minLevel;
    constructor(minLevel = 'info', defaultContext = {}) {
        this.minLevel = minLevel;
        this.defaultContext = defaultContext;
    }
    debug(message, context) {
        this.log('debug', message, context);
    }
    info(message, context) {
        this.log('info', message, context);
    }
    warn(message, context) {
        this.log('warn', message, context);
    }
    error(message, error, context) {
        this.log('error', message, context, error);
    }
    child(defaultContext) {
        return new ConsoleLogger(this.minLevel, {
            ...this.defaultContext,
            ...defaultContext,
        });
    }
    log(level, message, context, error) {
        if (!this.shouldLog(level)) {
            return;
        }
        const entry = {
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
    shouldLog(level) {
        const levels = ['debug', 'info', 'warn', 'error'];
        const minIndex = levels.indexOf(this.minLevel);
        const currentIndex = levels.indexOf(level);
        return currentIndex >= minIndex;
    }
    format(entry) {
        const timestamp = new Date(entry.timestamp).toISOString();
        const level = entry.level.toUpperCase().padEnd(5);
        const contextStr = entry.context && Object.keys(entry.context).length > 0
            ? ` ${JSON.stringify(entry.context)}`
            : '';
        return `[${timestamp}] ${level} ${entry.message}${contextStr}`;
    }
}
exports.ConsoleLogger = ConsoleLogger;
/**
 * No-op logger for production when logging is disabled
 */
class NullLogger {
    debug() { }
    info() { }
    warn() { }
    error() { }
    child() {
        return this;
    }
}
exports.NullLogger = NullLogger;
/**
 * Global logger instance
 */
let globalLogger = new ConsoleLogger('info');
/**
 * Set the global logger instance
 */
function setGlobalLogger(logger) {
    globalLogger = logger;
}
/**
 * Get the global logger instance
 */
function getLogger(context) {
    if (context) {
        return globalLogger.child(context);
    }
    return globalLogger;
}
/**
 * Create a logger with default context
 */
function createLogger(minLevel = 'info', defaultContext) {
    return new ConsoleLogger(minLevel, defaultContext);
}
//# sourceMappingURL=logger.js.map