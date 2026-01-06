# GTM Container Import Guide

## Quick Import Steps

### 1. Open Google Tag Manager
- Go to [tagmanager.google.com](https://tagmanager.google.com)
- Select your container (or create a new one)

### 2. Import the Container File

1. Click **Admin** (bottom left)
2. Under "Container" column, click **Import Container**
3. Click **Choose container file**
4. Select `gold-gtm-container-ga4.json` from your computer
5. Choose workspace:
   - **New** (Recommended): Creates a fresh workspace named "JY Gold Plus v1.1"
   - **Existing**: Select an existing workspace to merge into
6. Import option:
   - **Merge**: Adds new items, keeps existing (Recommended)
   - **Overwrite**: Replaces everything (Use with caution!)
7. Click **Confirm**

### 3. Update GA4 Measurement ID

After import, you need to add your GA4 Measurement ID:

1. Go to **Variables** in GTM
2. Click on `Const - GA4 Measurement ID`
3. Change value from `G-XXXXXXXXXX` to your actual GA4 ID (e.g., `G-ABC123DEF`)
4. Click **Save**

### 4. Review & Publish

1. Click **Preview** to test in preview mode
2. Visit your Shopify store to verify events fire
3. When satisfied, click **Submit** (top right)
4. Add version name: `JY Gold Plus GA4 v1.1 - Initial Setup`
5. Add description (optional): `Complete GA4 ecommerce tracking with enhanced user data`
6. Click **Publish**

---

## What Gets Imported

### Tags (13 total)
- ✅ GA4 Configuration Tag (loads GA4, sets user properties)
- ✅ page_view
- ✅ view_item_list
- ✅ view_item
- ✅ select_item
- ✅ add_to_cart
- ✅ remove_from_cart
- ✅ view_cart
- ✅ begin_checkout
- ✅ add_shipping_info
- ✅ add_payment_info
- ✅ purchase
- ✅ search

### Triggers (12 total)
All custom event triggers matching the GA4 event names:
- CE - page_view
- CE - view_item_list
- CE - view_item
- CE - select_item
- CE - add_to_cart
- CE - remove_from_cart
- CE - view_cart
- CE - begin_checkout
- CE - add_shipping_info
- CE - add_payment_info
- CE - purchase
- CE - search

### Variables (23 total)

**Constant:**
- Const - GA4 Measurement ID (YOU MUST UPDATE THIS!)

**Data Layer Variables (Ecommerce):**
- DLV - ecommerce.items
- DLV - ecommerce.transaction_id
- DLV - ecommerce.value
- DLV - ecommerce.currency
- DLV - ecommerce.shipping
- DLV - ecommerce.tax
- DLV - ecommerce.coupon
- DLV - ecommerce.item_list_name
- DLV - ecommerce.item_list_id
- DLV - ecommerce.shipping_tier
- DLV - ecommerce.payment_type
- DLV - ecommerce.affiliation

**Data Layer Variables (User Data):**
- DLV - user_data.email_sha256
- DLV - user_data.phone_sha256
- DLV - user_data.logged_in
- DLV - user_data.customer_type
- DLV - user_data.orders_count

**Data Layer Variables (Page Data):**
- DLV - page_data.page_type
- DLV - page_data.page_title

**Event-Level Variables:**
- Event - search_term
- Event - cart_type
- Event - context

**Built-in Variables (Auto-enabled):**
- Page URL
- Page Hostname
- Page Path
- Referrer
- Event

---

## Verification Checklist

After importing and publishing:

### In GTM Preview Mode:
- [ ] All 13 tags appear in the container
- [ ] GA4 Configuration tag has your Measurement ID
- [ ] User properties are set (customer_logged_in, customer_type, orders_count)
- [ ] All custom event triggers exist

### On Your Shopify Store:
- [ ] page_view fires on every page
- [ ] view_item fires on product pages
- [ ] add_to_cart fires when adding products
- [ ] view_cart fires on cart page
- [ ] begin_checkout fires when clicking checkout

### In Checkout:
- [ ] begin_checkout fires on checkout start
- [ ] add_shipping_info fires after selecting shipping
- [ ] add_payment_info fires after selecting payment
- [ ] purchase fires on order confirmation with transaction_id

### In GA4 DebugView:
- [ ] Events show up in real-time
- [ ] ecommerce parameters are populated
- [ ] items array contains product data
- [ ] User properties are set correctly

---

## Troubleshooting

### Import Fails with "Invalid JSON"
- Re-download the container file
- Make sure you didn't edit it manually
- Try importing into a **New** workspace instead of merging

### Tags Don't Fire
1. Verify GTM snippet is installed on your Shopify theme
2. Check that `gold-storefront-datalayer-GA4.liquid` is installed
3. Enable GTM Preview mode and check the Summary
4. Look for JavaScript errors in browser console

### GA4 Doesn't Receive Data
1. Verify your GA4 Measurement ID is correct in the variable
2. Check that GA4 Configuration tag fires on All Pages
3. Wait 24-48 hours for data to appear in standard reports (use DebugView for real-time)

### Duplicate Events
- Make sure you only have ONE GTM container installed
- Check that you haven't installed Google Analytics twice
- Review your theme for conflicting tracking scripts

---

## Need Help?

**JY Insights Support**
- Email: contact@jyinsights.com
- Documentation: See `gold-sdr-document.md` for technical details
- README: See `README.md` for installation guide
