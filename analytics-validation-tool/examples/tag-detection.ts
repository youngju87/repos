/**
 * Tag Detection Example
 *
 * This example demonstrates how to use the tag detection layer
 * to identify analytics and marketing tags from a scan.
 *
 * Run with: npx ts-node examples/tag-detection.ts
 */

import {
  scanUrl,
  detectTags,
  registerBuiltInDetectors,
  getDefaultRegistry,
  shutdownDefaultBrowserManager,
  type PageScanResult,
  type TagDetectionResult,
  type TagInstance,
} from '../src';

/**
 * Print detection summary
 */
function printDetectionSummary(result: TagDetectionResult): void {
  console.log('\n' + '='.repeat(80));
  console.log('TAG DETECTION SUMMARY');
  console.log('='.repeat(80));

  console.log(`\nDetection ID: ${result.id}`);
  console.log(`Scan ID: ${result.scanId}`);
  console.log(`URL: ${result.url}`);
  console.log(`Detection Duration: ${result.duration}ms`);
  console.log(`Detectors Run: ${result.detectorsRun.length}`);

  if (result.detectorErrors.length > 0) {
    console.log(`\nDetector Errors: ${result.detectorErrors.length}`);
    result.detectorErrors.forEach((err) => {
      console.log(`  - ${err.detector}: ${err.error}`);
    });
  }

  console.log('\n--- Overall Summary ---');
  console.log(`Total Tags Detected: ${result.summary.totalTags}`);
  console.log(`High Confidence: ${result.summary.highConfidenceCount}`);
  console.log(`Low Confidence: ${result.summary.lowConfidenceCount}`);
  console.log(`Unknown Tags: ${result.summary.unknownTagCount}`);
  console.log(`Has TMS: ${result.summary.hasTMS}`);
  if (result.summary.hasTMS) {
    console.log(`Detected TMS: ${result.summary.detectedTMS.join(', ')}`);
  }

  console.log('\n--- By Category ---');
  for (const [category, count] of Object.entries(result.summary.byCategory)) {
    if (count > 0) {
      console.log(`${category}: ${count}`);
    }
  }

  console.log('\n--- By Platform ---');
  for (const [platform, count] of Object.entries(result.summary.byPlatform)) {
    console.log(`${platform}: ${count}`);
  }

  console.log('\n--- By Load Method ---');
  for (const [method, count] of Object.entries(result.summary.byLoadMethod)) {
    if (count > 0) {
      console.log(`${method}: ${count}`);
    }
  }
}

/**
 * Print detailed tag information
 */
function printTagDetails(tags: TagInstance[]): void {
  if (tags.length === 0) {
    console.log('\nNo tags detected.');
    return;
  }

  console.log('\n' + '='.repeat(80));
  console.log('DETECTED TAGS (DETAILED)');
  console.log('='.repeat(80));

  tags.forEach((tag, index) => {
    console.log(`\n[${index + 1}] ${tag.platformName}`);
    console.log(`    Platform: ${tag.platform}`);
    console.log(`    Category: ${tag.category}`);
    console.log(`    Confidence: ${(tag.confidence * 100).toFixed(1)}%`);
    console.log(`    Load Method: ${tag.loadMethod}`);
    if (tag.loadedVia) {
      console.log(`    Loaded Via: ${tag.loadedVia}`);
    }
    console.log(`    Active: ${tag.isActive}`);
    console.log(`    Has Errors: ${tag.hasErrors}`);

    // Configuration
    if (tag.config.primaryId) {
      console.log(`    Primary ID: ${tag.config.primaryId}`);
    }
    if (tag.config.additionalIds && tag.config.additionalIds.length > 0) {
      console.log(`    Additional IDs: ${tag.config.additionalIds.join(', ')}`);
    }
    if (tag.config.enabledFeatures && tag.config.enabledFeatures.length > 0) {
      console.log(`    Features: ${tag.config.enabledFeatures.join(', ')}`);
    }

    // Evidence summary
    console.log(`    Detection Methods: ${tag.detectionMethods.join(', ')}`);
    console.log(`    Evidence Count: ${tag.evidence.length}`);

    // URLs
    if (tag.scriptUrls.length > 0) {
      console.log(`    Script URLs (${tag.scriptUrls.length}):`);
      tag.scriptUrls.slice(0, 3).forEach((url) => {
        console.log(`      - ${url.substring(0, 80)}${url.length > 80 ? '...' : ''}`);
      });
      if (tag.scriptUrls.length > 3) {
        console.log(`      ... and ${tag.scriptUrls.length - 3} more`);
      }
    }

    if (tag.endpoints.length > 0) {
      console.log(`    Endpoints (${tag.endpoints.length}):`);
      tag.endpoints.slice(0, 3).forEach((endpoint) => {
        console.log(`      - ${endpoint}`);
      });
      if (tag.endpoints.length > 3) {
        console.log(`      ... and ${tag.endpoints.length - 3} more`);
      }
    }

    // Top evidence
    if (tag.evidence.length > 0) {
      console.log(`    Top Evidence:`);
      const topEvidence = [...tag.evidence]
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);

      topEvidence.forEach((ev) => {
        console.log(
          `      - [${ev.method}] ${ev.matched}: ${ev.value.substring(0, 50)}${ev.value.length > 50 ? '...' : ''} (conf: ${(ev.confidence * 100).toFixed(0)}%)`
        );
      });
    }
  });
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const url = process.argv[2] || 'https://www.google.com';

  console.log('Analytics Validation Tool - Tag Detection Example');
  console.log('='.repeat(80));
  console.log(`Target URL: ${url}\n`);

  try {
    // Register all built-in detectors
    const registry = getDefaultRegistry();
    registerBuiltInDetectors(registry);

    console.log('Registered detectors:');
    registry.getEnabledIds().forEach((id) => {
      console.log(`  - ${id}`);
    });

    // Scan the page
    console.log('\n--- Scanning Page ---');
    const scanResult: PageScanResult = await scanUrl(url, {
      timeout: 60000,
      waitUntil: 'networkidle',
      additionalWaitTime: 2000,
    });

    console.log(`Scan complete: ${scanResult.success ? 'SUCCESS' : 'FAILED'}`);
    if (!scanResult.success) {
      console.error(`Error: ${scanResult.error}`);
      return;
    }

    console.log(`Found ${scanResult.summary.totalRequests} requests`);
    console.log(`Found ${scanResult.summary.analyticsRequests} analytics requests`);
    console.log(`Found ${scanResult.scripts.length} scripts`);

    // Detect tags
    console.log('\n--- Detecting Tags ---');
    const detectionResult: TagDetectionResult = await detectTags(scanResult, {
      debug: true,
      minConfidence: 0.1,
    });

    // Print results
    printDetectionSummary(detectionResult);
    printTagDetails(detectionResult.tags);

    // Output full JSON
    console.log('\n\n--- Full Detection Result JSON (first 5000 chars) ---');
    const json = JSON.stringify(detectionResult, null, 2);
    console.log(json.substring(0, 5000));
    if (json.length > 5000) {
      console.log(`\n... (${json.length - 5000} more characters)`);
    }
  } catch (error) {
    console.error('Detection failed:', error);
  } finally {
    // Clean up
    await shutdownDefaultBrowserManager();
    console.log('\nBrowser manager shut down.');
  }
}

// Run
main().catch(console.error);
