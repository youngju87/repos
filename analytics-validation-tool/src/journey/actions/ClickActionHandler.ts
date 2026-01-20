/**
 * Click Action Handler
 *
 * Handles click actions in user journeys.
 */

import type { Page } from 'playwright';
import type { ClickAction, ActionResult } from '../types';
import { BaseActionHandler } from './ActionHandler';

/**
 * Handler for click actions
 */
export class ClickActionHandler extends BaseActionHandler<ClickAction> {
  readonly type = 'click';

  async execute(
    action: ClickAction,
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

      // Click the element
      await page.click(action.selector, {
        timeout: this.getTimeout(action),
        button: action.options?.button,
        clickCount: action.options?.clickCount,
      });

      const duration = Date.now() - startTime;

      // Update context with last clicked element
      const newContext = {
        ...context,
        lastClickSelector: action.selector,
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
