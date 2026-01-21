/**
 * Page Scanner
 *
 * Main orchestrator for scanning a single page. Coordinates:
 * - Browser context acquisition
 * - Collector attachment
 * - Page navigation
 * - Data collection
 * - Result aggregation
 *
 * This is the primary entry point for scanning operations.
 */
import type { ScanOptions, PageScanResult } from '../../types';
import { BrowserManager } from '../browser/BrowserManager';
/**
 * Page Scanner Class
 */
export declare class PageScanner {
    private browserManager;
    private debug;
    constructor(browserManager?: BrowserManager, debug?: boolean);
    /**
     * Scan a single URL
     */
    scan(url: string, options?: Partial<ScanOptions>): Promise<PageScanResult>;
    /**
     * Build context options from scan options
     */
    private buildContextOptions;
    /**
     * Configure page settings
     */
    private configurePage;
    /**
     * Navigate to URL and return navigation result
     */
    private navigateToUrl;
    /**
     * Wait for additional conditions after initial load
     */
    private waitForConditions;
    /**
     * Collect page metadata
     */
    private collectPageMetadata;
    /**
     * Collect cookies from context
     */
    private collectCookies;
    /**
     * Collect storage data from page
     */
    private collectStorage;
    /**
     * Capture page screenshot
     */
    private captureScreenshot;
    /**
     * Build timing metrics
     */
    private buildTimings;
    /**
     * Build scan summary
     */
    private buildSummary;
    /**
     * Create an error result
     */
    private createErrorResult;
    /**
     * Scan multiple URLs in parallel
     */
    scanBatch(urls: string[], options?: Partial<ScanOptions>, concurrency?: number): Promise<PageScanResult[]>;
}
/**
 * Create a PageScanner with default configuration
 */
export declare function createScanner(debug?: boolean): PageScanner;
/**
 * Convenience function to scan a single URL
 */
export declare function scanUrl(url: string, options?: Partial<ScanOptions>): Promise<PageScanResult>;
/**
 * Convenience function to scan multiple URLs
 */
export declare function scanUrls(urls: string[], options?: Partial<ScanOptions>, concurrency?: number): Promise<PageScanResult[]>;
//# sourceMappingURL=PageScanner.d.ts.map