/**
 * Browser Configuration Validation
 *
 * Validates browser pool and launch configurations.
 */

import {
  ValidationError,
  validatePositiveNumber,
  validateString,
  validateBoolean,
  validateOptional,
} from '../utils/validation';
import type { BrowserPoolConfig, BrowserLaunchConfig, BrowserType } from './types';

/**
 * Default browser pool configuration
 */
export const DEFAULT_POOL_CONFIG: BrowserPoolConfig = {
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
function validateBrowserType(value: unknown): BrowserType {
  const validTypes: BrowserType[] = ['chromium', 'firefox', 'webkit'];

  if (typeof value !== 'string') {
    throw new ValidationError('browserType must be a string', 'browserType');
  }

  if (!validTypes.includes(value as BrowserType)) {
    throw new ValidationError(
      `browserType must be one of: ${validTypes.join(', ')}`,
      'browserType'
    );
  }

  return value as BrowserType;
}

/**
 * Validate browser launch configuration
 */
export function validateBrowserLaunchConfig(
  config: Partial<BrowserLaunchConfig>
): BrowserLaunchConfig {
  const validated: BrowserLaunchConfig = {
    browserType: validateBrowserType(
      config.browserType ?? DEFAULT_POOL_CONFIG.launchConfig.browserType
    ),
    headless: validateOptional(config.headless, (v) =>
      validateBoolean(v, 'headless')
    ) ?? DEFAULT_POOL_CONFIG.launchConfig.headless,
    ignoreHTTPSErrors: validateOptional(config.ignoreHTTPSErrors, (v) =>
      validateBoolean(v, 'ignoreHTTPSErrors')
    ) ?? false,
  };

  // Optional fields
  if (config.args !== undefined) {
    if (!Array.isArray(config.args)) {
      throw new ValidationError('args must be an array', 'args');
    }
    validated.args = config.args.map((arg, idx) =>
      validateString(arg, `args[${idx}]`)
    );
  }

  if (config.executablePath !== undefined) {
    validated.executablePath = validateString(
      config.executablePath,
      'executablePath'
    );
  }

  if (config.proxy !== undefined) {
    if (typeof config.proxy !== 'object' || config.proxy === null) {
      throw new ValidationError('proxy must be an object', 'proxy');
    }

    validated.proxy = {
      server: validateString(config.proxy.server, 'proxy.server'),
    };

    if (config.proxy.username !== undefined) {
      validated.proxy.username = validateString(
        config.proxy.username,
        'proxy.username'
      );
    }

    if (config.proxy.password !== undefined) {
      validated.proxy.password = validateString(
        config.proxy.password,
        'proxy.password'
      );
    }

    if (config.proxy.bypass !== undefined) {
      validated.proxy.bypass = validateString(
        config.proxy.bypass,
        'proxy.bypass'
      );
    }
  }

  if (config.slowMo !== undefined) {
    validated.slowMo = validatePositiveNumber(config.slowMo, 'slowMo', {
      min: 0,
      allowZero: true,
    });
  }

  if (config.downloadsPath !== undefined) {
    validated.downloadsPath = validateString(
      config.downloadsPath,
      'downloadsPath'
    );
  }

  if (config.timeout !== undefined) {
    validated.timeout = validatePositiveNumber(config.timeout, 'timeout', {
      min: 1000,
      max: 600000, // 10 minutes
    });
  }

  return validated;
}

/**
 * Validate browser pool configuration
 */
export function validateBrowserPoolConfig(
  config: Partial<BrowserPoolConfig>
): BrowserPoolConfig {
  const validated: BrowserPoolConfig = {
    minBrowsers: validatePositiveNumber(
      config.minBrowsers ?? DEFAULT_POOL_CONFIG.minBrowsers,
      'minBrowsers',
      { min: 0, allowZero: true, max: 100 }
    ),
    maxBrowsers: validatePositiveNumber(
      config.maxBrowsers ?? DEFAULT_POOL_CONFIG.maxBrowsers,
      'maxBrowsers',
      { min: 1, max: 100 }
    ),
    maxContextsPerBrowser: validatePositiveNumber(
      config.maxContextsPerBrowser ?? DEFAULT_POOL_CONFIG.maxContextsPerBrowser,
      'maxContextsPerBrowser',
      { min: 1, max: 100 }
    ),
    browserIdleTimeout: validatePositiveNumber(
      config.browserIdleTimeout ?? DEFAULT_POOL_CONFIG.browserIdleTimeout,
      'browserIdleTimeout',
      { min: 1000, max: 3600000 } // 1 second to 1 hour
    ),
    maxBrowserAge: validatePositiveNumber(
      config.maxBrowserAge ?? DEFAULT_POOL_CONFIG.maxBrowserAge,
      'maxBrowserAge',
      { min: 60000, max: 7200000 } // 1 minute to 2 hours
    ),
    launchConfig: validateBrowserLaunchConfig(
      config.launchConfig ?? {}
    ),
  };

  // Cross-field validation
  if (validated.maxBrowsers < validated.minBrowsers) {
    throw new ValidationError(
      `maxBrowsers (${validated.maxBrowsers}) must be >= minBrowsers (${validated.minBrowsers})`,
      'maxBrowsers'
    );
  }

  if (validated.browserIdleTimeout >= validated.maxBrowserAge) {
    throw new ValidationError(
      'browserIdleTimeout must be less than maxBrowserAge',
      'browserIdleTimeout'
    );
  }

  return validated;
}
