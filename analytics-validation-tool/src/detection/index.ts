/**
 * Detection Module Exports
 *
 * Tag detection layer for identifying analytics and marketing tags.
 */

// Core detection
export { DetectionEngine, detectTags } from './DetectionEngine';
export type { DetectionEngineConfig } from './DetectionEngine';

// Registry
export {
  DetectorRegistry,
  getDefaultRegistry,
  resetDefaultRegistry,
} from './DetectorRegistry';

// Evidence extraction
export {
  buildEvidenceContext,
  extractQueryParams,
  extractDomain,
  urlMatches,
  parsePayload,
  getNestedValue,
} from './EvidenceExtractor';

// Base detector
export { BaseDetector, CONFIDENCE, COMMON_PATTERNS } from './BaseDetector';

// Built-in detectors
export {
  BUILT_IN_DETECTORS,
  registerBuiltInDetectors,
  getDetector,
  GA4Detector,
  GTMDetector,
  AdobeAnalyticsDetector,
  MetaPixelDetector,
  SegmentDetector,
  UnknownTagDetector,
} from './detectors';

// Types
export type {
  // Platform & Category
  KnownPlatform,
  TagCategory,
  LoadMethod,
  DetectionMethod,
  // Evidence
  DetectionEvidence,
  TagConfiguration,
  // Tag Instance
  TagInstance,
  // Detection Result
  DetectionSummary,
  TagDetectionResult,
  // Detector Interface
  EvidenceContext,
  TagDetector,
  DetectorRegistration,
  // Pattern Types
  UrlPattern,
  PayloadPattern,
  GlobalPattern,
  DeclarativeDetectorDef,
} from './types';
