/**
 * Validation Engine Example
 *
 * This example demonstrates how to use the validation engine to validate
 * analytics implementations against declarative rules.
 *
 * Run with: npx ts-node examples/validation.ts
 */

import {
  scanUrl,
  detectTags,
  registerBuiltInDetectors,
  getDefaultRegistry,
  shutdownDefaultBrowserManager,
} from '../src';

import {
  createValidationEngine,
  loadRules,
  type ValidationReport,
  type ValidationResult,
} from '../src/validation';

/**
 * Print validation summary
 */
function printValidationSummary(report: ValidationReport): void {
  console.log('\n' + '='.repeat(80));
  console.log('VALIDATION REPORT');
  console.log('='.repeat(80));

  console.log(`\nReport ID: ${report.id}`);
  console.log(`URL: ${report.url}`);
  console.log(`Environment: ${report.environment}`);
  console.log(`Duration: ${report.duration}ms`);
  console.log(`Rules Loaded: ${report.rulesLoaded.length}`);

  if (report.ruleErrors.length > 0) {
    console.log(`\nRule Loading Errors: ${report.ruleErrors.length}`);
    report.ruleErrors.forEach((err) => {
      console.log(`  - ${err.ruleId || 'unknown'}: ${err.error}`);
    });
  }

  console.log('\n--- Summary ---');
  console.log(`Overall Score: ${report.summary.score}/100`);
  console.log(`Is Valid: ${report.summary.isValid ? 'YES' : 'NO'}`);
  console.log(`Total Rules: ${report.summary.totalRules}`);
  console.log(`Passed: ${report.summary.passed}`);
  console.log(`Failed: ${report.summary.failed}`);
  console.log(`Skipped: ${report.summary.skipped}`);
  console.log(`Errors: ${report.summary.errors}`);

  console.log('\n--- By Severity ---');
  console.log(`Errors: ${report.summary.bySeverity.error}`);
  console.log(`Warnings: ${report.summary.bySeverity.warning}`);
  console.log(`Info: ${report.summary.bySeverity.info}`);

  if (Object.keys(report.summary.byPlatform).length > 0) {
    console.log('\n--- By Platform ---');
    for (const [platform, stats] of Object.entries(report.summary.byPlatform)) {
      console.log(
        `${platform}: ${stats.passed} passed, ${stats.failed} failed, ${stats.warnings} warnings`
      );
    }
  }
}

/**
 * Print validation results
 */
function printValidationResults(results: ValidationResult[]): void {
  if (results.length === 0) {
    console.log('\nNo validation results.');
    return;
  }

  console.log('\n' + '='.repeat(80));
  console.log('VALIDATION RESULTS');
  console.log('='.repeat(80));

  // Group by status
  const failed = results.filter((r) => r.status === 'failed');
  const errors = results.filter((r) => r.status === 'error');
  const passed = results.filter((r) => r.status === 'passed');
  const skipped = results.filter((r) => r.status === 'skipped');

  // Print failures first
  if (failed.length > 0) {
    console.log('\n--- FAILURES ---');
    failed.forEach((result, index) => {
      console.log(`\n[${index + 1}] ${result.ruleName} (${result.severity.toUpperCase()})`);
      console.log(`    Rule ID: ${result.ruleId}`);
      console.log(`    Status: ${result.status}`);
      console.log(`    Message: ${result.message}`);
      if (result.details) {
        console.log(`    Details: ${result.details}`);
      }
      if (result.platform) {
        console.log(`    Platform: ${result.platform}`);
      }
      if (result.suggestion) {
        console.log(`    Suggestion: ${result.suggestion}`);
      }

      // Print key evidence
      if (result.evidence.length > 0) {
        console.log(`    Evidence (${result.evidence.length}):`);
        result.evidence.slice(0, 3).forEach((ev) => {
          const expectedStr = ev.expected !== undefined ? `, expected: ${ev.expected}` : '';
          const actualStr = ev.actual !== undefined ? `, actual: ${ev.actual}` : '';
          console.log(`      - [${ev.type}] ${ev.description}${expectedStr}${actualStr}`);
        });
        if (result.evidence.length > 3) {
          console.log(`      ... and ${result.evidence.length - 3} more`);
        }
      }
    });
  }

  // Print errors
  if (errors.length > 0) {
    console.log('\n--- ERRORS ---');
    errors.forEach((result, index) => {
      console.log(`\n[${index + 1}] ${result.ruleName}`);
      console.log(`    Rule ID: ${result.ruleId}`);
      console.log(`    Error: ${result.error}`);
      console.log(`    Message: ${result.message}`);
    });
  }

  // Print passed (summary only)
  if (passed.length > 0) {
    console.log(`\n--- PASSED (${passed.length}) ---`);
    passed.forEach((result) => {
      console.log(`  ✓ ${result.ruleName}`);
    });
  }

  // Print skipped
  if (skipped.length > 0) {
    console.log(`\n--- SKIPPED (${skipped.length}) ---`);
    skipped.forEach((result) => {
      console.log(`  - ${result.ruleName}: ${result.message}`);
    });
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const url = process.argv[2] || 'https://www.google.com';

  console.log('Analytics Validation Tool - Validation Example');
  console.log('='.repeat(80));
  console.log(`Target URL: ${url}\n`);

  try {
    // Step 1: Scan the page
    console.log('--- Step 1: Scanning Page ---');
    const scanResult = await scanUrl(url, {
      timeout: 60000,
      waitUntil: 'networkidle',
      additionalWaitTime: 2000,
    });

    console.log(`Scan complete: ${scanResult.success ? 'SUCCESS' : 'FAILED'}`);
    if (!scanResult.success) {
      console.error(`Error: ${scanResult.error}`);
      return;
    }

    // Step 2: Detect tags
    console.log('\n--- Step 2: Detecting Tags ---');
    const registry = getDefaultRegistry();
    registerBuiltInDetectors(registry);

    const detectionResult = await detectTags(scanResult);
    console.log(`Found ${detectionResult.tags.length} tags`);
    detectionResult.tags.forEach((tag) => {
      console.log(`  - ${tag.platformName} (${(tag.confidence * 100).toFixed(0)}%)`);
    });

    // Step 3: Load validation rules
    console.log('\n--- Step 3: Loading Validation Rules ---');
    const { rules, errors } = await loadRules({
      sources: [
        {
          type: 'directory',
          path: './rules',
          pattern: '.*\\.yaml$',
        },
      ],
      environment: 'production',
      validateSchema: true,
    });

    console.log(`Loaded ${rules.length} rules`);
    if (errors.length > 0) {
      console.log(`Rule loading errors: ${errors.length}`);
      errors.forEach((err) => {
        console.log(`  - ${err.source}: ${err.error}`);
      });
    }

    // Step 4: Create validation engine and run validation
    console.log('\n--- Step 4: Running Validation ---');
    const engine = createValidationEngine('production');

    const report = await engine.validate(scanResult, detectionResult, rules);

    // Print results
    printValidationSummary(report);
    printValidationResults(report.results);

    // Output full JSON
    console.log('\n\n--- Full Validation Report JSON (first 5000 chars) ---');
    const json = JSON.stringify(report, null, 2);
    console.log(json.substring(0, 5000));
    if (json.length > 5000) {
      console.log(`\n... (${json.length - 5000} more characters)`);
    }

    // Exit with error code if validation failed
    if (!report.summary.isValid) {
      console.log('\n⚠️  VALIDATION FAILED');
      process.exit(1);
    } else {
      console.log('\n✓ VALIDATION PASSED');
    }
  } catch (error) {
    console.error('Validation failed:', error);
    process.exit(1);
  } finally {
    // Clean up
    await shutdownDefaultBrowserManager();
    console.log('\nBrowser manager shut down.');
  }
}

// Run
main().catch(console.error);
