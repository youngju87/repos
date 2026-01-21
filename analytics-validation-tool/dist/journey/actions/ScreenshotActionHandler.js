"use strict";
/**
 * Screenshot Action Handler
 *
 * Handles screenshot capture actions in user journeys.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenshotActionHandler = void 0;
const ActionHandler_1 = require("./ActionHandler");
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
/**
 * Handler for screenshot actions
 */
class ScreenshotActionHandler extends ActionHandler_1.BaseActionHandler {
    type = 'screenshot';
    async execute(action, page, context) {
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
            }
            else {
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
        }
        catch (error) {
            const duration = Date.now() - startTime;
            return this.createFailureResult(action, duration, error instanceof Error ? error : new Error(String(error)));
        }
    }
    /**
     * Generate screenshot path if not provided
     */
    generatePath(action, context) {
        const timestamp = Date.now();
        const stepNumber = context.stepIndex || 0;
        const format = action.format || 'png';
        return path.join(process.cwd(), 'screenshots', `step-${stepNumber}-${timestamp}.${format}`);
    }
}
exports.ScreenshotActionHandler = ScreenshotActionHandler;
//# sourceMappingURL=ScreenshotActionHandler.js.map