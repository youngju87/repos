/**
 * Evidence Extractor
 *
 * Transforms a PageScanResult into a normalized EvidenceContext
 * that detectors can easily query against.
 */

import type {
  PageScanResult,
  NetworkRequest,
  ScriptTag,
  DataLayerEvent,
} from '../types';
import type { EvidenceContext } from './types';

/**
 * Build an EvidenceContext from a PageScanResult
 */
export function buildEvidenceContext(scan: PageScanResult): EvidenceContext {
  // Build script URL index
  const scriptUrls: string[] = [];
  const scriptsByUrl = new Map<string, ScriptTag>();

  for (const script of scan.scripts) {
    if (script.src) {
      const lowerUrl = script.src.toLowerCase();
      scriptUrls.push(lowerUrl);
      scriptsByUrl.set(lowerUrl, script);
    }
  }

  // Build inline scripts index
  const inlineScripts: Array<{ content: string; tag: ScriptTag }> = [];
  for (const script of scan.scripts) {
    if (script.isInline && script.content) {
      inlineScripts.push({ content: script.content, tag: script });
    }
  }

  // Build request URL index
  const requestUrls: string[] = [];
  const requestsByUrl = new Map<string, NetworkRequest[]>();
  const analyticsRequests: NetworkRequest[] = [];

  for (const request of scan.networkRequests) {
    const lowerUrl = request.url.toLowerCase();
    requestUrls.push(lowerUrl);

    const existing = requestsByUrl.get(lowerUrl) || [];
    existing.push(request);
    requestsByUrl.set(lowerUrl, existing);

    if (request.isAnalyticsRequest) {
      analyticsRequests.push(request);
    }
  }

  // Build data layer index
  const dataLayerEvents = new Map<string, DataLayerEvent[]>();
  for (const event of scan.dataLayerEvents) {
    const existing = dataLayerEvents.get(event.dataLayerName) || [];
    existing.push(event);
    dataLayerEvents.set(event.dataLayerName, existing);
  }

  // Build cookie index
  const cookieNames: string[] = [];
  const cookiesByName = new Map<string, { name: string; value: string }>();
  for (const cookie of scan.cookies) {
    cookieNames.push(cookie.name.toLowerCase());
    cookiesByName.set(cookie.name.toLowerCase(), {
      name: cookie.name,
      value: cookie.value,
    });
  }

  // Build console messages index
  const consoleMessages = scan.consoleMessages.map((msg) => ({
    type: msg.type,
    text: msg.text,
  }));

  // Helper functions
  const hasScriptMatching = (pattern: string | RegExp): boolean => {
    if (typeof pattern === 'string') {
      const lowerPattern = pattern.toLowerCase();
      return scriptUrls.some((url) => url.includes(lowerPattern));
    }
    return scriptUrls.some((url) => pattern.test(url));
  };

  const hasRequestMatching = (pattern: string | RegExp): boolean => {
    if (typeof pattern === 'string') {
      const lowerPattern = pattern.toLowerCase();
      return requestUrls.some((url) => url.includes(lowerPattern));
    }
    return requestUrls.some((url) => pattern.test(url));
  };

  const getRequestsMatching = (pattern: string | RegExp): NetworkRequest[] => {
    const matches: NetworkRequest[] = [];
    for (const request of scan.networkRequests) {
      const url = request.url.toLowerCase();
      if (typeof pattern === 'string') {
        if (url.includes(pattern.toLowerCase())) {
          matches.push(request);
        }
      } else if (pattern.test(url)) {
        matches.push(request);
      }
    }
    return matches;
  };

  const hasCookie = (name: string | RegExp): boolean => {
    if (typeof name === 'string') {
      return cookiesByName.has(name.toLowerCase());
    }
    return cookieNames.some((n) => name.test(n));
  };

  const searchInlineScripts = (
    pattern: string | RegExp
  ): Array<{ match: string; script: ScriptTag }> => {
    const results: Array<{ match: string; script: ScriptTag }> = [];

    for (const { content, tag } of inlineScripts) {
      if (typeof pattern === 'string') {
        if (content.includes(pattern)) {
          results.push({ match: pattern, script: tag });
        }
      } else {
        const match = content.match(pattern);
        if (match) {
          results.push({ match: match[0], script: tag });
        }
      }
    }

    return results;
  };

  return {
    scan,
    scriptUrls,
    scriptsByUrl,
    inlineScripts,
    requestUrls,
    requestsByUrl,
    analyticsRequests,
    dataLayerEvents,
    cookieNames,
    cookiesByName,
    consoleMessages,
    hasScriptMatching,
    hasRequestMatching,
    getRequestsMatching,
    hasCookie,
    searchInlineScripts,
  };
}

/**
 * Extract query parameters from a URL
 */
export function extractQueryParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
  } catch {
    // Try to extract from query string portion
    const queryStart = url.indexOf('?');
    if (queryStart !== -1) {
      const queryString = url.slice(queryStart + 1);
      const pairs = queryString.split('&');
      for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key) {
          try {
            params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
          } catch {
            params[key] = value || '';
          }
        }
      }
    }
  }
  return params;
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

/**
 * Check if a URL matches a pattern
 */
export function urlMatches(url: string, pattern: string | RegExp): boolean {
  const lowerUrl = url.toLowerCase();
  if (typeof pattern === 'string') {
    return lowerUrl.includes(pattern.toLowerCase());
  }
  return pattern.test(lowerUrl);
}

/**
 * Parse a request payload (form data or JSON)
 */
export function parsePayload(
  request: NetworkRequest
): Record<string, unknown> | null {
  // Try parsed body first
  if (request.requestBodyParsed) {
    return request.requestBodyParsed;
  }

  // Try to parse raw body
  if (request.requestBody) {
    const body = request.requestBody;

    // Try JSON
    if (body.startsWith('{') || body.startsWith('[')) {
      try {
        return JSON.parse(body);
      } catch {
        // Not valid JSON
      }
    }

    // Try form data
    if (body.includes('=')) {
      return extractQueryParams('?' + body);
    }
  }

  // Try query parameters
  if (request.queryParams) {
    return request.queryParams;
  }

  return null;
}

/**
 * Get a nested value from an object using dot notation
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}
