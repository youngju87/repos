# Module Responsibility Matrix

**Version:** 1.2 | **Last Updated:** January 2026

A comprehensive reference showing what each component does, what it requires, and how it relates to other components.

---

## Component Overview

| Component | Type | Version | Primary Responsibility |
|-----------|------|---------|------------------------|
| `shopify-privacy-consent-mode-api.liquid` | Liquid Snippet | 2.1 | Consent management |
| `gold-storefront-datalayer-ga4.liquid` | Liquid Snippet | 2.0 | Storefront event tracking |
| `gold-checkout-pixel-ga4.js` | Custom Pixel | 2.3 | Checkout event tracking |
| `shopify-cookie-preferences-link.liquid` | Liquid Snippet | 1.2 | Cookie preferences UI |
| `gold-gtm-container-ga4.json` | GTM Container | 2.0 | Tag management |
| `consent-mode-container.json` | GTM Container | 2.1 | Consent variables/triggers |

---

## Detailed Responsibility Matrix

### shopify-privacy-consent-mode-api.liquid

| Category | Details |
|----------|---------|
| **Primary Purpose** | Bridge Shopify Privacy API to Google Consent Mode v2 |
| **Location** | `snippets/` in Shopify theme |
| **Load Order** | First (before all other tracking scripts) |
| **Dependencies** | Shopify.customerPrivacy API |
| **Provides To** | GTM (via dataLayer), Checkout Pixel (via sessionStorage) |

**Responsibilities:**

| Task | Description |
|------|-------------|
| Initialize consent defaults | Set all consent signals to "denied" on page load |
| Detect GPC/DNT | Check for privacy signals and auto-deny if present |
| Query Shopify API | Call `currentVisitorConsent()` to get consent state |
| Map consent formats | Convert Shopify format to Google Consent Mode v2 |
| Push consent events | Fire `consent_default` and `consent_updated` to dataLayer |
| Persist consent | Save consent state to sessionStorage for checkout |
| Handle consent changes | Listen for `visitorConsentCollected` event |
| Microsoft consent | Also update Microsoft consent signals |

**Events Emitted:**
- `consent_default`
- `consent_updated`
- `consent_gpc_detected`
- `microsoft_consent_updated`

**Data Stored:**
- `sessionStorage: jy_consent_state`

---

### gold-storefront-datalayer-ga4.liquid

| Category | Details |
|----------|---------|
| **Primary Purpose** | Track all storefront user interactions |
| **Location** | `snippets/` in Shopify theme |
| **Load Order** | Second (after consent mode script) |
| **Dependencies** | Consent mode script (for consent awareness) |
| **Provides To** | GTM (via dataLayer), Checkout Pixel (via sessionStorage) |

**Responsibilities:**

| Task | Description |
|------|-------------|
| Collect user data | Gather logged-in user info, hash PII |
| Collect page data | Determine page type, context, template |
| Track page views | Fire `page_view` on every page |
| Track collections | Fire `view_item_list` with product array |
| Track products | Fire `view_item` on product pages |
| Track cart actions | Fire `add_to_cart`, `remove_from_cart` |
| Track cart views | Fire `view_cart` on cart page/drawer |
| Track search | Fire `search` with query and results |
| Track product clicks | Fire `select_item` with list attribution |
| Persist attribution | Save list context to sessionStorage |
| Calculate RFM | Compute recency, frequency, monetary values |

**Events Emitted:**
- `user_data_ready`
- `page_data_ready`
- `page_view`
- `view_item_list`
- `view_item`
- `select_item`
- `add_to_cart`
- `remove_from_cart`
- `view_cart`
- `search`

**Data Stored:**
- `sessionStorage: jy_list_attribution`
- `sessionStorage: jy_customer_logged_in`

---

### gold-checkout-pixel-ga4.js

| Category | Details |
|----------|---------|
| **Primary Purpose** | Track checkout funnel in sandboxed environment |
| **Location** | Shopify Admin → Customer Events |
| **Load Order** | Automatic (loads in checkout iframe) |
| **Dependencies** | sessionStorage (consent state, attribution) |
| **Provides To** | GTM (loaded inside pixel's iframe) |

**Responsibilities:**

| Task | Description |
|------|-------------|
| Load GTM | Initialize GTM container inside pixel iframe |
| Read consent | Get consent state from sessionStorage |
| Apply consent | Set consent defaults before tracking |
| Read attribution | Get list attribution from sessionStorage |
| Subscribe to events | Listen to Shopify checkout API events |
| Track checkout start | Fire `begin_checkout` event |
| Track contact info | Fire `add_contact_info` event |
| Track shipping | Fire `add_shipping_info` events |
| Track payment | Fire `add_payment_info` event |
| Track purchase | Fire `purchase` with full ecommerce data |
| Collect user data | Hash email/phone for Enhanced Conversions |
| Collect order data | Capture transaction details |

**Events Emitted:**
- `consent_default`
- `user_data_ready`
- `page_data_ready`
- `page_view`
- `begin_checkout`
- `add_contact_info`
- `add_shipping_info`
- `add_payment_info`
- `purchase`

**Shopify Events Subscribed:**
- `checkout_started`
- `checkout_contact_info_submitted`
- `checkout_address_info_submitted`
- `checkout_shipping_info_submitted`
- `payment_info_submitted`
- `checkout_completed`

---

### shopify-cookie-preferences-link.liquid

| Category | Details |
|----------|---------|
| **Primary Purpose** | Enable cookie preferences modal from footer links |
| **Location** | `snippets/` in Shopify theme |
| **Load Order** | After main content (before `</body>`) |
| **Dependencies** | Shopify Privacy API |
| **Provides To** | Users (UI interaction) |

**Responsibilities:**

| Task | Description |
|------|-------------|
| Listen for clicks | Detect clicks on `#cookie-preferences` links |
| Open preferences | Call `privacyBanner.showPreferences()` |
| Handle retries | Retry if API not ready |
| Fallback | Use alternative API methods if primary fails |

**Events Emitted:**
- None (triggers Shopify native events)

---

### gold-gtm-container-ga4.json

| Category | Details |
|----------|---------|
| **Primary Purpose** | Pre-configured GTM tags for GA4, Ads, Meta |
| **Location** | Imported into GTM |
| **Load Order** | N/A (imported once) |
| **Dependencies** | consent-mode-container.json (import first) |
| **Provides To** | GA4, Google Ads, Meta Pixel |

**Contains:**

| Item Type | Count | Examples |
|-----------|-------|----------|
| Tags | 14+ | GA4 Config, GA4 Events, Google Ads, Meta Pixel |
| Triggers | 10+ | Page View, Ecommerce events |
| Variables | 50+ | Ecommerce data, user data, page data |

**Tags Included:**
- GA4 Configuration
- GA4 Page View
- GA4 view_item_list
- GA4 view_item
- GA4 select_item
- GA4 add_to_cart
- GA4 remove_from_cart
- GA4 view_cart
- GA4 begin_checkout
- GA4 add_shipping_info
- GA4 add_payment_info
- GA4 purchase
- Google Ads Remarketing
- Google Ads Conversion
- Meta Pixel Base
- Meta Pixel Events

---

### consent-mode-container.json

| Category | Details |
|----------|---------|
| **Primary Purpose** | Consent Mode v2 variables and triggers |
| **Location** | Imported into GTM |
| **Load Order** | Import before gold-gtm-container |
| **Dependencies** | None |
| **Provides To** | All GTM tags (consent state) |

**Contains:**

| Item Type | Count | Examples |
|-----------|-------|----------|
| Variables | 12 | Consent state variables |
| Triggers | 6 | Consent event triggers |
| Tags | 0 | None |

**Variables Included:**
- DLV - consent_state
- DLV - analytics_consent
- DLV - marketing_consent
- DLV - preferences_consent
- DLV - sale_of_data_consent
- DLV - consent_source
- DLV - analytics_storage
- DLV - ad_storage
- DLV - ad_user_data
- DLV - ad_personalization
- DLV - microsoft_analytics_consent
- DLV - microsoft_advertising_consent

**Triggers Included:**
- CE - consent_default
- CE - consent_updated
- CE - consent_updated - Analytics Granted
- CE - consent_updated - Marketing Granted
- CE - microsoft_consent_updated
- CE - consent_gpc_detected

---

## Data Flow Between Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOWS                                  │
└─────────────────────────────────────────────────────────────────────────┘

CONSENT FLOW:
─────────────

consent-mode-api.liquid
        │
        ├──► dataLayer (consent_default, consent_updated)
        │         │
        │         └──► GTM ──► Tags (consent-aware)
        │
        └──► sessionStorage (jy_consent_state)
                  │
                  └──► checkout-pixel-ga4.js ──► GTM ──► Tags


TRACKING DATA FLOW:
───────────────────

storefront-datalayer.liquid
        │
        ├──► dataLayer (user_data_ready, page_view, ecommerce events)
        │         │
        │         └──► GTM ──► GA4, Google Ads, Meta
        │
        └──► sessionStorage (jy_list_attribution)
                  │
                  └──► checkout-pixel-ga4.js (reads attribution)
                            │
                            └──► dataLayer ──► GTM ──► GA4, Ads


USER INTERACTION FLOW:
──────────────────────

User clicks #cookie-preferences
        │
        └──► cookie-preferences-link.liquid
                  │
                  └──► Shopify.customerPrivacy.showPreferences()
                            │
                            └──► Native banner opens
                                      │
                                      └──► User updates consent
                                                │
                                                └──► visitorConsentCollected
                                                          │
                                                          └──► consent-mode-api.liquid
```

---

## Installation Location Reference

| Component | Install Location | Method |
|-----------|------------------|--------|
| `consent-mode-api.liquid` | `snippets/` | Create file, render in theme.liquid |
| `storefront-datalayer.liquid` | `snippets/` | Create file, render in theme.liquid |
| `checkout-pixel-ga4.js` | Shopify Admin | Customer Events → Add Custom Pixel |
| `cookie-preferences-link.liquid` | `snippets/` | Create file, render before `</body>` |
| `gtm-container-ga4.json` | GTM | Admin → Import Container |
| `consent-mode-container.json` | GTM | Admin → Import Container |

---

## Render Order in theme.liquid

```liquid
<head>
  <!-- 1. Consent Mode (MUST BE FIRST) -->
  {% render 'shopify-privacy-consent-mode-api' %}

  <!-- 2. Storefront DataLayer -->
  {% render 'gold-storefront-datalayer-ga4' %}

  <!-- 3. GTM Script (loads async) -->
  <script>...</script>

  <!-- Other head content -->
</head>
<body>
  <!-- GTM noscript fallback -->
  <noscript>...</noscript>

  <!-- Page content -->

  <!-- 4. Cookie Preferences Link (before closing body) -->
  {% render 'shopify-cookie-preferences-link' %}
</body>
```

---

## Configuration Parameters by Component

### consent-mode-api.liquid

| Parameter | Type | Default | Purpose |
|-----------|------|---------|---------|
| `debug` | boolean | `true` | Console logging |
| `version` | string | `'2.1'` | Script version |
| `saleOfDataFollowsMarketing` | boolean | `true` | CCPA behavior |
| `consentEvent` | string | `'visitorConsentCollected'` | Shopify event name |
| `pollingInterval` | number | `2000` | Consent check interval (ms) |
| `defaultConsent` | object | All denied | Initial consent state |

### storefront-datalayer.liquid

| Parameter | Type | Default | Purpose |
|-----------|------|---------|---------|
| `gtmContainerId` | string | `'GTM-K9JX87Z6'` | GTM container ID |
| `debug` | boolean | `true` | Console logging |
| `googleFeedRegion` | string | `'US'` | Google product ID format |

### checkout-pixel-ga4.js

| Parameter | Type | Default | Purpose |
|-----------|------|---------|---------|
| `gtmContainerId` | string | `'GTM-K9JX87Z6'` | GTM container ID |
| `debug` | boolean | `true` | Console logging |
| `googleFeedRegion` | string | `'US'` | Google product ID format |

### cookie-preferences-link.liquid

| Parameter | Type | Default | Purpose |
|-----------|------|---------|---------|
| `maxRetries` | number | `10` | Retry attempts |
| `retryInterval` | number | `500` | Retry delay (ms) |
| `debug` | boolean | `true` | Console logging |

---

## External Dependencies

| Component | External Dependency | Purpose |
|-----------|---------------------|---------|
| consent-mode-api | `Shopify.customerPrivacy` | Privacy API access |
| consent-mode-api | `gtag()` | Google consent commands |
| storefront-datalayer | `dataLayer` | GTM communication |
| storefront-datalayer | Shopify Liquid objects | Product/customer data |
| checkout-pixel | Shopify `analytics` | Checkout event subscription |
| checkout-pixel | `sessionStorage` | Cross-frame communication |
| cookie-preferences-link | `privacyBanner.showPreferences()` | Modal trigger |

---

## Version Compatibility

| Component Version | Shopify API | GTM Format | GA4 | Notes |
|-------------------|-------------|------------|-----|-------|
| 2.1 (Consent) | Privacy API v2.1 | v2 | - | Latest |
| 2.0 (Storefront) | Liquid 2.0 | v2 | GA4 | Latest |
| 2.3 (Checkout) | Web Pixel API | v2 | GA4 | Latest |
| 2.0 (GTM Container) | - | v2 | GA4 | Jan 2026 |

---

## Related Documents

- [Solution Design Reference](./SOLUTION-DESIGN-REFERENCE.md) - Architecture diagrams
- [Quick Start Guide](./QUICK-START-GUIDE.md) - Installation steps
- [Event Reference](./EVENT-REFERENCE.md) - Event details
- [GTM Import Guide](./GTM-IMPORT-GUIDE.md) - Container setup
