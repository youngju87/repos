/**
 * Validation Module
 *
 * Declarative validation engine for analytics implementations.
 */

// Core types
export * from './types';

// Context and utilities
export {
  buildValidationContext,
  getNestedValue,
  evaluateCondition,
  checkConditions,
} from './ValidationContext';

// Rule loader
export { RuleLoader, loadRules } from './RuleLoader';

// Validation engine
export {
  ValidationEngine,
  createDefaultValidationEngine,
  type ValidationEngineConfig,
} from './ValidationEngine';

// Rule type handlers
export * from './handlers';

// Built-in handlers registry
import {
  PresenceHandler,
  PayloadHandler,
  OrderHandler,
  ConsentHandler,
  DataLayerHandler,
} from './handlers';
import type { ValidationEngine } from './ValidationEngine';

/**
 * Register all built-in rule handlers
 */
export function registerBuiltInHandlers(engine: ValidationEngine): void {
  engine.registerHandler(new PresenceHandler());
  engine.registerHandler(new PayloadHandler());
  engine.registerHandler(new OrderHandler());
  engine.registerHandler(new ConsentHandler());
  engine.registerHandler(new DataLayerHandler());
}

/**
 * Create validation engine with all built-in handlers registered
 */
export function createValidationEngine(environment?: any): ValidationEngine {
  const engine = createDefaultValidationEngine(environment);
  registerBuiltInHandlers(engine);
  return engine;
}
