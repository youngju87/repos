# Solution Design Reference

**Version:** 1.2 | **Last Updated:** January 2026

## Executive Summary

The JY Insights Gold package implements a dual-layer tracking architecture that addresses Shopify's unique constraints: a sandboxed checkout environment and privacy-first consent requirements. The solution uses Google Tag Manager as the central orchestration layer, bridging storefront, checkout, and server-side tracking while respecting user consent preferences.

---

## End-to-End Architecture

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER'S BROWSER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    SHOPIFY STOREFRONT                                │    │
│  │                    (Main Window Context)                             │    │
│  │                                                                      │    │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │    │
│  │  │ Consent Mode API │  │ Storefront       │  │ Cookie Prefs     │   │    │
│  │  │ (Liquid v2.1)    │  │ DataLayer        │  │ Link Handler     │   │    │
│  │  │                  │  │ (Liquid v2.0)    │  │ (Liquid v1.2)    │   │    │
│  │  └────────┬─────────┘  └────────┬─────────┘  └──────────────────┘   │    │
│  │           │                     │                                    │    │
│  │           ▼                     ▼                                    │    │
│  │  ┌────────────────────────────────────────┐                         │    │
│  │  │              window.dataLayer           │                         │    │
│  │  │  - consent_default                      │                         │    │
│  │  │  - consent_updated                      │                         │    │
│  │  │  - user_data_ready                      │                         │    │
│  │  │  - page_view, view_item, add_to_cart   │                         │    │
│  │  └────────────────────┬───────────────────┘                         │    │
│  │                       │                                              │    │
│  │                       ▼                                              │    │
│  │  ┌────────────────────────────────────────┐                         │    │
│  │  │         Google Tag Manager              │                         │    │
│  │  │         (Client Container)              │                         │    │
│  │  │         GTM-XXXXXXXX                    │                         │    │
│  │  └────────────────────┬───────────────────┘                         │    │
│  │                       │                                              │    │
│  └───────────────────────┼──────────────────────────────────────────────┘    │
│                          │                                                   │
│  ┌───────────────────────┼──────────────────────────────────────────────┐    │
│  │                       │       SHOPIFY CHECKOUT                        │    │
│  │                       │       (Sandboxed Iframe)                      │    │
│  │                       │                                               │    │
│  │  ┌──────────────────────────────────────┐                            │    │
│  │  │       Checkout Pixel (JS v2.3)        │                            │    │
│  │  │                                       │                            │    │
│  │  │  - Reads sessionStorage consent       │                            │    │
│  │  │  - Subscribes to checkout events      │                            │    │
│  │  │  - Loads GTM in iframe                │                            │    │
│  │  │  - Pushes to iframe dataLayer         │                            │    │
│  │  └──────────────────┬───────────────────┘                            │    │
│  │                     │                                                 │    │
│  │                     ▼                                                 │    │
│  │  ┌──────────────────────────────────────┐                            │    │
│  │  │  GTM (Loaded inside Pixel iframe)     │                            │    │
│  │  └──────────────────┬───────────────────┘                            │    │
│  │                     │                                                 │    │
│  └─────────────────────┼─────────────────────────────────────────────────┘    │
│                        │                                                      │
└────────────────────────┼──────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SERVER-SIDE INFRASTRUCTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Server-Side GTM (Google Cloud)                    │    │
│  │                                                                      │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │    │
│  │  │ GA4 Client  │  │ Enhanced    │  │ CAPI        │                  │    │
│  │  │             │  │ Conversions │  │ Integration │                  │    │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                  │    │
│  │         │                │                │                          │    │
│  └─────────┼────────────────┼────────────────┼──────────────────────────┘    │
│            │                │                │                               │
│            ▼                ▼                ▼                               │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                │
│  │  Google         │ │  Google Ads     │ │  Facebook       │                │
│  │  Analytics 4    │ │  Enhanced Conv. │ │  CAPI           │                │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Consent State Flow

```
┌─────────────────┐
│   Page Load     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  shopify-privacy-consent-mode-api.liquid │
│                                          │
│  1. Initialize with defaults (denied)    │
│  2. Check GPC/DNT signals               │
│  3. Call Shopify.customerPrivacy API    │
│  4. Map to Google Consent Mode v2       │
└────────┬────────────────────────────────┘
         │
         ├─────────────────────────────────────────┐
         │                                         │
         ▼                                         ▼
┌─────────────────────┐               ┌─────────────────────┐
│  dataLayer.push     │               │  sessionStorage     │
│  'consent_default'  │               │  'jy_consent_state' │
└────────┬────────────┘               └─────────────────────┘
         │                                         │
         │                                         │
         ▼                                         ▼
┌─────────────────────┐               ┌─────────────────────┐
│  GTM reads consent  │               │  Checkout Pixel     │
│  state on each tag  │               │  reads on init      │
└─────────────────────┘               └─────────────────────┘
         │
         │ (User interacts with banner)
         ▼
┌─────────────────────────────────────────┐
│  visitorConsentCollected event fires    │
│                                          │
│  1. Re-query Shopify Privacy API        │
│  2. Map updated consent state           │
│  3. Push consent_updated to dataLayer   │
│  4. Update sessionStorage               │
└─────────────────────────────────────────┘
```

### 2. Storefront Event Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER ACTION                                  │
│  (View product, Add to cart, Search, etc.)                          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                gold-storefront-datalayer-ga4.liquid                  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │                    DATA COLLECTION                          │     │
│  │                                                             │     │
│  │  user_data:                    page_data:                   │     │
│  │  ├─ email_sha256               ├─ page_type                 │     │
│  │  ├─ phone_sha256               ├─ page_path                 │     │
│  │  ├─ user_id                    ├─ page_title                │     │
│  │  ├─ customer_type              ├─ currency                  │     │
│  │  ├─ orders_count               └─ language                  │     │
│  │  ├─ lifetime_value                                          │     │
│  │  └─ rfm_metrics                ecommerce:                   │     │
│  │                                ├─ items[]                   │     │
│  │  list_attribution:             │  ├─ item_id                │     │
│  │  ├─ item_list_name             │  ├─ item_name              │     │
│  │  └─ item_list_id               │  ├─ item_category          │     │
│  │                                │  ├─ price                  │     │
│  │                                │  └─ quantity               │     │
│  │                                └─ value                     │     │
│  └────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         dataLayer.push()                             │
│                                                                      │
│  {                                                                   │
│    event: 'view_item',                                               │
│    ecommerce: { items: [...], value: 99.99, currency: 'USD' },      │
│    user_logged_in: true,                                             │
│    customer_type: 'returning',                                       │
│    page_type: 'product'                                              │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Google Tag Manager (Client)                       │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │ Consent     │  │ Tag         │  │ Variable    │                  │
│  │ Check       │──│ Firing      │──│ Resolution  │                  │
│  │ (granted?)  │  │ Sequence    │  │             │                  │
│  └─────────────┘  └─────────────┘  └─────────────┘                  │
│                                                                      │
│  If consent granted:                                                 │
│  ├─ GA4 Event Tag fires                                              │
│  ├─ Google Ads Remarketing fires                                     │
│  ├─ Meta Pixel fires                                                 │
│  └─ Server-side endpoint receives data                               │
└─────────────────────────────────────────────────────────────────────┘
```

### 3. Checkout Event Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CHECKOUT STARTS                                   │
│  (User clicks checkout button)                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│              SHOPIFY REDIRECTS TO CHECKOUT                           │
│              (Sandboxed iframe environment)                          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 gold-checkout-pixel-ga4.js                           │
│                                                                      │
│  INITIALIZATION:                                                     │
│  1. Load GTM container into iframe                                   │
│  2. Read consent from sessionStorage (jy_consent_state)              │
│  3. Push consent_default event                                       │
│  4. Read list_attribution from sessionStorage                        │
│  5. Subscribe to Shopify checkout events                             │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CHECKOUT EVENT SEQUENCE                           │
│                                                                      │
│  ┌──────────────────┐                                               │
│  │ checkout_started │ ──► begin_checkout (with items, value)         │
│  └────────┬─────────┘                                               │
│           │                                                          │
│           ▼                                                          │
│  ┌──────────────────────────────┐                                   │
│  │ checkout_contact_info_       │                                   │
│  │ submitted                    │ ──► add_contact_info               │
│  └────────┬─────────────────────┘                                   │
│           │                                                          │
│           ▼                                                          │
│  ┌──────────────────────────────┐                                   │
│  │ checkout_address_info_       │                                   │
│  │ submitted                    │ ──► add_shipping_info (partial)    │
│  └────────┬─────────────────────┘                                   │
│           │                                                          │
│           ▼                                                          │
│  ┌──────────────────────────────┐                                   │
│  │ checkout_shipping_info_      │                                   │
│  │ submitted                    │ ──► add_shipping_info (complete)   │
│  └────────┬─────────────────────┘                                   │
│           │                                                          │
│           ▼                                                          │
│  ┌──────────────────────────────┐                                   │
│  │ payment_info_submitted       │ ──► add_payment_info               │
│  └────────┬─────────────────────┘                                   │
│           │                                                          │
│           ▼                                                          │
│  ┌──────────────────────────────┐                                   │
│  │ checkout_completed           │ ──► purchase (full ecommerce)      │
│  └──────────────────────────────┘                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Relationships

### Package Dependency Matrix

| Package | Depends On | Provides To |
|---------|------------|-------------|
| `consent-mode-api.liquid` | Shopify Privacy API | All tracking packages |
| `storefront-datalayer.liquid` | consent-mode-api, GTM | GTM, checkout-pixel (via sessionStorage) |
| `checkout-pixel-ga4.js` | consent state (sessionStorage), GTM | GTM |
| `cookie-preferences-link.liquid` | Shopify Privacy API | User (modal trigger) |
| `gtm-container-ga4.json` | dataLayer events | GA4, Google Ads, Meta |
| `consent-mode-container.json` | consent events | GTM consent initialization |

### Execution Order

```
PAGE LOAD SEQUENCE:
──────────────────────────────────────────────────────────

1. Shopify loads theme.liquid
   │
2. ├── shopify-privacy-consent-mode-api.liquid executes
   │   ├── Sets gtag consent defaults (denied)
   │   ├── Queries Shopify Privacy API
   │   ├── Pushes consent_default to dataLayer
   │   └── Saves to sessionStorage
   │
3. ├── gold-storefront-datalayer-ga4.liquid executes
   │   ├── Collects user_data (from Liquid)
   │   ├── Collects page_data (from Liquid)
   │   ├── Pushes user_data_ready
   │   ├── Pushes page_data_ready
   │   └── Pushes page-specific event (view_item, etc.)
   │
4. └── GTM loads and processes dataLayer
       ├── Reads consent state
       ├── Fires appropriate tags based on consent
       └── Sends data to GA4/Ads/Meta

CHECKOUT SEQUENCE:
──────────────────────────────────────────────────────────

1. User clicks checkout
   │
2. Shopify loads checkout (sandboxed iframe)
   │
3. └── gold-checkout-pixel-ga4.js executes (Custom Pixel)
       ├── Reads consent from sessionStorage
       ├── Loads GTM in iframe
       ├── Pushes consent_default
       ├── Subscribes to Shopify checkout events
       │
       └── For each checkout step:
           ├── Receives event from Shopify
           ├── Transforms to GA4 format
           ├── Adds user_data, ecommerce data
           └── Pushes to dataLayer (GTM processes)
```

---

## Separation of Concerns

### By Layer

| Layer | Responsibility | Files |
|-------|---------------|-------|
| **Consent** | Privacy signal management | `consent-mode-api.liquid`, `consent-mode-container.json` |
| **Collection** | Event capture and formatting | `storefront-datalayer.liquid`, `checkout-pixel-ga4.js` |
| **Orchestration** | Tag firing and routing | `gtm-container-ga4.json` |
| **Delivery** | Data transmission | GTM (client + server) |
| **User Experience** | Consent UI management | `cookie-preferences-link.liquid` |

### By Environment

| Environment | Access Level | Tracking Method |
|-------------|--------------|-----------------|
| Storefront (Main Window) | Full DOM, cookies, localStorage | Direct GTM load |
| Checkout (Sandboxed Iframe) | Limited - no parent access | Custom Pixel + GTM in iframe |
| Thank You Page | Sandboxed like checkout | Checkout pixel continues |
| Server-Side | Full data access | Server GTM container |

---

## Data Storage Strategy

### sessionStorage Keys

| Key | Purpose | Set By | Read By |
|-----|---------|--------|---------|
| `jy_consent_state` | Consent state for checkout | consent-mode-api.liquid | checkout-pixel-ga4.js |
| `jy_customer_logged_in` | Login state | storefront-datalayer.liquid | checkout-pixel-ga4.js |
| `jy_list_attribution` | Product list context | storefront-datalayer.liquid | checkout-pixel-ga4.js |

### Why sessionStorage?

1. **Cross-frame communication**: Checkout iframe cannot access parent window but shares sessionStorage with same origin
2. **Session-scoped**: Data persists across page navigation but clears on tab close
3. **No consent needed**: sessionStorage is functionally necessary, not tracking

---

## Shopify Plan Considerations

### All Plans (Basic, Shopify, Advanced, Plus)

| Feature | Support |
|---------|---------|
| Storefront tracking | ✅ Full support |
| Consent mode integration | ✅ Full support |
| GTM client-side | ✅ Full support |
| Cookie preferences link | ✅ Full support |

### Plus-Specific Features

| Feature | Non-Plus | Plus |
|---------|----------|------|
| Checkout extensibility | Limited | Full |
| Custom Pixel placement | Manual | Admin UI |
| Checkout UI customization | ❌ | ✅ |
| Script Editor | ❌ | ✅ |

### Implementation Differences

**Non-Plus Stores:**
- Checkout pixel must be added via Shopify Admin > Settings > Customer Events
- Limited to standard checkout flow
- Cannot customize checkout UI elements

**Plus Stores:**
- Full checkout extensibility
- Can add pixel via checkout.liquid (if using legacy)
- Checkout UI blocks for enhanced tracking points
- Script Editor for additional customization

---

## GTM Deployment Model

### Recommended Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    GTM Account Structure                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     ACCOUNT                              │    │
│  │                 (Client's GTM Account)                   │    │
│  │                                                          │    │
│  │  ┌─────────────────────┐  ┌─────────────────────┐       │    │
│  │  │  WEB CONTAINER      │  │  SERVER CONTAINER   │       │    │
│  │  │  GTM-XXXXXXXX       │  │  GTM-YYYYYYYY       │       │    │
│  │  │                     │  │                     │       │    │
│  │  │  Contains:          │  │  Contains:          │       │    │
│  │  │  ├─ GA4 Config      │  │  ├─ GA4 Client      │       │    │
│  │  │  ├─ GA4 Events      │  │  ├─ GA4 Server Tag  │       │    │
│  │  │  ├─ Consent Mode    │  │  ├─ Enhanced Conv.  │       │    │
│  │  │  ├─ Google Ads      │  │  ├─ Facebook CAPI   │       │    │
│  │  │  └─ Meta Pixel      │  │  └─ Data Transform  │       │    │
│  │  │                     │  │                     │       │    │
│  │  │  Environments:      │  │  Deployed to:       │       │    │
│  │  │  ├─ Development     │  │  Google Cloud Run   │       │    │
│  │  │  ├─ Staging         │  │  (Auto-scaling)     │       │    │
│  │  │  └─ Production      │  │                     │       │    │
│  │  └─────────────────────┘  └─────────────────────┘       │    │
│  │                                                          │    │
│  └──────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Container Import Strategy

1. **Import consent-mode-container.json** first
   - Sets up consent variables and triggers
   - Foundation for all other tags

2. **Import gold-gtm-container-ga4.json** second
   - Contains all tracking tags
   - References consent variables from step 1

3. **Configure server container** (optional but recommended)
   - Follow SERVER-SIDE-GA4-GUIDE.md
   - Follow SERVER-SIDE-FACEBOOK-CAPI-GUIDE.md

---

## Security Considerations

### Data Handling

| Data Type | Treatment | Storage |
|-----------|-----------|---------|
| Email | SHA256 hashed before sending | Never stored raw |
| Phone | SHA256 hashed before sending | Never stored raw |
| Address | Sent for Enhanced Conversions | Not persisted |
| Order Value | Sent in clear | Not persisted |
| Product Data | Sent in clear | Not persisted |

### Cross-Origin Security

- Checkout pixel runs in sandboxed iframe (same-origin policy)
- sessionStorage access is same-origin only
- GTM loads from googletagmanager.com (trusted)
- Server-side GTM uses HTTPS only

### Consent Enforcement

- All tags check consent state before firing
- Default state is always "denied"
- No tracking occurs until explicit consent
- GPC signals automatically honored

---

## Performance Considerations

### Script Loading

| Script | Load Method | Size (est.) |
|--------|-------------|-------------|
| Consent Mode API | Inline in theme | ~3KB |
| Storefront DataLayer | Inline in theme | ~8KB |
| GTM Container | Async script | ~50KB |
| Checkout Pixel | Custom Pixel (sandboxed) | ~5KB |

### Optimization Features

1. **Efficient Polling**: Consent polling at 2000ms (not 500ms) to reduce CPU
2. **Event Debouncing**: Cart drawer tracking debounced
3. **Lazy Loading**: GTM loads async, non-blocking
4. **Minimal DOM Queries**: MutationObserver for cart changes vs. polling

---

## Related Documents

- [Quick Start Guide](./QUICK-START-GUIDE.md) - Implementation steps
- [Event Reference](./EVENT-REFERENCE.md) - Complete event documentation
- [Consent Mode Reference](./CONSENT-MODE-REFERENCE.md) - Consent implementation details
- [GTM Import Guide](./GTM-IMPORT-GUIDE.md) - Container setup instructions
