# Web GTM → sGTM Integration Guide

**JY/co Server-Side Tracking**
**Version:** 1.0.0

---

## Overview

This guide explains how to modify your existing Web GTM container to send data to your sGTM server instead of directly to platforms.

**What changes:**
- GA4 Configuration Tag: Add `server_container_url`
- Transport: Route through your server
- Event ID: Generate for deduplication
- First-party cookies: Enable via server

---

## Prerequisites

- [ ] Web GTM container already configured
- [ ] GA4 already tracking (client-side)
- [ ] sGTM server deployed and accessible
- [ ] Custom domain configured (e.g., `gtm.yourdomain.com`)

---

## Step 1: Update GA4 Configuration Tag

### Locate GA4 Configuration Tag

1. In Web GTM → **Tags**
2. Find your GA4 Configuration tag (usually named "GA4 - Configuration" or "Google Tag")
3. Click to edit

### Add Server Container URL

In the **Configuration Settings** section:

```
Tag Type: Google Tag
Tag ID: G-XXXXXXXXXX

Fields to Set:
┌────────────────────────────────────────────┐
│ server_container_url                        │
│ https://gtm.yourdomain.com                 │
└────────────────────────────────────────────┘

Configuration Settings:
┌────────────────────────────────────────────┐
│ first_party_collection: true               │
└────────────────────────────────────────────┘
```

**[INSERT SCREENSHOT: GA4 Config tag with server_container_url]**

### Verify Settings

Your GA4 Configuration Tag should now have:

```javascript
gtag('config', 'G-XXXXXXXXXX', {
  'server_container_url': 'https://gtm.yourdomain.com',
  'first_party_collection': true
});
```

---

## Step 2: Configure Transport URL (Alternative Method)

If the above doesn't work with your setup, use the transport_url method:

### In GA4 Configuration Tag

Fields to Set:
```
┌────────────────────────────────────────────┐
│ transport_url                               │
│ https://gtm.yourdomain.com                 │
└────────────────────────────────────────────┘
```

This tells GA4 to send all hits to your server instead of `google-analytics.com`.

---

## Step 3: Generate Event IDs for Deduplication

### Why Event IDs Matter

Both browser Pixel/Tag and server CAPI send the same events. Platforms deduplicate using `event_id`.

**Without event_id:**
```
Browser → Pixel → Meta (conversion counted)
Browser → sGTM → CAPI → Meta (conversion counted)
Result: 2 conversions ❌
```

**With event_id:**
```
Browser → Pixel → Meta (conversion counted, event_id: abc123)
Browser → sGTM → CAPI → Meta (duplicate detected, event_id: abc123)
Result: 1 conversion ✅
```

### Create Event ID Variable

1. **Variables** → **New** → **User-Defined Variables**
2. **Variable Configuration** → **Custom JavaScript**

```javascript
// Variable Name: Generate Event ID

function() {
  var eventName = {{Event}};
  var timestamp = Date.now();
  var random = Math.random().toString(36).substring(2, 10);

  return eventName + '_' + timestamp + '_' + random;
}

// Returns: "purchase_1673456789_a3b5c7d9"
```

**[INSERT SCREENSHOT: Event ID variable]**

### Pass Event ID to GA4

In your GA4 **Event Tags** (not Configuration tag):

For each event tag (purchase, add_to_cart, etc.):

```
Event Parameters:
┌────────────────┬─────────────────────────┐
│ Parameter Name │ Value                   │
├────────────────┼─────────────────────────┤
│ event_id       │ {{Generate Event ID}}   │
└────────────────┴─────────────────────────┘
```

This sends the event_id as a GA4 event parameter, which sGTM can access.

---

## Step 4: Meta Pixel Event ID (If Using Meta)

### Update fbq() Calls

If you have Meta Pixel firing from Web GTM:

#### Option A: Custom HTML Tag

```html
<script>
fbq('track', 'Purchase', {
  value: {{Transaction Value}},
  currency: {{Currency}}
}, {
  eventID: {{Generate Event ID}}  // ← Same variable as GA4
});
</script>
```

#### Option B: Meta Pixel Tag (Template)

If using Meta's official Pixel tag template:

```
Advanced Matching:
☑ Enable Advanced Matching

Event ID:
{{Generate Event ID}}
```

**Critical:** The `eventID` sent from browser Pixel must match the `event_id` sent from sGTM CAPI.

---

## Step 5: Enable Debug Mode (Testing)

### Add Debug Flag to GA4

In GA4 Configuration Tag:

```
Fields to Set:
┌────────────────────────────────────────────┐
│ debug_mode: true                           │
└────────────────────────────────────────────┘
```

Or use URL parameter:
```
https://yoursite.com?gtm_debug=x_abc123
```

This enables GA4 DebugView and sGTM Preview mode.

---

## Step 6: Test the Integration

### 1. Enable GTM Preview Mode

In Web GTM:
1. Click **Preview**
2. Enter your website URL
3. Click **Connect**

### 2. Enable sGTM Preview Mode

In sGTM:
1. Click **Preview**
2. Copy the debug parameter (e.g., `?gtm_debug=x_abc123`)
3. Add to your website URL
4. Refresh page

### 3. Trigger Test Event

1. On your website, trigger a purchase (or test event)
2. Check Web GTM Preview:
   - ✅ GA4 Event tag fires
   - ✅ Data includes `event_id`
3. Check sGTM Preview:
   - ✅ GA4 Client receives request
   - ✅ GA4 Tag fires
   - ✅ Meta CAPI Tag fires (if configured)
   - ✅ Google Ads Tag fires (if configured)

**[INSERT SCREENSHOT: sGTM Preview showing successful tags]**

### 4. Verify in Platforms

**GA4 DebugView:**
1. GA4 Property → **Configure** → **DebugView**
2. Should see events in real-time
3. Check parameters are present

**Meta Test Events:**
1. Events Manager → **Test Events**
2. Should see events arriving
3. Check Event Match Quality

**Google Ads:**
1. Google Ads → **Tools** → **Conversions**
2. Check for test conversion (may take 30 min)

---

## Step 7: Remove Direct Tags (Optional)

Once sGTM is working, you can optionally remove direct platform tags from Web GTM:

### Keep in Web GTM:
- ✅ GA4 Configuration Tag (with `server_container_url`)
- ✅ GA4 Event Tags (send to sGTM)
- ✅ dataLayer pushes

### Can Remove from Web GTM:
- ❌ Direct Meta Pixel tags (sGTM handles CAPI)
- ❌ Direct Google Ads conversion tags (sGTM handles)
- ❌ Direct TikTok Pixel (sGTM handles Events API)

**Note:** Many implementations keep browser Pixel + sGTM for redundancy. The deduplication via event_id prevents double-counting.

---

## Step 8: Production Checklist

Before going live:

- [ ] `server_container_url` set to production domain
- [ ] `debug_mode` disabled (or removed)
- [ ] Event IDs generating correctly
- [ ] Test purchases verified in all platforms
- [ ] No duplicate conversions
- [ ] SSL certificate valid on custom domain
- [ ] DNS TTL increased to 3600+ seconds

---

## Troubleshooting

### Issue: No Requests Reaching sGTM

**Check:**
1. `server_container_url` spelled correctly (no trailing slash)
2. Custom domain accessible (`https://gtm.yourdomain.com/healthy` returns `ok`)
3. SSL certificate valid
4. No browser console errors

**Solution:**
```javascript
// Test server accessibility
fetch('https://gtm.yourdomain.com/healthy')
  .then(r => r.text())
  .then(console.log);  // Should print "ok"
```

### Issue: Events in sGTM but Not in GA4

**Check:**
1. sGTM Preview → GA4 Tag status (should be "Succeeded")
2. GA4 Measurement ID correct in sGTM
3. GA4 DebugView enabled

**Solution:**
- Check sGTM GA4 tag configuration
- Verify Measurement ID matches GA4 property

### Issue: Duplicate Conversions

**Check:**
1. Event IDs matching between browser and server
2. Both Pixel and CAPI firing with same event_id

**Solution:**
- Add event_id logging:
```javascript
// In browser
console.log('Browser event_id:', eventID);

// Check sGTM variable in Preview
// Should match browser value
```

### Issue: Meta Event Match Quality Low

**Check:**
1. User data (email, phone) being sent from browser
2. sGTM receiving user data
3. Meta CAPI tag configured with user parameters

**Solution:**
- Add more user parameters to dataLayer
- Verify sGTM variables extracting user data correctly

---

## Data Layer Structure

For sGTM to work properly, ensure your dataLayer includes necessary data:

### Page View
```javascript
dataLayer.push({
  'event': 'page_view',
  'page_location': window.location.href,
  'page_title': document.title
});
```

### Purchase
```javascript
dataLayer.push({
  'event': 'purchase',
  'ecommerce': {
    'transaction_id': 'T12345',
    'value': 99.99,
    'currency': 'USD',
    'tax': 8.99,
    'shipping': 5.00,
    'items': [
      {
        'item_id': 'SKU123',
        'item_name': 'Product Name',
        'price': 29.99,
        'quantity': 1
      }
    ]
  },
  'user_data': {  // For enhanced conversions
    'email': 'user@example.com',
    'phone': '+15551234567',
    'address': {
      'first_name': 'John',
      'last_name': 'Smith',
      'city': 'New York',
      'region': 'NY',
      'postal_code': '10001',
      'country': 'US'
    }
  }
});
```

---

## Performance Considerations

### Impact on Page Load

**Before sGTM:**
```
Browser → google-analytics.com (50-100ms)
Browser → facebook.com/tr (50-100ms)
Browser → googleadservices.com (50-100ms)
Total: 3 external requests, 150-300ms
```

**After sGTM:**
```
Browser → gtm.yourdomain.com (20-50ms)
sGTM → All platforms (async, no browser impact)
Total: 1 external request, 20-50ms
```

**Benefit:** Faster page load, better Core Web Vitals

### First-Party Cookies

With `first_party_collection: true` and custom domain:

**Before:**
- `_ga` cookie set by `.google-analytics.com` (third-party)
- Subject to ITP/ETP restrictions (7-day limit)

**After:**
- `_ga` cookie set by `.yourdomain.com` (first-party)
- Not restricted by ITP/ETP (2-year lifetime)

---

## Complete Example: GA4 Configuration

### Web GTM - GA4 Configuration Tag

```
Tag Name: GA4 - Configuration
Tag Type: Google Tag
Tag ID: G-XXXXXXXXXX

Triggering: All Pages (Page View)

Configuration Settings:
┌─────────────────────────────────────────────┐
│ server_container_url                         │
│ https://gtm.clientdomain.com                │
│                                              │
│ first_party_collection                       │
│ true                                         │
│                                              │
│ send_page_view                               │
│ true                                         │
└─────────────────────────────────────────────┘

Fields to Set:
┌────────────────┬────────────────────────────┐
│ Field Name     │ Value                      │
├────────────────┼────────────────────────────┤
│ debug_mode     │ false (true for testing)   │
└────────────────┴────────────────────────────┘
```

### Web GTM - GA4 Purchase Event

```
Tag Name: GA4 - Event - Purchase
Tag Type: Google Analytics: GA4 Event
Configuration Tag: {{GA4 - Configuration}}

Event Name: purchase

Event Parameters:
┌────────────────┬────────────────────────────┐
│ Parameter      │ Value                      │
├────────────────┼────────────────────────────┤
│ transaction_id │ {{DLV - transaction_id}}   │
│ value          │ {{DLV - value}}            │
│ currency       │ {{DLV - currency}}         │
│ tax            │ {{DLV - tax}}              │
│ shipping       │ {{DLV - shipping}}         │
│ items          │ {{DLV - items}}            │
│ event_id       │ {{Generate Event ID}}      │
└────────────────┴────────────────────────────┘

User Properties:
┌────────────────┬────────────────────────────┐
│ Property       │ Value                      │
├────────────────┼────────────────────────────┤
│ user_id        │ {{DLV - user_id}}          │
└────────────────┴────────────────────────────┘

Triggering: Purchase (Custom Event)
```

---

## Migration Checklist

### Phase 1: Setup (Week 1)
- [ ] Deploy sGTM server
- [ ] Configure custom domain
- [ ] Import sGTM container template
- [ ] Configure platform credentials (Meta, Google Ads, etc.)

### Phase 2: Web GTM Changes (Week 2)
- [ ] Update GA4 Configuration tag
- [ ] Create Event ID variable
- [ ] Update event tags with event_id
- [ ] Test in Preview mode

### Phase 3: Testing (Week 3)
- [ ] Test all events end-to-end
- [ ] Verify no duplicate conversions
- [ ] Check Event Match Quality (Meta)
- [ ] Verify enhanced conversions (Google Ads)
- [ ] Load test with real traffic

### Phase 4: Production (Week 4)
- [ ] Disable debug mode
- [ ] Publish Web GTM container
- [ ] Publish sGTM container
- [ ] Monitor for 48 hours
- [ ] Verify conversions in platforms

---

## Support

**Documentation:** See Master Setup Guide for detailed sGTM configuration

**Common Issues:**
- Server not accessible → Check DNS and SSL
- No data in sGTM → Check `server_container_url`
- Duplicate events → Verify event_id implementation
- Low Event Match Quality → Add more user data

**Contact:** support@jyco.io

---

**Version:** 1.0.0
**Last Updated:** January 2025
**Created by:** JY/co
