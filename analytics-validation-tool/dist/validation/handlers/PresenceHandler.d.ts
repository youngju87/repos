/**
 * Presence Rule Handler
 *
 * Validates presence/absence of tags, events, requests, scripts, or data layers.
 */
import type { PresenceRuleDef, ValidationContext, ValidationResult, RuleTypeHandler, AnyRuleDef } from '../types';
export declare class PresenceHandler implements RuleTypeHandler<PresenceRuleDef> {
    readonly type: "presence";
    canHandle(rule: AnyRuleDef): rule is PresenceRuleDef;
    evaluate(rule: PresenceRuleDef, context: ValidationContext): Promise<ValidationResult[]>;
}
//# sourceMappingURL=PresenceHandler.d.ts.map