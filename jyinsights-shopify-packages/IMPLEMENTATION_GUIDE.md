# Implementation Guide - jyinsights Shopify Packages

**Complete implementation guide for Analyzify-enhanced GA4 tracking**

Version 3.0 | Last Updated: December 31, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [What's New in v3.0](#whats-new-in-v30)
3. [Analyzify Parameter Alignment](#analyzify-parameter-alignment)
4. [Installation Instructions](#installation-instructions)
5. [GTM Container Setup](#gtm-container-setup)
6. [Data Layer Parameters Reference](#data-layer-parameters-reference)
7. [Event Tracking Matrix](#event-tracking-matrix)
8. [Theme Hyper 2.0 Compatibility](#theme-hyper-20-compatibility)
9. [Validation & Debugging](#validation--debugging)
10. [Troubleshooting](#troubleshooting)
11. [Advanced Configuration](#advanced-configuration)

---

## Overview

This implementation guide covers both the **Gold** and **Silver** packages from jyinsights. The implementation aligns with Analyzify's dataLayer standards, providing comprehensive GA4 ecommerce tracking for Shopify stores that covers the complete customer journey from browsing to purchase.

### Package Architecture

**Gold Package (Hybrid):**
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

**Silver Package (GTM Method):**
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

**Silver Package (Direct Method):**
```
All Pages
    ↓
Custom Pixel
    ↓ (fetch)
Google Analytics 4
(Measurement Protocol)
```

### Key Components

#### Gold Package
- **Storefront DataLayer** (`gold-storefront-datalayer-enhanced.liquid`) - Handles pre-checkout tracking
- **Checkout Pixel** (`gold-checkout-pixel-enhanced.js`) - Handles checkout and purchase tracking
- **GTM Container** - Pre-configured tags, triggers, and variables
- **Validation Tools** (`datalayer-validator.js`) - Debug console and parameter checker

#### Silver Package
- **Checkout Pixel** (`silver-checkout-pixel-enhanced.js`) - Handles all tracking via Web Pixel API
- **GTM Container** - Pre-configured (for GTM method only)
- Uses dual tracking methods: GTM or Direct to GA4

---

## What's New in v3.0

### Analyzify Alignment

✅ **Complete Parameter Coverage**
- `product_id`, `variant_id`, `product_name`, `product_brand`, `product_sku`
- `category_id`, `category_name` for product categorization
- `g_product_id` for Google Ads compatibility (format: `shopify_{country}_{product_id}_{variant_id}`)

✅ **Enhanced Customer Tracking (RFM Model)**
- `user_id` - Shopify customer ID
- `user_eh` - SHA-256 hashed email (primary)
- `email_sha1` - SHA-1 hashed email (secondary)
- `user_r` - Recency (last order date)
- `user_f` - Frequency (total orders count)
- `user_m` - Monetary (total spent)
- `user_type` - Customer type (`member` or `visitor`)

✅ **Transaction Parameters**
- `order_id`, `order_name`, `checkout_id`
- `totalValue`, `totalQuantity`
- `discount_amount`, `discount_codes[]`, `coupon`
- `payment_type`, `shipping_method`, `shipping_tier`

✅ **Enhanced Events**
- `sh_info` - Base event fired on all pages (Analyzify standard)
- `add_contact_info` - Contact information submission
- `ee_purchase` - Enhanced ecommerce purchase (dual event with `purchase`)

### Theme Hyper 2.0 Compatibility (Gold Package)

✅ Custom event listeners for Hyper 2.0 cart interactions
✅ Enhanced product card selectors
✅ Compatible with Hyper 2.0 theme structure

### Improved Debugging

✅ Enhanced console logging with log levels
✅ Parameter validation utilities
✅ Debug mode configuration

---

## Analyzify Parameter Alignment

### Product Parameters

| Analyzify Parameter | Implementation | Data Type | Description |
|-------------------|----------------|-----------|-------------|
| `product_id` | ✅ Implemented | String | Shopify product ID |
| `variant_id` | ✅ Implemented | String | Shopify variant ID |
| `product_name` | ✅ Implemented | String | Product title |
| `product_brand` | ✅ Implemented | String | Product vendor |
| `product_type` | ✅ Implemented | String | Product type |
| `product_sku` | ✅ Implemented | String | Variant SKU |
| `product_price` | ✅ Implemented | Number | Product price |
| `category_id` | ✅ Implemented | String | Category identifier |
| `category_name` | ✅ Implemented | String | Category name |
| `g_product_id` | ✅ Implemented | String | Google Ads product ID |

### Customer Parameters

| Analyzify Parameter | Implementation | Data Type | Description |
|-------------------|----------------|-----------|-------------|
| `user_id` | ✅ Implemented | String | Shopify customer ID |
| `user_type` | ✅ Implemented | String | `member` or `visitor` |
| `user_eh` | ✅ Implemented | String | SHA-256 hashed email |
| `email_sha1` | ✅ Implemented | String | SHA-1 hashed email |
| `user_r` | ✅ Implemented | String | Last order date (YYYY-MM-DD) |
| `user_f` | ✅ Implemented | Number | Total orders count |
| `user_m` | ✅ Implemented | Number | Total spent |
| `address` | ✅ Implemented | Object | Complete address object |

### Transaction Parameters

| Analyzify Parameter | Implementation | Data Type | Description |
|-------------------|----------------|-----------|-------------|
| `order_id` | ✅ Implemented | String | Order ID |
| `order_name` | ✅ Implemented | String | Order name/number |
| `checkout_id` | ✅ Implemented | String | Checkout token |
| `totalValue` | ✅ Implemented | Number | Total order value |
| `totalQuantity` | ✅ Implemented | Number | Total items quantity |
| `currency` | ✅ Implemented | String | Currency code (ISO 4217) |
| `tax` | ✅ Implemented | Number | Tax amount |
| `shipping` | ✅ Implemented | Number | Shipping cost |
| `discount_amount` | ✅ Implemented | Number | Total discount |
| `coupon` | ✅ Implemented | String | Coupon code(s) |
| `payment_type` | ✅ Implemented | String | Payment method |
| `shipping_method` | ✅ Implemented | String | Shipping method |

### Page Parameters

| Analyzify Parameter | Implementation | Data Type | Description |
|-------------------|----------------|-----------|-------------|
| `page_type` | ✅ Implemented | String | Page type identifier |
| `page_title` | ✅ Implemented | String | Page title |
| `page_path` | ✅ Implemented | String | URL path |
| `page_location` | ✅ Implemented | String | Full URL |

---

## Installation Instructions

### Gold Package Installation

#### Step 1: Storefront DataLayer Installation

1. **Open Theme Editor**
   - Go to Shopify Admin → Online Store → Themes
   - Click "Actions" → "Edit code" on your active theme

2. **Install DataLayer Snippet**
   - Navigate to `theme.liquid`
   - Locate the `</head>` closing tag
   - Insert `gold-storefront-datalayer-enhanced.liquid` content **before** `</head>`

3. **Configuration** (Optional)
   ```javascript
   var JYINSIGHTS_CONFIG = {
     debug: false,              // Set to true for console logging
     version: '3.0',
     packageName: 'Gold Enhanced (Analyzify)',
     maxCollectionProducts: 50, // Adjust if needed
     hashEmail: true,           // SHA-256 email hashing
     includeCategories: true,   // Category tracking
     useGoogleProductId: true,  // Google Ads product ID
     themeHyper2Compat: true    // Theme Hyper 2.0 support
   };
   ```

4. **Save the file**

#### Step 2: Checkout Pixel Installation

1. **Navigate to Customer Events**
   - Go to Shopify Admin → Settings → Customer Events
   - Click "Add custom pixel"

2. **Create New Pixel**
   - Name: "jyinsights Gold Enhanced Tracking"
   - Copy entire contents of `gold-checkout-pixel-enhanced.js`
   - Paste into the pixel code editor

3. **Configuration** (Optional)
   ```javascript
   const JYINSIGHTS_CONFIG = {
     debug: false,              // Set to true for console logging
     version: '3.0',
     packageName: 'Gold Enhanced (Analyzify)',
     usePostMessage: true,      // Communication method
     allowedOrigins: '*',       // IMPORTANT: Set to your domain in production
     useGoogleProductId: true,
     includeCategories: true
   };
   ```

4. **Save and Connect**
   - Click "Save"
   - Ensure pixel is "Connected"

#### Step 3: GTM Container Import

See [GTM Container Setup](#gtm-container-setup) section below.

---

### Silver Package Installation

#### Method 1: GTM Method

1. **Import GTM Container**
   - Go to [tagmanager.google.com](https://tagmanager.google.com)
   - Select your container
   - Navigate to Admin → Import Container
   - Choose `silver-gtm-container.json`
   - Select "Merge" with "Rename conflicting tags"
   - Click "Confirm"

2. **Configure GA4 Measurement ID**
   - Go to Variables
   - Edit `Const - GA4 Measurement ID`
   - Enter your GA4 measurement ID (format: `G-XXXXXXXXXX`)
   - Save

3. **Install Custom Pixel**
   - Go to Shopify Admin → Settings → Customer Events
   - Click "Add custom pixel"
   - Name: "jyinsights Silver Enhanced Tracking"
   - Copy entire contents of `silver-checkout-pixel-enhanced.js`
   - Paste into editor

4. **Configure Pixel**
   ```javascript
   const JYINSIGHTS_CONFIG = {
     trackingMethod: 'gtm',     // Use GTM method
     debug: false,
     // ... other settings
   };
   ```

5. **Save and Publish**
   - Save the pixel (ensure "Connected")
   - Publish GTM container

#### Method 2: Direct GA4 Method (No GTM)

1. **Create GA4 API Secret**
   - Go to GA4 Admin → Data Streams
   - Select your stream
   - Click "Measurement Protocol API secrets"
   - Create new secret
   - Copy the secret value

2. **Install Custom Pixel**
   - Go to Shopify Admin → Settings → Customer Events
   - Click "Add custom pixel"
   - Name: "jyinsights Silver Direct Tracking"
   - Copy entire contents of `silver-checkout-pixel-enhanced.js`
   - Paste into editor

3. **Configure Pixel for Direct Method**
   ```javascript
   const JYINSIGHTS_CONFIG = {
     trackingMethod: 'direct',           // Use direct method
     ga4MeasurementId: 'G-XXXXXXXXXX',   // Your GA4 ID
     ga4ApiSecret: 'XXXXXXXXXXXX',       // Your API secret
     debug: false
   };
   ```

4. **Save and Test**
   - Save the pixel (ensure "Connected")
   - Test using GA4 DebugView

---

## GTM Container Setup

### Quick Import Method

If you have the GTM container JSON file:

1. Go to GTM → Admin → Import Container
2. Select `gold-gtm-container.json` or `silver-gtm-container.json`
3. Choose "Merge" with "Rename conflicting tags"
4. Update the GA4 Measurement ID constant
5. Publish

### Manual Configuration

If you prefer to configure manually or need to understand the setup:

#### Step 1: Configure Variables

**1.1 Create Constant Variable**

- **Variable Name:** `Const - GA4 Measurement ID`
- **Variable Type:** Constant
- **Value:** `G-XXXXXXXXXX` (your GA4 measurement ID)

**1.2 Create DataLayer Variables**

Create the following Data Layer Variables (all use Data Layer Version 2):

**Ecommerce Variables:**

| Variable Name | Data Layer Variable Name |
|--------------|-------------------------|
| DLV - ecommerce.items | `ecommerce.items` |
| DLV - ecommerce.transaction_id | `ecommerce.transaction_id` |
| DLV - ecommerce.value | `ecommerce.value` |
| DLV - ecommerce.currency | `ecommerce.currency` |
| DLV - ecommerce.shipping | `ecommerce.shipping` |
| DLV - ecommerce.tax | `ecommerce.tax` |
| DLV - ecommerce.coupon | `ecommerce.coupon` |
| DLV - ecommerce.item_list_name | `ecommerce.item_list_name` |
| DLV - ecommerce.item_list_id | `ecommerce.item_list_id` |
| DLV - ecommerce.shipping_tier | `ecommerce.shipping_tier` |
| DLV - ecommerce.payment_type | `ecommerce.payment_type` |

**Customer Variables (Analyzify Enhanced):**

| Variable Name | Data Layer Variable Name | Default Value |
|--------------|-------------------------|---------------|
| DLV - user_id | `user_id` | (leave blank) |
| DLV - user_type | `user_type` | `visitor` |
| DLV - user_eh | `user_eh` | (leave blank) |
| DLV - email_sha1 | `email_sha1` | (leave blank) |
| DLV - user_r | `user_r` | (leave blank) |
| DLV - user_f | `user_f` | `0` |
| DLV - user_m | `user_m` | `0` |
| DLV - customer_email_sha256 | `customer_email_sha256` | (leave blank) |
| DLV - customer_logged_in | `customer_logged_in` | `false` |
| DLV - customer_orders_count | `customer_orders_count` | `0` |
| DLV - customer_total_spent | `customer_total_spent` | `0` |

**Page Variables:**

| Variable Name | Data Layer Variable Name |
|--------------|-------------------------|
| DLV - page_type | `page_type` |
| DLV - page_title | `page_title` |
| DLV - search_term | `search_term` |

**Transaction Variables (Analyzify):**

| Variable Name | Data Layer Variable Name |
|--------------|-------------------------|
| DLV - order_id | `order_id` |
| DLV - order_name | `order_name` |
| DLV - checkout_id | `checkout_id` |
| DLV - totalValue | `totalValue` |
| DLV - totalQuantity | `totalQuantity` |
| DLV - discount_amount | `discount_amount` |
| DLV - payment_type | `payment_type` |
| DLV - shipping_method | `shipping_method` |

**1.3 Enable Built-in Variables**

Enable these built-in variables:
- ✅ Page URL
- ✅ Page Hostname
- ✅ Page Path
- ✅ Referrer
- ✅ Event

#### Step 2: Create Triggers

Create the following Custom Event triggers:

| Trigger Name | Type | Condition |
|-------------|------|-----------|
| All Pages | Page View | All Page Views |
| CE - sh_info | Custom Event | Event equals `sh_info` |
| CE - page_view | Custom Event | Event equals `page_view` |
| CE - view_item_list | Custom Event | Event equals `view_item_list` |
| CE - select_item | Custom Event | Event equals `select_item` |
| CE - view_item | Custom Event | Event equals `view_item` |
| CE - search | Custom Event | Event equals `search` |
| CE - add_to_cart | Custom Event | Event equals `add_to_cart` |
| CE - remove_from_cart | Custom Event | Event equals `remove_from_cart` |
| CE - view_cart | Custom Event | Event equals `view_cart` |
| CE - begin_checkout | Custom Event | Event equals `begin_checkout` |
| CE - add_contact_info | Custom Event | Event equals `add_contact_info` |
| CE - add_shipping_info | Custom Event | Event equals `add_shipping_info` |
| CE - add_payment_info | Custom Event | Event equals `add_payment_info` |
| CE - purchase | Custom Event | Event equals `purchase` |
| CE - ee_purchase | Custom Event | Event equals `ee_purchase` |

#### Step 3: Create Tags

**3.1 Configuration Tag**

- **Tag Name:** GA4 - Configuration
- **Tag Type:** Google Analytics: GA4 Configuration
- **Measurement ID:** `{{Const - GA4 Measurement ID}}`
- **Send a page view event:** ❌ Unchecked
- **User Properties:**
  - `customer_logged_in`: `{{DLV - customer_logged_in}}`
  - `customer_orders_count`: `{{DLV - customer_orders_count}}`
  - `customer_total_spent`: `{{DLV - customer_total_spent}}`
  - `user_type`: `{{DLV - user_type}}`
- **Triggering:** All Pages

**3.2 Pixel Bridge Tag (Custom HTML)**

- **Tag Name:** Custom HTML - jyinsights Pixel Bridge
- **Tag Type:** Custom HTML
- **HTML:**
```html
<script>
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'jyinsights_datalayer') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(e.data.payload);
      console.log('[jyinsights Pixel Bridge] Event received:', e.data.payload.event);
    }
    if (e.data && e.data.type === 'jyinsights_pixel_ready') {
      console.log('[jyinsights Pixel Bridge] Custom Pixel ready, version:', e.data.version);
    }
  });
</script>
```
- **Triggering:** All Pages

**3.3 Event Tags**

Create GA4 Event tags for each event. Template:

- **Tag Type:** Google Analytics: GA4 Event
- **Configuration Tag:** `{{Const - GA4 Measurement ID}}`
- **Event Name:** (specific event name)
- **Event Parameters:** (see table below)
- **Triggering:** (corresponding custom event trigger)

**Event Tag Configurations:**

| Tag Name | Event Name | Parameters | Trigger |
|----------|-----------|-----------|---------|
| GA4 - Event - sh_info | `sh_info` | page_type, user_type, user_id | CE - sh_info |
| GA4 - Event - page_view | `page_view` | page_type, page_title | CE - page_view |
| GA4 - Event - view_item_list | `view_item_list` | item_list_name, item_list_id, items | CE - view_item_list |
| GA4 - Event - select_item | `select_item` | item_list_name, items | CE - select_item |
| GA4 - Event - view_item | `view_item` | currency, value, items | CE - view_item |
| GA4 - Event - search | `search` | search_term | CE - search |
| GA4 - Event - add_to_cart | `add_to_cart` | currency, value, items | CE - add_to_cart |
| GA4 - Event - remove_from_cart | `remove_from_cart` | currency, value, items | CE - remove_from_cart |
| GA4 - Event - view_cart | `view_cart` | currency, value, items | CE - view_cart |
| GA4 - Event - begin_checkout | `begin_checkout` | currency, value, items, coupon | CE - begin_checkout |
| GA4 - Event - add_contact_info | `add_contact_info` | currency, value, items | CE - add_contact_info |
| GA4 - Event - add_shipping_info | `add_shipping_info` | currency, value, shipping_tier, items | CE - add_shipping_info |
| GA4 - Event - add_payment_info | `add_payment_info` | currency, value, payment_type, items | CE - add_payment_info |
| GA4 - Event - purchase | `purchase` | transaction_id, currency, value, tax, shipping, coupon, items | CE - purchase |
| GA4 - Event - ee_purchase | `ee_purchase` | transaction_id, currency, value, tax, shipping, coupon, items | CE - ee_purchase |

#### Step 4: Testing & Publishing

1. Click **"Preview"** in GTM
2. Enter your Shopify store URL
3. Navigate through your store and verify tags fire
4. Check dataLayer variables are populated
5. Verify in GA4 DebugView
6. Click **"Submit"** → **"Publish"**

---

## Data Layer Parameters Reference

### sh_info Event (Analyzify Base Event)

```javascript
{
  event: 'sh_info',
  page_type: 'home|product|collection|cart|search|purchase|other',
  user_type: 'member|visitor',
  user_id: 'customer_id',
  user_eh: 'sha256_hashed_email',
  user_r: 'YYYY-MM-DD',
  user_f: 0,
  user_m: 0,
  customer_first_name: 'First',
  customer_last_name: 'Last',
  customer_accepts_marketing: true|false,
  customer_phone: '+1234567890',
  customer_tags: ['tag1', 'tag2'],
  address: {
    firstName: 'First',
    lastName: 'Last',
    address1: '123 Main St',
    address2: 'Apt 4',
    city: 'City',
    province: 'State',
    provinceCode: 'ST',
    country: 'Country',
    countryCode: 'US',
    zip: '12345'
  }
}
```

### view_item Event (Product Page)

```javascript
{
  event: 'view_item',
  ecommerce: {
    currency: 'USD',
    value: 29.99,
    items: [{
      item_id: 'variant_id',
      product_id: 'product_id',
      variant_id: 'variant_id',
      item_name: 'Product Name',
      product_name: 'Product Name',
      item_brand: 'Brand Name',
      product_brand: 'Brand Name',
      item_category: 'Category',
      product_type: 'Category',
      category_id: 'category_slug',
      category_name: 'Category Name',
      item_variant: 'Color: Red / Size: M',
      variant_title: 'Color: Red / Size: M',
      item_sku: 'SKU-12345',
      product_sku: 'SKU-12345',
      price: 29.99,
      product_price: 29.99,
      currency: 'USD',
      g_product_id: 'shopify_US_123456_789012',
      discount: 5.00,
      compare_at_price: 34.99
    }]
  }
}
```

### purchase Event (Analyzify Enhanced)

```javascript
{
  event: 'purchase',
  ecommerce: {
    transaction_id: 'order_id_12345',
    currency: 'USD',
    value: 69.98,
    tax: 4.20,
    shipping: 5.00,
    coupon: 'DISCOUNT10',
    items: [ /* Items array */ ]
  },
  // Analyzify transaction parameters
  order_id: 'order_id_12345',
  order_name: '#1001',
  checkout_id: 'checkout_token',
  payment_type: 'Credit Card',
  shipping_method: 'Standard Shipping',
  totalValue: 69.98,
  totalQuantity: 2,
  coupon: 'DISCOUNT10',
  discount_codes: ['DISCOUNT10'],
  discount_amount: 5.00,
  // Customer data
  user_type: 'member',
  user_id: 'customer_id',
  user_eh: 'sha256_email',
  email_sha1: 'sha1_email',
  user_f: 4,
  new_customer: false,
  email: 'customer@example.com',
  phone: '+1234567890',
  address: { /* Address object */ }
}
```

For complete parameter reference for all events, see the original [ANALYZIFY_ENHANCED_IMPLEMENTATION.md](./ANALYZIFY_ENHANCED_IMPLEMENTATION.md) document.

---

## Event Tracking Matrix

| Customer Journey Stage | Event Name | Trigger Location | Required Parameters |
|------------------------|-----------|------------------|-------------------|
| **Browse - Home Page** | `sh_info`, `page_view` | Home page load | `page_type`, `user_type` |
| **Browse - Collection** | `sh_info`, `page_view`, `view_item_list` | Collection page | `items[]`, `item_list_name` |
| **Browse - Search** | `sh_info`, `page_view`, `search`, `view_item_list` | Search page | `search_term`, `items[]` |
| **Browse - Product Click** | `select_item` | Click on product card | `item_id`, `item_name`, `item_list_name` |
| **Browse - Product Page** | `sh_info`, `page_view`, `view_item` | Product page load | `items[]` with full product data |
| **Cart - Add to Cart** | `add_to_cart` | Add to cart button/API | `items[]`, `value` |
| **Cart - Remove from Cart** | `remove_from_cart` | Remove item | `item_id` |
| **Cart - View Cart** | `sh_info`, `page_view`, `view_cart` | Cart page load | `items[]`, `cart_total` |
| **Checkout - Begin** | `begin_checkout` | Checkout button | `items[]`, `value`, `checkout_id` |
| **Checkout - Contact Info** | `add_contact_info` | Contact form submit | `email`, `address` |
| **Checkout - Shipping** | `add_shipping_info` | Shipping method select | `shipping_tier`, `shipping` |
| **Checkout - Payment** | `add_payment_info` | Payment info submit | `payment_type` |
| **Checkout - Complete** | `purchase`, `ee_purchase` | Order completion | `transaction_id`, all transaction params |

---

## Theme Hyper 2.0 Compatibility

### Custom Event Listeners (Gold Package)

The enhanced implementation includes specific compatibility for Theme Hyper 2.0:

```javascript
// Theme Hyper 2.0 cart event listener
if (JYINSIGHTS_CONFIG.themeHyper2Compat) {
  document.addEventListener('theme:cart:add', function(e) {
    try {
      if (e.detail && e.detail.product) {
        pushAddToCartEvent(e.detail.product);
      }
    } catch (err) {
      jyinsightsLog('Error handling theme:cart:add:', err, 'error');
    }
  });
}
```

### Enhanced Selectors

Product card detection includes Hyper 2.0 specific classes:

```javascript
var productCard = link.closest('[data-product-id]') ||
                 link.closest('.product-card') ||
                 link.closest('.product-item') ||
                 link.closest('.product-grid-item'); // Hyper 2.0
```

### Configuration Toggle

Enable/disable Hyper 2.0 compatibility:

```javascript
var JYINSIGHTS_CONFIG = {
  themeHyper2Compat: true // Set to false if not using Hyper 2.0
};
```

---

## Validation & Debugging

### Enable Debug Mode

**Storefront DataLayer (Gold):**
```javascript
var JYINSIGHTS_CONFIG = {
  debug: true // Enable console logging
};
```

**Checkout Pixel (Both Packages):**
```javascript
const JYINSIGHTS_CONFIG = {
  debug: true
};
```

### Console Output Format

```
[jyinsights Gold Enhanced (Analyzify) v3.0] Event pushed: view_item
[jyinsights Gold Enhanced (Analyzify) v3.0] {
  event: 'view_item',
  ecommerce: { ... }
}
```

### GTM Preview Mode

1. In GTM, click **"Preview"**
2. Enter your store URL
3. Navigate through your store
4. Check **"Tag Assistant"** panel for:
   - ✅ Tags firing correctly
   - ✅ DataLayer variables populated
   - ❌ Tags not firing (troubleshoot)

### Chrome DevTools DataLayer Inspector

```javascript
// In browser console, inspect dataLayer
console.table(window.dataLayer);

// Filter specific events
window.dataLayer.filter(e => e.event === 'purchase');

// Check latest event
window.dataLayer[window.dataLayer.length - 1];
```

### GA4 DebugView

1. Go to GA4 Property → **Configure** → **DebugView**
2. Enable debug mode in dataLayer configuration
3. See real-time event validation in GA4

### DataLayer Validator (Gold Package)

Use the interactive validator in browser console:

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

### Validation Checklist

✅ **sh_info event fires on all pages**
- Verify `user_type`, `page_type` present

✅ **view_item fires on product pages**
- Verify all product parameters present
- Check `g_product_id` format

✅ **add_to_cart fires when adding items**
- Verify AJAX and form submissions both work
- Check quantity is correct

✅ **begin_checkout fires at checkout**
- Verify all items included
- Check customer data present

✅ **purchase event fires on Thank You page**
- Verify `transaction_id` is unique
- Check all transaction parameters
- Verify `ee_purchase` also fires

---

## Troubleshooting

### DataLayer Not Pushing Events

**Symptom:** No events in dataLayer
**Solution:**
1. Check if script is loaded (view page source, search for "JYINSIGHTS")
2. Verify placement before `</head>` tag
3. Check for JavaScript errors in console
4. Enable debug mode to see error messages

### Product Data Missing

**Symptom:** Events fire but product parameters are empty
**Solution:**
1. Verify product data attributes on product cards
2. Check Liquid template is outputting correct data
3. Inspect `formatProductItem` function output in console
4. Verify variant data is available

### Checkout Events Not Firing

**Symptom:** No checkout/purchase events
**Solution:**
1. Verify Custom Pixel is "Connected" in Shopify Admin
2. Check `allowedOrigins` configuration
3. Verify postMessage bridge is loaded in GTM
4. Check browser console for postMessage errors
5. Test in different browser (disable ad blockers)

### Duplicate Purchase Events

**Symptom:** Purchase event fires multiple times
**Solution:**
1. Check if both `purchase` and `ee_purchase` should fire (this is intended for Analyzify compatibility)
2. Verify Thank You page doesn't reload multiple times
3. Check for duplicate GTM containers on page

### GTM Tags Not Firing

**Symptom:** DataLayer pushes but GTM tags don't fire
**Solution:**
1. Verify trigger configuration matches event names
2. Check trigger conditions (e.g., `{{Event}} equals purchase`)
3. Use GTM Preview mode to debug
4. Verify GTM container is published

### Category Not Tracking

**Symptom:** `category_id` and `category_name` are empty
**Solution:**
1. Ensure `includeCategories: true` in config
2. Check if products have `product.type` set
3. Verify `extractCategory` function is working
4. Products without type will show "Uncategorized"

### Google Product ID Not Generating

**Symptom:** `g_product_id` is missing
**Solution:**
1. Ensure `useGoogleProductId: true` in config
2. Verify product ID and variant ID are available
3. Check country code is correctly set
4. Format should be: `shopify_{country}_{product_id}_{variant_id}`

### Email Hashing Not Working

**Symptom:** `user_eh` is empty for logged-in customers
**Solution:**
1. Verify `hashEmail: true` in config
2. Check browser supports `crypto.subtle.digest`
3. Check for async/await errors in older browsers
4. Email must be valid format

---

## Advanced Configuration

### Custom Product ID Format

Customize the Google Ads product ID format:

```javascript
function generateGoogleProductId(productId, variantId) {
  var country = 'US'; // Change based on your store location
  return 'shopify_' + country + '_' + productId + '_' + variantId;
}
```

### Custom Category Extraction

Modify how categories are extracted:

```javascript
function extractCategory(productType) {
  // Custom logic for category mapping
  if (!productType) return { id: 'uncategorized', name: 'Uncategorized' };

  var categoryMap = {
    'Apparel': { id: 'apparel', name: 'Clothing' },
    'Electronics': { id: 'electronics', name: 'Electronics' }
  };

  return categoryMap[productType] || {
    id: productType.toLowerCase().replace(/\s+/g, '-'),
    name: productType
  };
}
```

### Add Facebook Pixel Tag (GTM)

**Tag Type:** Custom HTML

```html
<script>
  fbq('track', '{{Event}}', {
    content_ids: {{DLV - ecommerce.items}},
    content_type: 'product',
    value: {{DLV - ecommerce.value}},
    currency: {{DLV - ecommerce.currency}}
  });
</script>
```

**Triggering:** CE - purchase

### Add Google Ads Conversion Tag (GTM)

**Tag Type:** Google Ads Conversion Tracking

**Configuration:**
- Conversion ID: Your conversion ID
- Conversion Label: Your conversion label
- Conversion Value: `{{DLV - ecommerce.value}}`
- Currency Code: `{{DLV - ecommerce.currency}}`

**Triggering:** CE - purchase

---

## Additional Resources

### Analyzify Documentation
- [Analyzify Data Layers Parameters](https://docs.analyzify.com/data-layers-parameters)
- [Analyzify GTM Container](https://docs.analyzify.com/analyzify-gtm-container)
- [Analyzify Data Layers Table](https://docs.analyzify.com/analyzify-data-layers-table)
- [Shopify Data Layer Setup](https://docs.analyzify.com/set-up-product-data-layer-on-shopify)

### GA4 Resources
- [GA4 Ecommerce Events](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [GA4 Item Parameters](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#view_item)

### Shopify Resources
- [Shopify Customer Events API](https://shopify.dev/docs/api/web-pixels-api)
- [Shopify Liquid Reference](https://shopify.dev/docs/api/liquid)

---

## Support

For implementation support:
- Email: contact@jyinsights.com
- Documentation: See package-specific SDR documents
- [Quick Start Guide](./QUICK_START_GUIDE.md)

---

## Version History

- **v3.0** (2025-12-31) - Analyzify-enhanced implementation
- **v2.0** (2025-12-09) - Enhanced security and error handling
- **v1.0** (2024-12-04) - Initial release

---

© 2025 jyinsights. All rights reserved.
