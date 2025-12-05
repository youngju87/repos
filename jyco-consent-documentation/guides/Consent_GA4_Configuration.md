# GA4 Consent Configuration Guide

**JY/co Consent & Privacy Implementation**
**Version 1.0**
**Date: December 2025**

---

## Table of Contents

1. [GA4 & Consent Mode Overview](#1-ga4--consent-mode-overview)
2. [GA4 Configuration Tag Setup](#2-ga4-configuration-tag-setup)
3. [GA4 Event Tags with Consent](#3-ga4-event-tags-with-consent)
4. [Consent Mode Reporting in GA4](#4-consent-mode-reporting-in-ga4)
5. [Behavioral Modeling](#5-behavioral-modeling)
6. [Data Thresholds & Privacy](#6-data-thresholds--privacy)
7. [Server-Side GA4 with Consent](#7-server-side-ga4-with-consent)
8. [Troubleshooting GA4 Consent](#8-troubleshooting-ga4-consent)

---

## 1. GA4 & Consent Mode Overview

### How GA4 Respects Consent

GA4 has **native Consent Mode integration**:

| Consent Signal | Granted | Denied |
|----------------|---------|--------|
| `analytics_storage` | **Full tracking**: Sets `_ga` cookies, tracks users across sessions | **Cookieless pings** (Advanced mode): No cookies, aggregate data only |

### GA4 Behavior by Consent State

**When `analytics_storage = 'granted'`:**
```
✅ Sets cookies: _ga, _ga_MEASUREMENT_ID, _gid
✅ Tracks user across sessions
✅ Full event parameters collected
✅ User properties tracked
✅ Ecommerce data collected
✅ Engagement metrics accurate
✅ Attribution complete
```

**When `analytics_storage = 'denied'` (Advanced Consent Mode):**
```
✅ Sends cookieless ping to GA4
✅ No cookies set
✅ Aggregate conversion data only
✅ Geographic data (country level)
✅ No user_id, no client_id
❌ No cross-session tracking
❌ Limited event parameters
⚠️ Google uses ML to model conversions
```

**When `analytics_storage = 'denied'` (Basic Consent Mode):**
```
❌ No data sent at all
❌ Complete measurement gap
```

### Why Use Advanced Mode for GA4

**Benefits:**
- ~70% measurement accuracy recovered through modeling
- GDPR compliant (no cookies or personal data)
- Better business intelligence
- Enables conversion funnels even with denied consent
- Recommended by Google

---

## 2. GA4 Configuration Tag Setup

### Method 1: Using GTM "Google Tag" (Recommended)

**Step 1: Create Configuration Tag**

1. GTM → Tags → New
2. Tag Type: **Google Tag**
3. Tag Name: `GA4 - Configuration`

**Configuration:**

| Field | Value | Notes |
|-------|-------|-------|
| **Tag ID** | `G-XXXXXXXXXX` | Your GA4 Measurement ID |
| **Configuration Parameter** | (add as needed) | Custom dimensions, user properties |
| **send_page_view** | `true` (default) | Auto pageview tracking |

**Step 2: Consent Settings**

Modern Google Tags have **built-in consent checks**:

- ✅ "Require additional consent for tag to fire"
- ✅ Automatically waits for `analytics_storage` consent
- ✅ No custom triggers needed

**Step 3: Triggering**

- Trigger Type: **Consent Initialization - All Pages**
- OR: **All Pages** (tag self-regulates)

**Recommendation:** Use "Consent Initialization" for fastest firing.

[INSERT SCREENSHOT: Google Tag configuration]

### Method 2: Using Legacy GA4 Configuration Tag

**If using older GA4 Config tag:**

1. GTM → Tags → New
2. Tag Type: **Google Analytics: GA4 Configuration**
3. Tag Name: `GA4 - Configuration (Legacy)`

**Configuration:**

| Field | Value |
|-------|-------|
| **Measurement ID** | `G-XXXXXXXXXX` |
| **Send a page view** | ✅ Checked |

**Consent Settings:**

- Advanced Settings → Consent Settings
- ✅ "Require additional consent for tag to fire"
- Add consent type: `analytics_storage`

**Triggering:**

- Trigger: **Consent Initialization - All Pages**

### Configuration Parameters

**Common GA4 Config Parameters:**

| Parameter Name | Value | Purpose |
|----------------|-------|---------|
| `send_page_view` | `true` or `false` | Auto vs manual pageviews |
| `user_id` | `{{User ID Variable}}` | Cross-device tracking (with consent) |
| `user_properties` | `{user_type: 'premium'}` | Custom user properties |
| `allow_google_signals` | `true` (default) | Enable demographics/interests |
| `allow_ad_personalization_signals` | `true` or `false` | Allow Google Ads personalization |
| `cookie_flags` | `SameSite=None;Secure` | Cookie security settings |
| `cookie_domain` | `auto` or `example.com` | Cookie domain scope |
| `cookie_expires` | `63072000` (2 years, default) | Cookie expiration |

**Example with custom parameters:**

```
Fields to Set:
├─ send_page_view: false (if manual)
├─ user_id: {{User ID - CRM}}
├─ user_properties.membership_level: {{User - Membership}}
├─ user_properties.ltv_bucket: {{User - LTV Segment}}
```

### Debug Mode

**Enable for testing:**

```
Configuration Parameter:
├─ Parameter Name: debug_mode
├─ Value: true
```

**OR use Google Analytics Debugger extension** (Chrome)

---

## 3. GA4 Event Tags with Consent

### Creating GA4 Event Tags

**Example: Purchase Event**

1. GTM → Tags → New
2. Tag Type: **Google Analytics: GA4 Event**
3. Tag Name: `GA4 - Event: Purchase`

**Configuration:**

| Field | Value |
|-------|-------|
| **Configuration Tag** | Select: `GA4 - Configuration` |
| **Event Name** | `purchase` (or custom) |

**Event Parameters:**

| Parameter Name | Value | Example |
|----------------|-------|---------|
| `transaction_id` | `{{Transaction ID}}` | `'T-12345'` |
| `value` | `{{Purchase Value}}` | `49.99` |
| `currency` | `{{Currency}}` | `'USD'` |
| `items` | `{{Ecommerce Items}}` | Product array |
| (custom params) | `{{Custom Variable}}` | Your custom data |

**Consent:**

- ✅ Inherits consent from Configuration Tag
- No additional consent setup needed

**Trigger:**

- Trigger Type: **Custom Event**
- Event name: `purchase` (from dataLayer)

### Event Examples with Consent

#### Scroll Depth

```
Tag: GA4 - Event: Scroll Depth
├─ Type: GA4 Event
├─ Configuration Tag: GA4 - Configuration
├─ Event Name: scroll
├─ Parameters:
│   └─ percent_scrolled: {{Scroll Depth Threshold}}
├─ Trigger: Scroll Depth (25%, 50%, 75%, 90%)
└─ Consent: Inherited (analytics_storage)
```

#### File Download

```
Tag: GA4 - Event: File Download
├─ Type: GA4 Event
├─ Event Name: file_download
├─ Parameters:
│   ├─ file_name: {{Click URL}}
│   ├─ file_extension: {{File Extension}}
│   └─ link_url: {{Click URL}}
├─ Trigger: Click - All Elements (filter: .pdf, .zip, etc.)
└─ Consent: Inherited
```

#### Video Engagement

```
Tag: GA4 - Event: Video Start
├─ Event Name: video_start
├─ Parameters:
│   ├─ video_title: {{Video Title}}
│   ├─ video_url: {{Video URL}}
│   └─ video_provider: 'youtube'
├─ Trigger: YouTube Video (Start)
└─ Consent: Inherited
```

### Events Without Consent

**Necessary events** that should fire regardless:

- Error tracking
- Security events
- Core functionality events

**Implementation:**

1. Create separate GA4 tag (or use separate Measurement ID)
2. Send to different property (optional)
3. Use "Always Fire" trigger
4. Minimal data collection

**Example:**

```
Tag: GA4 - Event: JS Error (No Consent Required)
├─ Event Name: exception
├─ Parameters:
│   ├─ description: {{Error Message}}
│   └─ fatal: false
├─ Trigger: JavaScript Error
├─ Consent: NONE (fires regardless)
└─ Consider: Send to separate GA4 property for non-consented data
```

---

## 4. Consent Mode Reporting in GA4

### Viewing Consent Mode Status

**Check if Consent Mode is Active:**

1. GA4 → Admin (⚙️) → Data Settings → Data Collection
2. Scroll to "Consent settings"
3. Status should show:
   - ✅ **"Consent mode implementation detected"**
   - Date first detected
   - Signals detected: `analytics_storage`, `ad_storage`, etc.

[INSERT SCREENSHOT: GA4 Consent Mode status]

### Understanding Consent Mode Impact

**Reports Include Modeled Data:**

When viewing reports, modeled conversions from non-consenting users are **automatically included**.

**Indicators:**

- ℹ️ Info icon next to metrics
- Tooltip: "Includes modeled data"
- Wider confidence intervals

**Example:**

```
Report: Acquisition → Traffic Acquisition
Metric: Conversions
├─ Observed conversions: 300 (consenting users)
├─ Modeled conversions: 210 (non-consenting, estimated)
└─ Total shown: 510 ℹ️ "Includes modeled conversions"
```

### Consent Rate Analysis

**Create custom exploration:**

1. GA4 → Explore → Create Blank
2. Dimensions:
   - Session campaign
   - Session source / medium
3. Metrics:
   - Sessions
   - Conversions
4. Filters:
   - (none - shows blended data)

**Note:** GA4 doesn't provide direct "consent granted vs denied" dimension, but modeled data is integrated.

---

## 5. Behavioral Modeling

### How GA4 Modeling Works

**ML Process:**

```
Traffic with analytics_storage = 'granted' (e.g., 40%)
  ↓
  Full data:
  • User journey
  • Device type
  • Behavior patterns
  • Conversion actions
  ↓
Google's ML model learns:
  • Conversion probability by segment
  • Typical paths to conversion
  • Seasonal patterns
  ↓
Applied to:
  ↓
Traffic with analytics_storage = 'denied' (60%)
  ↓
  Limited data:
  • Cookieless pings
  • Aggregate events
  • No user IDs
  ↓
Model estimates:
  • Conversions from this traffic
  • Attribution (directional)
  ↓
Result: Reported in GA4 as "modeled conversions"
```

### Requirements for Modeling

| Requirement | Details | How to Verify |
|-------------|---------|---------------|
| **Consent Mode** | Properly implemented | GA4 → Data Settings → Check "detected" |
| **Google Signals** | Enabled | GA4 → Data Settings → Toggle ON |
| **Traffic Volume** | 1,000+ events/day per signal | GA4 → Reports → Realtime |
| **Time** | 7-30 days | Wait period |
| **Conversion Events** | At least one defined | GA4 → Events → Mark as conversion |

### Enabling Google Signals

**Step-by-Step:**

1. GA4 → Admin → Data Settings → Data Collection
2. **Google signals data collection** → Toggle ON
3. Read disclaimer about data usage
4. Click "Continue" → "Activate"

**Impact:**
- Enables cross-device reporting
- Required for conversion modeling
- Allows demographics/interests reports

[INSERT SCREENSHOT: Google Signals activation]

### Modeling Accuracy Expectations

**Typical Recovery Rates:**

| Metric | Without Modeling | With Modeling |
|--------|------------------|---------------|
| **Conversions** | ~40% (only consenting) | ~85% (observed + modeled) |
| **Sessions** | ~40% tracked | ~95% (aggregate pings) |
| **Attribution** | Partial | Directional (less precise) |
| **User Behavior** | Consenting only | Blended estimate |

**Factors Affecting Accuracy:**

- ✅ Higher consent rate → More training data → Better model
- ✅ Consistent behavior patterns → Easier to model
- ✅ Longer time period → Model improves
- ❌ Low traffic → Less reliable
- ❌ Highly variable audience → Harder to predict

### Modeling Limitations

**What Modeling CAN'T Do:**

- ❌ Identify individual non-consenting users
- ❌ Show exact user paths for denied traffic
- ❌ Build audiences from non-consenting users
- ❌ Track across devices without consent
- ❌ 100% accurate (estimates only)

**What It CAN Do:**

- ✅ Estimate aggregate conversions
- ✅ Fill reporting gaps
- ✅ Directional attribution
- ✅ Improve budget allocation insights

---

## 6. Data Thresholds & Privacy

### GA4 Data Thresholding

**What is Thresholding?**

GA4 automatically hides data in reports when user counts are low (to protect privacy).

**Indicator:**

- 🔒 Icon in reports
- Tooltip: "Data has been thresholded to protect user privacy"

**When It Happens:**

- Small audience sizes
- Specific user segments
- Demographics reports
- When Google Signals enabled

**Relationship to Consent:**

- Consent Mode + Google Signals → More thresholding
- Trade-off: Better modeling, but more data hidden

### Consent Mode & User Privacy

**Data Collected by Consent State:**

| Data Type | Consent Granted | Consent Denied (Advanced) |
|-----------|----------------|---------------------------|
| **Cookies** | ✅ `_ga`, `_gid` | ❌ No cookies |
| **Client ID** | ✅ Persistent | ❌ None |
| **User ID** | ✅ If configured | ❌ Not sent |
| **IP Address** | ✅ (anonymized) | ⚠️ Further anonymized |
| **User Agent** | ✅ Full | ⚠️ Generalized |
| **Referrer** | ✅ Full | ⚠️ Stripped parameters |
| **Event Parameters** | ✅ All | ⚠️ Limited |
| **Geolocation** | ✅ City-level | ⚠️ Country-level only |

### IP Anonymization

**Always On (GA4):**

Unlike Universal Analytics, GA4 **automatically anonymizes IP addresses** — no toggle needed.

**Process:**

1. Full IP received by Google
2. Last octet removed (IPv4) or last 80 bits (IPv6)
3. Truncated IP used for geolocation
4. Full IP discarded

**Example:**

```
Full IP: 203.0.113.42
Stored: 203.0.113.0 (last octet removed)
Used for: General location (city)
```

### Consent & GDPR Compliance

**Checklist:**

```
☐ analytics_storage denied by default (EEA)
☐ No cookies set before consent
☐ Cookieless pings are anonymous (no personal data)
☐ IP address anonymized
☐ User can revoke consent (Cookiebot handles)
☐ Data retention configured (default: 2 months for user data)
☐ Google Signals consent explained in privacy policy
☐ Data processing agreement with Google (automatic for GA4)
```

---

## 7. Server-Side GA4 with Consent

### Overview

**Server-Side GTM (sGTM)** allows GA4 tracking via your own server, which can:
- Improve load times
- Increase cookie lifetime (first-party)
- Reduce browser-based tracking issues
- Still respect consent

### Consent Mode in sGTM

**Flow:**

```
Client-Side (Browser):
├─ Cookiebot sets consent
├─ Consent signal sent to dataLayer
├─ GTM Web → sGTM container (via server endpoint)
    ↓
Server-Side (Your Server):
├─ sGTM receives consent signals
├─ GA4 tag checks consent
├─ If granted: Full tracking
├─ If denied: Cookieless ping (Advanced mode)
├─ Sends to GA4 with consent state
```

### Configuration

**Client Tag (Browser GTM):**

```
Tag: sGTM - GA4 Event (Client)
├─ Type: GA4 Event
├─ Measurement ID: G-XXXXXXXXXX
├─ Server Container URL: https://gtm.yourdomain.com
├─ Event Name: {{Event Name}}
├─ Consent: Inherits analytics_storage
└─ Sends data to sGTM instead of directly to GA4
```

**Server Tag (sGTM Container):**

```
Tag: GA4 - Event (Server)
├─ Type: Google Analytics: GA4
├─ Measurement ID: G-XXXXXXXXXX
├─ Event Name: {{Event Name}}
├─ Consent Settings:
│   └─ Read from client event (forwarded)
├─ Processes consent, sends to GA4
```

### Benefits for Consent

**With sGTM:**
- ✅ First-party cookies (longer lifetime, if consented)
- ✅ Less likely blocked by adblockers
- ✅ Centralized consent management
- ✅ Can enrich data server-side (with consent)

**Consent Still Required:**
- ❌ sGTM does NOT bypass consent requirements
- ✅ Must still respect user choices
- ✅ GDPR/CCPA compliance unchanged

---

## 8. Troubleshooting GA4 Consent

### Issue 1: Consent Mode Not Detected

**Symptoms:**
- GA4 Data Settings → "Consent mode: Not implemented"

**Causes:**
- ❌ Consent defaults not set before GTM
- ❌ GA4 tag outdated
- ❌ Wrong signal name

**Solutions:**

1. **Verify consent defaults:**
   ```javascript
   // Console
   dataLayer.find(e => e[1] === 'default')
   // Should show consent defaults
   ```

2. **Update GA4 tag:**
   - GTM → Change to "Google Tag" type (latest)

3. **Wait 24-48 hours:**
   - GA4 may take time to detect

4. **Force detection:**
   - Send test event with `gcs` parameter:
   ```javascript
   gtag('event', 'consent_test', {
     'gcs': 'G100'  // All consent denied
   });
   ```

### Issue 2: No Modeling Active

**Symptoms:**
- No "includes modeled conversions" tooltip
- Data looks same as before Consent Mode

**Causes:**
- ❌ Google Signals not enabled
- ❌ Not enough time (need 7-30 days)
- ❌ Low traffic

**Solutions:**

1. Enable Google Signals (see Section 5)
2. Wait 7-30 days
3. Check traffic volume (need 1,000+ events/day)
4. Mark events as conversions (GA4 → Events → "Mark as conversion")

### Issue 3: GA4 Events Not Firing After Consent

**Symptoms:**
- User accepts consent
- GA4 config fires, but events don't

**Causes:**
- ❌ Event tag not linked to config tag
- ❌ Event trigger doesn't fire
- ❌ Event consent separate from config

**Solutions:**

1. **Check tag linkage:**
   - Event tag → Configuration settings
   - Must select correct Config tag

2. **Verify trigger:**
   - GTM Preview → Check trigger fires
   - DataLayer has required event

3. **Check inheritance:**
   - Event tags inherit consent from Config tag
   - No separate consent check needed

### Issue 4: Duplicate Page Views

**Symptoms:**
- Page views counted 2x
- One with consent, one without

**Causes:**
- ❌ Multiple GA4 tags firing
- ❌ Config tag + separate pageview tag

**Solutions:**

1. **Audit tags:**
   ```
   GTM → Tags → Filter: "GA4"
   Check how many send page_view events
   ```

2. **Choose one method:**
   - **Option A**: Config tag sends pageview (`send_page_view: true`)
   - **Option B**: Separate pageview event tag
   - ❌ Don't use both

3. **Disable duplicate:**
   - If using Config for pageviews, remove separate pageview tag

### Issue 5: User_ID Not Tracking

**Symptoms:**
- User_ID configured but not appearing in GA4
- Cross-device reports empty

**Causes:**
- ❌ No consent for analytics_storage
- ❌ User_ID not passed correctly
- ❌ User_ID contains PII (GA4 rejects)

**Solutions:**

1. **Verify consent:**
   - User_ID only works with `analytics_storage = 'granted'`

2. **Check User_ID format:**
   - Must be hashed/pseudonymous (no email addresses)
   - Example: `'user_abc123def456'` ✅
   - Example: `'john@example.com'` ❌

3. **Test in DebugView:**
   - GA4 → DebugView
   - Check `user_id` parameter present

### Issue 6: Consent Not Remembered

**Symptoms:**
- Consent banner reappears every visit
- User must re-consent

**This is a Cookiebot issue, not GA4.** See Master Implementation Guide, Chapter 12.

---

## Appendix: GA4 Consent Checklist

```
☐ GA4 Configuration tag created
☐ Tag type: "Google Tag" (latest)
☐ Measurement ID correct: G-XXXXXXXXXX
☐ Consent settings: Built-in checks enabled
☐ Trigger: Consent Initialization - All Pages
☐ GTM Preview: Tag fires on page load
☐ GTM Preview: Tag waits if consent denied
☐ GTM Preview: Tag fires after consent granted
☐ GA4: Consent Mode status shows "Active"
☐ GA4: Google Signals enabled
☐ Event tags linked to Config tag
☐ Event tags inherit consent (no separate config)
☐ DebugView shows gcs parameter (consent state)
☐ Conversions marked in GA4 Events
☐ Wait 7-30 days for modeling activation
☐ Verify "includes modeled conversions" in reports
☐ Test: Accept consent → full tracking works
☐ Test: Deny consent → no cookies set (Advanced mode pings only)
```

---

## Resources

- **GA4 Consent Mode Guide:** https://support.google.com/analytics/answer/9976101
- **GA4 Data Collection Settings:** https://support.google.com/analytics/answer/9019185
- **Google Signals:** https://support.google.com/analytics/answer/9445345
- **Modeling Documentation:** https://support.google.com/analytics/answer/11161109

---

**End of GA4 Consent Configuration Guide**
