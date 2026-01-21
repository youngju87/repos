/**
 * Browser Configuration Validation
 *
 * Validates browser pool and launch configurations.
 */
import type { BrowserPoolConfig, BrowserLaunchConfig } from './types';
/**
 * Default browser pool configuration
 */
export declare const DEFAULT_POOL_CONFIG: BrowserPoolConfig;
/**
 * Validate browser launch configuration
 */
export declare function validateBrowserLaunchConfig(config: Partial<BrowserLaunchConfig>): BrowserLaunchConfig;
/**
 * Validate browser pool configuration
 */
export declare function validateBrowserPoolConfig(config: Partial<BrowserPoolConfig>): BrowserPoolConfig;
//# sourceMappingURL=validation.d.ts.map