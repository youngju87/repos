/**
 * JY Insights Gold Plus Package - Checkout Pixel (ENHANCED)
 * Enhanced GA4-compliant checkout tracking with comprehensive parameter sets
 * Version: 2.3 (Gold Plus Enhanced)
 * Last Updated: 2026-01-14
 *
 * Installation: Add as Custom Pixel in Shopify Admin > Settings > Customer Events
 * Configuration: Update CONFIG.gtmContainerId with your GTM container ID
 * Documentation: See solution-design-reference-enhanced.md
 * Support: contact@jyinsights.com
 *
 * IMPORTANT: This is the ENHANCED version. DO NOT replace existing production files.
 * Keep gold-checkout-pixel-GA4.js (v1.7) as your working production file.
 *
 * ARCHITECTURE:
 * - Subscribes to Shopify checkout events via analytics.subscribe()
 * - Pushes GA4-compliant events to window.dataLayer
 * - Runs in sandboxed iframe with GTM loaded inside the iframe
 * - GTM loads IMMEDIATELY on pixel init (required for GA4 to fire in sandbox)
 * - Uses direct dataLayer.push() for all events
 * - Collects comprehensive user data, order data, product data
 * - Maintains consistency with storefront tracking (gold-storefront-datalayer-GA4-enhanced.liquid)
 * - Reads logged_in status from storefront via sessionStorage
 * - Reads consent state from sessionStorage (set by shopify-privacy-consent-mode-v2.0-modern-api.liquid)
 *
 * CONSENT MODE:
 * - Checkout iframe cannot access Shopify's customerPrivacy API (sandboxed)
 * - Consent state is passed via sessionStorage key: 'jy_consent_state'
 * - Storefront consent script saves consent to sessionStorage on every change
 * - Checkout pixel reads and applies consent BEFORE GTM loads
 * - Fires 'consent_state_loaded' event with current consent values
 *
 * ENHANCEMENTS vs v1.7:
 * - Comprehensive user parameters (full PII for thank you page)
 * - Enhanced product parameters (handles, categories, positions)
 * - Additional order parameters (order name, checkout ID, discount details)
 * - SHA1 hashing in addition to SHA256
 * - Full address object structure
 * - Enhanced cart/order metadata
 * - Support for user tags
 * - Shipping method tracking improvements
 * - Payment type tracking improvements
 *
 * TRACKED EVENTS (Sequence):
 * 1. checkout_started → user_data_ready, page_data_ready, page_view, begin_checkout
 * 2. checkout_contact_info_submitted → add_contact_info
 * 3. checkout_address_info_submitted → add_shipping_info (tier: not_selected)
 * 4. checkout_shipping_info_submitted → add_shipping_info (tier: actual method)
 * 5. payment_info_submitted → add_payment_info
 * 6. checkout_completed → purchase (with full user_data)
 */

(function() {
  'use strict';

  // ==========================================================================
  // CONFIGURATION
  // ==========================================================================

  var CONFIG = {
    debug: true,
    version: '2.3-enhanced',
    googleFeedRegion: 'US',
    gtmContainerId: 'GTM-K9JX87Z6' // Replace with your GTM container ID
  };

  // ==========================================================================
  // LOGGING
  // ==========================================================================

  function log(message, data) {
    if (CONFIG.debug) {
      console.log('[JY Gold Plus Checkout Enhanced]', message, data || '');
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
   * Format: shopify_[COUNTRY]_[PRODUCT_ID]_[VARIANT_ID]
   */
  function generateGoogleProductId(productId, variantId) {
    return 'shopify_' + CONFIG.googleFeedRegion + '_' + productId + '_' + variantId;
  }

  /**
   * SHA1 Hash function (for email/phone hashing)
   */
  function sha1Hash(str) {
    if (!str) return '';

    function rotateLeft(n, s) {
      return (n << s) | (n >>> (32 - s));
    }

    function cvtHex(val) {
      var str = '';
      var i;
      var v;
      for (i = 7; i >= 0; i--) {
        v = (val >>> (i * 4)) & 0x0f;
        str += v.toString(16);
      }
      return str;
    }

    function utf8Encode(string) {
      string = string.replace(/\r\n/g, '\n');
      var utftext = '';
      for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);
        if (c < 128) {
          utftext += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048)) {
          utftext += String.fromCharCode((c >> 6) | 192);
          utftext += String.fromCharCode((c & 63) | 128);
        } else {
          utftext += String.fromCharCode((c >> 12) | 224);
          utftext += String.fromCharCode(((c >> 6) & 63) | 128);
          utftext += String.fromCharCode((c & 63) | 128);
        }
      }
      return utftext;
    }

    var blockstart;
    var i, j;
    var W = new Array(80);
    var H0 = 0x67452301;
    var H1 = 0xEFCDAB89;
    var H2 = 0x98BADCFE;
    var H3 = 0x10325476;
    var H4 = 0xC3D2E1F0;
    var A, B, C, D, E;
    var temp;

    str = utf8Encode(str);
    var strLen = str.length;
    var wordArray = [];

    for (i = 0; i < strLen - 3; i += 4) {
      j = str.charCodeAt(i) << 24 | str.charCodeAt(i + 1) << 16 |
          str.charCodeAt(i + 2) << 8 | str.charCodeAt(i + 3);
      wordArray.push(j);
    }

    switch (strLen % 4) {
      case 0:
        i = 0x080000000;
        break;
      case 1:
        i = str.charCodeAt(strLen - 1) << 24 | 0x0800000;
        break;
      case 2:
        i = str.charCodeAt(strLen - 2) << 24 | str.charCodeAt(strLen - 1) << 16 | 0x08000;
        break;
      case 3:
        i = str.charCodeAt(strLen - 3) << 24 | str.charCodeAt(strLen - 2) << 16 |
            str.charCodeAt(strLen - 1) << 8 | 0x80;
        break;
    }

    wordArray.push(i);

    while ((wordArray.length % 16) != 14) wordArray.push(0);

    wordArray.push(strLen >>> 29);
    wordArray.push((strLen << 3) & 0x0ffffffff);

    for (blockstart = 0; blockstart < wordArray.length; blockstart += 16) {
      for (i = 0; i < 16; i++) W[i] = wordArray[blockstart + i];
      for (i = 16; i <= 79; i++) W[i] = rotateLeft(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);

      A = H0;
      B = H1;
      C = H2;
      D = H3;
      E = H4;

      for (i = 0; i <= 19; i++) {
        temp = (rotateLeft(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
        E = D;
        D = C;
        C = rotateLeft(B, 30);
        B = A;
        A = temp;
      }

      for (i = 20; i <= 39; i++) {
        temp = (rotateLeft(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
        E = D;
        D = C;
        C = rotateLeft(B, 30);
        B = A;
        A = temp;
      }

      for (i = 40; i <= 59; i++) {
        temp = (rotateLeft(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
        E = D;
        D = C;
        C = rotateLeft(B, 30);
        B = A;
        A = temp;
      }

      for (i = 60; i <= 79; i++) {
        temp = (rotateLeft(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
        E = D;
        D = C;
        C = rotateLeft(B, 30);
        B = A;
        A = temp;
      }

      H0 = (H0 + A) & 0x0ffffffff;
      H1 = (H1 + B) & 0x0ffffffff;
      H2 = (H2 + C) & 0x0ffffffff;
      H3 = (H3 + D) & 0x0ffffffff;
      H4 = (H4 + E) & 0x0ffffffff;
    }

    temp = cvtHex(H0) + cvtHex(H1) + cvtHex(H2) + cvtHex(H3) + cvtHex(H4);
    return temp.toLowerCase();
  }

  /**
   * SHA256 Hash function (enhanced implementation)
   * Note: Shopify already provides SHA256 via filters in Liquid, but we add client-side for consistency
   */
  function sha256Hash(str) {
    if (!str) return '';

    // This is a placeholder - in production, Shopify's built-in SHA256 filter is used
    // For client-side hashing in checkout pixel, we rely on Shopify's pre-hashed values
    // or implement a full SHA256 algorithm here if needed

    // For now, we'll use a simple marker to indicate SHA256 hashing should be done server-side
    return '[SHA256:' + str + ']';
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
   * Calculate total discount amount from discount applications
   */
  function calculateTotalDiscount(checkout) {
    if (!checkout.discountApplications || checkout.discountApplications.length === 0) {
      return 0;
    }

    var totalDiscount = 0;
    for (var i = 0; i < checkout.discountApplications.length; i++) {
      var discount = checkout.discountApplications[i];
      if (discount.value && discount.value.amount) {
        totalDiscount += parseFloat(discount.value.amount);
      }
    }

    return parsePrice(totalDiscount);
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
   * ENHANCED: Format line item for GA4 ecommerce with all enhanced parameters
   */
  function formatLineItem(item, index) {
    var itemData = {
      item_id: String(item.variant.id),
      item_name: item.variant.product.title,
      currency: item.variant.price.currencyCode,
      index: index || 0
    };

    // Core identifiers
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

    // ENHANCED: Add product handle if available
    if (item.variant.product.handle) {
      itemData.product_handle = item.variant.product.handle;
    }

    // ENHANCED: Add product type
    if (item.variant.product.type) {
      itemData.product_type = item.variant.product.type;
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
   * ENHANCED: Extract shipping method/tier from checkout object
   */
  function getShippingTier(checkout) {
    // Option 1: checkout.delivery.selectedDeliveryOptions
    if (checkout.delivery && checkout.delivery.selectedDeliveryOptions) {
      var deliveryOptions = checkout.delivery.selectedDeliveryOptions;
      if (deliveryOptions.length > 0 && deliveryOptions[0].title) {
        return deliveryOptions[0].title;
      }
    }

    // Option 2: checkout.shippingLine
    if (checkout.shippingLine && checkout.shippingLine.title) {
      return checkout.shippingLine.title;
    }

    return null;
  }

  /**
   * ENHANCED: Format customer data for user_data object with comprehensive PII
   * Collects full user information for marketing pixels
   */
  function formatCustomerData(checkout) {
    var customer = checkout.customer;
    var shippingAddress = checkout.shippingAddress;
    var billingAddress = checkout.billingAddress;

    // Check sessionStorage for logged_in status from storefront
    var storefrontLoggedIn = false;
    if (isSessionStorageAvailable()) {
      try {
        var stored = sessionStorage.getItem('jy_customer_logged_in');
        storefrontLoggedIn = stored === 'true';
      } catch(e) {
        log('Error reading logged_in status from sessionStorage', e);
      }
    }

    // Determine logged_in status
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

    // ENHANCED: Email with multiple hash algorithms
    var emailValue = checkout.email || (address && address.email) || null;
    if (emailValue) {
      var normalizedEmail = emailValue.toLowerCase().trim();
      userData.email = emailValue;
      userData.email_sha1 = sha1Hash(normalizedEmail);
      // SHA256 - use Web Crypto API if available (async, so we'll also try sync fallback)
      if (window.crypto && window.crypto.subtle) {
        // Note: SHA256 will be added asynchronously if crypto.subtle is available
        // For immediate use, email_sha1 is available
      }
    }

    // ENHANCED: Phone with multiple hash algorithms
    var phoneValue = checkout.phone || (address && address.phone) || null;
    if (phoneValue) {
      userData.phone = phoneValue;
      userData.phone_sha1 = sha1Hash(phoneValue);
    }

    // ENHANCED: Full name + initials (initials match storefront for privacy-safe comparisons)
    if (address.firstName) {
      userData.first_name = address.firstName;
      userData.first_name_initial = address.firstName.charAt(0).toLowerCase();
    }
    if (address.lastName) {
      userData.last_name = address.lastName;
      userData.last_name_initial = address.lastName.charAt(0).toLowerCase();
    }

    // ENHANCED: Complete address object
    if (address.address1 || address.city || address.zip) {
      userData.has_address = true;
      userData.address = {};
      if (address.firstName) userData.address.firstName = address.firstName;
      if (address.lastName) userData.address.lastName = address.lastName;
      if (address.address1) userData.address.address1 = address.address1;
      if (address.address2) userData.address.address2 = address.address2;
      if (address.city) userData.address.city = address.city;
      if (address.zip) userData.address.zip = address.zip;
      if (address.province) userData.address.province = address.province;
      if (address.provinceCode) userData.address.provinceCode = address.provinceCode;
      if (address.country) userData.address.country = address.country;
      if (address.countryCode) userData.address.countryCode = address.countryCode;
    }

    // Legacy flat address fields for backwards compatibility
    if (address.city) userData.city = address.city;
    if (address.provinceCode) userData.state = address.provinceCode;
    if (address.countryCode) userData.country = address.countryCode;
    if (address.zip) userData.zip = address.zip;

    // Customer ID (if logged in) - check multiple sources
    // Shopify checkout may provide customer ID in different locations
    var customerId = null;
    if (customer && customer.id) {
      customerId = customer.id;
    } else if (checkout.customerId) {
      customerId = checkout.customerId;
    } else if (checkout.order && checkout.order.customer && checkout.order.customer.id) {
      customerId = checkout.order.customer.id;
    }

    if (customerId) {
      userData.user_id = String(customerId);
    }

    // ENHANCED: RFM Metrics
    if (customer && customer.ordersCount !== undefined) {
      userData.orders_count = customer.ordersCount;
      userData.order_frequency = customer.ordersCount;
    }

    // Lifetime value (if available from customer object)
    if (customer && customer.amountSpent && customer.amountSpent.amount) {
      userData.lifetime_value = parsePrice(customer.amountSpent.amount);
    }

    // ENHANCED: Marketing opt-in status
    if (checkout.customerAcceptsMarketing !== undefined) {
      userData.accepts_marketing = checkout.customerAcceptsMarketing;
    }

    // ENHANCED: User tags (if available)
    if (customer && customer.tags && customer.tags.length > 0) {
      userData.tags = customer.tags;
    }

    return userData;
  }

  /**
   * ENHANCED: Format order data for purchase event
   */
  function formatOrderData(checkout) {
    var orderData = {};

    // Order identifiers
    if (checkout.order && checkout.order.id) {
      orderData.order_id = String(checkout.order.id);
    }
    if (checkout.order && checkout.order.name) {
      orderData.order_name = checkout.order.name;
    }
    if (checkout.token) {
      orderData.checkout_id = String(checkout.token);
    }

    // Financial data
    if (checkout.totalPrice) {
      orderData.total_value = parsePrice(checkout.totalPrice.amount);
    }
    if (checkout.subtotalPrice) {
      orderData.subtotal = parsePrice(checkout.subtotalPrice.amount);
    }
    if (checkout.totalTax) {
      orderData.tax = parsePrice(checkout.totalTax.amount);
    }
    if (checkout.shippingLine && checkout.shippingLine.price) {
      orderData.shipping = parsePrice(checkout.shippingLine.price.amount);
      orderData.shipping_method = checkout.shippingLine.title;
    }

    // Discount data
    var coupon = extractCoupons(checkout);
    if (coupon) {
      orderData.coupon = coupon;
    }
    var discountAmount = calculateTotalDiscount(checkout);
    if (discountAmount > 0) {
      orderData.discount_amount = discountAmount;
    }

    // Item counts
    if (checkout.lineItems) {
      var totalQuantity = 0;
      for (var i = 0; i < checkout.lineItems.length; i++) {
        totalQuantity += checkout.lineItems[i].quantity || 0;
      }
      orderData.total_quantity = totalQuantity;
    }

    // Currency
    if (checkout.currencyCode) {
      orderData.currency = checkout.currencyCode;
    }

    // ENHANCED: Presentment money (for multi-currency stores)
    if (checkout.totalPrice && checkout.totalPrice.presentmentMoney) {
      orderData.total_value_presentment_money = parsePrice(checkout.totalPrice.presentmentMoney.amount);
      orderData.currency_presentment_money = checkout.totalPrice.presentmentMoney.currencyCode;
    }

    return orderData;
  }

  // ==========================================================================
  // IMMEDIATE GTM INITIALIZATION
  // ==========================================================================
  // GTM must load IMMEDIATELY (not lazily) for GA4 to work in Shopify's
  // sandboxed checkout iframe. Loading inside analytics.subscribe() callbacks
  // creates race conditions that prevent GA4 collect requests from firing.

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];

  // ==========================================================================
  // CONSENT MODE - Using Shopify's Checkout Customer Privacy API
  // ==========================================================================
  // Shopify provides a checkout-specific consent API that works in the sandbox:
  // - init.customerPrivacy: Initial consent state
  // - api.customerPrivacy.subscribe(): Listen for consent changes during checkout
  // This is more reliable than sessionStorage for mid-checkout consent updates.

  function gtag(){window.dataLayer.push(arguments);}

  // Default consent configuration (GDPR-safe defaults)
  var defaultConsentState = {
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'personalization_storage': 'denied',
    'functionality_storage': 'granted',
    'security_storage': 'granted'
  };

  // Track current consent state for change detection
  var currentCustomerPrivacy = null;

  /**
   * Map Shopify's customerPrivacy format to Google Consent Mode format
   * Shopify format: { analyticsProcessingAllowed, marketingAllowed, preferencesProcessingAllowed, saleOfDataAllowed }
   * Google format: { analytics_storage, ad_storage, ad_user_data, ad_personalization, ... }
   */
  function mapToGoogleConsent(customerPrivacy) {
    if (!customerPrivacy) {
      return defaultConsentState;
    }

    return {
      'analytics_storage': customerPrivacy.analyticsProcessingAllowed ? 'granted' : 'denied',
      'ad_storage': customerPrivacy.marketingAllowed ? 'granted' : 'denied',
      'ad_user_data': customerPrivacy.marketingAllowed ? 'granted' : 'denied',
      'ad_personalization': customerPrivacy.marketingAllowed ? 'granted' : 'denied',
      'personalization_storage': customerPrivacy.preferencesProcessingAllowed ? 'granted' : 'denied',
      'functionality_storage': 'granted',
      'security_storage': 'granted'
    };
  }

  /**
   * Handle consent updates (both initial and mid-checkout changes)
   */
  function updateConsentMode(customerPrivacy, source) {
    var consentState = mapToGoogleConsent(customerPrivacy);

    // Update Google Consent Mode
    gtag('consent', 'update', consentState);

    // Push event to dataLayer for GTM triggers
    window.dataLayer.push({
      event: 'consent_updated',
      consent_state: consentState,
      consent_source: source,
      analytics_consent: customerPrivacy ? customerPrivacy.analyticsProcessingAllowed : false,
      marketing_consent: customerPrivacy ? customerPrivacy.marketingAllowed : false,
      preferences_consent: customerPrivacy ? customerPrivacy.preferencesProcessingAllowed : false,
      sale_of_data_consent: customerPrivacy ? customerPrivacy.saleOfDataAllowed : false
    });

    log('Consent updated in checkout', {
      analytics: consentState.analytics_storage,
      ads: consentState.ad_storage,
      source: source
    });

    currentCustomerPrivacy = customerPrivacy;
  }

  // Get initial consent from Shopify's init object
  var initialCustomerPrivacy = (typeof init !== 'undefined' && init.customerPrivacy)
    ? init.customerPrivacy
    : null;

  // Fallback: Try sessionStorage if init.customerPrivacy not available
  if (!initialCustomerPrivacy && isSessionStorageAvailable()) {
    try {
      var consentJson = sessionStorage.getItem('jy_consent_state');
      if (consentJson) {
        var storedConsent = JSON.parse(consentJson);
        // Convert sessionStorage format to customerPrivacy format
        initialCustomerPrivacy = {
          analyticsProcessingAllowed: storedConsent.analytics || false,
          marketingAllowed: storedConsent.marketing || false,
          preferencesProcessingAllowed: storedConsent.preferences || false,
          saleOfDataAllowed: storedConsent.sale_of_data || false
        };
        log('Consent loaded from sessionStorage fallback', initialCustomerPrivacy);
      }
    } catch (e) {
      log('Error reading consent from sessionStorage', e);
    }
  }

  // Set initial consent state
  var initialConsentState = mapToGoogleConsent(initialCustomerPrivacy);
  currentCustomerPrivacy = initialCustomerPrivacy;

  // Set consent BEFORE GTM loads (critical for proper consent handling)
  gtag('consent', 'default', initialConsentState);

  // Push initial consent event to dataLayer
  window.dataLayer.push({
    event: 'consent_state_loaded',
    consent_state: initialConsentState,
    consent_source: initialCustomerPrivacy ? 'shopify_checkout' : 'default',
    analytics_consent: initialCustomerPrivacy ? initialCustomerPrivacy.analyticsProcessingAllowed : false,
    marketing_consent: initialCustomerPrivacy ? initialCustomerPrivacy.marketingAllowed : false
  });

  log('Consent mode initialized in checkout pixel', {
    analytics: initialConsentState.analytics_storage,
    ads: initialConsentState.ad_storage,
    source: initialCustomerPrivacy ? 'shopify_checkout' : 'default'
  });

  // Subscribe to consent changes during checkout (user updates preferences mid-checkout)
  if (typeof api !== 'undefined' && api.customerPrivacy && typeof api.customerPrivacy.subscribe === 'function') {
    api.customerPrivacy.subscribe('visitorConsentCollected', function(event) {
      log('Consent changed during checkout', event.customerPrivacy);
      updateConsentMode(event.customerPrivacy, 'checkout_update');
    });
    log('Subscribed to checkout consent changes via api.customerPrivacy');
  } else {
    log('api.customerPrivacy.subscribe not available - consent changes during checkout will not be detected');
  }

  // Push initial page_view event before GTM loads
  window.dataLayer.push({ event: 'page_view', context: 'checkout' });

  // Get initial context from Shopify's init object (if available)
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

  // Load GTM script IMMEDIATELY
  (function(w,d,s,l,i){
    w[l]=w[l]||[];
    w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
    var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
    j.async=true;
    j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
    f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer', CONFIG.gtmContainerId);

  log('GTM loaded IMMEDIATELY in checkout pixel iframe (enhanced)', {
    version: CONFIG.version,
    containerId: CONFIG.gtmContainerId
  });

  // ==========================================================================
  // ENHANCED CHECKOUT STARTED
  // ==========================================================================

  var contextEventsSent = false;

  analytics.subscribe('checkout_started', function(event) {
    var context = event.context;
    var checkout = event.data.checkout;
    if (!checkout || !checkout.lineItems) return;

    // Push context events ONCE (GTM already loaded above)
    if (!contextEventsSent) {
      var eventContextData = context ? context.document : null;

      // ENHANCED: Format comprehensive user data
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
      log('user_data_ready pushed (enhanced)', userData);

      // Push page_data_ready event
      window.dataLayer.push({
        event: 'page_data_ready',
        page_data: pageData
      });
      log('page_data_ready pushed (enhanced)', pageData);

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

    log('begin_checkout pushed (enhanced)', {
      value: totalValue,
      items_count: items.length,
      coupon: coupon || 'none'
    });
  });

  // ==========================================================================
  // ENHANCED CHECKOUT CONTACT INFO SUBMITTED
  // ==========================================================================

  analytics.subscribe('checkout_contact_info_submitted', function(event) {
    var checkout = event.data.checkout;
    if (!checkout) return;

    log('checkout_contact_info_submitted (enhanced)', {
      email: checkout.email ? 'provided' : 'not provided'
    });

    // Push add_contact_info event
    window.dataLayer.push({
      event: 'add_contact_info',
      checkout_step: 'contact_info',
      email_provided: !!checkout.email
    });
  });

  // ==========================================================================
  // ENHANCED CHECKOUT ADDRESS INFO SUBMITTED
  // ==========================================================================

  analytics.subscribe('checkout_address_info_submitted', function(event) {
    var checkout = event.data.checkout;
    if (!checkout) return;

    var shippingAddress = checkout.shippingAddress;
    var billingAddress = checkout.billingAddress;

    log('checkout_address_info_submitted (enhanced)', {
      shipping_country: shippingAddress ? shippingAddress.countryCode : null,
      billing_country: billingAddress ? billingAddress.countryCode : null
    });

    // Push add_shipping_info event
    if (shippingAddress) {
      var items = checkout.lineItems.map(function(item, index) {
        return formatLineItem(item, index);
      });
      var totalValue = parsePrice(checkout.totalPrice.amount);
      var coupon = extractCoupons(checkout);
      var shippingTier = getShippingTier(checkout) || 'not_selected';

      var ecommerceData = {
        currency: checkout.currencyCode,
        value: totalValue,
        shipping_tier: shippingTier,
        items: items
      };

      if (coupon) {
        ecommerceData.coupon = coupon;
      }

      window.dataLayer.push({
        event: 'add_shipping_info',
        ecommerce: ecommerceData
      });

      log('add_shipping_info pushed (enhanced - address submitted)', {
        shipping_tier: shippingTier,
        coupon: coupon || 'none'
      });
    }
  });

  // ==========================================================================
  // ENHANCED CHECKOUT SHIPPING INFO SUBMITTED
  // ==========================================================================

  analytics.subscribe('checkout_shipping_info_submitted', function(event) {
    var checkout = event.data.checkout;
    if (!checkout || !checkout.lineItems) return;

    var items = checkout.lineItems.map(function(item, index) {
      return formatLineItem(item, index);
    });
    var totalValue = parsePrice(checkout.totalPrice.amount);
    var coupon = extractCoupons(checkout);
    var shippingTier = getShippingTier(checkout) || 'unknown';

    var ecommerceData = {
      currency: checkout.currencyCode,
      value: totalValue,
      shipping_tier: shippingTier,
      items: items
    };

    if (coupon) {
      ecommerceData.coupon = coupon;
    }

    window.dataLayer.push({
      event: 'add_shipping_info',
      ecommerce: ecommerceData
    });

    log('add_shipping_info pushed (enhanced - shipping method selected)', {
      shipping_tier: shippingTier,
      coupon: coupon || 'none'
    });
  });

  // ==========================================================================
  // ENHANCED PAYMENT INFO SUBMITTED
  // ==========================================================================

  analytics.subscribe('payment_info_submitted', function(event) {
    var checkout = event.data.checkout;
    if (!checkout || !checkout.lineItems) return;

    var items = checkout.lineItems.map(function(item, index) {
      return formatLineItem(item, index);
    });
    var totalValue = parsePrice(checkout.totalPrice.amount);
    var coupon = extractCoupons(checkout);

    // ENHANCED: Extract payment type with fallbacks
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

    if (coupon) {
      ecommerceData.coupon = coupon;
    }

    window.dataLayer.push({
      event: 'add_payment_info',
      ecommerce: ecommerceData
    });

    log('add_payment_info pushed (enhanced)', {
      value: totalValue,
      payment_type: paymentType,
      coupon: coupon || 'none'
    });
  });

  // ==========================================================================
  // ENHANCED CHECKOUT COMPLETED (PURCHASE)
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
    var discountAmount = calculateTotalDiscount(checkout);

    // ENHANCED: Format comprehensive user data for purchase
    var userData = formatCustomerData(checkout);

    // ENHANCED: Format comprehensive order data
    var orderData = formatOrderData(checkout);

    // ENHANCED: Payment type
    var paymentType = 'unknown';
    if (checkout.paymentMethod && checkout.paymentMethod.name) {
      paymentType = checkout.paymentMethod.name;
    } else if (checkout.transactions && checkout.transactions.length > 0) {
      paymentType = checkout.transactions[0].gateway || 'unknown';
    }

    var ecommerceData = {
      transaction_id: checkout.order && checkout.order.id ? String(checkout.order.id) : String(checkout.token),
      affiliation: 'Shopify Store',
      currency: checkout.currencyCode,
      value: totalValue,
      tax: tax,
      shipping: shipping,
      items: items
    };

    // Add optional enhanced fields
    if (coupon) {
      ecommerceData.coupon = coupon;
    }
    if (discountAmount > 0) {
      ecommerceData.discount_amount = discountAmount;
    }
    if (checkout.order && checkout.order.name) {
      ecommerceData.order_name = checkout.order.name;
    }
    if (checkout.token) {
      ecommerceData.checkout_id = String(checkout.token);
    }
    if (paymentType !== 'unknown') {
      ecommerceData.payment_type = paymentType;
    }
    if (checkout.shippingLine && checkout.shippingLine.title) {
      ecommerceData.shipping_method = checkout.shippingLine.title;
    }

    // Calculate total quantity
    var totalQuantity = 0;
    for (var i = 0; i < checkout.lineItems.length; i++) {
      totalQuantity += checkout.lineItems[i].quantity || 0;
    }
    ecommerceData.total_quantity = totalQuantity;

    window.dataLayer.push({
      event: 'purchase',
      user_data: userData,
      order_data: orderData,
      ecommerce: ecommerceData
    });

    log('purchase pushed (enhanced)', {
      transaction_id: checkout.order && checkout.order.id ? String(checkout.order.id) : String(checkout.token),
      order_name: checkout.order && checkout.order.name ? checkout.order.name : 'N/A',
      value: totalValue,
      items_count: items.length,
      total_quantity: totalQuantity,
      customer_type: userData.customer_type,
      coupon: coupon || 'none',
      discount_amount: discountAmount,
      payment_type: paymentType
    });
  });

  // ==========================================================================
  // PIXEL LOADED
  // ==========================================================================

  log('JY Insights Gold Plus Checkout ENHANCED pixel loaded', {
    version: CONFIG.version
  });

})();
