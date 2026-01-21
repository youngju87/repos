/**
 * Detection Engine
 *
 * Orchestrates the tag detection process:
 * 1. Builds evidence context from scan result
 * 2. Runs all enabled detectors
 * 3. Deduplicates and merges results
 * 4. Calculates summary statistics
 * 5. Returns TagDetectionResult
 */
import type { PageScanResult } from '../types';
import type { TagDetectionResult } from './types';
import { DetectorRegistry } from './DetectorRegistry';
/**
 * Detection engine configuration
 */
export interface DetectionEngineConfig {
    /** Custom detector registry */
    registry?: DetectorRegistry;
    /** Maximum time per detector (ms) */
    detectorTimeout?: number;
    /** Whether to run unknown tag detector */
    detectUnknown?: boolean;
    /** Minimum confidence to include in results */
    minConfidence?: number;
    /** Enable debug logging */
    debug?: boolean;
}
/**
 * Detection Engine Class
 */
export declare class DetectionEngine {
    private config;
    private readonly version;
    constructor(config?: DetectionEngineConfig);
    /**
     * Detect tags from a page scan result
     */
    detect(scan: PageScanResult): Promise<TagDetectionResult>;
    /**
     * Run a detector with timeout protection
     */
    private runDetectorWithTimeout;
    /**
     * Deduplicate and merge tag instances
     *
     * Tags are considered duplicates if they have the same platform.
     * When duplicates are found, their evidence is merged.
     */
    private deduplicateTags;
    /**
     * Merge multiple instances of the same platform
     */
    private mergeInstances;
    /**
     * Calculate combined confidence from evidence list
     */
    private calculateCombinedConfidence;
    /**
     * Select the most specific load method
     */
    private selectBestLoadMethod;
    /**
     * Calculate summary statistics
     */
    private calculateSummary;
}
/**
 * Convenience function to detect tags from a scan
 */
export declare function detectTags(scan: PageScanResult, config?: DetectionEngineConfig): Promise<TagDetectionResult>;
//# sourceMappingURL=DetectionEngine.d.ts.map