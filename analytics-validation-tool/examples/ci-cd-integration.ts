/**
 * CI/CD Integration Example
 *
 * Complete example of using the validation tool in a CI/CD pipeline.
 *
 * Run with: npx ts-node examples/ci-cd-integration.ts
 */

import { promises as fs } from 'fs';
import { scanUrl } from '../src/core';
import { detectTags, registerBuiltInDetectors, getDefaultRegistry } from '../src/detection';
import { createValidationEngine, loadRules } from '../src/validation';
import {
  createReportBuilder,
  JSONFormatter,
  MarkdownFormatter,
  ConsoleFormatter,
  AlertManager,
  SlackDispatcher,
  WebhookDispatcher,
  getExitCode,
  type PageReportInput,
  type RunThresholds,
  type AlertConfig,
} from '../src/reporting';
import { shutdownDefaultBrowserManager } from '../src';

/**
 * Main CI/CD validation function
 */
async function runValidation(): Promise<void> {
  const urls = process.argv.slice(2);
  if (urls.length === 0) {
    console.error('Usage: npx ts-node examples/ci-cd-integration.ts <url1> [url2] [...]');
    process.exit(2);
  }

  console.log('Analytics Validation - CI/CD Integration');
  console.log('='.repeat(80));
  console.log(`Target URLs: ${urls.join(', ')}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log('');

  try {
    // Step 1: Initialize detectors and validation engine
    console.log('[1/6] Initializing...');
    const registry = getDefaultRegistry();
    registerBuiltInDetectors(registry);
    const validationEngine = createValidationEngine(
      process.env.NODE_ENV || 'production'
    );

    // Step 2: Load validation rules
    console.log('[2/6] Loading validation rules...');
    const { rules, errors } = await loadRules({
      sources: [
        {
          type: 'directory',
          path: './rules',
          pattern: '.*\\.yaml$',
        },
      ],
      environment: (process.env.NODE_ENV as any) || 'production',
      validateSchema: true,
    });

    console.log(`Loaded ${rules.length} rules`);
    if (errors.length > 0) {
      console.warn(`Rule loading errors: ${errors.length}`);
      errors.forEach((err) => {
        console.warn(`  - ${err.source}: ${err.error}`);
      });
    }
    console.log('');

    // Step 3: Scan and validate all URLs
    console.log('[3/6] Scanning and validating pages...');
    const pageInputs: PageReportInput[] = [];

    for (const url of urls) {
      console.log(`  Scanning: ${url}`);

      // Scan
      const scanResult = await scanUrl(url, {
        timeout: 60000,
        waitUntil: 'networkidle',
        additionalWaitTime: 2000,
      });

      if (!scanResult.success) {
        console.error(`  ✗ Scan failed: ${scanResult.error}`);
        continue;
      }

      // Detect tags
      const detectionResult = await detectTags(scanResult);
      console.log(`  ✓ Found ${detectionResult.tags.length} tags`);

      // Validate
      const validationReport = await validationEngine.validate(
        scanResult,
        detectionResult,
        rules
      );
      console.log(
        `  ✓ Validation score: ${validationReport.summary.score}/100 (${validationReport.summary.failed} failed)`
      );

      pageInputs.push({
        scan: scanResult,
        detection: detectionResult,
        validation: validationReport,
      });
    }
    console.log('');

    // Step 4: Build report
    console.log('[4/6] Building report...');

    const thresholds: RunThresholds = {
      maxErrors: process.env.MAX_ERRORS ? parseInt(process.env.MAX_ERRORS) : undefined,
      maxWarnings: process.env.MAX_WARNINGS ? parseInt(process.env.MAX_WARNINGS) : undefined,
      minScore: process.env.MIN_SCORE ? parseInt(process.env.MIN_SCORE) : 70,
      failOnWarnings: process.env.FAIL_ON_WARNINGS === 'true',
    };

    const reportBuilder = createReportBuilder({
      environment: process.env.NODE_ENV || 'production',
      thresholds,
      toolVersion: '1.0.0',
    });

    const report = reportBuilder.buildRunReport(pageInputs);

    console.log(`Status: ${report.status}`);
    console.log(`Overall Score: ${report.summary.overallScore}/100`);
    console.log(
      `Issues: ${report.summary.issues.total} (${report.summary.issues.error} errors, ${report.summary.issues.warning} warnings)`
    );
    console.log('');

    // Step 5: Output reports
    console.log('[5/6] Generating reports...');

    // Console output
    const consoleFormatter = new ConsoleFormatter({ useColors: true, verbose: false });
    console.log(consoleFormatter.formatRun(report));

    // JSON output
    const jsonFormatter = new JSONFormatter({ prettyPrint: true });
    await fs.writeFile(
      'analytics-report.json',
      jsonFormatter.formatRun(report),
      'utf-8'
    );
    console.log('✓ Saved: analytics-report.json');

    // Markdown output
    const markdownFormatter = new MarkdownFormatter();
    await fs.writeFile(
      'analytics-report.md',
      markdownFormatter.formatRun(report),
      'utf-8'
    );
    console.log('✓ Saved: analytics-report.md');
    console.log('');

    // Step 6: Send alerts (if configured)
    console.log('[6/6] Processing alerts...');

    const alertManager = new AlertManager();

    // Slack alerts (if webhook configured)
    if (process.env.SLACK_WEBHOOK_URL) {
      const slackDispatcher = new SlackDispatcher({
        webhookUrl: process.env.SLACK_WEBHOOK_URL,
        username: 'Analytics Validation',
        iconEmoji: ':mag:',
      });

      alertManager.registerDispatcher(slackDispatcher);

      const slackConfig: AlertConfig = {
        type: 'slack',
        threshold: {
          minSeverity: 'error',
          minIssueCount: 1,
        },
        config: {
          webhookUrl: process.env.SLACK_WEBHOOK_URL,
        },
        enabled: true,
      };

      alertManager.addAlertConfig(slackConfig);
    }

    // Generic webhook alerts (if configured)
    if (process.env.WEBHOOK_URL) {
      const webhookDispatcher = new WebhookDispatcher({
        url: process.env.WEBHOOK_URL,
        method: 'POST',
        headers: {
          'X-Custom-Header': 'analytics-validation',
        },
      });

      alertManager.registerDispatcher(webhookDispatcher);

      const webhookConfig: AlertConfig = {
        type: 'webhook',
        threshold: {
          minSeverity: 'error',
          minIssueCount: 1,
        },
        config: {
          url: process.env.WEBHOOK_URL,
        },
        enabled: true,
      };

      alertManager.addAlertConfig(webhookConfig);
    }

    await alertManager.processAlerts(report);
    console.log('✓ Alerts processed');
    console.log('');

    // Exit with appropriate code
    const exitCode = getExitCode(report.status, thresholds.failOnWarnings || false);

    console.log('='.repeat(80));
    if (exitCode === 0) {
      console.log('✅ Validation PASSED');
    } else {
      console.log('❌ Validation FAILED');
    }
    console.log('='.repeat(80));

    process.exit(exitCode);
  } catch (error) {
    console.error('Validation failed with error:', error);
    process.exit(2);
  } finally {
    await shutdownDefaultBrowserManager();
  }
}

// Run
runValidation().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(2);
});
