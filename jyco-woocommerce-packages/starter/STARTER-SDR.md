# JY/co WooCommerce Tracking - STARTER Package
## Solution Design Reference (SDR)

**Version:** 1.0.0
**Package:** Starter
**Last Updated:** January 2025
**Author:** JY/co

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Event Reference](#event-reference)
6. [Data Layer Specification](#data-layer-specification)
7. [Testing & QA](#testing--qa)
8. [Troubleshooting](#troubleshooting)
9. [Compatibility](#compatibility)
10. [Support](#support)

---

## Overview

### Purpose

The JY/co WooCommerce Tracking Starter Package provides production-ready GA4 ecommerce tracking for WooCommerce stores through a lightweight custom plugin and Google Tag Manager integration.

### Package Contents

- **WordPress Plugin:** `jyco-woocommerce-tracking/` (ready to install)
- **GTM Container:** `starter-gtm-container.json` (import into GTM)
- **Documentation:** This SDR document

### Key Features

- ✅ Complete GA4 ecommerce event tracking
- ✅ Lightweight plugin architecture (no bloat)
- ✅ AJAX add-to-cart support
- ✅ Variable product tracking
- ✅ User data with hashed email (SHA-256)
- ✅ Debug mode for testing
- ✅ HPOS (High-Performance Order Storage) compatible
- ✅ Role-based tracking exclusion

---

## Architecture

### How It Works

```
WordPress/WooCommerce
    ↓
JY/co Tracking Plugin
    ↓
dataLayer (JavaScript object)
    ↓
Google Tag Manager
    ↓
Google Analytics 4
```

### Component Breakdown

#### 1. **PHP Backend (Server-Side)**
- **class-jyco-datalayer.php** - Generates initial dataLayer on page load
- **class-jyco-events.php** - Handles server-side events and AJAX endpoints
- **class-jyco-settings.php** - Admin settings interface

#### 2. **JavaScript Frontend (Client-Side)**
- **jyco-tracking.js** - Event listeners for dynamic interactions (AJAX cart, product clicks, etc.)

#### 3. **WordPress Hooks Used**

| Hook | Purpose | File |
|------|---------|------|
| `wp_head` | Output dataLayer initialization | class-jyco-datalayer.php |
| `wp_footer` | Load tracking JavaScript | class-jyco-events.php |
| `woocommerce_add_to_cart` | Track non-AJAX add to cart | class-jyco-events.php |
| `wp_login` | Track user login | class-jyco-events.php |
| `user_register` | Track user registration | class-jyco-events.php |

#### 4. **JavaScript Events Tracked**

| Event | Method | Trigger |
|-------|--------|---------|
| AJAX add_to_cart | jQuery event | `added_to_cart` |
| remove_from_cart | jQuery event | `removed_from_cart` |
| select_item | Click listener | Product link clicks |
| add_shipping_info | jQuery event | `updated_checkout` |
| add_payment_info | jQuery event | `updated_checkout` |

---

## Installation

### Method 1: WordPress Admin Upload

1. Download the plugin ZIP file (or create ZIP from `jyco-woocommerce-tracking/` folder)
2. Log in to WordPress admin
3. Go to **Plugins → Add New → Upload Plugin**
4. Click **Choose File** and select the ZIP
5. Click **Install Now**
6. Click **Activate Plugin**

### Method 2: FTP/SFTP Upload

1. Unzip the `jyco-woocommerce-tracking/` folder
2. Connect to your server via FTP/SFTP
3. Upload the folder to `/wp-content/plugins/`
4. Go to WordPress admin → **Plugins**
5. Find "JY/co WooCommerce Tracking" and click **Activate**

### Method 3: WP-CLI

```bash
# From WordPress root directory
wp plugin install /path/to/jyco-woocommerce-tracking.zip --activate
```

### Verify Installation

After activation, you should see:
- "JY/co Tracking" in the WordPress admin menu (left sidebar)
- A success message confirming activation

### Prerequisites Check

The plugin will display an admin notice if:
- ❌ WooCommerce is not installed/active
- Fix: Install and activate WooCommerce first

---

## Configuration

### Step 1: Plugin Settings

1. Go to **JY/co Tracking** in WordPress admin menu
2. Configure the following settings:

#### General Settings

| Setting | Description | Example |
|---------|-------------|---------|
| **GA4 Measurement ID** | Optional. Your GA4 property ID (only needed if sending events directly to GA4 without GTM) | `G-XXXXXXXXXX` |
| **Debug Mode** | Enable console logging for testing | ☑️ Enable for testing<br>☐ Disable in production |

#### Event Settings

Select which events to track. All events use GA4 standard format.

**Recommended: Enable all events**

- ☑️ Page View
- ☑️ View Item List
- ☑️ Select Item
- ☑️ View Item
- ☑️ Add to Cart
- ☑️ Remove from Cart
- ☑️ View Cart
- ☑️ Begin Checkout
- ☑️ Add Shipping Info
- ☑️ Add Payment Info
- ☑️ Purchase
- ☑️ Search
- ☑️ Login
- ☑️ Sign Up

#### Privacy Settings

**Exclude User Roles from Tracking:**

Recommended to exclude:
- ☑️ Administrator
- ☐ Editor (exclude if they browse the site)
- ☐ Shop Manager (exclude if they test orders)

3. Click **Save Settings**

### Step 2: Google Tag Manager Setup

#### Import Container

1. Log in to [Google Tag Manager](https://tagmanager.google.com/)
2. Select your container
3. Go to **Admin → Import Container**
4. Click **Choose container file**
5. Select `starter-gtm-container.json`
6. **Import option:** Choose "Merge" (or "Overwrite" if new container)
7. **Conflict resolution:** Choose "Rename conflicting tags"
8. Click **Confirm**

#### Configure Measurement ID

1. In GTM, go to **Variables**
2. Find the variable named **"GA4 Measurement ID"**
3. Click to edit
4. Replace `G-XXXXXXXXXX` with your actual GA4 Measurement ID
5. Save

#### Publish Container

1. Click **Submit** (top right)
2. Add version name: `JY/co WooCommerce Tracking - Initial Setup`
3. Add description: `Imported Starter tracking configuration`
4. Click **Publish**

### Step 3: Verify Setup

See [Testing & QA](#testing--qa) section below.

---

## Event Reference

### Event Matrix

| Event | When It Fires | Page/Context | Data Included |
|-------|---------------|--------------|---------------|
| **page_view** | Every page load | All pages | page_type, user data |
| **view_item_list** | Product list loaded | Shop, category, tag, search | items[], item_list_name |
| **select_item** | Product clicked from list | Shop, category, tag, search | items[0], item_list_name |
| **view_item** | Product page loaded | Single product page | items[0], value, currency |
| **add_to_cart** | Item added to cart | Any page with add to cart button | items[0], value, currency |
| **remove_from_cart** | Item removed from cart | Cart page | currency (items if available) |
| **view_cart** | Cart page loaded | Cart page | items[], value, currency |
| **begin_checkout** | Checkout page loaded | Checkout page | items[], value, currency |
| **add_shipping_info** | Shipping method selected | Checkout page | currency, shipping_tier |
| **add_payment_info** | Payment method selected | Checkout page | currency, payment_type |
| **purchase** | Order completed | Thank you page | transaction_id, items[], value, tax, shipping, currency |
| **search** | Search performed | Search results page | search_term |
| **login** | User logged in | After login redirect | method |
| **sign_up** | User registered | After registration | method |

---

## Data Layer Specification

### Initial Data Layer (Server-Side)

Outputted in `<head>` on every page:

```javascript
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  "page_type": "product",           // home, collection, product, cart, checkout, purchase, etc.
  "user": {
    "logged_in": true,               // boolean
    "user_id": "123",                // string (only if logged in)
    "user_email": "abc123...",       // SHA-256 hash (only if logged in)
    "user_role": "customer"          // string (only if logged in)
  },
  "ecommerce": {                     // Only present on relevant pages
    "event": "view_item",            // Event name
    "currency": "USD",               // 3-letter ISO code
    "value": 29.99,                  // float
    "items": [                       // array of product objects
      {
        "item_id": "123",
        "item_name": "Product Name",
        "item_brand": "Brand Name",
        "item_category": "Category/Subcategory",
        "item_variant": "Size / Color",  // Only for variations
        "item_sku": "SKU-123",           // If available
        "price": 29.99,
        "quantity": 1,
        "index": 0
      }
    ]
  }
});
```

### Dynamic Events (Client-Side)

Pushed by JavaScript when user interactions occur:

```javascript
// Example: add_to_cart event
window.dataLayer.push({ ecommerce: null });  // Clear previous ecommerce object
window.dataLayer.push({
  "event": "add_to_cart",
  "ecommerce": {
    "currency": "USD",
    "value": 29.99,
    "items": [{
      "item_id": "123",
      "item_name": "Product Name",
      "item_category": "Category",
      "price": 29.99,
      "quantity": 1
    }]
  }
});
```

### Item Object Specification

Each product in the `items[]` array follows this structure:

```javascript
{
  "item_id": "123",                    // string - Product ID (required)
  "item_name": "Product Name",         // string - Product name (required)
  "item_brand": "Brand Name",          // string - Brand (optional)
  "item_category": "Cat/Subcat",       // string - Category hierarchy (optional)
  "item_variant": "Red / Large",       // string - Variation attributes (optional)
  "item_sku": "SKU-123",               // string - Product SKU (optional)
  "price": 29.99,                      // float - Unit price (required)
  "quantity": 1,                       // integer - Quantity (required)
  "index": 0,                          // integer - Position in list (optional)
  "item_list_name": "Search Results"   // string - List name (for list events only)
}
```

---

## Testing & QA

### Enable Debug Mode

1. Go to **JY/co Tracking** settings
2. Check **"Enable debug logging in browser console"**
3. Save settings

### Testing Checklist

#### 1. **Verify dataLayer Initialization**

1. Open your website homepage
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Type `dataLayer` and press Enter
5. ✅ Should see array with initial push containing `page_type` and `user` data

#### 2. **Test Page View**

1. Navigate to different pages
2. Check console for `[JY/co]` log messages (if debug enabled)
3. ✅ Each page should push correct `page_type`

#### 3. **Test view_item_list (Shop Page)**

1. Go to shop page or product category
2. Check console logs
3. ✅ Should see `view_item_list` event with `items[]` array

#### 4. **Test select_item (Product Click)**

1. On shop page, click a product
2. ✅ Should see `[JY/co] select_item` in console before navigation

#### 5. **Test view_item (Product Page)**

1. Navigate to a single product page
2. ✅ Should see `view_item` event in dataLayer with product details

#### 6. **Test add_to_cart (AJAX)**

1. On shop page, click "Add to cart" button
2. Wait for success message
3. ✅ Should see `[JY/co] add_to_cart` in console
4. ✅ Check dataLayer for `add_to_cart` event with correct product

#### 7. **Test add_to_cart (Non-AJAX)**

1. On single product page, click "Add to cart"
2. Wait for page redirect/reload
3. ✅ Should see `add_to_cart` event fire after page load

#### 8. **Test remove_from_cart**

1. Go to cart page
2. Click "×" to remove an item
3. ✅ Should see `remove_from_cart` event

#### 9. **Test view_cart**

1. Go to cart page with items
2. ✅ Should see `view_cart` event with all cart items

#### 10. **Test begin_checkout**

1. Go to checkout page
2. ✅ Should see `begin_checkout` event with cart items

#### 11. **Test add_shipping_info**

1. On checkout page, select a shipping method
2. Wait for checkout to update
3. ✅ Should see `add_shipping_info` with `shipping_tier`

#### 12. **Test add_payment_info**

1. On checkout page, select a payment method
2. Wait for checkout to update
3. ✅ Should see `add_payment_info` with `payment_type`

#### 13. **Test purchase**

1. Complete a test order
2. On thank you page, check console
3. ✅ Should see `purchase` event with:
   - `transaction_id`
   - `value`
   - `tax`
   - `shipping`
   - `items[]`
4. Refresh the page
5. ✅ Purchase event should NOT fire again (duplicate prevention)

#### 14. **Test search**

1. Use search form to search for products
2. ✅ Should see `search` event with `search_term`

#### 15. **Verify in GTM Preview Mode**

1. In GTM, click **Preview**
2. Enter your website URL
3. Click **Connect**
4. Perform test actions above
5. ✅ Verify tags fire in GTM Preview panel

#### 16. **Verify in GA4 DebugView**

1. In GA4, go to **Configure → DebugView**
2. With debug mode enabled in plugin, browse your site
3. ✅ Verify events appear in DebugView in real-time

---

## Troubleshooting

### Common Issues

#### Issue: Events Not Firing

**Symptoms:**
- No events in dataLayer
- Console shows no `[JY/co]` logs even with debug enabled
- GTM Preview shows no events

**Possible Causes & Solutions:**

1. **JavaScript Not Loading**
   - Check browser console for errors
   - Verify `jyco-tracking.js` is loaded (Network tab)
   - Check for JavaScript conflicts with other plugins

2. **User Role Excluded**
   - Check if you're logged in as Administrator
   - Go to plugin settings → Privacy → Check excluded roles
   - Test in Incognito mode or as a customer

3. **Events Disabled in Settings**
   - Go to plugin settings → Event Settings
   - Verify the specific event is checked

4. **Caching Plugin Serving Stale HTML**
   - Clear all caches (WordPress, caching plugin, browser)
   - See [Caching Plugin Configuration](#caching-plugin-configuration)

#### Issue: Duplicate Events

**Symptoms:**
- Same event fires twice
- Purchase event fires multiple times

**Possible Causes & Solutions:**

1. **Multiple Tracking Plugins Active**
   - Deactivate other tracking plugins (MonsterInsights, PixelYourSite, etc.)
   - Only use one ecommerce tracking solution

2. **Multiple GTM Containers**
   - Check page source for multiple GTM snippets
   - Remove duplicate GTM implementations

3. **Purchase Event on Refresh**
   - Plugin prevents this by default using post meta
   - If still occurring, check for custom order redirects

#### Issue: Variable Products Showing Wrong Price

**Symptoms:**
- Variable product shows parent price instead of variation price
- `item_variant` field is empty

**Solution:**
- Plugin uses `$product->get_price()` which returns correct variation price
- If issue persists, check for custom price modification plugins
- Verify variation is properly configured in WooCommerce

#### Issue: AJAX Add to Cart Not Tracking

**Symptoms:**
- Standard add to cart works
- AJAX add to cart doesn't fire event

**Possible Causes & Solutions:**

1. **Theme Uses Custom AJAX**
   - Theme may not trigger WooCommerce's `added_to_cart` event
   - Check theme documentation
   - May need custom JavaScript to listen for theme's specific event

2. **JavaScript Error**
   - Check console for errors
   - Ensure jQuery is loaded
   - Test with default theme (Storefront)

#### Issue: Purchase Event Missing Data

**Symptoms:**
- Purchase event fires but missing products, tax, or shipping
- Value is incorrect

**Possible Causes & Solutions:**

1. **HPOS Compatibility Issue**
   - Plugin is HPOS compatible
   - Ensure using WooCommerce 7.1+
   - Check WooCommerce → Settings → Advanced → Features

2. **Order Data Not Available**
   - Check if custom checkout is redirecting to external URL
   - Verify order is created before thank you page

3. **Third-Party Checkout**
   - Some payment gateways redirect to external checkout
   - May need server-side backup tracking (see Pro package)

---

## Compatibility

### WordPress & WooCommerce

| Software | Minimum Version | Tested Up To | Status |
|----------|----------------|--------------|--------|
| WordPress | 5.8 | 6.4 | ✅ Compatible |
| WooCommerce | 6.0 | 8.0 | ✅ Compatible |
| PHP | 7.4 | 8.2 | ✅ Compatible |

### Tested Themes

| Theme | Status | Notes |
|-------|--------|-------|
| Storefront (Official WooCommerce Theme) | ✅ | Fully compatible |
| Astra | ✅ | Fully compatible |
| GeneratePress | ✅ | Fully compatible |
| Kadence | ✅ | Fully compatible |
| Flatsome | ✅ | Fully compatible |
| OceanWP | ✅ | Fully compatible |
| Divi | ⚠️ | Works, but may need custom selectors for product clicks |
| Avada | ⚠️ | Works, but may need custom selectors for product clicks |

### Tested Plugins

#### ✅ Compatible

- WooCommerce Subscriptions
- WooCommerce Memberships
- WPML (Multilingual)
- Elementor / Elementor Pro
- WPBakery Page Builder
- Yoast SEO
- Rank Math SEO
- WooCommerce Blocks (basic support)

#### ⚠️ Potential Conflicts

| Plugin | Issue | Solution |
|--------|-------|----------|
| MonsterInsights | Duplicate ecommerce tracking | Disable MonsterInsights ecommerce addon |
| PixelYourSite | Duplicate events | Disable PYS ecommerce events |
| GTM4WP | Duplicate dataLayer | Choose one solution (use ours, not both) |
| Enhanced Ecommerce for WP | Duplicate tracking | Deactivate (not needed) |

#### Caching Plugin Configuration

##### WP Rocket

1. Go to **Settings → WP Rocket**
2. **File Optimization** tab:
   - Under **JavaScript Files**, click **"Excluded JavaScript Files"**
   - Add: `jyco-tracking.js`
3. Save and clear cache

**Optional (if events still not firing):**
- Disable JavaScript Combine/Minify temporarily to test

##### LiteSpeed Cache

1. Go to **LiteSpeed Cache → Page Optimization**
2. **JS Settings** tab:
   - Find **"JS Excludes"**
   - Add: `jyco-tracking`
3. Save and purge all caches

##### W3 Total Cache

1. Go to **Performance → Minify**
2. **JS Minify Settings:**
   - Under "Never minify the following JS files"
   - Add: `wp-content/plugins/jyco-woocommerce-tracking/assets/js/jyco-tracking.js`
3. Save and empty all caches

##### WP Super Cache

1. Go to **Settings → WP Super Cache**
2. **Advanced** tab:
   - Check **"Don't cache pages for known users"** (if you want to track logged-in users)
3. Delete cache

##### SG Optimizer

1. Go to **SG Optimizer → Frontend Optimization**
2. **JavaScript**:
   - Under "Exclude from Combine JavaScript"
   - Add: `jyco-tracking.js`
3. Purge SG Cache

##### Cloudflare (APO)

If using Cloudflare APO:
1. Page Rules → Add rule for dynamic pages:
   - URL: `yoursite.com/cart*`
   - Setting: Cache Level = Bypass
2. Repeat for `/checkout*` and `/my-account*`

---

## Data Flow Diagrams

### Page Load Flow

```
User Visits Page
    ↓
WordPress/WooCommerce Loads
    ↓
Plugin Hooks into wp_head (priority 1)
    ↓
class-jyco-datalayer.php Executes
    ↓
Checks: Should track user? (role exclusion)
    ↓ YES
Determines page_type (is_shop, is_product, etc.)
    ↓
Gathers user data (logged_in, hashed email)
    ↓
Gathers ecommerce data based on page_type
    ↓
Outputs <script> tag with dataLayer.push()
    ↓
Page renders, GTM processes dataLayer
    ↓
GTM fires GA4 configuration tag
    ↓
If ecommerce event present, fires event tag
    ↓
Events sent to GA4
```

### AJAX Add to Cart Flow

```
User Clicks "Add to Cart" Button
    ↓
WooCommerce AJAX Request
    ↓
Item Added to Cart (server-side)
    ↓
WooCommerce Returns Success
    ↓
WooCommerce Triggers jQuery Event: 'added_to_cart'
    ↓
jyco-tracking.js Listens for Event
    ↓
Extracts product_id from button data attributes
    ↓
AJAX Request to Plugin: jyco_get_product_data
    ↓
Plugin Returns Product Data
    ↓
JavaScript Formats Event Data
    ↓
Pushes add_to_cart Event to dataLayer
    ↓
GTM Fires add_to_cart Tag
    ↓
Event Sent to GA4
```

---

## WordPress Coding Standards

This plugin follows [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/):

### Security
- ✅ All user inputs sanitized (`sanitize_text_field`, `absint`, etc.)
- ✅ All outputs escaped (`esc_html`, `esc_attr`, `wp_json_encode`)
- ✅ Nonces used for AJAX requests
- ✅ Capability checks (`current_user_can`)
- ✅ Direct access prevention (`if ( ! defined( 'ABSPATH' ) ) exit;`)

### Performance
- ✅ Scripts enqueued properly (not hardcoded)
- ✅ Scripts loaded in footer when possible
- ✅ Database queries optimized
- ✅ No queries in loops
- ✅ Transients used for temporary data

### Best Practices
- ✅ All functions/classes prefixed with `jyco_`
- ✅ Text domain for translations: `jyco-tracking`
- ✅ Hooks used instead of direct modifications
- ✅ Filters provided for extensibility

---

## Customization Hooks

### Filters

Developers can customize plugin behavior using these filters:

#### `jyco_datalayer_data`

Modify the entire dataLayer before output.

```php
add_filter( 'jyco_datalayer_data', 'custom_modify_datalayer', 10, 1 );
function custom_modify_datalayer( $data ) {
    // Add custom data
    $data['custom_field'] = 'custom_value';

    return $data;
}
```

#### `jyco_user_data`

Modify user data before adding to dataLayer.

```php
add_filter( 'jyco_user_data', 'custom_user_data', 10, 1 );
function custom_user_data( $user_data ) {
    // Add lifetime value
    if ( is_user_logged_in() ) {
        $user_data['lifetime_value'] = get_user_meta( get_current_user_id(), 'lifetime_value', true );
    }

    return $user_data;
}
```

#### `jyco_format_item`

Modify individual item data.

```php
add_filter( 'jyco_format_item', 'custom_format_item', 10, 4 );
function custom_format_item( $item, $product, $quantity, $index ) {
    // Add custom product field
    $item['custom_field'] = get_post_meta( $product->get_id(), 'custom_field', true );

    return $item;
}
```

#### `jyco_product_brand`

Set custom brand for products.

```php
add_filter( 'jyco_product_brand', 'custom_product_brand', 10, 2 );
function custom_product_brand( $brand, $product ) {
    // Get brand from custom field
    return get_post_meta( $product->get_id(), '_custom_brand', true );
}
```

---

## GTM Container Details

### Tags Included

| Tag ID | Tag Name | Type | Trigger |
|--------|----------|------|---------|
| 1 | GA4 - Configuration | GA4 Config | All Pages |
| 2 | GA4 - Event - view_item | GA4 Event | CE - view_item |
| 4 | GA4 - Event - view_item_list | GA4 Event | CE - view_item_list |
| 6 | GA4 - Event - select_item | GA4 Event | CE - select_item |
| 8 | GA4 - Event - add_to_cart | GA4 Event | CE - add_to_cart |
| 10 | GA4 - Event - remove_from_cart | GA4 Event | CE - remove_from_cart |
| 12 | GA4 - Event - view_cart | GA4 Event | CE - view_cart |
| 14 | GA4 - Event - begin_checkout | GA4 Event | CE - begin_checkout |
| 16 | GA4 - Event - add_shipping_info | GA4 Event | CE - add_shipping_info |
| 18 | GA4 - Event - add_payment_info | GA4 Event | CE - add_payment_info |
| 20 | GA4 - Event - purchase | GA4 Event | CE - purchase |
| 22 | GA4 - Event - search | GA4 Event | CE - search |
| 24 | GA4 - Event - login | GA4 Event | CE - login |
| 26 | GA4 - Event - sign_up | GA4 Event | CE - sign_up |

### Triggers Included

All triggers are Custom Event triggers (CE) listening for specific event names in dataLayer.

### Variables Included

| Variable Name | Type | DataLayer Path |
|---------------|------|----------------|
| GA4 Measurement ID | Constant | - |
| DLV - ecommerce.currency | Data Layer Variable | ecommerce.currency |
| DLV - ecommerce.value | Data Layer Variable | ecommerce.value |
| DLV - ecommerce.items | Data Layer Variable | ecommerce.items |
| DLV - ecommerce.transaction_id | Data Layer Variable | ecommerce.transaction_id |
| DLV - ecommerce.tax | Data Layer Variable | ecommerce.tax |
| DLV - ecommerce.shipping | Data Layer Variable | ecommerce.shipping |
| DLV - ecommerce.item_list_name | Data Layer Variable | ecommerce.item_list_name |
| DLV - ecommerce.shipping_tier | Data Layer Variable | ecommerce.shipping_tier |
| DLV - ecommerce.payment_type | Data Layer Variable | ecommerce.payment_type |
| DLV - ecommerce.search_term | Data Layer Variable | ecommerce.search_term |
| DLV - method | Data Layer Variable | method |

---

## Support

### Documentation

Full documentation available at: **https://jyco.io/docs/woocommerce-tracking**

### Technical Support

For implementation support, contact: **support@jyco.io**

### Consulting Services

Need custom implementation or advanced features? Contact JY/co for consulting: **hello@jyco.io**

---

## Changelog

### Version 1.0.0 (January 2025)

**Initial Release**

- Complete GA4 ecommerce event tracking
- WordPress plugin with settings page
- GTM container with all event tags
- AJAX add-to-cart tracking
- Variable product support
- User tracking with SHA-256 hashed email
- Debug mode for testing
- HPOS compatibility
- Privacy settings (role exclusion)
- Full documentation

---

## License

This plugin is proprietary software licensed to the purchaser for use on their WordPress installations.

**© 2025 JY/co. All rights reserved.**

---

**End of Document**
