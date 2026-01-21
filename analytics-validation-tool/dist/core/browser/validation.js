"use strict";
/**
 * Browser Configuration Validation
 *
 * Validates browser pool and launch configurations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_POOL_CONFIG = void 0;
exports.validateBrowserLaunchConfig = validateBrowserLaunchConfig;
exports.validateBrowserPoolConfig = validateBrowserPoolConfig;
const validation_1 = require("../utils/validation");
/**
 * Default browser pool configuration
 */
exports.DEFAULT_POOL_CONFIG = {
    minBrowsers: 1,
    maxBrowsers: 5,
    maxContextsPerBrowser: 10,
    browserIdleTimeout: 60000, // 1 minute
    maxBrowserAge: 1800000, // 30 minutes
    launchConfig: {
        browserType: 'chromium',
        headless: true,
        ignoreHTTPSErrors: false,
    },
};
/**
 * Validate browser type
 */
function validateBrowserType(value) {
    const validTypes = ['chromium', 'firefox', 'webkit'];
    if (typeof value !== 'string') {
        throw new validation_1.ValidationError('browserType must be a string', 'browserType');
    }
    if (!validTypes.includes(value)) {
        throw new validation_1.ValidationError(`browserType must be one of: ${validTypes.join(', ')}`, 'browserType');
    }
    return value;
}
/**
 * Validate browser launch configuration
 */
function validateBrowserLaunchConfig(config) {
    const validated = {
        browserType: validateBrowserType(config.browserType ?? exports.DEFAULT_POOL_CONFIG.launchConfig.browserType),
        headless: (0, validation_1.validateOptional)(config.headless, (v) => (0, validation_1.validateBoolean)(v, 'headless')) ?? exports.DEFAULT_POOL_CONFIG.launchConfig.headless,
        ignoreHTTPSErrors: (0, validation_1.validateOptional)(config.ignoreHTTPSErrors, (v) => (0, validation_1.validateBoolean)(v, 'ignoreHTTPSErrors')) ?? false,
    };
    // Optional fields
    if (config.args !== undefined) {
        if (!Array.isArray(config.args)) {
            throw new validation_1.ValidationError('args must be an array', 'args');
        }
        validated.args = config.args.map((arg, idx) => (0, validation_1.validateString)(arg, `args[${idx}]`));
    }
    if (config.executablePath !== undefined) {
        validated.executablePath = (0, validation_1.validateString)(config.executablePath, 'executablePath');
    }
    if (config.proxy !== undefined) {
        if (typeof config.proxy !== 'object' || config.proxy === null) {
            throw new validation_1.ValidationError('proxy must be an object', 'proxy');
        }
        validated.proxy = {
            server: (0, validation_1.validateString)(config.proxy.server, 'proxy.server'),
        };
        if (config.proxy.username !== undefined) {
            validated.proxy.username = (0, validation_1.validateString)(config.proxy.username, 'proxy.username');
        }
        if (config.proxy.password !== undefined) {
            validated.proxy.password = (0, validation_1.validateString)(config.proxy.password, 'proxy.password');
        }
        if (config.proxy.bypass !== undefined) {
            validated.proxy.bypass = (0, validation_1.validateString)(config.proxy.bypass, 'proxy.bypass');
        }
    }
    if (config.slowMo !== undefined) {
        validated.slowMo = (0, validation_1.validatePositiveNumber)(config.slowMo, 'slowMo', {
            min: 0,
            allowZero: true,
        });
    }
    if (config.downloadsPath !== undefined) {
        validated.downloadsPath = (0, validation_1.validateString)(config.downloadsPath, 'downloadsPath');
    }
    if (config.timeout !== undefined) {
        validated.timeout = (0, validation_1.validatePositiveNumber)(config.timeout, 'timeout', {
            min: 1000,
            max: 600000, // 10 minutes
        });
    }
    return validated;
}
/**
 * Validate browser pool configuration
 */
function validateBrowserPoolConfig(config) {
    const validated = {
        minBrowsers: (0, validation_1.validatePositiveNumber)(config.minBrowsers ?? exports.DEFAULT_POOL_CONFIG.minBrowsers, 'minBrowsers', { min: 0, allowZero: true, max: 100 }),
        maxBrowsers: (0, validation_1.validatePositiveNumber)(config.maxBrowsers ?? exports.DEFAULT_POOL_CONFIG.maxBrowsers, 'maxBrowsers', { min: 1, max: 100 }),
        maxContextsPerBrowser: (0, validation_1.validatePositiveNumber)(config.maxContextsPerBrowser ?? exports.DEFAULT_POOL_CONFIG.maxContextsPerBrowser, 'maxContextsPerBrowser', { min: 1, max: 100 }),
        browserIdleTimeout: (0, validation_1.validatePositiveNumber)(config.browserIdleTimeout ?? exports.DEFAULT_POOL_CONFIG.browserIdleTimeout, 'browserIdleTimeout', { min: 1000, max: 3600000 } // 1 second to 1 hour
        ),
        maxBrowserAge: (0, validation_1.validatePositiveNumber)(config.maxBrowserAge ?? exports.DEFAULT_POOL_CONFIG.maxBrowserAge, 'maxBrowserAge', { min: 60000, max: 7200000 } // 1 minute to 2 hours
        ),
        launchConfig: validateBrowserLaunchConfig(config.launchConfig ?? {}),
    };
    // Cross-field validation
    if (validated.maxBrowsers < validated.minBrowsers) {
        throw new validation_1.ValidationError(`maxBrowsers (${validated.maxBrowsers}) must be >= minBrowsers (${validated.minBrowsers})`, 'maxBrowsers');
    }
    if (validated.browserIdleTimeout >= validated.maxBrowserAge) {
        throw new validation_1.ValidationError('browserIdleTimeout must be less than maxBrowserAge', 'browserIdleTimeout');
    }
    return validated;
}
//# sourceMappingURL=validation.js.map