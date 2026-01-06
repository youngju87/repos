# JY Insights Gold Plus Package
## Solution Design Reference

**Version:** 1.4
**Date:** January 6, 2026
**Package:** Gold Plus
**Prepared by:** JY Insights

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Event Reference](#event-reference)
4. [Data Layer Specification](#data-layer-specification)
5. [Implementation Details](#implementation-details)
6. [GTM Configuration](#gtm-configuration)
7. [Testing & QA](#testing--qa)
8. [Troubleshooting](#troubleshooting)

---

## 1. Executive Summary

### Overview

The JY Insights Gold Plus Package is a streamlined, GA4-compliant analytics tracking solution for Shopify stores. It focuses on correctness, simplicity, and preservation of dataLayer state—making it compatible with other tracking scripts and easy to maintain.

### Core Principles

1. **GA4 Compliance**: Uses official GA4 event names and ecommerce schema
2. **dataLayer Preservation**: Never clears or overwrites `window.dataLayer`
3. **Minimal Changes**: Focused, intentional code with no unnecessary complexity
4. **Theme Compatibility**: Optimized for Hyper 2.0 with configurable selectors
5. **Zero Dependencies**: Pure JavaScript, no external libraries

### What's Included

- **Storefront Data Layer** (`gold-storefront-datalayer-GA4.liquid`) - v1.3, ~1485 lines
- **Checkout Custom Pixel** (`gold-checkout-pixel-GA4.js`) - v1.4, ~620 lines
- **GTM Container** (`gold-gtm-container-ga4.json`) - 13 tags, 12 triggers, 23 variables
- **GTM Import Guide** (`GTM-IMPORT-GUIDE.md`) - Step-by-step import instructions
- **Documentation** - This SDR + README.md

### Tracked Events

**Storefront (10 events)**:
- user_data_ready, page_data_ready, page_view, view_item_list, view_item, select_item, add_to_cart, remove_from_cart, view_cart, search

**Checkout (8 events)**:
- user_data_ready, page_data_ready, page_view, begin_checkout, add_contact_info, add_shipping_info (×2), add_payment_info, purchase

**Enhanced Data Collection**:
- Coupon codes (transaction-level and item-level discounts)
- Marketing opt-in status (`accepts_marketing`)
- Payment method names (from `checkout.paymentMethod.name`)
- Shipping tiers (from Checkout Extensibility `delivery.selectedDeliveryOptions`)
- SHA-256 hashed email and phone for Enhanced Conversions
- Item-level discount amounts
- List attribution persistence (item_list_id, item_list_name from storefront to checkout via sessionStorage)
- Quick view tracking with view_type parameter ('quick_view' vs 'pdp')
- Add to cart context parameter ('pdp', 'quick_view', 'collection_quick_add')
- Search term in item_list_name (e.g., 'Search: team lead')

---

## 2. Architecture Overview

### Hybrid Implementation

```
┌─────────────────────────────────────────────────┐
│           SHOPIFY STOREFRONT                     │
│     (Home, Collections, Products, Cart)          │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│     LIQUID SNIPPET (theme.liquid)                │
│  • Initialize dataLayer (preserve existing)      │
│  • Push GA4 events (ONLY push, never reassign)   │
│  • Hyper 2.0 optimized selectors                 │
│  • Fetch-based add_to_cart tracking              │
│  • MutationObserver for cart drawer              │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│          window.dataLayer                        │
│     (Array of event objects)                     │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│       GOOGLE TAG MANAGER                         │
│  • Route events to GA4                           │
│  • Transform data layer variables                │
│  • Set user properties                           │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│       GOOGLE ANALYTICS 4                         │
└─────────────────────────────────────────────────┘

                 +

┌─────────────────────────────────────────────────┐
│           SHOPIFY CHECKOUT                       │
│  (Customer info, Shipping, Payment, Confirm)     │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│      CUSTOM PIXEL (Web Pixel API)                │
│  • Subscribe to checkout events                  │
│  • Format data to GA4 schema                     │
│  • Push to window.dataLayer (preserve state)     │
│  • SHA-256 email hashing                         │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
           window.dataLayer → GTM → GA4
```

### Why Hybrid?

**Liquid Advantages:**
- Full access to Shopify objects (customer, product, cart, collection)
- Access to metafields
- Synchronous page load execution

**Custom Pixel Advantages:**
- Only way to track checkout events
- Shopify's official tracking method
- Access to order completion data

### Critical Architecture Rules

✅ **DO**:
- Use `window.dataLayer = window.dataLayer || []` to initialize
- Use `window.dataLayer.push({})` to add events
- Use GA4 event names (`add_to_cart`, `purchase`)
- Use GA4 ecommerce schema (`ecommerce.items[]`)

❌ **DON'T**:
- Reassign dataLayer: `window.dataLayer = []`
- Clear dataLayer: `window.dataLayer.length = 0`
- Use UA event names: `ee_addToCart`, `ee_purchase`
- Use parallel arrays: `product_id: [], product_name: []`

---

## 3. Event Reference

### Event Summary Table

| Event | Trigger | GA4 Standard | Storefront | Checkout | Enhanced Data |
|-------|---------|--------------|------------|----------|---------------|
| user_data_ready | Page load | Custom | ✓ | ✓ | SHA-256 email/phone, orders_count |
| page_data_ready | Page load | Custom | ✓ | ✓ | page_type, currency, language |
| page_view | Page load | ✓ | ✓ | ✓ | context flag (storefront/checkout) |
| view_item_list | Collection/search page | ✓ | ✓ | | item_list_id, item_list_name |
| select_item | Product click | ✓ | ✓ | | Source list tracking |
| view_item | Product page | ✓ | ✓ | | Full variant data |
| add_to_cart | Add to cart | ✓ | ✓ | | Price × quantity |
| remove_from_cart | Remove from cart | ✓ | ✓ | | Item value |
| view_cart | Cart page/drawer | ✓ | ✓ | | cart_type parameter |
| begin_checkout | Checkout start | ✓ | | ✓ | Coupon codes |
| add_contact_info | Email entered | ✓ | | ✓ | SHA-256 hashed |
| add_shipping_info | Shipping selected | ✓ | | ✓ (×2) | shipping_tier, coupon |
| add_payment_info | Payment selected | ✓ | | ✓ | payment_type, coupon |
| purchase | Order complete | ✓ | | ✓ | Item discounts, coupon |
| search | Search query | ✓ | ✓ | | search_term |

---

## 4. Data Layer Specification

### GA4 Ecommerce Item Schema

All product items follow this structure:

```javascript
{
  item_id: "40123456789",           // Required: Variant ID
  item_name: "Blue T-Shirt",        // Required: Product name
  currency: "USD",                  // Required: Currency code
  index: 0,                         // Optional: Position in list

  // Optional but recommended
  product_id: "6789012345",         // Shopify product ID
  variant_id: "40123456789",        // Shopify variant ID
  item_brand: "Brand Name",         // Product vendor
  item_category: "Apparel",         // Product type
  item_variant: "Medium / Blue",    // Variant title
  price: 29.99,                     // Final price
  quantity: 1,                      // Quantity
  sku: "TS-BLU-M",                  // SKU code

  // Google Ads integration
  g_product_id: "shopify_US_6789012345_40123456789"
}
```

### Event: page_view

**When**: Every page load (storefront and checkout)

**Fired by**: Liquid snippet, Custom Pixel

```javascript
{
  event: 'page_view',
  page_type: 'product',             // Template type
  page_title: 'Blue T-Shirt',
  customer_logged_in: true,
  user_id: '1234567890'             // If logged in
}
```

### Event: view_item_list

**When**: Collection or search results page view

**Fired by**: Liquid snippet

```javascript
{
  event: 'view_item_list',
  ecommerce: {
    item_list_id: '123456789',
    item_list_name: 'Summer Collection',
    items: [
      {
        item_id: '40123456789',
        item_name: 'Blue T-Shirt',
        item_brand: 'Brand Name',
        item_category: 'Apparel',
        price: 29.99,
        currency: 'USD',
        product_id: '6789012345',
        variant_id: '40123456789',
        g_product_id: 'shopify_US_6789012345_40123456789',
        index: 0
      }
      // ... more items (up to 50)
    ]
  }
}
```

### Event: select_item

**When**: User clicks a product link in collection or search

**Fired by**: Liquid snippet (click listener)

```javascript
{
  event: 'select_item',
  ecommerce: {
    item_list_id: '123456789',
    item_list_name: 'Summer Collection',
    items: [{
      item_id: '40123456789',
      item_name: 'Blue T-Shirt',
      item_brand: 'Brand Name',
      price: 29.99,
      currency: 'USD',
      product_id: '6789012345',
      variant_id: '40123456789',
      index: 3
    }]
  }
}
```

### Event: view_item

**When**: Product detail page view OR quick view modal opened

**Fired by**: Liquid snippet

**Enhanced Parameters**:
- `view_type`: Distinguishes between full product page and quick view modal
  - `'pdp'` - Product detail page (full page)
  - `'quick_view'` - Quick view modal from collection/search page
- `item_list_id` / `item_list_name`: Included when viewing from quick view (persists to checkout via sessionStorage)

```javascript
{
  event: 'view_item',
  view_type: 'quick_view',        // 'pdp' or 'quick_view'
  ecommerce: {
    currency: 'USD',
    value: 29.99,
    items: [{
      item_id: '40123456789',
      item_name: 'Blue T-Shirt',
      item_brand: 'Brand Name',
      item_category: 'Apparel',
      item_variant: 'Medium / Blue',
      price: 29.99,
      currency: 'USD',
      product_id: '6789012345',
      variant_id: '40123456789',
      g_product_id: 'shopify_US_6789012345_40123456789',
      sku: 'TS-BLU-M',
      item_list_id: '123456789',  // If opened from quick view
      item_list_name: 'Summer Collection', // If opened from quick view
      index: 2                     // Position in list (if from quick view)
    }]
  }
}
```

### Event: add_to_cart

**When**: User adds product to cart

**Fired by**: Liquid snippet (click event listener + product fetch)

**Enhanced Parameters**:
- `context`: Indicates where the add_to_cart originated
  - `'pdp'` - Product detail page
  - `'quick_view'` - Quick view modal on collection/search pages
  - `'collection_quick_add'` - Quick-add button on collection pages
- `item_list_id` / `item_list_name`: Included when added from collection/search (persists to checkout via sessionStorage)

```javascript
{
  event: 'add_to_cart',
  context: 'quick_view',          // 'pdp', 'quick_view', or 'collection_quick_add'
  ecommerce: {
    currency: 'USD',
    value: 59.98,                 // price × quantity
    items: [{
      item_id: '40123456789',
      item_name: 'Blue T-Shirt',
      item_brand: 'Brand Name',
      item_category: 'Apparel',
      item_variant: 'Medium / Blue',
      price: 29.99,
      quantity: 2,
      currency: 'USD',
      product_id: '6789012345',
      variant_id: '40123456789',
      sku: 'TS-BLU-M',
      g_product_id: 'shopify_US_6789012345_40123456789',
      item_list_id: '123456789',  // If added from collection/search
      item_list_name: 'Summer Collection' // If added from collection/search
    }]
  }
}
```

### Event: remove_from_cart

**When**: User removes product from cart

**Fired by**: Liquid snippet (click listener)

```javascript
{
  event: 'remove_from_cart',
  ecommerce: {
    currency: 'USD',
    value: 29.99,
    items: [{
      item_id: '40123456789',
      item_name: 'Blue T-Shirt',
      price: 29.99,
      quantity: 1,
      currency: 'USD'
    }]
  }
}
```

### Event: view_cart

**When**: Cart page view or cart drawer opens

**Fired by**: Liquid snippet

```javascript
{
  event: 'view_cart',
  cart_type: 'drawer',              // 'drawer' or undefined (main cart)
  ecommerce: {
    currency: 'USD',
    value: 89.97,
    items: [
      // ... cart items
    ]
  }
}
```

### Event: begin_checkout

**When**: Checkout started (checkout page loads)

**Fired by**: Custom Pixel (checkout only - v1.1 removed storefront duplicate)

```javascript
{
  event: 'begin_checkout',
  ecommerce: {
    currency: 'USD',
    value: 89.97,
    coupon: 'SUMMER10',              // NEW in v1.3
    items: [
      {
        item_id: '40123456789',
        item_name: 'Blue T-Shirt',
        price: 29.99,
        quantity: 2,
        discount: 3.00,                // NEW in v1.3 (item-level)
        // ... other fields
      }
    ]
  }
}
```

### Event: search / view_search_results

**When**: Search results page view

**Fired by**: Liquid snippet

```javascript
// Basic search event
{
  event: 'search',
  search_term: 'blue shirt'
}

// Enhanced with results
{
  event: 'view_search_results',
  search_term: 'blue shirt',
  ecommerce: {
    items: [
      // ... product results
    ]
  }
}
```

### Event: add_shipping_info

**When**: Shipping method selected in checkout (fires TWICE per Shopify API behavior)

**Fired by**: Custom Pixel

**New in v1.3**: Uses Checkout Extensibility API (`checkout.delivery.selectedDeliveryOptions`)

```javascript
{
  event: 'add_shipping_info',
  ecommerce: {
    currency: 'USD',
    value: 89.97,
    shipping_tier: 'Standard Shipping',  // From delivery.selectedDeliveryOptions[0].title
    coupon: 'SUMMER10',                   // NEW in v1.3
    items: [
      {
        item_id: '40123456789',
        item_name: 'Blue T-Shirt',
        discount: 3.00,                   // NEW in v1.3
        // ... other fields
      }
    ]
  }
}
```

**Note**: This event fires twice due to Shopify's checkout_shipping_info_submitted event behavior. This is expected.

### Event: add_payment_info

**When**: Payment method selected in checkout

**Fired by**: Custom Pixel

**New in v1.3**: Captures actual payment method name from `checkout.paymentMethod.name`

```javascript
{
  event: 'add_payment_info',
  ecommerce: {
    currency: 'USD',
    value: 89.97,
    payment_type: 'Visa',                // NEW in v1.3 (actual payment method)
    coupon: 'SUMMER10',                   // NEW in v1.3
    items: [
      {
        item_id: '40123456789',
        item_name: 'Blue T-Shirt',
        discount: 3.00,                   // NEW in v1.3
        // ... other fields
      }
    ]
  }
}
```

**Fallback**: If `checkout.paymentMethod.name` is unavailable, falls back to `checkout.transactions[0].gateway`.

### Event: purchase

**When**: Order completed (thank you page)

**Fired by**: Custom Pixel

**New in v1.3**: Item-level discount tracking, marketing opt-in, enhanced user data

```javascript
{
  event: 'purchase',
  ecommerce: {
    transaction_id: '1001',
    affiliation: 'Shopify',              // NEW in v1.3
    currency: 'USD',
    value: 99.97,
    tax: 8.50,
    shipping: 10.00,
    coupon: 'SUMMER10,FIRST10',          // Comma-separated if multiple
    items: [
      {
        item_id: '40123456789',
        item_name: 'Blue T-Shirt',
        item_brand: 'Brand Name',
        item_category: 'Apparel',
        item_variant: 'Medium / Blue',
        price: 29.99,
        quantity: 2,
        discount: 3.00,                   // NEW in v1.3 (item-level)
        currency: 'USD',
        product_id: '6789012345',
        variant_id: '40123456789',
        g_product_id: 'shopify_US_6789012345_40123456789',
        sku: 'TS-BLU-M'
      }
      // ... more items
    ]
  },
  user_data: {                            // NEW in v1.3 (for Enhanced Conversions)
    email_sha256: '...',                  // SHA-256 hashed
    phone_sha256: '...',                  // SHA-256 hashed
    accepts_marketing: true,              // Marketing opt-in status
    city: 'san francisco',
    state: 'CA',
    country: 'US',
    zip: '94102'
  }
}
```

---

## 5. Implementation Details

### Storefront Data Layer Features

**Initialize dataLayer (Line 40)**
```javascript
// NEVER reassigns if dataLayer already exists
window.dataLayer = window.dataLayer || [];
```

**Configurable Selectors (Lines 48-86)**
```javascript
selectors: {
  cartDrawer: ['cart-drawer', '#CartDrawer', '.cart-drawer'],
  addToCartButton: ['button[name="add"]', ...],
  removeButton: ['cart-remove-button', ...],
  checkoutButton: ['button[name="checkout"]', ...],
  productLink: 'a[href*="/products/"]'
}
```

**Fetch Interceptor for Add to Cart (Lines 562-606)**
- Wraps `window.fetch` to detect `/cart/add` requests
- Reads response data to get product details
- Pushes `add_to_cart` event with GA4 schema

**Cart Drawer Tracking (Lines 613-696)**
- MutationObserver watches for drawer visibility changes
- Listens for custom `cart:refresh` event (Hyper 2.0)
- Debounces to prevent duplicate events
- Pushes `view_cart` with `cart_type: 'drawer'`

**Click Event Delegation (Lines 352-377)**
- Single click listener on document
- Uses `event.path` or `event.composedPath()`
- Matches selectors from CONFIG
- Handles checkout, remove from cart, product clicks

**List Attribution Persistence (Lines 217-236)**
- Saves `item_list_id` and `item_list_name` to sessionStorage when users interact with products
- Triggered on: `select_item`, quick view opens, and collection quick-add
- Format: `{ "variantId": { item_list_id, item_list_name, timestamp } }`
- Persists through storefront → checkout journey
- Enables revenue attribution by source collection/search in GA4
- Includes sessionStorage availability detection for privacy mode compatibility

**Quick View Tracking (Lines 657-746)**
- Detects quick view button clicks via `aria-controls` attribute
- Fires `view_item` with `view_type: 'quick_view'` parameter
- Includes list attribution (`item_list_id`, `item_list_name`, `index`)
- Saves attribution to sessionStorage for checkout tracking
- Handles both collection and search page quick views

**Quick View Add to Cart (Lines 603-655)**
- Detects add to cart from quick view modal vs regular page
- Fetches full product data via Shopify `/products/{handle}.js` API
- Extracts product handle from `product-info[data-url]` element
- Includes `context: 'quick_view'` parameter
- Includes list attribution from sessionStorage
- Fires complete GA4 event with all product fields

**Search Term in List Names (Lines 1085-1086, 1105-1106)**
- Dynamically includes search term in `item_list_name`
- Format: `"Search: team lead"` instead of generic `"Search Results"`
- Enables search term attribution in GA4 revenue reports

### Checkout Pixel Features

**SHA-256 Email Hashing (Lines 73-84)**
```javascript
async function sha256(value) {
  // Uses crypto.subtle.digest for secure hashing
  // Returns hex string
}
```

**Line Item Formatting (Lines 163-200)**
- Converts Shopify checkout items to GA4 schema
- Handles Shopify amount objects
- Adds Google Ads product ID
- Reads list attribution from sessionStorage (added in v1.4)
- Includes `item_list_id` and `item_list_name` when available
- Returns array of GA4 items

**List Attribution Retrieval (Lines 141-161)**
- Reads list attribution from sessionStorage saved by storefront
- Includes sessionStorage availability check
- Returns `item_list_id` and `item_list_name` for revenue attribution
- Enables tracking which collection/search led to purchase

**Event Deduplication (Lines 184-186, 245-247, 281-283)**
- Flags to prevent duplicate events
- Shipping and payment info only fire once per session

### Hyper 2.0 Specific Optimizations

**Custom Elements:**
- `cart-drawer` - Main cart drawer element
- `quantity-selector` - Quantity input wrapper
- `cart-remove-button` - Remove button element

**Custom Events:**
- `cart:refresh` - Fired when cart updates

**Button Selectors:**
- `button[name="minus"]` - Decrease quantity
- `button[name="plus"]` - Increase quantity
- `button[name="add"]` - Add to cart
- `button[name="checkout"]` - Proceed to checkout

---

## 6. GTM Configuration

### Tags (Minimum Required)

1. **GA4 - Configuration**
   - Type: GA4 Configuration
   - Measurement ID: {{Const - GA4 Measurement ID}}
   - Trigger: All Pages
   - Send page_view: False (handled by code)
   - User Properties: customer_logged_in, customer_orders_count, customer_total_spent

2. **GA4 - Event - page_view**
   - Type: GA4 Event
   - Event Name: page_view
   - Trigger: CE - page_view
   - Parameters: page_type, page_title

3. **GA4 - Event - view_item_list**
   - Type: GA4 Event
   - Event Name: view_item_list
   - Trigger: CE - view_item_list

4. **GA4 - Event - view_item**
   - Type: GA4 Event
   - Event Name: view_item
   - Trigger: CE - view_item

5. **GA4 - Event - select_item**
   - Type: GA4 Event
   - Event Name: select_item
   - Trigger: CE - select_item

6. **GA4 - Event - add_to_cart**
   - Type: GA4 Event
   - Event Name: add_to_cart
   - Trigger: CE - add_to_cart

7. **GA4 - Event - remove_from_cart**
   - Type: GA4 Event
   - Event Name: remove_from_cart
   - Trigger: CE - remove_from_cart

8. **GA4 - Event - view_cart**
   - Type: GA4 Event
   - Event Name: view_cart
   - Trigger: CE - view_cart

9. **GA4 - Event - begin_checkout**
   - Type: GA4 Event
   - Event Name: begin_checkout
   - Trigger: CE - begin_checkout

10. **GA4 - Event - add_shipping_info**
    - Type: GA4 Event
    - Event Name: add_shipping_info
    - Trigger: CE - add_shipping_info

11. **GA4 - Event - add_payment_info**
    - Type: GA4 Event
    - Event Name: add_payment_info
    - Trigger: CE - add_payment_info

12. **GA4 - Event - purchase**
    - Type: GA4 Event
    - Event Name: purchase
    - Trigger: CE - purchase

### Triggers (Custom Events)

All triggers are type "Custom Event" matching the event name:
- CE - page_view
- CE - view_item_list
- CE - view_item
- CE - select_item
- CE - add_to_cart
- CE - remove_from_cart
- CE - view_cart
- CE - begin_checkout
- CE - search
- CE - add_shipping_info
- CE - add_payment_info
- CE - purchase

### Variables (Data Layer)

**Constants:**
- Const - GA4 Measurement ID (your G-XXXXXXXXXX)

**Data Layer Variables:**
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
- DLV - customer_logged_in
- DLV - customer_orders_count
- DLV - customer_total_spent
- DLV - page_type
- DLV - page_title
- DLV - search_term
- DLV - cart_type
- DLV - payment_type

---

## 7. Testing & QA

### Pre-Launch Checklist

**Storefront Events:**
- [ ] page_view fires on every page
- [ ] view_item_list fires on collections
- [ ] select_item fires on product clicks
- [ ] view_item fires on product pages
- [ ] add_to_cart fires when adding to cart
- [ ] remove_from_cart fires when removing
- [ ] view_cart fires on cart page
- [ ] view_cart (drawer) fires when drawer opens
- [ ] begin_checkout fires when clicking checkout
- [ ] search fires on search pages

**Checkout Events:**
- [ ] page_view fires on checkout pages
- [ ] begin_checkout fires on checkout start
- [ ] add_shipping_info fires after selecting shipping
- [ ] add_payment_info fires after selecting payment
- [ ] purchase fires on order confirmation
- [ ] transaction_id is present and unique

**Data Quality:**
- [ ] All items have item_id, item_name, currency
- [ ] Prices are numeric and correct
- [ ] Quantities are integers
- [ ] No undefined or null in required fields
- [ ] user_id present for logged-in customers
- [ ] customer_email_sha256 is hashed (not plain text)

**GTM:**
- [ ] All tags fire on correct triggers
- [ ] No duplicate events
- [ ] Variables populate correctly
- [ ] No JavaScript errors in console

### Testing Tools

**1. Browser Console (debug mode)**
```javascript
// Enable debug mode
CONFIG.debug = true;
```

**2. GTM Preview Mode**
- See events in real-time
- Verify triggers fire
- Check variable values
- Inspect tag firing order

**3. GA4 DebugView**
- Visit site with `?debug_mode=1`
- Real-time event monitoring
- Parameter validation
- User property verification

**4. Network Tab**
- Verify GTM loads
- Check GA4 collect requests
- Inspect payload data

---

## 8. Troubleshooting

### Issue: Events Not Firing

**Symptoms:** No events in GTM Preview or GA4

**Check:**
1. Browser console for JavaScript errors
2. GTM container is installed correctly
3. dataLayer exists: `console.log(window.dataLayer)`
4. Events are being pushed: `window.dataLayer` should have objects

**Solutions:**
- Fix JavaScript errors
- Verify GTM snippet is before data layer code
- Enable debug mode and check console logs

### Issue: dataLayer Overwritten

**Symptoms:** Previous events disappear, only one event in dataLayer

**Check:**
1. Search code for `window.dataLayer = ` (assignment)
2. Look for other scripts that might clear dataLayer
3. Check custom pixels or third-party scripts

**Solutions:**
- Replace `=` with `= window.dataLayer || ` to preserve
- Remove any code that clears dataLayer
- Ensure only using `.push()` method

### Issue: Wrong Event Names in GA4

**Symptoms:** Events show as "page_view" but expecting "ee_productView"

**Note:** This is correct! We use GA4 standard event names, not UA.

**GA4 Events (Correct):**
- add_to_cart, purchase, view_item, view_item_list

**UA Events (Old/Wrong):**
- ee_addToCart, ee_purchase, ee_productDetail

### Issue: Cart Drawer Not Tracked

**Symptoms:** view_cart doesn't fire when mini cart opens

**Check:**
1. Inspect cart drawer HTML for correct selector
2. Check if drawer has `hidden` attribute or class
3. Verify MutationObserver is running

**Solutions:**
- Update `CONFIG.selectors.cartDrawer` with your theme's selector
- Check console for "Cart drawer opened" log (debug mode)
- Ensure drawer visibility changes are detectable

### Issue: Add to Cart Not Firing

**Symptoms:** add_to_cart doesn't fire after adding product

**Check:**
1. Is request going to `/cart/add`?
2. Check network tab for AJAX requests
3. Verify fetch interceptor is active

**Solutions:**
- Ensure theme uses AJAX (not form submission)
- Check if theme uses custom add to cart endpoint
- Verify fetch wrapper is loaded before theme scripts

### Issue: Purchase Event Missing

**Symptoms:** All events work except purchase

**Check:**
1. Custom Pixel installed and connected
2. No JavaScript errors in checkout
3. Order actually completed (not abandoned)

**Solutions:**
- Reinstall Custom Pixel
- Check console on thank you page
- Test with real order (not test mode)

### Issue: Duplicate Events

**Symptoms:** Same event fires multiple times

**Check:**
1. Code installed multiple times
2. Other tracking scripts interfering
3. Debouncing not working

**Solutions:**
- Remove duplicate code installations
- Check for timing conflicts with other scripts
- Increase debounce timers if needed

### Issue: Missing Product Data

**Symptoms:** Events fire but items array is empty

**Check:**
1. Liquid rendering errors
2. Product objects available on page
3. JSON parsing issues

**Solutions:**
- Check Liquid syntax errors
- Verify products exist in collection
- Check console for parsing errors

---

## Contact & Support

**JY Insights**
- Email: contact@jyinsights.com
- Package: Gold Plus v1.1 (Storefront) / v1.3 (Checkout)
- Documentation: See README.md for quick start guide
- GTM Import: See GTM-IMPORT-GUIDE.md for container setup

---

*End of Solution Design Reference*
