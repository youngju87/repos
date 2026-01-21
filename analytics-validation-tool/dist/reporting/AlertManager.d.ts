/**
 * Alert Manager
 *
 * Manages alert dispatching based on thresholds and configurations.
 */
import type { AlertDispatcher, AlertConfig, RunReport } from './types';
/**
 * Alert Manager
 */
export declare class AlertManager {
    private dispatchers;
    private alertConfigs;
    /**
     * Register an alert dispatcher
     */
    registerDispatcher(dispatcher: AlertDispatcher): void;
    /**
     * Add alert configuration
     */
    addAlertConfig(config: AlertConfig): void;
    /**
     * Process alerts for a report
     */
    processAlerts(report: RunReport): Promise<void>;
    /**
     * Check if alert should be triggered
     * Returns issues that triggered the alert
     */
    private shouldTriggerAlert;
    /**
     * Build alert message
     */
    private buildAlertMessage;
}
//# sourceMappingURL=AlertManager.d.ts.map