/**
 * Payload Rule Handler
 *
 * Validates network request payloads (query params, body, headers).
 */

import { parseQueryString } from '../../core/utils/serialization';
import { getNestedValue } from '../ValidationContext';
import type {
  PayloadRuleDef,
  ValidationContext,
  ValidationResult,
  ValidationEvidence,
  RuleTypeHandler,
  AnyRuleDef,
} from '../types';

export class PayloadHandler implements RuleTypeHandler<PayloadRuleDef> {
  readonly type = 'payload' as const;

  canHandle(rule: AnyRuleDef): rule is PayloadRuleDef {
    return rule.type === 'payload';
  }

  async evaluate(
    rule: PayloadRuleDef,
    context: ValidationContext
  ): Promise<ValidationResult[]> {
    const startTime = Date.now();
    const evidence: ValidationEvidence[] = [];

    try {
      // Find matching requests
      const requests = context.findRequests(rule.target.urlPattern);

      // Filter by method if specified
      const filtered = rule.target.method
        ? requests.filter((req) => req.method === rule.target.method)
        : requests;

      if (filtered.length === 0) {
        evidence.push({
          type: 'request',
          description: `No requests matching pattern: ${rule.target.urlPattern}`,
          expected: 'At least one matching request',
          actual: 0,
        });

        return [
          {
            ruleId: rule.id,
            ruleName: rule.name,
            status: 'failed',
            severity: rule.severity,
            message: `No requests found matching pattern: ${rule.target.urlPattern}`,
            details: rule.description,
            platform: rule.platform,
            evidence,
            timestamp: Date.now(),
            duration: Date.now() - startTime,
          },
        ];
      }

      // Validate each matching request
      const failedRequests: Array<{ url: string; failures: string[] }> = [];

      for (const request of filtered) {
        const requestEvidence: ValidationEvidence[] = [];
        const failures: string[] = [];

        // Extract data based on source
        let data: Record<string, unknown> = {};
        switch (rule.source) {
          case 'query':
            data = parseQueryString(request.url.split('?')[1] || '');
            break;

          case 'body':
            if (request.requestBody) {
              try {
                data =
                  typeof request.requestBody === 'string'
                    ? JSON.parse(request.requestBody)
                    : request.requestBody;
              } catch {
                // Try parsing as query string
                data =
                  typeof request.requestBody === 'string'
                    ? parseQueryString(request.requestBody)
                    : {};
              }
            }
            break;

          case 'headers':
            data = request.requestHeaders || {};
            break;
        }

        // Validate each field
        for (const field of rule.fields) {
          const value = getNestedValue(data, field.name);

          // Check required
          if (field.required && (value === undefined || value === null)) {
            failures.push(`Missing required field: ${field.name}`);
            requestEvidence.push({
              type: 'request',
              description: `Field ${field.name} is required`,
              expected: 'Present',
              actual: 'Missing',
            });
            continue;
          }

          // Skip validation if field is not required and not present
          if (!field.required && (value === undefined || value === null)) {
            continue;
          }

          // Check type
          if (field.type) {
            const actualType = typeof value;
            if (actualType !== field.type) {
              failures.push(
                `Field ${field.name} has wrong type: expected ${field.type}, got ${actualType}`
              );
              requestEvidence.push({
                type: 'request',
                description: `Field ${field.name} type mismatch`,
                expected: field.type,
                actual: actualType,
              });
              continue;
            }
          }

          // Check exact value
          if (field.value !== undefined) {
            if (value !== field.value) {
              failures.push(
                `Field ${field.name} has wrong value: expected ${field.value}, got ${value}`
              );
              requestEvidence.push({
                type: 'request',
                description: `Field ${field.name} value mismatch`,
                expected: field.value,
                actual: value,
              });
              continue;
            }
          }

          // Check pattern
          if (field.pattern && typeof value === 'string') {
            const regex = new RegExp(field.pattern);
            if (!regex.test(value)) {
              failures.push(
                `Field ${field.name} does not match pattern: ${field.pattern}`
              );
              requestEvidence.push({
                type: 'request',
                description: `Field ${field.name} pattern mismatch`,
                expected: field.pattern,
                actual: value,
              });
              continue;
            }
          }

          // If we get here, field is valid
          requestEvidence.push({
            type: 'request',
            description: `Field ${field.name} is valid`,
            actual: value,
            ref: { url: request.url },
          });
        }

        if (failures.length > 0) {
          failedRequests.push({
            url: request.url,
            failures,
          });
          evidence.push(...requestEvidence);
        }
      }

      // Build overall result
      const passed = failedRequests.length === 0;
      let message: string;

      if (passed) {
        message = `All ${filtered.length} matching request(s) have valid payloads`;
      } else {
        message = `${failedRequests.length} of ${filtered.length} request(s) have invalid payloads`;
      }

      // Add summary evidence
      if (passed) {
        evidence.push({
          type: 'request',
          description: `Validated ${filtered.length} request(s)`,
          actual: `${filtered.length} requests passed`,
        });
      } else {
        failedRequests.forEach((failed) => {
          evidence.push({
            type: 'request',
            description: `Request failed validation`,
            actual: failed.failures.join('; '),
            ref: { url: failed.url },
          });
        });
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
          message: `Payload validation failed: ${error instanceof Error ? error.message : String(error)}`,
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
}
