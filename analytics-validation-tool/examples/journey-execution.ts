/**
 * Journey Execution Example
 *
 * Demonstrates how to execute user journeys with analytics validation.
 */

import {
  loadJourneys,
  createJourneyEngine,
  getDefaultActionRegistry,
} from '../src/journey';
import { loadRules } from '../src/validation';
import { ReportBuilder, ConsoleFormatter } from '../src/reporting';
import type { JourneyResult } from '../src/journey/types';
import type { PageReportInput } from '../src/reporting/types';

/**
 * Main execution function
 */
async function main() {
  const startTime = Date.now();

  console.log('════════════════════════════════════════════════════════');
  console.log('  JOURNEY EXECUTION EXAMPLE');
  console.log('════════════════════════════════════════════════════════\n');

  try {
    // 1. Load journeys from directory
    console.log('📂 Loading journeys...');
    const { journeys, errors: journeyErrors } = await loadJourneys({
      sources: [
        {
          type: 'directory',
          path: './journeys',
          pattern: /\.yaml$/,
        },
      ],
    });

    if (journeyErrors.length > 0) {
      console.error('⚠️  Journey loading errors:');
      journeyErrors.forEach((err) => {
        console.error(`   - ${err.source}: ${err.error}`);
      });
    }

    console.log(`✓ Loaded ${journeys.length} journeys\n`);

    // 2. Load validation rules
    console.log('📋 Loading validation rules...');
    const { rules, errors: ruleErrors } = await loadRules({
      sources: [
        { type: 'directory', path: './rules/ga4' },
        { type: 'directory', path: './rules/consent' },
      ],
    });

    if (ruleErrors.length > 0) {
      console.error('⚠️  Rule loading errors:');
      ruleErrors.forEach((err) => {
        console.error(`   - ${err.source}: ${err.error}`);
      });
    }

    console.log(`✓ Loaded ${rules.length} validation rules\n`);

    // 3. Create journey engine
    console.log('🚀 Initializing journey engine...');
    const actionRegistry = getDefaultActionRegistry();
    const journeyEngine = createJourneyEngine(
      {
        environment: 'production',
        headless: true,
        viewport: { width: 1280, height: 720 },
      },
      actionRegistry
    );
    console.log('✓ Journey engine initialized\n');

    // 4. Execute journeys
    const journeyResults: JourneyResult[] = [];

    for (const journey of journeys) {
      console.log(`\n${'═'.repeat(60)}`);
      console.log(`🎯 Executing Journey: ${journey.name}`);
      console.log(`   ID: ${journey.id}`);
      console.log(`   Steps: ${journey.steps.length}`);
      console.log(`${'─'.repeat(60)}\n`);

      try {
        const result = await journeyEngine.execute(journey, rules);
        journeyResults.push(result);

        // Print step results
        console.log(`\n📊 Journey Results:`);
        console.log(`   Status: ${getStatusIcon(result.status)} ${result.status.toUpperCase()}`);
        console.log(`   Steps Completed: ${result.summary.stepsCompleted}/${result.summary.totalSteps}`);
        console.log(`   Actions Completed: ${result.summary.actionsCompleted}/${result.summary.totalActions}`);
        if (result.summary.overallScore !== undefined) {
          console.log(`   Overall Score: ${result.summary.overallScore}/100`);
        }
        console.log(`   Duration: ${(result.duration / 1000).toFixed(2)}s`);

        // Print step details
        console.log(`\n📝 Step Details:`);
        result.steps.forEach((step, idx) => {
          const statusIcon = getStatusIcon(step.status);
          console.log(`   ${idx + 1}. ${statusIcon} ${step.stepName}`);
          console.log(`      Actions: ${step.actions.filter(a => a.status === 'success').length}/${step.actions.length} succeeded`);

          if (step.validation) {
            const v = step.validation;
            console.log(`      Validation: ${v.summary.isValid ? '✓' : '✗'} Score: ${v.summary.score}/100`);
            if (v.summary.issues.total > 0) {
              console.log(`      Issues: ${v.summary.issues.total} (${v.summary.issues.error} errors, ${v.summary.issues.warning} warnings)`);
            }
          }

          if (step.error) {
            console.log(`      ❌ Error: ${step.error}`);
          }
        });

        if (result.status === 'success') {
          console.log('\n✅ Journey completed successfully!');
        } else if (result.status === 'failed') {
          console.log('\n❌ Journey failed!');
        } else {
          console.log('\n⚠️  Journey partially completed');
        }

      } catch (error) {
        console.error(`\n❌ Journey execution failed:`);
        console.error(`   ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // 5. Generate aggregate report
    if (journeyResults.length > 0) {
      console.log(`\n\n${'═'.repeat(60)}`);
      console.log('📊 AGGREGATE JOURNEY REPORT');
      console.log(`${'═'.repeat(60)}\n`);

      const reportBuilder = new ReportBuilder();

      // Build page reports from journey results
      const pageReports: PageReportInput[] = journeyResults.flatMap((journeyResult) =>
        journeyResult.steps
          .filter((step) => step.scan && step.detection)
          .map((step) => ({
            scan: step.scan!,
            detection: step.detection!,
            validation: step.validation,
          }))
      );

      const runReport = reportBuilder.buildRunReport(pageReports);

      // Format and output
      const consoleFormatter = new ConsoleFormatter({ useColors: true });
      const formattedReport = consoleFormatter.formatRun(runReport);
      console.log(formattedReport);

      // Summary
      const totalDuration = Date.now() - startTime;
      console.log(`\n${'═'.repeat(60)}`);
      console.log(`Total execution time: ${(totalDuration / 1000).toFixed(2)}s`);
      console.log(`Journeys executed: ${journeyResults.length}`);
      console.log(`Successful: ${journeyResults.filter(j => j.status === 'success').length}`);
      console.log(`Failed: ${journeyResults.filter(j => j.status === 'failed').length}`);
      console.log(`Partial: ${journeyResults.filter(j => j.status === 'partial').length}`);
      console.log(`${'═'.repeat(60)}\n`);
    }

  } catch (error) {
    console.error('\n❌ Fatal error:');
    console.error(error);
    process.exit(1);
  }
}

/**
 * Get status icon
 */
function getStatusIcon(status: string): string {
  switch (status) {
    case 'success':
      return '✓';
    case 'failed':
      return '✗';
    case 'partial':
      return '⚠';
    default:
      return '○';
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}
