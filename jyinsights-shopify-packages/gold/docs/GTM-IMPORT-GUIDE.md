# GTM Import Guide

**Version:** 1.2 | **Last Updated:** January 2026

Step-by-step instructions for importing the pre-configured GTM containers included in the JY Insights Gold package.

---

## Overview

The package includes two GTM container JSON files:

| Container | Purpose | Import Order |
|-----------|---------|--------------|
| `consent-mode-container.json` | Consent Mode v2 variables & triggers | **First** |
| `gold-gtm-container-ga4.json` | GA4 tags, Google Ads, Meta Pixel | **Second** |

**Important:** Import the consent container first to establish the consent framework before adding tracking tags.

---

## Prerequisites

Before importing:

- [ ] GTM account exists
- [ ] Web container created (or will create during import)
- [ ] Admin or Publish access to the container
- [ ] Container JSON files downloaded from package

---

## Environment Setup

### Recommended Container Structure

```
GTM ACCOUNT
├── Container: "Store Name - Web" (GTM-XXXXXXXX)
│   ├── Workspace: Default Workspace
│   ├── Environment: Development
│   ├── Environment: Staging (optional)
│   └── Environment: Production (Live)
│
└── Container: "Store Name - Server" (GTM-YYYYYYYY) [Optional]
    └── Deployed to Google Cloud
```

### Development vs Production

| Environment | Use For | Publish Status |
|-------------|---------|----------------|
| Development | Testing changes | Never published |
| Staging | QA validation | Published to staging snippet |
| Production | Live site | Published to live snippet |

---

## Step 1: Import Consent Mode Container

### 1.1 Access Import

1. Log into [Google Tag Manager](https://tagmanager.google.com/)
2. Select your account and web container
3. Click **Admin** (gear icon) in the top menu
4. Under "Container" section, click **Import Container**

### 1.2 Import Settings

| Setting | Value |
|---------|-------|
| **Import file** | `consent-mode-container.json` |
| **Workspace** | Choose existing or create new |
| **Import option** | **Merge** (recommended) |
| **Conflict resolution** | **Rename conflicting tags, triggers, and variables** |

### 1.3 Click Confirm

Review the import summary:
- **Variables added:** 12
- **Triggers added:** 6
- **Tags added:** 0 (consent container has no tags)

### 1.4 Verify Import

After import, check:

**Variables (12 total):**
- [ ] DLV - consent_state
- [ ] DLV - analytics_consent
- [ ] DLV - marketing_consent
- [ ] DLV - preferences_consent
- [ ] DLV - sale_of_data_consent
- [ ] DLV - consent_source
- [ ] DLV - analytics_storage
- [ ] DLV - ad_storage
- [ ] DLV - ad_user_data
- [ ] DLV - ad_personalization
- [ ] DLV - microsoft_analytics_consent
- [ ] DLV - microsoft_advertising_consent

**Triggers (6 total):**
- [ ] CE - consent_default
- [ ] CE - consent_updated
- [ ] CE - consent_updated - Analytics Granted
- [ ] CE - consent_updated - Marketing Granted
- [ ] CE - microsoft_consent_updated
- [ ] CE - consent_gpc_detected

---

## Step 2: Import Main GTM Container

### 2.1 Access Import Again

1. Stay in the same container
2. Go to **Admin** → **Import Container**

### 2.2 Import Settings

| Setting | Value |
|---------|-------|
| **Import file** | `gold-gtm-container-ga4.json` |
| **Workspace** | Same workspace as consent import |
| **Import option** | **Merge** |
| **Conflict resolution** | **Rename conflicting tags, triggers, and variables** |

### 2.3 Click Confirm

Review the import summary:
- **Variables added:** 50+ (ecommerce, user data, product data)
- **Triggers added:** 10+ (page view, ecommerce events)
- **Tags added:** 14+ (GA4, Google Ads, Meta Pixel)

### 2.4 Verify Import

After import, verify key components:

**GA4 Tags:**
- [ ] GA4 - Configuration
- [ ] GA4 - Page View
- [ ] GA4 - view_item
- [ ] GA4 - view_item_list
- [ ] GA4 - add_to_cart
- [ ] GA4 - remove_from_cart
- [ ] GA4 - view_cart
- [ ] GA4 - begin_checkout
- [ ] GA4 - add_shipping_info
- [ ] GA4 - add_payment_info
- [ ] GA4 - purchase

**Google Ads Tags (if included):**
- [ ] Google Ads - Remarketing
- [ ] Google Ads - Conversion (Purchase)

**Meta Pixel Tags (if included):**
- [ ] Meta Pixel - Base Code
- [ ] Meta Pixel - ViewContent
- [ ] Meta Pixel - AddToCart
- [ ] Meta Pixel - Purchase

---

## Step 3: Configure Required Variables

After import, you must update these variables with your actual IDs:

### 3.1 GA4 Measurement ID

1. Go to **Variables** → **User-Defined Variables**
2. Find **GA4 Measurement ID** (or similar name)
3. Click to edit
4. Update value to your `G-XXXXXXXXXX`
5. Save

### 3.2 Google Ads Conversion ID (if using)

1. Find **Google Ads Conversion ID**
2. Update to your conversion ID
3. Find **Google Ads Conversion Label**
4. Update to your conversion label
5. Save both

### 3.3 Facebook Pixel ID (if using)

1. Find **Facebook Pixel ID**
2. Update to your pixel ID
3. Save

### 3.4 Variable Configuration Summary

| Variable | Where to Find Value |
|----------|---------------------|
| GA4 Measurement ID | GA4 Admin → Data Streams → Measurement ID |
| Google Ads Conversion ID | Google Ads → Tools → Conversions → Tag setup |
| Google Ads Conversion Label | Same as above |
| Facebook Pixel ID | Facebook Events Manager → Data Sources → Pixel |

---

## Step 4: Configure Consent Settings on Tags

Verify each tag has proper consent configuration:

### 4.1 GA4 Tags

1. Open each GA4 tag
2. Scroll to **Consent Settings**
3. Verify:
   - Built-in consent checks: Enabled
   - Additional consent: `analytics_storage`

### 4.2 Google Ads Tags

1. Open each Google Ads tag
2. Scroll to **Consent Settings**
3. Verify:
   - Built-in consent checks: Enabled
   - Additional consent: `ad_storage`

### 4.3 Meta Pixel Tags

1. Open each Meta Pixel tag
2. Scroll to **Consent Settings**
3. Verify:
   - Additional consent: `ad_storage`

---

## Step 5: Test in Preview Mode

### 5.1 Enter Preview Mode

1. Click **Preview** in GTM (top right)
2. Enter your store URL
3. Click **Connect**
4. Your store opens in a new tab with Tag Assistant

### 5.2 Test Consent Flow

**Test 1: Default Consent (No Action)**
1. Load store in incognito mode
2. Do NOT interact with consent banner
3. In Tag Assistant, check:
   - [ ] `consent_default` event fired
   - [ ] Consent state shows all "denied"
   - [ ] GA4 Configuration tag shows "Fired" with cookieless mode

**Test 2: Accept Consent**
1. Click "Accept All" on consent banner
2. In Tag Assistant, check:
   - [ ] `consent_updated` event fired
   - [ ] Consent state shows "granted"
   - [ ] All GA4/Ads tags now firing normally

**Test 3: Decline Consent**
1. Clear data, reload
2. Click "Decline All"
3. In Tag Assistant, check:
   - [ ] `consent_updated` event fired
   - [ ] Consent state shows "denied"
   - [ ] Ads tags NOT firing

### 5.3 Test Ecommerce Events

Navigate through your store and verify events:

| Page | Expected Event | Verification |
|------|---------------|--------------|
| Collection | `view_item_list` | Items array populated |
| Product | `view_item` | Product data correct |
| Add to Cart | `add_to_cart` | Value and items correct |
| Cart | `view_cart` | All items listed |
| Checkout | `begin_checkout` | Value correct |
| Thank You | `purchase` | transaction_id present |

### 5.4 Test Variables

In Tag Assistant, click on any event and check "Variables" tab:

| Variable | Expected Value |
|----------|----------------|
| DLV - analytics_storage | `granted` or `denied` |
| DLV - ad_storage | `granted` or `denied` |
| Ecommerce Items | Array of product objects |
| Transaction ID | Order ID (on purchase) |

---

## Step 6: Version and Publish

### 6.1 Create Version

1. Click **Submit** (top right)
2. Add version name: `Gold Package v1.0`
3. Add description:
   ```
   JY Insights Gold Package initial import:
   - Consent Mode v2 integration
   - GA4 enhanced ecommerce
   - Google Ads conversion tracking
   - Meta Pixel integration
   ```

### 6.2 Publish to Environment

| Scenario | Action |
|----------|--------|
| Testing only | Don't publish yet |
| Ready for staging | Publish to staging environment |
| Ready for production | Publish to live environment |

### 6.3 Publishing Best Practices

1. **Never publish untested changes to live**
2. **Use environments** for staging if available
3. **Document changes** in version descriptions
4. **Test after publish** to verify everything works

---

## Post-Import Validation

### GA4 Real-Time Verification

1. Open GA4 → Reports → Real-time
2. Navigate your store
3. Verify events appear:
   - [ ] page_view
   - [ ] view_item
   - [ ] add_to_cart
   - [ ] purchase (test order)

### GA4 DebugView Verification

1. Open GA4 → Configure → DebugView
2. Enable debug mode (GTM Preview does this automatically)
3. Navigate your store
4. Verify:
   - [ ] Events show correct parameters
   - [ ] User properties are set
   - [ ] Ecommerce data is complete

### Enhanced Conversions Verification

1. Make a test purchase
2. In GA4, check the purchase event
3. Verify `user_data` parameters are present
4. In Google Ads, check Enhanced Conversions status

---

## Versioning Best Practices

### Naming Convention

```
Format: [Package] v[Version] - [Description]

Examples:
- Gold Package v1.0 - Initial import
- Gold Package v1.1 - Added custom dimension
- Gold Package v1.2 - Fixed checkout event
```

### Version Control Strategy

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Bug fix | Patch (1.0.x) | 1.0.1 |
| New feature | Minor (1.x.0) | 1.1.0 |
| Breaking change | Major (x.0.0) | 2.0.0 |

### Rollback Procedure

If issues occur after publishing:

1. Go to **Admin** → **Container** → **Versions**
2. Find the last working version
3. Click the three dots → **Publish**
4. Confirm publish to restore previous version

---

## Troubleshooting Import Issues

### Import Fails

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid JSON" | Corrupted file | Re-download from package |
| "Permission denied" | Insufficient access | Request Admin access |
| "Conflict detected" | Existing items with same names | Use "Rename" option |

### Tags Not Firing

| Issue | Check | Solution |
|-------|-------|----------|
| No events | dataLayer | Verify storefront script installed |
| Tags blocked | Consent | Check consent state in Preview |
| Wrong trigger | Trigger config | Verify event name matches |

### Variables Empty

| Issue | Check | Solution |
|-------|-------|----------|
| Undefined values | Data layer | Check storefront script is pushing data |
| Wrong format | Variable type | Ensure using Data Layer Variable type |

---

## Container Maintenance

### Regular Tasks

| Frequency | Task |
|-----------|------|
| Weekly | Check for GTM updates |
| Monthly | Review tag performance |
| Quarterly | Audit for unused tags |
| Annually | Full container review |

### Updating the Package

When new package versions are released:

1. **Backup current container** (Admin → Export)
2. **Review release notes** for changes
3. **Import in new workspace** for testing
4. **Test thoroughly** in Preview mode
5. **Merge to main workspace** when validated
6. **Publish new version**

---

## Related Documents

- [Quick Start Guide](./QUICK-START-GUIDE.md) - Full installation steps
- [Consent Mode Reference](./CONSENT-MODE-REFERENCE.md) - Consent configuration
- [Event Reference](./EVENT-REFERENCE.md) - Complete event documentation
- [Troubleshooting Guide](./TROUBLESHOOTING-GUIDE.md) - Common issues
