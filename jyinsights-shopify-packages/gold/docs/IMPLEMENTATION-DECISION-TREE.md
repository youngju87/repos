# Implementation Decision Tree

**Version:** 1.2 | **Last Updated:** January 2026

Use this guide to determine the right implementation approach based on your specific requirements.

---

## Quick Start Decision

```
START HERE
    │
    ▼
┌─────────────────────────────────────┐
│  Do you have a Shopify store?       │
└──────────────┬──────────────────────┘
               │
       ┌───────┴───────┐
       │               │
      YES              NO
       │               │
       ▼               ▼
   Continue        This package is
                   not for you
```

---

## Plan Tier Decision

```
┌─────────────────────────────────────┐
│  What is your Shopify plan?         │
└──────────────┬──────────────────────┘
               │
    ┌──────────┼──────────────┐
    │          │              │
  Basic/    Advanced        Plus
  Shopify      │              │
    │          │              │
    ▼          ▼              ▼
 ┌─────────────────────────────────────────────────────────┐
 │                    ALL PLANS                             │
 │  ✓ Storefront tracking (full)                           │
 │  ✓ Consent mode (full)                                  │
 │  ✓ GTM integration (full)                               │
 │  ✓ Cookie preferences link                              │
 └─────────────────────────────────────────────────────────┘
               │
               ▼
 ┌─────────────────────────────────────────────────────────┐
 │                    PLUS ONLY                             │
 │  ✓ Checkout UI extensibility                            │
 │  ✓ checkout.liquid customization                        │
 │  ✓ Script Editor access                                 │
 │  ✓ Advanced checkout branding                           │
 └─────────────────────────────────────────────────────────┘
               │
               ▼
 ┌─────────────────────────────────────────────────────────┐
 │              CHECKOUT PIXEL (ALL PLANS)                  │
 │  Added via: Shopify Admin → Settings → Customer Events  │
 │  No Plus required for Custom Pixels                     │
 └─────────────────────────────────────────────────────────┘
```

---

## Server-Side Tracking Decision

```
┌─────────────────────────────────────┐
│  Do you need server-side tracking?  │
└──────────────┬──────────────────────┘
               │
    ┌──────────┴──────────────────────────────────────┐
    │                                                  │
    ▼                                                  ▼
  "What's                                          "Yes, I
  that?"                                           need it"
    │                                                  │
    ▼                                                  ▼
┌─────────────────────────────────┐     ┌─────────────────────────────────┐
│  Server-side recommended if:     │     │  Setup Requirements:            │
│                                  │     │                                  │
│  • Ad blockers affect >15%       │     │  1. Google Cloud account        │
│  • iOS users are significant     │     │  2. Server GTM container        │
│  • High-value conversions        │     │  3. Custom domain (recommended) │
│  • Using Facebook CAPI           │     │  4. Budget: $50-200/month       │
│  • Need better data accuracy     │     │                                  │
│                                  │     │  Follow:                        │
│  Skip if:                        │     │  • SERVER-SIDE-GA4-GUIDE.md     │
│  • Low traffic (<10K/month)      │     │  • SERVER-SIDE-FACEBOOK-CAPI    │
│  • Budget constrained            │     │    -GUIDE.md                    │
│  • Technical resources limited   │     │                                  │
└─────────────────────────────────┘     └─────────────────────────────────┘
```

---

## Consent Implementation Decision

```
┌─────────────────────────────────────┐
│  Where do you sell?                 │
└──────────────┬──────────────────────┘
               │
    ┌──────────┼──────────────────────────────────────┐
    │          │                                       │
    ▼          ▼                                       ▼
  EU/EEA    California                             Other
  UK        Canada (Quebec)                        Regions
    │          │                                       │
    │          │                                       │
    ▼          ▼                                       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│  GDPR / ePrivacy          CCPA / Law 25          Optional but             │
│  (Strict)                 (Opt-out)              Recommended              │
│                                                                           │
│  ✓ Banner required        ✓ Banner required     ✓ Consider banner        │
│  ✓ Prior consent          ✓ Opt-out option      ✓ Shows transparency     │
│  ✓ All denied by default  ✓ Can default grant   ✓ Future-proofs         │
│  ✓ Granular choices       ✓ Sale of data focus  ✓ Builds trust          │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  RECOMMENDED: Enable consent for all visitors                             │
│                                                                           │
│  Shopify Admin → Settings → Customer Privacy:                            │
│  • Show banner: "All visitors"                                           │
│  • Enable all consent categories                                         │
│                                                                           │
│  This ensures compliance regardless of visitor location                  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Advertising Platform Decision

```
┌─────────────────────────────────────┐
│  Which ad platforms do you use?     │
└──────────────┬──────────────────────┘
               │
    ┌──────────┼──────────┬──────────┐
    │          │          │          │
    ▼          ▼          ▼          ▼
  Google     Meta      Microsoft    None
  Ads        Ads       Ads
    │          │          │          │
    ▼          ▼          ▼          ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────────┐
│         │ │         │ │         │ │                     │
│ Configure│ │ Configure│ │ Configure│ │ Skip advertising   │
│ in GTM: │ │ in GTM: │ │ in GTM: │ │ tags, focus on:    │
│         │ │         │ │         │ │                     │
│ • Google│ │ • Meta  │ │ • MS Ads│ │ • GA4 only         │
│   Ads   │ │   Pixel │ │   UET   │ │ • Enhanced         │
│   Conv. │ │ • CAPI  │ │ • MS    │ │   analytics        │
│ • Remar-│ │   (rec.)│ │   Consent│ │                     │
│   keting│ │         │ │         │ │                     │
│ • Enhan-│ │         │ │         │ │                     │
│   ced   │ │         │ │         │ │                     │
│   Conv. │ │         │ │         │ │                     │
└─────────┘ └─────────┘ └─────────┘ └─────────────────────┘
```

---

## Enhanced Conversions Decision

```
┌─────────────────────────────────────┐
│  Do you run Google Ads?             │
└──────────────┬──────────────────────┘
               │
       ┌───────┴───────┐
       │               │
      YES              NO
       │               │
       ▼               ▼
┌───────────────────────┐    Skip Enhanced
│  Enhanced Conversions │    Conversions setup
│  STRONGLY RECOMMENDED │
│                       │
│  Benefits:            │
│  • 90%+ match rate    │
│  • Better ROAS data   │
│  • Improved bidding   │
│  • iOS attribution    │
│                       │
│  Requires:            │
│  • User consent       │
│  • Hashed PII         │
│  • Server-side (opt.) │
└───────────────────────┘
```

---

## Facebook CAPI Decision

```
┌─────────────────────────────────────┐
│  Do you run Meta/Facebook Ads?      │
└──────────────┬──────────────────────┘
               │
       ┌───────┴───────┐
       │               │
      YES              NO
       │               │
       ▼               ▼
┌─────────────────────────────────────┐    Skip CAPI
│  Implementation Options:             │    setup
│                                      │
│  OPTION A: Pixel Only               │
│  ├─ Easier setup                    │
│  ├─ Affected by ad blockers         │
│  └─ Lower match quality             │
│                                      │
│  OPTION B: CAPI Only (Server)       │
│  ├─ Complex setup                   │
│  ├─ Bypasses ad blockers            │
│  └─ Requires deduplication          │
│                                      │
│  OPTION C: Hybrid (RECOMMENDED)     │
│  ├─ Both pixel AND CAPI             │
│  ├─ Best coverage                   │
│  ├─ Auto-deduplication              │
│  └─ Follow SERVER-SIDE-FACEBOOK-    │
│     CAPI-GUIDE.md                   │
└─────────────────────────────────────┘
```

---

## Theme Compatibility Decision

```
┌─────────────────────────────────────┐
│  What theme are you using?          │
└──────────────┬──────────────────────┘
               │
    ┌──────────┼──────────────────────┐
    │          │                       │
    ▼          ▼                       ▼
 OS 2.0      Vintage               Heavily
 (Dawn,      Theme                 Customized
 etc.)       (Pre-2.0)
    │          │                       │
    ▼          ▼                       ▼
┌─────────┐ ┌─────────────────┐ ┌─────────────────────────┐
│ Full    │ │ Requires:        │ │ Requires:               │
│ compat- │ │                  │ │                         │
│ ibility │ │ • Manual theme   │ │ • Custom selectors      │
│         │ │   liquid edits   │ │ • Theme-specific        │
│ Default │ │ • Selector       │ │   adjustments           │
│ install │ │   adjustments    │ │ • Testing all scenarios │
│ works   │ │ • More testing   │ │ • Developer involvement │
│         │ │                  │ │                         │
└─────────┘ └─────────────────┘ └─────────────────────────┘

SELECTOR CONFIGURATION:
In gold-storefront-datalayer-ga4.liquid, update:

const SELECTORS = {
  addToCartButton: '[your-selector]',
  cartDrawer: '[your-selector]',
  removeFromCart: '[your-selector]',
  // ... etc
};
```

---

## Implementation Complexity Summary

```
┌────────────────────────────────────────────────────────────────────────┐
│                    IMPLEMENTATION LEVELS                                │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  LEVEL 1: BASIC (2-4 hours)                                            │
│  ─────────────────────────────                                          │
│  • Consent mode + storefront tracking                                  │
│  • GTM container import                                                │
│  • GA4 configuration                                                   │
│  • Basic checkout pixel                                                │
│                                                                         │
│  Best for: Small stores, limited budget, basic analytics needs         │
│                                                                         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  LEVEL 2: STANDARD (4-8 hours)                                         │
│  ─────────────────────────────                                          │
│  • Everything in Level 1                                               │
│  • Google Ads conversion tracking                                      │
│  • Enhanced Conversions                                                │
│  • Meta Pixel (client-side)                                            │
│  • Cookie preferences link                                             │
│                                                                         │
│  Best for: Active advertisers, compliance-conscious stores             │
│                                                                         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  LEVEL 3: ADVANCED (8-16 hours)                                        │
│  ─────────────────────────────                                          │
│  • Everything in Level 2                                               │
│  • Server-side GTM                                                     │
│  • Facebook CAPI                                                       │
│  • Custom domain for tracking                                          │
│  • Advanced debugging setup                                            │
│                                                                         │
│  Best for: High-traffic stores, serious advertisers, data-driven      │
│                                                                         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  LEVEL 4: ENTERPRISE (16+ hours)                                       │
│  ─────────────────────────────                                          │
│  • Everything in Level 3                                               │
│  • Multi-market configuration                                          │
│  • Custom event tracking                                               │
│  • Data warehouse integration                                          │
│  • Advanced attribution modeling                                       │
│                                                                         │
│  Best for: Large enterprises, agencies, complex requirements           │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference: What to Install

### Minimum Viable Implementation

```
MUST HAVE:
├── shopify-privacy-consent-mode-api.liquid
├── gold-storefront-datalayer-ga4.liquid
├── gold-checkout-pixel-ga4.js
├── consent-mode-container.json (GTM import)
└── gold-gtm-container-ga4.json (GTM import)

CONFIGURE:
├── Shopify Admin → Customer Privacy settings
├── GTM → GA4 Measurement ID
└── Test in GTM Preview
```

### Full Implementation

```
CORE (as above):
├── All minimum viable components

ENHANCEMENTS:
├── shopify-cookie-preferences-link.liquid
├── Server-side GTM container
├── Google Ads Enhanced Conversions
├── Facebook CAPI integration

CONFIGURE:
├── All minimum viable config
├── Google Ads conversion IDs
├── Facebook Pixel ID and CAPI token
├── Server GTM deployment
└── Custom domain for server GTM
```

---

## Related Documents

- [Quick Start Guide](./QUICK-START-GUIDE.md) - Step-by-step installation
- [Solution Design Reference](./SOLUTION-DESIGN-REFERENCE.md) - Architecture details
- [Compliance Summary](./COMPLIANCE-SUMMARY.md) - Regulatory requirements
- [GTM Import Guide](./GTM-IMPORT-GUIDE.md) - Container setup
