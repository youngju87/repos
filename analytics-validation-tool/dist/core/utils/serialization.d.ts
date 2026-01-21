/**
 * Serialization Utilities
 *
 * Helpers for safely serializing data for storage and transmission.
 */
/**
 * Safely serialize a value to JSON, handling circular references
 * and truncating large strings.
 */
export declare function safeStringify(value: unknown, options?: {
    maxStringLength?: number;
    maxDepth?: number;
    indent?: number;
}): string;
/**
 * Safely parse JSON with error handling
 */
export declare function safeParse<T = unknown>(json: string, defaultValue?: T): T | undefined;
/**
 * Truncate a string to a maximum length
 */
export declare function truncate(str: string, maxLength: number, suffix?: string): string;
/**
 * Parse URL query string into object
 */
export declare function parseQueryString(queryString: string): Record<string, string>;
/**
 * Parse URL into components
 */
export declare function parseUrl(url: string): {
    protocol: string;
    hostname: string;
    port: string;
    pathname: string;
    search: string;
    hash: string;
    origin: string;
    queryParams: Record<string, string>;
} | null;
/**
 * Extract domain from URL
 */
export declare function extractDomain(url: string): string | null;
/**
 * Check if a URL matches a pattern (supports wildcards)
 */
export declare function matchUrlPattern(url: string, pattern: string): boolean;
/**
 * Deep clone an object (JSON-safe only)
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Merge objects deeply
 */
export declare function deepMerge<T extends Record<string, unknown>>(target: T, ...sources: Partial<T>[]): T;
/**
 * Safely get a nested property from an object
 */
export declare function getNestedProperty(obj: unknown, path: string, defaultValue?: unknown): unknown;
//# sourceMappingURL=serialization.d.ts.map