"use strict";
/**
 * Detector Registry
 *
 * Manages registration and retrieval of tag detectors.
 * Supports dynamic loading and enabling/disabling of detectors.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetectorRegistry = void 0;
exports.getDefaultRegistry = getDefaultRegistry;
exports.resetDefaultRegistry = resetDefaultRegistry;
/**
 * Detector Registry Class
 *
 * Central registry for all tag detectors.
 */
class DetectorRegistry {
    detectors = new Map();
    /**
     * Register a detector
     */
    register(detector) {
        if (this.detectors.has(detector.id)) {
            console.warn(`[DetectorRegistry] Detector '${detector.id}' is already registered. Replacing.`);
        }
        this.detectors.set(detector.id, {
            detector,
            enabled: true,
            registeredAt: Date.now(),
        });
    }
    /**
     * Register multiple detectors
     */
    registerAll(detectors) {
        for (const detector of detectors) {
            this.register(detector);
        }
    }
    /**
     * Unregister a detector by ID
     */
    unregister(detectorId) {
        return this.detectors.delete(detectorId);
    }
    /**
     * Get a detector by ID
     */
    get(detectorId) {
        return this.detectors.get(detectorId)?.detector;
    }
    /**
     * Check if a detector is registered
     */
    has(detectorId) {
        return this.detectors.has(detectorId);
    }
    /**
     * Enable a detector
     */
    enable(detectorId) {
        const registration = this.detectors.get(detectorId);
        if (registration) {
            registration.enabled = true;
            return true;
        }
        return false;
    }
    /**
     * Disable a detector
     */
    disable(detectorId) {
        const registration = this.detectors.get(detectorId);
        if (registration) {
            registration.enabled = false;
            return true;
        }
        return false;
    }
    /**
     * Check if a detector is enabled
     */
    isEnabled(detectorId) {
        return this.detectors.get(detectorId)?.enabled ?? false;
    }
    /**
     * Get all registered detectors
     */
    getAll() {
        return Array.from(this.detectors.values()).map((r) => r.detector);
    }
    /**
     * Get all enabled detectors
     */
    getEnabled() {
        return Array.from(this.detectors.values())
            .filter((r) => r.enabled)
            .map((r) => r.detector);
    }
    /**
     * Get enabled detectors sorted by priority (highest first)
     */
    getEnabledByPriority() {
        return this.getEnabled().sort((a, b) => b.priority - a.priority);
    }
    /**
     * Get detectors for a specific platform
     */
    getByPlatform(platform) {
        return this.getAll().filter((d) => d.platform === platform);
    }
    /**
     * Get detector IDs
     */
    getIds() {
        return Array.from(this.detectors.keys());
    }
    /**
     * Get enabled detector IDs
     */
    getEnabledIds() {
        return Array.from(this.detectors.entries())
            .filter(([, r]) => r.enabled)
            .map(([id]) => id);
    }
    /**
     * Get registry statistics
     */
    getStats() {
        const all = this.getAll();
        const enabled = this.getEnabled();
        const byCategory = {};
        for (const detector of all) {
            byCategory[detector.category] = (byCategory[detector.category] || 0) + 1;
        }
        return {
            total: all.length,
            enabled: enabled.length,
            disabled: all.length - enabled.length,
            byCategory,
        };
    }
    /**
     * Clear all registrations
     */
    clear() {
        this.detectors.clear();
    }
}
exports.DetectorRegistry = DetectorRegistry;
/**
 * Global default registry instance
 */
let defaultRegistry;
/**
 * Get the default registry instance
 */
function getDefaultRegistry() {
    if (!defaultRegistry) {
        defaultRegistry = new DetectorRegistry();
    }
    return defaultRegistry;
}
/**
 * Reset the default registry
 */
function resetDefaultRegistry() {
    defaultRegistry = undefined;
}
//# sourceMappingURL=DetectorRegistry.js.map