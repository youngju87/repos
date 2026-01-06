# TikTok Pixel Consent Configuration Guide

**JY/co Consent & Privacy Implementation**
**Version 1.0**
**Date: December 2025**

---

## Table of Contents

1. [TikTok Pixel & Consent Overview](#1-tiktok-pixel--consent-overview)
2. [Consent Requirements](#2-consent-requirements)
3. [GTM Implementation](#3-gtm-implementation)
4. [TikTok Events with Consent](#4-tiktok-events-with-consent)
5. [TikTok Events API (Server-Side)](#5-tiktok-events-api-server-side)
6. [Testing & Verification](#6-testing--verification)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. TikTok Pixel & Consent Overview

### What is TikTok Pixel?

**TikTok Pixel** is a JavaScript tracking code that:
- Tracks user actions on your website
- Enables conversion tracking for TikTok ads
- Builds custom audiences for retargeting
- Optimizes ad campaigns
- Measures ROAS (Return on Ad Spend)

### TikTok Pixel Cookies

| Cookie Name | Purpose | Duration | Category |
|-------------|---------|----------|----------|
| `_ttp` | TikTok Pixel identifier | 13 months | Marketing |
| `_tt_enable_cookie` | Consent status | 13 months | Marketing |
| `ttclid` | TikTok click ID (from ads) | 13 months | Marketing |

### Consent Mode Support

**Important:** TikTok does **NOT** have native Google-style Consent Mode integration.

**Therefore:**
- ✅ Must block pixel entirely until consent granted
- ✅ Use GTM consent-based trigger
- ❌ No cookieless pings (unlike Google)
- ❌ No conversion modeling

---

## 2. Consent Requirements

### GDPR (EU/EEA/UK)

**Requirements:**
- ✅ Explicit opt-in consent required before pixel loads
- ✅ Pixel must NOT fire before consent
- ✅ No cookies set before consent
- ✅ Users can withdraw consent

**Implementation:**
- Block TikTok Pixel until user grants marketing consent
- Use Cookiebot `cookie_consent_marketing` trigger

**Legal Basis:** Consent (explicit opt-in)

### CCPA/CPRA (California)

**Requirements:**
- ⚠️ Opt-out model (pixel can load, but must honor opt-outs)
- ✅ Must provide "Do Not Sell" option
- ✅ Honor Global Privacy Control (GPC)

**Implementation:**
- **Conservative approach:** Block pixel for opted-out users (same as GDPR)
- **Lenient approach:** Load pixel, but mark opt-out status (TikTok supports LDU mode, similar to Meta)

### Other Regions

| Region | Requirement | Implementation |
|--------|-------------|----------------|
| **Brazil (LGPD)** | Explicit consent | Block until consent (same as GDPR) |
| **Canada** | Implied consent acceptable for some cookies | Check provincial laws |
| **Australia** | Privacy Act compliance | Consent recommended |

---

## 3. GTM Implementation

### Method 1: Block Until Consent (Recommended)

**Overview:**
- Pixel script does NOT load until user grants marketing consent
- Zero data sent to TikTok before consent
- Fully GDPR compliant

### Step-by-Step Setup

#### Step 1: Create Consent Variable

**Variable Configuration:**
- Variable Type: **Custom JavaScript**
- Variable Name: `Cookiebot Consent - Marketing`

**Code:**
```javascript
function() {
  if (typeof Cookiebot !== 'undefined' && Cookiebot.consent) {
    return Cookiebot.consent.marketing === true;
  }
  return false;
}
```

#### Step 2: Create Consent Trigger

**Trigger Configuration:**
- Trigger Type: **Custom Event**
- Trigger Name: `Consent - Marketing Granted`
- Event Name: `cookie_consent_marketing`

**This trigger fires when user grants marketing consent via Cookiebot.**

#### Step 3: Create TikTok Pixel Base Code Tag

**Tag Configuration:**
- Tag Type: **Custom HTML**
- Tag Name: `TikTok - Pixel Base Code`

**HTML:**
```html
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;
  var ttq=w[t]=w[t]||[];
  ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
  ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
  for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
  ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
  ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
  ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
  var o=document.createElement("script");
  o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;
  var a=document.getElementsByTagName("script")[0];
  a.parentNode.insertBefore(o,a)};

  ttq.load('YOUR_PIXEL_ID');
  ttq.page();
}(window, document, 'ttq');
</script>
```

**Replace:** `YOUR_PIXEL_ID` with your actual TikTok Pixel ID (found in TikTok Ads Manager)

**Triggering:**
- Trigger: `Consent - Marketing Granted`

**Advanced Settings:**
- Tag firing priority: (default)
- Once per page: ❌ (allow re-firing if needed)

[INSERT SCREENSHOT: TikTok Pixel tag in GTM]

#### Step 4: Verify Pixel ID

**Finding Your Pixel ID:**

1. TikTok Ads Manager → Assets → Events
2. Select your pixel
3. Copy Pixel ID (e.g., `C1234567890ABCDEF`)

---

## 4. TikTok Events with Consent

### Standard TikTok Events

| Event Name | When to Fire | Use Case |
|------------|--------------|----------|
| `PageView` | Every page load (auto with base code) | General tracking |
| `ViewContent` | Product page view | Content engagement |
| `ClickButton` | CTA click | Button interactions |
| `AddToCart` | Add to cart action | Shopping funnel |
| `InitiateCheckout` | Checkout started | Purchase intent |
| `AddPaymentInfo` | Payment info added | Near-purchase |
| `CompletePayment` | Purchase completed | Conversion |
| `Contact` | Form submission | Lead generation |
| `SubmitForm` | General form submit | Lead capture |
| `Download` | File/app download | Content downloads |

### Creating Event Tags

#### Example 1: Add to Cart Event

**Tag Configuration:**
- Tag Type: **Custom HTML**
- Tag Name: `TikTok - Event: Add to Cart`

**HTML:**
```html
<script>
ttq.track('AddToCart', {
  content_id: '{{Product ID}}',
  content_type: 'product',
  content_name: '{{Product Name}}',
  quantity: {{Product Quantity}},
  price: {{Product Price}},
  value: {{Product Value}},
  currency: '{{Currency}}'
});
</script>
```

**Triggering:**
- Primary Trigger: **Custom Event** → `add_to_cart` (from dataLayer)
- Additional Condition: `{{Cookiebot Consent - Marketing}}` equals `true`

**Why the condition?**
- If pixel base code didn't load (no consent), `ttq` won't exist
- Prevents JavaScript errors

#### Example 2: Purchase Event

**Tag Configuration:**
- Tag Type: **Custom HTML**
- Tag Name: `TikTok - Event: Complete Payment`

**HTML:**
```html
<script>
ttq.track('CompletePayment', {
  content_id: {{Product IDs Array}},  // Array: ['prod1', 'prod2']
  content_type: 'product',
  content_name: '{{Order Description}}',
  quantity: {{Total Quantity}},
  value: {{Transaction Value}},
  currency: '{{Currency}}'
});
</script>
```

**Triggering:**
- Primary Trigger: **Custom Event** → `purchase`
- Condition: `{{Cookiebot Consent - Marketing}}` equals `true`

#### Example 3: Form Submission (Lead)

**Tag Configuration:**
- Tag Type: **Custom HTML**
- Tag Name: `TikTok - Event: Contact Form`

**HTML:**
```html
<script>
ttq.track('Contact', {
  content_id: 'contact_form',
  content_type: 'product',  // or 'service'
  content_name: 'Contact Form Submission'
});
</script>
```

**Triggering:**
- Primary Trigger: **Form Submission** (GTM built-in)
- Form ID/Class: (filter for specific form)
- Condition: `{{Cookiebot Consent - Marketing}}` equals `true`

### Event Parameters

**Standard Parameters:**

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `content_id` | String or Array | `'PROD123'` | Product SKU/ID |
| `content_type` | String | `'product'` | Type of content |
| `content_name` | String | `'Blue Widget'` | Product/content name |
| `quantity` | Number | `2` | Item quantity |
| `price` | Number | `29.99` | Unit price |
| `value` | Number | `59.98` | Total value |
| `currency` | String | `'USD'` | ISO currency code |
| `description` | String | `'Product description'` | Additional info |

**Custom Parameters:**

```javascript
ttq.track('CustomEvent', {
  // Standard params
  content_id: 'ITEM123',
  value: 100,
  currency: 'USD',

  // Custom params (use sparingly)
  custom_property: 'custom_value'
});
```

---

## 5. TikTok Events API (Server-Side)

### What is TikTok Events API?

**TikTok Events API** (similar to Meta CAPI) sends conversion data **server-to-server**:
- More reliable (no ad blockers)
- Better attribution
- Complements browser pixel
- **Still requires consent** (not a bypass)

### Consent Requirements for Events API

**Key Point:** Events API does NOT bypass consent.

**GDPR:**
- ✅ User must consent before you send their data to TikTok via API
- ✅ Check consent status before sending events

**CCPA:**
- ✅ Must honor opt-outs
- ✅ Don't send data for users who opted out

### Implementation Flow

```
User visits site → Grants marketing consent
    ↓
Browser Pixel fires → Tracks event
    ↓
Server receives order data → Checks consent status in database
    ↓
If consent granted:
    └→ Send event to TikTok Events API
If consent denied/revoked:
    └→ Do NOT send to Events API
```

### Server-Side Consent Check Example

**Example (Node.js):**

```javascript
const TikTokPixel = require('tiktok-pixel');

// Initialize with access token
const tt = new TikTokPixel('YOUR_PIXEL_ID', 'YOUR_ACCESS_TOKEN');

// Check user's consent from your database
async function hasMarketingConsent(userId) {
  const user = await db.users.findOne({ id: userId });
  return user && user.consentMarketing === true;
}

// Send event only if consented
async function trackPurchase(userId, orderData) {
  if (!await hasMarketingConsent(userId)) {
    console.log('User has not consented to marketing tracking');
    return;  // Do NOT send to TikTok
  }

  // User consented, send event
  await tt.track({
    event: 'CompletePayment',
    event_id: orderData.orderId,  // For deduplication
    timestamp: Math.floor(Date.now() / 1000),
    context: {
      user_agent: req.headers['user-agent'],
      ip: req.ip
    },
    properties: {
      content_id: orderData.productIds,
      value: orderData.totalValue,
      currency: orderData.currency
    }
  });

  console.log('Purchase event sent to TikTok Events API');
}
```

### Event Deduplication

**Problem:** Same event sent from browser AND server = double counting

**Solution:** Use `event_id` parameter

**Browser Pixel:**
```javascript
ttq.track('CompletePayment', {
  content_id: 'PROD123',
  value: 50.00,
  currency: 'USD'
}, {
  event_id: 'ORDER_12345'  // Unique order ID
});
```

**Server Events API:**
```javascript
await tt.track({
  event: 'CompletePayment',
  event_id: 'ORDER_12345',  // SAME ID — TikTok deduplicates
  properties: {
    content_id: 'PROD123',
    value: 50.00,
    currency: 'USD'
  }
});
```

**TikTok automatically deduplicates** events with same `event_id` within 48 hours.

---

## 6. Testing & Verification

### TikTok Pixel Helper (Chrome Extension)

**Install:** Chrome Web Store → "TikTok Pixel Helper"

**Usage:**

1. Install extension
2. Visit your website
3. Click extension icon in toolbar
4. See pixel events in real-time

**What to Check:**

```
✅ Pixel ID detected: C1234567890ABCDEF
✅ PageView event fired
✅ Event parameters present
⚠️ Warnings (review if any)
❌ Errors (must fix)
```

[INSERT SCREENSHOT: TikTok Pixel Helper]

### Test Consent Flow

**Test 1: Deny Marketing Consent**

1. Clear all cookies
2. Visit site in incognito mode
3. Click "Deny All" on Cookiebot banner
4. Open TikTok Pixel Helper
5. **Expected:** "No pixel detected"
6. Open DevTools → Network tab → Filter: `tiktok`
7. **Expected:** No requests to `analytics.tiktok.com`

**Test 2: Accept Marketing Consent**

1. Clear cookies
2. Visit site
3. Click "Accept All" on banner
4. Open TikTok Pixel Helper
5. **Expected:** Pixel detected, PageView event fired
6. DevTools → Network tab:
   - ✅ `analytics.tiktok.com/i18n/pixel/events.js` loaded
   - ✅ Tracking requests sent

**Test 3: Event Tracking**

With consent granted:

1. Add product to cart
2. Check Pixel Helper:
   - ✅ `AddToCart` event detected
   - ✅ Parameters: `content_id`, `value`, `currency`
3. Complete purchase
4. Check Pixel Helper:
   - ✅ `CompletePayment` event detected
   - ✅ Conversion value correct

### TikTok Events Manager

**Real-Time Event Testing:**

1. TikTok Ads Manager → Assets → Events
2. Select your pixel
3. Click **"Test Events"** tab
4. Append test code to URL:
   ```
   https://yoursite.com?ttclid=test
   ```
5. Perform actions on site
6. Check Events Manager for real-time events

**Verify:**
- ✅ Events appear within seconds
- ✅ Event parameters populated
- ✅ Event count increases

### Historical Event Data

**Check Event History:**

1. TikTok Ads Manager → Assets → Events
2. Select pixel
3. View "Overview" tab
4. Check:
   - Event volume chart (last 7/28 days)
   - Event breakdown by type
   - Top events

**Verify Consent Impact:**

- **Before consent implementation:** Higher event counts
- **After consent implementation:** Lower counts (consenting users only)
- **Expected and compliant** ✅

---

## 7. Troubleshooting

### Issue 1: Pixel Fires Before Consent

**Symptoms:**
- TikTok Pixel Helper shows pixel loaded before user accepts
- Network requests to TikTok before consent banner interaction

**Causes:**
- ❌ Pixel loaded via direct script (not GTM)
- ❌ Wrong trigger in GTM (All Pages instead of consent trigger)
- ❌ Cookiebot not blocking properly

**Solutions:**

1. **Check for direct script:**
   - View page source (Ctrl+U)
   - Search for: `analytics.tiktok.com`
   - If found outside GTM → Remove it

2. **Verify GTM trigger:**
   - GTM → Tags → TikTok Pixel Base Code
   - Triggering: Should be `cookie_consent_marketing` event
   - NOT: "All Pages"

3. **Check Cookiebot auto-blocking:**
   - Cookiebot script should have: `data-blockingmode="auto"`
   - This blocks third-party scripts automatically

### Issue 2: Events Not Firing After Consent

**Symptoms:**
- User accepts consent
- Pixel loads (base code)
- But specific events (AddToCart, Purchase) don't fire

**Causes:**
- ❌ Event tag trigger conditions not met
- ❌ `ttq` object not loaded yet
- ❌ Event tag fires before base code

**Solutions:**

1. **Check trigger conditions:**
   - Event tags need BOTH:
     - Primary trigger (e.g., `add_to_cart` event)
     - Condition: `{{Cookiebot Consent - Marketing}}` = `true`

2. **Verify ttq object exists:**
   ```javascript
   // Browser console (after consent)
   typeof ttq
   // Should return: 'object'

   ttq.methods
   // Should return: array of methods
   ```

3. **Tag sequencing:**
   - Event tags should fire AFTER base code
   - Use GTM Tag Sequencing if needed:
     - Event tag → Advanced Settings → Tag Sequencing
     - "Fire a tag before this tag fires": Select TikTok Base Code

4. **Check dataLayer events:**
   - GTM Preview → DataLayer tab
   - Verify events pushed:
     - `add_to_cart`
     - `purchase`
   - If missing → Fix dataLayer pushes first

### Issue 3: Pixel ID Not Recognized

**Symptoms:**
- TikTok Pixel Helper shows "Pixel ID not found"
- Events Manager shows no activity

**Causes:**
- ❌ Wrong Pixel ID in GTM tag
- ❌ Typo in Pixel ID
- ❌ Using old/deleted pixel

**Solutions:**

1. **Verify Pixel ID:**
   - TikTok Ads Manager → Assets → Events
   - Copy exact Pixel ID (case-sensitive)
   - Format: `C` + 15-16 alphanumeric characters
   - Example: `C1234567890ABCDEF`

2. **Update GTM tag:**
   - GTM → Tags → TikTok Base Code
   - Replace Pixel ID
   - Save and publish

3. **Check pixel status:**
   - TikTok Events Manager
   - Pixel should show status: "Active"
   - Not: "Deleted" or "Inactive"

### Issue 4: Duplicate Events

**Symptoms:**
- Events counted 2x or more
- TikTok shows inflated conversion numbers

**Causes:**
- ❌ Multiple TikTok tags firing
- ❌ Browser pixel + Events API without deduplication
- ❌ Tag fires multiple times per page

**Solutions:**

1. **Audit TikTok tags:**
   ```
   GTM → Tags → Filter: "TikTok"
   Check how many tags fire on same trigger
   Remove duplicates
   ```

2. **Event deduplication (browser + server):**
   - Use `event_id` parameter (see Section 5)
   - Same `event_id` on both sides

3. **Prevent multiple fires:**
   - GTM tag → Advanced Settings
   - "Tag firing options": Once per event ✅

### Issue 5: Low Event Count After Consent

**Symptoms:**
- Event volume drops significantly after implementing consent
- Much lower than before

**Causes:**
- ✅ **This is expected!** Users denying consent = no tracking
- ⚠️ Or: Too aggressive consent blocking

**Solutions:**

1. **Check consent rate:**
   - Cookiebot Dashboard → Reports
   - Check marketing consent acceptance rate
   - If 30% accept → expect 70% event drop

2. **Improve consent rate:**
   - Optimize banner design
   - Clear value proposition
   - Test different messaging
   - **But:** Must remain GDPR-compliant (no dark patterns)

3. **This is normal and compliant:**
   - Lower event volume with consent = working as intended ✅
   - Privacy-first approach
   - Focus on quality (consenting users) over quantity

### Issue 6: TikTok Cookies Not Set

**Symptoms:**
- Pixel fires, events track
- But no cookies (`_ttp`, `_tt_enable_cookie`) set

**Causes:**
- ❌ Browser blocking third-party cookies
- ❌ Safari ITP (Intelligent Tracking Prevention)
- ❌ Brave browser blocking

**Solutions:**

1. **Check browser settings:**
   - Not a bug — some browsers block by design
   - Safari, Brave: Block third-party cookies by default

2. **Workaround: Server-side tagging:**
   - Use TikTok Events API (server-to-server)
   - Less reliant on browser cookies
   - Better tracking resilience

3. **Accept limitation:**
   - Browser privacy features = expected behavior
   - Focus on consenting users with permissive browsers

---

## Appendix: TikTok Pixel Consent Checklist

```
☐ TikTok Pixel ID obtained from TikTok Ads Manager
☐ GTM Consent variable created (Cookiebot Consent - Marketing)
☐ GTM Consent trigger created (cookie_consent_marketing event)
☐ TikTok Pixel base code tag created in GTM
☐ TikTok base code tag uses consent trigger (NOT All Pages)
☐ Event tags created (AddToCart, CompletePayment, etc.)
☐ Event tags include consent condition
☐ Event parameters configured (content_id, value, currency)
☐ Tested: Deny consent → No pixel loads
☐ Tested: Accept consent → Pixel loads, PageView fires
☐ Tested: Events fire correctly (AddToCart, Purchase)
☐ TikTok Pixel Helper shows no errors
☐ TikTok Events Manager shows event activity
☐ For server-side: Consent check implemented before API call
☐ For server-side: Event deduplication with event_id
☐ No duplicate pixel scripts (GTM only)
☐ Privacy policy mentions TikTok Pixel and consent
☐ Conversion events attributing to campaigns correctly
```

---

## Resources

- **TikTok Pixel Setup:** https://ads.tiktok.com/help/article?aid=10000357
- **TikTok Events API:** https://ads.tiktok.com/marketing_api/docs?id=1701890979375106
- **TikTok Pixel Helper:** https://chrome.google.com/webstore (search "TikTok Pixel Helper")
- **TikTok Events Manager:** https://ads.tiktok.com/

---

**End of TikTok Pixel Consent Configuration Guide**
