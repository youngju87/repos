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
import type {
  TagDetectionResult,
  TagInstance,
  DetectionSummary,
  TagCategory,
  LoadMethod,
  EvidenceContext,
} from './types';
import { generateId } from '../types';
import { DetectorRegistry, getDefaultRegistry } from './DetectorRegistry';
import { buildEvidenceContext } from './EvidenceExtractor';
import { Timer } from '../core/utils/timing';

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

const DEFAULT_CONFIG: Required<DetectionEngineConfig> = {
  registry: getDefaultRegistry(),
  detectorTimeout: 5000,
  detectUnknown: true,
  minConfidence: 0.1,
  debug: false,
};

/**
 * Detection Engine Class
 */
export class DetectionEngine {
  private config: Required<DetectionEngineConfig>;
  private readonly version = '1.0.0';

  constructor(config: DetectionEngineConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Detect tags from a page scan result
   */
  async detect(scan: PageScanResult): Promise<TagDetectionResult> {
    const timer = new Timer();
    const detectionId = generateId();

    if (this.config.debug) {
      console.log(`[DetectionEngine] Starting detection for scan: ${scan.id}`);
    }

    // Build evidence context
    timer.mark('evidence-start');
    const evidence = buildEvidenceContext(scan);
    timer.mark('evidence-complete');

    if (this.config.debug) {
      console.log(`[DetectionEngine] Evidence context built in ${timer.between('evidence-start', 'evidence-complete')}ms`);
      console.log(`[DetectionEngine] Found ${evidence.scriptUrls.length} scripts, ${evidence.requestUrls.length} requests`);
    }

    // Get enabled detectors sorted by priority
    const detectors = this.config.registry.getEnabledByPriority();

    if (this.config.debug) {
      console.log(`[DetectionEngine] Running ${detectors.length} detectors`);
    }

    // Run all detectors
    timer.mark('detection-start');
    const detectionResults: TagInstance[] = [];
    const detectorsRun: string[] = [];
    const detectorErrors: Array<{ detector: string; error: string }> = [];

    for (const detector of detectors) {
      try {
        // Quick presence check first
        if (!detector.mightBePresent(evidence)) {
          if (this.config.debug) {
            console.log(`[DetectionEngine] Skipping ${detector.id} (not present)`);
          }
          continue;
        }

        detectorsRun.push(detector.id);

        if (this.config.debug) {
          console.log(`[DetectionEngine] Running detector: ${detector.id}`);
        }

        // Run detection with timeout
        const instances = await this.runDetectorWithTimeout(detector, evidence);

        // Filter by minimum confidence
        const filtered = instances.filter(
          (instance) => instance.confidence >= this.config.minConfidence
        );

        if (this.config.debug) {
          console.log(`[DetectionEngine] ${detector.id} found ${instances.length} instances (${filtered.length} above threshold)`);
        }

        detectionResults.push(...filtered);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        detectorErrors.push({
          detector: detector.id,
          error: errorMsg,
        });

        if (this.config.debug) {
          console.error(`[DetectionEngine] Detector ${detector.id} failed:`, error);
        }
      }
    }

    timer.mark('detection-complete');

    // Deduplicate and merge results
    timer.mark('merge-start');
    const mergedTags = this.deduplicateTags(detectionResults);
    timer.mark('merge-complete');

    if (this.config.debug) {
      console.log(`[DetectionEngine] Merged ${detectionResults.length} instances into ${mergedTags.length} unique tags`);
    }

    // Calculate summary
    const summary = this.calculateSummary(mergedTags);

    const result: TagDetectionResult = {
      id: detectionId,
      scanId: scan.id,
      url: scan.url,
      startedAt: timer.getStartTimestamp(),
      completedAt: Date.now(),
      duration: timer.elapsed(),
      tags: mergedTags,
      summary,
      detectorsRun,
      detectorErrors,
      engineVersion: this.version,
    };

    if (this.config.debug) {
      console.log(`[DetectionEngine] Detection complete in ${result.duration}ms`);
      console.log(`[DetectionEngine] Found ${result.tags.length} tags`);
    }

    return result;
  }

  /**
   * Run a detector with timeout protection
   */
  private async runDetectorWithTimeout(
    detector: { id: string; detect: (evidence: EvidenceContext) => Promise<TagInstance[]> },
    evidence: EvidenceContext
  ): Promise<TagInstance[]> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Detector timeout after ${this.config.detectorTimeout}ms`));
      }, this.config.detectorTimeout);

      detector
        .detect(evidence)
        .then((instances) => {
          clearTimeout(timeoutId);
          resolve(instances);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Deduplicate and merge tag instances
   *
   * Tags are considered duplicates if they have the same platform.
   * When duplicates are found, their evidence is merged.
   */
  private deduplicateTags(instances: TagInstance[]): TagInstance[] {
    const byPlatform = new Map<string, TagInstance[]>();

    // Group by platform
    for (const instance of instances) {
      const existing = byPlatform.get(instance.platform) || [];
      existing.push(instance);
      byPlatform.set(instance.platform, existing);
    }

    const merged: TagInstance[] = [];

    // Merge instances for each platform
    for (const [platform, platformInstances] of byPlatform) {
      if (platformInstances.length === 1) {
        merged.push(platformInstances[0]);
      } else {
        // Merge multiple instances
        const mergedInstance = this.mergeInstances(platformInstances);
        merged.push(mergedInstance);
      }
    }

    // Sort by confidence descending, then by first seen
    return merged.sort((a, b) => {
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }
      return a.firstSeenAt - b.firstSeenAt;
    });
  }

  /**
   * Merge multiple instances of the same platform
   */
  private mergeInstances(instances: TagInstance[]): TagInstance {
    if (instances.length === 0) {
      throw new Error('Cannot merge empty instances array');
    }

    if (instances.length === 1) {
      return instances[0];
    }

    // Use first instance as base
    const base = instances[0];

    // Collect all unique values
    const allMethods = new Set(base.detectionMethods);
    const allEvidence = [...base.evidence];
    const allScriptUrls = new Set(base.scriptUrls);
    const allEndpoints = new Set(base.endpoints);
    const allRequestIds = new Set(base.networkRequestIds);
    const allDataLayerIds = new Set(base.dataLayerEventIds);
    const allErrors: string[] = base.errors ? [...base.errors] : [];

    let minTimestamp = base.firstSeenAt;
    let maxTimestamp = base.lastSeenAt;
    let hasActive = base.isActive;
    let hasErrors = base.hasErrors;

    // Merge configuration - prefer instances with IDs
    const configs = instances.map((i) => i.config);
    const primaryConfig = configs.find((c) => c.primaryId) || base.config;

    // Collect all IDs
    const allPrimaryIds = new Set<string>();
    const allAdditionalIds = new Set<string>();

    for (const config of configs) {
      if (config.primaryId) allPrimaryIds.add(config.primaryId);
      if (config.additionalIds) {
        for (const id of config.additionalIds) {
          allAdditionalIds.add(id);
        }
      }
    }

    // Merge other instances
    for (let i = 1; i < instances.length; i++) {
      const instance = instances[i];

      // Methods
      for (const method of instance.detectionMethods) {
        allMethods.add(method);
      }

      // Evidence
      allEvidence.push(...instance.evidence);

      // URLs and IDs
      for (const url of instance.scriptUrls) allScriptUrls.add(url);
      for (const endpoint of instance.endpoints) allEndpoints.add(endpoint);
      for (const id of instance.networkRequestIds) allRequestIds.add(id);
      for (const id of instance.dataLayerEventIds) allDataLayerIds.add(id);

      // Timestamps
      minTimestamp = Math.min(minTimestamp, instance.firstSeenAt);
      maxTimestamp = Math.max(maxTimestamp, instance.lastSeenAt);

      // Status
      hasActive = hasActive || instance.isActive;
      hasErrors = hasErrors || instance.hasErrors;

      if (instance.errors) {
        allErrors.push(...instance.errors);
      }
    }

    // Calculate combined confidence
    const confidence = this.calculateCombinedConfidence(allEvidence);

    // Build merged config
    const mergedConfig = {
      ...primaryConfig,
      primaryId: allPrimaryIds.size > 0 ? Array.from(allPrimaryIds)[0] : undefined,
      additionalIds:
        allPrimaryIds.size > 1
          ? [...Array.from(allPrimaryIds).slice(1), ...Array.from(allAdditionalIds)]
          : Array.from(allAdditionalIds),
    };

    // Determine load method (prefer more specific)
    const loadMethod = this.selectBestLoadMethod(instances.map((i) => i.loadMethod));

    return {
      ...base,
      detectionMethods: Array.from(allMethods),
      evidence: allEvidence,
      scriptUrls: Array.from(allScriptUrls),
      endpoints: Array.from(allEndpoints),
      networkRequestIds: Array.from(allRequestIds),
      dataLayerEventIds: Array.from(allDataLayerIds),
      firstSeenAt: minTimestamp,
      lastSeenAt: maxTimestamp,
      isActive: hasActive,
      hasErrors: hasErrors,
      errors: allErrors.length > 0 ? allErrors : undefined,
      config: mergedConfig,
      confidence,
    };
  }

  /**
   * Calculate combined confidence from evidence list
   */
  private calculateCombinedConfidence(
    evidence: Array<{ confidence: number }>
  ): number {
    if (evidence.length === 0) return 0;

    // Sort by confidence descending
    const sorted = [...evidence].sort((a, b) => b.confidence - a.confidence);

    // Use diminishing returns formula
    let combined = 0;
    let remaining = 1;

    for (const ev of sorted) {
      const contribution = ev.confidence * remaining;
      combined += contribution;
      remaining *= 1 - ev.confidence * 0.5;
    }

    return Math.min(combined, 1);
  }

  /**
   * Select the most specific load method
   */
  private selectBestLoadMethod(methods: LoadMethod[]): LoadMethod {
    const priority: LoadMethod[] = [
      'gtm',
      'adobe-launch',
      'tealium',
      'segment',
      'other-tms',
      'direct',
      'dynamic',
      'unknown',
    ];

    for (const method of priority) {
      if (methods.includes(method)) {
        return method;
      }
    }

    return 'unknown';
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(tags: TagInstance[]): DetectionSummary {
    const byCategory: Record<TagCategory, number> = {
      analytics: 0,
      'tag-manager': 0,
      advertising: 0,
      social: 0,
      'session-recording': 0,
      heatmap: 0,
      'ab-testing': 0,
      personalization: 0,
      cdp: 0,
      chat: 0,
      crm: 0,
      email: 0,
      consent: 0,
      'error-tracking': 0,
      performance: 0,
      custom: 0,
      other: 0,
    };

    const byPlatform: Record<string, number> = {};
    const byLoadMethod: Record<LoadMethod, number> = {
      direct: 0,
      gtm: 0,
      'adobe-launch': 0,
      tealium: 0,
      segment: 0,
      'other-tms': 0,
      dynamic: 0,
      unknown: 0,
    };

    let highConfidenceCount = 0;
    let lowConfidenceCount = 0;
    let unknownTagCount = 0;
    const detectedTMS: string[] = [];

    for (const tag of tags) {
      // Category
      byCategory[tag.category]++;

      // Platform
      byPlatform[tag.platform] = (byPlatform[tag.platform] || 0) + 1;

      // Load method
      byLoadMethod[tag.loadMethod]++;

      // Confidence
      if (tag.confidence >= 0.75) {
        highConfidenceCount++;
      } else if (tag.confidence < 0.4) {
        lowConfidenceCount++;
      }

      // Unknown tags
      if (tag.platform === 'unknown') {
        unknownTagCount++;
      }

      // TMS detection
      if (tag.category === 'tag-manager' && !detectedTMS.includes(tag.platform)) {
        detectedTMS.push(tag.platform);
      }
    }

    return {
      totalTags: tags.length,
      byCategory,
      byPlatform,
      byLoadMethod,
      highConfidenceCount,
      lowConfidenceCount,
      unknownTagCount,
      hasTMS: detectedTMS.length > 0,
      detectedTMS,
    };
  }
}

/**
 * Convenience function to detect tags from a scan
 */
export async function detectTags(
  scan: PageScanResult,
  config?: DetectionEngineConfig
): Promise<TagDetectionResult> {
  const engine = new DetectionEngine(config);
  return engine.detect(scan);
}
