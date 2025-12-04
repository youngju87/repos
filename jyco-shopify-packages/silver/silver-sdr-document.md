# JY/co Silver Package
## Solution Design Reference

**Version:** 1.0
**Date:** December 4, 2024
**Client:** [CLIENT NAME]
**Prepared by:** JY/co

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Implementation Components](#implementation-components)
4. [Data Layer Specification](#data-layer-specification)
5. [Event Reference](#event-reference)
6. [GTM Configuration](#gtm-configuration)
7. [Installation Instructions](#installation-instructions)
8. [Testing & QA Checklist](#testing--qa-checklist)
9. [Gold vs Silver Comparison](#gold-vs-silver-comparison)
10. [Troubleshooting](#troubleshooting)
11. [Appendix](#appendix)

---

## 1. Executive Summary

### Overview

The JY/co Silver Package is a streamlined GA4 ecommerce tracking solution for Shopify stores that uses **Custom Pixel only** — no theme code modifications required. This implementation provides comprehensive analytics through Shopify's Web Pixel API, making it ideal for merchants who cannot or prefer not to edit theme code.

### What's Included

- **Custom Pixel Only Architecture**: All tracking through Shopify's Web Pixel API
- **Zero Theme Modifications**: No code changes to your theme required
- **Complete GA4 Ecommerce Events**: All 13 recommended GA4 ecommerce events
- **Dual Tracking Methods**: Choose between GTM integration or direct GA4 Measurement Protocol
- **Pre-configured GTM Container**: Ready-to-import Google Tag Manager setup (optional)
- **Professional Documentation**: Complete technical specifications and implementation guide

### Expected Outcomes

- **Full Ecommerce Tracking**: Page views through purchase completion
- **Easy Installation**: 15-minute setup, no developer required
- **Future-Proof**: Built on Shopify's official Web Pixel API
- **Flexible Deployment**: Works with or without Google Tag Manager
- **Privacy Compliant**: Email hashing and consent handling built-in

### Silver vs Gold

| Feature | Silver Package | Gold Package |
|---------|---------------|--------------|
| Theme modifications | None | Yes (Liquid snippet) |
| Installation time | 15 minutes | 30 minutes |
| Developer needed | No | Recommended |
| Data richness | Good | Excellent |
| Product list detail | Limited | Full |
| Custom events | Limited | Unlimited |
| Best for | Standard stores | Advanced analytics |

---

## 2. Architecture Overview

### Custom Pixel Only Approach

The Silver Package uses a single-component architecture that relies entirely on Shopify's Web Pixel API:

```
┌─────────────────────────────────────────────────────────────┐
│                    ALL SHOPIFY PAGES                         │
│  (Home, Collections, Products, Cart, Search, Checkout)      │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│         CUSTOM PIXEL (Shopify Web Pixel API)                │
│  Subscribes to Shopify events:                              │
│  - page_viewed                                               │
│  - product_viewed                                            │
│  - collection_viewed                                         │
│  - search_submitted                                          │
│  - product_added_to_cart                                     │
│  - product_removed_from_cart                                 │
│  - cart_viewed                                               │
│  - checkout_started                                          │
│  - checkout_shipping_info_submitted                          │
│  - payment_info_submitted                                    │
│  - checkout_completed                                        │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
              ┌─────┴─────┐
              │  METHOD?  │
              └─────┬─────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐       ┌──────────────┐
│  GTM METHOD   │       │ DIRECT METHOD│
│ (postMessage) │       │ (Measurement │
│               │       │  Protocol)   │
└───────┬───────┘       └──────┬───────┘
        │                      │
        ▼                      │
┌───────────────┐              │
│  DATA LAYER   │              │
│      ↓        │              │
│     GTM       │              │
│      ↓        │              │
│     GA4       │              │
└───────────────┘              │
                               │
                               ▼
                        ┌──────────────┐
                        │     GA4      │
                        │   (Direct)   │
                        └──────────────┘
```

### Two Tracking Methods

**Method 1: GTM Integration (Recommended)**
- Custom Pixel sends events to parent window via postMessage
- GTM Pixel Bridge listens and pushes to dataLayer
- Standard GTM tags send to GA4
- **Pros:** Full GTM flexibility, easier debugging, can add more tags later
- **Cons:** Requires GTM installation

**Method 2: Direct GA4 (Alternative)**
- Custom Pixel sends directly to GA4 Measurement Protocol
- No GTM required
- **Pros:** Simpler setup, one less system
- **Cons:** No GTM flexibility, harder to add other tags (Meta, TikTok, etc.)

### Why Custom Pixel Only?

**Advantages:**
- **Zero theme modifications** — No code editing, no theme conflicts
- **Universal compatibility** — Works with any theme, including headless
- **Future-proof** — Built on Shopify's official API
- **Easy updates** — Update pixel without touching theme
- **Sandbox security** — Runs in isolated environment

**Limitations:**
- Less detailed product list data (collections)
- Cannot add custom JavaScript events
- Reliant on Shopify firing events correctly
- Some data points unavailable (e.g., metafields)

---

## 3. Implementation Components

### Component 1: Custom Pixel (All Events)

**File:** `silver-checkout-pixel.js`

**Location:** Shopify Admin > Settings > Customer Events > Add Custom Pixel

**Purpose:** Tracks ALL customer interactions across entire store

**What It Does:**
- Subscribes to 11 Shopify Web Pixel API events
- Transforms Shopify event data to GA4 format
- Sends via postMessage (GTM method) OR direct to GA4 (Direct method)
- Hashes customer email using SHA256
- Enriches events with customer data
- Calculates discount information
- Identifies new vs returning customers
- Reads/generates GA4 client ID

**Events Tracked:**
1. page_viewed → page_view
2. product_viewed → view_item
3. collection_viewed → view_item_list
4. search_submitted → search
5. product_added_to_cart → add_to_cart
6. product_removed_from_cart → remove_from_cart
7. cart_viewed → view_cart
8. checkout_started → begin_checkout
9. checkout_shipping_info_submitted → add_shipping_info
10. payment_info_submitted → add_payment_info
11. checkout_completed → purchase

**Size:** ~650 lines of code

**Configuration Options:**
- `trackingMethod`: 'gtm' or 'direct'
- `ga4MeasurementId`: Your GA4 ID (for direct method)
- `ga4ApiSecret`: Your API secret (for direct method)
- `debug`: Enable console logging

### Component 2: GTM Container (Optional)

**File:** `silver-gtm-container.json`

**Location:** Import into Google Tag Manager

**Purpose:** Routes events from dataLayer to GA4 (only needed for GTM method)

**Contents:** Same as Gold package:
- 1 GA4 Configuration Tag
- 13 GA4 Event Tags
- 1 Custom HTML Tag (Pixel Bridge)
- 14 Custom Event Triggers
- 20 Data Layer Variables
- 1 Constant Variable (GA4 Measurement ID)

**Note:** Only required if using GTM tracking method.

---

## 4. Data Layer Specification

### Event Structure (GTM Method Only)

When using GTM method, events are pushed to dataLayer in this structure:

```javascript
{
  event: 'event_name',
  ecommerce: {
    // Event-specific ecommerce data
  },
  // Additional properties
}
```

When using Direct method, events are sent directly to GA4 Measurement Protocol.

---

### Event: page_view

**When It Fires:** Every page load

**Shopify Event:** page_viewed

**Data Sent:**

```javascript
{
  event: 'page_view',
  page_type: 'product',              // home, collection, product, cart, search, page, blog, checkout, other
  page_title: 'Product Name - Store',
  page_path: '/products/example',
  page_location: 'https://store.com/products/example',
  user_id: '1234567890',             // If logged in
  customer_email_sha256: 'a1b2c3...',
  customer_logged_in: true,
  customer_orders_count: 5
}
```

**Note:** Page type detection is basic (URL-based). Gold package has more accurate detection via Liquid templates.

---

### Event: view_item

**When It Fires:** Product detail page view

**Shopify Event:** product_viewed

**Data Sent:**

```javascript
{
  event: 'view_item',
  ecommerce: {
    currency: 'USD',
    value: 29.99,
    items: [
      {
        item_id: '987654321',        // Variant ID
        item_name: 'Blue T-Shirt',
        item_brand: 'Brand Name',
        item_category: 'Apparel',
        item_variant: 'Medium / Blue',
        item_sku: 'TS-BLU-M',
        price: 29.99,
        currency: 'USD'
      }
    ]
  }
}
```

---

### Event: view_item_list

**When It Fires:** Collection page view

**Shopify Event:** collection_viewed

**Data Sent:**

```javascript
{
  event: 'view_item_list',
  ecommerce: {
    item_list_name: 'Summer Collection',
    item_list_id: '12345678',
    items: []                         // LIMITATION: Empty array
  }
}
```

**IMPORTANT LIMITATION:** Shopify's Web Pixel API does not provide the list of products in a collection. The Gold package (using Liquid) can populate this with actual products. This is the main functional difference between packages.

---

### Event: search

**When It Fires:** Search performed

**Shopify Event:** search_submitted

**Data Sent:**

```javascript
{
  event: 'search',
  search_term: 'blue shirt'
}
```

**Note:** Search results count is not available via Web Pixel API. Gold package can provide this.

---

### Event: add_to_cart

**When It Fires:** User adds product to cart

**Shopify Event:** product_added_to_cart

**Data Sent:**

```javascript
{
  event: 'add_to_cart',
  ecommerce: {
    currency: 'USD',
    value: 59.98,
    items: [
      {
        item_id: '987654321',
        item_name: 'Blue T-Shirt',
        item_brand: 'Brand Name',
        item_category: 'Apparel',
        item_variant: 'Medium / Blue',
        item_sku: 'TS-BLU-M',
        price: 29.99,
        quantity: 2,
        currency: 'USD',
        index: 0
      }
    ]
  }
}
```

---

### Event: remove_from_cart

**When It Fires:** User removes product from cart

**Shopify Event:** product_removed_from_cart

**Data Sent:**

```javascript
{
  event: 'remove_from_cart',
  ecommerce: {
    currency: 'USD',
    items: [
      {
        item_id: '987654321',
        item_name: 'Blue T-Shirt',
        // ... full item data
      }
    ]
  }
}
```

---

### Event: view_cart

**When It Fires:** Cart page view

**Shopify Event:** cart_viewed

**Data Sent:**

```javascript
{
  event: 'view_cart',
  ecommerce: {
    currency: 'USD',
    value: 89.97,
    items: [
      {
        item_id: '987654321',
        item_name: 'Blue T-Shirt',
        item_brand: 'Brand Name',
        item_category: 'Apparel',
        item_variant: 'Medium / Blue',
        price: 29.99,
        quantity: 2,
        currency: 'USD',
        index: 0
      }
    ]
  },
  cart_id: 'gid://shopify/Cart/abc123',
  cart_total: 89.97,
  cart_item_count: 2
}
```

---

### Event: begin_checkout

**When It Fires:** Checkout initiation

**Shopify Event:** checkout_started

**Data Sent:**

```javascript
{
  event: 'begin_checkout',
  ecommerce: {
    currency: 'USD',
    value: 89.97,
    items: [
      // ... items array
    ]
  },
  user_id: '1234567890',
  customer_email_sha256: 'a1b2c3...',
  customer_logged_in: true,
  customer_orders_count: 5
}
```

---

### Event: add_shipping_info

**When It Fires:** Shipping method selected

**Shopify Event:** checkout_shipping_info_submitted

**Data Sent:**

```javascript
{
  event: 'add_shipping_info',
  ecommerce: {
    currency: 'USD',
    value: 89.97,
    shipping_tier: 'Standard Shipping',
    items: [
      // ... items array
    ]
  }
}
```

---

### Event: add_payment_info

**When It Fires:** Payment method selected

**Shopify Event:** payment_info_submitted

**Data Sent:**

```javascript
{
  event: 'add_payment_info',
  ecommerce: {
    currency: 'USD',
    value: 89.97,
    payment_type: 'Credit Card',
    items: [
      // ... items array
    ]
  }
}
```

---

### Event: purchase

**When It Fires:** Order completion

**Shopify Event:** checkout_completed

**Data Sent:**

```javascript
{
  event: 'purchase',
  ecommerce: {
    transaction_id: '1001',
    value: 99.97,
    currency: 'USD',
    tax: 8.50,
    shipping: 10.00,
    coupon: 'SUMMER10',
    items: [
      {
        item_id: '987654321',
        item_name: 'Blue T-Shirt',
        item_brand: 'Brand Name',
        item_category: 'Apparel',
        item_variant: 'Medium / Blue',
        item_sku: 'TS-BLU-M',
        price: 29.99,
        quantity: 2,
        currency: 'USD',
        discount: 5.00,
        index: 0
      }
    ]
  },
  discount_codes: ['SUMMER10'],
  discount_amount: 10.00,
  shipping_method: 'Standard Shipping',
  payment_method: 'Credit Card',
  user_id: '1234567890',
  customer_email_sha256: 'a1b2c3...',
  customer_logged_in: true,
  customer_orders_count: 6,
  new_customer: false
}
```

---

## 5. Event Reference

### Complete Event Table

| Event | Trigger | Shopify Event | GA4 Event | Data Quality |
|-------|---------|---------------|-----------|--------------|
| Page View | Any page load | page_viewed | page_view | Good |
| View Item | Product page | product_viewed | view_item | Excellent |
| View Item List | Collection page | collection_viewed | view_item_list | Limited* |
| Search | Search performed | search_submitted | search | Good |
| Add to Cart | Add to cart | product_added_to_cart | add_to_cart | Excellent |
| Remove from Cart | Remove from cart | product_removed_from_cart | remove_from_cart | Excellent |
| View Cart | Cart page | cart_viewed | view_cart | Excellent |
| Begin Checkout | Start checkout | checkout_started | begin_checkout | Excellent |
| Add Shipping Info | Select shipping | checkout_shipping_info_submitted | add_shipping_info | Excellent |
| Add Payment Info | Enter payment | payment_info_submitted | add_payment_info | Excellent |
| Purchase | Order complete | checkout_completed | purchase | Excellent |

*Limited = items array empty due to Web Pixel API limitations

---

## 6. GTM Configuration

### Only Required for GTM Method

If using Direct GA4 method, skip this section entirely.

### Tags, Triggers, Variables

The GTM container is identical to the Gold package. See Gold SDR document for complete details.

**Key difference:** In Silver package, ALL events come from the Custom Pixel via postMessage, not from Liquid snippet.

---

## 7. Installation Instructions

### Prerequisites

- Shopify store (any plan)
- Admin access to Shopify
- Google Analytics 4 property created
- (Optional) Google Tag Manager container created if using GTM method

---

### OPTION A: GTM Method Installation

**Recommended if:** You want GTM flexibility, plan to add other marketing tags, or want easier debugging.

#### Step 1: Import GTM Container

1. Go to Google Tag Manager
2. Click "Admin" > "Import Container"
3. Upload `silver-gtm-container.json`
4. Choose workspace: "New" (name it "JY/co Silver Implementation")
5. Import option: "Merge" or "Overwrite"
6. Click "Confirm"

#### Step 2: Configure GA4 Measurement ID

1. In GTM, go to "Variables"
2. Click "Const - GA4 Measurement ID"
3. Replace "G-XXXXXXXXXX" with your actual GA4 Measurement ID
4. Save

#### Step 3: Install GTM on Shopify (if not already installed)

1. In GTM, note your container ID (GTM-XXXXXX)
2. Go to Shopify Admin > Online Store > Themes
3. Click "Actions" > "Edit code"
4. Open `theme.liquid`
5. Paste GTM head script before `</head>`:

```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXX');</script>
<!-- End Google Tag Manager -->
```

6. Paste GTM body script after `<body>`:

```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

7. Replace GTM-XXXXXX with your container ID
8. Save

#### Step 4: Install Custom Pixel

1. Go to Shopify Admin > Settings > Customer Events
2. Click "Add custom pixel"
3. Name: "JY/co Silver Tracking Pixel"
4. Paste entire contents of `silver-checkout-pixel.js`
5. **IMPORTANT:** In the code, find line ~24:

```javascript
trackingMethod: 'gtm',
```

Make sure it says `'gtm'` (not `'direct'`)

6. Click "Save"
7. Click "Connect" to activate

#### Step 5: Publish GTM Container

1. In GTM, click "Submit"
2. Version name: "JY/co Silver Package v1.0"
3. Description: "Custom Pixel tracking via GTM"
4. Click "Publish"

#### Step 6: Test

See [Testing & QA Checklist](#testing--qa-checklist) section.

---

### OPTION B: Direct GA4 Method Installation

**Recommended if:** You want simplest setup, don't need GTM, or only tracking GA4.

#### Step 1: Create GA4 API Secret

1. Go to Google Analytics 4
2. Click "Admin" (bottom left)
3. Under "Data collection and modification", click "Data Streams"
4. Click your Web data stream
5. Scroll down to "Measurement Protocol API secrets"
6. Click "Create"
7. Nickname: "JY/co Silver Pixel"
8. Click "Create"
9. **COPY THE SECRET VALUE** (you can't see it again)

#### Step 2: Install Custom Pixel

1. Go to Shopify Admin > Settings > Customer Events
2. Click "Add custom pixel"
3. Name: "JY/co Silver Tracking Pixel"
4. Paste entire contents of `silver-checkout-pixel.js`
5. **IMPORTANT:** Configure these lines (around line 24-30):

```javascript
trackingMethod: 'direct',              // Change to 'direct'
ga4MeasurementId: 'G-XXXXXXXXXX',      // Your GA4 Measurement ID
ga4ApiSecret: 'XXXXXXXXXXXX',          // Your API Secret from Step 1
```

6. Click "Save"
7. Click "Connect" to activate

#### Step 3: Test

See [Testing & QA Checklist](#testing--qa-checklist) section.

**Note:** GTM Preview mode won't work with Direct method. Use GA4 DebugView instead.

---

## 8. Testing & QA Checklist

### For GTM Method

| Test | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| GTM Preview | Enable preview, load store | Preview mode connects | ☐ |
| Page View | Load homepage | page_view fires in GTM | ☐ |
| View Item | Load product page | view_item fires with product data | ☐ |
| View List | Load collection | view_item_list fires (empty items OK) | ☐ |
| Search | Search for "test" | search fires with search_term | ☐ |
| Add to Cart | Add product to cart | add_to_cart fires with item data | ☐ |
| View Cart | Go to cart page | view_cart fires with all items | ☐ |
| Checkout | Start checkout | begin_checkout fires | ☐ |
| Shipping | Select shipping | add_shipping_info fires | ☐ |
| Payment | Enter payment | add_payment_info fires | ☐ |
| Purchase | Complete order | purchase fires with transaction_id | ☐ |

### For Direct Method

| Test | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| Pixel Active | Check pixel status | Shows "Connected" | ☐ |
| DebugView | Open GA4 DebugView | Ready to receive events | ☐ |
| Page View | Load homepage with ?debug_mode=1 | Appears in DebugView | ☐ |
| View Item | Load product page | Appears in DebugView | ☐ |
| Add to Cart | Add to cart | Appears in DebugView | ☐ |
| Purchase | Complete test order | Appears in DebugView | ☐ |

### Browser Console Testing

For both methods, enable debug mode:

1. Edit Custom Pixel code
2. Change line ~19: `debug: true,`
3. Save and reconnect
4. Open browser console (F12)
5. Perform actions
6. Look for `[JY/co Silver v1.0]` messages

---

## 9. Gold vs Silver Comparison

### Feature Comparison

| Feature | Silver Package | Gold Package |
|---------|----------------|--------------|
| **Installation** | | |
| Theme code changes | None ✅ | Yes (Liquid snippet) |
| Developer required | No ✅ | Recommended |
| Installation time | 15 min ✅ | 30-45 min |
| Ongoing maintenance | Low ✅ | Medium |
| | | |
| **Tracking Capability** | | |
| Page views | ✅ | ✅ |
| Product views | ✅ | ✅ |
| Collection views | ⚠️ Limited | ✅ Full |
| Search tracking | ⚠️ Basic | ✅ Enhanced |
| Add to cart | ✅ | ✅ |
| Cart views | ✅ | ✅ |
| Checkout events | ✅ | ✅ |
| Purchase tracking | ✅ | ✅ |
| | | |
| **Data Quality** | | |
| Product list items | ❌ Empty | ✅ Populated |
| Search result count | ❌ No | ✅ Yes |
| Product click tracking | ❌ No | ✅ Yes (select_item) |
| Page type detection | ⚠️ URL-based | ✅ Template-based |
| Custom data points | ❌ No | ✅ Yes |
| | | |
| **Flexibility** | | |
| Add custom events | ❌ No | ✅ Yes |
| Access metafields | ❌ No | ✅ Yes |
| Custom JavaScript | ❌ No | ✅ Yes |
| Theme independence | ✅ Yes | ⚠️ Theme-dependent |
| | | |
| **Deployment Options** | | |
| GTM integration | ✅ | ✅ |
| Direct GA4 | ✅ | ❌ |
| Headless compatible | ✅ | ⚠️ Limited |
| | | |
| **Support & Updates** | | |
| Update without theme | ✅ | ❌ |
| Theme updates safe | ✅ | ⚠️ May need review |
| Future Shopify updates | ✅ Automatic | ⚠️ May need update |

### When to Choose Silver

- You can't edit theme code (agency restrictions, etc.)
- You want fastest, easiest setup
- You're using headless Shopify
- You only need purchase tracking (not detailed browsing)
- You're non-technical
- Your store uses a complex/custom theme

### When to Choose Gold

- You need detailed product list tracking
- You want to track custom events
- You need access to metafields
- You want maximum data richness
- You have developer resources
- You want to track product clicks (select_item)
- You need search result counts

### Can I Upgrade Silver to Gold Later?

**Yes!** Easy upgrade path:

1. Keep Silver pixel active
2. Add Gold Liquid snippet to theme
3. Gold snippet will add richer data
4. Both can coexist (Gold events will supersede)
5. Or disable Silver pixel once Gold is working

---

## 10. Troubleshooting

### Issue: Custom Pixel not firing events

**Symptoms:**
- No events in GTM Preview or GA4 DebugView
- Pixel shows "Connected" but nothing happens

**Solutions:**

1. **Check pixel is active**
   - Go to Settings > Customer Events
   - Pixel should show "Connected" in green
   - If not, click "Connect"

2. **Enable debug mode**
   - Edit pixel code
   - Set `debug: true`
   - Save and reconnect
   - Check browser console for `[JY/co Silver]` messages

3. **Check permissions**
   - Pixel needs customer events permission
   - Shopify may require enabling in store settings

---

### Issue: Events fire but not reaching GA4

**For GTM Method:**

1. **Check Pixel Bridge tag**
   - In GTM Preview, verify "Custom HTML - JYco Pixel Bridge" fires on All Pages
   - Check browser console for "JY/co Pixel Bridge" messages

2. **Check postMessage**
   - Browser console should show events being sent
   - If security errors, try different browser

**For Direct Method:**

1. **Check API credentials**
   - Verify `ga4MeasurementId` is correct (format: G-XXXXXXXXXX)
   - Verify `ga4ApiSecret` is correct (from GA4 admin)
   - Ensure no spaces or quotes issues

2. **Check Network tab**
   - Open browser Dev Tools > Network
   - Filter for "google-analytics.com"
   - Should see POST requests to `/mp/collect`
   - Check response (200 = success)

---

### Issue: view_item_list has empty items array

**This is expected behavior for Silver package.**

Shopify's Web Pixel API does not provide the list of products when a collection is viewed. This is the main limitation vs Gold package.

**Workaround:** Upgrade to Gold package if you need detailed collection tracking.

---

### Issue: Duplicate purchase events

**Symptoms:**
- Same transaction_id appears twice
- Revenue doubled in GA4

**Solutions:**

1. **Check for multiple pixels**
   - Go to Settings > Customer Events
   - Ensure only ONE JY/co pixel is active
   - Deactivate duplicates

2. **Check for old implementation**
   - Look for other GA4 tracking code in theme
   - Remove old tracking if present

3. **Add deduplication** (Advanced):

Edit pixel code, add before purchase event send:

```javascript
// After line ~480, before sendEvent('purchase', ...)
const transactionId = String(checkout.order?.id || '');
if (sessionStorage.getItem('jyco_purchase_' + transactionId)) {
  jycoLog('Purchase already tracked, skipping');
  return;
}
sessionStorage.setItem('jyco_purchase_' + transactionId, 'true');
```

---

### Issue: User ID not captured

**Symptoms:**
- user_id always undefined
- Customer logged in but not identified

**Solutions:**

1. **Customer may not be logged in**
   - Test with actual logged-in customer account
   - Check "My Account" link appears in store

2. **Check Shopify customer data**
   - Web Pixel API only provides customer data if available
   - Some checkout flows don't expose customer ID
   - This is a Shopify limitation

---

### Issue: Email hash not appearing

**Symptoms:**
- customer_email_sha256 is empty

**Solutions:**

1. **Email not available at that point**
   - Email may not be available on all pages
   - Should be available by checkout_started
   - Should definitely be available on purchase

2. **crypto.subtle not available**
   - Requires HTTPS (doesn't work on HTTP)
   - Check browser console for errors
   - Test in modern browser (Chrome, Firefox, Safari)

---

### General Debugging

1. **Enable debug mode** in pixel code
2. **Check browser console** for error messages
3. **Use GA4 DebugView** to see real-time events
4. **Use GTM Preview** (if GTM method) to see event flow
5. **Check Shopify's own analytics** to verify events are firing at Shopify level

---

## 11. Appendix

### A. Shopify Web Pixel API Events

Official documentation: https://shopify.dev/docs/api/web-pixels-api

**Events used in Silver package:**

| Shopify Event | When It Fires | Data Provided |
|---------------|---------------|---------------|
| page_viewed | Every page load | URL, title, context |
| product_viewed | Product page | Product, variant details |
| collection_viewed | Collection page | Collection ID and title only |
| search_submitted | Search performed | Search query |
| product_added_to_cart | Add to cart | Cart line with product |
| product_removed_from_cart | Remove from cart | Cart line with product |
| cart_viewed | Cart page | Full cart details |
| checkout_started | Checkout begins | Full checkout object |
| checkout_address_info_submitted | Address entered | Checkout with address |
| checkout_shipping_info_submitted | Shipping selected | Checkout with shipping |
| payment_info_submitted | Payment entered | Checkout with payment |
| checkout_completed | Order confirmed | Full order details |

### B. GA4 Measurement Protocol

**Used in Direct method only**

Official docs: https://developers.google.com/analytics/devguides/collection/protocol/ga4

**Endpoint:**
```
POST https://www.google-analytics.com/mp/collect
?measurement_id=G-XXXXXXXXXX
&api_secret=XXXXXXXXXXXX
```

**Payload format:**
```json
{
  "client_id": "XXXXXXXXXX.YYYYYYYYYY",
  "user_id": "optional_user_id",
  "events": [{
    "name": "event_name",
    "params": {
      "parameter_name": "value"
    }
  }]
}
```

### C. Creating GA4 API Secret

1. Google Analytics 4 > Admin
2. Data Streams > [Your Stream]
3. Measurement Protocol API secrets
4. Create
5. Copy secret value (can't view again)

### D. Version History

**Version 1.0** - December 4, 2024
- Initial release
- Complete Web Pixel API implementation
- Dual tracking methods (GTM + Direct)
- SHA256 email hashing
- User identification
- All 13 GA4 ecommerce events

### E. Upgrading to Gold Package

If you need more detailed tracking:

1. Install Gold Liquid snippet in theme
2. Keep Silver pixel active (or disable)
3. Gold will provide richer data for same events
4. Import Gold GTM container (if using GTM)
5. Test both working together
6. Once confident, can disable Silver pixel

### F. Support & Contact

**JY/co**
- Website: www.jyco.com
- Email: contact@jyco.com
- Documentation: docs.jyco.com

---

*End of Solution Design Reference*
