# Validation Engine

The Validation Engine provides declarative, rule-based validation of analytics implementations. It consumes scan and detection results and produces structured, auditable validation reports.

## Architecture

```
PageScanResult + TagDetectionResult → Rule Loader → Validation Engine → Validation Report
                                            ↓
                                      Rule Handlers
```

### Core Components

1. **RuleLoader** - Loads rules from YAML/JSON files or inline definitions
2. **ValidationEngine** - Orchestrates rule execution and aggregates results
3. **ValidationContext** - Provides helper methods for rule evaluation
4. **Rule Type Handlers** - Evaluate specific rule types (presence, payload, order, etc.)

## Usage

### Basic Validation

```typescript
import {
  scanUrl,
  detectTags,
  registerBuiltInDetectors,
  getDefaultRegistry,
} from 'analytics-validation-tool';

import {
  createValidationEngine,
  loadRules,
} from 'analytics-validation-tool/validation';

// Scan and detect
const scanResult = await scanUrl('https://example.com');
const detectionResult = await detectTags(scanResult);

// Load rules
const { rules } = await loadRules({
  sources: [
    {
      type: 'directory',
      path: './rules',
      pattern: '.*\\.yaml$',
    },
  ],
  environment: 'production',
});

// Create engine and validate
const engine = createValidationEngine('production');
const report = await engine.validate(scanResult, detectionResult, rules);

// Check results
console.log(`Score: ${report.summary.score}/100`);
console.log(`Is Valid: ${report.summary.isValid}`);
console.log(`Passed: ${report.summary.passed}`);
console.log(`Failed: ${report.summary.failed}`);
```

### Advanced Configuration

```typescript
import {
  ValidationEngine,
  PresenceHandler,
  PayloadHandler,
  OrderHandler,
  ConsentHandler,
  DataLayerHandler,
} from 'analytics-validation-tool/validation';

// Create engine with custom config
const engine = new ValidationEngine({
  environment: 'production',
  ruleTimeout: 30000,
  continueOnError: true,
  debug: true,
});

// Register handlers
engine.registerHandler(new PresenceHandler());
engine.registerHandler(new PayloadHandler());
engine.registerHandler(new OrderHandler());
engine.registerHandler(new ConsentHandler());
engine.registerHandler(new DataLayerHandler());

// Or use built-in helper
import { registerBuiltInHandlers } from 'analytics-validation-tool/validation';
registerBuiltInHandlers(engine);
```

## Rule Types

### 1. Presence Rules

Validate presence/absence of tags, events, requests, scripts, or data layers.

**YAML Definition:**

```yaml
id: ga4-presence
name: GA4 Tag Must Be Present
description: Ensures Google Analytics 4 is installed on the page
type: presence
severity: error
platform: ga4
enabled: true

target:
  type: tag
  platform: ga4

shouldExist: true
minCount: 1
maxCount: 1

assertions: []
```

**Target Types:**
- `tag` - Analytics/marketing tags (requires `platform`)
- `event` - Data layer events (requires `dataLayerName` and optionally `eventName`)
- `request` - Network requests (requires `urlPattern`)
- `script` - Script tags (requires `urlPattern`)
- `dataLayer` - Data layer existence (requires `dataLayerName`)

### 2. Payload Rules

Validate network request payloads (query params, body, headers).

**YAML Definition:**

```yaml
id: ga4-payload-validation
name: GA4 Collect Payload Validation
type: payload
severity: error
platform: ga4

target:
  urlPattern: google-analytics\.com/g/collect
  method: POST

source: query  # or 'body' or 'headers'

fields:
  - name: tid
    required: true
    pattern: ^G-[A-Z0-9]+$
    message: Measurement ID must match G-XXXXX format

  - name: v
    required: true
    value: "2"
    message: API version must be 2

  - name: cid
    required: true
    pattern: ^\d+\.\d+$

  - name: en
    required: true
    type: string

assertions: []
```

**Field Validation Options:**
- `required` - Field must be present
- `type` - Expected data type (`string`, `number`, `boolean`)
- `value` - Exact value match
- `pattern` - Regex pattern match
- `message` - Custom error message

### 3. Order Rules

Validate load order and timing between tags, events, and scripts.

**YAML Definition:**

```yaml
id: gtm-before-ga4
name: GTM Must Load Before GA4
type: order
severity: warning

before:
  type: tag
  identifier: gtm

after:
  type: tag
  identifier: ga4

maxTimeDifference: 5000  # optional, in milliseconds

assertions: []
```

**Item Types:**
- `tag` - Tag identifier (platform name)
- `event` - Event name
- `script` - Script URL pattern (regex)

### 4. Consent Rules

Validate consent compliance - ensures tags only fire after consent is granted.

**YAML Definition:**

```yaml
id: ga4-consent-compliance
name: GA4 Consent Compliance
type: consent
severity: error
platform: ga4

requireConsentBefore: true

consentSignal:
  source: dataLayer  # or 'cookie' or 'localStorage'
  name: consent_update
  value: granted  # optional

assertions: []
```

**Consent Sources:**
- `dataLayer` - Data layer event (supports timestamp)
- `cookie` - Browser cookie (no timestamp)
- `localStorage` - Local storage item (no timestamp)

### 5. Data Layer Rules

Validate data layer structure, schema, naming conventions, and content.

**YAML Definition:**

```yaml
id: datalayer-page-view
name: Data Layer Page View Event
type: data-layer
severity: error

dataLayerName: dataLayer
eventName: page_view  # optional

requiredKeys:
  - event
  - page_title
  - page_location

forbiddenKeys:
  - pii_email
  - credit_card

namingPattern: ^[a-z][a-z0-9_]*$

schema:
  event: string
  page_title: string
  page_location: string
  user_id: string

assertions:
  - field: event
    type: equals
    value: page_view

  - field: page_title
    type: required

  - field: page_location
    type: matches
    pattern: ^https?://
```

**Assertion Types:**
- `required` - Field must exist
- `equals` - Field must equal specific value
- `matches` - Field must match regex pattern
- `type` - Field must be specific data type
- `range` - Numeric field must be in range (requires `min`/`max`)
- `length` - String/array length must be in range (requires `min`/`max`)

## Rule Definition Structure

### Base Fields

All rules must include:

```yaml
id: unique-rule-id
name: Human Readable Name
description: Detailed description of what this rule validates
type: presence | payload | order | consent | data-layer | custom
severity: error | warning | info
enabled: true | false  # optional, default true
```

### Optional Filters

```yaml
platform: ga4  # Only apply to specific platform
tags:  # Tag categories
  - analytics
  - advertising
environments:  # Only run in specific environments
  - production
  - staging
```

### Conditions

Rules can have preconditions (advanced):

```yaml
conditions:
  - field: environment
    operator: equals
    value: production
  - field: hasConsent
    operator: equals
    value: true
```

## Loading Rules

### From Directory

```typescript
const { rules, errors } = await loadRules({
  sources: [
    {
      type: 'directory',
      path: './rules',
      pattern: '.*\\.yaml$',  // optional
    },
  ],
  environment: 'production',
  platform: 'ga4',  // optional filter
  validateSchema: true,
});
```

### From Single File

```typescript
const { rules } = await loadRules({
  sources: [
    {
      type: 'file',
      path: './rules/ga4-validation.yaml',
    },
  ],
});
```

### Inline Rules

```typescript
const { rules } = await loadRules({
  sources: [
    {
      type: 'inline',
      rules: [
        {
          id: 'ga4-presence',
          name: 'GA4 Must Be Present',
          type: 'presence',
          severity: 'error',
          target: { type: 'tag', platform: 'ga4' },
          shouldExist: true,
          assertions: [],
        },
      ],
    },
  ],
});
```

## Validation Results

### Result Structure

Each rule produces a `ValidationResult`:

```typescript
{
  "ruleId": "ga4-presence",
  "ruleName": "GA4 Tag Must Be Present",
  "status": "passed" | "failed" | "skipped" | "error",
  "severity": "error" | "warning" | "info",
  "message": "Found 1 tag(s) as expected",
  "details": "Ensures Google Analytics 4 is installed",
  "platform": "ga4",
  "tagId": "...",  // optional
  "evidence": [
    {
      "type": "tag" | "request" | "script" | "dataLayer" | "cookie" | "timing",
      "description": "Found Google Analytics 4 tag",
      "actual": "ga4",
      "expected": "ga4",  // optional
      "ref": {  // optional
        "id": "tag-id",
        "url": "...",
        "timestamp": 123456789
      }
    }
  ],
  "suggestion": "Fix suggestion...",  // optional
  "timestamp": 123456789,
  "duration": 45,  // ms
  "error": "Error message"  // if status is 'error'
}
```

### Validation Report

Complete validation produces a `ValidationReport`:

```typescript
{
  "id": "report-id",
  "scanId": "scan-id",
  "detectionId": "detection-id",
  "url": "https://example.com",
  "environment": "production",
  "startedAt": 123456789,
  "completedAt": 123456790,
  "duration": 1523,
  "results": [ /* ValidationResult[] */ ],
  "summary": {
    "totalRules": 6,
    "passed": 3,
    "failed": 2,
    "skipped": 1,
    "errors": 0,
    "bySeverity": {
      "error": 2,
      "warning": 3,
      "info": 1
    },
    "byPlatform": {
      "ga4": {
        "passed": 2,
        "failed": 1,
        "warnings": 0
      }
    },
    "score": 60,  // 0-100
    "isValid": false  // true if no errors
  },
  "rulesLoaded": ["rule-1", "rule-2"],
  "ruleErrors": [],
  "engineVersion": "1.0.0"
}
```

## Validation Context

Rule handlers receive a `ValidationContext` with helper methods:

```typescript
interface ValidationContext {
  scan: PageScanResult;
  detection: TagDetectionResult;
  environment: Environment;

  // Find tags
  findTag(platform: string): TagInstance | undefined;
  findTags(platform: string): TagInstance[];

  // Find network requests
  findRequests(pattern: string | RegExp): NetworkRequest[];

  // Data layer
  getDataLayerEvents(name: string, eventName?: string): DataLayerEvent[];
  hasDataLayerEvent(dataLayerName: string, eventName: string): boolean;

  // Storage
  getCookie(name: string): string | undefined;
  getLocalStorage(key: string): string | undefined;

  // Timing
  getTagTimestamp(tag: TagInstance): number;
  getEventTimestamp(eventName: string): number | undefined;
}
```

## Creating Custom Rule Handlers

Implement the `RuleTypeHandler` interface:

```typescript
import {
  BaseDetector,
  type ValidationContext,
  type ValidationResult,
  type RuleTypeHandler,
  type AnyRuleDef,
} from 'analytics-validation-tool/validation';

interface MyCustomRuleDef extends RuleDefinition {
  type: 'my-custom';
  customField: string;
}

class MyCustomHandler implements RuleTypeHandler<MyCustomRuleDef> {
  readonly type = 'my-custom' as const;

  canHandle(rule: AnyRuleDef): rule is MyCustomRuleDef {
    return rule.type === 'my-custom';
  }

  async evaluate(
    rule: MyCustomRuleDef,
    context: ValidationContext
  ): Promise<ValidationResult[]> {
    const evidence = [];

    // Your validation logic here
    const passed = true;

    return [
      {
        ruleId: rule.id,
        ruleName: rule.name,
        status: passed ? 'passed' : 'failed',
        severity: rule.severity,
        message: 'Validation message',
        evidence,
        timestamp: Date.now(),
      },
    ];
  }
}

// Register
engine.registerHandler(new MyCustomHandler());
```

## Error Handling

The engine handles errors gracefully:

1. **Rule Loading Errors** - Reported in `report.ruleErrors`
2. **Handler Errors** - Result status set to `'error'`
3. **Timeouts** - Configurable per-rule timeout
4. **Continue on Error** - Optionally continue validation after errors

## Performance

- **Rule Execution** - Sequential, 10-100ms per rule
- **Timeout Protection** - Default 30s per rule
- **Evidence Limits** - No limits, but consider memory for large scans
- **Parallel Execution** - Not currently supported (rules run sequentially)

## Best Practices

1. **Rule Organization** - Group rules by platform, environment, or severity
2. **Rule Naming** - Use descriptive IDs: `platform-ruletype-description`
3. **Severity Levels**:
   - `error` - Critical issues that break functionality
   - `warning` - Best practice violations
   - `info` - Informational/advisory checks
4. **Environment Filtering** - Use environment filters to avoid false positives
5. **Evidence** - Include actionable evidence to help debug failures
6. **Suggestions** - Provide fix suggestions for failed rules

## See Also

- [examples/validation.ts](./examples/validation.ts) - Complete usage example
- [examples/sample-validation-output.json](./examples/sample-validation-output.json) - Example output
- [rules/](./rules/) - Example rule definitions
- [src/validation/types.ts](./src/validation/types.ts) - Type definitions
