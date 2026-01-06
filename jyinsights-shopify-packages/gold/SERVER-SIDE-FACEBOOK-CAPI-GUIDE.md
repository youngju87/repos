# Server-Side Facebook Conversions API (CAPI) Setup Guide

**Package:** JY Insights Gold Plus
**Version:** 1.2
**Last Updated:** January 6, 2026
**Support:** contact@jyinsights.com

---

## Table of Contents

1. [Overview](#overview)
2. [Why Facebook CAPI?](#why-facebook-capi)
3. [Architecture](#architecture)
4. [Prerequisites](#prerequisites)
5. [Setup Steps](#setup-steps)
6. [Configuration](#configuration)
7. [Testing & Validation](#testing--validation)
8. [Troubleshooting](#troubleshooting)

---

## Overview

Facebook Conversions API (CAPI) is the server-side complement to the Meta Pixel. Instead of sending events directly from the user's browser to Facebook, events are sent from your server. This provides better data accuracy, improved attribution, and enhanced privacy controls.

### What is CAPI?

- **Meta Pixel (Browser)**: User's Browser → Facebook (client-side)
- **CAPI (Server)**: User's Browser → Your Server → Facebook (server-side)
- **Hybrid Approach**: Both Meta Pixel + CAPI running simultaneously (RECOMMENDED)

---

## Why Facebook CAPI?

### Benefits

✅ **Improved Event Matching & Attribution**
- Bypass iOS 14.5+ App Tracking Transparency (ATT) restrictions
- Bypass browser ad blockers and tracking prevention
- Recover 20-40% of lost conversion data
- Better attribution for campaigns

✅ **Enhanced Data Quality**
- Send hashed PII (email, phone) securely from server
- More reliable event deduplication
- Accurate conversion values and customer data
- Reduced data loss from network issues

✅ **Extended Attribution Windows**
- 7-day click attribution (vs. 1-day for pixel-only in iOS)
- Better understanding of customer journey
- More accurate ROAS (Return on Ad Spend)

✅ **Privacy & Compliance**
- Keep first-party data on your server
- Hash PII server-side (more secure than browser)
- Better control over what data is sent
- GDPR/CCPA compliant with consent signals

### Trade-offs

⚠️ **Requires Server Infrastructure**
- Needs server-side GTM (see `SERVER-SIDE-GA4-GUIDE.md`)
- ~$50-200/month cloud hosting costs

⚠️ **Setup Complexity**
- More complex than pixel-only setup
- Requires Access Token management
- Event deduplication must be configured correctly

⚠️ **Maintenance**
- Access tokens expire (need renewal)
- Requires monitoring and updates

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│                                                                 │
│  ┌────────────────┐         ┌──────────────────┐              │
│  │ Shopify Store  │────────>│  Client GTM      │              │
│  │ (Data Layer)   │         │  (Web Container) │              │
│  │                │         │                  │              │
│  │ Gold Plus      │         │  ┌────────────┐  │              │
│  │ Tracking Code  │         │  │ Meta Pixel │  │ (Client-side)│
│  └────────────────┘         │  │ Base Code  │  │──────────────┼──┐
│                              │  └────────────┘  │              │  │
│                              └──────────────────┘              │  │
│                                      │                          │  │
└──────────────────────────────────────┼──────────────────────────┘  │
                                       │                              │
                                       │ HTTPS (first-party)          │
                                       ▼                              │
┌─────────────────────────────────────────────────────────────────┐  │
│              SERVER-SIDE GTM CONTAINER (sGTM)                   │  │
│                  (Google Cloud Platform)                        │  │
│                                                                 │  │
│  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  Server GTM Container                                   │  │  │
│  │  - Receives events from client                          │  │  │
│  │  - Deduplicates events (pixel vs. server)               │  │  │
│  │  - Enriches with server-side data                       │  │  │
│  │  - Sends to Facebook CAPI                               │  │  │
│  │                                                          │  │  │
│  │  ┌──────────────────────┐                               │  │  │
│  │  │  CAPI Tag            │                               │  │  │
│  │  │  - event_id          │ (Server-side)                │  │  │
│  │  │  - event_name        │──────────────┐               │  │  │
│  │  │  - user_data (hash)  │              │               │  │  │
│  │  │  - custom_data       │              │               │  │  │
│  │  └──────────────────────┘              │               │  │  │
│  └─────────────────────────────────────────┼───────────────┘  │  │
│                                            │                   │  │
└────────────────────────────────────────────┼───────────────────┘  │
                                             │                      │
                                             ▼                      │
                                  ┌─────────────────────┐           │
                                  │  Facebook CAPI      │           │
                                  │  (Server Hit)       │◄──────────┘
                                  │                     │  (Pixel Hit)
                                  │  - Event Matching   │
                                  │  - Deduplication    │◄──────────┐
                                  │  - Attribution      │           │
                                  └─────────────────────┘           │
                                             │                      │
                                             ▼                      │
                                  ┌─────────────────────┐           │
                                  │  Facebook Events    │           │
                                  │  Manager            │◄──────────┘
                                  │  - Event Dashboard  │
                                  │  - Match Quality    │
                                  │  - Diagnostics      │
                                  └─────────────────────┘
```

### Hybrid Setup (Recommended)

Send events from **BOTH** browser (Meta Pixel) AND server (CAPI):
- **Better matching**: Facebook compares both signals
- **Redundancy**: If one fails, the other succeeds
- **Higher match quality**: Combined data improves attribution

---

## Prerequisites

### Required Accounts & Access

1. **Facebook Business Manager** account
   - Admin access
   - Facebook Pixel created

2. **Meta Events Manager** access
   - Permissions to manage Conversions API

3. **Server-Side GTM** container deployed
   - See `SERVER-SIDE-GA4-GUIDE.md`
   - Custom domain recommended (e.g., `analytics.yourstore.com`)

### Required Information

- **Facebook Pixel ID**: Find in Events Manager
- **Access Token**: Generate from Events Manager (Conversions API section)
- **Test Event Code**: (optional) For testing CAPI events

---

## Setup Steps

### Step 1: Generate Facebook CAPI Access Token

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager2)
2. Select your **Pixel**
3. Click **Settings** (left sidebar)
4. Scroll to **Conversions API** section
5. Click **Generate Access Token**
6. Choose **System User** (recommended) or **Manual Token**
   - **System User**: More secure, doesn't expire when admin leaves
   - **Manual Token**: Easier setup, expires when user loses access
7. Copy the **Access Token** (starts with `EAAA...`)
8. **IMPORTANT**: Store securely (treat like a password)

### Step 2: Configure Test Events (Optional but Recommended)

1. In Events Manager > Conversions API > **Test Events**
2. Click **Generate Test Code**
3. Copy the **Test Event Code** (e.g., `TEST12345`)
4. Use during setup to verify events are received

### Step 3: Create Facebook CAPI Tag in Server GTM

1. Open your **Server GTM container**
2. Go to **Tags** > **New**
3. **Tag Configuration**:
   - **Tag Type**: Facebook Conversions API
   - **Name**: `Meta CAPI - All Events`

4. **Facebook Configuration**:
   - **Pixel ID**: `{{Const - Meta Pixel ID}}` (create variable)
   - **API Access Token**: `{{Const - Meta Access Token}}` (create variable)
   - **Test Event Code**: `{{Const - Meta Test Code}}` (optional, for testing)

5. **Event Details**:
   - **Event Name**: `{{Event Name}}` (use automatic event mapping)
   - **Event ID**: `{{Event ID}}` (CRITICAL for deduplication)
   - **Event Time**: `{{Event Time}}`
   - **Event Source URL**: `{{Page URL}}`
   - **Action Source**: `website`

6. **Customer Information (User Data)**:
   - **Email**: `{{Event Data - email_sha256}}`
   - **Phone**: `{{Event Data - phone_sha256}}`
   - **First Name**: `{{Event Data - first_name}}` (optional)
   - **Last Name**: `{{Event Data - last_name}}` (optional)
   - **City**: `{{Event Data - city}}`
   - **State**: `{{Event Data - state}}`
   - **Zip**: `{{Event Data - zip}}`
   - **Country**: `{{Event Data - country}}`
   - **Client User Agent**: `{{User Agent}}`
   - **Client IP Address**: `{{IP Address}}`
   - **FBC**: `{{Event Data - fbc}}` (Facebook click ID cookie)
   - **FBP**: `{{Event Data - fbp}}` (Facebook browser ID cookie)

7. **Custom Data** (for purchase events):
   - **Value**: `{{Event Data - ecommerce.value}}`
   - **Currency**: `{{Event Data - ecommerce.currency}}`
   - **Content IDs**: `{{Event Data - ecommerce.content_ids}}`
   - **Content Type**: `product`
   - **Contents**: `{{Event Data - ecommerce.items}}`

8. **Triggering**:
   - **Trigger**: All Events (or specific events: purchase, add_to_cart, etc.)

9. **Save** the tag

### Step 4: Create Required Variables in Server GTM

Create these **Constant** variables:

#### Variable: Meta Pixel ID
- **Type**: Constant
- **Name**: `Const - Meta Pixel ID`
- **Value**: `YOUR_PIXEL_ID` (e.g., `123456789012345`)

#### Variable: Meta Access Token
- **Type**: Constant
- **Name**: `Const - Meta Access Token`
- **Value**: `EAAXXXXXXXXXX` (your access token)
- **⚠️ SECURITY**: Consider using Google Secret Manager instead

#### Variable: Meta Test Code (Optional)
- **Type**: Constant
- **Name**: `Const - Meta Test Code`
- **Value**: `TEST12345` (your test event code)

Create these **Event Data** variables:

#### User Data Variables
- `Event Data - email_sha256` → Key: `user_data.email_sha256`
- `Event Data - phone_sha256` → Key: `user_data.phone_sha256`
- `Event Data - city` → Key: `user_data.city`
- `Event Data - state` → Key: `user_data.state`
- `Event Data - zip` → Key: `user_data.zip`
- `Event Data - country` → Key: `user_data.country`
- `Event Data - fbc` → Key: `fbc` (Facebook click ID cookie)
- `Event Data - fbp` → Key: `fbp` (Facebook browser ID cookie)

#### Ecommerce Variables
- `Event Data - ecommerce.value` → Key: `ecommerce.value`
- `Event Data - ecommerce.currency` → Key: `ecommerce.currency`
- `Event Data - ecommerce.items` → Key: `ecommerce.items`
- `Event Data - ecommerce.content_ids` → Custom JavaScript:
  ```javascript
  function() {
    var items = {{Event Data - ecommerce.items}};
    return items ? items.map(function(item) { return item.item_id; }) : [];
  }
  ```

#### System Variables
- `Event Name` → Type: Event Data, Key: `event_name`
- `Event ID` → Type: Event Data, Key: `event_id` (CRITICAL)
- `Event Time` → Type: Event Data, Key: `event_time`
- `Page URL` → Type: Event Data, Key: `page_location`
- `User Agent` → Type: Event Data, Key: `user_agent`
- `IP Address` → Type: Event Data, Key: `ip_override`

### Step 5: Configure Event Deduplication

**Event deduplication** prevents double-counting when the same event is sent via both Meta Pixel (browser) and CAPI (server).

#### How Deduplication Works

Facebook uses `event_id` to match events from different sources:
- **Same event_id**: Counted once (deduplicated)
- **Different event_id**: Counted separately

#### Generate event_id in Client GTM

1. In **Client GTM** (web container), create a **Custom JavaScript** variable:

```javascript
// Variable Name: Generate Event ID
function() {
  // Generate unique ID: timestamp + random number
  return Date.now().toString() + Math.random().toString(36).substring(2, 15);
}
```

2. Update **Meta Pixel** tags in client GTM to include `event_id`:

```javascript
// In Meta Pixel PageView tag
fbq('track', 'PageView', {}, {
  eventID: {{Generate Event ID}}
});

// In Meta Pixel Purchase tag
fbq('track', 'Purchase', {
  value: {{ecommerce.value}},
  currency: '{{ecommerce.currency}}'
}, {
  eventID: {{Generate Event ID}}
});
```

3. Push `event_id` to data layer for server GTM:

```javascript
window.dataLayer.push({
  event: 'purchase',
  event_id: {{Generate Event ID}},  // Include event_id
  ecommerce: { /* ... */ }
});
```

4. In **Server GTM**, the `Event ID` variable will capture this from data layer

### Step 6: Map Events to Facebook Standard Events

Facebook recognizes standard event names. Map your GA4 events:

| GA4 Event | Facebook Event |
|-----------|----------------|
| page_view | PageView |
| view_item | ViewContent |
| add_to_cart | AddToCart |
| begin_checkout | InitiateCheckout |
| add_payment_info | AddPaymentInfo |
| purchase | Purchase |
| search | Search |

#### Option A: Use Event Name Mapping in CAPI Tag

In your CAPI tag, use a **Custom JavaScript** variable for event name mapping:

```javascript
// Variable Name: Facebook Event Name
function() {
  var eventName = {{Event Name}};

  var eventMap = {
    'page_view': 'PageView',
    'view_item': 'ViewContent',
    'add_to_cart': 'AddToCart',
    'begin_checkout': 'InitiateCheckout',
    'add_payment_info': 'AddPaymentInfo',
    'purchase': 'Purchase',
    'search': 'Search'
  };

  return eventMap[eventName] || eventName;
}
```

Then use `{{Facebook Event Name}}` in your CAPI tag instead of `{{Event Name}}`.

#### Option B: Create Separate Tags per Event

More control but more tags:
- **Meta CAPI - PageView** (trigger: page_view)
- **Meta CAPI - Purchase** (trigger: purchase)
- **Meta CAPI - AddToCart** (trigger: add_to_cart)
- etc.

### Step 7: Test & Publish

1. In Server GTM, click **Preview**
2. Enter your server URL: `https://analytics.yourstore.com`
3. Visit your store and trigger events
4. In Preview mode, verify CAPI tag fires
5. Check Events Manager > Test Events for incoming events
6. When satisfied, **Submit** and **Publish** server container

---

## Configuration

### Enhanced Data Parameters

#### Purchase Event

Send detailed purchase data to CAPI:

```javascript
{
  event_name: 'purchase',
  event_id: 'unique-id-123',
  event_time: 1704556800,
  user_data: {
    email_sha256: 'hashed-email',
    phone_sha256: 'hashed-phone',
    city: 'san francisco',
    state: 'CA',
    country: 'US',
    zip: '94102',
    fbc: 'fb.1.123456789.xyz',  // Facebook click ID
    fbp: 'fb.1.987654321.abc'   // Facebook browser ID
  },
  custom_data: {
    value: 99.97,
    currency: 'USD',
    content_ids: ['40123456789', '40123456790'],
    content_type: 'product',
    content_name: 'Blue T-Shirt, Red Hat',
    num_items: 2,
    contents: [
      { id: '40123456789', quantity: 1, item_price: 29.99 },
      { id: '40123456790', quantity: 2, item_price: 19.99 }
    ]
  }
}
```

#### FBC and FBP Cookies

Critical for attribution matching:

**FBC (Facebook Click ID)**: Captures Facebook ad clicks
- Automatically set by Facebook when user clicks an ad
- Cookie name: `_fbc`
- Expires: 90 days

**FBP (Facebook Browser ID)**: Identifies browser
- Automatically set by Meta Pixel
- Cookie name: `_fbp`
- Expires: 90 days

**How to send to server**:

In **Client GTM**, create **1st Party Cookie** variables:
- `Cookie - fbc` → Cookie Name: `_fbc`
- `Cookie - fbp` → Cookie Name: `_fbp`

Push to data layer:
```javascript
window.dataLayer.push({
  event: 'purchase',
  fbc: {{Cookie - fbc}},
  fbp: {{Cookie - fbp}},
  // ... other data
});
```

### Consent Mode Integration

Respect user consent for Facebook tracking:

1. Ensure your Consent Management Platform (Cookiebot, OneTrust, etc.) is configured
2. In Client GTM, gate Meta Pixel with consent:
   - **Consent Initialization** trigger
   - **Consent Required**: Marketing
3. Server CAPI automatically respects consent signals forwarded from client

---

## Testing & Validation

### 1. Test Events in Events Manager

1. Go to [Events Manager](https://business.facebook.com/events_manager2)
2. Select your **Pixel**
3. Click **Test Events** (left sidebar)
4. Enter your **Test Event Code** in CAPI tag (if not already)
5. Visit your store and trigger events
6. Verify events appear in Test Events dashboard:
   - **Event Name**: Correct (PageView, Purchase, etc.)
   - **Event Time**: Recent timestamp
   - **Event ID**: Present (for deduplication)
   - **User Data**: Email/phone hashes present
   - **Custom Data**: Purchase value, currency, content_ids

### 2. Check Event Match Quality

1. In Events Manager, go to **Overview**
2. Scroll to **Event Match Quality** score
3. Target: **Good** or **Excellent** (60%+)
4. Factors affecting match quality:
   - Email provided: +30%
   - Phone provided: +20%
   - FBC/FBP cookies: +15%
   - Address data: +10%

### 3. Verify Deduplication

1. Go to Events Manager > **Overview** > **Activity**
2. Look for **Deduplicated Events** metric
3. Should show events received from both Pixel and Server
4. Click event to see **Event Sources**: Browser + Server

### 4. Server GTM Preview Mode

1. In Server GTM, click **Preview**
2. Visit your store and trigger events
3. In Preview mode, check:
   - CAPI tag fires
   - All user_data fields populated
   - custom_data correct for purchase events
   - event_id present
4. Check **Outgoing HTTP Requests** tab for successful POST to Facebook

### 5. Test Purchase Event End-to-End

1. Visit your store with test event code enabled
2. Add product to cart
3. Complete checkout and purchase
4. Verify in Events Manager > Test Events:
   - **AddToCart** event received
   - **InitiateCheckout** event received
   - **Purchase** event received with correct value, currency, content_ids

---

## Troubleshooting

### Issue: Events Not Appearing in Events Manager

**Symptoms**: No events in Test Events dashboard

**Solutions**:
1. Verify **Access Token** is correct and not expired
2. Check **Pixel ID** matches your Events Manager pixel
3. Verify Server GTM CAPI tag is firing (use Preview mode)
4. Check server logs for error responses from Facebook API
5. Ensure test event code is entered correctly (if using)

### Issue: Low Event Match Quality Score

**Symptoms**: Match quality < 60%, poor attribution

**Solutions**:
1. **Add more user data parameters**:
   - Email (SHA-256 hashed) → +30%
   - Phone (SHA-256 hashed) → +20%
   - FBC/FBP cookies → +15%
   - Address (city, state, zip, country) → +10%
2. **Verify hashing is correct**:
   - Use SHA-256
   - Lowercase and trim before hashing
   - Gold Plus package handles this automatically
3. **Check FBC/FBP cookies are sent**:
   - Verify `_fbc` and `_fbp` cookies exist in browser
   - Ensure they're forwarded to server GTM

### Issue: Events Not Being Deduplicated

**Symptoms**: Same event counted twice (once from pixel, once from server)

**Solutions**:
1. Verify `event_id` is identical for pixel and server events
2. Check `event_id` is generated ONCE and reused for both
3. Ensure pixel event includes `eventID` parameter:
   ```javascript
   fbq('track', 'Purchase', { value: 99 }, { eventID: '123abc' });
   ```
4. Verify server CAPI tag uses same `event_id` from data layer

### Issue: Purchase Events Missing Value or Currency

**Symptoms**: Purchase events in Events Manager show no value/currency

**Solutions**:
1. Verify ecommerce data is in data layer:
   ```javascript
   {
     event: 'purchase',
     ecommerce: {
       value: 99.97,
       currency: 'USD'
     }
   }
   ```
2. Check Server GTM variables capture ecommerce.value and ecommerce.currency
3. Verify CAPI tag maps these to custom_data.value and custom_data.currency

### Issue: Access Token Expired

**Symptoms**: Events suddenly stop working, 401 errors in logs

**Solutions**:
1. Generate new access token in Events Manager
2. Update `Const - Meta Access Token` variable in Server GTM
3. **Prevention**: Use **System User** token (doesn't expire with user access changes)

### Issue: FBC Cookie Not Captured

**Symptoms**: Low match quality, missing attribution from Facebook ads

**Solutions**:
1. Verify user clicked a Facebook ad (FBC only set on ad clicks)
2. Check `_fbc` cookie exists in browser (DevTools > Application > Cookies)
3. Ensure cookie is forwarded to server:
   - Client GTM captures `_fbc` cookie value
   - Pushes to data layer
   - Server GTM reads from event data
4. Check domain configuration (FBC requires matching domain)

---

## Advanced Configuration

### Server-Side Event Transformation

Transform events before sending to Facebook:

```javascript
// Custom Variable: Transform Event Data
function() {
  var eventData = {{Event Data}};

  // Add custom enrichments
  if (eventData.event_name === 'purchase') {
    eventData.custom_data.order_source = 'shopify';
    eventData.custom_data.is_new_customer = eventData.user_data.orders_count === 1;
  }

  return eventData;
}
```

### Dynamic Access Token Management

Store access token in Google Secret Manager instead of GTM variable:

1. Create secret in [Google Cloud Secret Manager](https://console.cloud.google.com/security/secret-manager)
2. Use Google Cloud Function to retrieve token
3. Pass to CAPI tag dynamically

### Multi-Pixel Setup

Send events to multiple Facebook pixels from same server:

1. Create separate CAPI tags for each pixel
2. Use pixel-specific triggers (e.g., by domain, user type)
3. Example: Main pixel + Retargeting pixel

---

## Monitoring & Maintenance

### Key Metrics to Monitor

- **Event Match Quality**: Target 60%+ (Good or Excellent)
- **Events Received**: Track in Events Manager > Activity
- **Deduplication Rate**: % of events received from both sources
- **Error Rate**: Monitor failed requests to CAPI
- **Access Token Expiry**: Set reminder to renew

### Recommended Alerts

1. **Match Quality Drop**: Alert if below 50%
2. **Event Volume Drop**: Alert if 50% drop in daily events
3. **Access Token Expiry**: Reminder 30 days before expiry

---

## Migration Checklist

When adding CAPI to existing Meta Pixel setup:

- [ ] Server GTM container deployed
- [ ] Facebook Access Token generated
- [ ] CAPI tag configured in Server GTM
- [ ] User data variables created (email, phone, etc.)
- [ ] Event ID deduplication configured
- [ ] FBC/FBP cookies forwarded to server
- [ ] Event name mapping implemented
- [ ] Test Events verified in Events Manager
- [ ] Event Match Quality score checked (60%+)
- [ ] Deduplication working (events from both sources)
- [ ] Purchase events include value, currency, content_ids
- [ ] Monitored for 7-14 days

---

## Resources

- [Facebook Conversions API Documentation](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Event Deduplication Guide](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events)
- [Server-Side GTM for Facebook](https://developers.facebook.com/docs/marketing-api/conversions-api/server-side-tag-manager)
- [Event Match Quality](https://www.facebook.com/business/help/765081237991954)

---

## Support

For help with Facebook CAPI setup:

- **Email**: contact@jyinsights.com
- **Package**: JY Insights Gold Plus v1.2
- **Documentation**: See `README.md`, `SERVER-SIDE-GA4-GUIDE.md`

---

*Last Updated: January 6, 2026*
