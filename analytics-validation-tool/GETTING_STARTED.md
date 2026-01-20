# Getting Started with Analytics Validation Tool

This guide will walk you through setting up and running your first analytics validation in **under 10 minutes**.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([download here](https://nodejs.org/))
- Basic familiarity with command line
- A website to validate (or use our examples)

## Step 1: Installation (2 minutes)

Clone or download the repository, then install dependencies:

```bash
# Navigate to project directory
cd analytics-validation-tool

# Install dependencies
npm install

# Install Playwright browsers (Chromium)
npm run install:browsers
```

**What this does:**
- Installs TypeScript, Playwright, and other dependencies
- Downloads Chromium browser for headless scanning
- Sets up the development environment

## Step 2: Your First Scan (1 minute)

Let's scan a page and see what analytics tags are present:

```bash
npm run scan https://www.google.com
```

**Expected output:**
```
Scanning: https://www.google.com
✓ Scan complete (3.2s)
✓ Found 15 network requests
✓ Found 8 scripts
✓ Found 2 data layer events

Network Requests Summary:
- Total: 15
- Analytics: 3
- Tracking: 2
```

The scan captures:
- Network requests (including analytics beacons)
- Script tags (gtag.js, analytics.js, etc.)
- Data layer events
- Cookies and localStorage

## Step 3: Detect Analytics Tags (2 minutes)

Now let's detect which analytics platforms are installed:

```bash
npm run example:detection https://www.google.com
```

**Expected output:**
```
TAG DETECTION SUMMARY
===========================================
Found 2 tags

[1] Google Analytics 4
    Platform: ga4
    Confidence: 92%
    Load Method: gtm
    Primary ID: G-XXXXXXXXXX

[2] Google Tag Manager
    Platform: gtm
    Confidence: 95%
    Load Method: direct
    Primary ID: GTM-XXXXX
```

**What's happening:**
- 6 built-in detectors run in sequence (GTM, GA4, Adobe, Meta Pixel, Segment, Unknown)
- Each detector looks for multiple signals (scripts, network calls, cookies)
- Confidence score based on evidence strength
- Configuration extracted (measurement IDs, container IDs, etc.)

## Step 4: Run Validation Rules (5 minutes)

Now let's validate the implementation against best practices:

### 4a. Explore Available Rules

```bash
ls rules/ga4/
# foundation/  protocol/  events/

ls rules/ga4/foundation/
# 001-tag-presence.yaml
# 002-measurement-id.yaml
```

### 4b. Run Validation

```bash
npm run validate https://www.google.com
```

**Expected output:**
```
ANALYTICS VALIDATION REPORT
============================================

Status: ✗ Failed
Overall Score: 75/100
Total Pages: 1

ISSUES
--------------------------------------------
Total: 3 (2 errors, 1 warning)

❌ ERRORS (2)

  ✗ GA4 Measurement ID Format Validation
    Measurement ID must be in format G-XXXXXXXXXX
    Platform: ga4
    Evidence:
      - [request] Found invalid measurement ID format
        Expected: G-XXXXXXXXXX
        Actual: UA-12345678

  ✗ Event Name Must Be Present
    Event name (en) is required for all GA4 hits
    Platform: ga4

⚠️  WARNINGS (1)

  ⚠ Consent State Should Be Included
    Consent state (gcs) parameter missing
    Platform: ga4
    → Implement Google Consent Mode v2

============================================
✗ VALIDATION FAILED
```

**What's happening:**
- Rules loaded from `rules/ga4/` directory
- Each rule checks specific aspects (presence, payload, consent)
- Failures include evidence (what was found, what was expected)
- Suggestions provided for remediation

## Step 5: Understanding the Output

Validation produces three files:

1. **analytics-report.json** - Machine-readable (for CI/CD)
2. **analytics-report.md** - Human-readable Markdown
3. **Console output** - Color-coded terminal output

### View the JSON Report

```bash
cat analytics-report.json | jq '.summary'
```

```json
{
  "totalPages": 1,
  "pagesPassed": 0,
  "pagesFailed": 1,
  "overallScore": 75,
  "issues": {
    "total": 3,
    "critical": 0,
    "error": 2,
    "warning": 1,
    "info": 0
  }
}
```

### View the Markdown Report

```bash
cat analytics-report.md
```

This is perfect for:
- Sharing with team members
- Posting as PR/MR comments
- Documentation

## Step 6: Customize Validation Rules

Let's create a custom rule for your organization:

### Create Custom Rule Directory

```bash
mkdir -p rules/custom
```

### Create Your First Custom Rule

```yaml
# rules/custom/my-company-001.yaml
id: mycompany-ga4-001
name: Company-Specific Measurement ID
description: |
  Ensures we're using the correct GA4 measurement ID for production.
  This prevents accidentally using staging/dev IDs in production.
type: payload
severity: error
category: custom
platform: ga4
environments:
  - production

enabled: true

target:
  urlPattern: google-analytics\.com/g/collect

source: query

fields:
  - name: tid
    required: true
    pattern: ^G-ABC123XYZ$  # Your actual production ID
    message: |
      Wrong measurement ID detected!
      Production must use G-ABC123XYZ

assertions: []

metadata:
  owner: analytics-team@mycompany.com
  remediation: |
    Update GTM configuration to use correct measurement ID
    Verify environment variable is set correctly
```

### Run with Custom Rules

```bash
npx ts-node examples/validation.ts https://example.com
# Will load rules from both rules/ga4/ and rules/custom/
```

## Step 7: CI/CD Integration (Optional)

### GitHub Actions

Create `.github/workflows/analytics-validation.yml`:

```yaml
name: Analytics Validation

on:
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          npm ci
          npm run install:browsers

      - name: Run validation
        env:
          MAX_ERRORS: 0
          MIN_SCORE: 80
        run: |
          npm run example:ci https://your-site.com

      - name: Upload reports
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: analytics-reports
          path: |
            analytics-report.json
            analytics-report.md
```

**What this does:**
- Runs on every pull request
- Validates analytics implementation
- Fails if errors found or score < 80
- Uploads reports as artifacts

## Common Workflows

### Validate Multiple Pages

Create a script to validate multiple URLs:

```typescript
// validate-site.ts
import { scanUrl, detectTags, createValidationEngine, loadRules } from './src';

const urls = [
  'https://example.com',
  'https://example.com/products',
  'https://example.com/checkout',
];

for (const url of urls) {
  console.log(`\nValidating: ${url}`);
  const scan = await scanUrl(url);
  const detection = await detectTags(scan);
  // ... validate
}
```

### Environment-Specific Validation

```bash
# Validate staging
NODE_ENV=staging npm run validate https://staging.example.com

# Validate production
NODE_ENV=production npm run validate https://example.com
```

Rules can be filtered by environment:

```yaml
# This rule only runs in production
environments:
  - production
```

### Set Thresholds

Control what constitutes a failure:

```bash
# Environment variables
export MAX_ERRORS=0        # Zero errors allowed
export MAX_WARNINGS=10     # Up to 10 warnings OK
export MIN_SCORE=80        # Minimum 80/100 score
export FAIL_ON_WARNINGS=false  # Don't fail on warnings

npm run example:ci https://example.com
```

## Troubleshooting

### Issue: Playwright browser not found

**Solution:**
```bash
npm run install:browsers
```

### Issue: Scan timeout

**Solution:** Increase timeout in code:

```typescript
const scan = await scanUrl(url, {
  timeout: 120000,  // 2 minutes instead of default 60s
});
```

### Issue: Rules not loading

**Solution:** Check rule file syntax:

```bash
# Validate YAML syntax
npm install -g js-yaml
js-yaml rules/ga4/foundation/001-tag-presence.yaml
```

### Issue: False positives

**Solution:** Add suppressions or adjust rules:

```yaml
# In your rule file
metadata:
  falsePositives: |
    This rule may fail on single-page apps
```

Or suppress in code:

```typescript
// Skip specific rules
const { rules } = await loadRules({
  sources: [{ type: 'directory', path: './rules/ga4' }],
  // Filter out problematic rules
}).then(result => ({
  ...result,
  rules: result.rules.filter(r => r.id !== 'problematic-rule-id')
}));
```

## Next Steps

Now that you've completed the basics:

1. **Read the Documentation**
   - [Tag Detection](TAG_DETECTION.md) - Understand how detection works
   - [Validation Engine](VALIDATION.md) - Deep dive into rules
   - [Reporting](REPORTING.md) - CI/CD integration

2. **Explore Examples**
   - [examples/tag-detection.ts](examples/tag-detection.ts) - Detection patterns
   - [examples/validation.ts](examples/validation.ts) - Validation workflows
   - [examples/ci-cd-integration.ts](examples/ci-cd-integration.ts) - Production setup

3. **Build Rule Libraries**
   - Create rules for your GA4 events
   - Add ecommerce validation
   - Implement consent checks

4. **Integrate into CI/CD**
   - Add to GitHub Actions / GitLab CI
   - Set up Slack alerts
   - Configure baselines for regression detection

## Getting Help

- 📖 **Documentation**: See all docs in repository root
- 💬 **Issues**: GitHub Issues for bugs/features
- 📧 **Questions**: analytics-validation@example.com

## Quick Reference

### Common Commands

```bash
# Scan a page
npm run scan <url>

# Detect tags
npm run example:detection <url>

# Validate with rules
npm run validate <url>

# CI/CD integration
npm run example:ci <url>

# Build TypeScript
npm run build

# Watch mode
npm run build:watch
```

### Directory Structure

```
rules/              # Validation rules
  ga4/              # GA4 rules
  adobe/            # Adobe Analytics rules
  consent/          # Consent/privacy rules
  custom/           # Your custom rules

examples/           # Usage examples
  basic-scan.ts
  tag-detection.ts
  validation.ts
  ci-cd-integration.ts

src/                # Source code
  core/             # Scanning engine
  detection/        # Tag detection
  validation/       # Validation engine
  reporting/        # Reports & alerts
```

### Environment Variables

```bash
NODE_ENV=production|staging|development
MAX_ERRORS=0
MAX_WARNINGS=10
MIN_SCORE=80
FAIL_ON_WARNINGS=false
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

---

**Congratulations!** You're now ready to validate analytics implementations like a pro. 🎉
