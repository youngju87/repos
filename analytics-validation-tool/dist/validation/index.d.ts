/**
 * Validation Module
 *
 * Declarative validation engine for analytics implementations.
 */
export * from './types';
export { buildValidationContext, evaluateCondition, checkConditions, } from './ValidationContext';
export { RuleLoader, loadRules } from './RuleLoader';
export { ValidationEngine, createDefaultValidationEngine, type ValidationEngineConfig, } from './ValidationEngine';
export * from './handlers';
import { ValidationEngine as ValidationEngineClass } from './ValidationEngine';
/**
 * Register all built-in rule handlers
 */
export declare function registerBuiltInHandlers(engine: ValidationEngineClass): void;
/**
 * Create validation engine with all built-in handlers registered
 */
export declare function createValidationEngine(environment?: any): ValidationEngineClass;
//# sourceMappingURL=index.d.ts.map