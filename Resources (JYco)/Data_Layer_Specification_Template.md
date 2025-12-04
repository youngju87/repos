# Data Layer Specification Document
**Instructions: Copy this content into Word and format as indicated**

---

## COVER PAGE
**[Format as centered text on first page]**

```
[INSERT JY/CO LOGO]

JY/co
Digital Analytics Consulting


DATA LAYER SPECIFICATION
Technical Implementation Guide

Client: [CLIENT NAME]
Project: [PROJECT NAME]
Version: 1.0
Date: [DATE]


Prepared by:
JY/co LLC
[YOUR EMAIL]
[YOUR WEBSITE]
```

---

## DOCUMENT CONTROL

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | [DATE] | [YOUR NAME] | Initial specification |
| | | | |
| | | | |

---

## TABLE OF CONTENTS

**[Insert automatic TOC in Word]**

1. Overview & Purpose
2. Data Layer Fundamentals
3. Implementation Requirements
4. Global Data Layer Object
5. Page-Level Variables
6. User Variables
7. Event Specifications
8. Ecommerce Data Layer
9. Testing & Validation
10. Appendix: Code Examples

---

## 1. OVERVIEW & PURPOSE

### Document Purpose
This document provides technical specifications for implementing the data layer on [CLIENT NAME]'s website. The data layer serves as a structured data format that passes information from your website to Google Tag Manager and Google Analytics 4.

### Audience
This document is intended for:
- Web developers implementing the data layer
- Tag management administrators
- QA/testing team members
- Analytics implementation consultants

### Scope
This specification covers:
- Data layer structure and syntax
- Page-level data requirements
- Event-based tracking specifications
- Ecommerce data layer implementation
- User data handling

### Key Benefits
A properly implemented data layer provides:
- **Clean Separation:** Business logic separated from tracking logic
- **Flexibility:** Easy to modify tracking without code changes
- **Reliability:** Reduced dependence on DOM scraping
- **Scalability:** Consistent structure across the entire site

---

## 2. DATA LAYER FUNDAMENTALS

### What is a Data Layer?
The data layer is a JavaScript object that contains all the information you want to pass to your tag management system. It follows this basic structure:

```javascript
window.dataLayer = window.dataLayer || [];
dataLayer.push({
  'event': 'event_name',
  'property': 'value'
});
```

### Key Concepts

**1. Array Structure**
- The data layer is an array of objects
- Use `.push()` method to add data
- Never overwrite the entire dataLayer array

**2. Event-Driven Model**
- Use the `event` key to trigger tags in GTM
- Events can carry additional data properties
- Multiple events can fire on a single page

**3. Persistence**
- Data pushed to the data layer persists across events
- Clear sensitive data explicitly when needed
- Use `undefined` to clear values

**4. Timing**
- Initialize data layer BEFORE GTM container snippet
- Push page-level data on page load
- Push event data when user interactions occur

---

## 3. IMPLEMENTATION REQUIREMENTS

### Technical Requirements

**Location:**
- Implement in `<head>` section of HTML
- Place BEFORE Google Tag Manager container snippet
- Required on ALL pages of the website

**Syntax:**
- Use valid JavaScript/JSON syntax
- All property names in quotes
- Use single quotes for strings containing HTML
- Properly escape special characters

**Naming Conventions:**
- Use snake_case for all property names (e.g., `page_type`, `user_id`)
- Event names must match GA4 event naming requirements
- Avoid reserved names (e.g., `event`, `gtm`, `google`)

**Data Types:**
- Strings: Enclosed in quotes
- Numbers: No quotes, numeric values only
- Booleans: `true` or `false` (no quotes)
- Arrays: Use bracket notation `[]`
- Objects: Use brace notation `{}`

### Browser Compatibility
- Must work in all major browsers:
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+
  - Mobile browsers (iOS Safari, Chrome Mobile)

---

## 4. GLOBAL DATA LAYER OBJECT

### Base Implementation

The following code should be implemented in the `<head>` section of every page, **before** the GTM container snippet:

```html
<!-- Data Layer -->
<script>
window.dataLayer = window.dataLayer || [];
dataLayer.push({
  // Page Information
  'page_type': '', // Required: See page types below
  'page_category': '', // Optional: Page category/section
  'page_name': '', // Optional: Friendly page name

  // User Information
  'user_id': '', // User ID if logged in, empty string if not
  'user_login_state': '', // 'logged_in' or 'logged_out'
  'user_type': '', // 'customer', 'subscriber', 'guest', etc.

  // Site Information
  'site_language': 'en', // ISO language code
  'site_country': 'US', // ISO country code
  'site_currency': 'USD' // ISO currency code
});
</script>

<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXX');</script>
<!-- End Google Tag Manager -->
```

**Important Notes:**
1. Initialize `dataLayer` array before pushing data
2. This must appear BEFORE the GTM snippet
3. Replace `GTM-XXXXXX` with your actual GTM container ID
4. Empty strings are acceptable for unpopulated fields
5. Do NOT include null or undefined values - use empty strings instead

---

## 5. PAGE-LEVEL VARIABLES

### Page Types

Use the following standardized `page_type` values:

| Page Type | Description | Example URLs |
|-----------|-------------|--------------|
| `home` | Homepage | `/`, `/index.html` |
| `product` | Product detail page | `/products/blue-shirt` |
| `category` | Category/collection listing | `/collections/mens-clothing` |
| `cart` | Shopping cart | `/cart` |
| `checkout` | Checkout process | `/checkout`, `/checkout/shipping` |
| `confirmation` | Order confirmation/thank you | `/thank-you`, `/orders/12345` |
| `account` | Account/profile pages | `/account`, `/account/orders` |
| `search` | Search results | `/search?q=shirt` |
| `content` | Blog posts, articles, content | `/blog/article-title` |
| `info` | Informational pages | `/about`, `/contact`, `/faq` |
| `error` | Error pages | `/404`, `/500` |
| `other` | Any other page type | |

---

### Page-Specific Data Layer Examples

#### Homepage
```javascript
dataLayer.push({
  'page_type': 'home',
  'page_category': 'homepage',
  'page_name': 'Home'
});
```

#### Product Detail Page
```javascript
dataLayer.push({
  'page_type': 'product',
  'page_category': 'products',
  'page_name': 'Blue Cotton T-Shirt',
  'product_id': 'SKU_12345',
  'product_name': 'Blue Cotton T-Shirt',
  'product_brand': 'Acme',
  'product_category': 'Apparel > Men > T-Shirts',
  'product_price': 29.99,
  'product_currency': 'USD',
  'product_availability': 'in_stock' // 'in_stock', 'out_of_stock', 'preorder'
});
```

#### Category/Collection Page
```javascript
dataLayer.push({
  'page_type': 'category',
  'page_category': 'collections',
  'page_name': 'Men\'s T-Shirts',
  'category_id': 'mens-tshirts',
  'category_name': 'Men\'s T-Shirts',
  'product_count': 24 // Number of products in category
});
```

#### Shopping Cart Page
```javascript
dataLayer.push({
  'page_type': 'cart',
  'page_category': 'ecommerce',
  'page_name': 'Shopping Cart',
  'cart_total': 59.98,
  'cart_quantity': 2 // Total number of items
});
```

#### Checkout Pages
```javascript
dataLayer.push({
  'page_type': 'checkout',
  'page_category': 'ecommerce',
  'page_name': 'Checkout - Shipping',
  'checkout_step': 1, // 1=shipping, 2=payment, 3=review
  'checkout_option': 'shipping_info' // Current step identifier
});
```

#### Order Confirmation Page
```javascript
dataLayer.push({
  'page_type': 'confirmation',
  'page_category': 'ecommerce',
  'page_name': 'Order Confirmation'
  // Transaction data pushed separately via purchase event
});
```

#### Search Results Page
```javascript
dataLayer.push({
  'page_type': 'search',
  'page_category': 'search',
  'page_name': 'Search Results',
  'search_term': 'blue shirt',
  'search_results': 42 // Number of results returned
});
```

#### Blog/Content Pages
```javascript
dataLayer.push({
  'page_type': 'content',
  'page_category': 'blog',
  'page_name': 'How to Style a T-Shirt',
  'content_type': 'blog_post',
  'content_category': 'Style Tips',
  'content_author': 'Jane Doe',
  'publish_date': '2024-03-15'
});
```

#### Account Pages
```javascript
dataLayer.push({
  'page_type': 'account',
  'page_category': 'account',
  'page_name': 'My Account - Orders',
  'account_section': 'orders' // 'profile', 'orders', 'addresses', etc.
});
```

---

## 6. USER VARIABLES

### User Identification

**When User is Logged In:**
```javascript
dataLayer.push({
  'user_id': 'USER_abc123', // Unique, hashed user identifier
  'user_login_state': 'logged_in',
  'user_type': 'customer', // 'customer', 'subscriber', 'vip', etc.
  'user_email_hash': 'a1b2c3...', // SHA-256 hash of email (optional)
  'customer_lifetime_value': 450.00, // Total historical spend (optional)
  'customer_order_count': 5, // Total number of orders (optional)
  'customer_first_order_date': '2023-06-15' // Date of first order (optional)
});
```

**When User is Not Logged In:**
```javascript
dataLayer.push({
  'user_id': '',
  'user_login_state': 'logged_out',
  'user_type': 'guest'
});
```

### Privacy & Security Considerations

**DO:**
- Use hashed or pseudonymized user IDs
- Hash email addresses using SHA-256 before including in data layer
- Only include data necessary for analytics and marketing
- Clear sensitive data from data layer after use

**DO NOT:**
- Include plain-text email addresses
- Include phone numbers
- Include full names
- Include passwords or payment information
- Include social security numbers or government IDs
- Include precise geolocation data

**Example: Hashing User Email (if needed)**
```javascript
// SHA-256 hash function (include appropriate library)
const emailHash = sha256('user@example.com');
dataLayer.push({
  'user_email_hash': emailHash
});
```

---

## 7. EVENT SPECIFICATIONS

### Event Structure

All events follow this structure:

```javascript
dataLayer.push({
  'event': 'event_name', // Required: Triggers tag in GTM
  'parameter_1': 'value',
  'parameter_2': 'value'
  // Additional parameters as needed
});
```

### Standard Event Specifications

#### 7.1 Page View
**Trigger:** On every page load (automatic with GTM, but can be pushed explicitly)

```javascript
// Usually automatic, but explicit push if needed:
dataLayer.push({
  'event': 'page_view'
  // Page variables already in data layer from base implementation
});
```

---

#### 7.2 User Login
**Trigger:** When user successfully logs in

```javascript
dataLayer.push({
  'event': 'login',
  'method': 'email', // 'email', 'google', 'facebook', etc.
  'user_id': 'USER_abc123',
  'user_type': 'customer'
});
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| method | String | Yes | Authentication method used |
| user_id | String | Yes | Unique user identifier |
| user_type | String | No | User classification |

---

#### 7.3 User Sign Up
**Trigger:** When user creates new account

```javascript
dataLayer.push({
  'event': 'sign_up',
  'method': 'email', // 'email', 'google', 'facebook', etc.
  'user_id': 'USER_abc123'
});
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| method | String | Yes | Signup method used |
| user_id | String | Yes | Newly created user identifier |

---

#### 7.4 Search
**Trigger:** When user performs a site search

```javascript
dataLayer.push({
  'event': 'search',
  'search_term': 'blue shirt',
  'search_results': 42 // Number of results returned
});
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search_term | String | Yes | User's search query |
| search_results | Number | No | Number of results found |

---

#### 7.5 Form Submission
**Trigger:** When user submits a form

```javascript
// Form start (user begins interacting)
dataLayer.push({
  'event': 'form_start',
  'form_id': 'contact_form',
  'form_name': 'Contact Us',
  'form_destination': '/thank-you'
});

// Form submit (form is submitted)
dataLayer.push({
  'event': 'form_submit',
  'form_id': 'contact_form',
  'form_name': 'Contact Us',
  'form_destination': '/thank-you'
});
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| form_id | String | Yes | HTML ID or unique identifier of form |
| form_name | String | Yes | Friendly name of form |
| form_destination | String | No | URL form submits to or next step |

---

#### 7.6 CTA Click
**Trigger:** When user clicks a call-to-action button or link

```javascript
dataLayer.push({
  'event': 'cta_click',
  'cta_text': 'Get Started',
  'cta_location': 'hero_section',
  'cta_destination': '/signup'
});
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| cta_text | String | Yes | Text/label on the CTA |
| cta_location | String | Yes | Where on page (hero, footer, sidebar, etc.) |
| cta_destination | String | Yes | URL or destination of CTA |

---

#### 7.7 Video Interaction
**Trigger:** When user interacts with video content

```javascript
// Video start
dataLayer.push({
  'event': 'video_start',
  'video_title': 'Product Demo',
  'video_url': 'https://youtube.com/watch?v=xyz',
  'video_provider': 'youtube', // 'youtube', 'vimeo', 'native', etc.
  'video_duration': 120 // Length in seconds
});

// Video progress (at 25%, 50%, 75%)
dataLayer.push({
  'event': 'video_progress',
  'video_title': 'Product Demo',
  'video_url': 'https://youtube.com/watch?v=xyz',
  'video_percent': 25 // 25, 50, or 75
});

// Video complete
dataLayer.push({
  'event': 'video_complete',
  'video_title': 'Product Demo',
  'video_url': 'https://youtube.com/watch?v=xyz'
});
```

---

#### 7.8 File Download
**Trigger:** When user clicks to download a file

```javascript
dataLayer.push({
  'event': 'file_download',
  'file_name': 'product-catalog.pdf',
  'file_extension': 'pdf',
  'link_url': '/downloads/product-catalog.pdf'
});
```

---

#### 7.9 Newsletter Signup
**Trigger:** When user subscribes to newsletter/email list

```javascript
dataLayer.push({
  'event': 'newsletter_signup',
  'signup_location': 'footer',
  'list_name': 'Monthly Newsletter'
});
```

---

## 8. ECOMMERCE DATA LAYER

### Item Object Structure

All ecommerce events use a standard `items` array containing item objects:

```javascript
{
  item_id: 'SKU_12345', // Required: Product SKU
  item_name: 'Blue Cotton T-Shirt', // Required: Product name
  affiliation: 'Online Store', // Optional: Store name
  coupon: 'SUMMER2024', // Optional: Item-level coupon
  discount: 5.00, // Optional: Discount amount
  index: 0, // Optional: Position in list (0-indexed)
  item_brand: 'Acme', // Optional but recommended: Brand
  item_category: 'Apparel', // Optional: Primary category
  item_category2: 'Men', // Optional: Secondary category
  item_category3: 'T-Shirts', // Optional: Tertiary category
  item_category4: 'Short Sleeve', // Optional: 4th-level category
  item_category5: 'Cotton', // Optional: 5th-level category
  item_list_id: 'related_products', // Optional: List ID
  item_list_name: 'Related Products', // Optional: List name
  item_variant: 'Blue / Large', // Optional: Color, size, etc.
  location_id: 'L_12345', // Optional: Physical location
  price: 29.99, // Optional but recommended: Unit price
  quantity: 1 // Optional: Quantity (default 1)
}
```

---

### 8.1 View Item List
**Trigger:** User views a product list (category page, search results, etc.)

```javascript
dataLayer.push({
  'event': 'view_item_list',
  'item_list_id': 'mens_tshirts',
  'item_list_name': 'Men\'s T-Shirts',
  'items': [
    {
      item_id: 'SKU_12345',
      item_name: 'Blue Cotton T-Shirt',
      item_brand: 'Acme',
      item_category: 'Apparel',
      item_category2: 'Men',
      item_category3: 'T-Shirts',
      item_variant: 'Blue / Large',
      price: 29.99,
      index: 0
    },
    {
      item_id: 'SKU_12346',
      item_name: 'Red Cotton T-Shirt',
      item_brand: 'Acme',
      item_category: 'Apparel',
      item_category2: 'Men',
      item_category3: 'T-Shirts',
      item_variant: 'Red / Medium',
      price: 29.99,
      index: 1
    }
    // Include all visible products (up to 200 items)
  ]
});
```

**Notes:**
- Fire once per page load
- Include all visible products
- Use `index` to track position (0-indexed)
- Maximum 200 items per event

---

### 8.2 Select Item
**Trigger:** User clicks on a product in a list

```javascript
dataLayer.push({
  'event': 'select_item',
  'item_list_id': 'mens_tshirts',
  'item_list_name': 'Men\'s T-Shirts',
  'items': [{
    item_id: 'SKU_12345',
    item_name: 'Blue Cotton T-Shirt',
    item_brand: 'Acme',
    item_category: 'Apparel',
    item_category2: 'Men',
    item_category3: 'T-Shirts',
    item_variant: 'Blue / Large',
    price: 29.99,
    index: 0
  }]
});
```

**Notes:**
- Fire on click before navigation
- Only one item in items array
- Match item_list_name with view_item_list event

---

### 8.3 View Item
**Trigger:** User views product detail page

```javascript
dataLayer.push({
  'event': 'view_item',
  'currency': 'USD',
  'value': 29.99,
  'items': [{
    item_id: 'SKU_12345',
    item_name: 'Blue Cotton T-Shirt',
    item_brand: 'Acme',
    item_category: 'Apparel',
    item_category2: 'Men',
    item_category3: 'T-Shirts',
    item_variant: 'Blue / Large',
    price: 29.99,
    quantity: 1
  }]
});
```

**Notes:**
- Fire on product page load
- `value` should equal item price
- Only one item in items array

---

### 8.4 Add to Cart
**Trigger:** User adds product to shopping cart

```javascript
dataLayer.push({
  'event': 'add_to_cart',
  'currency': 'USD',
  'value': 29.99,
  'items': [{
    item_id: 'SKU_12345',
    item_name: 'Blue Cotton T-Shirt',
    item_brand: 'Acme',
    item_category: 'Apparel',
    item_category2: 'Men',
    item_category3: 'T-Shirts',
    item_variant: 'Blue / Large',
    price: 29.99,
    quantity: 1
  }]
});
```

**Notes:**
- Fire immediately after successful add to cart
- `value` = price × quantity
- Can include multiple items if added together
- Mark as "Key Event" in GA4

---

### 8.5 Remove from Cart
**Trigger:** User removes product from cart

```javascript
dataLayer.push({
  'event': 'remove_from_cart',
  'currency': 'USD',
  'value': 29.99,
  'items': [{
    item_id: 'SKU_12345',
    item_name: 'Blue Cotton T-Shirt',
    item_brand: 'Acme',
    item_category: 'Apparel',
    price: 29.99,
    quantity: 1
  }]
});
```

---

### 8.6 View Cart
**Trigger:** User views shopping cart page or cart drawer

```javascript
dataLayer.push({
  'event': 'view_cart',
  'currency': 'USD',
  'value': 59.98,
  'items': [
    {
      item_id: 'SKU_12345',
      item_name: 'Blue Cotton T-Shirt',
      item_brand: 'Acme',
      item_category: 'Apparel',
      price: 29.99,
      quantity: 1
    },
    {
      item_id: 'SKU_67890',
      item_name: 'Black Jeans',
      item_brand: 'Acme',
      item_category: 'Apparel',
      price: 59.99,
      quantity: 1
    }
  ]
});
```

**Notes:**
- Fire when cart page loads or drawer opens
- Include ALL items in cart
- `value` = sum of all items

---

### 8.7 Begin Checkout
**Trigger:** User initiates checkout process

```javascript
dataLayer.push({
  'event': 'begin_checkout',
  'currency': 'USD',
  'value': 59.98,
  'coupon': 'SUMMER2024', // If coupon applied
  'items': [
    {
      item_id: 'SKU_12345',
      item_name: 'Blue Cotton T-Shirt',
      item_brand: 'Acme',
      item_category: 'Apparel',
      price: 29.99,
      quantity: 1
    },
    {
      item_id: 'SKU_67890',
      item_name: 'Black Jeans',
      item_brand: 'Acme',
      item_category: 'Apparel',
      price: 59.99,
      quantity: 1
    }
  ]
});
```

**Notes:**
- Fire when user clicks "Checkout" or checkout page loads
- Include coupon if applied at cart level
- Mark as "Key Event" in GA4

---

### 8.8 Add Shipping Info
**Trigger:** User completes shipping information step

```javascript
dataLayer.push({
  'event': 'add_shipping_info',
  'currency': 'USD',
  'value': 59.98,
  'coupon': 'SUMMER2024',
  'shipping_tier': 'Ground',
  'items': [
    // Same items array as begin_checkout
  ]
});
```

**Notes:**
- Only for multi-step checkouts
- Fire when user completes/submits shipping step

---

### 8.9 Add Payment Info
**Trigger:** User completes payment information step

```javascript
dataLayer.push({
  'event': 'add_payment_info',
  'currency': 'USD',
  'value': 59.98,
  'coupon': 'SUMMER2024',
  'payment_type': 'Credit Card',
  'items': [
    // Same items array as begin_checkout
  ]
});
```

**Notes:**
- Only for multi-step checkouts
- Fire when user completes/submits payment step
- `payment_type` examples: 'Credit Card', 'PayPal', 'Apple Pay'

---

### 8.10 Purchase
**Trigger:** Order confirmation page load

```javascript
dataLayer.push({
  'event': 'purchase',
  'transaction_id': 'T_12345', // Required: Must be unique
  'value': 65.97, // Required: Total revenue including tax and shipping
  'currency': 'USD',
  'tax': 4.50,
  'shipping': 5.99,
  'coupon': 'SUMMER2024',
  'items': [
    {
      item_id: 'SKU_12345',
      item_name: 'Blue Cotton T-Shirt',
      item_brand: 'Acme',
      item_category: 'Apparel',
      item_variant: 'Blue / Large',
      price: 29.99,
      quantity: 1
    },
    {
      item_id: 'SKU_67890',
      item_name: 'Black Jeans',
      item_brand: 'Acme',
      item_category: 'Apparel',
      price: 59.99,
      quantity: 1
    }
  ]
});
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| transaction_id | String | **Yes** | Unique order ID (prevent duplicates) |
| value | Number | **Yes** | Total revenue (subtotal + tax + shipping - discounts) |
| currency | String | **Yes** | ISO currency code |
| tax | Number | No | Tax amount |
| shipping | Number | No | Shipping cost |
| coupon | String | No | Order-level coupon code |
| items | Array | **Yes** | Array of purchased items |

**Critical Notes:**
- `transaction_id` must be UNIQUE to prevent duplicate reporting
- Implement deduplication logic to prevent multiple fires on page refresh
- `value` includes tax and shipping
- Fire only on initial thank-you page load, never on refresh
- Mark as "Key Event" in GA4

**Deduplication Example:**
```javascript
// Only fire if transaction hasn't been recorded
if (!sessionStorage.getItem('transaction_' + transaction_id)) {
  dataLayer.push({
    'event': 'purchase',
    'transaction_id': transaction_id,
    // ... rest of data
  });
  sessionStorage.setItem('transaction_' + transaction_id, 'true');
}
```

---

### 8.11 Refund
**Trigger:** When refund is processed (typically server-side)

```javascript
// Full refund
dataLayer.push({
  'event': 'refund',
  'transaction_id': 'T_12345',
  'currency': 'USD',
  'value': 65.97
});

// Partial refund (specific items)
dataLayer.push({
  'event': 'refund',
  'transaction_id': 'T_12345',
  'currency': 'USD',
  'value': 29.99,
  'items': [{
    item_id: 'SKU_12345',
    quantity: 1
  }]
});
```

**Notes:**
- Usually implemented server-side or via Measurement Protocol
- For full refund: omit items array
- For partial refund: include items being refunded
- Must match original transaction_id

---

## 9. TESTING & VALIDATION

### Testing Checklist

#### 1. Pre-Launch Testing

**Tools Required:**
- Browser DevTools (Console & Network tabs)
- Google Tag Assistant (Chrome extension)
- GA4 DebugView
- Google Tag Manager Preview Mode

**Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Type `dataLayer` and press Enter
4. Verify data layer exists and contains expected data
5. Navigate through site and verify events fire correctly

---

#### 2. Validation Methods

**Method 1: Console Inspection**
```javascript
// In browser console, check current data layer state:
console.table(dataLayer);

// Filter for specific events:
dataLayer.filter(obj => obj.event === 'purchase');
```

**Method 2: GA4 DebugView**
1. Install Google Analytics Debugger Chrome extension
2. Navigate to GA4 property > Admin > DebugView
3. Browse your website
4. Verify events appear in real-time
5. Check that all parameters are captured correctly

**Method 3: GTM Preview Mode**
1. In GTM, click "Preview"
2. Enter your website URL
3. Navigate through key user flows
4. Verify tags fire on correct triggers
5. Check data layer values in Variables tab

---

#### 3. Test Scenarios

**Essential Test Cases:**
- [ ] Homepage loads with correct page_type
- [ ] Product page view captures product data
- [ ] Add to cart event fires with correct item data
- [ ] Checkout process captures all steps
- [ ] Purchase event fires on order confirmation (only once)
- [ ] User login/signup events fire correctly
- [ ] Form submissions tracked properly
- [ ] Search events capture search terms
- [ ] Video interactions tracked (if applicable)
- [ ] File downloads tracked (if applicable)

**Ecommerce Flow Test:**
1. View category page → Verify `view_item_list`
2. Click product → Verify `select_item`
3. View product page → Verify `view_item`
4. Add to cart → Verify `add_to_cart`
5. View cart → Verify `view_cart`
6. Begin checkout → Verify `begin_checkout`
7. Add shipping → Verify `add_shipping_info` (if multi-step)
8. Add payment → Verify `add_payment_info` (if multi-step)
9. Complete purchase → Verify `purchase` with unique transaction_id
10. Refresh thank you page → Verify purchase does NOT fire again

---

#### 4. Common Issues & Fixes

| Issue | Cause | Solution |
|-------|-------|----------|
| Data layer undefined | Script loads after GTM | Move data layer before GTM snippet |
| Events not firing | Incorrect event name | Check spelling, use snake_case |
| Missing parameters | Parameters not included | Verify all required parameters present |
| Duplicate purchases | No deduplication | Implement transaction_id check |
| Wrong data types | Quotes on numbers | Remove quotes from numeric values |
| Items array empty | Not populated correctly | Verify item objects structure |

---

#### 5. QA Checklist

**Before Launch:**
- [ ] Data layer initializes before GTM on all pages
- [ ] All page types have correct page-level variables
- [ ] User data populated for logged-in users
- [ ] All events follow naming conventions (snake_case)
- [ ] Ecommerce events include required parameters
- [ ] Items arrays properly formatted
- [ ] Currency codes correct (ISO 4217)
- [ ] Transaction IDs unique
- [ ] Sensitive data not included (emails, phone numbers, etc.)
- [ ] Events appear in GA4 DebugView
- [ ] Events appear in GA4 Realtime reports
- [ ] No JavaScript errors in console
- [ ] Works in all major browsers
- [ ] Works on mobile devices

---

## 10. APPENDIX: CODE EXAMPLES

### A. Complete Page Load Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Product Page Example</title>

  <!-- Data Layer - Must come FIRST -->
  <script>
  window.dataLayer = window.dataLayer || [];
  dataLayer.push({
    // Page data
    'page_type': 'product',
    'page_category': 'products',
    'page_name': 'Blue Cotton T-Shirt',

    // Product data
    'product_id': 'SKU_12345',
    'product_name': 'Blue Cotton T-Shirt',
    'product_brand': 'Acme',
    'product_category': 'Apparel > Men > T-Shirts',
    'product_price': 29.99,
    'product_currency': 'USD',
    'product_availability': 'in_stock',

    // User data
    'user_id': '',
    'user_login_state': 'logged_out',
    'user_type': 'guest',

    // Site data
    'site_language': 'en',
    'site_country': 'US',
    'site_currency': 'USD'
  });

  // Fire view_item event
  dataLayer.push({
    'event': 'view_item',
    'currency': 'USD',
    'value': 29.99,
    'items': [{
      item_id: 'SKU_12345',
      item_name: 'Blue Cotton T-Shirt',
      item_brand: 'Acme',
      item_category: 'Apparel',
      item_category2: 'Men',
      item_category3: 'T-Shirts',
      item_variant: 'Blue / Large',
      price: 29.99,
      quantity: 1
    }]
  });
  </script>

  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-XXXXXX');</script>
  <!-- End Google Tag Manager -->
</head>
<body>
  <!-- Page content -->
</body>
</html>
```

---

### B. Add to Cart Button Example

```html
<!-- HTML -->
<button
  id="add-to-cart-btn"
  data-product-id="SKU_12345"
  data-product-name="Blue Cotton T-Shirt"
  data-product-price="29.99"
  data-product-brand="Acme"
  onclick="addToCart(this)">
  Add to Cart
</button>

<!-- JavaScript -->
<script>
function addToCart(button) {
  // Get product data from button attributes
  const productId = button.getAttribute('data-product-id');
  const productName = button.getAttribute('data-product-name');
  const productPrice = parseFloat(button.getAttribute('data-product-price'));
  const productBrand = button.getAttribute('data-product-brand');

  // Get selected variant (size, color, etc.)
  const selectedVariant = getSelectedVariant(); // Your function
  const quantity = getSelectedQuantity(); // Your function

  // Add to cart logic (AJAX call, etc.)
  // ... your add to cart code ...

  // Push to data layer AFTER successful add to cart
  dataLayer.push({
    'event': 'add_to_cart',
    'currency': 'USD',
    'value': productPrice * quantity,
    'items': [{
      item_id: productId,
      item_name: productName,
      item_brand: productBrand,
      item_category: 'Apparel',
      item_variant: selectedVariant,
      price: productPrice,
      quantity: quantity
    }]
  });
}
</script>
```

---

### C. Form Tracking Example

```html
<!-- HTML -->
<form id="contact-form" action="/submit-contact" method="POST">
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  <textarea name="message" required></textarea>
  <button type="submit">Submit</button>
</form>

<!-- JavaScript -->
<script>
const form = document.getElementById('contact-form');
let formStarted = false;

// Track form start (user begins interacting)
form.addEventListener('focus', function() {
  if (!formStarted) {
    dataLayer.push({
      'event': 'form_start',
      'form_id': 'contact-form',
      'form_name': 'Contact Us',
      'form_destination': '/thank-you'
    });
    formStarted = true;
  }
}, true); // Use capture phase

// Track form submit
form.addEventListener('submit', function(e) {
  // Don't prevent default, let form submit naturally
  dataLayer.push({
    'event': 'form_submit',
    'form_id': 'contact-form',
    'form_name': 'Contact Us',
    'form_destination': '/thank-you'
  });
});
</script>
```

---

### D. Search Tracking Example

```html
<!-- HTML -->
<form id="search-form" action="/search" method="GET">
  <input type="text" name="q" id="search-input" placeholder="Search...">
  <button type="submit">Search</button>
</form>

<!-- JavaScript -->
<script>
document.getElementById('search-form').addEventListener('submit', function(e) {
  const searchTerm = document.getElementById('search-input').value;

  dataLayer.push({
    'event': 'search',
    'search_term': searchTerm
    // search_results count can be added on results page
  });

  // Let form submit naturally
});
</script>
```

---

### E. Purchase Event with Deduplication

```html
<!-- Order Confirmation Page -->
<script>
window.dataLayer = window.dataLayer || [];

// Page-level data
dataLayer.push({
  'page_type': 'confirmation',
  'page_category': 'ecommerce',
  'page_name': 'Order Confirmation'
});

// Purchase event with deduplication
(function() {
  const transactionId = 'T_12345'; // From server-side variable
  const storageKey = 'transaction_' + transactionId;

  // Only fire if not already recorded in this session
  if (!sessionStorage.getItem(storageKey)) {
    dataLayer.push({
      'event': 'purchase',
      'transaction_id': transactionId,
      'value': 65.97,
      'currency': 'USD',
      'tax': 4.50,
      'shipping': 5.99,
      'coupon': 'SUMMER2024',
      'items': [
        {
          item_id: 'SKU_12345',
          item_name: 'Blue Cotton T-Shirt',
          item_brand: 'Acme',
          item_category: 'Apparel',
          item_variant: 'Blue / Large',
          price: 29.99,
          quantity: 1
        },
        {
          item_id: 'SKU_67890',
          item_name: 'Black Jeans',
          item_brand: 'Acme',
          item_category: 'Apparel',
          price: 59.99,
          quantity: 1
        }
      ]
    });

    // Mark as sent
    sessionStorage.setItem(storageKey, 'true');
  }
})();
</script>
```

---

### F. Dynamic User Data Update (After Login)

```javascript
// After successful login, update data layer with user info
function updateDataLayerAfterLogin(userId, userType) {
  dataLayer.push({
    'user_id': userId,
    'user_login_state': 'logged_in',
    'user_type': userType,
    'event': 'user_data_update' // Optional event to trigger tags
  });
}

// Call this function after login success
updateDataLayerAfterLogin('USER_abc123', 'customer');
```

---

## SUPPORT & QUESTIONS

For implementation support or questions about this specification, please contact:

**JY/co LLC**
Digital Analytics Consulting

Email: [YOUR EMAIL]
Website: [YOUR WEBSITE]
Phone: [YOUR PHONE]

---

**Document Version:** 1.0
**Last Updated:** [DATE]
**Prepared by:** [YOUR NAME], JY/co LLC

---

## WORD FORMATTING GUIDE

1. **Cover Page:** Centered, professional layout
2. **Headers:**
   - H1 (Sections): 16pt, Bold, Color #0f172a
   - H2 (Subsections): 14pt, Bold, Color #2563eb
   - H3: 12pt, Bold
3. **Code Blocks:**
   - Font: Consolas or Courier New, 9pt
   - Background: Light gray (#f5f5f5)
   - Border: 1pt solid #e0e0e0
4. **Tables:**
   - Header row: Background #0f172a, White text, Bold
   - Alternating rows: Light gray (#f8f8f8)
5. **Callout Boxes (Notes/Important):**
   - Background: #eff6ff (light blue)
   - Border-left: 4pt solid #2563eb
   - Padding: 10pt
6. **Page Numbers:** Bottom right footer
7. **Header:** JY/co logo left, "Data Layer Specification" right
8. **Line Spacing:** 1.15
9. **Paragraph Spacing:** 6pt after
10. **Page Breaks:** Before each major section

---

**END OF TEMPLATE**
