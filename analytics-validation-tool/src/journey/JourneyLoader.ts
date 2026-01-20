/**
 * Journey Loader
 *
 * Loads journey definitions from YAML/JSON files or inline definitions.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';
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
 * Journey source configuration
 */
export type JourneySource =
  | { type: 'file'; path: string }
  | { type: 'directory'; path: string; pattern?: RegExp }
  | { type: 'inline'; journey: JourneyDefinition };

/**
 * Journey loader for loading journey definitions
 */
export class JourneyLoader {
  private config: JourneyLoaderConfig;

  constructor(config: JourneyLoaderConfig) {
    this.config = config;
  }

  /**
   * Load journeys from configured sources
   */
  async load(): Promise<JourneyLoaderResult> {
    const journeys: JourneyDefinition[] = [];
    const errors: Array<{ source?: string; error: string }> = [];

    for (const source of this.config.sources) {
      try {
        const loaded = await this.loadFromSource(source);
        journeys.push(...loaded);
      } catch (error) {
        errors.push({
          source: this.getSourceDescription(source),
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return { journeys, errors };
  }

  /**
   * Load journeys from a single source
   */
  private async loadFromSource(source: JourneySource): Promise<JourneyDefinition[]> {
    switch (source.type) {
      case 'file':
        return [await this.loadFromFile(source.path)];

      case 'directory':
        return this.loadFromDirectory(source.path, source.pattern);

      case 'inline':
        return [source.journey];

      default:
        throw new Error(`Unknown source type: ${(source as any).type}`);
    }
  }

  /**
   * Load journey from a file
   */
  private async loadFromFile(filePath: string): Promise<JourneyDefinition> {
    const content = await fs.readFile(filePath, 'utf-8');
    const ext = path.extname(filePath).toLowerCase();

    let journey: any;

    if (ext === '.yaml' || ext === '.yml') {
      journey = yaml.parse(content);
    } else if (ext === '.json') {
      journey = JSON.parse(content);
    } else {
      throw new Error(`Unsupported file type: ${ext}`);
    }

    // Validate required fields
    this.validateJourney(journey, filePath);

    return journey as JourneyDefinition;
  }

  /**
   * Load journeys from a directory
   */
  private async loadFromDirectory(
    dirPath: string,
    pattern?: RegExp
  ): Promise<JourneyDefinition[]> {
    const journeys: JourneyDefinition[] = [];
    const files = await fs.readdir(dirPath);

    for (const file of files) {
      // Skip if doesn't match pattern
      if (pattern && !pattern.test(file)) {
        continue;
      }

      // Only process YAML and JSON files
      const ext = path.extname(file).toLowerCase();
      if (!['.yaml', '.yml', '.json'].includes(ext)) {
        continue;
      }

      const filePath = path.join(dirPath, file);
      const stat = await fs.stat(filePath);

      if (stat.isFile()) {
        try {
          const journey = await this.loadFromFile(filePath);
          journeys.push(journey);
        } catch (error) {
          // Continue loading other files even if one fails
          console.warn(`Failed to load journey from ${filePath}:`, error);
        }
      }
    }

    return journeys;
  }

  /**
   * Validate journey definition
   */
  private validateJourney(journey: any, source: string): void {
    if (!journey.id) {
      throw new Error(`Journey missing required field 'id' in ${source}`);
    }

    if (!journey.name) {
      throw new Error(`Journey missing required field 'name' in ${source}`);
    }

    if (!journey.startUrl) {
      throw new Error(`Journey missing required field 'startUrl' in ${source}`);
    }

    if (!Array.isArray(journey.steps) || journey.steps.length === 0) {
      throw new Error(`Journey must have at least one step in ${source}`);
    }

    // Validate each step
    for (let i = 0; i < journey.steps.length; i++) {
      const step = journey.steps[i];

      if (!step.id) {
        throw new Error(`Step ${i} missing required field 'id' in ${source}`);
      }

      if (!step.name) {
        throw new Error(`Step ${i} missing required field 'name' in ${source}`);
      }

      if (!Array.isArray(step.actions) || step.actions.length === 0) {
        throw new Error(`Step ${i} must have at least one action in ${source}`);
      }

      // Validate each action
      for (let j = 0; j < step.actions.length; j++) {
        const action = step.actions[j];

        if (!action.type) {
          throw new Error(
            `Action ${j} in step ${i} missing required field 'type' in ${source}`
          );
        }
      }
    }
  }

  /**
   * Get source description for error reporting
   */
  private getSourceDescription(source: JourneySource): string {
    switch (source.type) {
      case 'file':
        return `file: ${source.path}`;
      case 'directory':
        return `directory: ${source.path}`;
      case 'inline':
        return `inline: ${source.journey.id}`;
      default:
        return 'unknown';
    }
  }
}

/**
 * Load journeys from configuration
 */
export async function loadJourneys(
  config: JourneyLoaderConfig
): Promise<JourneyLoaderResult> {
  const loader = new JourneyLoader(config);
  return loader.load();
}
