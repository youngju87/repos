"use strict";
/**
 * Click Action Handler
 *
 * Handles click actions in user journeys.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickActionHandler = void 0;
const ActionHandler_1 = require("./ActionHandler");
/**
 * Handler for click actions
 */
class ClickActionHandler extends ActionHandler_1.BaseActionHandler {
    type = 'click';
    async execute(action, page, context) {
        const startTime = Date.now();
        try {
            // Wait for selector if requested
            if (action.waitForSelector !== false) {
                await page.waitForSelector(action.selector, {
                    timeout: this.getTimeout(action, 30000),
                    state: 'visible',
                });
            }
            // Click the element
            await page.click(action.selector, {
                timeout: this.getTimeout(action),
                button: action.options?.button,
                clickCount: action.options?.clickCount,
            });
            const duration = Date.now() - startTime;
            // Update context with last clicked element
            const newContext = {
                ...context,
                lastClickSelector: action.selector,
            };
            return this.createSuccessResult(action, duration, newContext);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            return this.createFailureResult(action, duration, error instanceof Error ? error : new Error(String(error)));
        }
    }
}
exports.ClickActionHandler = ClickActionHandler;
//# sourceMappingURL=ClickActionHandler.js.map