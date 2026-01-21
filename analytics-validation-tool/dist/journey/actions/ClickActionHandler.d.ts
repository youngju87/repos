/**
 * Click Action Handler
 *
 * Handles click actions in user journeys.
 */
import type { Page } from 'playwright';
import type { ClickAction, ActionResult } from '../types';
import { BaseActionHandler } from './ActionHandler';
/**
 * Handler for click actions
 */
export declare class ClickActionHandler extends BaseActionHandler<ClickAction> {
    readonly type = "click";
    execute(action: ClickAction, page: Page, context: Record<string, unknown>): Promise<ActionResult>;
}
//# sourceMappingURL=ClickActionHandler.d.ts.map