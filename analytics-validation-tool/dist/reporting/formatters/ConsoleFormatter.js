"use strict";
/**
 * Console Formatter
 *
 * Formats reports for terminal/console output with colors.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleFormatter = void 0;
/**
 * ANSI color codes
 */
const COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
};
/**
 * Console Report Formatter
 */
class ConsoleFormatter {
    options;
    format = 'console';
    constructor(options = {}) {
        this.options = options;
        this.options.useColors = options.useColors ?? true;
        this.options.verbose = options.verbose ?? false;
    }
    /**
     * Format a run report
     */
    formatRun(report) {
        const lines = [];
        // Header
        lines.push('');
        lines.push(this.colorize('='.repeat(80), 'dim'));
        lines.push(this.colorize('ANALYTICS VALIDATION REPORT', 'bright'));
        lines.push(this.colorize('='.repeat(80), 'dim'));
        lines.push('');
        // Status
        lines.push(`Status: ${this.formatStatus(report.status)}`);
        lines.push(`Environment: ${report.environment}`);
        lines.push(`Run ID: ${this.colorize(report.id, 'dim')}`);
        lines.push(`Timestamp: ${new Date(report.timestamp).toISOString()}`);
        lines.push('');
        // Summary
        lines.push(this.colorize('SUMMARY', 'bright'));
        lines.push(this.colorize('-'.repeat(80), 'dim'));
        lines.push(`Overall Score: ${this.formatScore(report.summary.overallScore)}`);
        lines.push(`Total Pages: ${report.summary.totalPages}`);
        lines.push(`Pages Passed: ${this.colorize(report.summary.pagesPassed.toString(), 'green')}`);
        lines.push(`Pages Failed: ${this.colorize(report.summary.pagesFailed.toString(), 'red')}`);
        lines.push(`Duration: ${report.summary.totalDuration}ms`);
        lines.push('');
        // Issues
        lines.push(this.colorize('ISSUES', 'bright'));
        lines.push(this.colorize('-'.repeat(80), 'dim'));
        lines.push(`Total: ${this.formatCount(report.summary.issues.total, report.summary.issues.total === 0 ? 'green' : 'red')}`);
        lines.push(`Critical: ${this.formatCount(report.summary.issues.critical, report.summary.issues.critical === 0 ? 'green' : 'red')}`);
        lines.push(`Errors: ${this.formatCount(report.summary.issues.error, report.summary.issues.error === 0 ? 'green' : 'red')}`);
        lines.push(`Warnings: ${this.formatCount(report.summary.issues.warning, report.summary.issues.warning === 0 ? 'green' : 'yellow')}`);
        lines.push(`Info: ${this.formatCount(report.summary.issues.info, 'cyan')}`);
        lines.push('');
        // Baseline Comparison
        if (report.baselineComparison) {
            lines.push(this.colorize('BASELINE COMPARISON', 'bright'));
            lines.push(this.colorize('-'.repeat(80), 'dim'));
            lines.push(`Status: ${this.formatComparisonStatus(report.baselineComparison.status)}`);
            lines.push(`Issue Count Change: ${this.formatDelta(report.baselineComparison.issueCountDelta)}`);
            if (report.baselineComparison.newIssues.length > 0) {
                lines.push(`New Issues: ${this.colorize(report.baselineComparison.newIssues.length.toString(), 'red')}`);
            }
            if (report.baselineComparison.resolvedIssues.length > 0) {
                lines.push(`Resolved Issues: ${this.colorize(report.baselineComparison.resolvedIssues.length.toString(), 'green')}`);
            }
            lines.push('');
        }
        // Issues Detail
        if (report.summary.issues.total > 0) {
            const criticalIssues = report.summary.issues.issues.filter((i) => i.severity === 'critical');
            const errorIssues = report.summary.issues.issues.filter((i) => i.severity === 'error');
            const warningIssues = report.summary.issues.issues.filter((i) => i.severity === 'warning');
            if (criticalIssues.length > 0) {
                lines.push(this.colorize('CRITICAL ISSUES', 'bright'));
                lines.push(this.colorize('-'.repeat(80), 'dim'));
                lines.push(...this.formatIssuesList(criticalIssues));
            }
            if (errorIssues.length > 0) {
                lines.push(this.colorize('ERRORS', 'bright'));
                lines.push(this.colorize('-'.repeat(80), 'dim'));
                lines.push(...this.formatIssuesList(errorIssues));
            }
            if (warningIssues.length > 0 && this.options.verbose) {
                lines.push(this.colorize('WARNINGS', 'bright'));
                lines.push(this.colorize('-'.repeat(80), 'dim'));
                lines.push(...this.formatIssuesList(warningIssues));
            }
        }
        // Page Summary
        lines.push(this.colorize('PAGES', 'bright'));
        lines.push(this.colorize('-'.repeat(80), 'dim'));
        for (const page of report.pages) {
            const statusIcon = page.status === 'passed' ? '✓' : '✗';
            const statusColor = page.status === 'passed' ? 'green' : 'red';
            lines.push(`${this.colorize(statusIcon, statusColor)} ${page.url} (${page.summary.issues.total} issues)`);
        }
        lines.push('');
        // Footer
        lines.push(this.colorize('='.repeat(80), 'dim'));
        if (report.status === 'passed') {
            lines.push(this.colorize('✓ VALIDATION PASSED', 'green'));
        }
        else {
            lines.push(this.colorize('✗ VALIDATION FAILED', 'red'));
        }
        lines.push(this.colorize('='.repeat(80), 'dim'));
        lines.push('');
        return lines.join('\n');
    }
    /**
     * Format a page report
     */
    formatPage(report) {
        const lines = [];
        lines.push('');
        lines.push(this.colorize('PAGE VALIDATION REPORT', 'bright'));
        lines.push(this.colorize('='.repeat(80), 'dim'));
        lines.push(`URL: ${report.url}`);
        lines.push(`Status: ${this.formatStatus(report.status)}`);
        lines.push('');
        lines.push(`Tags Detected: ${report.summary.tagsDetected}`);
        if (report.summary.validationScore !== undefined) {
            lines.push(`Validation Score: ${this.formatScore(report.summary.validationScore)}`);
        }
        lines.push(`Rules Passed: ${report.summary.rulesPassed}`);
        lines.push(`Rules Failed: ${report.summary.rulesFailed}`);
        lines.push('');
        if (report.issues.length > 0) {
            lines.push(this.colorize('ISSUES', 'bright'));
            lines.push(this.colorize('-'.repeat(80), 'dim'));
            lines.push(...this.formatIssuesList(report.issues));
        }
        return lines.join('\n');
    }
    /**
     * Format issues
     */
    formatIssues(issues) {
        const lines = [];
        lines.push('');
        lines.push(this.colorize(`ISSUES (${issues.length})`, 'bright'));
        lines.push(this.colorize('='.repeat(80), 'dim'));
        lines.push(...this.formatIssuesList(issues));
        return lines.join('\n');
    }
    /**
     * Format list of issues
     */
    formatIssuesList(issues) {
        const lines = [];
        for (const issue of issues) {
            const icon = this.getSeverityIcon(issue.severity);
            const severityColor = this.getSeverityColor(issue.severity);
            lines.push(`${this.colorize(icon, severityColor)} ${this.colorize(issue.ruleName, 'bright')}`);
            lines.push(`  ${issue.message}`);
            if (issue.platform) {
                lines.push(`  Platform: ${issue.platform}`);
            }
            if (this.options.verbose && issue.evidence.length > 0) {
                lines.push('  Evidence:');
                for (const ev of issue.evidence.slice(0, 3)) {
                    lines.push(`    - ${ev.description}`);
                    if (ev.expected !== undefined) {
                        lines.push(`      Expected: ${this.colorize(this.formatValue(ev.expected), 'green')}`);
                    }
                    if (ev.actual !== undefined) {
                        lines.push(`      Actual: ${this.colorize(this.formatValue(ev.actual), 'red')}`);
                    }
                }
                if (issue.evidence.length > 3) {
                    lines.push(`    ... and ${issue.evidence.length - 3} more`);
                }
            }
            if (issue.suggestion) {
                lines.push(`  ${this.colorize('→', 'cyan')} ${issue.suggestion}`);
            }
            lines.push('');
        }
        return lines;
    }
    /**
     * Format status
     */
    formatStatus(status) {
        switch (status) {
            case 'passed':
                return this.colorize('✓ Passed', 'green');
            case 'failed':
                return this.colorize('✗ Failed', 'red');
            case 'degraded':
                return this.colorize('⚠ Degraded', 'yellow');
            case 'error':
                return this.colorize('✗ Error', 'red');
            default:
                return status;
        }
    }
    /**
     * Format comparison status
     */
    formatComparisonStatus(status) {
        switch (status) {
            case 'improved':
                return this.colorize('↑ Improved', 'green');
            case 'same':
                return this.colorize('→ Same', 'cyan');
            case 'degraded':
                return this.colorize('↓ Degraded', 'red');
            case 'new':
                return this.colorize('• New', 'yellow');
            default:
                return status;
        }
    }
    /**
     * Format score
     */
    formatScore(score) {
        let color;
        if (score >= 90)
            color = 'green';
        else if (score >= 70)
            color = 'yellow';
        else
            color = 'red';
        return this.colorize(`${score}/100`, color);
    }
    /**
     * Format count
     */
    formatCount(count, color) {
        return this.colorize(count.toString(), color);
    }
    /**
     * Format delta
     */
    formatDelta(delta) {
        if (delta > 0) {
            return this.colorize(`+${delta}`, 'red');
        }
        else if (delta < 0) {
            return this.colorize(delta.toString(), 'green');
        }
        return this.colorize('0', 'cyan');
    }
    /**
     * Get severity icon
     */
    getSeverityIcon(severity) {
        switch (severity) {
            case 'critical':
                return '🔴';
            case 'error':
                return '✗';
            case 'warning':
                return '⚠';
            case 'info':
                return 'ℹ';
            default:
                return '•';
        }
    }
    /**
     * Get severity color
     */
    getSeverityColor(severity) {
        switch (severity) {
            case 'critical':
            case 'error':
                return 'red';
            case 'warning':
                return 'yellow';
            case 'info':
                return 'cyan';
            default:
                return 'white';
        }
    }
    /**
     * Format value
     */
    formatValue(value) {
        if (typeof value === 'string') {
            return value.length > 50 ? value.substring(0, 50) + '...' : value;
        }
        return JSON.stringify(value);
    }
    /**
     * Colorize text
     */
    colorize(text, color) {
        if (!this.options.useColors) {
            return text;
        }
        return `${COLORS[color]}${text}${COLORS.reset}`;
    }
}
exports.ConsoleFormatter = ConsoleFormatter;
//# sourceMappingURL=ConsoleFormatter.js.map