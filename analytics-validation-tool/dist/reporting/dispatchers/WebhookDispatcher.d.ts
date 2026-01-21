/**
 * Generic Webhook Alert Dispatcher
 *
 * Sends alerts to any webhook endpoint.
 */
import type { AlertDispatcher, AlertContext, WebhookAlertConfig } from '../types';
/**
 * Webhook Alert Dispatcher
 */
export declare class WebhookDispatcher implements AlertDispatcher {
    private config;
    readonly type = "webhook";
    constructor(config: WebhookAlertConfig);
    /**
     * Send alert to webhook
     */
    send(context: AlertContext): Promise<void>;
    /**
     * Build default payload
     */
    private buildDefaultPayload;
    /**
     * Apply template to payload
     * Simple template substitution using {{variable}} syntax
     */
    private applyTemplate;
}
//# sourceMappingURL=WebhookDispatcher.d.ts.map