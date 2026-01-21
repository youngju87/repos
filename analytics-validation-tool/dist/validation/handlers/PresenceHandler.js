"use strict";
/**
 * Presence Rule Handler
 *
 * Validates presence/absence of tags, events, requests, scripts, or data layers.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresenceHandler = void 0;
class PresenceHandler {
    type = 'presence';
    canHandle(rule) {
        return rule.type === 'presence';
    }
    async evaluate(rule, context) {
        const startTime = Date.now();
        const evidence = [];
        try {
            // Find matching items based on target type
            let matchCount = 0;
            let foundItems = [];
            switch (rule.target.type) {
                case 'tag':
                    foundItems = rule.target.platform
                        ? context.findTags(rule.target.platform)
                        : context.detection.tags;
                    matchCount = foundItems.length;
                    foundItems.forEach((tag) => {
                        evidence.push({
                            type: 'tag',
                            description: `Found ${tag.platformName} tag`,
                            actual: tag.platform,
                            ref: { id: tag.id, timestamp: tag.firstSeenAt },
                        });
                    });
                    break;
                case 'event':
                    if (!rule.target.dataLayerName) {
                        throw new Error('Event presence rule requires dataLayerName');
                    }
                    foundItems = context.getDataLayerEvents(rule.target.dataLayerName, rule.target.eventName);
                    matchCount = foundItems.length;
                    foundItems.forEach((event) => {
                        evidence.push({
                            type: 'dataLayer',
                            description: `Found data layer event: ${rule.target.eventName || 'any'}`,
                            actual: event.data,
                            ref: { timestamp: event.timestamp },
                        });
                    });
                    break;
                case 'request':
                    if (!rule.target.urlPattern) {
                        throw new Error('Request presence rule requires urlPattern');
                    }
                    foundItems = context.findRequests(rule.target.urlPattern);
                    matchCount = foundItems.length;
                    foundItems.slice(0, 5).forEach((req) => {
                        evidence.push({
                            type: 'request',
                            description: `Found matching request`,
                            actual: req.url,
                            ref: { url: req.url, timestamp: req.timestamp },
                        });
                    });
                    if (foundItems.length > 5) {
                        evidence.push({
                            type: 'request',
                            description: `... and ${foundItems.length - 5} more requests`,
                            actual: foundItems.length,
                        });
                    }
                    break;
                case 'script':
                    if (!rule.target.urlPattern) {
                        throw new Error('Script presence rule requires urlPattern');
                    }
                    const regex = typeof rule.target.urlPattern === 'string'
                        ? new RegExp(rule.target.urlPattern, 'i')
                        : rule.target.urlPattern;
                    foundItems = context.scan.scripts.filter((script) => script.src ? regex.test(script.src) : false);
                    matchCount = foundItems.length;
                    foundItems.forEach((script) => {
                        evidence.push({
                            type: 'script',
                            description: `Found matching script`,
                            actual: script.src,
                            ref: { id: script.id, url: script.src },
                        });
                    });
                    break;
                case 'dataLayer':
                    if (!rule.target.dataLayerName) {
                        throw new Error('Data layer presence rule requires dataLayerName');
                    }
                    foundItems = context.getDataLayerEvents(rule.target.dataLayerName);
                    matchCount = foundItems.length > 0 ? 1 : 0;
                    if (matchCount > 0) {
                        evidence.push({
                            type: 'dataLayer',
                            description: `Found data layer: ${rule.target.dataLayerName}`,
                            actual: `${foundItems.length} events`,
                        });
                    }
                    break;
                default:
                    throw new Error(`Unknown target type: ${rule.target.type}`);
            }
            // Check count constraints
            const meetsMinCount = rule.minCount === undefined || matchCount >= rule.minCount;
            const meetsMaxCount = rule.maxCount === undefined || matchCount <= rule.maxCount;
            const meetsExistence = rule.shouldExist === true ? matchCount > 0 : matchCount === 0;
            const passed = meetsMinCount && meetsMaxCount && meetsExistence;
            // Build result message
            let message;
            if (passed) {
                if (rule.shouldExist) {
                    message = `Found ${matchCount} ${rule.target.type}(s) as expected`;
                }
                else {
                    message = `Correctly verified ${rule.target.type} is not present`;
                }
            }
            else {
                if (!meetsExistence) {
                    if (rule.shouldExist) {
                        message = `Expected ${rule.target.type} to be present but found none`;
                    }
                    else {
                        message = `Expected ${rule.target.type} to be absent but found ${matchCount}`;
                    }
                }
                else if (!meetsMinCount) {
                    message = `Found ${matchCount} ${rule.target.type}(s), expected at least ${rule.minCount}`;
                }
                else {
                    message = `Found ${matchCount} ${rule.target.type}(s), expected at most ${rule.maxCount}`;
                }
            }
            // Add expected evidence
            if (!passed) {
                evidence.push({
                    type: rule.target.type,
                    description: 'Expected condition',
                    expected: rule.shouldExist
                        ? `Should exist (min: ${rule.minCount || 1}, max: ${rule.maxCount || 'unlimited'})`
                        : 'Should not exist',
                    actual: matchCount,
                });
            }
            return [
                {
                    ruleId: rule.id,
                    ruleName: rule.name,
                    status: passed ? 'passed' : 'failed',
                    severity: rule.severity,
                    message,
                    details: rule.description,
                    platform: rule.platform,
                    evidence,
                    timestamp: Date.now(),
                    duration: Date.now() - startTime,
                },
            ];
        }
        catch (error) {
            return [
                {
                    ruleId: rule.id,
                    ruleName: rule.name,
                    status: 'error',
                    severity: rule.severity,
                    message: `Presence validation failed: ${error instanceof Error ? error.message : String(error)}`,
                    details: rule.description,
                    platform: rule.platform,
                    evidence,
                    error: error instanceof Error ? error.message : String(error),
                    timestamp: Date.now(),
                    duration: Date.now() - startTime,
                },
            ];
        }
    }
}
exports.PresenceHandler = PresenceHandler;
//# sourceMappingURL=PresenceHandler.js.map