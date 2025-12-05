# Google Ads Enhanced Conversions Quick Reference

**JY/co Server-Side Tracking**
**Platform:** Google Ads
**Last Updated:** January 2025

---

## Quick Setup Checklist

- [ ] Google Ads account access
- [ ] Conversion Action created in Google Ads
- [ ] Conversion ID obtained (AW-XXXXXXXXXX)
- [ ] Conversion Label obtained
- [ ] Google Ads Conversion Tag configured in sGTM
- [ ] User data (email, phone) collecting in dataLayer
- [ ] Test conversion visible in Google Ads
- [ ] Conversion status shows "Eligible" for Enhanced Conversions

---

## Prerequisites

| Item | Where to Find | Notes |
|------|---------------|-------|
| **Conversion ID** | Google Ads → Tools → Conversions → Tag setup | Format: AW-XXXXXXXXXX |
| **Conversion Label** | Same location as above | Unique per conversion action |
| **Google Ads Account Access** | ads.google.com | Standard or Admin role |

---

## Google Ads Account Setup

### 1. Create Conversion Action

**Path:** Google Ads → Tools & Settings → Measurement → Conversions

**Steps:**

```
1. Click "+ New Conversion Action"

2. Select Conversion Type:
   ☑ Website

3. Set Up Conversion:
   ┌─────────────────────────────────────────┐
   │ Category: Purchase                       │
   │ Conversion Name: Website Purchase       │
   │ Value: Use different values             │
   │ Count: Every                            │
   │ Conversion Window: 30 days              │
   │ View-through window: 1 day              │
   │ Attribution model: Data-driven          │
   └─────────────────────────────────────────┘

4. Tag Setup:
   → Choose "Use Google Tag Manager"
   → Copy Conversion ID (AW-XXXXXXXXXX)
   → Copy Conversion Label (e.g., "abc123DEF")

5. Enhanced Conversions:
   ☑ Turn on enhanced conversions
   → Method: Google Tag Manager
```

---

### 2. Get Credentials

**Conversion ID:**
```
Format: AW-1234567890
Location: Google Ads → Tools → Conversions → [Action] → Tag setup
```

**Conversion Label:**
```
Format: abc123DEF (alphanumeric, case-sensitive)
Location: Same as Conversion ID
One label per conversion action
```

**Example:**
```
Conversion Action: "Purchase"
Conversion ID: AW-1234567890
Conversion Label: xYz123Abc
```

---

## sGTM Tag Configuration

### Google Ads Conversion Tag

**Tag Type:** Google Ads Conversion Tracking
**Template:** Community Gallery → "Google Ads Conversions"

**Installation:**
```
sGTM → Templates
→ Search Community Template Gallery
→ Search: "Google Ads Conversions"
→ Add to Workspace
```

**Configuration:**

```
Tag Name: Google Ads - Purchase Conversion

━━━ Conversion Configuration ━━━
┌─────────────────────────────────────────┐
│ Conversion ID: {{Const - Google Ads ID}}│
│ Format: AW-1234567890                   │
│                                          │
│ Conversion Label: {{Const - Label}}    │
│ Format: abc123DEF                       │
└─────────────────────────────────────────┘

━━━ Conversion Data ━━━
┌─────────────────────────────────────────┐
│ Conversion Value: {{Ecom - Value}}     │
│ Currency Code: {{Ecom - Currency}}     │
│ Transaction ID: {{Ecom - Trans ID}}   │
└─────────────────────────────────────────┘

━━━ Enhanced Conversions - User Data ━━━
┌─────────────────────────────────────────┐
│ Email: {{User - Email}}                │
│ Phone Number: {{User - Phone}}         │
│ First Name: {{User - First Name}}     │
│ Last Name: {{User - Last Name}}       │
│ Street: {{User - Street}}              │
│ City: {{User - City}}                  │
│ Region: {{User - State}}               │
│ Postal Code: {{User - Zip}}           │
│ Country: {{User - Country}}            │
└─────────────────────────────────────────┘

━━━ Triggering ━━━
Trigger: Purchase
  (Event Name equals "purchase")
```

---

## Create Constants

### Conversion ID Constant

```
Variable Name: Const - Google Ads Conversion ID
Type: Constant
Value: AW-1234567890

(Replace with your actual ID)
```

### Conversion Label Constant

```
Variable Name: Const - Google Ads Purchase Label
Type: Constant
Value: xYz123Abc

(Replace with your actual label)
```

**Why Constants?**
- Easy to update in one place
- Reusable across multiple tags
- Clear documentation of credentials used

---

## Enhanced Conversions

### What is Enhanced Conversions?

**Standard Conversion:**
```
User → Purchase → Cookie → Google Ads
Attribution: Based on cookies only
```

**Enhanced Conversion:**
```
User → Purchase → Cookie + Hashed Email/Phone → Google Ads
Attribution: Cookie + First-party data matching
Result: Better attribution, especially after cookie deletion
```

**Benefits:**
- Recover 5-15% more conversions
- Better post-iOS 14.5 attribution
- Comply with privacy regulations (data hashed)
- Improved accuracy in Ads reporting

---

### User Data Requirements

**Required (at least one):**
- Email address
- Phone number

**Recommended (improves matching):**
- First name
- Last name
- Address (street, city, state, zip, country)

**Data Format:**

| Field | Format | Example |
|-------|--------|---------|
| Email | Plain text (hashed by GTM) | "john@example.com" |
| Phone | E.164 format | "+15551234567" |
| First Name | Plain text, lowercase | "john" |
| Last Name | Plain text, lowercase | "smith" |
| Street | Plain text | "123 Main St" |
| City | Plain text | "New York" |
| Region | 2-letter state/province | "NY" |
| Postal Code | Standard format | "10001" |
| Country | 2-letter ISO code | "US" |

**Note:** Google Ads tag automatically normalizes and hashes data before sending.

---

## Variable Creation

### Extract User Data from DataLayer

**DataLayer Structure:**
```javascript
dataLayer.push({
  event: 'purchase',
  transaction_id: 'ORDER-12345',
  value: 99.99,
  currency: 'USD',
  user_data: {
    email: 'john@example.com',
    phone: '+15551234567',
    address: {
      first_name: 'John',
      last_name: 'Smith',
      street: '123 Main St',
      city: 'New York',
      region: 'NY',
      postal_code: '10001',
      country: 'US'
    }
  }
});
```

### Variables to Create

**Email Variable:**
```
Variable Name: User - Email
Type: Event Data
Key Path: user_data.email
```

**Phone Variable:**
```
Variable Name: User - Phone
Type: Event Data
Key Path: user_data.phone
```

**Address Variables:**
```
User - First Name
Type: Event Data
Key Path: user_data.address.first_name

User - Last Name
Type: Event Data
Key Path: user_data.address.last_name

User - Street
Type: Event Data
Key Path: user_data.address.street

User - City
Type: Event Data
Key Path: user_data.address.city

User - State
Type: Event Data
Key Path: user_data.address.region

User - Zip
Type: Event Data
Key Path: user_data.address.postal_code

User - Country
Type: Event Data
Key Path: user_data.address.country
```

---

## Testing

### 1. Test Conversion

**In Google Ads:**

```
Path: Google Ads → Tools → Conversions → [Your Action]

Expected Timeline:
- Conversion recorded: 30-90 minutes
- Shows in reporting: 3-6 hours
- Full attribution: 24 hours
```

**Test Steps:**

1. Enable sGTM Preview mode
2. Complete test purchase
3. Check sGTM Preview:
   - Google Ads tag fires? ✅
   - User data populated? ✅
   - Conversion value correct? ✅

4. Wait 30-90 minutes
5. Check Google Ads → Tools → Conversions
6. Look for test conversion

---

### 2. Verify Enhanced Conversions

**Path:** Google Ads → Tools → Conversions → [Action] → Summary

**Check Status:**

```
Enhanced Conversions:
┌─────────────────────────────────────────┐
│ Status: Eligible ✅                     │
│ (or "Learning" for new setup)           │
│                                          │
│ User Data Received: Yes                 │
│ Match Rate: XX%                         │
└─────────────────────────────────────────┘
```

**Status Meanings:**

| Status | Meaning | Action |
|--------|---------|--------|
| **Eligible** | Working correctly ✅ | None needed |
| **Learning** | New setup, collecting data | Wait 7 days |
| **Not enough conversions** | <10 conversions in 7 days | Continue collecting |
| **Not set up** | No user data received ❌ | Fix implementation |
| **Inactive** | Conversion action paused | Unpause action |

---

### 3. Check User Data

**In Google Ads Conversion Tag Preview:**

```
sGTM Preview → Google Ads Tag → Request

Look for:
{
  "conversion_id": "AW-1234567890",
  "conversion_label": "xYz123Abc",
  "value": 99.99,
  "currency": "USD",
  "transaction_id": "ORDER-12345",
  "em": "7c9e6679f3fd74e8..." // ← Hashed email
  "ph": "8e9d4c5b2a3f41d7..." // ← Hashed phone
}
```

If `em` and `ph` present → User data being sent ✅

---

## Multiple Conversion Actions

### Setup Multiple Actions

**Example Conversion Actions:**
- Purchase (primary)
- Lead Form Submit
- Phone Call
- Newsletter Signup

**Configuration:**

```
Tag 1: Google Ads - Purchase
Conversion ID: AW-1234567890
Conversion Label: abc123DEF
Trigger: purchase

Tag 2: Google Ads - Lead Form
Conversion ID: AW-1234567890
Conversion Label: xyz789GHI
Trigger: form_submit

Tag 3: Google Ads - Phone Call
Conversion ID: AW-1234567890
Conversion Label: mno456JKL
Trigger: phone_click
```

**Note:** Same Conversion ID, different Labels

---

## Conversion Value

### Dynamic Value

**For E-Commerce:**
```
Conversion Value: {{Ecom - Value}}
(Transaction total from dataLayer)
```

**Variable:**
```
Variable Name: Ecom - Value
Type: Event Data
Key Path: value
```

---

### Static Value

**For Non-Transactional Conversions:**
```
Conversion Value: 50
(Fixed value, e.g., $50 for a lead)
```

Use Constant variable:
```
Variable Name: Const - Lead Value
Type: Constant
Value: 50
```

---

## Troubleshooting

### Issue: Conversions Not Recording

**Check 1: Conversion ID Format**
```
Correct: AW-1234567890
Incorrect: 1234567890 (missing "AW-")
Incorrect: G-1234567890 (that's GA4)
```

**Check 2: Conversion Label**
```
Case-sensitive: "abc123DEF" ≠ "ABC123def"
Must match Google Ads exactly
```

**Check 3: Tag Firing?**
```
sGTM Preview → Google Ads Tag
Status: "Succeeded" ✅
If "Not Fired": Check trigger
```

**Check 4: Conversion Action Active?**
```
Google Ads → Tools → Conversions
Status column: "Recording conversions"
If "Paused": Unpause action
```

---

### Issue: Enhanced Conversions "Not Set Up"

**Diagnosis:**

```
Google Ads → Tools → Conversions → [Action]
Enhanced Conversions Status: Not set up ❌
```

**Possible Causes:**

1. **No User Data Sent**
   ```
   Check sGTM Preview → Google Ads Tag
   Look for "em" or "ph" in request
   If missing: User data not collected
   ```

2. **User Data Variables Empty**
   ```
   sGTM Preview → Variables tab
   Check: {{User - Email}}
   If undefined: DataLayer doesn't have user_data
   ```

3. **Enhanced Conversions Not Enabled**
   ```
   Google Ads → Tools → Conversions → [Action]
   → Edit → Enhanced conversions
   Must be: ☑ Turn on enhanced conversions
   ```

**Fix:**

1. Enable Enhanced Conversions in Google Ads conversion action
2. Ensure dataLayer includes `user_data.email` or `user_data.phone`
3. Verify sGTM variables extracting data correctly
4. Test purchase with real email/phone
5. Wait 24 hours for status to update

---

### Issue: Low Match Rate

**Symptoms:**
```
Enhanced Conversions Status: Eligible
Match Rate: 20% (Low) ⚠️
```

**Target:** 60%+ match rate

**Improvements:**

| Add This | Expected Increase |
|----------|-------------------|
| Phone (if only email) | +15-20% |
| First + Last Name | +10-15% |
| Full Address | +10-15% |
| Normalize phone to E.164 | +5-10% |

**Best Match Rates:**
- Email + Phone + Address: 80-90%
- Email + Phone: 70-80%
- Email only: 50-60%
- Phone only: 40-50%

---

## Conversion Attribution

### Attribution Models

**Path:** Google Ads → Tools → Conversions → [Action] → Settings

**Available Models:**

| Model | Description | Best For |
|-------|-------------|----------|
| **Last Click** | 100% credit to last click | Simple attribution |
| **First Click** | 100% credit to first click | Awareness campaigns |
| **Linear** | Equal credit to all clicks | Full journey view |
| **Time Decay** | More credit to recent clicks | Long sales cycles |
| **Position-Based** | 40% first, 40% last, 20% middle | Balanced view |
| **Data-Driven** | ML-based attribution | Best accuracy (recommended) |

**Recommendation:** Data-driven (requires 3000+ actions in 30 days)

---

### Conversion Window

**Setting:** Google Ads → Tools → Conversions → [Action] → Settings

```
Conversion Window:
┌─────────────────────────────────────────┐
│ Click-through window: 30 days          │
│ View-through window: 1 day              │
└─────────────────────────────────────────┘
```

**What This Means:**
- User clicks ad → 30 days to convert → Still attributed
- User sees ad (no click) → 1 day to convert → Still attributed

**Recommendations:**
- E-commerce: 30 days click, 1 day view
- Long sales cycle (B2B): 90 days click, 1 day view
- Short impulse buys: 7 days click, 1 day view

---

## Best Practices

### ✅ Do's

- ✅ Enable Enhanced Conversions on all conversion actions
- ✅ Send at least email or phone for every conversion
- ✅ Use `transaction_id` to prevent duplicate conversions
- ✅ Test conversions before launching campaigns
- ✅ Monitor "Enhanced Conversions" status weekly
- ✅ Use Data-Driven attribution when eligible
- ✅ Set appropriate conversion windows for your business
- ✅ Track all valuable actions, not just purchases

### ❌ Don'ts

- ❌ Don't send PII unhashed (sGTM handles automatically)
- ❌ Don't forget "AW-" prefix on Conversion ID
- ❌ Don't use same Label for different conversion actions
- ❌ Don't send 0 value for conversions with real value
- ❌ Don't count conversions if same transaction_id already sent
- ❌ Don't mix up Conversion ID with GA4 Measurement ID
- ❌ Don't forget to enable Enhanced Conversions in Google Ads UI

---

## Deduplication with Google Tag

### If Using Both Google Tag (gtag.js) and sGTM

**Scenario:**
- Google Tag in browser (for remarketing, etc.)
- Also sending conversions via sGTM

**Problem:** Double-counting conversions

**Solution:** Use `transaction_id` for deduplication

**Implementation:**

**Browser Google Tag:**
```javascript
gtag('event', 'conversion', {
  'send_to': 'AW-1234567890/abc123DEF',
  'value': 99.99,
  'currency': 'USD',
  'transaction_id': 'ORDER-12345'  // ← Must match
});
```

**sGTM Google Ads Tag:**
```
Transaction ID: {{Ecom - Trans ID}}
(Value: "ORDER-12345")
```

**Result:** Google Ads deduplicates automatically using transaction_id.

---

## Configuration Checklist

Before going live:

- [ ] Conversion Action created in Google Ads
- [ ] Conversion ID copied correctly (includes "AW-")
- [ ] Conversion Label copied correctly (case-sensitive)
- [ ] Constants created in sGTM
- [ ] Google Ads Tag configured
- [ ] User data variables created (email, phone minimum)
- [ ] Test conversion recorded in Google Ads
- [ ] Enhanced Conversions status = "Eligible"
- [ ] Match rate acceptable (60%+)
- [ ] Attribution model selected
- [ ] Conversion window set appropriately
- [ ] Transaction ID implementing for deduplication

---

## Advanced: Server-Side Calls Only

### Direct API Calls (No Browser Tracking)

**Use Case:** Backend conversions, subscriptions, renewals

**sGTM Configuration:**

```
Google Ads Tag:
┌─────────────────────────────────────────┐
│ Trigger: Custom event from server       │
│ (e.g., HTTP request to sGTM /collect)  │
└─────────────────────────────────────────┘

Required Parameters:
- Conversion ID
- Conversion Label
- Value
- Currency
- Transaction ID
- User data (email or phone or GCLID)
```

**Important:** Need GCLID or enhanced conversion data for attribution.

---

## Reporting

### View Conversions

**Path:** Google Ads → Campaigns → [Campaign] → Conversions column

**Key Metrics:**
- Conversions: Count of conversion actions
- Conv. value: Total value of conversions
- Cost / conv.: How much spent per conversion
- Conv. rate: % of clicks that convert

### Conversion Report

**Path:** Google Ads → Tools → Conversions

**View:**
- Total conversions by action
- Conversion value
- Attribution path (data-driven)
- Enhanced conversions match rate

---

## Support Resources

**Google Ads Documentation:**
- Enhanced Conversions: https://support.google.com/google-ads/answer/11062876
- Conversion Tracking: https://support.google.com/google-ads/answer/1722022
- Attribution Models: https://support.google.com/google-ads/answer/6259715

**sGTM Documentation:**
- Google Ads Template: Community Gallery search "Google Ads"

**Help:**
- Google Ads Support: support.google.com/google-ads
- Community: advertisercommunity.com

---

**Quick Reference Version:** 1.0.0
**Last Updated:** January 2025
**Created By:** JY/co
