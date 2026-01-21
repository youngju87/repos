"use strict";
/**
 * JSON Formatter
 *
 * Formats reports as machine-readable JSON.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONFormatter = void 0;
/**
 * JSON Report Formatter
 */
class JSONFormatter {
    options;
    format = 'json';
    constructor(options = {}) {
        this.options = options;
        this.options.prettyPrint = options.prettyPrint ?? true;
        this.options.indent = options.indent ?? 2;
    }
    /**
     * Format a run report
     */
    formatRun(report) {
        if (this.options.prettyPrint) {
            return JSON.stringify(report, null, this.options.indent);
        }
        return JSON.stringify(report);
    }
    /**
     * Format a page report
     */
    formatPage(report) {
        if (this.options.prettyPrint) {
            return JSON.stringify(report, null, this.options.indent);
        }
        return JSON.stringify(report);
    }
    /**
     * Format issues
     */
    formatIssues(issues) {
        if (this.options.prettyPrint) {
            return JSON.stringify(issues, null, this.options.indent);
        }
        return JSON.stringify(issues);
    }
}
exports.JSONFormatter = JSONFormatter;
//# sourceMappingURL=JSONFormatter.js.map