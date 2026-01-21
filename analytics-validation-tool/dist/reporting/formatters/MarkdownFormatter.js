"use strict";
/**
 * Markdown Formatter
 *
 * Formats reports as human-readable Markdown.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownFormatter = void 0;
/**
 * Markdown Report Formatter
 */
class MarkdownFormatter {
    format = 'markdown';
    /**
     * Format a run report
     */
    formatRun(report) {
        const lines = [];
        // Header
        lines.push('# Analytics Validation Report');
        lines.push('');
        lines.push(`**Run ID**: \`${report.id}\``);
        lines.push(`**Environment**: ${report.environment}`);
        lines.push(`**Timestamp**: ${new Date(report.timestamp).toISOString()}`);
        lines.push(`**Status**: ${this.formatStatus(report.status)}`);
        lines.push('');
        // Overall Summary
        lines.push('## Summary');
        lines.push('');
        lines.push(`- **Overall Score**: ${report.summary.overallScore}/100`);
        lines.push(`- **Total Pages**: ${report.summary.totalPages}`);
        lines.push(`- **Pages Passed**: ${report.summary.pagesPassed}`);
        lines.push(`- **Pages Failed**: ${report.summary.pagesFailed}`);
        lines.push(`- **Total Duration**: ${report.summary.totalDuration}ms`);
        lines.push('');
        // Issue Summary
        lines.push('### Issues');
        lines.push('');
        lines.push(`- **Total**: ${report.summary.issues.total}`);
        lines.push(`- **Critical**: ${report.summary.issues.critical}`);
        lines.push(`- **Errors**: ${report.summary.issues.error}`);
        lines.push(`- **Warnings**: ${report.summary.issues.warning}`);
        lines.push(`- **Info**: ${report.summary.issues.info}`);
        lines.push('');
        // Baseline Comparison
        if (report.baselineComparison) {
            lines.push('### Baseline Comparison');
            lines.push('');
            lines.push(`- **Status**: ${this.formatComparisonStatus(report.baselineComparison.status)}`);
            lines.push(`- **Issue Count Change**: ${this.formatDelta(report.baselineComparison.issueCountDelta)}`);
            if (report.baselineComparison.newIssues.length > 0) {
                lines.push(`- **New Issues**: ${report.baselineComparison.newIssues.length}`);
            }
            if (report.baselineComparison.resolvedIssues.length > 0) {
                lines.push(`- **Resolved Issues**: ${report.baselineComparison.resolvedIssues.length}`);
            }
            lines.push('');
        }
        // CI Context
        if (report.metadata.ci) {
            lines.push('### CI/CD Context');
            lines.push('');
            lines.push(`- **Platform**: ${report.metadata.ci.platform}`);
            if (report.metadata.ci.buildId) {
                lines.push(`- **Build ID**: ${report.metadata.ci.buildId}`);
            }
            if (report.metadata.ci.commitSha) {
                lines.push(`- **Commit**: \`${report.metadata.ci.commitSha.substring(0, 8)}\``);
            }
            if (report.metadata.ci.branch) {
                lines.push(`- **Branch**: ${report.metadata.ci.branch}`);
            }
            if (report.metadata.ci.prNumber) {
                lines.push(`- **PR**: #${report.metadata.ci.prNumber}`);
            }
            lines.push('');
        }
        // Issues by Severity
        if (report.summary.issues.total > 0) {
            lines.push('## Issues');
            lines.push('');
            // Group issues by severity
            const criticalIssues = report.summary.issues.issues.filter(i => i.severity === 'critical');
            const errorIssues = report.summary.issues.issues.filter(i => i.severity === 'error');
            const warningIssues = report.summary.issues.issues.filter(i => i.severity === 'warning');
            const infoIssues = report.summary.issues.issues.filter(i => i.severity === 'info');
            if (criticalIssues.length > 0) {
                lines.push('### 🔴 Critical Issues');
                lines.push('');
                lines.push(...this.formatIssuesList(criticalIssues));
            }
            if (errorIssues.length > 0) {
                lines.push('### ❌ Errors');
                lines.push('');
                lines.push(...this.formatIssuesList(errorIssues));
            }
            if (warningIssues.length > 0) {
                lines.push('### ⚠️ Warnings');
                lines.push('');
                lines.push(...this.formatIssuesList(warningIssues));
            }
            if (infoIssues.length > 0) {
                lines.push('### ℹ️ Info');
                lines.push('');
                lines.push(...this.formatIssuesList(infoIssues));
            }
        }
        // Page Details
        lines.push('## Page Details');
        lines.push('');
        for (const page of report.pages) {
            lines.push(`### ${page.url}`);
            lines.push('');
            lines.push(`- **Status**: ${this.formatStatus(page.status)}`);
            lines.push(`- **Tags Detected**: ${page.summary.tagsDetected}`);
            if (page.summary.validationScore !== undefined) {
                lines.push(`- **Validation Score**: ${page.summary.validationScore}/100`);
            }
            lines.push(`- **Rules Passed**: ${page.summary.rulesPassed}`);
            lines.push(`- **Rules Failed**: ${page.summary.rulesFailed}`);
            lines.push(`- **Issues**: ${page.summary.issues.total} (${page.summary.issues.error} errors, ${page.summary.issues.warning} warnings)`);
            lines.push(`- **Duration**: ${page.performance.totalDuration}ms`);
            lines.push('');
        }
        return lines.join('\n');
    }
    /**
     * Format a page report
     */
    formatPage(report) {
        const lines = [];
        lines.push('# Page Validation Report');
        lines.push('');
        lines.push(`**URL**: ${report.url}`);
        lines.push(`**Status**: ${this.formatStatus(report.status)}`);
        lines.push(`**Timestamp**: ${new Date(report.timestamp).toISOString()}`);
        lines.push('');
        // Summary
        lines.push('## Summary');
        lines.push('');
        lines.push(`- **Tags Detected**: ${report.summary.tagsDetected}`);
        if (report.summary.validationScore !== undefined) {
            lines.push(`- **Validation Score**: ${report.summary.validationScore}/100`);
        }
        lines.push(`- **Rules Passed**: ${report.summary.rulesPassed}`);
        lines.push(`- **Rules Failed**: ${report.summary.rulesFailed}`);
        lines.push(`- **Total Issues**: ${report.summary.issues.total}`);
        lines.push('');
        // Issues
        if (report.issues.length > 0) {
            lines.push('## Issues');
            lines.push('');
            lines.push(...this.formatIssuesList(report.issues));
        }
        // Performance
        lines.push('## Performance');
        lines.push('');
        lines.push(`- **Scan**: ${report.performance.scanDuration}ms`);
        if (report.performance.detectionDuration) {
            lines.push(`- **Detection**: ${report.performance.detectionDuration}ms`);
        }
        if (report.performance.validationDuration) {
            lines.push(`- **Validation**: ${report.performance.validationDuration}ms`);
        }
        lines.push(`- **Total**: ${report.performance.totalDuration}ms`);
        lines.push('');
        return lines.join('\n');
    }
    /**
     * Format issues
     */
    formatIssues(issues) {
        const lines = [];
        lines.push('# Issues');
        lines.push('');
        lines.push(`Total: ${issues.length}`);
        lines.push('');
        lines.push(...this.formatIssuesList(issues));
        return lines.join('\n');
    }
    /**
     * Format list of issues
     */
    formatIssuesList(issues) {
        const lines = [];
        for (const issue of issues) {
            lines.push(`#### ${issue.ruleName}`);
            lines.push('');
            lines.push(`**Severity**: ${this.formatSeverity(issue.severity)}`);
            lines.push(`**Rule ID**: \`${issue.ruleId}\``);
            if (issue.platform) {
                lines.push(`**Platform**: ${issue.platform}`);
            }
            lines.push('');
            lines.push(`**Message**: ${issue.message}`);
            lines.push('');
            if (issue.details) {
                lines.push(`**Details**: ${issue.details}`);
                lines.push('');
            }
            if (issue.evidence.length > 0) {
                lines.push('**Evidence**:');
                lines.push('');
                for (const ev of issue.evidence) {
                    lines.push(`- **${ev.type}**: ${ev.description}`);
                    if (ev.expected !== undefined) {
                        lines.push(`  - Expected: \`${this.formatValue(ev.expected)}\``);
                    }
                    if (ev.actual !== undefined) {
                        lines.push(`  - Actual: \`${this.formatValue(ev.actual)}\``);
                    }
                }
                lines.push('');
            }
            if (issue.suggestion) {
                lines.push(`**Suggestion**: ${issue.suggestion}`);
                lines.push('');
            }
            lines.push('---');
            lines.push('');
        }
        return lines;
    }
    /**
     * Format status with emoji
     */
    formatStatus(status) {
        switch (status) {
            case 'passed':
                return '✅ Passed';
            case 'failed':
                return '❌ Failed';
            case 'degraded':
                return '⚠️ Degraded';
            case 'error':
                return '🔴 Error';
            default:
                return status;
        }
    }
    /**
     * Format severity with emoji
     */
    formatSeverity(severity) {
        switch (severity) {
            case 'critical':
                return '🔴 Critical';
            case 'error':
                return '❌ Error';
            case 'warning':
                return '⚠️ Warning';
            case 'info':
                return 'ℹ️ Info';
            default:
                return severity;
        }
    }
    /**
     * Format comparison status
     */
    formatComparisonStatus(status) {
        switch (status) {
            case 'improved':
                return '✅ Improved';
            case 'same':
                return '➡️ Same';
            case 'degraded':
                return '⚠️ Degraded';
            case 'new':
                return '🆕 New';
            default:
                return status;
        }
    }
    /**
     * Format delta with +/- prefix
     */
    formatDelta(delta) {
        if (delta > 0) {
            return `+${delta}`;
        }
        return delta.toString();
    }
    /**
     * Format value for display
     */
    formatValue(value) {
        if (typeof value === 'string') {
            return value.length > 100 ? value.substring(0, 100) + '...' : value;
        }
        return JSON.stringify(value);
    }
}
exports.MarkdownFormatter = MarkdownFormatter;
//# sourceMappingURL=MarkdownFormatter.js.map