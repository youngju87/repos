/**
 * Rule Loader
 *
 * Loads validation rules from various sources (files, directories, inline).
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import type {
  AnyRuleDef,
  RuleSource,
  RuleLoaderOptions,
} from './types';

/**
 * Rule loader for reading rules from various sources
 */
export class RuleLoader {
  private rules: AnyRuleDef[] = [];
  private errors: Array<{ source?: string; error: string }> = [];

  constructor(private options: RuleLoaderOptions) {}

  /**
   * Load all rules from configured sources
   */
  async load(): Promise<{
    rules: AnyRuleDef[];
    errors: Array<{ source?: string; error: string }>;
  }> {
    this.rules = [];
    this.errors = [];

    for (const source of this.options.sources) {
      try {
        await this.loadFromSource(source);
      } catch (error) {
        this.errors.push({
          source: source.path || source.type,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Filter rules by environment and platform
    let filtered = this.rules;

    if (this.options.environment) {
      filtered = filtered.filter((rule) => {
        if (!rule.environments || rule.environments.length === 0) {
          return true; // Rule applies to all environments
        }
        return rule.environments.includes(this.options.environment!);
      });
    }

    if (this.options.platform) {
      filtered = filtered.filter((rule) => {
        if (!rule.platform) {
          return true; // Rule applies to all platforms
        }
        return rule.platform === this.options.platform;
      });
    }

    // Validate schemas if requested
    if (this.options.validateSchema) {
      filtered = filtered.filter((rule) => {
        const valid = this.validateRuleSchema(rule);
        if (!valid) {
          this.errors.push({
            source: rule.id,
            error: `Rule ${rule.id} failed schema validation`,
          });
        }
        return valid;
      });
    }

    return {
      rules: filtered,
      errors: this.errors,
    };
  }

  /**
   * Load rules from a single source
   */
  private async loadFromSource(source: RuleSource): Promise<void> {
    switch (source.type) {
      case 'file':
        if (!source.path) {
          throw new Error('File source requires path');
        }
        await this.loadFromFile(source.path);
        break;

      case 'directory':
        if (!source.path) {
          throw new Error('Directory source requires path');
        }
        await this.loadFromDirectory(source.path, source.pattern);
        break;

      case 'inline':
        if (!source.rules) {
          throw new Error('Inline source requires rules array');
        }
        this.rules.push(...source.rules);
        break;

      default:
        throw new Error(`Unknown source type: ${(source as any).type}`);
    }
  }

  /**
   * Load rules from a single file
   */
  private async loadFromFile(filePath: string): Promise<void> {
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = this.parseRuleFile(content, filePath);

    if (Array.isArray(parsed)) {
      this.rules.push(...parsed);
    } else if (parsed && typeof parsed === 'object') {
      // Single rule
      this.rules.push(parsed as AnyRuleDef);
    } else {
      throw new Error(`Invalid rule file format: ${filePath}`);
    }
  }

  /**
   * Load rules from a directory
   */
  private async loadFromDirectory(
    dirPath: string,
    pattern?: string
  ): Promise<void> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile()) {
        const filePath = path.join(dirPath, entry.name);

        // Check pattern if provided
        if (pattern) {
          const regex = new RegExp(pattern);
          if (!regex.test(entry.name)) {
            continue;
          }
        } else {
          // Default: only load .yaml, .yml, .json files
          const ext = path.extname(entry.name).toLowerCase();
          if (!['.yaml', '.yml', '.json'].includes(ext)) {
            continue;
          }
        }

        try {
          await this.loadFromFile(filePath);
        } catch (error) {
          this.errors.push({
            source: filePath,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }
  }

  /**
   * Parse a rule file (YAML or JSON)
   */
  private parseRuleFile(content: string, filePath: string): unknown {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.json') {
      return JSON.parse(content);
    } else if (ext === '.yaml' || ext === '.yml') {
      return yaml.parse(content);
    } else {
      // Try JSON first, then YAML
      try {
        return JSON.parse(content);
      } catch {
        return yaml.parse(content);
      }
    }
  }

  /**
   * Validate rule schema
   */
  private validateRuleSchema(rule: AnyRuleDef): boolean {
    // Basic validation
    if (!rule.id || typeof rule.id !== 'string') {
      return false;
    }
    if (!rule.name || typeof rule.name !== 'string') {
      return false;
    }
    if (!rule.type || typeof rule.type !== 'string') {
      return false;
    }
    if (!rule.severity || !['error', 'warning', 'info'].includes(rule.severity)) {
      return false;
    }
    if (!rule.assertions || !Array.isArray(rule.assertions)) {
      return false;
    }

    // Type-specific validation
    switch (rule.type) {
      case 'presence':
        return this.validatePresenceRule(rule);
      case 'payload':
        return this.validatePayloadRule(rule);
      case 'order':
        return this.validateOrderRule(rule);
      case 'consent':
        return this.validateConsentRule(rule);
      case 'data-layer':
        return this.validateDataLayerRule(rule);
      default:
        return true; // Unknown types pass validation
    }
  }

  private validatePresenceRule(rule: any): boolean {
    if (!rule.target || typeof rule.target !== 'object') {
      return false;
    }
    if (!rule.target.type || typeof rule.target.type !== 'string') {
      return false;
    }
    if (typeof rule.shouldExist !== 'boolean') {
      return false;
    }
    return true;
  }

  private validatePayloadRule(rule: any): boolean {
    if (!rule.target || typeof rule.target !== 'object') {
      return false;
    }
    if (!rule.target.urlPattern || typeof rule.target.urlPattern !== 'string') {
      return false;
    }
    if (!rule.source || !['query', 'body', 'headers'].includes(rule.source)) {
      return false;
    }
    if (!rule.fields || !Array.isArray(rule.fields)) {
      return false;
    }
    return true;
  }

  private validateOrderRule(rule: any): boolean {
    if (!rule.before || typeof rule.before !== 'object') {
      return false;
    }
    if (!rule.after || typeof rule.after !== 'object') {
      return false;
    }
    return true;
  }

  private validateConsentRule(rule: any): boolean {
    if (!rule.platform || typeof rule.platform !== 'string') {
      return false;
    }
    if (typeof rule.requireConsentBefore !== 'boolean') {
      return false;
    }
    return true;
  }

  private validateDataLayerRule(rule: any): boolean {
    if (!rule.dataLayerName || typeof rule.dataLayerName !== 'string') {
      return false;
    }
    return true;
  }
}

/**
 * Load rules from sources
 */
export async function loadRules(
  options: RuleLoaderOptions
): Promise<{
  rules: AnyRuleDef[];
  errors: Array<{ source?: string; error: string }>;
}> {
  const loader = new RuleLoader(options);
  return loader.load();
}
