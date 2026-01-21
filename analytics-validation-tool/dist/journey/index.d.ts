/**
 * Journey & Funnel Simulation
 *
 * Multi-step user flow validation with analytics capture.
 */
export type { JourneyActionType, WaitConditionType, JourneyActionBase, NavigateAction, ClickAction, TypeAction, SubmitAction, WaitAction, AssertAction, AssertType, AssertOperator, ScreenshotAction, JourneyAction, JourneyStep, JourneyDefinition, ActionResult, StepResult, JourneyResult, JourneySource, JourneyLoaderOptions, JourneyLoaderConfig, JourneyEngineConfig, JourneyExecutionOptions, ActionHandler, } from './types';
export { JourneyLoader, type JourneyLoaderResult } from './JourneyLoader';
export { JourneyEngine } from './JourneyEngine';
export { ActionHandlerRegistry, registerBuiltInActionHandlers, getDefaultActionRegistry, NavigateActionHandler, ClickActionHandler, TypeActionHandler, SubmitActionHandler, WaitActionHandler, AssertActionHandler, ScreenshotActionHandler, } from './actions';
//# sourceMappingURL=index.d.ts.map