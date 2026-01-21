/**
 * Validation Types
 *
 * Core type definitions for the validation rule engine.
 */
import type { PageScanResult, NetworkRequest, DataLayerEvent } from '../types';
import type { TagDetectionResult, TagInstance } from '../detection/types';
/**
 * Severity levels for validation results
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';
/**
 * Validation result status
 */
export type ValidationStatus = 'passed' | 'failed' | 'skipped' | 'error';
/**
 * Environment types
 */
export type Environment = 'production' | 'staging' | 'development' | 'test' | 'local';
/**
 * Types of validation rules
 */
export type RuleType = 'presence' | 'payload' | 'order' | 'consent' | 'data-layer' | 'schema' | 'duplicate' | 'custom';
/**
 * Condition operator
 */
export type ConditionOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'matches' | 'not_matches' | 'exists' | 'not_exists' | 'greater_than' | 'less_than' | 'in' | 'not_in';
/**
 * Rule condition
 */
export interface RuleCondition {
    /** Field to check (dot notation supported) */
    field: string;
    /** Operator */
    operator: ConditionOperator;
    /** Expected value */
    value?: unknown;
    /** All conditions must match (default: true) */
    all?: boolean;
}
/**
 * Rule assertion
 */
export interface RuleAssertion {
    /** Field to assert on */
    field?: string;
    /** Assertion type */
    type?: 'required' | 'equals' | 'matches' | 'type' | 'range' | 'length';
    /** Expected value */
    value?: unknown;
    /** Pattern for regex matching */
    pattern?: string;
    /** Expected data type */
    dataType?: 'string' | 'number' | 'boolean' | 'object' | 'array';
    /** Min/max for range validation */
    min?: number;
    max?: number;
    /** Allowed values */
    allowedValues?: unknown[];
    /** Custom error message */
    message?: string;
}
/**
 * Base rule definition
 */
export interface RuleDefinition {
    /** Unique rule identifier */
    id: string;
    /** Human-readable name */
    name: string;
    /** Detailed description */
    description: string;
    /** Rule type */
    type: RuleType;
    /** Severity if rule fails */
    severity: ValidationSeverity;
    /** Platform this rule applies to (undefined = all) */
    platform?: string;
    /** Tags this rule applies to */
    tags?: string[];
    /** Environments where this rule applies */
    environments?: Environment[];
    /** Whether rule is enabled */
    enabled?: boolean;
    /** Conditions that must be met for rule to apply */
    conditions?: RuleCondition[];
    /** Assertions to validate */
    assertions: RuleAssertion[];
    /** Custom metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Presence rule definition
 */
export interface PresenceRuleDef extends RuleDefinition {
    type: 'presence';
    /** What to check presence of */
    target: {
        /** Type of target */
        type: 'tag' | 'event' | 'request' | 'script' | 'dataLayer';
        /** Platform filter */
        platform?: string;
        /** Event name (for events) */
        eventName?: string;
        /** URL pattern (for requests/scripts) */
        urlPattern?: string;
        /** Data layer name */
        dataLayerName?: string;
    };
    /** Whether target should exist */
    shouldExist: boolean;
    /** Minimum count */
    minCount?: number;
    /** Maximum count */
    maxCount?: number;
}
/**
 * Payload rule definition
 */
export interface PayloadRuleDef extends RuleDefinition {
    type: 'payload';
    /** Target network requests */
    target: {
        /** URL pattern to match */
        urlPattern: string;
        /** Request method filter */
        method?: 'GET' | 'POST';
        /** Platform filter */
        platform?: string;
    };
    /** Where to find the data */
    source: 'query' | 'body' | 'headers';
    /** Fields to validate */
    fields: Array<{
        /** Field name */
        name: string;
        /** Whether field is required */
        required?: boolean;
        /** Expected value or pattern */
        value?: unknown;
        /** Pattern for regex matching */
        pattern?: string;
        /** Expected data type */
        type?: 'string' | 'number' | 'boolean';
        /** Custom validation message */
        message?: string;
    }>;
}
/**
 * Order rule definition
 */
export interface OrderRuleDef extends RuleDefinition {
    type: 'order';
    /** What must happen first */
    before: {
        type: 'tag' | 'event' | 'script';
        identifier: string;
    };
    /** What must happen after */
    after: {
        type: 'tag' | 'event' | 'script';
        identifier: string;
    };
    /** Maximum allowed time difference (ms) */
    maxTimeDifference?: number;
}
/**
 * Consent rule definition
 */
export interface ConsentRuleDef extends RuleDefinition {
    type: 'consent';
    /** Platform to check */
    platform: string;
    /** Whether consent must be present before tag fires */
    requireConsentBefore: boolean;
    /** Consent signal location */
    consentSignal?: {
        /** Where to find consent */
        source: 'dataLayer' | 'cookie' | 'localStorage';
        /** Signal name */
        name: string;
        /** Expected value indicating consent */
        value?: unknown;
    };
}
/**
 * Data layer rule definition
 */
export interface DataLayerRuleDef extends RuleDefinition {
    type: 'data-layer';
    /** Data layer name */
    dataLayerName: string;
    /** Event filter */
    eventName?: string;
    /** Schema to validate against */
    schema?: Record<string, unknown>;
    /** Required keys */
    requiredKeys?: string[];
    /** Forbidden keys */
    forbiddenKeys?: string[];
    /** Naming convention pattern */
    namingPattern?: string;
}
/**
 * Union of all rule definition types
 */
export type AnyRuleDef = PresenceRuleDef | PayloadRuleDef | OrderRuleDef | ConsentRuleDef | DataLayerRuleDef | RuleDefinition;
/**
 * Context provided to rules during evaluation
 */
export interface ValidationContext {
    /** Original page scan result */
    scan: PageScanResult;
    /** Tag detection result */
    detection: TagDetectionResult;
    /** Environment being validated */
    environment: Environment;
    /** Helper: Find tag by platform */
    findTag: (platform: string) => TagInstance | undefined;
    /** Helper: Find all tags by platform */
    findTags: (platform: string) => TagInstance[];
    /** Helper: Find requests matching pattern */
    findRequests: (pattern: string | RegExp) => NetworkRequest[];
    /** Helper: Get data layer events */
    getDataLayerEvents: (name: string, eventName?: string) => DataLayerEvent[];
    /** Helper: Get cookies */
    getCookie: (name: string) => string | undefined;
    /** Helper: Get local storage value */
    getLocalStorage: (key: string) => string | undefined;
    /** Helper: Check if event exists in data layer */
    hasDataLayerEvent: (dataLayerName: string, eventName: string) => boolean;
    /** Helper: Get timestamp for tag */
    getTagTimestamp: (tag: TagInstance) => number;
    /** Helper: Get timestamp for event */
    getEventTimestamp: (eventName: string) => number | undefined;
}
/**
 * Evidence supporting a validation result
 */
export interface ValidationEvidence {
    /** Type of evidence */
    type: 'request' | 'tag' | 'script' | 'dataLayer' | 'cookie' | 'timing';
    /** Description */
    description: string;
    /** Actual value found */
    actual?: unknown;
    /** Expected value */
    expected?: unknown;
    /** Reference to source */
    ref?: {
        id?: string;
        url?: string;
        timestamp?: number;
    };
}
/**
 * Single validation result
 */
export interface ValidationResult {
    /** Rule that produced this result */
    ruleId: string;
    /** Rule name */
    ruleName: string;
    /** Result status */
    status: ValidationStatus;
    /** Severity level */
    severity: ValidationSeverity;
    /** Human-readable message */
    message: string;
    /** Detailed explanation */
    details?: string;
    /** Platform this result relates to */
    platform?: string;
    /** Tag this result relates to */
    tagId?: string;
    /** Evidence supporting this result */
    evidence: ValidationEvidence[];
    /** Suggested fix */
    suggestion?: string;
    /** When this validation occurred */
    timestamp: number;
    /** How long validation took (ms) */
    duration?: number;
    /** Error if validation threw */
    error?: string;
}
/**
 * Summary statistics for validation
 */
export interface ValidationSummary {
    /** Total rules evaluated */
    totalRules: number;
    /** Rules that passed */
    passed: number;
    /** Rules that failed */
    failed: number;
    /** Rules that were skipped */
    skipped: number;
    /** Rules that had errors */
    errors: number;
    /** Results by severity */
    bySeverity: {
        error: number;
        warning: number;
        info: number;
    };
    /** Results by platform */
    byPlatform: Record<string, {
        passed: number;
        failed: number;
        warnings: number;
    }>;
    /** Overall validation score (0-100) */
    score: number;
    /** Whether validation passed (no errors) */
    isValid: boolean;
}
/**
 * Complete validation report
 */
export interface ValidationReport {
    /** Unique report ID */
    id: string;
    /** Scan ID this validation is for */
    scanId: string;
    /** Detection ID this validation is for */
    detectionId: string;
    /** URL that was validated */
    url: string;
    /** Environment */
    environment: Environment;
    /** When validation started */
    startedAt: number;
    /** When validation completed */
    completedAt: number;
    /** Validation duration (ms) */
    duration: number;
    /** All validation results */
    results: ValidationResult[];
    /** Summary statistics */
    summary: ValidationSummary;
    /** Rules that were loaded */
    rulesLoaded: string[];
    /** Rule loading errors */
    ruleErrors: Array<{
        ruleId?: string;
        error: string;
    }>;
    /** Engine version */
    engineVersion: string;
}
/**
 * Handler for a specific rule type
 */
export interface RuleTypeHandler<T extends AnyRuleDef = AnyRuleDef> {
    /** Rule type this handler supports */
    readonly type: RuleType;
    /** Evaluate a rule */
    evaluate(rule: T, context: ValidationContext): Promise<ValidationResult[]>;
    /** Check if this handler can evaluate a rule */
    canHandle(rule: AnyRuleDef): rule is T;
}
/**
 * Rule source configuration
 */
export interface RuleSource {
    /** Source type */
    type: 'file' | 'directory' | 'inline';
    /** Path for file/directory sources */
    path?: string;
    /** Inline rules */
    rules?: AnyRuleDef[];
    /** File pattern for directory sources */
    pattern?: string;
}
/**
 * Rule loader options
 */
export interface RuleLoaderOptions {
    /** Rule sources */
    sources: RuleSource[];
    /** Environment filter */
    environment?: Environment;
    /** Platform filter */
    platform?: string;
    /** Whether to validate rule schemas */
    validateSchema?: boolean;
}
//# sourceMappingURL=types.d.ts.map