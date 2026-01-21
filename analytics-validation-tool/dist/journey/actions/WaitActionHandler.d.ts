/**
 * Wait Action Handler
 *
 * Handles wait/synchronization actions in user journeys.
 */
import type { Page } from 'playwright';
import type { WaitAction, ActionResult } from '../types';
import { BaseActionHandler } from './ActionHandler';
/**
 * Handler for wait actions
 */
export declare class WaitActionHandler extends BaseActionHandler<WaitAction> {
    readonly type = "wait";
    execute(action: WaitAction, page: Page, context: Record<string, unknown>): Promise<ActionResult>;
    /**
     * Wait for data layer event
     */
    private waitForDataLayer;
    /**
     * Wait for network request
     */
    private waitForNetwork;
}
//# sourceMappingURL=WaitActionHandler.d.ts.map