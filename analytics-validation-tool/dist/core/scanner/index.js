"use strict";
/**
 * Scanner Module Exports
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDesktopOptions = exports.createMobileOptions = exports.createDeviceOptions = exports.validateOptions = exports.mergeOptions = exports.DEVICE_PROFILES = exports.TABLET_VIEWPORT = exports.MOBILE_VIEWPORT = exports.DEFAULT_VIEWPORT = exports.DEFAULT_SCAN_OPTIONS = exports.scanUrls = exports.scanUrl = exports.createScanner = exports.PageScanner = void 0;
var PageScanner_1 = require("./PageScanner");
Object.defineProperty(exports, "PageScanner", { enumerable: true, get: function () { return PageScanner_1.PageScanner; } });
Object.defineProperty(exports, "createScanner", { enumerable: true, get: function () { return PageScanner_1.createScanner; } });
Object.defineProperty(exports, "scanUrl", { enumerable: true, get: function () { return PageScanner_1.scanUrl; } });
Object.defineProperty(exports, "scanUrls", { enumerable: true, get: function () { return PageScanner_1.scanUrls; } });
var ScanOptions_1 = require("./ScanOptions");
Object.defineProperty(exports, "DEFAULT_SCAN_OPTIONS", { enumerable: true, get: function () { return ScanOptions_1.DEFAULT_SCAN_OPTIONS; } });
Object.defineProperty(exports, "DEFAULT_VIEWPORT", { enumerable: true, get: function () { return ScanOptions_1.DEFAULT_VIEWPORT; } });
Object.defineProperty(exports, "MOBILE_VIEWPORT", { enumerable: true, get: function () { return ScanOptions_1.MOBILE_VIEWPORT; } });
Object.defineProperty(exports, "TABLET_VIEWPORT", { enumerable: true, get: function () { return ScanOptions_1.TABLET_VIEWPORT; } });
Object.defineProperty(exports, "DEVICE_PROFILES", { enumerable: true, get: function () { return ScanOptions_1.DEVICE_PROFILES; } });
Object.defineProperty(exports, "mergeOptions", { enumerable: true, get: function () { return ScanOptions_1.mergeOptions; } });
Object.defineProperty(exports, "validateOptions", { enumerable: true, get: function () { return ScanOptions_1.validateOptions; } });
Object.defineProperty(exports, "createDeviceOptions", { enumerable: true, get: function () { return ScanOptions_1.createDeviceOptions; } });
Object.defineProperty(exports, "createMobileOptions", { enumerable: true, get: function () { return ScanOptions_1.createMobileOptions; } });
Object.defineProperty(exports, "createDesktopOptions", { enumerable: true, get: function () { return ScanOptions_1.createDesktopOptions; } });
//# sourceMappingURL=index.js.map