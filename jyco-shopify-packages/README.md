# JY/co Shopify Analytics Packages

**Production-ready GA4 ecommerce tracking solutions for Shopify**

Version 1.0 | Released December 4, 2024

---

## Overview

JY/co offers two premium Shopify analytics implementation packages designed to provide Analyzify/Elevar-quality tracking while remaining fully owned and customizable. Choose the package that fits your needs and technical requirements.

---

## 📦 Packages

### 🥇 Gold Package — Hybrid Implementation
**Maximum data richness. Full tracking capabilities.**

- **Architecture:** Liquid Snippet (Storefront) + Custom Pixel (Checkout)
- **Installation Time:** 30-45 minutes
- **Developer Required:** Recommended
- **Data Quality:** ★★★★★ Excellent
- **Best For:** Advanced analytics, detailed product tracking, custom events

[View Gold Package Documentation →](./gold/gold-sdr-document.md)

---

### 🥈 Silver Package — Custom Pixel Only
**Zero theme modifications. Fast deployment.**

- **Architecture:** Custom Pixel Only (Web Pixel API)
- **Installation Time:** 15 minutes
- **Developer Required:** No
- **Data Quality:** ★★★★☆ Very Good
- **Best For:** Easy setup, headless stores, non-technical users

[View Silver Package Documentation →](./silver/silver-sdr-document.md)

---

## 🎯 What's Included

Both packages provide:

✅ **Complete GA4 Ecommerce Events** — All 13 recommended events fully implemented
✅ **Rich Customer Data** — User identification, lifetime value, order history
✅ **Product Details** — SKU, variants, pricing, discounts
✅ **Transaction Tracking** — Revenue, tax, shipping, discount codes
✅ **Pre-configured GTM** — Ready-to-import Google Tag Manager container
✅ **Privacy Compliant** — SHA256 email hashing, GDPR-aware
✅ **Professional Documentation** — Complete technical specifications (SDR)
✅ **Production Quality** — Robust error handling, performance optimized

---

## 🔍 Package Comparison

| Feature | Gold Package | Silver Package |
|---------|-------------|----------------|
| **Setup & Maintenance** |
| Theme modifications | Required (Liquid snippet) | None ✨ |
| Installation complexity | Medium | Low ✨ |
| Installation time | 30-45 min | 15 min ✨ |
| Developer needed | Recommended | No ✨ |
| Theme update impact | May need review | None ✨ |
| Update tracking code | Edit theme | Update pixel ✨ |
| **Tracking Capabilities** |
| Page views | ✅ Enhanced | ✅ Good |
| Product views | ✅ Full data | ✅ Full data |
| Collection tracking | ✅ With products | ⚠️ Without products |
| Search tracking | ✅ With result count | ⚠️ Query only |
| Product clicks | ✅ select_item event | ❌ Not available |
| Add to cart | ✅ Full tracking | ✅ Full tracking |
| Cart tracking | ✅ Full data | ✅ Full data |
| Checkout events | ✅ Complete | ✅ Complete |
| Purchase tracking | ✅ Complete | ✅ Complete |
| **Data Quality** |
| Page type detection | ✅ Template-based | ⚠️ URL-based |
| Product list items | ✅ Populated | ❌ Empty array |
| Search result count | ✅ Yes | ❌ No |
| Custom data access | ✅ Metafields, etc. | ❌ Limited |
| **Flexibility** |
| Custom events | ✅ Unlimited | ❌ API-only |
| Custom JavaScript | ✅ Yes | ❌ No |
| Headless compatibility | ⚠️ Limited | ✅ Full ✨ |
| **Integration Options** |
| Google Tag Manager | ✅ Yes | ✅ Yes |
| Direct GA4 (no GTM) | ❌ No | ✅ Yes ✨ |
| **Best For** |
| Use case | Advanced analytics | Easy deployment |
| | Maximum data depth | Headless stores |
| | Custom tracking needs | Non-technical teams |
| | Product list analysis | Quick setup |

**Legend:**
✅ Fully supported | ⚠️ Partial/Limited | ❌ Not available | ✨ Advantage

---

## 📊 Events Tracked

Both packages track all GA4 recommended ecommerce events:

| # | Event Name | What It Tracks | Gold | Silver |
|---|------------|----------------|------|--------|
| 1 | **page_view** | Every page load with enhanced metadata | ✅ | ✅ |
| 2 | **view_item_list** | Collection pages, search results with products | ✅ Full | ⚠️ Limited |
| 3 | **select_item** | Product clicks from lists | ✅ | ❌ |
| 4 | **view_item** | Product detail pages | ✅ | ✅ |
| 5 | **add_to_cart** | Add product to cart | ✅ | ✅ |
| 6 | **remove_from_cart** | Remove product from cart | ✅ | ✅ |
| 7 | **view_cart** | Cart page with full contents | ✅ | ✅ |
| 8 | **search** | Site search with query and results | ✅ | ⚠️ |
| 9 | **begin_checkout** | Checkout initiation | ✅ | ✅ |
| 10 | **add_shipping_info** | Shipping method selection | ✅ | ✅ |
| 11 | **add_payment_info** | Payment method selection | ✅ | ✅ |
| 12 | **purchase** | Order completion | ✅ | ✅ |
| 13 | **user_data** | Customer identification & properties | ✅ | ✅ |

---

## 🚀 Quick Start

### Gold Package Quick Start

1. **Backup theme**
2. **Add Liquid snippet** to `theme.liquid` before `</head>`
3. **Create Custom Pixel** with `gold-checkout-pixel.js`
4. **Import GTM container** `gold-gtm-container.json`
5. **Add GA4 Measurement ID** in GTM
6. **Test with GTM Preview**
7. **Publish**

[Full Installation Guide →](./gold/gold-sdr-document.md#7-installation-instructions)

### Silver Package Quick Start

**Option A: With GTM**
1. **Import GTM container** `silver-gtm-container.json`
2. **Add GA4 Measurement ID** in GTM
3. **Install GTM on Shopify** (if not already)
4. **Create Custom Pixel** with `silver-checkout-pixel.js`
5. **Set `trackingMethod: 'gtm'`**
6. **Test with GTM Preview**
7. **Publish**

**Option B: Direct to GA4 (No GTM)**
1. **Create GA4 API Secret** in GA4 Admin
2. **Create Custom Pixel** with `silver-checkout-pixel.js`
3. **Configure:** Set `trackingMethod: 'direct'`, add Measurement ID & API Secret
4. **Test with GA4 DebugView**
5. **Done!**

[Full Installation Guide →](./silver/silver-sdr-document.md#7-installation-instructions)

---

## 📁 Package Contents

### Gold Package Files

```
gold/
├── gold-storefront-datalayer.liquid    (~500 lines)
│   └── Liquid snippet for theme.liquid
│       Tracks: page_view, view_item, view_item_list, add_to_cart,
│                remove_from_cart, view_cart, search, select_item
│
├── gold-checkout-pixel.js              (~300 lines)
│   └── Custom Pixel for checkout tracking
│       Tracks: begin_checkout, add_shipping_info,
│               add_payment_info, purchase
│
├── gold-gtm-container.json
│   └── Complete GTM setup with:
│       • 14 Tags (GA4 Config + 13 Event Tags + Pixel Bridge)
│       • 14 Triggers
│       • 20 Data Layer Variables
│
└── gold-sdr-document.md
    └── Complete technical documentation:
        • Architecture diagrams
        • Event specifications
        • Installation guide
        • Testing checklist
        • Troubleshooting
```

### Silver Package Files

```
silver/
├── silver-checkout-pixel.js            (~650 lines)
│   └── Comprehensive Custom Pixel
│       Tracks ALL events via Web Pixel API
│       Supports GTM method OR Direct GA4 method
│
├── silver-gtm-container.json
│   └── GTM setup (same as Gold, for GTM method only)
│
└── silver-sdr-document.md
    └── Complete technical documentation:
        • Architecture overview
        • Dual method configuration
        • Installation for both methods
        • Gold vs Silver comparison
        • Troubleshooting
```

---

## 💡 Use Cases & Recommendations

### Choose **Gold Package** if you:

- Need maximum data depth for analytics
- Want to track which products customers click in collections
- Need search result counts
- Plan to add custom events
- Need access to Shopify metafields or custom data
- Have developer resources available
- Want the most detailed product list tracking
- Need to track specific user interactions beyond what Shopify provides

**Example clients:** Enterprise stores, data-driven businesses, agencies building custom analytics

---

### Choose **Silver Package** if you:

- Can't or don't want to edit theme code
- Want the fastest possible setup
- Are using Shopify headless
- Don't have technical resources
- Only need purchase funnel tracking (not detailed browsing)
- Want easy updates without touching theme
- Use a complex or custom theme
- Want to avoid theme update conflicts

**Example clients:** Small businesses, non-technical merchants, headless implementations, stores with locked themes

---

## 🔄 Can I Upgrade from Silver to Gold?

**Yes!** Easy upgrade path:

1. Keep Silver pixel active
2. Add Gold Liquid snippet to theme
3. Import Gold GTM container
4. Test both working together
5. Gold will provide richer data; events won't duplicate
6. Disable Silver pixel once confident (or keep for redundancy)

No data loss, no downtime.

---

## 🛠️ Technical Details

### Gold Package Architecture

```
Storefront Pages              Checkout
     ↓                            ↓
Liquid Snippet           Custom Pixel
     ↓                            ↓
  dataLayer  ←──────(postMessage)─┘
     ↓
Google Tag Manager
     ↓
Google Analytics 4
```

### Silver Package Architecture

**Method 1: GTM**
```
All Pages
    ↓
Custom Pixel
    ↓ (postMessage)
dataLayer
    ↓
Google Tag Manager
    ↓
Google Analytics 4
```

**Method 2: Direct**
```
All Pages
    ↓
Custom Pixel
    ↓ (fetch)
Google Analytics 4
(Measurement Protocol)
```

---

## 📋 Requirements

### Both Packages

- Shopify store (any plan: Basic, Shopify, Advanced, Plus)
- Admin access to Shopify
- Google Analytics 4 property
- Modern browser for testing (Chrome, Firefox, Safari)

### Gold Package Additional

- Ability to edit theme code (or developer access)
- Google Tag Manager container

### Silver Package Additional (GTM Method)

- Google Tag Manager container
- GTM installed on store

### Silver Package Additional (Direct Method)

- GA4 Measurement Protocol API Secret

---

## ⚙️ Configuration Options

### Gold Package

**Liquid Snippet (`gold-storefront-datalayer.liquid`):**
```javascript
var JYCO_CONFIG = {
  debug: false,                    // Enable console logging
  version: '1.0',
  maxCollectionProducts: 50,       // Limit collection items
  hashEmail: true                  // SHA256 email hashing
};
```

**Custom Pixel (`gold-checkout-pixel.js`):**
```javascript
const JYCO_CONFIG = {
  debug: false,                    // Enable console logging
  version: '1.0',
  usePostMessage: true             // Communication method
};
```

### Silver Package

**Custom Pixel (`silver-checkout-pixel.js`):**
```javascript
const JYCO_CONFIG = {
  debug: false,                    // Enable console logging
  version: '1.0',
  trackingMethod: 'gtm',           // 'gtm' or 'direct'
  ga4MeasurementId: 'G-XXXXXXXXXX',// For direct method
  ga4ApiSecret: 'XXXXXXXXXXXX',    // For direct method
  useGaCookie: true,               // Read _ga cookie for client_id
  fallbackClientId: null           // Auto-generated if needed
};
```

---

## 🧪 Testing & Debugging

### Enable Debug Mode

**Gold Package:**
- In Liquid snippet: Set `debug: true`
- In Custom Pixel: Set `debug: true`

**Silver Package:**
- In Custom Pixel: Set `debug: true`

### Testing Tools

1. **Browser Console** (F12) — See debug logs with `[JY/co]` prefix
2. **GTM Preview Mode** — See tag firing in real-time (GTM methods only)
3. **GA4 DebugView** — See events arriving in GA4 real-time
4. **Network Tab** — See API calls (Direct method)

### Test Checklist

Both SDR documents include complete testing checklists for:
- Each event type
- GTM Preview verification
- GA4 DebugView verification
- Post-launch monitoring

---

## 📞 Support & Contact

**Business:** JY/co
**Website:** www.jyco.com
**Email:** contact@jyco.com
**Documentation:** docs.jyco.com

---

## 📄 License & Usage

These packages are **proprietary products of JY/co**.

- ✅ Use for client implementations
- ✅ Customize for specific client needs
- ✅ White-label for your agency
- ❌ Do not resell as standalone product
- ❌ Do not distribute publicly

For licensing inquiries: contact@jyco.com

---

## 🔖 Version History

### Version 1.0 — December 4, 2024

**Gold Package:**
- Complete Liquid + Custom Pixel hybrid implementation
- 13 GA4 ecommerce events
- Full product list tracking
- Custom event capability
- Pre-configured GTM container
- Comprehensive SDR documentation

**Silver Package:**
- Custom Pixel only implementation
- 13 GA4 ecommerce events via Web Pixel API
- Dual tracking methods (GTM + Direct)
- Zero theme modifications
- Pre-configured GTM container
- Complete SDR with method comparison

---

## 🚦 Getting Started

1. **Review package comparison** above
2. **Choose Gold or Silver** based on your needs
3. **Read the SDR document** for your chosen package
4. **Follow installation instructions** step-by-step
5. **Test thoroughly** using provided checklists
6. **Monitor** for 24-48 hours post-launch
7. **Enjoy comprehensive GA4 tracking!**

---

## 📚 Additional Resources

- [GA4 Ecommerce Events Reference](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [Shopify Liquid Documentation](https://shopify.dev/docs/api/liquid)
- [Shopify Web Pixel API](https://shopify.dev/docs/api/web-pixels-api)
- [Google Tag Manager Documentation](https://support.google.com/tagmanager)
- [GA4 Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)

---

## 🎓 Training & Consulting

Need help implementing or customizing these packages?

**JY/co offers:**
- Implementation services
- Custom analytics solutions
- GA4 training & consulting
- Ongoing support & maintenance

**Contact:** contact@jyco.com

---

**Built with ❤️ by JY/co**
*Professional Shopify Analytics Solutions*

---

## FAQ

### Q: Can I use both packages at the same time?
**A:** Yes! Gold and Silver can coexist. Gold will provide richer data for overlapping events.

### Q: Do these work with Shopify Plus?
**A:** Yes, both packages work with all Shopify plans including Plus.

### Q: Do these work with headless Shopify?
**A:** Silver Package works fully with headless. Gold Package has limited headless compatibility.

### Q: Can I add other marketing tags (Meta, TikTok, etc.)?
**A:** Yes! If using GTM method, you can add any tags to the GTM container.

### Q: Do these packages slow down my store?
**A:** No. Both are performance-optimized with minimal impact (<50ms page load time).

### Q: Are these GDPR compliant?
**A:** Both packages include SHA256 email hashing. You must implement proper consent management separately.

### Q: Can I track custom events?
**A:** Gold Package: Yes, unlimited. Silver Package: Limited to Web Pixel API events.

### Q: What if Shopify updates break the tracking?
**A:** Gold Package may need updates after major theme changes. Silver Package auto-updates with Shopify's API.

### Q: Do I need to know how to code?
**A:** Gold Package: Basic HTML/Liquid knowledge helpful. Silver Package: No coding knowledge needed.

### Q: Can agencies use these for clients?
**A:** Yes! Both packages can be white-labeled and used for client implementations.

---

*For more questions, see the individual SDR documents or contact JY/co support.*
