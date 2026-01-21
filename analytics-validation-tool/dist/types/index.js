"use strict";
/**
 * Analytics Validation Tool - Core Type Definitions
 *
 * These types define the data structures used throughout the scanning layer.
 * They are designed to be:
 * - JSON-serializable for storage and transmission
 * - Platform-agnostic (no GA4/Adobe-specific assumptions)
 * - Comprehensive enough for downstream validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = generateId;
/** Generate a unique ID */
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
//# sourceMappingURL=index.js.map