# GA4 Server-Side Quick Reference

**JY/co Server-Side Tracking**
**Platform:** Google Analytics 4
**Last Updated:** January 2025

---

## Quick Setup Checklist

- [ ] GA4 property created
- [ ] Measurement ID obtained (G-XXXXXXXXXX)
- [ ] sGTM server deployed
- [ ] GA4 Client configured in sGTM
- [ ] GA4 Tag configured in sGTM
- [ ] Web GTM updated with `server_container_url`
- [ ] Test events visible in DebugView

---

## Prerequisites

| Item | Where to Find | Notes |
|------|---------------|-------|
| **GA4 Measurement ID** | GA4 Property → Admin → Data Streams → Web → Measurement ID | Format: G-XXXXXXXXXX |
| **GA4 API Secret** | (Optional) Data Streams → Measurement Protocol API secrets | For server-side only tracking |
| **GA4 Property Access** | GA4 Property → Admin → Property Access Management | Editor role minimum |

---

## sGTM Container Setup

### 1. GA4 Client Configuration

**Client Type:** GA4
**Template:** Google Analytics: GA4

**Settings:**

```
Client Name: GA4 Client

Configuration:
┌─────────────────────────────────────────┐
│ Path Claiming                            │
│ ☑ Claim /g/collect                      │
│ ☑ Claim /gtm.js                         │
│ ☑ Claim /gtag/js                        │
└─────────────────────────────────────────┘
```

**Why This Matters:**
- Path claiming tells sGTM to intercept these specific request paths
- `/g/collect` is where GA4 sends event data
- `/gtm.js` and `/gtag/js` are the script files

---

### 2. GA4 Tag Configuration

**Tag Type:** Google Analytics: GA4
**Template:** Google Analytics: GA4 (gaawe)

**Settings:**

```
Tag Name: GA4 - All Events

Configuration:
┌─────────────────────────────────────────┐
│ Measurement ID: G-XXXXXXXXXX            │
│                                          │
│ ☑ Inherit parameters from client        │
│ ☑ Send all event parameters             │
└─────────────────────────────────────────┘

Event Name: {{Event Name}}

Additional Parameters:
☐ Typically leave empty (inherited from client)

Redaction:
┌─────────────────────────────────────────┐
│ ☑ Redact visitor IP address             │
└─────────────────────────────────────────┘

Triggering:
┌─────────────────────────────────────────┐
│ Trigger: All GA4 Events                 │
│ (Fires on all events received by client)│
└─────────────────────────────────────────┘
```

---

### 3. Key Variables

**Pre-built Variables (Enable These):**

```
Event Data:
- Event Name
- Event ID
- Page Location
- Page Referrer

Client Data:
- Client ID (_ga cookie)
- Session ID
- IP Address
- User Agent

Ecommerce Data:
- Transaction ID
- Value
- Currency
- Items
```

**Custom Variables to Create:**

| Variable Name | Type | Purpose |
|---------------|------|---------|
| `Event - event_id` | Event Data | Extract event_id from x-ga-mp2-event_id |
| `Event - transaction_id` | Event Data | Extract transaction_id parameter |
| `Event - value` | Event Data | Extract value parameter |
| `Event - currency` | Event Data | Extract currency parameter |
| `Ecom - Items` | Event Data | Extract items array |

---

## Web GTM Configuration

### GA4 Configuration Tag Update

**Add to existing GA4 Config tag:**

```javascript
// In GA4 Configuration Tag
Tag Type: Google Tag
Tag ID: G-XXXXXXXXXX

Fields to Set:
┌─────────────────────────────────────────┐
│ server_container_url                     │
│ https://gtm.clientdomain.com            │
│                                          │
│ first_party_collection                   │
│ true                                     │
└─────────────────────────────────────────┘
```

**This tells GA4 to send data to your server instead of google-analytics.com.**

---

### Event ID Variable (for Deduplication)

**Variable Name:** Generate Event ID
**Variable Type:** Custom JavaScript

```javascript
function() {
  var eventName = {{Event}};
  var timestamp = Date.now();
  var random = Math.random().toString(36).substring(2, 10);

  return eventName + '_' + timestamp + '_' + random;
}

// Returns: "purchase_1673456789_a3b5c7d9"
```

**Add to All Conversion Events:**

```
Event Parameters:
┌────────────────┬─────────────────────────┐
│ Parameter Name │ Value                   │
├────────────────┼─────────────────────────┤
│ event_id       │ {{Generate Event ID}}   │
└────────────────┴─────────────────────────┘
```

---

## Event Mapping

### Standard E-Commerce Events

| Event | When It Fires | Required Parameters |
|-------|---------------|---------------------|
| `page_view` | Every page load | `page_location`, `page_title` |
| `view_item` | Product page view | `items` (with item_id, item_name, price) |
| `add_to_cart` | Add to cart click | `items`, `value`, `currency` |
| `view_cart` | Cart page view | `items`, `value`, `currency` |
| `begin_checkout` | Checkout page load | `items`, `value`, `currency` |
| `add_shipping_info` | Shipping method selected | `shipping_tier`, `value`, `currency` |
| `add_payment_info` | Payment method selected | `payment_type`, `value`, `currency` |
| `purchase` | Order confirmation | `transaction_id`, `value`, `tax`, `shipping`, `currency`, `items` |

---

## Testing

### 1. Enable Debug Mode

**Option A - In GA4 Config Tag:**
```
Fields to Set:
┌─────────────────────────────────────────┐
│ debug_mode: true                         │
└─────────────────────────────────────────┘
```

**Option B - URL Parameter:**
```
https://yoursite.com?debug_mode=1
```

### 2. Test Event Flow

```
1. Web GTM Preview Mode
   ↓
2. Fire test event (e.g., add_to_cart)
   ↓
3. Check sGTM Preview
   → GA4 Client receives request? ✓
   → GA4 Tag fires? ✓
   ↓
4. Check GA4 DebugView
   → Event appears? ✓
   → Parameters correct? ✓
```

### 3. Verify in GA4 DebugView

**Access:** GA4 Property → Configure → DebugView

**What to Check:**
- ✅ Event name matches
- ✅ `transaction_id` present (for purchase)
- ✅ `value` matches expected
- ✅ `currency` correct
- ✅ `items` array populated
- ✅ `event_id` present

**Screenshot Location in DebugView:**
```
Event: purchase
├─ transaction_id: "ORDER-12345"
├─ value: 99.99
├─ currency: "USD"
├─ tax: 8.99
├─ shipping: 5.00
└─ items: [Array(2)]
```

---

## Common Parameters

### User Properties

| Parameter | Source | Example |
|-----------|--------|---------|
| `client_id` | _ga cookie | "GA1.1.123456789.1699900000" |
| `session_id` | GA4 generates | "1699900123" |
| `user_id` | Custom (logged-in users) | "USER-12345" |

### Event Parameters

| Parameter | Type | Example | Notes |
|-----------|------|---------|-------|
| `event_id` | string | "purchase_123_abc" | For deduplication |
| `page_location` | string | "https://example.com/product" | Full URL |
| `page_title` | string | "Product Name - Store" | Page title |
| `value` | number | 99.99 | Revenue amount |
| `currency` | string | "USD" | ISO 4217 code |
| `transaction_id` | string | "ORDER-12345" | Unique order ID |

### Item Parameters

```javascript
items: [
  {
    item_id: "SKU123",           // Required
    item_name: "Product Name",   // Required
    price: 29.99,                // Required
    quantity: 1,                 // Required
    item_brand: "Brand Name",    // Recommended
    item_category: "Category",   // Recommended
    item_variant: "Blue",        // Optional
    index: 0                     // Optional (position)
  }
]
```

---

## Troubleshooting

### Issue: No Data in GA4

**Possible Causes:**

1. **Measurement ID incorrect**
   - Check: sGTM GA4 Tag → Measurement ID
   - Verify: Matches GA4 property

2. **Client not receiving requests**
   - Check: sGTM Preview → GA4 Client
   - Verify: Requests appear in preview

3. **server_container_url not set**
   - Check: Web GTM → GA4 Config Tag
   - Verify: `server_container_url` parameter present

4. **Path claiming conflict**
   - Check: Only ONE client claiming `/g/collect`
   - Fix: Disable other clients claiming same path

---

### Issue: Events Missing Parameters

**Check DataLayer:**

```javascript
// In browser console
console.log(dataLayer);

// Should see:
{
  event: "purchase",
  transaction_id: "ORDER-123",
  value: 99.99,
  currency: "USD",
  items: [{...}]
}
```

**Check sGTM Variables:**

1. sGTM Preview → Variables tab
2. Find: `Event - transaction_id`
3. Value should show: "ORDER-123"

**If missing:**
- Variable misconfigured
- DataLayer doesn't contain data
- Event parameter path wrong

---

### Issue: Duplicate Events

**Symptoms:**
- 2x purchases in GA4
- Revenue doubled

**Cause:**
- Both direct GA4 tag AND sGTM sending

**Fix:**
1. Web GTM should ONLY have GA4 Config tag with `server_container_url`
2. GA4 Event tags should reference the Config tag
3. Remove any duplicate direct GA4 tags

---

## Advanced: Server-Only Tracking

For server-side events without browser tracking:

### Create API Secret

1. GA4 → Admin → Data Streams
2. Select your web stream
3. Measurement Protocol API secrets → Create
4. Copy API secret

### Configure in sGTM

```
GA4 Tag:
┌─────────────────────────────────────────┐
│ Measurement ID: G-XXXXXXXXXX            │
│ API Secret: {{GA4 API Secret}}          │
│                                          │
│ ☐ Inherit from client                   │
│   (Uncheck for server-only events)      │
└─────────────────────────────────────────┘

Event Parameters (manually set):
- event_name: {{Event Name}}
- client_id: {{Client ID}}
- value: {{Transaction Value}}
- currency: {{Currency}}
- transaction_id: {{Transaction ID}}
- items: {{Items Array}}
```

**When to Use:**
- Backend conversions (subscriptions, renewals)
- Offline conversions
- Server-generated events

---

## Consent Mode Integration

### Default Consent State

```javascript
// Set BEFORE GTM loads
gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied'
});
```

### Update After User Consent

```javascript
// After user accepts
gtag('consent', 'update', {
  'analytics_storage': 'granted',
  'ad_storage': 'granted',
  'ad_user_data': 'granted',
  'ad_personalization': 'granted'
});
```

### In sGTM

GA4 automatically respects consent signals from browser. No additional configuration needed in server container.

**Verify:**
- sGTM Preview → GA4 Tag
- Check for `gcs` parameter (consent state)

---

## Best Practices

### ✅ Do's

- ✅ Use `server_container_url` for first-party cookies
- ✅ Enable IP redaction for privacy
- ✅ Generate unique `event_id` for each conversion
- ✅ Test in DebugView before production
- ✅ Include all recommended item parameters
- ✅ Set appropriate currency codes (ISO 4217)
- ✅ Use descriptive event names
- ✅ Monitor data quality in GA4 regularly

### ❌ Don'ts

- ❌ Don't send PII in event parameters (email, phone, address)
- ❌ Don't use placeholder Measurement IDs in production
- ❌ Don't have both direct GA4 tags AND sGTM (causes duplicates)
- ❌ Don't forget to disable debug mode in production
- ❌ Don't send currency amounts as strings (use numbers)
- ❌ Don't omit required parameters (transaction_id, value, items)
- ❌ Don't use same `event_id` for different events

---

## Performance Tips

### Reduce Data Sent

```javascript
// In GA4 Tag - Advanced Settings
┌─────────────────────────────────────────┐
│ Fields to Exclude:                       │
│ - page_referrer (if not needed)         │
│ - user_agent (already captured)         │
│ - screen_resolution (not useful)        │
└─────────────────────────────────────────┘
```

### Batch Events

GA4 automatically batches events client-side. No server-side configuration needed.

### Monitor Quota

- GA4 has event limits: 500 distinct event names per property
- Item-scoped custom dimensions: 25 per property
- Monitor in GA4 Admin → Quotas

---

## Useful GA4 Reports

### Verify Implementation

1. **Realtime Report**
   - Shows events in last 30 minutes
   - Quick verification after launch

2. **DebugView**
   - Shows events with all parameters
   - Best for testing

3. **Events Report**
   - Reports → Engagement → Events
   - See event counts and parameters
   - Available after 24 hours

4. **Conversions Report**
   - Reports → Engagement → Conversions
   - Mark `purchase` as conversion
   - See conversion counts and revenue

5. **Monetization Report**
   - Reports → Monetization → Overview
   - E-commerce purchase data
   - Revenue, transactions, average order value

---

## Cheat Sheet

### Quick Command Reference

**Check server health:**
```bash
curl https://gtm.clientdomain.com/healthy
# Expected: "ok"
```

**Test event in console:**
```javascript
dataLayer.push({
  event: 'test_event',
  event_id: 'test_' + Date.now(),
  test_parameter: 'test_value'
});
```

**Check GA4 cookie:**
```javascript
console.log(document.cookie.match(/_ga=[^;]+/));
// Should show: _ga=GA1.1.xxxxx.xxxxx
```

**Force debug mode:**
```
https://yoursite.com?debug_mode=1
```

---

## Configuration Checklist

Before going live:

- [ ] GA4 Measurement ID correct
- [ ] `server_container_url` points to production domain
- [ ] SSL certificate valid on custom domain
- [ ] GA4 Client claiming correct paths
- [ ] GA4 Tag inheriting from client
- [ ] Event ID variable created and working
- [ ] IP redaction enabled (if required)
- [ ] All conversion events marked as conversions in GA4
- [ ] Test purchase visible in GA4 (within 24 hours)
- [ ] Debug mode disabled
- [ ] Documentation updated with Measurement ID

---

## Support Resources

**GA4 Documentation:**
- Measurement Protocol: https://developers.google.com/analytics/devguides/collection/protocol/ga4
- Event Reference: https://support.google.com/analytics/answer/9267735
- DebugView: https://support.google.com/analytics/answer/7201382

**GTM Documentation:**
- Server-side: https://developers.google.com/tag-platform/tag-manager/server-side
- GA4 Client: https://developers.google.com/tag-platform/tag-manager/server-side/ga4-setup

**Common Issues:**
- See Master Setup Guide Chapter 4
- See Testing Checklist section "GA4 Verification"

---

**Quick Reference Version:** 1.0.0
**Last Updated:** January 2025
**Created By:** JY/co
