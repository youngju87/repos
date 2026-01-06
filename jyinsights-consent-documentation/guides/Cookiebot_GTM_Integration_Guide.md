# Cookiebot GTM Integration Guide

**JY/co Consent & Privacy Implementation**
**Version 1.0**
**Date: December 2025**

---

## Table of Contents

1. [Installation Methods](#1-installation-methods)
2. [Script Loading Order](#2-script-loading-order)
3. [Built-in Consent Checks](#3-built-in-consent-checks)
4. [Custom Consent Variables](#4-custom-consent-variables)
5. [Custom Consent Triggers](#5-custom-consent-triggers)
6. [Tag Configuration for Consent](#6-tag-configuration-for-consent)
7. [Testing in GTM Preview Mode](#7-testing-in-gtm-preview-mode)
8. [Common GTM Consent Patterns](#8-common-gtm-consent-patterns)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Installation Methods

### Method 1: Direct Script Installation (RECOMMENDED)

Install Cookiebot directly in your website's `<head>` tag, **before** GTM.

**Why This Method:**
- ✅ Cookiebot loads first (sets consent defaults before GTM)
- ✅ No timing issues
- ✅ Most reliable for compliance
- ✅ Recommended by both Cookiebot and Google

**Implementation:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- 1. FIRST: Cookiebot Script -->
  <script id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="YOUR-COOKIEBOT-ID"
          data-blockingmode="auto"
          type="text/javascript">
  </script>

  <!-- 2. SECOND: Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-XXXXXX');</script>

  <title>Your Website</title>
</head>
<body>
  <!-- GTM (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

  <!-- Page content -->
</body>
</html>
```

**Cookiebot Script Attributes:**

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `data-cbid` | Your Cookiebot ID | Links to your account |
| `data-blockingmode` | `"auto"` | Automatic cookie blocking (GDPR) |
| `data-blockingmode` | `"manual"` | Manual control (advanced) |
| `data-georegions` | `'{"region":"EU","cbid":"xxx"}'` | Region-specific settings |
| `data-culture` | `"EN"` | Force language (optional) |

### Method 2: Via GTM Custom HTML Tag (NOT RECOMMENDED)

**⚠️ Warning**: This method can cause timing issues. Only use if direct installation is impossible.

**Setup:**

1. **Create Custom HTML Tag**
   - GTM → Tags → New
   - Tag Type: Custom HTML
   - Name: "Cookiebot - Script Loader"

2. **Add Cookiebot Code:**

```html
<script id="Cookiebot"
        src="https://consent.cookiebot.com/uc.js"
        data-cbid="YOUR-COOKIEBOT-ID"
        data-blockingmode="auto"
        type="text/javascript">
</script>
```

3. **Configure Trigger:**
   - Trigger Type: **Consent Initialization - All Pages**
   - This ensures it fires before other tags

4. **Set Tag Priority:**
   - Advanced Settings → Tag firing priority: **999** (highest)

5. **Add Tag Sequencing:**
   - Advanced Settings → Tag Sequencing
   - ✅ "Fire a tag before [this tag] fires"
   - Select: (none - this should be first)

**Why Not Recommended:**
- ❌ Race conditions between Cookiebot and other tags
- ❌ Consent defaults may not set in time
- ❌ More complex debugging
- ❌ Potential compliance gaps

### Method 3: WordPress Plugin

If using WordPress:

1. Install "Cookiebot CMP" plugin
2. Configure in WordPress → Settings → Cookiebot
3. Enable "Auto-blocking"
4. Plugin handles script injection automatically

---

## 2. Script Loading Order

### Critical Loading Sequence

**The order scripts load determines compliance:**

```
┌─────────────────────────────────────┐
│  1. Cookiebot Script Loads          │
│     • Sets window.Cookiebot object  │
│     • Fires consent defaults        │
│     • Blocks non-consented scripts  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  2. Consent Mode Defaults Set       │
│     gtag('consent', 'default', {    │
│       ad_storage: 'denied',         │
│       analytics_storage: 'denied'   │
│     })                               │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  3. GTM Container Loads             │
│     • Reads consent state           │
│     • Pauses tags awaiting consent  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  4. User Interacts with Banner      │
│     • Accept / Deny / Customize     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  5. Consent Mode Updated            │
│     gtag('consent', 'update', {...})│
│     dataLayer.push({                │
│       event: 'cookie_consent_...'   │
│     })                               │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  6. GTM Tags Fire (Based on Consent)│
│     • GA4 (if analytics consent)    │
│     • Google Ads (if ads consent)   │
│     • Custom tags (if conditions met)│
└─────────────────────────────────────┘
```

### Verifying Load Order

**In Browser DevTools:**

```javascript
// Console → Check objects exist in correct order

// 1. Check Cookiebot loaded
typeof Cookiebot !== 'undefined'
// Should return: true

// 2. Check consent state
Cookiebot.consent
// Should return: {necessary: true, preferences: false, statistics: false, marketing: false}

// 3. Check GTM loaded
typeof google_tag_manager !== 'undefined'
// Should return: true

// 4. Check dataLayer exists
Array.isArray(window.dataLayer)
// Should return: true

// 5. Check consent events fired
dataLayer.filter(e => e.event && e.event.includes('consent'))
// Should return array of consent events
```

**In Network Tab:**

```
Correct Order:
1. consent.cookiebot.com/uc.js          [Cookiebot]
2. www.googletagmanager.com/gtm.js      [GTM]
3. (No GA4/ads requests until consent)
4. [User accepts]
5. www.google-analytics.com/g/collect   [GA4 fires]
6. googleads.g.doubleclick.net          [Ads fires]
```

[INSERT SCREENSHOT: Network tab showing correct load order]

---

## 3. Built-in Consent Checks

### Google Tags with Native Consent Support

Modern Google tags automatically respect Consent Mode:

| Tag Type | Consent Signal | Behavior Without Consent |
|----------|----------------|--------------------------|
| **GA4 Configuration** | `analytics_storage` | No cookies, cookieless ping (Advanced mode) |
| **GA4 Event** | `analytics_storage` | Event queued, fires after consent |
| **Google Ads Conversion** | `ad_storage`, `ad_user_data`, `ad_personalization` | Conversion modeled (Advanced mode) |
| **Google Ads Remarketing** | `ad_storage` | No remarketing tag fires |
| **Floodlight** | `ad_storage` | No tracking |

### Configuring Built-in Consent Checks

**Example: GA4 Configuration Tag**

1. **Create GA4 Tag**
   - GTM → Tags → New
   - Tag Type: **Google Tag** (or "GA4 Configuration")
   - Measurement ID: `G-XXXXXXXXXX`

2. **Consent Settings (Automatic)**
   - Modern GA4 tags have **built-in consent checks**
   - No additional configuration needed
   - Tag automatically waits for `analytics_storage` consent

3. **Trigger**
   - Trigger Type: **Consent Initialization - All Pages**
   - OR: **All Pages** (tag will self-regulate based on consent)

4. **Tag Configuration**

```
Tag Name: GA4 - Configuration
Tag Type: Google Tag
Tag ID: G-XXXXXXXXXX

Configuration Parameters:
├── send_page_view: true
├── (other standard configs)

Advanced Settings:
└── Consent Settings:
    └── Built-in consent checks: ✅ Enabled (default)
        • Waits for analytics_storage consent
        • Automatically handles Consent Mode
```

**Example: Google Ads Conversion Tag**

1. **Create Conversion Tag**
   - Tag Type: **Google Ads Conversion Tracking**
   - Conversion ID: `AW-XXXXXXXXX`
   - Conversion Label: `xxxxxxxxxxxxx`

2. **Consent Settings**
   - Built-in consent checks: ✅ Enabled
   - Requires: `ad_storage`, `ad_user_data`, `ad_personalization`

3. **Trigger**
   - Trigger Type: Custom Event (e.g., `purchase`)
   - Additional conditions: (none needed - tag self-regulates)

### How Built-in Checks Work

**Flow:**

```javascript
// User visits page (no consent yet)
analytics_storage = 'denied'

// GA4 tag fires but...
if (analytics_storage === 'denied') {
  // Advanced Consent Mode: Send cookieless ping
  // Basic Consent Mode: Don't fire at all
}

// User accepts statistics
gtag('consent', 'update', {
  analytics_storage: 'granted'
});

// GA4 tag now fires normally
// Sets cookies, collects full data
```

### Tags WITHOUT Built-in Consent

These tags require manual consent gating:

| Platform | Native Consent? | Solution |
|----------|----------------|----------|
| **Meta/Facebook Pixel** | ❌ No | Use consent-based trigger |
| **TikTok Pixel** | ❌ No | Use consent-based trigger |
| **Pinterest Tag** | ❌ No | Use consent-based trigger |
| **LinkedIn Insight** | ❌ No | Use consent-based trigger |
| **Hotjar** | ❌ No | Use consent-based trigger |
| **Custom scripts** | ❌ No | Use consent-based trigger |

---

## 4. Custom Consent Variables

### Cookiebot Consent State Variables

Create these variables to check consent status in GTM:

#### Variable 1: Cookiebot Consent - Marketing

**Configuration:**
- Variable Type: **Custom JavaScript**
- Variable Name: `Cookiebot Consent - Marketing`

**Code:**
```javascript
function() {
  // Check if Cookiebot is loaded
  if (typeof Cookiebot !== 'undefined' && Cookiebot.consent) {
    return Cookiebot.consent.marketing === true;
  }
  // Default to false if Cookiebot not ready
  return false;
}
```

**Returns:** `true` or `false`

#### Variable 2: Cookiebot Consent - Statistics

**Configuration:**
- Variable Type: **Custom JavaScript**
- Variable Name: `Cookiebot Consent - Statistics`

**Code:**
```javascript
function() {
  if (typeof Cookiebot !== 'undefined' && Cookiebot.consent) {
    return Cookiebot.consent.statistics === true;
  }
  return false;
}
```

#### Variable 3: Cookiebot Consent - Preferences

**Configuration:**
- Variable Type: **Custom JavaScript**
- Variable Name: `Cookiebot Consent - Preferences`

**Code:**
```javascript
function() {
  if (typeof Cookiebot !== 'undefined' && Cookiebot.consent) {
    return Cookiebot.consent.preferences === true;
  }
  return false;
}
```

#### Variable 4: Cookiebot Consent - All (Debug)

**Configuration:**
- Variable Type: **Custom JavaScript**
- Variable Name: `Cookiebot Consent - All Categories`

**Code:**
```javascript
function() {
  if (typeof Cookiebot !== 'undefined' && Cookiebot.consent) {
    return JSON.stringify({
      necessary: Cookiebot.consent.necessary,
      preferences: Cookiebot.consent.preferences,
      statistics: Cookiebot.consent.statistics,
      marketing: Cookiebot.consent.marketing
    });
  }
  return 'Cookiebot not loaded';
}
```

**Returns:** `'{"necessary":true,"preferences":false,"statistics":true,"marketing":false}'`

**Use:** Debugging, dataLayer pushes

### DataLayer Variables

Create variables to capture Cookiebot's dataLayer events:

#### Variable 5: DLV - Cookie Consent Marketing

**Configuration:**
- Variable Type: **Data Layer Variable**
- Variable Name: `DLV - Cookie Consent Marketing`
- Data Layer Variable Name: `cookie_consent_marketing`

#### Variable 6: DLV - Cookie Consent Statistics

**Configuration:**
- Variable Type: **Data Layer Variable**
- Variable Name: `DLV - Cookie Consent Statistics`
- Data Layer Variable Name: `cookie_consent_statistics`

### Testing Variables

**In GTM Preview Mode:**

1. Enable Preview & Debug
2. Visit your site
3. In Preview panel → Variables
4. Check variable values before/after consent

**Expected Values:**

| State | Marketing Variable | Statistics Variable |
|-------|-------------------|---------------------|
| **Before consent** | `false` | `false` |
| **After Accept All** | `true` | `true` |
| **After Deny All** | `false` | `false` |
| **After Customize (Stats only)** | `false` | `true` |

[INSERT SCREENSHOT: GTM Preview showing consent variables]

---

## 5. Custom Consent Triggers

### Cookiebot DataLayer Events

Cookiebot pushes these events to `dataLayer`:

| Event Name | When Fired | Use Case |
|------------|------------|----------|
| `cookie_consent_preferences` | User grants preferences consent | Fire preference-based tags |
| `cookie_consent_statistics` | User grants statistics consent | Fire analytics tags |
| `cookie_consent_marketing` | User grants marketing consent | Fire advertising tags |
| `cookie_consent_update` | Any consent change | Universal consent handler |
| `CookiebotOnAccept` | User clicks Accept (any category) | Fallback trigger |
| `CookiebotOnDecline` | User declines consent | Analytics event |

### Creating Consent Triggers

#### Trigger 1: Marketing Consent Granted

**Configuration:**
- Trigger Type: **Custom Event**
- Trigger Name: `Consent - Marketing Granted`
- Event Name: `cookie_consent_marketing`

**Use for:**
- Meta/Facebook Pixel
- TikTok Pixel
- Google Ads Remarketing (redundant with built-in, but safe)
- Pinterest Tag
- LinkedIn Insight Tag

#### Trigger 2: Statistics Consent Granted

**Configuration:**
- Trigger Type: **Custom Event**
- Trigger Name: `Consent - Statistics Granted`
- Event Name: `cookie_consent_statistics`

**Use for:**
- Hotjar
- Microsoft Clarity
- Heap Analytics
- Custom analytics scripts

#### Trigger 3: Preferences Consent Granted

**Configuration:**
- Trigger Type: **Custom Event**
- Trigger Name: `Consent - Preferences Granted`
- Event Name: `cookie_consent_preferences`

**Use for:**
- Chatbots (if not necessary)
- Personalization engines
- Recommendation widgets

#### Trigger 4: Any Consent Update

**Configuration:**
- Trigger Type: **Custom Event**
- Trigger Name: `Consent - Any Update`
- Event Name: `cookie_consent_update`

**Use for:**
- Analytics tracking (consent changes)
- Debug tags
- Universal consent handlers

### Advanced Trigger: Conditional Page View

For tags that need to fire on every page view, but only with consent:

**Configuration:**
- Trigger Type: **Page View - All Pages**
- Trigger Name: `All Pages - Marketing Consent`
- Fire on: **Some Page Views**
- Condition: `{{Cookiebot Consent - Marketing}}` equals `true`

**Benefit:** Tag fires on every page (including first page and subsequent navigations) if consent is granted.

### Trigger Priority

If a tag has multiple triggers, ensure proper priority:

```
Tag: Meta Pixel - Base Code

Triggers:
1. cookie_consent_marketing (for initial consent)
2. All Pages - Marketing Consent (for returning visitors with existing consent)

Logic: Tag fires if EITHER trigger activates
```

---

## 6. Tag Configuration for Consent

### Tag Organization in GTM

Organize tags by consent requirement:

```
📁 GTM Container
│
├─ 📂 Consent Configuration
│  └─ Consent Mode Defaults (if manual setup)
│
├─ 📂 Analytics - Statistics Consent Required
│  ├─ GA4 - Configuration (built-in consent) ✅
│  ├─ GA4 - Events (built-in consent) ✅
│  ├─ Hotjar - Tracking Code (trigger: cookie_consent_statistics)
│  └─ Microsoft Clarity (trigger: cookie_consent_statistics)
│
├─ 📂 Marketing - Marketing Consent Required
│  ├─ Meta - Base Pixel (trigger: cookie_consent_marketing)
│  ├─ Meta - Events (trigger: cookie_consent_marketing)
│  ├─ TikTok - Base Pixel (trigger: cookie_consent_marketing)
│  ├─ Google Ads - Remarketing (built-in consent) ✅
│  ├─ Google Ads - Conversions (built-in consent) ✅
│  └─ LinkedIn - Insight Tag (trigger: cookie_consent_marketing)
│
├─ 📂 Functional - Preferences Consent Required
│  ├─ Chatbot Widget (trigger: cookie_consent_preferences)
│  └─ Recommendation Engine (trigger: cookie_consent_preferences)
│
└─ 📂 Necessary - Always Fire
   ├─ Error Tracking (trigger: All Pages)
   └─ Security Scripts (trigger: All Pages)
```

### Configuring Non-Google Tags

#### Example: Meta/Facebook Pixel

**Tag Configuration:**
- Tag Type: **Custom HTML**
- Tag Name: `Meta - Base Pixel Code`

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

**Trigger:** `Consent - Marketing Granted`

**Advanced Settings:**
- Tag firing priority: (default)
- Tag Sequencing: (none needed)

#### Example: Hotjar

**Tag Configuration:**
- Tag Type: **Custom HTML**
- Tag Name: `Hotjar - Tracking Code`

**HTML:**
```html
<script>
(function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:YOUR_HOTJAR_ID,hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>
```

**Trigger:** `Consent - Statistics Granted`

#### Example: TikTok Pixel

**Tag Configuration:**
- Tag Type: **Custom HTML**
- Tag Name: `TikTok - Base Pixel`

**HTML:**
```html
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};

  ttq.load('YOUR_PIXEL_ID');
  ttq.page();
}(window, document, 'ttq');
</script>
```

**Trigger:** `Consent - Marketing Granted`

---

## 7. Testing in GTM Preview Mode

### Launching Preview Mode

1. GTM → Workspace → **Preview**
2. Enter your website URL
3. Click **Connect**
4. Your site opens with GTM debug panel

### Testing Consent Flow

#### Test 1: Initial Page Load (No Consent)

**Expected Behavior:**

```
Preview Panel → Summary:

Tags Fired:
├─ (None or only Necessary tags)

Tags Not Fired:
├─ GA4 - Configuration (waiting for consent)
├─ Meta - Base Pixel (trigger not met: cookie_consent_marketing)
├─ Hotjar (trigger not met: cookie_consent_statistics)

Variables:
├─ Cookiebot Consent - Marketing: false
├─ Cookiebot Consent - Statistics: false

DataLayer:
├─ {event: 'gtm.js', ...}
├─ {event: 'gtm.init_consent', ...} ← Consent defaults set
```

[INSERT SCREENSHOT: GTM Preview - before consent]

#### Test 2: Accept All Consent

**Actions:**
1. Click **"Accept All"** on Cookiebot banner
2. Observe Preview panel update

**Expected Behavior:**

```
Preview Panel → Summary:

Tags Fired:
├─ GA4 - Configuration ✅ (analytics_storage granted)
├─ Meta - Base Pixel ✅ (cookie_consent_marketing event)
├─ Hotjar ✅ (cookie_consent_statistics event)
├─ Google Ads tags ✅ (ad_storage granted)

Variables:
├─ Cookiebot Consent - Marketing: true
├─ Cookiebot Consent - Statistics: true

DataLayer Events (new):
├─ {event: 'cookie_consent_marketing'}
├─ {event: 'cookie_consent_statistics'}
├─ {event: 'cookie_consent_preferences'}
├─ {event: 'cookie_consent_update'}
├─ {event: 'consent', ...} ← Consent Mode update
```

#### Test 3: Deny All Consent

**Actions:**
1. Clear cookies
2. Reload page
3. Click **"Deny All"** on banner

**Expected Behavior:**

```
Tags Fired:
├─ (None or only Necessary tags)

Tags Not Fired:
├─ GA4 - Configuration (analytics_storage denied)
├─ Meta - Base Pixel (no marketing consent)
├─ All marketing/statistics tags

In Advanced Consent Mode:
├─ Cookieless pings may fire for GA4 (no cookies set)
```

#### Test 4: Customize - Statistics Only

**Actions:**
1. Clear cookies
2. Reload page
3. Click **"Customize"**
4. Enable only **Statistics**
5. Save

**Expected Behavior:**

```
Tags Fired:
├─ GA4 - Configuration ✅ (analytics_storage granted)
├─ Hotjar ✅ (statistics consent)

Tags Not Fired:
├─ Meta - Base Pixel ❌ (marketing denied)
├─ TikTok Pixel ❌ (marketing denied)
├─ Google Ads ❌ (ad_storage denied)

Variables:
├─ Cookiebot Consent - Marketing: false
├─ Cookiebot Consent - Statistics: true
```

### Verifying Consent Mode Signals

In Preview panel → **Messages** tab:

Look for consent events:

```
Event: consent
Parameters:
├─ consent_update: {
│   ad_storage: "denied",
│   ad_user_data: "denied",
│   ad_personalization: "denied",
│   analytics_storage: "granted",  ← Granted
│   functionality_storage: "denied",
│   personalization_storage: "denied"
│ }
```

### Network Tab Verification

Open DevTools → **Network** tab while testing:

**Before Consent:**
```
✅ consent.cookiebot.com (Cookiebot loads)
✅ www.googletagmanager.com/gtm.js (GTM loads)
❌ www.google-analytics.com/g/collect (GA4 blocked)
❌ connect.facebook.net/en_US/fbevents.js (Meta blocked)
```

**After Accept All:**
```
✅ www.google-analytics.com/g/collect (GA4 fires)
✅ connect.facebook.net/en_US/fbevents.js (Meta fires)
✅ analytics.tiktok.com (TikTok fires)
✅ All consented tags load
```

[INSERT SCREENSHOT: Network tab before/after consent]

---

## 8. Common GTM Consent Patterns

### Pattern 1: Progressive Enhancement

Fire basic tracking first, enhanced tracking after consent:

**Setup:**

```
Tag: GA4 - Basic Pageview (No Consent)
├─ Type: GA4 Event
├─ Event: page_view
├─ Consent: Not required (cookieless ping)
├─ Trigger: All Pages

Tag: GA4 - Enhanced Tracking (With Consent)
├─ Type: GA4 Event
├─ Event: scroll, engagement, etc.
├─ Consent: Requires analytics_storage
├─ Trigger: cookie_consent_statistics
```

### Pattern 2: Consent-Dependent Configuration

Adjust tag behavior based on consent:

**Setup:**

```
Variable: GA4 Anonymize IP
├─ Type: Custom JavaScript
├─ Code:
    function() {
      // If no consent, anonymize IP
      if (!{{Cookiebot Consent - Statistics}}) {
        return true;
      }
      return false;
    }

Tag: GA4 - Configuration
├─ Config Parameter: anonymize_ip = {{GA4 Anonymize IP}}
```

### Pattern 3: Fallback Tracking

Use serverless/cookieless tracking when consent denied:

**Setup:**

```
Tag: GA4 - Full Client-Side (With Consent)
├─ Trigger: cookie_consent_statistics

Tag: GA4 - Server-Side Fallback (No Consent)
├─ Trigger: All Pages
├─ Condition: {{Cookiebot Consent - Statistics}} equals false
├─ Sends data to server-side GTM (no cookies)
```

### Pattern 4: Consent Change Tracking

Track when users change consent:

**Setup:**

```
Tag: GA4 - Event: Consent Accepted
├─ Event Name: consent_accepted
├─ Parameters:
│   ├─ consent_type: {{DLV - Cookie Consent Update}}
│   └─ consent_categories: {{Cookiebot Consent - All Categories}}
├─ Trigger: cookie_consent_update

Useful for:
├─ Understanding consent rates
├─ A/B testing banner designs
└─ Compliance reporting
```

### Pattern 5: Delayed Tag Loading

Load heavy scripts only after consent:

**Setup:**

```
Tag: Load Video Embeds (After Consent)
├─ Type: Custom HTML
├─ Code: Load YouTube, Vimeo iframes
├─ Trigger: cookie_consent_marketing OR cookie_consent_statistics
├─ Reason: Video embeds set tracking cookies

Before consent:
├─ Show placeholder image with "Accept cookies to watch"
```

---

## 9. Troubleshooting

### Issue 1: Tags Fire Before Consent

**Symptoms:**
- GA4/Meta requests appear before user accepts
- Cookies set before banner interaction

**Causes:**
- ❌ GTM loads before Cookiebot
- ❌ Tags don't have consent checks
- ❌ `data-blockingmode` not set to "auto"

**Solutions:**
1. Verify script order (Cookiebot → GTM)
2. Check `data-blockingmode="auto"` in Cookiebot script
3. Ensure tags use consent triggers
4. Clear cache and test in incognito

**Verification:**
```javascript
// Console: Check load order
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('cookiebot') || r.name.includes('googletagmanager'))
  .map(r => ({name: r.name, start: r.startTime}));

// Cookiebot should have lower startTime than GTM
```

### Issue 2: Tags Don't Fire After Consent

**Symptoms:**
- User accepts, but tags still don't fire
- GTM Preview shows "Tags Not Fired"

**Causes:**
- ❌ Trigger event name mismatch
- ❌ Variable returns wrong value
- ❌ Multiple CMPs conflicting

**Solutions:**
1. Check trigger event name matches dataLayer event:
   ```javascript
   // Console: Check events pushed
   dataLayer.filter(e => e.event && e.event.includes('consent'));
   ```
2. Verify variable values in GTM Preview → Variables
3. Check for other CMP scripts (OneTrust, Complianz, etc.) — remove duplicates
4. Test variable in Preview:
   ```javascript
   // Console: Test Cookiebot object
   Cookiebot.consent
   // Should return: {marketing: true, statistics: true, ...}
   ```

### Issue 3: Consent Not Remembered

**Symptoms:**
- Banner reappears on every page
- User must re-consent

**Causes:**
- ❌ `CookieConsent` cookie being blocked
- ❌ SameSite issues
- ❌ Domain mismatch

**Solutions:**
1. Check cookie in DevTools → Application → Cookies
   - Look for `CookieConsent` cookie
   - Should have 12-month expiry
2. Verify cookie domain matches site domain
3. Check browser privacy settings (not blocking cookies)
4. For subdomain setups, configure domain grouping in Cookiebot

### Issue 4: Consent Mode Not Detected in GA4

**Symptoms:**
- GA4 doesn't show "Consent Mode" status
- Behavioral modeling not active

**Causes:**
- ❌ Consent Mode signals not firing
- ❌ GA4 tag outdated
- ❌ Not enough time passed (modeling requires 30 days)

**Solutions:**
1. Verify consent signals in GTM Preview → Messages tab
2. Update GA4 tag to latest "Google Tag" type
3. Check GA4 Admin → Data Settings → Data Collection → Consent signals
4. Wait 30+ days for modeling to activate

### Issue 5: High Tag Not Fired Count

**Symptoms:**
- Many tags showing "Not Fired Due to Consent"
- Suspiciously high blocking rate

**Causes:**
- ✅ This may be **expected** if users are denying consent
- ❌ Or: Triggers configured wrong

**Solutions:**
1. Check consent rate in Cookiebot Dashboard
   - If 50% users deny, expect 50% tags blocked ✅
2. Review trigger conditions (ensure not too restrictive)
3. For Google tags, ensure using built-in consent (not custom triggers)

### Issue 6: Multiple Consent Banners

**Symptoms:**
- Two banners appear (Cookiebot + another)
- Conflicting consent states

**Causes:**
- ❌ Multiple CMP scripts installed
- ❌ Theme/plugin includes built-in CMP

**Solutions:**
1. Search codebase for:
   - OneTrust: `cdn.cookielaw.org`
   - Complianz: `complianz`
   - Termly: `termly.io`
2. Remove duplicate CMP scripts
3. Disable theme/plugin consent features

### Debugging Tools

**Console Commands:**

```javascript
// Check Cookiebot status
Cookiebot.consent
Cookiebot.consented  // true if user has consented (any choice)

// Check consent mode state
window.google_tag_data?.ics?.entries
// Shows current consent state for all signals

// Check dataLayer events
dataLayer
// Scroll through array, look for consent events

// Force consent (testing only!)
Cookiebot.submitCustomConsent(false, false, true, true)
// (preferences, statistics, marketing, necessary)
// Then: Cookiebot.renew()
```

**GTM Preview Panel:**

- **Summary**: Overview of fired/blocked tags
- **Variables**: Check variable values in real-time
- **DataLayer**: See all dataLayer pushes
- **Errors**: JavaScript errors that may block tags
- **Messages**: Consent Mode signals logged here

[INSERT SCREENSHOT: GTM Preview debugging]

---

## Appendix: GTM Container Export Template

For a pre-configured GTM container with consent setup, see:
- `cookiebot-gtm-container.json` (in templates folder)

Import via: GTM → Admin → Import Container

---

## Resources

- **Cookiebot GTM Guide**: https://www.cookiebot.com/en/google-tag-manager/
- **Google Consent Mode**: https://support.google.com/google-ads/answer/10000067
- **GTM Consent Overview**: https://support.google.com/tagmanager/answer/10718549

---

**End of GTM Integration Guide**
