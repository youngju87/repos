"use strict";
/**
 * Type Action Handler
 *
 * Handles typing/input actions in user journeys.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeActionHandler = void 0;
const ActionHandler_1 = require("./ActionHandler");
/**
 * Handler for type actions
 */
class TypeActionHandler extends ActionHandler_1.BaseActionHandler {
    type = 'type';
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
            // Clear existing value if requested
            if (action.clear) {
                await page.fill(action.selector, '');
            }
            // Type the value
            if (action.options?.delay) {
                await page.type(action.selector, action.value, {
                    delay: action.options.delay,
                    timeout: this.getTimeout(action),
                });
            }
            else {
                await page.fill(action.selector, action.value);
            }
            const duration = Date.now() - startTime;
            // Update context with last typed field
            const newContext = {
                ...context,
                lastTypeSelector: action.selector,
                lastTypeValue: action.value,
            };
            return this.createSuccessResult(action, duration, newContext);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            return this.createFailureResult(action, duration, error instanceof Error ? error : new Error(String(error)));
        }
    }
}
exports.TypeActionHandler = TypeActionHandler;
//# sourceMappingURL=TypeActionHandler.js.map