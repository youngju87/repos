/**
 * Journey Loader
 *
 * Loads journey definitions from YAML/JSON files or inline definitions.
 */
import type { JourneyDefinition, JourneyLoaderConfig } from './types';
/**
 * Journey loader result
 */
export interface JourneyLoaderResult {
    journeys: JourneyDefinition[];
    errors: Array<{
        source?: string;
        error: string;
    }>;
}
/**
 * Journey loader for loading journey definitions
 */
export declare class JourneyLoader {
    private config;
    constructor(config: JourneyLoaderConfig);
    /**
     * Load journeys from configured sources
     */
    load(): Promise<JourneyLoaderResult>;
    /**
     * Load journeys from a single source
     */
    private loadFromSource;
    /**
     * Load journey from a file
     */
    private loadFromFile;
    /**
     * Load journeys from a directory
     */
    private loadFromDirectory;
    /**
     * Validate journey definition
     */
    private validateJourney;
    /**
     * Get source description for error reporting
     */
    private getSourceDescription;
}
/**
 * Load journeys from configuration
 */
export declare function loadJourneys(config: JourneyLoaderConfig): Promise<JourneyLoaderResult>;
//# sourceMappingURL=JourneyLoader.d.ts.map