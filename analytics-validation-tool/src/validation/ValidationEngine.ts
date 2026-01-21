/**
 * Validation Engine
 *
 * Orchestrates validation rule execution and produces validation reports.
 */

import { v4 as uuidv4 } from 'uuid';
import { buildValidationContext } from './ValidationContext';
import type {
  AnyRuleDef,
  ValidationContext,
  ValidationResult,
  ValidationReport,
  ValidationSummary,
  RuleTypeHandler,
  Environment,
} from './types';
import type { PageScanResult } from '../types';
import type { TagDetectionResult } from '../detection/types';

/**
 * Validation engine configuration
 */
export interface ValidationEngineConfig {
  /** Handlers for different rule types */
  handlers: Map<string, RuleTypeHandler>;

  /** Environment */
  environment?: Environment;

  /** Timeout per rule (ms) */
  ruleTimeout?: number;

  /** Whether to continue on rule errors */
  continueOnError?: boolean;

  /** Debug logging */
  debug?: boolean;
}

/**
 * Validation Engine
 */
export class ValidationEngine {
  private config: Required<ValidationEngineConfig>;

  constructor(config: Partial<ValidationEngineConfig> = {}) {
    this.config = {
      handlers: config.handlers || new Map(),
      environment: config.environment || 'production',
      ruleTimeout: config.ruleTimeout || 30000,
      continueOnError: config.continueOnError ?? true,
      debug: config.debug ?? false,
    };
  }

  /**
   * Register a rule type handler
   */
  registerHandler(handler: RuleTypeHandler): void {
    this.config.handlers.set(handler.type, handler);
    if (this.config.debug) {
      console.log(`[ValidationEngine] Registered handler: ${handler.type}`);
    }
  }

  /**
   * Validate scan and detection results against rules
   */
  async validate(
    scan: PageScanResult,
    detection: TagDetectionResult,
    rules: AnyRuleDef[]
  ): Promise<ValidationReport> {
    const reportId = uuidv4();
    const startedAt = Date.now();

    if (this.config.debug) {
      console.log(
        `[ValidationEngine] Starting validation with ${rules.length} rules`
      );
    }

    // Build validation context
    const context = buildValidationContext(
      scan,
      detection,
      this.config.environment
    );

    // Track results and errors
    const results: ValidationResult[] = [];
    const ruleErrors: Array<{ ruleId?: string; error: string }> = [];
    const rulesLoaded: string[] = [];

    // Execute rules
    for (const rule of rules) {
      // Skip disabled rules
      if (rule.enabled === false) {
        if (this.config.debug) {
          console.log(`[ValidationEngine] Skipping disabled rule: ${rule.id}`);
        }
        continue;
      }

      // Keep a reference for use in catch block
      const currentRule = rule as AnyRuleDef;
      rulesLoaded.push(currentRule.id);

      try {
        // Check if rule conditions apply
        if (currentRule.conditions && currentRule.conditions.length > 0) {
          // Rules can have conditions on the context itself
          // For now, we'll skip condition checking on the context
          // In a full implementation, you could check environment, platform filters, etc.
        }

        // Find handler for rule type
        const handler = this.config.handlers.get(currentRule.type);
        if (!handler) {
          ruleErrors.push({
            ruleId: currentRule.id,
            error: `No handler registered for rule type: ${currentRule.type}`,
          });
          if (this.config.debug) {
            console.error(
              `[ValidationEngine] No handler for rule type: ${currentRule.type}`
            );
          }
          continue;
        }

        // Check if handler can handle this rule
        // Use type assertion to avoid narrowing to 'never' in the negative branch
        if (!(handler.canHandle as (r: AnyRuleDef) => boolean)(currentRule)) {
          ruleErrors.push({
            ruleId: currentRule.id,
            error: `Handler ${currentRule.type} cannot handle rule ${currentRule.id}`,
          });
          continue;
        }
        // Rule passed handler check
        const ruleForHandler = currentRule;

        // Execute rule with timeout
        if (this.config.debug) {
          console.log(`[ValidationEngine] Evaluating rule: ${ruleForHandler.id}`);
        }

        const ruleResults = await this.executeRuleWithTimeout(
          handler,
          ruleForHandler,
          context
        );

        results.push(...ruleResults);

        if (this.config.debug) {
          ruleResults.forEach((result) => {
            console.log(
              `[ValidationEngine] Rule ${ruleForHandler.id}: ${result.status} - ${result.message}`
            );
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        ruleErrors.push({
          ruleId: currentRule.id,
          error: errorMessage,
        });

        if (this.config.debug) {
          console.error(`[ValidationEngine] Error in rule ${currentRule.id}:`, error);
        }

        if (!this.config.continueOnError) {
          break;
        }
      }
    }

    const completedAt = Date.now();
    const duration = completedAt - startedAt;

    // Calculate summary
    const summary = this.calculateSummary(results);

    if (this.config.debug) {
      console.log(
        `[ValidationEngine] Validation complete: ${summary.passed} passed, ${summary.failed} failed, ${summary.errors} errors`
      );
    }

    return {
      id: reportId,
      scanId: scan.id,
      detectionId: detection.id,
      url: scan.url,
      environment: this.config.environment,
      startedAt,
      completedAt,
      duration,
      results,
      summary,
      rulesLoaded,
      ruleErrors,
      engineVersion: '1.0.0',
    };
  }

  /**
   * Execute a rule with timeout protection
   */
  private async executeRuleWithTimeout(
    handler: RuleTypeHandler,
    rule: AnyRuleDef,
    context: ValidationContext
  ): Promise<ValidationResult[]> {
    return Promise.race([
      handler.evaluate(rule as any, context),
      new Promise<ValidationResult[]>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Rule timeout after ${this.config.ruleTimeout}ms`)),
          this.config.ruleTimeout
        )
      ),
    ]);
  }

  /**
   * Calculate validation summary
   */
  private calculateSummary(results: ValidationResult[]): ValidationSummary {
    const summary: ValidationSummary = {
      totalRules: results.length,
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: 0,
      bySeverity: {
        error: 0,
        warning: 0,
        info: 0,
      },
      byPlatform: {},
      score: 0,
      isValid: true,
    };

    for (const result of results) {
      // Count by status
      switch (result.status) {
        case 'passed':
          summary.passed++;
          break;
        case 'failed':
          summary.failed++;
          if (result.severity === 'error') {
            summary.isValid = false;
          }
          break;
        case 'skipped':
          summary.skipped++;
          break;
        case 'error':
          summary.errors++;
          summary.isValid = false;
          break;
      }

      // Count by severity
      summary.bySeverity[result.severity]++;

      // Count by platform
      if (result.platform) {
        if (!summary.byPlatform[result.platform]) {
          summary.byPlatform[result.platform] = {
            passed: 0,
            failed: 0,
            warnings: 0,
          };
        }

        if (result.status === 'passed') {
          summary.byPlatform[result.platform].passed++;
        } else if (result.status === 'failed') {
          summary.byPlatform[result.platform].failed++;
          if (result.severity === 'warning') {
            summary.byPlatform[result.platform].warnings++;
          }
        }
      }
    }

    // Calculate score (0-100)
    // Score = (passed / (passed + failed)) * 100
    // Errors and skipped don't count toward score
    const scorableRules = summary.passed + summary.failed;
    if (scorableRules > 0) {
      summary.score = Math.round((summary.passed / scorableRules) * 100);
    } else {
      summary.score = 100; // No scorable rules = perfect score
    }

    return summary;
  }
}

/**
 * Create a validation engine with default handlers
 */
export function createDefaultValidationEngine(
  environment?: Environment
): ValidationEngine {
  const engine = new ValidationEngine({ environment });

  // Import and register handlers
  // (This will be done by the consumer importing handlers)
  // We can't do it here due to circular dependency concerns

  return engine;
}
