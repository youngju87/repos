/**
 * Consent Rule Handler
 *
 * Validates consent compliance - ensures tags only fire after consent is granted.
 */
import type { ConsentRuleDef, ValidationContext, ValidationResult, RuleTypeHandler, AnyRuleDef } from '../types';
export declare class ConsentHandler implements RuleTypeHandler<ConsentRuleDef> {
    readonly type: "consent";
    canHandle(rule: AnyRuleDef): rule is ConsentRuleDef;
    evaluate(rule: ConsentRuleDef, context: ValidationContext): Promise<ValidationResult[]>;
    /**
     * Check if consent signal exists anywhere
     */
    private findConsent;
    /**
     * Get timestamp of consent signal
     */
    private getConsentTimestamp;
}
//# sourceMappingURL=ConsentHandler.d.ts.map