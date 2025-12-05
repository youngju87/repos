# Google Consent Mode v2 Technical Guide

**JY/co Consent & Privacy Implementation**
**Version 1.0**
**Date: December 2025**

---

## Table of Contents

1. [What is Google Consent Mode v2?](#1-what-is-google-consent-mode-v2)
2. [v1 vs v2: What Changed](#2-v1-vs-v2-what-changed)
3. [Consent Mode Signals](#3-consent-mode-signals)
4. [Implementation Methods](#4-implementation-methods)
5. [Basic vs Advanced Mode](#5-basic-vs-advanced-mode)
6. [Conversion Modeling](#6-conversion-modeling)
7. [Regional Configuration](#7-regional-configuration)
8. [Verification & Testing](#8-verification--testing)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. What is Google Consent Mode v2?

### Overview

**Google Consent Mode** is an API that allows Google tags (Google Analytics, Google Ads, Floodlight) to adjust their behavior based on user consent choices.

**Key Principle:**
> "Tags can fire, but their behavior adapts to consent state."

Instead of completely blocking tags when consent is denied, Consent Mode allows tags to:
- Send **cookieless pings** when consent denied (Advanced mode)
- Set **cookies only when consent granted**
- Enable **conversion modeling** to recover measurement data

### Why Google Created Consent Mode

**Problem Without Consent Mode:**

```
User denies consent
    ↓
No cookies set
    ↓
No measurement data at all
    ↓
100% data loss for non-consenting users
    ↓
Blind spots in marketing performance
```

**Solution With Consent Mode:**

```
User denies consent
    ↓
Consent Mode: analytics_storage = 'denied'
    ↓
GA4 sends cookieless ping (no user ID, aggregate data)
    ↓
Google uses machine learning to model conversions
    ↓
~70% measurement accuracy recovered
    ↓
Compliant + insightful
```

### Legal Compliance

**GDPR Compliant:**
- ✅ No cookies without consent
- ✅ No personal data without consent
- ✅ Cookieless pings use aggregate, anonymous data
- ✅ Respects user choice

**CCPA Compliant:**
- ✅ Honors opt-out requests
- ✅ Can configure per-region consent

---

## 2. v1 vs v2: What Changed

### Timeline

| Date | Event |
|------|-------|
| **September 2020** | Consent Mode v1 launched |
| **November 2023** | Consent Mode v2 announced |
| **March 6, 2024** | **v2 REQUIRED for Google Ads in EEA** |
| **Present** | v2 enforcement active |

### Signal Comparison

| Signal | v1 | v2 | Description |
|--------|----|----|-------------|
| `ad_storage` | ✅ | ✅ | Permission to store advertising cookies |
| `analytics_storage` | ✅ | ✅ | Permission to store analytics cookies |
| `ad_user_data` | ❌ | ✅ **NEW** | Permission to send user data to Google for advertising |
| `ad_personalization` | ❌ | ✅ **NEW** | Permission to use data for personalized ads |
| `functionality_storage` | ❌ | ✅ **NEW** | Permission to store functionality cookies |
| `personalization_storage` | ❌ | ✅ **NEW** | Permission to store personalization cookies |
| `security_storage` | ❌ | ✅ **NEW** | Permission for security cookies (always granted) |

### What v2 Adds

**Two Critical Advertising Signals:**

#### 1. `ad_user_data`

**Purpose:** Governs whether user data can be sent to Google for advertising purposes.

**Examples of "user data":**
- Hashed email addresses (Enhanced Conversions)
- Phone numbers (Customer Match)
- First-party customer IDs
- CRM data sent to Google Ads

**Impact if denied:**
- Enhanced Conversions won't send user data
- Customer Match uploads still work (requires explicit consent collected separately)
- Standard conversion tracking still functions

#### 2. `ad_personalization`

**Purpose:** Governs whether Google can use data for personalized advertising targeting.

**Impact if denied:**
- Remarketing audiences won't build for EEA users
- Personalized ads won't show to this user
- Generic ads may still show (contextual targeting)

### Why v2 is Required

**Google's Requirement (as of March 2024):**

> For advertisers serving ads in the EEA and UK, Google Ads and Google Marketing Platform will only allow remarketing/retargeting audiences to be built from users who have granted consent for `ad_storage`, `ad_user_data`, and `ad_personalization`.

**Translation:**
- ❌ Without v2 signals: No remarketing audiences in EEA
- ✅ With v2 signals: Remarketing works (for consenting users)

### Upgrade Path

**If you're on v1:**

```javascript
// OLD (v1)
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'analytics_storage': 'denied'
});

// NEW (v2) - Add 2 new signals
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'analytics_storage': 'denied',
  'ad_user_data': 'denied',        // NEW
  'ad_personalization': 'denied'   // NEW
});
```

**Good news:** If using Cookiebot, this is **automatic**. Cookiebot v3+ handles v2 signals.

---

## 3. Consent Mode Signals

### All Signals Reference

#### `ad_storage`

| Property | Value |
|----------|-------|
| **Purpose** | Controls whether advertising cookies can be stored |
| **Affects** | Google Ads cookies (`_gcl_*`), DoubleClick cookies, remarketing tags |
| **Maps to Cookiebot** | Marketing category |
| **Required for** | Remarketing, conversion tracking with cookies |
| **Default** | `'denied'` (GDPR) |
| **Grant when** | User accepts marketing cookies |

**Example cookies controlled:**
- `_gcl_au` (Google Ads)
- `_gcl_aw` (Google Ads conversion)
- `IDE` (DoubleClick)
- `DSID` (DoubleClick)

#### `ad_user_data`

| Property | Value |
|----------|-------|
| **Purpose** | Controls whether user data can be sent to Google for advertising |
| **Affects** | Enhanced Conversions, Customer Match, user-provided data |
| **Maps to Cookiebot** | Marketing category |
| **Required for** | Enhanced conversion tracking, improved attribution |
| **Default** | `'denied'` (GDPR) |
| **Grant when** | User accepts marketing cookies |

**Data types controlled:**
- Hashed email addresses
- Phone numbers
- Mailing addresses
- First-party user IDs

**Technical implementation:**

```javascript
// When ad_user_data = 'granted'
gtag('config', 'AW-CONVERSION_ID', {
  'email': 'user@example.com',  // ✅ Sent
  'phone': '+1234567890'         // ✅ Sent
});

// When ad_user_data = 'denied'
gtag('config', 'AW-CONVERSION_ID', {
  'email': 'user@example.com',  // ❌ NOT sent
  'phone': '+1234567890'         // ❌ NOT sent
});
```

#### `ad_personalization`

| Property | Value |
|----------|-------|
| **Purpose** | Controls whether data can be used for personalized advertising |
| **Affects** | Remarketing audiences, personalized ad targeting |
| **Maps to Cookiebot** | Marketing category |
| **Required for** | Building remarketing audiences in EEA |
| **Default** | `'denied'` (GDPR) |
| **Grant when** | User accepts marketing cookies |

**Impact:**

| State | Remarketing | Ad Personalization |
|-------|-------------|-------------------|
| `'granted'` | ✅ Audiences build | ✅ Personalized ads |
| `'denied'` | ❌ No audiences (EEA) | ❌ Generic ads only |

#### `analytics_storage`

| Property | Value |
|----------|-------|
| **Purpose** | Controls whether analytics cookies can be stored |
| **Affects** | Google Analytics cookies (`_ga`, `_gid`, etc.) |
| **Maps to Cookiebot** | Statistics category |
| **Required for** | Full GA4 measurement with user IDs |
| **Default** | `'denied'` (GDPR) |
| **Grant when** | User accepts statistics/analytics cookies |

**Example cookies controlled:**
- `_ga` (GA4 client ID)
- `_ga_*` (GA4 measurement ID)
- `_gid` (Session ID)
- `_gat` (Throttling)

#### `functionality_storage`

| Property | Value |
|----------|-------|
| **Purpose** | Controls whether functionality/preference cookies can be stored |
| **Affects** | Custom preference cookies |
| **Maps to Cookiebot** | Preferences category |
| **Required for** | Storing user preferences (language, region, etc.) |
| **Default** | `'denied'` (GDPR) |
| **Grant when** | User accepts preference cookies |

**Not commonly used by Google tags**, but available for custom implementations.

#### `personalization_storage`

| Property | Value |
|----------|-------|
| **Purpose** | Controls whether personalization cookies can be stored |
| **Affects** | Recommendation engines, personalized content |
| **Maps to Cookiebot** | Preferences category |
| **Required for** | Non-ad personalization (content, product recommendations) |
| **Default** | `'denied'` (GDPR) |
| **Grant when** | User accepts preference cookies |

**Not commonly used by Google tags**.

#### `security_storage`

| Property | Value |
|----------|-------|
| **Purpose** | Controls whether security-related cookies can be stored |
| **Affects** | Anti-fraud, security tokens, bot detection |
| **Maps to Cookiebot** | Necessary category |
| **Required for** | Security features (always allowed) |
| **Default** | `'granted'` (always) |
| **Grant when** | Automatically (no consent needed) |

### Signal Dependencies

**For full Google Ads functionality in EEA:**

```
ad_storage = 'granted'
    AND
ad_user_data = 'granted'
    AND
ad_personalization = 'granted'
    ↓
Full remarketing + enhanced conversions + personalization
```

**If any one is denied:**
- Remarketing audiences won't build (EEA)
- Enhanced conversion user data not sent
- Personalized ads disabled

---

## 4. Implementation Methods

### Method 1: CMP Automatic (Recommended)

**Using Cookiebot:**

Cookiebot automatically handles Consent Mode when:
1. Cookiebot script loads before GTM
2. `data-blockingmode="auto"` is set
3. Modern Google tags are used

**No code needed** — Cookiebot:
- Sets default consent state
- Updates consent on user interaction
- Maps categories to signals:
  - Marketing → `ad_storage`, `ad_user_data`, `ad_personalization`
  - Statistics → `analytics_storage`
  - Preferences → `functionality_storage`, `personalization_storage`

**Implementation:**

```html
<head>
  <!-- Cookiebot handles Consent Mode automatically -->
  <script id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="YOUR-COOKIEBOT-ID"
          data-blockingmode="auto">
  </script>

  <!-- GTM loads after -->
  <script>/* GTM code */</script>
</head>
```

**That's it!** Consent Mode is active.

### Method 2: Manual Implementation

**For custom CMPs or no CMP:**

#### Step 1: Set Default Consent (Before GTM)

```html
<head>
  <!-- Initialize dataLayer -->
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}

    // Set default consent BEFORE GTM loads
    gtag('consent', 'default', {
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'analytics_storage': 'denied',
      'functionality_storage': 'denied',
      'personalization_storage': 'denied',
      'security_storage': 'granted',  // Always granted
      'wait_for_update': 500  // Wait 500ms for user interaction
    });
  </script>

  <!-- NOW load GTM -->
  <script>
    (function(w,d,s,l,i){...GTM code...})(window,document,'script','dataLayer','GTM-XXXXX');
  </script>
</head>
```

**Critical:** This MUST run before GTM loads.

#### Step 2: Update Consent After User Choice

```javascript
// When user ACCEPTS marketing cookies
gtag('consent', 'update', {
  'ad_storage': 'granted',
  'ad_user_data': 'granted',
  'ad_personalization': 'granted'
});

// When user ACCEPTS statistics cookies
gtag('consent', 'update', {
  'analytics_storage': 'granted'
});

// When user ACCEPTS preferences cookies
gtag('consent', 'update', {
  'functionality_storage': 'granted',
  'personalization_storage': 'granted'
});

// When user DENIES all (explicit deny)
gtag('consent', 'update', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'functionality_storage': 'denied',
  'personalization_storage': 'denied'
});
```

#### Step 3: Listen for Custom CMP Events

```javascript
// Example: Custom consent banner
document.getElementById('acceptAll').addEventListener('click', function() {
  // Update consent
  gtag('consent', 'update', {
    'ad_storage': 'granted',
    'ad_user_data': 'granted',
    'ad_personalization': 'granted',
    'analytics_storage': 'granted',
    'functionality_storage': 'granted',
    'personalization_storage': 'granted'
  });

  // Hide banner
  document.getElementById('consentBanner').style.display = 'none';

  // Store consent choice
  localStorage.setItem('consent', JSON.stringify({
    ad: true,
    analytics: true,
    timestamp: Date.now()
  }));
});
```

### Method 3: GTM Tag for Consent Defaults

**If you must use GTM to set defaults:**

**Tag Configuration:**
- Tag Type: Custom HTML
- Tag Name: "Consent Mode - Defaults"

**HTML:**

```html
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}

  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied',
    'functionality_storage': 'denied',
    'personalization_storage': 'denied',
    'security_storage': 'granted',
    'wait_for_update': 500
  });
</script>
```

**Trigger:**
- Trigger Type: **Consent Initialization - All Pages**

**Advanced Settings:**
- Tag firing priority: **999** (highest)

**⚠️ Warning:** This method is less reliable than Method 1 or 2.

---

## 5. Basic vs Advanced Mode

### Comparison Matrix

| Feature | Basic Mode | Advanced Mode |
|---------|------------|---------------|
| **Tag Behavior (Consent Denied)** | Tags don't fire at all | Tags send cookieless pings |
| **Cookies Set (Denied)** | ❌ No cookies | ❌ No cookies |
| **Data Sent (Denied)** | ❌ No data | ✅ Aggregated, anonymous pings |
| **Conversion Modeling** | ❌ No | ✅ Yes (~70% accuracy) |
| **User ID/Tracking** | ❌ No | ❌ No (even in Advanced) |
| **Remarketing (Denied)** | ❌ No | ❌ No (requires consent) |
| **Measurement Accuracy** | Lower (data gaps) | Higher (modeling fills gaps) |
| **Privacy Level** | Highest (no data at all) | High (aggregate only) |
| **GDPR Compliant** | ✅ Yes | ✅ Yes |
| **Configuration** | Default behavior | Automatic with updated tags |

### How Each Mode Works

#### Basic Consent Mode

**Flow:**

```
User visits site
↓
Consent Mode: analytics_storage = 'denied'
↓
GA4 tag checks consent state
↓
State is 'denied' → Tag DOES NOT FIRE
↓
Zero data collected
↓
User accepts consent
↓
Consent Mode: analytics_storage = 'granted'
↓
GA4 tag fires normally
↓
Full data collection begins
```

**Result:** Clean, simple, but **no measurement** for non-consenting users.

#### Advanced Consent Mode

**Flow:**

```
User visits site
↓
Consent Mode: analytics_storage = 'denied'
↓
GA4 tag checks consent state
↓
State is 'denied' → Tag fires in "cookieless mode"
↓
Sends anonymous ping:
  • No cookies
  • No user ID
  • No personal data
  • Aggregate conversion info only
↓
Google receives ping, uses for modeling
↓
User accepts consent
↓
Consent Mode: analytics_storage = 'granted'
↓
GA4 tag fires normally with full tracking
```

**Result:** ~70% measurement accuracy maintained, still GDPR compliant.

### Cookieless Pings Explained

**What Gets Sent (Advanced Mode, Consent Denied):**

```
✅ Aggregate data:
  • Timestamp (rounded to hour)
  • General location (country, not IP)
  • Event type (pageview, conversion)
  • URL visited (anonymized)
  • Referrer source (anonymized)

❌ NOT sent:
  • Cookies
  • User IDs
  • Client IDs
  • IP addresses (exact)
  • Device IDs
  • Cross-site identifiers
  • Personal data
```

**Network Request Example:**

```
// Basic Mode (denied) - NO REQUEST

// Advanced Mode (denied) - COOKIELESS PING
GET https://www.google-analytics.com/g/collect?
  v=2
  &tid=G-XXXXXXXXXX
  &en=page_view
  &gcs=G110  ← Consent state: analytics denied
  &dma=1     ← Data redaction active
  &npa=1     ← No personalized ads
  (no _ga cookies, no client_id)
```

### Enabling Advanced Mode

**Good news:** Advanced mode is **automatic** when:

1. ✅ Consent Mode is properly implemented (defaults set)
2. ✅ Using latest Google tags:
   - Google Tag (gtag.js) — latest version
   - GA4 tags — created after March 2023
   - Google Ads tags — updated versions
3. ✅ No special configuration needed

**Verification:**

Check GA4 → Admin → Data Settings → Data Collection:
- Look for "Google signals" status
- Check "Consent mode" shows "Active"

[INSERT SCREENSHOT: GA4 Consent Mode status]

### Which Mode to Use?

**Recommendation: Advanced Mode**

| Scenario | Basic Mode | Advanced Mode |
|----------|------------|---------------|
| **Strict privacy requirements** | ✅ Use if absolute zero data | ⚠️ May be too much data |
| **Business needs measurement** | ❌ Too much data loss | ✅ Optimal balance |
| **GDPR compliance required** | ✅ Compliant | ✅ Compliant |
| **Marketing attribution important** | ❌ Major gaps | ✅ Modeling helps |
| **Default/recommended** | ❌ | ✅ Use this |

**Why Advanced is Better:**
- Still GDPR compliant (no cookies, no personal data)
- Recovers ~70% of measurement through modeling
- Enables better marketing decisions
- Google's recommended approach
- No downside for compliant implementation

---

## 6. Conversion Modeling

### What is Conversion Modeling?

**Conversion modeling** uses machine learning to estimate conversions from users who denied consent, based on patterns from users who granted consent.

**How It Works:**

```
Users Who GRANTED Consent (30% of traffic)
  ↓
  Full data: Device, behavior, conversion patterns
  ↓
  Google's ML model learns:
  • What behaviors lead to conversions
  • Typical customer journeys
  • Conversion rates by segment
  ↓
  Model applies patterns to...
  ↓
Users Who DENIED Consent (70% of traffic)
  ↓
  Limited data: Cookieless pings only
  ↓
  Model estimates:
  • Likely conversions from this traffic
  • Aggregate conversion impact
  ↓
RESULT: ~70% accuracy for denied traffic
```

### Modeling Requirements

**To activate conversion modeling:**

| Requirement | Details |
|-------------|---------|
| **Consent Mode** | Must be properly implemented (Advanced mode) |
| **Google Signals** | Must be enabled in GA4 |
| **Data Volume** | Need at least 1,000 events per day per signal state |
| **Time** | 7-30 days of data collection |
| **Consistency** | Consistent consent rate (not wildly fluctuating) |

### Enabling Modeling in GA4

**Step 1: Enable Google Signals**

1. GA4 → Admin → Data Settings → Data Collection
2. Toggle **"Google signals data collection"** to ON
3. Accept terms

[INSERT SCREENSHOT: Google Signals toggle]

**Step 2: Verify Consent Mode Active**

1. Same screen: Data Collection
2. Check "Consent mode" status:
   - ✅ "Active" — Good
   - ❌ "Not implemented" — Fix Consent Mode setup

**Step 3: Wait for Modeling Activation**

- Typically 7-30 days
- GA4 will automatically start modeling
- No additional config needed

**Step 4: Check Modeling Status**

1. GA4 → Reports → Any report
2. Look for ℹ️ icon near metrics
3. Tooltip says: "Includes modeled conversions"

### Modeling Accuracy

**Expected Accuracy:**

| Metric | With Modeling | Without Modeling |
|--------|---------------|------------------|
| **Conversion volume** | ~70% recovery | 0% (denied traffic lost) |
| **Conversion rate** | ~85% accuracy | Major gaps |
| **Attribution** | Directional | Incomplete |
| **Audience insights** | Partially recovered | Only consenting users |

**Factors Affecting Accuracy:**

- ✅ Higher consent rate = better modeling (more training data)
- ✅ Consistent user behavior patterns = more accurate
- ✅ Longer time period = model improves
- ❌ Low traffic = less reliable
- ❌ Highly variable behavior = less accurate

### Viewing Modeled Data

**In GA4:**

Modeled conversions are **automatically included** in reports. You can't separate them easily, but:

**Check if modeling is active:**
1. GA4 → Reports → Acquisition → Traffic acquisition
2. Hover over "Conversions" metric
3. Tooltip shows: "Includes modeled conversions" ℹ️

**Reporting Adjustments:**
- Reports show *observed + modeled* data
- No separate "modeled" dimension
- Confidence intervals wider for modeled data

---

## 7. Regional Configuration

### Geo-Targeted Consent Defaults

Set different consent defaults based on user location:

**Example: Strict for EEA, Lenient for US**

```javascript
// EEA: Opt-in (denied by default)
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'region': ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI',
             'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU',
             'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
             'GB', 'IS', 'LI', 'NO']  // EEA + UK + EFTA
});

// California: Opt-out (denied initially, but can grant after user doesn't opt out)
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'analytics_storage': 'denied',
  'region': ['US-CA']
});

// Rest of US: Opt-out (granted by default, can deny if user opts out)
gtag('consent', 'default', {
  'ad_storage': 'granted',
  'analytics_storage': 'granted',
  'region': ['US-AL', 'US-AK', 'US-AZ', 'US-AR', 'US-CO', 'US-CT',
             /* ...all other US states except CA... */]
});

// Rest of world: Lenient default
gtag('consent', 'default', {
  'ad_storage': 'granted',
  'analytics_storage': 'granted'
});
```

### Regional Codes

**EEA Countries (ISO codes):**
```
AT (Austria), BE (Belgium), BG (Bulgaria), HR (Croatia),
CY (Cyprus), CZ (Czech Republic), DK (Denmark), EE (Estonia),
FI (Finland), FR (France), DE (Germany), GR (Greece),
HU (Hungary), IE (Ireland), IT (Italy), LV (Latvia),
LT (Lithuania), LU (Luxembourg), MT (Malta), NL (Netherlands),
PL (Poland), PT (Portugal), RO (Romania), SK (Slovakia),
SI (Slovenia), ES (Spain), SE (Sweden)
```

**UK & EFTA:**
```
GB (United Kingdom), IS (Iceland), LI (Liechtenstein), NO (Norway)
```

**US States (use US-XX format):**
```
US-CA (California), US-VA (Virginia), US-CO (Colorado), etc.
```

### Cookiebot Geo-Configuration

**Cookiebot can handle regional defaults automatically:**

1. Dashboard → Domain → Settings → Geolocation
2. Enable "Regional consent"
3. Configure per region:
   - EEA: Strict opt-in banner
   - California: CCPA "Do Not Sell" banner
   - Other: Simplified banner or none

**Cookiebot's mapping:**
- EEA visitors → Full banner, denied defaults
- US (non-CA) visitors → Lenient defaults or no banner
- CA visitors → CCPA-compliant banner

---

## 8. Verification & Testing

### Console Verification

**Check Default Consent State:**

```javascript
// In browser console, after page load:

// Check dataLayer for consent defaults
dataLayer.find(e => e['0'] === 'consent' && e['1'] === 'default')

// Expected output:
{
  0: "consent",
  1: "default",
  2: {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500
  }
}
```

**Check Current Consent State:**

```javascript
// Check Google's internal consent state
window.google_tag_data?.ics?.entries

// Expected output (before consent):
{
  ad_storage: {region: Array(0), default: "denied", update: undefined},
  ad_user_data: {region: Array(0), default: "denied", update: undefined},
  analytics_storage: {region: Array(0), default: "denied", update: undefined},
  ...
}

// After consent granted:
{
  ad_storage: {region: Array(0), default: "denied", update: "granted"},
  ad_user_data: {region: Array(0), default: "denied", update: "granted"},
  ...
}
```

**Check Consent Updates:**

```javascript
// Filter dataLayer for consent update events
dataLayer.filter(e => e['0'] === 'consent' && e['1'] === 'update')

// Should show consent updates after user interaction
```

### GTM Preview Verification

**In GTM Preview Mode:**

1. **Check Consent Initialization:**
   - Event: `gtm.init_consent` or `Consent Initialization`
   - Should fire FIRST

2. **Check Messages Tab:**
   - Look for: "Consent defaults set"
   - Shows signals: `{ad_storage: 'denied', ...}`

3. **After User Accepts:**
   - New event: `consent` (Custom Event)
   - Check parameters show `update` action
   - Verify signals changed to `'granted'`

[INSERT SCREENSHOT: GTM Preview consent messages]

### GA4 Verification

**Check Consent Mode Status:**

1. GA4 → Admin → Data Settings → Data Collection
2. Look for "Consent mode" section:
   - ✅ **Active** — Implementation successful
   - ⚠️ **Not detected** — Check implementation
   - ❌ **Not implemented** — No Consent Mode found

**Check DebugView:**

1. Enable GA4 debug mode:
   ```javascript
   gtag('set', 'debug_mode', true);
   ```
   OR use Google Analytics Debugger extension

2. GA4 → Admin → DebugView
3. Trigger events
4. Check event parameters for:
   - `gcs` (Google Consent State) parameter
   - Values like `G110` (analytics denied, ads denied)

**Consent State Codes:**

| Code | Meaning |
|------|---------|
| `G100` | All denied |
| `G110` | Analytics denied, ads denied |
| `G111` | All granted |
| `G101` | Analytics granted, ads denied |

### Google Ads Verification

**Check Consent Mode in Google Ads:**

1. Google Ads → Tools → Audience Manager
2. Select a remarketing audience
3. Check "Status" column:
   - ✅ "Eligible" — Consent Mode working
   - ⚠️ "Limited" — May indicate consent issues in EEA

**For Enhanced Conversions:**

1. Google Ads → Tools → Conversions
2. Select a conversion action
3. Check "Enhanced conversions" status:
   - ✅ "Active" — User data being sent (when consented)
   - ⚠️ Check `ad_user_data` consent if issues

---

## 9. Troubleshooting

### Issue 1: Consent Mode "Not Detected" in GA4

**Symptoms:**
- GA4 shows "Consent mode: Not implemented"

**Causes:**
- ❌ Consent defaults not set before GTM loads
- ❌ Wrong implementation syntax
- ❌ GTM tag outdated

**Solutions:**

1. **Verify script order:**
   ```javascript
   // Console: Check load order
   performance.getEntriesByType('resource')
     .filter(r => r.name.includes('gtm') || r.name.includes('cookiebot'))
     .forEach(r => console.log(r.name, r.startTime));
   ```
   Cookiebot should load BEFORE GTM.

2. **Check consent defaults exist:**
   ```javascript
   // Console
   dataLayer.filter(e => e[1] === 'default')
   // Should return consent default object
   ```

3. **Update GA4 tag:**
   - GTM → Tags → GA4 Configuration
   - Change to "Google Tag" type (latest)
   - Update Measurement ID
   - Save & publish

4. **Wait 24-48 hours:**
   - GA4 may take time to detect Consent Mode

### Issue 2: Modeling Not Active

**Symptoms:**
- No ℹ️ "Includes modeled conversions" tooltip
- Data seems unchanged after enabling Consent Mode

**Causes:**
- ❌ Google Signals not enabled
- ❌ Not enough time passed (need 7-30 days)
- ❌ Low traffic volume

**Solutions:**

1. **Enable Google Signals:**
   - GA4 → Admin → Data Settings → Data Collection
   - Toggle Google Signals ON

2. **Verify traffic:**
   - Need 1,000+ events/day
   - Check GA4 → Reports → Realtime

3. **Wait:**
   - Modeling activates after 7-30 days
   - Be patient

4. **Check consent rate:**
   - If 100% deny: No baseline for modeling
   - If 100% accept: Modeling unnecessary
   - Sweet spot: 30-70% consent rate

### Issue 3: Remarketing Not Building (EEA)

**Symptoms:**
- Remarketing audiences show 0 users (EEA only)
- Google Ads says "No recent traffic"

**Causes:**
- ❌ Missing v2 signals (`ad_user_data`, `ad_personalization`)
- ❌ Users denying consent
- ❌ EEA enforcement active

**Solutions:**

1. **Verify v2 signals present:**
   ```javascript
   // Console
   window.google_tag_data?.ics?.entries
   // Should show ad_user_data and ad_personalization
   ```

2. **Check consent rate:**
   - Cookiebot Dashboard → Reports
   - If most users deny marketing → expected behavior
   - Audiences only build for consenting users

3. **Update Consent Mode:**
   ```javascript
   // Ensure v2 signals included
   gtag('consent', 'update', {
     'ad_storage': 'granted',
     'ad_user_data': 'granted',       // v2
     'ad_personalization': 'granted'  // v2
   });
   ```

4. **Wait for accumulation:**
   - Audiences need time to build (days/weeks)

### Issue 4: Enhanced Conversions Not Sending Data

**Symptoms:**
- Enhanced Conversions show "No data" in Google Ads
- Conversion rate unchanged after implementation

**Causes:**
- ❌ `ad_user_data` denied
- ❌ User data not being passed to tag
- ❌ Email not hashed correctly

**Solutions:**

1. **Check ad_user_data consent:**
   ```javascript
   // Console
   window.google_tag_data?.ics?.entries?.ad_user_data
   // Should show: {update: "granted"}
   ```

2. **Verify user data in tag:**
   - GTM Preview → Variables
   - Check email/phone variables populated

3. **Test conversion:**
   - Google Ads → Tools → Conversions → [Conversion]
   - Enhanced conversions → Test
   - Enter test data, verify detection

### Issue 5: Consent State Not Updating

**Symptoms:**
- User accepts consent, but state stays denied
- Tags still don't fire after acceptance

**Causes:**
- ❌ Consent update not firing
- ❌ Multiple CMPs conflicting
- ❌ Browser cache issue

**Solutions:**

1. **Check for update events:**
   ```javascript
   // Console (after accepting)
   dataLayer.filter(e => e[1] === 'update')
   // Should show consent update objects
   ```

2. **Check for CMP conflicts:**
   ```javascript
   // Console
   typeof Cookiebot !== 'undefined'  // Should be true
   typeof OptanonWrapper !== 'undefined'  // Should be false (OneTrust)
   // Only ONE should be present
   ```

3. **Clear cache & test:**
   - Clear all cookies
   - Hard refresh (Ctrl+Shift+R)
   - Test again in incognito

---

## Appendix A: Complete Implementation Checklist

```
☐ Consent Mode defaults set BEFORE GTM loads
☐ All 7 signals included (6 + security_storage)
☐ v2 signals present: ad_user_data, ad_personalization
☐ Consent update fires on user interaction
☐ GTM Preview shows consent events
☐ GA4 shows "Consent Mode: Active"
☐ Google Signals enabled in GA4
☐ Google Ads tags updated to latest
☐ Remarketing audiences building (for consenting users)
☐ Enhanced Conversions active (if used)
☐ Tested: Accept All → tags fire
☐ Tested: Deny All → tags blocked (or cookieless pings only)
☐ Tested: Customize → granular consent works
☐ Regional configurations set (if needed)
☐ Waited 7-30 days for modeling activation
```

---

## Appendix B: Quick Reference Code

**Full Implementation (Manual):**

```html
<head>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}

    // Set defaults
    gtag('consent', 'default', {
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'analytics_storage': 'denied',
      'functionality_storage': 'denied',
      'personalization_storage': 'denied',
      'security_storage': 'granted',
      'wait_for_update': 500
    });
  </script>

  <!-- GTM -->
  <script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXX');</script>
</head>

<script>
  // After user accepts marketing
  gtag('consent', 'update', {
    'ad_storage': 'granted',
    'ad_user_data': 'granted',
    'ad_personalization': 'granted'
  });

  // After user accepts analytics
  gtag('consent', 'update', {
    'analytics_storage': 'granted'
  });
</script>
```

---

## Resources

- **Official Consent Mode Guide:** https://support.google.com/google-ads/answer/10000067
- **Developer Documentation:** https://developers.google.com/tag-platform/security/guides/consent
- **GA4 Consent Mode:** https://support.google.com/analytics/answer/9976101

---

**End of Google Consent Mode v2 Technical Guide**
