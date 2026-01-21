"use strict";
/**
 * Reporting Module
 *
 * Report aggregation, formatting, and alerting for analytics validation.
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
exports.getExitCode = exports.detectCIContext = exports.AlertManager = exports.createReportBuilder = exports.ReportBuilder = void 0;
// Core types
__exportStar(require("./types"), exports);
// Report building
var ReportBuilder_1 = require("./ReportBuilder");
Object.defineProperty(exports, "ReportBuilder", { enumerable: true, get: function () { return ReportBuilder_1.ReportBuilder; } });
Object.defineProperty(exports, "createReportBuilder", { enumerable: true, get: function () { return ReportBuilder_1.createReportBuilder; } });
// Alert management
var AlertManager_1 = require("./AlertManager");
Object.defineProperty(exports, "AlertManager", { enumerable: true, get: function () { return AlertManager_1.AlertManager; } });
// CI detection
var CIDetector_1 = require("./CIDetector");
Object.defineProperty(exports, "detectCIContext", { enumerable: true, get: function () { return CIDetector_1.detectCIContext; } });
Object.defineProperty(exports, "getExitCode", { enumerable: true, get: function () { return CIDetector_1.getExitCode; } });
// Formatters
__exportStar(require("./formatters"), exports);
// Dispatchers
__exportStar(require("./dispatchers"), exports);
//# sourceMappingURL=index.js.map