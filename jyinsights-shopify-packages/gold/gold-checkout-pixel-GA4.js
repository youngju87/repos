/**
 * JY Insights Gold Plus Package - Checkout Pixel
 * GA4-compliant checkout tracking for Shopify Customer Events
 * Version: 1.7 (Gold Plus)
 * Last Updated: 2026-01-07
 *
 * Installation: Add as Custom Pixel in Shopify Admin > Settings > Customer Events
 * Configuration: Update CONFIG.gtmContainerId with your GTM container ID
 * Documentation: See gold-sdr-document.md
 * Support: contact@jyinsights.com
 *
 * ARCHITECTURE:
 * - Subscribes to Shopify checkout events via analytics.subscribe()
 * - Pushes GA4-compliant events to window.dataLayer
 * - Runs in sandboxed iframe with GTM loaded inside the iframe
 * - GTM loads LAZILY on first checkout event (not on storefront pages)
 * - Uses direct dataLayer.push() for all events (no queue system needed)
 * - Collects coupon codes, item-level discounts, and marketing opt-in
 * - Maintains consistency with storefront tracking (gold-storefront-datalayer-GA4.liquid)
 * - Reads logged_in status from storefront via sessionStorage
 *
 * TRACKED EVENTS (Sequence):
 * 1. checkout_started → user_data_ready, page_data_ready, page_view, begin_checkout
 * 2. checkout_contact_info_submitted → add_contact_info
 * 3. checkout_address_info_submitted → add_shipping_info (tier: not_selected)
 * 4. checkout_shipping_info_submitted → add_shipping_info (tier: actual method)
 * 5. payment_info_submitted → add_payment_info
 * 6. checkout_completed → purchase (with full user_data)
 *
 * CHANGELOG v1.7:
 * - Fixed context events (user_data_ready, page_data_ready, page_view) not firing
 * - Moved context events from page_viewed subscriber to checkout_started subscriber
 * - page_viewed event has no checkout data, so context events now fire from checkout_started
 * - Added contextEventsSent flag to ensure context events only fire once per session
 * - Context events now fire before begin_checkout event
 * - Added logged_in status persistence via sessionStorage
 * - Checkout pixel now reads logged_in status from storefront if checkout.customer is undefined
 * - Fixes issue where logged-in customers appear as guests in checkout
 * - Requires storefront pixel v1.4+ to persist logged_in status
 *
 * CHANGELOG v1.6:
 * - Removed event queue system (was unnecessary complexity)
 * - Implemented immediate GTM loading using init.context.document pattern
 * - Changed all events to use direct window.dataLayer.push() calls
 * - Follows Shopify's recommended pattern for custom pixels
 *
 * CHANGELOG v1.5:
 * - [DEPRECATED - approach was incorrect, see v1.7]
 * - Attempted event queue system that didn't resolve timing issues
 *
 * CHANGELOG v1.4:
 * - Added list attribution persistence from storefront via sessionStorage
 * - formatLineItem now reads and includes item_list_id and item_list_name
 * - Enables revenue attribution by source list (collections, search) in GA4
 * - Works with storefront v1.3+ which saves attribution on user interactions
 *
 * CHANGELOG v1.3:
 * - Removed duplicate context events from checkout_started handler
 * - Fixed .map() calls to properly pass item index to formatLineItem
 * - Updated getShippingTier to use checkout.delivery.selectedDeliveryOptions
 * - Integrated GTM directly into pixel (loads in iframe)
 */

(function() {
  'use strict';

  // ==========================================================================
  // CONFIGURATION
  // ==========================================================================

  var CONFIG = {
    debug: true,
    version: '1.7',
    googleFeedRegion: 'US',
    gtmContainerId: 'GTM-K9JX87Z6' // Replace with your GTM container ID
  };

  // ==========================================================================
  // LOGGING
  // ==========================================================================

  function log(message, data) {
    if (CONFIG.debug) {
      console.log('[JY Gold Plus Checkout]', message, data || '');
    }
  }

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================

  /**
   * Safely parse numeric values
   */
  function parsePrice(value) {
    var num = parseFloat(value);
    return isNaN(num) ? 0 : Number(num.toFixed(2));
  }

  /**
   * Generate Google Ads product ID format
   */
  function generateGoogleProductId(productId, variantId) {
    return 'shopify_' + CONFIG.googleFeedRegion + '_' + productId + '_' + variantId;
  }

  /**
   * Extract coupon codes from discount applications
   */
  function extractCoupons(checkout) {
    if (!checkout.discountApplications || checkout.discountApplications.length === 0) {
      return null;
    }

    var codes = [];
    for (var i = 0; i < checkout.discountApplications.length; i++) {
      var discount = checkout.discountApplications[i];
      if (discount.type === 'DISCOUNT_CODE' && discount.title) {
        codes.push(discount.title);
      }
    }

    return codes.length > 0 ? codes.join(',') : null;
  }

  /**
   * Calculate item-level discount amount
   */
  function calculateItemDiscount(item) {
    if (!item.discountAllocations || item.discountAllocations.length === 0) {
      return 0;
    }

    var totalDiscount = 0;
    for (var i = 0; i < item.discountAllocations.length; i++) {
      var allocation = item.discountAllocations[i];
      if (allocation.amount && allocation.amount.amount) {
        totalDiscount += parseFloat(allocation.amount.amount);
      }
    }

    return parsePrice(totalDiscount);
  }

  /**
   * Check if sessionStorage is available
   */
  function isSessionStorageAvailable() {
    try {
      var test = '__jy_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch(e) {
      return false;
    }
  }

  /**
   * Retrieve list attribution from sessionStorage
   * Returns {item_list_id, item_list_name} for a given variant ID
   */
  function getListAttribution(variantId) {
    if (!isSessionStorageAvailable()) return null;

    try {
      var attribution = sessionStorage.getItem('jy_list_attribution');
      if (!attribution) return null;

      var parsed = JSON.parse(attribution);
      var variantData = parsed[String(variantId)];

      if (variantData && variantData.item_list_id && variantData.item_list_name) {
        return {
          item_list_id: variantData.item_list_id,
          item_list_name: variantData.item_list_name
        };
      }
    } catch(e) {
      log('Error reading list attribution', e);
    }
    return null;
  }

  /**
   * Format line item for GA4 ecommerce
   */
  function formatLineItem(item, index) {
    var itemData = {
      item_id: String(item.variant.id),
      item_name: item.variant.product.title,
      currency: item.variant.price.currencyCode,
      index: index || 0
    };

    // Optional fields
    if (item.variant.product.id) itemData.product_id = String(item.variant.product.id);
    if (item.variant.id) itemData.variant_id = String(item.variant.id);
    if (item.variant.product.vendor) itemData.item_brand = item.variant.product.vendor;
    if (item.variant.product.type) itemData.item_category = item.variant.product.type;
    if (item.variant.title) itemData.item_variant = item.variant.title;
    if (item.variant.sku) itemData.sku = item.variant.sku;

    // Price and quantity
    if (item.variant.price) itemData.price = parsePrice(item.variant.price.amount);
    if (item.quantity) itemData.quantity = item.quantity;

    // Item-level discount
    var discount = calculateItemDiscount(item);
    if (discount > 0) {
      itemData.discount = discount;
    }

    // Google Ads ID
    if (item.variant.product.id && item.variant.id) {
      itemData.g_product_id = generateGoogleProductId(
        item.variant.product.id,
        item.variant.id
      );
    }

    // List attribution (from storefront sessionStorage)
    var listAttribution = getListAttribution(item.variant.id);
    if (listAttribution) {
      itemData.item_list_id = listAttribution.item_list_id;
      itemData.item_list_name = listAttribution.item_list_name;
    }

    return itemData;
  }

  /**
   * Extract shipping method/tier from checkout object
   * Checks multiple possible locations for shipping information
   */
  function getShippingTier(checkout) {
    // Option 1: checkout.delivery.selectedDeliveryOptions (Checkout Extensibility - newest)
    // Only available if shop has upgraded to Checkout Extensibility
    if (checkout.delivery && checkout.delivery.selectedDeliveryOptions) {
      var deliveryOptions = checkout.delivery.selectedDeliveryOptions;
      if (deliveryOptions.length > 0 && deliveryOptions[0].title) {
        return deliveryOptions[0].title;
      }
    }

    // Option 2: checkout.shippingLine (legacy/common location)
    // "Once a shipping rate is selected by the customer it is transitioned to a shipping_line object"
    if (checkout.shippingLine && checkout.shippingLine.title) {
      return checkout.shippingLine.title;
    }

    return null;
  }

  /**
   * Format customer data for user_data object
   * Collects PII for marketing pixels (Google Enhanced Conversions, Meta CAPI)
   * Looks at shippingAddress first, then billingAddress as fallback
   */
  function formatCustomerData(checkout) {
    var customer = checkout.customer;
    var shippingAddress = checkout.shippingAddress;
    var billingAddress = checkout.billingAddress;

    // Check sessionStorage for logged_in status from storefront
    // Storefront pixel sets this when customer is logged in
    var storefrontLoggedIn = false;
    if (isSessionStorageAvailable()) {
      try {
        var stored = sessionStorage.getItem('jy_customer_logged_in');
        storefrontLoggedIn = stored === 'true';
      } catch(e) {
        log('Error reading logged_in status from sessionStorage', e);
      }
    }

    // Determine logged_in status: use checkout.customer if available, otherwise fall back to storefront status
    var isLoggedIn = !!customer || storefrontLoggedIn;

    // Determine which address to use (prefer shipping, fallback to billing)
    var address = (shippingAddress && shippingAddress.lastName)
      ? shippingAddress
      : (billingAddress && billingAddress.lastName)
        ? billingAddress
        : {};

    var userData = {
      // Customer status
      logged_in: isLoggedIn,
      customer_type: customer && customer.ordersCount > 0 ? 'returning' : customer ? 'new' : isLoggedIn ? 'returning' : 'guest'
    };

    // Email (required for Enhanced Conversions & Meta CAPI)
    if (checkout.email) {
      userData.email = checkout.email;
    } else if (address.email) {
      userData.email = address.email;
    }

    // Phone (required for Enhanced Conversions & Meta CAPI)
    if (checkout.phone) {
      userData.phone = checkout.phone;
    } else if (address.phone) {
      userData.phone = address.phone;
    }

    // Name (required for Enhanced Conversions & Meta CAPI)
    if (address.firstName) userData.first_name = address.firstName;
    if (address.lastName) userData.last_name = address.lastName;

    // Address (required for Enhanced Conversions & Meta CAPI)
    if (address.city) userData.city = address.city;
    if (address.provinceCode) userData.state = address.provinceCode;
    if (address.countryCode) userData.country = address.countryCode;
    if (address.zip) userData.zip = address.zip;

    // Customer ID (if logged in)
    if (customer && customer.id) {
      userData.user_id = String(customer.id);
    }

    // Behavioral metrics
    if (customer && customer.ordersCount !== undefined) {
      userData.orders_count = customer.ordersCount;
    }

    // Marketing opt-in status
    if (checkout.customerAcceptsMarketing !== undefined) {
      userData.accepts_marketing = checkout.customerAcceptsMarketing;
    }

    return userData;
  }

  // ==========================================================================
  // LAZY GTM INITIALIZATION
  // ==========================================================================
  // GTM loads ONLY when first checkout event fires (not on storefront pages)
  // This prevents checkout pixel from interfering with storefront tracking

  var gtmLoaded = false;

  function ensureGTM() {
    if (gtmLoaded) return;
    gtmLoaded = true;

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];

    // Get initial context from Shopify's init object
    var initContextData = (typeof init !== 'undefined' && init.context) ? init.context.document : null;

    if (initContextData) {
      window.dataLayer.push({
        page_location: initContextData.location ? initContextData.location.href : '',
        page_referrer: initContextData.referrer || '',
        page_title: initContextData.title || ''
      });
      log('Initial page data pushed to dataLayer', {
        page_title: initContextData.title
      });
    }

    // Load GTM script
    (function(w,d,s,l,i){
      w[l]=w[l]||[];
      w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
      var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
      j.async=true;
      j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
      f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer', CONFIG.gtmContainerId);

    log('GTM loaded in checkout pixel iframe', {
      version: CONFIG.version,
      containerId: CONFIG.gtmContainerId
    });
  }

  // ==========================================================================
  // CHECKOUT STARTED (fires on page load with checkout data)
  // ==========================================================================
  // NOTE: checkout_started fires first with all checkout data
  // page_viewed fires but has no checkout data in event.data.checkout

  var contextEventsSent = false; // Flag to ensure context events only fire once

  analytics.subscribe('checkout_started', function(event) {
    var context = event.context;
    var checkout = event.data.checkout;
    if (!checkout || !checkout.lineItems) return;

    // Lazy load GTM on first checkout event
    ensureGTM();

    // Push context events ONCE (user_data_ready, page_data_ready, page_view)
    if (!contextEventsSent) {
      var eventContextData = context ? context.document : null;

      // Format user data
      var userData = formatCustomerData(checkout);

      // Format page data
      var pageData = {
        page_type: 'checkout',
        page_location: eventContextData ? eventContextData.location.href : '',
        page_path: eventContextData ? eventContextData.location.pathname : '',
        page_title: eventContextData ? eventContextData.title : '',
        currency: checkout.currencyCode || 'USD',
        language: context.navigator ? context.navigator.language : ''
      };

      // Push user_data_ready event
      window.dataLayer.push({
        event: 'user_data_ready',
        user_data: userData
      });
      log('user_data_ready pushed', userData);

      // Push page_data_ready event
      window.dataLayer.push({
        event: 'page_data_ready',
        page_data: pageData
      });
      log('page_data_ready pushed', pageData);

      // Push page_view event
      window.dataLayer.push({
        event: 'page_view',
        context: 'checkout',
        page_type: 'checkout',
        page_title: eventContextData ? eventContextData.title : '',
        user_logged_in: userData.logged_in
      });
      log('page_view pushed');

      contextEventsSent = true;
    }

    // Format items with proper index
    var items = checkout.lineItems.map(function(item, index) {
      return formatLineItem(item, index);
    });
    var totalValue = parsePrice(checkout.totalPrice.amount);
    var coupon = extractCoupons(checkout);

    var ecommerceData = {
      currency: checkout.currencyCode,
      value: totalValue,
      items: items
    };

    // Add coupon if present
    if (coupon) {
      ecommerceData.coupon = coupon;
    }

    window.dataLayer.push({
      event: 'begin_checkout',
      ecommerce: ecommerceData
    });

    log('begin_checkout pushed', {
      value: totalValue,
      items_count: items.length,
      coupon: coupon || 'none'
    });
  });

  // ==========================================================================
  // CHECKOUT CONTACT INFO SUBMITTED
  // ==========================================================================

  analytics.subscribe('checkout_contact_info_submitted', function(event) {
    var checkout = event.data.checkout;
    if (!checkout) return;

    log('checkout_contact_info_submitted', {
      email: checkout.email ? 'provided' : 'not provided'
    });

    // Push add_contact_info event (optional custom event)
    window.dataLayer.push({
      event: 'add_contact_info',
      checkout_step: 'contact_info',
      email_provided: !!checkout.email
    });
  });

  // ==========================================================================
  // CHECKOUT ADDRESS INFO SUBMITTED
  // ==========================================================================

  analytics.subscribe('checkout_address_info_submitted', function(event) {
    var checkout = event.data.checkout;
    if (!checkout) return;

    var shippingAddress = checkout.shippingAddress;
    var billingAddress = checkout.billingAddress;

    log('checkout_address_info_submitted', {
      shipping_country: shippingAddress ? shippingAddress.countryCode : null,
      billing_country: billingAddress ? billingAddress.countryCode : null
    });

    // Push add_shipping_info event (GA4 standard)
    // NOTE: This fires when address is submitted, but shipping method may not be selected yet
    if (shippingAddress) {
      var items = checkout.lineItems.map(function(item, index) {
        return formatLineItem(item, index);
      });
      var totalValue = parsePrice(checkout.totalPrice.amount);
      var coupon = extractCoupons(checkout);

      // Get shipping tier if available (may not be selected yet at address step)
      var shippingTier = getShippingTier(checkout) || 'not_selected';

      var ecommerceData = {
        currency: checkout.currencyCode,
        value: totalValue,
        shipping_tier: shippingTier,
        items: items
      };

      // Add coupon if present
      if (coupon) {
        ecommerceData.coupon = coupon;
      }

      window.dataLayer.push({
        event: 'add_shipping_info',
        ecommerce: ecommerceData
      });

      log('add_shipping_info pushed (address submitted)', {
        shipping_tier: shippingTier,
        coupon: coupon || 'none'
      });
    }
  });

  // ==========================================================================
  // CHECKOUT SHIPPING INFO SUBMITTED
  // ==========================================================================

  analytics.subscribe('checkout_shipping_info_submitted', function(event) {
    var checkout = event.data.checkout;
    if (!checkout || !checkout.lineItems) return;

    var items = checkout.lineItems.map(function(item, index) {
      return formatLineItem(item, index);
    });
    var totalValue = parsePrice(checkout.totalPrice.amount);
    var coupon = extractCoupons(checkout);

    // Get shipping tier - should be available now since shipping method was just selected
    var shippingTier = getShippingTier(checkout) || 'unknown';

    var ecommerceData = {
      currency: checkout.currencyCode,
      value: totalValue,
      shipping_tier: shippingTier,
      items: items
    };

    // Add coupon if present
    if (coupon) {
      ecommerceData.coupon = coupon;
    }

    window.dataLayer.push({
      event: 'add_shipping_info',
      ecommerce: ecommerceData
    });

    log('add_shipping_info pushed (shipping method selected)', {
      shipping_tier: shippingTier,
      coupon: coupon || 'none'
    });
  });

  // ==========================================================================
  // PAYMENT INFO SUBMITTED
  // ==========================================================================

  analytics.subscribe('payment_info_submitted', function(event) {
    var checkout = event.data.checkout;
    if (!checkout || !checkout.lineItems) return;

    var items = checkout.lineItems.map(function(item, index) {
      return formatLineItem(item, index);
    });
    var totalValue = parsePrice(checkout.totalPrice.amount);
    var coupon = extractCoupons(checkout);

    // Extract payment type - prefer paymentMethod.name, fallback to transaction gateway
    var paymentType = 'unknown';
    if (checkout.paymentMethod && checkout.paymentMethod.name) {
      paymentType = checkout.paymentMethod.name;
    } else if (checkout.transactions && checkout.transactions.length > 0) {
      paymentType = checkout.transactions[0].gateway || 'unknown';
    }

    var ecommerceData = {
      currency: checkout.currencyCode,
      value: totalValue,
      payment_type: paymentType,
      items: items
    };

    // Add coupon if present
    if (coupon) {
      ecommerceData.coupon = coupon;
    }

    window.dataLayer.push({
      event: 'add_payment_info',
      ecommerce: ecommerceData
    });

    log('add_payment_info pushed', {
      value: totalValue,
      payment_type: paymentType,
      coupon: coupon || 'none'
    });
  });

  // ==========================================================================
  // CHECKOUT COMPLETED (PURCHASE)
  // ==========================================================================

  analytics.subscribe('checkout_completed', function(event) {
    var checkout = event.data.checkout;
    if (!checkout || !checkout.lineItems) return;

    var items = checkout.lineItems.map(function(item, index) {
      return formatLineItem(item, index);
    });
    var totalValue = parsePrice(checkout.totalPrice.amount);
    var tax = checkout.totalTax ? parsePrice(checkout.totalTax.amount) : 0;
    var shipping = checkout.shippingLine ? parsePrice(checkout.shippingLine.price.amount) : 0;
    var coupon = extractCoupons(checkout);

    // Format user data for purchase (includes guest users with PII)
    var userData = formatCustomerData(checkout);

    var ecommerceData = {
      transaction_id: checkout.order.id ? String(checkout.order.id) : String(checkout.token),
      affiliation: 'Shopify Store',
      currency: checkout.currencyCode,
      value: totalValue,
      tax: tax,
      shipping: shipping,
      items: items
    };

    // Add coupon if present
    if (coupon) {
      ecommerceData.coupon = coupon;
    }

    window.dataLayer.push({
      event: 'purchase',
      user_data: userData, // Include user_data with purchase event
      ecommerce: ecommerceData
    });

    log('purchase pushed', {
      transaction_id: checkout.order.id ? String(checkout.order.id) : String(checkout.token),
      value: totalValue,
      items_count: items.length,
      customer_type: userData.customer_type,
      coupon: coupon || 'none'
    });
  });

  // ==========================================================================
  // PIXEL LOADED (NOT YET INITIALIZED)
  // ==========================================================================
  // The pixel code is loaded but dataLayer won't be initialized until
  // the first checkout event fires. On storefront pages, no events fire
  // and dataLayer is never touched.

})();
