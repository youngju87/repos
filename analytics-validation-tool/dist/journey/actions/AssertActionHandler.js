"use strict";
/**
 * Assert Action Handler
 *
 * Handles validation assertions in user journeys.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssertActionHandler = void 0;
const ActionHandler_1 = require("./ActionHandler");
/**
 * Handler for assert actions
 */
class AssertActionHandler extends ActionHandler_1.BaseActionHandler {
    type = 'assert';
    async execute(action, page, context) {
        const startTime = Date.now();
        try {
            let passed = false;
            let actualValue;
            switch (action.assertType) {
                case 'url':
                    actualValue = page.url();
                    passed = this.checkAssertion(actualValue, action);
                    break;
                case 'text':
                    if (!action.selector) {
                        throw new Error('selector is required for assertType=text');
                    }
                    actualValue = await page.textContent(action.selector);
                    passed = this.checkAssertion(actualValue || '', action);
                    break;
                case 'exists':
                    if (!action.selector) {
                        throw new Error('selector is required for assertType=exists');
                    }
                    const element = await page.$(action.selector);
                    actualValue = element !== null;
                    passed = actualValue === true;
                    break;
                case 'visible':
                    if (!action.selector) {
                        throw new Error('selector is required for assertType=visible');
                    }
                    actualValue = await page.isVisible(action.selector);
                    passed = actualValue === true;
                    break;
                case 'count':
                    if (!action.selector) {
                        throw new Error('selector is required for assertType=count');
                    }
                    const elements = await page.$$(action.selector);
                    actualValue = elements.length;
                    passed = this.checkAssertion(actualValue, action);
                    break;
                default:
                    throw new Error(`Unknown assert type: ${action.assertType}`);
            }
            const duration = Date.now() - startTime;
            if (!passed) {
                return this.createFailureResult(action, duration, new Error(`Assertion failed: ${action.message || 'Assertion did not pass'}\n` +
                    `Expected: ${action.expected}\n` +
                    `Actual: ${actualValue}`));
            }
            return this.createSuccessResult(action, duration, context);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            return this.createFailureResult(action, duration, error instanceof Error ? error : new Error(String(error)));
        }
    }
    /**
     * Check assertion based on expected value and operator
     */
    checkAssertion(actualValue, action) {
        const { expected, operator = 'equals' } = action;
        switch (operator) {
            case 'equals':
                return actualValue === expected;
            case 'contains':
                return String(actualValue).includes(String(expected));
            case 'matches':
                const regex = new RegExp(String(expected));
                return regex.test(String(actualValue));
            case 'greaterThan':
                return Number(actualValue) > Number(expected);
            case 'lessThan':
                return Number(actualValue) < Number(expected);
            default:
                throw new Error(`Unknown operator: ${operator}`);
        }
    }
}
exports.AssertActionHandler = AssertActionHandler;
//# sourceMappingURL=AssertActionHandler.js.map