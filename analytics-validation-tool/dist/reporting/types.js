"use strict";
/**
 * Reporting Types
 *
 * Type definitions for reporting and alerting system.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExitCode = void 0;
// =============================================================================
// CI/CD INTEGRATION
// =============================================================================
/**
 * CI/CD exit code
 */
var ExitCode;
(function (ExitCode) {
    /** All checks passed */
    ExitCode[ExitCode["SUCCESS"] = 0] = "SUCCESS";
    /** Warnings only (configurable) */
    ExitCode[ExitCode["WARNINGS"] = 1] = "WARNINGS";
    /** Errors detected */
    ExitCode[ExitCode["ERRORS"] = 2] = "ERRORS";
})(ExitCode || (exports.ExitCode = ExitCode = {}));
//# sourceMappingURL=types.js.map