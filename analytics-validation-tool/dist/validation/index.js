"use strict";
/**
 * Validation Module
 *
 * Declarative validation engine for analytics implementations.
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
exports.createDefaultValidationEngine = exports.ValidationEngine = exports.loadRules = exports.RuleLoader = exports.checkConditions = exports.evaluateCondition = exports.buildValidationContext = void 0;
exports.registerBuiltInHandlers = registerBuiltInHandlers;
exports.createValidationEngine = createValidationEngine;
// Core types
__exportStar(require("./types"), exports);
// Context and utilities
var ValidationContext_1 = require("./ValidationContext");
Object.defineProperty(exports, "buildValidationContext", { enumerable: true, get: function () { return ValidationContext_1.buildValidationContext; } });
Object.defineProperty(exports, "evaluateCondition", { enumerable: true, get: function () { return ValidationContext_1.evaluateCondition; } });
Object.defineProperty(exports, "checkConditions", { enumerable: true, get: function () { return ValidationContext_1.checkConditions; } });
// Rule loader
var RuleLoader_1 = require("./RuleLoader");
Object.defineProperty(exports, "RuleLoader", { enumerable: true, get: function () { return RuleLoader_1.RuleLoader; } });
Object.defineProperty(exports, "loadRules", { enumerable: true, get: function () { return RuleLoader_1.loadRules; } });
// Validation engine
var ValidationEngine_1 = require("./ValidationEngine");
Object.defineProperty(exports, "ValidationEngine", { enumerable: true, get: function () { return ValidationEngine_1.ValidationEngine; } });
Object.defineProperty(exports, "createDefaultValidationEngine", { enumerable: true, get: function () { return ValidationEngine_1.createDefaultValidationEngine; } });
// Rule type handlers
__exportStar(require("./handlers"), exports);
// Built-in handlers registry
const handlers_1 = require("./handlers");
const ValidationEngine_2 = require("./ValidationEngine");
/**
 * Register all built-in rule handlers
 */
function registerBuiltInHandlers(engine) {
    engine.registerHandler(new handlers_1.PresenceHandler());
    engine.registerHandler(new handlers_1.PayloadHandler());
    engine.registerHandler(new handlers_1.OrderHandler());
    engine.registerHandler(new handlers_1.ConsentHandler());
    engine.registerHandler(new handlers_1.DataLayerHandler());
}
/**
 * Create validation engine with all built-in handlers registered
 */
function createValidationEngine(environment) {
    const engine = (0, ValidationEngine_2.createDefaultValidationEngine)(environment);
    registerBuiltInHandlers(engine);
    return engine;
}
//# sourceMappingURL=index.js.map