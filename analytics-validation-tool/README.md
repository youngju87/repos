# Analytics Validation Tool

> Production-grade analytics validation platform for scanning websites, detecting analytics tags, and validating implementations.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

## What is This?

The Analytics Validation Tool is an **open-source alternative to ObservePoint** that helps analytics engineers, QA teams, and marketing ops validate their analytics implementations across:

- ✅ **Google Analytics 4 (GA4)**
- ✅ **Adobe Analytics**
- ✅ **Google Tag Manager (GTM)**
- ✅ **Meta Pixel (Facebook)**
- ✅ **Segment CDP**
- ✅ **Custom analytics platforms**

## Key Features

### 🔍 **Comprehensive Scanning**
- Headless browser automation with Playwright
- Network request interception (full payload capture)
- Data layer observation
- Script tag discovery
- Cookie and localStorage tracking

### 🏷️ **Intelligent Tag Detection**
- Plugin-based architecture (easy to extend)
- Multi-signal detection with confidence scoring
- Detects: GA4, Adobe Analytics, GTM, Meta Pixel, Segment, and unknown tags
- Extracts configuration (measurement IDs, report suites, etc.)

### ✅ **Declarative Validation Engine**
- YAML/JSON rule definitions (version-controllable)
- 5 rule types: Presence, Payload, Order, Consent, Data Layer
- Production-ready rule libraries for GA4 and Adobe Analytics
- Evidence-based failure reporting

### 📊 **Production-Ready Reporting**
- Multiple output formats: JSON, Markdown, Console (with colors)
- CI/CD integration (GitHub Actions, GitLab CI, Jenkins)
- Slack and webhook alerting
- Baseline comparison for regression detection

### 🚀 **Built for CI/CD**
- Exit codes (0=pass, 1=warnings, 2=fail)
- Configurable thresholds per environment
- Auto-detects CI context (GitHub, GitLab, Jenkins, CircleCI, Travis)
- Parallel execution ready

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run install:browsers
```

### 5-Minute Quick Start

```typescript
import {
  scanUrl,
  detectTags,
  createValidationEngine,
  loadRules,
  registerBuiltInDetectors,
  getDefaultRegistry,
} from 'analytics-validation-tool';

// 1. Scan a page
const scanResult = await scanUrl('https://example.com');

// 2. Detect tags
const registry = getDefaultRegistry();
registerBuiltInDetectors(registry);
const detectionResult = await detectTags(scanResult);

console.log(`Found ${detectionResult.tags.length} tags`);

// 3. Validate against rules
const { rules } = await loadRules({
  sources: [
    {
      type: 'directory',
      path: './rules/ga4',
    },
  ],
});

const validationEngine = createValidationEngine('production');
const validationReport = await validationEngine.validate(
  scanResult,
  detectionResult,
  rules
);

console.log(`Validation Score: ${validationReport.summary.score}/100`);
console.log(`Status: ${validationReport.summary.isValid ? 'PASSED' : 'FAILED'}`);
```

### Command-Line Usage

```bash
# Scan a single page
npm run scan https://example.com

# Run full validation with rules
npm run validate https://example.com

# Run CI/CD integration
npm run example:ci https://example.com
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    INPUT: Target URLs                        │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              PHASE 1: Page Scanning                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Playwright headless browser                       │  │
│  │  • Network request/response capture (CDP)            │  │
│  │  • Data layer observation                            │  │
│  │  • Script & cookie extraction                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                    ↓ PageScanResult                         │
└─────────────────────────────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              PHASE 2: Tag Detection                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Plugin-based detectors (GA4, Adobe, etc.)         │  │
│  │  • Multi-signal evidence collection                  │  │
│  │  • Confidence scoring                                │  │
│  │  • Configuration extraction                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                  ↓ TagDetectionResult                       │
└─────────────────────────────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              PHASE 3: Validation                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Load YAML/JSON rules                              │  │
│  │  • Execute rule handlers                             │  │
│  │  • Collect evidence for failures                     │  │
│  │  • Generate validation report                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                  ↓ ValidationReport                         │
└─────────────────────────────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              PHASE 4: Reporting & Alerting                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Aggregate results                                 │  │
│  │  • Format (JSON, Markdown, Console)                  │  │
│  │  • Send alerts (Slack, Webhook)                      │  │
│  │  • CI/CD exit codes                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                    ↓ Reports & Alerts                       │
└─────────────────────────────────────────────────────────────┘
```

## Documentation

### Getting Started
- 📖 [**Getting Started Guide**](GETTING_STARTED.md) - Complete setup and first validation
- 📖 [Implementation Status](IMPLEMENTATION_STATUS.md) - What's been built

### Core Features
- 📖 [Tag Detection](TAG_DETECTION.md) - How tag detection works
- 📖 [Validation Engine](VALIDATION.md) - Writing and using validation rules
- 📖 [Reporting & Alerting](REPORTING.md) - Reports, formatters, and CI/CD integration

### Rule Libraries
- 📖 [GA4 Rules](rules/ga4/) - Production-ready GA4 validation rules
- 📖 [Adobe Analytics Rules](rules/adobe/) - Adobe Analytics validation rules
- 📖 [Consent Rules](rules/consent/) - GDPR/CCPA consent validation

### Examples
- 💻 [Basic Scanning](examples/basic-scan.ts) - Simple page scan
- 💻 [Tag Detection](examples/tag-detection.ts) - Detect analytics tags
- 💻 [Validation](examples/validation.ts) - Full validation workflow
- 💻 [CI/CD Integration](examples/ci-cd-integration.ts) - Production CI/CD setup

## Use Cases

### ✅ Analytics QA
Validate analytics implementations before deployment:
- Ensure GA4/Adobe tags are present
- Verify measurement IDs are correct per environment
- Check event parameters and naming conventions
- Detect duplicate or missing tags

### ✅ Compliance Auditing
Ensure GDPR/CCPA compliance:
- Verify consent is collected before tracking
- Check for PII in analytics payloads
- Validate consent mode implementation
- Generate audit-ready reports with evidence

### ✅ Regression Detection
Catch analytics breaks in CI/CD:
- Run validation on every PR/MR
- Compare against baseline
- Alert on new issues
- Block deployment on critical failures

### ✅ Multi-Environment Validation
Validate across dev, staging, production:
- Different rules per environment
- Verify correct IDs per environment
- Check for prod/dev ID mixing

## Production Rule Libraries

### GA4 Rules (Included)

| Category | Rules | Description |
|----------|-------|-------------|
| **Foundation** | 3 | Tag presence, measurement ID validation |
| **Protocol** | 2 | API version, client ID format |
| **Events** | 2 | Event naming, page_view validation |
| **Ecommerce** | - | Purchase, items structure (extend as needed) |
| **Consent** | 2 | Consent timing, consent mode state |

### Adobe Analytics Rules (Included)

| Category | Rules | Description |
|----------|-------|-------------|
| **Foundation** | 1 | AppMeasurement presence |
| **Protocol** | 1 | Beacon validation |
| **Variables** | - | eVars, props (extend as needed) |

### Extending Rules

Create custom rules for your organization:

```yaml
# rules/custom/my-company-001.yaml
id: mycompany-ga4-001
name: Product Category Required
description: Our business requires item_category on product events
type: data-layer
severity: error
category: custom
platform: ga4

dataLayerName: dataLayer
eventName: view_item

assertions:
  - field: items[].item_category
    type: required
    message: item_category is required for product analytics
```

## CI/CD Integration

### GitHub Actions

```yaml
- name: Validate Analytics
  env:
    MAX_ERRORS: 0
    MIN_SCORE: 80
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
  run: npm run example:ci https://example.com
```

### GitLab CI

```yaml
validate_analytics:
  image: mcr.microsoft.com/playwright:v1.40.0-jammy
  script:
    - npm ci
    - npm run example:ci https://example.com
  artifacts:
    paths:
      - analytics-report.json
      - analytics-report.md
```

See [CI/CD Integration Example](examples/ci-cd-integration.ts) for complete setup.

## Comparison with ObservePoint

| Feature | Analytics Validation Tool | ObservePoint |
|---------|---------------------------|--------------|
| **Architecture** | Open-source, self-hosted | Proprietary SaaS |
| **Rule Flexibility** | YAML/JSON, fully customizable | UI-based, limited customization |
| **CI/CD Integration** | Native (exit codes, reports) | API-based |
| **Developer Experience** | Code-first, TypeScript | UI-first |
| **Extensibility** | Plugin architecture | Limited |
| **Transparency** | Full code visibility | Black box |
| **Cost** | Free (infrastructure only) | $$$ per page/scan |
| **Debugging** | Full evidence trails | Limited |
| **Version Control** | Rules in Git | UI configuration |

### When to Use This Tool

✅ **Choose Analytics Validation Tool if:**
- You want full control and transparency
- You need deep CI/CD integration
- You have custom validation logic
- You want to version-control rules
- You need to extend for proprietary systems
- Cost is a concern

❌ **Consider ObservePoint if:**
- You prefer UI-based tools
- You need no-code setup
- You want managed service/support
- You need pre-built journey testing (coming in Phase 6)

## Project Structure

```
analytics-validation-tool/
├── src/
│   ├── core/               # Scanning engine
│   ├── detection/          # Tag detection
│   ├── validation/         # Validation engine
│   ├── reporting/          # Reports & alerts
│   └── index.ts            # Main exports
├── rules/
│   ├── ga4/                # GA4 validation rules
│   ├── adobe/              # Adobe Analytics rules
│   └── consent/            # Consent/privacy rules
├── examples/               # Usage examples
├── docs/                   # Additional documentation
├── .github/                # GitHub Actions workflows
└── README.md               # This file
```

## Requirements

- **Node.js**: >= 18.0.0
- **TypeScript**: 5.3+
- **Playwright**: Automatically installed

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode (auto-rebuild)
npm run build:watch

# Run tests (when available)
npm test

# Lint code
npm run lint
npm run lint:fix
```

## Roadmap

- ✅ **Phase 1**: System Architecture
- ✅ **Phase 2**: Core Execution Layer (Scanning)
- ✅ **Phase 3**: Tag Detection Layer
- ✅ **Phase 4**: Validation Rule Engine
- ✅ **Phase 5**: Reporting & Alerting
- ⏳ **Phase 6**: Journey & Funnel Simulation (planned)

See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for details.

## Contributing

Contributions are welcome! Areas where help is needed:

1. **Additional Platform Detectors** - TikTok Pixel, LinkedIn Insight, etc.
2. **Rule Libraries** - More GA4 rules, complete Adobe suite
3. **Tests** - Unit and integration tests
4. **Documentation** - Tutorials, use cases, best practices
5. **Performance** - Optimization and scaling improvements

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📖 **Documentation**: See docs linked above
- 💬 **Issues**: [GitHub Issues](https://github.com/your-repo/analytics-validation-tool/issues)
- 📧 **Email**: analytics-validation@example.com

## Acknowledgments

Built with:
- [Playwright](https://playwright.dev/) - Browser automation
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [YAML](https://yaml.org/) - Rule definitions

Inspired by the need for transparent, developer-friendly analytics QA tools.

---

**Made with ❤️ for analytics engineers everywhere**
