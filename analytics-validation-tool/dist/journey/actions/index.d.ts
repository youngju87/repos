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
/**
 * Action handler registry
 */
export declare class ActionHandlerRegistry {
    private handlers;
    /**
     * Register an action handler
     */
    register(handler: ActionHandler): void;
    /**
     * Get handler for action type
     */
    getHandler(actionType: string): ActionHandler | undefined;
    /**
     * Find handler that can handle the action
     */
    findHandler(action: JourneyAction): ActionHandler | undefined;
    /**
     * Get all registered handlers
     */
    getAllHandlers(): ActionHandler[];
}
/**
 * Register all built-in action handlers
 */
export declare function registerBuiltInActionHandlers(registry: ActionHandlerRegistry): void;
/**
 * Get default registry with built-in handlers
 */
export declare function getDefaultActionRegistry(): ActionHandlerRegistry;
//# sourceMappingURL=index.d.ts.map