"use strict";
/**
 * Serialization Utilities
 *
 * Helpers for safely serializing data for storage and transmission.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeStringify = safeStringify;
exports.safeParse = safeParse;
exports.truncate = truncate;
exports.parseQueryString = parseQueryString;
exports.parseUrl = parseUrl;
exports.extractDomain = extractDomain;
exports.matchUrlPattern = matchUrlPattern;
exports.deepClone = deepClone;
exports.deepMerge = deepMerge;
exports.getNestedProperty = getNestedProperty;
/**
 * Maximum string length before truncation
 */
const MAX_STRING_LENGTH = 100000; // 100KB
/**
 * Maximum depth for object serialization
 */
const MAX_DEPTH = 10;
/**
 * Safely serialize a value to JSON, handling circular references
 * and truncating large strings.
 */
function safeStringify(value, options = {}) {
    const { maxStringLength = MAX_STRING_LENGTH, maxDepth: _maxDepth = MAX_DEPTH, indent, } = options;
    // _maxDepth is available for future depth-limiting implementation
    void _maxDepth;
    const seen = new WeakSet();
    function replacer(_key, val) {
        // Handle circular references
        if (typeof val === 'object' && val !== null) {
            if (seen.has(val)) {
                return '[Circular]';
            }
            seen.add(val);
        }
        // Truncate long strings
        if (typeof val === 'string' && val.length > maxStringLength) {
            return val.substring(0, maxStringLength) + `... [truncated, ${val.length} total chars]`;
        }
        // Handle special types
        if (val instanceof Error) {
            return {
                name: val.name,
                message: val.message,
                stack: val.stack,
            };
        }
        if (val instanceof RegExp) {
            return val.toString();
        }
        if (typeof val === 'function') {
            return `[Function: ${val.name || 'anonymous'}]`;
        }
        if (typeof val === 'bigint') {
            return val.toString();
        }
        if (val instanceof Map) {
            return Object.fromEntries(val);
        }
        if (val instanceof Set) {
            return Array.from(val);
        }
        if (typeof val === 'symbol') {
            return val.toString();
        }
        return val;
    }
    try {
        return JSON.stringify(value, replacer, indent);
    }
    catch (error) {
        return JSON.stringify({
            error: 'Failed to serialize',
            message: error instanceof Error ? error.message : String(error),
        });
    }
}
/**
 * Safely parse JSON with error handling
 */
function safeParse(json, defaultValue) {
    try {
        return JSON.parse(json);
    }
    catch {
        return defaultValue;
    }
}
/**
 * Truncate a string to a maximum length
 */
function truncate(str, maxLength, suffix = '...') {
    if (str.length <= maxLength) {
        return str;
    }
    return str.substring(0, maxLength - suffix.length) + suffix;
}
/**
 * Parse URL query string into object
 */
function parseQueryString(queryString) {
    const result = {};
    if (!queryString) {
        return result;
    }
    // Remove leading ? if present
    const qs = queryString.startsWith('?') ? queryString.slice(1) : queryString;
    for (const pair of qs.split('&')) {
        const [key, value] = pair.split('=').map((s) => {
            try {
                return decodeURIComponent(s.replace(/\+/g, ' '));
            }
            catch {
                return s;
            }
        });
        if (key) {
            result[key] = value ?? '';
        }
    }
    return result;
}
/**
 * Parse URL into components
 */
function parseUrl(url) {
    try {
        const parsed = new URL(url);
        return {
            protocol: parsed.protocol,
            hostname: parsed.hostname,
            port: parsed.port,
            pathname: parsed.pathname,
            search: parsed.search,
            hash: parsed.hash,
            origin: parsed.origin,
            queryParams: parseQueryString(parsed.search),
        };
    }
    catch {
        return null;
    }
}
/**
 * Extract domain from URL
 */
function extractDomain(url) {
    const parsed = parseUrl(url);
    return parsed?.hostname ?? null;
}
/**
 * Check if a URL matches a pattern (supports wildcards)
 */
function matchUrlPattern(url, pattern) {
    // Convert wildcard pattern to regex
    const regexPattern = pattern
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special chars except *
        .replace(/\*/g, '.*'); // Convert * to .*
    try {
        const regex = new RegExp(`^${regexPattern}$`, 'i');
        return regex.test(url);
    }
    catch {
        return false;
    }
}
/**
 * Deep clone an object (JSON-safe only)
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
/**
 * Merge objects deeply
 */
function deepMerge(target, ...sources) {
    const result = { ...target };
    for (const source of sources) {
        for (const key in source) {
            const sourceValue = source[key];
            const targetValue = result[key];
            if (sourceValue !== null &&
                typeof sourceValue === 'object' &&
                !Array.isArray(sourceValue) &&
                targetValue !== null &&
                typeof targetValue === 'object' &&
                !Array.isArray(targetValue)) {
                result[key] = deepMerge(targetValue, sourceValue);
            }
            else if (sourceValue !== undefined) {
                result[key] = sourceValue;
            }
        }
    }
    return result;
}
/**
 * Safely get a nested property from an object
 */
function getNestedProperty(obj, path, defaultValue) {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
        if (current === null || current === undefined) {
            return defaultValue;
        }
        if (typeof current !== 'object') {
            return defaultValue;
        }
        current = current[key];
    }
    return current ?? defaultValue;
}
//# sourceMappingURL=serialization.js.map