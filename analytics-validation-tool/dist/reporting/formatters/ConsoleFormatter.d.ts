/**
 * Console Formatter
 *
 * Formats reports for terminal/console output with colors.
 */
import type { ReportFormatter, RunReport, PageReport, Issue } from '../types';
/**
 * Console formatter options
 */
export interface ConsoleFormatterOptions {
    /** Use colors */
    useColors?: boolean;
    /** Show full details */
    verbose?: boolean;
}
/**
 * Console Report Formatter
 */
export declare class ConsoleFormatter implements ReportFormatter {
    private options;
    readonly format = "console";
    constructor(options?: ConsoleFormatterOptions);
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
     * Format status
     */
    private formatStatus;
    /**
     * Format comparison status
     */
    private formatComparisonStatus;
    /**
     * Format score
     */
    private formatScore;
    /**
     * Format count
     */
    private formatCount;
    /**
     * Format delta
     */
    private formatDelta;
    /**
     * Get severity icon
     */
    private getSeverityIcon;
    /**
     * Get severity color
     */
    private getSeverityColor;
    /**
     * Format value
     */
    private formatValue;
    /**
     * Colorize text
     */
    private colorize;
}
//# sourceMappingURL=ConsoleFormatter.d.ts.map