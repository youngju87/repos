/**
 * Scan Options and Configuration
 *
 * Defines the configuration options for page scanning with sensible defaults.
 */

import type { ScanOptions, Viewport, Cookie, ProxyConfig, ResourceType } from '../../types';

/**
 * Default viewport configuration
 */
export const DEFAULT_VIEWPORT: Viewport = {
  width: 1920,
  height: 1080,
  deviceScaleFactor: 1,
  isMobile: false,
  hasTouch: false,
};

/**
 * Mobile viewport configuration
 */
export const MOBILE_VIEWPORT: Viewport = {
  width: 375,
  height: 812,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};

/**
 * Tablet viewport configuration
 */
export const TABLET_VIEWPORT: Viewport = {
  width: 768,
  height: 1024,
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
};

/**
 * Common device profiles
 */
export const DEVICE_PROFILES = {
  desktop: {
    name: 'Desktop',
    viewport: DEFAULT_VIEWPORT,
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  iphone: {
    name: 'iPhone 14 Pro',
    viewport: MOBILE_VIEWPORT,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
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
    userAgent:
      'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  },
  ipad: {
    name: 'iPad Pro',
    viewport: TABLET_VIEWPORT,
    userAgent:
      'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  },
} as const;

/**
 * Default scan options
 */
export const DEFAULT_SCAN_OPTIONS: Required<ScanOptions> = {
  viewport: DEFAULT_VIEWPORT,
  userAgent: DEVICE_PROFILES.desktop.userAgent,
  device: DEVICE_PROFILES.desktop,
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
  proxy: undefined as unknown as ProxyConfig,
  blockResourceTypes: [],
  blockUrlPatterns: [],
  geolocation: undefined as unknown as { latitude: number; longitude: number },
  timezone: '',
  locale: '',
  javaScriptEnabled: true,
  httpAuth: undefined as unknown as { username: string; password: string },
};

/**
 * Merge user options with defaults
 */
export function mergeOptions(userOptions: Partial<ScanOptions> = {}): ScanOptions {
  const merged: ScanOptions = {
    ...DEFAULT_SCAN_OPTIONS,
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
export function validateOptions(options: ScanOptions): string[] {
  const errors: string[] = [];

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
export function createDeviceOptions(
  deviceName: keyof typeof DEVICE_PROFILES,
  overrides: Partial<ScanOptions> = {}
): ScanOptions {
  const device = DEVICE_PROFILES[deviceName];
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
export function createMobileOptions(overrides: Partial<ScanOptions> = {}): ScanOptions {
  return createDeviceOptions('iphone', overrides);
}

/**
 * Create options for desktop scanning
 */
export function createDesktopOptions(overrides: Partial<ScanOptions> = {}): ScanOptions {
  return createDeviceOptions('desktop', overrides);
}
