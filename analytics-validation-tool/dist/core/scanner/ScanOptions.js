"use strict";
/**
 * Scan Options and Configuration
 *
 * Defines the configuration options for page scanning with sensible defaults.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SCAN_OPTIONS = exports.DEVICE_PROFILES = exports.TABLET_VIEWPORT = exports.MOBILE_VIEWPORT = exports.DEFAULT_VIEWPORT = void 0;
exports.mergeOptions = mergeOptions;
exports.validateOptions = validateOptions;
exports.createDeviceOptions = createDeviceOptions;
exports.createMobileOptions = createMobileOptions;
exports.createDesktopOptions = createDesktopOptions;
/**
 * Default viewport configuration
 */
exports.DEFAULT_VIEWPORT = {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
};
/**
 * Mobile viewport configuration
 */
exports.MOBILE_VIEWPORT = {
    width: 375,
    height: 812,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
};
/**
 * Tablet viewport configuration
 */
exports.TABLET_VIEWPORT = {
    width: 768,
    height: 1024,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
};
/**
 * Common device profiles
 */
exports.DEVICE_PROFILES = {
    desktop: {
        name: 'Desktop',
        viewport: exports.DEFAULT_VIEWPORT,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    iphone: {
        name: 'iPhone 14 Pro',
        viewport: exports.MOBILE_VIEWPORT,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    },
    android: {
        name: 'Samsung Galaxy S21',
        viewport: {
            width: 360,
            height: 800,
            deviceScaleFactor: 3,
            isMobile: true,
            hasTouch: true,
        },
        userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    },
    ipad: {
        name: 'iPad Pro',
        viewport: exports.TABLET_VIEWPORT,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    },
};
/**
 * Default scan options
 */
exports.DEFAULT_SCAN_OPTIONS = {
    viewport: exports.DEFAULT_VIEWPORT,
    userAgent: exports.DEVICE_PROFILES.desktop.userAgent,
    device: exports.DEVICE_PROFILES.desktop,
    cookies: [],
    extraHeaders: {},
    waitUntil: 'networkidle',
    additionalWaitTime: 0,
    waitForSelector: '',
    timeout: 30000,
    captureResponseBodies: true,
    maxResponseBodySize: 1024 * 1024, // 1MB
    dataLayerNames: ['dataLayer', 'digitalData', 'utag_data'],
    captureScreenshot: false,
    injectScriptBefore: '',
    injectScriptAfter: '',
    proxy: undefined,
    blockResourceTypes: [],
    blockUrlPatterns: [],
    geolocation: undefined,
    timezone: '',
    locale: '',
    javaScriptEnabled: true,
    httpAuth: undefined,
};
/**
 * Merge user options with defaults
 */
function mergeOptions(userOptions = {}) {
    const merged = {
        ...exports.DEFAULT_SCAN_OPTIONS,
        ...userOptions,
    };
    // Handle device profile
    if (userOptions.device) {
        merged.viewport = userOptions.viewport || userOptions.device.viewport;
        merged.userAgent = userOptions.userAgent || userOptions.device.userAgent;
    }
    return merged;
}
/**
 * Validate scan options
 */
function validateOptions(options) {
    const errors = [];
    if (options.timeout !== undefined && options.timeout < 1000) {
        errors.push('Timeout must be at least 1000ms');
    }
    if (options.viewport) {
        if (options.viewport.width < 1 || options.viewport.height < 1) {
            errors.push('Viewport dimensions must be positive');
        }
    }
    if (options.maxResponseBodySize !== undefined && options.maxResponseBodySize < 0) {
        errors.push('maxResponseBodySize must be non-negative');
    }
    return errors;
}
/**
 * Create options for a specific device
 */
function createDeviceOptions(deviceName, overrides = {}) {
    const device = exports.DEVICE_PROFILES[deviceName];
    return mergeOptions({
        device,
        viewport: device.viewport,
        userAgent: device.userAgent,
        ...overrides,
    });
}
/**
 * Create options for mobile scanning
 */
function createMobileOptions(overrides = {}) {
    return createDeviceOptions('iphone', overrides);
}
/**
 * Create options for desktop scanning
 */
function createDesktopOptions(overrides = {}) {
    return createDeviceOptions('desktop', overrides);
}
//# sourceMappingURL=ScanOptions.js.map