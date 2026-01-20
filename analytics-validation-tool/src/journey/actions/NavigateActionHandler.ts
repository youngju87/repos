/**
 * Navigate Action Handler
 *
 * Handles navigation actions in user journeys.
 */

import type { Page } from 'playwright';
import type { NavigateAction, ActionResult } from '../types';
import { BaseActionHandler } from './ActionHandler';

/**
 * Handler for navigate actions
 */
export class NavigateActionHandler extends BaseActionHandler<NavigateAction> {
  readonly type = 'navigate';

  async execute(
    action: NavigateAction,
    page: Page,
    context: Record<string, unknown>
  ): Promise<ActionResult> {
    const startTime = Date.now();

    try {
      // Navigate to URL
      await page.goto(action.url, {
        timeout: this.getTimeout(action, 60000),
        waitUntil: action.waitUntil || 'load',
      });

      const duration = Date.now() - startTime;

      // Capture current URL in context
      const currentUrl = page.url();
      const newContext = {
        ...context,
        currentUrl,
        lastNavigateUrl: action.url,
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
