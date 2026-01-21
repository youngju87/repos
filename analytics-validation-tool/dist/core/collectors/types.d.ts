/**
 * Collector Types
 *
 * Shared types for all collectors.
 */
import type { Page } from 'playwright';
/**
 * Base collector interface
 */
export interface Collector<T> {
    /** Attach collector to a page */
    attach(page: Page): Promise<void>;
    /** Detach collector from page */
    detach(): Promise<void>;
    /** Collect and return gathered data */
    collect(): Promise<T>;
    /** Reset collector state */
    reset(): void;
    /** Whether the collector is currently attached */
    isAttached(): boolean;
}
/**
 * Unsubscribe function type
 */
export type Unsubscribe = () => void;
/**
 * Event handler type
 */
export type EventHandler<T> = (data: T) => void;
/**
 * Collector options base
 */
export interface CollectorOptions {
    /** Enable debug logging */
    debug?: boolean;
}
/**
 * Network collector specific options
 */
export interface NetworkCollectorOptions extends CollectorOptions {
    /** Whether to capture response bodies */
    captureResponseBodies?: boolean;
    /** Maximum response body size to capture (bytes) */
    maxResponseBodySize?: number;
    /** URL patterns to exclude from capture */
    excludePatterns?: string[];
    /** Resource types to exclude */
    excludeResourceTypes?: string[];
    /** Whether to capture request bodies */
    captureRequestBodies?: boolean;
    /** Maximum request body size to capture (bytes) */
    maxRequestBodySize?: number;
}
/**
 * Script collector specific options
 */
export interface ScriptCollectorOptions extends CollectorOptions {
    /** Maximum inline script content length to capture */
    maxInlineScriptLength?: number;
    /** Whether to capture inline script content */
    captureInlineContent?: boolean;
}
/**
 * Data layer collector specific options
 */
export interface DataLayerCollectorOptions extends CollectorOptions {
    /** Names of data layers to observe */
    dataLayerNames?: string[];
    /** Whether to capture stack traces for pushes */
    captureStackTraces?: boolean;
}
/**
 * Console collector specific options
 */
export interface ConsoleCollectorOptions extends CollectorOptions {
    /** Message types to capture */
    captureTypes?: string[];
    /** Maximum number of messages to capture */
    maxMessages?: number;
    /** Maximum message length */
    maxMessageLength?: number;
}
//# sourceMappingURL=types.d.ts.map