/**
 * Screenshot Action Handler
 *
 * Handles screenshot capture actions in user journeys.
 */
import type { Page } from 'playwright';
import type { ScreenshotAction, ActionResult } from '../types';
import { BaseActionHandler } from './ActionHandler';
/**
 * Handler for screenshot actions
 */
export declare class ScreenshotActionHandler extends BaseActionHandler<ScreenshotAction> {
    readonly type = "screenshot";
    execute(action: ScreenshotAction, page: Page, context: Record<string, unknown>): Promise<ActionResult>;
    /**
     * Generate screenshot path if not provided
     */
    private generatePath;
}
//# sourceMappingURL=ScreenshotActionHandler.d.ts.map