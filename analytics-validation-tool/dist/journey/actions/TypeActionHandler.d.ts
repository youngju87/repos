/**
 * Type Action Handler
 *
 * Handles typing/input actions in user journeys.
 */
import type { Page } from 'playwright';
import type { TypeAction, ActionResult } from '../types';
import { BaseActionHandler } from './ActionHandler';
/**
 * Handler for type actions
 */
export declare class TypeActionHandler extends BaseActionHandler<TypeAction> {
    readonly type = "type";
    execute(action: TypeAction, page: Page, context: Record<string, unknown>): Promise<ActionResult>;
}
//# sourceMappingURL=TypeActionHandler.d.ts.map