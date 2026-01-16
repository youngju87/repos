# Compliance Summary

**Version:** 1.2 | **Last Updated:** January 2026

This document provides a high-level overview of the privacy and regulatory posture of the JY Insights Gold package. It is intended for technical review and should not be considered legal advice.

---

## Regulatory Overview

The JY Insights Gold package is designed to support compliance with major privacy regulations through technical controls. Final compliance responsibility rests with the merchant and their legal counsel.

### Supported Regulations

| Regulation | Region | Key Requirements | Package Support |
|------------|--------|------------------|-----------------|
| **GDPR** | EU/EEA | Prior consent, data minimization, right to withdraw | ✅ Full |
| **ePrivacy Directive** | EU/EEA | Cookie consent before tracking | ✅ Full |
| **CCPA/CPRA** | California | Opt-out of sale, data access rights | ✅ Full |
| **Quebec Law 25** | Quebec, Canada | Explicit consent, language requirements | ✅ Full |
| **GPC (Global Privacy Control)** | Multiple | Automatic opt-out signal | ✅ Full |
| **DNT (Do Not Track)** | Multiple | Browser opt-out signal | ✅ Full |

---

## GDPR Compliance

### How the Package Supports GDPR

| GDPR Requirement | Technical Implementation |
|------------------|-------------------------|
| **Lawful Basis (Art. 6)** | No tracking until explicit consent granted |
| **Prior Consent (Art. 7)** | Consent Mode defaults to "denied"; tracking blocked until consent |
| **Granular Consent** | Separate controls for analytics, marketing, preferences |
| **Freely Given** | Equal prominence to accept/decline options (configurable in Shopify) |
| **Withdrawable** | Cookie preferences link allows consent modification at any time |
| **Documented** | Consent state logged to dataLayer with timestamps |
| **Data Minimization** | Only necessary data collected; PII hashed when sent |

### Technical Controls

```
PAGE LOAD (No Consent Yet)
├── gtag('consent', 'default', { analytics_storage: 'denied', ... })
├── No cookies set
├── No identifiers collected
├── GA4 receives cookieless ping (aggregate only)
└── Ads/Meta tags DO NOT fire

USER GRANTS CONSENT
├── gtag('consent', 'update', { analytics_storage: 'granted', ... })
├── _ga, _gid cookies set
├── User identifiers collected
├── GA4 receives full event data
└── Ads/Meta tags fire normally

USER WITHDRAWS CONSENT
├── gtag('consent', 'update', { analytics_storage: 'denied', ... })
├── Tracking stops immediately
├── Existing cookies remain (browser responsibility)
└── New hits blocked until re-consent
```

---

## ePrivacy Directive Compliance

### Cookie Categories

| Category | Default State | When Set | Purpose |
|----------|---------------|----------|---------|
| **Strictly Necessary** | Granted | Always | Session, cart, authentication |
| **Analytics** | Denied | After consent | GA4 measurement |
| **Marketing** | Denied | After consent | Ads remarketing, conversion |
| **Preferences** | Denied | After consent | Personalization |

### No Tracking Before Consent

The package ensures no tracking cookies are set until the user provides consent:

1. **GTM loads** but consent variables are "denied"
2. **GA4 Configuration tag** checks consent before setting cookies
3. **Third-party tags** (Google Ads, Meta) have built-in consent checks
4. **Custom tags** should be configured with consent triggers

---

## CCPA/CPRA Compliance

### Sale of Data Consent

The CCPA defines "sale" broadly to include sharing data for advertising purposes. The package tracks this separately:

| Shopify Setting | Google Consent | Behavior |
|-----------------|----------------|----------|
| `saleOfDataRegion: true` | `ad_user_data` | Controls whether user data is shared with ad platforms |
| | `ad_personalization` | Controls whether data is used for personalized ads |

### "Do Not Sell" Support

```javascript
// Configuration option in consent-mode-api.liquid
CONFIG.saleOfDataFollowsMarketing = true;

// When true:
// - If marketing consent is denied, sale_of_data is also denied
// - Maps to ad_user_data: 'denied'
```

### Consumer Rights

| Right | Package Support |
|-------|-----------------|
| Right to Know | Requires merchant privacy policy (not in scope) |
| Right to Delete | Requires merchant data deletion process (not in scope) |
| Right to Opt-Out | ✅ Sale of data consent honored |
| Right to Non-Discrimination | Requires merchant policy (not in scope) |

---

## Quebec Law 25 Compliance

### Key Requirements

| Requirement | Implementation |
|-------------|----------------|
| **Express Consent** | Shopify consent banner requires affirmative action |
| **French Language** | Shopify admin allows French banner text (merchant configured) |
| **Data Processing Disclosure** | Privacy policy required (merchant responsibility) |
| **Consent Withdrawal** | Cookie preferences link enabled |

### Regional Detection

Shopify's Privacy API handles regional detection and shows consent banners appropriately. The package reads from this API.

---

## GPC/DNT Support

### Global Privacy Control

When a browser sends the GPC signal (`Sec-GPC: 1`), the package automatically:

1. **Detects the signal** on page load
2. **Denies all marketing consent** immediately
3. **Fires `consent_gpc_detected` event** for logging
4. **Persists denial** for the session

```javascript
// Detection logic
if (navigator.globalPrivacyControl === true) {
  // Auto-deny marketing consent
  updateConsent({
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  // Fire detection event
  dataLayer.push({ event: 'consent_gpc_detected' });
}
```

### Do Not Track

DNT is also detected and honored, though it is being deprecated in favor of GPC:

```javascript
if (navigator.doNotTrack === '1') {
  // Same treatment as GPC
}
```

---

## How Consent Is Respected Technically

### Consent Signal Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        CONSENT FLOW                              │
└─────────────────────────────────────────────────────────────────┘

1. PAGE LOAD
   │
   ├─► shopify-privacy-consent-mode-api.liquid initializes
   │   │
   │   ├─► Sets gtag('consent', 'default', { all: 'denied' })
   │   │
   │   ├─► Queries Shopify.customerPrivacy API
   │   │   │
   │   │   ├─► If consent previously granted: update to 'granted'
   │   │   │
   │   │   └─► If no prior consent: remain 'denied'
   │   │
   │   └─► Saves state to sessionStorage (for checkout)
   │
   ├─► GTM loads and reads consent state
   │   │
   │   ├─► GA4 Config tag: checks analytics_storage
   │   │   └─► If 'denied': no cookies, cookieless mode
   │   │
   │   ├─► Google Ads tags: check ad_storage, ad_user_data
   │   │   └─► If 'denied': tags don't fire
   │   │
   │   └─► Meta Pixel: checks ad_storage
   │       └─► If 'denied': tag doesn't fire
   │
   └─► Storefront dataLayer events fire
       └─► Events recorded based on consent state

2. USER INTERACTS WITH BANNER
   │
   ├─► Shopify fires 'visitorConsentCollected' event
   │
   ├─► Consent mode script handles event
   │   │
   │   ├─► Maps Shopify consent to Google Consent Mode v2
   │   │
   │   ├─► Calls gtag('consent', 'update', { ... })
   │   │
   │   ├─► Pushes 'consent_updated' to dataLayer
   │   │
   │   └─► Updates sessionStorage
   │
   └─► GTM re-evaluates tags based on new consent state

3. CHECKOUT (SANDBOXED IFRAME)
   │
   ├─► Checkout pixel initializes
   │   │
   │   └─► Reads consent from sessionStorage
   │       │
   │       ├─► If consent found: applies same state
   │       │
   │       └─► If no consent: defaults to 'denied'
   │
   └─► GTM in iframe respects consent state
```

### Tag-Level Consent Checking

GTM tags should be configured with "Consent Settings":

| Tag Type | Required Consent |
|----------|------------------|
| GA4 Configuration | `analytics_storage` |
| GA4 Event | `analytics_storage` |
| Google Ads Conversion | `ad_storage` |
| Google Ads Remarketing | `ad_storage`, `ad_personalization` |
| Meta Pixel | `ad_storage` |
| Microsoft Ads | `ad_storage` |

---

## What This Solution Does NOT Do

### Important Limitations

| Capability | Status | Notes |
|------------|--------|-------|
| **Provide legal advice** | ❌ Not included | Consult privacy counsel |
| **Ensure full GDPR compliance** | ❌ Partial | Technical controls only; policies required |
| **Delete user data** | ❌ Not included | Requires separate data deletion process |
| **Handle DSAR requests** | ❌ Not included | Merchant responsibility |
| **Block all third-party scripts** | ❌ Not included | Only controls package scripts and GTM |
| **Guarantee regulatory compliance** | ❌ Not included | Regulations evolve; review regularly |
| **Manage privacy policy content** | ❌ Not included | Merchant's legal team responsibility |
| **Handle cross-border transfers** | ❌ Not included | Requires DPA/SCCs if applicable |
| **Implement cookie scanning** | ❌ Not included | Manual audit recommended |
| **Provide consent records for audits** | ❌ Limited | dataLayer events can be logged |

### Merchant Responsibilities

1. **Privacy Policy**: Maintain accurate, up-to-date privacy policy
2. **Cookie Policy**: Document all cookies and their purposes
3. **DSAR Process**: Implement data subject access request handling
4. **Data Retention**: Define and implement data retention policies
5. **Third-Party Scripts**: Audit all scripts loaded outside this package
6. **Staff Training**: Ensure staff understand consent requirements
7. **Regular Review**: Periodically review compliance posture

---

## Data Handling Summary

### Personal Data Collected

| Data Type | When Collected | Storage | Purpose |
|-----------|----------------|---------|---------|
| Email (hashed) | At checkout, if logged in | Not stored (sent to GA4/Ads) | Enhanced Conversions |
| Phone (hashed) | At checkout, if provided | Not stored (sent to GA4/Ads) | Enhanced Conversions |
| Address | At purchase | Not stored (sent to GA4/Ads) | Enhanced Conversions |
| Customer ID | When logged in | Not stored (sent to GA4) | User identification |
| Order history | When logged in | Not stored (sent to GA4) | RFM metrics |

### Data Minimization

- Only data necessary for analytics/attribution is collected
- PII is hashed (SHA256) before transmission
- No raw PII is stored by the package
- sessionStorage data clears when browser tab closes

### Data Recipients

| Recipient | Data Received | Purpose |
|-----------|---------------|---------|
| Google Analytics 4 | Events, hashed PII, order data | Analytics |
| Google Ads | Conversion data, hashed PII | Attribution, Enhanced Conversions |
| Meta (Facebook) | Events, hashed PII, order data | Attribution, CAPI |
| Microsoft Ads | Events, consent state | Attribution |

---

## Audit Checklist

### Pre-Launch Review

- [ ] Privacy policy updated with cookie/tracking disclosure
- [ ] Cookie policy lists all cookies set by package
- [ ] Consent banner text reviewed by legal
- [ ] GPC handling tested and working
- [ ] Consent withdrawal path tested
- [ ] No tracking occurs before consent (verified in GTM Preview)
- [ ] All third-party scripts audited for consent compliance
- [ ] Data processing agreements in place with vendors
- [ ] Staff trained on consent requirements

### Ongoing Compliance

- [ ] Quarterly review of consent rates
- [ ] Annual privacy policy review
- [ ] Regulatory change monitoring
- [ ] Cookie audit after theme/app changes
- [ ] Consent mechanism testing after updates

---

## Resources

### Official Documentation

- [Google Consent Mode v2](https://developers.google.com/tag-platform/security/guides/consent)
- [Shopify Customer Privacy API](https://shopify.dev/docs/api/customer-privacy)
- [GDPR Official Text](https://gdpr-info.eu/)
- [CCPA Official Text](https://oag.ca.gov/privacy/ccpa)
- [GPC Specification](https://globalprivacycontrol.github.io/gpc-spec/)

### Related Package Documents

- [Consent Mode Reference](./CONSENT-MODE-REFERENCE.md) - Technical implementation
- [Solution Design Reference](./SOLUTION-DESIGN-REFERENCE.md) - Architecture overview
- [Event Reference](./EVENT-REFERENCE.md) - Data collected per event

---

## Disclaimer

This document describes technical capabilities and is not legal advice. Privacy regulations vary by jurisdiction and evolve over time. Merchants should consult qualified legal counsel to ensure compliance with applicable laws. The authors of this package make no guarantees of regulatory compliance.
