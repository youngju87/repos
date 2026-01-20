/**
 * Basic Scan Example
 *
 * This example demonstrates how to use the Analytics Validation Tool
 * to scan a webpage and collect analytics data.
 *
 * Run with: npx ts-node examples/basic-scan.ts
 */

import {
  PageScanner,
  BrowserManager,
  shutdownDefaultBrowserManager,
  createDesktopOptions,
  createMobileOptions,
  type PageScanResult,
  type NetworkRequest,
  type ScriptTag,
} from '../src';

/**
 * Print a summary of the scan result
 */
function printScanSummary(result: PageScanResult): void {
  console.log('\n' + '='.repeat(80));
  console.log('SCAN SUMMARY');
  console.log('='.repeat(80));

  console.log(`\nURL: ${result.url}`);
  console.log(`Final URL: ${result.finalUrl}`);
  console.log(`Success: ${result.success}`);
  console.log(`HTTP Status: ${result.httpStatus || 'N/A'}`);
  console.log(`Page Title: ${result.pageTitle || 'N/A'}`);
  console.log(`Scan Duration: ${result.timings.scanDuration}ms`);

  if (result.error) {
    console.log(`\nError: ${result.error}`);
    return;
  }

  console.log('\n--- Statistics ---');
  console.log(`Total Requests: ${result.summary.totalRequests}`);
  console.log(`  - Failed: ${result.summary.failedRequests}`);
  console.log(`  - Analytics: ${result.summary.analyticsRequests}`);
  console.log(`Total Scripts: ${result.summary.totalScripts}`);
  console.log(`  - External: ${result.summary.externalScripts}`);
  console.log(`  - Inline: ${result.summary.inlineScripts}`);
  console.log(`  - Dynamic: ${result.summary.dynamicScripts}`);
  console.log(`Data Layer Pushes: ${result.summary.dataLayerPushes}`);
  console.log(`Console Errors: ${result.summary.consoleErrors}`);
  console.log(`Page Errors: ${result.summary.pageErrors}`);
}

/**
 * Print analytics requests
 */
function printAnalyticsRequests(result: PageScanResult): void {
  const analyticsRequests = result.networkRequests.filter((r) => r.isAnalyticsRequest);

  if (analyticsRequests.length === 0) {
    console.log('\nNo analytics requests detected.');
    return;
  }

  console.log('\n--- Analytics Requests ---');
  analyticsRequests.forEach((req, index) => {
    console.log(`\n[${index + 1}] ${req.method} ${req.url.substring(0, 100)}${req.url.length > 100 ? '...' : ''}`);
    console.log(`    Status: ${req.status || 'pending'}`);
    console.log(`    Type: ${req.resourceType}`);
    if (req.queryParams && Object.keys(req.queryParams).length > 0) {
      console.log(`    Params: ${Object.keys(req.queryParams).length} parameters`);
    }
  });
}

/**
 * Print external scripts
 */
function printScripts(result: PageScanResult): void {
  const externalScripts = result.scripts.filter((s) => !s.isInline);

  if (externalScripts.length === 0) {
    console.log('\nNo external scripts detected.');
    return;
  }

  console.log('\n--- External Scripts ---');
  externalScripts.slice(0, 20).forEach((script, index) => {
    const url = script.src || 'inline';
    const flags = [
      script.async ? 'async' : '',
      script.defer ? 'defer' : '',
      script.dynamicallyInjected ? 'dynamic' : '',
    ]
      .filter(Boolean)
      .join(', ');

    console.log(`[${index + 1}] ${url.substring(0, 80)}${url.length > 80 ? '...' : ''}`);
    if (flags) {
      console.log(`    Flags: ${flags}`);
    }
  });

  if (externalScripts.length > 20) {
    console.log(`\n... and ${externalScripts.length - 20} more scripts`);
  }
}

/**
 * Print data layer events
 */
function printDataLayerEvents(result: PageScanResult): void {
  if (result.dataLayerEvents.length === 0) {
    console.log('\nNo data layer events captured.');
    return;
  }

  console.log('\n--- Data Layer Events ---');
  result.dataLayerEvents.slice(0, 10).forEach((event, index) => {
    const dataStr = JSON.stringify(event.data).substring(0, 100);
    console.log(`[${index + 1}] [${event.dataLayerName}] ${event.source}`);
    console.log(`    Data: ${dataStr}${dataStr.length >= 100 ? '...' : ''}`);
  });

  if (result.dataLayerEvents.length > 10) {
    console.log(`\n... and ${result.dataLayerEvents.length - 10} more events`);
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const url = process.argv[2] || 'https://www.google.com';

  console.log('Analytics Validation Tool - Basic Scan Example');
  console.log('='.repeat(80));
  console.log(`Scanning: ${url}`);

  // Create scanner with custom browser manager
  const browserManager = new BrowserManager({
    minBrowsers: 1,
    maxBrowsers: 2,
    launchConfig: {
      browserType: 'chromium',
      headless: true,
    },
  });

  const scanner = new PageScanner(browserManager, true); // true = debug mode

  try {
    // Initialize browser
    await browserManager.initialize();

    // Perform scan with desktop options
    console.log('\n--- Desktop Scan ---');
    const desktopResult = await scanner.scan(url, createDesktopOptions({
      timeout: 60000,
      waitUntil: 'networkidle',
      additionalWaitTime: 2000,
      captureScreenshot: false,
    }));

    printScanSummary(desktopResult);
    printAnalyticsRequests(desktopResult);
    printScripts(desktopResult);
    printDataLayerEvents(desktopResult);

    // Optionally perform mobile scan
    // console.log('\n\n--- Mobile Scan ---');
    // const mobileResult = await scanner.scan(url, createMobileOptions({
    //   timeout: 60000,
    //   waitUntil: 'networkidle',
    // }));
    // printScanSummary(mobileResult);

    // Output full JSON result
    console.log('\n\n--- Full JSON Result (first 5000 chars) ---');
    const json = JSON.stringify(desktopResult, null, 2);
    console.log(json.substring(0, 5000));
    if (json.length > 5000) {
      console.log(`\n... (${json.length - 5000} more characters)`);
    }
  } catch (error) {
    console.error('Scan failed:', error);
  } finally {
    // Clean up
    await browserManager.shutdown();
    console.log('\nBrowser manager shut down.');
  }
}

// Run
main().catch(console.error);
