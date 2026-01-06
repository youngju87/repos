# jyinsights Shopify Analytics Packages

**Production-ready GA4 ecommerce tracking with Analyzify-aligned parameters**

Version 3.0 (Analyzify Enhanced) | Released December 31, 2025

---

## 🚀 Quick Start

**Get tracking in 30 minutes:**

1. **Choose your package** (Gold or Silver - see comparison below)
2. **Install tracking code** (Storefront + Checkout for Gold, Checkout-only for Silver)
3. **Configure GTM** (Import container or manual setup)
4. **Test & publish** (Use validation tools)

**[View Quick Start Guide](./QUICK_START_GUIDE.md)** for step-by-step instructions.

---

## Overview

jyinsights offers two premium Shopify analytics implementation packages that provide Analyzify/Elevar-quality tracking while remaining fully owned and customizable. Choose the package that fits your needs and technical requirements.

### Key Features (Both Packages)

✅ **Analyzify-Aligned Parameters** — Complete compatibility with Analyzify dataLayer standards
✅ **13 GA4 Ecommerce Events** — All recommended events fully implemented
✅ **Enhanced Customer Tracking (RFM)** — User ID, recency, frequency, monetary value
✅ **Rich Product Data** — SKU, variants, pricing, categories, Google Ads product IDs
✅ **Transaction Tracking** — Revenue, tax, shipping, discount codes
✅ **Pre-configured GTM** — Ready-to-import Google Tag Manager container
✅ **Privacy Compliant** — Dual email hashing (SHA-256 + SHA-1), GDPR-aware
✅ **Production Quality** — Robust error handling, performance optimized
✅ **Theme Hyper 2.0 Compatible** — Enhanced selectors and custom event listeners

---

## 📦 Packages

### 🥇 Gold Package — Hybrid Implementation
**Maximum data richness. Full tracking capabilities.**

- **Architecture:** Liquid Snippet (Storefront) + Custom Pixel (Checkout)
- **Installation Time:** 30-45 minutes
- **Developer Required:** Recommended
- **Data Quality:** ★★★★★ Excellent
- **Best For:** Advanced analytics, detailed product tracking, custom events

**[View Gold Package Files →](./gold/)**

---

### 🥈 Silver Package — Custom Pixel Only
**Zero theme modifications. Fast deployment.**

- **Architecture:** Custom Pixel Only (Web Pixel API)
- **Installation Time:** 15 minutes
- **Developer Required:** No
- **Data Quality:** ★★★★☆ Very Good
- **Best For:** Easy setup, headless stores, non-technical users

**[View Silver Package Files →](./silver/)**

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
| **Tracking Capabilities** |
| Page views | ✅ Enhanced | ✅ Good |
| Product views | ✅ Full data | ✅ Full data |
| Collection tracking | ✅ With products | ⚠️ Without products |
| Search tracking | ✅ With result count | ⚠️ Query only |
| Product clicks | ✅ select_item event | ❌ Not available |
| Add to cart | ✅ Full tracking | ✅ Full tracking |
| Checkout events | ✅ Complete | ✅ Complete |
| Purchase tracking | ✅ Complete | ✅ Complete |
| **Data Quality** |
| Page type detection | ✅ Template-based | ⚠️ URL-based |
| Product list items | ✅ Populated | ❌ Empty array |
| Search result count | ✅ Yes | ❌ No |
| Custom data access | ✅ Metafields, etc. | ❌ Limited |
| **Analyzify Features** |
| RFM customer tracking | ✅ Yes | ✅ Yes |
| Dual email hashing | ✅ SHA-256 + SHA-1 | ✅ SHA-256 + SHA-1 |
| Google Ads product ID | ✅ Yes | ✅ Yes |
| Category taxonomy | ✅ Yes | ✅ Yes |
| sh_info base event | ✅ Yes | ✅ Yes |
| ee_purchase event | ✅ Yes | ✅ Yes |

**Legend:** ✅ Fully supported | ⚠️ Partial/Limited | ❌ Not available | ✨ Advantage

---

## 🎯 What's New in v3.0 (Analyzify Enhanced)

### Complete Analyzify Parameter Alignment

**Product Parameters:**
- `product_id`, `variant_id`, `product_name`, `product_brand`, `product_sku`
- `category_id`, `category_name` for product categorization
- `g_product_id` for Google Ads (format: `shopify_{country}_{product_id}_{variant_id}`)

**Customer Tracking (RFM Model):**
- `user_id` - Shopify customer ID
- `user_eh` - SHA-256 hashed email (primary)
- `email_sha1` - SHA-1 hashed email (secondary)
- `user_r` - Recency (last order date)
- `user_f` - Frequency (total orders count)
- `user_m` - Monetary (total spent)
- `user_type` - Customer type (`member` or `visitor`)

**Transaction Parameters:**
- `order_id`, `order_name`, `checkout_id`
- `totalValue`, `totalQuantity`
- `discount_amount`, `discount_codes[]`, `coupon`
- `payment_type`, `shipping_method`, `shipping_tier`

**Enhanced Events:**
- `sh_info` - Base event fired on all pages (Analyzify standard)
- `add_contact_info` - Contact information submission
- `ee_purchase` - Enhanced ecommerce purchase (dual event with `purchase`)

### Theme Hyper 2.0 Compatibility

✅ Custom event listeners for Hyper 2.0 cart interactions
✅ Enhanced product card selectors
✅ Configurable compatibility toggle

### Improved Validation & Debugging

✅ Enhanced console logging with log levels
✅ Parameter validation utilities
✅ Analyzify compliance checker
✅ Interactive browser console validator

---

## 📊 Events Tracked

Both packages track all GA4 recommended ecommerce events:

| # | Event Name | What It Tracks | Gold | Silver |
|---|------------|----------------|------|--------|
| 1 | **sh_info** | Base event with customer & page data (Analyzify) | ✅ | ✅ |
| 2 | **page_view** | Every page load with enhanced metadata | ✅ | ✅ |
| 3 | **view_item_list** | Collection pages, search results with products | ✅ Full | ⚠️ Limited |
| 4 | **select_item** | Product clicks from lists | ✅ | ❌ |
| 5 | **view_item** | Product detail pages | ✅ | ✅ |
| 6 | **add_to_cart** | Add product to cart | ✅ | ✅ |
| 7 | **remove_from_cart** | Remove product from cart | ✅ | ✅ |
| 8 | **view_cart** | Cart page with full contents | ✅ | ✅ |
| 9 | **search** | Site search with query and results | ✅ | ⚠️ |
| 10 | **begin_checkout** | Checkout initiation | ✅ | ✅ |
| 11 | **add_contact_info** | Contact info submission | ✅ | ✅ |
| 12 | **add_shipping_info** | Shipping method selection | ✅ | ✅ |
| 13 | **add_payment_info** | Payment method selection | ✅ | ✅ |
| 14 | **purchase** | Order completion | ✅ | ✅ |
| 15 | **ee_purchase** | Enhanced purchase (Analyzify compatibility) | ✅ | ✅ |

---

## 📁 Package Contents

### Gold Package Files

```
gold/
├── gold-storefront-datalayer-enhanced.liquid    (~900 lines)
│   └── Liquid snippet for theme.liquid
│       Tracks: sh_info, page_view, view_item, view_item_list,
│               add_to_cart, remove_from_cart, view_cart,
│               search, select_item
│       Features: Theme Hyper 2.0 support, RFM tracking,
│                 Analyzify parameters
│
├── gold-checkout-pixel-enhanced.js              (~600 lines)
│   └── Custom Pixel for checkout tracking
│       Tracks: begin_checkout, add_contact_info,
│               add_shipping_info, add_payment_info,
│               purchase, ee_purchase
│       Features: Dual email hashing, postMessage bridge
│
├── gold-gtm-container.json
│   └── Complete GTM setup with:
│       • 17 Tags (GA4 Config + 16 Event Tags + Pixel Bridge)
│       • 17 Triggers
│       • 30+ Data Layer Variables
│       • Analyzify-aligned parameters
│
├── datalayer-validator.js
│   └── Interactive browser console validation tool:
│       • Complete dataLayer validation
│       • Analyzify compliance checking
│       • Product parameter verification
│       • Event finder & debugger
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
├── silver-checkout-pixel-enhanced.js            (~650 lines)
│   └── Comprehensive Custom Pixel
│       Tracks ALL events via Web Pixel API
│       Supports GTM method OR Direct GA4 method
│       Features: Analyzify alignment, RFM tracking
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
3. Import Gold GTM container (or update existing)
4. Test both working together
5. Gold will provide richer data; events won't duplicate
6. Disable Silver pixel once confident (or keep for redundancy)

No data loss, no downtime.

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

## 🛠️ Installation

### Gold Package Quick Start

1. **Backup theme**
2. **Add Liquid snippet** to `theme.liquid` before `</head>`
3. **Create Custom Pixel** with `gold-checkout-pixel-enhanced.js`
4. **Import GTM container** `gold-gtm-container.json`
5. **Add GA4 Measurement ID** in GTM
6. **Test with GTM Preview**
7. **Publish**

**[Full Installation Guide →](./IMPLEMENTATION_GUIDE.md)**

### Silver Package Quick Start

**Option A: With GTM**
1. **Import GTM container** `silver-gtm-container.json`
2. **Add GA4 Measurement ID** in GTM
3. **Install GTM on Shopify** (if not already)
4. **Create Custom Pixel** with `silver-checkout-pixel-enhanced.js`
5. **Set `trackingMethod: 'gtm'`**
6. **Test with GTM Preview**
7. **Publish**

**Option B: Direct to GA4 (No GTM)**
1. **Create GA4 API Secret** in GA4 Admin
2. **Create Custom Pixel** with `silver-checkout-pixel-enhanced.js`
3. **Configure:** Set `trackingMethod: 'direct'`, add Measurement ID & API Secret
4. **Test with GA4 DebugView**
5. **Done!**

**[Full Installation Guide →](./IMPLEMENTATION_GUIDE.md)**

---

## ⚙️ Configuration Options

### Gold Package

**Liquid Snippet (`gold-storefront-datalayer-enhanced.liquid`):**
```javascript
var JYINSIGHTS_CONFIG = {
  debug: false,                    // Enable console logging
  version: '3.0',
  packageName: 'Gold Enhanced (Analyzify)',
  maxCollectionProducts: 50,       // Limit collection items
  hashEmail: true,                 // SHA256 email hashing
  includeCategories: true,         // Category tracking
  useGoogleProductId: true,        // Google Ads product ID
  themeHyper2Compat: true          // Theme Hyper 2.0 support
};
```

**Custom Pixel (`gold-checkout-pixel-enhanced.js`):**
```javascript
const JYINSIGHTS_CONFIG = {
  debug: false,                    // Enable console logging
  version: '3.0',
  packageName: 'Gold Enhanced (Analyzify)',
  usePostMessage: true,            // Communication method
  allowedOrigins: '*',             // IMPORTANT: Set to your domain in production
  useGoogleProductId: true,
  includeCategories: true
};
```

### Silver Package

**Custom Pixel (`silver-checkout-pixel-enhanced.js`):**
```javascript
const JYINSIGHTS_CONFIG = {
  debug: false,                    // Enable console logging
  version: '3.0',
  packageName: 'Silver Enhanced (Analyzify)',
  trackingMethod: 'gtm',           // 'gtm' or 'direct'
  ga4MeasurementId: 'G-XXXXXXXXXX',// For direct method
  ga4ApiSecret: 'XXXXXXXXXXXX',    // For direct method
  useGaCookie: true,               // Read _ga cookie for client_id
  fallbackClientId: null,          // Auto-generated if needed
  useGoogleProductId: true,
  includeCategories: true
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

1. **Browser Console** (F12) — See debug logs with `[jyinsights]` prefix
2. **DataLayer Validator** — Interactive validation tool (`datalayer-validator.js`)
3. **GTM Preview Mode** — See tag firing in real-time (GTM methods only)
4. **GA4 DebugView** — See events arriving in GA4 real-time
5. **Network Tab** — See API calls (Direct method)

### Validation Commands (Gold Package)

Open browser console and use the validator:

```javascript
// Complete validation
JYINSIGHTSValidator.validateAll()

// Check product parameters
JYINSIGHTSValidator.checkProductParams()

// Show dataLayer
JYINSIGHTSValidator.showDataLayer()

// Find specific events
JYINSIGHTSValidator.findEvents('purchase')

// Check Analyzify compliance
JYINSIGHTSValidator.checkAnalyzifyCompliance()
```

### Test Checklist

Both SDR documents include complete testing checklists for:
- Each event type
- GTM Preview verification
- GA4 DebugView verification
- Post-launch monitoring

---

## 📚 Documentation

### Core Documentation

- **[QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)** - 30-minute setup guide
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Complete implementation guide with Analyzify alignment details
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and changes

### Package-Specific Documentation

- **[gold/README.md](./gold/README.md)** - Gold package overview
- **[gold/gold-sdr-document.md](./gold/gold-sdr-document.md)** - Complete Gold technical specifications
- **[silver/README.md](./silver/README.md)** - Silver package overview
- **[silver/silver-sdr-document.md](./silver/silver-sdr-document.md)** - Complete Silver technical specifications

### External Resources

- [Analyzify Data Layers Parameters](https://docs.analyzify.com/data-layers-parameters)
- [Analyzify GTM Container](https://docs.analyzify.com/analyzify-gtm-container)
- [GA4 Ecommerce Events Reference](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [Shopify Liquid Documentation](https://shopify.dev/docs/api/liquid)
- [Shopify Web Pixel API](https://shopify.dev/docs/api/web-pixels-api)
- [Google Tag Manager Documentation](https://support.google.com/tagmanager)

---

## 📞 Support & Contact

**Business:** jyinsights
**Website:** www.jyinsights.com
**Email:** contact@jyinsights.com

---

## 📄 License & Usage

These packages are **proprietary products of jyinsights**.

- ✅ Use for client implementations
- ✅ Customize for specific client needs
- ✅ White-label for your agency
- ❌ Do not resell as standalone product
- ❌ Do not distribute publicly

For licensing inquiries: contact@jyinsights.com

---

## 🔖 Version History

### Version 3.0 — December 31, 2025 (Analyzify Enhanced)

**Both Packages:**
- ✅ Complete Analyzify parameter alignment
- ✅ Enhanced customer tracking (RFM model)
- ✅ Dual email hashing (SHA-256 + SHA-1)
- ✅ Google Ads product ID generation
- ✅ Category taxonomy (category_id, category_name)
- ✅ sh_info base event (Analyzify standard)
- ✅ add_contact_info event
- ✅ ee_purchase event (Analyzify compatibility)
- ✅ Theme Hyper 2.0 compatibility (Gold)
- ✅ Enhanced validation tools
- ✅ Improved error handling and logging
- ✅ Updated branding (JY/co → jyinsights)

### Version 2.0 — December 9, 2025

**Both Packages:**
- Enhanced security and error handling
- Improved postMessage communication
- Better product data extraction

### Version 1.0 — December 4, 2024

**Gold Package:**
- Initial Liquid + Custom Pixel hybrid implementation
- 13 GA4 ecommerce events
- Full product list tracking
- Custom event capability
- Pre-configured GTM container

**Silver Package:**
- Initial Custom Pixel only implementation
- 13 GA4 ecommerce events via Web Pixel API
- Dual tracking methods (GTM + Direct)
- Zero theme modifications

---

## FAQ

### Q: Can I use both packages at the same time?
**A:** Yes! Gold and Silver can coexist. Gold will provide richer data for overlapping events.

### Q: Do these work with Shopify Plus?
**A:** Yes, both packages work with all Shopify plans including Plus.

### Q: Do these work with headless Shopify?
**A:** Silver Package works fully with headless. Gold Package has limited headless compatibility.

### Q: What is Analyzify alignment?
**A:** Our v3.0 implementation uses the same dataLayer parameter naming and event structure as Analyzify, ensuring compatibility and best-practice tracking standards.

### Q: Can I add other marketing tags (Meta, TikTok, etc.)?
**A:** Yes! If using GTM method, you can add any tags to the GTM container.

### Q: Do these packages slow down my store?
**A:** No. Both are performance-optimized with minimal impact (<50ms page load time).

### Q: Are these GDPR compliant?
**A:** Both packages include SHA-256 and SHA-1 email hashing. You must implement proper consent management separately.

### Q: Can I track custom events?
**A:** Gold Package: Yes, unlimited. Silver Package: Limited to Web Pixel API events.

### Q: What if Shopify updates break the tracking?
**A:** Gold Package may need updates after major theme changes. Silver Package auto-updates with Shopify's API.

### Q: Do I need to know how to code?
**A:** Gold Package: Basic HTML/Liquid knowledge helpful. Silver Package: No coding knowledge needed.

### Q: Can agencies use these for clients?
**A:** Yes! Both packages can be white-labeled and used for client implementations.

### Q: What's the difference between purchase and ee_purchase events?
**A:** Both contain identical data. `ee_purchase` is provided for Analyzify compatibility where systems expect both events.

---

## 🎓 Training & Consulting

Need help implementing or customizing these packages?

**jyinsights offers:**
- Implementation services
- Custom analytics solutions
- GA4 training & consulting
- Ongoing support & maintenance
- Analyzify migration assistance

**Contact:** contact@jyinsights.com

---

**Built with precision by jyinsights**
*Professional Shopify Analytics Solutions*

---

© 2025 jyinsights. All rights reserved.
