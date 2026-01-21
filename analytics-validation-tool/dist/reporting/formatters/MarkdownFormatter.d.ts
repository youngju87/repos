/**
 * Markdown Formatter
 *
 * Formats reports as human-readable Markdown.
 */
import type { ReportFormatter, RunReport, PageReport, Issue } from '../types';
/**
 * Markdown Report Formatter
 */
export declare class MarkdownFormatter implements ReportFormatter {
    readonly format = "markdown";
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
    /**
     * Format list of issues
     */
    private formatIssuesList;
    /**
     * Format status with emoji
     */
    private formatStatus;
    /**
     * Format severity with emoji
     */
    private formatSeverity;
    /**
     * Format comparison status
     */
    private formatComparisonStatus;
    /**
     * Format delta with +/- prefix
     */
    private formatDelta;
    /**
     * Format value for display
     */
    private formatValue;
}
//# sourceMappingURL=MarkdownFormatter.d.ts.map