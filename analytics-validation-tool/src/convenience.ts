/**
 * Convenience Functions
 *
 * High-level utility functions for common workflows.
 */

import { scanUrl } from './core';
import { detectTags, getDefaultRegistry, registerBuiltInDetectors } from './detection';
import { createValidationEngine } from './validation';
import type { PageScanResult, ScanOptions } from './core';
import type { TagDetectionResult } from './detection';
import type { ValidationReport, AnyRuleDef } from './validation';
import { getLogger } from './core/utils/logger';
import { validateUrl } from './core/utils/validation';

const logger = getLogger({ component: 'Convenience' });

/**
 * Complete audit result
 */
export interface AuditResult {
  /** Scan results */
  scan: PageScanResult;

  /** Tag detection results */
  detection: TagDetectionResult;

  /** Validation results */
  validation: ValidationReport;
}

/**
 * All-in-one URL audit
 *
 * Performs complete scan → detect → validate workflow for a single URL.
 *
 * @param url - The URL to audit
 * @param rules - Validation rules to apply
 * @param options - Optional scan configuration
 *
 * @returns Complete audit results
 *
 * @example
 * ```typescript
 * const audit = await auditUrl(
 *   'https://example.com',
 *   await loadRules({ sources: [{ type: 'directory', path: './rules/ga4' }] }).then(r => r.rules)
 * );
 *
 * console.log(`Score: ${audit.validation.summary.score}/100`);
 * console.log(`Issues: ${audit.validation.summary.issues.total}`);
 * ```
 */
export async function auditUrl(
  url: string,
  rules: AnyRuleDef[],
  options?: Partial<ScanOptions>
): Promise<AuditResult> {
  // Validate URL
  validateUrl(url);

  logger.info('Starting audit', { url });

  try {
    // Scan
    logger.debug('Scanning URL');
    const scan = await scanUrl(url, options);
    logger.debug('Scan complete', {
      requests: scan.networkRequests.length,
      scripts: scan.scripts.length,
      dataLayerEvents: scan.dataLayerEvents.length,
    });

    // Detect tags
    logger.debug('Detecting tags');
    const registry = getDefaultRegistry();
    registerBuiltInDetectors(registry);
    const detection = await detectTags(scan);
    logger.debug('Detection complete', {
      tags: detection.tags.length,
      platforms: [...new Set(detection.tags.map((t) => t.platform))],
    });

    // Validate
    logger.debug('Running validation');
    const engine = createValidationEngine();
    const validation = await engine.validate(scan, detection, rules);
    logger.info('Audit complete', {
      score: validation.summary.score,
      failed: validation.summary.failed,
      isValid: validation.summary.isValid,
    });

    return { scan, detection, validation };
  } catch (error) {
    logger.error('Audit failed', error as Error, { url });
    throw error;
  }
}

/**
 * Batch URL audit options
 */
export interface BatchAuditOptions {
  /** Scan options for each URL */
  scanOptions?: Partial<ScanOptions>;

  /** Maximum concurrent scans */
  concurrency?: number;

  /** Progress callback */
  onProgress?: (completed: number, total: number, url: string) => void;

  /** Error handling strategy */
  continueOnError?: boolean;
}

/**
 * Batch URL audit with progress tracking
 *
 * Audits multiple URLs with concurrency control and progress reporting.
 *
 * @param urls - Array of URLs to audit
 * @param rules - Validation rules to apply to all URLs
 * @param options - Batch audit options
 *
 * @returns Map of URL to audit result (or error)
 *
 * @example
 * ```typescript
 * const results = await auditUrls(
 *   ['https://example.com', 'https://example.com/products'],
 *   rules,
 *   {
 *     concurrency: 3,
 *     onProgress: (completed, total, url) => {
 *       console.log(`${completed}/${total}: ${url}`);
 *     },
 *   }
 * );
 * ```
 */
export async function auditUrls(
  urls: string[],
  rules: AnyRuleDef[],
  options: BatchAuditOptions = {}
): Promise<Map<string, AuditResult | Error>> {
  const {
    scanOptions,
    concurrency = 3,
    onProgress,
    continueOnError = true,
  } = options;

  logger.info('Starting batch audit', {
    urls: urls.length,
    concurrency,
  });

  const results = new Map<string, AuditResult | Error>();
  let completed = 0;

  // Process URLs in chunks to respect concurrency
  for (let i = 0; i < urls.length; i += concurrency) {
    const chunk = urls.slice(i, i + concurrency);

    await Promise.all(
      chunk.map(async (url) => {
        try {
          const result = await auditUrl(url, rules, scanOptions);
          results.set(url, result);
        } catch (error) {
          results.set(url, error as Error);
          if (!continueOnError) {
            throw error;
          }
        } finally {
          completed++;
          if (onProgress) {
            onProgress(completed, urls.length, url);
          }
        }
      })
    );
  }

  logger.info('Batch audit complete', {
    total: urls.length,
    successful: Array.from(results.values()).filter(
      (r) => !(r instanceof Error)
    ).length,
    failed: Array.from(results.values()).filter((r) => r instanceof Error)
      .length,
  });

  return results;
}

/**
 * Quick validation check without full audit
 *
 * Lightweight check that returns only validation results.
 *
 * @param url - URL to validate
 * @param rules - Validation rules
 *
 * @returns Validation report only
 */
export async function quickValidate(
  url: string,
  rules: AnyRuleDef[]
): Promise<ValidationReport> {
  const audit = await auditUrl(url, rules, {
    timeout: 30000,
    waitUntil: 'domcontentloaded', // Faster than networkidle
    captureScreenshot: false,
  });

  return audit.validation;
}

/**
 * Get audit score only
 *
 * Returns just the validation score (0-100).
 *
 * @param url - URL to score
 * @param rules - Validation rules
 *
 * @returns Score from 0-100
 */
export async function getAuditScore(
  url: string,
  rules: AnyRuleDef[]
): Promise<number> {
  const validation = await quickValidate(url, rules);
  return validation.summary.score;
}

/**
 * Check if URL passes validation
 *
 * Returns simple boolean indicating if all validations passed.
 *
 * @param url - URL to check
 * @param rules - Validation rules
 *
 * @returns true if all validations passed
 */
export async function urlPassesValidation(
  url: string,
  rules: AnyRuleDef[]
): Promise<boolean> {
  const validation = await quickValidate(url, rules);
  return validation.summary.isValid;
}
