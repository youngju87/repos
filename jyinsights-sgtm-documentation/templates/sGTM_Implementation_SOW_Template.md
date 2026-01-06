# Statement of Work
## Server-Side Tracking Implementation

**Prepared For:** [CLIENT NAME]
**Prepared By:** [YOUR COMPANY NAME]
**Date:** [DATE]
**Valid Until:** [EXPIRATION DATE - typically 30 days]

---

## Executive Summary

This Statement of Work outlines the implementation of a Server-Side Google Tag Manager (sGTM) solution for [CLIENT NAME]. This solution will route tracking data through a secure, first-party server infrastructure, improving data quality, privacy compliance, and tracking reliability.

**Key Benefits:**
- Recover 20-40% of lost tracking data due to ad blockers and browser restrictions
- Extend cookie lifetime from 7 days to 2 years (Safari ITP bypass)
- Improve site performance by reducing client-side tracking overhead
- Enhance privacy compliance with server-side PII hashing
- Centralized control over all marketing platform integrations

---

## Project Overview

### Objective

Implement a production-ready Server-Side Google Tag Manager infrastructure that integrates with [CLIENT NAME]'s existing web properties and routes conversion data to the following platforms:

**Platforms Included:**
- ☐ Google Analytics 4 (GA4)
- ☐ Meta (Facebook) Conversions API
- ☐ Google Ads Enhanced Conversions
- ☐ TikTok Events API
- ☐ Pinterest Conversions API
- ☐ Other: ________________

### Scope

This implementation includes:
1. Server infrastructure setup and configuration
2. Custom domain configuration (e.g., gtm.clientdomain.com)
3. Server-side GTM container configuration
4. Web GTM container modifications
5. Platform-specific integrations and testing
6. Data deduplication setup
7. Privacy and consent mode configuration
8. Comprehensive testing and verification
9. Documentation and training
10. Post-launch monitoring and support

---

## Technical Architecture

### Infrastructure

**Hosting Platform:** [SELECT ONE]
- ☐ Google Cloud Platform (GCP) - Cloud Run
- ☐ Stape.io Managed Hosting
- ☐ Other: ________________

**Custom Domain:**
- Primary: `gtm.[clientdomain.com]`
- Backup (if needed): `analytics.[clientdomain.com]`

**SSL Certificate:**
- Provided by: ☐ Let's Encrypt (auto)  ☐ Client's certificate authority  ☐ GCP Managed

### Traffic Volume Estimate

**Monthly Pageviews:** ________________
**Monthly Conversions:** ________________
**Monthly Events (estimated):** ________________

**Estimated Monthly Cost:**
- Infrastructure: $________
- Bandwidth: $________
- Management: $________
- **Total Monthly Operating Cost:** $________

*Note: Actual costs may vary based on traffic volume. First month free tier typically covers up to 2 million requests on GCP.*

---

## Deliverables

### Phase 1: Infrastructure Setup (Week 1)

| Deliverable | Description | Owner |
|-------------|-------------|-------|
| **1.1** Server Deployment | Deploy sGTM server on chosen platform | [YOUR COMPANY] |
| **1.2** Custom Domain Configuration | Configure DNS and SSL for first-party tracking | [YOUR COMPANY] |
| **1.3** Health Monitoring Setup | Configure uptime monitoring and alerts | [YOUR COMPANY] |
| **1.4** Access Provisioning | Grant client access to GTM containers | [YOUR COMPANY] |

**Milestone 1:** Server accessible at custom domain with valid SSL certificate

---

### Phase 2: Server Container Configuration (Week 1-2)

| Deliverable | Description | Owner |
|-------------|-------------|-------|
| **2.1** GA4 Client Configuration | Set up GA4 data reception | [YOUR COMPANY] |
| **2.2** GA4 Server Tag | Configure GA4 Measurement Protocol | [YOUR COMPANY] |
| **2.3** Meta CAPI Setup | Configure Facebook Conversions API (if selected) | [YOUR COMPANY] |
| **2.4** Google Ads Setup | Configure Enhanced Conversions (if selected) | [YOUR COMPANY] |
| **2.5** Additional Platform Setup | Configure TikTok, Pinterest, etc. (if selected) | [YOUR COMPANY] |
| **2.6** Variable Configuration | Set up data extraction and transformation | [YOUR COMPANY] |
| **2.7** Trigger Configuration | Define event routing logic | [YOUR COMPANY] |

**Milestone 2:** Server container configured with all platform tags

---

### Phase 3: Web Container Integration (Week 2)

| Deliverable | Description | Owner |
|-------------|-------------|-------|
| **3.1** GA4 Configuration Update | Add `server_container_url` parameter | [YOUR COMPANY] |
| **3.2** Event ID Variable | Create deduplication variable | [YOUR COMPANY] |
| **3.3** Event Tag Updates | Add event_id to all conversion events | [YOUR COMPANY] |
| **3.4** Consent Mode Setup | Configure Consent Mode v2 (if applicable) | [YOUR COMPANY] |
| **3.5** DataLayer Verification | Ensure all required data present | [YOUR COMPANY] |

**Milestone 3:** Web GTM routes all data through sGTM server

---

### Phase 4: Platform Credentials & Access (Week 2)

| Deliverable | Description | Owner |
|-------------|-------------|-------|
| **4.1** GA4 Measurement ID | Provide GA4 Measurement ID | [CLIENT] |
| **4.2** Meta Credentials | Provide Pixel ID and Access Token | [CLIENT] |
| **4.3** Google Ads Credentials | Provide Conversion ID and Labels | [CLIENT] |
| **4.4** Additional Platform Credentials | Provide API keys for other platforms | [CLIENT] |
| **4.5** Credential Configuration | Input all credentials in sGTM | [YOUR COMPANY] |

**Milestone 4:** All platform credentials configured and verified

---

### Phase 5: Testing & Verification (Week 2-3)

| Deliverable | Description | Owner |
|-------------|-------------|-------|
| **5.1** Event Testing | Test all event types end-to-end | [YOUR COMPANY] |
| **5.2** Cross-Browser Testing | Verify on Chrome, Safari, Firefox, Edge | [YOUR COMPANY] |
| **5.3** Mobile Testing | Test on iOS and Android devices | [YOUR COMPANY] |
| **5.4** Platform Verification | Verify data in GA4, Meta, Google Ads | [YOUR COMPANY] |
| **5.5** Deduplication Testing | Confirm no duplicate conversions | [YOUR COMPANY] |
| **5.6** Performance Testing | Measure page load impact | [YOUR COMPANY] |
| **5.7** Client UAT | Client reviews and approves on staging | [CLIENT] |

**Milestone 5:** All tests pass, client approval received

---

### Phase 6: Production Launch (Week 3)

| Deliverable | Description | Owner |
|-------------|-------------|-------|
| **6.1** Production Deployment | Publish production GTM containers | [YOUR COMPANY] |
| **6.2** Go-Live Support | Monitor during launch window | [YOUR COMPANY] |
| **6.3** Initial Monitoring | 48-hour intensive monitoring | [YOUR COMPANY] |
| **6.4** Issue Resolution | Address any launch issues | [YOUR COMPANY] |

**Milestone 6:** Production launch successful, data flowing correctly

---

### Phase 7: Documentation & Training (Week 3-4)

| Deliverable | Description | Owner |
|-------------|-------------|-------|
| **7.1** Implementation Documentation | Complete setup guide (this document) | [YOUR COMPANY] |
| **7.2** Container Export Backup | Export of all GTM containers | [YOUR COMPANY] |
| **7.3** Credential Documentation | Secure documentation of all credentials | [YOUR COMPANY] |
| **7.4** Training Session | 1-hour walkthrough for client team | [YOUR COMPANY] |
| **7.5** Support Runbook | Guide for common issues and maintenance | [YOUR COMPANY] |

**Milestone 7:** Client team trained and equipped to manage system

---

### Phase 8: Post-Launch Support (Week 4-8)

| Deliverable | Description | Owner |
|-------------|-------------|-------|
| **8.1** Weekly Check-ins | Week 1-4: Weekly data verification | [YOUR COMPANY] |
| **8.2** Issue Support | Email/ticket support for issues | [YOUR COMPANY] |
| **8.3** Monthly Review | 30-day performance review meeting | [YOUR COMPANY] |

**Milestone 8:** System stable, running independently

---

## Documentation Provided

All implementations include the following documentation:

1. **Master Setup Guide** - Comprehensive technical documentation covering:
   - Infrastructure setup
   - Container configuration
   - Platform-specific setups (GA4, Meta, Google Ads, etc.)
   - Testing procedures
   - Troubleshooting guide

2. **Testing Checklist** - Detailed QA checklist covering:
   - Pre-launch verification
   - Event testing matrix
   - Platform verification steps
   - Post-launch monitoring

3. **Container Templates** - Exportable JSON files:
   - Server-side GTM container (configured)
   - Web GTM modifications (documented)

4. **Quick Reference Guides** - Platform-specific guides for:
   - GA4 configuration
   - Meta CAPI setup
   - Google Ads Enhanced Conversions
   - Additional platforms (as applicable)

5. **Support Runbook** - Maintenance documentation:
   - Common issues and fixes
   - Monitoring procedures
   - Update procedures
   - Contact information

---

## Timeline

**Total Duration:** 3-4 weeks from kickoff

```
Week 1: Infrastructure & Server Container
├─ Days 1-2: Server deployment, custom domain setup
├─ Days 3-4: Server container configuration
└─ Day 5: Platform credential collection

Week 2: Web Integration & Testing Prep
├─ Days 1-2: Web GTM modifications
├─ Days 3-4: Platform integrations
└─ Day 5: Staging environment testing

Week 3: Testing & Launch
├─ Days 1-3: Comprehensive testing
├─ Day 4: Client UAT and approval
└─ Day 5: Production launch

Week 4: Monitoring & Handoff
├─ Days 1-2: Intensive monitoring
├─ Days 3-4: Documentation delivery
└─ Day 5: Training session
```

**Kickoff Meeting:** [DATE]
**Target Launch Date:** [DATE]
**Training Session:** [DATE]
**Project Close:** [DATE]

---

## Client Responsibilities

To ensure successful implementation, [CLIENT NAME] agrees to provide:

### Access & Credentials

- [ ] Google Tag Manager container access (Admin or Publish rights)
- [ ] Google Analytics 4 property access (Editor rights minimum)
- [ ] Meta Business Manager access (Events Manager permissions)
- [ ] Google Ads account access (Standard or Admin)
- [ ] Website staging environment access (if applicable)
- [ ] DNS management access or delegation
- [ ] Platform API credentials (Pixel IDs, Access Tokens, etc.)

### Technical Information

- [ ] Current tracking setup documentation
- [ ] List of all tracked conversion events
- [ ] DataLayer implementation details (if custom)
- [ ] E-commerce platform details (Shopify, WooCommerce, custom, etc.)
- [ ] Consent management solution details (if applicable)
- [ ] Privacy policy and data processing requirements

### Approvals & Testing

- [ ] UAT testing on staging environment
- [ ] Sign-off on testing results
- [ ] Approval to publish to production
- [ ] Availability for training session

### Timelines

- [ ] Respond to credential requests within 2 business days
- [ ] Complete UAT testing within 3 business days
- [ ] Provide feedback/approvals within 2 business days

**Delays in providing access or approvals may extend the project timeline.**

---

## Investment

### Implementation Fees

| Phase | Description | Fee |
|-------|-------------|-----|
| **Infrastructure Setup** | Server deployment, custom domain configuration, SSL setup | $_______ |
| **Server Container** | GA4, Meta CAPI, Google Ads, and additional platform configuration | $_______ |
| **Web Container Integration** | Modifications to existing web GTM, event ID setup | $_______ |
| **Testing & QA** | Comprehensive testing across browsers, devices, platforms | $_______ |
| **Documentation & Training** | Complete documentation package + training session | $_______ |
| **Project Management** | Coordination, communication, timeline management | $_______ |

**Total Implementation Fee:** **$_______**

### Ongoing Costs (Monthly)

| Item | Description | Estimated Cost |
|------|-------------|----------------|
| **Server Hosting** | GCP Cloud Run or Stape.io hosting | $_______ /month |
| **Support & Maintenance** | Optional ongoing support (see Add-Ons) | $_______ /month |

**Note:** First month of hosting typically free on GCP (free tier covers ~2M events). Actual costs depend on traffic volume.

### Add-On Services (Optional)

| Service | Description | Fee |
|---------|-------------|-----|
| **Additional Platform Integration** | TikTok, Pinterest, Snapchat, etc. (per platform) | $_______ |
| **Custom Event Development** | Custom conversion events beyond standard e-commerce | $_______ /event |
| **Ongoing Monitoring & Support** | Monthly monitoring, updates, issue resolution | $_______ /month |
| **Monthly Analytics Review** | Regular performance reviews and optimization recommendations | $_______ /month |
| **Advanced Consent Mode Setup** | Multi-region consent management | $_______ |
| **Multi-Domain Setup** | Additional domains beyond primary | $_______ /domain |

---

## Payment Terms

**Payment Schedule:**

- **50% Deposit:** $_______ - Due upon SOW signature (kicks off project)
- **50% Final Payment:** $_______ - Due upon production launch and training completion

**Invoicing:**
- Invoices sent via [email/portal]
- Payment due within [15] days of invoice date
- Accepted methods: [Wire transfer / Credit card / ACH / Check]

**Late Payment:**
- Late fee: [X]% per month on overdue balances
- Access to support may be suspended for accounts 30+ days overdue

---

## Out of Scope

The following items are NOT included in this Statement of Work:

❌ **Custom Website Development** - Modifications to website code beyond GTM tags
❌ **DataLayer Implementation** - Creation of dataLayer if not already present
❌ **Historical Data Migration** - Backfilling historical data in new system
❌ **Ad Campaign Setup** - Creation or optimization of ad campaigns
❌ **Analytics Strategy Consulting** - KPI definition, measurement planning, reporting setup
❌ **Ongoing Tag Management** - Addition of new tags after launch (available as add-on)
❌ **Technical SEO** - Website speed optimization, SEO improvements
❌ **A/B Testing Setup** - Implementation of testing tools
❌ **Data Studio / Looker Dashboards** - Custom reporting dashboard creation
❌ **GDPR Legal Compliance Review** - Legal assessment of privacy compliance (consult attorney)

**These items may be available as separate projects or add-on services.**

---

## Assumptions

This proposal assumes:

1. **Existing Setup:** Client has existing GTM containers and GA4 property already deployed
2. **DataLayer:** A properly implemented dataLayer exists on the website with required e-commerce data
3. **Access:** Client can provide all required access and credentials within 5 business days of kickoff
4. **Standard Events:** Tracking requirements follow standard e-commerce events (page_view, view_item, add_to_cart, begin_checkout, purchase)
5. **Single Domain:** Implementation covers one primary domain (additional domains available as add-on)
6. **Standard Platforms:** Platforms selected are from: GA4, Meta CAPI, Google Ads, TikTok, Pinterest
7. **Staging Environment:** Client has staging/dev environment for testing before production
8. **Responsive Communication:** Client team available for questions and approvals with 2-business-day turnaround
9. **No Legacy Migrations:** No migration from Universal Analytics, legacy conversion pixels, or third-party platforms
10. **Standard Consent:** If consent management required, client uses standard solution (Cookiebot, OneTrust, CookieYes, etc.)

**If any assumption is incorrect, scope and pricing may need adjustment.**

---

## Success Criteria

This project will be considered successful when:

✅ **Infrastructure**
- sGTM server operational at custom domain with valid SSL
- Health checks passing, uptime monitoring active

✅ **Data Flow**
- All selected events (page_view, view_item, add_to_cart, begin_checkout, purchase) routing through sGTM
- Events visible in all selected platforms (GA4, Meta, Google Ads, etc.)

✅ **Data Quality**
- Purchase events recording correct revenue in GA4
- No duplicate conversions in any platform
- Meta Event Match Quality scores 8.0+ (if Meta CAPI included)
- Google Ads Enhanced Conversions showing "Eligible" status (if Google Ads included)

✅ **Performance**
- Page load impact <100ms
- Server response times <200ms

✅ **Testing**
- All items on Testing Checklist marked "Pass"
- Cross-browser testing complete (Chrome, Safari, Firefox, Edge)
- Mobile testing complete (iOS, Android)

✅ **Documentation & Training**
- All documentation delivered
- Client team trained on system management
- 30-day post-launch monitoring complete with no critical issues

---

## Support & Maintenance

### Included Support Period

**Duration:** 30 days post-launch
**Coverage:** Email and ticket support during business hours
**Response Time:** 1 business day
**Includes:**
- Bug fixes related to implementation
- Configuration adjustments
- Troubleshooting assistance
- Questions about system operation

### Post-Support Period

After the 30-day included support period:

**Option 1: Pay-Per-Incident**
- $_______ per hour for support issues
- Billed in 30-minute increments
- Estimated response: 2-3 business days

**Option 2: Monthly Retainer** (Recommended)
- $_______ per month
- Includes up to [X] hours of support
- Priority response (4-hour response time)
- Monthly monitoring and health checks
- Quarterly optimization recommendations
- Container version management

---

## Change Order Process

If additional work beyond this SOW is required:

1. **Request:** Client submits change request describing additional work
2. **Estimate:** [YOUR COMPANY] provides scope and cost estimate within 3 business days
3. **Approval:** Client approves estimate in writing (email acceptable)
4. **Execution:** Work begins upon approval; timeline adjusted accordingly
5. **Billing:** Change orders billed separately or added to final invoice

**Hourly Rate for Changes:** $_______ /hour

---

## Warranties & Limitations

### [YOUR COMPANY] Warrants:

✅ Services performed in professional, workmanlike manner
✅ Implementation follows Google's best practices and platform guidelines
✅ Code and configurations free from defects for 30 days post-launch
✅ No unauthorized access to client data

### [YOUR COMPANY] Does NOT Warrant:

❌ Specific data recovery percentages (20-40% typical but depends on client's traffic)
❌ Platform algorithm changes outside our control (GA4, Meta, Google Ads)
❌ Browser or ad blocker updates that affect tracking
❌ Third-party platform availability or API changes
❌ Compliance with specific legal requirements (GDPR, CCPA, etc.) without attorney review

### Limitation of Liability

[YOUR COMPANY]'s total liability under this agreement shall not exceed the total fees paid by [CLIENT] for the implementation. [YOUR COMPANY] is not liable for indirect, consequential, or special damages including lost profits or lost data.

---

## Data Privacy & Security

### Data Handling

- [YOUR COMPANY] will access client data only as necessary to perform services
- All personally identifiable information (PII) will be hashed before transmission to platforms
- [YOUR COMPANY] will not retain client data beyond project completion
- All credentials will be stored securely using industry-standard password management

### Compliance

- Implementation follows Google's Tag Manager terms of service
- Server-side hashing of PII meets platform requirements (Meta, Google Ads)
- Client remains data controller; [YOUR COMPANY] acts as data processor
- Client responsible for obtaining end-user consent per applicable laws (GDPR, CCPA, etc.)

### Security

- All data transmission over HTTPS/TLS
- API credentials stored in secure, encrypted format
- Access to systems limited to authorized personnel
- Container access limited to named individuals

---

## Termination

### Termination for Convenience

Either party may terminate this agreement with 7 days written notice.

**If Client Terminates:**
- Client pays for all work completed to date
- [YOUR COMPANY] delivers all work product completed
- No refund of deposit

**If [YOUR COMPANY] Terminates:**
- Client receives refund of unused deposit
- [YOUR COMPANY] delivers all work product completed

### Termination for Cause

Either party may terminate immediately if other party:
- Breaches material term and fails to cure within 14 days of written notice
- Becomes insolvent or files for bankruptcy
- Engages in illegal activity related to project

---

## Acceptance & Signatures

### Acceptance

By signing below, both parties agree to the terms, deliverables, timeline, and investment outlined in this Statement of Work.

### [CLIENT NAME]

**Authorized Signature:** ___________________________________

**Printed Name:** ___________________________________

**Title:** ___________________________________

**Date:** ___________________________________

**Email:** ___________________________________

**Phone:** ___________________________________

---

### [YOUR COMPANY NAME]

**Authorized Signature:** ___________________________________

**Printed Name:** ___________________________________

**Title:** ___________________________________

**Date:** ___________________________________

**Email:** ___________________________________

**Phone:** ___________________________________

---

## Appendix A: Platforms Included

**Selected Platforms for This Implementation:**

### Core Platform (Required)

- [x] **Google Analytics 4 (GA4)** - Server-side event tracking
  - Measurement Protocol v2
  - Event parameter mapping
  - User identification
  - Consent mode integration

### Additional Platforms (Optional - Select Below)

- [ ] **Meta Conversions API (CAPI)** - Facebook & Instagram tracking
  - Events: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase
  - Event deduplication with browser Pixel
  - Event Match Quality optimization (target 8.0+)

- [ ] **Google Ads Enhanced Conversions** - Improved attribution
  - Purchase conversion tracking
  - First-party data hashing
  - Consent mode integration

- [ ] **TikTok Events API** - Server-side TikTok tracking
  - Events: PageView, ViewContent, AddToCart, InitiateCheckout, CompletePayment
  - Event deduplication with TikTok Pixel

- [ ] **Pinterest Conversions API** - Pinterest ad tracking
  - Events: PageVisit, ViewCategory, AddToCart, Checkout, Lead
  - Enhanced Match with hashed user data

- [ ] **Snapchat Conversions API** - Snapchat ad tracking
  - Events: PAGE_VIEW, VIEW_CONTENT, ADD_CART, PURCHASE
  - CAPI integration with Snap Pixel

**Total Selected Platforms:** _____ (pricing reflects selected platforms)

---

## Appendix B: Event Mapping

### Standard E-Commerce Events Included

| Web Event | GA4 Event | Meta CAPI Event | Google Ads | TikTok Event |
|-----------|-----------|-----------------|------------|--------------|
| Page Load | `page_view` | `PageView` | — | `PageView` |
| View Product | `view_item` | `ViewContent` | — | `ViewContent` |
| Add to Cart | `add_to_cart` | `AddToCart` | — | `AddToCart` |
| Start Checkout | `begin_checkout` | `InitiateCheckout` | — | `InitiateCheckout` |
| Purchase | `purchase` | `Purchase` | Conversion | `CompletePayment` |

**Custom events beyond these standard events available as add-on service.**

---

## Appendix C: Technical Requirements

### Minimum Requirements

- **Google Tag Manager:** Web container and server container access
- **GA4:** Property created with Measurement ID
- **Website:** Properly implemented dataLayer with e-commerce data
- **Domain Access:** Ability to create DNS records
- **SSL Certificate:** Valid certificate for custom tracking domain

### Recommended (Not Required)

- Staging/dev environment for testing
- Consent management platform (for GDPR/CCPA compliance)
- Tag management documentation
- Current analytics baseline for comparison

### Browser Support

Implementation tested on:
- Chrome (latest version)
- Safari (latest version)
- Firefox (latest version)
- Edge (latest version)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

**Legacy browser support (IE11, etc.) not included.**

---

## Appendix D: Contact Information

### Project Contacts

**[YOUR COMPANY] - Project Team**

**Project Manager:**
- Name: ___________________
- Email: ___________________
- Phone: ___________________

**Technical Lead:**
- Name: ___________________
- Email: ___________________
- Phone: ___________________

**Support Email:** ___________________
**Emergency Contact:** ___________________

---

**[CLIENT NAME] - Project Team**

**Primary Contact:**
- Name: ___________________
- Email: ___________________
- Phone: ___________________

**Technical Contact:**
- Name: ___________________
- Email: ___________________
- Phone: ___________________

**GTM Admin:**
- Name: ___________________
- Email: ___________________

**GA4 Admin:**
- Name: ___________________
- Email: ___________________

---

## Appendix E: Kickoff Meeting Agenda

**Duration:** 1 hour

**Agenda:**

1. **Introductions** (5 min)
   - Team introductions
   - Roles and responsibilities

2. **Project Overview** (10 min)
   - Objectives review
   - Success criteria
   - Timeline walkthrough

3. **Technical Discussion** (20 min)
   - Current tracking setup review
   - Platform selection confirmation
   - Custom domain decision
   - Hosting platform selection

4. **Access & Credentials** (15 min)
   - Required access list
   - Credential collection process
   - Timeline for provisioning

5. **Communication Plan** (5 min)
   - Status update frequency
   - Preferred communication channels
   - Escalation process

6. **Q&A** (5 min)

**Next Steps:**
- [YOUR COMPANY] sends access request list
- [CLIENT] provides credentials within 5 business days
- [YOUR COMPANY] begins infrastructure setup

---

**Document Version:** 1.0
**Created:** January 2025
**Template By:** JY/co Server-Side Tracking

**This Statement of Work is valid for 30 days from the date above.**
