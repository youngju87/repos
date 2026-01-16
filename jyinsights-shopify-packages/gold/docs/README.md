# JY Insights Gold Analytics & Consent Package

**Version:** 1.2 | **Last Updated:** January 2026

## Overview

The JY Insights Gold package is a comprehensive, privacy-first analytics and consent management solution for Shopify merchants. It provides enterprise-grade Google Analytics 4 (GA4) tracking with full Consent Mode v2 compliance, enhanced ecommerce data collection, and server-side tracking capabilities.

This package solves the critical challenges of modern Shopify analytics:

- **Privacy Compliance**: GDPR, CCPA/CPRA, Quebec Law 25, and GPC signal support
- **Data Accuracy**: Server-side tracking bypasses ad blockers and browser restrictions
- **Enhanced Conversions**: 90%+ match rates with properly hashed customer data
- **Checkout Tracking**: Dedicated pixel for Shopify's sandboxed checkout environment
- **Attribution**: List-based attribution connecting products to their discovery context

## Package Components

| Component | Version | Purpose |
|-----------|---------|---------|
| `gold-storefront-datalayer-ga4.liquid` | 2.0 | Storefront tracking & data layer |
| `gold-checkout-pixel-ga4.js` | 2.3 | Checkout pixel for Custom Pixel |
| `gold-gtm-container-ga4.json` | 2.0 | Pre-configured GTM container |
| `consent-mode-container.json` | 2.1 | Consent Mode v2 GTM container |
| `shopify-privacy-consent-mode-api.liquid` | 2.1 | Shopify Privacy API integration |
| `shopify-cookie-preferences-link.liquid` | 1.2 | Cookie preferences footer link |

## What Problems Does This Solve?

### 1. Consent Mode v2 Compliance
Google requires Consent Mode v2 for EU traffic as of March 2024. This package implements the full specification including `ad_storage`, `ad_user_data`, `ad_personalization`, and `analytics_storage` signals.

### 2. Checkout Tracking Gap
Shopify's checkout runs in a sandboxed iframe with no access to the main window. The checkout pixel runs independently, reading consent state from sessionStorage and tracking the complete purchase funnel.

### 3. Data Quality Degradation
Browser privacy features and ad blockers reduce tracking accuracy. Server-side GTM and Facebook CAPI integration restore data quality through first-party data collection.

### 4. Enhanced Conversions Match Rate
Properly formatted and hashed customer data (SHA256) enables 90%+ Enhanced Conversions match rates for Google Ads and Meta advertising.

### 5. Attribution Complexity
Products viewed in collections, search results, or quick views maintain their list context through to purchase, enabling accurate attribution analysis.

## Included Modules

### Core Tracking
- **Storefront Data Layer** - Captures all storefront interactions (product views, cart actions, search)
- **Checkout Pixel** - Tracks checkout funnel events in Shopify's sandboxed environment
- **GTM Container** - Pre-configured tags, triggers, and variables for GA4, Google Ads, and Meta

### Consent Management
- **Consent Mode Bridge** - Connects Shopify Privacy API to Google Consent Mode v2
- **Microsoft Consent Mode** - Parallel consent signals for Microsoft Advertising
- **GPC/DNT Detection** - Automatic respect for Global Privacy Control signals
- **Cookie Preferences Link** - Footer link handler for consent management

### Documentation & Guides
- Server-side GA4 setup guide
- Facebook Conversions API setup guide
- Shopify Privacy Settings checklist
- GTM consent mode setup guide

## Supported Platforms & Requirements

### Shopify Requirements
- **Shopify Plan**: Basic, Shopify, Advanced, or Plus
- **Checkout Extensibility**: Required for checkout pixel (Plus recommended)
- **Theme**: Any 2.0 theme (Dawn-compatible)
- **Markets**: Multi-currency and multi-language supported

### External Services
- Google Tag Manager (web container required, server container recommended)
- Google Analytics 4 property
- Google Cloud Platform (for server-side GTM)
- Facebook Business Manager (for CAPI integration)

### Browser Support
- Modern browsers with JavaScript enabled
- Fallback behavior for older browsers
- Ad-blocker resilient with server-side tracking

## Who Is This Package For?

### Ideal Users
- **Agencies** managing multiple Shopify clients
- **In-house teams** at mid-market to enterprise Shopify stores
- **Consultants** implementing privacy-compliant analytics
- **Technical marketers** requiring advanced attribution

### Technical Level Required
- **GTM**: Intermediate (container imports, variable configuration)
- **Shopify**: Intermediate (theme code editing, Custom Pixels)
- **GA4**: Basic (property setup, event mapping)
- **Server-Side**: Advanced (GCP, custom domains, CAPI tokens)

### Merchant Profile
- Revenue: $500K+ annually (justifies implementation investment)
- Traffic: 10K+ monthly sessions
- Markets: Selling in regions with privacy regulations
- Advertising: Active Google Ads and/or Meta advertising

## Quick Navigation

| Document | Purpose |
|----------|---------|
| [Quick Start Guide](./QUICK-START-GUIDE.md) | Get started in 30 minutes |
| [Solution Design Reference](./SOLUTION-DESIGN-REFERENCE.md) | Architecture and data flows |
| [Event Reference](./EVENT-REFERENCE.md) | Complete event documentation |
| [Consent Mode Reference](./CONSENT-MODE-REFERENCE.md) | Consent implementation details |
| [GTM Import Guide](./GTM-IMPORT-GUIDE.md) | Container import instructions |
| [Compliance Summary](./COMPLIANCE-SUMMARY.md) | Regulatory alignment |
| [Client Presentation](./CLIENT-PRESENTATION.md) | Executive summary |
| [Troubleshooting Guide](./TROUBLESHOOTING-GUIDE.md) | Common issues and solutions |

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.2 | Jan 2026 | Consent Mode v2.1, optimized polling, GPC support |
| 1.1 | Dec 2025 | Enhanced checkout pixel, RFM metrics |
| 1.0 | Nov 2025 | Initial release |

## Support & Feedback

For implementation support or to report issues:
- GitHub Issues: [jyinsights-shopify-packages](https://github.com/jyinsights/jyinsights-shopify-packages/issues)
- Documentation: This repository's `/docs` folder

---

**License**: Proprietary - JY Insights
**Author**: JY Insights Analytics Team
