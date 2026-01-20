/**
 * Screenshot Action Handler
 *
 * Handles screenshot capture actions in user journeys.
 */

import type { Page } from 'playwright';
import type { ScreenshotAction, ActionResult } from '../types';
import { BaseActionHandler } from './ActionHandler';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Handler for screenshot actions
 */
export class ScreenshotActionHandler extends BaseActionHandler<ScreenshotAction> {
  readonly type = 'screenshot';

  async execute(
    action: ScreenshotAction,
    page: Page,
    context: Record<string, unknown>
  ): Promise<ActionResult> {
    const startTime = Date.now();

    try {
      // Determine output path
      const outputPath = action.path || this.generatePath(action, context);

      // Ensure directory exists
      const dir = path.dirname(outputPath);
      await fs.mkdir(dir, { recursive: true });

      // Take screenshot
      if (action.selector) {
        // Element screenshot
        const element = await page.$(action.selector);
        if (!element) {
          throw new Error(`Element not found: ${action.selector}`);
        }

        await element.screenshot({
          path: outputPath,
          type: action.format || 'png',
          timeout: this.getTimeout(action),
        });
      } else {
        // Full page screenshot
        await page.screenshot({
          path: outputPath,
          type: action.format || 'png',
          fullPage: action.fullPage !== false,
          timeout: this.getTimeout(action),
        });
      }

      const duration = Date.now() - startTime;

      // Update context with screenshot path
      const newContext = {
        ...context,
        lastScreenshotPath: outputPath,
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

  /**
   * Generate screenshot path if not provided
   */
  private generatePath(
    action: ScreenshotAction,
    context: Record<string, unknown>
  ): string {
    const timestamp = Date.now();
    const stepNumber = (context.stepIndex as number) || 0;
    const format = action.format || 'png';

    return path.join(
      process.cwd(),
      'screenshots',
      `step-${stepNumber}-${timestamp}.${format}`
    );
  }
}
