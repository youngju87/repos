/**
 * Submit Action Handler
 *
 * Handles form submission actions in user journeys.
 */
import type { Page } from 'playwright';
import type { SubmitAction, ActionResult } from '../types';
import { BaseActionHandler } from './ActionHandler';
/**
 * Handler for submit actions
 */
export declare class SubmitActionHandler extends BaseActionHandler<SubmitAction> {
    readonly type = "submit";
    execute(action: SubmitAction, page: Page, context: Record<string, unknown>): Promise<ActionResult>;
}
//# sourceMappingURL=SubmitActionHandler.d.ts.map