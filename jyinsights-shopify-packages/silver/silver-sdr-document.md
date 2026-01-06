# JY Insights Silver Package
## Solution Design Reference

**Version:** 1.0
**Date:** January 6, 2026
**Package:** Silver
**Prepared by:** JY Insights

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

The JY Insights Silver Package is a streamlined, GA4-compliant ecommerce tracking solution for Shopify stores that uses **a single custom pixel** — no theme code modifications required. This implementation provides comprehensive analytics through Shopify's Web Pixel API, making it ideal for merchants who cannot or prefer not to edit theme code.

**Version 1.0** follows the same GA4-compliant structure as the Gold package but in a pixel-only format for easier installation and maintenance.

### What's Included

- **Single Pixel File** (`silver-pixel-GA4.js`) - ~695 lines, handles ALL tracking
- **GTM Container** (`silver-gtm-container-ga4.json`) - Pre-configured tags and triggers
- **Documentation** - This SDR + README.md
- **Zero Theme Modifications** - Install via Shopify Admin only
- **Complete GA4 Events** - All storefront and checkout events
- **GTM Integration** - Built-in Google Tag Manager initialization
- **Dual Email Hashing** - SHA-256 + SHA-1 for compatibility

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

### V3.0 Refactored Architecture

Version 3.0 introduces significant architectural improvements:

#### 1. Simplified Event Processing
- **Event Deduplication with Cache**: In-memory event cache with configurable TTL (default 5 seconds) prevents duplicate events from being fired
- **Cache Key Generation**: Events are uniquely identified using event name + key parameters to avoid false duplicates
- **Automatic Cache Cleanup**: Events automatically expire after TTL to prevent memory leaks

#### 2. Dual Tracking Methods
- **GTM Method (postMessage)**: Send events to parent window for GTM to process, offering full GTM flexibility
- **Direct GA4 Method (Measurement Protocol)**: Send events directly to GA4 API, bypassing GTM for simpler deployments
- **Single Configuration**: Toggle between methods with one setting (`trackingMethod: 'gtm'` or `'direct'`)

#### 3. Centralized Product Formatting
- **Single Source of Truth**: All product data goes through `formatProductForAnalyzify()` function
- **Analyzify Alignment**: Product parameters match Analyzify Enhanced standards exactly
- **Consistent Data Quality**: Ensures uniform product data across all events

#### 4. Enhanced Error Handling
- **Graceful Degradation**: Errors never break tracking, failed events are logged but don't stop execution
- **Try-Catch Everywhere**: Every event handler wrapped in error handling
- **Detailed Logging**: Debug mode provides comprehensive error information

#### 5. Client ID Management
- **_ga Cookie Reading**: Extracts client ID from Google Analytics _ga cookie when available
- **Fallback Generation**: Creates unique client ID if _ga cookie doesn't exist
- **Persistent Tracking**: Maintains user identity across sessions

---

## 3. Implementation Components

### Component 1: Custom Pixel (All Events)

**File:** `silver-checkout-pixel-enhanced.js`

**Location:** Shopify Admin > Settings > Customer Events > Add Custom Pixel

**Purpose:** Tracks ALL customer interactions across entire store with Analyzify-aligned data

**What It Does:**
- Subscribes to 11 Shopify Web Pixel API events
- Transforms Shopify event data to GA4 format with Analyzify parameters
- **Event Deduplication**: Prevents duplicate events using in-memory cache with TTL
- Sends via postMessage (GTM method) OR direct to GA4 (Direct method)
- **Dual Email Hashing**: Creates both SHA-256 (`user_eh`) and SHA-1 (`email_sha1`) hashes
- **Analyzify RFM Parameters**: Includes `user_r`, `user_f`, `user_m`, `user_type`
- Enriches events with customer data and order history
- Calculates discount information and total quantity
- Identifies new vs returning customers
- **_ga Cookie Reading**: Extracts client ID from _ga cookie with fallback generation

**Events Tracked (Standard GA4):**
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

**Additional Events Tracked (Analyzify Enhanced):**
- `sh_info` - Analyzify base event fired on all page views with RFM data
- `add_contact_info` - Fired during checkout when contact information is submitted
- `ee_purchase` - Enhanced ecommerce purchase event with full Analyzify parameters

**Size:** ~900 lines of code (v3.0 refactored)

**Configuration Options (CONFIG Object):**
```javascript
const CONFIG = {
  debug: false,                    // Enable console logging
  version: '3.0',                  // Package version
  packageName: 'Silver Enhanced (Analyzify)',

  // Tracking Method
  trackingMethod: 'gtm',           // 'gtm' or 'direct'

  // GTM Method Settings
  usePostMessage: true,            // Enable postMessage for GTM
  allowedOrigins: '*',             // PostMessage allowed origins
  postMessageType: 'jyinsights_datalayer', // PostMessage event type

  // Direct Method Settings
  ga4MeasurementId: '',            // GA4 Measurement ID (G-XXXXXXXXXX)
  ga4ApiSecret: '',                // GA4 API Secret (for Measurement Protocol)

  // Feature Flags
  useGoogleProductId: true,        // Use variant ID for item_id
  includeCategories: true,         // Include product categories
  hashEmail: true,                 // Enable email hashing
  useGaCookie: true,               // Read client ID from _ga cookie
  fallbackClientId: null,          // Fallback client ID if _ga not found

  // Event Deduplication
  eventCacheTTL: 5000              // Event cache TTL in milliseconds
};
```

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

## 4. Technical Specifications

### Event Deduplication Strategy

Version 3.0 implements an in-memory event cache to prevent duplicate events:

**How It Works:**
1. When an event is about to fire, a unique cache key is generated
2. Cache key includes event name + key identifying parameters (e.g., product ID, transaction ID)
3. System checks if this cache key exists in memory
4. If exists and not expired, event is skipped
5. If doesn't exist or expired, event fires and cache key is stored with timestamp
6. Cache entries automatically expire after TTL (default 5000ms)

**Cache Key Generation Examples:**
```javascript
// Product view: page_view_product_/products/blue-shirt
// Add to cart: add_to_cart_987654321
// Purchase: purchase_1001
// Generic page: page_view_/
```

**Benefits:**
- Prevents duplicate events from rapid-fire Shopify events
- Configurable TTL allows fine-tuning
- Automatic cleanup prevents memory leaks
- Doesn't block legitimate repeated events after TTL

### Dual Tracking Method Architecture

**GTM Method (PostMessage):**
```
Custom Pixel → postMessage → GTM Pixel Bridge → dataLayer → GTM Tags → GA4
```

**Process:**
1. Custom Pixel formats event data
2. Sends via `window.parent.postMessage()`
3. GTM Pixel Bridge (Custom HTML tag) listens
4. Pushes event to `dataLayer`
5. GTM triggers fire
6. GA4 tags send to Analytics

**Direct Method (Measurement Protocol):**
```
Custom Pixel → Format MP Payload → fetch() → GA4 Measurement Protocol API
```

**Process:**
1. Custom Pixel formats event data
2. Constructs Measurement Protocol payload
3. Sends via `fetch()` POST request
4. Directly to `https://www.google-analytics.com/mp/collect`
5. Bypasses GTM entirely

**Method Comparison:**

| Aspect | GTM Method | Direct Method |
|--------|------------|---------------|
| Setup Complexity | Higher (requires GTM) | Lower (pixel only) |
| Debugging | Easier (GTM Preview) | Harder (Network tab only) |
| Flexibility | High (add more tags) | Low (GA4 only) |
| Tag Management | Full GTM access | None |
| Performance | Extra hop (GTM) | Direct to GA4 |
| Additional Platforms | Easy (Meta, TikTok, etc.) | Difficult |
| Best For | Multi-platform tracking | Simple GA4-only setups |

### Client ID Extraction from _ga Cookie

**How It Works:**
1. Reads browser cookies looking for `_ga` cookie
2. Cookie format: `GA1.2.XXXXXXXXXX.YYYYYYYYYY`
3. Extracts last two segments: `XXXXXXXXXX.YYYYYYYYYY`
4. This becomes the client_id for GA4
5. If _ga cookie doesn't exist, generates random client_id
6. Format: `RANDOM_NUMBER.TIMESTAMP`

**Code Example:**
```javascript
function getClientId() {
  const gaCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('_ga='));

  if (gaCookie) {
    const parts = gaCookie.split('.');
    if (parts.length >= 4) {
      return `${parts[2]}.${parts[3]}`;
    }
  }

  // Fallback: generate new client ID
  return `${Math.random().toString(36).substring(2)}.${Date.now()}`;
}
```

**Benefits:**
- Maintains user identity across sessions
- Matches GA4's native client ID
- Works with existing GA4 implementations
- Fallback ensures events always have client_id

### Measurement Protocol Implementation

**Only used in Direct Method**

**Endpoint:**
```
POST https://www.google-analytics.com/mp/collect?measurement_id={GA4_ID}&api_secret={API_SECRET}
```

**Payload Structure:**
```json
{
  "client_id": "XXXXXXXXXX.YYYYYYYYYY",
  "user_id": "1234567890",
  "timestamp_micros": 1640000000000000,
  "user_properties": {
    "user_eh": { "value": "sha256_hash" },
    "email_sha1": { "value": "sha1_hash" },
    "user_r": { "value": "5" },
    "user_f": { "value": "3" },
    "user_m": { "value": "450.00" },
    "user_type": { "value": "member" }
  },
  "events": [{
    "name": "purchase",
    "params": {
      "transaction_id": "1001",
      "value": 99.97,
      "currency": "USD",
      "tax": 8.50,
      "shipping": 10.00,
      "items": [...]
    }
  }]
}
```

**Error Handling:**
- All fetch requests wrapped in try-catch
- Network errors logged but don't break pixel
- Failed events don't retry (single-attempt)
- Console warnings in debug mode

### Centralized Product Formatting

All product data flows through `formatProductForAnalyzify()`:

**Function Purpose:**
- Single source of truth for product parameters
- Ensures Analyzify alignment across all events
- Handles missing data gracefully
- Consistent category formatting

**Product Object Structure:**
```javascript
{
  item_id: '987654321',              // Variant ID (or product ID if useGoogleProductId = false)
  item_google_business_vertical: 'retail',
  item_name: 'Blue T-Shirt',
  item_brand: 'Brand Name',
  item_category: 'Apparel',
  item_category2: 'T-Shirts',        // If multi-level categories
  item_variant: 'Medium / Blue',
  item_variant_title: 'Medium / Blue',
  item_variant_id: '987654321',
  product_id: '123456789',           // Product ID
  variant_id: '987654321',           // Variant ID
  sku: 'TS-BLU-M',
  price: 29.99,
  quantity: 2,
  currency: 'USD',
  discount: 5.00,                    // If applicable
  index: 0                           // Position in list
}
```

---

## 5. Data Layer Specification

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

### Analyzify RFM Parameters (All Events)

Version 3.0 includes Analyzify-enhanced parameters on all events for customer segmentation:

**Customer Metrics (User Properties):**
- `user_eh` - Email hash (SHA-256)
- `email_sha1` - Email hash (SHA-1) for legacy platform compatibility
- `user_r` - Recency score (days since last order)
- `user_f` - Frequency score (total order count)
- `user_m` - Monetary value (total customer lifetime value)
- `user_type` - Customer type: "member" (logged in) or "visitor" (guest)

**Transaction Metrics (Purchase Events):**
- `order_name` - Shopify order name (e.g., "#1001")
- `checkout_id` - Checkout identifier
- `totalQuantity` - Total items in transaction
- `discount_amount` - Total discount applied

**Example Data Layer with Analyzify Parameters:**
```javascript
{
  event: 'page_view',
  user_eh: 'a1b2c3d4e5f6...', // SHA-256
  email_sha1: 'f1e2d3c4b5a6...', // SHA-1
  user_r: '5',                  // Last order 5 days ago
  user_f: '3',                  // 3 total orders
  user_m: '450.00',             // $450 lifetime value
  user_type: 'member',          // Logged in customer
  // ... other event-specific data
}
```

---

### Event: sh_info (Analyzify Base Event)

**When It Fires:** Every page load (alongside page_view)

**Purpose:** Analyzify-specific event for customer tracking and RFM segmentation

**Data Sent:**

```javascript
{
  event: 'sh_info',
  user_eh: 'a1b2c3d4e5f6...',
  email_sha1: 'f1e2d3c4b5a6...',
  user_r: '5',
  user_f: '3',
  user_m: '450.00',
  user_type: 'member',
  page_type: 'product',
  page_title: 'Product Name - Store',
  page_path: '/products/example'
}
```

**Note:** This event provides consistent customer data across all pages for Analyzify-based segmentation and reporting.

---

### Event: add_contact_info

**When It Fires:** During checkout when customer enters email/contact information

**Shopify Event:** checkout_contact_info_submitted

**Data Sent:**

```javascript
{
  event: 'add_contact_info',
  ecommerce: {
    currency: 'USD',
    value: 89.97,
    items: [
      // ... cart items
    ]
  },
  user_eh: 'a1b2c3d4e5f6...',
  email_sha1: 'f1e2d3c4b5a6...',
  user_type: 'member'
}
```

**Note:** Captures the moment when customer identity is first known in checkout flow.

---

### Event: ee_purchase (Enhanced Ecommerce Purchase)

**When It Fires:** Order completion (alongside standard purchase event)

**Shopify Event:** checkout_completed

**Data Sent:**

```javascript
{
  event: 'ee_purchase',
  ecommerce: {
    transaction_id: '1001',
    value: 99.97,
    currency: 'USD',
    tax: 8.50,
    shipping: 10.00,
    items: [
      // ... full item details with Analyzify parameters
    ]
  },
  user_eh: 'a1b2c3d4e5f6...',
  email_sha1: 'f1e2d3c4b5a6...',
  user_r: '0',                   // First order
  user_f: '1',                   // Order count = 1
  user_m: '99.97',               // First purchase value
  user_type: 'member',
  order_name: '#1001',
  checkout_id: 'abc123',
  totalQuantity: 2,
  discount_amount: 10.00
}
```

**Note:** Provides enhanced purchase tracking with full Analyzify RFM segmentation data.

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

## 6. Event Reference

### Complete Event Table

**Standard GA4 Events:**

| Event | Trigger | Shopify Event | GA4 Event | Data Quality |
|-------|---------|---------------|-----------|--------------|
| Page View | Any page load | page_viewed | page_view | Excellent (v3.0) |
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

**Analyzify Enhanced Events (v3.0):**

| Event | Trigger | Shopify Event | Purpose | Data Quality |
|-------|---------|---------------|---------|--------------|
| sh_info | Every page load | page_viewed | Analyzify base tracking with RFM | Excellent |
| add_contact_info | Checkout contact entry | checkout_contact_info_submitted | Contact info submission | Excellent |
| ee_purchase | Order complete | checkout_completed | Enhanced purchase with RFM | Excellent |

### V3.0 Benefits

The refactored v3.0 architecture provides significant improvements:

#### 1. No Duplicate Events
- **Event Cache System**: In-memory cache with TTL prevents duplicate events
- **Smart Key Generation**: Events identified by name + unique parameters
- **Configurable TTL**: Adjust cache duration based on your needs
- **Automatic Cleanup**: Cache entries expire automatically, preventing memory issues

#### 2. Flexible Tracking Options
- **GTM Method**: Full tag management flexibility, easy to add additional platforms
- **Direct Method**: Simpler setup, direct-to-GA4 for pure analytics tracking
- **Easy Switching**: Change methods by updating one config setting
- **Method-Specific Features**: Each method optimized for its use case

#### 3. Better Performance
- **Streamlined Code**: Refactored for efficiency and speed
- **Centralized Functions**: Single product formatting function reduces code duplication
- **Optimized Event Sending**: Reduced overhead in event processing
- **Minimal Performance Impact**: Lightweight pixel execution

#### 4. More Reliable Tracking
- **Enhanced Error Handling**: Try-catch blocks around all critical operations
- **Graceful Degradation**: Errors logged but don't break tracking
- **Fallback Mechanisms**: Client ID generation, email hashing fallbacks
- **Debug Mode**: Comprehensive logging for troubleshooting

#### 5. Easier Configuration
- **Single CONFIG Object**: All settings in one place
- **Clear Documentation**: Every config option explained
- **Feature Flags**: Enable/disable features without code changes
- **Sensible Defaults**: Works out-of-box with minimal configuration

#### 6. Analyzify Alignment
- **RFM Parameters**: Full customer segmentation metrics
- **Dual Email Hashing**: SHA-256 and SHA-1 for platform compatibility
- **Enhanced Events**: sh_info, add_contact_info, ee_purchase
- **Consistent Product Data**: Analyzify-standard product parameters

#### 7. Enterprise-Grade Features
- **Client ID Management**: Reads _ga cookie for cross-session identity
- **User Properties**: Full customer metrics on all events
- **Transaction Details**: Complete order metadata
- **Custom Dimensions**: Ready for advanced GA4 configuration

---

## 7. GTM Configuration

### Only Required for GTM Method

If using Direct GA4 method, skip this section entirely.

### Tags, Triggers, Variables

The GTM container is identical to the Gold package. See Gold SDR document for complete details.

**Key difference:** In Silver package, ALL events come from the Custom Pixel via postMessage, not from Liquid snippet.

**V3.0 Update:** GTM container should include triggers for new Analyzify events:
- `sh_info` - Custom Event trigger
- `add_contact_info` - Custom Event trigger
- `ee_purchase` - Custom Event trigger

---

## 8. Installation Instructions

### V3.0 Installation Notes

**Important changes in v3.0:**
1. Updated file name: `silver-checkout-pixel-enhanced.js`
2. New CONFIG object with all settings consolidated
3. Choose tracking method during installation (GTM or Direct)
4. Event deduplication enabled by default
5. Analyzify parameters enabled by default

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

#### Step 4: Install Custom Pixel (v3.0)

1. Go to Shopify Admin > Settings > Customer Events
2. Click "Add custom pixel"
3. Name: "JY/co Silver v3.0 - Analyzify Enhanced"
4. Paste entire contents of `silver-checkout-pixel-enhanced.js`
5. **IMPORTANT:** Verify the CONFIG object (around line 20-40):

```javascript
const CONFIG = {
  debug: false,                    // Set to true for testing
  version: '3.0',
  packageName: 'Silver Enhanced (Analyzify)',
  trackingMethod: 'gtm',           // VERIFY: 'gtm' for GTM method

  // GTM Method Settings
  usePostMessage: true,
  allowedOrigins: '*',
  postMessageType: 'jyinsights_datalayer',

  // Direct Method Settings (not used for GTM)
  ga4MeasurementId: '',
  ga4ApiSecret: '',

  // Feature Flags (defaults are good)
  useGoogleProductId: true,
  includeCategories: true,
  hashEmail: true,
  useGaCookie: true,
  fallbackClientId: null,

  // Event Deduplication
  eventCacheTTL: 5000             // 5 seconds
};
```

6. Click "Save"
7. Click "Connect" to activate

#### Step 5: Publish GTM Container

1. In GTM, click "Submit"
2. Version name: "JY/co Silver Package v3.0 - Analyzify Enhanced"
3. Description: "Custom Pixel tracking via GTM with Analyzify RFM parameters and event deduplication"
4. Click "Publish"

#### Step 6: Test

See [Testing & QA Checklist](#testing--qa-checklist) section.

**V3.0 Testing Notes:**
- Verify new events appear: `sh_info`, `add_contact_info`, `ee_purchase`
- Check for Analyzify parameters: `user_r`, `user_f`, `user_m`, `user_eh`, `email_sha1`
- Confirm no duplicate events (test by rapidly clicking same action)
- Verify client ID extracted from _ga cookie

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

#### Step 2: Install Custom Pixel (v3.0)

1. Go to Shopify Admin > Settings > Customer Events
2. Click "Add custom pixel"
3. Name: "JY/co Silver v3.0 - Direct GA4 (Analyzify Enhanced)"
4. Paste entire contents of `silver-checkout-pixel-enhanced.js`
5. **IMPORTANT:** Configure the CONFIG object (around line 20-40):

```javascript
const CONFIG = {
  debug: false,                    // Set to true for testing
  version: '3.0',
  packageName: 'Silver Enhanced (Analyzify)',
  trackingMethod: 'direct',        // IMPORTANT: 'direct' for Direct method

  // GTM Method Settings (not used for Direct)
  usePostMessage: false,           // Disable postMessage
  allowedOrigins: '*',
  postMessageType: 'jyinsights_datalayer',

  // Direct Method Settings - CONFIGURE THESE
  ga4MeasurementId: 'G-XXXXXXXXXX',    // YOUR GA4 Measurement ID
  ga4ApiSecret: 'YOUR_API_SECRET',     // YOUR API Secret from Step 1

  // Feature Flags (defaults are good)
  useGoogleProductId: true,
  includeCategories: true,
  hashEmail: true,
  useGaCookie: true,
  fallbackClientId: null,

  // Event Deduplication
  eventCacheTTL: 5000             // 5 seconds
};
```

6. Replace `G-XXXXXXXXXX` with your actual GA4 Measurement ID
7. Replace `YOUR_API_SECRET` with your API Secret from Step 1
8. Click "Save"
9. Click "Connect" to activate

#### Step 3: Test

See [Testing & QA Checklist](#testing--qa-checklist) section.

**Note:** GTM Preview mode won't work with Direct method. Use GA4 DebugView instead.

**V3.0 Testing Notes:**
- Enable debug mode in CONFIG for detailed console logging
- Verify events in GA4 DebugView (add `?debug_mode=1` to URL)
- Check Network tab for successful POST requests to `google-analytics.com/mp/collect`
- Confirm Analyzify parameters: `user_r`, `user_f`, `user_m`, `user_eh`, `email_sha1`
- Test event deduplication by rapidly triggering same event
- Verify client ID extraction from _ga cookie in console logs

---

## 9. Tracking Method Comparison

### When to Choose GTM Method

**Best For:**
- Multi-platform tracking (GA4 + Meta + TikTok + others)
- Teams that need tag management flexibility
- Marketers who prefer visual tag configuration
- Stores planning to add more tracking over time
- Advanced users comfortable with GTM

**Advantages:**
- Full GTM tag management capabilities
- Easy to add additional marketing platforms
- Better debugging with GTM Preview mode
- Can modify tags without touching pixel code
- Visual interface for non-developers
- Server-side GTM option available

**Disadvantages:**
- More complex initial setup
- Requires GTM installation on theme
- Extra hop in data flow (slight performance impact)
- Need to learn GTM if unfamiliar

**Setup Time:** ~30 minutes

### When to Choose Direct Method

**Best For:**
- GA4-only tracking needs
- Simple, minimal setups
- Teams without GTM expertise
- Stores wanting fastest deployment
- Merchants who won't add other platforms

**Advantages:**
- Simpler setup (no GTM required)
- Faster deployment (~15 minutes)
- Direct-to-GA4 (one less system)
- Fewer points of failure
- Better performance (no GTM hop)

**Disadvantages:**
- GA4 only (hard to add Meta, TikTok, etc.)
- No tag management interface
- Harder debugging (Network tab only)
- Changes require pixel code edits
- No GTM Preview mode

**Setup Time:** ~15 minutes

### Can I Switch Methods Later?

**Yes!** Switching is easy:

**GTM to Direct:**
1. Edit Custom Pixel code
2. Change `trackingMethod: 'gtm'` to `'direct'`
3. Add `ga4MeasurementId` and `ga4ApiSecret`
4. Save and reconnect pixel

**Direct to GTM:**
1. Install GTM on theme (if not already)
2. Import GTM container
3. Edit Custom Pixel code
4. Change `trackingMethod: 'direct'` to `'gtm'`
5. Remove or keep GA4 credentials (ignored in GTM mode)
6. Save and reconnect pixel

**No data loss** - Switch anytime without affecting historical data.

---

## 10. Testing & QA Checklist

### For GTM Method (v3.0)

**Standard GA4 Events:**

| Test | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| GTM Preview | Enable preview, load store | Preview mode connects | ☐ |
| Page View | Load homepage | page_view fires with Analyzify params | ☐ |
| View Item | Load product page | view_item fires with product data | ☐ |
| View List | Load collection | view_item_list fires (empty items OK) | ☐ |
| Search | Search for "test" | search fires with search_term | ☐ |
| Add to Cart | Add product to cart | add_to_cart fires with item data | ☐ |
| View Cart | Go to cart page | view_cart fires with all items | ☐ |
| Checkout | Start checkout | begin_checkout fires | ☐ |
| Shipping | Select shipping | add_shipping_info fires | ☐ |
| Payment | Enter payment | add_payment_info fires | ☐ |
| Purchase | Complete order | purchase fires with transaction_id | ☐ |

**V3.0 Analyzify Events:**

| Test | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| sh_info | Load any page | sh_info fires with RFM data | ☐ |
| Contact Info | Enter email in checkout | add_contact_info fires | ☐ |
| Enhanced Purchase | Complete order | ee_purchase fires with full data | ☐ |

**V3.0 Parameters Check:**

| Parameter | Where to Check | Expected Value | Status |
|-----------|----------------|----------------|--------|
| user_eh | All events (logged in) | SHA-256 hash | ☐ |
| email_sha1 | All events (logged in) | SHA-1 hash | ☐ |
| user_r | All events (logged in) | Number (days) | ☐ |
| user_f | All events (logged in) | Number (order count) | ☐ |
| user_m | All events (logged in) | Number (monetary value) | ☐ |
| user_type | All events | "member" or "visitor" | ☐ |
| order_name | Purchase events | "#1001" format | ☐ |
| totalQuantity | Purchase events | Total item count | ☐ |
| discount_amount | Purchase events | Discount value | ☐ |

**V3.0 Event Deduplication Test:**

| Test | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| Duplicate Prevention | Rapidly click add to cart 5x | Only 1 add_to_cart fires | ☐ |
| Cache Expiry | Wait 6 seconds, click again | New add_to_cart fires | ☐ |
| Console Check | Open console with debug mode | See "duplicate event prevented" messages | ☐ |

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
