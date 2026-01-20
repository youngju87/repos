/**
 * Data Layer Rule Handler
 *
 * Validates data layer structure, schema, naming conventions, and content.
 */

import { getNestedValue, checkConditions } from '../ValidationContext';
import type {
  DataLayerRuleDef,
  ValidationContext,
  ValidationResult,
  ValidationEvidence,
  RuleTypeHandler,
  AnyRuleDef,
} from '../types';

export class DataLayerHandler implements RuleTypeHandler<DataLayerRuleDef> {
  readonly type = 'data-layer' as const;

  canHandle(rule: AnyRuleDef): rule is DataLayerRuleDef {
    return rule.type === 'data-layer';
  }

  async evaluate(
    rule: DataLayerRuleDef,
    context: ValidationContext
  ): Promise<ValidationResult[]> {
    const startTime = Date.now();
    const evidence: ValidationEvidence[] = [];

    try {
      // Get data layer events
      const events = context.getDataLayerEvents(
        rule.dataLayerName,
        rule.eventName
      );

      if (events.length === 0) {
        evidence.push({
          type: 'dataLayer',
          description: `No events found in data layer: ${rule.dataLayerName}${rule.eventName ? ` (event: ${rule.eventName})` : ''}`,
          expected: 'At least one event',
          actual: 0,
        });

        return [
          {
            ruleId: rule.id,
            ruleName: rule.name,
            status: 'failed',
            severity: rule.severity,
            message: `No events found in data layer ${rule.dataLayerName}${rule.eventName ? ` with event name ${rule.eventName}` : ''}`,
            details: rule.description,
            platform: rule.platform,
            evidence,
            timestamp: Date.now(),
            duration: Date.now() - startTime,
          },
        ];
      }

      // Validate each event
      const failures: Array<{
        eventIndex: number;
        failures: string[];
      }> = [];

      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        const eventFailures: string[] = [];

        // Validate required keys
        if (rule.requiredKeys && rule.requiredKeys.length > 0) {
          for (const key of rule.requiredKeys) {
            const value = getNestedValue(event.data, key);
            if (value === undefined || value === null) {
              eventFailures.push(`Missing required key: ${key}`);
            }
          }
        }

        // Validate forbidden keys
        if (rule.forbiddenKeys && rule.forbiddenKeys.length > 0) {
          for (const key of rule.forbiddenKeys) {
            const value = getNestedValue(event.data, key);
            if (value !== undefined && value !== null) {
              eventFailures.push(`Forbidden key present: ${key}`);
            }
          }
        }

        // Validate naming pattern
        if (rule.namingPattern) {
          const regex = new RegExp(rule.namingPattern);
          const eventData =
            typeof event.data === 'object' && event.data !== null
              ? (event.data as Record<string, unknown>)
              : {};

          for (const key of Object.keys(eventData)) {
            if (!regex.test(key)) {
              eventFailures.push(
                `Key "${key}" does not match naming pattern: ${rule.namingPattern}`
              );
            }
          }
        }

        // Validate schema
        if (rule.schema) {
          const schemaErrors = this.validateSchema(event.data, rule.schema);
          eventFailures.push(...schemaErrors);
        }

        // Validate assertions
        if (rule.assertions && rule.assertions.length > 0) {
          for (const assertion of rule.assertions) {
            const assertionError = this.validateAssertion(
              event.data,
              assertion
            );
            if (assertionError) {
              eventFailures.push(assertionError);
            }
          }
        }

        if (eventFailures.length > 0) {
          failures.push({
            eventIndex: i,
            failures: eventFailures,
          });
        }
      }

      // Build evidence
      if (failures.length === 0) {
        evidence.push({
          type: 'dataLayer',
          description: `All ${events.length} event(s) passed validation`,
          actual: `${events.length} events`,
        });
      } else {
        failures.forEach((failure) => {
          evidence.push({
            type: 'dataLayer',
            description: `Event ${failure.eventIndex} failed validation`,
            actual: failure.failures.join('; '),
            ref: { timestamp: events[failure.eventIndex].timestamp },
          });
        });
      }

      const passed = failures.length === 0;
      let message: string;

      if (passed) {
        message = `All ${events.length} data layer event(s) are valid`;
      } else {
        message = `${failures.length} of ${events.length} data layer event(s) failed validation`;
      }

      return [
        {
          ruleId: rule.id,
          ruleName: rule.name,
          status: passed ? 'passed' : 'failed',
          severity: rule.severity,
          message,
          details: rule.description,
          platform: rule.platform,
          evidence,
          timestamp: Date.now(),
          duration: Date.now() - startTime,
        },
      ];
    } catch (error) {
      return [
        {
          ruleId: rule.id,
          ruleName: rule.name,
          status: 'error',
          severity: rule.severity,
          message: `Data layer validation failed: ${error instanceof Error ? error.message : String(error)}`,
          details: rule.description,
          platform: rule.platform,
          evidence,
          error: error instanceof Error ? error.message : String(error),
          timestamp: Date.now(),
          duration: Date.now() - startTime,
        },
      ];
    }
  }

  /**
   * Validate data against schema
   */
  private validateSchema(
    data: unknown,
    schema: Record<string, unknown>
  ): string[] {
    const errors: string[] = [];

    if (typeof data !== 'object' || data === null) {
      errors.push('Data is not an object');
      return errors;
    }

    const dataObj = data as Record<string, unknown>;

    for (const [key, schemaValue] of Object.entries(schema)) {
      const actualValue = dataObj[key];

      // Check if key exists
      if (actualValue === undefined || actualValue === null) {
        errors.push(`Missing schema field: ${key}`);
        continue;
      }

      // Check type if schema value is a string (type name)
      if (typeof schemaValue === 'string') {
        const expectedType = schemaValue.toLowerCase();
        const actualType = typeof actualValue;

        if (expectedType === 'array' && !Array.isArray(actualValue)) {
          errors.push(
            `Field ${key} should be array, got ${actualType}`
          );
        } else if (expectedType !== 'array' && actualType !== expectedType) {
          errors.push(
            `Field ${key} should be ${expectedType}, got ${actualType}`
          );
        }
      }
      // Nested object schema
      else if (typeof schemaValue === 'object' && schemaValue !== null) {
        if (typeof actualValue === 'object' && actualValue !== null) {
          const nestedErrors = this.validateSchema(
            actualValue,
            schemaValue as Record<string, unknown>
          );
          errors.push(...nestedErrors.map((e) => `${key}.${e}`));
        } else {
          errors.push(`Field ${key} should be object, got ${typeof actualValue}`);
        }
      }
    }

    return errors;
  }

  /**
   * Validate a single assertion
   */
  private validateAssertion(
    data: unknown,
    assertion: any
  ): string | null {
    if (!assertion.field) {
      return null;
    }

    const actualValue = getNestedValue(data, assertion.field);

    switch (assertion.type) {
      case 'required':
        if (actualValue === undefined || actualValue === null) {
          return assertion.message || `Field ${assertion.field} is required`;
        }
        break;

      case 'equals':
        if (actualValue !== assertion.value) {
          return (
            assertion.message ||
            `Field ${assertion.field} should equal ${assertion.value}, got ${actualValue}`
          );
        }
        break;

      case 'matches':
        if (typeof actualValue === 'string' && assertion.pattern) {
          const regex = new RegExp(assertion.pattern);
          if (!regex.test(actualValue)) {
            return (
              assertion.message ||
              `Field ${assertion.field} should match pattern ${assertion.pattern}`
            );
          }
        }
        break;

      case 'type':
        if (assertion.dataType) {
          const actualType =
            assertion.dataType === 'array'
              ? Array.isArray(actualValue)
                ? 'array'
                : typeof actualValue
              : typeof actualValue;

          if (actualType !== assertion.dataType) {
            return (
              assertion.message ||
              `Field ${assertion.field} should be ${assertion.dataType}, got ${actualType}`
            );
          }
        }
        break;

      case 'range':
        if (typeof actualValue === 'number') {
          if (
            assertion.min !== undefined &&
            actualValue < assertion.min
          ) {
            return (
              assertion.message ||
              `Field ${assertion.field} should be >= ${assertion.min}, got ${actualValue}`
            );
          }
          if (
            assertion.max !== undefined &&
            actualValue > assertion.max
          ) {
            return (
              assertion.message ||
              `Field ${assertion.field} should be <= ${assertion.max}, got ${actualValue}`
            );
          }
        }
        break;

      case 'length':
        if (typeof actualValue === 'string' || Array.isArray(actualValue)) {
          const length = actualValue.length;
          if (assertion.min !== undefined && length < assertion.min) {
            return (
              assertion.message ||
              `Field ${assertion.field} length should be >= ${assertion.min}, got ${length}`
            );
          }
          if (assertion.max !== undefined && length > assertion.max) {
            return (
              assertion.message ||
              `Field ${assertion.field} length should be <= ${assertion.max}, got ${length}`
            );
          }
        }
        break;
    }

    // Check allowed values
    if (assertion.allowedValues && Array.isArray(assertion.allowedValues)) {
      if (!assertion.allowedValues.includes(actualValue)) {
        return (
          assertion.message ||
          `Field ${assertion.field} should be one of [${assertion.allowedValues.join(', ')}], got ${actualValue}`
        );
      }
    }

    return null;
  }
}
