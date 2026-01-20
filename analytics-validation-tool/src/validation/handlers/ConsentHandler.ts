/**
 * Consent Rule Handler
 *
 * Validates consent compliance - ensures tags only fire after consent is granted.
 */

import type {
  ConsentRuleDef,
  ValidationContext,
  ValidationResult,
  ValidationEvidence,
  RuleTypeHandler,
  AnyRuleDef,
} from '../types';

export class ConsentHandler implements RuleTypeHandler<ConsentRuleDef> {
  readonly type = 'consent' as const;

  canHandle(rule: AnyRuleDef): rule is ConsentRuleDef {
    return rule.type === 'consent';
  }

  async evaluate(
    rule: ConsentRuleDef,
    context: ValidationContext
  ): Promise<ValidationResult[]> {
    const startTime = Date.now();
    const evidence: ValidationEvidence[] = [];

    try {
      // Find the tag
      const tag = context.findTag(rule.platform);

      if (!tag) {
        // Tag not present - rule is skipped
        return [
          {
            ruleId: rule.id,
            ruleName: rule.name,
            status: 'skipped',
            severity: rule.severity,
            message: `Skipped: ${rule.platform} tag not found`,
            details: rule.description,
            platform: rule.platform,
            evidence: [
              {
                type: 'tag',
                description: `Tag not present: ${rule.platform}`,
                expected: 'Present',
                actual: 'Missing',
              },
            ],
            timestamp: Date.now(),
            duration: Date.now() - startTime,
          },
        ];
      }

      // Get tag timestamp
      const tagTimestamp = context.getTagTimestamp(tag);
      evidence.push({
        type: 'tag',
        description: `Tag ${rule.platform} loaded`,
        actual: tagTimestamp,
        ref: { id: tag.id, timestamp: tagTimestamp },
      });

      // If consent is not required before tag fires, just verify consent exists somewhere
      if (!rule.requireConsentBefore) {
        const consentFound = this.findConsent(rule, context, evidence);
        const passed = consentFound;

        return [
          {
            ruleId: rule.id,
            ruleName: rule.name,
            status: passed ? 'passed' : 'failed',
            severity: rule.severity,
            message: passed
              ? `Consent signal found for ${rule.platform}`
              : `Consent signal not found for ${rule.platform}`,
            details: rule.description,
            platform: rule.platform,
            evidence,
            timestamp: Date.now(),
            duration: Date.now() - startTime,
          },
        ];
      }

      // Check if consent signal exists and came before tag
      const consentTimestamp = this.getConsentTimestamp(rule, context, evidence);

      if (consentTimestamp === undefined) {
        return [
          {
            ruleId: rule.id,
            ruleName: rule.name,
            status: 'failed',
            severity: rule.severity,
            message: `Consent signal not found for ${rule.platform}`,
            details: rule.description,
            platform: rule.platform,
            evidence,
            timestamp: Date.now(),
            duration: Date.now() - startTime,
          },
        ];
      }

      // Check order
      const consentBeforeTag = consentTimestamp < tagTimestamp;
      const timeDifference = tagTimestamp - consentTimestamp;

      evidence.push({
        type: 'timing',
        description: `Time difference between consent and tag: ${timeDifference}ms`,
        actual: timeDifference,
      });

      const passed = consentBeforeTag;
      let message: string;

      if (passed) {
        message = `Consent granted ${timeDifference}ms before ${rule.platform} tag fired`;
      } else {
        message = `VIOLATION: ${rule.platform} tag fired ${Math.abs(timeDifference)}ms before consent was granted`;
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
          suggestion: passed
            ? undefined
            : 'Ensure consent is collected before initializing analytics tags',
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
          message: `Consent validation failed: ${error instanceof Error ? error.message : String(error)}`,
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
   * Check if consent signal exists anywhere
   */
  private findConsent(
    rule: ConsentRuleDef,
    context: ValidationContext,
    evidence: ValidationEvidence[]
  ): boolean {
    if (!rule.consentSignal) {
      return true; // No specific signal required
    }

    const { source, name, value } = rule.consentSignal;

    switch (source) {
      case 'dataLayer': {
        const events = context.getDataLayerEvents(name);
        if (events.length > 0) {
          const event = events[0];
          const actualValue =
            typeof event.data === 'object' && event.data !== null
              ? (event.data as Record<string, unknown>)[name]
              : event.data;

          const matches = value === undefined || actualValue === value;
          evidence.push({
            type: 'dataLayer',
            description: `Consent signal in data layer: ${name}`,
            expected: value,
            actual: actualValue,
          });
          return matches;
        }
        evidence.push({
          type: 'dataLayer',
          description: `Consent signal not found in data layer: ${name}`,
          expected: 'Present',
          actual: 'Missing',
        });
        return false;
      }

      case 'cookie': {
        const cookieValue = context.getCookie(name);
        if (cookieValue !== undefined) {
          const matches = value === undefined || cookieValue === value;
          evidence.push({
            type: 'cookie',
            description: `Consent cookie: ${name}`,
            expected: value,
            actual: cookieValue,
          });
          return matches;
        }
        evidence.push({
          type: 'cookie',
          description: `Consent cookie not found: ${name}`,
          expected: 'Present',
          actual: 'Missing',
        });
        return false;
      }

      case 'localStorage': {
        const storageValue = context.getLocalStorage(name);
        if (storageValue !== undefined) {
          const matches = value === undefined || storageValue === value;
          evidence.push({
            type: 'cookie', // Using cookie type for storage
            description: `Consent in localStorage: ${name}`,
            expected: value,
            actual: storageValue,
          });
          return matches;
        }
        evidence.push({
          type: 'cookie',
          description: `Consent not found in localStorage: ${name}`,
          expected: 'Present',
          actual: 'Missing',
        });
        return false;
      }

      default:
        return false;
    }
  }

  /**
   * Get timestamp of consent signal
   */
  private getConsentTimestamp(
    rule: ConsentRuleDef,
    context: ValidationContext,
    evidence: ValidationEvidence[]
  ): number | undefined {
    if (!rule.consentSignal) {
      // No specific signal - assume consent was given at page load
      return 0;
    }

    const { source, name, value } = rule.consentSignal;

    switch (source) {
      case 'dataLayer': {
        const events = context.getDataLayerEvents(name);
        for (const event of events) {
          const actualValue =
            typeof event.data === 'object' && event.data !== null
              ? (event.data as Record<string, unknown>)[name]
              : event.data;

          const matches = value === undefined || actualValue === value;
          if (matches) {
            evidence.push({
              type: 'dataLayer',
              description: `Consent event found: ${name}`,
              actual: event.timestamp,
              ref: { timestamp: event.timestamp },
            });
            return event.timestamp;
          }
        }
        return undefined;
      }

      case 'cookie':
      case 'localStorage': {
        // Cookies and localStorage don't have timestamps
        // We can only verify they exist, not when they were set
        // For compliance purposes, we'll assume they existed at page load (timestamp 0)
        const found = this.findConsent(rule, context, []);
        return found ? 0 : undefined;
      }

      default:
        return undefined;
    }
  }
}
