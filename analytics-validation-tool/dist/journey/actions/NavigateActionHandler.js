"use strict";
/**
 * Navigate Action Handler
 *
 * Handles navigation actions in user journeys.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigateActionHandler = void 0;
const ActionHandler_1 = require("./ActionHandler");
/**
 * Handler for navigate actions
 */
class NavigateActionHandler extends ActionHandler_1.BaseActionHandler {
    type = 'navigate';
    async execute(action, page, context) {
        const startTime = Date.now();
        try {
            // Navigate to URL
            await page.goto(action.url, {
                timeout: this.getTimeout(action, 60000),
                waitUntil: action.waitUntil || 'load',
            });
            const duration = Date.now() - startTime;
            // Capture current URL in context
            const currentUrl = page.url();
            const newContext = {
                ...context,
                currentUrl,
                lastNavigateUrl: action.url,
            };
            return this.createSuccessResult(action, duration, newContext);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            return this.createFailureResult(action, duration, error instanceof Error ? error : new Error(String(error)));
        }
    }
}
exports.NavigateActionHandler = NavigateActionHandler;
//# sourceMappingURL=NavigateActionHandler.js.map