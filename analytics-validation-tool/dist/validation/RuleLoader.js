"use strict";
/**
 * Rule Loader
 *
 * Loads validation rules from various sources (files, directories, inline).
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
exports.RuleLoader = void 0;
exports.loadRules = loadRules;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const yaml = __importStar(require("yaml"));
/**
 * Rule loader for reading rules from various sources
 */
class RuleLoader {
    options;
    rules = [];
    errors = [];
    constructor(options) {
        this.options = options;
    }
    /**
     * Load all rules from configured sources
     */
    async load() {
        this.rules = [];
        this.errors = [];
        for (const source of this.options.sources) {
            try {
                await this.loadFromSource(source);
            }
            catch (error) {
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
                return rule.environments.includes(this.options.environment);
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
    async loadFromSource(source) {
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
                throw new Error(`Unknown source type: ${source.type}`);
        }
    }
    /**
     * Load rules from a single file
     */
    async loadFromFile(filePath) {
        const content = await fs_1.promises.readFile(filePath, 'utf-8');
        const parsed = this.parseRuleFile(content, filePath);
        if (Array.isArray(parsed)) {
            this.rules.push(...parsed);
        }
        else if (parsed && typeof parsed === 'object') {
            // Single rule
            this.rules.push(parsed);
        }
        else {
            throw new Error(`Invalid rule file format: ${filePath}`);
        }
    }
    /**
     * Load rules from a directory
     */
    async loadFromDirectory(dirPath, pattern) {
        const entries = await fs_1.promises.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isFile()) {
                const filePath = path.join(dirPath, entry.name);
                // Check pattern if provided
                if (pattern) {
                    const regex = new RegExp(pattern);
                    if (!regex.test(entry.name)) {
                        continue;
                    }
                }
                else {
                    // Default: only load .yaml, .yml, .json files
                    const ext = path.extname(entry.name).toLowerCase();
                    if (!['.yaml', '.yml', '.json'].includes(ext)) {
                        continue;
                    }
                }
                try {
                    await this.loadFromFile(filePath);
                }
                catch (error) {
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
    parseRuleFile(content, filePath) {
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.json') {
            return JSON.parse(content);
        }
        else if (ext === '.yaml' || ext === '.yml') {
            return yaml.parse(content);
        }
        else {
            // Try JSON first, then YAML
            try {
                return JSON.parse(content);
            }
            catch {
                return yaml.parse(content);
            }
        }
    }
    /**
     * Validate rule schema
     */
    validateRuleSchema(rule) {
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
    validatePresenceRule(rule) {
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
    validatePayloadRule(rule) {
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
    validateOrderRule(rule) {
        if (!rule.before || typeof rule.before !== 'object') {
            return false;
        }
        if (!rule.after || typeof rule.after !== 'object') {
            return false;
        }
        return true;
    }
    validateConsentRule(rule) {
        if (!rule.platform || typeof rule.platform !== 'string') {
            return false;
        }
        if (typeof rule.requireConsentBefore !== 'boolean') {
            return false;
        }
        return true;
    }
    validateDataLayerRule(rule) {
        if (!rule.dataLayerName || typeof rule.dataLayerName !== 'string') {
            return false;
        }
        return true;
    }
}
exports.RuleLoader = RuleLoader;
/**
 * Load rules from sources
 */
async function loadRules(options) {
    const loader = new RuleLoader(options);
    return loader.load();
}
//# sourceMappingURL=RuleLoader.js.map