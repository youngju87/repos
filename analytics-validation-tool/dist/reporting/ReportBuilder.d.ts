/**
 * Report Builder
 *
 * Aggregates scan, detection, and validation results into comprehensive reports.
 */
import type { RunReport, PageReport, RunThresholds, RunBaseline } from './types';
import type { PageScanResult } from '../types';
import type { TagDetectionResult } from '../detection/types';
import type { ValidationReport } from '../validation/types';
/**
 * Report builder configuration
 */
export interface ReportBuilderConfig {
    /** Environment name */
    environment?: string;
    /** Run thresholds */
    thresholds?: RunThresholds;
    /** Baseline for comparison */
    baseline?: RunBaseline;
    /** Tool version */
    toolVersion?: string;
    /** Custom metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Input for building a page report
 */
export interface PageReportInput {
    scan: PageScanResult;
    detection?: TagDetectionResult;
    validation?: ValidationReport;
}
/**
 * Report Builder
 */
export declare class ReportBuilder {
    private config;
    constructor(config?: ReportBuilderConfig);
    /**
     * Build a complete run report
     */
    buildRunReport(pageInputs: PageReportInput[]): RunReport;
    /**
     * Build a page report
     */
    buildPageReport(input: PageReportInput): PageReport;
    /**
     * Extract issues from validation results
     */
    private extractIssuesFromValidation;
    /**
     * Map validation severity to issue severity
     */
    private mapValidationSeverityToIssueSeverity;
    /**
     * Categorize issue by rule type
     */
    private categorizeIssue;
    /**
     * Calculate issue summary
     */
    private calculateIssueSummary;
    /**
     * Calculate run summary
     */
    private calculateRunSummary;
    /**
     * Determine page status
     */
    private determinePageStatus;
    /**
     * Determine run status based on thresholds
     */
    private determineRunStatus;
    /**
     * Compare with baseline
     */
    private compareWithBaseline;
}
/**
 * Create a report builder with default configuration
 */
export declare function createReportBuilder(config?: ReportBuilderConfig): ReportBuilder;
//# sourceMappingURL=ReportBuilder.d.ts.map