/**
 * Journey Engine
 *
 * Main orchestrator for executing user journeys and collecting analytics data.
 */
import type { JourneyDefinition, JourneyResult, JourneyEngineConfig } from './types';
import type { AnyRuleDef } from '../validation/types';
import { ActionHandlerRegistry } from './actions';
/**
 * Journey execution engine
 */
export declare class JourneyEngine {
    private config;
    private actionRegistry;
    private browser?;
    private context?;
    private page?;
    constructor(config: JourneyEngineConfig, actionRegistry: ActionHandlerRegistry);
    /**
     * Execute a journey
     */
    execute(journey: JourneyDefinition, validationRules?: AnyRuleDef[]): Promise<JourneyResult>;
    /**
     * Execute a single journey step
     */
    private executeStep;
    /**
     * Execute a single action
     */
    private executeAction;
    /**
     * Initialize browser and page
     */
    private initializeBrowser;
    /**
     * Cleanup resources
     */
    private cleanup;
}
/**
 * Create journey engine with configuration
 */
export declare function createJourneyEngine(config: JourneyEngineConfig, actionRegistry: ActionHandlerRegistry): JourneyEngine;
//# sourceMappingURL=JourneyEngine.d.ts.map