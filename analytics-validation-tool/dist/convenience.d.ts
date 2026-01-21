/**
 * Convenience Functions
 *
 * High-level utility functions for common workflows.
 */
import type { PageScanResult, ScanOptions } from './core';
import type { TagDetectionResult } from './detection';
import type { ValidationReport, AnyRuleDef } from './validation';
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
export declare function auditUrl(url: string, rules: AnyRuleDef[], options?: Partial<ScanOptions>): Promise<AuditResult>;
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
export declare function auditUrls(urls: string[], rules: AnyRuleDef[], options?: BatchAuditOptions): Promise<Map<string, AuditResult | Error>>;
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
export declare function quickValidate(url: string, rules: AnyRuleDef[]): Promise<ValidationReport>;
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
export declare function getAuditScore(url: string, rules: AnyRuleDef[]): Promise<number>;
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
export declare function urlPassesValidation(url: string, rules: AnyRuleDef[]): Promise<boolean>;
//# sourceMappingURL=convenience.d.ts.map