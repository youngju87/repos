/**
 * Scan Options and Configuration
 *
 * Defines the configuration options for page scanning with sensible defaults.
 */
import type { ScanOptions, Viewport } from '../../types';
/**
 * Default viewport configuration
 */
export declare const DEFAULT_VIEWPORT: Viewport;
/**
 * Mobile viewport configuration
 */
export declare const MOBILE_VIEWPORT: Viewport;
/**
 * Tablet viewport configuration
 */
export declare const TABLET_VIEWPORT: Viewport;
/**
 * Common device profiles
 */
export declare const DEVICE_PROFILES: {
    readonly desktop: {
        readonly name: "Desktop";
        readonly viewport: Viewport;
        readonly userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    };
    readonly iphone: {
        readonly name: "iPhone 14 Pro";
        readonly viewport: Viewport;
        readonly userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
    };
    readonly android: {
        readonly name: "Samsung Galaxy S21";
        readonly viewport: {
            readonly width: 360;
            readonly height: 800;
            readonly deviceScaleFactor: 3;
            readonly isMobile: true;
            readonly hasTouch: true;
        };
        readonly userAgent: "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
    };
    readonly ipad: {
        readonly name: "iPad Pro";
        readonly viewport: Viewport;
        readonly userAgent: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
    };
};
/**
 * Default scan options
 */
export declare const DEFAULT_SCAN_OPTIONS: Required<ScanOptions>;
/**
 * Merge user options with defaults
 */
export declare function mergeOptions(userOptions?: Partial<ScanOptions>): ScanOptions;
/**
 * Validate scan options
 */
export declare function validateOptions(options: ScanOptions): string[];
/**
 * Create options for a specific device
 */
export declare function createDeviceOptions(deviceName: keyof typeof DEVICE_PROFILES, overrides?: Partial<ScanOptions>): ScanOptions;
/**
 * Create options for mobile scanning
 */
export declare function createMobileOptions(overrides?: Partial<ScanOptions>): ScanOptions;
/**
 * Create options for desktop scanning
 */
export declare function createDesktopOptions(overrides?: Partial<ScanOptions>): ScanOptions;
//# sourceMappingURL=ScanOptions.d.ts.map