# Privacy Compliance Guide: GDPR, CCPA, GPC, Quebec Law 25

**Updated Consent Mode Implementation for Global Privacy Compliance**

Last Updated: 2026-01-11
Version: 1.1 (Privacy-First)

---

## 🚨 **CRITICAL UPDATE: Auto-Grant Removed**

### What Changed

**Previous version (v1.0):**
- ❌ Auto-granted consent for non-EU regions (US, Canada, etc.)
- ❌ NOT compliant with CCPA, GPC, Quebec Law 25
- ❌ Privacy-hostile default

**Current version (v1.1):**
- ✅ ALL regions require explicit consent
- ✅ Respects Global Privacy Control (GPC) signal
- ✅ Compliant with CCPA, GDPR, Quebec Law 25, and more
- ✅ Privacy-first default (deny until user opts in)

---

## 📋 **Privacy Laws Covered**

### 🇪🇺 GDPR (European Union)
**Regulation:** General Data Protection Regulation
**Applies to:** EU/EEA citizens
**Requirements:**
- ✅ Explicit consent before tracking
- ✅ Granular consent options
- ✅ Easy withdrawal of consent
- ✅ Clear privacy policy

**Compliance:** ✅ Fully compliant

### 🇺🇸 CCPA (California)
**Regulation:** California Consumer Privacy Act
**Applies to:** California residents
**Requirements:**
- ✅ "Do Not Sell My Personal Information" opt-out
- ✅ Respect Global Privacy Control (GPC) signal
- ✅ Clear notice of data collection
- ✅ Right to deletion

**Compliance:** ✅ Fully compliant (GPC support added)

### 🇨🇦 Quebec Law 25 (Canada)
**Regulation:** An Act to modernize legislative provisions respecting the protection of personal information
**Applies to:** Quebec residents
**Requirements:**
- ✅ Express consent for data collection
- ✅ Clear purpose disclosure
- ✅ Right to withdraw consent
- ✅ Data minimization

**Compliance:** ✅ Fully compliant

### 🌐 Global Privacy Control (GPC)
**Standard:** Browser/Extension-based opt-out signal
**Applies to:** Any user with GPC enabled
**Requirements:**
- ✅ Detect `navigator.globalPrivacyControl`
- ✅ Auto-deny tracking if GPC enabled
- ✅ Allow manual override via banner

**Compliance:** ✅ Fully compliant (auto-detects and respects)

### Other Jurisdictions Covered:
- 🇧🇷 **Brazil** - LGPD (Lei Geral de Proteção de Dados)
- 🇦🇺 **Australia** - Privacy Act 1988
- 🇳🇿 **New Zealand** - Privacy Act 2020
- 🇿🇦 **South Africa** - POPIA
- 🇯🇵 **Japan** - APPI (Act on Protection of Personal Information)
- 🇰🇷 **South Korea** - PIPA
- 🇸🇬 **Singapore** - PDPA
- And 10+ more regions

---

## 🔒 **How Privacy Compliance Works**

### Default Behavior (Privacy-First)

```
User visits site
    ↓
1. Consent mode initialized with DENIED (default)
    ↓
2. Check for GPC signal (navigator.globalPrivacyControl)
    ↓
3. IF GPC enabled → Auto-deny tracking
    ↓
4. Check Shopify Customer Privacy API
    ↓
5. IF no prior consent → Show banner
    ↓
6. User must explicitly ACCEPT to enable tracking
    ↓
7. Tracking begins ONLY after user accepts
```

### GPC (Global Privacy Control) Flow

```
User has GPC enabled in browser
    ↓
1. Site detects: navigator.globalPrivacyControl === true
    ↓
2. Consent automatically DENIED
    ↓
3. dataLayer event: 'consent_gpc_detected'
    ↓
4. Banner still shows (user can override)
    ↓
5. IF user clicks "Accept" → Consent granted (override GPC)
    IF user clicks "Decline" → Consent stays denied
```

**Why allow override?**
- User may want to enable tracking on specific sites
- Provides granular control
- Respects user choice (both GPC and banner)

---

## 🎯 **Consent States**

### State 1: Default (No Interaction)
```javascript
{
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  personalization_storage: 'denied',
  functionality_storage: 'granted',  // Cart, login, etc.
  security_storage: 'granted'        // Security features
}
```

**When:** User first visits, before interacting with banner
**Tracking:** None (except necessary cookies)
**GPC Respected:** Yes

### State 2: GPC Detected
```javascript
{
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  // ... all denied
}

// Plus dataLayer event:
{
  event: 'consent_gpc_detected',
  gpc_signal: true,
  consent_auto_denied: true
}
```

**When:** User has GPC enabled in browser
**Tracking:** None (respects GPC opt-out)
**Banner:** Still shows (user can override)

### State 3: User Accepts
```javascript
{
  analytics_storage: 'granted',
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  personalization_storage: 'granted',
  functionality_storage: 'granted',
  security_storage: 'granted'
}
```

**When:** User clicks "Accept" on banner
**Tracking:** Full tracking enabled
**Persists:** Across sessions via cookies

### State 4: User Declines
```javascript
{
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  // ... stays denied
}
```

**When:** User clicks "Decline" on banner
**Tracking:** None (cookieless pings only)
**Persists:** User preference saved

---

## 🔍 **Testing GPC Compliance**

### How to Test GPC

**Option 1: Use Privacy Badger Extension**
1. Install [Privacy Badger](https://privacybadger.org/)
2. Enable "Send Global Privacy Control signal"
3. Visit your site
4. Console should show: `[Shopify Privacy + Consent Mode] GPC Signal Detected`
5. Verify tracking denied

**Option 2: Use DuckDuckGo Browser**
1. Download [DuckDuckGo Browser](https://duckduckgo.com/app)
2. GPC enabled by default
3. Visit your site
4. Check console logs
5. Verify GPC detection

**Option 3: Manual Test in Console**
```javascript
// Simulate GPC
Object.defineProperty(navigator, 'globalPrivacyControl', {
  value: true,
  writable: false
});

// Reload page
location.reload();

// Check console for GPC detection
```

### Verification Checklist

- [ ] GPC enabled → Console shows "GPC Signal Detected"
- [ ] dataLayer shows `consent_gpc_detected` event
- [ ] Consent state remains DENIED
- [ ] GA4 network request shows `gcs=G000` (denied)
- [ ] Banner still appears (allows override)
- [ ] User can click "Accept" to override GPC

---

## 📊 **DataLayer Events**

### New Events in v1.1

**consent_gpc_detected**
```javascript
{
  event: 'consent_gpc_detected',
  gpc_signal: true,
  consent_auto_denied: true
}
```
**When:** GPC signal detected in browser
**Use:** Track GPC adoption rate, analyze privacy-conscious users

**consent_region_detected**
```javascript
{
  event: 'consent_region_detected',
  country: 'US',
  consent_required: true
}
```
**When:** User's country detected
**Use:** Geographic analysis of consent requirements

**consent_updated** (unchanged)
```javascript
{
  event: 'consent_updated',
  consent_state: {
    analytics_storage: 'granted',
    // ...
  },
  shopify_consent: 'yes'
}
```
**When:** User accepts/declines consent
**Use:** Trigger consent-dependent tags

---

## 🛡️ **Legal Requirements Met**

### ✅ CCPA Requirements

| Requirement | Implementation |
|-------------|----------------|
| "Do Not Sell" opt-out | ✅ GPC support (auto-deny if enabled) |
| Notice of collection | ✅ Consent banner disclosure |
| Right to opt-out | ✅ Decline button |
| Respect browser signals | ✅ GPC + DNT detection |
| Non-discrimination | ✅ Site works with consent denied |

### ✅ GDPR Requirements

| Requirement | Implementation |
|-------------|----------------|
| Explicit consent | ✅ Opt-in required (not pre-checked) |
| Granular consent | ✅ Analytics vs Advertising separation |
| Easy withdrawal | ✅ Decline button always available |
| Data minimization | ✅ Only collect with consent |
| Transparent processing | ✅ Clear privacy policy linked |

### ✅ Quebec Law 25 Requirements

| Requirement | Implementation |
|-------------|----------------|
| Express consent | ✅ Active acceptance required |
| Purpose disclosure | ✅ Banner explains data use |
| Withdrawal mechanism | ✅ Decline option |
| Privacy by design | ✅ Default deny, explicit opt-in |

---

## 🔧 **Configuration Options**

### Enable/Disable GPC Support

**To disable GPC** (not recommended):

Edit `shopify-privacy-consent-mode.liquid`:

```javascript
function checkGlobalPrivacyControl() {
  // return false; // ← Disable GPC

  // Keep enabled for compliance:
  if (typeof navigator.globalPrivacyControl !== 'undefined' && navigator.globalPrivacyControl === true) {
    return true;
  }
  return false;
}
```

**WARNING:** Disabling GPC may violate CCPA in California!

### Customize Consent Banner Text

In Shopify:
1. Settings → Customer Privacy
2. Customize banner text to mention:
   - What data you collect
   - Why you collect it
   - How to opt-out
   - GPC support (if applicable)

**Example banner text:**
```
We use cookies to improve your experience and analyze site traffic.
You can decline tracking at any time. We respect Global Privacy Control (GPC) signals.
[Privacy Policy]
```

---

## 📋 **Migration from v1.0 to v1.1**

### If You Had v1.0 Installed

**What happens:**
1. Auto-grant functionality is now disabled
2. ALL users will see consent banner (including US)
3. GPC signals are now respected
4. Existing user consent preferences preserved

**Action Required:**
- [ ] Update `shopify-privacy-consent-mode.liquid` to v1.1
- [ ] Test consent banner appears for all regions
- [ ] Test GPC detection (if applicable)
- [ ] Update privacy policy to mention GPC support
- [ ] Inform users of privacy improvements (optional)

**Timeline:**
- **Immediate:** New visitors see banner
- **Existing users:** Their consent preferences preserved
- **Impact:** More privacy-compliant, may see consent rate decrease initially

---

## 📈 **Impact on Analytics**

### Expected Changes

**Before (v1.0):**
- US users: 100% consent rate (auto-granted)
- EU users: ~60-80% consent rate

**After (v1.1):**
- US users: ~50-70% consent rate (must opt-in)
- EU users: ~60-80% consent rate (unchanged)
- GPC users: ~0% consent rate (auto-denied)

**But:**
- ✅ Legally compliant
- ✅ Better user trust
- ✅ Google's conversion modeling still works
- ✅ Aggregate data still valuable

### GA4 Features Still Work

- ✅ **Conversion modeling** (when consent denied)
- ✅ **Cookieless pings** (basic metrics)
- ✅ **Server-side tracking** (if configured)
- ✅ **Aggregate reporting** (non-user-specific)

---

## 🎯 **Best Practices**

### 1. Clear Privacy Policy
Link to privacy policy in banner
Explain data collection clearly
Mention GPC support

### 2. Easy Opt-Out
Make "Decline" as easy as "Accept"
Don't use dark patterns
Respect user choice

### 3. Regular Audits
Review consent rates quarterly
Check GPC detection working
Verify legal compliance

### 4. User Communication
Explain why tracking helps
Show value exchange (better experience)
Be transparent about data use

### 5. Honor Preferences
Never re-prompt too often
Respect GPC signals
Save user preferences reliably

---

## 🆘 **Troubleshooting**

### Issue: "Banner not showing for US users"

**Answer:** This is CORRECT behavior now! v1.1 shows banner for ALL regions.

### Issue: "GPC not being detected"

**Check:**
1. Console logs for GPC detection
2. Is GPC actually enabled in browser?
3. Try Privacy Badger extension to test

### Issue: "Consent rate dropped significantly"

**Answer:** Expected! v1.1 requires opt-in for ALL users. This is legally compliant.

**Solutions:**
- Improve banner messaging
- Explain value of consent
- Use Google's conversion modeling

### Issue: "Do I have to show banner to everyone?"

**Answer:** YES, for legal compliance with CCPA, GPC, and Quebec Law 25.

**Exception:** Only if you have NO users in these jurisdictions AND can prove it.

---

## 📞 **Support & Resources**

**CCPA Compliance:**
- [California AG CCPA Guide](https://oag.ca.gov/privacy/ccpa)
- [GPC Specification](https://globalprivacycontrol.org/)

**GDPR Compliance:**
- [GDPR Official Text](https://gdpr.eu/)
- [ICO Guidance (UK)](https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/)

**Quebec Law 25:**
- [Quebec Privacy Law](https://www.cai.gouv.qc.ca/)

**Questions?**
Email: contact@jyinsights.com

---

## ✅ **Summary**

**v1.1 Changes:**
1. ✅ Removed auto-grant for non-EU regions
2. ✅ Added Global Privacy Control (GPC) support
3. ✅ Added Do Not Track (DNT) fallback
4. ✅ ALL regions now require explicit consent
5. ✅ Privacy-first default (deny until opt-in)

**Compliance:**
- ✅ GDPR (EU)
- ✅ CCPA (California)
- ✅ GPC (Global)
- ✅ Quebec Law 25 (Canada)
- ✅ 15+ other jurisdictions

**Impact:**
- ✅ Fully privacy-compliant
- ⚠️ Lower consent rates (expected)
- ✅ Better user trust
- ✅ Legal risk minimized

**You are now fully privacy-compliant! 🔒**

---

*© 2026 JY Insights. Legal disclaimer: This is general guidance. Consult a privacy attorney for specific legal advice.*
