/**
 * Assert Action Handler
 *
 * Handles validation assertions in user journeys.
 */
import type { Page } from 'playwright';
import type { AssertAction, ActionResult } from '../types';
import { BaseActionHandler } from './ActionHandler';
/**
 * Handler for assert actions
 */
export declare class AssertActionHandler extends BaseActionHandler<AssertAction> {
    readonly type = "assert";
    execute(action: AssertAction, page: Page, context: Record<string, unknown>): Promise<ActionResult>;
    /**
     * Check assertion based on expected value and operator
     */
    private checkAssertion;
}
//# sourceMappingURL=AssertActionHandler.d.ts.map