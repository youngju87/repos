/**
 * Detector Registry
 *
 * Manages registration and retrieval of tag detectors.
 * Supports dynamic loading and enabling/disabling of detectors.
 */
import type { TagDetector } from './types';
/**
 * Detector Registry Class
 *
 * Central registry for all tag detectors.
 */
export declare class DetectorRegistry {
    private detectors;
    /**
     * Register a detector
     */
    register(detector: TagDetector): void;
    /**
     * Register multiple detectors
     */
    registerAll(detectors: TagDetector[]): void;
    /**
     * Unregister a detector by ID
     */
    unregister(detectorId: string): boolean;
    /**
     * Get a detector by ID
     */
    get(detectorId: string): TagDetector | undefined;
    /**
     * Check if a detector is registered
     */
    has(detectorId: string): boolean;
    /**
     * Enable a detector
     */
    enable(detectorId: string): boolean;
    /**
     * Disable a detector
     */
    disable(detectorId: string): boolean;
    /**
     * Check if a detector is enabled
     */
    isEnabled(detectorId: string): boolean;
    /**
     * Get all registered detectors
     */
    getAll(): TagDetector[];
    /**
     * Get all enabled detectors
     */
    getEnabled(): TagDetector[];
    /**
     * Get enabled detectors sorted by priority (highest first)
     */
    getEnabledByPriority(): TagDetector[];
    /**
     * Get detectors for a specific platform
     */
    getByPlatform(platform: string): TagDetector[];
    /**
     * Get detector IDs
     */
    getIds(): string[];
    /**
     * Get enabled detector IDs
     */
    getEnabledIds(): string[];
    /**
     * Get registry statistics
     */
    getStats(): {
        total: number;
        enabled: number;
        disabled: number;
        byCategory: Record<string, number>;
    };
    /**
     * Clear all registrations
     */
    clear(): void;
}
/**
 * Get the default registry instance
 */
export declare function getDefaultRegistry(): DetectorRegistry;
/**
 * Reset the default registry
 */
export declare function resetDefaultRegistry(): void;
//# sourceMappingURL=DetectorRegistry.d.ts.map