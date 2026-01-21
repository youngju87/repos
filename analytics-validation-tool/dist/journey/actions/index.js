"use strict";
/**
 * Journey Action Handlers
 *
 * Exports all action handlers and registration utilities.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionHandlerRegistry = void 0;
exports.registerBuiltInActionHandlers = registerBuiltInActionHandlers;
exports.getDefaultActionRegistry = getDefaultActionRegistry;
__exportStar(require("./ActionHandler"), exports);
__exportStar(require("./NavigateActionHandler"), exports);
__exportStar(require("./ClickActionHandler"), exports);
__exportStar(require("./TypeActionHandler"), exports);
__exportStar(require("./SubmitActionHandler"), exports);
__exportStar(require("./WaitActionHandler"), exports);
__exportStar(require("./AssertActionHandler"), exports);
__exportStar(require("./ScreenshotActionHandler"), exports);
const NavigateActionHandler_1 = require("./NavigateActionHandler");
const ClickActionHandler_1 = require("./ClickActionHandler");
const TypeActionHandler_1 = require("./TypeActionHandler");
const SubmitActionHandler_1 = require("./SubmitActionHandler");
const WaitActionHandler_1 = require("./WaitActionHandler");
const AssertActionHandler_1 = require("./AssertActionHandler");
const ScreenshotActionHandler_1 = require("./ScreenshotActionHandler");
/**
 * Action handler registry
 */
class ActionHandlerRegistry {
    handlers = new Map();
    /**
     * Register an action handler
     */
    register(handler) {
        this.handlers.set(handler.type, handler);
    }
    /**
     * Get handler for action type
     */
    getHandler(actionType) {
        return this.handlers.get(actionType);
    }
    /**
     * Find handler that can handle the action
     */
    findHandler(action) {
        for (const handler of this.handlers.values()) {
            if (handler.canHandle(action)) {
                return handler;
            }
        }
        return undefined;
    }
    /**
     * Get all registered handlers
     */
    getAllHandlers() {
        return Array.from(this.handlers.values());
    }
}
exports.ActionHandlerRegistry = ActionHandlerRegistry;
/**
 * Register all built-in action handlers
 */
function registerBuiltInActionHandlers(registry) {
    registry.register(new NavigateActionHandler_1.NavigateActionHandler());
    registry.register(new ClickActionHandler_1.ClickActionHandler());
    registry.register(new TypeActionHandler_1.TypeActionHandler());
    registry.register(new SubmitActionHandler_1.SubmitActionHandler());
    registry.register(new WaitActionHandler_1.WaitActionHandler());
    registry.register(new AssertActionHandler_1.AssertActionHandler());
    registry.register(new ScreenshotActionHandler_1.ScreenshotActionHandler());
}
/**
 * Get default registry with built-in handlers
 */
function getDefaultActionRegistry() {
    const registry = new ActionHandlerRegistry();
    registerBuiltInActionHandlers(registry);
    return registry;
}
//# sourceMappingURL=index.js.map