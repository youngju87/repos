# Event Reference

**Version:** 1.2 | **Last Updated:** January 2026

Complete documentation of all events emitted by the JY Insights Gold package, including parameters, trigger sources, and GA4 mapping guidance.

---

## Event Naming Convention

All events follow Google's recommended GA4 naming convention:

- **Snake_case**: All event names use lowercase with underscores
- **Standard Events**: Use GA4 recommended event names where applicable
- **Custom Events**: Prefixed appropriately (e.g., `user_data_ready`)
- **Max Length**: 40 characters

---

## Event Categories

| Category | Events | Source |
|----------|--------|--------|
| Consent | `consent_default`, `consent_updated`, `consent_gpc_detected` | Consent Mode API |
| User Data | `user_data_ready` | Storefront DataLayer, Checkout Pixel |
| Page Data | `page_data_ready`, `page_view` | Storefront DataLayer, Checkout Pixel |
| Ecommerce | `view_item_list`, `view_item`, `select_item`, `add_to_cart`, `remove_from_cart`, `view_cart`, `begin_checkout`, `add_shipping_info`, `add_payment_info`, `purchase` | Storefront DataLayer, Checkout Pixel |
| Search | `search` | Storefront DataLayer |
| Contact | `add_contact_info` | Checkout Pixel |

---

## Consent Events

### consent_default

Fired immediately on page load with initial consent state (typically all denied).

**Source:** `shopify-privacy-consent-mode-api.liquid`

**Trigger:** Page load, before any other tracking

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | string | `"consent_default"` |
| `consent_state` | object | Full consent state object |
| `analytics_storage` | string | `"granted"` or `"denied"` |
| `ad_storage` | string | `"granted"` or `"denied"` |
| `ad_user_data` | string | `"granted"` or `"denied"` |
| `ad_personalization` | string | `"granted"` or `"denied"` |
| `personalization_storage` | string | `"granted"` or `"denied"` |
| `functionality_storage` | string | `"granted"` (always) |
| `security_storage` | string | `"granted"` (always) |
| `consent_source` | string | `"default"`, `"stored"`, or `"gpc"` |

**Example:**
```javascript
{
  event: 'consent_default',
  consent_state: {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  },
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  consent_source: 'default'
}
```

---

### consent_updated

Fired when user updates their consent preferences (accepts/declines/modifies).

**Source:** `shopify-privacy-consent-mode-api.liquid`

**Trigger:** User interaction with consent banner

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | string | `"consent_updated"` |
| `consent_state` | object | Updated consent state |
| `analytics_consent` | boolean | Whether analytics is granted |
| `marketing_consent` | boolean | Whether marketing is granted |
| `preferences_consent` | boolean | Whether preferences is granted |
| `sale_of_data_consent` | boolean | Whether sale of data is allowed (CCPA) |
| `consent_source` | string | `"shopify_api"` or `"user_action"` |

**Example:**
```javascript
{
  event: 'consent_updated',
  consent_state: {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted'
  },
  analytics_consent: true,
  marketing_consent: true,
  preferences_consent: true,
  sale_of_data_consent: true,
  consent_source: 'shopify_api'
}
```

---

### consent_gpc_detected

Fired when Global Privacy Control (GPC) or Do Not Track (DNT) signal is detected.

**Source:** `shopify-privacy-consent-mode-api.liquid`

**Trigger:** GPC/DNT signal present in browser

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | string | `"consent_gpc_detected"` |
| `gpc_signal` | boolean | `true` |
| `consent_state` | object | Auto-denied consent state |

---

## User Data Events

### user_data_ready

Fired after user data has been collected and prepared (including hashed identifiers).

**Source:** `gold-storefront-datalayer-ga4.liquid`, `gold-checkout-pixel-ga4.js`

**Trigger:** After page/checkout initialization

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | string | `"user_data_ready"` |
| `user_data` | object | Complete user data object |
| `user_logged_in` | boolean | Whether customer is logged in |
| `customer_type` | string | `"new"`, `"returning"`, or `"guest"` |

**user_data Object:**

| Field | Type | Description | Consent Required |
|-------|------|-------------|------------------|
| `email_sha256` | string | SHA256 hash of lowercase email | Marketing |
| `email_sha1` | string | SHA1 hash of lowercase email | Marketing |
| `phone_sha256` | string | SHA256 hash of E.164 phone | Marketing |
| `phone_sha1` | string | SHA1 hash of E.164 phone | Marketing |
| `user_id` | string | Shopify customer ID | Analytics |
| `logged_in` | boolean | Login state | None |
| `customer_type` | string | New/returning/guest | None |
| `orders_count` | number | Total orders placed | Analytics |
| `lifetime_value` | number | Total spend | Analytics |
| `last_order_date` | string | ISO date of last order | Analytics |
| `city` | string | Customer city | Marketing |
| `state` | string | Customer state/province | Marketing |
| `country` | string | Customer country code | Marketing |
| `zip` | string | Postal code (first 5 digits) | Marketing |
| `has_address` | boolean | Whether address exists | None |
| `tags` | array | Customer tags | Analytics |

**Example:**
```javascript
{
  event: 'user_data_ready',
  user_data: {
    email_sha256: 'a1b2c3d4...',
    phone_sha256: 'e5f6g7h8...',
    user_id: '12345678',
    logged_in: true,
    customer_type: 'returning',
    orders_count: 5,
    lifetime_value: 523.45,
    city: 'New York',
    state: 'NY',
    country: 'US',
    zip: '10001'
  },
  user_logged_in: true,
  customer_type: 'returning'
}
```

---

## Page Events

### page_data_ready

Fired after page context data has been collected.

**Source:** `gold-storefront-datalayer-ga4.liquid`, `gold-checkout-pixel-ga4.js`

**Trigger:** After page initialization

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | string | `"page_data_ready"` |
| `page_data` | object | Complete page context |

**page_data Object:**

| Field | Type | Description |
|-------|------|-------------|
| `page_location` | string | Full URL |
| `page_path` | string | URL path |
| `page_title` | string | Document title |
| `page_type` | string | Shopify template name |
| `page_referrer` | string | Previous page URL |
| `language` | string | ISO language code |
| `currency` | string | ISO currency code |
| `collection_handle` | string | Collection handle (if applicable) |
| `collection_id` | string | Collection ID (if applicable) |
| `product_handle` | string | Product handle (if applicable) |
| `search_term` | string | Search query (if applicable) |

---

### page_view

Standard GA4 page view event.

**Source:** `gold-storefront-datalayer-ga4.liquid`, `gold-checkout-pixel-ga4.js`

**Trigger:** Every page load

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | string | `"page_view"` |
| `page_location` | string | Full URL |
| `page_path` | string | URL path |
| `page_title` | string | Document title |
| `page_type` | string | Template type |
| `user_logged_in` | boolean | Login state |
| `customer_type` | string | Customer segment |

**GA4 Mapping:** Automatic via GA4 configuration tag

---

## Ecommerce Events

### view_item_list

Fired when a list of products is displayed (collection, search results).

**Source:** `gold-storefront-datalayer-ga4.liquid`

**Trigger:** Collection page, search results page load

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | string | `"view_item_list"` |
| `ecommerce` | object | Ecommerce data |
| `item_list_id` | string | Collection handle or `"search_results"` |
| `item_list_name` | string | Collection title or `"Search Results"` |

**ecommerce.items Array (per item):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `item_id` | string | Yes | Product variant ID |
| `item_name` | string | Yes | Product title |
| `item_brand` | string | No | Product vendor |
| `item_category` | string | No | Product type |
| `item_variant` | string | No | Variant title |
| `price` | number | Yes | Unit price |
| `currency` | string | Yes | ISO currency code |
| `index` | number | No | Position in list (1-based) |
| `item_list_id` | string | No | List identifier |
| `item_list_name` | string | No | List display name |
| `item_handle` | string | No | Product handle (custom) |
| `google_product_id` | string | No | Merchant Center ID |

**Example:**
```javascript
{
  event: 'view_item_list',
  ecommerce: {
    item_list_id: 'summer-collection',
    item_list_name: 'Summer Collection',
    items: [
      {
        item_id: '12345',
        item_name: 'Classic T-Shirt',
        item_brand: 'Brand Name',
        item_category: 'Apparel',
        price: 29.99,
        currency: 'USD',
        index: 1,
        item_handle: 'classic-t-shirt'
      }
      // ... up to 50 items
    ]
  }
}
```

**Note:** Limited to first 50 products for performance.

---

### view_item

Fired when a product detail page is viewed.

**Source:** `gold-storefront-datalayer-ga4.liquid`

**Trigger:** Product page load

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | string | `"view_item"` |
| `ecommerce` | object | Ecommerce data with single item |
| `value` | number | Product price |
| `currency` | string | ISO currency code |

**Example:**
```javascript
{
  event: 'view_item',
  ecommerce: {
    currency: 'USD',
    value: 49.99,
    items: [{
      item_id: '12345',
      item_name: 'Premium Hoodie',
      item_brand: 'Brand Name',
      item_category: 'Apparel',
      item_variant: 'Blue / Large',
      price: 49.99,
      currency: 'USD',
      quantity: 1,
      item_handle: 'premium-hoodie',
      google_product_id: 'shopify_US_12345_67890'
    }]
  },
  value: 49.99,
  currency: 'USD'
}
```

---

### select_item

Fired when a product is clicked from a list.

**Source:** `gold-storefront-datalayer-ga4.liquid`

**Trigger:** Product click in collection/search

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | string | `"select_item"` |
| `ecommerce` | object | Ecommerce data |
| `item_list_id` | string | Source list identifier |
| `item_list_name` | string | Source list name |

**Note:** List attribution is saved to sessionStorage for checkout attribution.

---

### add_to_cart

Fired when a product is added to the cart.

**Source:** `gold-storefront-datalayer-ga4.liquid`

**Trigger:** Add to cart button click (product page, collection, quick view)

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | string | `"add_to_cart"` |
| `ecommerce` | object | Ecommerce data |
| `value` | number | Total value added |
| `currency` | string | ISO currency code |
| `add_to_cart_context` | string | `"product_page"`, `"collection"`, `"quick_view"` |

**Example:**
```javascript
{
  event: 'add_to_cart',
  ecommerce: {
    currency: 'USD',
    value: 49.99,
    items: [{
      item_id: '12345',
      item_name: 'Premium Hoodie',
      item_brand: 'Brand Name',
      item_category: 'Apparel',
      item_variant: 'Blue / Large',
      price: 49.99,
      currency: 'USD',
      quantity: 1,
      item_list_id: 'summer-collection',
      item_list_name: 'Summer Collection'
    }]
  },
  value: 49.99,
  currency: 'USD',
  add_to_cart_context: 'product_page'
}
```

---

### remove_from_cart

Fired when a product is removed from the cart.

**Source:** `gold-storefront-datalayer-ga4.liquid`

**Trigger:** Remove button click in cart

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | string | `"remove_from_cart"` |
| `ecommerce` | object | Ecommerce data |
| `value` | number | Value removed |
| `currency` | string | ISO currency code |

---

### view_cart

Fired when the cart is viewed.

**Source:** `gold-storefront-datalayer-ga4.liquid`

**Trigger:** Cart page load or cart drawer open

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | string | `"view_cart"` |
| `ecommerce` | object | Full cart contents |
| `value` | number | Cart total |
| `currency` | string | ISO currency code |
| `cart_context` | string | `"cart_page"` or `"cart_drawer"` |

---

### begin_checkout

Fired when checkout is initiated.

**Source:** `gold-checkout-pixel-ga4.js`

**Trigger:** `checkout_started` Shopify event

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | string | `"begin_checkout"` |
| `ecommerce` | object | Cart items entering checkout |
| `value` | number | Checkout subtotal |
| `currency` | string | ISO currency code |
| `coupon` | string | Applied discount code (if any) |

**Example:**
```javascript
{
  event: 'begin_checkout',
  ecommerce: {
    currency: 'USD',
    value: 149.97,
    coupon: 'SUMMER20',
    items: [
      {
        item_id: '12345',
        item_name: 'Premium Hoodie',
        price: 49.99,
        quantity: 3,
        item_list_id: 'summer-collection',
        item_list_name: 'Summer Collection'
      }
    ]
  },
  value: 149.97,
  currency: 'USD',
  coupon: 'SUMMER20'
}
```

---

### add_contact_info

Custom event for contact information submission.

**Source:** `gold-checkout-pixel-ga4.js`

**Trigger:** `checkout_contact_info_submitted` Shopify event

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | string | `"add_contact_info"` |
| `user_data` | object | Hashed email/phone |
| `email_provided` | boolean | Whether email was provided |
| `phone_provided` | boolean | Whether phone was provided |

---

### add_shipping_info

Fired when shipping information is submitted.

**Source:** `gold-checkout-pixel-ga4.js`

**Trigger:** `checkout_address_info_submitted`, `checkout_shipping_info_submitted` Shopify events

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | string | `"add_shipping_info"` |
| `ecommerce` | object | Checkout items |
| `shipping_tier` | string | Selected shipping method or `"not_selected"` |
| `value` | number | Checkout value |
| `currency` | string | ISO currency code |

**Example:**
```javascript
{
  event: 'add_shipping_info',
  ecommerce: {
    currency: 'USD',
    value: 149.97,
    shipping_tier: 'Standard Shipping (5-7 days)',
    items: [/* ... */]
  },
  shipping_tier: 'Standard Shipping (5-7 days)',
  value: 149.97,
  currency: 'USD'
}
```

---

### add_payment_info

Fired when payment information is submitted.

**Source:** `gold-checkout-pixel-ga4.js`

**Trigger:** `payment_info_submitted` Shopify event

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | string | `"add_payment_info"` |
| `ecommerce` | object | Checkout items |
| `payment_type` | string | Payment method type |
| `value` | number | Checkout value |
| `currency` | string | ISO currency code |

**Payment Types:**
- `credit_card`
- `paypal`
- `shop_pay`
- `apple_pay`
- `google_pay`
- `afterpay`
- `klarna`
- `other`

---

### purchase

Fired when a purchase is completed.

**Source:** `gold-checkout-pixel-ga4.js`

**Trigger:** `checkout_completed` Shopify event

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | string | `"purchase"` |
| `ecommerce` | object | Complete order data |
| `transaction_id` | string | Shopify order ID |
| `value` | number | Order total |
| `tax` | number | Tax amount |
| `shipping` | number | Shipping cost |
| `currency` | string | ISO currency code |
| `coupon` | string | Applied discount code |
| `user_data` | object | Customer data for Enhanced Conversions |

**Full ecommerce Object:**

```javascript
{
  event: 'purchase',
  ecommerce: {
    transaction_id: '5678901234',
    value: 167.96,
    tax: 12.99,
    shipping: 5.00,
    currency: 'USD',
    coupon: 'SUMMER20',
    items: [
      {
        item_id: '12345',
        item_name: 'Premium Hoodie',
        item_brand: 'Brand Name',
        item_category: 'Apparel',
        item_variant: 'Blue / Large',
        price: 49.99,
        quantity: 3,
        coupon: 'SUMMER20',
        discount: 30.00,
        item_list_id: 'summer-collection',
        item_list_name: 'Summer Collection',
        item_handle: 'premium-hoodie',
        google_product_id: 'shopify_US_12345_67890'
      }
    ]
  },
  transaction_id: '5678901234',
  value: 167.96,
  tax: 12.99,
  shipping: 5.00,
  currency: 'USD',
  coupon: 'SUMMER20',
  user_data: {
    email_sha256: 'a1b2c3d4...',
    phone_sha256: 'e5f6g7h8...',
    address: {
      first_name: 'John',
      last_name: 'Doe',
      street: '123 Main St',
      city: 'New York',
      region: 'NY',
      postal_code: '10001',
      country: 'US'
    }
  },
  customer_type: 'new',
  payment_type: 'credit_card',
  order_name: '#1234',
  orders_count: 1,
  lifetime_value: 167.96
}
```

---

## Search Events

### search

Fired when a search is performed.

**Source:** `gold-storefront-datalayer-ga4.liquid`

**Trigger:** Search results page load

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | string | `"search"` |
| `search_term` | string | Search query |
| `search_results_count` | number | Number of results |

---

## Consent-Affected Behavior

### How Consent Impacts Events

| Event | Analytics Consent | Marketing Consent | Behavior |
|-------|-------------------|-------------------|----------|
| `page_view` | Required | - | Blocked if denied |
| `view_item` | Required | - | Blocked if denied |
| `add_to_cart` | Required | - | Blocked if denied |
| `purchase` | Required | - | Blocked if denied |
| `user_data` (hashed PII) | - | Required | Excluded from payload |
| Enhanced Conversions | - | Required | Not sent to Google Ads |
| Google Ads Remarketing | - | Required | Tag doesn't fire |
| Meta Pixel | - | Required | Tag doesn't fire |

### Consent Denied State

When consent is denied, events are either:
1. **Not fired** (Google Ads, Meta Pixel)
2. **Fired without identifiers** (GA4 with cookieless pings)
3. **Fired with limited data** (no user_data object)

GA4 with consent mode enabled will still collect aggregate/modeled data even when consent is denied, but no cookies are set and no user identifiers are collected.

---

## GA4 Mapping Reference

### Standard Events

| Package Event | GA4 Event | GA4 Parameters |
|---------------|-----------|----------------|
| `page_view` | `page_view` | Automatic |
| `view_item_list` | `view_item_list` | `item_list_id`, `item_list_name`, `items` |
| `view_item` | `view_item` | `currency`, `value`, `items` |
| `select_item` | `select_item` | `item_list_id`, `item_list_name`, `items` |
| `add_to_cart` | `add_to_cart` | `currency`, `value`, `items` |
| `remove_from_cart` | `remove_from_cart` | `currency`, `value`, `items` |
| `view_cart` | `view_cart` | `currency`, `value`, `items` |
| `begin_checkout` | `begin_checkout` | `currency`, `value`, `coupon`, `items` |
| `add_shipping_info` | `add_shipping_info` | `currency`, `value`, `shipping_tier`, `items` |
| `add_payment_info` | `add_payment_info` | `currency`, `value`, `payment_type`, `items` |
| `purchase` | `purchase` | `transaction_id`, `value`, `tax`, `shipping`, `currency`, `coupon`, `items` |
| `search` | `search` | `search_term` |

### Custom Events

| Package Event | Recommended GA4 Handling |
|---------------|--------------------------|
| `user_data_ready` | Trigger for user property updates |
| `page_data_ready` | Trigger for page-scoped variables |
| `add_contact_info` | Custom event or ignore |
| `consent_default` | Consent Mode initialization |
| `consent_updated` | Consent Mode update |

### User Properties to Set

| Property | Source | Type |
|----------|--------|------|
| `user_id` | `user_data.user_id` | User-scoped |
| `customer_type` | `user_data.customer_type` | User-scoped |
| `logged_in` | `user_data.logged_in` | Session-scoped |
| `lifetime_value` | `user_data.lifetime_value` | User-scoped |
| `orders_count` | `user_data.orders_count` | User-scoped |

---

## Debugging Events

### Console Logging

When `debug: true` is set, all events are logged to console:

```javascript
// Enable debug mode
// In browser console:
window.consentDebug = true;  // Consent events
// Events will log with [JY Gold] prefix
```

### DataLayer Inspection

```javascript
// View all dataLayer events
console.table(window.dataLayer);

// Filter for specific events
window.dataLayer.filter(e => e.event === 'purchase');
```

### GTM Preview Mode

1. Open GTM Preview
2. Connect to your store
3. Navigate to trigger events
4. Inspect "Data Layer" tab for each event

---

## Related Documents

- [Solution Design Reference](./SOLUTION-DESIGN-REFERENCE.md) - Architecture overview
- [Consent Mode Reference](./CONSENT-MODE-REFERENCE.md) - Consent implementation
- [GTM Import Guide](./GTM-IMPORT-GUIDE.md) - Tag configuration
- [Troubleshooting Guide](./TROUBLESHOOTING-GUIDE.md) - Debugging help
