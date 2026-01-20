/**
 * Serialization Utilities
 *
 * Helpers for safely serializing data for storage and transmission.
 */

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
export function safeStringify(
  value: unknown,
  options: {
    maxStringLength?: number;
    maxDepth?: number;
    indent?: number;
  } = {}
): string {
  const {
    maxStringLength = MAX_STRING_LENGTH,
    maxDepth = MAX_DEPTH,
    indent,
  } = options;

  const seen = new WeakSet();

  function replacer(this: unknown, key: string, val: unknown): unknown {
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
  } catch (error) {
    return JSON.stringify({
      error: 'Failed to serialize',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Safely parse JSON with error handling
 */
export function safeParse<T = unknown>(json: string, defaultValue?: T): T | undefined {
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Truncate a string to a maximum length
 */
export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Parse URL query string into object
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const result: Record<string, string> = {};

  if (!queryString) {
    return result;
  }

  // Remove leading ? if present
  const qs = queryString.startsWith('?') ? queryString.slice(1) : queryString;

  for (const pair of qs.split('&')) {
    const [key, value] = pair.split('=').map((s) => {
      try {
        return decodeURIComponent(s.replace(/\+/g, ' '));
      } catch {
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
export function parseUrl(url: string): {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
  queryParams: Record<string, string>;
} | null {
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
  } catch {
    return null;
  }
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string | null {
  const parsed = parseUrl(url);
  return parsed?.hostname ?? null;
}

/**
 * Check if a URL matches a pattern (supports wildcards)
 */
export function matchUrlPattern(url: string, pattern: string): boolean {
  // Convert wildcard pattern to regex
  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special chars except *
    .replace(/\*/g, '.*'); // Convert * to .*

  try {
    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(url);
  } catch {
    return false;
  }
}

/**
 * Deep clone an object (JSON-safe only)
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge objects deeply
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  const result = { ...target };

  for (const source of sources) {
    for (const key in source) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue !== null &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        (result as Record<string, unknown>)[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        );
      } else if (sourceValue !== undefined) {
        (result as Record<string, unknown>)[key] = sourceValue;
      }
    }
  }

  return result;
}

/**
 * Safely get a nested property from an object
 */
export function getNestedProperty(
  obj: unknown,
  path: string,
  defaultValue?: unknown
): unknown {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return defaultValue;
    }
    if (typeof current !== 'object') {
      return defaultValue;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current ?? defaultValue;
}
