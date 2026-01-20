/**
 * Journey Types
 *
 * Type definitions for multi-step user flow simulation and validation.
 */

import type { PageScanResult } from '../types';
import type { TagDetectionResult } from '../detection/types';
import type { ValidationReport } from '../validation/types';
import type { PageReport } from '../reporting/types';

// =============================================================================
// ACTION TYPES
// =============================================================================

/**
 * Journey action types
 */
export type JourneyActionType =
  | 'navigate'
  | 'click'
  | 'type'
  | 'submit'
  | 'wait'
  | 'assert'
  | 'screenshot';

/**
 * Wait condition types
 */
export type WaitConditionType =
  | 'selector'        // Wait for element to appear
  | 'dataLayer'       // Wait for data layer event
  | 'network'         // Wait for network request
  | 'timeout';        // Wait for time period

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
 * Assert action - Run validation rule
 */
export interface AssertAction extends JourneyActionBase {
  type: 'assert';

  /** Rule ID to validate */
  ruleId: string;

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
}

/**
 * Union of all action types
 */
export type JourneyAction =
  | NavigateAction
  | ClickAction
  | TypeAction
  | SubmitAction
  | WaitAction
  | AssertAction
  | ScreenshotAction;

// =============================================================================
// JOURNEY DEFINITION
// =============================================================================

/**
 * Journey step definition
 */
export interface JourneyStep {
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

// =============================================================================
// JOURNEY EXECUTION RESULT
// =============================================================================

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
  /** Step name */
  name: string;

  /** Step description */
  description?: string;

  /** Step index */
  stepIndex: number;

  /** Step status */
  status: 'success' | 'failed' | 'skipped';

  /** Started at timestamp */
  startedAt: number;

  /** Completed at timestamp */
  completedAt: number;

  /** Duration (ms) */
  duration: number;

  /** Action results */
  actionResults: ActionResult[];

  /** Page report (if analytics captured) */
  pageReport?: PageReport;

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

    /** Overall validation score (if validation run) */
    overallScore?: number;

    /** Total issues found */
    totalIssues?: number;
  };

  /** Error (if journey failed) */
  error?: string;
}

// =============================================================================
// JOURNEY LOADER
// =============================================================================

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

// =============================================================================
// JOURNEY ENGINE
// =============================================================================

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
