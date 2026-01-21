/**
 * Input Validation Utilities
 *
 * Centralized validation functions for all public APIs.
 */

import { AVTError } from './errors';

/**
 * Validation error
 */
export class ValidationError extends AVTError {
  constructor(message: string, public readonly field?: string) {
    super('Validation', message);
    this.name = 'ValidationError';
  }
}

/**
 * URL validation
 */
export function validateUrl(url: string, fieldName = 'url'): URL {
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
      throw new ValidationError(
        `${fieldName} must use http:// or https:// protocol`,
        fieldName
      );
    }

    return parsed;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError(
      `${fieldName} is not a valid URL: ${error instanceof Error ? error.message : String(error)}`,
      fieldName
    );
  }
}

/**
 * Validate positive number
 */
export function validatePositiveNumber(
  value: unknown,
  fieldName: string,
  options: { min?: number; max?: number; allowZero?: boolean } = {}
): number {
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
    throw new ValidationError(
      `${fieldName} must be >= ${min}, got ${value}`,
      fieldName
    );
  }

  if (options.max !== undefined && value > options.max) {
    throw new ValidationError(
      `${fieldName} must be <= ${options.max}, got ${value}`,
      fieldName
    );
  }

  return value;
}

/**
 * Validate array
 */
export function validateArray<T>(
  value: unknown,
  fieldName: string,
  options: {
    minLength?: number;
    maxLength?: number;
    itemValidator?: (item: unknown, index: number) => T;
  } = {}
): T[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`, fieldName);
  }

  if (options.minLength !== undefined && value.length < options.minLength) {
    throw new ValidationError(
      `${fieldName} must have at least ${options.minLength} items`,
      fieldName
    );
  }

  if (options.maxLength !== undefined && value.length > options.maxLength) {
    throw new ValidationError(
      `${fieldName} must have at most ${options.maxLength} items`,
      fieldName
    );
  }

  if (options.itemValidator) {
    return value.map((item, index) => {
      try {
        return options.itemValidator!(item, index);
      } catch (error) {
        throw new ValidationError(
          `${fieldName}[${index}]: ${error instanceof Error ? error.message : String(error)}`,
          `${fieldName}[${index}]`
        );
      }
    });
  }

  return value as T[];
}

/**
 * Validate object
 */
export function validateObject<T extends Record<string, unknown>>(
  value: unknown,
  fieldName: string,
  validators: {
    [K in keyof T]?: (value: unknown) => T[K];
  }
): T {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an object`, fieldName);
  }

  const result: Record<string, unknown> = {};
  const obj = value as Record<string, unknown>;

  for (const [key, validator] of Object.entries(validators)) {
    if (validator) {
      try {
        result[key] = validator(obj[key]);
      } catch (error) {
        throw new ValidationError(
          `${fieldName}.${key}: ${error instanceof Error ? error.message : String(error)}`,
          `${fieldName}.${key}`
        );
      }
    }
  }

  return result as T;
}

/**
 * Validate enum value
 */
export function validateEnum<T extends string>(
  value: unknown,
  fieldName: string,
  allowedValues: readonly T[]
): T {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, fieldName);
  }

  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`,
      fieldName
    );
  }

  return value as T;
}

/**
 * Validate string
 */
export function validateString(
  value: unknown,
  fieldName: string,
  options: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    allowEmpty?: boolean;
  } = {}
): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, fieldName);
  }

  if (!options.allowEmpty && value.trim() === '') {
    throw new ValidationError(`${fieldName} cannot be empty`, fieldName);
  }

  if (options.minLength !== undefined && value.length < options.minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${options.minLength} characters`,
      fieldName
    );
  }

  if (options.maxLength !== undefined && value.length > options.maxLength) {
    throw new ValidationError(
      `${fieldName} must be at most ${options.maxLength} characters`,
      fieldName
    );
  }

  if (options.pattern && !options.pattern.test(value)) {
    throw new ValidationError(
      `${fieldName} must match pattern ${options.pattern}`,
      fieldName
    );
  }

  return value;
}

/**
 * Validate boolean
 */
export function validateBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError(`${fieldName} must be a boolean`, fieldName);
  }
  return value;
}

/**
 * Validate optional value
 */
export function validateOptional<T>(
  value: unknown,
  validator: (value: unknown) => T
): T | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  return validator(value);
}

/**
 * Validate data layer name (must be valid JS identifier)
 */
export function validateDataLayerName(name: unknown, fieldName = 'dataLayerName'): string {
  const str = validateString(name, fieldName);

  // Valid JS identifier pattern
  const pattern = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

  if (!pattern.test(str)) {
    throw new ValidationError(
      `${fieldName} must be a valid JavaScript identifier`,
      fieldName
    );
  }

  return str;
}

/**
 * Validate regex pattern
 */
export function validateRegexPattern(
  pattern: unknown,
  fieldName = 'pattern'
): RegExp {
  if (pattern instanceof RegExp) {
    return pattern;
  }

  if (typeof pattern === 'string') {
    try {
      return new RegExp(pattern);
    } catch (error) {
      throw new ValidationError(
        `${fieldName} is not a valid regular expression: ${error instanceof Error ? error.message : String(error)}`,
        fieldName
      );
    }
  }

  throw new ValidationError(
    `${fieldName} must be a RegExp or string`,
    fieldName
  );
}
