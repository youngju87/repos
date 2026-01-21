"use strict";
/**
 * Alert Manager
 *
 * Manages alert dispatching based on thresholds and configurations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertManager = void 0;
/**
 * Alert Manager
 */
class AlertManager {
    dispatchers = new Map();
    alertConfigs = [];
    /**
     * Register an alert dispatcher
     */
    registerDispatcher(dispatcher) {
        this.dispatchers.set(dispatcher.type, dispatcher);
    }
    /**
     * Add alert configuration
     */
    addAlertConfig(config) {
        if (config.enabled !== false) {
            this.alertConfigs.push(config);
        }
    }
    /**
     * Process alerts for a report
     */
    async processAlerts(report) {
        for (const config of this.alertConfigs) {
            try {
                // Check if alert should be triggered
                const triggerIssues = this.shouldTriggerAlert(report, config.threshold);
                if (triggerIssues.length > 0) {
                    // Build alert context
                    const context = {
                        report,
                        triggerIssues,
                        threshold: config.threshold,
                        message: this.buildAlertMessage(report, triggerIssues, config.threshold),
                    };
                    // Get dispatcher
                    const dispatcher = this.dispatchers.get(config.type);
                    if (!dispatcher) {
                        console.error(`No dispatcher registered for type: ${config.type}`);
                        continue;
                    }
                    // Send alert
                    await dispatcher.send(context);
                }
            }
            catch (error) {
                console.error(`Failed to send alert via ${config.type}:`, error);
            }
        }
    }
    /**
     * Check if alert should be triggered
     * Returns issues that triggered the alert
     */
    shouldTriggerAlert(report, threshold) {
        const allIssues = report.summary.issues.issues;
        // Filter issues by severity threshold
        const severityOrder = ['critical', 'error', 'warning', 'info'];
        const minSeverityIndex = severityOrder.indexOf(threshold.minSeverity);
        const relevantIssues = allIssues.filter((issue) => {
            const issueSeverityIndex = severityOrder.indexOf(issue.severity);
            return issueSeverityIndex <= minSeverityIndex;
        });
        // Check minimum issue count
        if (threshold.minIssueCount !== undefined &&
            relevantIssues.length < threshold.minIssueCount) {
            return [];
        }
        // Filter for new issues only (if baseline comparison available)
        if (threshold.onlyNew && report.baselineComparison) {
            return relevantIssues.filter((issue) => report.baselineComparison.newIssues.some((newIssue) => newIssue.id === issue.id));
        }
        // Filter for regressions only
        if (threshold.onlyRegressions && report.baselineComparison) {
            if (report.baselineComparison.status === 'degraded') {
                return relevantIssues;
            }
            return [];
        }
        return relevantIssues;
    }
    /**
     * Build alert message
     */
    buildAlertMessage(report, triggerIssues, threshold) {
        const parts = [];
        // Status-based message
        if (report.status === 'failed') {
            parts.push('⚠️ Analytics validation FAILED');
        }
        else if (report.status === 'degraded') {
            parts.push('⚠️ Analytics validation degraded');
        }
        else {
            parts.push('⚠️ Analytics validation alert');
        }
        // Issue count
        parts.push(`${triggerIssues.length} issue(s) found (${threshold.minSeverity} or higher)`);
        // Environment
        parts.push(`in ${report.environment} environment`);
        // Baseline comparison
        if (report.baselineComparison) {
            if (report.baselineComparison.status === 'degraded') {
                parts.push(`(${Math.abs(report.baselineComparison.issueCountDelta)} new issues)`);
            }
            else if (report.baselineComparison.status === 'improved') {
                parts.push(`(${Math.abs(report.baselineComparison.issueCountDelta)} issues resolved)`);
            }
        }
        return parts.join(' ');
    }
}
exports.AlertManager = AlertManager;
//# sourceMappingURL=AlertManager.js.map