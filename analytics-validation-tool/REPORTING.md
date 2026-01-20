# Reporting & Alerting

The Reporting & Alerting system aggregates validation results, formats them for human and machine consumption, and sends alerts when issues are detected.

## Architecture

```
Scan + Detection + Validation → ReportBuilder → RunReport
                                      ↓
                        ┌─────────────┴─────────────┐
                        ▼                           ▼
                  Formatters                   AlertManager
                  (JSON, MD, Console)          (Slack, Webhook)
                        ↓                           ↓
                  Output Files                 Notifications
                  CI/CD Exit Codes
```

## Core Concepts

### Report Hierarchy

1. **RunReport** - Complete validation run across multiple pages
2. **PageReport** - Single page scan + detection + validation
3. **Issue** - Individual validation failure with evidence
4. **IssueSummary** - Aggregated issue statistics

### Report Status

- `passed` - All checks passed
- `failed` - Critical/error issues found
- `degraded` - Warnings found (non-blocking)
- `error` - System error during validation

### Severity Levels

- `critical` - Blocking issues requiring immediate attention
- `error` - Validation errors (failed checks)
- `warning` - Best practice violations
- `info` - Informational findings

## Usage

### Basic Reporting

```typescript
import {
  scanUrl,
  detectTags,
  createValidationEngine,
  loadRules,
  createReportBuilder,
  JSONFormatter,
  MarkdownFormatter,
  ConsoleFormatter,
} from 'analytics-validation-tool';

// 1. Scan and validate
const scanResult = await scanUrl('https://example.com');
const detectionResult = await detectTags(scanResult);

const { rules } = await loadRules({
  sources: [{ type: 'directory', path: './rules' }],
});

const validationEngine = createValidationEngine('production');
const validationReport = await validationEngine.validate(
  scanResult,
  detectionResult,
  rules
);

// 2. Build report
const reportBuilder = createReportBuilder({
  environment: 'production',
  thresholds: {
    maxErrors: 0,
    minScore: 80,
  },
});

const report = reportBuilder.buildRunReport([
  {
    scan: scanResult,
    detection: detectionResult,
    validation: validationReport,
  },
]);

// 3. Format report
const jsonFormatter = new JSONFormatter({ prettyPrint: true });
console.log(jsonFormatter.formatRun(report));

const markdownFormatter = new MarkdownFormatter();
await fs.writeFile('report.md', markdownFormatter.formatRun(report));

const consoleFormatter = new ConsoleFormatter({ useColors: true });
console.log(consoleFormatter.formatRun(report));
```

### Thresholds

Define pass/fail criteria:

```typescript
const thresholds: RunThresholds = {
  /** Maximum allowed critical issues (default: undefined = any fails) */
  maxCritical: 0,

  /** Maximum allowed errors (default: undefined = any fails) */
  maxErrors: 0,

  /** Maximum allowed warnings (default: undefined = unlimited) */
  maxWarnings: 10,

  /** Minimum validation score (0-100) */
  minScore: 80,

  /** Fail on warnings (treat warnings as errors) */
  failOnWarnings: false,
};

const reportBuilder = createReportBuilder({
  environment: 'production',
  thresholds,
});
```

### Baseline Comparison

Compare against previous runs to detect regressions:

```typescript
const baseline: RunBaseline = {
  runId: 'previous-run-id',
  timestamp: 1234567890,
  issueCount: 5,
  score: 85,
};

const reportBuilder = createReportBuilder({
  baseline,
});

const report = reportBuilder.buildRunReport(pageInputs);

if (report.baselineComparison) {
  console.log(`Status: ${report.baselineComparison.status}`);
  console.log(`Issue count change: ${report.baselineComparison.issueCountDelta}`);
  console.log(`New issues: ${report.baselineComparison.newIssues.length}`);
  console.log(`Resolved: ${report.baselineComparison.resolvedIssues.length}`);
}
```

## Formatters

### JSON Formatter

Machine-readable output for CI/CD systems:

```typescript
const formatter = new JSONFormatter({
  prettyPrint: true,  // Pretty print with indentation
  indent: 2,          // Indentation spaces
});

const json = formatter.formatRun(report);
await fs.writeFile('report.json', json);
```

**Output**: Structured JSON with complete report data

### Markdown Formatter

Human-readable reports with GitHub/GitLab formatting:

```typescript
const formatter = new MarkdownFormatter();

const markdown = formatter.formatRun(report);
await fs.writeFile('report.md', markdown);
```

**Output**: Formatted Markdown with:
- Summary statistics
- Issue breakdown by severity
- Evidence details
- Page-level summaries

### Console Formatter

Terminal-friendly output with colors:

```typescript
const formatter = new ConsoleFormatter({
  useColors: true,    // ANSI colors
  verbose: false,     // Show detailed evidence
});

console.log(formatter.formatRun(report));
```

**Output**: Colored terminal output with:
- Status indicators (✓/✗)
- Severity icons
- Highlighted critical issues
- Compact format

## Alerting

### Alert Manager

Manages alert dispatching based on thresholds:

```typescript
import {
  AlertManager,
  SlackDispatcher,
  WebhookDispatcher,
} from 'analytics-validation-tool';

const alertManager = new AlertManager();

// Register Slack dispatcher
const slackDispatcher = new SlackDispatcher({
  webhookUrl: process.env.SLACK_WEBHOOK_URL!,
  username: 'Analytics Validation',
  iconEmoji: ':mag:',
});

alertManager.registerDispatcher(slackDispatcher);

// Configure alert
alertManager.addAlertConfig({
  type: 'slack',
  threshold: {
    minSeverity: 'error',      // Alert on errors and critical
    minIssueCount: 1,          // At least 1 issue
    onlyNew: false,            // All issues (not just new)
    onlyRegressions: false,    // All issues (not just regressions)
  },
  config: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL!,
  },
  enabled: true,
});

// Process alerts
await alertManager.processAlerts(report);
```

### Slack Alerts

Send formatted alerts to Slack:

```typescript
const slackConfig: SlackAlertConfig = {
  webhookUrl: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
  channel: '#analytics-alerts',  // Optional (uses webhook default)
  username: 'Analytics Bot',
  iconEmoji: ':mag:',
};

const dispatcher = new SlackDispatcher(slackConfig);

alertManager.registerDispatcher(dispatcher);
alertManager.addAlertConfig({
  type: 'slack',
  threshold: { minSeverity: 'error' },
  config: slackConfig,
});
```

**Slack Message Includes**:
- Status and summary
- Issue breakdown by severity
- Top 3 issues with details
- CI/CD context (build, commit, PR)
- Baseline comparison (if available)

### Webhook Alerts

Send to generic webhooks:

```typescript
const webhookConfig: WebhookAlertConfig = {
  url: 'https://your-webhook.com/analytics',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Custom-Header': 'value',
  },
  // Optional: custom payload template
  payloadTemplate: JSON.stringify({
    status: '{{report.status}}',
    score: '{{report.score}}',
    message: '{{message}}',
  }),
};

const dispatcher = new WebhookDispatcher(webhookConfig);

alertManager.registerDispatcher(dispatcher);
```

**Default Payload**:
```json
{
  "type": "analytics_validation_alert",
  "timestamp": 1234567890,
  "message": "Analytics validation FAILED - 5 issue(s) found",
  "report": {
    "id": "run-id",
    "status": "failed",
    "environment": "production",
    "summary": {
      "score": 65,
      "issues": {
        "total": 5,
        "critical": 1,
        "error": 2,
        "warning": 2
      }
    }
  },
  "issues": [...]
}
```

## CI/CD Integration

### Exit Codes

The tool uses standard exit codes for CI/CD:

```typescript
import { getExitCode } from 'analytics-validation-tool';

const exitCode = getExitCode(report.status, failOnWarnings);

// Exit codes:
// 0 = Success (all checks passed)
// 1 = Warnings (degraded status, optional fail)
// 2 = Failure (errors or critical issues)

process.exit(exitCode);
```

### Environment Variables

Configure via environment variables:

```bash
# Thresholds
export MAX_ERRORS=0
export MAX_WARNINGS=10
export MIN_SCORE=80
export FAIL_ON_WARNINGS=false

# Alert URLs (no secrets in code!)
export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
export WEBHOOK_URL=https://your-webhook.com/...

# CI context (auto-detected)
# GitHub Actions, GitLab CI, Jenkins, CircleCI, Travis
```

### GitHub Actions

```yaml
- name: Run analytics validation
  env:
    NODE_ENV: production
    MAX_ERRORS: 0
    MIN_SCORE: 80
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
  run: |
    npx ts-node examples/ci-cd-integration.ts \
      https://example.com

- name: Upload reports
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: analytics-reports
    path: |
      analytics-report.json
      analytics-report.md
```

### GitLab CI

```yaml
validate_analytics:
  image: mcr.microsoft.com/playwright:v1.40.0-jammy
  variables:
    NODE_ENV: production
    MAX_ERRORS: "0"
    MIN_SCORE: "80"
  script:
    - npm ci
    - npx ts-node examples/ci-cd-integration.ts https://example.com
  artifacts:
    when: always
    paths:
      - analytics-report.json
      - analytics-report.md
```

### Jenkins

```groovy
pipeline {
  agent any

  environment {
    NODE_ENV = 'production'
    MAX_ERRORS = '0'
    MIN_SCORE = '80'
    SLACK_WEBHOOK_URL = credentials('slack-webhook-url')
  }

  stages {
    stage('Validate Analytics') {
      steps {
        sh 'npm ci'
        sh 'npx ts-node examples/ci-cd-integration.ts https://example.com'
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'analytics-report.*', allowEmptyArchive: false
    }
  }
}
```

## CI Context Detection

The tool automatically detects CI/CD context:

```typescript
import { detectCIContext } from 'analytics-validation-tool';

const ciContext = detectCIContext();

// Detected platforms:
// - github (GitHub Actions)
// - gitlab (GitLab CI)
// - jenkins (Jenkins)
// - circle (CircleCI)
// - travis (Travis CI)
// - unknown (local/other)

console.log(`Platform: ${ciContext.platform}`);
console.log(`Build ID: ${ciContext.buildId}`);
console.log(`Commit: ${ciContext.commitSha}`);
console.log(`Branch: ${ciContext.branch}`);
console.log(`PR: ${ciContext.prNumber}`);
console.log(`Is PR: ${ciContext.isPullRequest}`);
```

Metadata is automatically included in reports:

```json
{
  "metadata": {
    "ci": {
      "platform": "github",
      "buildId": "1234567890",
      "commitSha": "abc123def456",
      "branch": "feature/new-tracking",
      "prNumber": "42",
      "buildUrl": "https://github.com/..."
    }
  }
}
```

## Report Structure

### RunReport

```typescript
interface RunReport {
  id: string;                    // Unique run ID
  timestamp: number;             // Run timestamp
  environment: string;           // Environment (prod, staging, etc)
  status: ReportStatus;          // Overall status

  config: {
    urls: string[];              // URLs validated
    thresholds: RunThresholds;   // Pass/fail thresholds
    baseline?: RunBaseline;      // Baseline for comparison
  };

  pages: PageReport[];           // Page-level reports
  journeys: JourneyReport[];     // Journey reports (Phase 5)

  summary: {
    totalPages: number;
    pagesPassed: number;
    pagesFailed: number;
    overallScore: number;        // 0-100
    issues: IssueSummary;
    totalDuration: number;       // ms
  };

  baselineComparison?: {
    status: ComparisonStatus;
    issueCountDelta: number;
    scoreDelta: number;
    newIssues: Issue[];
    resolvedIssues: string[];
  };

  metadata: {
    toolVersion: string;
    ci?: CIContext;
    custom?: Record<string, unknown>;
  };
}
```

### PageReport

```typescript
interface PageReport {
  url: string;
  timestamp: number;
  scanId: string;
  detectionId?: string;
  validationId?: string;

  scan: PageScanResult;
  detection?: TagDetectionResult;
  validation?: ValidationReport;

  issues: Issue[];
  status: ReportStatus;

  summary: {
    scanSuccess: boolean;
    tagsDetected: number;
    validationScore?: number;
    rulesPassed: number;
    rulesFailed: number;
    issues: IssueSummary;
  };

  performance: {
    scanDuration: number;
    detectionDuration?: number;
    validationDuration?: number;
    totalDuration: number;
  };
}
```

### Issue

```typescript
interface Issue {
  id: string;
  severity: IssueSeverity;
  ruleId: string;
  ruleName: string;
  message: string;
  details?: string;
  platform?: string;
  pageUrl: string;

  evidence: Array<{
    type: string;
    description: string;
    actual?: unknown;
    expected?: unknown;
  }>;

  suggestion?: string;
  category?: string;
  documentationUrl?: string;
}
```

## Best Practices

### 1. Thresholds

Set appropriate thresholds for your environment:

```typescript
// Strict (production)
{
  maxCritical: 0,
  maxErrors: 0,
  maxWarnings: 5,
  minScore: 90,
  failOnWarnings: true
}

// Lenient (development)
{
  maxErrors: 5,
  maxWarnings: 20,
  minScore: 70,
  failOnWarnings: false
}
```

### 2. Alert Channels

- **Slack**: Real-time notifications for teams
- **Webhook**: Integration with incident management (PagerDuty, etc.)
- Use `minSeverity: 'error'` to avoid alert fatigue
- Set `minIssueCount` to avoid single-issue alerts

### 3. Report Artifacts

Always save reports in CI/CD:

```yaml
artifacts:
  when: always          # Save even on failure
  paths:
    - analytics-report.json
    - analytics-report.md
  expire_in: 30 days
```

### 4. Baseline Management

Store baseline in version control or artifact storage:

```bash
# Save baseline
cp analytics-report.json baseline/main-branch-baseline.json

# Use baseline in CI
BASELINE=$(cat baseline/main-branch-baseline.json)
```

### 5. Security

Never commit secrets:

```bash
# ❌ Bad
SLACK_WEBHOOK_URL=https://hooks.slack.com/... npm run validate

# ✅ Good
export SLACK_WEBHOOK_URL=$(vault read ...)
npm run validate
```

Use CI secrets management:
- GitHub: Repository secrets
- GitLab: CI/CD variables (masked)
- Jenkins: Credentials plugin

## Examples

Complete examples are available:

- [examples/ci-cd-integration.ts](./examples/ci-cd-integration.ts) - Complete CI/CD integration
- [.github/workflows/analytics-validation.yml](./.github/workflows/analytics-validation.yml) - GitHub Actions
- [.gitlab-ci.yml](./.gitlab-ci.yml) - GitLab CI

## See Also

- [VALIDATION.md](./VALIDATION.md) - Validation rule engine
- [TAG_DETECTION.md](./TAG_DETECTION.md) - Tag detection layer
- [src/reporting/types.ts](./src/reporting/types.ts) - Type definitions
