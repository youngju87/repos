"use strict";
/**
 * Convenience Functions
 *
 * High-level utility functions for common workflows.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditUrl = auditUrl;
exports.auditUrls = auditUrls;
exports.quickValidate = quickValidate;
exports.getAuditScore = getAuditScore;
exports.urlPassesValidation = urlPassesValidation;
const core_1 = require("./core");
const detection_1 = require("./detection");
const validation_1 = require("./validation");
const logger_1 = require("./core/utils/logger");
const validation_2 = require("./core/utils/validation");
const logger = (0, logger_1.getLogger)({ component: 'Convenience' });
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
async function auditUrl(url, rules, options) {
    // Validate URL
    (0, validation_2.validateUrl)(url);
    logger.info('Starting audit', { url });
    try {
        // Scan
        logger.debug('Scanning URL');
        const scan = await (0, core_1.scanUrl)(url, options);
        logger.debug('Scan complete', {
            requests: scan.networkRequests.length,
            scripts: scan.scripts.length,
            dataLayerEvents: scan.dataLayerEvents.length,
        });
        // Detect tags
        logger.debug('Detecting tags');
        const registry = (0, detection_1.getDefaultRegistry)();
        (0, detection_1.registerBuiltInDetectors)(registry);
        const detection = await (0, detection_1.detectTags)(scan);
        logger.debug('Detection complete', {
            tags: detection.tags.length,
            platforms: [...new Set(detection.tags.map((t) => t.platform))],
        });
        // Validate
        logger.debug('Running validation');
        const engine = (0, validation_1.createValidationEngine)();
        const validation = await engine.validate(scan, detection, rules);
        logger.info('Audit complete', {
            score: validation.summary.score,
            failed: validation.summary.failed,
            isValid: validation.summary.isValid,
        });
        return { scan, detection, validation };
    }
    catch (error) {
        logger.error('Audit failed', error, { url });
        throw error;
    }
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
async function auditUrls(urls, rules, options = {}) {
    const { scanOptions, concurrency = 3, onProgress, continueOnError = true, } = options;
    logger.info('Starting batch audit', {
        urls: urls.length,
        concurrency,
    });
    const results = new Map();
    let completed = 0;
    // Process URLs in chunks to respect concurrency
    for (let i = 0; i < urls.length; i += concurrency) {
        const chunk = urls.slice(i, i + concurrency);
        await Promise.all(chunk.map(async (url) => {
            try {
                const result = await auditUrl(url, rules, scanOptions);
                results.set(url, result);
            }
            catch (error) {
                results.set(url, error);
                if (!continueOnError) {
                    throw error;
                }
            }
            finally {
                completed++;
                if (onProgress) {
                    onProgress(completed, urls.length, url);
                }
            }
        }));
    }
    logger.info('Batch audit complete', {
        total: urls.length,
        successful: Array.from(results.values()).filter((r) => !(r instanceof Error)).length,
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
async function quickValidate(url, rules) {
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
async function getAuditScore(url, rules) {
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
async function urlPassesValidation(url, rules) {
    const validation = await quickValidate(url, rules);
    return validation.summary.isValid;
}
//# sourceMappingURL=convenience.js.map