/**
 * Journey & Funnel Simulation
 *
 * Multi-step user flow validation with analytics capture.
 */

// Core types
export type {
  JourneyActionType,
  WaitConditionType,
  JourneyActionBase,
  NavigateAction,
  ClickAction,
  TypeAction,
  SubmitAction,
  WaitAction,
  AssertAction,
  AssertType,
  AssertOperator,
  ScreenshotAction,
  JourneyAction,
  JourneyStep,
  JourneyDefinition,
  ActionResult,
  StepResult,
  JourneyResult,
  JourneySource,
  JourneyLoaderOptions,
  JourneyLoaderConfig,
  JourneyEngineConfig,
  JourneyExecutionOptions,
  ActionHandler,
} from './types';

// Loader
export { JourneyLoader, type JourneyLoaderResult } from './JourneyLoader';

// Engine
export { JourneyEngine } from './JourneyEngine';

// Actions
export {
  ActionHandlerRegistry,
  registerBuiltInActionHandlers,
  getDefaultActionRegistry,
  NavigateActionHandler,
  ClickActionHandler,
  TypeActionHandler,
  SubmitActionHandler,
  WaitActionHandler,
  AssertActionHandler,
  ScreenshotActionHandler,
} from './actions';
