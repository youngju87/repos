# Google Ads Consent Configuration Guide

**JY/co Consent & Privacy Implementation**
**Version 1.0**
**Date: December 2025**

---

## Table of Contents

1. [Google Ads & Consent Mode Overview](#1-google-ads--consent-mode-overview)
2. [EEA Requirements (Post-March 2024)](#2-eea-requirements-post-march-2024)
3. [Conversion Tracking with Consent](#3-conversion-tracking-with-consent)
4. [Enhanced Conversions & Consent](#4-enhanced-conversions--consent)
5. [Remarketing & Consent](#5-remarketing--consent)
6. [Customer Match & Consent](#6-customer-match--consent)
7. [Testing & Verification](#7-testing--verification)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Google Ads & Consent Mode Overview

### How Google Ads Uses Consent Mode v2

Google Ads **natively supports Consent Mode v2**, automatically adjusting behavior based on consent signals:

| Consent Signal | Purpose | Impact When Granted | Impact When Denied |
|----------------|---------|---------------------|---------------------|
| `ad_storage` | Store advertising cookies | Full cookie-based tracking | Cookieless pings only (Advanced mode) |
| `ad_user_data` | Send user data to Google | Enhanced Conversions with user data | No user data sent |
| `ad_personalization` | Personalized ad targeting | Remarketing audiences build | No remarketing (EEA) |

### Consent Mode Benefits for Google Ads

**With Consent Mode v2:**
- ✅ Conversion modeling (~70% accuracy recovery)
- ✅ Maintain remarketing for consenting users
- ✅ Enhanced Conversions when permitted
- ✅ Compliant with GDPR, CCPA
- ✅ Better attribution insights

**Without Consent Mode:**
- ❌ 100% data loss for non-consenting users
- ❌ No remarketing in EEA (post-March 2024)
- ❌ Limited measurement capabilities

---

## 2. EEA Requirements (Post-March 2024)

### Google's March 2024 Policy Change

**Requirement:**
> As of March 6, 2024, advertisers serving ads in the EEA and UK must implement Consent Mode v2 (`ad_user_data` and `ad_personalization` signals) to build remarketing audiences and use Enhanced Conversions.

### What This Means

**Before March 2024:**
- Remarketing audiences built regardless of consent implementation

**After March 2024:**
- **EEA/UK traffic**: Remarketing audiences only build for users who grant `ad_storage`, `ad_user_data`, AND `ad_personalization` consent
- **Non-EEA traffic**: No change (but consent still recommended)

### Implementation Checklist

```
☐ Consent Mode v2 implemented (all 3 ad signals)
☐ ad_storage signal present
☐ ad_user_data signal present (v2)
☐ ad_personalization signal present (v2)
☐ Signals default to 'denied' in EEA
☐ Signals update to 'granted' when user consents to marketing
☐ GTM tags use built-in consent checks
☐ Tested in EEA regions
```

---

## 3. Conversion Tracking with Consent

### GTM Setup for Google Ads Conversion Tracking

#### Tag 1: Google Ads Conversion Tracking

**Configuration:**
- Tag Type: **Google Ads Conversion Tracking**
- Tag Name: `Google Ads - Conversion: Purchase`

| Field | Value | Notes |
|-------|-------|-------|
| **Conversion ID** | `AW-XXXXXXXXX` | From Google Ads |
| **Conversion Label** | `xxxxxxxxxxxxx` | From Google Ads |
| **Conversion Value** | `{{Transaction Value}}` | Dynamic value |
| **Currency Code** | `{{Currency}}` | e.g., 'USD' |
| **Transaction ID** | `{{Transaction ID}}` | For deduplication |

**Consent Settings:**
- ✅ Built-in consent checks (automatic)
- Requires: `ad_storage`, `ad_user_data`, `ad_personalization`

**Trigger:**
- Trigger Type: **Custom Event**
- Event Name: `purchase` (or conversion trigger)

[INSERT SCREENSHOT: Google Ads Conversion tag]

#### Tag 2: Google Ads Remarketing

**Configuration:**
- Tag Type: **Google Ads Remarketing**
- Tag Name: `Google Ads - Remarketing`

| Field | Value |
|-------|-------|
| **Conversion ID** | `AW-XXXXXXXXX` |

**Consent Settings:**
- ✅ Built-in consent checks
- Requires: `ad_storage`, `ad_personalization`

**Trigger:**
- Trigger Type: **All Pages** (or specific pages)

### How Consent Affects Conversion Tracking

**When all ad signals = 'granted':**
```
✅ Full conversion tracking
✅ Cookies set (_gcl_aw, _gcl_au)
✅ User-level attribution
✅ Click ID (GCLID) captured
✅ Cross-device tracking (if signed in)
✅ Accurate conversion counting
```

**When ad signals = 'denied' (Advanced Consent Mode):**
```
✅ Cookieless ping sent to Google
✅ Aggregate conversion data (no user ID)
✅ Google uses ML to model conversions
⚠️ ~70% accuracy (estimated)
❌ No cookies
❌ No cross-session tracking
❌ No remarketing audience building (EEA)
```

**When ad signals = 'denied' (Basic Consent Mode):**
```
❌ No data sent at all
❌ Complete conversion blind spot
```

### Conversion Value with Consent

**Dynamic Values:**

```javascript
// GTM Variable: Transaction Value
Variable Type: Data Layer Variable
Data Layer Variable Name: ecommerce.purchase.actionField.revenue

// Used in conversion tag
Conversion Value: {{Transaction Value}}
```

**Static Values:**

```
Conversion Value: 100  (fixed value for all conversions)
```

**Best Practice:** Use dynamic values for ecommerce; static for lead gen.

---

## 4. Enhanced Conversions & Consent

### What are Enhanced Conversions?

**Enhanced Conversions** send hashed user data (email, phone, address) to Google for better conversion matching and attribution.

**Requires:** `ad_user_data = 'granted'`

### Setup in Google Ads

**Step 1: Enable in Google Ads**

1. Google Ads → Tools → Conversions
2. Select conversion action
3. Click "Edit settings"
4. Enhanced conversions → **Turn on**
5. Method: **Google Tag Manager**
6. Save

[INSERT SCREENSHOT: Enhanced Conversions settings]

**Step 2: Create User Data Variables in GTM**

**Variable: User - Email**
```javascript
Variable Type: Custom JavaScript
Name: User - Email

function() {
  // Get from dataLayer, form, or other source
  return window.userEmail || '';  // Must be lowercase, trimmed
}
```

**Variable: User - Phone**
```javascript
Variable Type: Custom JavaScript
Name: User - Phone

function() {
  return window.userPhone || '';  // Format: +1234567890
}
```

**Variable: User - Address Fields**
```
User - First Name
User - Last Name
User - Street Address
User - City
User - Region (state)
User - Postal Code
User - Country (2-letter code)
```

**Step 3: Configure Conversion Tag with User Data**

**Tag:** `Google Ads - Conversion: Purchase (Enhanced)`

**User-Provided Data:**

| Parameter | GTM Variable | Example |
|-----------|--------------|---------|
| **email** | `{{User - Email}}` | `user@example.com` |
| **phone_number** | `{{User - Phone}}` | `+11234567890` |
| **address.first_name** | `{{User - First Name}}` | `John` |
| **address.last_name** | `{{User - Last Name}}` | `Doe` |
| **address.street** | `{{User - Street}}` | `123 Main St` |
| **address.city** | `{{User - City}}` | `San Francisco` |
| **address.region** | `{{User - Region}}` | `CA` |
| **address.postal_code** | `{{User - Postal}}` | `94102` |
| **address.country** | `{{User - Country}}` | `US` |

**Consent Behavior:**

```javascript
// When ad_user_data = 'granted'
Google Ads receives:
  ✅ Conversion event
  ✅ User data (hashed)
  ✅ Enhanced matching

// When ad_user_data = 'denied'
Google Ads receives:
  ✅ Conversion event
  ❌ User data NOT sent (automatic)
  ⚠️ Standard conversion tracking only
```

**No additional consent check needed** — Google tags automatically respect `ad_user_data` signal.

### Data Hashing

**Automatic Hashing:**
- Google Tag Manager **automatically hashes** user data using SHA-256
- You provide plaintext data
- GTM hashes before sending to Google

**Manual Hashing (if needed):**

```javascript
// If you need to hash server-side
const crypto = require('crypto');

function hashSHA256(value) {
  return crypto.createHash('sha256')
    .update(value.toLowerCase().trim())
    .digest('hex');
}

const hashedEmail = hashSHA256('user@example.com');
// Result: 'f660ab912ec121d1b1e928a0bb4bc61b15f5ad44d5efdc4e1c92a25e99b8e44a'
```

### Enhanced Conversions Testing

**Verify in Google Ads:**

1. Google Ads → Tools → Conversions
2. Select conversion action
3. Check "Enhanced conversions" status:
   - ✅ **"Receiving enhanced conversions"** — Working
   - ⚠️ **"Not receiving"** — Check implementation

4. Click "View details" → Check diagnostics

**Test with Google Tag Assistant:**

1. Install "Google Tag Assistant" (Chrome extension)
2. Visit your site
3. Complete a conversion
4. Check Tag Assistant:
   - Enhanced conversions data detected?
   - User data present? (shows hashed)

---

## 5. Remarketing & Consent

### Remarketing Requirements (EEA Post-March 2024)

**Critical:** In EEA, remarketing audiences only build if user grants ALL THREE signals:

```
ad_storage = 'granted'
    AND
ad_user_data = 'granted'
    AND
ad_personalization = 'granted'
```

**If any one is 'denied':**
- ❌ User NOT added to remarketing audiences (EEA only)
- ✅ Conversion tracking still works (modeling)
- ⚠️ Outside EEA: Less strict (check regional requirements)

### GTM Remarketing Tag Setup

**Tag Configuration:**
- Tag Type: **Google Ads Remarketing**
- Tag Name: `Google Ads - Remarketing Tag`

**Settings:**

| Field | Value |
|-------|-------|
| **Conversion ID** | `AW-XXXXXXXXX` |
| **Custom Parameters** (optional) | Dynamic remarketing params |

**Custom Parameters for Dynamic Remarketing:**

| Parameter | Value | Example |
|-----------|-------|---------|
| `ecomm_prodid` | Product IDs | `['PROD123', 'PROD456']` |
| `ecomm_pagetype` | Page type | `'product'`, `'cart'`, `'purchase'` |
| `ecomm_totalvalue` | Cart value | `149.99` |

**Consent:**
- ✅ Built-in consent checks (automatic)
- Requires: `ad_storage`, `ad_personalization`

**Trigger:**
- Trigger Type: **All Pages**
- OR: Specific pages (product, cart, etc.)

### Dynamic Remarketing

**Example: Product Page**

```javascript
// DataLayer push on product page
dataLayer.push({
  'ecommerce': {
    'detail': {
      'products': [{
        'id': 'PROD123',
        'name': 'Blue Widget',
        'price': '29.99'
      }]
    }
  },
  'ecomm_prodid': ['PROD123'],
  'ecomm_pagetype': 'product',
  'ecomm_totalvalue': 29.99
});
```

**GTM Variables:**

```
Variable: Ecomm - Product ID
Type: Data Layer Variable
Name: ecomm_prodid

Variable: Ecomm - Page Type
Type: Data Layer Variable
Name: ecomm_pagetype

Variable: Ecomm - Total Value
Type: Data Layer Variable
Name: ecomm_totalvalue
```

**Remarketing Tag Configuration:**

```
Custom Parameters:
├─ ecomm_prodid: {{Ecomm - Product ID}}
├─ ecomm_pagetype: {{Ecomm - Page Type}}
└─ ecomm_totalvalue: {{Ecomm - Total Value}}
```

### Verifying Audience Building

**Check in Google Ads:**

1. Google Ads → Tools → Audience Manager
2. View "Your data sources" → Website visitors
3. Check audience size:
   - **Before consent implementation:** Larger audiences
   - **After consent (EEA):** Smaller audiences (consenting users only)
   - **Expected behavior** ✅

4. Segment by location:
   - EEA audiences: Only consenting users
   - Non-EEA audiences: All users (or based on local consent rules)

---

## 6. Customer Match & Consent

### What is Customer Match?

**Customer Match** uploads customer lists (email, phone, address) to Google Ads for targeting.

**Consent Requirements:**
- ✅ Users must have consented to receive marketing
- ✅ Consent must cover sharing data with Google for advertising
- ✅ Privacy policy must mention Customer Match

**Legal Basis:** Consent + Legitimate Interest (varies by region)

### Consent Considerations

**GDPR:**
- ✅ Explicit consent required to share customer data with Google for advertising
- ✅ Privacy policy must disclose Customer Match
- ✅ Users can request removal from list

**CCPA:**
- ⚠️ May be considered "sale" of personal information
- ✅ Must honor opt-out requests
- ✅ Privacy policy must mention data sharing

### Implementation Best Practices

**Step 1: Obtain Proper Consent**

In your consent banner or preference center:
```
☐ I agree to receive personalized advertising, including sharing
  my email address with advertising partners like Google.
```

**Step 2: Filter Customer List**

```javascript
// Example: Export consented users only
SELECT email, phone, first_name, last_name
FROM customers
WHERE marketing_consent = TRUE
  AND consent_date >= '2024-01-01'
  AND opt_out = FALSE;
```

**Step 3: Upload to Google Ads**

1. Google Ads → Tools → Audience Manager
2. Click "+" → Customer Match
3. Upload CSV:
   ```
   Email,Phone,First Name,Last Name
   user1@example.com,+11234567890,John,Doe
   user2@example.com,+10987654321,Jane,Smith
   ```
4. Google hashes and matches

**Step 4: Respect Opt-Outs**

- Regularly update list to remove opt-outs
- Process GDPR/CCPA requests to remove users

### Customer Match + Enhanced Conversions

**Different Use Cases:**

| Feature | Use Case | Consent Signal | Data Flow |
|---------|----------|----------------|-----------|
| **Enhanced Conversions** | Improve conversion attribution | `ad_user_data` | Browser → Google (per conversion) |
| **Customer Match** | Audience targeting | Marketing consent | Upload → Google (batch list) |

**Can use both:** They complement each other for better targeting and attribution.

---

## 7. Testing & Verification

### Google Ads Conversion Testing

**Method 1: Google Ads Preview Mode**

1. Google Ads → Tools → Conversions
2. Select conversion action
3. Click "Test conversion"
4. Perform conversion on your site
5. Check Google Ads for test conversion event

**Method 2: GTM Preview Mode**

1. Enable GTM Preview
2. Visit site, trigger conversion
3. GTM Preview → Check:
   - ✅ Conversion tag fired
   - ✅ Consent state shows 'granted'
   - ✅ Conversion value passed

**Method 3: Google Tag Assistant**

1. Install extension
2. Complete conversion
3. Check:
   - ✅ Google Ads Conversion tag detected
   - ✅ Conversion ID correct
   - ✅ Enhanced Conversions data (if applicable)

### Consent State Verification

**Check Consent Signals:**

```javascript
// Browser console
window.google_tag_data?.ics?.entries

// Expected (after marketing consent):
{
  ad_storage: {default: "denied", update: "granted"},
  ad_user_data: {default: "denied", update: "granted"},
  ad_personalization: {default: "denied", update: "granted"}
}
```

### Remarketing Tag Testing

**Method 1: Google Ads Tag Diagnostics**

1. Google Ads → Tools → Conversions
2. "Google Ads tag" section → Diagnostics
3. Check:
   - ✅ Tag detected on website
   - ✅ Firing correctly
   - ⚠️ Any errors/warnings

**Method 2: Audience Manager**

1. Google Ads → Audience Manager
2. Your data sources → Website visitors
3. Check "Tag health":
   - ✅ Active
   - ⚠️ Issues detected (review)

### Enhanced Conversions Verification

**Google Ads Diagnostics:**

1. Google Ads → Tools → Conversions → [Conversion Action]
2. Enhanced conversions status:
   - ✅ "Receiving enhanced conversions"
   - Check match rate (typically 30-70%)

**Event-Level Check:**

1. Complete test conversion
2. Google Ads → Conversions → "Recent conversions"
3. Check if "Enhanced" indicator present

---

## 8. Troubleshooting

### Issue 1: Conversions Not Tracking

**Symptoms:**
- No conversions appearing in Google Ads
- Conversion count = 0

**Causes:**
- ❌ Consent denied (expected if users not consenting)
- ❌ Tag not firing
- ❌ Conversion ID/Label incorrect
- ❌ Conversion linker tag missing

**Solutions:**

1. **Check consent state:**
   ```javascript
   // Console
   window.google_tag_data?.ics?.entries?.ad_storage
   // Should show: {update: "granted"}
   ```

2. **Verify tag firing (GTM Preview):**
   - Tag should fire on conversion event
   - Check trigger conditions met

3. **Check Conversion ID/Label:**
   - Google Ads → Tools → Conversions → Select action
   - Compare with GTM tag configuration

4. **Add Conversion Linker tag (if missing):**
   - GTM → Tags → New
   - Type: **Conversion Linker**
   - Trigger: All Pages
   - This tag sets GCLID cookies for proper attribution

### Issue 2: Remarketing Audiences Not Building (EEA)

**Symptoms:**
- Audience size = 0 or very small (EEA only)
- Non-EEA audiences building fine

**Causes:**
- ❌ Missing v2 signals (`ad_user_data`, `ad_personalization`)
- ❌ Users denying consent (expected)
- ❌ Remarketing tag not firing

**Solutions:**

1. **Verify all 3 signals present:**
   ```javascript
   // Console
   ['ad_storage', 'ad_user_data', 'ad_personalization'].map(signal => {
     return {
       signal,
       state: window.google_tag_data?.ics?.entries?.[signal]
     };
   });
   // All should show {update: "granted"} for remarketing to work
   ```

2. **Check consent rate:**
   - Cookiebot Dashboard → Reports
   - If most users deny → small audiences = expected ✅

3. **Wait for accumulation:**
   - Audiences need 30+ days to populate
   - Check "Last 7 days" audience size (should grow over time)

4. **Verify remarketing tag:**
   - GTM Preview → Remarketing tag should fire on all pages (with consent)

### Issue 3: Enhanced Conversions Not Matching

**Symptoms:**
- Enhanced Conversions enabled
- But Google Ads shows "Not receiving" or low match rate

**Causes:**
- ❌ `ad_user_data` denied
- ❌ User data variables empty
- ❌ Email format incorrect
- ❌ Users not signed in (no user data available)

**Solutions:**

1. **Check ad_user_data consent:**
   ```javascript
   window.google_tag_data?.ics?.entries?.ad_user_data
   // Should show: {update: "granted"}
   ```

2. **Verify user data variables:**
   - GTM Preview → Variables
   - Check: `{{User - Email}}`, `{{User - Phone}}`, etc.
   - Should populate with actual values (not empty)

3. **Check email format:**
   - Must be lowercase
   - Must be trimmed (no spaces)
   - Valid email address

4. **Improve data collection:**
   - Encourage user sign-in
   - Collect email at checkout
   - More user data = better match rates

### Issue 4: Duplicate Conversions

**Symptoms:**
- Conversions counted 2x or more
- Inflated conversion numbers

**Causes:**
- ❌ Multiple conversion tags firing
- ❌ No transaction ID (can't deduplicate)
- ❌ Server-side + client-side without deduplication

**Solutions:**

1. **Audit conversion tags:**
   ```
   GTM → Tags → Filter: "Google Ads Conversion"
   Check how many tags fire on same trigger
   ```

2. **Add transaction ID:**
   ```javascript
   // GTM Variable
   Variable: Transaction ID
   Type: Data Layer Variable
   Name: ecommerce.purchase.actionField.id

   // Use in conversion tag
   Transaction ID: {{Transaction ID}}
   ```
   Google deduplicates based on Transaction ID.

3. **Server-side deduplication:**
   - Use same Transaction ID for both client and server conversions
   - Google automatically deduplicates within 48 hours

### Issue 5: Conversions Attributed to Wrong Source

**Symptoms:**
- Conversions show as "Direct" instead of "Google Ads"
- Attribution incorrect

**Causes:**
- ❌ GCLID parameter lost (redirects, payment gateways)
- ❌ Conversion Linker tag missing
- ❌ Cross-domain tracking not configured

**Solutions:**

1. **Add Conversion Linker tag:**
   - GTM → Tags → New → Conversion Linker
   - Trigger: All Pages
   - This preserves GCLID across sessions

2. **Check URL for GCLID:**
   - After clicking Google Ad, check URL:
     - Should contain: `?gclid=XXXXXXX`
   - If missing → check ad destination URL settings

3. **Cross-domain tracking:**
   - If checkout on different domain (e.g., Shopify):
     - Configure cross-domain tracking
     - Add domains to GA4/GTM settings

---

## Appendix: Google Ads Consent Checklist

```
☐ Consent Mode v2 implemented (ad_storage, ad_user_data, ad_personalization)
☐ Conversion Linker tag added (GTM, All Pages trigger)
☐ Google Ads Conversion tags created for key actions
☐ Conversion tags use built-in consent checks
☐ Conversion IDs and Labels correct (from Google Ads)
☐ Transaction IDs passed (for deduplication)
☐ Dynamic conversion values configured
☐ Enhanced Conversions enabled in Google Ads
☐ User data variables created (email, phone, address)
☐ Enhanced Conversions user data populated
☐ Remarketing tag added (if using remarketing)
☐ Dynamic remarketing parameters configured (if ecommerce)
☐ Tested: Conversions fire with consent
☐ Tested: Conversions blocked without consent
☐ Verified: Google Ads shows conversions
☐ Verified: Remarketing audiences building (for consenting users)
☐ Verified: Enhanced Conversions receiving data
☐ Customer Match: Only upload consented users
☐ Privacy policy mentions Google Ads and consent
```

---

## Resources

- **Google Ads Conversion Tracking:** https://support.google.com/google-ads/answer/1722022
- **Enhanced Conversions:** https://support.google.com/google-ads/answer/11062876
- **Consent Mode for Google Ads:** https://support.google.com/google-ads/answer/10000067
- **Customer Match:** https://support.google.com/google-ads/answer/6379332

---

**End of Google Ads Consent Configuration Guide**
