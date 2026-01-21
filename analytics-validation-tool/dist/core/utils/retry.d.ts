/**
 * Retry Logic with Exponential Backoff
 *
 * Utilities for retrying failed operations with configurable backoff strategies.
 */
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
export declare const DEFAULT_RETRY_OPTIONS: RetryOptions;
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
export declare function withRetry<T>(operation: () => Promise<T>, options?: Partial<RetryOptions>): Promise<T>;
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
export declare function retryOnErrors<T>(operation: () => Promise<T>, retryableErrors: Array<new (...args: any[]) => Error>, options?: Partial<Omit<RetryOptions, 'retryableErrors'>>): Promise<T>;
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
export declare function retryWithTimeout<T>(operation: () => Promise<T>, timeoutMs: number, options?: Partial<RetryOptions>): Promise<T>;
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
export declare class Retry<T> {
    private options;
    maxAttempts(value: number): this;
    initialDelay(value: number): this;
    maxDelay(value: number): this;
    backoffMultiplier(value: number): this;
    onlyErrors(errors: Array<new (...args: any[]) => Error>): this;
    shouldRetry(fn: (error: Error, attempt: number) => boolean): this;
    onRetry(fn: (error: Error, attempt: number, delay: number) => void): this;
    execute(operation: () => Promise<T>): Promise<T>;
}
//# sourceMappingURL=retry.d.ts.map