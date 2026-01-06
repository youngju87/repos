# JY Insights Gold Plus Package

**Version:** 1.4
**Last Updated:** January 6, 2026
**Support:** contact@jyinsights.com

## Overview

The Gold Plus Package is a production-ready, GA4-compliant analytics tracking solution for Shopify stores. It provides comprehensive ecommerce event tracking across the entire customer journey, from browsing to purchase completion.

### Key Features

✅ **Full GA4 Compliance** - Uses official GA4 event names and ecommerce schema
✅ **Enhanced Ecommerce** - Complete funnel tracking with discount/coupon support
✅ **User Data Collection** - SHA-256 hashed emails for Enhanced Conversions & Meta CAPI
✅ **List Attribution Persistence** - Tracks collection/search source through to purchase (v1.4)
✅ **Quick View Tracking** - Complete tracking for quick view modals with view_type parameter (v1.2+)
✅ **Add to Cart Context** - Distinguishes pdp/quick_view/collection_quick_add sources (v1.3+)
✅ **dataLayer Preservation** - Never clears or overwrites `window.dataLayer`
✅ **Checkout Extensibility Support** - Uses latest Shopify delivery APIs
✅ **GTM Integrated** - Pre-configured container with all tags, triggers, and variables
✅ **Zero Dependencies** - Pure JavaScript, no external libraries required
✅ **Hybrid Architecture** - Liquid (storefront) + Custom Pixel (checkout)

## What's Included

```
gold/
├── gold-storefront-datalayer-GA4.liquid   # Storefront tracking v1.3
├── gold-checkout-pixel-GA4.js             # Checkout tracking v1.4
├── gold-gtm-container-ga4.json            # Pre-configured GTM container v1.4
├── GTM-IMPORT-GUIDE.md                    # GTM import instructions
├── gold-sdr-document.md                   # Technical documentation (SDR)
├── SERVER-SIDE-GA4-GUIDE.md               # Server-side GA4 setup guide
├── SERVER-SIDE-FACEBOOK-CAPI-GUIDE.md     # Facebook CAPI setup guide
├── README.md                              # This file
└── [additional guides...]                 # Configuration and reference docs
```

## Tracked Events

### Storefront Events (Liquid v1.3)
- `user_data_ready` - Session user data with customer info, order history
- `page_data_ready` - Page context, navigation, template type
- `page_view` - Page loads with context flag
- `view_item_list` - Collection/search pages with up to 50 products
  - Includes actual search term in item_list_name (e.g., "Search: team lead")
- `view_item` - Product detail page (PDP) OR quick view modal
  - Includes `view_type` parameter: `'pdp'` or `'quick_view'`
  - Saves list attribution to sessionStorage for checkout tracking
- `select_item` - Product clicks from collections/search (with list context)
  - Saves list attribution to sessionStorage
- `add_to_cart` - Add to cart from multiple sources
  - Includes `context` parameter: `'pdp'`, `'quick_view'`, or `'collection_quick_add'`
  - Includes list attribution (item_list_id, item_list_name) when from collection/search
  - Full product data fetched via Shopify API for quick view add to cart
- `remove_from_cart` - Cart item removal
- `view_cart` - Cart page & drawer (with `cart_type` parameter)
- `search` - Search query submitted

### Checkout Events (Custom Pixel v1.4)
- `user_data_ready` - User data with SHA-256 hashed email/phone
- `page_data_ready` - Checkout page context
- `page_view` - Checkout page loads with context flag
- `begin_checkout` - Checkout started (with coupon tracking)
- `add_contact_info` - Customer email/phone entered
- `add_shipping_info` - Shipping method selected (fires twice per Shopify API)
- `add_payment_info` - Payment method selected (with actual payment type)
- `purchase` - Order completion
  - Item-level discounts
  - List attribution from sessionStorage (item_list_id, item_list_name)
  - Enables revenue attribution by source collection/search in GA4

## Quick Start

### Prerequisites

- Shopify store (any plan)
- Admin access
- Google Tag Manager container
- Google Analytics 4 property

### Installation Steps

#### 1. Install Storefront Tracking

1. Go to **Shopify Admin > Online Store > Themes**
2. Click **...** (Actions) > **Edit code**
3. Open `theme.liquid` in the **Layout** folder
4. Find the `</head>` closing tag (usually around line 100-200)
5. **Paste the entire contents of `gold-storefront-datalayer-GA4.liquid` BEFORE `</head>`**
6. **IMPORTANT**: Update the GTM container ID on line 15:
   - Change `GTM-K9JX87Z6` to your actual GTM container ID
7. Click **Save**

#### 2. Install Checkout Pixel

1. Go to **Shopify Admin > Settings > Customer Events**
2. Click **Add custom pixel**
3. Name it: `JY Gold Plus GA4 Tracking v1.4`
4. **Paste the entire contents of `gold-checkout-pixel-GA4.js`**
5. **IMPORTANT**: Update the GTM container ID in the CONFIG object (around line 53):
   - Change `gtmContainerId: 'GTM-K9JX87Z6'` to your actual GTM ID
6. Click **Save**
7. Click **Connect** to activate the pixel

#### 3. Import GTM Container

1. Go to **Google Tag Manager** ([tagmanager.google.com](https://tagmanager.google.com))
2. Select your container (or create a new one)
3. Click **Admin** (bottom left) > **Import Container**
4. Choose `gold-gtm-container-ga4.json`
5. Select workspace: **New** (name it "JY Gold Plus GA4 v1.1")
6. Import option: **Merge** (keeps existing tags)
7. Click **Confirm**

> **Detailed Import Guide**: See [GTM-IMPORT-GUIDE.md](./GTM-IMPORT-GUIDE.md) for step-by-step instructions with screenshots.

#### 4. Configure GA4 Measurement ID

1. In GTM, go to **Variables**
2. Click on `Const - GA4 Measurement ID`
3. Change value from `G-XXXXXXXXXX` to your actual GA4 Measurement ID
   - Find this in GA4 under **Admin > Data Streams > Web > Measurement ID**
4. Click **Save**

#### 5. Test & Publish

1. Click **Preview** in GTM (top right)
2. Enter your Shopify store URL
3. Test all events (see Testing section below)
4. When satisfied, click **Submit** > **Publish**
5. Version name: `JY Gold Plus GA4 v1.1 - Initial Setup`

## Configuration

### Storefront Data Layer Configuration

Edit these settings at the top of the storefront liquid file:

```javascript
window.jyInsights = {
  logging: true,                   // Enable console logging for testing
  send_unhashed_email: false,      // Send unhashed email (not recommended)
  g_feed_region: 'US',             // Google Ads feed region (US, UK, etc.)

  // Hyper 2.0 optimized button attributes
  addtocart_btn_attributes: {
    "name": ["add"],
    "type": ["submit"]
  },
  removefromcart_btn_attributes: {
    "class": ["cart-remove-button"],
    "href": ["/cart/change?line="]
  },
  checkout_btn_attributes: {
    "name": ["checkout"],
    "href": ["/checkout"]
  }
  // ... more attribute configs
};
```

### Checkout Pixel Configuration

Edit these settings in the checkout pixel file:

```javascript
var CONFIG = {
  debug: false,                    // Enable console logging for testing
  version: '1.0',
  googleFeedRegion: 'US'          // Change for your region
};
```

### Customizing for Other Themes

If you're not using Hyper 2.0, update the selectors to match your theme:

1. Inspect your theme's HTML in browser DevTools
2. Find the actual classes/IDs/attributes used for:
   - Cart drawer element
   - Add to cart buttons
   - Remove from cart buttons
   - Checkout buttons
3. Update the `CONFIG.selectors` object accordingly

## Testing

### Enable Debug Mode

Set `logging: true` in the storefront file to see console logs:

```javascript
window.jyInsights = {
  logging: true,  // Enable this for testing
  // ...
};
```

For the checkout pixel, set `debug: true`:

```javascript
var CONFIG = {
  debug: true,  // Enable this for testing
  // ...
};
```

### GTM Preview Mode

1. In GTM, click **Preview**
2. Enter your store URL
3. Test each event:
   - Browse collections → `view_item_list`
   - Click product → `select_item`
   - View product page → `view_item`
   - Add to cart → `add_to_cart`
   - View cart → `view_cart`
   - Open cart drawer → `view_cart` (with `cart_type: 'drawer'`)
   - Click checkout → `begin_checkout`
   - Complete purchase → `add_shipping_info`, `add_payment_info`, `purchase`

### GA4 DebugView

1. In GA4, go to **Admin > DebugView**
2. Visit your store with `?debug_mode=1` parameter
3. Perform test actions
4. Verify events appear with correct parameters

## Data Layer Structure

### Storefront Events (Parallel Array Format)

The storefront uses a parallel array format for compatibility with various analytics tools:

```javascript
// Example: Add to Cart Event
{
  event: 'add_to_cart',
  product_id: '6789012345',
  product_name: 'Blue T-Shirt',
  product_handle: 'blue-t-shirt',
  product_brand: 'Brand Name',
  product_type: 'Apparel',
  product_price: 29.99,
  product_sku: 'TS-BLU-M',
  variant_id: '40123456789',
  variant_title: 'Medium / Blue',
  quantity: 1,
  currency: 'USD',
  category_id: '123456',
  category_title: 'T-Shirts',
  g_product_id: 'shopify_US_6789012345_40123456789'
}
```

```javascript
// Example: View Cart Event (with multiple products)
{
  event: 'view_cart',
  page_type: 'cart',
  cart_type: 'drawer',  // or 'page' for cart page
  product_id: ['6789012345', '6789012346'],
  product_name: ['Blue T-Shirt', 'Red Hat'],
  product_handle: ['blue-t-shirt', 'red-hat'],
  product_brand: ['Brand Name', 'Brand Name'],
  product_type: ['Apparel', 'Accessories'],
  product_sku: ['TS-BLU-M', 'HAT-RED'],
  product_price: [29.99, 19.99],
  variant_id: ['40123456789', '40123456790'],
  variant_title: ['Medium / Blue', 'One Size / Red'],
  quantity: [1, 2],
  currency: 'USD',
  totalValue: 69.97,
  totalQuantity: 3,
  product_list_id: 'cart',
  product_list_name: 'Cart',
  g_product_id: ['shopify_US_6789012345_40123456789', 'shopify_US_6789012346_40123456790']
}
```

### Checkout Events (GA4 Standard Format)

The checkout pixel uses standard GA4 ecommerce format:

```javascript
// Example: Purchase Event
{
  event: 'purchase',
  ecommerce: {
    transaction_id: '1001',
    currency: 'USD',
    value: 99.97,
    tax: 8.50,
    shipping: 10.00,
    coupon: 'SUMMER10',
    items: [{
      item_id: '40123456789',
      item_name: 'Blue T-Shirt',
      item_brand: 'Brand Name',
      item_category: 'Apparel',
      item_variant: 'Medium / Blue',
      price: 29.99,
      quantity: 1,
      product_id: '6789012345',
      variant_id: '40123456789',
      g_product_id: 'shopify_US_6789012345_40123456789',
      sku: 'TS-BLU-M'
    }]
  },
  user_id: '1234567890',
  payment_type: 'Credit Card'
}
```

## Architecture Principles

### ✅ DO

- **ONLY use `window.dataLayer.push()`** to add events
- Use GA4 event names (`add_to_cart`, `purchase`, `view_item`, etc.)
- Use parallel array format for storefront events (for compatibility)
- Use standard GA4 ecommerce format for checkout events
- Preserve existing dataLayer state at all times
- Test thoroughly in GTM Preview mode
- Listen for cart drawer events to track mini cart views
- Prevent duplicate events from quantity +/- buttons

### ❌ DON'T

- **NEVER reassign `window.dataLayer`** (e.g., `window.dataLayer = []`)
- **NEVER clear dataLayer** (e.g., `window.dataLayer.length = 0`)
- Don't use deprecated UA event names (e.g., `ee_addToCart`, `ee_purchase`, `sh_info`)
- Don't fire add_to_cart events on quantity changes
- Don't make unnecessary changes to the core logic

## Hyper 2.0 Theme Specifics

The package includes optimized selectors for Hyper 2.0:

- `cart-drawer` custom element for cart drawer
- `quantity-selector` custom element for quantity inputs
- `button[name="minus"]` and `button[name="plus"]` for quantity controls
- `cart-remove-button` custom element for remove buttons
- Event listeners for `cart:refresh` custom event

## Troubleshooting

### Events Not Firing

1. Check browser console for errors
2. Verify GTM container is installed
3. Enable `debug: true` and check console logs
4. Use GTM Preview mode to see what GTM sees

### dataLayer Issues

- Check console for reassignment warnings
- Verify code uses `.push()` not `=`
- Look for other scripts that might interfere

### Hyper 2.0 Selectors Not Working

- Inspect HTML to verify custom element names
- Check if theme version has changed selectors
- Update `CONFIG.selectors` to match current theme

### Purchase Event Missing

- Verify Custom Pixel is installed and connected
- Check checkout pixel has no JavaScript errors
- Ensure order completed successfully
- Test with a new test order (events only fire once per order)

## Performance

- **Storefront Liquid**: ~700 lines, <50ms page load impact
- **Checkout Pixel**: ~350 lines, minimal impact
- **No external dependencies**: Zero additional HTTP requests
- **Optimized DOM queries**: Uses event delegation and efficient selectors

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6 features used (arrow functions, async/await, etc.)
- SHA-256 hashing requires HTTPS (for email hashing)

## Support & Maintenance

### Getting Help

- **Email**: contact@jyinsights.com
- **Documentation**: See `gold-sdr-document.md` for detailed technical specs

### Recommended Maintenance

- **Quarterly**: Verify all events still firing after Shopify updates
- **After theme updates**: Re-test selectors and update if needed
- **Monitor GA4**: Check data quality regularly

## What's New in v1.2

### Storefront (v1.2)
- ✅ **Quick view tracking** - Detects quick view modal opens and tracks with `view_type: 'quick_view'`
- ✅ **view_type parameter** - Distinguishes product detail page (`'pdp'`) from quick view (`'quick_view'`)
- ✅ **Enhanced product insights** - Better understanding of how users discover products

### GTM Container (v1.2)
- ✅ **17 pre-configured tags** - All GA4 ecommerce + Google Ads + Meta Pixel
- ✅ **Google Ads integration** - Conversion Linker + Purchase conversion tag
- ✅ **Meta Pixel integration** - Base code (PageView) + Purchase event
- ✅ **24 data layer variables** - Added `Event - view_type` variable
- ✅ **27 total variables** - Including platform-specific constant variables

### Documentation (v1.2)
- ✅ **Server-Side GA4 Guide** - Complete setup for server-side Google Analytics 4
- ✅ **Facebook CAPI Guide** - Complete setup for Facebook Conversions API
- ✅ **Platform integration** - Ready for hybrid client+server tracking

---

## What's New in v1.1

### Storefront (v1.1)
- ✅ **Removed duplicate begin_checkout** - Now exclusively handled by checkout pixel
- ✅ **Fixed item indexing** - Proper index parameter passing in `.map()` calls
- ✅ **Enhanced documentation** - Comprehensive inline comments and changelog
- ✅ **Version sync** - Aligned with checkout pixel versioning scheme

### Checkout Pixel (v1.3)
- ✅ **Discount tracking** - Full coupon code and item-level discount support
- ✅ **Marketing opt-in** - Captures `accepts_marketing` status
- ✅ **Enhanced shipping data** - Supports Checkout Extensibility API (`delivery.selectedDeliveryOptions`)
- ✅ **Payment method tracking** - Captures actual payment type from `checkout.paymentMethod.name`
- ✅ **GTM iframe integration** - GTM now loads inside checkout pixel iframe
- ✅ **Context events** - Proper `user_data_ready`, `page_data_ready`, `page_view` sequencing
- ✅ **Duplicate event fixes** - Removed 27 lines of redundant code
- ✅ **Index handling** - Fixed all `.map()` calls for proper item positioning

### GTM Container (v1.1)
- ✅ **13 pre-configured tags** - All GA4 ecommerce events ready to use
- ✅ **23 data layer variables** - Complete ecommerce, user, and page data coverage
- ✅ **12 custom event triggers** - Matches all storefront and checkout events
- ✅ **User properties** - Automatic customer segmentation (logged_in, customer_type, orders_count)
- ✅ **Enhanced Conversions ready** - SHA-256 email/phone hashing for privacy-safe matching

## Version History

### v1.2 (January 6, 2026)
- Added quick view modal tracking with `view_type` parameter
- Enhanced view_item events to distinguish PDP vs quick view
- Added Google Ads Conversion Linker and Conversion tags to GTM container
- Added Meta Pixel Base Code and Purchase event tags to GTM container
- Created comprehensive Server-Side GA4 setup guide
- Created comprehensive Facebook CAPI setup guide
- Updated GTM container to 17 tags, 24 event variables, 27 total variables
- Enhanced platform integration readiness (Google Ads, Meta, server-side)

### v1.1 (January 5, 2026)
- Complete refactoring of both storefront and checkout tracking
- Added comprehensive discount/coupon tracking throughout funnel
- Integrated GTM loading into checkout pixel iframe
- Fixed duplicate begin_checkout event between storefront and checkout
- Enhanced documentation with inline comments and changelogs
- Created importable GTM container with all tags pre-configured
- Added support for Shopify Checkout Extensibility APIs
- Fixed item index handling across all ecommerce events

### v1.0 (January 2, 2026)
- Initial GA4-compliant release
- Hybrid architecture (Liquid + Custom Pixel)
- Full ecommerce event tracking (storefront through purchase)
- SHA-256 email hashing for privacy compliance
- Cart drawer tracking with MutationObserver
- Hyper 2.0 theme optimization

## License

Proprietary - JY Insights
For use by JY Insights clients only

---

**Need help?** Contact JY Insights: contact@jyinsights.com
