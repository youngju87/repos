/**
 * Journey Action Handlers
 *
 * Exports all action handlers and registration utilities.
 */

export * from './ActionHandler';
export * from './NavigateActionHandler';
export * from './ClickActionHandler';
export * from './TypeActionHandler';
export * from './SubmitActionHandler';
export * from './WaitActionHandler';
export * from './AssertActionHandler';
export * from './ScreenshotActionHandler';

import type { ActionHandler, JourneyAction } from '../types';
import { NavigateActionHandler } from './NavigateActionHandler';
import { ClickActionHandler } from './ClickActionHandler';
import { TypeActionHandler } from './TypeActionHandler';
import { SubmitActionHandler } from './SubmitActionHandler';
import { WaitActionHandler } from './WaitActionHandler';
import { AssertActionHandler } from './AssertActionHandler';
import { ScreenshotActionHandler } from './ScreenshotActionHandler';

/**
 * Action handler registry
 */
export class ActionHandlerRegistry {
  private handlers = new Map<string, ActionHandler>();

  /**
   * Register an action handler
   */
  register(handler: ActionHandler): void {
    this.handlers.set(handler.type, handler);
  }

  /**
   * Get handler for action type
   */
  getHandler(actionType: string): ActionHandler | undefined {
    return this.handlers.get(actionType);
  }

  /**
   * Find handler that can handle the action
   */
  findHandler(action: JourneyAction): ActionHandler | undefined {
    for (const handler of this.handlers.values()) {
      if (handler.canHandle(action)) {
        return handler;
      }
    }
    return undefined;
  }

  /**
   * Get all registered handlers
   */
  getAllHandlers(): ActionHandler[] {
    return Array.from(this.handlers.values());
  }
}

/**
 * Register all built-in action handlers
 */
export function registerBuiltInHandlers(registry: ActionHandlerRegistry): void {
  registry.register(new NavigateActionHandler());
  registry.register(new ClickActionHandler());
  registry.register(new TypeActionHandler());
  registry.register(new SubmitActionHandler());
  registry.register(new WaitActionHandler());
  registry.register(new AssertActionHandler());
  registry.register(new ScreenshotActionHandler());
}

/**
 * Get default registry with built-in handlers
 */
export function getDefaultActionRegistry(): ActionHandlerRegistry {
  const registry = new ActionHandlerRegistry();
  registerBuiltInHandlers(registry);
  return registry;
}
