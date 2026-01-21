/**
 * Tag Detection Types
 *
 * Core type definitions for the tag detection layer.
 * These types define the structure of detected tags and detection results.
 */
import type { PageScanResult, NetworkRequest, ScriptTag, DataLayerEvent } from '../types';
/**
 * Known analytics/marketing platforms
 */
export type KnownPlatform = 'ga4' | 'universal-analytics' | 'gtm' | 'adobe-analytics' | 'adobe-launch' | 'meta-pixel' | 'segment' | 'tealium' | 'amplitude' | 'mixpanel' | 'heap' | 'hotjar' | 'fullstory' | 'clarity' | 'linkedin-insight' | 'twitter-pixel' | 'tiktok-pixel' | 'pinterest-tag' | 'snapchat-pixel' | 'criteo' | 'google-ads' | 'bing-ads' | 'klaviyo' | 'hubspot' | 'intercom' | 'drift' | 'optimizely' | 'vwo' | 'crazy-egg' | 'mouseflow' | 'lucky-orange' | 'custom' | 'unknown';
/**
 * Tag categories for classification
 */
export type TagCategory = 'analytics' | 'tag-manager' | 'advertising' | 'social' | 'session-recording' | 'heatmap' | 'ab-testing' | 'personalization' | 'cdp' | 'chat' | 'crm' | 'email' | 'consent' | 'error-tracking' | 'performance' | 'custom' | 'other';
/**
 * How the tag was loaded onto the page
 */
export type LoadMethod = 'direct' | 'gtm' | 'adobe-launch' | 'tealium' | 'segment' | 'other-tms' | 'dynamic' | 'unknown';
/**
 * How we detected this tag
 */
export type DetectionMethod = 'script-url' | 'script-content' | 'network-endpoint' | 'network-payload' | 'global-object' | 'data-layer' | 'cookie' | 'dom-element' | 'console-message' | 'header' | 'composite';
/**
 * A piece of evidence supporting a detection
 */
export interface DetectionEvidence {
    /** How this evidence was found */
    method: DetectionMethod;
    /** What was matched (URL, pattern, object name, etc.) */
    matched: string;
    /** The actual value that matched */
    value: string;
    /** Confidence contribution (0-1) */
    confidence: number;
    /** Additional context */
    context?: Record<string, unknown>;
    /** Reference to source data */
    sourceRef?: {
        type: 'script' | 'request' | 'dataLayer' | 'cookie' | 'console' | 'dom';
        id?: string;
        index?: number;
    };
}
/**
 * Extracted configuration from a tag
 */
export interface TagConfiguration {
    /** Primary identifier (measurement ID, pixel ID, etc.) */
    primaryId?: string;
    /** Additional identifiers */
    additionalIds?: string[];
    /** Configuration properties */
    properties?: Record<string, unknown>;
    /** Features/settings detected as enabled */
    enabledFeatures?: string[];
    /** Raw configuration object if available */
    raw?: unknown;
}
/**
 * A detected tag instance
 *
 * Represents a single analytics/marketing tag found on the page.
 */
export interface TagInstance {
    /** Unique identifier for this detection */
    id: string;
    /** Platform identifier */
    platform: KnownPlatform | string;
    /** Human-readable platform name */
    platformName: string;
    /** Tag category */
    category: TagCategory;
    /** How the tag was loaded */
    loadMethod: LoadMethod;
    /** If loaded via TMS, which one */
    loadedVia?: string;
    /** Detection confidence (0-1) */
    confidence: number;
    /** All detection methods used */
    detectionMethods: DetectionMethod[];
    /** Evidence supporting this detection */
    evidence: DetectionEvidence[];
    /** Extracted configuration */
    config: TagConfiguration;
    /** Version if detectable */
    version?: string;
    /** Script URLs associated with this tag */
    scriptUrls: string[];
    /** Network endpoints this tag communicated with */
    endpoints: string[];
    /** Request IDs of associated network calls */
    networkRequestIds: string[];
    /** Data layer events associated with this tag */
    dataLayerEventIds: string[];
    /** First time this tag was observed (timestamp) */
    firstSeenAt: number;
    /** Last time this tag was observed (timestamp) */
    lastSeenAt: number;
    /** Load order relative to other tags */
    loadOrder?: number;
    /** Whether this tag appears to be actively firing */
    isActive: boolean;
    /** Whether this tag had any errors */
    hasErrors: boolean;
    /** Error details if any */
    errors?: string[];
    /** Additional metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Summary statistics for detection
 */
export interface DetectionSummary {
    /** Total tags detected */
    totalTags: number;
    /** Tags by category */
    byCategory: Record<TagCategory, number>;
    /** Tags by platform */
    byPlatform: Record<string, number>;
    /** Tags by load method */
    byLoadMethod: Record<LoadMethod, number>;
    /** Number of high-confidence detections */
    highConfidenceCount: number;
    /** Number of low-confidence detections */
    lowConfidenceCount: number;
    /** Number of unknown/custom tags */
    unknownTagCount: number;
    /** Whether a TMS was detected */
    hasTMS: boolean;
    /** Which TMS(es) were detected */
    detectedTMS: string[];
}
/**
 * Complete detection result
 */
export interface TagDetectionResult {
    /** Unique detection run ID */
    id: string;
    /** Scan ID this detection was based on */
    scanId: string;
    /** URL that was scanned */
    url: string;
    /** When detection started */
    startedAt: number;
    /** When detection completed */
    completedAt: number;
    /** Detection duration in ms */
    duration: number;
    /** All detected tag instances */
    tags: TagInstance[];
    /** Summary statistics */
    summary: DetectionSummary;
    /** Which detectors were run */
    detectorsRun: string[];
    /** Any detector errors */
    detectorErrors: Array<{
        detector: string;
        error: string;
    }>;
    /** Detection engine version */
    engineVersion: string;
}
/**
 * Evidence context provided to detectors
 *
 * Normalized view of scan data for easier detection.
 */
export interface EvidenceContext {
    /** Original scan result */
    scan: PageScanResult;
    /** Script URLs (lowercase, for matching) */
    scriptUrls: string[];
    /** Script URL to ScriptTag map */
    scriptsByUrl: Map<string, ScriptTag>;
    /** Inline script contents */
    inlineScripts: Array<{
        content: string;
        tag: ScriptTag;
    }>;
    /** Network request URLs (lowercase) */
    requestUrls: string[];
    /** Request URL to NetworkRequest map */
    requestsByUrl: Map<string, NetworkRequest[]>;
    /** Requests that appear to be analytics-related */
    analyticsRequests: NetworkRequest[];
    /** Data layer events by layer name */
    dataLayerEvents: Map<string, DataLayerEvent[]>;
    /** Cookie names */
    cookieNames: string[];
    /** Cookies by name */
    cookiesByName: Map<string, {
        name: string;
        value: string;
    }>;
    /** Console messages */
    consoleMessages: Array<{
        type: string;
        text: string;
    }>;
    /** Helper: Check if any script URL matches pattern */
    hasScriptMatching: (pattern: string | RegExp) => boolean;
    /** Helper: Check if any request URL matches pattern */
    hasRequestMatching: (pattern: string | RegExp) => boolean;
    /** Helper: Get requests matching pattern */
    getRequestsMatching: (pattern: string | RegExp) => NetworkRequest[];
    /** Helper: Check if cookie exists */
    hasCookie: (name: string | RegExp) => boolean;
    /** Helper: Search inline scripts for pattern */
    searchInlineScripts: (pattern: string | RegExp) => Array<{
        match: string;
        script: ScriptTag;
    }>;
}
/**
 * Tag Detector Interface
 *
 * All platform detectors must implement this interface.
 */
export interface TagDetector {
    /** Unique detector identifier */
    readonly id: string;
    /** Human-readable name */
    readonly name: string;
    /** Platform this detector identifies */
    readonly platform: KnownPlatform | string;
    /** Category of tags this detector finds */
    readonly category: TagCategory;
    /** Detector version */
    readonly version: string;
    /** Priority (higher = runs first, for TMS detection) */
    readonly priority: number;
    /**
     * Quick check if this detector might find something.
     * Used to skip expensive detection for clearly absent platforms.
     * Should be fast and can have false positives.
     */
    mightBePresent(context: EvidenceContext): boolean;
    /**
     * Full detection logic.
     * Returns all detected tag instances for this platform.
     */
    detect(context: EvidenceContext): Promise<TagInstance[]>;
}
/**
 * Detector registration info
 */
export interface DetectorRegistration {
    detector: TagDetector;
    enabled: boolean;
    registeredAt: number;
}
/**
 * URL pattern for matching scripts/requests
 */
export interface UrlPattern {
    /** Pattern to match (string or regex) */
    pattern: string | RegExp;
    /** What this pattern indicates */
    indicates: string;
    /** Confidence if matched (0-1) */
    confidence: number;
    /** Extract capture groups as config */
    extractConfig?: boolean;
    /** Named capture group mappings */
    captureMapping?: Record<string, string>;
}
/**
 * Payload pattern for matching request bodies
 */
export interface PayloadPattern {
    /** Field to check */
    field: string;
    /** Expected value or pattern */
    value: string | RegExp;
    /** What this indicates */
    indicates: string;
    /** Confidence if matched */
    confidence: number;
}
/**
 * Global object pattern
 */
export interface GlobalPattern {
    /** Object path to check (e.g., 'gtag', 'fbq', 's.account') */
    path: string;
    /** Expected type or value pattern */
    expectedType?: 'function' | 'object' | 'array' | 'string';
    /** What this indicates */
    indicates: string;
    /** Confidence if found */
    confidence: number;
}
/**
 * Declarative detector definition
 *
 * Allows defining detectors via configuration rather than code.
 */
export interface DeclarativeDetectorDef {
    id: string;
    name: string;
    platform: KnownPlatform | string;
    category: TagCategory;
    version: string;
    priority?: number;
    /** Patterns for quick presence check */
    presencePatterns: {
        scriptUrls?: string[];
        requestUrls?: string[];
        cookies?: string[];
        globals?: string[];
    };
    /** Detailed detection patterns */
    detection: {
        scriptUrlPatterns?: UrlPattern[];
        requestUrlPatterns?: UrlPattern[];
        payloadPatterns?: PayloadPattern[];
        globalPatterns?: GlobalPattern[];
        inlineScriptPatterns?: Array<{
            pattern: string | RegExp;
            indicates: string;
            confidence: number;
        }>;
    };
    /** How to extract configuration */
    configExtraction?: {
        /** Regex patterns to extract IDs from URLs */
        urlIdPatterns?: Array<{
            pattern: RegExp;
            idField: string;
        }>;
        /** Query parameters that contain IDs */
        queryParamIds?: string[];
        /** Payload fields that contain IDs */
        payloadIdFields?: string[];
    };
}
//# sourceMappingURL=types.d.ts.map