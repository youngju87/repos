/**
 * Analytics Validation Tool
 *
 * A production-grade analytics validation platform for scanning websites,
 * detecting analytics tags, and validating implementation quality.
 *
 * @example
 * ```typescript
 * import { scanUrl, detectTags, shutdownDefaultBrowserManager } from 'analytics-validation-tool';
 *
 * // Scan a page
 * const scanResult = await scanUrl('https://example.com');
 *
 * // Detect tags
 * const detectionResult = await detectTags(scanResult);
 *
 * console.log(`Found ${detectionResult.tags.length} tags`);
 * console.log(`Analytics requests: ${scanResult.summary.analyticsRequests}`);
 *
 * // Clean up
 * await shutdownDefaultBrowserManager();
 * ```
 */

// Re-export all types
export * from './types';

// Re-export core functionality (scanning)
export * from './core';

// Re-export detection functionality
export * from './detection';

// Re-export validation functionality
export * from './validation';

// Re-export reporting functionality
export * from './reporting';
