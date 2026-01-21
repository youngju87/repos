/**
 * JSON Formatter
 *
 * Formats reports as machine-readable JSON.
 */
import type { ReportFormatter, RunReport, PageReport, Issue } from '../types';
/**
 * JSON formatter options
 */
export interface JSONFormatterOptions {
    /** Pretty print output */
    prettyPrint?: boolean;
    /** Indentation (if pretty print) */
    indent?: number;
}
/**
 * JSON Report Formatter
 */
export declare class JSONFormatter implements ReportFormatter {
    private options;
    readonly format = "json";
    constructor(options?: JSONFormatterOptions);
    /**
     * Format a run report
     */
    formatRun(report: RunReport): string;
    /**
     * Format a page report
     */
    formatPage(report: PageReport): string;
    /**
     * Format issues
     */
    formatIssues(issues: Issue[]): string;
}
//# sourceMappingURL=JSONFormatter.d.ts.map