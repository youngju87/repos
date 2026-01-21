/**
 * Rule Loader
 *
 * Loads validation rules from various sources (files, directories, inline).
 */
import type { AnyRuleDef, RuleLoaderOptions } from './types';
/**
 * Rule loader for reading rules from various sources
 */
export declare class RuleLoader {
    private options;
    private rules;
    private errors;
    constructor(options: RuleLoaderOptions);
    /**
     * Load all rules from configured sources
     */
    load(): Promise<{
        rules: AnyRuleDef[];
        errors: Array<{
            source?: string;
            error: string;
        }>;
    }>;
    /**
     * Load rules from a single source
     */
    private loadFromSource;
    /**
     * Load rules from a single file
     */
    private loadFromFile;
    /**
     * Load rules from a directory
     */
    private loadFromDirectory;
    /**
     * Parse a rule file (YAML or JSON)
     */
    private parseRuleFile;
    /**
     * Validate rule schema
     */
    private validateRuleSchema;
    private validatePresenceRule;
    private validatePayloadRule;
    private validateOrderRule;
    private validateConsentRule;
    private validateDataLayerRule;
}
/**
 * Load rules from sources
 */
export declare function loadRules(options: RuleLoaderOptions): Promise<{
    rules: AnyRuleDef[];
    errors: Array<{
        source?: string;
        error: string;
    }>;
}>;
//# sourceMappingURL=RuleLoader.d.ts.map