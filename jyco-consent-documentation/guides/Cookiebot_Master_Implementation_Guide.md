# Cookiebot Master Implementation Guide

**JY/co Consent & Privacy Implementation**
**Version 1.0**
**Date: December 2025**

---

## Legal Disclaimer

**IMPORTANT:** This documentation provides technical implementation guidance for consent management tools. It does not constitute legal advice.

Compliance with GDPR, CCPA, and other privacy regulations requires legal interpretation specific to your business, data processing activities, and jurisdictions served.

**JY/co recommends consulting with qualified legal counsel to ensure your privacy practices meet all applicable regulatory requirements.**

---

## Table of Contents

1. [Introduction to Consent Management](#chapter-1-introduction-to-consent-management)
2. [Cookiebot Account Setup](#chapter-2-cookiebot-account-setup)
3. [Cookie Scanning & Categorization](#chapter-3-cookie-scanning--categorization)
4. [Banner Configuration](#chapter-4-banner-configuration)
5. [Google Consent Mode v2 Integration](#chapter-5-google-consent-mode-v2-integration)
6. [GTM Web Container Integration](#chapter-6-gtm-web-container-integration)
7. [GA4 Configuration for Consent](#chapter-7-ga4-configuration-for-consent)
8. [Meta (Facebook) Consent Handling](#chapter-8-meta-facebook-consent-handling)
9. [Google Ads Consent Handling](#chapter-9-google-ads-consent-handling)
10. [Other Platform Consent](#chapter-10-other-platform-consent)
11. [Regional Compliance Configuration](#chapter-11-regional-compliance-configuration)
12. [Testing & Validation](#chapter-12-testing--validation)
13. [Ongoing Maintenance](#chapter-13-ongoing-maintenance)

---

# Chapter 1: Introduction to Consent Management

## 1.1 Why Consent Management?

In the modern digital landscape, websites collect user data through cookies and trackers for analytics, advertising, and functionality. However, privacy regulations worldwide now require explicit user consent before collecting most types of personal data.

**Without proper consent management:**
- Legal fines up to €20M or 4% of global revenue (GDPR)
- Loss of advertising measurement capabilities
- Damage to brand reputation
- Inability to build remarketing audiences in regulated regions

**With proper consent management:**
- Legal compliance across jurisdictions
- User trust and transparency
- Maintained marketing measurement (with consent)
- Conversion modeling for users who deny consent

## 1.2 Regulatory Overview

### Major Privacy Regulations

| Regulation | Region | Key Requirements | Consent Model |
|------------|--------|------------------|---------------|
| **GDPR** (General Data Protection Regulation) | EU/EEA/UK | Explicit opt-in consent required before non-essential cookies. Equal prominence for Accept/Deny buttons. Granular consent options. | **Opt-in** |
| **CCPA/CPRA** (California Consumer Privacy Act) | California, USA | Opt-out model. Must provide "Do Not Sell My Personal Information" link. Honor Do Not Track signals. | **Opt-out** |
| **LGPD** (Lei Geral de Proteção de Dados) | Brazil | Similar to GDPR. Explicit consent required. Right to data access and deletion. | **Opt-in** |
| **POPIA** (Protection of Personal Information Act) | South Africa | Consent required for processing. Data minimization principles. | **Opt-in** |
| **PIPEDA** (Personal Information Protection) | Canada | Implied consent allowed for some cookies. Express consent for sensitive data. | **Mixed** |
| **nFADP** (new Federal Act on Data Protection) | Switzerland | GDPR-like requirements. Stricter breach notification rules. | **Opt-in** |

### Key Concepts

**Opt-in vs. Opt-out:**
- **Opt-in** (GDPR): No cookies can be set until user actively consents
- **Opt-out** (CCPA): Cookies can be set, but user must be able to opt out

**Cookie Categories:**
- **Necessary**: Essential for website function (allowed without consent)
- **Preferences**: Remember user settings (require consent in most regions)
- **Statistics**: Analytics and usage tracking (require consent)
- **Marketing**: Advertising and behavioral tracking (require consent)

## 1.3 Google Consent Mode v2 Requirement

As of **March 2024**, Google requires Consent Mode v2 for:
- Building remarketing audiences in the EEA (European Economic Area)
- Full measurement capabilities in Google Analytics 4
- Google Ads conversion tracking with user data

### What Changed in v2?

| Signal | v1 | v2 | Required for Ads (EEA) |
|--------|----|----|------------------------|
| `ad_storage` | ✅ | ✅ | ✅ Yes |
| `analytics_storage` | ✅ | ✅ | No (recommended) |
| `ad_user_data` | ❌ | ✅ NEW | ✅ Yes |
| `ad_personalization` | ❌ | ✅ NEW | ✅ Yes |
| `functionality_storage` | ❌ | ✅ NEW | No |
| `personalization_storage` | ❌ | ✅ NEW | No |

**Why This Matters:**
- Without v2 signals, remarketing audiences won't build for EEA users
- Conversion tracking will be limited
- Measurement gaps will increase

## 1.4 Cookiebot Overview

### What is Cookiebot?

Cookiebot is a Consent Management Platform (CMP) that:

1. **Automatically scans** your website to detect all cookies and trackers
2. **Categorizes cookies** into regulatory-compliant categories
3. **Displays consent banners** to collect user consent
4. **Stores consent records** as proof of compliance
5. **Integrates with Google Consent Mode** automatically
6. **Blocks scripts** until consent is granted
7. **Provides reporting** on consent rates and cookie usage

### Cookiebot Features

| Feature | Description | Benefit |
|---------|-------------|---------|
| **Automatic Scanning** | Crawls site to find cookies | No manual cookie discovery needed |
| **Auto-Blocking** | Blocks scripts until consent | GDPR compliance out-of-the-box |
| **Multi-Language** | 40+ languages supported | Global audience coverage |
| **Geo-Targeting** | Different banners per region | GDPR for EU, CCPA for California |
| **Consent Database** | Stores all consent records | Proof of compliance for audits |
| **Google CMP API** | Native Consent Mode integration | Seamless Google ecosystem integration |
| **IAB TCF 2.2** | IAB Transparency & Consent Framework | Programmatic advertising compliance |

### Cookiebot vs. Alternatives

| CMP | Best For | Price Range | Pros | Cons |
|-----|----------|-------------|------|------|
| **Cookiebot** | SMB to Enterprise | $12-500/mo | Easy setup, auto-blocking, great support | Subscription required |
| **OneTrust** | Enterprise | $1,000+/mo | Comprehensive, enterprise features | Expensive, complex |
| **Osano** | Mid-market | $200-1,000/mo | Good UI, consent database | Mid-tier pricing |
| **Complianz** | WordPress sites | $50-200/yr | WordPress-specific, affordable | WordPress only |
| **Termly** | Startups | $10-200/mo | Affordable, simple | Basic features |

## 1.5 Implementation Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER VISITS SITE                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COOKIEBOT SCRIPT LOADS                        │
│                  (Before any other scripts)                      │
│                                                                   │
│  • Sets default consent state (all denied)                       │
│  • Scans page for cookies/trackers                               │
│  • Blocks non-consented scripts                                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CONSENT MODE DEFAULTS SET                       │
│     analytics_storage: denied                                    │
│     ad_storage: denied                                           │
│     ad_user_data: denied                                         │
│     ad_personalization: denied                                   │
│     wait_for_update: 500ms                                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CONSENT BANNER DISPLAYED                      │
│                                                                   │
│  ┌───────────────────────────────────────────────────────┐      │
│  │  We value your privacy                                 │      │
│  │  [Explanation text about cookies]                      │      │
│  │                                                         │      │
│  │  [Accept All]  [Deny All]  [Customize]                │      │
│  └───────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
        ┌──────────┐     ┌──────────┐     ┌──────────┐
        │  Accept  │     │  Deny    │     │Customize │
        │   All    │     │   All    │     │  [Modal] │
        └──────────┘     └──────────┘     └──────────┘
              │                 │                 │
              ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CONSENT MODE UPDATED                            │
│              gtag('consent', 'update', {                         │
│                analytics_storage: 'granted',                     │
│                ad_storage: 'granted',                            │
│                ad_user_data: 'granted',                          │
│                ad_personalization: 'granted'                     │
│              })                                                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GTM RECEIVES UPDATE                           │
│           Tags fire based on consent state                       │
│                                                                   │
│  • GA4 tags (if analytics_storage granted)                       │
│  • Google Ads tags (if ad_storage granted)                       │
│  • Meta Pixel (if marketing consent granted)                     │
│  • Other tags based on consent categories                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CONSENT STORED                                  │
│                                                                   │
│  • Cookie: CookieConsent (12 months)                             │
│  • Cookiebot database record                                     │
│  • Timestamp, choices, version stored                            │
└─────────────────────────────────────────────────────────────────┘
```

### Script Loading Order (Critical)

**CORRECT ORDER:**

```html
<!DOCTYPE html>
<html>
<head>
  <!-- 1. FIRST: Cookiebot (sets consent defaults) -->
  <script id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="YOUR-COOKIEBOT-ID"
          data-blockingmode="auto"
          type="text/javascript">
  </script>

  <!-- 2. SECOND: Google Tag Manager -->
  <script>
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-XXXXXX');
  </script>

  <!-- 3. THIRD: Any other scripts that need consent -->
  <link rel="stylesheet" href="styles.css">
  <title>Your Site</title>
</head>
<body>
  <!-- GTM noscript -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

  <!-- Site content -->
</body>
</html>
```

**Why This Order Matters:**

| If Cookiebot loads... | Result |
|-----------------------|--------|
| **Before GTM** ✅ | Consent defaults set → GTM loads → Tags wait for consent → User consents → Tags fire ✅ |
| **After GTM** ❌ | GTM loads → Tags fire immediately → Consent defaults set too late → Non-compliance ❌ |

### Data Flow

```
User Interaction
      │
      ▼
Cookiebot Banner
      │
      ├─→ Consent Choice
      │         │
      │         ▼
      │   window.dataLayer.push({
      │     event: 'cookie_consent_update',
      │     cookie_consent_statistics: true,
      │     cookie_consent_marketing: true
      │   })
      │         │
      │         ▼
      └─→ gtag('consent', 'update', {
            analytics_storage: 'granted',
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted'
          })
                │
                ▼
          Google Tag Manager
                │
                ├─→ GA4 Tags (check analytics_storage)
                ├─→ Google Ads Tags (check ad_storage, ad_user_data)
                └─→ Custom Tags (check dataLayer events)
                        │
                        ▼
                  Third-Party Platforms
                  (GA4, Meta, TikTok, etc.)
```

---

# Chapter 2: Cookiebot Account Setup

## 2.1 Creating a Cookiebot Account

### Step-by-Step Account Creation

**1. Visit Cookiebot Website**
   - Go to: https://www.cookiebot.com
   - Click "Sign Up" or "Start Free Trial"

**2. Create Account**
   - Enter business email address
   - Create strong password
   - Accept Terms of Service
   - Click "Create Account"

**3. Verify Email**
   - Check inbox for verification email
   - Click verification link
   - Account is now active

**4. Complete Profile**
   - Company name
   - Country
   - Website URL
   - Primary use case (compliance region)

[INSERT SCREENSHOT: Cookiebot signup page]

## 2.2 Adding Your Domain

### Initial Domain Setup

**1. Add Domain**
   - Dashboard → "Add Domain"
   - Enter full domain: `example.com`
   - Choose scan scope:
     - ✅ **Entire website** (recommended for first scan)
     - Specific paths only (for subdirectory sites)

**2. Configure Scan Settings**

| Setting | Recommendation | Why |
|---------|----------------|-----|
| **Scan Frequency** | Weekly | Catch new cookies from updates |
| **Scan Depth** | All pages | Complete cookie detection |
| **Include Subdomains** | Yes (if applicable) | Comprehensive coverage |
| **User-Agent** | Desktop + Mobile | Different cookies per device |

**3. Start Initial Scan**
   - Click "Start Scan"
   - Scan duration: 5-30 minutes (depends on site size)
   - You'll receive email when complete

[INSERT SCREENSHOT: Add domain interface]

### Multi-Domain Setup

For agencies or multi-brand companies:

```
Account Structure:

Main Account (agency@example.com)
├── Domain 1: client-a.com
│   ├── Scan settings
│   ├── Banner config
│   └── Consent records
├── Domain 2: client-b.com
│   ├── Scan settings
│   ├── Banner config
│   └── Consent records
└── Domain 3: client-c.com
    ├── Scan settings
    ├── Banner config
    └── Consent records
```

**Benefits:**
- Centralized management
- Shared consent across subdomains (if needed)
- Unified reporting

## 2.3 Understanding Pricing Tiers

### Cookiebot Pricing Overview

| Tier | Domains | Pages/Month | Cookie Declaration | IAB TCF | Price (Approx) |
|------|---------|-------------|-------------------|---------|----------------|
| **Free** | 1 | 50 subpages | ✅ | ❌ | $0/mo |
| **Essential** | 1 | 500 subpages | ✅ | ❌ | ~$12/mo |
| **Premium** | 3 | Unlimited | ✅ | ✅ | ~$42/mo |
| **Business** | 10 | Unlimited | ✅ | ✅ | ~$100/mo |
| **Enterprise** | Unlimited | Unlimited | ✅ | ✅ | Custom pricing |

### Choosing the Right Tier

**Free Tier**
- ✅ Good for: Small blogs, personal sites
- ❌ Limitations: 50 pages only, Cookiebot branding

**Essential Tier** ($12/mo)
- ✅ Good for: Small business sites (< 500 pages)
- ❌ Limitations: Single domain

**Premium Tier** ($42/mo) ⭐ **RECOMMENDED FOR MOST CLIENTS**
- ✅ Good for: Multi-site agencies, eCommerce
- ✅ Features: 3 domains, unlimited pages, IAB TCF support
- Best value for professional implementations

**Enterprise Tier** (Custom)
- ✅ Good for: Large corporations, agencies with 10+ clients
- ✅ Features: White-label options, dedicated support, SLA

### Subscription Management

**Billing Options:**
- Monthly (cancel anytime)
- Annual (typically 2 months free)

**Overage Handling:**
- Page views beyond limit = upgrade prompt
- Grace period provided before enforcement

## 2.4 Account Settings Configuration

### Essential Settings

Navigate to: **Dashboard → Settings**

#### General Settings

| Setting | Recommended Value | Notes |
|---------|-------------------|-------|
| **Account Name** | Your business name | For multi-domain identification |
| **Default Language** | English (or primary market) | Fallback if geo-detection fails |
| **Time Zone** | Your local timezone | For accurate reporting |

#### Domain Settings

For each domain: **Dashboard → [Domain] → Settings**

| Setting | Recommended Value | Notes |
|---------|-------------------|-------|
| **Domain Group ID** | Auto-generated | For shared consent across subdomains |
| **Cookie Banner Script** | `data-blockingmode="auto"` | Automatic blocking (GDPR compliant) |
| **Geolocation** | Enabled ✅ | Show different banners per region |
| **IAB TCF** | Enabled (if using programmatic ads) | For ad tech compliance |

#### Notification Settings

| Notification | Enable? | Purpose |
|--------------|---------|---------|
| **Scan Complete** | ✅ Yes | Know when new cookies detected |
| **New Unknown Cookies** | ✅ Yes | Immediate categorization needed |
| **Consent Rate Changes** | ✅ Yes | Monitor user acceptance trends |
| **Weekly Reports** | Optional | Summary of consent activity |

[INSERT SCREENSHOT: Account settings page]

### Security Settings

**Two-Factor Authentication (2FA)**
- ✅ **Enable 2FA** for account security
- Protects consent database access
- Required for enterprise compliance

**User Management** (Multi-user accounts)
```
Team Structure:
├── Admin (full access)
│   └── Can modify settings, view all data
├── Editor (limited access)
│   └── Can edit banner, categorize cookies
└── Viewer (read-only)
    └── Can view reports only
```

### API Access

For advanced integrations:
- **API Key**: Dashboard → Settings → API
- Use cases:
  - Programmatic consent retrieval
  - Custom reporting
  - Multi-site automation

---

# Chapter 3: Cookie Scanning & Categorization

## 3.1 How Cookie Scanning Works

### Automatic Scanning Process

Cookiebot's scanner:

1. **Crawls your website** (following links from homepage)
2. **Executes JavaScript** (finds dynamically-loaded cookies)
3. **Detects cookies** and trackers (from headers and scripts)
4. **Categorizes automatically** (using built-in database)
5. **Reports findings** (Dashboard → Cookies)

### What Gets Detected

| Type | Examples | Detection Method |
|------|----------|------------------|
| **First-party cookies** | Session IDs, preferences | HTTP headers, document.cookie |
| **Third-party cookies** | Ad pixels, analytics | Embedded scripts, iframes |
| **LocalStorage** | Cached data | JavaScript localStorage API |
| **SessionStorage** | Temporary data | JavaScript sessionStorage API |
| **IndexedDB** | Structured data | IndexedDB API |

### Scan Frequency

**Manual Scans:**
- Dashboard → Domain → "Scan Now"
- Use after major site updates

**Automatic Scans:**
- Weekly (recommended)
- Monthly (minimum for compliance)

[INSERT SCREENSHOT: Scan results page]

## 3.2 Understanding Cookie Categories

### IAB/GDPR Cookie Categories

| Category | Consent Required? | Consent Mode Signals | Description |
|----------|-------------------|----------------------|-------------|
| **Necessary** | ❌ No | Always granted | Essential for basic site functionality. Cannot be disabled. |
| **Preferences** | ✅ Yes | `functionality_storage`, `personalization_storage` | Remember user choices (language, region, UI settings). |
| **Statistics** | ✅ Yes | `analytics_storage` | Anonymous analytics and performance monitoring. |
| **Marketing** | ✅ Yes | `ad_storage`, `ad_user_data`, `ad_personalization` | Advertising, retargeting, cross-site tracking. |

### Category Definitions (GDPR-Compliant)

#### Necessary Cookies

**Purpose**: Website cannot function without these

**Examples:**
- Session cookies (user authentication)
- Shopping cart cookies
- Security tokens (CSRF protection)
- Load balancers
- **Cookiebot's own consent cookie** (CookieConsent)

**Legal Basis**: Legitimate interest (no consent needed)

#### Preferences Cookies

**Purpose**: Enhance user experience by remembering choices

**Examples:**
- Language selection
- Currency selection
- Region/location preferences
- UI customization (dark mode, font size)
- Volume settings for media

**Legal Basis**: Consent required under GDPR

#### Statistics Cookies

**Purpose**: Understand how visitors use the website (anonymous)

**Examples:**
- Google Analytics (`_ga`, `_ga_*`, `_gid`)
- Hotjar
- Microsoft Clarity
- Heap Analytics
- Session recording tools

**Key Requirement**: Must be **anonymous** or **aggregated** data

**Legal Basis**: Consent required under GDPR

#### Marketing Cookies

**Purpose**: Track users across websites for advertising

**Examples:**
- Meta/Facebook Pixel (`_fbp`, `_fbc`, `fr`)
- Google Ads (`_gcl_*`, `IDE`, `DSID`)
- TikTok Pixel (`_tt_*`, `ttclid`)
- LinkedIn Insight Tag
- Twitter/X conversion tracking
- Pinterest Tag
- DoubleClick cookies

**Legal Basis**: Explicit consent required

### Special Cases

| Cookie | Default Category | Correct Category? | Notes |
|--------|------------------|-------------------|-------|
| `NID` (Google) | Marketing | ❌ → **Preferences** | Used for Google search preferences, not ads |
| `CONSENT` (Google) | Necessary | ✅ | Stores user's Google consent choices |
| `_gat` (GA) | Statistics | ✅ | Throttling cookie for Analytics |
| `__Secure-*` | Varies | **Check source** | Secure cookie prefix, review origin |
| `__Host-*` | Varies | **Check source** | Host-locked cookie, review origin |

## 3.3 Reviewing Scan Results

### Accessing Scan Results

**Dashboard → Domain → Cookies**

You'll see:
- **Total cookies found**: Number
- **By category**: Breakdown
- **Unknown cookies**: Requires manual review
- **Third-party domains**: External trackers detected

### Scan Results Table

| Column | Information | Action Needed |
|--------|-------------|---------------|
| **Cookie Name** | Technical name (e.g., `_ga`) | Verify identity |
| **Provider** | Domain setting cookie | Confirm correct provider |
| **Category** | Auto-assigned category | **Verify accuracy** |
| **Duration** | Expiry period | Document for policy |
| **Type** | HTTP, JavaScript, Pixel | Technical detail |
| **Description** | Purpose explanation | **Add if missing** |

[INSERT SCREENSHOT: Cookie list view]

## 3.4 Manual Cookie Categorization

### When Manual Review is Needed

- ❌ **Unknown cookies** (Cookiebot can't identify)
- ❌ **Incorrectly categorized** (wrong category assigned)
- ❌ **Custom cookies** (your own first-party cookies)
- ❌ **New third-party scripts** (recently added)

### Categorization Process

**Step 1: Identify the Cookie**

Research methods:
1. Search cookie name + "purpose" (e.g., "_fbp purpose")
2. Check provider's documentation
3. Use browser DevTools → Application → Cookies
4. Review GTM tags that might set it

**Step 2: Determine Correct Category**

Decision tree:
```
Is the cookie essential for site function?
├─ YES → Necessary
└─ NO → Does it track across websites?
    ├─ YES → Marketing
    └─ NO → Is it for analytics?
        ├─ YES → Statistics
        └─ NO → Preferences
```

**Step 3: Update in Cookiebot**

1. Dashboard → Domain → Cookies
2. Find cookie in list
3. Click cookie name
4. Edit category dropdown
5. Add/edit description
6. Save changes

[INSERT SCREENSHOT: Cookie editing interface]

### Example: Categorizing Unknown Cookies

**Example 1: `_fbp` (Meta/Facebook)**

```
Cookie Name: _fbp
Provider: Facebook
Found Category: Unknown
Correct Category: Marketing
Description: Facebook Pixel browser ID, used for ad targeting and conversion tracking
Duration: 90 days
Legal Basis: Consent required
```

**Example 2: `_hjSessionUser_*` (Hotjar)**

```
Cookie Name: _hjSessionUser_[site_id]
Provider: Hotjar
Found Category: Unknown
Correct Category: Statistics
Description: Hotjar user identifier for session replay and heatmaps (anonymous)
Duration: 1 year
Legal Basis: Consent required
```

**Example 3: Custom preference cookie**

```
Cookie Name: user_theme_preference
Provider: Your domain
Found Category: Unknown
Correct Category: Preferences
Description: Stores user's selected theme (light/dark mode)
Duration: 1 year
Legal Basis: Consent required
```

## 3.5 Handling Unknown Cookies

### Common Unknown Cookies & Solutions

| Cookie Pattern | Likely Source | Category | How to Verify |
|----------------|---------------|----------|---------------|
| `_ga*` | Google Analytics 4 | Statistics | Check GTM for GA4 tags |
| `_gcl_*` | Google Ads | Marketing | Check for Google Ads conversion tracking |
| `_fbp`, `_fbc`, `fr` | Meta/Facebook | Marketing | Check for Facebook Pixel |
| `_tt_*`, `ttclid` | TikTok | Marketing | Check for TikTok Pixel |
| `_pin_*` | Pinterest | Marketing | Check for Pinterest Tag |
| `_hjid*` | Hotjar | Statistics | Check for Hotjar script |
| `IDE`, `DSID` | DoubleClick (Google) | Marketing | Google Display Network |
| `test_cookie` | DoubleClick | Marketing | Checks if cookies enabled |
| `__stripe_*` | Stripe | Necessary | Payment processing (fraud detection) |
| `OptanonConsent` | OneTrust | Necessary | Another CMP (conflicts with Cookiebot) |

### Resolving Cookie Conflicts

**Problem**: Multiple CMPs detected (e.g., Cookiebot + OneTrust)

**Solution**:
1. Identify duplicate CMP scripts
2. Remove one (keep Cookiebot)
3. Re-scan to verify removed

**Problem**: Cookie appears but shouldn't exist

**Solution**:
1. Check if old script still loaded
2. Review GTM container for deprecated tags
3. Clear cookie and verify it doesn't return

## 3.6 Regular Scan Maintenance

### Maintenance Schedule

| Frequency | Action | Why |
|-----------|--------|-----|
| **Weekly** | Review scan results | Catch new cookies quickly |
| **After site updates** | Manual scan | New features may add cookies |
| **After GTM changes** | Manual scan | New tags = new cookies |
| **Monthly** | Audit unknown cookies | Ensure complete categorization |
| **Quarterly** | Full cookie audit | Compliance documentation |

### Cookie Audit Checklist

```
☐ All cookies categorized (no "Unknown")
☐ Cookie descriptions accurate and complete
☐ Provider domains identified
☐ Expiry durations documented
☐ No unnecessary cookies present
☐ Cookie policy page updated to match scan
☐ Consent banner reflects current cookies
☐ Test: Deny all → verify no marketing/stats cookies set
☐ Test: Accept all → verify cookies set correctly
☐ Export cookie list for records
```

### Exporting Cookie Data

**For Documentation:**
- Dashboard → Domain → Cookies → Export
- Formats: CSV, Excel
- Use for privacy policy updates

[INSERT SCREENSHOT: Cookie export options]

---

# Chapter 4: Banner Configuration

## 4.1 Banner Types

### Available Banner Formats

| Type | Visual Style | Intrusiveness | Best For | GDPR Compliant |
|------|--------------|---------------|----------|----------------|
| **Dialog** | Modal overlay, centered | High (blocks content) | Maximum visibility, strict GDPR | ✅ Yes |
| **Popup** | Bottom/corner popup | Medium | Less intrusive, still visible | ✅ Yes |
| **Slide-in** | Slides from edge | Medium-Low | Moderate visibility | ✅ Yes (if buttons equal) |
| **Bar** | Top/bottom bar | Low | Minimal intrusion | ⚠️ Check button prominence |
| **Embedded** | Within page content | Variable | Custom implementations | ⚠️ Requires careful design |

### Recommended: Dialog Banner

**Why Dialog?**
- ✅ Impossible to miss
- ✅ Clearly presents all options
- ✅ Equal button prominence (GDPR requirement)
- ✅ Mobile-friendly
- ✅ Highest legal defensibility

[INSERT SCREENSHOT: Dialog banner example]

## 4.2 Selecting a Template

### Template Library

Cookiebot provides pre-built templates:

| Template Style | Description | Use Case |
|----------------|-------------|----------|
| **Classic** | Traditional dialog with tabs | Universal, safe choice |
| **Minimal** | Clean, modern design | Tech/SaaS brands |
| **Brand-focused** | Large logo, brand colors | E-commerce, retail |
| **Mobile-first** | Optimized for small screens | Mobile-heavy traffic |
| **Accessibility** | High contrast, large text | WCAG AAA compliance |

### Applying a Template

**Dashboard → Domain → Banner → Templates**

1. Preview available templates
2. Click to apply
3. Customize colors/text
4. Preview on desktop/mobile
5. Save changes

[INSERT SCREENSHOT: Template selection screen]

## 4.3 Customizing Appearance

### Visual Customization Options

Navigate to: **Dashboard → Domain → Banner → Appearance**

#### Colors

| Element | Recommended | Notes |
|---------|-------------|-------|
| **Background** | White (#FFFFFF) or Brand | High contrast needed |
| **Text** | Dark gray (#333333) | WCAG AA minimum |
| **Primary Button** | Brand color | "Accept All" button |
| **Secondary Button** | Same prominence as primary ⚠️ | "Deny All" button (GDPR!) |
| **Links** | Brand color, underlined | Privacy policy links |

**GDPR Requirement**: "Accept All" and "Deny All" buttons MUST be **equally prominent**

❌ **Bad**: Green "Accept All", small gray "Deny All"
✅ **Good**: Both buttons same size, same visual weight

#### Typography

| Setting | Recommendation | Why |
|---------|----------------|-----|
| **Font Family** | System font or brand font | Consistency, performance |
| **Title Size** | 18-24px | Clear hierarchy |
| **Body Text Size** | 14-16px | Readability |
| **Button Text Size** | 14-16px | Accessibility |
| **Line Height** | 1.5 | Readability (WCAG) |

#### Layout

| Setting | Recommended | Notes |
|---------|-------------|-------|
| **Position** | Center (Dialog) | Maximum visibility |
| **Width** | 90% mobile, 600px desktop | Responsive |
| **Padding** | 24-32px | Breathing room |
| **Border Radius** | 8-12px | Modern look |
| **Shadow** | Subtle drop shadow | Depth |

[INSERT SCREENSHOT: Appearance customization panel]

## 4.4 Text Customization

### GDPR-Compliant Banner Text

#### Title Options

| Option | Tone | GDPR Compliant |
|--------|------|----------------|
| "We value your privacy" | Friendly | ✅ Yes |
| "Cookie Consent" | Neutral | ✅ Yes |
| "Your Privacy Choices" | Empowering | ✅ Yes |
| "We use cookies" | Direct | ✅ Yes |
| "Accept cookies to continue" | Coercive | ❌ NO |

**Avoid**:
- "We need your consent to continue" (implies required)
- "Please accept cookies" (pressures user)
- Cookie walls (blocking access without consent) ❌ **ILLEGAL under GDPR**

#### Intro Text Template

```
We value your privacy

This website uses cookies to enhance your browsing experience,
analyze site traffic, and personalize content.

By clicking "Accept All", you consent to our use of cookies.
You can customize your preferences by clicking "Customize" or
decline non-essential cookies by clicking "Deny All".

Read our [Privacy Policy] and [Cookie Policy] for more information.
```

**Key Elements:**
- ✅ Explains cookie purposes
- ✅ Mentions all button options
- ✅ Links to policies
- ✅ No pressure or dark patterns
- ✅ Clear, plain language

#### Button Labels

| Button | Standard Label | Alternative Labels | Required? |
|--------|----------------|-------------------|-----------|
| **Primary Action** | "Accept All" | "Allow All", "Accept Cookies" | ✅ Yes |
| **Deny Action** | "Deny All" | "Reject All", "Necessary Only" | ✅ Yes (GDPR) |
| **Customize** | "Customize" | "Cookie Settings", "Manage Preferences" | ✅ Yes |
| **Save Custom** | "Save Preferences" | "Confirm Choices", "Save" | ✅ Yes |

#### Category Descriptions

**Necessary Cookies:**
```
These cookies are essential for the website to function properly.
They enable basic features like page navigation, secure access to
areas of the website, and cannot be disabled.

Examples: Session cookies, security tokens, load balancing.
```

**Preferences Cookies:**
```
These cookies allow the website to remember your choices and
preferences to provide enhanced and personalized features.

Examples: Language selection, region preferences, UI customization.
```

**Statistics Cookies:**
```
These cookies help us understand how visitors interact with our
website by collecting and reporting information anonymously. This
helps us improve how our website works.

Examples: Google Analytics, Hotjar, Microsoft Clarity.
```

**Marketing Cookies:**
```
These cookies are used to track visitors across websites. They are
used to display ads that are relevant to you and your interests,
and to measure the effectiveness of advertising campaigns.

Examples: Facebook Pixel, Google Ads, TikTok Pixel, retargeting cookies.
```

[INSERT SCREENSHOT: Text customization screen]

## 4.5 Multi-Language Setup

### Enabling Multiple Languages

**Dashboard → Domain → Banner → Languages**

#### Recommended Languages by Region

| Region | Languages to Enable | Priority |
|--------|-------------------|----------|
| **EU** | English, German, French, Spanish, Italian | High |
| **Nordic** | English, Swedish, Norwegian, Danish, Finnish | High |
| **Eastern Europe** | English, Polish, Czech, Romanian | Medium |
| **Americas** | English, Spanish, Portuguese, French (Canada) | High |
| **Asia-Pacific** | English, Chinese (Simplified), Japanese, Korean | Medium |

### Language Detection

**Settings:**
- ✅ **Auto-detect from browser**: Recommended
- **Fallback language**: English (or primary market language)
- **Manual override**: Allow users to switch

### Customizing Translations

Cookiebot provides auto-translations for 40+ languages, but **always review**:

**Review Checklist:**
```
☐ Legal terms accurate (e.g., "consent" vs "agreement")
☐ Button labels clear and actionable
☐ No awkward machine translation
☐ Cultural appropriateness
☐ Character length fits design (especially German, which is longer)
```

**Editing Translations:**

1. Dashboard → Domain → Banner → Languages
2. Select language to edit
3. Review each text field:
   - Title
   - Intro text
   - Button labels
   - Category descriptions
   - Policy links
4. Save changes

#### Language-Specific Considerations

**German:**
- Longer words (e.g., "Datenschutzeinstellungen")
- Test banner doesn't overflow
- Use compound words carefully

**French:**
- Formal vs. informal tone
- Canadian French differs from European French
- Consider separate versions

**Spanish:**
- Latin American Spanish vs. European Spanish
- Consider regional variations

[INSERT SCREENSHOT: Language selection interface]

## 4.6 Mobile Optimization

### Mobile-Specific Settings

**Dashboard → Domain → Banner → Mobile**

| Setting | Desktop | Mobile | Why Different |
|---------|---------|--------|---------------|
| **Position** | Center | Bottom | Easier thumb access |
| **Width** | 600px | 95% screen | Edge-to-edge nearly |
| **Font Size** | 16px | 16px | Avoid zoom on iOS |
| **Button Layout** | Horizontal | Vertical stack | Easier tapping |
| **Padding** | 32px | 16px | More content visible |

### Mobile UX Best Practices

**Touch Targets:**
- Minimum button size: **44x44px** (Apple guidelines)
- Spacing between buttons: 8px minimum
- Avoid tiny checkbox tap targets

**Readability:**
- No text smaller than 14px
- High contrast ratios (4.5:1 minimum)
- Avoid long paragraphs (break up text)

**Testing Devices:**
```
Test on:
├── iPhone (Safari, Chrome)
├── Android (Chrome, Samsung Internet)
├── iPad (tablet view)
└── Small screens (iPhone SE size)
```

### Responsive Preview

Use Cookiebot's built-in preview:
- Dashboard → Domain → Banner → Preview
- Toggle between device sizes
- Test all user flows (Accept, Deny, Customize)

[INSERT SCREENSHOT: Mobile preview]

## 4.7 Accessibility Considerations

### WCAG Compliance

Cookiebot banners should meet **WCAG 2.1 Level AA** minimum:

#### Color Contrast

| Element | Minimum Ratio | Recommended | Tool |
|---------|---------------|-------------|------|
| **Body text** | 4.5:1 | 7:1 (AAA) | WebAIM Contrast Checker |
| **Large text** (18px+) | 3:1 | 4.5:1 | |
| **UI components** (buttons) | 3:1 | 4.5:1 | |

**Test**: https://webaim.org/resources/contrastchecker/

#### Keyboard Navigation

**Requirements:**
- ✅ All buttons reachable via Tab key
- ✅ Clear focus indicators (outline)
- ✅ Enter/Space activates buttons
- ✅ Escape closes banner (if not blocking)
- ✅ Logical tab order (Accept → Deny → Customize)

**Testing:**
1. Disconnect mouse
2. Tab through banner
3. Verify all interactive elements accessible
4. Check focus visibility

#### Screen Reader Support

**Cookiebot Provides:**
- Semantic HTML (proper headings, buttons)
- ARIA labels for interactive elements
- ARIA live regions for updates
- Alt text for icons

**Test With:**
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (Mac/iOS)
- TalkBack (Android)

#### Focus Management

When banner opens:
- Focus should trap within banner (can't tab to content behind)
- Escape key dismisses (if allowed by GDPR)
- After close, focus returns to trigger (if applicable)

### Accessibility Checklist

```
☐ Color contrast meets WCAG AA (4.5:1 minimum)
☐ All interactive elements keyboard accessible
☐ Focus indicators clearly visible
☐ Screen reader announces banner opening
☐ Proper heading hierarchy (<h1>, <h2>, etc.)
☐ Buttons have descriptive labels (not just "OK")
☐ Links clearly identified (underlined or distinct)
☐ No reliance on color alone to convey info
☐ Text resizable up to 200% without breaking layout
☐ No flashing/blinking content (seizure risk)
```

[INSERT SCREENSHOT: Accessibility settings panel]

---

# Chapter 5: Google Consent Mode v2 Integration

## 5.1 What is Consent Mode v2?

### Overview

**Google Consent Mode** is a framework that allows Google tags (Analytics, Ads) to adjust their behavior based on user consent choices.

**Version 2** (required March 2024) adds two new signals for advertising:
- `ad_user_data` — Permission to send user data to Google for advertising
- `ad_personalization` — Permission to use data for personalized ads

### Why Consent Mode Matters

**Without Consent Mode:**
- ❌ No measurement when users deny consent (100% data loss)
- ❌ Can't build remarketing audiences in EEA
- ❌ Limited conversion tracking

**With Consent Mode (Advanced):**
- ✅ Conversion modeling recovers ~70% of measurement
- ✅ Cookieless pings maintain basic tracking
- ✅ Compliant with GDPR while preserving insights

## 5.2 Consent Mode Signals

### All Consent Mode Signals (v2)

| Signal | Purpose | Maps to Cookiebot Category | Required for Google Ads (EEA) |
|--------|---------|----------------------------|-------------------------------|
| `ad_storage` | Store/read advertising cookies | Marketing | ✅ Yes |
| `ad_user_data` | Send user data to Google Ads | Marketing | ✅ Yes (NEW in v2) |
| `ad_personalization` | Personalized ad targeting | Marketing | ✅ Yes (NEW in v2) |
| `analytics_storage` | Store/read analytics cookies | Statistics | ❌ No (recommended) |
| `functionality_storage` | Store/read preference cookies | Preferences | ❌ No |
| `personalization_storage` | Store/read personalization data | Preferences | ❌ No |
| `security_storage` | Security cookies (anti-fraud) | Necessary | ❌ No (always granted) |

### Signal States

Each signal can be:
- `'granted'` — User has consented
- `'denied'` — User has not consented or explicitly denied

## 5.3 Default Consent State

### How Defaults Work

Before the user interacts with the consent banner, Consent Mode starts in a **default state**:

```javascript
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'functionality_storage': 'denied',
  'personalization_storage': 'denied',
  'security_storage': 'granted',
  'wait_for_update': 500  // Wait 500ms for consent choice
});
```

**Critical**: This must be set **before GTM loads**.

### Regional Defaults (Optional)

You can set different defaults per region:

```javascript
// For EEA: Strict opt-in (denied by default)
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'analytics_storage': 'denied',
  'region': ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI',
             'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU',
             'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB']
});

// For US (except California): Opt-out model (granted by default)
gtag('consent', 'default', {
  'ad_storage': 'granted',
  'analytics_storage': 'granted',
  'region': ['US-AL', 'US-AK', ...]  // All except US-CA
});

// For California: Opt-out but cautious
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'analytics_storage': 'denied',
  'region': ['US-CA']
});
```

**Cookiebot Handles This Automatically** based on your geolocation settings.

## 5.4 Consent Update Flow

### After User Interaction

When the user makes a consent choice, Consent Mode updates:

#### User Accepts All:

```javascript
gtag('consent', 'update', {
  'ad_storage': 'granted',
  'ad_user_data': 'granted',
  'ad_personalization': 'granted',
  'analytics_storage': 'granted',
  'functionality_storage': 'granted',
  'personalization_storage': 'granted'
});
```

#### User Denies All:

```javascript
gtag('consent', 'update', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'functionality_storage': 'denied',
  'personalization_storage': 'denied'
});
```

#### User Customizes (Example: Only Statistics):

```javascript
gtag('consent', 'update', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'granted',  // Statistics enabled
  'functionality_storage': 'denied',
  'personalization_storage': 'denied'
});
```

### Cookiebot's Automatic Mapping

| Cookiebot Category | Consent Mode Signals Updated |
|--------------------|------------------------------|
| **Statistics** accepted | `analytics_storage: 'granted'` |
| **Marketing** accepted | `ad_storage: 'granted'`<br>`ad_user_data: 'granted'`<br>`ad_personalization: 'granted'` |
| **Preferences** accepted | `functionality_storage: 'granted'`<br>`personalization_storage: 'granted'` |
| **Necessary** | `security_storage: 'granted'` (always) |

## 5.5 Cookiebot's Automatic Integration

### How Cookiebot Integrates

When you install Cookiebot with `data-blockingmode="auto"`:

1. **Sets default consent state** before any tags load
2. **Blocks scripts** until consent granted
3. **Fires Consent Mode update** when user interacts with banner
4. **Pushes dataLayer events** for GTM triggers

**You don't need to manually code Consent Mode** — Cookiebot handles it.

### Verification

Check in browser console after Cookiebot loads:

```javascript
// Check dataLayer for consent events
dataLayer.filter(e => e.event && e.event.includes('consent'));

// Expected output:
// [{event: "gtm.init_consent", gtm.uniqueEventId: 1}, ...]
```

[INSERT SCREENSHOT: Console showing consent events]

## 5.6 Manual Implementation (If Needed)

### When Manual Implementation Needed

- Cookiebot not handling Consent Mode correctly
- Custom CMP implementation
- Server-side GTM setup

### Manual Consent Mode Setup

**Step 1: Add Default Consent (Before GTM)**

```html
<head>
  <!-- BEFORE GTM -->
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

  <!-- NOW GTM -->
  <script>(function(w,d,s,l,i){...GTM code...})</script>
</head>
```

**Step 2: Listen for Cookiebot Events**

```javascript
// After user interacts with banner
window.addEventListener('CookiebotOnAccept', function() {
  // Update consent based on user's choices
  gtag('consent', 'update', {
    'ad_storage': Cookiebot.consent.marketing ? 'granted' : 'denied',
    'ad_user_data': Cookiebot.consent.marketing ? 'granted' : 'denied',
    'ad_personalization': Cookiebot.consent.marketing ? 'granted' : 'denied',
    'analytics_storage': Cookiebot.consent.statistics ? 'granted' : 'denied',
    'functionality_storage': Cookiebot.consent.preferences ? 'granted' : 'denied',
    'personalization_storage': Cookiebot.consent.preferences ? 'granted' : 'denied'
  });
});

// Also handle banner changes (user updates consent)
window.addEventListener('CookiebotOnDecline', function() {
  gtag('consent', 'update', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied'
  });
});
```

## 5.7 Basic vs. Advanced Consent Mode

### Comparison

| Feature | Basic Mode | Advanced Mode |
|---------|------------|---------------|
| **Tag Behavior** | Tags don't fire without consent | Tags send cookieless pings |
| **Data Collection** | None when denied | Aggregated, cookieless data |
| **Conversion Modeling** | ❌ No | ✅ Yes (recovers ~70%) |
| **Remarketing** | Only with consent | Only with consent |
| **Privacy** | Highest (no data without consent) | High (no cookies, aggregated only) |
| **Measurement Accuracy** | Lower (data gaps) | Higher (modeling fills gaps) |

### Recommended: Advanced Mode

**Why Advanced?**
- ✅ Still GDPR-compliant (no cookies set)
- ✅ Conversion modeling improves measurement
- ✅ Better business intelligence
- ✅ Google's recommended approach

**How to Enable:**

Advanced mode is **automatic** when:
1. Consent Mode is properly implemented
2. Google tags are updated (latest versions)
3. No additional configuration needed

Google automatically uses cookieless pings for denied consent.

### Cookieless Pings Explained

When user denies consent in Advanced mode:

**What Gets Sent:**
- ✅ Aggregated conversion data (no user IDs)
- ✅ Timestamp (rounded to preserve anonymity)
- ✅ General location (country-level, not IP)
- ✅ Event type (conversion occurred)

**What Does NOT Get Sent:**
- ❌ Cookies
- ❌ User identifiers
- ❌ IP addresses
- ❌ Device IDs
- ❌ Cross-site tracking data

**Result:**
- Google uses machine learning to model conversions
- ~70% measurement accuracy maintained
- GDPR compliant (no personal data)

---

# Chapter 6: GTM Web Container Integration

*(Continues with detailed GTM integration instructions...)*

---

**[Document continues with remaining chapters 7-13 as outlined...]*

---

# Appendix A: Glossary

**CMP** — Consent Management Platform
**GDPR** — General Data Protection Regulation
**CCPA** — California Consumer Privacy Act
**TCF** — Transparency & Consent Framework (IAB standard)
**IAB** — Interactive Advertising Bureau
**EEA** — European Economic Area
**GTM** — Google Tag Manager
**GA4** — Google Analytics 4
...

---

# Appendix B: Resources

- Cookiebot Documentation: https://www.cookiebot.com/en/help/
- Google Consent Mode: https://support.google.com/google-ads/answer/10000067
- GDPR Official Text: https://gdpr-info.eu/
- IAB TCF Specifications: https://iabeurope.eu/tcf-2-0/
...

---

**End of Master Implementation Guide**

*For platform-specific guides, see:*
- GTM Integration Guide
- GA4 Configuration Guide
- Meta/Facebook Configuration Guide
- Google Ads Configuration Guide
