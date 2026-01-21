"use strict";
/**
 * Browser Module Exports
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_POOL_CONFIG = exports.validateBrowserLaunchConfig = exports.validateBrowserPoolConfig = exports.shutdownDefaultBrowserManager = exports.getDefaultBrowserManager = exports.BrowserManager = void 0;
var BrowserManager_1 = require("./BrowserManager");
Object.defineProperty(exports, "BrowserManager", { enumerable: true, get: function () { return BrowserManager_1.BrowserManager; } });
Object.defineProperty(exports, "getDefaultBrowserManager", { enumerable: true, get: function () { return BrowserManager_1.getDefaultBrowserManager; } });
Object.defineProperty(exports, "shutdownDefaultBrowserManager", { enumerable: true, get: function () { return BrowserManager_1.shutdownDefaultBrowserManager; } });
var validation_1 = require("./validation");
Object.defineProperty(exports, "validateBrowserPoolConfig", { enumerable: true, get: function () { return validation_1.validateBrowserPoolConfig; } });
Object.defineProperty(exports, "validateBrowserLaunchConfig", { enumerable: true, get: function () { return validation_1.validateBrowserLaunchConfig; } });
Object.defineProperty(exports, "DEFAULT_POOL_CONFIG", { enumerable: true, get: function () { return validation_1.DEFAULT_POOL_CONFIG; } });
//# sourceMappingURL=index.js.map