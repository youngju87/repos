"use strict";
/**
 * Validation Context
 *
 * Builds and provides a context with helper methods for rule evaluation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildValidationContext = buildValidationContext;
exports.getNestedValue = getNestedValue;
exports.evaluateCondition = evaluateCondition;
exports.checkConditions = checkConditions;
/**
 * Build a validation context from scan and detection results
 */
function buildValidationContext(scan, detection, environment = 'production') {
    // Helper: Find tag by platform
    const findTag = (platform) => {
        return detection.tags.find((tag) => tag.platform === platform);
    };
    // Helper: Find all tags by platform
    const findTags = (platform) => {
        return detection.tags.filter((tag) => tag.platform === platform);
    };
    // Helper: Find requests matching pattern
    const findRequests = (pattern) => {
        const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
        return scan.networkRequests.filter((req) => regex.test(req.url));
    };
    // Helper: Get data layer events
    const getDataLayerEvents = (name, eventName) => {
        const events = scan.dataLayerEvents.filter((e) => e.dataLayerName === name);
        if (!eventName) {
            return events;
        }
        return events.filter((e) => {
            if (typeof e.data === 'object' && e.data !== null) {
                return e.data.event === eventName;
            }
            return false;
        });
    };
    // Helper: Get cookie value
    const getCookie = (name) => {
        const cookie = scan.cookies.find((c) => c.name === name);
        return cookie?.value;
    };
    // Helper: Get local storage value
    const getLocalStorage = (key) => {
        return scan.localStorage?.[key];
    };
    // Helper: Check if data layer event exists
    const hasDataLayerEvent = (dataLayerName, eventName) => {
        return getDataLayerEvents(dataLayerName, eventName).length > 0;
    };
    // Helper: Get timestamp for tag (first seen)
    const getTagTimestamp = (tag) => {
        return tag.firstSeenAt;
    };
    // Helper: Get timestamp for event
    const getEventTimestamp = (eventName) => {
        const events = scan.dataLayerEvents.filter((e) => {
            if (typeof e.data === 'object' && e.data !== null) {
                return e.data.event === eventName;
            }
            return false;
        });
        return events.length > 0 ? events[0].timestamp : undefined;
    };
    return {
        scan,
        detection,
        environment,
        findTag,
        findTags,
        findRequests,
        getDataLayerEvents,
        getCookie,
        getLocalStorage,
        hasDataLayerEvent,
        getTagTimestamp,
        getEventTimestamp,
    };
}
/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj, path) {
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
        if (current === null || current === undefined) {
            return undefined;
        }
        if (typeof current !== 'object') {
            return undefined;
        }
        current = current[part];
    }
    return current;
}
/**
 * Evaluate a condition against a value
 */
function evaluateCondition(actual, operator, expected) {
    switch (operator) {
        case 'equals':
            return actual === expected;
        case 'not_equals':
            return actual !== expected;
        case 'contains':
            if (typeof actual === 'string' && typeof expected === 'string') {
                return actual.includes(expected);
            }
            if (Array.isArray(actual)) {
                return actual.includes(expected);
            }
            return false;
        case 'not_contains':
            if (typeof actual === 'string' && typeof expected === 'string') {
                return !actual.includes(expected);
            }
            if (Array.isArray(actual)) {
                return !actual.includes(expected);
            }
            return true;
        case 'matches':
            if (typeof actual === 'string' && typeof expected === 'string') {
                try {
                    const regex = new RegExp(expected);
                    return regex.test(actual);
                }
                catch {
                    return false;
                }
            }
            return false;
        case 'not_matches':
            if (typeof actual === 'string' && typeof expected === 'string') {
                try {
                    const regex = new RegExp(expected);
                    return !regex.test(actual);
                }
                catch {
                    return true;
                }
            }
            return true;
        case 'exists':
            return actual !== undefined && actual !== null;
        case 'not_exists':
            return actual === undefined || actual === null;
        case 'greater_than':
            if (typeof actual === 'number' && typeof expected === 'number') {
                return actual > expected;
            }
            return false;
        case 'less_than':
            if (typeof actual === 'number' && typeof expected === 'number') {
                return actual < expected;
            }
            return false;
        case 'in':
            if (Array.isArray(expected)) {
                return expected.includes(actual);
            }
            return false;
        case 'not_in':
            if (Array.isArray(expected)) {
                return !expected.includes(actual);
            }
            return true;
        default:
            return false;
    }
}
/**
 * Check if conditions match
 */
function checkConditions(conditions, data) {
    if (conditions.length === 0) {
        return true;
    }
    const allMode = conditions[0].all !== false; // Default to AND logic
    for (const condition of conditions) {
        const actualValue = getNestedValue(data, condition.field);
        const matches = evaluateCondition(actualValue, condition.operator, condition.value);
        if (allMode && !matches) {
            return false; // AND logic: fail fast
        }
        if (!allMode && matches) {
            return true; // OR logic: succeed fast
        }
    }
    return allMode; // AND: all passed; OR: none passed
}
//# sourceMappingURL=ValidationContext.js.map