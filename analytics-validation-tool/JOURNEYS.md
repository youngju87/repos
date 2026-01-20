# Journey & Funnel Simulation

Multi-step user flow validation with analytics capture at each step.

## Overview

The Journey & Funnel Simulation engine allows you to:

- ✅ Define multi-step user flows in YAML/JSON
- ✅ Execute realistic user interactions (navigate, click, type, submit)
- ✅ Capture analytics data at each step
- ✅ Validate analytics implementation throughout the journey
- ✅ Generate comprehensive journey reports

## Quick Start

### 1. Define a Journey

Create a journey definition in YAML:

```yaml
# journeys/checkout.yaml
id: checkout-001
name: E-commerce Checkout
startUrl: https://example.com/products

steps:
  - id: step-1
    name: View Product
    actions:
      - type: navigate
        url: https://example.com/products/widget

      - type: wait
        for: dataLayer
        eventName: view_item
        timeout: 5000

    captureAnalytics: true

  - id: step-2
    name: Add to Cart
    actions:
      - type: click
        selector: button.add-to-cart

      - type: wait
        for: dataLayer
        eventName: add_to_cart

    captureAnalytics: true
```

### 2. Execute the Journey

```typescript
import {
  loadJourneys,
  createJourneyEngine,
  getDefaultActionRegistry,
} from 'analytics-validation-tool';

// Load journeys
const { journeys } = await loadJourneys({
  sources: [
    { type: 'directory', path: './journeys' }
  ],
});

// Load validation rules
const { rules } = await loadRules({
  sources: [
    { type: 'directory', path: './rules/ga4' }
  ],
});

// Create engine
const actionRegistry = getDefaultActionRegistry();
const engine = createJourneyEngine(
  {
    environment: 'production',
    headless: true,
  },
  actionRegistry
);

// Execute journey
const result = await engine.execute(journeys[0], rules);

console.log(`Status: ${result.status}`);
console.log(`Steps Completed: ${result.summary.stepsCompleted}/${result.summary.totalSteps}`);
console.log(`Overall Score: ${result.summary.overallScore}/100`);
```

## Journey Definition

### Structure

```yaml
id: string                      # Unique journey identifier
name: string                    # Human-readable name
description: string             # Optional description
startUrl: string                # Initial URL to navigate to

config:                         # Optional configuration
  defaultTimeout: number        # Default timeout in ms (default: 30000)
  captureScreenshots: boolean   # Capture screenshots (default: false)
  continueOnFailure: boolean    # Continue on step failure (default: false)
  globalValidationRules: string[] # Rule IDs to apply to all steps

steps:                          # Array of journey steps
  - id: string                  # Step identifier
    name: string                # Step name
    description: string         # Optional step description
    actions: []                 # Actions to perform
    captureAnalytics: boolean   # Capture analytics data (default: true)
    validationRules: string[]   # Step-specific rule IDs
```

## Action Types

### Navigate

Navigate to a URL.

```yaml
- type: navigate
  url: https://example.com/page
  waitUntil: load  # load | domcontentloaded | networkidle
  timeout: 60000
```

### Click

Click an element.

```yaml
- type: click
  selector: button.add-to-cart
  waitForSelector: true  # Wait for element to be visible
  options:
    button: left         # left | right | middle
    clickCount: 1        # Number of clicks
  timeout: 30000
```

### Type

Type text into an input field.

```yaml
- type: type
  selector: input[name="email"]
  value: user@example.com
  clear: true           # Clear existing value first
  waitForSelector: true
  options:
    delay: 100          # Delay between keystrokes (ms)
  timeout: 30000
```

### Submit

Submit a form.

```yaml
- type: submit
  selector: form.checkout
  method: click         # click | enter
  waitForNavigation: true
  waitUntil: load
  timeout: 60000
```

### Wait

Wait for a condition.

```yaml
# Wait for selector
- type: wait
  for: selector
  selector: .product-loaded
  timeout: 10000

# Wait for data layer event
- type: wait
  for: dataLayer
  dataLayerName: dataLayer
  eventName: purchase
  timeout: 5000

# Wait for network request
- type: wait
  for: network
  urlPattern: google-analytics\.com/g/collect
  timeout: 5000

# Wait for timeout
- type: wait
  for: timeout
  duration: 2000
```

### Assert

Make validation assertions.

```yaml
# Assert URL
- type: assert
  assertType: url
  expected: /checkout/success
  operator: contains    # equals | contains | matches | greaterThan | lessThan
  message: Should redirect to success page

# Assert text content
- type: assert
  assertType: text
  selector: .order-number
  expected: ORDER-
  operator: contains

# Assert element exists
- type: assert
  assertType: exists
  selector: .success-message

# Assert element visible
- type: assert
  assertType: visible
  selector: .confirmation

# Assert element count
- type: assert
  assertType: count
  selector: .cart-item
  expected: 2
  operator: greaterThan
```

### Screenshot

Capture a screenshot.

```yaml
- type: screenshot
  path: screenshots/checkout/step-1.png  # Optional (auto-generated if not provided)
  format: png                             # png | jpeg
  fullPage: true                          # Capture full page
  selector: .product-details              # Optional: capture specific element
  timeout: 10000
```

## Journey Execution

### Basic Execution

```typescript
const result = await engine.execute(journey);

// Result structure
{
  id: 'checkout-001',
  name: 'E-commerce Checkout',
  status: 'success' | 'failed' | 'partial',
  steps: [
    {
      stepId: 'step-1',
      stepName: 'View Product',
      status: 'success',
      actions: [
        {
          action: { type: 'navigate', url: '...' },
          status: 'success',
          duration: 1234
        }
      ],
      scan: { /* PageScanResult */ },
      detection: { /* TagDetectionResult */ },
      validation: { /* ValidationReport */ },
      duration: 5678
    }
  ],
  summary: {
    totalSteps: 7,
    stepsCompleted: 7,
    totalActions: 25,
    actionsCompleted: 25,
    overallScore: 95
  },
  duration: 45000,
  timestamp: 1234567890
}
```

### With Validation Rules

```typescript
// Load validation rules
const { rules } = await loadRules({
  sources: [
    { type: 'directory', path: './rules/ga4' },
    { type: 'directory', path: './rules/ecommerce' }
  ],
});

// Execute with validation
const result = await engine.execute(journey, rules);

// Each step includes validation report
result.steps.forEach(step => {
  if (step.validation) {
    console.log(`Step: ${step.stepName}`);
    console.log(`Score: ${step.validation.summary.score}/100`);
    console.log(`Issues: ${step.validation.summary.issues.total}`);
  }
});
```

## Common Patterns

### E-commerce Checkout

```yaml
id: ecommerce-checkout
name: Complete Checkout Flow
startUrl: https://shop.example.com

steps:
  - id: product-view
    name: View Product
    actions:
      - type: wait
        for: dataLayer
        eventName: view_item

  - id: add-to-cart
    name: Add to Cart
    actions:
      - type: click
        selector: button.add-to-cart
      - type: wait
        for: dataLayer
        eventName: add_to_cart

  - id: checkout
    name: Begin Checkout
    actions:
      - type: click
        selector: button.checkout
      - type: wait
        for: dataLayer
        eventName: begin_checkout

  - id: shipping
    name: Add Shipping Info
    actions:
      - type: type
        selector: input[name="email"]
        value: test@example.com
      - type: type
        selector: input[name="address"]
        value: 123 Main St
      - type: click
        selector: button.continue
      - type: wait
        for: dataLayer
        eventName: add_shipping_info

  - id: payment
    name: Add Payment Info
    actions:
      - type: type
        selector: input[name="cardNumber"]
        value: "4242424242424242"
      - type: click
        selector: button.review-order
      - type: wait
        for: dataLayer
        eventName: add_payment_info

  - id: purchase
    name: Complete Purchase
    actions:
      - type: click
        selector: button.place-order
      - type: wait
        for: dataLayer
        eventName: purchase
      - type: assert
        assertType: visible
        selector: .order-confirmation
```

### User Registration

```yaml
id: user-registration
name: User Signup Flow
startUrl: https://example.com/signup

steps:
  - id: landing
    name: Signup Landing
    actions:
      - type: wait
        for: selector
        selector: form.signup

  - id: fill-form
    name: Fill Registration Form
    actions:
      - type: type
        selector: input[name="email"]
        value: newuser@example.com
      - type: type
        selector: input[name="password"]
        value: SecurePass123!
      - type: click
        selector: input[type="checkbox"][name="terms"]

  - id: submit
    name: Submit Registration
    actions:
      - type: submit
        selector: form.signup
      - type: wait
        for: dataLayer
        eventName: sign_up
      - type: assert
        assertType: url
        expected: /welcome
        operator: contains
```

### Content Engagement

```yaml
id: content-engagement
name: Article Reading Journey
startUrl: https://blog.example.com

steps:
  - id: article-list
    name: Browse Articles
    actions:
      - type: wait
        for: selector
        selector: .article-list

  - id: read-article
    name: Read Article
    actions:
      - type: click
        selector: .article-card:first-child
      - type: wait
        for: dataLayer
        eventName: view_item
      - type: wait
        for: timeout
        duration: 5000  # Simulate reading time

  - id: engagement
    name: Scroll and Engage
    actions:
      - type: wait
        for: selector
        selector: footer  # Scroll to bottom
      - type: wait
        for: dataLayer
        eventName: scroll
```

## Configuration

### Engine Configuration

```typescript
const engine = createJourneyEngine(
  {
    environment: 'production',     // Environment name
    headless: true,                // Run in headless mode
    viewport: {                    // Browser viewport
      width: 1280,
      height: 720
    },
    userAgent: 'Custom UA',        // Optional custom user agent
  },
  actionRegistry
);
```

### Journey Configuration

```yaml
config:
  defaultTimeout: 30000           # Default action timeout
  captureScreenshots: true        # Capture screenshots
  continueOnFailure: false        # Continue on step failure
  globalValidationRules:          # Rules for all steps
    - ga4-foundation-001
    - ga4-protocol-001
```

## Action Handlers

### Built-in Handlers

All built-in action handlers are registered by default:

```typescript
import { getDefaultActionRegistry } from 'analytics-validation-tool';

const registry = getDefaultActionRegistry();
// Includes: Navigate, Click, Type, Submit, Wait, Assert, Screenshot
```

### Custom Action Handlers

Create custom action handlers:

```typescript
import { BaseActionHandler } from 'analytics-validation-tool';
import type { JourneyAction, ActionResult } from 'analytics-validation-tool';

// Define custom action type
interface CustomAction extends JourneyAction {
  type: 'custom';
  customParam: string;
}

// Implement handler
class CustomActionHandler extends BaseActionHandler<CustomAction> {
  readonly type = 'custom';

  async execute(
    action: CustomAction,
    page: Page,
    context: Record<string, unknown>
  ): Promise<ActionResult> {
    const startTime = Date.now();

    try {
      // Your custom logic here
      await page.evaluate((param) => {
        console.log('Custom action:', param);
      }, action.customParam);

      const duration = Date.now() - startTime;
      return this.createSuccessResult(action, duration, context);
    } catch (error) {
      const duration = Date.now() - startTime;
      return this.createFailureResult(action, duration, error);
    }
  }
}

// Register handler
import { ActionHandlerRegistry } from 'analytics-validation-tool';

const registry = new ActionHandlerRegistry();
registry.register(new CustomActionHandler());
```

## Reporting

### Journey Reports

Journey execution produces comprehensive reports:

```typescript
const result = await engine.execute(journey, rules);

// Access journey-level data
console.log(`Journey: ${result.name}`);
console.log(`Status: ${result.status}`);
console.log(`Duration: ${result.duration}ms`);

// Access step-level data
result.steps.forEach(step => {
  console.log(`\nStep: ${step.stepName}`);
  console.log(`  Status: ${step.status}`);
  console.log(`  Duration: ${step.duration}ms`);

  // Action results
  step.actions.forEach(action => {
    console.log(`  Action: ${action.action.type} - ${action.status}`);
  });

  // Analytics data
  if (step.scan) {
    console.log(`  Network Requests: ${step.scan.requests.length}`);
  }

  if (step.detection) {
    console.log(`  Tags Found: ${step.detection.tags.length}`);
  }

  if (step.validation) {
    console.log(`  Validation Score: ${step.validation.summary.score}/100`);
    console.log(`  Issues: ${step.validation.summary.issues.total}`);
  }
});
```

### Aggregate Reports

Build aggregate reports from multiple journeys:

```typescript
import { ReportBuilder, ConsoleFormatter } from 'analytics-validation-tool';

// Execute multiple journeys
const results = await Promise.all(
  journeys.map(j => engine.execute(j, rules))
);

// Extract page reports from all journey steps
const pageReports = results.flatMap(journeyResult =>
  journeyResult.steps
    .filter(step => step.scan && step.detection)
    .map(step => ({
      scan: step.scan!,
      detection: step.detection!,
      validation: step.validation,
    }))
);

// Build aggregate report
const reportBuilder = new ReportBuilder();
const runReport = reportBuilder.buildRunReport(pageReports);

// Format output
const formatter = new ConsoleFormatter({ useColors: true });
console.log(formatter.formatRun(runReport));
```

## Best Practices

### 1. Structure Journeys by User Goal

Each journey should represent a complete user goal:

- ✅ Checkout journey: Product → Cart → Purchase
- ✅ Registration journey: Signup → Verify → Complete
- ❌ Mixed journey: Browse products + signup + checkout

### 2. Validate at Each Critical Step

Capture analytics at steps where important events fire:

```yaml
steps:
  - id: add-to-cart
    name: Add to Cart
    actions:
      - type: click
        selector: .add-to-cart
    captureAnalytics: true  # Capture add_to_cart event

  - id: fill-email
    name: Fill Email
    actions:
      - type: type
        selector: input[name="email"]
        value: test@example.com
    captureAnalytics: false  # No analytics event expected
```

### 3. Use Assertions for Flow Validation

Verify the journey is progressing correctly:

```yaml
- type: assert
  assertType: url
  expected: /checkout
  operator: contains
  message: Should navigate to checkout page

- type: assert
  assertType: visible
  selector: .success-message
  message: Success message should appear
```

### 4. Handle Timeouts Appropriately

Set realistic timeouts based on page load times:

```yaml
# Long timeout for page navigation
- type: navigate
  url: https://example.com
  timeout: 60000

# Short timeout for already-loaded elements
- type: click
  selector: button.add-to-cart
  timeout: 5000

# Medium timeout for analytics events
- type: wait
  for: dataLayer
  eventName: purchase
  timeout: 10000
```

### 5. Use Screenshots for Debugging

Capture screenshots at critical steps:

```yaml
config:
  captureScreenshots: true

steps:
  - id: checkout
    name: Checkout Page
    actions:
      - type: navigate
        url: https://example.com/checkout
      - type: screenshot
        path: screenshots/checkout.png
```

## Troubleshooting

### Journey Fails to Load

**Problem:** Journey YAML fails to load

**Solution:** Validate YAML syntax:

```bash
# Install YAML validator
npm install -g js-yaml

# Validate file
js-yaml journeys/checkout.yaml
```

### Element Not Found

**Problem:** `selector` not found errors

**Solution:** Wait for element before interacting:

```yaml
- type: click
  selector: button.add-to-cart
  waitForSelector: true  # Wait for element to be visible
  timeout: 10000
```

### Data Layer Event Not Detected

**Problem:** Wait for data layer event times out

**Solution:** Verify event name and increase timeout:

```yaml
- type: wait
  for: dataLayer
  dataLayerName: dataLayer  # Verify correct name
  eventName: purchase       # Check exact event name
  timeout: 10000            # Increase if needed
```

### Navigation Timeout

**Problem:** Page navigation times out

**Solution:** Adjust `waitUntil` strategy:

```yaml
- type: navigate
  url: https://example.com
  waitUntil: domcontentloaded  # Don't wait for all resources
  timeout: 60000
```

## Example Output

```
════════════════════════════════════════════════════════
  JOURNEY EXECUTION EXAMPLE
════════════════════════════════════════════════════════

📂 Loading journeys...
✓ Loaded 3 journeys

📋 Loading validation rules...
✓ Loaded 9 validation rules

🚀 Initializing journey engine...
✓ Journey engine initialized


════════════════════════════════════════════════════════
🎯 Executing Journey: E-commerce Checkout Journey
   ID: ecommerce-checkout-001
   Steps: 7
────────────────────────────────────────────────────────

📊 Journey Results:
   Status: ✓ SUCCESS
   Steps Completed: 7/7
   Actions Completed: 25/25
   Overall Score: 92/100
   Duration: 18.45s

📝 Step Details:
   1. ✓ View Product Page
      Actions: 4/4 succeeded
      Validation: ✓ Score: 95/100

   2. ✓ Add Product to Cart
      Actions: 4/4 succeeded
      Validation: ✓ Score: 90/100

   3. ✓ Navigate to Cart
      Actions: 4/4 succeeded
      Validation: ✓ Score: 92/100

   ... (steps 4-7)

✅ Journey completed successfully!

════════════════════════════════════════════════════════
Total execution time: 52.31s
Journeys executed: 3
Successful: 3
Failed: 0
Partial: 0
════════════════════════════════════════════════════════
```

## Next Steps

- Review [example journey definitions](../journeys/) for common patterns
- Check [validation rules](../rules/) for analytics validation
- See [examples/journey-execution.ts](../examples/journey-execution.ts) for complete code
- Read [TAG_DETECTION.md](TAG_DETECTION.md) for analytics detection details
- Read [VALIDATION.md](VALIDATION.md) for validation rule creation

---

**Built for comprehensive user journey validation** 🎯
