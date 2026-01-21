/**
 * Order Rule Handler
 *
 * Validates load order and timing between tags, events, and scripts.
 */
import type { OrderRuleDef, ValidationContext, ValidationResult, RuleTypeHandler, AnyRuleDef } from '../types';
export declare class OrderHandler implements RuleTypeHandler<OrderRuleDef> {
    readonly type: "order";
    canHandle(rule: AnyRuleDef): rule is OrderRuleDef;
    evaluate(rule: OrderRuleDef, context: ValidationContext): Promise<ValidationResult[]>;
    /**
     * Get timestamp for a specific item
     */
    private getTimestamp;
}
//# sourceMappingURL=OrderHandler.d.ts.map