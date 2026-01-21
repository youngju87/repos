/**
 * Browser Module Exports
 */

export { BrowserManager, getDefaultBrowserManager, shutdownDefaultBrowserManager } from './BrowserManager';
export type {
  BrowserType,
  BrowserPoolConfig,
  BrowserLaunchConfig,
  ContextOptions,
  ManagedBrowser,
  ManagedContext,
  BrowserPoolStats,
  ContextLease,
} from './types';
export {
  validateBrowserPoolConfig,
  validateBrowserLaunchConfig,
  DEFAULT_POOL_CONFIG,
} from './validation';
