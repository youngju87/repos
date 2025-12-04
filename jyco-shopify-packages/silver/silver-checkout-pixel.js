/**
 * JY/co Silver Package - Checkout Custom Pixel (Complete)
 * GA4 ecommerce tracking via Shopify Web Pixel API only
 * Version: 1.0
 * Last Updated: 2024-12-04
 *
 * Installation: Add this as a Custom Pixel in Shopify Admin > Settings > Customer Events
 * Documentation: See silver-sdr-document.docx
 * Support: contact@jyco.com
 *
 * This pixel captures ALL events through Shopify's Web Pixel API.
 * No theme code required - Custom Pixel only implementation.
 *
 * IMPORTANT: This implementation provides BOTH options:
 * - Option A: Direct GA4 hits via Measurement Protocol
 * - Option B: PostMessage to GTM dataLayer
 * Configure which method to use below.
 */

(function() {
  'use strict';

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  const JYCO_CONFIG = {
    debug: false,                      // Set to true for console logging
    version: '1.0',

    // Choose your tracking method:
    // 'gtm' = PostMessage to GTM (requires GTM container)
    // 'direct' = Direct GA4 Measurement Protocol (no GTM needed)
    trackingMethod: 'gtm',

    // If using 'direct' method, configure these:
    ga4MeasurementId: 'G-XXXXXXXXXX',  // Your GA4 Measurement ID
    ga4ApiSecret: 'XXXXXXXXXXXX',      // Your GA4 API Secret (create in GA4 Admin > Data Streams > Measurement Protocol API secrets)

    // Client ID handling
    useGaCookie: true,                 // Try to read _ga cookie for client_id
    fallbackClientId: null             // Will be generated if needed
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  // Debug logger
  function jycoLog(message, data) {
    if (JYCO_CONFIG.debug) {
      console.log('[JY/co Silver v' + JYCO_CONFIG.version + '] ' + message, data || '');
    }
  }

  // SHA256 hash function for email
  async function sha256(message) {
    if (!message) return '';

    try {
      const msgBuffer = new TextEncoder().encode(message.toLowerCase().trim());
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (e) {
      jycoLog('Error hashing email:', e);
      return '';
    }
  }

  // Get or create client ID
  function getClientId() {
    if (JYCO_CONFIG.useGaCookie) {
      try {
        // Try to read _ga cookie
        const gaCookie = analytics.browser.cookie.get('_ga');
        if (gaCookie) {
          // _ga cookie format: GA1.2.XXXXXXXXXX.YYYYYYYYYY
          // We want the XXXXXXXXXX.YYYYYYYYYY part
          const parts = gaCookie.split('.');
          if (parts.length >= 4) {
            return parts[2] + '.' + parts[3];
          }
        }
      } catch (e) {
        jycoLog('Error reading _ga cookie:', e);
      }
    }

    // Generate fallback client ID if not already generated
    if (!JYCO_CONFIG.fallbackClientId) {
      JYCO_CONFIG.fallbackClientId = Date.now() + '.' + Math.random().toString(36).substring(2, 15);
    }

    return JYCO_CONFIG.fallbackClientId;
  }

  // Format line items to GA4 items array
  function formatLineItems(lineItems, currency) {
    if (!lineItems || !Array.isArray(lineItems)) {
      return [];
    }

    return lineItems.map((item, index) => {
      const variant = item.variant || {};
      const product = variant.product || {};
      const price = parseFloat(item.finalLinePrice?.amount || 0) / (item.quantity || 1);
      const compareAtPrice = parseFloat(variant.compareAtPrice?.amount || 0);
      const discount = compareAtPrice > price ? (compareAtPrice - price) : 0;

      const formattedItem = {
        item_id: String(variant.id || ''),
        item_name: item.title || product.title || '',
        item_brand: product.vendor || '',
        item_category: product.type || '',
        price: price,
        quantity: item.quantity || 1,
        currency: currency
      };

      if (variant.title && variant.title !== 'Default Title') {
        formattedItem.item_variant = variant.title;
      }

      if (variant.sku) {
        formattedItem.item_sku = variant.sku;
      }

      if (discount > 0) {
        formattedItem.discount = discount;
      }

      formattedItem.index = index;

      return formattedItem;
    });
  }

  // Format cart line items (slightly different structure)
  function formatCartItems(cartLines, currency) {
    if (!cartLines || !Array.isArray(cartLines)) {
      return [];
    }

    return cartLines.map((line, index) => {
      const merchandise = line.merchandise || {};
      const product = merchandise.product || {};
      const price = parseFloat(line.cost?.totalAmount?.amount || 0) / (line.quantity || 1);

      const formattedItem = {
        item_id: String(merchandise.id || ''),
        item_name: merchandise.title || product.title || '',
        item_brand: product.vendor || '',
        item_category: product.type || '',
        price: price,
        quantity: line.quantity || 1,
        currency: currency,
        index: index
      };

      if (merchandise.title && merchandise.title !== 'Default Title') {
        formattedItem.item_variant = merchandise.title;
      }

      if (merchandise.sku) {
        formattedItem.item_sku = merchandise.sku;
      }

      return formattedItem;
    });
  }

  // Extract discount information
  function getDiscountInfo(discountApplications) {
    const discounts = discountApplications || [];
    const discountCodes = [];
    let totalDiscountAmount = 0;

    discounts.forEach(discount => {
      if (discount.title) {
        discountCodes.push(discount.title);
      }
      if (discount.value && discount.value.amount) {
        totalDiscountAmount += parseFloat(discount.value.amount);
      }
    });

    return {
      discount_codes: discountCodes,
      discount_amount: totalDiscountAmount
    };
  }

  // Determine if customer is new
  function isNewCustomer(customer) {
    if (customer && typeof customer.ordersCount !== 'undefined') {
      return customer.ordersCount === 0 || customer.ordersCount === 1;
    }
    return null;
  }

  // Get customer data
  async function getCustomerData(data) {
    const email = data.email || (data.customer && data.customer.email) || '';
    const customer = data.customer || {};

    const customerData = {
      user_id: customer.id ? String(customer.id) : undefined,
      customer_email_sha256: email ? await sha256(email) : '',
      customer_logged_in: !!customer.id
    };

    if (customer.ordersCount !== undefined) {
      customerData.customer_orders_count = customer.ordersCount;
      customerData.new_customer = isNewCustomer(customer);
    }

    return customerData;
  }

  // ============================================================================
  // TRACKING METHODS
  // ============================================================================

  // Method A: Send to GTM via postMessage
  function sendToGTM(payload) {
    try {
      window.parent.postMessage({
        type: 'jyco_datalayer',
        payload: payload
      }, '*');
      jycoLog('Event sent to GTM via postMessage', payload);
    } catch (e) {
      jycoLog('Error sending to GTM:', e);
    }
  }

  // Method B: Send directly to GA4 via Measurement Protocol
  async function sendToGA4Direct(eventName, eventParams) {
    try {
      const clientId = getClientId();

      const payload = {
        client_id: clientId,
        events: [{
          name: eventName,
          params: eventParams
        }]
      };

      // Add user_id if available
      if (eventParams.user_id) {
        payload.user_id = eventParams.user_id;
      }

      const url = `https://www.google-analytics.com/mp/collect?measurement_id=${JYCO_CONFIG.ga4MeasurementId}&api_secret=${JYCO_CONFIG.ga4ApiSecret}`;

      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        jycoLog('Event sent to GA4 directly', { eventName, eventParams });
      } else {
        jycoLog('Error sending to GA4:', response.status);
      }
    } catch (e) {
      jycoLog('Error sending to GA4:', e);
    }
  }

  // Universal send function (chooses method based on config)
  async function sendEvent(eventName, eventData, additionalData = {}) {
    const payload = {
      event: eventName,
      ...additionalData
    };

    if (eventData) {
      payload.ecommerce = eventData;
    }

    if (JYCO_CONFIG.trackingMethod === 'gtm') {
      sendToGTM(payload);
    } else if (JYCO_CONFIG.trackingMethod === 'direct') {
      // Flatten payload for GA4 parameters
      const flatParams = { ...additionalData };

      // Add ecommerce data as top-level parameters
      if (eventData) {
        Object.keys(eventData).forEach(key => {
          if (key === 'items') {
            flatParams.items = eventData.items;
          } else {
            flatParams[key] = eventData[key];
          }
        });
      }

      await sendToGA4Direct(eventName, flatParams);
    }
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  // PAGE_VIEWED
  analytics.subscribe('page_viewed', async (event) => {
    try {
      jycoLog('page_viewed event received', event);

      const data = event.data;
      const customerData = await getCustomerData(data);

      // Determine page type from URL
      let pageType = 'other';
      const path = event.context?.document?.location?.pathname || '';

      if (path === '/' || path === '') {
        pageType = 'home';
      } else if (path.includes('/products/')) {
        pageType = 'product';
      } else if (path.includes('/collections/')) {
        pageType = 'collection';
      } else if (path.includes('/cart')) {
        pageType = 'cart';
      } else if (path.includes('/search')) {
        pageType = 'search';
      } else if (path.includes('/pages/')) {
        pageType = 'page';
      } else if (path.includes('/blogs/')) {
        pageType = 'blog';
      } else if (path.includes('/checkouts/')) {
        pageType = 'checkout';
      }

      await sendEvent('page_view', null, {
        page_type: pageType,
        page_title: event.context?.document?.title || '',
        page_path: path,
        page_location: event.context?.document?.location?.href || '',
        ...customerData
      });

    } catch (e) {
      jycoLog('Error processing page_viewed:', e);
    }
  });

  // PRODUCT_VIEWED
  analytics.subscribe('product_viewed', async (event) => {
    try {
      jycoLog('product_viewed event received', event);

      const data = event.data;
      const productVariant = data.productVariant || {};
      const product = productVariant.product || {};
      const currency = event.context?.currency || 'USD';

      const item = {
        item_id: String(productVariant.id || ''),
        item_name: product.title || '',
        item_brand: product.vendor || '',
        item_category: product.type || '',
        price: parseFloat(productVariant.price?.amount || 0),
        currency: currency
      };

      if (productVariant.title && productVariant.title !== 'Default Title') {
        item.item_variant = productVariant.title;
      }

      if (productVariant.sku) {
        item.item_sku = productVariant.sku;
      }

      await sendEvent('view_item', {
        currency: currency,
        value: item.price,
        items: [item]
      });

    } catch (e) {
      jycoLog('Error processing product_viewed:', e);
    }
  });

  // COLLECTION_VIEWED
  analytics.subscribe('collection_viewed', async (event) => {
    try {
      jycoLog('collection_viewed event received', event);

      const data = event.data;
      const collection = data.collection || {};
      const currency = event.context?.currency || 'USD';

      // Note: Shopify Web Pixel API doesn't provide products in collection
      // So we can't populate items array with products
      // This is a limitation of Silver package vs Gold package

      await sendEvent('view_item_list', {
        item_list_name: collection.title || 'Collection',
        item_list_id: String(collection.id || ''),
        items: [] // Empty - limitation of Web Pixel API
      });

    } catch (e) {
      jycoLog('Error processing collection_viewed:', e);
    }
  });

  // SEARCH_SUBMITTED
  analytics.subscribe('search_submitted', async (event) => {
    try {
      jycoLog('search_submitted event received', event);

      const data = event.data;
      const searchResult = data.searchResult || {};

      await sendEvent('search', null, {
        search_term: searchResult.query || ''
      });

    } catch (e) {
      jycoLog('Error processing search_submitted:', e);
    }
  });

  // PRODUCT_ADDED_TO_CART
  analytics.subscribe('product_added_to_cart', async (event) => {
    try {
      jycoLog('product_added_to_cart event received', event);

      const data = event.data;
      const cartLine = data.cartLine || {};
      const currency = event.context?.currency || 'USD';

      const items = formatCartItems([cartLine], currency);
      const value = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      await sendEvent('add_to_cart', {
        currency: currency,
        value: value,
        items: items
      });

    } catch (e) {
      jycoLog('Error processing product_added_to_cart:', e);
    }
  });

  // PRODUCT_REMOVED_FROM_CART
  analytics.subscribe('product_removed_from_cart', async (event) => {
    try {
      jycoLog('product_removed_from_cart event received', event);

      const data = event.data;
      const cartLine = data.cartLine || {};
      const currency = event.context?.currency || 'USD';

      const items = formatCartItems([cartLine], currency);

      await sendEvent('remove_from_cart', {
        currency: currency,
        items: items
      });

    } catch (e) {
      jycoLog('Error processing product_removed_from_cart:', e);
    }
  });

  // CART_VIEWED
  analytics.subscribe('cart_viewed', async (event) => {
    try {
      jycoLog('cart_viewed event received', event);

      const data = event.data;
      const cart = data.cart || {};
      const currency = cart.cost?.totalAmount?.currencyCode || event.context?.currency || 'USD';
      const items = formatCartItems(cart.lines || [], currency);
      const value = parseFloat(cart.cost?.totalAmount?.amount || 0);

      await sendEvent('view_cart', {
        currency: currency,
        value: value,
        items: items
      }, {
        cart_id: cart.id || '',
        cart_total: value,
        cart_item_count: cart.lines?.length || 0
      });

    } catch (e) {
      jycoLog('Error processing cart_viewed:', e);
    }
  });

  // CHECKOUT_STARTED
  analytics.subscribe('checkout_started', async (event) => {
    try {
      jycoLog('checkout_started event received', event);

      const data = event.data;
      const checkout = data.checkout || {};
      const currency = checkout.currencyCode || 'USD';
      const items = formatLineItems(checkout.lineItems || [], currency);
      const customerData = await getCustomerData(checkout);

      await sendEvent('begin_checkout', {
        currency: currency,
        value: parseFloat(checkout.totalPrice?.amount || 0),
        items: items
      }, customerData);

    } catch (e) {
      jycoLog('Error processing checkout_started:', e);
    }
  });

  // CHECKOUT_ADDRESS_INFO_SUBMITTED
  analytics.subscribe('checkout_address_info_submitted', async (event) => {
    try {
      jycoLog('checkout_address_info_submitted event received', event);

      const data = event.data;
      const checkout = data.checkout || {};
      const currency = checkout.currencyCode || 'USD';
      const items = formatLineItems(checkout.lineItems || [], currency);

      const additionalData = {};
      if (checkout.shippingAddress) {
        additionalData.shipping_country = checkout.shippingAddress.countryCode || '';
        additionalData.shipping_region = checkout.shippingAddress.provinceCode || '';
      }

      await sendEvent('add_shipping_info', {
        currency: currency,
        value: parseFloat(checkout.totalPrice?.amount || 0),
        items: items
      }, additionalData);

    } catch (e) {
      jycoLog('Error processing checkout_address_info_submitted:', e);
    }
  });

  // CHECKOUT_SHIPPING_INFO_SUBMITTED
  analytics.subscribe('checkout_shipping_info_submitted', async (event) => {
    try {
      jycoLog('checkout_shipping_info_submitted event received', event);

      const data = event.data;
      const checkout = data.checkout || {};
      const currency = checkout.currencyCode || 'USD';
      const items = formatLineItems(checkout.lineItems || [], currency);
      const shippingLine = checkout.shippingLine || {};

      await sendEvent('add_shipping_info', {
        currency: currency,
        value: parseFloat(checkout.totalPrice?.amount || 0),
        shipping_tier: shippingLine.title || '',
        items: items
      });

    } catch (e) {
      jycoLog('Error processing checkout_shipping_info_submitted:', e);
    }
  });

  // PAYMENT_INFO_SUBMITTED
  analytics.subscribe('payment_info_submitted', async (event) => {
    try {
      jycoLog('payment_info_submitted event received', event);

      const data = event.data;
      const checkout = data.checkout || {};
      const currency = checkout.currencyCode || 'USD';
      const items = formatLineItems(checkout.lineItems || [], currency);

      await sendEvent('add_payment_info', {
        currency: currency,
        value: parseFloat(checkout.totalPrice?.amount || 0),
        payment_type: checkout.paymentMethod || '',
        items: items
      });

    } catch (e) {
      jycoLog('Error processing payment_info_submitted:', e);
    }
  });

  // CHECKOUT_COMPLETED (PURCHASE)
  analytics.subscribe('checkout_completed', async (event) => {
    try {
      jycoLog('checkout_completed event received', event);

      const data = event.data;
      const checkout = data.checkout || {};
      const currency = checkout.currencyCode || 'USD';
      const items = formatLineItems(checkout.lineItems || [], currency);
      const discountInfo = getDiscountInfo(checkout.discountApplications);
      const customerData = await getCustomerData(checkout);

      const shippingLine = checkout.shippingLine || {};
      const shippingCost = parseFloat(shippingLine.price?.amount || 0);
      const tax = parseFloat(checkout.totalTax?.amount || 0);
      const totalPrice = parseFloat(checkout.totalPrice?.amount || 0);

      const ecommerceData = {
        transaction_id: String(checkout.order?.id || checkout.token || ''),
        value: totalPrice,
        currency: currency,
        tax: tax,
        shipping: shippingCost,
        items: items
      };

      if (discountInfo.discount_codes.length > 0) {
        ecommerceData.coupon = discountInfo.discount_codes.join(', ');
      }

      const additionalData = { ...customerData };

      if (discountInfo.discount_codes.length > 0) {
        additionalData.discount_codes = discountInfo.discount_codes;
        additionalData.discount_amount = discountInfo.discount_amount;
      }

      if (shippingLine.title) {
        additionalData.shipping_method = shippingLine.title;
      }

      if (checkout.paymentMethod) {
        additionalData.payment_method = checkout.paymentMethod;
      }

      await sendEvent('purchase', ecommerceData, additionalData);

    } catch (e) {
      jycoLog('Error processing checkout_completed:', e);
    }
  });

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  jycoLog('JY/co Silver Pixel initialized successfully', {
    trackingMethod: JYCO_CONFIG.trackingMethod,
    version: JYCO_CONFIG.version
  });

  // Notify parent that pixel is ready (if using GTM method)
  if (JYCO_CONFIG.trackingMethod === 'gtm') {
    try {
      window.parent.postMessage({
        type: 'jyco_pixel_ready',
        version: JYCO_CONFIG.version,
        package: 'silver'
      }, '*');
    } catch (e) {
      jycoLog('Error sending ready message:', e);
    }
  }

})();
