/**
 * Navigate Action Handler
 *
 * Handles navigation actions in user journeys.
 */
import type { Page } from 'playwright';
import type { NavigateAction, ActionResult } from '../types';
import { BaseActionHandler } from './ActionHandler';
/**
 * Handler for navigate actions
 */
export declare class NavigateActionHandler extends BaseActionHandler<NavigateAction> {
    readonly type = "navigate";
    execute(action: NavigateAction, page: Page, context: Record<string, unknown>): Promise<ActionResult>;
}
//# sourceMappingURL=NavigateActionHandler.d.ts.map