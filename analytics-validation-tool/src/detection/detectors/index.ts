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
export const BUILT_IN_DETECTORS: TagDetector[] = [
  new GTMDetector(),         // Priority 100 - TMS first
  new GA4Detector(),         // Priority 80
  new AdobeAnalyticsDetector(), // Priority 80
  new SegmentDetector(),     // Priority 75
  new MetaPixelDetector(),   // Priority 70
  new UnknownTagDetector(),  // Priority 1 - Last
];

/**
 * Register all built-in detectors with a registry
 */
export function registerBuiltInDetectors(registry: DetectorRegistry): void {
  registry.registerAll(BUILT_IN_DETECTORS);
}

/**
 * Get a specific detector by ID
 */
export function getDetector(id: string): TagDetector | undefined {
  return BUILT_IN_DETECTORS.find((d) => d.id === id);
}

/**
 * Export individual detector classes
 */
export {
  GA4Detector,
  GTMDetector,
  AdobeAnalyticsDetector,
  MetaPixelDetector,
  SegmentDetector,
  UnknownTagDetector,
};
