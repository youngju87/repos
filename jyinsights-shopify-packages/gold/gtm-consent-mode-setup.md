# GTM Consent Mode Configuration Guide v2.1

**Quick setup for Google & Microsoft Consent Mode in GTM**

---

## 🚀 Quick Start: Import Pre-Configured Container

**The fastest way to set up consent mode is to import our pre-configured GTM container:**

### Option 1: Import consent-mode-container-v2.1.json (RECOMMENDED)

1. **Download** `consent-mode-container-v2.1.json` from the package
2. **Open GTM** → Admin → Import Container
3. **Choose** `consent-mode-container-v2.1.json`
4. **Select** "Merge" (to keep existing tags) or "Overwrite" (clean install)
5. **Import** and publish

**What's Included:**
- ✅ 12 Data Layer Variables (all consent states)
- ✅ 6 Custom Event Triggers (consent events)
- ✅ Pre-configured for Shopify Privacy API v2.1
- ✅ Google Consent Mode v2 compliant
- ✅ Microsoft Consent Mode support

**Time to Complete:** 2 minutes

---

## 🛠️ Option 2: Manual Setup (if you prefer)

If you want to create variables and triggers manually instead of importing, follow the guide below.

---

## Variables to Create

### 1. Consent State Variables (Google)

#### Variable: `Consent - Analytics Storage`
```
Type: Data Layer Variable
Data Layer Variable Name: consent_state.analytics_storage
Default Value: denied
```

#### Variable: `Consent - Ad Storage`
```
Type: Data Layer Variable
Data Layer Variable Name: consent_state.ad_storage
Default Value: denied
```

#### Variable: `Consent - Ad User Data`
```
Type: Data Layer Variable
Data Layer Variable Name: consent_state.ad_user_data
Default Value: denied
```

#### Variable: `Consent - Ad Personalization`
```
Type: Data Layer Variable
Data Layer Variable Name: consent_state.ad_personalization
Default Value: denied
```

### 2. Microsoft Consent Variables

#### Variable: `Microsoft - Analytics Consent`
```
Type: Data Layer Variable
Data Layer Variable Name: microsoft_analytics_consent
Default Value: false
```

#### Variable: `Microsoft - Advertising Consent`
```
Type: Data Layer Variable
Data Layer Variable Name: microsoft_advertising_consent
Default Value: false
```

### 3. Shopify Consent Variable

#### Variable: `Shopify - Tracking Consent`
```
Type: Data Layer Variable
Data Layer Variable Name: shopify_consent
Default Value: no_interaction
```

---

## Triggers to Create

### 1. Consent Updated Event

#### Trigger: `Event - Consent Updated`
```
Type: Custom Event
Event name: consent_updated
This trigger fires on: All Custom Events
```

### 2. Analytics Consent Granted

#### Trigger: `Consent - Analytics Granted`
```
Type: Custom Event
Event name: consent_updated
This trigger fires on: Some Custom Events
Conditions:
  - Consent - Analytics Storage equals granted
```

### 3. Advertising Consent Granted

#### Trigger: `Consent - Advertising Granted`
```
Type: Custom Event
Event name: consent_updated
This trigger fires on: Some Custom Events
Conditions:
  - Consent - Ad Storage equals granted
```

### 4. Microsoft Advertising Consent Granted

#### Trigger: `Consent - Microsoft Advertising Granted`
```
Type: Custom Event
Event name: microsoft_consent_updated
This trigger fires on: Some Custom Events
Conditions:
  - Microsoft - Advertising Consent equals true
```

---

## Tag Configuration

### Existing GA4 Config Tag

**No changes needed!** GA4 automatically respects Consent Mode v2.

But you can verify:

1. Open your GA4 Configuration tag
2. Go to **Advanced Settings > Consent Settings**
3. Should show: **"Not set"** (this means auto-detect)

### Existing Google Ads Tags

**No changes needed!** Google Ads automatically respects Consent Mode v2.

### Meta Pixel Tags (If Used)

Add consent trigger:

1. Open Meta Pixel tag
2. **Triggering section:**
   - Add: `Consent - Advertising Granted`
   - Remove: `All Pages` (if consent is required)

### Microsoft Ads Tags (If Used)

#### Option A: Use Trigger
1. Open Microsoft UET tag
2. **Triggering:**
   - Add: `Consent - Microsoft Advertising Granted`

#### Option B: Use Custom JavaScript Variable

Create variable `Microsoft - UET Consent Check`:
```javascript
function() {
  return window.microsoftConsentState && window.microsoftConsentState.advertising;
}
```

Then in UET tag:
- **Triggering:** Add condition
- **Fire when:** `Microsoft - UET Consent Check` equals `true`

---

## Testing Your Setup

### Test 1: Check Variables

1. **Enable GTM Preview**
2. **Visit your site**
3. **In GTM Debug:**
   - Go to **Variables** tab
   - Search for "Consent"
   - Should show all consent variables

### Test 2: Accept Consent

1. **Clear cookies**
2. **Visit site**
3. **Click "Accept" on banner**
4. **In GTM Debug:**
   - Look for `consent_updated` event
   - Check variables:
     - `Consent - Analytics Storage`: `granted`
     - `Consent - Ad Storage`: `granted`
   - Look for `microsoft_consent_updated` event
   - Check variables:
     - `Microsoft - Analytics Consent`: `true`
     - `Microsoft - Advertising Consent`: `true`

### Test 3: Decline Consent

1. **Clear cookies**
2. **Visit site**
3. **Click "Decline" on banner**
4. **In GTM Debug:**
   - Variables should remain `denied` / `false`
   - Marketing tags should NOT fire

---

## Quick Import (JSON)

Can't create manually? Use the pre-built container file!

### Import Pre-Built Container

**File:** `consent-mode-container.json`

This file contains:
- 3 consent variables (Analytics Storage, Ad Storage, Microsoft Advertising)
- 2 triggers (Consent Updated, Advertising Granted)

### How to Import:

1. **In GTM, go to:**
   ```
   Admin > Import Container
   ```

2. **Choose container file:**
   - Select: `consent-mode-container.json`
   - Or drag and drop into GTM

3. **Choose workspace:**
   - Select: "Existing" (to merge with current setup)
   - Or: "New" (to create fresh workspace)

4. **Import option:**
   - Select: **"Merge"** (recommended)
   - This adds variables/triggers without deleting existing ones

5. **Conflict strategy:**
   - Select: "Rename conflicting tags/triggers/variables"

6. **Click: "Confirm"**

7. **Preview and test:**
   - Enable Preview mode
   - Test consent flow
   - Verify variables populate

8. **Publish when ready**

### What Gets Imported:

✅ **Variables:**
- Consent - Analytics Storage
- Consent - Ad Storage
- Microsoft - Advertising Consent

✅ **Triggers:**
- Event - Consent Updated
- Consent - Advertising Granted

### After Import:

You can manually add the other variables/triggers from the sections above if needed:
- Consent - Ad User Data
- Consent - Ad Personalization
- Microsoft - Analytics Consent
- Consent - Analytics Granted
- Consent - Microsoft Advertising Granted

---

## Summary

✅ **What You Created:**
- 7 variables for consent tracking
- 4 triggers for consent events
- Ready for GA4, Google Ads, Microsoft Ads, Meta Pixel

✅ **What Happens Next:**
- Tags automatically respect user consent
- Marketing tags only fire when consent granted
- Analytics uses conversion modeling when denied

✅ **No Code Changes:**
- Your existing tags work as-is
- Just add consent triggers to tags that need them

---

**Need help?** Email: contact@jyinsights.com
