# JY/co WooCommerce Tracking - PRO Package
## Solution Design Reference (SDR)

**Version:** 1.0.0
**Package:** Pro
**Last Updated:** January 2025
**Author:** JY/co

---

## Table of Contents

1. [Overview](#overview)
2. [What Makes It Pro](#what-makes-it-pro)
3. [Architecture](#architecture)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Pro Features Guide](#pro-features-guide)
7. [Event Reference](#event-reference)
8. [Server-Side Tracking](#server-side-tracking)
9. [Consent Mode Integration](#consent-mode-integration)
10. [Subscriptions Tracking](#subscriptions-tracking)
11. [Testing & QA](#testing--qa)
12. [Troubleshooting](#troubleshooting)
13. [Support](#support)

---

## Overview

### Purpose

The JY/co WooCommerce Tracking Pro Package provides enterprise-grade GA4 ecommerce tracking with advanced features including server-side backup tracking, full consent mode integration, subscription lifecycle tracking, and enhanced data quality.

### Package Contents

- **WordPress Plugin:** `jyco-woocommerce-tracking-pro/` (ready to install)
- **GTM Container:** `pro-gtm-container.json` (import into GTM)
- **Documentation:** This SDR document

### Key Features

- ✅ **All Starter features** plus:
- ✅ **Server-Side Tracking** - Measurement Protocol backup for critical events
- ✅ **Consent Mode v2** - Full integration with major consent platforms
- ✅ **Subscription Tracking** - WooCommerce Subscriptions lifecycle events
- ✅ **Enhanced User Data** - LTV, customer type, cohort analysis
- ✅ **Multi-Currency Support** - Proper currency handling
- ✅ **Performance Optimized** - Lazy-loaded, deferred scripts
- ✅ **Developer Hooks** - Extensive filter/action hooks for customization

---

## What Makes It Pro

### Feature Comparison

| Feature | Starter | Pro |
|---------|---------|-----|
| **Basic Ecommerce Events** | ✅ | ✅ |
| **User Data Layer** | Basic (ID, email hash) | Enhanced (LTV, type, cohort) |
| **Product Data** | Standard fields | Custom fields + metadata |
| **Server-Side Backup** | ❌ | ✅ Measurement Protocol |
| **Consent Mode** | Basic defaults | Full platform integration |
| **Performance** | Standard | Optimized (lazy-load, defer) |
| **Multi-Currency** | Basic | ✅ Full support |
| **Subscription Support** | ❌ | ✅ Full lifecycle |
| **Custom Events API** | ❌ | ✅ Developer hooks |
| **Refund Tracking** | ❌ | ✅ Server-side |
| **Debug Logging** | Console only | Console + admin panel |

---

## Architecture

### How It Works

```
WordPress/WooCommerce
    ↓
JY/co Tracking Pro Plugin
    ↓
┌─────────────────┬──────────────────┐
│ Client-Side     │ Server-Side      │
│ (JavaScript)    │ (PHP/MP)         │
├─────────────────┼──────────────────┤
│ dataLayer       │ Direct to GA4    │
│ → GTM           │ (backup)         │
│ → GA4           │                  │
└─────────────────┴──────────────────┘
    ↓
Google Analytics 4
```

### Component Breakdown

#### Core Classes (from Starter)
- **class-jyco-datalayer.php** - DataLayer generation
- **class-jyco-events.php** - Event handling
- **class-jyco-settings.php** - Admin interface (enhanced)

#### Pro-Exclusive Classes
- **class-jyco-server-tracking.php** - Measurement Protocol integration
- **class-jyco-consent.php** - Consent Mode v2 handler
- **class-jyco-subscriptions.php** - Subscription lifecycle tracking

---

## Installation

Installation is identical to Starter package. See Starter SDR for detailed steps.

### Quick Install

1. Upload `jyco-woocommerce-tracking-pro.zip` via WordPress admin
2. Activate plugin
3. Import `pro-gtm-container.json` into GTM
4. Configure Pro settings (see below)

---

## Configuration

### Step 1: Basic Settings

Navigate to **JY/co Tracking** in WordPress admin.

#### General Settings

| Setting | Required | Description |
|---------|----------|-------------|
| **GA4 Measurement ID** | Optional for GTM-only<br>**Required for Pro features** | Your GA4 property ID (e.g., `G-XXXXXXXXXX`) |
| **GA4 API Secret** | **Required for server-side** | Generate in GA4: Admin → Data Streams → [Your stream] → Measurement Protocol API secrets |
| **Debug Mode** | Optional | Enable for testing |

##### How to Generate API Secret

1. Go to [Google Analytics](https://analytics.google.com/)
2. Navigate to **Admin** (bottom left)
3. Under **Data Collection**, click **Data Streams**
4. Click your web data stream
5. Scroll down to **Measurement Protocol API secrets**
6. Click **Create**
7. Give it a nickname: `JY/co Server Tracking`
8. Click **Create**
9. Copy the generated secret
10. Paste into plugin settings

### Step 2: Pro Features

#### Server-Side Tracking

☑️ **Enable server-side purchase tracking (backup)**

**What it does:**
- Sends purchase events directly to GA4 via Measurement Protocol
- Acts as a backup if client-side tracking fails (ad blockers, JavaScript errors, external checkouts)
- Includes additional server-side data (order metadata, customer LTV)

**Requirements:**
- GA4 Measurement ID must be configured
- GA4 API Secret must be configured

#### Consent Mode

Select your consent management platform:

| Option | Use When |
|--------|----------|
| **None** | No consent management (not GDPR compliant) |
| **Cookiebot** | Using Cookiebot plugin |
| **Complianz** | Using Complianz GDPR/CCPA Cookie Consent |
| **Cookie Notice** | Using Cookie Notice & Compliance |
| **Borlabs Cookie** | Using Borlabs Cookie plugin |
| **Manual** | Custom consent implementation |

**How it works:**
- Plugin outputs Google Consent Mode v2 defaults (all denied)
- Integrates with your consent platform's events
- Updates consent state when user accepts/rejects
- GA4 receives consent signals with all events

### Step 3: Event Settings

Enable the events you want to track (same as Starter, plus subscription events if WooCommerce Subscriptions is active).

### Step 4: Privacy Settings

Configure user role exclusions (same as Starter).

---

## Pro Features Guide

### 1. Server-Side Tracking

#### What Gets Tracked Server-Side?

| Event | Trigger | Data Sent |
|-------|---------|-----------|
| **purchase** | Order received page | Full purchase data + LTV |
| **order_completed** | Order status → Completed | Transaction confirmation |
| **refund** | Order status → Refunded | Refund data with items |

#### Advantages

✅ **Ad Blocker Proof** - Events sent server-side can't be blocked
✅ **JavaScript Error Proof** - No client-side failures
✅ **External Checkout** - Works with PayPal, Stripe redirect flows
✅ **Enhanced Data** - Access to server-side order metadata
✅ **Customer LTV** - Automatically calculated and sent

#### How It Works

```php
Order Completed
    ↓
woocommerce_thankyou hook fires
    ↓
class-jyco-server-tracking.php
    ↓
Build Measurement Protocol payload
    ↓
wp_remote_post() to GA4 API
    ↓
Event arrives in GA4
```

#### Client ID Handling

The plugin attempts to use the same client ID as GTM/GA4:
1. Reads `_ga` cookie to extract client ID
2. Falls back to generated ID if cookie not available
3. Ensures server events are associated with same user session

### 2. Consent Mode Integration

#### Supported Platforms

##### Cookiebot

```javascript
// Automatically integrates with Cookiebot events
window.addEventListener('CookiebotOnConsentReady', ...);
```

**Consent Categories:**
- `statistics` → `analytics_storage`
- `marketing` → `ad_storage`, `ad_user_data`, `ad_personalization`
- `preferences` → `functionality_storage`, `personalization_storage`

##### Complianz

```javascript
// Integrates with Complianz fire_categories event
document.addEventListener('cmplz_fire_categories', ...);
```

**Consent Categories:**
- `statistics` → `analytics_storage`
- `marketing` → `ad_storage` + advertising
- `preferences` → `functionality_storage` + personalization

##### Cookie Notice

Integrates with Cookie Notice plugin events.

##### Borlabs Cookie

Integrates with Borlabs `borlabs-cookie-consent-saved` event.

##### Manual/Custom

Provides global JavaScript function:

```javascript
// Call this function from your custom consent code
window.jycoUpdateConsent({
  analytics: true,    // User accepted analytics
  marketing: false,   // User rejected marketing
  preferences: true   // User accepted preferences
});
```

#### Consent Mode Flow

```
Page Loads
    ↓
Plugin outputs consent defaults (all denied)
    ↓
User interacts with consent banner
    ↓
Consent platform triggers event
    ↓
Plugin listens and updates consent state
    ↓
gtag('consent', 'update', {...})
    ↓
GTM and GA4 receive updated consent
    ↓
Tags fire based on consent state
```

### 3. Subscriptions Tracking

Requires **WooCommerce Subscriptions** plugin.

#### Subscription Lifecycle Events

| Event | When It Fires | Parameters |
|-------|---------------|------------|
| `subscription_start` | Subscription activated | subscription_id, value, billing_period, has_trial |
| `subscription_cancel` | Subscription cancelled | subscription_id, cancellation_reason, subscription_length |
| `subscription_expire` | Subscription expired | subscription_id, total_renewals |
| `subscription_pending_cancel` | Marked for cancellation | subscription_id |
| `subscription_renewal` | Renewal payment success | transaction_id, subscription_id, renewal_number |
| `subscription_renewal_failed` | Renewal payment failed | subscription_id, renewal_number |
| `subscription_reactivate` | Reactivated from on-hold | subscription_id |
| `subscription_trial_end` | Trial period ends | trial_days, converted (boolean) |

#### Example: Subscription Start Event

```javascript
{
  "event": "subscription_start",
  "subscription_id": "123",
  "value": 29.99,
  "currency": "USD",
  "billing_period": "month",
  "billing_interval": 1,
  "has_trial": true,
  "trial_days": 14,
  "items": [
    {
      "item_id": "456",
      "item_name": "Premium Subscription",
      "price": 29.99,
      "quantity": 1,
      "subscription_item": true
    }
  ]
}
```

#### Setting Up GTM Tags for Subscriptions

1. **Create Data Layer Variables**
   - `DLV - subscription_id`
   - `DLV - cancellation_reason`
   - `DLV - renewal_number`
   - etc.

2. **Create Custom Event Triggers**
   - Trigger Type: Custom Event
   - Event name: `subscription_start`
   - Repeat for each subscription event

3. **Create GA4 Event Tags**
   - Tag Type: GA4 Event
   - Event Name: `subscription_start`
   - Add Event Parameters from DLVs

### 4. Enhanced User Data

Pro package automatically includes enhanced user data:

```javascript
"user": {
  "logged_in": true,
  "user_id": "123",
  "user_email": "abc123...",  // SHA-256 hash
  "user_role": "customer",
  // Pro additions:
  "customer_type": "returning",  // new, returning, guest
  "customer_ltv": 1234.56,      // Lifetime value
  "total_orders": 15,            // Order count
  "member_since": "2023-01-15"   // Registration date
}
```

---

## Event Reference

### Standard Events

See Starter SDR for full standard event reference (view_item, add_to_cart, purchase, etc.)

### Pro-Exclusive Events

#### subscription_start
**When:** Subscription status changes to active
**Data:**
```javascript
{
  "event": "subscription_start",
  "subscription_id": "string",
  "value": number,
  "currency": "string",
  "billing_period": "day|week|month|year",
  "billing_interval": number,
  "has_trial": boolean,
  "trial_days": number,
  "items": []
}
```

#### subscription_cancel
**When:** Subscription is cancelled
**Data:**
```javascript
{
  "event": "subscription_cancel",
  "subscription_id": "string",
  "value": number,
  "currency": "string",
  "cancellation_reason": "string",
  "subscription_length": number (days),
  "total_renewals": number
}
```

#### subscription_renewal
**When:** Subscription renewal payment succeeds
**Data:**
```javascript
{
  "event": "subscription_renewal",
  "transaction_id": "string",
  "subscription_id": "string",
  "value": number,
  "tax": number,
  "shipping": number,
  "currency": "string",
  "renewal_number": number,
  "items": []
}
```

#### order_completed
**When:** Order status changes to completed (server-side)
**Data:**
```javascript
{
  "transaction_id": "string",
  "value": number,
  "currency": "string"
}
```

#### refund
**When:** Order is refunded (server-side)
**Data:**
```javascript
{
  "transaction_id": "string",
  "value": number,
  "currency": "string",
  "items": []
}
```

---

## Server-Side Tracking

### Measurement Protocol

GA4 Measurement Protocol allows sending events directly to GA4 from your server.

#### Endpoint

```
Production: https://www.google-analytics.com/mp/collect
Debug:      https://www.google-analytics.com/debug/mp/collect
```

#### Request Format

```php
POST https://www.google-analytics.com/mp/collect?measurement_id=G-XXXXXX&api_secret=SECRET

{
  "client_id": "123.456",
  "user_id": "789",
  "events": [{
    "name": "purchase",
    "params": {
      "transaction_id": "T12345",
      "value": 99.99,
      "currency": "USD",
      "items": [...]
    }
  }],
  "user_properties": {
    "customer_ltv": 1234.56
  }
}
```

### Implementation in Plugin

The plugin handles this automatically in `class-jyco-server-tracking.php`:

```php
// Fires on thank you page
add_action( 'woocommerce_thankyou', array( $this, 'track_purchase' ), 20, 1 );

// Builds payload
$payload = array(
    'client_id' => $this->get_client_id(),  // From _ga cookie
    'user_id'   => $customer_id,
    'events'    => array( $event ),
    'user_properties' => array(
        'customer_type' => 'returning',
        'customer_ltv'  => 1234.56
    )
);

// Sends via wp_remote_post (non-blocking)
wp_remote_post( $url, array(
    'body'     => wp_json_encode( $payload ),
    'blocking' => false  // Don't wait for response
));
```

### Debugging Server-Side Events

1. Enable Debug Mode in plugin settings
2. Server events are sent to debug endpoint
3. Check admin panel for server tracking logs:
   - Go to **JY/co Tracking → Server Logs** (if viewing logs feature enabled)
   - Or check WordPress debug.log

### Testing Server-Side Tracking

#### Using GA4 DebugView

1. Enable Debug Mode in plugin
2. Place a test order
3. Go to GA4 → Configure → DebugView
4. Look for events with `_ss` suffix (server-side indicator)

#### Using Postman/cURL

Test the Measurement Protocol directly:

```bash
curl -X POST 'https://www.google-analytics.com/debug/mp/collect?measurement_id=G-XXXXXX&api_secret=YOUR_SECRET' \
-H 'Content-Type: application/json' \
-d '{
  "client_id": "test.123",
  "events": [{
    "name": "test_event",
    "params": {
      "test_param": "test_value"
    }
  }]
}'
```

Response will show validation results.

---

## Consent Mode Integration

### Google Consent Mode v2

Google Consent Mode v2 (released 2023) includes 6 consent types:

| Consent Type | Purpose |
|--------------|---------|
| `analytics_storage` | Analytics cookies (GA4) |
| `ad_storage` | Advertising cookies |
| `ad_user_data` | Sending user data to Google for advertising |
| `ad_personalization` | Personalized advertising |
| `functionality_storage` | Functionality cookies (preferences) |
| `personalization_storage` | Personalization features |
| `security_storage` | Security-related (always granted) |

### Implementation

#### 1. Set Defaults (Before GTM)

```javascript
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'functionality_storage': 'denied',
  'personalization_storage': 'denied',
  'security_storage': 'granted',
  'wait_for_update': 500
});
</script>
<!-- GTM loads here -->
```

#### 2. Update on Consent

```javascript
gtag('consent', 'update', {
  'analytics_storage': 'granted',  // User accepted
  'ad_storage': 'denied'           // User rejected
});
```

### Testing Consent Mode

1. Open browser DevTools → Console
2. Type `dataLayer` and press Enter
3. Look for `consent` commands:

```javascript
[
  {0: "consent", 1: "default", 2: {analytics_storage: "denied", ...}},
  {0: "consent", 1: "update", 2: {analytics_storage: "granted", ...}}
]
```

4. In GA4, go to Admin → Data Collection → Show Advanced Settings
5. Verify "Consent signals" section shows your consent state

---

## Testing & QA

### Pro-Specific Testing

#### Test Server-Side Purchase

1. Enable Debug Mode
2. Place a test order
3. On thank you page, check:
   - WordPress debug.log for Measurement Protocol request
   - GA4 DebugView for server-side event
4. Look for post meta `_jyco_server_tracked` on order

```php
// Check via WP-CLI
wp post meta get ORDER_ID _jyco_server_tracked
```

#### Test Consent Mode

1. Set Consent Mode to your platform
2. Clear cookies and visit site
3. Open DevTools Console
4. Accept/reject consent in banner
5. Verify `gtag('consent', 'update', ...)` fires
6. Check GTM Preview for consent signal

#### Test Subscription Events

Requires WooCommerce Subscriptions:

1. Create test subscription product
2. Purchase subscription
3. Verify `subscription_start` event fires
4. Cancel subscription
5. Verify `subscription_cancel` event with cancellation reason
6. Manually trigger renewal (WooCommerce → Subscriptions → Process Renewal)
7. Verify `subscription_renewal` event

---

## Troubleshooting

### Server-Side Tracking Issues

#### Issue: Events Not Arriving in GA4

**Check:**
1. Measurement ID is correct (G-XXXXXXXXXX)
2. API Secret is correct (no extra spaces)
3. Debug mode enabled - check logs
4. Order meta `_jyco_server_tracked` exists

**Test:**
```php
// Add to functions.php temporarily
add_action('wp_footer', function() {
    $measurement_id = get_option('jyco_measurement_id');
    $api_secret = get_option('jyco_api_secret');
    echo "<!-- Measurement ID: $measurement_id | API Secret: " . substr($api_secret, 0, 5) . "... -->";
});
```

#### Issue: Duplicate Purchase Events

**Cause:** Both client-side and server-side firing

**Solution:**
- Plugin prevents this by checking `_jyco_tracked` meta
- If still occurring, check for other tracking plugins

#### Issue: Client ID Mismatch

**Symptom:** Server events show different user than client events

**Solution:**
```php
// Debug client ID in functions.php
add_action('wp_footer', function() {
    if (isset($_COOKIE['_ga'])) {
        $ga_cookie = $_COOKIE['_ga'];
        echo "<!-- GA Cookie: $ga_cookie -->";
    }
});
```

### Consent Mode Issues

#### Issue: Consent Not Updating

**Check:**
1. Correct consent platform selected in settings
2. Consent plugin is active
3. DevTools Console for errors
4. dataLayer for `consent` commands

**Debug:**
```javascript
// In console
dataLayer.filter(x => x[0] === 'consent')
```

#### Issue: Tags Firing Before Consent

**Solution:**
1. Ensure consent defaults load before GTM
2. Check GTM tag triggers have consent checks
3. Increase `wait_for_update` to 1000ms

### Subscription Tracking Issues

#### Issue: Subscription Events Not Firing

**Check:**
1. WooCommerce Subscriptions plugin active
2. Event is in enabled events list
3. Subscription status actually changed
4. Check session for `jyco_pending_subscription_event`

---

## Developer Customization

### Available Hooks

#### Filters

```php
// Modify dataLayer data
add_filter( 'jyco_datalayer_data', 'custom_datalayer', 10, 1 );

// Modify user data
add_filter( 'jyco_user_data', 'custom_user_data', 10, 1 );

// Modify item format
add_filter( 'jyco_format_item', 'custom_item', 10, 4 );

// Set product brand
add_filter( 'jyco_product_brand', 'custom_brand', 10, 2 );

// Modify server-side event data (Pro)
add_filter( 'jyco_server_event_data', 'custom_server_event', 10, 2 );

// Modify user properties for server events (Pro)
add_filter( 'jyco_server_user_properties', 'custom_user_props', 10, 2 );
```

#### Actions

```php
// Before server event sent (Pro)
add_action( 'jyco_before_server_event', 'before_send', 10, 2 );

// After server event sent (Pro)
add_action( 'jyco_after_server_event', 'after_send', 10, 2 );

// Before subscription event (Pro)
add_action( 'jyco_before_subscription_event', 'before_sub', 10, 2 );
```

### Example: Add Custom User Property

```php
add_filter( 'jyco_user_data', function( $user_data ) {
    if ( is_user_logged_in() ) {
        $user = wp_get_current_user();

        // Add custom meta
        $user_data['membership_level'] = get_user_meta( $user->ID, 'membership_level', true );

        // Add order frequency
        $orders = wc_get_orders( array(
            'customer_id' => $user->ID,
            'limit'       => -1,
            'status'      => 'completed'
        ));

        $user_data['order_frequency'] = count( $orders ) > 0
            ? 'frequent_buyer'
            : 'occasional_buyer';
    }

    return $user_data;
});
```

---

## Support

### Documentation

Full documentation: **https://jyco.io/docs/woocommerce-tracking-pro**

### Priority Support

Pro package includes priority email support:
- **Email:** pro-support@jyco.io
- **Response Time:** Within 24 hours (business days)

### Consulting Services

Need custom implementation?
- **Email:** hello@jyco.io
- Custom event tracking
- Complex data layer requirements
- GA4 property setup and configuration

---

## Changelog

### Version 1.0.0 (January 2025)

**Initial Pro Release**

- ✅ All Starter features included
- ✅ Server-side purchase tracking via Measurement Protocol
- ✅ Google Consent Mode v2 integration
  - Cookiebot support
  - Complianz support
  - Cookie Notice support
  - Borlabs Cookie support
  - Manual/custom implementation
- ✅ WooCommerce Subscriptions full lifecycle tracking
  - Start, cancel, expire, renewal events
  - Trial tracking
  - Cancellation reasons
- ✅ Enhanced user data (LTV, customer type)
- ✅ Refund tracking (server-side)
- ✅ Order completion tracking
- ✅ Developer hooks for customization
- ✅ Advanced debugging and logging

---

## License

This plugin is proprietary software licensed to the purchaser for use on their WordPress installations.

**© 2025 JY/co. All rights reserved.**

---

**End of Document**
