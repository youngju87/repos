"use strict";
/**
 * Injection Scripts Module Exports
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateErrorCaptureScript = exports.generateScriptObserverScript = exports.DEFAULT_DATA_LAYER_NAMES = exports.generateDataLayerObserverScript = void 0;
var dataLayerObserver_1 = require("./dataLayerObserver");
Object.defineProperty(exports, "generateDataLayerObserverScript", { enumerable: true, get: function () { return dataLayerObserver_1.generateDataLayerObserverScript; } });
Object.defineProperty(exports, "DEFAULT_DATA_LAYER_NAMES", { enumerable: true, get: function () { return dataLayerObserver_1.DEFAULT_DATA_LAYER_NAMES; } });
var scriptObserver_1 = require("./scriptObserver");
Object.defineProperty(exports, "generateScriptObserverScript", { enumerable: true, get: function () { return scriptObserver_1.generateScriptObserverScript; } });
var errorCapture_1 = require("./errorCapture");
Object.defineProperty(exports, "generateErrorCaptureScript", { enumerable: true, get: function () { return errorCapture_1.generateErrorCaptureScript; } });
//# sourceMappingURL=index.js.map