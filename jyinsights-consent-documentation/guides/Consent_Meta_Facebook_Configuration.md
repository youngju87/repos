# Meta (Facebook) Pixel Consent Configuration Guide

**JY/co Consent & Privacy Implementation**
**Version 1.0**
**Date: December 2025**

---

## Table of Contents

1. [Meta Pixel & Consent Overview](#1-meta-pixel--consent-overview)
2. [Regional Consent Requirements](#2-regional-consent-requirements)
3. [Implementation Method 1: Block Until Consent](#3-implementation-method-1-block-until-consent-gtm)
4. [Implementation Method 2: Meta Consent Mode](#4-implementation-method-2-meta-consent-mode-fbq)
5. [Limited Data Use (CCPA/CPRA)](#5-limited-data-use-ccpacpra)
6. [Meta Conversions API with Consent](#6-meta-conversions-api-with-consent)
7. [Testing & Verification](#7-testing--verification)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Meta Pixel & Consent Overview

### What is Meta Pixel?

**Meta Pixel** (formerly Facebook Pixel) is a JavaScript tracking code that:
- Tracks user actions on your website
- Enables conversion tracking for Facebook/Instagram ads
- Builds custom audiences for retargeting
- Optimizes ad delivery
- Measures ROAS (Return on Ad Spend)

### Meta Pixel & Privacy Regulations

**Consent Requirements:**

| Region | Requirement | Implementation |
|--------|-------------|----------------|
| **EU/EEA (GDPR)** | Explicit opt-in consent required | Block pixel until marketing consent granted |
| **UK (GDPR)** | Explicit opt-in consent required | Block pixel until marketing consent granted |
| **California (CCPA/CPRA)** | Opt-out model + "Do Not Sell" | Use Limited Data Use (LDU) mode for opt-outs |
| **Brazil (LGPD)** | Explicit consent required | Block pixel until consent |
| **Other regions** | Varies (check local laws) | Generally block or use LDU |

### Meta's Consent Approach

**Meta does NOT have native Google-style Consent Mode**, so you must:

**Option 1:** Block the pixel entirely until consent (GDPR-compliant)
**Option 2:** Use Meta's `fbq('consent', ...)` API (less mature than Google's)
**Option 3:** For CCPA, use Limited Data Use mode

---

## 2. Regional Consent Requirements

### GDPR (EU/EEA/UK)

**Requirements:**
- ✅ Explicit opt-in consent before pixel loads
- ✅ Pixel must NOT fire before consent
- ✅ No cookies set before consent
- ✅ Equal prominence for Accept/Deny buttons

**Implementation:**
- Block Meta Pixel script until user grants marketing consent
- Use Cookiebot `cookie_consent_marketing` event as trigger

**Legal Basis:** Consent (explicit opt-in)

### CCPA/CPRA (California)

**Requirements:**
- ⚠️ Opt-out model (pixel can load by default)
- ✅ Must honor "Do Not Sell My Personal Information" requests
- ✅ Use Limited Data Use (LDU) mode for opt-outs
- ✅ Respect Global Privacy Control (GPC) signals

**Implementation:**
- Use `fbq('dataProcessingOptions', ['LDU'], ...)` for opted-out users
- Check for GPC signal: `navigator.globalPrivacyControl`

**Legal Basis:** Opt-out with Limited Data Use

### LGPD (Brazil)

**Requirements:**
- ✅ Explicit consent required (similar to GDPR)
- ✅ Block pixel until consent

**Implementation:** Same as GDPR

---

## 3. Implementation Method 1: Block Until Consent (GTM)

### Overview

**Recommended for GDPR/LGPD compliance:**
- Pixel script does NOT load until user grants marketing consent
- Zero data sent to Meta before consent
- Cleanest, simplest approach

### GTM Setup

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

**This trigger fires when user grants marketing consent.**

#### Step 3: Create Meta Pixel Base Code Tag

**Tag Configuration:**
- Tag Type: **Custom HTML**
- Tag Name: `Meta - Pixel Base Code`

**HTML:**
```html
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>

<noscript>
<img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"/>
</noscript>
```

**Replace:** `YOUR_PIXEL_ID` with your actual Meta Pixel ID (e.g., `123456789012345`)

**Triggering:**
- Trigger: `Consent - Marketing Granted`

**Advanced Settings:**
- Tag firing priority: (default)
- Once per page: ❌ (allow multiple fires if consent changes)

[INSERT SCREENSHOT: Meta Pixel tag configuration]

#### Step 4: Create Meta Event Tags

**Example: Purchase Event**

**Tag Configuration:**
- Tag Type: **Custom HTML**
- Tag Name: `Meta - Event: Purchase`

**HTML:**
```html
<script>
fbq('track', 'Purchase', {
  value: {{Transaction Value}},
  currency: '{{Currency}}',
  content_ids: {{Product IDs Array}},
  content_type: 'product',
  num_items: {{Product Quantity}}
});
</script>
```

**Triggering:**
- Primary Trigger: **Custom Event** → `purchase` (from ecommerce dataLayer)
- Additional Condition: `{{Cookiebot Consent - Marketing}}` equals `true`

**Why the condition?**
- If user initially denies, then later accepts, and completes purchase
- Ensures pixel is loaded before event fires

#### Step 5: Common Meta Events

| Event Name | When to Fire | Parameters |
|------------|--------------|------------|
| `PageView` | Every page (with consent) | (none) |
| `ViewContent` | Product page view | `content_ids`, `value`, `currency` |
| `AddToCart` | Add to cart | `content_ids`, `value`, `currency` |
| `InitiateCheckout` | Checkout started | `value`, `currency`, `num_items` |
| `AddPaymentInfo` | Payment info added | `value`, `currency` |
| `Purchase` | Transaction complete | `value`, `currency`, `content_ids` |
| `Lead` | Form submission | `value`, `currency` |
| `CompleteRegistration` | Account created | `value`, `currency`, `status` |
| `Search` | Site search | `search_string`, `content_category` |

### Pros & Cons

**Pros:**
- ✅ Fully GDPR compliant (no data before consent)
- ✅ Simple implementation
- ✅ Clear consent boundary
- ✅ No ambiguity

**Cons:**
- ❌ Zero tracking for non-consenting users
- ❌ No conversion modeling (unlike Google Consent Mode)
- ❌ Audience building limited to consenting users only
- ❌ Data loss for denied traffic

---

## 4. Implementation Method 2: Meta Consent Mode (fbq)

### Overview

**Meta's Consent API** (less mature than Google's):
- Pixel loads on page
- Initial state: consent revoked
- User grants consent → `fbq('consent', 'grant')`

**Use Cases:**
- When you need pixel to load early (for technical reasons)
- When implementing advanced consent flows

**⚠️ Warning:** Less tested than Method 1, may still set some cookies before consent.

### Implementation

**Step 1: Load Pixel with Revoked Consent**

```html
<script>
!function(f,b,e,v,n,t,s)
{/* standard pixel code */}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

// Initialize pixel
fbq('init', 'YOUR_PIXEL_ID');

// Set consent to revoked BEFORE tracking
fbq('consent', 'revoke');

// Now track (pixel won't send full data)
fbq('track', 'PageView');
</script>
```

**Step 2: Listen for Cookiebot Consent**

```html
<script>
// Listen for Cookiebot accept event
window.addEventListener('CookiebotOnAccept', function() {
  if (Cookiebot.consent.marketing) {
    // User granted marketing consent
    fbq('consent', 'grant');
    console.log('Meta Pixel consent granted');
  }
});

// Listen for Cookiebot decline/revoke
window.addEventListener('CookiebotOnDecline', function() {
  fbq('consent', 'revoke');
  console.log('Meta Pixel consent revoked');
});
</script>
```

**Step 3: GTM Implementation**

**Tag: Meta Pixel with Consent API**
```html
<script>
// Standard pixel initialization
!function(f,b,e,v,n,t,s){...}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', 'YOUR_PIXEL_ID');

// Check Cookiebot consent state
if (typeof Cookiebot !== 'undefined' && Cookiebot.consent) {
  if (Cookiebot.consent.marketing) {
    fbq('consent', 'grant');
  } else {
    fbq('consent', 'revoke');
  }
} else {
  // Cookiebot not loaded yet, default to revoked
  fbq('consent', 'revoke');
}

// Track pageview
fbq('track', 'PageView');

// Listen for consent changes
window.addEventListener('CookiebotOnAccept', function() {
  if (Cookiebot.consent.marketing) {
    fbq('consent', 'grant');
  }
});

window.addEventListener('CookiebotOnDecline', function() {
  fbq('consent', 'revoke');
});
</script>
```

**Trigger:** All Pages (pixel self-regulates)

### Consent API States

| State | Method | Behavior |
|-------|--------|----------|
| **Revoked** | `fbq('consent', 'revoke')` | Limited data sent, no user tracking |
| **Granted** | `fbq('consent', 'grant')` | Full tracking, cookies set |

**What Gets Sent When Revoked:**
- ⚠️ Some aggregate data (Meta doesn't fully document this)
- ⚠️ May still set some cookies (less clear than Google Consent Mode)

**Recommendation:** Use Method 1 (blocking) for GDPR for clearer compliance.

---

## 5. Limited Data Use (CCPA/CPRA)

### What is Limited Data Use (LDU)?

**LDU** is Meta's CCPA compliance feature:
- Restricts how Meta can use data from California users who opt out
- Activated via `fbq('dataProcessingOptions', ...)`
- Required for "Do Not Sell My Personal Information" compliance

### When to Use LDU

| User Location | User Action | LDU Setting |
|---------------|-------------|-------------|
| **California** | Opts out of sale | LDU enabled |
| **California** | Does NOT opt out | LDU disabled |
| **California** | GPC signal detected | LDU enabled |
| **Non-California** | Any action | LDU disabled (not applicable) |

### Implementation

#### Method 1: Opt-Out Model (CCPA Standard)

**For users who opt out:**

```javascript
// User in California opts out
fbq('dataProcessingOptions', ['LDU'], 1, 1000);
// Parameters:
// ['LDU'] — Enable Limited Data Use
// 1 — Country code (1 = USA)
// 1000 — State code (1000 = California)

fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
```

**For users who do NOT opt out (or non-CA users):**

```javascript
// Standard tracking (no LDU)
fbq('dataProcessingOptions', []);  // Empty array = no restrictions

fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
```

#### Method 2: Automatic Geolocation (Meta's Detection)

```javascript
// Let Meta auto-detect California users and apply LDU
fbq('dataProcessingOptions', ['LDU'], 0, 0);
// 0, 0 = Auto-detect location

fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
```

**Pros:** Simpler, Meta handles detection
**Cons:** Less control, relies on Meta's geolocation accuracy

#### GTM Implementation with Cookiebot

**Step 1: Create Variable for Opt-Out Status**

```javascript
Variable Name: User - CCPA Opt Out
Type: Custom JavaScript

function() {
  // Check if user has opted out via Cookiebot
  if (typeof Cookiebot !== 'undefined' && Cookiebot.consent) {
    // If marketing consent denied in California, consider it opt-out
    return !Cookiebot.consent.marketing;
  }
  return false;
}
```

**Step 2: Meta Pixel Tag with LDU Logic**

```html
<script>
!function(f,b,e,v,n,t,s){...}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

// Check if user opted out
var optedOut = {{User - CCPA Opt Out}};

if (optedOut) {
  // User opted out: Enable LDU
  fbq('dataProcessingOptions', ['LDU'], 1, 1000);
} else {
  // User did not opt out: Standard tracking
  fbq('dataProcessingOptions', []);
}

fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
```

### Global Privacy Control (GPC)

**Detect GPC Signal:**

```javascript
// Check if browser sends GPC signal
if (navigator.globalPrivacyControl === true) {
  // Browser indicates user wants to opt out
  fbq('dataProcessingOptions', ['LDU'], 1, 1000);
} else {
  fbq('dataProcessingOptions', []);
}
```

**GTM Variable:**

```javascript
Variable Name: Browser - GPC Signal
Type: Custom JavaScript

function() {
  return navigator.globalPrivacyControl === true;
}
```

**Combined Logic:**

```javascript
var gpcSignal = {{Browser - GPC Signal}};
var userOptedOut = {{User - CCPA Opt Out}};

if (gpcSignal || userOptedOut) {
  fbq('dataProcessingOptions', ['LDU'], 1, 1000);
} else {
  fbq('dataProcessingOptions', []);
}
```

---

## 6. Meta Conversions API with Consent

### What is Conversions API (CAPI)?

**Meta Conversions API** sends conversion data **server-to-server** instead of browser-based:
- More reliable (no ad blockers, no tracking prevention)
- Better attribution
- Complements browser pixel
- **Still requires consent** (not a consent bypass)

### Consent with CAPI

**Key Point:** CAPI does NOT bypass consent requirements.

**GDPR:** User must consent before you send their data to Meta via CAPI
**CCPA:** Must honor opt-outs with LDU mode

### Implementation Flow

```
User visits site → Grants marketing consent
    ↓
Browser Pixel fires → Tracks event
    ↓
Server receives order data → Checks consent
    ↓
If consent granted:
    └→ Send event to Meta CAPI
If consent denied/revoked:
    └→ Do NOT send to CAPI
```

### Server-Side Consent Check

**Example (Node.js):**

```javascript
const bizSdk = require('facebook-nodejs-business-sdk');

// Check user's consent status (from database or cookie)
function hasMarketingConsent(userId) {
  // Query database for user's consent record
  // Return true if marketing consent granted
  return userConsentDb.hasConsented(userId, 'marketing');
}

// Send event to Meta CAPI only if consent
async function trackPurchase(userId, orderData) {
  if (!hasMarketingConsent(userId)) {
    console.log('User has not consented to marketing tracking');
    return;  // Do NOT send to Meta
  }

  // User has consented, proceed with CAPI event
  const event = new bizSdk.ServerEvent()
    .setEventName('Purchase')
    .setEventTime(Math.floor(Date.now() / 1000))
    .setUserData(userData)
    .setCustomData(orderData);

  // Send to Meta
  await eventsApi.track([event]);
}
```

### GTM Server-Side with Consent

**Server-Side GTM (sGTM) Setup:**

1. **Client receives consent signal** from browser GTM
2. **Server tag checks consent** before firing
3. **Meta CAPI tag only fires if consented**

**sGTM Meta Tag Configuration:**

```
Tag: Meta Conversions API
Type: Meta Conversions API (official template)

Pixel ID: YOUR_PIXEL_ID
API Access Token: YOUR_TOKEN

Consent Settings:
└─ Require consent: ✅
    └─ marketing_consent (or custom consent key)

Event Data:
├─ Event Name: {{Event Name}}
├─ User Data: {{User Data Object}}
└─ Custom Data: {{Custom Data Object}}

Trigger: All Events (tag self-checks consent)
```

---

## 7. Testing & Verification

### Meta Pixel Helper (Browser Extension)

**Install:** Chrome Web Store → "Meta Pixel Helper"

**Usage:**

1. Install extension
2. Visit your website
3. Click extension icon
4. See pixel events in real-time

[INSERT SCREENSHOT: Meta Pixel Helper interface]

**What to Check:**

```
✅ Pixel found: YOUR_PIXEL_ID
✅ PageView event fired
✅ No errors (green check marks)
⚠️ Warnings (review if any)
❌ Errors (must fix)
```

### Test Consent Flow

**Test 1: Deny Consent**

1. Clear cookies
2. Visit site in incognito
3. Deny all cookies on Cookiebot banner
4. Open Meta Pixel Helper
5. **Expected:** "No pixels found" OR pixel loaded but no events (Method 2)
6. Check Network tab:
   - Filter: `facebook.com`
   - **Expected:** No requests to `connect.facebook.net` (Method 1)

**Test 2: Accept Consent**

1. Clear cookies
2. Visit site
3. Accept all cookies
4. Open Meta Pixel Helper
5. **Expected:** Pixel found, PageView event fired
6. Check Network tab:
   - ✅ `connect.facebook.net/en_US/fbevents.js` loaded
   - ✅ `facebook.com/tr/?id=YOUR_PIXEL_ID&ev=PageView`

**Test 3: Test Events**

1. With consent granted, perform actions:
   - Add to cart
   - Initiate checkout
   - Complete purchase
2. Check Meta Pixel Helper for each event
3. Verify event parameters correct

### Meta Events Manager

**Real-Time Testing:**

1. Meta Business Manager → Events Manager
2. Select your Pixel
3. Go to **"Test Events"** tab
4. Enter test browser session ID:
   - Pixel Helper → Test Event Code
   - OR append `?test_event_code=TEST12345` to URL
5. Perform actions on site
6. See events appear in real-time in Events Manager

[INSERT SCREENSHOT: Meta Events Manager test events]

**Verify:**
- ✅ Events appear
- ✅ Parameters populated correctly
- ✅ No errors

### Conversion Tracking

**Check Conversions:**

1. Meta Ads Manager → Measure & Report → Events Manager
2. View event activity (last 28 days)
3. Check:
   - Event count (PageView, Purchase, etc.)
   - Event volume chart
   - Parameter breakdown

**Verify Consent Impact:**

- Before Consent Implementation: Higher event volume (all users)
- After Consent Implementation: Lower volume (consenting users only)
- **This is expected and compliant**

---

## 8. Troubleshooting

### Issue 1: Pixel Fires Before Consent

**Symptoms:**
- Pixel Helper shows pixel loaded before user accepts
- Network requests to `facebook.com` before consent

**Causes:**
- ❌ Pixel loaded via direct script (not GTM)
- ❌ Wrong trigger in GTM (All Pages instead of consent trigger)
- ❌ Cookiebot `data-blockingmode` not set to "auto"

**Solutions:**

1. **Check script location:**
   - View page source
   - Search for `fbevents.js`
   - If found in `<head>` or `<body>` (not via GTM), remove it

2. **Check GTM trigger:**
   - GTM → Tags → Meta Pixel tag
   - Trigger should be: `cookie_consent_marketing` event
   - NOT: "All Pages"

3. **Verify Cookiebot blocking:**
   - Check Cookiebot script has `data-blockingmode="auto"`
   - Cookiebot should block FB script if loaded directly

### Issue 2: Events Not Firing After Consent

**Symptoms:**
- User accepts consent
- Pixel Helper shows pixel loaded
- But events (Purchase, AddToCart, etc.) don't fire

**Causes:**
- ❌ Event tags have wrong trigger conditions
- ❌ Event tags fire before base pixel loads
- ❌ `fbq` object not defined yet

**Solutions:**

1. **Check trigger conditions:**
   - Event tags should trigger on:
     - Primary: Custom event (e.g., `purchase`)
     - Additional condition: `{{Cookiebot Consent - Marketing}}` equals `true`

2. **Tag sequencing:**
   - Event tags should fire AFTER base pixel tag
   - Use Tag Sequencing if needed:
     - Event tag → Advanced → Tag Sequencing
     - "Fire a tag before this tag fires": Meta - Pixel Base Code

3. **Verify fbq exists:**
   ```javascript
   // Console (after accepting consent)
   typeof fbq
   // Should return: 'function'
   ```

### Issue 3: Duplicate Events

**Symptoms:**
- Meta Events Manager shows 2x events
- Purchase counted twice

**Causes:**
- ❌ Pixel loaded via both GTM and direct script
- ❌ Multiple GTM tags sending same event
- ❌ CAPI + Browser Pixel without deduplication

**Solutions:**

1. **Audit pixel locations:**
   - View page source for direct `fbevents.js` script
   - Check GTM for multiple Meta tags
   - Remove duplicates

2. **Event deduplication (CAPI + Browser):**
   - Use `event_id` parameter:
   ```javascript
   // Browser pixel
   fbq('track', 'Purchase', {
     value: 50.00,
     currency: 'USD'
   }, {
     eventID: 'ORDER_12345'  // Unique ID
   });

   // Server CAPI (same event_id)
   const event = new ServerEvent()
     .setEventName('Purchase')
     .setEventId('ORDER_12345')  // Same ID — Meta deduplicates
     ...
   ```

### Issue 4: LDU Not Working (CCPA)

**Symptoms:**
- California users opt out
- But Meta still shows full tracking

**Causes:**
- ❌ LDU not implemented
- ❌ Wrong country/state codes
- ❌ LDU set after `init`

**Solutions:**

1. **Check LDU call order:**
   ```javascript
   // CORRECT order:
   fbq('dataProcessingOptions', ['LDU'], 1, 1000);  // FIRST
   fbq('init', 'YOUR_PIXEL_ID');  // THEN init
   fbq('track', 'PageView');  // THEN track
   ```

2. **Verify parameters:**
   - Country: 1 (USA)
   - State: 1000 (California)
   - Must be numbers, not strings

3. **Check implementation:**
   ```javascript
   // Console (before pixel init)
   window._fbq?.getState?.()?.dataProcessingOptions
   // Should show: {0: "LDU"}
   ```

### Issue 5: Conversions Not Attributed

**Symptoms:**
- Conversions fire (seen in Events Manager)
- But not attributed to ad campaigns

**Causes:**
- ❌ Pixel fires too late (after page redirect)
- ❌ Purchase event parameters missing
- ❌ Ad click and conversion on different devices (cross-device)
- ⚠️ Consent denial rate high (expected data loss)

**Solutions:**

1. **Check event timing:**
   - Purchase event must fire BEFORE redirect to thank-you page
   - Use callback:
   ```javascript
   fbq('track', 'Purchase', {...}, {
     eventID: 'ORDER_123'
   }, function() {
     // Callback: Now redirect
     window.location = '/thank-you';
   });
   ```

2. **Verify required parameters:**
   - `value` (number)
   - `currency` (string, e.g., 'USD')
   - `content_ids` (array)

3. **Advanced Matching:**
   ```javascript
   fbq('init', 'YOUR_PIXEL_ID', {
     em: 'hashed_email@example.com',  // Hashed email
     ph: '1234567890',  // Hashed phone
     // Improves matching
   });
   ```

### Issue 6: Consent Not Remembered

**This is a Cookiebot issue**, not Meta-specific. See Master Implementation Guide, Chapter 12.

---

## Appendix: Meta Pixel Consent Checklist

```
☐ Meta Pixel ID obtained from Meta Business Manager
☐ GTM Consent variable created (Cookiebot Consent - Marketing)
☐ GTM Consent trigger created (cookie_consent_marketing)
☐ Meta Pixel base code tag created
☐ Meta Pixel tag uses consent trigger (NOT All Pages)
☐ Meta Pixel tag priority set correctly (if using sequencing)
☐ Event tags created (Purchase, AddToCart, etc.)
☐ Event tags have consent condition
☐ Tested: Deny consent → No pixel loads (Method 1)
☐ Tested: Accept consent → Pixel loads, events fire
☐ Meta Pixel Helper shows no errors
☐ Events Manager shows events in test mode
☐ For CCPA: LDU implemented for opt-outs
☐ For CCPA: GPC signal detected and honored
☐ For CAPI: Server-side consent check implemented
☐ No duplicate pixel scripts (GTM only, no direct script)
☐ Conversion events attributing correctly
☐ Privacy policy mentions Meta Pixel and consent
```

---

## Resources

- **Meta Pixel Setup:** https://www.facebook.com/business/help/952192354843755
- **Conversions API:** https://developers.facebook.com/docs/marketing-api/conversions-api
- **Limited Data Use:** https://developers.facebook.com/docs/marketing-apis/data-processing-options
- **Meta Pixel Helper:** https://chrome.google.com/webstore (search "Meta Pixel Helper")

---

**End of Meta (Facebook) Pixel Consent Configuration Guide**
