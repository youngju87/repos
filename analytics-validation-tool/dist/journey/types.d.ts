/**
 * Journey Types
 *
 * Type definitions for multi-step user flow simulation and validation.
 */
import type { PageReport } from '../reporting/types';
/**
 * Journey action types
 */
export type JourneyActionType = 'navigate' | 'click' | 'type' | 'submit' | 'wait' | 'assert' | 'screenshot';
/**
 * Wait condition types
 */
export type WaitConditionType = 'selector' | 'dataLayer' | 'network' | 'timeout';
/**
 * Base action interface
 */
export interface JourneyActionBase {
    /** Action type */
    type: JourneyActionType;
    /** Optional action name/description */
    name?: string;
    /** Whether to continue on failure */
    continueOnFailure?: boolean;
    /** Action timeout (ms) */
    timeout?: number;
}
/**
 * Navigate action - Navigate to URL
 */
export interface NavigateAction extends JourneyActionBase {
    type: 'navigate';
    /** URL to navigate to */
    url: string;
    /** Wait until condition */
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
}
/**
 * Click action - Click element
 */
export interface ClickAction extends JourneyActionBase {
    type: 'click';
    /** CSS selector */
    selector: string;
    /** Wait for selector before clicking */
    waitForSelector?: boolean;
    /** Click options */
    options?: {
        button?: 'left' | 'right' | 'middle';
        clickCount?: number;
        delay?: number;
    };
}
/**
 * Type action - Type into input field
 */
export interface TypeAction extends JourneyActionBase {
    type: 'type';
    /** CSS selector */
    selector: string;
    /** Text to type */
    value: string;
    /** Clear existing value first */
    clear?: boolean;
    /** Typing delay (ms per character) */
    delay?: number;
    /** Wait for selector before typing */
    waitForSelector?: boolean;
    /** Typing options */
    options?: {
        delay?: number;
    };
}
/**
 * Submit action - Submit form
 */
export interface SubmitAction extends JourneyActionBase {
    type: 'submit';
    /** Form selector */
    selector: string;
    /** Wait for navigation after submit */
    waitForNavigation?: boolean;
    /** Wait for selector before submit */
    waitForSelector?: boolean;
    /** Submit method */
    method?: 'submit' | 'click';
    /** Wait until navigation completes */
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
}
/**
 * Wait action - Wait for condition
 */
export interface WaitAction extends JourneyActionBase {
    type: 'wait';
    /** What to wait for */
    for: WaitConditionType;
    /** Selector (if waiting for element) */
    selector?: string;
    /** Data layer name (if waiting for DL event) */
    dataLayerName?: string;
    /** Event name (if waiting for DL event) */
    eventName?: string;
    /** Network URL pattern (if waiting for request) */
    urlPattern?: string;
    /** Timeout duration (if waiting for time) */
    duration?: number;
}
/**
 * Assert type
 */
export type AssertType = 'url' | 'text' | 'exists' | 'visible' | 'count' | 'dataLayer' | 'cookie';
/**
 * Assert operator
 */
export type AssertOperator = 'equals' | 'contains' | 'matches' | 'gt' | 'lt' | 'gte' | 'lte' | 'greaterThan' | 'lessThan';
/**
 * Assert action - Run validation assertion
 */
export interface AssertAction extends JourneyActionBase {
    type: 'assert';
    /** Assert type */
    assertType: AssertType;
    /** CSS selector (for element assertions) */
    selector?: string;
    /** Expected value */
    expected?: string | number | boolean;
    /** Comparison operator */
    operator?: AssertOperator;
    /** Custom message on failure */
    message?: string;
    /** Rule ID to validate (legacy) */
    ruleId?: string;
    /** Expected result (default: passed) */
    expectedStatus?: 'passed' | 'failed';
}
/**
 * Screenshot action - Capture screenshot
 */
export interface ScreenshotAction extends JourneyActionBase {
    type: 'screenshot';
    /** Screenshot path */
    path: string;
    /** Screenshot options */
    fullPage?: boolean;
    /** CSS selector for element screenshot */
    selector?: string;
    /** Image format */
    format?: 'png' | 'jpeg';
}
/**
 * Union of all action types
 */
export type JourneyAction = NavigateAction | ClickAction | TypeAction | SubmitAction | WaitAction | AssertAction | ScreenshotAction;
/**
 * Journey step definition
 */
export interface JourneyStep {
    /** Step ID */
    id?: string;
    /** Step name */
    name: string;
    /** Step description */
    description?: string;
    /** Actions to execute in this step */
    actions: JourneyAction[];
    /** Whether to capture analytics in this step */
    captureAnalytics?: boolean;
    /** Whether to run validation in this step */
    runValidation?: boolean;
    /** Rule IDs to validate (if runValidation=true) */
    validationRules?: string[];
}
/**
 * Journey definition
 */
export interface JourneyDefinition {
    /** Journey ID */
    id: string;
    /** Journey name */
    name: string;
    /** Journey description */
    description?: string;
    /** Starting URL */
    startUrl: string;
    /** Journey steps */
    steps: JourneyStep[];
    /** Global configuration */
    config?: {
        /** Default timeout per action (ms) */
        defaultTimeout?: number;
        /** Whether to capture screenshots */
        captureScreenshots?: boolean;
        /** Screenshot directory */
        screenshotDir?: string;
        /** Whether to continue on step failure */
        continueOnFailure?: boolean;
        /** Validation rules to run on each step */
        globalValidationRules?: string[];
    };
    /** Metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Action execution result
 */
export interface ActionResult {
    /** Action that was executed */
    action: JourneyAction;
    /** Execution status */
    status: 'success' | 'failed' | 'skipped';
    /** Execution time (ms) */
    duration: number;
    /** Error message (if failed) */
    error?: string;
    /** Screenshot path (if captured) */
    screenshot?: string;
    /** Additional context */
    context?: Record<string, unknown>;
}
/**
 * Step execution result
 */
export interface StepResult {
    /** Step ID */
    stepId?: string;
    /** Step name */
    name: string;
    /** Step description */
    description?: string;
    /** Step index */
    stepIndex: number;
    /** Step status */
    status: 'success' | 'failed' | 'skipped' | 'partial';
    /** Started at timestamp */
    startedAt: number;
    /** Completed at timestamp */
    completedAt: number;
    /** Duration (ms) */
    duration: number;
    /** Action results */
    actionResults: ActionResult[];
    /** Individual actions list */
    actions?: ActionResult[];
    /** Page report (if analytics captured) */
    pageReport?: PageReport;
    /** Validation report (if validation run) */
    validation?: any;
    /** Current URL after step */
    currentUrl: string;
    /** Error (if failed) */
    error?: string;
}
/**
 * Complete journey execution result
 */
export interface JourneyResult {
    /** Journey ID */
    id: string;
    /** Journey name */
    name: string;
    /** Journey description */
    description?: string;
    /** Execution status */
    status: 'success' | 'failed' | 'partial';
    /** Started at timestamp */
    startedAt: number;
    /** Completed at timestamp */
    completedAt: number;
    /** Total duration (ms) */
    duration: number;
    /** Step results */
    steps: StepResult[];
    /** Summary */
    summary: {
        /** Total steps */
        totalSteps: number;
        /** Steps completed */
        stepsCompleted: number;
        /** Steps failed */
        stepsFailed: number;
        /** Steps skipped */
        stepsSkipped: number;
        /** Total actions executed */
        totalActions: number;
        /** Actions succeeded */
        actionsSucceeded: number;
        /** Actions failed */
        actionsFailed: number;
        /** Actions completed (alias for actionsSucceeded) */
        actionsCompleted?: number;
        /** Overall validation score (if validation run) */
        overallScore?: number;
        /** Total issues found */
        totalIssues?: number;
    };
    /** Error (if journey failed) */
    error?: string;
}
/**
 * Journey source configuration
 */
export interface JourneySource {
    /** Source type */
    type: 'file' | 'directory' | 'inline';
    /** Path for file/directory sources */
    path?: string;
    /** Inline journey */
    journey?: JourneyDefinition;
    /** File pattern for directory sources */
    pattern?: string;
}
/**
 * Journey loader options
 */
export interface JourneyLoaderOptions {
    /** Journey sources */
    sources: JourneySource[];
    /** Whether to validate journey schemas */
    validateSchema?: boolean;
}
/**
 * Journey engine configuration
 */
export interface JourneyEngineConfig {
    /** Default timeout per action (ms) */
    defaultTimeout?: number;
    /** Whether to capture screenshots */
    captureScreenshots?: boolean;
    /** Screenshot directory */
    screenshotDir?: string;
    /** Whether to continue on action failure */
    continueOnFailure?: boolean;
    /** Whether to capture analytics on each step */
    captureAnalytics?: boolean;
    /** Whether to run validation on each step */
    runValidation?: boolean;
    /** Validation rule sources */
    validationRuleSources?: any[];
    /** Environment */
    environment?: string;
    /** Debug logging */
    debug?: boolean;
    /** Run browser in headless mode */
    headless?: boolean;
    /** Browser viewport configuration */
    viewport?: {
        width: number;
        height: number;
    };
    /** Custom user agent */
    userAgent?: string;
}
/**
 * Journey execution options
 */
export interface JourneyExecutionOptions {
    /** Override default timeout */
    timeout?: number;
    /** Override screenshot capture */
    captureScreenshots?: boolean;
    /** Override analytics capture */
    captureAnalytics?: boolean;
    /** Override validation */
    runValidation?: boolean;
    /** Additional context to pass to actions */
    context?: Record<string, unknown>;
}
/**
 * Journey loader config (alias for JourneyLoaderOptions)
 */
export type JourneyLoaderConfig = JourneyLoaderOptions;
import type { Page } from 'playwright';
/**
 * Action handler interface
 */
export interface ActionHandler<T extends JourneyAction = JourneyAction> {
    /** Action type this handler handles */
    readonly type: JourneyActionType;
    /** Check if this handler can handle the action */
    canHandle(action: JourneyAction): boolean;
    /** Execute the action */
    execute(action: T, page: Page, context: Record<string, unknown>): Promise<ActionResult>;
    /** Validate action definition */
    validate?(action: T): string[];
}
//# sourceMappingURL=types.d.ts.map