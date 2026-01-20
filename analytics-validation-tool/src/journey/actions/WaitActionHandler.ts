/**
 * Wait Action Handler
 *
 * Handles wait/synchronization actions in user journeys.
 */

import type { Page } from 'playwright';
import type { WaitAction, ActionResult } from '../types';
import { BaseActionHandler } from './ActionHandler';

/**
 * Handler for wait actions
 */
export class WaitActionHandler extends BaseActionHandler<WaitAction> {
  readonly type = 'wait';

  async execute(
    action: WaitAction,
    page: Page,
    context: Record<string, unknown>
  ): Promise<ActionResult> {
    const startTime = Date.now();

    try {
      switch (action.for) {
        case 'selector':
          if (!action.selector) {
            throw new Error('selector is required for wait.for=selector');
          }
          await page.waitForSelector(action.selector, {
            timeout: this.getTimeout(action),
            state: 'visible',
          });
          break;

        case 'dataLayer':
          await this.waitForDataLayer(page, action);
          break;

        case 'network':
          await this.waitForNetwork(page, action);
          break;

        case 'timeout':
          await page.waitForTimeout(action.duration || 1000);
          break;

        default:
          throw new Error(`Unknown wait type: ${action.for}`);
      }

      const duration = Date.now() - startTime;

      return this.createSuccessResult(action, duration, context);
    } catch (error) {
      const duration = Date.now() - startTime;
      return this.createFailureResult(
        action,
        duration,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Wait for data layer event
   */
  private async waitForDataLayer(
    page: Page,
    action: WaitAction
  ): Promise<void> {
    const dataLayerName = action.dataLayerName || 'dataLayer';
    const eventName = action.eventName;

    if (!eventName) {
      throw new Error('eventName is required for wait.for=dataLayer');
    }

    await page.waitForFunction(
      ({ dlName, evtName }) => {
        const dl = (window as any)[dlName];
        if (!Array.isArray(dl)) return false;

        return dl.some((item: any) => {
          return item.event === evtName || item['gtm.uniqueEventId'];
        });
      },
      { dlName: dataLayerName, evtName: eventName },
      {
        timeout: this.getTimeout(action),
      }
    );
  }

  /**
   * Wait for network request
   */
  private async waitForNetwork(
    page: Page,
    action: WaitAction
  ): Promise<void> {
    if (!action.urlPattern) {
      throw new Error('urlPattern is required for wait.for=network');
    }

    const urlPattern = new RegExp(action.urlPattern);

    await page.waitForResponse(
      (response) => urlPattern.test(response.url()),
      {
        timeout: this.getTimeout(action),
      }
    );
  }
}
