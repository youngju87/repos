/**
 * Type Action Handler
 *
 * Handles typing/input actions in user journeys.
 */

import type { Page } from 'playwright';
import type { TypeAction, ActionResult } from '../types';
import { BaseActionHandler } from './ActionHandler';

/**
 * Handler for type actions
 */
export class TypeActionHandler extends BaseActionHandler<TypeAction> {
  readonly type = 'type';

  async execute(
    action: TypeAction,
    page: Page,
    context: Record<string, unknown>
  ): Promise<ActionResult> {
    const startTime = Date.now();

    try {
      // Wait for selector if requested
      if (action.waitForSelector !== false) {
        await page.waitForSelector(action.selector, {
          timeout: this.getTimeout(action, 30000),
          state: 'visible',
        });
      }

      // Clear existing value if requested
      if (action.clear) {
        await page.fill(action.selector, '');
      }

      // Type the value
      if (action.options?.delay) {
        await page.type(action.selector, action.value, {
          delay: action.options.delay,
          timeout: this.getTimeout(action),
        });
      } else {
        await page.fill(action.selector, action.value);
      }

      const duration = Date.now() - startTime;

      // Update context with last typed field
      const newContext = {
        ...context,
        lastTypeSelector: action.selector,
        lastTypeValue: action.value,
      };

      return this.createSuccessResult(action, duration, newContext);
    } catch (error) {
      const duration = Date.now() - startTime;
      return this.createFailureResult(
        action,
        duration,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
}
