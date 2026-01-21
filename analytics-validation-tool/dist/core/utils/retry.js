"use strict";
/**
 * Retry Logic with Exponential Backoff
 *
 * Utilities for retrying failed operations with configurable backoff strategies.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Retry = exports.DEFAULT_RETRY_OPTIONS = void 0;
exports.withRetry = withRetry;
exports.retryOnErrors = retryOnErrors;
exports.retryWithTimeout = retryWithTimeout;
const logger_1 = require("./logger");
const logger = (0, logger_1.getLogger)({ component: 'Retry' });
/**
 * Default retry options
 */
exports.DEFAULT_RETRY_OPTIONS = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
};
/**
 * Retry an async operation with exponential backoff
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   async () => await fetchData(),
 *   {
 *     maxAttempts: 3,
 *     initialDelay: 1000,
 *     retryableErrors: [NetworkError, TimeoutError],
 *   }
 * );
 * ```
 */
async function withRetry(operation, options = {}) {
    const opts = {
        ...exports.DEFAULT_RETRY_OPTIONS,
        ...options,
    };
    let lastError;
    let attempt = 0;
    while (attempt < opts.maxAttempts) {
        attempt++;
        try {
            const result = await operation();
            if (attempt > 1) {
                logger.info('Operation succeeded after retry', {
                    attempt,
                    totalAttempts: opts.maxAttempts,
                });
            }
            return result;
        }
        catch (error) {
            lastError = error;
            // Last attempt failed
            if (attempt >= opts.maxAttempts) {
                logger.error('Operation failed after all retries', lastError, {
                    attempt,
                    maxAttempts: opts.maxAttempts,
                });
                break;
            }
            // Check if error is retryable
            if (!isRetryable(error, attempt, opts)) {
                logger.warn('Error is not retryable, aborting', {
                    error: error.message,
                    attempt,
                });
                throw error;
            }
            // Calculate delay with exponential backoff
            const delay = calculateDelay(attempt - 1, opts);
            logger.debug('Retrying operation', {
                attempt,
                maxAttempts: opts.maxAttempts,
                delay,
                error: error.message,
            });
            // Invoke callback if provided
            if (opts.onRetry) {
                opts.onRetry(error, attempt, delay);
            }
            // Wait before retry
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}
/**
 * Calculate delay for a specific attempt with exponential backoff
 */
function calculateDelay(attemptIndex, options) {
    const exponentialDelay = options.initialDelay * Math.pow(options.backoffMultiplier, attemptIndex);
    // Add jitter (±10%) to prevent thundering herd
    const jitter = exponentialDelay * 0.1 * (Math.random() * 2 - 1);
    return Math.min(exponentialDelay + jitter, options.maxDelay);
}
/**
 * Determine if an error is retryable
 */
function isRetryable(error, attempt, options) {
    // Use custom retry logic if provided
    if (options.shouldRetry) {
        return options.shouldRetry(error, attempt);
    }
    // Check if error type is in retryable list
    if (options.retryableErrors && options.retryableErrors.length > 0) {
        return options.retryableErrors.some((ErrorClass) => error instanceof ErrorClass);
    }
    // Default: retry all errors
    return true;
}
/**
 * Retry with specific error types only
 *
 * @example
 * ```typescript
 * const result = await retryOnErrors(
 *   async () => await operation(),
 *   [NetworkError, TimeoutError],
 *   { maxAttempts: 5 }
 * );
 * ```
 */
async function retryOnErrors(operation, retryableErrors, options = {}) {
    return withRetry(operation, {
        ...options,
        retryableErrors,
    });
}
/**
 * Retry with timeout per attempt
 *
 * @example
 * ```typescript
 * const result = await retryWithTimeout(
 *   async () => await operation(),
 *   5000, // 5 second timeout per attempt
 *   { maxAttempts: 3 }
 * );
 * ```
 */
async function retryWithTimeout(operation, timeoutMs, options = {}) {
    return withRetry(async () => {
        return Promise.race([
            operation(),
            new Promise((_, reject) => setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)),
        ]);
    }, options);
}
/**
 * Retry class for fluent API
 *
 * @example
 * ```typescript
 * const result = await new Retry()
 *   .maxAttempts(5)
 *   .initialDelay(2000)
 *   .onlyErrors([NetworkError])
 *   .execute(async () => await operation());
 * ```
 */
class Retry {
    options = {};
    maxAttempts(value) {
        this.options.maxAttempts = value;
        return this;
    }
    initialDelay(value) {
        this.options.initialDelay = value;
        return this;
    }
    maxDelay(value) {
        this.options.maxDelay = value;
        return this;
    }
    backoffMultiplier(value) {
        this.options.backoffMultiplier = value;
        return this;
    }
    onlyErrors(errors) {
        this.options.retryableErrors = errors;
        return this;
    }
    shouldRetry(fn) {
        this.options.shouldRetry = fn;
        return this;
    }
    onRetry(fn) {
        this.options.onRetry = fn;
        return this;
    }
    async execute(operation) {
        return withRetry(operation, this.options);
    }
}
exports.Retry = Retry;
//# sourceMappingURL=retry.js.map