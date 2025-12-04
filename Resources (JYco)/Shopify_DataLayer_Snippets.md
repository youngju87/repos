# Shopify Liquid Data Layer Snippets
**JY/co Digital Analytics Consulting**

Complete guide with ready-to-use code snippets for implementing GA4 tracking on Shopify stores using Liquid templates and Google Tag Manager.

---

## Quick Start Guide

**Files to Edit:**
1. `theme.liquid` - Base data layer + GTM
2. `product.liquid` - Product view tracking
3. `collection.liquid` - Product list tracking
4. `cart.liquid` - Cart view tracking
5. Settings > Checkout > Additional Scripts - Purchase tracking

**Installation Time:** 1-2 hours

---

[See complete implementation guide in Data_Layer_Specification_Template.md for full Shopify Liquid code examples]

---

## Base Data Layer (theme.liquid)

Insert in `<head>`, BEFORE GTM snippet:

```liquid
<script>
window.dataLayer = window.dataLayer || [];
dataLayer.push({
  'page_type': '{{ request.page_type }}',
  'shop_currency': '{{ cart.currency.iso_code }}',
  {% if customer %}
  'user_id': '{{ customer.id }}',
  'user_login_state': 'logged_in'
  {% else %}
  'user_id': '',
  'user_login_state': 'logged_out'
  {% endif %}
});
</script>
```

---

## Product Page - view_item

```liquid
<script>
dataLayer.push({ 'ecommerce': null });
dataLayer.push({
  'event': 'view_item',
  'ecommerce': {
    'currency': '{{ cart.currency.iso_code }}',
    'value': {{ product.selected_or_first_available_variant.price | money_without_currency | remove: ',' }},
    'items': [{
      'item_id': '{{ product.selected_or_first_available_variant.sku | default: product.selected_or_first_available_variant.id }}',
      'item_name': '{{ product.title | escape }}',
      'item_brand': '{{ product.vendor | escape }}',
      'price': {{ product.selected_or_first_available_variant.price | money_without_currency | remove: ',' }},
      'quantity': 1
    }]
  }
});
</script>
```

---

## Collection Page - view_item_list

```liquid
<script>
dataLayer.push({ 'ecommerce': null });
dataLayer.push({
  'event': 'view_item_list',
  'ecommerce': {
    'item_list_id': '{{ collection.handle }}',
    'item_list_name': '{{ collection.title | escape }}',
    'items': [
      {% for product in collection.products limit: 48 %}
      {
        'item_id': '{{ product.selected_or_first_available_variant.sku | default: product.selected_or_first_available_variant.id }}',
        'item_name': '{{ product.title | escape }}',
        'price': {{ product.price | money_without_currency | remove: ',' }},
        'index': {{ forloop.index0 }}
      }{% unless forloop.last %},{% endunless %}
      {% endfor %}
    ]
  }
});
</script>
```

---

## Cart Page - view_cart

```liquid
<script>
dataLayer.push({ 'ecommerce': null });
dataLayer.push({
  'event': 'view_cart',
  'ecommerce': {
    'currency': '{{ cart.currency.iso_code }}',
    'value': {{ cart.total_price | money_without_currency | remove: ',' }},
    'items': [
      {% for item in cart.items %}
      {
        'item_id': '{{ item.sku | default: item.variant_id }}',
        'item_name': '{{ item.product.title | escape }}',
        'price': {{ item.price | money_without_currency | remove: ',' }},
        'quantity': {{ item.quantity }}
      }{% unless forloop.last %},{% endunless %}
      {% endfor %}
    ]
  }
});
</script>
```

---

## Thank You Page - purchase

**Location:** Settings > Checkout > Additional Scripts

```liquid
{% if first_time_accessed %}
<script>
window.dataLayer = window.dataLayer || [];
dataLayer.push({ 'ecommerce': null });
dataLayer.push({
  'event': 'purchase',
  'ecommerce': {
    'transaction_id': '{{ order.order_number }}',
    'value': {{ total_price | money_without_currency }},
    'currency': '{{ currency }}',
    'tax': {{ tax_price | money_without_currency }},
    'shipping': {{ shipping_price | money_without_currency }},
    'items': [
      {% for line_item in line_items %}
      {
        'item_id': '{{ line_item.sku | default: line_item.variant_id }}',
        'item_name': '{{ line_item.product.title | escape }}',
        'price': {{ line_item.final_price | money_without_currency }},
        'quantity': {{ line_item.quantity }}
      }{% unless forloop.last %},{% endunless %}
      {% endfor %}
    ]
  }
});
</script>
{% endif %}
```

---

## Add to Cart Event (JavaScript)

Insert before closing `</body>` in `theme.liquid`:

```javascript
<script>
(function() {
  var originalFetch = window.fetch;
  window.fetch = function() {
    return originalFetch.apply(this, arguments).then(function(response) {
      if (arguments[0].includes('/cart/add')) {
        var clonedResponse = response.clone();
        clonedResponse.json().then(function(data) {
          dataLayer.push({ 'ecommerce': null });
          dataLayer.push({
            'event': 'add_to_cart',
            'ecommerce': {
              'currency': '{{ cart.currency.iso_code }}',
              'value': data.price / 100,
              'items': [{
                'item_id': data.sku || data.variant_id,
                'item_name': data.product_title,
                'price': data.price / 100,
                'quantity': data.quantity
              }]
            }
          });
        });
      }
      return response;
    });
  };
})();
</script>
```

---

## Google Tag Manager Installation

Insert in `theme.liquid` `<head>` (after data layer):

```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXX');</script>
<!-- End Google Tag Manager -->
```

Insert after opening `<body>` tag:

```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

---

## Testing Checklist

- [ ] Open browser console and type `dataLayer` - should see array
- [ ] Install GA4 Debugger extension
- [ ] Navigate to product page - verify `view_item` fires
- [ ] Add product to cart - verify `add_to_cart` fires
- [ ] View cart - verify `view_cart` fires
- [ ] Complete test purchase - verify `purchase` fires (only once!)
- [ ] Refresh thank you page - verify purchase does NOT fire again

---

## Common Issues

**Data layer undefined:**
- Ensure data layer code appears BEFORE GTM snippet

**Purchase fires multiple times:**
- Verify `{% if first_time_accessed %}` wrapper is present

**Add to cart not tracking:**
- Check theme uses AJAX cart (inspect network tab)
- May need to adjust for theme-specific implementation

---

## Support

**JY/co LLC**
Digital Analytics Consulting
[YOUR EMAIL]
[YOUR WEBSITE]

---
