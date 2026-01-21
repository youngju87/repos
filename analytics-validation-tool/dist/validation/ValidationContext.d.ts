/**
 * Validation Context
 *
 * Builds and provides a context with helper methods for rule evaluation.
 */
import type { PageScanResult } from '../types';
import type { TagDetectionResult } from '../detection/types';
import type { ValidationContext, Environment } from './types';
/**
 * Build a validation context from scan and detection results
 */
export declare function buildValidationContext(scan: PageScanResult, detection: TagDetectionResult, environment?: Environment): ValidationContext;
/**
 * Get nested value from object using dot notation
 */
export declare function getNestedValue(obj: unknown, path: string): unknown;
/**
 * Evaluate a condition against a value
 */
export declare function evaluateCondition(actual: unknown, operator: string, expected: unknown): boolean;
/**
 * Check if conditions match
 */
export declare function checkConditions(conditions: Array<{
    field: string;
    operator: string;
    value?: unknown;
    all?: boolean;
}>, data: unknown): boolean;
//# sourceMappingURL=ValidationContext.d.ts.map