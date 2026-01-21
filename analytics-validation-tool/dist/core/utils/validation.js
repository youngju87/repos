"use strict";
/**
 * Input Validation Utilities
 *
 * Centralized validation functions for all public APIs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
exports.validateUrl = validateUrl;
exports.validatePositiveNumber = validatePositiveNumber;
exports.validateArray = validateArray;
exports.validateObject = validateObject;
exports.validateEnum = validateEnum;
exports.validateString = validateString;
exports.validateBoolean = validateBoolean;
exports.validateOptional = validateOptional;
exports.validateDataLayerName = validateDataLayerName;
exports.validateRegexPattern = validateRegexPattern;
const errors_1 = require("./errors");
/**
 * Validation error
 */
class ValidationError extends errors_1.AVTError {
    field;
    constructor(message, field) {
        super('Validation', message);
        this.field = field;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
/**
 * URL validation
 */
function validateUrl(url, fieldName = 'url') {
    if (!url || typeof url !== 'string') {
        throw new ValidationError(`${fieldName} must be a non-empty string`, fieldName);
    }
    if (url.trim() === '') {
        throw new ValidationError(`${fieldName} cannot be empty`, fieldName);
    }
    try {
        const parsed = new URL(url);
        // Only allow http/https
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            throw new ValidationError(`${fieldName} must use http:// or https:// protocol`, fieldName);
        }
        return parsed;
    }
    catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new ValidationError(`${fieldName} is not a valid URL: ${error instanceof Error ? error.message : String(error)}`, fieldName);
    }
}
/**
 * Validate positive number
 */
function validatePositiveNumber(value, fieldName, options = {}) {
    if (typeof value !== 'number') {
        throw new ValidationError(`${fieldName} must be a number`, fieldName);
    }
    if (isNaN(value)) {
        throw new ValidationError(`${fieldName} cannot be NaN`, fieldName);
    }
    if (!isFinite(value)) {
        throw new ValidationError(`${fieldName} must be finite`, fieldName);
    }
    const min = options.min ?? (options.allowZero ? 0 : 1);
    if (value < min) {
        throw new ValidationError(`${fieldName} must be >= ${min}, got ${value}`, fieldName);
    }
    if (options.max !== undefined && value > options.max) {
        throw new ValidationError(`${fieldName} must be <= ${options.max}, got ${value}`, fieldName);
    }
    return value;
}
/**
 * Validate array
 */
function validateArray(value, fieldName, options = {}) {
    if (!Array.isArray(value)) {
        throw new ValidationError(`${fieldName} must be an array`, fieldName);
    }
    if (options.minLength !== undefined && value.length < options.minLength) {
        throw new ValidationError(`${fieldName} must have at least ${options.minLength} items`, fieldName);
    }
    if (options.maxLength !== undefined && value.length > options.maxLength) {
        throw new ValidationError(`${fieldName} must have at most ${options.maxLength} items`, fieldName);
    }
    if (options.itemValidator) {
        return value.map((item, index) => {
            try {
                return options.itemValidator(item, index);
            }
            catch (error) {
                throw new ValidationError(`${fieldName}[${index}]: ${error instanceof Error ? error.message : String(error)}`, `${fieldName}[${index}]`);
            }
        });
    }
    return value;
}
/**
 * Validate object
 */
function validateObject(value, fieldName, validators) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new ValidationError(`${fieldName} must be an object`, fieldName);
    }
    const result = {};
    const obj = value;
    for (const [key, validator] of Object.entries(validators)) {
        if (validator) {
            try {
                result[key] = validator(obj[key]);
            }
            catch (error) {
                throw new ValidationError(`${fieldName}.${key}: ${error instanceof Error ? error.message : String(error)}`, `${fieldName}.${key}`);
            }
        }
    }
    return result;
}
/**
 * Validate enum value
 */
function validateEnum(value, fieldName, allowedValues) {
    if (typeof value !== 'string') {
        throw new ValidationError(`${fieldName} must be a string`, fieldName);
    }
    if (!allowedValues.includes(value)) {
        throw new ValidationError(`${fieldName} must be one of: ${allowedValues.join(', ')}`, fieldName);
    }
    return value;
}
/**
 * Validate string
 */
function validateString(value, fieldName, options = {}) {
    if (typeof value !== 'string') {
        throw new ValidationError(`${fieldName} must be a string`, fieldName);
    }
    if (!options.allowEmpty && value.trim() === '') {
        throw new ValidationError(`${fieldName} cannot be empty`, fieldName);
    }
    if (options.minLength !== undefined && value.length < options.minLength) {
        throw new ValidationError(`${fieldName} must be at least ${options.minLength} characters`, fieldName);
    }
    if (options.maxLength !== undefined && value.length > options.maxLength) {
        throw new ValidationError(`${fieldName} must be at most ${options.maxLength} characters`, fieldName);
    }
    if (options.pattern && !options.pattern.test(value)) {
        throw new ValidationError(`${fieldName} must match pattern ${options.pattern}`, fieldName);
    }
    return value;
}
/**
 * Validate boolean
 */
function validateBoolean(value, fieldName) {
    if (typeof value !== 'boolean') {
        throw new ValidationError(`${fieldName} must be a boolean`, fieldName);
    }
    return value;
}
/**
 * Validate optional value
 */
function validateOptional(value, validator) {
    if (value === undefined || value === null) {
        return undefined;
    }
    return validator(value);
}
/**
 * Validate data layer name (must be valid JS identifier)
 */
function validateDataLayerName(name, fieldName = 'dataLayerName') {
    const str = validateString(name, fieldName);
    // Valid JS identifier pattern
    const pattern = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
    if (!pattern.test(str)) {
        throw new ValidationError(`${fieldName} must be a valid JavaScript identifier`, fieldName);
    }
    return str;
}
/**
 * Validate regex pattern
 */
function validateRegexPattern(pattern, fieldName = 'pattern') {
    if (pattern instanceof RegExp) {
        return pattern;
    }
    if (typeof pattern === 'string') {
        try {
            return new RegExp(pattern);
        }
        catch (error) {
            throw new ValidationError(`${fieldName} is not a valid regular expression: ${error instanceof Error ? error.message : String(error)}`, fieldName);
        }
    }
    throw new ValidationError(`${fieldName} must be a RegExp or string`, fieldName);
}
//# sourceMappingURL=validation.js.map