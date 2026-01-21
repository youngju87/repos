"use strict";
/**
 * Action Handler Base Class
 *
 * Base class for all journey action handlers.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseActionHandler = void 0;
/**
 * Base action handler with common functionality
 */
class BaseActionHandler {
    /**
     * Check if this handler can handle the action
     */
    canHandle(action) {
        return action.type === this.type;
    }
    /**
     * Create a success result
     */
    createSuccessResult(action, duration, context) {
        return {
            action,
            status: 'success',
            duration,
            context,
        };
    }
    /**
     * Create a failure result
     */
    createFailureResult(action, duration, error) {
        return {
            action,
            status: 'failed',
            duration,
            error: error instanceof Error ? error.message : error,
        };
    }
    /**
     * Create a skipped result
     */
    createSkippedResult(action, reason) {
        return {
            action,
            status: 'skipped',
            duration: 0,
            error: reason,
        };
    }
    /**
     * Get timeout for action
     */
    getTimeout(action, defaultTimeout = 30000) {
        return action.timeout || defaultTimeout;
    }
}
exports.BaseActionHandler = BaseActionHandler;
//# sourceMappingURL=ActionHandler.js.map