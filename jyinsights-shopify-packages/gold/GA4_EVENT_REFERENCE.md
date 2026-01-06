# GA4 Event Quick Reference - Gold Package v5.1

## 🎯 Standard GA4 Item Object Structure

Every item in `ecommerce.items[]` follows this structure:

```javascript
{
  item_id: "12345",              // REQUIRED: String - Variant ID
  item_name: "Product Name",     // REQUIRED: String - Product title
  item_brand: "Brand Name",      // RECOMMENDED: String - Vendor
  item_category: "Category",     // RECOMMENDED: String - Product type
  item_variant: "Blue / Large",  // RECOMMENDED: String - Variant title
  price: 29.99,                  // REQUIRED: Number - Unit price
  quantity: 2,                   // REQUIRED: Number - Quantity

  // Optional context (where applicable):
  item_list_name: "Collection",  // List name (collections, search)
  item_list_id: "collection_123", // List ID (collections, search)
  index: 0                       // Position in list (0-based)
}
```

---

## 📋 All Events at a Glance

| Event | When Fired | ecommerce Properties | Custom Properties |
|-------|------------|---------------------|-------------------|
| `page_view` | Every page load | ❌ None | page_type, page_title, customer_logged_in, user_id |
| `user_data` | Every page load | ❌ None | user.type, user.id, user.email_sha256, user.orders_count, etc. |
| `view_item_list` | Collection page | items[], item_list_id, item_list_name | product_name[], product_id[], variant_id[], g_product_id[] |
| `search` | Search page | ❌ None | search_term |
| `view_search_results` | Search page | items[] | search_term, search_results, product_name[], etc. |
| `view_item` | Product page | items[], currency, value | product_id, product_handle, variant_id, category_id, g_product_id |
| `select_item` | Click product link | items[], item_list_id, item_list_name | product_handle, product_sku, product_position, g_product_id |
| `add_to_cart` | Click add to cart | items[], currency, value | product_handle, category_id, product_sku, g_product_id |
| `remove_from_cart` | Click remove | items[], currency, value | product_handle, g_product_id |
| `view_cart` | Cart page/drawer | items[], currency, value | page_type, cart_type, totalValue, totalQuantity, product_handle[] |
| `begin_checkout` | Click checkout | items[], currency, value | page_type, totalValue, totalQuantity, product_handle[], g_product_id[] |

---

## 🔍 Detailed Event Breakdowns

### 1. user_data (Custom Event)
**Trigger:** Page load
**Purpose:** Customer information for personalization

```javascript
{
  event: 'user_data',
  page_type: 'Product',
  page_currency: 'USD',
  user: {
    type: 'member',           // or 'visitor'
    id: '12345',
    logged_in: true,
    orders_count: '5',
    total_spent: '249.95',
    last_order: 'December 15, 2025 3:45PM',
    email_sha256: 'abc123...',
    email_sha1: 'def456...',
    email: null               // Only if send_unhashed_email = true
  }
}
```

---

### 2. page_view
**Trigger:** Page load
**Purpose:** Standard GA4 pageview

```javascript
{
  event: 'page_view',
  page_type: 'product',       // 'homepage', 'collection', 'cart', etc.
  page_title: 'Cool Product - My Store',
  customer_logged_in: true,
  user_id: '12345'            // Only if logged in
}
```

---

### 3. view_item_list
**Trigger:** Collection page load
**Purpose:** Track product list impressions

```javascript
{
  event: 'view_item_list',

  // GA4 STANDARD
  ecommerce: {
    item_list_id: '123456789',
    item_list_name: 'Summer Collection',
    items: [
      {
        item_id: '789',
        item_name: 'Cool T-Shirt',
        item_brand: 'Brand Name',
        item_category: 'Apparel',
        item_variant: 'Blue / Medium',
        item_list_name: 'Summer Collection',
        item_list_id: '123456789',
        price: 29.99,
        index: 0,
        quantity: 1
      }
      // ... more items
    ]
  },

  // LEGACY/CUSTOM
  category_name: 'Summer Collection',
  category_id: '123456789',
  product_brand: ['Brand Name', ...],
  product_type: ['Apparel', ...],
  product_sku: ['SKU-123', ...],
  product_name: ['Cool T-Shirt', ...],
  product_handle: ['cool-t-shirt', ...],
  product_id: ['456789', ...],
  product_price: [29.99, ...],
  currency: 'USD',
  product_position: [1, 2, 3, ...],
  g_product_id: ['shopify_US_456789_789', ...],
  variant_id: ['789', ...],
  variant_title: ['Blue / Medium', ...]
}
```

---

### 4. search + view_search_results
**Trigger:** Search page load
**Purpose:** Track search queries and results

```javascript
// Event 1: search
{
  event: 'search',
  search_term: 'blue shoes'
}

// Event 2: view_search_results
{
  event: 'view_search_results',
  search_term: 'blue shoes',

  // GA4 STANDARD
  ecommerce: {
    items: [
      {
        item_id: '123',
        item_name: 'Blue Sneakers',
        item_brand: 'Nike',
        item_category: 'Footwear',
        item_variant: 'Blue / Size 10',
        item_list_name: 'Search Results',
        item_list_id: 'search_results',
        price: 89.99,
        index: 0,
        quantity: 1
      }
      // ... more results
    ]
  },

  // LEGACY/CUSTOM
  page_type: 'search',
  search_results: 15,
  product_brand: ['Nike', ...],
  product_type: ['Footwear', ...],
  // ... same parallel arrays as view_item_list
}
```

---

### 5. view_item
**Trigger:** Product page load
**Purpose:** Track product detail views

```javascript
{
  event: 'view_item',

  // GA4 STANDARD
  ecommerce: {
    currency: 'USD',
    value: 49.99,
    items: [{
      item_id: '789',
      item_name: 'Cool Product',
      item_brand: 'Brand Name',
      item_category: 'Category Name',
      item_variant: 'Blue / Large',
      price: 49.99,
      quantity: 1
    }]
  },

  // LEGACY/CUSTOM
  product_id: '456789',
  product_name: 'Cool Product',
  product_handle: 'cool-product',
  product_type: 'Category Name',
  product_brand: 'Brand Name',
  product_sku: 'SKU-456',
  product_price: 49.99,
  currency: 'USD',
  category_id: '123',
  category_name: 'Parent Collection',
  g_product_id: 'shopify_US_456789_789',
  variant_id: '789',
  variant_title: 'Blue / Large'
}
```

---

### 6. select_item
**Trigger:** Click on product link in collection or search
**Purpose:** Track product clicks with list context

```javascript
{
  event: 'select_item',

  // GA4 STANDARD
  ecommerce: {
    item_list_id: '123',
    item_list_name: 'Summer Collection',
    items: [{
      item_id: '789',
      item_name: 'Clicked Product',
      item_brand: 'Brand',
      item_category: 'Category',
      item_variant: 'Blue / M',
      item_list_name: 'Summer Collection',
      item_list_id: '123',
      price: 29.99,
      index: 3,              // Position in list (0-based)
      quantity: 1
    }]
  },

  // LEGACY/CUSTOM
  product_id: '456',
  product_name: 'Clicked Product',
  product_handle: 'clicked-product',
  product_type: 'Category',
  product_sku: 'SKU-789',
  product_brand: 'Brand',
  product_price: 29.99,
  category_id: '123',
  category_name: 'Summer Collection',
  currency: 'USD',
  product_position: 4,       // 1-based position
  variant_id: '789',
  variant_title: 'Blue / M'
}
```

---

### 7. add_to_cart
**Trigger:** Click "Add to Cart" button
**Purpose:** Track items added to cart

```javascript
{
  event: 'add_to_cart',

  // GA4 STANDARD
  ecommerce: {
    currency: 'USD',
    value: 59.98,              // price * quantity
    items: [{
      item_id: '789',
      item_name: 'Product Name',
      item_brand: 'Brand',
      item_category: 'Category',
      item_variant: 'Blue / XL',
      price: 29.99,
      quantity: 2
    }]
  },

  // LEGACY/CUSTOM
  product_name: 'Product Name',
  product_handle: 'product-handle',
  product_id: '456',
  product_price: 29.99,
  currency: 'USD',
  product_brand: 'Brand',
  product_type: 'Category',
  category_id: '123',
  category_title: 'Collection Name',
  quantity: 2,
  variant_id: '789',
  variant_title: 'Blue / XL',
  product_sku: 'SKU-XL-BLU',
  g_product_id: 'shopify_US_456_789'
}
```

**Collection Quick Add:**
Same structure, plus:
```javascript
{
  ecommerce: {
    items: [{
      // ... standard fields
      item_list_name: 'Collection Name',
      item_list_id: '123'
    }]
  }
}
```

---

### 8. remove_from_cart
**Trigger:** Click remove button in cart
**Purpose:** Track cart item removals

```javascript
{
  event: 'remove_from_cart',

  // GA4 STANDARD
  ecommerce: {
    currency: 'USD',
    value: 29.99,              // price * quantity
    items: [{
      item_id: '789',
      item_name: 'Product Name',
      item_brand: 'Brand',
      item_category: 'Category',
      item_variant: 'Blue / M',
      price: 29.99,
      quantity: 1
    }]
  },

  // LEGACY/CUSTOM
  product_id: '456',
  product_name: 'Product Name',
  product_handle: 'product-handle',
  variant_id: '789',
  variant_title: 'Blue / M',
  product_price: 29.99,
  currency: 'USD',
  product_brand: 'Brand',
  quantity: 1
}
```

---

### 9. view_cart
**Trigger:** Cart page load OR cart drawer open
**Purpose:** Track cart contents

```javascript
{
  event: 'view_cart',

  // GA4 STANDARD
  ecommerce: {
    currency: 'USD',
    value: 149.97,             // Total cart value
    items: [
      {
        item_id: '123',
        item_name: 'Product 1',
        item_brand: 'Brand A',
        item_category: 'Category',
        item_variant: 'Blue / S',
        price: 49.99,
        quantity: 2
      },
      {
        item_id: '456',
        item_name: 'Product 2',
        item_brand: 'Brand B',
        item_category: 'Category',
        item_variant: 'Red / M',
        price: 49.99,
        quantity: 1
      }
    ]
  },

  // LEGACY/CUSTOM
  page_type: 'cart',           // or 'cart_drawer'
  cart_type: 'drawer',         // Only when drawer
  product_id: ['789', '101'],
  product_name: ['Product 1', 'Product 2'],
  product_handle: ['product-1', 'product-2'],
  product_type: ['Category', 'Category'],
  product_brand: ['Brand A', 'Brand B'],
  product_sku: ['SKU-1', 'SKU-2'],
  product_list_id: 'cart',
  product_list_name: 'Cart',
  variant_id: ['123', '456'],
  variant_title: ['Blue / S', 'Red / M'],
  product_price: [49.99, 49.99],
  currency: 'USD',
  quantity: [2, 1],
  totalValue: 149.97,
  totalQuantity: 3,
  g_product_id: ['shopify_US_789_123', 'shopify_US_101_456']
}
```

**Cart Drawer Specific:**
- `page_type: 'cart_drawer'`
- `cart_type: 'drawer'`
- Duplicate prevention (max 1 event per second)

---

### 10. begin_checkout ⚠️ PIXEL COMPATIBLE
**Trigger:** Click "Checkout" button
**Purpose:** Track checkout initiation

```javascript
{
  event: 'begin_checkout',

  // GA4 STANDARD
  ecommerce: {
    currency: 'USD',
    value: 149.97,
    items: [
      {
        item_id: '123',
        item_name: 'Product 1',
        item_brand: 'Brand',
        item_category: 'Category',
        item_variant: 'Blue / S',
        price: 49.99,
        quantity: 2
      }
      // ... more items
    ]
  },

  // LEGACY/CUSTOM
  page_type: 'cart',
  product_id: ['789', ...],
  product_name: ['Product 1', ...],
  product_handle: ['product-1', ...],
  product_brand: ['Brand', ...],
  product_type: ['Category', ...],
  product_sku: ['SKU-1', ...],
  variant_id: ['123', ...],
  variant_title: ['Blue / S', ...],
  product_price: [49.99, ...],
  currency: 'USD',
  quantity: [2, ...],
  totalValue: 149.97,
  totalQuantity: 3,
  g_product_id: ['shopify_US_789_123', ...]
}
```

**Checkout Pixel Equivalent:**
```javascript
// Fired by gold-checkout-pixel-main.js
{
  event: 'begin_checkout',
  ecommerce: {
    currency: 'USD',
    value: 149.97,
    items: [ /* same structure */ ]
  },
  user_data: {
    email_sha256: 'abc123...'  // Additional checkout-specific data
  }
}
```

✅ **Compatible!** Both use identical ecommerce.items structure.

---

## 🎨 GTM Variable Mapping

### GA4 Variables (ecommerce object):

| GTM Variable Name | Type | Path |
|-------------------|------|------|
| Ecommerce Items | Data Layer Variable | `ecommerce.items` |
| Ecommerce Value | Data Layer Variable | `ecommerce.value` |
| Ecommerce Currency | Data Layer Variable | `ecommerce.currency` |
| Item List Name | Data Layer Variable | `ecommerce.item_list_name` |
| Item List ID | Data Layer Variable | `ecommerce.item_list_id` |

### Legacy Variables (parallel arrays):

| GTM Variable Name | Type | Path |
|-------------------|------|------|
| Product Names | Data Layer Variable | `product_name` |
| Product IDs | Data Layer Variable | `product_id` |
| Product Handles | Data Layer Variable | `product_handle` |
| Variant IDs | Data Layer Variable | `variant_id` |
| Google Product IDs | Data Layer Variable | `g_product_id` |
| Total Cart Value | Data Layer Variable | `totalValue` |
| Total Cart Quantity | Data Layer Variable | `totalQuantity` |

---

## 🔧 Common GTM Patterns

### GA4 Configuration Tag:
```
Tag Type: GA4 Configuration
Measurement ID: G-XXXXXXXXXX

Triggering: All Pages

Parameters:
  - send_page_view: false  (we send custom page_view)
```

### GA4 Event Tag (All Ecommerce):
```
Tag Type: GA4 Event
Configuration Tag: {{ GA4 Config }}
Event Name: {{ Event }}

Triggering:
  Event Name matches regex: view_item_list|view_item|add_to_cart|remove_from_cart|view_cart|begin_checkout|select_item

Send Ecommerce Data: true
```

### Custom Trigger (begin_checkout):
```
Trigger Type: Custom Event
Event Name: begin_checkout

Fires On: All Custom Events
```

---

## 📊 Data Layer Example Sequence

### User Journey: Browse → View → Add → Checkout

```javascript
// 1. Collection page load
dataLayer.push({
  event: 'view_item_list',
  ecommerce: { items: [...], item_list_name: 'Summer Sale' }
});

// 2. Click product
dataLayer.push({
  event: 'select_item',
  ecommerce: { items: [{...}], item_list_name: 'Summer Sale' }
});

// 3. Product page load
dataLayer.push({
  event: 'view_item',
  ecommerce: { items: [{...}], value: 49.99, currency: 'USD' }
});

// 4. Add to cart
dataLayer.push({
  event: 'add_to_cart',
  ecommerce: { items: [{...}], value: 49.99, currency: 'USD' }
});

// 5. View cart
dataLayer.push({
  event: 'view_cart',
  ecommerce: { items: [{...}], value: 49.99, currency: 'USD' }
});

// 6. Begin checkout
dataLayer.push({
  event: 'begin_checkout',
  ecommerce: { items: [{...}], value: 49.99, currency: 'USD' }
});
```

---

## 🐛 Debugging Tips

### Check DataLayer in Console:
```javascript
// View all events
window.dataLayer

// View last event
window.dataLayer[window.dataLayer.length - 1]

// View jyInsights logs
window.jyInsights.logs

// Check version
window.jyInsights.version
// Output: "5.1.0-ga4-compliant"
```

### GTM Preview Mode:
1. Enable Preview Mode in GTM
2. Navigate to your Shopify store
3. Check "Summary" tab for events
4. Click event → "Data Layer" tab
5. Verify `ecommerce.items` structure

### GA4 DebugView:
1. Install Google Analytics Debugger extension
2. Enable debug mode
3. Navigate store
4. Check GA4 DebugView in real-time
5. Verify events and parameters

---

## ⚡ Performance Notes

### Event Firing Times:
- `user_data`, `page_view`: <5ms (page load)
- `view_item_list`, `view_item`: <10ms (Liquid render)
- `view_cart`, `begin_checkout`: <50ms (includes fetch)
- `add_to_cart`, `remove_from_cart`: <5ms (synchronous)

### Optimization:
- Single `/cart.js` fetch per cart view
- Efficient DOM queries with `matches()`
- Duplicate prevention for cart drawer
- No blocking operations

---

## 📞 Support
- Version: 5.1.0-ga4-compliant
- Documentation: `gold-sdr-document.md`
- Email: contact@jyinsights.com
