/**
 * JY/co Gold Package - Checkout Custom Pixel
 * GA4 ecommerce tracking for Shopify checkout and purchase events
 * Version: 2.0
 * Last Updated: 2025-12-09
 *
 * Installation: Add this as a Custom Pixel in Shopify Admin > Settings > Customer Events
 * Documentation: See gold-sdr-document.docx
 * Support: contact@jyco.com
 *
 * CHANGELOG v2.0:
 * - Enhanced security: Restricted postMessage origin (configurable)
 * - Improved error handling with more specific try-catch blocks
 * - Added input validation for all data transformations
 * - Enhanced JSDoc comments for better maintainability
 * - Optimized data formatting functions
 * - Better null/undefined handling
 *
 * This pixel handles checkout events. Storefront events are handled by
 * the companion gold-storefront-datalayer.liquid snippet.
 */

(function() {
  'use strict';

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  const JYCO_CONFIG = {
    debug: false, // Set to true to enable console logging
    version: '2.0',
    usePostMessage: true, // Use postMessage to communicate with parent window GTM
    // Security: Set to your actual domain in production, or '*' for testing
    // Example: 'https://yourdomain.com' or ['https://yourdomain.com', 'https://www.yourdomain.com']
    allowedOrigins: '*' // TODO: Change this in production for better security
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Debug logger
   * @param {string} message - Log message
   * @param {*} [data] - Optional data to log
   */
  function jycoLog(message, data) {
    if (JYCO_CONFIG.debug) {
      console.log('[JY/co Gold Pixel v' + JYCO_CONFIG.version + '] ' + message, data || '');
    }
  }

  /**
   * SHA256 hash function for email
   * @param {string} message - String to hash
   * @returns {Promise<string>} Hashed string
   */
  async function sha256(message) {
    if (!message) {
      return '';
    }

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

  /**
   * Validate and check origin for postMessage
   * @param {string} origin - Origin to validate
   * @returns {boolean} Whether origin is allowed
   */
  function isOriginAllowed(origin) {
    if (JYCO_CONFIG.allowedOrigins === '*') {
      return true;
    }

    if (Array.isArray(JYCO_CONFIG.allowedOrigins)) {
      return JYCO_CONFIG.allowedOrigins.includes(origin);
    }

    return origin === JYCO_CONFIG.allowedOrigins;
  }

  /**
   * Push to dataLayer via postMessage
   * @param {Object} payload - Data to send
   */
  function pushToDataLayer(payload) {
    if (!payload) {
      jycoLog('Warning: Attempted to push null/undefined payload');
      return;
    }

    try {
      if (JYCO_CONFIG.usePostMessage) {
        // Send to parent window for GTM
        const targetOrigin = JYCO_CONFIG.allowedOrigins === '*' ? '*' : JYCO_CONFIG.allowedOrigins;

        window.parent.postMessage({
          type: 'jyco_datalayer',
          payload: payload
        }, targetOrigin);

        jycoLog('Event sent via postMessage', payload);
      } else {
        // Fallback: try to access parent dataLayer directly (may not work in sandbox)
        if (window.parent && window.parent.dataLayer) {
          window.parent.dataLayer.push(payload);
          jycoLog('Event pushed to parent dataLayer', payload);
        } else {
          jycoLog('Warning: Cannot access parent dataLayer');
        }
      }
    } catch (e) {
      jycoLog('Error pushing to dataLayer:', e);
    }
  }

  // ============================================================================
  // DATA FORMATTING FUNCTIONS
  // ============================================================================

  /**
   * Safely parse float value
   * @param {*} value - Value to parse
   * @returns {number} Parsed number or 0
   */
  function safeParseFloat(value) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Format line items to GA4 items array
   * @param {Array} lineItems - Array of line items
   * @param {string} currency - Currency code
   * @returns {Array} Formatted items array
   */
  function formatLineItems(lineItems, currency) {
    if (!lineItems || !Array.isArray(lineItems)) {
      jycoLog('Warning: formatLineItems received invalid lineItems', lineItems);
      return [];
    }

    return lineItems.map((item, index) => {
      try {
        const variant = item.variant || {};
        const product = variant.product || {};
        const price = safeParseFloat(item.finalLinePrice?.amount || 0) / (item.quantity || 1);
        const compareAtPrice = safeParseFloat(variant.compareAtPrice?.amount || 0);
        const discount = compareAtPrice > price ? (compareAtPrice - price) : 0;

        const formattedItem = {
          item_id: String(variant.id || ''),
          item_name: item.title || product.title || '',
          item_brand: product.vendor || '',
          item_category: product.type || '',
          price: price,
          quantity: item.quantity || 1,
          currency: currency || 'USD'
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

        // Add index position
        formattedItem.index = index;

        return formattedItem;
      } catch (e) {
        jycoLog('Error formatting line item:', e);
        return {
          item_id: '',
          item_name: 'Error formatting item',
          currency: currency || 'USD',
          price: 0,
          quantity: 1
        };
      }
    });
  }

  /**
   * Extract discount information
   * @param {Object} checkout - Checkout object
   * @returns {Object} Discount information
   */
  function getDiscountInfo(checkout) {
    const discounts = checkout.discountApplications || [];
    const discountCodes = [];
    let totalDiscountAmount = 0;

    discounts.forEach(discount => {
      try {
        if (discount.title) {
          discountCodes.push(discount.title);
        }
        if (discount.value && discount.value.amount) {
          totalDiscountAmount += safeParseFloat(discount.value.amount);
        }
      } catch (e) {
        jycoLog('Error processing discount:', e);
      }
    });

    return {
      discount_codes: discountCodes,
      discount_amount: totalDiscountAmount
    };
  }

  /**
   * Determine if customer is new
   * @param {Object} customer - Customer object
   * @returns {boolean|null} True if new, false if returning, null if unknown
   */
  function isNewCustomer(customer) {
    if (customer && typeof customer.ordersCount !== 'undefined') {
      return customer.ordersCount === 0 || customer.ordersCount === 1;
    }
    return null;
  }

  /**
   * Get customer data
   * @param {Object} checkout - Checkout object
   * @returns {Promise<Object>} Customer data object
   */
  async function getCustomerData(checkout) {
    const email = checkout.email || '';
    const customerData = {
      user_id: checkout.customer?.id ? String(checkout.customer.id) : undefined,
      customer_email_sha256: email ? await sha256(email) : '',
      customer_logged_in: !!checkout.customer
    };

    if (checkout.customer) {
      customerData.customer_orders_count = checkout.customer.ordersCount || 0;
      customerData.new_customer = isNewCustomer(checkout.customer);
    }

    return customerData;
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle checkout_started event
   */
  analytics.subscribe('checkout_started', async (event) => {
    try {
      jycoLog('checkout_started event received', event);

      const checkout = event.data.checkout;
      if (!checkout) {
        jycoLog('Warning: checkout data missing from event');
        return;
      }

      const currency = checkout.currencyCode || 'USD';
      const items = formatLineItems(checkout.lineItems, currency);
      const customerData = await getCustomerData(checkout);

      const payload = {
        event: 'begin_checkout',
        ecommerce: {
          currency: currency,
          value: safeParseFloat(checkout.totalPrice?.amount || 0),
          items: items
        }
      };

      // Add customer data
      Object.assign(payload, customerData);

      pushToDataLayer(payload);
    } catch (e) {
      jycoLog('Error processing checkout_started:', e);
    }
  });

  /**
   * Handle checkout_address_info_submitted event
   */
  analytics.subscribe('checkout_address_info_submitted', async (event) => {
    try {
      jycoLog('checkout_address_info_submitted event received', event);

      const checkout = event.data.checkout;
      if (!checkout) {
        jycoLog('Warning: checkout data missing from event');
        return;
      }

      const currency = checkout.currencyCode || 'USD';
      const items = formatLineItems(checkout.lineItems, currency);

      const payload = {
        event: 'add_shipping_info',
        ecommerce: {
          currency: currency,
          value: safeParseFloat(checkout.totalPrice?.amount || 0),
          items: items
        }
      };

      // Add shipping address info if available
      if (checkout.shippingAddress) {
        payload.shipping_country = checkout.shippingAddress.countryCode || '';
        payload.shipping_region = checkout.shippingAddress.provinceCode || '';
      }

      pushToDataLayer(payload);
    } catch (e) {
      jycoLog('Error processing checkout_address_info_submitted:', e);
    }
  });

  /**
   * Handle checkout_shipping_info_submitted event
   */
  analytics.subscribe('checkout_shipping_info_submitted', async (event) => {
    try {
      jycoLog('checkout_shipping_info_submitted event received', event);

      const checkout = event.data.checkout;
      if (!checkout) {
        jycoLog('Warning: checkout data missing from event');
        return;
      }

      const currency = checkout.currencyCode || 'USD';
      const items = formatLineItems(checkout.lineItems, currency);
      const shippingLine = checkout.shippingLine || {};

      const payload = {
        event: 'add_shipping_info',
        ecommerce: {
          currency: currency,
          value: safeParseFloat(checkout.totalPrice?.amount || 0),
          shipping_tier: shippingLine.title || '',
          items: items
        }
      };

      pushToDataLayer(payload);
    } catch (e) {
      jycoLog('Error processing checkout_shipping_info_submitted:', e);
    }
  });

  /**
   * Handle payment_info_submitted event
   */
  analytics.subscribe('payment_info_submitted', async (event) => {
    try {
      jycoLog('payment_info_submitted event received', event);

      const checkout = event.data.checkout;
      if (!checkout) {
        jycoLog('Warning: checkout data missing from event');
        return;
      }

      const currency = checkout.currencyCode || 'USD';
      const items = formatLineItems(checkout.lineItems, currency);

      const payload = {
        event: 'add_payment_info',
        ecommerce: {
          currency: currency,
          value: safeParseFloat(checkout.totalPrice?.amount || 0),
          payment_type: checkout.paymentMethod || '',
          items: items
        }
      };

      pushToDataLayer(payload);
    } catch (e) {
      jycoLog('Error processing payment_info_submitted:', e);
    }
  });

  /**
   * Handle checkout_completed event (PURCHASE)
   */
  analytics.subscribe('checkout_completed', async (event) => {
    try {
      jycoLog('checkout_completed event received', event);

      const checkout = event.data.checkout;
      if (!checkout) {
        jycoLog('Warning: checkout data missing from event');
        return;
      }

      const currency = checkout.currencyCode || 'USD';
      const items = formatLineItems(checkout.lineItems, currency);
      const discountInfo = getDiscountInfo(checkout);
      const customerData = await getCustomerData(checkout);

      const shippingLine = checkout.shippingLine || {};
      const shippingCost = safeParseFloat(shippingLine.price?.amount || 0);
      const tax = safeParseFloat(checkout.totalTax?.amount || 0);
      const totalPrice = safeParseFloat(checkout.totalPrice?.amount || 0);

      const payload = {
        event: 'purchase',
        ecommerce: {
          transaction_id: String(checkout.order?.id || checkout.token || ''),
          value: totalPrice,
          currency: currency,
          tax: tax,
          shipping: shippingCost,
          items: items
        }
      };

      // Add discount information
      if (discountInfo.discount_codes.length > 0) {
        payload.ecommerce.coupon = discountInfo.discount_codes.join(', ');
        payload.discount_codes = discountInfo.discount_codes;
        payload.discount_amount = discountInfo.discount_amount;
      }

      // Add shipping method
      if (shippingLine.title) {
        payload.shipping_method = shippingLine.title;
      }

      // Add payment method
      if (checkout.paymentMethod) {
        payload.payment_method = checkout.paymentMethod;
      }

      // Add customer data
      Object.assign(payload, customerData);

      pushToDataLayer(payload);
    } catch (e) {
      jycoLog('Error processing checkout_completed:', e);
    }
  });

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize pixel
   */
  (function init() {
    // Notify parent that pixel is ready
    if (JYCO_CONFIG.usePostMessage) {
      try {
        const targetOrigin = JYCO_CONFIG.allowedOrigins === '*' ? '*' : JYCO_CONFIG.allowedOrigins;

        window.parent.postMessage({
          type: 'jyco_pixel_ready',
          version: JYCO_CONFIG.version
        }, targetOrigin);
      } catch (e) {
        jycoLog('Error sending ready message:', e);
      }
    }

    jycoLog('JY/co Gold Checkout Pixel initialized successfully');
  })();

})();
