/**
 * Data Layer Rule Handler
 *
 * Validates data layer structure, schema, naming conventions, and content.
 */
import type { DataLayerRuleDef, ValidationContext, ValidationResult, RuleTypeHandler, AnyRuleDef } from '../types';
export declare class DataLayerHandler implements RuleTypeHandler<DataLayerRuleDef> {
    readonly type: "data-layer";
    canHandle(rule: AnyRuleDef): rule is DataLayerRuleDef;
    evaluate(rule: DataLayerRuleDef, context: ValidationContext): Promise<ValidationResult[]>;
    /**
     * Validate data against schema
     */
    private validateSchema;
    /**
     * Validate a single assertion
     */
    private validateAssertion;
}
//# sourceMappingURL=DataLayerHandler.d.ts.map