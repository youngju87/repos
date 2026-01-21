"use strict";
/**
 * Generic Webhook Alert Dispatcher
 *
 * Sends alerts to any webhook endpoint.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookDispatcher = void 0;
/**
 * Webhook Alert Dispatcher
 */
class WebhookDispatcher {
    config;
    type = 'webhook';
    constructor(config) {
        this.config = config;
    }
    /**
     * Send alert to webhook
     */
    async send(context) {
        const { report, triggerIssues, message, threshold } = context;
        // Build payload
        const payload = this.config.payloadTemplate
            ? this.applyTemplate(this.config.payloadTemplate, context)
            : this.buildDefaultPayload(report, triggerIssues, message, threshold);
        // Prepare headers
        const headers = {
            'Content-Type': 'application/json',
            ...this.config.headers,
        };
        // Send request
        const response = await fetch(this.config.url, {
            method: this.config.method || 'POST',
            headers,
            body: typeof payload === 'string' ? payload : JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Webhook request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
    }
    /**
     * Build default payload
     */
    buildDefaultPayload(report, triggerIssues, message, threshold) {
        return {
            type: 'analytics_validation_alert',
            timestamp: Date.now(),
            message,
            report: {
                id: report.id,
                status: report.status,
                environment: report.environment,
                timestamp: report.timestamp,
                summary: {
                    score: report.summary.overallScore,
                    totalPages: report.summary.totalPages,
                    pagesPassed: report.summary.pagesPassed,
                    pagesFailed: report.summary.pagesFailed,
                    issues: {
                        total: report.summary.issues.total,
                        critical: report.summary.issues.critical,
                        error: report.summary.issues.error,
                        warning: report.summary.issues.warning,
                        info: report.summary.issues.info,
                    },
                },
                metadata: report.metadata,
            },
            threshold: {
                minSeverity: threshold.minSeverity,
                minIssueCount: threshold.minIssueCount,
            },
            issues: triggerIssues.map((issue) => ({
                id: issue.id,
                severity: issue.severity,
                ruleId: issue.ruleId,
                ruleName: issue.ruleName,
                message: issue.message,
                platform: issue.platform,
                pageUrl: issue.pageUrl,
            })),
        };
    }
    /**
     * Apply template to payload
     * Simple template substitution using {{variable}} syntax
     */
    applyTemplate(template, context) {
        const { report, triggerIssues, message } = context;
        const variables = {
            'report.id': report.id,
            'report.status': report.status,
            'report.environment': report.environment,
            'report.score': report.summary.overallScore,
            'report.issueCount': report.summary.issues.total,
            message,
            timestamp: Date.now(),
            issueCount: triggerIssues.length,
        };
        let result = template;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            result = result.replace(regex, String(value));
        }
        return result;
    }
}
exports.WebhookDispatcher = WebhookDispatcher;
//# sourceMappingURL=WebhookDispatcher.js.map