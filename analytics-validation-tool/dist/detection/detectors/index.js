"use strict";
/**
 * Detector Registry - All Platform Detectors
 *
 * This file exports all built-in detectors and provides
 * a function to register them all at once.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownTagDetector = exports.SegmentDetector = exports.MetaPixelDetector = exports.AdobeAnalyticsDetector = exports.GTMDetector = exports.GA4Detector = exports.BUILT_IN_DETECTORS = void 0;
exports.registerBuiltInDetectors = registerBuiltInDetectors;
exports.getDetector = getDetector;
const GA4Detector_1 = require("./GA4Detector");
Object.defineProperty(exports, "GA4Detector", { enumerable: true, get: function () { return GA4Detector_1.GA4Detector; } });
const GTMDetector_1 = require("./GTMDetector");
Object.defineProperty(exports, "GTMDetector", { enumerable: true, get: function () { return GTMDetector_1.GTMDetector; } });
const AdobeAnalyticsDetector_1 = require("./AdobeAnalyticsDetector");
Object.defineProperty(exports, "AdobeAnalyticsDetector", { enumerable: true, get: function () { return AdobeAnalyticsDetector_1.AdobeAnalyticsDetector; } });
const MetaPixelDetector_1 = require("./MetaPixelDetector");
Object.defineProperty(exports, "MetaPixelDetector", { enumerable: true, get: function () { return MetaPixelDetector_1.MetaPixelDetector; } });
const SegmentDetector_1 = require("./SegmentDetector");
Object.defineProperty(exports, "SegmentDetector", { enumerable: true, get: function () { return SegmentDetector_1.SegmentDetector; } });
const UnknownTagDetector_1 = require("./UnknownTagDetector");
Object.defineProperty(exports, "UnknownTagDetector", { enumerable: true, get: function () { return UnknownTagDetector_1.UnknownTagDetector; } });
/**
 * All built-in detectors
 */
exports.BUILT_IN_DETECTORS = [
    new GTMDetector_1.GTMDetector(), // Priority 100 - TMS first
    new GA4Detector_1.GA4Detector(), // Priority 80
    new AdobeAnalyticsDetector_1.AdobeAnalyticsDetector(), // Priority 80
    new SegmentDetector_1.SegmentDetector(), // Priority 75
    new MetaPixelDetector_1.MetaPixelDetector(), // Priority 70
    new UnknownTagDetector_1.UnknownTagDetector(), // Priority 1 - Last
];
/**
 * Register all built-in detectors with a registry
 */
function registerBuiltInDetectors(registry) {
    registry.registerAll(exports.BUILT_IN_DETECTORS);
}
/**
 * Get a specific detector by ID
 */
function getDetector(id) {
    return exports.BUILT_IN_DETECTORS.find((d) => d.id === id);
}
//# sourceMappingURL=index.js.map