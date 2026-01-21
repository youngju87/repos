/**
 * Retry Logic with Exponential Backoff
 *
 * Utilities for retrying failed operations with configurable backoff strategies.
 */

import { getLogger } from './logger';

const logger = getLogger({ component: 'Retry' });

/**
 * Retry configuration options
 */
export interface RetryOptions {
  /** Maximum number of attempts (including initial attempt) */
  maxAttempts: number;

  /** Initial delay in milliseconds */
  initialDelay: number;

  /** Maximum delay in milliseconds */
  maxDelay: number;

  /** Backoff multiplier (exponential growth factor) */
  backoffMultiplier: number;

  /** Only retry these specific error types (if specified) */
  retryableErrors?: Array<new (...args: any[]) => Error>;

  /** Custom function to determine if error is retryable */
  shouldRetry?: (error: Error, attempt: number) => boolean;

  /** Callback invoked before each retry */
  onRetry?: (error: Error, attempt: number, delay: number) => void;
}

/**
 * Default retry options
 */
export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
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
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts: RetryOptions = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options,
  };

  let lastError: Error | undefined;
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
    } catch (error) {
      lastError = error as Error;

      // Last attempt failed
      if (attempt >= opts.maxAttempts) {
        logger.error('Operation failed after all retries', lastError, {
          attempt,
          maxAttempts: opts.maxAttempts,
        });
        break;
      }

      // Check if error is retryable
      if (!isRetryable(error as Error, attempt, opts)) {
        logger.warn('Error is not retryable, aborting', {
          error: (error as Error).message,
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
        error: (error as Error).message,
      });

      // Invoke callback if provided
      if (opts.onRetry) {
        opts.onRetry(error as Error, attempt, delay);
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
function calculateDelay(attemptIndex: number, options: RetryOptions): number {
  const exponentialDelay =
    options.initialDelay * Math.pow(options.backoffMultiplier, attemptIndex);

  // Add jitter (±10%) to prevent thundering herd
  const jitter = exponentialDelay * 0.1 * (Math.random() * 2 - 1);

  return Math.min(exponentialDelay + jitter, options.maxDelay);
}

/**
 * Determine if an error is retryable
 */
function isRetryable(
  error: Error,
  attempt: number,
  options: RetryOptions
): boolean {
  // Use custom retry logic if provided
  if (options.shouldRetry) {
    return options.shouldRetry(error, attempt);
  }

  // Check if error type is in retryable list
  if (options.retryableErrors && options.retryableErrors.length > 0) {
    return options.retryableErrors.some(
      (ErrorClass) => error instanceof ErrorClass
    );
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
export async function retryOnErrors<T>(
  operation: () => Promise<T>,
  retryableErrors: Array<new (...args: any[]) => Error>,
  options: Partial<Omit<RetryOptions, 'retryableErrors'>> = {}
): Promise<T> {
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
export async function retryWithTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  return withRetry(async () => {
    return Promise.race([
      operation(),
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
          timeoutMs
        )
      ),
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
export class Retry<T> {
  private options: Partial<RetryOptions> = {};

  maxAttempts(value: number): this {
    this.options.maxAttempts = value;
    return this;
  }

  initialDelay(value: number): this {
    this.options.initialDelay = value;
    return this;
  }

  maxDelay(value: number): this {
    this.options.maxDelay = value;
    return this;
  }

  backoffMultiplier(value: number): this {
    this.options.backoffMultiplier = value;
    return this;
  }

  onlyErrors(errors: Array<new (...args: any[]) => Error>): this {
    this.options.retryableErrors = errors;
    return this;
  }

  shouldRetry(fn: (error: Error, attempt: number) => boolean): this {
    this.options.shouldRetry = fn;
    return this;
  }

  onRetry(fn: (error: Error, attempt: number, delay: number) => void): this {
    this.options.onRetry = fn;
    return this;
  }

  async execute(operation: () => Promise<T>): Promise<T> {
    return withRetry(operation, this.options);
  }
}
