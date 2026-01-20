/**
 * Timing Utilities
 *
 * Helper functions for timing operations and creating delays.
 */

/**
 * Create a promise that resolves after specified milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a promise that rejects after specified milliseconds
 */
export function timeout<T>(ms: number, message?: string): Promise<T> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(message ?? `Operation timed out after ${ms}ms`));
    }, ms);
  });
}

/**
 * Race a promise against a timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message?: string
): Promise<T> {
  return Promise.race([promise, timeout<T>(ms, message)]);
}

/**
 * High-resolution timer for measuring operations
 */
export class Timer {
  private startTime: number;
  private endTime?: number;
  private marks: Map<string, number> = new Map();

  constructor() {
    this.startTime = performance.now();
  }

  /**
   * Mark a point in time with a label
   */
  mark(label: string): void {
    this.marks.set(label, performance.now());
  }

  /**
   * Get elapsed time since start (or since a mark)
   */
  elapsed(fromMark?: string): number {
    const from = fromMark ? (this.marks.get(fromMark) ?? this.startTime) : this.startTime;
    const to = this.endTime ?? performance.now();
    return Math.round(to - from);
  }

  /**
   * Get elapsed time between two marks
   */
  between(startMark: string, endMark: string): number | undefined {
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
  stop(): number {
    this.endTime = performance.now();
    return this.elapsed();
  }

  /**
   * Get all marks with their timestamps relative to start
   */
  getMarks(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [label, time] of this.marks) {
      result[label] = Math.round(time - this.startTime);
    }
    return result;
  }

  /**
   * Get start timestamp (epoch ms)
   */
  getStartTimestamp(): number {
    return Date.now() - this.elapsed();
  }
}

/**
 * Measure execution time of an async function
 */
export async function measure<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const timer = new Timer();
  const result = await fn();
  return { result, duration: timer.stop() };
}

/**
 * Create a debounced version of a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: Parameters<T>): void => {
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
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let lastRun = 0;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: Parameters<T>): void => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRun;

    if (timeSinceLastRun >= limitMs) {
      lastRun = now;
      fn(...args);
    } else if (!timeoutId) {
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
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  options: {
    timeout?: number;
    interval?: number;
    message?: string;
  } = {}
): Promise<void> {
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
