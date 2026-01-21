"use strict";
/**
 * Journey Engine
 *
 * Main orchestrator for executing user journeys and collecting analytics data.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyEngine = void 0;
exports.createJourneyEngine = createJourneyEngine;
const playwright_1 = require("playwright");
const PageScanner_1 = require("../core/scanner/PageScanner");
const DetectionEngine_1 = require("../detection/DetectionEngine");
const validation_1 = require("../validation");
/**
 * Journey execution engine
 */
class JourneyEngine {
    config;
    actionRegistry;
    browser;
    context;
    page;
    constructor(config, actionRegistry) {
        this.config = config;
        this.actionRegistry = actionRegistry;
    }
    /**
     * Execute a journey
     */
    async execute(journey, validationRules) {
        const startTime = Date.now();
        try {
            // Initialize browser
            await this.initializeBrowser();
            if (!this.page) {
                throw new Error('Page not initialized');
            }
            // Navigate to start URL
            await this.page.goto(journey.startUrl, {
                timeout: journey.config?.defaultTimeout || 60000,
                waitUntil: 'load',
            });
            // Execute steps
            const stepResults = [];
            let stepsCompleted = 0;
            let totalActions = 0;
            for (let i = 0; i < journey.steps.length; i++) {
                const step = journey.steps[i];
                totalActions += step.actions.length;
                try {
                    const stepResult = await this.executeStep(step, i, journey, validationRules);
                    stepResults.push(stepResult);
                    if (stepResult.status === 'success') {
                        stepsCompleted++;
                    }
                    else if (stepResult.status === 'failed' &&
                        !journey.config?.continueOnFailure) {
                        // Stop execution on failure unless continueOnFailure is true
                        break;
                    }
                }
                catch (error) {
                    // Step execution failed
                    stepResults.push({
                        stepId: step.id,
                        name: step.name,
                        stepIndex: i,
                        status: 'failed',
                        actions: [],
                        actionResults: [],
                        startedAt: startTime,
                        completedAt: Date.now(),
                        currentUrl: this.page?.url() || '',
                        error: error instanceof Error ? error.message : String(error),
                        duration: Date.now() - startTime,
                    });
                    if (!journey.config?.continueOnFailure) {
                        break;
                    }
                }
            }
            // Calculate overall status
            const hasFailures = stepResults.some((s) => s.status === 'failed');
            const allSuccess = stepResults.every((s) => s.status === 'success');
            const status = allSuccess ? 'success' : hasFailures ? 'failed' : 'partial';
            // Calculate overall score if validation was performed
            let overallScore;
            if (validationRules && validationRules.length > 0) {
                const scores = stepResults
                    .filter((s) => s.validation?.summary.score !== undefined)
                    .map((s) => s.validation.summary.score);
                if (scores.length > 0) {
                    overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
                }
            }
            const duration = Date.now() - startTime;
            const actionsCompleted = stepResults.reduce((sum, s) => sum + (s.actions?.filter((a) => a.status === 'success').length || 0), 0);
            const actionsFailed = stepResults.reduce((sum, s) => sum + (s.actions?.filter((a) => a.status === 'failed').length || 0), 0);
            return {
                id: journey.id,
                name: journey.name,
                status,
                startedAt: startTime,
                completedAt: Date.now(),
                steps: stepResults,
                summary: {
                    totalSteps: journey.steps.length,
                    stepsCompleted,
                    stepsFailed: stepResults.filter((s) => s.status === 'failed').length,
                    stepsSkipped: stepResults.filter((s) => s.status === 'skipped').length,
                    totalActions,
                    actionsSucceeded: actionsCompleted,
                    actionsFailed,
                    actionsCompleted,
                    overallScore,
                },
                duration,
            };
        }
        finally {
            // Cleanup
            await this.cleanup();
        }
    }
    /**
     * Execute a single journey step
     */
    async executeStep(step, stepIndex, journey, validationRules) {
        const startTime = Date.now();
        if (!this.page) {
            throw new Error('Page not initialized');
        }
        // Execute actions
        const actionResults = [];
        const executionContext = {
            stepIndex,
            stepId: step.id,
        };
        for (const action of step.actions) {
            const actionResult = await this.executeAction(action, this.page, executionContext);
            actionResults.push(actionResult);
            // Update context with action results
            if (actionResult.context) {
                Object.assign(executionContext, actionResult.context);
            }
            // Stop on action failure if not continuing on failure
            if (actionResult.status === 'failed' &&
                !journey.config?.continueOnFailure) {
                break;
            }
        }
        // Capture analytics after step completes
        let scan;
        let detection;
        let validation;
        if (step.captureAnalytics !== false) {
            try {
                const scanner = new PageScanner_1.PageScanner();
                scan = await scanner.scan(this.page.url(), {
                    timeout: 30000,
                });
                // Detect tags if scan succeeded
                if (scan) {
                    detection = await (0, DetectionEngine_1.detectTags)(scan);
                }
                // Run validation if rules provided
                if (scan && detection && validationRules && validationRules.length > 0) {
                    const validationEngine = (0, validation_1.createValidationEngine)(this.config.environment || 'production');
                    // Filter rules by step-specific rules if provided
                    const stepRules = step.validationRules
                        ? validationRules.filter((r) => step.validationRules.includes(r.id))
                        : validationRules;
                    validation = await validationEngine.validate(scan, detection, stepRules);
                }
            }
            catch (error) {
                console.warn('Failed to capture analytics for step:', error);
            }
        }
        // Determine step status
        const hasFailedActions = actionResults.some((a) => a.status === 'failed');
        const allActionsSuccess = actionResults.every((a) => a.status === 'success');
        const status = allActionsSuccess ? 'success' : hasFailedActions ? 'failed' : 'partial';
        const duration = Date.now() - startTime;
        return {
            stepId: step.id,
            name: step.name,
            stepIndex,
            status,
            startedAt: startTime,
            completedAt: Date.now(),
            actions: actionResults,
            actionResults,
            currentUrl: this.page?.url() || '',
            validation,
            duration,
        };
    }
    /**
     * Execute a single action
     */
    async executeAction(action, page, context) {
        const handler = this.actionRegistry.findHandler(action);
        if (!handler) {
            return {
                action,
                status: 'failed',
                duration: 0,
                error: `No handler found for action type: ${action.type}`,
            };
        }
        try {
            return await handler.execute(action, page, context);
        }
        catch (error) {
            return {
                action,
                status: 'failed',
                duration: 0,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    /**
     * Initialize browser and page
     */
    async initializeBrowser() {
        this.browser = await playwright_1.chromium.launch({
            headless: this.config.headless !== false,
            timeout: 30000,
        });
        this.context = await this.browser.newContext({
            viewport: this.config.viewport || { width: 1280, height: 720 },
            userAgent: this.config.userAgent,
        });
        this.page = await this.context.newPage();
    }
    /**
     * Cleanup resources
     */
    async cleanup() {
        if (this.page) {
            await this.page.close().catch(() => { });
            this.page = undefined;
        }
        if (this.context) {
            await this.context.close().catch(() => { });
            this.context = undefined;
        }
        if (this.browser) {
            await this.browser.close().catch(() => { });
            this.browser = undefined;
        }
    }
}
exports.JourneyEngine = JourneyEngine;
/**
 * Create journey engine with configuration
 */
function createJourneyEngine(config, actionRegistry) {
    return new JourneyEngine(config, actionRegistry);
}
//# sourceMappingURL=JourneyEngine.js.map