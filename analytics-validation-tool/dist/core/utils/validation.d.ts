/**
 * Input Validation Utilities
 *
 * Centralized validation functions for all public APIs.
 */
import { AVTError } from './errors';
/**
 * Validation error
 */
export declare class ValidationError extends AVTError {
    readonly field?: string | undefined;
    constructor(message: string, field?: string | undefined);
}
/**
 * URL validation
 */
export declare function validateUrl(url: string, fieldName?: string): URL;
/**
 * Validate positive number
 */
export declare function validatePositiveNumber(value: unknown, fieldName: string, options?: {
    min?: number;
    max?: number;
    allowZero?: boolean;
}): number;
/**
 * Validate array
 */
export declare function validateArray<T>(value: unknown, fieldName: string, options?: {
    minLength?: number;
    maxLength?: number;
    itemValidator?: (item: unknown, index: number) => T;
}): T[];
/**
 * Validate object
 */
export declare function validateObject<T extends Record<string, unknown>>(value: unknown, fieldName: string, validators: {
    [K in keyof T]?: (value: unknown) => T[K];
}): T;
/**
 * Validate enum value
 */
export declare function validateEnum<T extends string>(value: unknown, fieldName: string, allowedValues: readonly T[]): T;
/**
 * Validate string
 */
export declare function validateString(value: unknown, fieldName: string, options?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    allowEmpty?: boolean;
}): string;
/**
 * Validate boolean
 */
export declare function validateBoolean(value: unknown, fieldName: string): boolean;
/**
 * Validate optional value
 */
export declare function validateOptional<T>(value: unknown, validator: (value: unknown) => T): T | undefined;
/**
 * Validate data layer name (must be valid JS identifier)
 */
export declare function validateDataLayerName(name: unknown, fieldName?: string): string;
/**
 * Validate regex pattern
 */
export declare function validateRegexPattern(pattern: unknown, fieldName?: string): RegExp;
//# sourceMappingURL=validation.d.ts.map