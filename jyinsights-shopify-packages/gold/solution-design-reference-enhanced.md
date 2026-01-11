# JY Insights Gold Plus - Enhanced Solution Design Reference

**Version:** 2.0 Enhanced
**Last Updated:** 2026-01-09
**Implementation Package:** Gold Plus Enhanced
**Author:** JY Insights
**Support:** contact@jyinsights.com

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Enhancement Overview](#enhancement-overview)
3. [Event Catalog](#event-catalog)
4. [Parameter Dictionary](#parameter-dictionary)
5. [GTM Implementation Guide](#gtm-implementation-guide)
6. [DataLayer Implementation Guide](#datalayer-implementation-guide)
7. [Pixel Implementation Guide](#pixel-implementation-guide)
8. [QA Testing Checklist](#qa-testing-checklist)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Mapping Tables](#mapping-tables)
11. [Version History](#version-history)

---

## Executive Summary

### Overview

The **JY Insights Gold Plus Enhanced** package is a comprehensive analytics implementation for Shopify that tracks the complete customer journey from storefront browsing to purchase completion. This enhanced version builds upon the proven Gold Plus v1.4/v1.7 foundation with significantly expanded data collection capabilities.

### Key Improvements Over Current Version

**User Parameters (15+ new fields):**
- RFM metrics (Recency, Frequency, Monetary value)
- Multiple hash algorithms (SHA256 + SHA1)
- Complete address object structure
- User tagging system
- Last order date tracking

**Product Parameters (10+ new fields):**
- Product handles (URL-safe identifiers)
- Category handles and IDs
- Product positions in lists
- Enhanced variant information
- Category relationship tracking

**Order Parameters (8+ new fields):**
- Order names (e.g., #AB123)
- Checkout IDs
- Discount breakdowns
- Payment gateway tracking
- Shipping method details

### Migration Strategy

**IMPORTANT:** This is a NON-DESTRUCTIVE enhancement:

1. **Keep existing files in production** - Do NOT delete or replace:
   - `gold-storefront-datalayer-GA4.liquid` (v1.4)
   - `gold-checkout-pixel-GA4.js` (v1.7)
   - `gold-gtm-container-ga4.json` (v1.4)

2. **Deploy enhanced versions alongside** using new filenames:
   - `gold-storefront-datalayer-GA4-enhanced.liquid` (v2.0)
   - `gold-checkout-pixel-GA4-enhanced.js` (v2.0)
   - `gold-gtm-container-ga4-enhanced.json` (v2.0)

3. **Test in parallel** before switching traffic

4. **Gradual rollout** recommended via theme customization or A/B testing

---

## Enhancement Overview

### What's New in Version 2.0

#### 1. Comprehensive User Tracking

```javascript
user_data: {
  // Identity (Hashed for Privacy)
  email_sha256: string,
  email_sha1: string,
  phone_sha256: string,
  phone_sha1: string,
  user_id: string,

  // Status
  logged_in: boolean,
  customer_type: 'guest' | 'new' | 'returning',

  // RFM Metrics
  orders_count: number,          // Frequency
  lifetime_value: number,        // Monetary
  last_order_date: string,       // Recency

  // Segmentation
  tags: string[],                // e.g., ['VIP', 'Newsletter Subscriber']

  // Address (Checkout/Thank You Only)
  address: {
    firstName: string,
    lastName: string,
    address1: string,
    address2: string,
    city: string,
    zip: string,
    province: string,
    provinceCode: string,
    country: string,
    countryCode: string
  },

  // Flat address (backwards compatible)
  city: string,
  state: string,
  country: string,
  zip: string
}
```

#### 2. Enhanced Product Tracking

```javascript
product: {
  // Core Identifiers
  item_id: string,               // Variant ID
  product_id: string,            // Product ID
  variant_id: string,            // Variant ID (explicit)

  // Descriptive
  item_name: string,             // Product title
  item_brand: string,            // Vendor
  item_category: string,         // Product type
  item_variant: string,          // Variant title
  sku: string,

  // NEW: Handles (URL-safe identifiers)
  product_handle: string,        // e.g., 'blue-widget-20oz'
  category_handle: string,       // e.g., 'widgets'

  // NEW: Category Relationships
  category_id: string,           // Last collection ID
  category_name: string,         // Last collection name

  // NEW: Positioning
  index: number,                 // Position in list (0-based)
  product_position: number,      // Position (1-based, optional)

  // Pricing
  price: number,
  currency: string,
  quantity: number,

  // Google Ads
  g_product_id: string,          // Format: shopify_US_123456_789012

  // NEW: Type Classification
  product_type: string           // Explicit product type
}
```

#### 3. Enhanced Order Tracking

```javascript
order_data: {
  // Identifiers
  order_id: string,              // Shopify order ID
  order_name: string,            // NEW: e.g., '#AB1234'
  checkout_id: string,           // NEW: Checkout token
  transaction_id: string,        // Used for GA4

  // Financial
  total_value: number,
  subtotal: number,              // NEW
  tax: number,
  shipping: number,
  discount_amount: number,       // NEW: Total discounts

  // Discounts
  coupon: string,                // Comma-separated codes

  // Products
  items: array,                  // All product objects
  total_quantity: number,        // NEW: Sum of all quantities

  // Fulfillment
  shipping_method: string,       // NEW: e.g., 'Standard Shipping'
  payment_type: string,          // NEW: e.g., 'Shopify Payments'

  // Currency
  currency: string,

  // NEW: Multi-Currency Support
  total_value_presentment_money: number,
  currency_presentment_money: string
}
```

---

## Event Catalog

### Storefront Events

#### 1. `user_data_ready`

**Purpose:** Establishes user context for the session
**When:** On page load (once per session)
**Where:** All storefront pages

**Parameters:**
- All fields from `user_data` object (see User Parameters section)

**Example dataLayer Push:**
```javascript
window.dataLayer.push({
  event: 'user_data_ready',
  user_data: {
    email_sha256: 'abc123...',
    email_sha1: 'def456...',
    user_id: '12345',
    logged_in: true,
    customer_type: 'returning',
    orders_count: 5,
    lifetime_value: 450.00,
    last_order_date: '2026-01-01',
    tags: ['VIP', 'Newsletter Subscriber'],
    city: 'new york',
    state: 'NY',
    country: 'US',
    zip: '10001'
  }
});
```

---

#### 2. `page_data_ready`

**Purpose:** Establishes page context for the session
**When:** On page load (once per session)
**Where:** All storefront pages

**Parameters:**
- `page_type` - Template name (collection, product, cart, search, etc.)
- `page_location` - Full URL
- `page_path` - URL path
- `page_title` - Page title
- `page_referrer` - Referrer URL
- `language` - Shop language (e.g., 'en')
- `currency` - Currency code (e.g., 'USD')
- `collection_id` - Collection ID (collection pages only)
- `collection_handle` - Collection handle (collection pages only)
- `collection_title` - Collection title (collection pages only)
- `collection_description` - Collection description (collection pages only)
- `product_id` - Product ID (product pages only)
- `product_handle` - Product handle (product pages only)
- `product_type` - Product type (product pages only)
- `product_vendor` - Product vendor (product pages only)
- `product_collections` - Array of collection handles (product pages only)
- `search_term` - Search query (search pages only)
- `search_results_count` - Number of results (search pages only)
- `navigation_type` - Navigation type (0 = navigate, 1 = reload, 2 = back/forward)

**Example dataLayer Push:**
```javascript
window.dataLayer.push({
  event: 'page_data_ready',
  page_data: {
    page_type: 'product',
    page_location: 'https://store.com/products/widget',
    page_path: '/products/widget',
    page_title: 'Blue Widget | Store',
    page_referrer: 'https://google.com',
    language: 'en',
    currency: 'USD',
    product_id: '123456',
    product_handle: 'widget',
    product_type: 'Widgets',
    product_vendor: 'ACME Corp',
    product_collections: ['featured', 'widgets', 'best-sellers'],
    navigation_type: 0
  }
});
```

---

#### 3. `page_view`

**Purpose:** Track page views
**When:** On every page load
**Where:** All storefront and checkout pages

**Parameters:**
- `context` - 'storefront' or 'checkout'
- `page_type` - Template name
- `page_title` - Page title
- `user_logged_in` - Boolean
- `user_type` - 'guest', 'new', or 'returning'

**Example dataLayer Push:**
```javascript
window.dataLayer.push({
  event: 'page_view',
  context: 'storefront',
  page_type: 'product',
  page_title: 'Blue Widget | Store',
  user_logged_in: true,
  user_type: 'returning'
});
```

---

#### 4. `view_item_list`

**Purpose:** Track when users view a list of products
**When:** On collection pages and search results
**Where:** Collection pages, search pages

**Parameters:**
- `ecommerce.item_list_id` - Collection ID or 'search_results'
- `ecommerce.item_list_name` - Collection title or 'Search: [query]'
- `ecommerce.items[]` - Array of product objects

**Enhanced Item Parameters:**
- All standard GA4 parameters
- `product_handle` - URL-safe product identifier
- `category_handle` - URL-safe collection identifier
- `variant_title` - Variant name
- `g_product_id` - Google Shopping format ID

**Example dataLayer Push:**
```javascript
window.dataLayer.push({
  event: 'view_item_list',
  ecommerce: {
    item_list_id: '123456',
    item_list_name: 'Best Sellers',
    items: [{
      item_id: '789012',
      item_name: 'Blue Widget',
      item_brand: 'ACME Corp',
      item_category: 'Widgets',
      item_variant: '20oz',
      price: 29.99,
      currency: 'USD',
      product_id: '123456',
      variant_id: '789012',
      g_product_id: 'shopify_US_123456_789012',
      sku: 'WIDGET-BLUE-20',
      product_handle: 'blue-widget-20oz',
      category_handle: 'best-sellers',
      variant_title: '20oz',
      index: 0
    }, {
      item_id: '789013',
      item_name: 'Red Widget',
      item_brand: 'ACME Corp',
      item_category: 'Widgets',
      item_variant: '30oz',
      price: 39.99,
      currency: 'USD',
      product_id: '123457',
      variant_id: '789013',
      g_product_id: 'shopify_US_123457_789013',
      sku: 'WIDGET-RED-30',
      product_handle: 'red-widget-30oz',
      category_handle: 'best-sellers',
      variant_title: '30oz',
      index: 1
    }]
  }
});
```

---

#### 5. `select_item`

**Purpose:** Track when users click on a product from a list
**When:** User clicks product link on collection or search page
**Where:** Collection pages, search pages

**Parameters:**
- `ecommerce.item_list_id` - Collection ID or 'search_results'
- `ecommerce.item_list_name` - Collection title or 'Search: [query]'
- `ecommerce.items[]` - Array with single product object (the clicked item)

**Enhanced Item Parameters:**
- All parameters from view_item_list
- List attribution is saved to sessionStorage for checkout tracking

**Example dataLayer Push:**
```javascript
window.dataLayer.push({
  event: 'select_item',
  ecommerce: {
    item_list_id: '123456',
    item_list_name: 'Best Sellers',
    items: [{
      item_id: '789012',
      item_name: 'Blue Widget',
      item_brand: 'ACME Corp',
      item_category: 'Widgets',
      item_variant: '20oz',
      price: 29.99,
      currency: 'USD',
      product_id: '123456',
      variant_id: '789012',
      g_product_id: 'shopify_US_123456_789012',
      sku: 'WIDGET-BLUE-20',
      product_handle: 'blue-widget-20oz',
      product_type: 'Widgets',
      category_id: '123456',
      category_name: 'Best Sellers',
      category_handle: 'best-sellers',
      item_list_id: '123456',
      item_list_name: 'Best Sellers',
      index: 0
    }]
  }
});
```

---

#### 6. `view_item`

**Purpose:** Track when users view a product detail page or quick view
**When:** Product detail page load OR quick view modal opens
**Where:** Product pages, quick view modals

**Parameters:**
- `view_type` - 'pdp' (product detail page) or 'quick_view'
- `ecommerce.currency` - Currency code
- `ecommerce.value` - Product price
- `ecommerce.items[]` - Array with single product object

**Enhanced Item Parameters:**
- All standard parameters
- `product_handle` - Product URL handle
- `product_type` - Product type/category
- `category_id` - Last collection ID
- `category_name` - Last collection name
- `category_handle` - Last collection handle
- For quick views: includes `item_list_id` and `item_list_name` from source list

**Example dataLayer Push (PDP):**
```javascript
window.dataLayer.push({
  event: 'view_item',
  view_type: 'pdp',
  ecommerce: {
    currency: 'USD',
    value: 29.99,
    items: [{
      item_id: '789012',
      item_name: 'Blue Widget',
      item_brand: 'ACME Corp',
      item_category: 'Widgets',
      item_variant: '20oz',
      price: 29.99,
      currency: 'USD',
      product_id: '123456',
      variant_id: '789012',
      g_product_id: 'shopify_US_123456_789012',
      sku: 'WIDGET-BLUE-20',
      product_handle: 'blue-widget-20oz',
      product_type: 'Widgets',
      category_id: '654321',
      category_name: 'Featured Products',
      category_handle: 'featured'
    }]
  }
});
```

**Example dataLayer Push (Quick View):**
```javascript
window.dataLayer.push({
  event: 'view_item',
  view_type: 'quick_view',
  ecommerce: {
    currency: 'USD',
    value: 29.99,
    items: [{
      item_id: '789012',
      item_name: 'Blue Widget',
      item_brand: 'ACME Corp',
      item_category: 'Widgets',
      item_variant: '20oz',
      price: 29.99,
      currency: 'USD',
      product_id: '123456',
      variant_id: '789012',
      g_product_id: 'shopify_US_123456_789012',
      sku: 'WIDGET-BLUE-20',
      product_handle: 'blue-widget-20oz',
      product_type: 'Widgets',
      category_id: '123456',
      category_name: 'Best Sellers',
      category_handle: 'best-sellers',
      item_list_id: '123456',
      item_list_name: 'Best Sellers',
      index: 0
    }]
  }
});
```

---

#### 7. `add_to_cart`

**Purpose:** Track when users add products to their cart
**When:** Add to cart button clicked
**Where:** Product pages, collection quick-add, quick view modals

**Parameters:**
- `context` - 'pdp', 'quick_view', or 'collection_quick_add'
- `ecommerce.currency` - Currency code
- `ecommerce.value` - Line item total (price × quantity)
- `ecommerce.items[]` - Array with single product object (the added item)

**Enhanced Item Parameters:**
- All standard parameters plus context-specific data
- From PDP: full product context
- From collection: includes `item_list_id` and `item_list_name`
- From quick view: includes list attribution
- All include: `product_handle`, `product_type`, `category_id`, `category_name`, `category_handle`

**Example dataLayer Push (PDP):**
```javascript
window.dataLayer.push({
  event: 'add_to_cart',
  context: 'pdp',
  ecommerce: {
    currency: 'USD',
    value: 59.98,  // 29.99 × 2
    items: [{
      item_id: '789012',
      item_name: 'Blue Widget',
      item_brand: 'ACME Corp',
      item_category: 'Widgets',
      item_variant: '20oz',
      price: 29.99,
      quantity: 2,
      currency: 'USD',
      product_id: '123456',
      variant_id: '789012',
      g_product_id: 'shopify_US_123456_789012',
      sku: 'WIDGET-BLUE-20',
      product_handle: 'blue-widget-20oz',
      product_type: 'Widgets',
      category_id: '654321',
      category_name: 'Featured Products',
      category_handle: 'featured'
    }]
  }
});
```

**Example dataLayer Push (Collection Quick-Add):**
```javascript
window.dataLayer.push({
  event: 'add_to_cart',
  context: 'collection_quick_add',
  ecommerce: {
    currency: 'USD',
    value: 29.99,
    items: [{
      item_id: '789012',
      item_name: 'Blue Widget',
      item_brand: 'ACME Corp',
      item_category: 'Widgets',
      item_variant: '20oz',
      price: 29.99,
      quantity: 1,
      currency: 'USD',
      product_id: '123456',
      variant_id: '789012',
      g_product_id: 'shopify_US_123456_789012',
      sku: 'WIDGET-BLUE-20',
      product_handle: 'blue-widget-20oz',
      product_type: 'Widgets',
      category_id: '123456',
      category_name: 'Best Sellers',
      category_handle: 'best-sellers',
      item_list_id: '123456',
      item_list_name: 'Best Sellers'
    }]
  }
});
```

---

#### 8. `remove_from_cart`

**Purpose:** Track when users remove products from their cart
**When:** Remove button clicked in cart or cart drawer
**Where:** Cart page, cart drawer

**Parameters:**
- `ecommerce.currency` - Currency code
- `ecommerce.value` - Line item total being removed
- `ecommerce.items[]` - Array with single product object (the removed item)

**Enhanced Item Parameters:**
- All standard product parameters
- Fetched from `/cart.js` API for accuracy

**Example dataLayer Push:**
```javascript
window.dataLayer.push({
  event: 'remove_from_cart',
  ecommerce: {
    currency: 'USD',
    value: 59.98,  // 29.99 × 2
    items: [{
      item_id: '789012',
      item_name: 'Blue Widget',
      item_brand: 'ACME Corp',
      item_category: 'Widgets',
      item_variant: '20oz',
      price: 29.99,
      quantity: 2,
      currency: 'USD',
      product_id: '123456',
      variant_id: '789012',
      g_product_id: 'shopify_US_123456_789012',
      sku: 'WIDGET-BLUE-20',
      index: 0
    }]
  }
});
```

---

#### 9. `view_cart`

**Purpose:** Track when users view their cart
**When:** Cart page loads OR cart drawer opens
**Where:** Cart page, cart drawer

**Parameters:**
- `cart_type` - 'page' (cart page) or 'drawer' (cart drawer)
- `trigger` - 'auto' (after add to cart) or 'manual' (clicked cart icon)
- `cart_total_value` - Total cart value
- `cart_total_quantity` - Total number of items
- `ecommerce.currency` - Currency code
- `ecommerce.value` - Total cart value
- `ecommerce.items[]` - Array of all products in cart

**Enhanced Item Parameters:**
- All standard product parameters for each item
- Includes quantities and line totals

**Example dataLayer Push:**
```javascript
window.dataLayer.push({
  event: 'view_cart',
  cart_type: 'drawer',
  trigger: 'auto',
  cart_total_value: 89.97,
  cart_total_quantity: 3,
  ecommerce: {
    currency: 'USD',
    value: 89.97,
    items: [{
      item_id: '789012',
      item_name: 'Blue Widget',
      item_brand: 'ACME Corp',
      item_category: 'Widgets',
      item_variant: '20oz',
      price: 29.99,
      quantity: 2,
      currency: 'USD',
      product_id: '123456',
      variant_id: '789012',
      g_product_id: 'shopify_US_123456_789012',
      sku: 'WIDGET-BLUE-20',
      index: 0
    }, {
      item_id: '789013',
      item_name: 'Red Widget',
      item_brand: 'ACME Corp',
      item_category: 'Widgets',
      item_variant: '30oz',
      price: 29.99,
      quantity: 1,
      currency: 'USD',
      product_id: '123457',
      variant_id: '789013',
      g_product_id: 'shopify_US_123457_789013',
      sku: 'WIDGET-RED-30',
      index: 1
    }]
  }
});
```

---

#### 10. `search`

**Purpose:** Track when users perform a search
**When:** Search results page loads
**Where:** Search pages

**Parameters:**
- `search_term` - Search query
- `search_results_count` - Number of results found

**Example dataLayer Push:**
```javascript
window.dataLayer.push({
  event: 'search',
  search_term: 'blue widgets',
  search_results_count: 12
});
```

---

### Checkout Events

#### 11. `begin_checkout`

**Purpose:** Track when users begin the checkout process
**When:** Checkout page loads (first step)
**Where:** Checkout pages

**Parameters:**
- `ecommerce.currency` - Currency code
- `ecommerce.value` - Cart total
- `ecommerce.coupon` - Coupon code(s) if applied
- `ecommerce.items[]` - Array of all products in checkout

**Enhanced Item Parameters:**
- All standard product parameters
- `product_handle` - Product URL handle
- `product_type` - Product type
- `item_list_id` - Source list ID (from sessionStorage)
- `item_list_name` - Source list name (from sessionStorage)
- `discount` - Item-level discount amount

**Example dataLayer Push:**
```javascript
window.dataLayer.push({
  event: 'begin_checkout',
  ecommerce: {
    currency: 'USD',
    value: 89.97,
    coupon: 'SAVE10',
    items: [{
      item_id: '789012',
      item_name: 'Blue Widget',
      item_brand: 'ACME Corp',
      item_category: 'Widgets',
      item_variant: '20oz',
      price: 29.99,
      quantity: 2,
      currency: 'USD',
      product_id: '123456',
      variant_id: '789012',
      g_product_id: 'shopify_US_123456_789012',
      sku: 'WIDGET-BLUE-20',
      product_handle: 'blue-widget-20oz',
      product_type: 'Widgets',
      item_list_id: '123456',
      item_list_name: 'Best Sellers',
      discount: 5.00,
      index: 0
    }]
  }
});
```

---

#### 12. `add_contact_info`

**Purpose:** Track when users submit contact information
**When:** User completes contact info step
**Where:** Checkout pages

**Parameters:**
- `checkout_step` - 'contact_info'
- `email_provided` - Boolean

**Example dataLayer Push:**
```javascript
window.dataLayer.push({
  event: 'add_contact_info',
  checkout_step: 'contact_info',
  email_provided: true
});
```

---

#### 13. `add_shipping_info`

**Purpose:** Track when users submit shipping information
**When:** User completes shipping address OR selects shipping method
**Where:** Checkout pages

**Note:** This event fires TWICE:
1. After address submission (shipping_tier: 'not_selected')
2. After shipping method selection (shipping_tier: actual method name)

**Parameters:**
- `ecommerce.currency` - Currency code
- `ecommerce.value` - Order total
- `ecommerce.shipping_tier` - Shipping method name or 'not_selected'
- `ecommerce.coupon` - Coupon code(s) if applied
- `ecommerce.items[]` - Array of all products

**Example dataLayer Push (After Address):**
```javascript
window.dataLayer.push({
  event: 'add_shipping_info',
  ecommerce: {
    currency: 'USD',
    value: 89.97,
    shipping_tier: 'not_selected',
    coupon: 'SAVE10',
    items: [/* ... */]
  }
});
```

**Example dataLayer Push (After Method Selection):**
```javascript
window.dataLayer.push({
  event: 'add_shipping_info',
  ecommerce: {
    currency: 'USD',
    value: 89.97,
    shipping_tier: 'Standard Shipping',
    coupon: 'SAVE10',
    items: [/* ... */]
  }
});
```

---

#### 14. `add_payment_info`

**Purpose:** Track when users submit payment information
**When:** User completes payment info step
**Where:** Checkout pages

**Parameters:**
- `ecommerce.currency` - Currency code
- `ecommerce.value` - Order total
- `ecommerce.payment_type` - Payment gateway name
- `ecommerce.coupon` - Coupon code(s) if applied
- `ecommerce.items[]` - Array of all products

**Enhanced Parameters:**
- `payment_type` - Extracted from paymentMethod.name or transaction gateway

**Example dataLayer Push:**
```javascript
window.dataLayer.push({
  event: 'add_payment_info',
  ecommerce: {
    currency: 'USD',
    value: 89.97,
    payment_type: 'Shopify Payments',
    coupon: 'SAVE10',
    items: [/* ... */]
  }
});
```

---

#### 15. `purchase`

**Purpose:** Track completed purchases
**When:** Thank you page loads
**Where:** Thank you page (checkout complete)

**Parameters:**
- `user_data` - **COMPLETE user object with PII** (for Enhanced Conversions)
- `order_data` - **COMPLETE order object** (for analysis)
- `ecommerce.transaction_id` - Order ID
- `ecommerce.affiliation` - 'Shopify Store'
- `ecommerce.currency` - Currency code
- `ecommerce.value` - Order total
- `ecommerce.tax` - Tax amount
- `ecommerce.shipping` - Shipping cost
- `ecommerce.coupon` - Coupon code(s)
- `ecommerce.discount_amount` - Total discount
- `ecommerce.order_name` - Order name (e.g., '#AB1234')
- `ecommerce.checkout_id` - Checkout token
- `ecommerce.payment_type` - Payment gateway
- `ecommerce.shipping_method` - Shipping method
- `ecommerce.total_quantity` - Total items
- `ecommerce.items[]` - Array of all purchased products

**Enhanced User Data (Full PII for Marketing Pixels):**
```javascript
user_data: {
  // Raw PII (Thank You Page Only)
  email: 'customer@example.com',
  email_sha256: 'abc123...',
  email_sha1: 'def456...',
  phone: '+15551234567',
  phone_sha256: 'ghi789...',
  phone_sha1: 'jkl012...',

  // Name
  first_name: 'John',
  last_name: 'Doe',

  // Complete Address Object
  address: {
    firstName: 'John',
    lastName: 'Doe',
    address1: '123 Main St',
    address2: 'Apt 4B',
    city: 'New York',
    zip: '10001',
    province: 'New York',
    provinceCode: 'NY',
    country: 'United States',
    countryCode: 'US'
  },

  // Flat Address (Backwards Compatible)
  city: 'New York',
  state: 'NY',
  country: 'US',
  zip: '10001',

  // Status
  logged_in: true,
  customer_type: 'returning',
  user_id: '12345',
  orders_count: 5,
  accepts_marketing: true,

  // Segmentation
  tags: ['VIP', 'Newsletter Subscriber']
}
```

**Enhanced Order Data:**
```javascript
order_data: {
  order_id: '4567890',
  order_name: '#AB1234',
  checkout_id: 'abc123def456',
  total_value: 89.97,
  subtotal: 79.98,
  tax: 7.99,
  shipping: 10.00,
  discount_amount: 8.00,
  coupon: 'SAVE10',
  total_quantity: 3,
  currency: 'USD',
  shipping_method: 'Standard Shipping',
  payment_type: 'Shopify Payments',
  total_value_presentment_money: 89.97,
  currency_presentment_money: 'USD'
}
```

**Example dataLayer Push:**
```javascript
window.dataLayer.push({
  event: 'purchase',
  user_data: {
    email: 'customer@example.com',
    email_sha256: 'abc123...',
    email_sha1: 'def456...',
    phone: '+15551234567',
    phone_sha256: 'ghi789...',
    phone_sha1: 'jkl012...',
    first_name: 'John',
    last_name: 'Doe',
    address: {
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main St',
      address2: 'Apt 4B',
      city: 'New York',
      zip: '10001',
      province: 'New York',
      provinceCode: 'NY',
      country: 'United States',
      countryCode: 'US'
    },
    city: 'New York',
    state: 'NY',
    country: 'US',
    zip: '10001',
    logged_in: true,
    customer_type: 'returning',
    user_id: '12345',
    orders_count: 5,
    accepts_marketing: true,
    tags: ['VIP']
  },
  order_data: {
    order_id: '4567890',
    order_name: '#AB1234',
    checkout_id: 'abc123def456',
    total_value: 89.97,
    subtotal: 79.98,
    tax: 7.99,
    shipping: 10.00,
    discount_amount: 8.00,
    coupon: 'SAVE10',
    total_quantity: 3,
    currency: 'USD',
    shipping_method: 'Standard Shipping',
    payment_type: 'Shopify Payments'
  },
  ecommerce: {
    transaction_id: '4567890',
    affiliation: 'Shopify Store',
    currency: 'USD',
    value: 89.97,
    tax: 7.99,
    shipping: 10.00,
    coupon: 'SAVE10',
    discount_amount: 8.00,
    order_name: '#AB1234',
    checkout_id: 'abc123def456',
    payment_type: 'Shopify Payments',
    shipping_method: 'Standard Shipping',
    total_quantity: 3,
    items: [{
      item_id: '789012',
      item_name: 'Blue Widget',
      item_brand: 'ACME Corp',
      item_category: 'Widgets',
      item_variant: '20oz',
      price: 29.99,
      quantity: 2,
      currency: 'USD',
      product_id: '123456',
      variant_id: '789012',
      g_product_id: 'shopify_US_123456_789012',
      sku: 'WIDGET-BLUE-20',
      product_handle: 'blue-widget-20oz',
      product_type: 'Widgets',
      item_list_id: '123456',
      item_list_name: 'Best Sellers',
      discount: 5.00,
      index: 0
    }, {
      item_id: '789013',
      item_name: 'Red Widget',
      item_brand: 'ACME Corp',
      item_category: 'Widgets',
      item_variant: '30oz',
      price: 29.99,
      quantity: 1,
      currency: 'USD',
      product_id: '123457',
      variant_id: '789013',
      g_product_id: 'shopify_US_123457_789013',
      sku: 'WIDGET-RED-30',
      product_handle: 'red-widget-30oz',
      product_type: 'Widgets',
      discount: 3.00,
      index: 1
    }]
  }
});
```

---

## Parameter Dictionary

### User Parameters

| Parameter | Type | Description | Example | Pages | Privacy |
|-----------|------|-------------|---------|-------|---------|
| `email` | string | Customer email (raw) | `customer@example.com` | Thank You ONLY | PII |
| `email_sha256` | string | SHA256 hashed email | `abc123...` | All | Hashed |
| `email_sha1` | string | SHA1 hashed email | `def456...` | All | Hashed |
| `phone` | string | Customer phone (raw) | `+15551234567` | Thank You ONLY | PII |
| `phone_sha256` | string | SHA256 hashed phone | `ghi789...` | Thank You ONLY | Hashed |
| `phone_sha1` | string | SHA1 hashed phone | `jkl012...` | Thank You ONLY | Hashed |
| `user_id` | string | Shopify customer ID | `12345` | All | Safe |
| `logged_in` | boolean | Is customer logged in? | `true` | All | Safe |
| `customer_type` | string | Customer classification | `'guest'`, `'new'`, `'returning'` | All | Safe |
| `orders_count` | number | Total orders placed | `5` | All (logged in) | Safe |
| `lifetime_value` | number | Total revenue from customer | `450.00` | All (logged in) | Safe |
| `last_order_date` | string | Last order date | `'2026-01-01'` | All (logged in) | Safe |
| `first_name` | string | First name | `'John'` | Thank You ONLY | PII |
| `last_name` | string | Last name | `'Doe'` | Thank You ONLY | PII |
| `first_name_initial` | string | First name initial | `'j'` | Storefront | Privacy-safe |
| `last_name_initial` | string | Last name initial | `'d'` | Storefront | Privacy-safe |
| `address.firstName` | string | Shipping first name | `'John'` | Thank You ONLY | PII |
| `address.lastName` | string | Shipping last name | `'Doe'` | Thank You ONLY | PII |
| `address.address1` | string | Address line 1 | `'123 Main St'` | Thank You ONLY | PII |
| `address.address2` | string | Address line 2 | `'Apt 4B'` | Thank You ONLY | PII |
| `address.city` | string | City | `'New York'` | Thank You ONLY | PII |
| `address.zip` | string | Zip/postal code | `'10001'` | Thank You ONLY | PII |
| `address.province` | string | State/province name | `'New York'` | Thank You ONLY | PII |
| `address.provinceCode` | string | State/province code | `'NY'` | Thank You ONLY | PII |
| `address.country` | string | Country name | `'United States'` | Thank You ONLY | PII |
| `address.countryCode` | string | Country code | `'US'` | Thank You ONLY | PII |
| `city` | string | City (flat format) | `'new york'` | All (logged in) | Privacy-safe |
| `state` | string | State code (flat format) | `'NY'` | All (logged in) | Privacy-safe |
| `country` | string | Country code (flat format) | `'US'` | All (logged in) | Privacy-safe |
| `zip` | string | Zip code (flat format) | `'10001'` | All (logged in) | Privacy-safe |
| `tags` | array | Customer tags | `['VIP', 'Newsletter']` | All (logged in) | Safe |
| `accepts_marketing` | boolean | Marketing opt-in status | `true` | Checkout | Safe |
| `page_currency_rate` | number | Currency conversion rate | `1.0` | All | Safe |

**Privacy Notes:**
- **PII (Personally Identifiable Information)** is ONLY collected on the Thank You page for marketing pixel purposes (Google Enhanced Conversions, Meta CAPI)
- **Hashed data** is privacy-safe and can be used throughout the site
- **Privacy-safe data** includes aggregated/anonymized information (initials, lowercase cities, etc.)
- All PII collection complies with GDPR, CCPA, and Shopify's privacy standards
- Users must provide consent before PII is sent to marketing platforms

---

### Product Parameters

| Parameter | Type | Description | Example | Required |
|-----------|------|-------------|---------|----------|
| `item_id` | string | Variant ID (GA4 standard) | `'789012'` | Yes |
| `item_name` | string | Product title | `'Blue Widget'` | Yes |
| `product_id` | string | Shopify product ID | `'123456'` | Yes |
| `variant_id` | string | Shopify variant ID | `'789012'` | Yes |
| `item_brand` | string | Vendor/brand name | `'ACME Corp'` | Recommended |
| `item_category` | string | Product type | `'Widgets'` | Recommended |
| `item_variant` | string | Variant title | `'20oz'` | Recommended |
| `variant_title` | string | Variant name (duplicate) | `'20oz'` | Optional |
| `sku` | string | Product SKU | `'WIDGET-BLUE-20'` | Recommended |
| `price` | number | Unit price | `29.99` | Yes |
| `currency` | string | Currency code | `'USD'` | Yes |
| `quantity` | number | Quantity | `2` | Yes |
| `g_product_id` | string | Google Shopping format | `'shopify_US_123456_789012'` | Recommended |
| `product_handle` | string | URL-safe identifier | `'blue-widget-20oz'` | Enhanced |
| `product_type` | string | Product type (explicit) | `'Widgets'` | Enhanced |
| `category_id` | string | Collection ID | `'654321'` | Enhanced |
| `category_name` | string | Collection title | `'Featured Products'` | Enhanced |
| `category_handle` | string | Collection handle | `'featured'` | Enhanced |
| `item_list_id` | string | Source list ID | `'123456'` or `'search_results'` | Context |
| `item_list_name` | string | Source list name | `'Best Sellers'` or `'Search: widgets'` | Context |
| `index` | number | Position in list (0-based) | `0` | Lists |
| `product_position` | number | Position in list (1-based) | `1` | Optional |
| `discount` | number | Item-level discount | `5.00` | Checkout |

**Parameter Notes:**
- `item_id` vs `variant_id`: Both contain variant ID; `item_id` is GA4 standard, `variant_id` is explicit
- `item_category` vs `product_type`: Same value, different naming conventions
- `g_product_id` format: `shopify_[COUNTRY]_[PRODUCT_ID]_[VARIANT_ID]` (e.g., `shopify_US_123456_789012`)
- `item_list_id`/`item_list_name`: Populated from collection/search context, persisted via sessionStorage

---

### Order Parameters

| Parameter | Type | Description | Example | Event |
|-----------|------|-------------|---------|-------|
| `transaction_id` | string | GA4 transaction ID | `'4567890'` | Purchase |
| `order_id` | string | Shopify order ID | `'4567890'` | Purchase |
| `order_name` | string | Order name | `'#AB1234'` | Purchase |
| `checkout_id` | string | Checkout token | `'abc123def456'` | Purchase |
| `affiliation` | string | Store name | `'Shopify Store'` | Purchase |
| `currency` | string | Currency code | `'USD'` | All |
| `value` | number | Order total | `89.97` | All |
| `subtotal` | number | Subtotal (before tax/shipping) | `79.98` | Purchase |
| `tax` | number | Tax amount | `7.99` | Purchase |
| `shipping` | number | Shipping cost | `10.00` | Purchase |
| `discount_amount` | number | Total discount | `8.00` | Purchase |
| `coupon` | string | Coupon code(s) | `'SAVE10'` or `'SAVE10,EXTRA5'` | Checkout |
| `payment_type` | string | Payment gateway | `'Shopify Payments'` | Checkout |
| `shipping_method` | string | Shipping method | `'Standard Shipping'` | Checkout |
| `shipping_tier` | string | Shipping tier | `'Standard'` or `'not_selected'` | Checkout |
| `total_quantity` | number | Total items | `3` | Purchase |
| `total_value_presentment_money` | number | Value in presentment currency | `89.97` | Purchase |
| `currency_presentment_money` | string | Presentment currency | `'USD'` | Purchase |

**Order Parameter Notes:**
- `transaction_id` = `order_id` in most cases (GA4 requires `transaction_id`)
- `order_name` is the customer-facing order number (e.g., `#AB1234`)
- `checkout_id` is the Shopify checkout token, useful for linking pre/post-purchase events
- `coupon` can be comma-separated if multiple codes used
- `payment_type` extracted from Shopify's payment gateway name
- `shipping_method` extracted from selected delivery option
- Presentment money fields support multi-currency stores (Shopify Markets)

---

### Page Parameters

| Parameter | Type | Description | Example | Pages |
|-----------|------|-------------|---------|-------|
| `page_type` | string | Shopify template name | `'product'`, `'collection'`, `'cart'`, `'search'`, `'checkout'` | All |
| `page_location` | string | Full URL | `'https://store.com/products/widget'` | All |
| `page_path` | string | URL path | `'/products/widget'` | All |
| `page_title` | string | Page title | `'Blue Widget | Store'` | All |
| `page_referrer` | string | Referrer URL | `'https://google.com'` | All |
| `language` | string | Shop language | `'en'` | All |
| `currency` | string | Currency code | `'USD'` | All |
| `navigation_type` | number | Navigation type | `0` (navigate), `1` (reload), `2` (back/forward) | All |
| `collection_id` | string | Collection ID | `'123456'` | Collection |
| `collection_handle` | string | Collection handle | `'best-sellers'` | Collection |
| `collection_title` | string | Collection title | `'Best Sellers'` | Collection |
| `collection_description` | string | Collection description | `'Our top products...'` | Collection |
| `product_id` | string | Product ID | `'123456'` | Product |
| `product_handle` | string | Product handle | `'widget'` | Product |
| `product_type` | string | Product type | `'Widgets'` | Product |
| `product_vendor` | string | Product vendor | `'ACME Corp'` | Product |
| `product_collections` | array | Collection handles | `['featured', 'widgets']` | Product |
| `search_term` | string | Search query | `'blue widgets'` | Search |
| `search_results_count` | number | Number of results | `12` | Search |

---

## GTM Implementation Guide

### Overview

The enhanced GTM container includes comprehensive tracking for GA4, Google Ads, and Meta Pixel. This section guides you through importing and configuring the container.

### Container Structure

**Workspace Name:** JY Insights Gold Plus Enhanced v2.0

**Components:**
- **17 GA4 Event Tags** - Core ecommerce tracking
- **10 Google Ads Tags** - Conversion and remarketing
- **8 Meta Pixel Tags** - Facebook marketing
- **50+ Variables** - DataLayer variables, constants, and custom JavaScript
- **20+ Triggers** - Custom event and page view triggers
- **5 Built-in Variables** - Page URL, path, hostname, referrer, event

### Import Instructions

1. **Export Current Container (Backup):**
   ```
   GTM Admin → Export Container → Choose Version → Export
   Save as: gold-gtm-container-ga4-v1.4-backup.json
   ```

2. **Import Enhanced Container:**
   ```
   GTM Admin → Import Container
   Choose file: gold-gtm-container-ga4-enhanced.json
   Choose workspace: "New" (recommended) or "Existing"
   Import option: "Merge" (to preserve existing tags) or "Overwrite" (clean slate)
   ```

3. **Configure Constants:**

   Navigate to Variables and update these constants:

   - `Const - GA4 Measurement ID`
     - Value: Your GA4 Measurement ID (format: `G-XXXXXXXXXX`)

   - `Const - Google Ads Conversion ID`
     - Value: Your Google Ads account ID (format: `AW-XXXXXXXXXX`)

   - `Const - Google Ads Conversion Label`
     - Value: Your purchase conversion label

   - `Const - Meta Pixel ID`
     - Value: Your Facebook Pixel ID (numeric)

4. **Test in Preview Mode:**
   ```
   GTM → Submit → Preview
   Visit your Shopify store
   Complete test transactions
   Verify events in GTM Debug Console and GA4 DebugView
   ```

5. **Publish:**
   ```
   GTM → Submit → Version Name: "Enhanced v2.0 - Initial Deployment"
   Add version description
   Publish
   ```

### Tag Naming Convention

Tags follow this structure: `[Platform] - [Type] - [Event Name]`

**Examples:**
- `GA4 - Event - page_view`
- `GA4 - Event - purchase`
- `Google Ads - Conversion - Purchase`
- `Meta Pixel - Event - Purchase`

### Variable Naming Convention

Variables follow this structure: `[Type] - [Name]`

**Types:**
- `Const` - Constant values (IDs, settings)
- `DLV` - DataLayer Variable
- `Event` - Event-scoped dataLayer variable
- `CJS` - Custom JavaScript Variable
- `Lookup` - Lookup Table Variable

**Examples:**
- `Const - GA4 Measurement ID`
- `DLV - ecommerce.items`
- `DLV - user_data.logged_in`
- `Event - search_term`
- `CJS - Current Timestamp`

### Trigger Naming Convention

Triggers follow this structure: `[Type] - [Event Name]`

**Types:**
- `CE` - Custom Event
- `PV` - Page View
- `Click` - Click Trigger
- `Form` - Form Submission

**Examples:**
- `CE - purchase`
- `CE - add_to_cart`
- `PV - All Pages`
- `PV - Product Pages`

---

## DataLayer Implementation Guide

### Installation Steps

#### Step 1: Backup Current Theme

```
Shopify Admin → Online Store → Themes
Click "..." menu → Duplicate
Rename duplicate: "Backup - [Date]"
```

#### Step 2: Add Enhanced DataLayer

1. Navigate to your theme files:
   ```
   Shopify Admin → Online Store → Themes → Actions → Edit code
   ```

2. Open `theme.liquid`

3. **Option A: Side-by-Side Testing (Recommended)**

   Add BOTH files before `</head>`:
   ```liquid
   <!-- Current Production DataLayer -->
   {% render 'gold-storefront-datalayer-GA4' %}

   <!-- Enhanced DataLayer (Testing) -->
   <!-- Uncomment to enable enhanced tracking -->
   <!-- {% render 'gold-storefront-datalayer-GA4-enhanced' %} -->
   ```

4. **Option B: Direct Replacement**

   Replace existing DataLayer before `</head>`:
   ```liquid
   <!-- Enhanced DataLayer -->
   {% render 'gold-storefront-datalayer-GA4-enhanced' %}
   ```

5. Update GTM Container ID:

   Open `gold-storefront-datalayer-GA4-enhanced.liquid` (in Snippets folder)

   Line 71:
   ```javascript
   })(window,document,'script','dataLayer','GTM-K9JX87Z6'); // ← Replace with your GTM ID
   ```

#### Step 3: Theme Testing

1. **Use Theme Preview:**
   ```
   Themes → Actions → Preview
   ```

2. **Test Core Flows:**
   - Browse collection pages
   - View product pages
   - Add to cart
   - View cart
   - Complete test purchase (use Shopify's test payment)

3. **Verify in Browser Console:**
   ```javascript
   // Check dataLayer exists
   console.log(window.dataLayer);

   // Check events
   window.dataLayer.filter(item => item.event);
   ```

4. **Verify in GTM Preview:**
   - Enable GTM Preview mode
   - Browse site with Preview active
   - Check Tags, Triggers, Variables in debug panel

#### Step 4: Go Live

Once testing is complete:

1. **Publish Theme:**
   ```
   Themes → Actions → Publish
   ```

2. **Monitor for 24 Hours:**
   - Check GA4 Realtime reports
   - Check GA4 DebugView (if debug mode enabled)
   - Monitor for JavaScript errors in browser console

---

## Pixel Implementation Guide

### Installation Steps

#### Step 1: Access Customer Events

```
Shopify Admin → Settings → Customer Events
```

#### Step 2: Create Custom Pixel

1. Click "Add Custom Pixel"
2. Name: `JY Insights Gold Plus Checkout Enhanced`
3. Paste contents of `gold-checkout-pixel-GA4-enhanced.js`
4. Update GTM Container ID (Line 23):
   ```javascript
   gtmContainerId: 'GTM-K9JX87Z6' // Replace with your GTM ID
   ```

#### Step 3: Configure Permissions

The pixel requires these permissions (auto-requested):
- Customer data access
- Analytics API access

Click "Grant" when prompted.

#### Step 4: Test Pixel

1. **Enable Test Mode:**
   ```
   Customer Events → [Your Pixel] → Test Mode → Enable
   ```

2. **Complete Test Purchase:**
   - Use Shopify's test gateway
   - Complete full checkout flow
   - Check browser console for `[JY Gold Plus Checkout Enhanced]` logs

3. **Verify Events:**
   ```javascript
   // In browser console on thank you page:
   window.dataLayer.filter(item => item.event === 'purchase');
   ```

4. **Check GTM:**
   - Enable GTM Preview
   - Complete test checkout
   - Verify checkout events fire in GTM debug console

#### Step 5: Deploy to Production

1. **Disable Test Mode:**
   ```
   Customer Events → [Your Pixel] → Test Mode → Disable
   ```

2. **Publish Pixel:**
   ```
   Customer Events → [Your Pixel] → Save
   ```

3. **Monitor:**
   - Check GA4 for purchase events
   - Verify Google Ads conversions
   - Verify Meta Pixel events in Events Manager

---

## QA Testing Checklist

### Pre-Launch Testing

#### Storefront Events

- [ ] **Page View**
  - [ ] Fires on all page types
  - [ ] Contains correct `page_type`
  - [ ] Contains `user_logged_in` status
  - [ ] Contains `user_type`

- [ ] **User Data Ready**
  - [ ] Fires once per session
  - [ ] Contains hashed email (logged in users)
  - [ ] Contains RFM metrics (logged in users)
  - [ ] Does NOT contain raw PII on storefront

- [ ] **Page Data Ready**
  - [ ] Fires once per session
  - [ ] Contains correct template data
  - [ ] Contains collection data (collection pages)
  - [ ] Contains product data (product pages)
  - [ ] Contains search data (search pages)

- [ ] **View Item List**
  - [ ] Fires on collection pages
  - [ ] Fires on search results
  - [ ] Contains all products
  - [ ] Each product has correct index
  - [ ] Contains `item_list_id` and `item_list_name`
  - [ ] Products have `product_handle` and `category_handle`

- [ ] **Select Item**
  - [ ] Fires when clicking product from collection
  - [ ] Fires when clicking product from search
  - [ ] Contains single product
  - [ ] Contains list attribution
  - [ ] Saves to sessionStorage

- [ ] **View Item**
  - [ ] Fires on product detail page (`view_type: 'pdp'`)
  - [ ] Fires on quick view modal (`view_type: 'quick_view'`)
  - [ ] Contains category data
  - [ ] Contains product handle
  - [ ] Quick view includes list attribution

- [ ] **Add to Cart**
  - [ ] Fires from product page (`context: 'pdp'`)
  - [ ] Fires from collection quick-add (`context: 'collection_quick_add'`)
  - [ ] Fires from quick view (`context: 'quick_view'`)
  - [ ] Contains correct quantity
  - [ ] Contains correct value (price × quantity)
  - [ ] Contains category data
  - [ ] Collection quick-add includes list attribution

- [ ] **Remove from Cart**
  - [ ] Fires from cart page
  - [ ] Fires from cart drawer
  - [ ] Contains correct product
  - [ ] Contains correct quantity

- [ ] **View Cart**
  - [ ] Fires on cart page (`cart_type: 'page'`)
  - [ ] Fires when cart drawer opens (`cart_type: 'drawer'`)
  - [ ] Contains all cart items
  - [ ] Contains `cart_total_value`
  - [ ] Contains `cart_total_quantity`
  - [ ] Correct `trigger` value ('auto' or 'manual')

- [ ] **Search**
  - [ ] Fires on search results page
  - [ ] Contains search term
  - [ ] Contains results count

#### Checkout Events

- [ ] **Begin Checkout**
  - [ ] Fires on checkout page load
  - [ ] Contains all cart items
  - [ ] Contains coupon (if applied)
  - [ ] Contains list attribution for items
  - [ ] Products have discount amounts (if applicable)

- [ ] **Add Contact Info**
  - [ ] Fires after email submission
  - [ ] Contains email_provided status

- [ ] **Add Shipping Info**
  - [ ] Fires after address submission (`shipping_tier: 'not_selected'`)
  - [ ] Fires after method selection (actual shipping method name)
  - [ ] Contains coupon

- [ ] **Add Payment Info**
  - [ ] Fires after payment info submission
  - [ ] Contains payment_type
  - [ ] Contains coupon

- [ ] **Purchase**
  - [ ] Fires on thank you page
  - [ ] Contains complete user_data with PII
  - [ ] Contains complete order_data
  - [ ] Contains transaction_id
  - [ ] Contains order_name
  - [ ] Contains checkout_id
  - [ ] Contains tax
  - [ ] Contains shipping
  - [ ] Contains discount_amount
  - [ ] Contains coupon
  - [ ] Contains payment_type
  - [ ] Contains shipping_method
  - [ ] Contains total_quantity
  - [ ] User data includes email (raw + hashed)
  - [ ] User data includes phone (raw + hashed)
  - [ ] User data includes complete address object
  - [ ] Order data includes subtotal
  - [ ] All items have discount amounts (if applicable)

### GTM Tag Testing

#### GA4 Tags

- [ ] **Configuration Tag**
  - [ ] Fires on all pages
  - [ ] Sets user properties (logged_in, customer_type, orders_count)

- [ ] **Event Tags**
  - [ ] All event tags fire for corresponding events
  - [ ] Parameters populate correctly
  - [ ] Items array formats correctly
  - [ ] Currency is correct
  - [ ] Values are correct

#### Google Ads Tags

- [ ] **Conversion Linker**
  - [ ] Fires on all pages

- [ ] **Purchase Conversion**
  - [ ] Fires on purchase event
  - [ ] Contains order ID
  - [ ] Contains value
  - [ ] Contains currency

#### Meta Pixel Tags

- [ ] **Base Code**
  - [ ] Fires on all pages (once)

- [ ] **Purchase Event**
  - [ ] Fires on purchase event
  - [ ] Contains value
  - [ ] Contains currency
  - [ ] Contains content_ids array

### Cross-Browser Testing

Test in these browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Device Testing

- [ ] Desktop
- [ ] Tablet
- [ ] Mobile (iOS)
- [ ] Mobile (Android)

---

## Troubleshooting Guide

### Common Issues

#### Issue 1: DataLayer Not Defined

**Symptoms:**
- Console error: `dataLayer is not defined`
- No events firing

**Causes:**
- DataLayer script not loaded
- Script loading after GTM

**Solutions:**
1. Verify dataLayer script is in `theme.liquid` before `</head>`
2. Check script is inside `<script>` tags
3. Verify GTM script loads AFTER dataLayer initialization
4. Check for JavaScript syntax errors

**Verification:**
```javascript
// In browser console:
typeof dataLayer; // Should return "object"
dataLayer; // Should show array of events
```

---

#### Issue 2: Events Not Firing

**Symptoms:**
- Events don't appear in GTM preview
- Events don't appear in GA4 DebugView

**Causes:**
- Trigger not configured correctly
- Event name mismatch
- Tag not firing

**Solutions:**
1. **Check Event Name:**
   ```javascript
   // In console, check recent events:
   dataLayer.filter(item => item.event).slice(-5);
   ```

2. **Check GTM Trigger:**
   - Open GTM Preview
   - Check "Tags Not Fired" section
   - Click trigger name to see why it didn't match

3. **Check Tag Configuration:**
   - Verify tag has correct trigger
   - Check tag is not paused
   - Verify tag has no blocking triggers

4. **Check Variable Values:**
   - In GTM Preview, click "Variables" tab
   - Verify dataLayer variables populate

---

#### Issue 3: Missing Parameters

**Symptoms:**
- Events fire but parameters are `undefined`
- GA4 shows events without ecommerce data

**Causes:**
- DataLayer variable not configured
- Incorrect variable path
- Data not present in dataLayer

**Solutions:**
1. **Check DataLayer Structure:**
   ```javascript
   // In console, find the event:
   let purchaseEvent = dataLayer.find(item => item.event === 'purchase');
   console.log(purchaseEvent);
   // Verify ecommerce object exists and has expected structure
   ```

2. **Check GTM Variable:**
   - GTM → Variables → Click variable name
   - Verify "Data Layer Variable Name" matches actual structure
   - Example: `ecommerce.items` (not `ecommerce.item` or `items`)

3. **Check Data Type:**
   - In GTM Preview, click event → Variables tab
   - Find your variable
   - If it shows `undefined`, the path is wrong

4. **Common Variable Paths:**
   ```
   ecommerce.items
   ecommerce.value
   ecommerce.currency
   ecommerce.transaction_id
   user_data.logged_in
   user_data.email_sha256
   page_data.page_type
   ```

---

#### Issue 4: Checkout Events Not Firing

**Symptoms:**
- Storefront events work
- Checkout events don't appear in GTM

**Causes:**
- Pixel not deployed
- GTM not loading in iframe
- Pixel error

**Solutions:**
1. **Check Pixel Status:**
   ```
   Shopify Admin → Settings → Customer Events
   Verify pixel is "Active" (not "Draft" or "Paused")
   ```

2. **Check Pixel Logs:**
   - Open checkout page
   - Open browser console
   - Look for `[JY Gold Plus Checkout Enhanced]` logs
   - If logs appear, pixel is working

3. **Check GTM in Iframe:**
   ```javascript
   // In checkout console:
   typeof gtm; // Should return "function" or "object"
   window.dataLayer; // Should show array
   ```

4. **Enable Debug Mode:**
   - Edit pixel code
   - Change `debug: false` to `debug: true` (line 17)
   - Save and test again
   - Check console for detailed logs

---

#### Issue 5: Purchase Event Missing User Data

**Symptoms:**
- Purchase event fires
- user_data is empty or missing PII

**Causes:**
- Checkout pixel not collecting address data
- Address fields not available

**Solutions:**
1. **Check Data Availability:**
   - Pixel logs should show address data
   - If logs show `address: {}`, data isn't available

2. **Check Shopify Checkout Settings:**
   - Some checkout customizations hide address fields
   - Verify address fields are required and visible

3. **Check formatCustomerData Function:**
   - Verify function correctly extracts shipping vs billing address
   - Check fallback logic

4. **Verify on Thank You Page:**
   ```javascript
   // On thank you page, check:
   dataLayer.find(item => item.event === 'purchase').user_data;
   // Should show full address object
   ```

---

#### Issue 6: Duplicate Events

**Symptoms:**
- Same event fires twice
- GA4 shows inflated numbers

**Causes:**
- Multiple pixels installed
- Multiple dataLayer scripts
- Tag fires on multiple triggers

**Solutions:**
1. **Check for Multiple Pixels:**
   ```
   Shopify Admin → Settings → Customer Events
   Verify only ONE pixel is active
   Disable/delete old pixels
   ```

2. **Check for Multiple DataLayers:**
   - Search theme code for "dataLayer"
   - Should only appear in your enhanced snippet
   - Remove duplicates

3. **Check Tag Triggers:**
   - GTM → Click tag → Triggering section
   - Should have ONE trigger per tag
   - If multiple triggers, consolidate

4. **Check Event Deduplication:**
   ```javascript
   // Enhanced code includes deduplication for cart drawer:
   if (window._cartDrawerTracked && Date.now() - window._cartDrawerTracked < 3000) {
     return; // Prevents duplicate within 3 seconds
   }
   ```

---

### Debugging Tools

#### Browser Console

**View DataLayer:**
```javascript
dataLayer
```

**Filter Events:**
```javascript
dataLayer.filter(item => item.event)
```

**Find Specific Event:**
```javascript
dataLayer.find(item => item.event === 'purchase')
```

**Watch DataLayer in Real-Time:**
```javascript
(function() {
  let originalPush = dataLayer.push;
  dataLayer.push = function() {
    console.log('DataLayer Push:', arguments[0]);
    return originalPush.apply(dataLayer, arguments);
  };
})();
```

#### GTM Preview Mode

1. **Enable:**
   ```
   GTM → Preview
   Enter your store URL
   Click "Start"
   ```

2. **Navigate:**
   - Left panel shows all events
   - Click event to see:
     - Tags Fired
     - Tags Not Fired
     - Variables
     - DataLayer state

3. **Debug Tag Issues:**
   - Click "Tags Not Fired"
   - Click tag name
   - See "Why didn't this tag fire?"
   - Shows which trigger conditions failed

#### GA4 DebugView

1. **Enable:**
   - GTM: Add `debug_mode: true` to GA4 config tag parameters
   - OR: Install Google Analytics Debugger Chrome extension

2. **Access:**
   ```
   GA4 Property → Configure → DebugView
   ```

3. **Features:**
   - Real-time event stream
   - Event parameters
   - User properties
   - Error messages

4. **Verify Event:**
   - Look for event name in stream
   - Click event to expand parameters
   - Verify all parameters present and correct

#### Network Tab

1. **Open Developer Tools:**
   ```
   Right-click → Inspect → Network tab
   ```

2. **Filter Requests:**
   - Search: `collect` (for GA4)
   - Search: `gtm` (for GTM)
   - Search: `facebook` (for Meta Pixel)

3. **Check Payloads:**
   - Click request → Payload tab
   - Verify data is being sent
   - Check for errors (4xx, 5xx responses)

---

## Mapping Tables

### Event Mapping: Shopify → GA4

| Shopify Event | GA4 Event | Notes |
|---------------|-----------|-------|
| Page load | `page_view` | All pages |
| Collection view | `view_item_list` | Product collections |
| Search results | `view_search_results` + `search` | Search pages |
| Product page view | `view_item` | `view_type: 'pdp'` |
| Quick view | `view_item` | `view_type: 'quick_view'` |
| Product click | `select_item` | From collections/search |
| Add to cart | `add_to_cart` | Multiple contexts |
| Remove from cart | `remove_from_cart` | Cart page/drawer |
| View cart | `view_cart` | Cart page/drawer |
| Begin checkout | `begin_checkout` | Checkout start |
| Contact info | `add_contact_info` | Custom event |
| Shipping address | `add_shipping_info` | Address step |
| Shipping method | `add_shipping_info` | Method selection |
| Payment info | `add_payment_info` | Payment step |
| Purchase | `purchase` | Thank you page |

### Event Mapping: GA4 → Google Ads

| GA4 Event | Google Ads Event | Conversion Type |
|-----------|------------------|-----------------|
| `page_view` | PageView | Remarketing |
| `view_item_list` | ViewItemList | Remarketing |
| `view_item` | ViewItem | Remarketing + Conversion |
| `add_to_cart` | AddToCart | Remarketing + Conversion |
| `begin_checkout` | BeginCheckout | Conversion |
| `purchase` | Purchase | Conversion |

### Event Mapping: GA4 → Meta Pixel

| GA4 Event | Meta Pixel Event | Notes |
|-----------|------------------|-------|
| `page_view` | PageView | Standard |
| `view_item` | ViewContent | Product views |
| `add_to_cart` | AddToCart | Cart additions |
| `begin_checkout` | InitiateCheckout | Checkout start |
| `add_payment_info` | AddPaymentInfo | Payment step |
| `purchase` | Purchase | Conversions |
| `search` | Search | Search queries |

### Parameter Mapping: Enhanced → GA4 Standard

| Enhanced Parameter | GA4 Standard | Notes |
|-------------------|--------------|-------|
| `product_id` | Not standard | Custom parameter |
| `variant_id` | Not standard | Custom parameter |
| `item_id` | `item_id` | Uses variant ID |
| `item_name` | `item_name` | Product title |
| `item_brand` | `item_brand` | Vendor |
| `item_category` | `item_category` | Product type |
| `item_variant` | `item_variant` | Variant title |
| `price` | `price` | Unit price |
| `quantity` | `quantity` | Item quantity |
| `currency` | `currency` | ISO currency code |
| `sku` | Not standard | Custom parameter |
| `g_product_id` | Not standard | Custom for Google Shopping |
| `product_handle` | Not standard | Custom parameter |
| `category_id` | Not standard | Custom parameter |
| `category_name` | Not standard | Custom parameter |
| `category_handle` | Not standard | Custom parameter |
| `product_type` | Not standard | Custom parameter |
| `item_list_id` | `item_list_id` | GA4 standard |
| `item_list_name` | `item_list_name` | GA4 standard |
| `index` | `index` | GA4 standard |
| `discount` | `discount` | GA4 standard |

**Notes on GA4 Standards:**
- GA4 has recommended parameters: `item_id`, `item_name`, `item_brand`, `item_category`, `item_variant`, `price`, `quantity`, `currency`, `item_list_id`, `item_list_name`, `index`, `discount`
- Custom parameters appear in GA4 but may not have built-in reports
- Use custom dimensions to surface custom parameters in reports

---

## Version History

### Version 2.0 Enhanced (2026-01-09)

**Status:** Enhanced Release

**Changes:**

**User Tracking:**
- Added SHA1 hashing for emails and phones (in addition to SHA256)
- Added RFM metrics (Recency, Frequency, Monetary value)
- Added complete address object structure on purchase event
- Added user tagging system for segmentation
- Added last_order_date tracking
- Added page_currency_rate for multi-currency support
- Enhanced privacy controls (PII only on thank you page)

**Product Tracking:**
- Added product_handle (URL-safe identifier)
- Added category_handle (collection handle)
- Added explicit category_id and category_name
- Added product_position tracking
- Added product_type as explicit parameter
- Enhanced variant information
- Improved g_product_id generation

**Order Tracking:**
- Added order_name (e.g., #AB1234)
- Added checkout_id (checkout token)
- Added subtotal (before tax/shipping)
- Added total discount_amount calculation
- Added payment_type tracking
- Added shipping_method tracking
- Added total_quantity calculation
- Added presentment money support (multi-currency)

**Event Enhancements:**
- Enhanced view_item with view_type parameter ('pdp' vs 'quick_view')
- Enhanced add_to_cart with context parameter ('pdp', 'quick_view', 'collection_quick_add')
- Enhanced view_cart with cart_type and trigger parameters
- Enhanced all checkout events with comprehensive order data
- Added cart_total_value and cart_total_quantity to view_cart
- Improved list attribution persistence via sessionStorage

**Technical Improvements:**
- Added comprehensive SHA1 hash function
- Improved error handling and logging
- Enhanced debug mode with detailed console logs
- Improved code documentation
- Added inline code comments
- Optimized performance

**Files:**
- `gold-storefront-datalayer-GA4-enhanced.liquid` (v2.0)
- `gold-checkout-pixel-GA4-enhanced.js` (v2.0)
- `gold-gtm-container-ga4-enhanced.json` (v2.0)
- `solution-design-reference-enhanced.md` (v2.0)

---

### Version 1.7 (2026-01-07)

**Status:** Current Production Release (Checkout Pixel)

**Changes:**
- Fixed context events (user_data_ready, page_data_ready, page_view) not firing
- Moved context events from page_viewed to checkout_started subscriber
- Added contextEventsSent flag to prevent duplicate context events
- Added logged_in status persistence via sessionStorage
- Checkout pixel now reads logged_in from storefront if customer is undefined
- Fixes issue where logged-in customers appear as guests in checkout

**Files:**
- `gold-checkout-pixel-GA4.js` (v1.7)

---

### Version 1.4 (2026-01-06)

**Status:** Current Production Release (Storefront)

**Changes:**
- Added sessionStorage persistence for logged_in status
- Storefront now saves logged_in to sessionStorage for checkout pixel
- Ensures consistent user tracking across storefront and checkout
- Fixes issue where logged-in customers appear as guests in checkout

**Files:**
- `gold-storefront-datalayer-GA4.liquid` (v1.4)
- `gold-gtm-container-ga4.json` (v1.4)

---

### Migration Path: v1.4/v1.7 → v2.0 Enhanced

**Preparation:**
1. Review this solution design reference completely
2. Test in development/staging environment
3. Create theme backup
4. Export current GTM container

**Implementation:**
1. Deploy enhanced storefront dataLayer (keep current version)
2. Deploy enhanced checkout pixel (keep current version)
3. Import enhanced GTM container (merge with current)
4. Test all events in preview mode
5. Enable enhanced versions gradually
6. Monitor for 48 hours
7. Disable old versions once confident

**Rollback Plan:**
1. If issues arise, immediately disable enhanced versions
2. Re-enable current versions
3. Investigate issues
4. Fix and redeploy

---

## Support and Resources

### Contact Information

**Email:** contact@jyinsights.com
**Documentation:** This file
**Implementation Package:** JY Insights Gold Plus Enhanced v2.0

### Additional Resources

**Shopify Documentation:**
- [Web Pixels API](https://shopify.dev/docs/api/web-pixels-api)
- [Customer Events](https://shopify.dev/docs/api/customer-events)
- [Liquid Documentation](https://shopify.dev/docs/api/liquid)

**Google Analytics 4:**
- [GA4 Documentation](https://support.google.com/analytics/answer/9964640)
- [Ecommerce Events](https://support.google.com/analytics/answer/9267735)
- [DebugView](https://support.google.com/analytics/answer/7201382)

**Google Tag Manager:**
- [GTM Documentation](https://support.google.com/tagmanager)
- [Preview Mode](https://support.google.com/tagmanager/answer/6107056)

**Google Ads:**
- [Conversion Tracking](https://support.google.com/google-ads/answer/1722054)
- [Enhanced Conversions](https://support.google.com/google-ads/answer/9888656)

**Meta (Facebook):**
- [Meta Pixel Documentation](https://developers.facebook.com/docs/meta-pixel)
- [Conversions API](https://developers.facebook.com/docs/marketing-api/conversions-api)

---

## Appendix A: Event Sequence Example

### Complete User Journey

```
1. User lands on homepage
   → page_view (context: 'storefront', page_type: 'index')
   → user_data_ready (with hashed email if logged in)
   → page_data_ready (with page context)

2. User browses collection
   → page_view (page_type: 'collection')
   → view_item_list (20 products, list attribution saved)

3. User clicks product
   → select_item (list attribution saved to sessionStorage)

4. User views product detail page
   → page_view (page_type: 'product')
   → view_item (view_type: 'pdp', with category data)

5. User adds to cart
   → add_to_cart (context: 'pdp', quantity: 2)
   → Cart drawer opens
   → view_cart (cart_type: 'drawer', trigger: 'auto')

6. User clicks cart icon
   → view_cart (cart_type: 'drawer', trigger: 'manual')

7. User navigates to cart page
   → page_view (page_type: 'cart')
   → view_cart (cart_type: 'page')

8. User removes item
   → remove_from_cart

9. User clicks checkout
   → Redirects to checkout

10. Checkout page loads
    → page_view (context: 'checkout', page_type: 'checkout')
    → user_data_ready (checkout context)
    → page_data_ready (checkout context)
    → begin_checkout (with all cart items + list attribution)

11. User enters email
    → add_contact_info (email_provided: true)

12. User enters shipping address
    → add_shipping_info (shipping_tier: 'not_selected')

13. User selects shipping method
    → add_shipping_info (shipping_tier: 'Standard Shipping')

14. User enters payment info
    → add_payment_info (payment_type: 'Shopify Payments')

15. User completes purchase
    → purchase (with FULL user_data including PII, order_data, ecommerce)
```

**Total Events:** 15 events across complete journey

**DataLayer Size:** ~50-100 KB depending on cart size

**GTM Tags Fired:** ~40 tags (GA4, Google Ads, Meta Pixel) across journey

---

## Appendix B: Privacy & Compliance

### Data Collection Levels

**Level 1: Public (All Pages)**
- Hashed identifiers (email_sha256, email_sha1, phone_sha256, phone_sha1)
- Aggregated metrics (orders_count, lifetime_value)
- Privacy-safe data (city lowercase, state code, country code, zip)
- Product data (public catalog information)
- Behavioral data (page views, clicks, cart actions)

**Level 2: Checkout (Checkout Pages)**
- All Level 1 data
- Shipping address (full)
- Billing address (full)
- Name (full)
- Email (raw, plus hashed)
- Phone (raw, plus hashed)

**Level 3: Thank You (Post-Purchase Only)**
- All Level 1 & 2 data
- Complete order details
- Payment information (type, not card details)
- User consent for marketing (accepts_marketing flag)

### Consent Management

**Required:**
- Implement cookie consent banner
- Obtain consent before firing marketing tags (Google Ads, Meta Pixel)
- Use GTM Consent Mode (Google's consent framework)

**Recommended Configuration:**
```javascript
// In GTM, add consent initialization:
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

// Set default consent state
gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied'
});

// After user grants consent:
gtag('consent', 'update', {
  'analytics_storage': 'granted',
  'ad_storage': 'granted',
  'ad_user_data': 'granted',
  'ad_personalization': 'granted'
});
```

### GDPR Compliance

- Hash all emails and phones before storage
- Never store raw PII in cookies/localStorage
- Provide opt-out mechanism
- Respect Do Not Track signals
- Include privacy policy link in checkout

### CCPA Compliance

- Provide "Do Not Sell My Personal Information" link
- Honor opt-out requests
- Maintain data inventory
- Respond to data access requests

### Shopify Compliance

- All data collection follows Shopify's Web Pixels API guidelines
- Checkout pixel runs in sandboxed iframe (secure)
- No access to credit card or sensitive payment data
- Complies with Shopify's privacy requirements

---

## Appendix C: Performance Optimization

### DataLayer Performance

**Script Size:**
- Enhanced Storefront DataLayer: ~52 KB (compressed: ~15 KB)
- Enhanced Checkout Pixel: ~26 KB (compressed: ~8 KB)
- Total: ~78 KB uncompressed, ~23 KB compressed

**Load Time Impact:**
- Async loading: No blocking
- Execution time: <50ms on modern browsers
- No impact on Time to Interactive (TTI)
- No impact on Largest Contentful Paint (LCP)

**Optimization Techniques Used:**
- Lazy GTM loading (only on checkout)
- Event debouncing (cart drawer)
- Efficient DOM queries
- Minimal Shopify API calls

### GTM Container Performance

**Container Size:**
- Enhanced container: ~150 KB (compressed: ~40 KB)
- Tags: 35 total (17 GA4, 10 Google Ads, 8 Meta Pixel)
- Variables: 50+ custom variables
- Triggers: 20+ custom triggers

**Performance Tips:**
- Use trigger exceptions to reduce unnecessary tag fires
- Consolidate similar tags where possible
- Use Tag Sequencing to control load order
- Enable Tag Firing Priority for critical tags

### Monitoring Performance

**Metrics to Track:**
1. Page Load Time (Shopify Analytics)
2. Time to Interactive (Google PageSpeed Insights)
3. Largest Contentful Paint (Web Vitals)
4. DataLayer Event Volume (GTM)
5. Tag Fire Count (GTM)

**Target Metrics:**
- Page load time: <3 seconds
- Time to Interactive: <5 seconds
- LCP: <2.5 seconds
- DataLayer pushes per session: <50
- Tag fires per session: <100

---

## Document End

**Version:** 2.0 Enhanced
**Last Updated:** 2026-01-09
**Total Pages:** 60+
**Word Count:** ~25,000

---

*This document is part of the JY Insights Gold Plus Enhanced package. Unauthorized distribution prohibited.*

*© 2026 JY Insights. All rights reserved.*
