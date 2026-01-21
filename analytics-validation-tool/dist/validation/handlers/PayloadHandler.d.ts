/**
 * Payload Rule Handler
 *
 * Validates network request payloads (query params, body, headers).
 */
import type { PayloadRuleDef, ValidationContext, ValidationResult, RuleTypeHandler, AnyRuleDef } from '../types';
export declare class PayloadHandler implements RuleTypeHandler<PayloadRuleDef> {
    readonly type: "payload";
    canHandle(rule: AnyRuleDef): rule is PayloadRuleDef;
    evaluate(rule: PayloadRuleDef, context: ValidationContext): Promise<ValidationResult[]>;
}
//# sourceMappingURL=PayloadHandler.d.ts.map