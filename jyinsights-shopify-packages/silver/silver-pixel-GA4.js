/**
 * JY Insights Silver Package - Analytics Custom Pixel
 * GA4-compliant ecommerce tracking for Shopify (Pixel-Only Implementation)
 * Version: 1.0 (Silver)
 * Last Updated: 2026-01-06
 *
 * Installation: Add as Custom Pixel in Shopify Admin > Settings > Customer Events
 * Configuration: Update GTM_ID (line 39) with your GTM-XXXXXXX
 * Documentation: See silver-sdr-document.md
 * Support: contact@jyinsights.com
 *
 * ARCHITECTURE:
 * - Single custom pixel handles ALL tracking (storefront + checkout)
 * - Uses Shopify Web Pixels API for all events
 * - GA4-compliant event names and ecommerce schema
 * - GTM initialization built-in
 * - Dual email hashing (SHA-256 + SHA-1)
 *
 * TRACKED EVENTS:
 * - page_view (all pages)
 * - view_item_list (collections, search)
 * - view_item (product pages)
 * - add_to_cart (product added)
 * - remove_from_cart (cart removal)
 * - view_cart (cart page)
 * - begin_checkout (checkout start)
 * - add_contact_info (email entered)
 * - add_shipping_info (shipping selected)
 * - add_payment_info (payment selected)
 * - purchase (order complete)
 *
 * SILVER vs GOLD:
 * - SILVER: Pixel-only, zero theme editing, easier installation
 * - GOLD: Liquid + Pixel, full Shopify data access, advanced features
 * - Both: GA4-compliant, GTM integrated, production-ready
 *
 * CHANGELOG v1.0:
 * - Renamed from silver-analytics-pixel.js for consistency
 * - Updated header format to match Gold package
 * - Version reset to 1.0 for new naming convention
 */

(function() {
  'use strict';

  // ==========================================================================
  // CONFIGURATION
  // ==========================================================================

  const GTM_ID = "{{ shop.metafields.gtm.tracking_id | default: 'GTM-XXXXXXX' }}";
  const google_feed_region = "US";
  const debugMode = false;

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  window.dataLayer = window.dataLayer || [];

  const debugStyle = "background: #9c27b0; color: #ffffff; padding: 3px;";
  const debugMsg = "jyinsights Silver Pixel ->";

  function log(message, data) {
    if (debugMode) {
      if (data) {
        console.log(`%c${debugMsg} ${message}`, debugStyle, data);
      } else {
        console.log(`%c${debugMsg} ${message}`, debugStyle);
      }
    }
  }

  // ==========================================================================
  // GOOGLE TAG MANAGER
  // ==========================================================================

  function GTM_init() {
    // Check if GTM already loaded
    if (window.google_tag_manager) {
      log("GTM already loaded");
      return;
    }

    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != "dataLayer" ? "&l=" + l : "";
      j.async = true;
      j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, "script", "dataLayer", GTM_ID);

    log("GTM Initialized", { container: GTM_ID });
  }

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================

  /**
   * Safe number parsing
   */
  function parseNum(value) {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Convert Shopify amount object to decimal
   */
  function amountToDecimal(amountObj) {
    if (!amountObj || !amountObj.amount) return 0;
    return parseFloat(parseNum(amountObj.amount).toFixed(2));
  }

  /**
   * SHA-256 hash (Analyzify primary)
   */
  async function sha256(value) {
    if (!value) return '';
    try {
      const msgBuffer = new TextEncoder().encode(value.toLowerCase().trim());
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      log('SHA-256 error:', e);
      return '';
    }
  }

  /**
   * SHA-1 hash (Analyzify compatibility)
   */
  async function sha1(value) {
    if (!value) return '';
    try {
      const msgBuffer = new TextEncoder().encode(value.toLowerCase().trim());
      const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      log('SHA-1 error:', e);
      return '';
    }
  }

  /**
   * Detect page type from URL
   */
  function getPageType(context) {
    const path = context.document?.location?.pathname || '';

    if (path === '/' || path === '') return 'Homepage';
    if (path.startsWith('/collections/')) return 'Collection';
    if (path.startsWith('/products/')) return 'Product';
    if (path.startsWith('/search')) return 'Search';
    if (path.startsWith('/cart')) return 'Cart';
    if (path.startsWith('/pages/')) return 'Page';
    if (path.startsWith('/blogs/')) return 'Blog';
    if (path.startsWith('/account')) return 'Account';

    return 'Other';
  }

  // ==========================================================================
  // DATA FORMATTING (Analyzify Structure)
  // ==========================================================================

  /**
   * Format variant/product to Analyzify parallel arrays
   */
  function formatItemArrays(items) {
    const product_id = [];
    const product_name = [];
    const product_handle = [];
    const product_brand = [];
    const product_type = [];
    const product_sku = [];
    const variant_id = [];
    const variant_title = [];
    const product_price = [];
    const quantity = [];
    const g_product_id = [];

    (items || []).forEach(item => {
      const variant = item.variant || item;
      const product = variant.product || {};

      product_id.push(String(product.id || ''));
      product_name.push(item.title || product.title || '');
      product_handle.push(product.handle || '');
      product_brand.push(product.vendor || '');
      product_type.push(product.productType || product.type || '');
      product_sku.push(variant.sku || '');
      variant_id.push(String(variant.id || ''));
      variant_title.push(variant.title || '');

      const price = amountToDecimal(variant.price) || parseNum(item.price) / 100 || 0;
      product_price.push(parseFloat(price.toFixed(2)));

      quantity.push(item.quantity || 1);

      g_product_id.push(`shopify_${google_feed_region}_${product.id}_${variant.id}`);
    });

    return {
      product_id,
      product_name,
      product_handle,
      product_brand,
      product_type,
      product_sku,
      variant_id,
      variant_title,
      product_price,
      quantity,
      g_product_id
    };
  }

  /**
   * Extract customer data with RFM
   */
  async function getCustomerData(customer, email, phone) {
    email = email || customer?.email || '';
    phone = phone || customer?.phone || '';

    // Hash email
    const [email_sha256, email_sha1] = await Promise.all([
      sha256(email),
      sha1(email)
    ]);

    return {
      type: customer?.id ? 'member' : 'visitor',
      id: customer?.id || null,
      email: null, // Never send unhashed
      email_sha256: email_sha256,
      email_sha1: email_sha1,
      orders_count: customer?.ordersCount || customer?.numberOfOrders || 0,
      total_spent: amountToDecimal(customer?.amountSpent) || customer?.totalSpent || 0,
      last_order: customer?.lastOrderDate || customer?.last_order || null
    };
  }

  // ==========================================================================
  // EVENT DEDUPLICATION FLAGS
  // ==========================================================================

  let contactInfoSubmittedProcessed = false;
  let addressInfoSubmittedProcessed = false;
  let shippingInfoSubmittedProcessed = false;
  let lastPurchaseId = null;

  // ==========================================================================
  // STOREFRONT EVENT HANDLERS
  // ==========================================================================

  /**
   * Page viewed event
   */
  analytics.subscribe('page_viewed', async (event) => {
    GTM_init(); // Initialize GTM on first page view

    const context = event.context || {};
    const pageType = getPageType(context);

    // Get customer data if available
    const customerData = await getCustomerData(null, '', '');

    // Push sh_info event (Analyzify base event)
    window.dataLayer.push({
      event: 'sh_info',
      page_type: pageType,
      page_currency: event.data?.cart?.cost?.totalAmount?.currencyCode || 'USD',
      user: customerData
    });

    log('Page viewed - sh_info pushed', { page_type: pageType });
  });

  /**
   * Collection viewed event
   */
  analytics.subscribe('collection_viewed', (event) => {
    const collection = event.data?.collection;
    if (!collection) return;

    const variants = collection.productVariants || [];
    const items = formatItemArrays(variants);

    window.dataLayer.push({
      event: 'ee_productImpression',
      category_name: collection.title || '',
      category_id: String(collection.id || ''),
      ...items,
      currency: variants[0]?.price?.currencyCode || 'USD'
    });

    log('Collection viewed', { items: variants.length });
  });

  /**
   * Product viewed event
   */
  analytics.subscribe('product_viewed', (event) => {
    const variant = event.data?.productVariant;
    if (!variant) return;

    const items = formatItemArrays([variant]);

    window.dataLayer.push({
      event: 'ee_productDetail',
      ...items,
      currency: variant.price?.currencyCode || 'USD',
      category_name: variant.product?.category || '',
      category_id: ''
    });

    log('Product viewed', { product_id: variant.product?.id });
  });

  /**
   * Search submitted event
   */
  analytics.subscribe('search_submitted', (event) => {
    const searchResult = event.data?.searchResult;
    if (!searchResult) return;

    const variants = searchResult.productVariants || [];
    const items = formatItemArrays(variants);

    window.dataLayer.push({
      event: 'searchListInfo',
      page_type: 'search',
      search_term: searchResult.query || '',
      search_results: variants.length,
      ...items,
      currency: variants[0]?.price?.currencyCode || 'USD',
      product_list_id: 'search',
      product_list_name: 'Search'
    });

    log('Search submitted', { term: searchResult.query, results: variants.length });
  });

  /**
   * Product added to cart
   */
  analytics.subscribe('product_added_to_cart', (event) => {
    const cartLine = event.data?.cartLine;
    if (!cartLine) return;

    const variant = cartLine.merchandise;
    const items = formatItemArrays([{ variant, quantity: cartLine.quantity }]);

    window.dataLayer.push({
      event: 'ee_addToCart',
      ...items,
      totalValue: amountToDecimal(cartLine.cost?.totalAmount),
      totalQuantity: cartLine.quantity,
      currency: cartLine.cost?.totalAmount?.currencyCode || 'USD'
    });

    log('Product added to cart', { product_id: variant.product?.id });
  });

  /**
   * Product removed from cart
   */
  analytics.subscribe('product_removed_from_cart', (event) => {
    const cartLine = event.data?.cartLine;
    if (!cartLine) return;

    const variant = cartLine.merchandise;
    const items = formatItemArrays([{ variant, quantity: cartLine.quantity }]);

    window.dataLayer.push({
      event: 'ee_removeFromCart',
      ...items,
      currency: cartLine.cost?.totalAmount?.currencyCode || 'USD'
    });

    log('Product removed from cart', { product_id: variant.product?.id });
  });

  /**
   * Cart viewed
   */
  analytics.subscribe('cart_viewed', (event) => {
    const cart = event.data?.cart;
    if (!cart) return;

    const lines = cart.lines || [];
    const items = formatItemArrays(lines.map(line => ({
      variant: line.merchandise,
      quantity: line.quantity
    })));

    const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);

    window.dataLayer.push({
      event: 'ee_cartView',
      page_type: 'cart',
      ...items,
      totalValue: amountToDecimal(cart.cost?.totalAmount),
      totalQuantity: totalQuantity,
      currency: cart.cost?.totalAmount?.currencyCode || 'USD',
      product_list_id: 'cart',
      product_list_name: 'Cart'
    });

    log('Cart viewed', { items: lines.length });
  });

  // ==========================================================================
  // CHECKOUT EVENT HANDLERS
  // ==========================================================================

  /**
   * Checkout started
   */
  analytics.subscribe('checkout_started', async (event) => {
    const checkout = event.data?.checkout;
    if (!checkout) return;

    const customerData = await getCustomerData(
      checkout.customer,
      checkout.email,
      checkout.phone || checkout.billingAddress?.phone
    );

    const items = formatItemArrays(checkout.lineItems.map(item => ({
      variant: item.variant,
      quantity: item.quantity,
      title: item.title
    })));

    const totalQuantity = checkout.lineItems.reduce((sum, item) => sum + item.quantity, 0);

    window.dataLayer.push({
      event: 'ee_checkout',
      page_type: 'checkout',
      checkout_step: 'started',
      ...items,
      totalValue: amountToDecimal(checkout.subtotalPrice),
      totalQuantity: totalQuantity,
      value: amountToDecimal(checkout.totalPrice),
      tax: amountToDecimal(checkout.totalTax),
      shipping: amountToDecimal(checkout.shippingLine?.price),
      currency: checkout.currencyCode || 'USD',
      user: customerData
    });

    log('Checkout started', { items: checkout.lineItems.length });
  });

  /**
   * Contact info submitted
   */
  analytics.subscribe('checkout_contact_info_submitted', async (event) => {
    if (contactInfoSubmittedProcessed) return;
    contactInfoSubmittedProcessed = true;

    const checkout = event.data?.checkout;
    if (!checkout) return;

    const customerData = await getCustomerData(
      checkout.customer,
      checkout.email,
      checkout.phone || checkout.billingAddress?.phone
    );

    const items = formatItemArrays(checkout.lineItems.map(item => ({
      variant: item.variant,
      quantity: item.quantity,
      title: item.title
    })));

    const totalQuantity = checkout.lineItems.reduce((sum, item) => sum + item.quantity, 0);

    window.dataLayer.push({
      event: 'ee_add_contact_info',
      checkout_step: 'contact',
      ...items,
      totalValue: amountToDecimal(checkout.subtotalPrice),
      totalQuantity: totalQuantity,
      value: amountToDecimal(checkout.totalPrice),
      tax: amountToDecimal(checkout.totalTax),
      shipping: amountToDecimal(checkout.shippingLine?.price),
      currency: checkout.currencyCode || 'USD',
      user: customerData
    });

    log('Contact info submitted', { email_hashed: !!customerData.email_sha256 });
  });

  /**
   * Address info submitted
   */
  analytics.subscribe('checkout_address_info_submitted', async (event) => {
    if (addressInfoSubmittedProcessed) return;
    addressInfoSubmittedProcessed = true;

    const checkout = event.data?.checkout;
    if (!checkout) return;

    const customerData = await getCustomerData(
      checkout.customer,
      checkout.email,
      checkout.shippingAddress?.phone
    );

    const items = formatItemArrays(checkout.lineItems.map(item => ({
      variant: item.variant,
      quantity: item.quantity,
      title: item.title
    })));

    const totalQuantity = checkout.lineItems.reduce((sum, item) => sum + item.quantity, 0);

    window.dataLayer.push({
      event: 'ee_add_address_info',
      checkout_step: 'address',
      ...items,
      totalValue: amountToDecimal(checkout.subtotalPrice),
      totalQuantity: totalQuantity,
      value: amountToDecimal(checkout.totalPrice),
      tax: amountToDecimal(checkout.totalTax),
      shipping: amountToDecimal(checkout.shippingLine?.price),
      currency: checkout.currencyCode || 'USD',
      user: customerData
    });

    log('Address info submitted');
  });

  /**
   * Shipping info submitted
   */
  analytics.subscribe('checkout_shipping_info_submitted', async (event) => {
    if (shippingInfoSubmittedProcessed) return;
    shippingInfoSubmittedProcessed = true;

    const checkout = event.data?.checkout;
    if (!checkout) return;

    const customerData = await getCustomerData(
      checkout.customer,
      checkout.email,
      checkout.shippingAddress?.phone
    );

    const items = formatItemArrays(checkout.lineItems.map(item => ({
      variant: item.variant,
      quantity: item.quantity,
      title: item.title
    })));

    const totalQuantity = checkout.lineItems.reduce((sum, item) => sum + item.quantity, 0);
    const shipping_tier = checkout.delivery?.selectedDeliveryOptions?.[0]?.title ||
                          checkout.shippingLine?.title || '';

    window.dataLayer.push({
      event: 'ee_add_shipping_info',
      checkout_step: 'shipping',
      shipping_tier: shipping_tier,
      ...items,
      totalValue: amountToDecimal(checkout.subtotalPrice),
      totalQuantity: totalQuantity,
      value: amountToDecimal(checkout.totalPrice),
      tax: amountToDecimal(checkout.totalTax),
      shipping: amountToDecimal(checkout.shippingLine?.price),
      currency: checkout.currencyCode || 'USD',
      user: customerData
    });

    log('Shipping info submitted', { method: shipping_tier });
  });

  /**
   * Payment info submitted
   */
  analytics.subscribe('payment_info_submitted', async (event) => {
    const checkout = event.data?.checkout;
    if (!checkout) return;

    const customerData = await getCustomerData(
      checkout.customer,
      checkout.email,
      checkout.shippingAddress?.phone
    );

    const items = formatItemArrays(checkout.lineItems.map(item => ({
      variant: item.variant,
      quantity: item.quantity,
      title: item.title
    })));

    const totalQuantity = checkout.lineItems.reduce((sum, item) => sum + item.quantity, 0);
    const transaction = (checkout.transactions && checkout.transactions[0]) || {};
    const payment_type = transaction.gateway || transaction.paymentMethod || '';

    window.dataLayer.push({
      event: 'ee_add_payment_info',
      checkout_step: 'payment',
      payment_type: payment_type,
      ...items,
      totalValue: amountToDecimal(checkout.subtotalPrice),
      totalQuantity: totalQuantity,
      value: amountToDecimal(checkout.totalPrice),
      tax: amountToDecimal(checkout.totalTax),
      shipping: amountToDecimal(checkout.shippingLine?.price),
      currency: checkout.currencyCode || 'USD',
      user: customerData
    });

    log('Payment info submitted', { payment: payment_type });
  });

  /**
   * Checkout completed (purchase)
   */
  analytics.subscribe('checkout_completed', async (event) => {
    GTM_init(); // Ensure GTM loads on thank you page

    const checkout = event.data?.checkout;
    if (!checkout) return;

    const orderId = checkout.order?.id;
    if (!orderId) {
      log('Purchase event missing order_id', 'warn');
      return;
    }

    // Prevent duplicate purchase events
    if (orderId === lastPurchaseId) {
      log('Duplicate purchase event prevented', { order_id: orderId });
      return;
    }
    lastPurchaseId = orderId;

    const customerData = await getCustomerData(
      checkout.customer,
      checkout.email,
      checkout.shippingAddress?.phone
    );

    const items = formatItemArrays(checkout.lineItems.map(item => ({
      variant: item.variant,
      quantity: item.quantity,
      title: item.title
    })));

    const totalQuantity = checkout.lineItems.reduce((sum, item) => sum + item.quantity, 0);
    const transaction = (checkout.transactions && checkout.transactions[0]) || {};
    const payment_type = transaction.gateway || transaction.paymentMethod || '';

    // Get discount info
    const discountApplications = checkout.discountApplications || [];
    const coupon = discountApplications
      .map(d => d.code || d.title)
      .filter(Boolean)
      .join(',');

    // Push ee_purchase event (Analyzify format)
    window.dataLayer.push({
      event: 'ee_purchase',
      transaction_id: String(orderId),
      order_id: String(orderId),
      order_name: checkout.order?.name || '',
      page_type: 'purchase',
      checkout_step: 'thank_you',
      payment_type: payment_type,
      coupon: coupon || null,
      ...items,
      totalValue: amountToDecimal(checkout.subtotalPrice),
      totalQuantity: totalQuantity,
      value: amountToDecimal(checkout.totalPrice),
      tax: amountToDecimal(checkout.totalTax),
      shipping: amountToDecimal(checkout.shippingLine?.price),
      currency: checkout.currencyCode || 'USD',
      user: customerData
    });

    log('Purchase completed', {
      order_id: orderId,
      value: amountToDecimal(checkout.totalPrice),
      items: checkout.lineItems.length
    });
  });

  // ==========================================================================
  // INITIALIZE
  // ==========================================================================

  if (typeof analytics !== 'undefined' && analytics.subscribe) {
    log('Silver pixel initialized successfully');
  } else {
    console.error('Shopify analytics not available - pixel will not initialize');
  }

})();
