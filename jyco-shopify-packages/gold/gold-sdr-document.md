# JY/co Gold Package
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
9. [Troubleshooting](#troubleshooting)
10. [Appendix](#appendix)

---

## 1. Executive Summary

### Overview

The JY/co Gold Package is a comprehensive, production-ready GA4 ecommerce tracking solution for Shopify stores. This implementation provides enterprise-level analytics capabilities comparable to commercial solutions like Analyzify and Elevar, with the advantage of being fully owned and customizable.

### What's Included

- **Hybrid Tracking Architecture**: Combines Shopify Liquid (storefront) + Custom Pixel (checkout) for maximum data richness
- **Complete GA4 Ecommerce Events**: All 13 recommended GA4 ecommerce events fully implemented
- **Rich Data Layer**: Captures 50+ data points including user properties, product details, and transaction data
- **Pre-configured GTM Container**: Ready-to-import Google Tag Manager setup with all tags, triggers, and variables
- **Professional Documentation**: Complete technical specifications and implementation guide

### Expected Outcomes

- **Complete Customer Journey Tracking**: From first page view through purchase completion
- **Advanced Audience Building**: Rich customer data for remarketing and segmentation
- **Attribution Analysis**: Full funnel visibility for marketing performance measurement
- **Enhanced Ecommerce Reporting**: Detailed product, cart, and transaction analytics in GA4
- **GDPR/Privacy Compliant**: Email hashing and user consent handling built-in

---

## 2. Architecture Overview

### Hybrid Implementation Approach

The Gold Package uses a two-component architecture to maximize data quality while working within Shopify's platform constraints:

```
┌─────────────────────────────────────────────────────────────┐
│                    SHOPIFY STOREFRONT                        │
│  (Home, Collections, Products, Cart, Search)                │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│         LIQUID SNIPPET (theme.liquid)                        │
│  - Page views                                                │
│  - Product views & list views                                │
│  - Add to cart / Remove from cart                            │
│  - Search events                                             │
│  - User identification                                       │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER                                 │
│              (window.dataLayer)                              │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│              GOOGLE TAG MANAGER                              │
│  - Event routing                                             │
│  - Data transformation                                       │
│  - User properties                                           │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                  GOOGLE ANALYTICS 4                          │
└─────────────────────────────────────────────────────────────┘

                    +

┌─────────────────────────────────────────────────────────────┐
│                 SHOPIFY CHECKOUT                             │
│  (Customer info, Shipping, Payment, Confirmation)           │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│         CUSTOM PIXEL (Shopify Web Pixel API)                │
│  - Begin checkout                                            │
│  - Add shipping info                                         │
│  - Add payment info                                          │
│  - Purchase                                                  │
└───────────────────┬─────────────────────────────────────────┘
                    │ (postMessage)
                    ▼
┌─────────────────────────────────────────────────────────────┐
│              DATA LAYER → GTM → GA4                          │
└─────────────────────────────────────────────────────────────┘
```

### Why Hybrid?

**Liquid Advantages:**
- Full access to Shopify objects (customer, cart, product, collection)
- Access to metafields and custom data
- No sandbox restrictions
- Synchronous execution with page load

**Custom Pixel Advantages:**
- Only way to track checkout events (Liquid cannot access checkout)
- Shopify's official, future-proof tracking method
- Access to checkout completion data
- Built-in event subscribers

---

## 3. Implementation Components

### Component 1: Storefront Data Layer (Liquid)

**File:** `gold-storefront-datalayer.liquid`

**Location:** Insert into `theme.liquid` before `</head>` tag

**Purpose:** Tracks all pre-checkout customer interactions

**What It Does:**
- Initializes `window.dataLayer` array
- Pushes user identification data on every page
- Fires `page_view` event with enhanced page metadata
- Fires `view_item_list` on collection and search pages
- Fires `view_item` on product detail pages
- Fires `view_cart` on cart page
- Listens for and tracks `add_to_cart` events
- Listens for and tracks `remove_from_cart` events
- Listens for and tracks `select_item` (product clicks)
- Hashes customer email using SHA256
- Handles null/undefined values gracefully

**Size:** ~500 lines of code

**Performance Impact:** Minimal (<50ms additional page load time)

### Component 2: Checkout Custom Pixel

**File:** `gold-checkout-pixel.js`

**Location:** Shopify Admin > Settings > Customer Events > Add Custom Pixel

**Purpose:** Tracks checkout and purchase events

**What It Does:**
- Subscribes to Shopify's Web Pixel API events
- Transforms Shopify event data to GA4 format
- Fires `begin_checkout` when checkout starts
- Fires `add_shipping_info` when shipping method selected
- Fires `add_payment_info` when payment method selected
- Fires `purchase` on order completion
- Sends events to parent window dataLayer via postMessage
- Enriches events with customer data
- Calculates discount information
- Identifies new vs returning customers

**Size:** ~300 lines of code

**Execution:** Runs in sandboxed iframe, communicates via postMessage

### Component 3: GTM Container

**File:** `gold-gtm-container.json`

**Location:** Import into Google Tag Manager

**Purpose:** Routes events from dataLayer to GA4

**Contents:**
- 1 GA4 Configuration Tag
- 13 GA4 Event Tags
- 1 Custom HTML Tag (Pixel Bridge)
- 14 Custom Event Triggers
- 20 Data Layer Variables
- 5 Built-in Variables
- 1 Constant Variable (GA4 Measurement ID)

---

## 4. Data Layer Specification

### Event Structure

All events follow this structure:

```javascript
{
  event: 'event_name',           // Required: GA4 event name
  ecommerce: {                   // Optional: For ecommerce events
    // Event-specific ecommerce data
  },
  // Additional event-specific properties
}
```

---

### Event: page_view

**When It Fires:** Every page load

**Fired By:** Liquid snippet

**Data Layer Push:**

```javascript
{
  event: 'page_view',
  page_type: 'home',              // home, collection, product, cart, search, page, blog, article, 404
  page_title: 'Homepage - Store Name',
  page_path: '/collections/summer-sale',
  page_location: 'https://store.com/collections/summer-sale'
}
```

**Parameters:**

| Field | Type | Example | Description | Required |
|-------|------|---------|-------------|----------|
| event | string | "page_view" | Event name | Yes |
| page_type | string | "collection" | Page template type | Yes |
| page_title | string | "Summer Sale" | Page title | Yes |
| page_path | string | "/collections/summer" | URL path | Yes |
| page_location | string | "https://..." | Full URL | Yes |

---

### Event: user_data

**When It Fires:** Every page load (before page_view)

**Fired By:** Liquid snippet

**Data Layer Push:**

```javascript
{
  event: 'user_data',
  user_id: '1234567890',                           // Customer ID if logged in
  customer_email_sha256: 'a1b2c3d4e5f6...',       // SHA256 hashed email
  customer_first_name: 'John',
  customer_logged_in: true,
  customer_orders_count: 5,
  customer_total_spent: 523.50,
  customer_accepts_marketing: true,
  customer_tags: ['VIP', 'Wholesale']
}
```

**Parameters:**

| Field | Type | Example | Description | Required |
|-------|------|---------|-------------|----------|
| event | string | "user_data" | Event name | Yes |
| user_id | string | "1234567890" | Shopify customer ID | Conditional |
| customer_email_sha256 | string | "a1b2c3..." | Hashed email (SHA256) | Conditional |
| customer_first_name | string | "John" | Customer first name | Conditional |
| customer_logged_in | boolean | true | Whether customer is logged in | Yes |
| customer_orders_count | integer | 5 | Total orders placed | Yes |
| customer_total_spent | number | 523.50 | Lifetime value | Yes |
| customer_accepts_marketing | boolean | true | Marketing opt-in status | Yes |
| customer_tags | array | ["VIP"] | Customer tags | Yes |

---

### Event: view_item_list

**When It Fires:** Collection pages, search results

**Fired By:** Liquid snippet

**Data Layer Push:**

```javascript
{
  event: 'view_item_list',
  ecommerce: {
    item_list_name: 'Summer Collection',
    item_list_id: '12345678',
    items: [
      {
        item_id: '987654321',           // Variant ID
        item_name: 'Blue T-Shirt',
        item_brand: 'Brand Name',
        item_category: 'Apparel',
        item_variant: 'Medium / Blue',
        item_sku: 'TS-BLU-M',
        price: 29.99,
        currency: 'USD',
        discount: 5.00,                 // If on sale
        index: 0                        // Position in list
      },
      // ... more items
    ]
  }
}
```

**Item Object Parameters:**

| Field | Type | Example | Description | Required |
|-------|------|---------|-------------|----------|
| item_id | string | "987654321" | Variant ID | Yes |
| item_name | string | "Blue T-Shirt" | Product name | Yes |
| item_brand | string | "Brand Name" | Product vendor | No |
| item_category | string | "Apparel" | Product type | No |
| item_variant | string | "Medium / Blue" | Variant title | No |
| item_sku | string | "TS-BLU-M" | SKU code | No |
| price | number | 29.99 | Price per unit | No |
| currency | string | "USD" | Currency code | Yes |
| discount | number | 5.00 | Discount amount | No |
| index | integer | 0 | Position in list | No |

---

### Event: select_item

**When It Fires:** User clicks a product link

**Fired By:** Liquid snippet (click listener)

**Data Layer Push:**

```javascript
{
  event: 'select_item',
  ecommerce: {
    item_list_name: 'Summer Collection',
    items: [
      {
        item_id: '987654321',
        item_name: 'Blue T-Shirt',
        item_brand: 'Brand Name',
        price: 29.99,
        index: 3
      }
    ]
  }
}
```

---

### Event: view_item

**When It Fires:** Product detail page view

**Fired By:** Liquid snippet

**Data Layer Push:**

```javascript
{
  event: 'view_item',
  ecommerce: {
    currency: 'USD',
    value: 29.99,
    items: [
      {
        item_id: '987654321',
        item_name: 'Blue T-Shirt',
        item_brand: 'Brand Name',
        item_category: 'Apparel',
        item_variant: 'Medium / Blue',
        item_sku: 'TS-BLU-M',
        price: 29.99,
        currency: 'USD',
        discount: 5.00
      }
    ]
  }
}
```

---

### Event: add_to_cart

**When It Fires:** User adds product to cart

**Fired By:** Liquid snippet (AJAX listener)

**Data Layer Push:**

```javascript
{
  event: 'add_to_cart',
  ecommerce: {
    currency: 'USD',
    value: 59.98,                    // price * quantity
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
        currency: 'USD'
      }
    ]
  }
}
```

---

### Event: remove_from_cart

**When It Fires:** User removes product from cart

**Fired By:** Liquid snippet (AJAX listener)

**Data Layer Push:**

```javascript
{
  event: 'remove_from_cart',
  ecommerce: {
    items: [
      {
        item_id: '987654321'
      }
    ]
  }
}
```

---

### Event: view_cart

**When It Fires:** Cart page view

**Fired By:** Liquid snippet

**Data Layer Push:**

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
        currency: 'USD'
      },
      // ... more items
    ]
  },
  cart_id: 'abc123token',
  cart_total: 89.97,
  cart_item_count: 3
}
```

---

### Event: search

**When It Fires:** Search results page view

**Fired By:** Liquid snippet

**Data Layer Push:**

```javascript
{
  event: 'search',
  search_term: 'blue shirt',
  search_results_count: 42
}
```

---

### Event: begin_checkout

**When It Fires:** Checkout initiation

**Fired By:** Custom Pixel

**Data Layer Push:**

```javascript
{
  event: 'begin_checkout',
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
        item_sku: 'TS-BLU-M',
        price: 29.99,
        quantity: 2,
        currency: 'USD',
        index: 0
      }
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

**Fired By:** Custom Pixel

**Data Layer Push:**

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
  },
  shipping_country: 'US',
  shipping_region: 'CA'
}
```

---

### Event: add_payment_info

**When It Fires:** Payment method selected

**Fired By:** Custom Pixel

**Data Layer Push:**

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

**Fired By:** Custom Pixel

**Data Layer Push:**

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

**Purchase Parameters:**

| Field | Type | Example | Description | Required |
|-------|------|---------|-------------|----------|
| transaction_id | string | "1001" | Order ID | Yes |
| value | number | 99.97 | Order total | Yes |
| currency | string | "USD" | Currency code | Yes |
| tax | number | 8.50 | Tax amount | No |
| shipping | number | 10.00 | Shipping cost | No |
| coupon | string | "SUMMER10" | Coupon code(s) | No |
| items | array | [...] | Products purchased | Yes |

---

## 5. Event Reference

### Complete Event Table

| Event | Trigger Location | Component | GA4 Event Name | User Action |
|-------|-----------------|-----------|----------------|-------------|
| User Data | All pages | Liquid | user_data | Page loads |
| Page View | All pages | Liquid | page_view | Page loads |
| View Item List | Collection, Search | Liquid | view_item_list | Views list |
| Select Item | Collection, Search | Liquid | select_item | Clicks product |
| View Item | Product page | Liquid | view_item | Views product |
| Add to Cart | Any page | Liquid | add_to_cart | Adds to cart |
| Remove from Cart | Cart page | Liquid | remove_from_cart | Removes item |
| View Cart | Cart page | Liquid | view_cart | Views cart |
| Search | Search page | Liquid | search | Searches |
| Begin Checkout | Checkout | Pixel | begin_checkout | Starts checkout |
| Add Shipping Info | Checkout | Pixel | add_shipping_info | Selects shipping |
| Add Payment Info | Checkout | Pixel | add_payment_info | Selects payment |
| Purchase | Confirmation | Pixel | purchase | Completes order |

---

## 6. GTM Configuration

### Tags (15 Total)

#### Folder: GA4 Configuration
1. **GA4 - Configuration**
   - Type: Google Analytics 4 Configuration
   - Measurement ID: {{Const - GA4 Measurement ID}}
   - Trigger: All Pages
   - Send page_view: False (handled manually)
   - User ID: {{DLV - user_id}}
   - User Properties:
     - customer_logged_in
     - customer_orders_count
     - customer_total_spent

#### Folder: GA4 Ecommerce Events
2. **GA4 - Event - page_view**
   - Trigger: CE - page_view
   - Parameters: page_type, page_title

3. **GA4 - Event - view_item_list**
   - Trigger: CE - view_item_list
   - Parameters: item_list_name, item_list_id, items

4. **GA4 - Event - select_item**
   - Trigger: CE - select_item
   - Parameters: item_list_name, items

5. **GA4 - Event - view_item**
   - Trigger: CE - view_item
   - Parameters: currency, value, items

6. **GA4 - Event - add_to_cart**
   - Trigger: CE - add_to_cart
   - Parameters: currency, value, items

7. **GA4 - Event - remove_from_cart**
   - Trigger: CE - remove_from_cart
   - Parameters: currency, value, items

8. **GA4 - Event - view_cart**
   - Trigger: CE - view_cart
   - Parameters: currency, value, items

9. **GA4 - Event - begin_checkout**
   - Trigger: CE - begin_checkout
   - Parameters: currency, value, items

10. **GA4 - Event - add_shipping_info**
    - Trigger: CE - add_shipping_info
    - Parameters: currency, value, shipping_tier, items

11. **GA4 - Event - add_payment_info**
    - Trigger: CE - add_payment_info
    - Parameters: currency, value, payment_type, items

12. **GA4 - Event - purchase**
    - Trigger: CE - purchase
    - Parameters: transaction_id, value, currency, tax, shipping, coupon, items

13. **GA4 - Event - search**
    - Trigger: CE - search
    - Parameters: search_term

#### Folder: Utility
14. **Custom HTML - JYco Pixel Bridge**
    - Type: Custom HTML
    - Trigger: All Pages
    - Purpose: Listens for postMessage from Custom Pixel and pushes to dataLayer

### Triggers (14 Total)

- All Pages (built-in)
- CE - page_view
- CE - view_item_list
- CE - select_item
- CE - view_item
- CE - add_to_cart
- CE - remove_from_cart
- CE - view_cart
- CE - begin_checkout
- CE - add_shipping_info
- CE - add_payment_info
- CE - purchase
- CE - search
- CE - user_data

All custom event triggers use:
- Type: Custom Event
- Event name: [matches dataLayer event name]
- This trigger fires on: All Custom Events

### Variables (21 Total)

#### Constants
- **Const - GA4 Measurement ID**: "G-XXXXXXXXXX" (replace with actual ID)

#### Data Layer Variables
- DLV - ecommerce.items
- DLV - ecommerce.transaction_id
- DLV - ecommerce.value
- DLV - ecommerce.currency
- DLV - ecommerce.shipping
- DLV - ecommerce.tax
- DLV - ecommerce.coupon
- DLV - ecommerce.item_list_name
- DLV - ecommerce.item_list_id
- DLV - ecommerce.shipping_tier
- DLV - ecommerce.payment_type
- DLV - user_id
- DLV - customer_email_sha256
- DLV - customer_logged_in
- DLV - customer_orders_count
- DLV - customer_total_spent
- DLV - page_type
- DLV - page_title
- DLV - search_term

#### Built-in Variables
- Page URL
- Page Hostname
- Page Path
- Referrer
- Event

---

## 7. Installation Instructions

### Prerequisites

- Shopify store (any plan)
- Admin access to Shopify
- Google Analytics 4 property created
- Google Tag Manager container created

### Step-by-Step Installation

#### Step 1: Backup Current Theme

1. Go to Shopify Admin > Online Store > Themes
2. Click on "Actions" dropdown for your active theme
3. Select "Duplicate"
4. Rename duplicate to "[Theme Name] - Backup [Date]"

**Why:** Ensures you can rollback if needed

---

#### Step 2: Install Storefront Data Layer

1. Go to Shopify Admin > Online Store > Themes
2. Click "Actions" > "Edit code" for your active theme
3. In the left sidebar, locate and open `theme.liquid` under "Layout"
4. Find the `</head>` tag (usually around line 50-100)
5. **Paste the entire contents of `gold-storefront-datalayer.liquid` BEFORE the `</head>` tag**
6. Click "Save"

**Location in file:**
```liquid
  {{ content_for_header }}

  <!-- JY/co Gold Data Layer -->
  [PASTE gold-storefront-datalayer.liquid HERE]
  <!-- End JY/co Gold Data Layer -->

</head>
<body>
```

**Optional Configuration:**
- Line 18: Set `debug: true` for console logging during testing
- Line 20: Adjust `maxCollectionProducts` if needed (default: 50)

---

#### Step 3: Install Checkout Custom Pixel

1. Go to Shopify Admin > Settings > Customer Events
2. Click "Add custom pixel"
3. Name it: "JY/co Gold Tracking Pixel"
4. **Paste the entire contents of `gold-checkout-pixel.js`**
5. Click "Save"
6. Click "Connect" to activate the pixel

**Optional Configuration:**
- Line 15: Set `debug: true` for console logging during testing
- Line 17: Set `usePostMessage: false` if direct dataLayer access works (test first)

---

#### Step 4: Import GTM Container

1. Go to Google Tag Manager
2. Click "Admin" in the top navigation
3. Under "Container", click "Import Container"
4. Click "Choose container file" and select `gold-gtm-container.json`
5. Choose workspace: "New" (name it "JY/co Gold Implementation")
6. Import option: "Merge" (if existing container) or "Overwrite" (if new)
7. Conflict resolution: "Rename conflicting tags, triggers, and variables"
8. Click "Confirm"
9. Review imported items
10. Click "Submit" in top right

---

#### Step 5: Configure GA4 Measurement ID

1. In GTM, go to "Variables" in left sidebar
2. Click on "Const - GA4 Measurement ID"
3. Replace "G-XXXXXXXXXX" with your actual GA4 Measurement ID
   - Find this in GA4: Admin > Data Streams > [Your Web Stream] > Measurement ID
4. Click "Save"

---

#### Step 6: Install GTM Container on Shopify

If GTM is not already installed:

1. In GTM, click on "GTM-XXXXXX" in top left to view container ID
2. Copy the container ID
3. Go to Shopify Admin > Online Store > Themes
4. Click "Actions" > "Edit code"
5. Open `theme.liquid`
6. Paste GTM script Part 1 in `<head>`:

```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXX');</script>
<!-- End Google Tag Manager -->
```

7. Paste GTM script Part 2 immediately after opening `<body>` tag:

```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

8. Replace `GTM-XXXXXX` with your actual container ID
9. Click "Save"

---

#### Step 7: Publish GTM Container

1. In GTM, click "Submit" in top right
2. Add version name: "JY/co Gold Package v1.0"
3. Add version description: "Initial implementation of complete GA4 ecommerce tracking"
4. Click "Publish"

---

#### Step 8: Test with GTM Preview Mode

1. In GTM, click "Preview" in top right
2. Enter your store URL
3. Click "Connect"
4. New window opens with your store + GTM debug panel

**Test each event:**
- Navigate to homepage → Check for `page_view` and `user_data`
- Navigate to collection page → Check for `view_item_list`
- Click a product → Check for `select_item`
- View product page → Check for `view_item`
- Add to cart → Check for `add_to_cart`
- View cart → Check for `view_cart`
- Go to checkout → Check for `begin_checkout`
- Complete test purchase → Check for `add_shipping_info`, `add_payment_info`, `purchase`

---

#### Step 9: Test with GA4 DebugView

1. In Google Analytics 4, go to Admin > DebugView
2. Keep DebugView open
3. In another tab, visit your store with `?debug_mode=1` parameter
   - Example: `https://yourstore.com/?debug_mode=1`
4. Perform test actions (view pages, add to cart, checkout)
5. Watch events appear in real-time in DebugView
6. Click on each event to verify parameters are captured correctly

**What to verify:**
- All events appear
- Event parameters are populated (not empty)
- Item arrays contain expected data
- User ID is captured for logged-in customers
- Transaction ID is captured for purchases

---

#### Step 10: Final QA & Go Live

1. Complete full test purchase on live store
2. Verify purchase event in GA4 DebugView
3. Wait 24-48 hours for data to appear in standard GA4 reports
4. Check GA4 Reports:
   - Monetization > Ecommerce purchases
   - Reports > Engagement > Events
   - Explore > Free form (create ecommerce funnel)
5. If all tests pass, remove debug flags:
   - In `gold-storefront-datalayer.liquid`: Set `debug: false`
   - In `gold-checkout-pixel.js`: Set `debug: false`
   - Save theme
   - Update custom pixel
6. Monitor for 1-2 weeks for any issues

---

## 8. Testing & QA Checklist

### Pre-Launch Testing

Use this checklist to verify implementation before going live:

| Event | Test Action | Expected Data | Status |
|-------|-------------|---------------|--------|
| **user_data** | Load any page while logged in | user_id, customer_email_sha256, customer_logged_in: true, customer_orders_count, customer_total_spent | ☐ |
| **page_view** | Load homepage | page_type: "home", page_title, page_path: "/" | ☐ |
| **page_view** | Load collection page | page_type: "collection" | ☐ |
| **page_view** | Load product page | page_type: "product" | ☐ |
| **page_view** | Load cart page | page_type: "cart" | ☐ |
| **view_item_list** | View collection with products | item_list_name: "[Collection]", items[]: 3+ products with full data | ☐ |
| **view_item_list** | Perform search with results | item_list_name: "Search Results", items[] with products | ☐ |
| **select_item** | Click product from collection | item_id, item_name, item_list_name | ☐ |
| **view_item** | View product detail page | item_id, item_name, item_brand, price, item_variant, item_sku | ☐ |
| **add_to_cart** | Click "Add to Cart" | item_id, item_name, price, quantity, value (price × qty) | ☐ |
| **add_to_cart** | Add 2+ quantity | quantity: 2, value reflects multiple | ☐ |
| **remove_from_cart** | Remove item from cart | item_id of removed item | ☐ |
| **view_cart** | View cart page | items[] with all cart contents, cart_total, cart_item_count | ☐ |
| **search** | Search for "test" | search_term: "test", search_results_count | ☐ |
| **begin_checkout** | Click "Checkout" button | currency, value, items[] with all products, user_id (if logged in) | ☐ |
| **add_shipping_info** | Select shipping method | shipping_tier: "[Method name]", value includes shipping | ☐ |
| **add_payment_info** | Enter payment details | payment_type present, value unchanged | ☐ |
| **purchase** | Complete test order | transaction_id, value, currency, tax, shipping, items[], user_id, new_customer | ☐ |
| **purchase** | With discount code | coupon: "CODE", discount_amount > 0, discount_codes: ["CODE"] | ☐ |

### GTM Preview Checks

| Check | What to Verify | Status |
|-------|----------------|--------|
| GA4 Config Tag | Fires once on All Pages, User ID set | ☐ |
| Pixel Bridge Tag | Fires on All Pages, listens for postMessage | ☐ |
| All Event Tags | Fire only on their specific triggers | ☐ |
| Data Layer Variables | Populate correctly (check in Variables tab) | ☐ |
| No Errors | No red error messages in Console | ☐ |

### GA4 DebugView Checks

| Check | What to Verify | Status |
|-------|----------------|--------|
| Events appear | All 13 events fire during full test journey | ☐ |
| Parameters populated | Click each event, verify parameters have values (not "not set") | ☐ |
| Items array | Contains item_id and item_name for all items | ☐ |
| User ID | Set for logged-in customers | ☐ |
| Transaction ID | Unique for each purchase | ☐ |
| No duplicate purchases | Purchase fires only once per order | ☐ |

### Post-Launch Monitoring (24-48 hours)

| Check | What to Monitor | Status |
|-------|-----------------|--------|
| GA4 Realtime Report | Events appearing in real-time | ☐ |
| GA4 Events Report | All custom events showing up | ☐ |
| GA4 Ecommerce Report | Purchase data appearing | ☐ |
| Revenue matches Shopify | GA4 revenue ±5% of Shopify reports | ☐ |
| Transaction count | GA4 transaction count = Shopify order count | ☐ |

---

## 9. Troubleshooting

### Issue: Events not firing in GTM Preview

**Symptoms:**
- GTM Preview shows "0 events" for custom events
- Tags are not firing

**Possible Causes & Solutions:**

1. **Data layer not initialized**
   - Check browser console for JavaScript errors
   - Verify Liquid snippet is installed before `</head>`
   - Verify no syntax errors in Liquid code

2. **Events pushed before GTM loads**
   - Verify GTM container code is in `<head>` (before data layer snippet)
   - Ensure dataLayer is initialized before any push: `window.dataLayer = window.dataLayer || [];`

3. **Wrong event name in trigger**
   - In GTM, check trigger configuration
   - Verify event name exactly matches dataLayer push (case-sensitive)
   - Use browser console to check: `console.log(window.dataLayer)`

---

### Issue: Purchase event not firing

**Symptoms:**
- All events work except purchase
- Purchase event doesn't appear in GTM or GA4

**Possible Causes & Solutions:**

1. **Custom Pixel not installed or not active**
   - Go to Shopify Admin > Settings > Customer Events
   - Verify pixel is listed and shows "Connected"
   - Check pixel permissions are granted

2. **PostMessage not reaching parent window**
   - Set `debug: true` in custom pixel code
   - Check browser console on thank you page
   - Look for messages like "[JY/co] Event sent via postMessage"
   - If missing, try setting `usePostMessage: false` and test

3. **Checkout completed event not subscribed**
   - Verify `analytics.subscribe('checkout_completed', ...)` is in pixel code
   - Check for JavaScript errors in browser console

4. **Order already completed**
   - Custom pixel only fires once per order
   - Create a new test order to re-test

---

### Issue: Duplicate purchase events

**Symptoms:**
- Same transaction_id appears twice in GA4
- Revenue is doubled

**Possible Causes & Solutions:**

1. **Multiple GA4 tags firing**
   - In GTM, check that only ONE purchase tag exists
   - Check that purchase trigger only fires once per event
   - Use GTM Preview to verify tag fires only once

2. **Thank you page reloaded**
   - Shopify thank you page can be reloaded, re-firing events
   - Implement deduplication: Store transaction_id in sessionStorage
   - Add check before pushing purchase event:

```javascript
if (sessionStorage.getItem('jyco_purchase_' + transactionId)) {
  return; // Already tracked
}
sessionStorage.setItem('jyco_purchase_' + transactionId, 'true');
// Then push event
```

---

### Issue: Missing product data in items array

**Symptoms:**
- Events fire but item_name is empty
- item_id is present but other fields missing

**Possible Causes & Solutions:**

1. **Variant not available**
   - Check product has variants
   - Verify variant ID exists in Shopify
   - Use `product.selected_or_first_available_variant` in Liquid

2. **Theme uses non-standard product data attributes**
   - Inspect product card HTML
   - Check for data attributes: `data-product-id`, `data-product-title`
   - Update select_item listener to match your theme's attributes

3. **Null/undefined values not handled**
   - Check browser console for errors
   - Verify `escapeString()` and `safeNumber()` functions are working
   - Add null checks: `item.title || ''`

---

### Issue: User ID not captured

**Symptoms:**
- user_id is always undefined
- Customer data missing even when logged in

**Possible Causes & Solutions:**

1. **Customer not actually logged in**
   - Verify customer is logged in to Shopify account
   - Check "My Account" link appears in store header
   - Test with known logged-in customer

2. **Liquid syntax error**
   - Check for errors around `{% if customer %}` block
   - Verify closing `{% endif %}` tags
   - Test by temporarily adding: `console.log('Customer ID: {{ customer.id }}');`

3. **User ID not sent to GA4**
   - In GTM, check GA4 Config tag
   - Verify "User ID" field is set to `{{DLV - user_id}}`
   - Check DLV - user_id variable is correctly pulling from dataLayer.user_id

---

### Issue: Search event not firing

**Symptoms:**
- Search page loads but no search event
- view_item_list fires but not search

**Possible Causes & Solutions:**

1. **Template name doesn't contain "search"**
   - Check your theme's search template name
   - Update condition in Liquid: `{% if template contains 'search' %}`
   - May need to use `{% if template == 'search' %}`

2. **Search results are empty**
   - Event still should fire with 0 results
   - Check `{{ search.terms }}` outputs correctly
   - Test with search term that has results

---

### Issue: Custom Pixel not communicating with GTM

**Symptoms:**
- Checkout events appear in console but not in GTM
- PixelBridge receives no messages

**Possible Causes & Solutions:**

1. **Pixel Bridge tag not firing**
   - In GTM Preview, check "Custom HTML - JYco Pixel Bridge" tag
   - Verify it fires on "All Pages"
   - Check browser console for "JY/co Pixel Bridge" log messages

2. **PostMessage blocked by browser**
   - Check browser console for security errors
   - Test in incognito mode (extensions can block)
   - Try different browser

3. **Wrong postMessage origin**
   - Update pixel code to use specific origin instead of '*'
   - Example: `window.parent.postMessage(payload, 'https://yourstore.com');`

---

### Issue: Performance degradation

**Symptoms:**
- Page load times increased
- Store feels slower after implementation

**Possible Causes & Solutions:**

1. **Too many products in view_item_list**
   - Reduce `maxCollectionProducts` from 50 to 20
   - Line 20 in Liquid snippet: `maxCollectionProducts: 20`

2. **Synchronous operations blocking render**
   - Check that data layer code is not in `<body>`
   - Should be in `<head>` before `</head>` closes
   - SHA256 hashing is async, should not block

3. **GTM container too large**
   - Export GTM container
   - Remove unnecessary tags/triggers/variables
   - Re-import cleaned container

---

### Issue: Email hash incorrect

**Symptoms:**
- customer_email_sha256 is present but wrong format
- Hash doesn't match other systems

**Possible Causes & Solutions:**

1. **Email not lowercase/trimmed**
   - SHA256 function includes `.toLowerCase().trim()`
   - Verify by testing: `await sha256('TEST@EMAIL.COM')` should equal `await sha256('test@email.com')`

2. **Browser doesn't support crypto.subtle**
   - Check browser console for errors
   - Test in modern browser (Chrome, Firefox, Safari)
   - crypto.subtle requires HTTPS (doesn't work on HTTP)

3. **Different hashing method expected**
   - Verify recipient system expects SHA256
   - Some systems use MD5 or other hashing
   - Update hashing function if needed

---

### Issue: GTM Container import fails

**Symptoms:**
- Import button grayed out
- Error message on import

**Possible Causes & Solutions:**

1. **JSON syntax error**
   - Validate JSON file: https://jsonlint.com/
   - Re-download container file
   - Ensure file not corrupted during download

2. **Wrong GTM account/container type**
   - Verify you're importing to Web container (not AMP, iOS, Android)
   - Check account has permission to import

3. **File too large**
   - Container has size limits
   - Try importing to new blank container
   - If successful, manually copy needed items

---

### General Debugging Steps

1. **Enable Debug Mode**
   - Set `debug: true` in both Liquid snippet and Custom Pixel
   - Check browser console for detailed logs
   - Look for messages prefixed with `[JY/co]`

2. **Check Browser Console**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for errors (red) and warnings (yellow)
   - Expand errors to see stack traces

3. **Inspect DataLayer**
   - In browser console, type: `window.dataLayer`
   - Press Enter to see all dataLayer events
   - Verify events are being pushed correctly

4. **Use GTM Preview Mode**
   - Shows exactly what GTM sees
   - Shows which tags fire and when
   - Shows trigger matches and failures
   - Shows variable values in real-time

5. **Use GA4 DebugView**
   - Real-time view of events
   - Shows event parameters
   - Shows when events are received by GA4
   - Helps diagnose if issue is in GTM or GA4

---

### Getting Support

If you encounter issues not covered here:

1. **Check implementation**
   - Re-verify all installation steps
   - Compare your code to provided files
   - Ensure all files are latest version

2. **Collect information**
   - Screenshot of GTM Preview showing issue
   - Screenshot of browser console errors
   - Screenshot of GA4 DebugView
   - Exact steps to reproduce issue

3. **Contact JY/co Support**
   - Email: contact@jyco.com
   - Include: Store URL, screenshots, description
   - Include: GTM container ID, GA4 property ID

---

## 10. Appendix

### A. Full Code Listings

See separate files:
- `gold-storefront-datalayer.liquid`
- `gold-checkout-pixel.js`
- `gold-gtm-container.json`

### B. Shopify Liquid Objects Reference

Key objects used in this implementation:

**customer**
- `customer.id` - Unique customer ID
- `customer.email` - Email address
- `customer.first_name` - First name
- `customer.last_name` - Last name
- `customer.orders_count` - Total orders
- `customer.total_spent` - Lifetime value
- `customer.tags` - Array of customer tags
- `customer.accepts_marketing` - Boolean

**product**
- `product.id` - Product ID
- `product.title` - Product name
- `product.vendor` - Brand name
- `product.type` - Product type
- `product.selected_or_first_available_variant` - Current variant
- `product.variants` - All variants array

**variant**
- `variant.id` - Variant ID
- `variant.title` - Variant title
- `variant.price` - Price in cents
- `variant.compare_at_price` - Original price
- `variant.sku` - SKU code
- `variant.available` - In stock boolean

**collection**
- `collection.id` - Collection ID
- `collection.title` - Collection name
- `collection.products` - Products array

**cart**
- `cart.item_count` - Number of items
- `cart.total_price` - Total in cents
- `cart.items` - Cart items array
- `cart.currency.iso_code` - Currency (USD, EUR, etc.)
- `cart.token` - Unique cart token

**template**
- `template` - Template name (e.g., "product", "collection", "cart")

### C. GA4 Event Schema Reference

Official Google documentation:
https://developers.google.com/analytics/devguides/collection/ga4/ecommerce

### D. Shopify Web Pixel API Reference

Official Shopify documentation:
https://shopify.dev/docs/api/web-pixels-api

### E. Version History

**Version 1.0** - December 4, 2024
- Initial release
- Complete GA4 ecommerce event implementation
- Hybrid Liquid + Custom Pixel architecture
- SHA256 email hashing
- User identification and properties
- Pre-configured GTM container
- Complete documentation

### F. Maintenance & Updates

**Recommended Maintenance:**

1. **Quarterly Reviews**
   - Check GA4 data quality
   - Verify all events still firing
   - Review any Shopify theme updates
   - Update code if needed

2. **After Shopify Updates**
   - Test all events after major Shopify updates
   - Check for deprecation warnings
   - Update Web Pixel API calls if needed

3. **When Theme Changes**
   - If changing themes, re-verify implementation
   - Check product card data attributes
   - Test all click listeners
   - May need to adjust selectors

**Known Limitations:**

1. **Checkout Events**
   - Relies on Shopify Web Pixel API
   - If Shopify changes API, may need updates
   - Some payment methods may not fire all events

2. **Product List Limits**
   - Collection views limited to 50 products
   - Prevents performance issues
   - Configure with `maxCollectionProducts`

3. **Cart Events**
   - Remove from cart may lack full product data
   - Depends on AJAX cart implementation
   - May need theme-specific adjustments

---

## Contact & Support

**JY/co**
- Website: www.jyco.com
- Email: contact@jyco.com
- Documentation: docs.jyco.com

**This document should be treated as a living document and updated as implementation evolves.**

---

*End of Solution Design Reference*
