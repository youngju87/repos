"use strict";
/**
 * Detection Module Exports
 *
 * Tag detection layer for identifying analytics and marketing tags.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownTagDetector = exports.SegmentDetector = exports.MetaPixelDetector = exports.AdobeAnalyticsDetector = exports.GTMDetector = exports.GA4Detector = exports.getDetector = exports.registerBuiltInDetectors = exports.BUILT_IN_DETECTORS = exports.COMMON_PATTERNS = exports.CONFIDENCE = exports.BaseDetector = exports.getNestedValue = exports.parsePayload = exports.urlMatches = exports.extractDomain = exports.extractQueryParams = exports.buildEvidenceContext = exports.resetDefaultRegistry = exports.getDefaultRegistry = exports.DetectorRegistry = exports.detectTags = exports.DetectionEngine = void 0;
// Core detection
var DetectionEngine_1 = require("./DetectionEngine");
Object.defineProperty(exports, "DetectionEngine", { enumerable: true, get: function () { return DetectionEngine_1.DetectionEngine; } });
Object.defineProperty(exports, "detectTags", { enumerable: true, get: function () { return DetectionEngine_1.detectTags; } });
// Registry
var DetectorRegistry_1 = require("./DetectorRegistry");
Object.defineProperty(exports, "DetectorRegistry", { enumerable: true, get: function () { return DetectorRegistry_1.DetectorRegistry; } });
Object.defineProperty(exports, "getDefaultRegistry", { enumerable: true, get: function () { return DetectorRegistry_1.getDefaultRegistry; } });
Object.defineProperty(exports, "resetDefaultRegistry", { enumerable: true, get: function () { return DetectorRegistry_1.resetDefaultRegistry; } });
// Evidence extraction
var EvidenceExtractor_1 = require("./EvidenceExtractor");
Object.defineProperty(exports, "buildEvidenceContext", { enumerable: true, get: function () { return EvidenceExtractor_1.buildEvidenceContext; } });
Object.defineProperty(exports, "extractQueryParams", { enumerable: true, get: function () { return EvidenceExtractor_1.extractQueryParams; } });
Object.defineProperty(exports, "extractDomain", { enumerable: true, get: function () { return EvidenceExtractor_1.extractDomain; } });
Object.defineProperty(exports, "urlMatches", { enumerable: true, get: function () { return EvidenceExtractor_1.urlMatches; } });
Object.defineProperty(exports, "parsePayload", { enumerable: true, get: function () { return EvidenceExtractor_1.parsePayload; } });
Object.defineProperty(exports, "getNestedValue", { enumerable: true, get: function () { return EvidenceExtractor_1.getNestedValue; } });
// Base detector
var BaseDetector_1 = require("./BaseDetector");
Object.defineProperty(exports, "BaseDetector", { enumerable: true, get: function () { return BaseDetector_1.BaseDetector; } });
Object.defineProperty(exports, "CONFIDENCE", { enumerable: true, get: function () { return BaseDetector_1.CONFIDENCE; } });
Object.defineProperty(exports, "COMMON_PATTERNS", { enumerable: true, get: function () { return BaseDetector_1.COMMON_PATTERNS; } });
// Built-in detectors
var detectors_1 = require("./detectors");
Object.defineProperty(exports, "BUILT_IN_DETECTORS", { enumerable: true, get: function () { return detectors_1.BUILT_IN_DETECTORS; } });
Object.defineProperty(exports, "registerBuiltInDetectors", { enumerable: true, get: function () { return detectors_1.registerBuiltInDetectors; } });
Object.defineProperty(exports, "getDetector", { enumerable: true, get: function () { return detectors_1.getDetector; } });
Object.defineProperty(exports, "GA4Detector", { enumerable: true, get: function () { return detectors_1.GA4Detector; } });
Object.defineProperty(exports, "GTMDetector", { enumerable: true, get: function () { return detectors_1.GTMDetector; } });
Object.defineProperty(exports, "AdobeAnalyticsDetector", { enumerable: true, get: function () { return detectors_1.AdobeAnalyticsDetector; } });
Object.defineProperty(exports, "MetaPixelDetector", { enumerable: true, get: function () { return detectors_1.MetaPixelDetector; } });
Object.defineProperty(exports, "SegmentDetector", { enumerable: true, get: function () { return detectors_1.SegmentDetector; } });
Object.defineProperty(exports, "UnknownTagDetector", { enumerable: true, get: function () { return detectors_1.UnknownTagDetector; } });
//# sourceMappingURL=index.js.map