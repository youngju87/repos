# Troubleshooting Guide

**Version:** 1.2 | **Last Updated:** January 2026

Common issues, diagnostic procedures, and solutions for the JY Insights Gold package.

---

## Quick Diagnostic Checklist

Before diving into specific issues, run through this checklist:

- [ ] Scripts installed in correct order (consent → dataLayer → GTM)
- [ ] GTM container ID is correct and consistent everywhere
- [ ] GTM container is published (not just in Preview)
- [ ] Consent banner is enabled in Shopify Admin
- [ ] Debug mode is enabled for troubleshooting
- [ ] Browser console shows no JavaScript errors
- [ ] No ad blocker or privacy extension interfering

---

## Issue Categories

1. [Consent Issues](#consent-issues)
2. [Event Tracking Issues](#event-tracking-issues)
3. [Checkout Pixel Issues](#checkout-pixel-issues)
4. [GTM Issues](#gtm-issues)
5. [GA4 Issues](#ga4-issues)
6. [Enhanced Conversions Issues](#enhanced-conversions-issues)
7. [Performance Issues](#performance-issues)

---

## Consent Issues

### Consent Banner Not Showing

**Symptoms:**
- No banner appears on page load
- Tracking fires without consent

**Diagnostic Steps:**
```javascript
// Check if Shopify Privacy API is loaded
console.log(typeof Shopify.customerPrivacy);
// Should return: "object"

// Check if banner is configured
console.log(Shopify.customerPrivacy.shouldShowBanner());
// Should return: true (if banner should show)
```

**Solutions:**

| Cause | Solution |
|-------|----------|
| Privacy not enabled | Shopify Admin → Settings → Customer Privacy → Enable |
| Banner set to "No visitors" | Change to "All visitors" or regional |
| Already consented | Clear cookies and try incognito |
| Script error blocking | Check console for errors |

---

### Consent Not Updating

**Symptoms:**
- Click Accept/Decline but tags don't respond
- `consent_updated` event never fires

**Diagnostic Steps:**
```javascript
// Check for consent_updated event
window.dataLayer.filter(e => e.event === 'consent_updated');

// Check current consent state
window.shopifyConsentMode?.getConsentState();
```

**Solutions:**

| Cause | Solution |
|-------|----------|
| Event listener not attached | Verify script loads before banner |
| Shopify API event name changed | Update `consentEvent` in CONFIG |
| sessionStorage blocked | Check browser privacy settings |

---

### GPC Not Being Honored

**Symptoms:**
- GPC enabled but ads still fire
- No `consent_gpc_detected` event

**Diagnostic Steps:**
```javascript
// Check GPC signal
console.log(navigator.globalPrivacyControl);
// Should return: true

// Check DNT signal
console.log(navigator.doNotTrack);
// Should return: "1"
```

**Solutions:**

| Cause | Solution |
|-------|----------|
| GPC check disabled | Verify GPC detection code in script |
| Script runs too late | Move consent script to top of `<head>` |
| Browser doesn't send GPC | Test with Firefox or GPC extension |

---

## Event Tracking Issues

### No Events Firing

**Symptoms:**
- GTM Preview shows no custom events
- dataLayer is empty or only has GTM default events

**Diagnostic Steps:**
```javascript
// Check dataLayer exists and has events
console.log(window.dataLayer);
console.log(window.dataLayer.length);

// Check for specific events
window.dataLayer.filter(e => e.event === 'view_item');
```

**Solutions:**

| Cause | Solution |
|-------|----------|
| Storefront script not installed | Add `gold-storefront-datalayer-ga4.liquid` to theme |
| Script has syntax error | Check console for errors |
| Script in wrong location | Move to theme.liquid after consent script |
| Liquid variables not rendering | Check Liquid syntax in snippet |

---

### Events Missing Parameters

**Symptoms:**
- Events fire but `items` array is empty
- `value` or `currency` is undefined

**Diagnostic Steps:**
```javascript
// Check a specific event's data
window.dataLayer.filter(e => e.event === 'view_item')[0];

// Check if Liquid is rendering
// In theme, add: <script>console.log({{ product | json }});</script>
```

**Solutions:**

| Cause | Solution |
|-------|----------|
| Liquid objects not available | Ensure script is in correct template context |
| Wrong Liquid variable names | Check against Shopify Liquid documentation |
| Product data not loaded | Ensure product object exists on page |

---

### Duplicate Events

**Symptoms:**
- Same event fires 2+ times
- GA4 shows inflated numbers

**Diagnostic Steps:**
```javascript
// Count specific events
window.dataLayer.filter(e => e.event === 'page_view').length;
// Should be 1 per page load
```

**Solutions:**

| Cause | Solution |
|-------|----------|
| Multiple GTM installations | Remove duplicate GTM snippets |
| Multiple dataLayer scripts | Keep only one storefront script |
| App adding tracking | Disable tracking in third-party apps |
| SPA navigation issues | Add navigation guards |

---

### Wrong Event Timing

**Symptoms:**
- Events fire too early (before consent)
- Events fire too late (missing from session)

**Solutions:**

| Issue | Solution |
|-------|----------|
| Events before consent | Ensure consent script loads first |
| Events after page unload | Use `sendBeacon` for exit events |
| Events on wrong page | Check trigger conditions in GTM |

---

## Checkout Pixel Issues

### Checkout Events Not Firing

**Symptoms:**
- Storefront events work, checkout doesn't
- No `begin_checkout` or `purchase` events

**Diagnostic Steps:**
1. Open checkout page
2. Open DevTools (F12)
3. Check Console for errors
4. Check Network for GTM requests

```javascript
// In checkout DevTools console:
console.log(window.dataLayer);
```

**Solutions:**

| Cause | Solution |
|-------|----------|
| Pixel not installed | Add in Shopify Admin → Customer Events |
| Pixel not connected | Click "Connect" button in Shopify Admin |
| Wrong GTM ID | Update `gtmContainerId` in pixel code |
| Pixel error | Check console for JavaScript errors |

---

### Consent Not Carrying to Checkout

**Symptoms:**
- Consented on storefront but checkout treats as denied
- Checkout tags don't fire despite consent

**Diagnostic Steps:**
```javascript
// In checkout console:
console.log(sessionStorage.getItem('jy_consent_state'));
// Should show consent object with timestamps
```

**Solutions:**

| Cause | Solution |
|-------|----------|
| sessionStorage not saved | Verify storefront consent script saves to sessionStorage |
| Different domain | Ensure checkout is on same domain |
| Checkout opens in new window | sessionStorage doesn't persist |
| sessionStorage cleared | User cleared data between pages |

---

### Purchase Event Missing Data

**Symptoms:**
- `purchase` event fires but missing transaction_id, value, or items

**Diagnostic Steps:**
```javascript
// Check the purchase event
window.dataLayer.filter(e => e.event === 'purchase')[0];

// Check Shopify checkout event data
// (In pixel, add console.log(event) in checkout_completed handler)
```

**Solutions:**

| Cause | Solution |
|-------|----------|
| Shopify API changed | Update pixel to match new API structure |
| Data mapping error | Fix property access in pixel code |
| Currency not set | Verify currency is included |

---

## GTM Issues

### Tags Not Firing

**Symptoms:**
- Events appear in dataLayer
- GTM Preview shows tags as "Not Fired"

**Diagnostic Steps:**
1. Open GTM Preview
2. Click on the event
3. Check "Tags" tab
4. Click on non-firing tag
5. Check "Firing Triggers" for why it didn't fire

**Solutions:**

| Cause | Solution |
|-------|----------|
| Trigger not matching | Verify event name exactly matches |
| Consent blocking | Check consent state in Preview |
| Condition not met | Review trigger conditions |
| Tag paused | Unpause the tag |

---

### Variables Undefined

**Symptoms:**
- GTM Preview shows variables as `undefined`
- Tags fire but with empty values

**Diagnostic Steps:**
1. In GTM Preview, click on event
2. Go to "Variables" tab
3. Find the undefined variable
4. Check its configuration

**Solutions:**

| Cause | Solution |
|-------|----------|
| Wrong data layer path | Fix variable: `ecommerce.items` not `items` |
| Data not in event | Check dataLayer.push includes the data |
| Timing issue | Use "Data Layer Variable" not "JavaScript Variable" |

---

### Import Conflicts

**Symptoms:**
- Import fails or creates duplicates
- Tags renamed with "(1)" suffix

**Solutions:**

| Cause | Solution |
|-------|----------|
| Existing items with same names | Choose "Overwrite" or "Rename" |
| Corrupted JSON | Re-download container file |
| Version mismatch | Use latest GTM container format |

---

## GA4 Issues

### Events Not Appearing in GA4

**Symptoms:**
- GTM shows tags firing
- GA4 Real-time shows nothing

**Diagnostic Steps:**
1. Check GA4 DebugView (requires debug mode)
2. Check Network tab for `collect` requests to google-analytics.com
3. Verify Measurement ID matches

**Solutions:**

| Cause | Solution |
|-------|----------|
| Wrong Measurement ID | Update `G-XXXXXXXXXX` in GTM |
| Debug mode not enabled | GTM Preview enables it automatically |
| Data filter excluding | Check GA4 Admin → Data Filters |
| Property mismatch | Verify you're checking correct property |

---

### Events Missing Parameters

**Symptoms:**
- Events show in GA4 but parameters missing
- Ecommerce reports empty

**Diagnostic Steps:**
1. GA4 → Configure → DebugView
2. Click on event
3. Check "Event Parameters" section

**Solutions:**

| Cause | Solution |
|-------|----------|
| Parameters not registered | GA4 Admin → Custom Definitions |
| Wrong parameter names | Use GA4 recommended names |
| Data type mismatch | Ensure numbers are numbers, not strings |

---

### Real-Time vs Reports Discrepancy

**Symptoms:**
- Events appear in Real-time
- Reports show different numbers

**Solutions:**

| Cause | Solution |
|-------|----------|
| Data processing delay | Wait 24-48 hours for full processing |
| Sampling | Check sampling indicator in reports |
| Filters applied | Check report filters |
| Different date ranges | Verify date range matches |

---

## Enhanced Conversions Issues

### Low Match Rate

**Symptoms:**
- Enhanced Conversions match rate below 50%
- Google Ads showing low data quality

**Diagnostic Steps:**
1. Google Ads → Tools → Conversions
2. Click on purchase conversion
3. Check "Enhanced conversions" diagnostics

**Solutions:**

| Cause | Solution |
|-------|----------|
| Email not hashed correctly | Use SHA256, lowercase, trimmed |
| Phone format wrong | Use E.164 format (+1234567890) |
| Missing user_data | Verify purchase event includes user_data |
| Consent not granted | Check ad_user_data consent |

---

### Enhanced Conversions Not Sending

**Symptoms:**
- No Enhanced Conversions data in Google Ads
- Tag fires but user_data not sent

**Diagnostic Steps:**
```javascript
// Check purchase event for user_data
window.dataLayer.filter(e => e.event === 'purchase')[0].user_data;
```

**Solutions:**

| Cause | Solution |
|-------|----------|
| user_data not in event | Add user_data to purchase push |
| Consent denied | User must consent to marketing |
| GTM variable not configured | Map user_data fields in tag |

---

## Performance Issues

### Page Load Slow

**Symptoms:**
- Noticeable delay on page load
- High "Total Blocking Time" in Lighthouse

**Diagnostic Steps:**
1. Chrome DevTools → Performance
2. Record page load
3. Look for long tasks in tracking scripts

**Solutions:**

| Cause | Solution |
|-------|----------|
| Synchronous script loading | Ensure GTM loads async |
| Too much processing | Reduce debug logging in production |
| Inefficient selectors | Optimize MutationObserver usage |
| Polling too frequent | Increase polling interval |

---

### Console Spam

**Symptoms:**
- Console flooded with debug messages
- Hard to see other errors

**Solution:**
```javascript
// In all CONFIG objects, set:
debug: false
```

---

## Debug Commands Reference

### Console Commands for Debugging

```javascript
// === CONSENT DEBUGGING ===

// Check consent state
window.shopifyConsentMode?.getConsentState();

// Check sessionStorage consent
JSON.parse(sessionStorage.getItem('jy_consent_state'));

// Check Shopify Privacy API
Shopify.customerPrivacy.currentVisitorConsent().then(console.log);

// === DATALAYER DEBUGGING ===

// View all dataLayer events
console.table(window.dataLayer);

// Filter for specific event
window.dataLayer.filter(e => e.event === 'purchase');

// Get last event
window.dataLayer[window.dataLayer.length - 1];

// === GTM DEBUGGING ===

// Check if GTM loaded
console.log(window.google_tag_manager);

// Get GTM container info
Object.keys(window.google_tag_manager || {});

// === GA4 DEBUGGING ===

// Check GA4 config
console.log(window.gtag);

// Force debug mode
gtag('config', 'G-XXXXXXXX', { debug_mode: true });

// === GENERAL DEBUGGING ===

// Check for errors
// Open Console, filter for "error"

// Check network requests
// Open Network tab, filter for "google" or "analytics"

// Check cookies
document.cookie.split(';').filter(c => c.includes('_ga'));
```

---

## Getting Help

If you've exhausted this guide:

1. **Review related documentation:**
   - [Quick Start Guide](./QUICK-START-GUIDE.md)
   - [Event Reference](./EVENT-REFERENCE.md)
   - [Consent Mode Reference](./CONSENT-MODE-REFERENCE.md)

2. **Collect diagnostic information:**
   - Browser and version
   - Console errors (screenshot)
   - dataLayer output
   - GTM Preview screenshots
   - Network tab for relevant requests

3. **Check for updates:**
   - Package version
   - GTM container version
   - Shopify API changes

---

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Shopify is not defined` | Script runs before Shopify loads | Move script lower or add check |
| `Cannot read property of undefined` | Object doesn't exist | Add null checks |
| `gtag is not defined` | GTM not loaded yet | Ensure GTM loads before dataLayer scripts |
| `Refused to execute script` | CSP blocking | Update Content Security Policy |
| `Access to sessionStorage denied` | Privacy mode | Graceful fallback to defaults |
