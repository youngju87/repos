/**
 * Evidence Extractor
 *
 * Transforms a PageScanResult into a normalized EvidenceContext
 * that detectors can easily query against.
 */
import type { PageScanResult, NetworkRequest } from '../types';
import type { EvidenceContext } from './types';
/**
 * Build an EvidenceContext from a PageScanResult
 */
export declare function buildEvidenceContext(scan: PageScanResult): EvidenceContext;
/**
 * Extract query parameters from a URL
 */
export declare function extractQueryParams(url: string): Record<string, string>;
/**
 * Extract domain from URL
 */
export declare function extractDomain(url: string): string | null;
/**
 * Check if a URL matches a pattern
 */
export declare function urlMatches(url: string, pattern: string | RegExp): boolean;
/**
 * Parse a request payload (form data or JSON)
 */
export declare function parsePayload(request: NetworkRequest): Record<string, unknown> | null;
/**
 * Get a nested value from an object using dot notation
 */
export declare function getNestedValue(obj: unknown, path: string): unknown;
//# sourceMappingURL=EvidenceExtractor.d.ts.map