/**
 * Timing Utilities
 *
 * Helper functions for timing operations and creating delays.
 */
/**
 * Create a promise that resolves after specified milliseconds
 */
export declare function delay(ms: number): Promise<void>;
/**
 * Create a promise that rejects after specified milliseconds
 */
export declare function timeout<T>(ms: number, message?: string): Promise<T>;
/**
 * Race a promise against a timeout
 */
export declare function withTimeout<T>(promise: Promise<T>, ms: number, message?: string): Promise<T>;
/**
 * High-resolution timer for measuring operations
 */
export declare class Timer {
    private startTime;
    private endTime?;
    private marks;
    private maxMarks;
    constructor(maxMarks?: number);
    /**
     * Mark a point in time with a label
     *
     * Note: Marks are bounded to prevent memory leaks. If maxMarks is exceeded,
     * the oldest mark will be removed.
     */
    mark(label: string): void;
    /**
     * Get elapsed time since start (or since a mark)
     */
    elapsed(fromMark?: string): number;
    /**
     * Get elapsed time between two marks
     */
    between(startMark: string, endMark: string): number | undefined;
    /**
     * Stop the timer
     */
    stop(): number;
    /**
     * Get all marks with their timestamps relative to start
     */
    getMarks(): Record<string, number>;
    /**
     * Get the number of marks currently stored
     */
    getMarkCount(): number;
    /**
     * Clear all marks
     */
    clearMarks(): void;
    /**
     * Get start timestamp (epoch ms)
     */
    getStartTimestamp(): number;
}
/**
 * Measure execution time of an async function
 */
export declare function measure<T>(fn: () => Promise<T>): Promise<{
    result: T;
    duration: number;
}>;
/**
 * Create a debounced version of a function
 */
export declare function debounce<T extends (...args: unknown[]) => unknown>(fn: T, waitMs: number): (...args: Parameters<T>) => void;
/**
 * Create a throttled version of a function
 */
export declare function throttle<T extends (...args: unknown[]) => unknown>(fn: T, limitMs: number): (...args: Parameters<T>) => void;
/**
 * Wait for a condition to become true
 */
export declare function waitFor(condition: () => boolean | Promise<boolean>, options?: {
    timeout?: number;
    interval?: number;
    message?: string;
}): Promise<void>;
//# sourceMappingURL=timing.d.ts.map