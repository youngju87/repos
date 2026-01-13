# Shopify Customer Privacy Settings Checklist

**Recommended configuration for consent mode v1.1 (GPC-compliant)**

Last Updated: 2026-01-11

---

## 📍 **Path to Settings**

Shopify Admin → **Settings** → **Customer Privacy**

---

## ✅ **Configuration Checklist**

### 1. Enable Customer Privacy

- [x] **Customer privacy:** Toggle ON
  - This enables Shopify's consent management system
  - **Required** for your consent mode script to work

---

### 2. Banner Requirements

**Setting:** "Where should the consent banner be shown?"

✅ **Recommended:** Select **"All visitors"**

**Why:**
- Your v1.1 consent mode requires global consent
- Ensures US, Canada, and all other regions see banner
- Matches GPC and CCPA compliance requirements

**Alternative (if you want granular control):**

✅ Select **"Visitors from specific countries/regions"**

Then add ALL regions where you have customers:
- [x] United States (CCPA)
- [x] Canada (Quebec Law 25)
- [x] European Union (GDPR)
- [x] United Kingdom (UK GDPR)
- [x] Brazil (LGPD)
- [x] Australia (Privacy Act)
- [x] Japan (APPI)
- [x] Other regions as applicable

**❌ DON'T select:** "Automatic" - gives Shopify too much control

---

### 3. Consent Categories

**Setting:** "What types of consent should customers provide?"

✅ **Required selections:**

- [x] **Analytics cookies**
  - Maps to: `analytics_storage`
  - Used for: GA4, analytics tracking

- [x] **Marketing cookies**
  - Maps to: `ad_storage`, `ad_user_data`, `ad_personalization`
  - Used for: Google Ads, Meta Pixel, remarketing

**Optional:**

- [ ] **Preference cookies** (optional)
  - Maps to: `personalization_storage`
  - Used for: UI preferences, language settings
  - **Note:** Your script auto-grants `functionality_storage` (cart, login)

**Why these two are critical:**
- Matches Google Consent Mode v2 categories
- Allows granular user control
- GDPR requires granular options

---

### 4. Banner Customization

**Setting:** Customize banner appearance and text

#### Banner Title:
```
We value your privacy
```

#### Banner Description:
```
We use cookies to improve your experience, analyze site traffic,
and show you personalized content and ads.

You can accept all cookies, decline, or manage your preferences.
We respect Global Privacy Control (GPC) and Do Not Track signals.

Learn more in our Privacy Policy.
```

**Character limits:** Keep under 300 characters for mobile

**Tone:** Clear, honest, user-friendly (not legal jargon)

---

### 5. Button Configuration

**Setting:** Configure consent buttons

✅ **Required buttons:**

**Accept Button:**
- Text: "Accept All Cookies"
- Style: Primary button (colored)
- Action: Grant all consent

**Decline Button:**
- Text: "Decline All"
- Style: Secondary button (NOT hidden or tiny)
- Action: Deny all consent
- **Critical:** Must be equally prominent as Accept

**Manage Preferences Button (if available):**
- Text: "Manage Preferences"
- Style: Tertiary/link button
- Action: Show granular options

**❌ Dark Patterns to AVOID:**
- Big "Accept" button, tiny "Decline" link
- Pre-checked consent boxes
- Multiple clicks required to decline
- Confusing language

---

### 6. Privacy Policy Link

**Setting:** Link to privacy policy

✅ **Required:**
- [x] Link privacy policy in banner
- [x] URL: `/pages/privacy-policy` or `/policies/privacy-policy`

**What privacy policy should include:**
1. What data you collect (cookies, IP, behavior)
2. Why you collect it (analytics, ads, personalization)
3. Third parties (Google, Meta, Microsoft)
4. How to opt-out (banner + GPC)
5. Data retention (how long you keep data)
6. User rights (access, deletion, portability)
7. GPC support statement
8. Contact information

**Template GPC statement for privacy policy:**
```
We respect Global Privacy Control (GPC) signals. If your browser
sends a GPC signal, we will automatically opt you out of data
sharing and targeted advertising. You can override this preference
using our consent banner.
```

---

### 7. Cookie Preferences Link (Footer)

**Setting:** Show cookie preferences link

✅ **Enable:**
- [x] Show "Cookie Preferences" link in footer

**Why:**
- Allows users to change mind after initial choice
- GDPR requirement (easy withdrawal)
- Shows you respect privacy

**Location:** Automatically appears in footer as "Cookie Preferences" or "Privacy Settings"

---

### 8. Re-consent Trigger

**Setting:** When should customers be asked to consent again?

✅ **Recommended:**

**Option A:** "When privacy policy changes"
- [x] Re-prompt when policy updated
- Ensures users aware of changes
- GDPR best practice

**Option B:** "Never" (unless required)
- Respects user choice
- Less annoying
- But must re-prompt if policy materially changes

**❌ DON'T:** Re-prompt too frequently (monthly)
- Annoying user experience
- Reduces consent rate
- May violate "no means no" principle

---

### 9. Consent Storage

**Setting:** How long to remember user choice

✅ **Recommended:** **365 days** (1 year)

**Why:**
- Balance between respecting choice and staying current
- GDPR allows up to 13 months
- Matches Google's consent cookie lifetime

**❌ DON'T:**
- Set too short (30 days) - annoying
- Set too long (5 years) - privacy concern

---

### 10. GPC Support (Manual Configuration)

**Note:** Shopify may not have built-in GPC toggle (as of 2026-01-11)

**Your consent mode script handles GPC automatically:**
- ✅ Detects `navigator.globalPrivacyControl`
- ✅ Auto-denies if GPC enabled
- ✅ No Shopify setting needed

**But you should mention GPC in:**
1. Banner description (see above)
2. Privacy policy
3. Cookie preferences page

---

## 🎯 **Shopify Theme Integration**

### Verify Consent Mode Snippet Placement

**In your theme.liquid file:**

```liquid
<!-- CORRECT ORDER (in <head>): -->

<!-- 1. FIRST: Consent Mode (must load before everything) -->
{% render 'shopify-privacy-consent-mode' %}

<!-- 2. SECOND: DataLayer -->
{% render 'gold-storefront-datalayer-GA4-enhanced' %}

<!-- 3. THIRD: Any other tracking scripts -->
```

**Why order matters:**
1. Consent mode sets default (denied)
2. DataLayer checks consent state
3. Other scripts respect consent

---

## 🧪 **Testing Your Configuration**

### Test Checklist

- [ ] **Banner appears for US visitors**
  - Clear cookies
  - Visit site from US IP
  - Banner should show

- [ ] **Banner appears for EU visitors**
  - Use VPN to UK/Germany
  - Clear cookies
  - Banner should show

- [ ] **Decline button works**
  - Click "Decline"
  - Console shows: `consent_updated` with `denied`
  - No tracking cookies set

- [ ] **Accept button works**
  - Click "Accept"
  - Console shows: `consent_updated` with `granted`
  - GA4/Google Ads cookies set

- [ ] **GPC respected**
  - Enable GPC in browser (Privacy Badger extension)
  - Visit site
  - Console shows: `consent_gpc_detected`
  - Consent auto-denied

- [ ] **Preferences link in footer**
  - Scroll to footer
  - Look for "Cookie Preferences" link
  - Click it → Banner reappears
  - Can change choice

- [ ] **Consent persists**
  - Accept consent
  - Navigate to another page
  - No banner (consent saved)
  - Refresh → Still no banner

---

## 📊 **Shopify Analytics Integration**

### Settings → Analytics

**Additional settings to check:**

#### 1. Customer Privacy Settings

- [x] **Use customer privacy consent**
  - Ensures Shopify respects consent for its own analytics

#### 2. Sales Attribution

- [x] **Last indirect click** (recommended)
  - Maintains attribution even with consent denied
  - Uses cookieless tracking when necessary

#### 3. Marketing Attribution

**Setting:** How to attribute conversions

✅ **Recommended:** "Last click" or "Linear"
- Works with consent mode
- Doesn't require cross-domain tracking

---

## 🔒 **Privacy-First Best Practices**

### 1. Clear Communication

**Banner should:**
- ✅ Explain what you track (analytics, ads)
- ✅ Explain why (improve experience)
- ✅ Explain how to opt-out (decline button + GPC)
- ✅ Link to privacy policy
- ❌ Don't use legal jargon
- ❌ Don't hide decline button

### 2. Respect User Choice

**Never:**
- ❌ Re-prompt immediately after decline
- ❌ Block content if user declines
- ❌ Make decline harder than accept
- ❌ Use pre-checked boxes
- ❌ Ignore GPC signals

**Always:**
- ✅ Honor decline permanently (until policy changes)
- ✅ Allow easy preference changes
- ✅ Work without tracking (site functionality)
- ✅ Respect GPC and DNT signals

### 3. Granular Control

**Provide options:**
- ✅ Accept all
- ✅ Decline all
- ✅ Manage preferences (granular)

**Example granular options:**
```
☐ Analytics cookies (required for site improvement)
☐ Marketing cookies (used for personalized ads)
☐ Social media cookies (for social sharing)
```

### 4. Transparent Data Use

**Privacy policy should include:**
- What: Data collected (cookies, IP, behavior)
- Why: Purpose (analytics, ads, functionality)
- Who: Third parties (Google, Meta, Microsoft)
- How long: Retention period
- How to: Opt-out mechanisms (banner, GPC, email)

---

## 🚨 **Common Mistakes to Avoid**

### ❌ Mistake 1: "Automatic" Banner Mode

**Problem:** Shopify decides when to show banner (may not match your needs)

**Solution:** Use "All visitors" or "Custom regions"

### ❌ Mistake 2: Only EU Consent

**Problem:** Violates CCPA, Quebec Law 25, GPC requirements

**Solution:** Enable for US, Canada, and other regions

### ❌ Mistake 3: No Decline Button

**Problem:** GDPR violation, coercive consent

**Solution:** Prominent decline button, equal to accept

### ❌ Mistake 4: Ignoring GPC

**Problem:** CCPA violation (California requires GPC support)

**Solution:** Your v1.1 consent mode script handles this automatically

### ❌ Mistake 5: Re-prompting Too Often

**Problem:** Annoying users, violates "no means no"

**Solution:** Only re-prompt on policy changes or after 1 year

---

## ✅ **Final Configuration Summary**

**Your Shopify Settings Should Be:**

```
Customer Privacy:
├─ Enable: ✅ ON
├─ Banner for: ✅ All visitors
├─ Consent types: ✅ Analytics + Marketing
├─ Banner text: ✅ Clear, mentions GPC
├─ Decline button: ✅ Prominent, equal to Accept
├─ Privacy policy: ✅ Linked
├─ Footer link: ✅ "Cookie Preferences" shown
├─ Re-consent: ✅ On policy changes or 365 days
└─ Storage: ✅ 365 days
```

**Your Consent Mode Script:**
- ✅ v1.1 installed
- ✅ GPC support enabled
- ✅ All regions require consent
- ✅ Loads BEFORE dataLayer

**Result:**
- ✅ GDPR compliant
- ✅ CCPA compliant (GPC support)
- ✅ Quebec Law 25 compliant
- ✅ Privacy-first
- ✅ User-friendly

---

## 📞 **Questions?**

**Need help with Shopify settings?**
Email: contact@jyinsights.com

**Want to verify compliance?**
See: `PRIVACY-COMPLIANCE-GUIDE.md`

**Testing procedures:**
See: `CONSENT-MODE-IMPLEMENTATION-GUIDE.md`

---

**Last Updated:** 2026-01-11
**Compatible With:** Consent Mode v1.1 (GPC-compliant)
**Shopify Version:** All versions (Classic & 2.0)
