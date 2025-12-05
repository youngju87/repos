# Meta Conversions API (CAPI) Quick Reference

**JY/co Server-Side Tracking**
**Platform:** Meta (Facebook & Instagram)
**Last Updated:** January 2025

---

## Quick Setup Checklist

- [ ] Meta Pixel ID obtained
- [ ] Access Token generated (System User recommended)
- [ ] Test Events tool active
- [ ] Meta CAPI Tag configured in sGTM
- [ ] Event deduplication configured (event_id)
- [ ] User data parameters mapped
- [ ] Test events showing in Meta Events Manager
- [ ] Event Match Quality 8.0+

---

## Prerequisites

| Item | Where to Find | Notes |
|------|---------------|-------|
| **Pixel ID** | Events Manager → Data Sources → Your Pixel → Settings | 15-16 digit number |
| **Access Token** | Business Settings → System Users → Generate New Token | Needs `ads_management` permission |
| **Events Manager Access** | business.facebook.com/events_manager | Admin or Advertiser role |

---

## Generate Access Token

### Option 1: System User (Recommended for Production)

**Why System User?**
- Tokens don't expire when employees leave
- Not tied to personal accounts
- More secure for automation

**Steps:**

1. **Create System User:**
   ```
   Meta Business Settings
   → Users → System Users
   → Add → Name: "sGTM Server"
   ```

2. **Assign Assets:**
   ```
   System User page
   → Add Assets
   → Select: Your Pixel
   → Permissions: "Manage Pixel"
   ```

3. **Generate Token:**
   ```
   System User page
   → Generate New Token
   → Permissions: ☑ ads_management
   → Generate Token
   → Copy token immediately (shown only once)
   ```

**Token Format:** Starts with `EAA...` (very long string)

---

### Option 2: Personal Token (Testing Only)

**For quick testing only - not recommended for production**

```
Events Manager
→ Settings
→ Conversions API
→ Generate Access Token
```

---

## sGTM Tag Configuration

### Meta CAPI Tag

**Tag Type:** Meta Conversions API (Official template from Community Gallery)

**Installation:**
```
sGTM → Templates
→ Search Community Template Gallery
→ Search: "Facebook Conversions API"
→ Add to Workspace
```

**Configuration:**

```
Tag Name: Meta CAPI - Purchase
Tag Type: Facebook Conversions API

━━━ API Configuration ━━━
┌─────────────────────────────────────────┐
│ Pixel ID: {{Const - Meta Pixel ID}}    │
│ API Access Token: {{Const - Meta Token}}│
│ Test Event Code: (leave empty for prod)│
└─────────────────────────────────────────┘

━━━ Server Event Data ━━━
┌─────────────────────────────────────────┐
│ Event Name: {{Meta Event Name}}         │
│ Event ID: {{Event - event_id}}          │
│ Event Source URL: {{Page Location}}    │
│ Event Time: {{Event Timestamp}}         │
│ Action Source: website                  │
└─────────────────────────────────────────┘

━━━ User Data ━━━
┌─────────────────────────────────────────┐
│ Email: {{User Data - Email (Hashed)}}  │
│ Phone: {{User Data - Phone (Hashed)}}  │
│ First Name: {{User - First Name}}      │
│ Last Name: {{User - Last Name}}        │
│ City: {{User - City}}                  │
│ State: {{User - State}}                │
│ Zip: {{User - Zip}}                    │
│ Country: {{User - Country}}            │
│                                          │
│ Client IP Address: {{Client IP}}       │
│ Client User Agent: {{User Agent}}      │
│ FBC: {{Cookie - _fbc}}                 │
│ FBP: {{Cookie - _fbp}}                 │
└─────────────────────────────────────────┘

━━━ Custom Data (for Purchase events) ━━━
┌─────────────────────────────────────────┐
│ Value: {{Ecom - Value}}                │
│ Currency: {{Ecom - Currency}}          │
│ Content IDs: {{Ecom - Item IDs}}       │
│ Content Type: product                  │
│ Num Items: {{Ecom - Quantity Total}}  │
└─────────────────────────────────────────┘

━━━ Triggering ━━━
Trigger: Purchase (when Event Name = "purchase")
```

---

## Event Mapping

### GA4 → Meta CAPI Event Names

| GA4 Event | Meta Event Name | Required Parameters |
|-----------|----------------|---------------------|
| `page_view` | `PageView` | `event_source_url` |
| `view_item` | `ViewContent` | `content_ids`, `content_type`, `value`, `currency` |
| `add_to_cart` | `AddToCart` | `content_ids`, `content_type`, `value`, `currency` |
| `begin_checkout` | `InitiateCheckout` | `num_items`, `value`, `currency` |
| `purchase` | `Purchase` | `content_ids`, `value`, `currency` |
| `search` | `Search` | `search_string` |
| `add_to_wishlist` | `AddToWishlist` | `content_ids`, `content_type` |
| `lead` | `Lead` | (custom parameters) |

**Create Variable: Meta Event Name**

```javascript
// Variable Type: Custom JavaScript
// Variable Name: Meta Event Name

function() {
  var ga4Event = {{Event Name}};

  var eventMap = {
    'page_view': 'PageView',
    'view_item': 'ViewContent',
    'add_to_cart': 'AddToCart',
    'begin_checkout': 'InitiateCheckout',
    'purchase': 'Purchase',
    'search': 'Search',
    'add_to_wishlist': 'AddToWishlist'
  };

  return eventMap[ga4Event] || undefined;
}
```

---

## Event Deduplication

### Why Deduplication Matters

**Without event_id:**
```
Browser Pixel → Meta (1 conversion)
Server CAPI → Meta (1 conversion)
Result: 2 conversions ❌ DOUBLE COUNTING
```

**With event_id:**
```
Browser Pixel → Meta (conversion, id: abc123)
Server CAPI → Meta (duplicate detected, id: abc123)
Result: 1 conversion ✅ CORRECT
```

---

### Implement Deduplication

**Step 1: Generate Event ID in Web GTM**

```javascript
// Variable: Generate Event ID
// Type: Custom JavaScript

function() {
  var eventName = {{Event}};
  var timestamp = Date.now();
  var random = Math.random().toString(36).substring(2, 10);

  return eventName + '_' + timestamp + '_' + random;
}
```

**Step 2: Add to GA4 Event Tags**

```
GA4 Event Tag → Event Parameters:
┌────────────────┬─────────────────────────┐
│ event_id       │ {{Generate Event ID}}   │
└────────────────┴─────────────────────────┘
```

**Step 3: Add to Browser Pixel**

```html
<script>
fbq('track', 'Purchase', {
  value: 99.99,
  currency: 'USD'
}, {
  eventID: {{Generate Event ID}}  // ← Must use SAME variable
});
</script>
```

**Step 4: sGTM Extracts event_id**

```
Variable: Event - event_id
Type: Event Data
Key Path: x-ga-mp2-event_id

(GA4 client automatically passes this)
```

**Step 5: Meta CAPI Tag Uses event_id**

```
Meta CAPI Tag:
Event ID: {{Event - event_id}}
```

**CRITICAL:** The `eventID` in browser Pixel MUST EXACTLY MATCH the `event_id` sent from sGTM.

---

## User Data & Hashing

### Required User Parameters

Meta needs user data for attribution and Event Match Quality:

| Parameter | Format | Example | Notes |
|-----------|--------|---------|-------|
| `em` (email) | Hashed (SHA-256) | "abc123..." | Lowercase before hashing |
| `ph` (phone) | Hashed (SHA-256) | "def456..." | E.164 format before hashing |
| `fn` (first name) | Hashed (SHA-256) | "ghi789..." | Lowercase, no spaces |
| `ln` (last name) | Hashed (SHA-256) | "jkl012..." | Lowercase, no spaces |
| `ct` (city) | Hashed (SHA-256) | "mno345..." | Lowercase, no spaces |
| `st` (state) | Hashed (SHA-256) | "pqr678..." | 2-letter state code, lowercase |
| `zp` (zip) | Hashed (SHA-256) | "stu901..." | US: 5 digits, others vary |
| `country` | Hashed (SHA-256) | "vwx234..." | 2-letter ISO code, lowercase |

### Automatic Hashing in sGTM

**Good News:** Meta CAPI tag in sGTM automatically hashes user data if you send it unhashed.

**Configuration:**

```
Meta CAPI Tag → User Data:
┌─────────────────────────────────────────┐
│ Email: {{User - Email}}                 │
│ (Sent unhashed, tag hashes automatically)│
│                                          │
│ Phone: {{User - Phone}}                 │
│ (Tag normalizes to E.164, then hashes)  │
│                                          │
│ First Name: {{User - First Name}}      │
│ Last Name: {{User - Last Name}}        │
│ etc...                                  │
└─────────────────────────────────────────┘
```

**Variable Creation:**

```javascript
// Variable: User - Email
// Type: Event Data
// Key Path: user_data.email

// OR extract from dataLayer:
// Type: Data Layer Variable
// Data Layer Variable Name: user_data.email
```

---

### Email Normalization Example

**Correct Processing:**
```
Input: "John.Doe@Example.COM"
Step 1: Lowercase → "john.doe@example.com"
Step 2: SHA-256 hash → "4e1c9e8f3b2a..."
```

**Phone Normalization Example:**

```
Input: "(555) 123-4567"
Step 1: Remove formatting → "5551234567"
Step 2: Add country code → "+15551234567" (E.164)
Step 3: SHA-256 hash → "7f9d2c4b..."
```

---

## Event Match Quality (EMQ)

### What is EMQ?

**Event Match Quality Score:** 0.0 to 10.0
- Measures how well Meta can match events to users
- Higher score = Better attribution
- **Target: 8.0+**

### EMQ Scoring Factors

| Parameter | Impact | Notes |
|-----------|--------|-------|
| Email | HIGH | +2-3 points if present |
| Phone | HIGH | +2-3 points if present |
| FBC cookie | MEDIUM | +1-2 points |
| FBP cookie | MEDIUM | +1-2 points |
| Client IP | MEDIUM | +1 point |
| User Agent | LOW | +0.5 points |
| Address data | MEDIUM | +1-2 points (city, state, zip, country) |
| External ID | HIGH | +2-3 points (if using) |

**Example Scores:**

```
Only IP + User Agent: 2.0 ❌
+ FBC/FBP cookies: 4.5 ⚠️
+ Email: 7.5 ✅
+ Email + Phone: 9.5 ✅✅✅
+ Email + Phone + Address: 10.0 🏆
```

---

### Improve EMQ

**Quick Wins:**

1. **Collect Email at Checkout**
   ```javascript
   dataLayer.push({
     event: 'purchase',
     user_data: {
       email: customerEmail,  // ← Add this
       phone: customerPhone   // ← And this
     }
   });
   ```

2. **Ensure Cookies Present**
   ```javascript
   // Check in console:
   console.log(document.cookie);
   // Should see: _fbp=fb.1.xxxxx and _fbc=fb.1.xxxxx
   ```

3. **Add Address Data**
   ```javascript
   user_data: {
     email: email,
     phone: phone,
     address: {
       city: 'New York',
       state: 'NY',
       postal_code: '10001',
       country: 'US'
     }
   }
   ```

---

## Testing

### 1. Test Events Tool

**Access:** Events Manager → Test Events

**Activate Test Events:**
```
Meta CAPI Tag in sGTM:
┌─────────────────────────────────────────┐
│ Test Event Code: TEST12345              │
│ (Get from Test Events tool)             │
└─────────────────────────────────────────┘
```

**How to Test:**

1. Open Test Events tool in Meta Events Manager
2. Copy Test Event Code (e.g., `TEST12345`)
3. Add to sGTM Meta CAPI Tag
4. Publish sGTM container
5. Trigger event on website
6. See event appear in Test Events (5-30 seconds)

**What to Verify:**
- ✅ Event name correct (e.g., "Purchase")
- ✅ Event ID present
- ✅ Value and currency correct
- ✅ User data parameters present
- ✅ Event Match Quality score shown
- ✅ Deduplication status (if browser Pixel also firing)

---

### 2. Check Deduplication

**In Test Events Tool:**

Look for "Deduplication" status:

```
Event: Purchase
├─ Event Time: 2025-01-15 10:30:00
├─ Event ID: purchase_1699900000_abc123
├─ Value: $99.99
├─ Event Match Quality: 9.5
└─ Deduplication: ✅ Deduplicated with browser event
    (Shows if browser Pixel sent same event_id)
```

**If Not Deduplicated:**
- Check event_id in browser Pixel: `eventID: "xyz"`
- Check event_id in sGTM CAPI: `event_id: "xyz"`
- They must MATCH EXACTLY (case-sensitive)

---

### 3. Verify Event Match Quality

**Target: 8.0+**

**Example Result:**
```
Event: Purchase
├─ Event Match Quality: 9.5 / 10
├─ Matched Parameters:
│   ✅ Email
│   ✅ Phone
│   ✅ FBC
│   ✅ FBP
│   ✅ Client IP
│   ✅ User Agent
│   ✅ City, State, Zip, Country
└─ Attribution: Eligible for ads attribution
```

**If Score < 8.0:**
- Add email and/or phone to dataLayer
- Verify cookies (_fbp, _fbc) present
- Ensure user data reaching sGTM

---

## Common Parameters

### Standard Event Parameters

| Parameter | Type | Example | Required |
|-----------|------|---------|----------|
| `event_name` | string | "Purchase" | Yes |
| `event_time` | unix timestamp | 1699900000 | Yes |
| `event_id` | string | "purchase_123_abc" | Recommended |
| `event_source_url` | string | "https://example.com/checkout" | Yes |
| `action_source` | string | "website" | Yes |
| `opt_out` | boolean | false | Optional |

### Custom Data (E-Commerce)

| Parameter | Type | Example | Required for |
|-----------|------|---------|--------------|
| `value` | number | 99.99 | Purchase, AddToCart |
| `currency` | string | "USD" | Purchase, AddToCart |
| `content_ids` | array | ["SKU123", "SKU456"] | Purchase, ViewContent |
| `content_type` | string | "product" | ViewContent |
| `content_name` | string | "Product Name" | Optional |
| `num_items` | integer | 2 | InitiateCheckout |
| `search_string` | string | "red shoes" | Search |

---

## Browser Pixel + Server CAPI

### Hybrid Setup (Recommended)

**Why Run Both?**
- Browser Pixel: Real-time data, client-side parameters
- Server CAPI: Reliable delivery, bypasses ad blockers, server-side enrichment
- **Together:** Maximum data coverage with deduplication

**Architecture:**

```
User Action (Purchase)
├─ Browser Pixel fires
│  └─ fbq('track', 'Purchase', {...}, {eventID: 'abc123'})
│     └─ Sends to Meta directly
│
└─ DataLayer push
   └─ GTM captures (with event_id: 'abc123')
      └─ Sends to sGTM
         └─ Meta CAPI fires (with event_id: 'abc123')
            └─ Meta deduplicates (keeps browser version)
```

**Meta's Deduplication Logic:**
- If event_id matches: Keeps 1 event (browser preferred)
- If event_id different: Counts as 2 separate events
- Deduplication window: 48 hours

---

## Troubleshooting

### Issue: Events Not Showing in Meta

**Check 1: Pixel ID Correct?**
```
sGTM → Variables → Const - Meta Pixel ID
Value: 123456789012345 (15-16 digits)

Verify in Meta:
Events Manager → Data Sources → Your Pixel → Settings
```

**Check 2: Access Token Valid?**
```
Test in sGTM Preview:
Meta CAPI Tag → Check "Tag fired successfully"
If error: "Invalid OAuth access token" → Regenerate token
```

**Check 3: Tag Firing?**
```
sGTM Preview → Meta CAPI Tag
Status should show: "Succeeded"
If "Not Fired": Check trigger configuration
```

---

### Issue: Low Event Match Quality (<6.0)

**Diagnosis:**

Check Test Events Tool → Event → Matched Parameters

**Solutions:**

| Missing Parameter | Fix |
|-------------------|-----|
| Email | Add to checkout dataLayer: `user_data.email` |
| Phone | Add to checkout dataLayer: `user_data.phone` |
| FBC/FBP cookies | Ensure Meta Pixel installed on site |
| Client IP | Check sGTM variable: `{{Client IP}}` |
| User Agent | Check sGTM variable: `{{User Agent}}` |

**Variable Creation:**
```javascript
// Variable: Client IP
// Type: Client
// Component: IP Address

// Variable: User Agent
// Type: Client
// Component: User Agent
```

---

### Issue: Duplicate Conversions

**Symptoms:**
- 2x Purchase events in Meta
- Spend doubled in attribution

**Diagnosis:**

```
Check Test Events → Event → Deduplication
If shows: "Not deduplicated" → event_id mismatch
```

**Fix:**

1. **Check Browser Pixel:**
   ```javascript
   // In Custom HTML tag or on page:
   fbq('track', 'Purchase', {
     value: 99.99,
     currency: 'USD'
   }, {
     eventID: {{Generate Event ID}}  // ← Using GTM variable
   });
   ```

2. **Check sGTM Variable:**
   ```
   Variable: Event - event_id
   Type: Event Data
   Key Path: x-ga-mp2-event_id
   ```

3. **Test:**
   ```javascript
   // In browser console after purchase:
   console.log('Browser event_id:', window.lastEventID);

   // In sGTM Preview:
   // Check Meta CAPI Tag → event_id value
   // Should match browser exactly
   ```

---

## Advanced: Content IDs

### Extract Product IDs

**Variable: Ecom - Item IDs**
```javascript
// Type: Custom JavaScript

function() {
  var items = {{Ecom - Items}};  // GA4 items array
  if (!items || !items.length) return undefined;

  return items.map(function(item) {
    return item.item_id;
  });
}

// Returns: ["SKU123", "SKU456", "SKU789"]
```

**In Meta CAPI Tag:**
```
Custom Data:
┌─────────────────────────────────────────┐
│ Content IDs: {{Ecom - Item IDs}}       │
│ Content Type: product                   │
└─────────────────────────────────────────┘
```

---

## Best Practices

### ✅ Do's

- ✅ Use System User tokens (not personal)
- ✅ Implement event deduplication (event_id)
- ✅ Send as much user data as possible (email, phone)
- ✅ Hash PII before sending (automatic in sGTM template)
- ✅ Target EMQ 8.0+ for all conversion events
- ✅ Test with Test Events tool before production
- ✅ Monitor Events Manager regularly
- ✅ Use consistent content_ids across Pixel and CAPI

### ❌ Don'ts

- ❌ Don't send unhashed PII outside sGTM
- ❌ Don't use different event_id for browser and server
- ❌ Don't send PII in event_source_url
- ❌ Don't forget to disable Test Event Code in production
- ❌ Don't send value as string (use number: 99.99 not "99.99")
- ❌ Don't exceed 1000 content_ids per event
- ❌ Don't send events from logged-out users without at least IP + User Agent

---

## Configuration Checklist

Before going live:

- [ ] Meta Pixel ID configured in sGTM constant
- [ ] Access Token configured (System User recommended)
- [ ] Test Event Code removed or disabled
- [ ] Event deduplication working (event_id matching)
- [ ] Event Match Quality 8.0+ on test purchases
- [ ] User data (email, phone) collecting properly
- [ ] FBC and FBP cookies present
- [ ] Test Events tool showing events correctly
- [ ] Deduplication status = "Deduplicated" in Test Events
- [ ] Real conversion visible in Events Manager
- [ ] Attribution window configured in Ad Account

---

## Support Resources

**Meta Documentation:**
- CAPI Spec: https://developers.facebook.com/docs/marketing-api/conversions-api
- Event Reference: https://developers.facebook.com/docs/meta-pixel/reference
- Deduplication: https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events

**sGTM Template:**
- Community Gallery: "Facebook Conversions API"
- GitHub: https://github.com/facebookincubator/Facebook-Conversion-API-Tag-for-GTM-SS

**Event Match Quality:**
- Guide: https://www.facebook.com/business/help/765081237991954

---

**Quick Reference Version:** 1.0.0
**Last Updated:** January 2025
**Created By:** JY/co
