# Quick Reference Card

One-page reference for the Analytics Validation Tool.

## Installation

```bash
npm install
npm run install:browsers
```

## Common Commands

```bash
# Scan a page
npm run scan <url>

# Detect tags
npm run example:detection <url>

# Run validation
npm run validate <url>

# CI/CD integration
npm run example:ci <url>

# Build TypeScript
npm run build
```

## Basic Usage

```typescript
import {
  scanUrl,
  detectTags,
  createValidationEngine,
  loadRules,
} from 'analytics-validation-tool';

// Scan → Detect → Validate
const scan = await scanUrl('https://example.com');
const detection = await detectTags(scan);
const engine = createValidationEngine('production');
const { rules } = await loadRules({ sources: [{ type: 'directory', path: './rules' }] });
const report = await engine.validate(scan, detection, rules);

console.log(`Score: ${report.summary.score}/100`);
```

## Rule Structure

```yaml
id: rule-id
name: Human Readable Name
description: What this rule validates
type: presence|payload|order|consent|data-layer
severity: error|warning|info
category: foundation|protocol|events|etc
platform: ga4|adobe-analytics
environments: [production, staging]
enabled: true

# Type-specific configuration
target:
  type: tag
  platform: ga4

shouldExist: true
assertions: []
```

## Rule Types

| Type | Purpose | Example |
|------|---------|---------|
| `presence` | Check if tag/event exists | GA4 tag must be present |
| `payload` | Validate request parameters | Measurement ID format |
| `order` | Check load sequence | GTM before GA4 |
| `consent` | Verify consent timing | GA4 after consent |
| `data-layer` | Validate DL structure | page_view event schema |

## Thresholds

```bash
# Environment variables
export MAX_ERRORS=0
export MAX_WARNINGS=10
export MIN_SCORE=80
export FAIL_ON_WARNINGS=false
```

## Exit Codes

- `0` = Success (all passed)
- `1` = Warnings only
- `2` = Errors or failures

## File Structure

```
rules/
  ga4/          # GA4 rules
  adobe/        # Adobe rules
  consent/      # Consent rules
  custom/       # Your rules

examples/       # Usage examples
src/            # Source code
```

## Built-in Detectors

1. **GTM** - Google Tag Manager
2. **GA4** - Google Analytics 4
3. **Adobe Analytics** - AppMeasurement/Web SDK
4. **Meta Pixel** - Facebook tracking
5. **Segment** - Segment CDP
6. **Unknown** - Generic analytics

## Formatters

```typescript
import {
  JSONFormatter,
  MarkdownFormatter,
  ConsoleFormatter,
} from 'analytics-validation-tool';

const json = new JSONFormatter({ prettyPrint: true });
const markdown = new MarkdownFormatter();
const console = new ConsoleFormatter({ useColors: true });
```

## Alert Dispatchers

```typescript
import { SlackDispatcher, WebhookDispatcher } from 'analytics-validation-tool';

const slack = new SlackDispatcher({
  webhookUrl: process.env.SLACK_WEBHOOK_URL,
});

const webhook = new WebhookDispatcher({
  url: 'https://your-webhook.com',
  method: 'POST',
});
```

## CI/CD Integration

### GitHub Actions
```yaml
- run: npm run example:ci https://example.com
  env:
    MAX_ERRORS: 0
    MIN_SCORE: 80
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### GitLab CI
```yaml
validate:
  script:
    - npm run example:ci https://example.com
  artifacts:
    paths:
      - analytics-report.json
```

## Documentation

- [README.md](README.md) - Overview
- [GETTING_STARTED.md](GETTING_STARTED.md) - Setup guide
- [TAG_DETECTION.md](TAG_DETECTION.md) - Detection docs
- [VALIDATION.md](VALIDATION.md) - Validation docs
- [REPORTING.md](REPORTING.md) - Reporting docs

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Browser not found | `npm run install:browsers` |
| Scan timeout | Increase timeout in code |
| Rules not loading | Check YAML syntax |
| False positives | Add suppressions or adjust rules |

## Support

- 📖 Docs: See .md files
- 💬 Issues: GitHub Issues
- 📧 Email: analytics-validation@example.com

---

**Version**: 1.0.0
