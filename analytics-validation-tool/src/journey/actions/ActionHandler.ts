/**
 * Action Handler Base Class
 *
 * Base class for all journey action handlers.
 */

import type { Page } from 'playwright';
import type { JourneyAction, ActionResult } from '../types';

/**
 * Action handler interface
 */
export interface ActionHandler<T extends JourneyAction = JourneyAction> {
  /** Action type this handler supports */
  readonly type: string;

  /** Execute the action */
  execute(action: T, page: Page, context: Record<string, unknown>): Promise<ActionResult>;

  /** Check if this handler can handle the action */
  canHandle(action: JourneyAction): action is T;
}

/**
 * Base action handler with common functionality
 */
export abstract class BaseActionHandler<T extends JourneyAction>
  implements ActionHandler<T>
{
  abstract readonly type: string;

  /**
   * Execute the action
   */
  abstract execute(
    action: T,
    page: Page,
    context: Record<string, unknown>
  ): Promise<ActionResult>;

  /**
   * Check if this handler can handle the action
   */
  canHandle(action: JourneyAction): action is T {
    return action.type === this.type;
  }

  /**
   * Create a success result
   */
  protected createSuccessResult(
    action: T,
    duration: number,
    context?: Record<string, unknown>
  ): ActionResult {
    return {
      action,
      status: 'success',
      duration,
      context,
    };
  }

  /**
   * Create a failure result
   */
  protected createFailureResult(
    action: T,
    duration: number,
    error: Error | string
  ): ActionResult {
    return {
      action,
      status: 'failed',
      duration,
      error: error instanceof Error ? error.message : error,
    };
  }

  /**
   * Create a skipped result
   */
  protected createSkippedResult(action: T, reason: string): ActionResult {
    return {
      action,
      status: 'skipped',
      duration: 0,
      error: reason,
    };
  }

  /**
   * Get timeout for action
   */
  protected getTimeout(action: T, defaultTimeout: number = 30000): number {
    return action.timeout || defaultTimeout;
  }
}
