# Tag Detection Layer

The Tag Detection Layer identifies analytics and marketing tags from page scan data. It uses a plugin-based architecture where each platform has its own detector that examines multiple signals to determine tag presence and configuration.

## Architecture

```
PageScanResult → Evidence Context → Detectors → Tag Instances → Detection Result
```

### Core Components

1. **Evidence Extractor** - Transforms raw scan data into queryable context
2. **Detector Registry** - Manages detector plugins
3. **Detection Engine** - Orchestrates detection and aggregates results
4. **Platform Detectors** - Identify specific analytics platforms

## Usage

### Basic Detection

```typescript
import { scanUrl, detectTags, registerBuiltInDetectors, getDefaultRegistry } from 'analytics-validation-tool';

// Register detectors
registerBuiltInDetectors(getDefaultRegistry());

// Scan a page
const scanResult = await scanUrl('https://example.com');

// Detect tags
const detectionResult = await detectTags(scanResult);

console.log(`Found ${detectionResult.tags.length} tags`);
detectionResult.tags.forEach(tag => {
  console.log(`- ${tag.platformName} (${(tag.confidence * 100).toFixed(0)}%)`);
});
```

### Advanced Configuration

```typescript
import { DetectionEngine, DetectorRegistry } from 'analytics-validation-tool';

// Create custom registry
const registry = new DetectorRegistry();
registerBuiltInDetectors(registry);

// Disable specific detector
registry.disable('unknown-tag');

// Create engine with custom config
const engine = new DetectionEngine({
  registry,
  minConfidence: 0.5,  // Only return high-confidence detections
  detectUnknown: false,  // Skip unknown tag detection
  debug: true,          // Enable debug logging
});

const result = await engine.detect(scanResult);
```

## Built-In Detectors

| Detector | Priority | Signals Used |
|----------|----------|--------------|
| **GTM** | 100 | gtm.js script, dataLayer events, container IDs |
| **GA4** | 80 | gtag.js, /g/collect endpoint, G-XXXXX IDs |
| **Adobe Analytics** | 80 | AppMeasurement.js, /b/ss/ calls, s.t() |
| **Segment** | 75 | analytics.js, api.segment.io, write keys |
| **Meta Pixel** | 70 | fbevents.js, /tr/ endpoint, pixel IDs |
| **Unknown Tags** | 1 | Generic analytics patterns |

## Detection Methodology

Each detector uses multiple signals to identify tags:

### 1. Script URL Patterns

```typescript
// Example: GA4 Detector
if (context.hasScriptMatching('googletagmanager.com/gtag/js')) {
  // Extract measurement ID from URL
  const match = url.match(/gtag\/js\?id=(G-[A-Z0-9]+)/);
}
```

### 2. Network Endpoints

```typescript
// Example: Meta Pixel Detector
const trackingRequests = context.getRequestsMatching(/facebook\.com\/tr/);
for (const request of trackingRequests) {
  const params = extractQueryParams(request.url);
  const pixelId = params['id'];
}
```

### 3. Script Content Analysis

```typescript
// Example: GTM Detector
for (const { content } of context.inlineScripts) {
  const match = content.match(/dataLayer = window.dataLayer \|\| \[\]/);
  if (match) {
    // GTM installation snippet detected
  }
}
```

### 4. Data Layer Events

```typescript
// Example: GA4 Detector
const dataLayerEvents = context.dataLayerEvents.get('dataLayer') || [];
for (const event of dataLayerEvents) {
  if (event.data.event === 'gtag.js') {
    // GA4 via GTM detected
  }
}
```

### 5. Cookies

```typescript
// Example: Meta Pixel Detector
if (context.hasCookie('_fbp')) {
  // Meta Pixel browser ID cookie present
}
```

## Confidence Scoring

Confidence is calculated using a diminishing returns formula:

```typescript
let combined = 0;
let remaining = 1;

for (const evidence of sorted) {
  const contribution = evidence.confidence * remaining;
  combined += contribution;
  remaining *= (1 - evidence.confidence * 0.5);
}
```

**Confidence Thresholds:**

- `0.90+` - Very strong (e.g., exact script URL + API call)
- `0.75+` - Strong (e.g., script URL + configuration)
- `0.60+` - Moderate (e.g., API call + cookies)
- `0.40+` - Weak (e.g., cookies only)
- `0.25+` - Very weak (e.g., generic patterns)

## Creating Custom Detectors

### Implement TagDetector Interface

```typescript
import { BaseDetector, CONFIDENCE, type TagInstance, type EvidenceContext } from 'analytics-validation-tool';

class HotjarDetector extends BaseDetector {
  readonly id = 'hotjar';
  readonly name = 'Hotjar';
  readonly platform = 'hotjar' as const;
  readonly category = 'session-recording' as const;
  readonly version = '1.0.0';
  readonly priority = 60;

  mightBePresent(context: EvidenceContext): boolean {
    return context.hasScriptMatching('static.hotjar.com');
  }

  async detect(context: EvidenceContext): Promise<TagInstance[]> {
    const evidence = [];
    const siteIds = new Set<string>();

    // Detect Hotjar script
    for (const url of context.scriptUrls) {
      const match = url.match(/static\.hotjar\.com.*hjid=(\d+)/);
      if (match) {
        siteIds.add(match[1]);
        evidence.push(
          this.createEvidence(
            'script-url',
            'Hotjar tracking script',
            match[1],
            CONFIDENCE.HIGH,
            { siteId: match[1] }
          )
        );
      }
    }

    if (evidence.length === 0) return [];

    return [
      this.createTagInstance({
        confidence: this.calculateConfidence(evidence),
        detectionMethods: ['script-url'],
        evidence,
        config: {
          primaryId: Array.from(siteIds)[0],
        },
      }),
    ];
  }
}

// Register
const detector = new HotjarDetector();
registry.register(detector);
```

## Tag Instance Structure

Each detected tag includes:

```typescript
{
  "id": "unique-instance-id",
  "platform": "ga4",              // Platform identifier
  "platformName": "Google Analytics 4",
  "category": "analytics",        // Tag category
  "loadMethod": "gtm",            // How it was loaded
  "confidence": 0.92,             // Detection confidence (0-1)
  "detectionMethods": ["script-url", "network-endpoint"],
  "evidence": [                   // All supporting evidence
    {
      "method": "script-url",
      "matched": "gtag.js with measurement ID",
      "value": "G-XXXXXXXXXX",
      "confidence": 0.9
    }
  ],
  "config": {                     // Extracted configuration
    "primaryId": "G-XXXXXXXXXX",
    "properties": { ... }
  },
  "scriptUrls": ["https://..."],
  "endpoints": ["https://..."],
  "isActive": true,               // Whether tag is firing
  "hasErrors": false
}
```

## False Positive Mitigation

The detection system includes several mechanisms to reduce false positives:

### 1. Multi-Signal Validation

No tag is detected based on a single signal. Minimum viable detection requires:
- Script URL OR network endpoint
- PLUS configuration evidence (ID, cookies, or inline code)

### 2. Known Platform Filtering

The Unknown Tag Detector excludes known platforms:

```typescript
private readonly KNOWN_PLATFORMS = [
  'google-analytics.com',
  'googletagmanager.com',
  'facebook.com',
  // ... etc
];
```

### 3. Confidence Thresholding

```typescript
const engine = new DetectionEngine({
  minConfidence: 0.5  // Filter out low-confidence detections
});
```

### 4. Evidence Source Tracking

Each piece of evidence includes:
- Detection method
- What was matched
- Actual value
- Confidence contribution
- Source reference (request ID, script ID, etc.)

This allows downstream validation to verify evidence quality.

## Performance Considerations

### Detection Speed

- **Quick Filtering**: `mightBePresent()` uses fast string checks to skip irrelevant detectors
- **Parallel Execution**: Detectors run sequentially but efficiently (5-50ms each)
- **Timeout Protection**: Each detector has a configurable timeout (default 5s)

### Memory Usage

- Evidence context is built once and reused
- String matching uses lowercase comparisons on pre-indexed data
- Large response bodies are already truncated during scanning

### Typical Performance

| Operation | Time |
|-----------|------|
| Evidence extraction | 10-20ms |
| Per detector (has match) | 5-15ms |
| Per detector (no match) | 1-2ms |
| Full detection (5 tags) | 50-100ms |

## Error Handling

Detector errors don't crash the engine:

```typescript
{
  "detectorErrors": [
    {
      "detector": "adobe-analytics",
      "error": "Detector timeout after 5000ms"
    }
  ]
}
```

Best practices:
- Wrap risky operations in try/catch
- Use optional chaining for property access
- Validate data before regex matching
- Return empty array on failure

## Extending Detection

### Adding New Platforms

1. Create detector class extending `BaseDetector`
2. Implement `mightBePresent()` and `detect()`
3. Register with registry
4. (Optional) Add to `BUILT_IN_DETECTORS`

### Declarative Detectors

For simple platforms, use declarative patterns:

```typescript
const declarativeDef: DeclarativeDetectorDef = {
  id: 'linkedin-insight',
  name: 'LinkedIn Insight Tag',
  platform: 'linkedin-insight',
  category: 'advertising',
  version: '1.0.0',
  presencePatterns: {
    scriptUrls: ['snap.licdn.com'],
    requestUrls: ['px.ads.linkedin.com'],
  },
  detection: {
    scriptUrlPatterns: [
      {
        pattern: /snap\.licdn\.com\/li\.lms-analytics\/insight\.min\.js/,
        indicates: 'LinkedIn Insight Tag script',
        confidence: 0.9,
      },
    ],
  },
  configExtraction: {
    queryParamIds: ['partnerId'],
  },
};

// Convert to detector and register
const detector = createDeclarativeDetector(declarativeDef);
registry.register(detector);
```

## Testing Detectors

```typescript
import { buildEvidenceContext } from 'analytics-validation-tool';

// Mock scan result
const mockScan: PageScanResult = {
  // ... scan data
  networkRequests: [
    {
      url: 'https://www.google-analytics.com/g/collect?tid=G-TEST123',
      // ...
    },
  ],
  scripts: [
    {
      src: 'https://www.googletagmanager.com/gtag/js?id=G-TEST123',
      // ...
    },
  ],
};

// Build evidence
const evidence = buildEvidenceContext(mockScan);

// Test detector
const detector = new GA4Detector();
const shouldRun = detector.mightBePresent(evidence);
expect(shouldRun).toBe(true);

const tags = await detector.detect(evidence);
expect(tags.length).toBeGreaterThan(0);
expect(tags[0].config.primaryId).toBe('G-TEST123');
```

## See Also

- [examples/tag-detection.ts](./examples/tag-detection.ts) - Complete usage example
- [examples/sample-detection-output.json](./examples/sample-detection-output.json) - Example output
- [src/detection/types.ts](./src/detection/types.ts) - Type definitions
- [src/detection/detectors/](./src/detection/detectors/) - Detector implementations
