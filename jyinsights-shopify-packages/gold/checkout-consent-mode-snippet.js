/**
 * JY Insights - Checkout Consent Mode Integration
 * Adds to gold-checkout-pixel-GA4-enhanced.js
 * Version: 1.0
 * Last Updated: 2026-01-11
 *
 * INSTALLATION:
 * Add this code to the TOP of your gold-checkout-pixel-GA4-enhanced.js
 * (Right after the opening function, before CONFIG)
 *
 * WHAT THIS DOES:
 * - Initializes Google Consent Mode v2 in checkout
 * - Reads consent state from storefront (via localStorage)
 * - Ensures consent mode persists across checkout steps
 * - Works with Shopify Customer Privacy API
 */

// ==========================================================================
// CONSENT MODE INITIALIZATION (Add this at the top of checkout pixel)
// ==========================================================================

(function initializeCheckoutConsentMode() {
  'use strict';

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];

  function gtag() {
    dataLayer.push(arguments);
  }

  // Default consent state (safe default)
  var defaultConsent = {
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'personalization_storage': 'denied',
    'functionality_storage': 'granted',
    'security_storage': 'granted'
  };

  console.log('[Checkout Consent Mode] Initializing...');

  // Set default consent
  gtag('consent', 'default', defaultConsent);

  console.log('[Checkout Consent Mode] Default consent set:', defaultConsent);

  // Try to read consent from Shopify Privacy API
  function getShopifyConsent() {
    try {
      if (typeof Shopify !== 'undefined' && Shopify.customerPrivacy) {
        var consent = Shopify.customerPrivacy.getTrackingConsent();
        console.log('[Checkout Consent Mode] Shopify consent:', consent);
        return consent;
      }
    } catch (e) {
      console.log('[Checkout Consent Mode] Could not read Shopify consent:', e);
    }
    return null;
  }

  // Update consent if Shopify has a value
  var shopifyConsent = getShopifyConsent();
  if (shopifyConsent === 'yes') {
    console.log('[Checkout Consent Mode] Granting consent from Shopify');

    gtag('consent', 'update', {
      'analytics_storage': 'granted',
      'ad_storage': 'granted',
      'ad_user_data': 'granted',
      'ad_personalization': 'granted',
      'personalization_storage': 'granted',
      'functionality_storage': 'granted',
      'security_storage': 'granted'
    });

    // Update Microsoft consent state
    window.microsoftConsentState = {
      analytics: true,
      advertising: true
    };
  } else if (shopifyConsent === 'no') {
    console.log('[Checkout Consent Mode] Denying consent from Shopify');

    // Keep denied state (already set in default)

    // Update Microsoft consent state
    window.microsoftConsentState = {
      analytics: false,
      advertising: false
    };
  } else {
    console.log('[Checkout Consent Mode] No consent preference found, using defaults');

    // Initialize Microsoft consent state
    window.microsoftConsentState = {
      analytics: false,
      advertising: false
    };
  }

  console.log('[Checkout Consent Mode] Initialized successfully');
})();

// ==========================================================================
// YOUR EXISTING CHECKOUT PIXEL CODE GOES HERE
// ==========================================================================

// (function() {
//   'use strict';
//   var CONFIG = { ... };
//   ... rest of your checkout pixel code ...
// })();
