# Consent Mode v2.1 Update Summary

**JY Insights Gold Package - Shopify Privacy API Integration**

Version: 2.1
Date: January 12, 2026

---

## 🎯 What's New in v2.1

### Major Features

#### 1. **Shopify Privacy API Integration**
- Modern `currentVisitorConsent()` API (no more token decoding)
- Event-driven architecture with `visitorConsentCollected` listener
- 200ms initialization delay to prevent double-events for returning users
- Automatic detection of stored consent

#### 2. **Google Consent Mode v2 Full Compliance**
All 7 required consent parameters:
- `analytics_storage`
- `ad_storage`
- `ad_user_data`
- `ad_personalization`
- `personalization_storage`
- `functionality_storage` (always granted)
- `security_storage` (always granted)

#### 3. **Microsoft Consent Mode Support**
- Dual consent tracking: `microsoft_analytics_consent` + `microsoft_advertising_consent`
- Separate event: `microsoft_consent_updated`
- Compatible with Microsoft Advertising platforms

#### 4. **Performance Optimizations**
- Polling reduced from 500ms → 2000ms (configurable)
- Quiet logging (only logs on actual consent changes)
- Event listeners reduced from 5 → 1
- Much cleaner console output

#### 5. **CCPA/GDPR Compliance**
- `sale_of_data_consent` configurable (follows marketing OR independent)
- GPC (Global Privacy Control) auto-deny support
- Denied-by-default for GDPR compliance
- Cookie preference center integration

---

## 📦 Files Included

### Core Consent Scripts

| File | Version | Size | Purpose |
|------|---------|------|---------|
| `shopify-privacy-consent-mode-v2.0-modern-api.liquid` | 2.1 | ~25KB | Main consent management script |
| `shopify-cookie-preferences-link.liquid` | 1.2 | ~3KB | Footer link handler for preference center |
| `consent-mode-container-v2.1.json` | 2.1 | ~8KB | GTM container with 12 variables + 6 triggers |

### Documentation

| File | Updated | Description |
|------|---------|-------------|
| `client-presentation-enhanced-v2.0.md` | ✅ | Client-facing presentation with consent mode section |
| `GA4_COMPLIANCE_SUMMARY.md` | ✅ | Compliance checklist with consent mode v2 section |
| `gtm-consent-mode-setup.md` | ✅ | GTM setup guide with import instructions |
| `CONSENT-MODE-V2.1-UPDATE.md` | ✅ NEW | This document |

---

## 🚀 Quick Start

### Step 1: Add Shopify loadFeatures Script

Add this to your `theme.liquid` **before** the consent mode script:

```liquid
<script>
  if (window.Shopify && window.Shopify.loadFeatures) {
    window.Shopify.loadFeatures([{
      name: 'consent-tracking-api',
      version: '0.1'
    }]);
  }
</script>
```

### Step 2: Render Consent Mode Script

Add to `theme.liquid` (in `<head>` or before `</body>`):

```liquid
{% render 'shopify-privacy-consent-mode-v2.0-modern-api' %}
```

### Step 3: (Optional) Add Preference Center Link

Add to `theme.liquid` (before `</body>`):

```liquid
{% render 'shopify-cookie-preferences-link' %}
```

Then in your footer, add:

```html
<a href="#cookie-preference">Cookie Preferences</a>
```

### Step 4: Import GTM Container

1. Download `consent-mode-container-v2.1.json`
2. GTM → Admin → Import Container
3. Select "Merge" to keep existing tags
4. Import and publish

**Time to Complete:** 10 minutes

---

## ⚙️ Configuration Options

### CONFIG Object (in shopify-privacy-consent-mode-v2.0-modern-api.liquid)

```javascript
var CONFIG = {
  debug: true,  // Set to false in production
  version: '2.1',

  // CCPA: sale_of_data behavior
  // true = follows marketing consent
  // false = independent CCPA logic
  saleOfDataFollowsMarketing: true,

  // Polling interval (ms)
  // 0 = event-only mode (no polling)
  // 2000 = check every 2 seconds (default)
  pollingInterval: 2000,

  // Default consent states (GDPR-safe: denied)
  defaultConsent: {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    personalization_storage: 'denied',
    functionality_storage: 'granted',  // Always granted
    security_storage: 'granted'        // Always granted
  }
};
```

---

## 📊 DataLayer Events

### 1. consent_default
Fires on page load with initial consent state.

**For NEW users (no stored consent):**
```javascript
{
  event: 'consent_default',
  consent_state: {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    personalization_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted'
  },
  analytics_consent: false,
  marketing_consent: false,
  preferences_consent: false,
  sale_of_data_consent: false,
  consent_source: 'default'
}
```

**For RETURNING users (stored consent):**
```javascript
{
  event: 'consent_default',
  consent_state: {
    analytics_storage: 'granted',    // Matches stored consent
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    personalization_storage: 'granted',
    functionality_storage: 'granted',
    security_storage: 'granted'
  },
  analytics_consent: true,
  marketing_consent: true,
  preferences_consent: true,
  sale_of_data_consent: true,
  consent_source: 'stored'  // Note: 'stored' not 'default'
}
```

### 2. consent_updated
Fires when user changes consent preferences.

```javascript
{
  event: 'consent_updated',
  consent_state: {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    // ... other states
  },
  analytics_consent: true,
  marketing_consent: true,
  preferences_consent: true,
  sale_of_data_consent: true,
  consent_source: 'shopify_api'
}
```

### 3. microsoft_consent_updated
Fires when Microsoft-specific consent changes.

```javascript
{
  event: 'microsoft_consent_updated',
  microsoft_analytics_consent: true,
  microsoft_advertising_consent: true
}
```

### 4. consent_gpc_detected
Fires when Global Privacy Control signal detected.

```javascript
{
  event: 'consent_gpc_detected',
  gpc_enabled: true
}
```

---

## 🎯 GTM Container Contents

### Variables (12 total)

| Variable Name | Type | DataLayer Key | Default |
|---------------|------|---------------|---------|
| DLV - consent_state | DLV | `consent_state` | - |
| DLV - analytics_consent | DLV | `analytics_consent` | false |
| DLV - marketing_consent | DLV | `marketing_consent` | false |
| DLV - preferences_consent | DLV | `preferences_consent` | false |
| DLV - sale_of_data_consent | DLV | `sale_of_data_consent` | false |
| DLV - consent_source | DLV | `consent_source` | - |
| DLV - analytics_storage | DLV | `consent_state.analytics_storage` | denied |
| DLV - ad_storage | DLV | `consent_state.ad_storage` | denied |
| DLV - ad_user_data | DLV | `consent_state.ad_user_data` | denied |
| DLV - ad_personalization | DLV | `consent_state.ad_personalization` | denied |
| DLV - microsoft_analytics_consent | DLV | `microsoft_analytics_consent` | false |
| DLV - microsoft_advertising_consent | DLV | `microsoft_advertising_consent` | false |

### Triggers (6 total)

| Trigger Name | Type | Event Name | Condition |
|--------------|------|------------|-----------|
| CE - consent_default | Custom Event | `consent_default` | - |
| CE - consent_updated | Custom Event | `consent_updated` | - |
| CE - consent_updated - Analytics Granted | Custom Event | `consent_updated` | analytics_consent = true |
| CE - consent_updated - Marketing Granted | Custom Event | `consent_updated` | marketing_consent = true |
| CE - microsoft_consent_updated | Custom Event | `microsoft_consent_updated` | - |
| CE - consent_gpc_detected | Custom Event | `consent_gpc_detected` | - |

---

## ✅ Verification Checklist

### 1. Check Console Logs

**On page load, you should see:**
```
[Shopify Consent v2.1] 🚀 Initializing v2.1
[Shopify Consent v2.1] ✅ Shopify Customer Privacy API ready
[Shopify Consent v2.1] ✅ Initial consent found (returning user) // OR
[Shopify Consent v2.1] ⚠️ No initial consent - setting denied defaults (GDPR-safe)
[Shopify Consent v2.1] ✅ consent_default pushed to dataLayer
[Shopify Consent v2.1] 👂 Setting up event listener for: visitorConsentCollected
[Shopify Consent v2.1] ✅ Event listener active
[Shopify Consent v2.1] 👁️ Polling enabled (every 2000ms)
[Shopify Consent v2.1] ✅ Monitoring active
```

### 2. Check dataLayer (in browser console)

```javascript
// View all dataLayer events
console.log(window.dataLayer);

// Find consent_default event
window.dataLayer.filter(e => e.event === 'consent_default');

// Check consent states
window.Shopify.customerPrivacy.currentVisitorConsent();
```

### 3. GTM Preview Mode

1. Enable GTM Preview Mode
2. Navigate to your Shopify store
3. Check "Summary" tab for `consent_default` event
4. Verify all 12 variables populate correctly
5. Click Shopify's cookie banner to grant consent
6. Check for `consent_updated` event

### 4. GA4 DebugView

1. Enable GA4 DebugView in GA4 Admin
2. Navigate to Reports → DebugView
3. Look for `consent_default` and `consent_updated` events
4. Verify consent parameters appear in event details

---

## 🐛 Troubleshooting

### Issue: "Shopify.customerPrivacy not available"

**Solution:** Add the loadFeatures script BEFORE the consent mode script:

```liquid
<script>
  if (window.Shopify && window.Shopify.loadFeatures) {
    window.Shopify.loadFeatures([{
      name: 'consent-tracking-api',
      version: '0.1'
    }]);
  }
</script>
{% render 'shopify-privacy-consent-mode-v2.0-modern-api' %}
```

### Issue: Double consent_default events (one denied, one granted)

**Fixed in v2.1:** The 200ms initialization delay resolves this. Ensure you're using the latest version.

### Issue: consent_updated fires every 2 seconds

**Solution:** This was fixed in v2.1 with "quiet logging". The event only fires when consent actually changes, but polling still checks every 2 seconds (silently).

### Issue: Preference link doesn't work

**Check:**
1. Is `shopify-cookie-preferences-link.liquid` rendered in theme.liquid?
2. Does `window.privacyBanner.showPreferences` exist? (Check console diagnostic)
3. Is the link href exactly `#cookie-preference` or `#cookie-preferences`?

**Debug command:**
```javascript
// Run this in browser console
window.privacyBanner.showPreferences();
```

---

## 🔄 Migration from v1.x

### Breaking Changes: NONE

v2.1 is fully backwards compatible. You can:
- Install alongside v1.x (different filename)
- Swap in theme.liquid when ready
- Rollback instantly if needed

### Recommended Migration Path:

1. **Install** v2.1 files (don't touch v1.x)
2. **Test** on development/staging theme
3. **Import** GTM container (merge mode)
4. **Verify** in GTM Preview + GA4 DebugView
5. **Switch** theme.liquid to use v2.1
6. **Publish** GTM container
7. **Monitor** for 24-48 hours
8. **(Optional)** Remove v1.x files

**Rollback:** Change theme.liquid back to v1.x (< 5 minutes)

---

## 📈 Performance Impact

| Metric | Before (v1.x) | After (v2.1) | Change |
|--------|---------------|--------------|--------|
| **Polling Frequency** | 500ms | 2000ms | -75% |
| **Event Listeners** | 5 | 1 | -80% |
| **Console Logs/min** | ~120 | ~2-5 | -98% |
| **Script Size** | ~18KB | ~25KB | +39% |
| **Load Time** | <50ms | <50ms | No change |

**Net Result:** More efficient, cleaner, faster

---

## 🛡️ Compliance Matrix

| Regulation | Compliant | Notes |
|------------|-----------|-------|
| **GDPR** | ✅ Yes | Denied by default, explicit consent required |
| **CCPA** | ✅ Yes | `sale_of_data_consent` tracked, GPC support |
| **Google Consent Mode v2** | ✅ Yes | All 7 parameters implemented |
| **Microsoft Consent Mode** | ✅ Yes | Dual consent tracking |
| **Shopify Privacy API** | ✅ Yes | Uses official API (v0.1) |

---

## 📞 Support

### Debug Commands

Available in browser console (when `debug: true`):

```javascript
// Get current consent state
window.consentDebug.getConsent();

// Test API availability
window.consentDebug.testAPI();

// Toggle sale_of_data behavior
window.consentDebug.setFollowMarketing(false);  // Independent CCPA
window.consentDebug.setFollowMarketing(true);   // Follow marketing

// Force consent denied (testing)
window.consentDebug.denyAll();
```

### Documentation

- Full implementation: `solution-design-reference-enhanced.md`
- Quick start: `QUICK-START-ENHANCED.md`
- GTM setup: `gtm-consent-mode-setup.md`
- Compliance: `GA4_COMPLIANCE_SUMMARY.md`

### Contact

- Email: support@jyinsights.com
- GitHub: [jyinsights-shopify-packages](https://github.com/jyinsights/shopify-packages)

---

## 📝 Changelog

### v2.1 (January 12, 2026)
- ✅ Shopify Privacy API integration (`currentVisitorConsent()`)
- ✅ 200ms initialization delay (prevents double-events)
- ✅ Polling reduced to 2000ms (from 500ms)
- ✅ Event listeners reduced to 1 (from 5)
- ✅ Quiet logging (only logs on change)
- ✅ Configurable `sale_of_data` behavior
- ✅ Microsoft Consent Mode support
- ✅ Cookie preference center integration
- ✅ GTM container v2.1 (12 variables, 6 triggers)

### v2.0 (Previous)
- Google Consent Mode v2 initial implementation
- Basic Shopify token decoding
- 500ms polling

---

**End of Document**

*JY Insights - Shopify Analytics & Consent Management*
*Version 2.1 | January 2026*
