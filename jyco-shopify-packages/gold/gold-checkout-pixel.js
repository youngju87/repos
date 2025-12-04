/**
 * JY/co Gold Package - Checkout Custom Pixel
 * GA4 ecommerce tracking for Shopify checkout and purchase events
 * Version: 1.0
 * Last Updated: 2024-12-04
 *
 * Installation: Add this as a Custom Pixel in Shopify Admin > Settings > Customer Events
 * Documentation: See gold-sdr-document.docx
 * Support: contact@jyco.com
 *
 * This pixel handles checkout events. Storefront events are handled by
 * the companion gold-storefront-datalayer.liquid snippet.
 */

(function() {
  'use strict';

  // Configuration
  const JYCO_CONFIG = {
    debug: false, // Set to true to enable console logging
    version: '1.0',
    usePostMessage: true // Use postMessage to communicate with parent window GTM
  };

  // Debug logger
  function jycoLog(message, data) {
    if (JYCO_CONFIG.debug) {
      console.log('[JY/co Gold Pixel v' + JYCO_CONFIG.version + '] ' + message, data || '');
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

  // Push to dataLayer via postMessage
  function pushToDataLayer(payload) {
    try {
      if (JYCO_CONFIG.usePostMessage) {
        // Send to parent window for GTM
        window.parent.postMessage({
          type: 'jyco_datalayer',
          payload: payload
        }, '*');
        jycoLog('Event sent via postMessage', payload);
      } else {
        // Fallback: try to access parent dataLayer directly (may not work in sandbox)
        if (window.parent && window.parent.dataLayer) {
          window.parent.dataLayer.push(payload);
          jycoLog('Event pushed to parent dataLayer', payload);
        }
      }
    } catch (e) {
      jycoLog('Error pushing to dataLayer:', e);
    }
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

      // Add index position
      formattedItem.index = index;

      return formattedItem;
    });
  }

  // Extract discount information
  function getDiscountInfo(checkout) {
    const discounts = checkout.discountApplications || [];
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
    // If customer data includes order count, use it
    if (customer && typeof customer.ordersCount !== 'undefined') {
      return customer.ordersCount === 0 || customer.ordersCount === 1;
    }

    // Default to unknown (null)
    return null;
  }

  // Get customer user ID
  async function getCustomerData(checkout) {
    const email = checkout.email || '';
    const customerData = {
      user_id: checkout.customer?.id || undefined,
      customer_email_sha256: email ? await sha256(email) : '',
      customer_logged_in: !!checkout.customer
    };

    if (checkout.customer) {
      customerData.customer_orders_count = checkout.customer.ordersCount || 0;
      customerData.new_customer = isNewCustomer(checkout.customer);
    }

    return customerData;
  }

  // Subscribe to checkout_started event
  analytics.subscribe('checkout_started', async (event) => {
    try {
      jycoLog('checkout_started event received', event);

      const checkout = event.data.checkout;
      const currency = checkout.currencyCode || 'USD';
      const items = formatLineItems(checkout.lineItems, currency);
      const customerData = await getCustomerData(checkout);

      const payload = {
        event: 'begin_checkout',
        ecommerce: {
          currency: currency,
          value: parseFloat(checkout.totalPrice?.amount || 0),
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

  // Subscribe to checkout_address_info_submitted event
  analytics.subscribe('checkout_address_info_submitted', async (event) => {
    try {
      jycoLog('checkout_address_info_submitted event received', event);

      const checkout = event.data.checkout;
      const currency = checkout.currencyCode || 'USD';
      const items = formatLineItems(checkout.lineItems, currency);

      const payload = {
        event: 'add_shipping_info',
        ecommerce: {
          currency: currency,
          value: parseFloat(checkout.totalPrice?.amount || 0),
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

  // Subscribe to checkout_shipping_info_submitted event
  analytics.subscribe('checkout_shipping_info_submitted', async (event) => {
    try {
      jycoLog('checkout_shipping_info_submitted event received', event);

      const checkout = event.data.checkout;
      const currency = checkout.currencyCode || 'USD';
      const items = formatLineItems(checkout.lineItems, currency);
      const shippingLine = checkout.shippingLine || {};

      const payload = {
        event: 'add_shipping_info',
        ecommerce: {
          currency: currency,
          value: parseFloat(checkout.totalPrice?.amount || 0),
          shipping_tier: shippingLine.title || '',
          items: items
        }
      };

      pushToDataLayer(payload);
    } catch (e) {
      jycoLog('Error processing checkout_shipping_info_submitted:', e);
    }
  });

  // Subscribe to payment_info_submitted event
  analytics.subscribe('payment_info_submitted', async (event) => {
    try {
      jycoLog('payment_info_submitted event received', event);

      const checkout = event.data.checkout;
      const currency = checkout.currencyCode || 'USD';
      const items = formatLineItems(checkout.lineItems, currency);

      const payload = {
        event: 'add_payment_info',
        ecommerce: {
          currency: currency,
          value: parseFloat(checkout.totalPrice?.amount || 0),
          payment_type: checkout.paymentMethod || '',
          items: items
        }
      };

      pushToDataLayer(payload);
    } catch (e) {
      jycoLog('Error processing payment_info_submitted:', e);
    }
  });

  // Subscribe to checkout_completed event (PURCHASE)
  analytics.subscribe('checkout_completed', async (event) => {
    try {
      jycoLog('checkout_completed event received', event);

      const checkout = event.data.checkout;
      const currency = checkout.currencyCode || 'USD';
      const items = formatLineItems(checkout.lineItems, currency);
      const discountInfo = getDiscountInfo(checkout);
      const customerData = await getCustomerData(checkout);

      const shippingLine = checkout.shippingLine || {};
      const shippingCost = parseFloat(shippingLine.price?.amount || 0);
      const tax = parseFloat(checkout.totalTax?.amount || 0);
      const totalPrice = parseFloat(checkout.totalPrice?.amount || 0);

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

  // Setup listener for postMessage from parent (if needed)
  if (JYCO_CONFIG.usePostMessage) {
    // Notify parent that pixel is ready
    window.parent.postMessage({
      type: 'jyco_pixel_ready',
      version: JYCO_CONFIG.version
    }, '*');
  }

  jycoLog('JY/co Gold Checkout Pixel initialized successfully');

})();
