/**
 * Submit Action Handler
 *
 * Handles form submission actions in user journeys.
 */

import type { Page } from 'playwright';
import type { SubmitAction, ActionResult } from '../types';
import { BaseActionHandler } from './ActionHandler';

/**
 * Handler for submit actions
 */
export class SubmitActionHandler extends BaseActionHandler<SubmitAction> {
  readonly type = 'submit';

  async execute(
    action: SubmitAction,
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

      // Submit the form
      if (action.method === 'click') {
        // Click submit button
        await page.click(action.selector, {
          timeout: this.getTimeout(action),
        });
      } else {
        // Use Enter key or form.submit()
        const element = await page.$(action.selector);
        if (!element) {
          throw new Error(`Form element not found: ${action.selector}`);
        }

        await element.press('Enter');
      }

      // Wait for navigation if expected
      if (action.waitForNavigation !== false) {
        await page.waitForLoadState(
          action.waitUntil || 'load',
          {
            timeout: this.getTimeout(action, 60000),
          }
        );
      }

      const duration = Date.now() - startTime;

      // Update context with submission details
      const newContext = {
        ...context,
        lastSubmitSelector: action.selector,
        currentUrl: page.url(),
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
