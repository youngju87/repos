"use strict";
/**
 * Journey Loader
 *
 * Loads journey definitions from YAML/JSON files or inline definitions.
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
exports.JourneyLoader = void 0;
exports.loadJourneys = loadJourneys;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const yaml = __importStar(require("yaml"));
/**
 * Journey loader for loading journey definitions
 */
class JourneyLoader {
    config;
    constructor(config) {
        this.config = config;
    }
    /**
     * Load journeys from configured sources
     */
    async load() {
        const journeys = [];
        const errors = [];
        for (const source of this.config.sources) {
            try {
                const loaded = await this.loadFromSource(source);
                journeys.push(...loaded);
            }
            catch (error) {
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
    async loadFromSource(source) {
        switch (source.type) {
            case 'file':
                if (!source.path)
                    throw new Error('File source requires path');
                return [await this.loadFromFile(source.path)];
            case 'directory':
                if (!source.path)
                    throw new Error('Directory source requires path');
                return this.loadFromDirectory(source.path, source.pattern ? new RegExp(source.pattern) : undefined);
            case 'inline':
                if (!source.journey)
                    throw new Error('Inline source requires journey');
                return [source.journey];
            default:
                throw new Error(`Unknown source type: ${source.type}`);
        }
    }
    /**
     * Load journey from a file
     */
    async loadFromFile(filePath) {
        const content = await fs.readFile(filePath, 'utf-8');
        const ext = path.extname(filePath).toLowerCase();
        let journey;
        if (ext === '.yaml' || ext === '.yml') {
            journey = yaml.parse(content);
        }
        else if (ext === '.json') {
            journey = JSON.parse(content);
        }
        else {
            throw new Error(`Unsupported file type: ${ext}`);
        }
        // Validate required fields
        this.validateJourney(journey, filePath);
        return journey;
    }
    /**
     * Load journeys from a directory
     */
    async loadFromDirectory(dirPath, pattern) {
        const journeys = [];
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
                }
                catch (error) {
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
    validateJourney(journey, source) {
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
                    throw new Error(`Action ${j} in step ${i} missing required field 'type' in ${source}`);
                }
            }
        }
    }
    /**
     * Get source description for error reporting
     */
    getSourceDescription(source) {
        switch (source.type) {
            case 'file':
                return `file: ${source.path || 'unknown'}`;
            case 'directory':
                return `directory: ${source.path || 'unknown'}`;
            case 'inline':
                return `inline: ${source.journey?.id || 'unknown'}`;
            default:
                return 'unknown';
        }
    }
}
exports.JourneyLoader = JourneyLoader;
/**
 * Load journeys from configuration
 */
async function loadJourneys(config) {
    const loader = new JourneyLoader(config);
    return loader.load();
}
//# sourceMappingURL=JourneyLoader.js.map