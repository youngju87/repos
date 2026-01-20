/**
 * Detector Registry
 *
 * Manages registration and retrieval of tag detectors.
 * Supports dynamic loading and enabling/disabling of detectors.
 */

import type { TagDetector, DetectorRegistration } from './types';

/**
 * Detector Registry Class
 *
 * Central registry for all tag detectors.
 */
export class DetectorRegistry {
  private detectors: Map<string, DetectorRegistration> = new Map();

  /**
   * Register a detector
   */
  register(detector: TagDetector): void {
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
  registerAll(detectors: TagDetector[]): void {
    for (const detector of detectors) {
      this.register(detector);
    }
  }

  /**
   * Unregister a detector by ID
   */
  unregister(detectorId: string): boolean {
    return this.detectors.delete(detectorId);
  }

  /**
   * Get a detector by ID
   */
  get(detectorId: string): TagDetector | undefined {
    return this.detectors.get(detectorId)?.detector;
  }

  /**
   * Check if a detector is registered
   */
  has(detectorId: string): boolean {
    return this.detectors.has(detectorId);
  }

  /**
   * Enable a detector
   */
  enable(detectorId: string): boolean {
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
  disable(detectorId: string): boolean {
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
  isEnabled(detectorId: string): boolean {
    return this.detectors.get(detectorId)?.enabled ?? false;
  }

  /**
   * Get all registered detectors
   */
  getAll(): TagDetector[] {
    return Array.from(this.detectors.values()).map((r) => r.detector);
  }

  /**
   * Get all enabled detectors
   */
  getEnabled(): TagDetector[] {
    return Array.from(this.detectors.values())
      .filter((r) => r.enabled)
      .map((r) => r.detector);
  }

  /**
   * Get enabled detectors sorted by priority (highest first)
   */
  getEnabledByPriority(): TagDetector[] {
    return this.getEnabled().sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get detectors for a specific platform
   */
  getByPlatform(platform: string): TagDetector[] {
    return this.getAll().filter((d) => d.platform === platform);
  }

  /**
   * Get detector IDs
   */
  getIds(): string[] {
    return Array.from(this.detectors.keys());
  }

  /**
   * Get enabled detector IDs
   */
  getEnabledIds(): string[] {
    return Array.from(this.detectors.entries())
      .filter(([, r]) => r.enabled)
      .map(([id]) => id);
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    total: number;
    enabled: number;
    disabled: number;
    byCategory: Record<string, number>;
  } {
    const all = this.getAll();
    const enabled = this.getEnabled();
    const byCategory: Record<string, number> = {};

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
  clear(): void {
    this.detectors.clear();
  }
}

/**
 * Global default registry instance
 */
let defaultRegistry: DetectorRegistry | undefined;

/**
 * Get the default registry instance
 */
export function getDefaultRegistry(): DetectorRegistry {
  if (!defaultRegistry) {
    defaultRegistry = new DetectorRegistry();
  }
  return defaultRegistry;
}

/**
 * Reset the default registry
 */
export function resetDefaultRegistry(): void {
  defaultRegistry = undefined;
}
