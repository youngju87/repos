"use strict";
/**
 * Report Builder
 *
 * Aggregates scan, detection, and validation results into comprehensive reports.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportBuilder = void 0;
exports.createReportBuilder = createReportBuilder;
const uuid_1 = require("uuid");
const CIDetector_1 = require("./CIDetector");
/**
 * Report Builder
 */
class ReportBuilder {
    config;
    constructor(config = {}) {
        this.config = {
            environment: config.environment || process.env.NODE_ENV || 'unknown',
            thresholds: config.thresholds || {},
            baseline: config.baseline || undefined,
            toolVersion: config.toolVersion || '1.0.0',
            metadata: config.metadata || {},
        };
    }
    /**
     * Build a complete run report
     */
    buildRunReport(pageInputs) {
        const runId = (0, uuid_1.v4)();
        const timestamp = Date.now();
        // Build page reports
        const pageReports = pageInputs.map((input) => this.buildPageReport(input));
        // Calculate overall summary
        const summary = this.calculateRunSummary(pageReports);
        // Determine overall status
        const status = this.determineRunStatus(summary, this.config.thresholds);
        // Baseline comparison (if baseline provided)
        const baselineComparison = this.config.baseline
            ? this.compareWithBaseline(summary.issues, this.config.baseline)
            : undefined;
        // Detect CI context
        const ciContext = (0, CIDetector_1.detectCIContext)();
        return {
            id: runId,
            timestamp,
            environment: this.config.environment,
            config: {
                urls: pageInputs.map((p) => p.scan.url),
                thresholds: this.config.thresholds,
                baseline: this.config.baseline,
            },
            pages: pageReports,
            journeys: [], // To be implemented in Phase 5
            status,
            summary,
            baselineComparison,
            metadata: {
                toolVersion: this.config.toolVersion,
                ci: ciContext.platform !== 'unknown' ? ciContext : undefined,
                custom: this.config.metadata,
            },
        };
    }
    /**
     * Build a page report
     */
    buildPageReport(input) {
        const { scan, detection, validation } = input;
        // Extract issues from validation results
        const issues = validation
            ? this.extractIssuesFromValidation(validation, scan.url)
            : [];
        // Determine page status
        const status = this.determinePageStatus(issues, scan.success);
        // Calculate summary
        const issueSummary = this.calculateIssueSummary(issues);
        const scanDuration = scan.duration ?? (scan.completedAt - scan.startedAt);
        return {
            url: scan.url,
            timestamp: scan.timestamp ?? scan.startedAt,
            scanId: scan.id,
            detectionId: detection?.id,
            validationId: validation?.id,
            scan,
            detection,
            validation,
            issues,
            status,
            summary: {
                scanSuccess: scan.success,
                tagsDetected: detection?.tags.length || 0,
                validationScore: validation?.summary.score,
                rulesPassed: validation?.summary.passed || 0,
                rulesFailed: validation?.summary.failed || 0,
                issues: issueSummary,
            },
            performance: {
                scanDuration,
                detectionDuration: detection?.duration,
                validationDuration: validation?.duration,
                totalDuration: scanDuration + (detection?.duration || 0) + (validation?.duration || 0),
            },
        };
    }
    /**
     * Extract issues from validation results
     */
    extractIssuesFromValidation(validation, pageUrl) {
        const issues = [];
        for (const result of validation.results) {
            // Only include failed and error results
            if (result.status !== 'failed' && result.status !== 'error') {
                continue;
            }
            const issue = {
                id: (0, uuid_1.v4)(),
                severity: this.mapValidationSeverityToIssueSeverity(result.severity),
                ruleId: result.ruleId,
                ruleName: result.ruleName,
                message: result.message,
                details: result.details,
                platform: result.platform,
                pageUrl,
                evidence: result.evidence.map((ev) => ({
                    type: ev.type,
                    description: ev.description,
                    actual: ev.actual,
                    expected: ev.expected,
                })),
                suggestion: result.suggestion,
                category: this.categorizeIssue(result),
            };
            issues.push(issue);
        }
        return issues;
    }
    /**
     * Map validation severity to issue severity
     */
    mapValidationSeverityToIssueSeverity(severity) {
        // Add critical for blocking issues
        // For now, all errors are 'error', but we could add logic to mark some as 'critical'
        if (severity === 'error') {
            return 'error';
        }
        return severity;
    }
    /**
     * Categorize issue by rule type
     */
    categorizeIssue(result) {
        const ruleId = result.ruleId.toLowerCase();
        if (ruleId.includes('presence'))
            return 'presence';
        if (ruleId.includes('payload'))
            return 'payload';
        if (ruleId.includes('order'))
            return 'order';
        if (ruleId.includes('consent'))
            return 'consent';
        if (ruleId.includes('datalayer') || ruleId.includes('data-layer'))
            return 'data-layer';
        return 'other';
    }
    /**
     * Calculate issue summary
     */
    calculateIssueSummary(issues) {
        const summary = {
            total: issues.length,
            critical: 0,
            error: 0,
            warning: 0,
            info: 0,
            byPlatform: {},
            byCategory: {},
            issues,
        };
        for (const issue of issues) {
            // Count by severity
            summary[issue.severity]++;
            // Count by platform
            if (issue.platform) {
                summary.byPlatform[issue.platform] =
                    (summary.byPlatform[issue.platform] || 0) + 1;
            }
            // Count by category
            if (issue.category) {
                summary.byCategory[issue.category] =
                    (summary.byCategory[issue.category] || 0) + 1;
            }
        }
        return summary;
    }
    /**
     * Calculate run summary
     */
    calculateRunSummary(pageReports) {
        const allIssues = [];
        let totalDuration = 0;
        let pagesPassed = 0;
        let pagesFailed = 0;
        for (const page of pageReports) {
            allIssues.push(...page.issues);
            totalDuration += page.performance.totalDuration;
            if (page.status === 'passed') {
                pagesPassed++;
            }
            else {
                pagesFailed++;
            }
        }
        // Calculate overall score (average of page validation scores)
        const validationScores = pageReports
            .map((p) => p.summary.validationScore)
            .filter((s) => s !== undefined);
        const overallScore = validationScores.length > 0
            ? Math.round(validationScores.reduce((sum, s) => sum + s, 0) / validationScores.length)
            : 100;
        return {
            totalPages: pageReports.length,
            totalJourneys: 0, // Phase 5
            pagesPassed,
            pagesFailed,
            overallScore,
            issues: this.calculateIssueSummary(allIssues),
            totalDuration,
        };
    }
    /**
     * Determine page status
     */
    determinePageStatus(issues, scanSuccess) {
        if (!scanSuccess) {
            return 'error';
        }
        const hasCritical = issues.some((i) => i.severity === 'critical');
        const hasError = issues.some((i) => i.severity === 'error');
        const hasWarning = issues.some((i) => i.severity === 'warning');
        if (hasCritical || hasError) {
            return 'failed';
        }
        if (hasWarning) {
            return 'degraded';
        }
        return 'passed';
    }
    /**
     * Determine run status based on thresholds
     */
    determineRunStatus(summary, thresholds) {
        const { issues } = summary;
        // Check critical threshold
        if (thresholds.maxCritical !== undefined &&
            issues.critical > thresholds.maxCritical) {
            return 'failed';
        }
        // Check error threshold
        if (thresholds.maxErrors !== undefined && issues.error > thresholds.maxErrors) {
            return 'failed';
        }
        // Check warning threshold
        if (thresholds.maxWarnings !== undefined &&
            issues.warning > thresholds.maxWarnings) {
            if (thresholds.failOnWarnings) {
                return 'failed';
            }
            return 'degraded';
        }
        // Check minimum score
        if (thresholds.minScore !== undefined &&
            summary.overallScore < thresholds.minScore) {
            return 'failed';
        }
        // Has errors
        if (issues.error > 0 || issues.critical > 0) {
            return 'failed';
        }
        // Has warnings
        if (issues.warning > 0) {
            return 'degraded';
        }
        return 'passed';
    }
    /**
     * Compare with baseline
     */
    compareWithBaseline(currentIssues, baseline) {
        const issueCountDelta = currentIssues.total - baseline.issueCount;
        // Determine status
        let status;
        if (issueCountDelta < 0) {
            status = 'improved';
        }
        else if (issueCountDelta > 0) {
            status = 'degraded';
        }
        else {
            status = 'same';
        }
        // For now, we can't determine new/resolved issues without historical data
        // This would require storing previous run's issues
        // Placeholder implementation
        const newIssues = [];
        const resolvedIssues = [];
        const degradedIssues = [];
        return {
            baseline,
            status,
            issueCountDelta,
            scoreDelta: 0, // Would need to calculate from current score
            newIssues,
            resolvedIssues,
            degradedIssues,
        };
    }
}
exports.ReportBuilder = ReportBuilder;
/**
 * Create a report builder with default configuration
 */
function createReportBuilder(config) {
    return new ReportBuilder(config);
}
//# sourceMappingURL=ReportBuilder.js.map