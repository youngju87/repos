/**
 * Slack Alert Dispatcher
 *
 * Sends alerts to Slack via webhook.
 */
import type { AlertDispatcher, AlertContext, SlackAlertConfig } from '../types';
/**
 * Slack Alert Dispatcher
 */
export declare class SlackDispatcher implements AlertDispatcher {
    private config;
    readonly type = "slack";
    constructor(config: SlackAlertConfig);
    /**
     * Send alert to Slack
     */
    send(context: AlertContext): Promise<void>;
    /**
     * Build Slack blocks
     */
    private buildBlocks;
    /**
     * Get status emoji
     */
    private getStatusEmoji;
    /**
     * Get severity emoji
     */
    private getSeverityEmoji;
    /**
     * Format status
     */
    private formatStatus;
}
//# sourceMappingURL=SlackDispatcher.d.ts.map