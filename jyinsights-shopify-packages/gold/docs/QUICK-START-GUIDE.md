# Quick Start Guide

**Estimated Time:** 30-45 minutes | **Difficulty:** Intermediate

This guide walks you through the minimal steps to deploy a fully compliant GA4 implementation on Shopify using the JY Insights Gold package.

---

## Prerequisites

Before starting, ensure you have:

### Accounts & Access
- [ ] Shopify Admin access (store owner or staff with "Edit code" permission)
- [ ] Google Tag Manager account with container created
- [ ] Google Analytics 4 property created
- [ ] Theme code editing access

### Technical Requirements
- [ ] Shopify 2.0 theme (Dawn-compatible)
- [ ] Checkout Extensibility enabled (for checkout pixel)
- [ ] Custom Pixel access in Shopify Admin

### Information Needed
- [ ] GTM Container ID (format: `GTM-XXXXXXXX`)
- [ ] GA4 Measurement ID (format: `G-XXXXXXXXXX`)

---

## Installation Order

**Critical**: Follow this exact order to ensure proper initialization.

```
1. Shopify Privacy Settings    ─┐
2. Consent Mode API (Liquid)    │ Foundation
3. Cookie Preferences Link      ─┘
4. GTM Container Import         ─┐
5. GTM Consent Mode Import       │ GTM Setup
6. GTM Container ID Config      ─┘
7. Storefront DataLayer         ─┐
8. Checkout Pixel                │ Tracking
9. Testing & Validation         ─┘
```

---

## Step 1: Configure Shopify Privacy Settings

**Location:** Shopify Admin → Settings → Customer Privacy

### Required Settings

| Setting | Value |
|---------|-------|
| Collect data before consent | **Disabled** |
| Show consent banner | **All visitors** or **Only in selected regions** |
| Analytics | **Enabled** |
| Marketing | **Enabled** |
| Preferences | **Enabled** (optional) |
| Sale of data | **Enabled** (if selling to US) |

### Banner Configuration

1. Customize banner text to clearly explain data collection
2. Enable "Accept All" and "Decline All" buttons
3. Enable "Manage Preferences" option
4. Link to your Privacy Policy

> **Note**: See [SHOPIFY-PRIVACY-SETTINGS-CHECKLIST.md](../SHOPIFY-PRIVACY-SETTINGS-CHECKLIST.md) for detailed configuration.

---

## Step 2: Install Consent Mode API

**Location:** Shopify Admin → Online Store → Themes → Edit Code → `theme.liquid`

### Installation

1. Open `theme.liquid`
2. Find the opening `<head>` tag
3. Add the consent mode script **immediately after** `<head>`:

```liquid
<head>
  <!-- JY Insights Consent Mode v2.1 - MUST BE FIRST -->
  {% render 'shopify-privacy-consent-mode-api' %}

  <!-- Rest of your head content -->
```

4. Create new snippet: `snippets/shopify-privacy-consent-mode-api.liquid`
5. Copy contents of `shopify-privacy-consent-mode-api.liquid` into the new snippet
6. Save

### Configuration

Update the configuration object at the top of the file:

```javascript
const CONFIG = {
  debug: false,  // Set to false for production
  version: '2.1',
  saleOfDataFollowsMarketing: true,  // CCPA behavior
  // ... rest of config
};
```

---

## Step 3: Install Cookie Preferences Link

**Location:** Same theme code editor

### Installation

1. Create new snippet: `snippets/shopify-cookie-preferences-link.liquid`
2. Copy contents of `shopify-cookie-preferences-link.liquid`
3. Add to `theme.liquid` before `</body>`:

```liquid
  {% render 'shopify-cookie-preferences-link' %}
</body>
```

4. Add footer link in your theme's footer section:

```html
<a href="#cookie-preferences">Cookie Preferences</a>
```

---

## Step 4: Import GTM Containers

**Location:** Google Tag Manager → Admin → Import Container

### Import Consent Mode Container First

1. Open GTM
2. Go to Admin → Import Container
3. Select `consent-mode-container.json`
4. Choose workspace: **New** (name: "Consent Mode Import")
5. Import option: **Merge** → **Rename conflicting tags**
6. Click **Confirm**

### Import Main GTM Container Second

1. Go to Admin → Import Container
2. Select `gold-gtm-container-ga4.json`
3. Choose workspace: **Existing** (select the workspace from step above)
4. Import option: **Merge** → **Rename conflicting tags**
5. Click **Confirm**

---

## Step 5: Configure GTM Variables

**Location:** GTM → Variables → User-Defined Variables

### Required Configuration

Find and update these variables:

| Variable Name | Update To |
|---------------|-----------|
| GA4 Measurement ID | Your `G-XXXXXXXXXX` |
| Google Ads Conversion ID | Your conversion ID (if using) |
| Facebook Pixel ID | Your pixel ID (if using) |

### Verify Consent Variables

Ensure these variables exist (from consent container import):

- `DLV - analytics_storage`
- `DLV - ad_storage`
- `DLV - ad_user_data`
- `DLV - ad_personalization`

---

## Step 6: Install Storefront DataLayer

**Location:** Shopify theme code editor

### Installation

1. Create snippet: `snippets/gold-storefront-datalayer-ga4.liquid`
2. Copy contents of `gold-storefront-datalayer-ga4.liquid`
3. Add to `theme.liquid` after consent mode script:

```liquid
<head>
  {% render 'shopify-privacy-consent-mode-api' %}
  {% render 'gold-storefront-datalayer-ga4' %}

  <!-- GTM script goes here -->
```

### Configuration

Update the GTM Container ID:

```javascript
const CONFIG = {
  gtmContainerId: 'GTM-XXXXXXXX',  // Your container ID
  debug: false,  // Set to false for production
  // ...
};
```

---

## Step 7: Add GTM Snippet

**Location:** `theme.liquid`

### Head Script (after dataLayer)

```liquid
<head>
  {% render 'shopify-privacy-consent-mode-api' %}
  {% render 'gold-storefront-datalayer-ga4' %}

  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-XXXXXXXX');</script>
  <!-- End Google Tag Manager -->
```

### Body Script (after opening body tag)

```liquid
<body>
  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXXX"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->
```

---

## Step 8: Install Checkout Pixel

**Location:** Shopify Admin → Settings → Customer Events

### Installation

1. Go to **Settings** → **Customer events**
2. Click **Add custom pixel**
3. Name: `GA4 Checkout Tracking`
4. Paste contents of `gold-checkout-pixel-ga4.js`
5. **Data sale**: Select based on your preference
6. Click **Save**
7. Click **Connect** to activate

### Configuration

Update at the top of the pixel code:

```javascript
const CONFIG = {
  gtmContainerId: 'GTM-XXXXXXXX',  // Same as storefront
  googleFeedRegion: 'US',  // Or your primary market
  debug: false,  // Set to false for production
  // ...
};
```

---

## Step 9: Publish GTM Container

**Location:** Google Tag Manager

1. Click **Submit** in the top right
2. Add version name: `Gold Package v1.0 - Initial Deployment`
3. Add description: `Initial deployment of JY Insights Gold package`
4. Click **Publish**

---

## Step 10: Testing & Validation

### GTM Preview Mode

1. In GTM, click **Preview**
2. Enter your store URL
3. Navigate through:
   - Homepage
   - Collection page
   - Product page
   - Add to cart
   - Checkout (if possible)

### Verify Events in Preview

| Page | Expected Events |
|------|-----------------|
| Any page | `consent_default`, `user_data_ready`, `page_view` |
| Collection | `view_item_list` |
| Product | `view_item` |
| Add to cart | `add_to_cart` |
| Cart page | `view_cart` |
| Checkout | `begin_checkout`, `add_shipping_info`, `add_payment_info` |
| Thank you | `purchase` |

### GA4 DebugView

1. Open GA4 → Configure → DebugView
2. Navigate your store
3. Verify events appear in real-time

### Consent Testing

1. Clear cookies/use incognito
2. Load store - verify banner appears
3. Check GTM Preview - verify `consent_default` shows denied
4. Accept cookies
5. Check GTM Preview - verify `consent_updated` shows granted

---

## Common Mistakes to Avoid

### ❌ Wrong Script Order

**Problem:** GTM loads before consent mode script
**Solution:** Always load consent mode API first in `<head>`

```liquid
<!-- CORRECT ORDER -->
{% render 'shopify-privacy-consent-mode-api' %}  <!-- 1st -->
{% render 'gold-storefront-datalayer-ga4' %}      <!-- 2nd -->
<!-- GTM script -->                               <!-- 3rd -->
```

### ❌ Mismatched Container IDs

**Problem:** Different GTM IDs in storefront vs checkout pixel
**Solution:** Use the same `GTM-XXXXXXXX` in all locations

### ❌ Checkout Pixel Not Connected

**Problem:** Pixel created but showing "Disconnected"
**Solution:** Click **Connect** button after saving pixel

### ❌ Debug Mode Left On

**Problem:** Console floods with debug messages in production
**Solution:** Set `debug: false` in all CONFIG objects before launch

### ❌ Consent Banner Not Showing

**Problem:** No banner appears to visitors
**Solution:** Check Shopify Admin → Settings → Customer Privacy settings

### ❌ Events Not Firing

**Problem:** No events in GTM Preview
**Check:**
1. Console for JavaScript errors
2. dataLayer in console: `console.log(window.dataLayer)`
3. Network tab for GTM requests

### ❌ Enhanced Conversions Not Matching

**Problem:** Low match rate in Google Ads
**Solution:** Verify user_data includes properly hashed email/phone

### ❌ Duplicate Events

**Problem:** Same event firing multiple times
**Solution:** Check for multiple GTM installations or duplicate scripts

### ❌ Checkout Events Missing

**Problem:** No checkout funnel events
**Check:**
1. Pixel is connected in Shopify Admin
2. Pixel has correct GTM Container ID
3. sessionStorage has consent state

### ❌ Server-Side GTM Not Receiving

**Problem:** Events not reaching server container
**Solution:** Configure transport_url in GA4 config tag

---

## Post-Installation Checklist

- [ ] All scripts installed in correct order
- [ ] GTM containers imported and configured
- [ ] GTM published to production
- [ ] Consent banner displays correctly
- [ ] Debug mode disabled in all scripts
- [ ] Test purchase completed successfully
- [ ] GA4 receiving all events
- [ ] Enhanced Conversions configured (if using Google Ads)

---

## Next Steps

1. **Configure Server-Side GTM** - See [SERVER-SIDE-GA4-GUIDE.md](../SERVER-SIDE-GA4-GUIDE.md)
2. **Set Up Facebook CAPI** - See [SERVER-SIDE-FACEBOOK-CAPI-GUIDE.md](../SERVER-SIDE-FACEBOOK-CAPI-GUIDE.md)
3. **Review Event Reference** - See [EVENT-REFERENCE.md](./EVENT-REFERENCE.md)
4. **Understand Consent Flow** - See [CONSENT-MODE-REFERENCE.md](./CONSENT-MODE-REFERENCE.md)

---

## Support

If you encounter issues:

1. Check [Troubleshooting Guide](./TROUBLESHOOTING-GUIDE.md)
2. Verify against this checklist
3. Review console for errors
4. Check GTM Preview mode for event flow
