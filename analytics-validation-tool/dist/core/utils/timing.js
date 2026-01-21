"use strict";
/**
 * Timing Utilities
 *
 * Helper functions for timing operations and creating delays.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timer = void 0;
exports.delay = delay;
exports.timeout = timeout;
exports.withTimeout = withTimeout;
exports.measure = measure;
exports.debounce = debounce;
exports.throttle = throttle;
exports.waitFor = waitFor;
/**
 * Create a promise that resolves after specified milliseconds
 */
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Create a promise that rejects after specified milliseconds
 */
function timeout(ms, message) {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error(message ?? `Operation timed out after ${ms}ms`));
        }, ms);
    });
}
/**
 * Race a promise against a timeout
 */
async function withTimeout(promise, ms, message) {
    return Promise.race([promise, timeout(ms, message)]);
}
/**
 * High-resolution timer for measuring operations
 */
class Timer {
    startTime;
    endTime;
    marks = new Map();
    maxMarks;
    constructor(maxMarks = 1000) {
        this.startTime = performance.now();
        this.maxMarks = maxMarks;
    }
    /**
     * Mark a point in time with a label
     *
     * Note: Marks are bounded to prevent memory leaks. If maxMarks is exceeded,
     * the oldest mark will be removed.
     */
    mark(label) {
        // Remove oldest mark if at capacity
        if (this.marks.size >= this.maxMarks && !this.marks.has(label)) {
            const firstKey = this.marks.keys().next().value;
            if (firstKey !== undefined) {
                this.marks.delete(firstKey);
            }
        }
        this.marks.set(label, performance.now());
    }
    /**
     * Get elapsed time since start (or since a mark)
     */
    elapsed(fromMark) {
        const from = fromMark ? (this.marks.get(fromMark) ?? this.startTime) : this.startTime;
        const to = this.endTime ?? performance.now();
        return Math.round(to - from);
    }
    /**
     * Get elapsed time between two marks
     */
    between(startMark, endMark) {
        const start = this.marks.get(startMark);
        const end = this.marks.get(endMark);
        if (start === undefined || end === undefined) {
            return undefined;
        }
        return Math.round(end - start);
    }
    /**
     * Stop the timer
     */
    stop() {
        this.endTime = performance.now();
        return this.elapsed();
    }
    /**
     * Get all marks with their timestamps relative to start
     */
    getMarks() {
        const result = {};
        for (const [label, time] of this.marks) {
            result[label] = Math.round(time - this.startTime);
        }
        return result;
    }
    /**
     * Get the number of marks currently stored
     */
    getMarkCount() {
        return this.marks.size;
    }
    /**
     * Clear all marks
     */
    clearMarks() {
        this.marks.clear();
    }
    /**
     * Get start timestamp (epoch ms)
     */
    getStartTimestamp() {
        return Date.now() - this.elapsed();
    }
}
exports.Timer = Timer;
/**
 * Measure execution time of an async function
 */
async function measure(fn) {
    const timer = new Timer();
    const result = await fn();
    return { result, duration: timer.stop() };
}
/**
 * Create a debounced version of a function
 */
function debounce(fn, waitMs) {
    let timeoutId;
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
        }, waitMs);
    };
}
/**
 * Create a throttled version of a function
 */
function throttle(fn, limitMs) {
    let lastRun = 0;
    let timeoutId;
    return (...args) => {
        const now = Date.now();
        const timeSinceLastRun = now - lastRun;
        if (timeSinceLastRun >= limitMs) {
            lastRun = now;
            fn(...args);
        }
        else if (!timeoutId) {
            timeoutId = setTimeout(() => {
                lastRun = Date.now();
                timeoutId = undefined;
                fn(...args);
            }, limitMs - timeSinceLastRun);
        }
    };
}
/**
 * Wait for a condition to become true
 */
async function waitFor(condition, options = {}) {
    const { timeout: timeoutMs = 30000, interval = 100, message } = options;
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
        if (await condition()) {
            return;
        }
        await delay(interval);
    }
    throw new Error(message ?? `Condition not met within ${timeoutMs}ms`);
}
//# sourceMappingURL=timing.js.map