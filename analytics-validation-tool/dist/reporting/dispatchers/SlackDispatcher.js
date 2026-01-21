"use strict";
/**
 * Slack Alert Dispatcher
 *
 * Sends alerts to Slack via webhook.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackDispatcher = void 0;
/**
 * Slack Alert Dispatcher
 */
class SlackDispatcher {
    config;
    type = 'slack';
    constructor(config) {
        this.config = config;
    }
    /**
     * Send alert to Slack
     */
    async send(context) {
        const { report, triggerIssues, message } = context;
        // Build Slack message
        const slackMessage = {
            username: this.config.username || 'Analytics Validation',
            icon_emoji: this.config.iconEmoji || ':mag:',
            channel: this.config.channel,
            blocks: this.buildBlocks(report, triggerIssues, message),
        };
        // Send to webhook
        const response = await fetch(this.config.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(slackMessage),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Slack webhook failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
    }
    /**
     * Build Slack blocks
     */
    buildBlocks(report, triggerIssues, message) {
        const blocks = [];
        // Header
        const statusEmoji = this.getStatusEmoji(report.status);
        blocks.push({
            type: 'header',
            text: {
                type: 'plain_text',
                text: `${statusEmoji} Analytics Validation Alert`,
            },
        });
        // Alert message
        blocks.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: message,
            },
        });
        // Summary
        blocks.push({
            type: 'section',
            fields: [
                {
                    type: 'mrkdwn',
                    text: `*Status:*\n${this.formatStatus(report.status)}`,
                },
                {
                    type: 'mrkdwn',
                    text: `*Environment:*\n${report.environment}`,
                },
                {
                    type: 'mrkdwn',
                    text: `*Score:*\n${report.summary.overallScore}/100`,
                },
                {
                    type: 'mrkdwn',
                    text: `*Issues:*\n${report.summary.issues.total}`,
                },
            ],
        });
        // Divider
        blocks.push({ type: 'divider' });
        // Issue breakdown
        blocks.push({
            type: 'section',
            fields: [
                {
                    type: 'mrkdwn',
                    text: `🔴 *Critical:* ${report.summary.issues.critical}`,
                },
                {
                    type: 'mrkdwn',
                    text: `❌ *Errors:* ${report.summary.issues.error}`,
                },
                {
                    type: 'mrkdwn',
                    text: `⚠️ *Warnings:* ${report.summary.issues.warning}`,
                },
                {
                    type: 'mrkdwn',
                    text: `ℹ️ *Info:* ${report.summary.issues.info}`,
                },
            ],
        });
        // Top issues (first 3)
        if (triggerIssues.length > 0) {
            blocks.push({ type: 'divider' });
            blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '*Top Issues:*',
                },
            });
            for (const issue of triggerIssues.slice(0, 3)) {
                blocks.push({
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `${this.getSeverityEmoji(issue.severity)} *${issue.ruleName}*\n${issue.message}\n_Platform: ${issue.platform || 'N/A'}_`,
                    },
                });
            }
            if (triggerIssues.length > 3) {
                blocks.push({
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: `_... and ${triggerIssues.length - 3} more issues_`,
                        },
                    ],
                });
            }
        }
        // CI context
        if (report.metadata.ci) {
            blocks.push({ type: 'divider' });
            const ciFields = [];
            if (report.metadata.ci.buildId) {
                ciFields.push({
                    type: 'mrkdwn',
                    text: `*Build:*\n${report.metadata.ci.buildId}`,
                });
            }
            if (report.metadata.ci.branch) {
                ciFields.push({
                    type: 'mrkdwn',
                    text: `*Branch:*\n${report.metadata.ci.branch}`,
                });
            }
            if (report.metadata.ci.commitSha) {
                ciFields.push({
                    type: 'mrkdwn',
                    text: `*Commit:*\n\`${report.metadata.ci.commitSha.substring(0, 8)}\``,
                });
            }
            if (report.metadata.ci.prNumber) {
                ciFields.push({
                    type: 'mrkdwn',
                    text: `*PR:*\n#${report.metadata.ci.prNumber}`,
                });
            }
            if (ciFields.length > 0) {
                blocks.push({
                    type: 'section',
                    fields: ciFields,
                });
            }
        }
        // Timestamp
        blocks.push({
            type: 'context',
            elements: [
                {
                    type: 'mrkdwn',
                    text: `<!date^${Math.floor(report.timestamp / 1000)}^{date_short_pretty} at {time}|${new Date(report.timestamp).toISOString()}>`,
                },
            ],
        });
        return blocks;
    }
    /**
     * Get status emoji
     */
    getStatusEmoji(status) {
        switch (status) {
            case 'passed':
                return '✅';
            case 'failed':
                return '❌';
            case 'degraded':
                return '⚠️';
            case 'error':
                return '🔴';
            default:
                return '❓';
        }
    }
    /**
     * Get severity emoji
     */
    getSeverityEmoji(severity) {
        switch (severity) {
            case 'critical':
                return '🔴';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            default:
                return '•';
        }
    }
    /**
     * Format status
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
}
exports.SlackDispatcher = SlackDispatcher;
//# sourceMappingURL=SlackDispatcher.js.map