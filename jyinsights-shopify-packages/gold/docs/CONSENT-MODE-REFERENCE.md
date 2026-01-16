# Consent Mode Reference & Compliance Guide

**Version:** 2.1 | **Last Updated:** January 2026

Comprehensive documentation of the Consent Mode v2 implementation in the JY Insights Gold package, including signal flows, regional behavior, Shopify integration, and validation procedures.

---

## Consent Mode v2 Overview

### What Is Google Consent Mode?

Google Consent Mode is a framework that allows websites to adjust the behavior of Google tags based on user consent choices. It ensures compliance with privacy regulations while preserving some measurement capabilities through modeling.

### Version 2 Requirements (March 2024)

As of March 2024, Google requires Consent Mode v2 for:
- EU/EEA user data collection
- Personalized advertising
- Enhanced Conversions

**New signals in v2:**
- `ad_user_data` - Consent to send user data to Google for advertising
- `ad_personalization` - Consent to use data for personalized ads

---

## Consent Signals Reference

### Complete Signal List

| Signal | Purpose | Default | When Granted |
|--------|---------|---------|--------------|
| `analytics_storage` | GA4 cookies and measurement | `denied` | After analytics consent |
| `ad_storage` | Advertising cookies | `denied` | After marketing consent |
| `ad_user_data` | Send user data to Google Ads | `denied` | After marketing consent |
| `ad_personalization` | Personalized ad targeting | `denied` | After marketing consent |
| `personalization_storage` | Personalization cookies | `denied` | After preferences consent |
| `functionality_storage` | Functional cookies | `granted` | Always (necessary) |
| `security_storage` | Security cookies | `granted` | Always (necessary) |

### Microsoft Consent Mode Signals

| Signal | Maps To | Purpose |
|--------|---------|---------|
| `microsoft_analytics_consent` | `analytics_storage` | Microsoft Clarity, etc. |
| `microsoft_advertising_consent` | `ad_storage` | Microsoft Ads |

---

## Implementation in This Package

### File: `shopify-privacy-consent-mode-api.liquid`

This file is the core consent management script. It:

1. Initializes consent defaults (all denied except functional)
2. Detects GPC/DNT signals
3. Queries Shopify Privacy API
4. Maps Shopify consent to Google format
5. Pushes consent events to dataLayer
6. Saves consent state to sessionStorage

### Configuration Options

```javascript
const CONFIG = {
  // Debug logging (set to false in production)
  debug: true,

  // Script version
  version: '2.1',

  // CCPA: Should sale of data denial follow marketing denial?
  saleOfDataFollowsMarketing: true,

  // Shopify event to listen for consent changes
  consentEvent: 'visitorConsentCollected',

  // Polling interval for consent changes (ms)
  pollingInterval: 2000,

  // Default consent state (before user action)
  defaultConsent: {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    personalization_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted'
  }
};
```

---

## Signal Flow

### Default → Update Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PAGE LOAD SEQUENCE                           │
└─────────────────────────────────────────────────────────────────────┘

STEP 1: Initialize GTM Consent (Immediate)
─────────────────────────────────────────────────────────────────────
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  gtag('consent', 'default', {           │
        │    analytics_storage: 'denied',         │
        │    ad_storage: 'denied',                │
        │    ad_user_data: 'denied',              │
        │    ad_personalization: 'denied',        │
        │    wait_for_update: 500                 │
        │  });                                    │
        └─────────────────────────────────────────┘
                              │
                              │ (Within 500ms)
                              ▼

STEP 2: Check for GPC/DNT Signal
─────────────────────────────────────────────────────────────────────
                              │
            ┌─────────────────┴─────────────────┐
            │                                   │
            ▼                                   ▼
    GPC/DNT Detected                    No GPC/DNT Signal
            │                                   │
            ▼                                   │
    ┌───────────────────┐                       │
    │ Force all denied  │                       │
    │ Push gpc_detected │                       │
    │ Skip Shopify API  │                       │
    └───────────────────┘                       │
                                                │
                                                ▼

STEP 3: Query Shopify Privacy API
─────────────────────────────────────────────────────────────────────
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  Shopify.customerPrivacy               │
        │    .currentVisitorConsent()            │
        │                                        │
        │  Returns:                              │
        │  {                                     │
        │    analytics: true/false,              │
        │    marketing: true/false,              │
        │    preferences: true/false,            │
        │    saleOfData: true/false              │
        │  }                                     │
        └─────────────────────────────────────────┘
                              │
                              ▼

STEP 4: Map to Google Consent Mode
─────────────────────────────────────────────────────────────────────
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  Shopify API          Google Signal     │
        │  ───────────          ─────────────     │
        │  analytics: true  →   analytics_storage │
        │  marketing: true  →   ad_storage        │
        │  marketing: true  →   ad_user_data      │
        │  marketing: true  →   ad_personalization│
        │  preferences: true →  personalization   │
        └─────────────────────────────────────────┘
                              │
                              ▼

STEP 5: Update Consent and Push Events
─────────────────────────────────────────────────────────────────────
                              │
            ┌─────────────────┴─────────────────┐
            │                                   │
            ▼                                   ▼
    First Page Load                     Consent Changed
            │                                   │
            ▼                                   ▼
    ┌───────────────────┐          ┌───────────────────┐
    │ dataLayer.push({  │          │ dataLayer.push({  │
    │   event:          │          │   event:          │
    │   'consent_default'│         │   'consent_updated'│
    │ });               │          │ });               │
    └───────────────────┘          └───────────────────┘
            │                                   │
            └─────────────────┬─────────────────┘
                              │
                              ▼

STEP 6: Persist to sessionStorage
─────────────────────────────────────────────────────────────────────
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  sessionStorage.setItem(               │
        │    'jy_consent_state',                 │
        │    JSON.stringify({                    │
        │      analytics_storage: 'granted',     │
        │      ad_storage: 'granted',            │
        │      timestamp: Date.now()             │
        │    })                                  │
        │  );                                    │
        └─────────────────────────────────────────┘
                              │
                              │ (Available to checkout pixel)
                              ▼
```

### User Updates Consent

```
┌─────────────────────────────────────────────────────────────────────┐
│                      USER CONSENT UPDATE                             │
└─────────────────────────────────────────────────────────────────────┘

User clicks Accept/Decline/Manage
           │
           ▼
┌─────────────────────────────────────────┐
│  Shopify fires:                          │
│  'visitorConsentCollected' event        │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  shopify-privacy-consent-mode-api       │
│  event listener catches it              │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  Re-query Shopify Privacy API           │
│  (Get updated consent values)           │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  gtag('consent', 'update', {            │
│    analytics_storage: 'granted',        │
│    ad_storage: 'granted',               │
│    ad_user_data: 'granted',             │
│    ad_personalization: 'granted'        │
│  });                                    │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  dataLayer.push({                        │
│    event: 'consent_updated',            │
│    consent_state: { ... },              │
│    analytics_consent: true,             │
│    marketing_consent: true,             │
│    consent_source: 'shopify_api'        │
│  });                                    │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  Update sessionStorage                   │
│  (For checkout pixel)                   │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  GTM re-evaluates all tags              │
│  Tags waiting for consent now fire      │
└─────────────────────────────────────────┘
```

---

## Region-Based Behavior

### Shopify Privacy API Regional Support

Shopify's Privacy API automatically handles regional detection based on:
- IP geolocation
- Customer account location
- Store configuration

### Banner Display Rules

| Region | Banner Behavior | Default Consent |
|--------|-----------------|-----------------|
| EU/EEA | Required before any tracking | All denied |
| UK | Required before any tracking | All denied |
| California | Required with opt-out option | Analytics granted, Ads may vary |
| Quebec | Required with explicit consent | All denied |
| Other US | Optional (merchant choice) | May be pre-granted |
| ROW | Optional (merchant choice) | May be pre-granted |

### Configuring Regional Behavior

In Shopify Admin → Settings → Customer Privacy:

1. **"All visitors"** - Show banner to everyone
2. **"Only in regions that require it"** - Auto-detect
3. **"Specific regions"** - Manual selection

### Package Behavior by Region

```javascript
// The package reads Shopify's determination
const consent = await Shopify.customerPrivacy.currentVisitorConsent();

// If Shopify returns { analytics: undefined, marketing: undefined }
// → No consent decision yet, treat as denied

// If Shopify returns { analytics: true, marketing: true }
// → User granted consent (or region doesn't require it)

// If Shopify returns { analytics: false, marketing: false }
// → User explicitly declined
```

---

## Shopify Privacy API Interaction

### API Methods Used

| Method | Purpose | When Called |
|--------|---------|-------------|
| `currentVisitorConsent()` | Get current consent state | Page load, after consent change |
| Event: `visitorConsentCollected` | Consent change notification | User interacts with banner |

### API Response Structure

```javascript
// Shopify.customerPrivacy.currentVisitorConsent()
{
  analytics: true | false | undefined,
  marketing: true | false | undefined,
  preferences: true | false | undefined,
  saleOfData: true | false | undefined
}
```

### Mapping Logic

```javascript
function mapShopifyToGoogleConsent(shopifyConsent) {
  return {
    analytics_storage: shopifyConsent.analytics ? 'granted' : 'denied',
    ad_storage: shopifyConsent.marketing ? 'granted' : 'denied',
    ad_user_data: shopifyConsent.marketing ? 'granted' : 'denied',
    ad_personalization: shopifyConsent.marketing ? 'granted' : 'denied',
    personalization_storage: shopifyConsent.preferences ? 'granted' : 'denied',
    // Always granted (functional necessity)
    functionality_storage: 'granted',
    security_storage: 'granted'
  };
}
```

---

## Checkout Pixel Consent Handling

### The Challenge

Shopify's checkout runs in a sandboxed iframe that:
- Cannot access the parent window
- Cannot call Shopify.customerPrivacy API
- Cannot read cookies from parent domain

### The Solution

1. **Storefront saves consent to sessionStorage**
2. **Checkout pixel reads from sessionStorage**
3. **Same consent state is applied**

```javascript
// In checkout pixel (gold-checkout-pixel-ga4.js)

function getConsentFromSessionStorage() {
  try {
    const stored = sessionStorage.getItem('jy_consent_state');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to read consent:', e);
  }

  // Default to denied if not found
  return {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  };
}

// Apply on pixel initialization
const consent = getConsentFromSessionStorage();
gtag('consent', 'default', consent);
```

### sessionStorage Key

```javascript
// Key: 'jy_consent_state'
// Value (example):
{
  "analytics_storage": "granted",
  "ad_storage": "granted",
  "ad_user_data": "granted",
  "ad_personalization": "granted",
  "personalization_storage": "granted",
  "functionality_storage": "granted",
  "security_storage": "granted",
  "timestamp": 1704067200000,
  "source": "shopify_api"
}
```

---

## GTM Container Configuration

### Consent Mode Variables (from consent-mode-container.json)

| Variable Name | Data Layer Variable | Purpose |
|---------------|---------------------|---------|
| DLV - analytics_storage | `analytics_storage` | GA4 consent state |
| DLV - ad_storage | `ad_storage` | Ads consent state |
| DLV - ad_user_data | `ad_user_data` | User data consent |
| DLV - ad_personalization | `ad_personalization` | Personalization consent |
| DLV - consent_state | `consent_state` | Full consent object |
| DLV - analytics_consent | `analytics_consent` | Boolean for analytics |
| DLV - marketing_consent | `marketing_consent` | Boolean for marketing |
| DLV - consent_source | `consent_source` | Where consent came from |

### Consent Mode Triggers

| Trigger Name | Type | Fires On |
|--------------|------|----------|
| CE - consent_default | Custom Event | `consent_default` event |
| CE - consent_updated | Custom Event | `consent_updated` event |
| CE - consent_updated - Analytics Granted | Custom Event | `consent_updated` + `analytics_consent = true` |
| CE - consent_updated - Marketing Granted | Custom Event | `consent_updated` + `marketing_consent = true` |
| CE - consent_gpc_detected | Custom Event | `consent_gpc_detected` event |

### Tag Consent Settings

For each tag in GTM, configure "Consent Settings":

**GA4 Configuration Tag:**
```
Required consent: analytics_storage
```

**GA4 Event Tags:**
```
Required consent: analytics_storage
```

**Google Ads Conversion Tag:**
```
Required consent: ad_storage
```

**Google Ads Remarketing Tag:**
```
Required consent: ad_storage, ad_personalization
```

**Meta Pixel Tag:**
```
Required consent: ad_storage
```

---

## Audit & Validation Checklist

### Pre-Launch Validation

#### 1. Consent Default Verification

- [ ] Open browser DevTools Console
- [ ] Clear all cookies and site data
- [ ] Load the store in incognito mode
- [ ] Check Console for: `[JY Consent] Setting default consent: denied`
- [ ] Verify no `_ga` or `_gid` cookies are set
- [ ] Check Network tab: no GA4 hits with `_ga` parameter

#### 2. Consent Banner Testing

- [ ] Banner appears on page load
- [ ] "Accept All" grants all consent
- [ ] "Decline All" keeps all denied
- [ ] "Manage Preferences" shows granular options
- [ ] Individual toggles work correctly

#### 3. Consent Update Verification

- [ ] Accept cookies
- [ ] Check Console for: `[JY Consent] Consent updated: granted`
- [ ] Check dataLayer for `consent_updated` event
- [ ] Verify `_ga` cookie is now set
- [ ] Check Network tab: GA4 hits now have `_ga` parameter

#### 4. GPC/DNT Testing

- [ ] Enable GPC in browser (Firefox or extension)
- [ ] Load store
- [ ] Verify consent stays denied
- [ ] Check Console for: `[JY Consent] GPC signal detected`
- [ ] Check dataLayer for `consent_gpc_detected` event

#### 5. Checkout Consent Testing

- [ ] Grant consent on storefront
- [ ] Proceed to checkout
- [ ] Open DevTools in checkout
- [ ] Check sessionStorage for `jy_consent_state`
- [ ] Verify checkout pixel respects same consent state

#### 6. GTM Preview Validation

- [ ] Open GTM Preview mode
- [ ] Load store
- [ ] Check "Consent" tab shows correct state
- [ ] Verify tags respect consent:
  - GA4 tags fire only when analytics_storage = granted
  - Ads tags fire only when ad_storage = granted

### Post-Launch Monitoring

#### Weekly Checks

- [ ] Review GA4 consent reporting
- [ ] Check consent acceptance rate
- [ ] Verify no compliance complaints
- [ ] Monitor for tracking gaps

#### Monthly Checks

- [ ] Audit new scripts for consent compliance
- [ ] Review consent banner text accuracy
- [ ] Test consent flow end-to-end
- [ ] Verify Enhanced Conversions match rates

---

## Debugging Guide

### Console Commands

```javascript
// Check current consent state
console.log(window.shopifyConsentMode?.getConsentState());

// Check dataLayer for consent events
window.dataLayer.filter(e => e.event?.includes('consent'));

// Check sessionStorage
console.log(sessionStorage.getItem('jy_consent_state'));

// Check if Shopify Privacy API is available
console.log(typeof Shopify.customerPrivacy);

// Get current Shopify consent
Shopify.customerPrivacy.currentVisitorConsent().then(console.log);
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Banner doesn't show | Privacy settings not enabled | Enable in Shopify Admin |
| Consent not persisting | sessionStorage blocked | Check browser settings |
| Checkout ignores consent | sessionStorage not saved | Verify storefront script runs first |
| Tags fire before consent | GTM loads before consent script | Move consent script to top of `<head>` |
| GPC not detected | Wrong signal check | Verify `navigator.globalPrivacyControl` |

### Debug Mode

Enable debug logging:

```javascript
// In consent-mode-api.liquid config:
const CONFIG = {
  debug: true,  // Enable console logging
  // ...
};

// Or in browser console:
window.consentDebug = true;
```

---

## Related Documents

- [Quick Start Guide](./QUICK-START-GUIDE.md) - Installation steps
- [GTM Import Guide](./GTM-IMPORT-GUIDE.md) - Container setup
- [Compliance Summary](./COMPLIANCE-SUMMARY.md) - Regulatory overview
- [Event Reference](./EVENT-REFERENCE.md) - Consent event details
- [Troubleshooting Guide](./TROUBLESHOOTING-GUIDE.md) - Common issues
