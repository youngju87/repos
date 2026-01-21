/**
 * Detection Module Exports
 *
 * Tag detection layer for identifying analytics and marketing tags.
 */
export { DetectionEngine, detectTags } from './DetectionEngine';
export type { DetectionEngineConfig } from './DetectionEngine';
export { DetectorRegistry, getDefaultRegistry, resetDefaultRegistry, } from './DetectorRegistry';
export { buildEvidenceContext, extractQueryParams, extractDomain, urlMatches, parsePayload, getNestedValue, } from './EvidenceExtractor';
export { BaseDetector, CONFIDENCE, COMMON_PATTERNS } from './BaseDetector';
export { BUILT_IN_DETECTORS, registerBuiltInDetectors, getDetector, GA4Detector, GTMDetector, AdobeAnalyticsDetector, MetaPixelDetector, SegmentDetector, UnknownTagDetector, } from './detectors';
export type { KnownPlatform, TagCategory, LoadMethod, DetectionMethod, DetectionEvidence, TagConfiguration, TagInstance, DetectionSummary, TagDetectionResult, EvidenceContext, TagDetector, DetectorRegistration, UrlPattern, PayloadPattern, GlobalPattern, DeclarativeDetectorDef, } from './types';
//# sourceMappingURL=index.d.ts.map