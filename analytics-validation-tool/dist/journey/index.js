"use strict";
/**
 * Journey & Funnel Simulation
 *
 * Multi-step user flow validation with analytics capture.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenshotActionHandler = exports.AssertActionHandler = exports.WaitActionHandler = exports.SubmitActionHandler = exports.TypeActionHandler = exports.ClickActionHandler = exports.NavigateActionHandler = exports.getDefaultActionRegistry = exports.registerBuiltInActionHandlers = exports.ActionHandlerRegistry = exports.JourneyEngine = exports.JourneyLoader = void 0;
// Loader
var JourneyLoader_1 = require("./JourneyLoader");
Object.defineProperty(exports, "JourneyLoader", { enumerable: true, get: function () { return JourneyLoader_1.JourneyLoader; } });
// Engine
var JourneyEngine_1 = require("./JourneyEngine");
Object.defineProperty(exports, "JourneyEngine", { enumerable: true, get: function () { return JourneyEngine_1.JourneyEngine; } });
// Actions
var actions_1 = require("./actions");
Object.defineProperty(exports, "ActionHandlerRegistry", { enumerable: true, get: function () { return actions_1.ActionHandlerRegistry; } });
Object.defineProperty(exports, "registerBuiltInActionHandlers", { enumerable: true, get: function () { return actions_1.registerBuiltInActionHandlers; } });
Object.defineProperty(exports, "getDefaultActionRegistry", { enumerable: true, get: function () { return actions_1.getDefaultActionRegistry; } });
Object.defineProperty(exports, "NavigateActionHandler", { enumerable: true, get: function () { return actions_1.NavigateActionHandler; } });
Object.defineProperty(exports, "ClickActionHandler", { enumerable: true, get: function () { return actions_1.ClickActionHandler; } });
Object.defineProperty(exports, "TypeActionHandler", { enumerable: true, get: function () { return actions_1.TypeActionHandler; } });
Object.defineProperty(exports, "SubmitActionHandler", { enumerable: true, get: function () { return actions_1.SubmitActionHandler; } });
Object.defineProperty(exports, "WaitActionHandler", { enumerable: true, get: function () { return actions_1.WaitActionHandler; } });
Object.defineProperty(exports, "AssertActionHandler", { enumerable: true, get: function () { return actions_1.AssertActionHandler; } });
Object.defineProperty(exports, "ScreenshotActionHandler", { enumerable: true, get: function () { return actions_1.ScreenshotActionHandler; } });
//# sourceMappingURL=index.js.map