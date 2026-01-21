/**
 * Detector Registry - All Platform Detectors
 *
 * This file exports all built-in detectors and provides
 * a function to register them all at once.
 */
import { GA4Detector } from './GA4Detector';
import { GTMDetector } from './GTMDetector';
import { AdobeAnalyticsDetector } from './AdobeAnalyticsDetector';
import { MetaPixelDetector } from './MetaPixelDetector';
import { SegmentDetector } from './SegmentDetector';
import { UnknownTagDetector } from './UnknownTagDetector';
import type { TagDetector } from '../types';
import type { DetectorRegistry } from '../DetectorRegistry';
/**
 * All built-in detectors
 */
export declare const BUILT_IN_DETECTORS: TagDetector[];
/**
 * Register all built-in detectors with a registry
 */
export declare function registerBuiltInDetectors(registry: DetectorRegistry): void;
/**
 * Get a specific detector by ID
 */
export declare function getDetector(id: string): TagDetector | undefined;
/**
 * Export individual detector classes
 */
export { GA4Detector, GTMDetector, AdobeAnalyticsDetector, MetaPixelDetector, SegmentDetector, UnknownTagDetector, };
//# sourceMappingURL=index.d.ts.map