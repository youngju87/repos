/**
 * Script Collector
 *
 * Captures all script tags from the page, including:
 * - Static scripts in HTML
 * - Dynamically injected scripts
 * - Inline vs external scripts
 * - Load timing and status
 * - Script attributes (async, defer, type, etc.)
 *
 * Uses a combination of:
 * - Pre-injected mutation observer (for real-time tracking)
 * - DOM queries (for final collection)
 */
import type { Page } from 'playwright';
import type { Collector, ScriptCollectorOptions } from './types';
import type { ScriptTag } from '../../types';
/**
 * Script Collector Class
 */
export declare class ScriptCollector implements Collector<ScriptTag[]> {
    private page;
    private options;
    private attached;
    private injectionScript;
    constructor(options?: ScriptCollectorOptions);
    /**
     * Attach to a page
     *
     * Note: This should be called BEFORE navigation to capture all scripts.
     * The observer script is added via addInitScript which runs before page content.
     */
    attach(page: Page): Promise<void>;
    /**
     * Detach from the page
     */
    detach(): Promise<void>;
    /**
     * Collect all captured script data
     */
    collect(): Promise<ScriptTag[]>;
    /**
     * Collect scripts directly from the DOM
     */
    private collectFromDOM;
    /**
     * Merge scripts from observer and DOM, removing duplicates
     */
    private mergeScripts;
    /**
     * Generate a unique key for a script for deduplication
     */
    private getScriptKey;
    /**
     * Reset collector state
     */
    reset(): void;
    /**
     * Check if collector is attached
     */
    isAttached(): boolean;
    /**
     * Get external scripts only
     */
    getExternalScripts(): Promise<ScriptTag[]>;
    /**
     * Get inline scripts only
     */
    getInlineScripts(): Promise<ScriptTag[]>;
    /**
     * Get dynamically injected scripts only
     */
    getDynamicScripts(): Promise<ScriptTag[]>;
    /**
     * Check if a specific script source is present
     */
    hasScript(srcPattern: string): Promise<boolean>;
}
//# sourceMappingURL=ScriptCollector.d.ts.map