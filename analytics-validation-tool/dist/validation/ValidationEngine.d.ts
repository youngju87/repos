/**
 * Validation Engine
 *
 * Orchestrates validation rule execution and produces validation reports.
 */
import type { AnyRuleDef, ValidationReport, RuleTypeHandler, Environment } from './types';
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
export declare class ValidationEngine {
    private config;
    constructor(config?: Partial<ValidationEngineConfig>);
    /**
     * Register a rule type handler
     */
    registerHandler(handler: RuleTypeHandler): void;
    /**
     * Validate scan and detection results against rules
     */
    validate(scan: PageScanResult, detection: TagDetectionResult, rules: AnyRuleDef[]): Promise<ValidationReport>;
    /**
     * Execute a rule with timeout protection
     */
    private executeRuleWithTimeout;
    /**
     * Calculate validation summary
     */
    private calculateSummary;
}
/**
 * Create a validation engine with default handlers
 */
export declare function createDefaultValidationEngine(environment?: Environment): ValidationEngine;
//# sourceMappingURL=ValidationEngine.d.ts.map