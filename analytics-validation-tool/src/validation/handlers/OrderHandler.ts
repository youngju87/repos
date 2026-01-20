/**
 * Order Rule Handler
 *
 * Validates load order and timing between tags, events, and scripts.
 */

import type {
  OrderRuleDef,
  ValidationContext,
  ValidationResult,
  ValidationEvidence,
  RuleTypeHandler,
  AnyRuleDef,
} from '../types';

export class OrderHandler implements RuleTypeHandler<OrderRuleDef> {
  readonly type = 'order' as const;

  canHandle(rule: AnyRuleDef): rule is OrderRuleDef {
    return rule.type === 'order';
  }

  async evaluate(
    rule: OrderRuleDef,
    context: ValidationContext
  ): Promise<ValidationResult[]> {
    const startTime = Date.now();
    const evidence: ValidationEvidence[] = [];

    try {
      // Get timestamps for before and after items
      const beforeTimestamp = this.getTimestamp(rule.before, context, evidence);
      const afterTimestamp = this.getTimestamp(rule.after, context, evidence);

      // Check if both items exist
      if (beforeTimestamp === undefined) {
        return [
          {
            ruleId: rule.id,
            ruleName: rule.name,
            status: 'failed',
            severity: rule.severity,
            message: `Cannot validate order: ${rule.before.type} "${rule.before.identifier}" not found`,
            details: rule.description,
            platform: rule.platform,
            evidence,
            timestamp: Date.now(),
            duration: Date.now() - startTime,
          },
        ];
      }

      if (afterTimestamp === undefined) {
        return [
          {
            ruleId: rule.id,
            ruleName: rule.name,
            status: 'failed',
            severity: rule.severity,
            message: `Cannot validate order: ${rule.after.type} "${rule.after.identifier}" not found`,
            details: rule.description,
            platform: rule.platform,
            evidence,
            timestamp: Date.now(),
            duration: Date.now() - startTime,
          },
        ];
      }

      // Check order
      const timeDifference = afterTimestamp - beforeTimestamp;
      const correctOrder = beforeTimestamp < afterTimestamp;

      // Check time constraint if specified
      const meetsTimeConstraint =
        !rule.maxTimeDifference || timeDifference <= rule.maxTimeDifference;

      const passed = correctOrder && meetsTimeConstraint;

      // Add timing evidence
      evidence.push({
        type: 'timing',
        description: `Time difference: ${timeDifference}ms`,
        actual: timeDifference,
        ref: {
          timestamp: beforeTimestamp,
        },
      });

      if (rule.maxTimeDifference) {
        evidence.push({
          type: 'timing',
          description: 'Max allowed time difference',
          expected: rule.maxTimeDifference,
          actual: timeDifference,
        });
      }

      // Build message
      let message: string;
      if (passed) {
        message = `Correct order: ${rule.before.identifier} loaded ${timeDifference}ms before ${rule.after.identifier}`;
      } else {
        if (!correctOrder) {
          message = `Wrong order: ${rule.after.identifier} loaded ${Math.abs(timeDifference)}ms before ${rule.before.identifier}`;
        } else {
          message = `Time constraint violated: ${timeDifference}ms exceeds max ${rule.maxTimeDifference}ms`;
        }
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
          message: `Order validation failed: ${error instanceof Error ? error.message : String(error)}`,
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
   * Get timestamp for a specific item
   */
  private getTimestamp(
    item: { type: 'tag' | 'event' | 'script'; identifier: string },
    context: ValidationContext,
    evidence: ValidationEvidence[]
  ): number | undefined {
    switch (item.type) {
      case 'tag': {
        const tag = context.findTag(item.identifier);
        if (tag) {
          const timestamp = context.getTagTimestamp(tag);
          evidence.push({
            type: 'tag',
            description: `Found ${item.type}: ${item.identifier}`,
            actual: timestamp,
            ref: { id: tag.id, timestamp },
          });
          return timestamp;
        }
        evidence.push({
          type: 'tag',
          description: `${item.type} not found: ${item.identifier}`,
          expected: 'Present',
          actual: 'Missing',
        });
        return undefined;
      }

      case 'event': {
        const timestamp = context.getEventTimestamp(item.identifier);
        if (timestamp) {
          evidence.push({
            type: 'dataLayer',
            description: `Found ${item.type}: ${item.identifier}`,
            actual: timestamp,
            ref: { timestamp },
          });
          return timestamp;
        }
        evidence.push({
          type: 'dataLayer',
          description: `${item.type} not found: ${item.identifier}`,
          expected: 'Present',
          actual: 'Missing',
        });
        return undefined;
      }

      case 'script': {
        const regex = new RegExp(item.identifier, 'i');
        const script = context.scan.scripts.find((s) =>
          s.src ? regex.test(s.src) : false
        );
        if (script && script.timestamp) {
          evidence.push({
            type: 'script',
            description: `Found ${item.type}: ${item.identifier}`,
            actual: script.timestamp,
            ref: { id: script.id, url: script.src, timestamp: script.timestamp },
          });
          return script.timestamp;
        }
        evidence.push({
          type: 'script',
          description: `${item.type} not found: ${item.identifier}`,
          expected: 'Present',
          actual: 'Missing',
        });
        return undefined;
      }

      default:
        return undefined;
    }
  }
}
