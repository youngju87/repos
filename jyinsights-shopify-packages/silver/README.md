# JY Insights Silver Package

**Version:** 1.0
**Last Updated:** January 6, 2026
**Support:** contact@jyinsights.com

## Overview

The Silver Package is a pixel-only, GA4-compliant analytics implementation that provides complete ecommerce tracking without requiring any theme code changes. It uses Shopify's Web Pixels API for both storefront and checkout tracking, making it the easiest way to get professional GA4 tracking on your Shopify store.

### Key Features

✅ **Zero Theme Editing** - Install via Shopify Admin only (5 minutes)
✅ **GA4 Compliant** - Uses official GA4 event names and ecommerce schema
✅ **Complete Coverage** - All storefront and checkout events
✅ **Update-Proof** - Unaffected by theme changes or updates
✅ **GTM Integrated** - Pre-configured container with all tags and triggers
✅ **Single Pixel** - One file handles everything (storefront + checkout)
✅ **Easy Installation** - No developer required

---

## Architecture

```
┌─────────────────────────────────┐
│   Shopify Web Pixels API        │
│   (Single Custom Pixel)          │
└────────────┬────────────────────┘
             │
             │   Storefront Events
             │   Checkout Events
             │   Parallel Arrays
             │   ee_* Events
             │
             ▼
    ┌────────────────────┐
    │  window.dataLayer  │
    └────────┬───────────┘
             │
             ▼
    Google Tag Manager
             │
             ▼
    Google Analytics 4
```

### Single Pixel Design

Unlike Gold (Liquid + Pixel), Silver uses **one custom pixel** that subscribes to all Shopify analytics events:

**Storefront Events:**
- `page_viewed`
- `collection_viewed`
- `product_viewed`
- `search_submitted`
- `product_added_to_cart`
- `product_removed_from_cart`
- `cart_viewed`

**Checkout Events:**
- `checkout_started`
- `checkout_contact_info_submitted`
- `checkout_address_info_submitted`
- `checkout_shipping_info_submitted`
- `payment_info_submitted`
- `checkout_completed`

---

## What's Included

```
silver/
├── silver-pixel-GA4.js                # Single pixel file - v1.0 (~695 lines)
├── silver-gtm-container-ga4.json      # Pre-configured GTM container
├── silver-sdr-document.md             # Technical documentation (SDR)
└── README.md                          # This file
```

### Main File: silver-pixel-GA4.js

- Handles ALL tracking (storefront + checkout)
- GA4-compliant event names and schema
- GTM initialization built-in
- Dual email hashing (SHA-256 + SHA-1)
- URL-based page type detection
- ~695 lines of production-ready code

---

## Tracked Events

### Storefront Events
- `page_view` - Page loads with page type detection
- `view_item_list` - Collection/search pages with products
- `view_item` - Product detail page views
- `add_to_cart` - Product added to cart
- `remove_from_cart` - Product removed from cart
- `view_cart` - Cart page/drawer views

### Checkout Events
- `begin_checkout` - Checkout started
- `add_contact_info` - Email/phone entered
- `add_shipping_info` - Shipping method selected
- `add_payment_info` - Payment method selected
- `purchase` - Order completion with full details

---

## Installation

### Prerequisites

- Shopify store (any plan)
- Admin access
- Google Tag Manager container
- GA4 property

### Quick Installation

#### Step 1: Install Custom Pixel

1. Go to **Shopify Admin > Settings > Customer Events**
2. Click **Add custom pixel**
3. Name it: `JY Insights Silver GA4 Tracking v1.0`
4. **Paste the entire contents of `silver-pixel-GA4.js`**
5. **IMPORTANT**: Update the GTM container ID on line 39:
   - Change `GTM-XXXXXXX` to your actual GTM container ID
6. Click **Save**
7. Click **Connect** to activate the pixel

#### Step 2: Import GTM Container

1. Go to **Google Tag Manager** ([tagmanager.google.com](https://tagmanager.google.com))
2. Select your container (or create a new one)
3. Click **Admin** (bottom left) > **Import Container**
4. Choose `silver-gtm-container-ga4.json`
5. Select **Existing** workspace or create **New** workspace
6. Choose **Merge** > **Rename conflicting tags**
7. Click **Confirm**

#### Step 3: Configure Variables

In GTM, update the following constant variables:
- `Const - GA4 Measurement ID` → Your GA4 measurement ID (G-XXXXXXXXXX)
- `Const - Google Feed Region` → Your region (default: US)

```javascript
const google_feed_region = "UK"; // US, UK, CA, AU, etc.
```

**Step 4: Test**

1. Enable debug: `debugMode = true` (line 37)
2. Open browser console
3. Navigate through store
4. Verify events in console
5. Check GTM Preview
6. Verify GA4 DebugView

**Step 5: Deploy**

1. Set `debugMode = false`
2. Publish GTM container
3. Monitor for 24-48 hours

---

## Configuration

### Basic Settings

Edit lines 35-37 in `silver-analytics-pixel.js`:

```javascript
const GTM_ID = "GTM-XXXXXXX";         // Your GTM container
const google_feed_region = "US";      // Google Ads feed region
const debugMode = false;              // Enable console logging
```

### That's It!

No button selectors to configure. No theme-specific adjustments. The Web Pixels API handles all event detection automatically.

---

## Parameter Reference

### Product Parameters (Parallel Arrays)

```javascript
{
  product_id: [],          // Product IDs
  variant_id: [],          // Variant IDs
  product_name: [],        // Product titles
  product_handle: [],      // URL handles
  product_brand: [],       // Vendors
  product_type: [],        // Product types
  product_sku: [],         // SKUs
  variant_title: [],       // Variant names
  product_price: [],       // Prices (decimal)
  quantity: [],            // Quantities
  g_product_id: []         // Google Ads format
}
```

### Customer Parameters (RFM)

```javascript
user: {
  type: "member" | "visitor",
  id: "123456",
  email_sha256: "abc...",
  email_sha1: "def...",
  orders_count: 5,
  total_spent: 499.99,
  last_order: "2025-01-01"
}
```

### Transaction Parameters

```javascript
{
  transaction_id: "12345",
  order_id: "12345",
  order_name: "#1001",
  totalValue: 99.99,
  totalQuantity: 3,
  value: 109.99,
  tax: 8.00,
  shipping: 5.00,
  coupon: "SAVE10",
  currency: "USD",
  payment_type: "Shopify Payments"
}
```

---

## Limitations vs Gold Package

### What You Give Up

| Feature | Silver | Gold |
|---------|--------|------|
| **Product List Detail** | Limited | Full arrays |
| **Collection Products** | API-provided only | All products with Liquid |
| **Page Type Detection** | URL-based | Template-based |
| **Metafield Access** | No | Yes |
| **Custom Data** | Limited | Unlimited |
| **Product Position** | Not available | Available |

### What You Gain

✅ **No theme editing required**
✅ **Zero maintenance on theme updates**
✅ **5-minute installation**
✅ **Automatic Shopify compatibility**
✅ **No code conflicts**
✅ **Perfect for managed themes**

---

## GTM Integration

Same GTM setup as Gold package. The parallel array format is identical.

### Example Variable Transformation

Convert parallel arrays to GA4 items:

```javascript
function() {
  var productIds = {{product_id}};
  var productNames = {{product_name}};
  var prices = {{product_price}};
  var quantities = {{quantity}};

  if (!productIds) return undefined;

  var items = [];
  for (var i = 0; i < productIds.length; i++) {
    items.push({
      item_id: productIds[i],
      item_name: productNames[i],
      price: prices[i],
      quantity: quantities[i]
    });
  }
  return items;
}
```

---

## Validation

### Browser Console

**Enable Debug Mode:**
```javascript
// Line 37
debugMode = true
```

**Check Events:**
```javascript
// View all dataLayer events
dataLayer

// View specific events
dataLayer.filter(e => e.event === 'ee_addToCart')

// Check user data
dataLayer.find(e => e.event === 'sh_info').user
```

### GTM Preview

1. GTM → Preview
2. Enter your store URL
3. Complete purchase flow
4. Verify all tags fire

### GA4 DebugView

1. GA4 → Configure → DebugView
2. Events appear in real-time
3. Verify parameter structure

---

## Troubleshooting

### Pixel Not Loading

**Check Status:**
1. Settings → Customer Events
2. Verify pixel shows "Connected"
3. Look for green status indicator

**Check Console:**
```javascript
// Look for initialization message
// Should see: "jyinsights Silver Pixel -> Silver pixel initialized successfully"
```

### Events Not Firing

**Enable Debug Mode:**
- Set `debugMode = true`
- Reload page
- Check console for purple-backgrounded messages

**Common Issues:**
- GTM ID incorrect → Verify line 35
- Pixel not connected → Check Customer Events settings
- JavaScript error → Check browser console

### GTM Not Loading

**Verify GTM ID:**
```javascript
// Line 35 should have your real GTM ID
const GTM_ID = "GTM-XXXXXXX";
```

**Check Network Tab:**
- Look for `googletagmanager.com/gtm.js` request
- Should load on first page view
- Should load again on checkout

### Missing Product Data

**Collection/Search Pages:**
- Shopify API provides limited product data
- This is normal for pixel-only implementation
- For full product arrays, use Gold package

**Product Page:**
- Should have complete data
- Check console with debug mode
- Verify event fires: `ee_productDetail`

---

## Silver vs Gold Decision Guide

### Choose Silver When:

✅ You can't edit theme code
✅ You use a managed/hosted theme
✅ You want zero maintenance
✅ You need fast deployment
✅ You're OK with limited product list data
✅ Your theme updates frequently

### Choose Gold When:

✅ You can edit theme code
✅ You need complete product list data
✅ You want maximum customization
✅ You need metafield tracking
✅ You need precise page type detection
✅ You want product click position tracking

### Can't Decide?

**Start with Silver.** You can always upgrade to Gold later if you need the extra features. Silver gives you 95% of the value with 5% of the complexity.

---

## Theme Compatibility

Silver is **100% compatible** with all Shopify themes because it doesn't touch theme code.

### Confirmed Themes:

✅ Dawn
✅ Sense
✅ Craft
✅ Crave
✅ Ride
✅ Studio
✅ Refresh
✅ Impulse
✅ Prestige
✅ Empire
✅ Brooklyn
✅ Debut
✅ **Hyper 2.0** (and all others)

### Custom Themes:

✅ Works with any theme
✅ No conflicts
✅ No adjustments needed

---

## Best Practices

### Before Launch

- [ ] Test complete purchase flow
- [ ] Verify events in GA4 DebugView
- [ ] Check GTM Preview
- [ ] Disable debug mode
- [ ] Document GTM container version

### After Launch

- [ ] Monitor GA4 for 24-48 hours
- [ ] Verify revenue matches Shopify
- [ ] Check for console errors
- [ ] Review product data quality

### Ongoing Maintenance

- [ ] Check pixel status monthly
- [ ] Monitor GTM errors
- [ ] Audit data quality quarterly
- [ ] **No theme update checks needed!**

---

## Upgrading to Gold

If you need Gold's features later:

1. Install Gold storefront snippet
2. Replace Silver pixel with Gold checkout pixel
3. Update GTM (if needed)
4. Test complete flow

Both packages use the same event structure and parameters, so your GTM container will work with both.

---

## Support

### Documentation

- [Analyzify Docs](https://docs.analyzify.com)
- [Shopify Web Pixels](https://shopify.dev/docs/api/web-pixels-api)
- [GA4 Ecommerce](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)

### Contact

- Email: contact@jyinsights.com
- Website: www.jyinsights.com

---

## FAQ

**Q: Will this work with my theme?**
A: Yes. 100% compatible with all themes.

**Q: What happens when I update my theme?**
A: Nothing. Silver is unaffected by theme changes.

**Q: Can I customize the events?**
A: Yes, edit the pixel code. But consider Gold for extensive customization.

**Q: Why use parallel arrays instead of GA4 items?**
A: Analyzify standard. Your GTM can easily convert to GA4 format.

**Q: Do I need GTM?**
A: Highly recommended. You could send directly to GA4, but GTM provides flexibility.

**Q: Can I use both Silver and Gold?**
A: No. Choose one. Gold includes everything Silver has plus more.

**Q: Is my data secure?**
A: Yes. Email is SHA-256 hashed. Never sends plain text email.

**Q: What's the performance impact?**
A: Minimal. Single async script, deferred GTM load, optimized code.

---

## License

This package is **proprietary to jyinsights**.

✅ Use for client implementations
✅ Customize for your needs
✅ White-label for agencies
❌ Do not resell as standalone
❌ Do not distribute publicly

---

**Built with precision by jyinsights**
*Analyzify-Aligned Pixel-Only Analytics*

© 2025 jyinsights. All rights reserved.
