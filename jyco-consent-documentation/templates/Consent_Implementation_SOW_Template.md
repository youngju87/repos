# Statement of Work: Consent Management Implementation

**JY/co Consent & Privacy Implementation Services**

---

## Client Information

**Client Name:** [CLIENT NAME]
**Website:** [CLIENT WEBSITE URL]
**Primary Contact:** [NAME, EMAIL, PHONE]
**Project Start Date:** [DATE]
**Estimated Completion:** [DATE]

---

## Project Overview

### Objective

Implement a comprehensive consent management solution using Cookiebot CMP integrated with Google Consent Mode v2 to ensure compliance with GDPR, CCPA, and other global privacy regulations while maintaining marketing measurement capabilities.

### Business Goals

- ✅ Achieve GDPR compliance for EU/EEA visitors
- ✅ Implement CCPA-compliant consent for California visitors
- ✅ Maintain Google Ads remarketing capabilities (with consent)
- ✅ Enable conversion tracking with consent modeling
- ✅ Preserve analytics measurement accuracy
- ✅ Build trust with transparent privacy practices

---

## Scope of Work

### Phase 1: Discovery & Planning (Week 1)

#### 1.1 Technical Audit

**Activities:**
- Review current website tracking implementation
- Inventory all cookies and trackers currently in use
- Document current GTM container configuration
- Identify all third-party scripts (analytics, advertising, etc.)
- Assess current compliance posture

**Deliverables:**
- Technical audit report
- Cookie inventory spreadsheet
- Gap analysis (current vs. compliant state)

#### 1.2 Requirements Gathering

**Activities:**
- Identify target markets and applicable regulations
- Define consent banner requirements (languages, design)
- Document business requirements (remarketing, analytics, etc.)
- Determine regional consent strategies

**Deliverables:**
- Requirements documentation
- Implementation plan

---

### Phase 2: Cookiebot Setup & Configuration (Week 1-2)

#### 2.1 Cookiebot Account Setup

**Activities:**
- Create/configure Cookiebot account
- Add client domain(s)
- Configure scan settings
- Run initial comprehensive cookie scan

**Deliverables:**
- Cookiebot account provisioned
- Initial scan results

#### 2.2 Cookie Categorization

**Activities:**
- Review all detected cookies
- Categorize cookies (Necessary, Preferences, Statistics, Marketing)
- Research unknown cookies
- Write accurate cookie descriptions
- Verify compliance of categorizations

**Deliverables:**
- Fully categorized cookie inventory
- Cookie declaration ready for publication

#### 2.3 Banner Design & Configuration

**Activities:**
- Design consent banner matching brand guidelines
- Configure banner text (GDPR/CCPA compliant language)
- Set up multi-language support (if needed)
- Configure geo-targeting rules
- Implement accessibility requirements (WCAG AA)

**Deliverables:**
- Consent banner configured
- Preview/mockups approved by client
- Multi-language translations completed

---

### Phase 3: Google Consent Mode v2 Integration (Week 2)

#### 3.1 Consent Mode Implementation

**Activities:**
- Verify script loading order (Cookiebot before GTM)
- Configure Consent Mode default states
- Map Cookiebot categories to Consent Mode signals
- Implement regional consent defaults (EEA vs. US, etc.)
- Verify all v2 signals present (ad_user_data, ad_personalization)

**Deliverables:**
- Consent Mode v2 fully operational
- Regional configurations active

#### 3.2 GA4 Configuration

**Activities:**
- Update GA4 Configuration tag with consent settings
- Enable Google Signals (for conversion modeling)
- Configure built-in consent checks
- Verify consent state passes to GA4

**Deliverables:**
- GA4 respecting consent state
- Consent Mode status "Active" in GA4 Admin

---

### Phase 4: Marketing Platform Integration (Week 2-3)

#### 4.1 Google Ads

**Activities:**
- Configure Google Ads Conversion tags with consent
- Add Conversion Linker tag
- Set up Enhanced Conversions (if applicable)
- Configure remarketing tags with consent
- Verify v2 signals for EEA compliance

**Deliverables:**
- Google Ads conversion tracking operational
- Enhanced Conversions configured (if applicable)
- Remarketing compliant with EEA requirements

#### 4.2 Meta (Facebook) Pixel

**Activities:**
- Implement Meta Pixel with consent gate
- Configure pixel to block until marketing consent
- Set up event tracking (ViewContent, AddToCart, Purchase, etc.)
- Implement Limited Data Use for CCPA (if applicable)
- Configure Conversions API (if in scope)

**Deliverables:**
- Meta Pixel consent-compliant
- Events tracking correctly
- LDU mode configured for California users (if applicable)

#### 4.3 TikTok Pixel

**Activities:**
- Implement TikTok Pixel with consent gate
- Configure event tracking
- Set up conversion events
- Verify pixel blocked until consent

**Deliverables:**
- TikTok Pixel consent-compliant
- Events tracking with consent

#### 4.4 Other Platforms

**Platforms (as applicable):**
- LinkedIn Insight Tag
- Pinterest Tag
- Twitter/X Pixel
- Hotjar (statistics)
- Microsoft Clarity (statistics)
- [Other platforms as needed]

**Activities:**
- Implement each platform with appropriate consent gating
- Configure event tracking
- Test consent flow

**Deliverables:**
- All platforms consent-compliant
- Event tracking operational

---

### Phase 5: GTM Configuration (Week 2-3)

#### 5.1 GTM Variables & Triggers

**Activities:**
- Create Cookiebot consent state variables
- Create consent-based triggers (marketing, statistics, preferences)
- Configure dataLayer event triggers
- Organize container with folders/naming conventions

**Deliverables:**
- GTM variables created
- Consent triggers configured
- Container organized

#### 5.2 Tag Configuration

**Activities:**
- Update all tags to respect consent
- Remove any duplicate tags
- Configure tag firing priorities (if needed)
- Implement tag sequencing (if needed)
- Add documentation/notes to tags

**Deliverables:**
- All tags consent-aware
- Container optimized
- Documentation added

---

### Phase 6: Testing & Quality Assurance (Week 3)

#### 6.1 Functional Testing

**Test Cases:**
- ✅ Banner displays on first visit
- ✅ Deny All: No marketing/statistics tags fire
- ✅ Accept All: All tags fire correctly
- ✅ Customize: Granular consent works
- ✅ Consent remembered on return visit
- ✅ Consent can be changed via banner reopening
- ✅ Mobile responsiveness
- ✅ Cross-browser compatibility (Chrome, Safari, Firefox, Edge)

**Deliverables:**
- Test plan executed
- Test results documented
- Issues identified and resolved

#### 6.2 Consent Mode Verification

**Verifications:**
- ✅ GTM Preview shows correct consent flow
- ✅ GA4 shows "Consent Mode: Active"
- ✅ Google Ads detects Consent Mode signals
- ✅ Meta Pixel Helper shows no errors (with consent)
- ✅ TikTok Pixel Helper shows no errors (with consent)
- ✅ Browser console: No consent-related errors

**Deliverables:**
- Verification report
- Screenshots/evidence of correct implementation

#### 6.3 Compliance Validation

**Validations:**
- ✅ GDPR requirements met (EEA visitors)
- ✅ CCPA requirements met (California visitors)
- ✅ No cookies set before consent
- ✅ Privacy policy updated
- ✅ Cookie policy updated
- ✅ Consent records stored properly

**Deliverables:**
- Compliance checklist completed
- Compliance validation report

---

### Phase 7: Documentation & Training (Week 3)

#### 7.1 Documentation

**Deliverables:**
- Implementation guide (technical documentation)
- Cookie policy page content
- Privacy policy consent sections (draft/recommendations)
- GTM container documentation
- Maintenance procedures

#### 7.2 Client Training

**Activities:**
- Walkthrough of Cookiebot dashboard
- How to review cookie scans
- How to update consent banner
- GTM container overview
- Reporting and analytics interpretation with consent
- Troubleshooting common issues

**Deliverables:**
- Training session(s) completed
- Training materials provided
- Q&A session

---

## Deliverables Summary

| # | Deliverable | Description | Format |
|---|-------------|-------------|--------|
| 1 | **Technical Audit Report** | Current state analysis, cookie inventory, gap analysis | PDF |
| 2 | **Implementation Plan** | Detailed project plan with timeline | PDF |
| 3 | **Cookiebot Account** | Fully configured CMP account with domain(s) | Platform Access |
| 4 | **Consent Banner** | Customized, branded consent banner | Live on Site |
| 5 | **Cookie Declaration** | Categorized list of all cookies | Embedded Widget |
| 6 | **Google Consent Mode v2** | Fully operational Consent Mode integration | Live Implementation |
| 7 | **GTM Container** | Updated container with consent-aware tags | Live Container |
| 8 | **GA4 Configuration** | Consent-compliant analytics setup | Live Configuration |
| 9 | **Google Ads Setup** | Conversion tracking with consent, Enhanced Conversions | Live Configuration |
| 10 | **Meta Pixel Setup** | Consent-gated pixel with events | Live Implementation |
| 11 | **TikTok Pixel Setup** | Consent-gated pixel with events | Live Implementation |
| 12 | **Testing Report** | Comprehensive test results | PDF |
| 13 | **Compliance Report** | Validation against GDPR/CCPA requirements | PDF |
| 14 | **Technical Documentation** | Implementation details, maintenance procedures | PDF/Markdown |
| 15 | **Privacy/Cookie Policy Content** | Draft content for legal review | Word/PDF |
| 16 | **Training Session** | Live training with client team | Virtual/In-Person |
| 17 | **Support Period** | 30 days post-launch support | Email/Slack |

---

## Timeline

| Phase | Duration | Weeks | Milestones |
|-------|----------|-------|------------|
| **Phase 1: Discovery** | 3-5 days | Week 1 | Technical audit, requirements |
| **Phase 2: Cookiebot Setup** | 5-7 days | Week 1-2 | Account setup, banner configured |
| **Phase 3: Consent Mode** | 2-3 days | Week 2 | Consent Mode v2 operational |
| **Phase 4: Platforms** | 5-7 days | Week 2-3 | All platforms integrated |
| **Phase 5: GTM** | 3-4 days | Week 2-3 | Container configured |
| **Phase 6: Testing** | 3-5 days | Week 3 | All tests passed |
| **Phase 7: Documentation** | 2-3 days | Week 3 | Training completed |
| **Total** | **~3-4 weeks** | | Launch ready |

**Key Milestones:**
- ☐ Week 1: Audit complete, Cookiebot configured
- ☐ Week 2: Consent Mode operational, platforms integrating
- ☐ Week 3: Testing complete, documentation delivered
- ☐ Launch: Site live with compliant consent management

---

## Investment

### Professional Services

| Service | Estimated Hours | Rate | Subtotal |
|---------|-----------------|------|----------|
| **Technical Audit & Planning** | 8 hours | $XXX/hr | $X,XXX |
| **Cookiebot Setup & Configuration** | 12 hours | $XXX/hr | $X,XXX |
| **Consent Mode v2 Implementation** | 6 hours | $XXX/hr | $XXX |
| **Platform Integration (GA4, Google Ads, Meta, TikTok)** | 16 hours | $XXX/hr | $X,XXX |
| **GTM Configuration** | 8 hours | $XXX/hr | $XXX |
| **Testing & QA** | 10 hours | $XXX/hr | $X,XXX |
| **Documentation & Training** | 6 hours | $XXX/hr | $XXX |
| **Project Management** | 4 hours | $XXX/hr | $XXX |
| | | **Total:** | **$XX,XXX** |

### Additional Platform Integration (Optional)

| Platform | Estimated Hours | Rate | Subtotal |
|----------|-----------------|------|----------|
| LinkedIn Insight Tag | 2 hours | $XXX/hr | $XXX |
| Pinterest Tag | 2 hours | $XXX/hr | $XXX |
| Hotjar | 2 hours | $XXX/hr | $XXX |
| Microsoft Clarity | 2 hours | $XXX/hr | $XXX |
| Custom Platform | TBD | $XXX/hr | TBD |

### Third-Party Software (Client Direct Costs)

| Software | Estimated Cost | Billing | Notes |
|----------|----------------|---------|-------|
| **Cookiebot Subscription** | $12-500/month | Monthly/Annual | Depends on tier selected (Essential/Premium/Business) |
| **Domain/Hosting** | $0 | N/A | No additional cost |
| **GTM** | $0 | Free | Free tool |
| **GA4** | $0 | Free | Free tool |

**Total Third-Party Software:** ~$XXX-XXX/month (Cookiebot subscription)

### Total Investment

| Item | Amount |
|------|--------|
| **Professional Services** | $XX,XXX |
| **Optional Platforms** | $XXX (if selected) |
| **Third-Party Software** (first year) | $XXX-X,XXX |
| **TOTAL (Year 1)** | **$XX,XXX - XX,XXX** |

---

## Out of Scope

The following items are **not included** in this SOW:

❌ **Legal review** of privacy policy, cookie policy, or terms of service (client should consult legal counsel)
❌ **Cookie policy writing** (we provide content recommendations, not legal language)
❌ **Privacy policy writing** (we provide consent-related sections, client/legal completes)
❌ **Ongoing Cookiebot subscription fees** (client pays directly to Cookiebot)
❌ **Cookie policy page design/development** (we provide content only)
❌ **Consent management for mobile apps** (web only)
❌ **Custom API integrations** beyond standard platforms
❌ **Server-side GTM setup** (unless specifically included above)
❌ **Ongoing maintenance** beyond 30-day support period (can be added)

**If needed, the following can be added as separate line items:**
- Legal consultation referral
- Ongoing consent management retainer ($XXX/month)
- Server-side GTM implementation ($X,XXX)
- Additional platform integrations (see pricing above)

---

## Client Responsibilities

To ensure successful project completion, the client agrees to provide:

**Access:**
- ✅ Cookiebot account access (or authorize JY/co to create)
- ✅ Google Tag Manager container access (Publish permissions)
- ✅ Google Analytics 4 property access (Editor role)
- ✅ Google Ads account access (Standard or Admin)
- ✅ Meta Business Manager access (Analyst or Admin)
- ✅ TikTok Ads Manager access (if applicable)
- ✅ Website hosting/CMS access (if direct script changes needed)
- ✅ Other platform accounts (LinkedIn, Pinterest, etc.)

**Information:**
- ✅ Brand guidelines (logo, colors, fonts)
- ✅ Current privacy policy and cookie policy
- ✅ Target markets and applicable regulations
- ✅ Business goals and priorities

**Timely Feedback:**
- ✅ Review and approve banner design within 2 business days
- ✅ Review and approve consent banner text within 2 business days
- ✅ Participate in testing (30 minutes)
- ✅ Attend training session(s)
- ✅ Review final documentation within 3 business days

**Legal:**
- ✅ Obtain legal review of privacy/cookie policies (JY/co provides content recommendations, not legal advice)
- ✅ Ensure internal compliance processes align with consent implementation

---

## Assumptions

This SOW is based on the following assumptions:

1. **Single Domain:** Implementation covers one primary domain (additional domains +$X,XXX each)
2. **Standard Platforms:** GA4, Google Ads, Meta Pixel, TikTok Pixel (additional platforms priced separately)
3. **GTM Already Implemented:** Client has existing GTM container (if not, add $XXX for setup)
4. **GA4 Already Set Up:** Client has GA4 property configured (if not, add $X,XXX)
5. **Browser-Based Tracking:** Client-side GTM only (server-side GTM adds $X,XXX)
6. **English Language:** Consent banner in English (additional languages +$XXX per language for translation/setup)
7. **No Custom Development:** Standard implementation (custom features quoted separately)
8. **Responsive Cooperation:** Client provides timely access and feedback
9. **Reasonable Complexity:** Website has < 100 pages, < 50 unique cookies (larger sites may require additional time)

---

## Payment Terms

**Payment Schedule:**

| Milestone | Percentage | Amount | Due |
|-----------|------------|--------|-----|
| **SOW Signature** | 50% | $X,XXX | Upon signing |
| **Phase 4 Complete** | 25% | $XXX | Platforms integrated |
| **Project Completion** | 25% | $XXX | Final delivery |

**Terms:**
- Invoices due within 15 days of issuance
- Accepted payment methods: ACH, Wire Transfer, Credit Card (+ 3% processing fee)
- Late payments subject to 1.5% monthly interest charge

---

## Support & Maintenance

### Included Support (30 Days Post-Launch)

**Included:**
- ✅ Bug fixes related to initial implementation
- ✅ Email support (responses within 1 business day)
- ✅ Minor configuration adjustments
- ✅ Troubleshooting assistance

**Not Included:**
- ❌ New platform integrations
- ❌ Major configuration changes
- ❌ Ongoing cookie scans/categorization
- ❌ Ongoing optimization
- ❌ Training sessions beyond initial delivery

### Optional Ongoing Maintenance (Add-On)

**Monthly Retainer Options:**

| Service Level | Price | Includes |
|---------------|-------|----------|
| **Basic** | $XXX/month | Monthly cookie scans, consent rate monitoring, email support |
| **Standard** | $XXX/month | Basic + quarterly banner optimization, platform updates, priority support |
| **Premium** | $X,XXX/month | Standard + ongoing compliance monitoring, new platform integrations, dedicated support |

---

## Success Criteria

This project will be considered successful when:

✅ **Compliance:** GDPR/CCPA requirements met, verified via checklist
✅ **Functionality:** Consent banner operational, all tags respect consent
✅ **Consent Mode:** Google Consent Mode v2 active in GA4/Google Ads
✅ **Testing:** All test cases passed across browsers/devices
✅ **Measurement:** Analytics and conversion tracking operational (with consent)
✅ **Documentation:** Complete technical documentation delivered
✅ **Training:** Client team trained on Cookiebot and consent management
✅ **Client Approval:** Client sign-off on final implementation

---

## Acceptance & Signatures

By signing below, both parties agree to the terms outlined in this Statement of Work.

**JY/co:**

Signature: ____________________________
Name: [NAME]
Title: [TITLE]
Date: _______________

**Client ([CLIENT NAME]):**

Signature: ____________________________
Name: [NAME]
Title: [TITLE]
Date: _______________

---

## Contact Information

**JY/co Project Team:**

**Project Manager:** [NAME]
Email: [EMAIL]
Phone: [PHONE]

**Technical Lead:** [NAME]
Email: [EMAIL]
Phone: [PHONE]

**Support:** support@jyco.com
**Website:** https://jyco.com

---

**Document Version:** 1.0
**Date:** December 2025
**Valid For:** 30 days from date of proposal

---

*This Statement of Work constitutes a binding agreement between JY/co and [CLIENT NAME] upon signature by authorized representatives of both parties.*
