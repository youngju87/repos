# JY/co Consent & Privacy Implementation Documentation

**Comprehensive Cookiebot CMP + Google Consent Mode v2 Implementation Resources**

Version 1.0 | December 2025

---

## 📚 Documentation Overview

This repository contains complete documentation and implementation resources for deploying Cookiebot CMP (Consent Management Platform) with Google Consent Mode v2 integration for GDPR, CCPA, and global privacy compliance.

### Purpose

These materials serve as:
1. **Internal Implementation Reference** — Step-by-step guides for JY/co team members
2. **Client Deliverables** — Professional documentation to share with clients
3. **Training Materials** — Educational resources for team onboarding
4. **Sales/Proposal Support** — Technical specifications for scoping projects

---

## 📂 Repository Structure

```
jyco-consent-documentation/
├── guides/                          # Technical implementation guides
│   ├── Cookiebot_Master_Implementation_Guide.md
│   ├── Cookiebot_GTM_Integration_Guide.md
│   ├── Google_Consent_Mode_v2_Guide.md
│   ├── Consent_GA4_Configuration.md
│   ├── Consent_Meta_Facebook_Configuration.md
│   ├── Consent_Google_Ads_Configuration.md
│   └── Consent_TikTok_Configuration.md
│
├── templates/                       # Reusable templates
│   ├── cookiebot-gtm-container-template.json
│   └── Consent_Implementation_SOW_Template.md
│
├── checklists/                      # Quality assurance checklists
│   └── Consent_Compliance_Checklist.csv
│
└── README.md                        # This file
```

---

## 📖 Guide Index

### Core Implementation Guides

#### 1. [Cookiebot Master Implementation Guide](guides/Cookiebot_Master_Implementation_Guide.md)

**Comprehensive end-to-end implementation guide**

**Contents:**
- Chapter 1: Introduction to Consent Management
- Chapter 2: Cookiebot Account Setup
- Chapter 3: Cookie Scanning & Categorization
- Chapter 4: Banner Configuration
- Chapter 5: Google Consent Mode v2 Integration
- Chapter 6: GTM Web Container Integration
- Chapter 7: GA4 Configuration for Consent
- Chapter 8: Meta (Facebook) Consent Handling
- Chapter 9: Google Ads Consent Handling
- Chapter 10: Other Platform Consent
- Chapter 11: Regional Compliance Configuration
- Chapter 12: Testing & Validation
- Chapter 13: Ongoing Maintenance

**Use For:** Complete implementation from start to finish

---

#### 2. [Cookiebot GTM Integration Guide](guides/Cookiebot_GTM_Integration_Guide.md)

**Detailed Google Tag Manager setup and configuration**

**Contents:**
- Installation Methods
- Script Loading Order (Critical!)
- Built-in Consent Checks
- Custom Consent Variables
- Custom Consent Triggers
- Tag Configuration for Consent
- Testing in GTM Preview Mode
- Common GTM Consent Patterns
- Troubleshooting

**Use For:** GTM-specific implementation details

---

#### 3. [Google Consent Mode v2 Technical Guide](guides/Google_Consent_Mode_v2_Guide.md)

**Deep dive into Google's Consent Mode v2**

**Contents:**
- What is Consent Mode v2?
- v1 vs v2: What Changed
- Consent Mode Signals (all 7 signals explained)
- Implementation Methods
- Basic vs Advanced Mode
- Conversion Modeling
- Regional Configuration
- Verification & Testing
- Troubleshooting

**Use For:** Understanding and implementing Consent Mode v2

---

### Platform-Specific Configuration Guides

#### 4. [GA4 Consent Configuration Guide](guides/Consent_GA4_Configuration.md)

**Google Analytics 4 consent implementation**

**Contents:**
- GA4 & Consent Mode Overview
- GA4 Configuration Tag Setup
- GA4 Event Tags with Consent
- Consent Mode Reporting in GA4
- Behavioral Modeling
- Data Thresholds & Privacy
- Server-Side GA4 with Consent
- Troubleshooting GA4 Consent

**Use For:** Setting up GA4 with proper consent handling

---

#### 5. [Meta (Facebook) Pixel Consent Configuration Guide](guides/Consent_Meta_Facebook_Configuration.md)

**Meta/Facebook Pixel consent implementation**

**Contents:**
- Meta Pixel & Consent Overview
- Regional Consent Requirements (GDPR, CCPA)
- Implementation Method 1: Block Until Consent (GTM)
- Implementation Method 2: Meta Consent Mode (fbq)
- Limited Data Use (CCPA/CPRA)
- Meta Conversions API with Consent
- Testing & Verification
- Troubleshooting

**Use For:** Compliant Meta Pixel implementation

---

#### 6. [Google Ads Consent Configuration Guide](guides/Consent_Google_Ads_Configuration.md)

**Google Ads conversion tracking and remarketing with consent**

**Contents:**
- Google Ads & Consent Mode Overview
- EEA Requirements (Post-March 2024)
- Conversion Tracking with Consent
- Enhanced Conversions & Consent
- Remarketing & Consent
- Customer Match & Consent
- Testing & Verification
- Troubleshooting

**Use For:** Google Ads implementation for post-March 2024 requirements

---

#### 7. [TikTok Pixel Consent Configuration Guide](guides/Consent_TikTok_Configuration.md)

**TikTok Pixel consent implementation**

**Contents:**
- TikTok Pixel & Consent Overview
- Consent Requirements
- GTM Implementation
- TikTok Events with Consent
- TikTok Events API (Server-Side)
- Testing & Verification
- Troubleshooting

**Use For:** Compliant TikTok Pixel setup

---

## 🛠️ Templates & Tools

### GTM Container Template

**File:** [templates/cookiebot-gtm-container-template.json](templates/cookiebot-gtm-container-template.json)

**What It Is:**
Pre-configured Google Tag Manager container export with:
- Cookiebot consent variables (Marketing, Statistics, Preferences)
- Consent-based triggers (cookie_consent_marketing, etc.)
- Template tags for GA4, Meta Pixel, TikTok Pixel
- Conversion Linker tag

**How to Use:**
1. Open your GTM container
2. Go to Admin → Import Container
3. Upload `cookiebot-gtm-container-template.json`
4. Choose "Merge" or "Overwrite" (careful!)
5. Customize tags with your actual IDs (GA4, Meta Pixel, etc.)
6. Test in Preview mode
7. Publish

**Note:** This is a **template** — replace placeholder IDs with real ones.

---

### SOW Template

**File:** [templates/Consent_Implementation_SOW_Template.md](templates/Consent_Implementation_SOW_Template.md)

**What It Is:**
Complete Statement of Work template for client projects

**Contents:**
- Project overview and objectives
- Detailed scope of work (7 phases)
- Deliverables list
- Timeline (3-4 weeks typical)
- Investment/pricing structure
- Out of scope items
- Client responsibilities
- Payment terms
- Support & maintenance options
- Success criteria
- Signature section

**How to Use:**
1. Copy template
2. Replace [PLACEHOLDERS] with client-specific information
3. Adjust scope based on client needs
4. Update pricing
5. Review with client
6. Get signatures

**Use For:** Scoping and selling consent implementation projects

---

### Compliance Checklist

**File:** [checklists/Consent_Compliance_Checklist.csv](checklists/Consent_Compliance_Checklist.csv)

**What It Is:**
Comprehensive quality assurance checklist (75+ items)

**Categories:**
- Script Setup (4 items)
- Banner Configuration (7 items)
- Cookie Scanning (6 items)
- Consent Mode (7 items)
- GA4 Configuration (5 items)
- Google Ads (7 items)
- Meta Pixel (5 items)
- TikTok Pixel (3 items)
- Other Platforms (2 items)
- GTM Configuration (4 items)
- Storage & Cookies (4 items)
- Testing (8 items)
- Verification (5 items)
- Documentation (4 items)
- Maintenance (4 items)
- Compliance Records (5 items)

**How to Use:**
1. Open in Excel/Google Sheets
2. Use as implementation checklist
3. Mark items complete as you go
4. Track completion date and person
5. Add notes for each item
6. Export as PDF for client deliverable

**Use For:** Ensuring nothing is missed, QA, client sign-off

---

## 🚀 Quick Start Guide

### For Implementation Team Members

**Starting a new consent implementation project?**

1. **Read This First:** [Cookiebot Master Implementation Guide](guides/Cookiebot_Master_Implementation_Guide.md) — Chapters 1-2
2. **Set Up Tracking:**
   - Open [Consent_Compliance_Checklist.csv](checklists/Consent_Compliance_Checklist.csv)
   - Track progress as you work
3. **Follow Implementation Order:**
   - Week 1: Cookiebot setup, cookie scanning, banner config
   - Week 2: Consent Mode, GA4, Google Ads
   - Week 2-3: Meta, TikTok, other platforms
   - Week 3: Testing, documentation, training
4. **Reference Platform Guides:**
   - Use platform-specific guides for detailed steps
   - [GA4 Guide](guides/Consent_GA4_Configuration.md)
   - [Meta Guide](guides/Consent_Meta_Facebook_Configuration.md)
   - [Google Ads Guide](guides/Consent_Google_Ads_Configuration.md)
   - [TikTok Guide](guides/Consent_TikTok_Configuration.md)
5. **Use Templates:**
   - Import [GTM Container Template](templates/cookiebot-gtm-container-template.json) for head start
   - Customize with client-specific IDs
6. **Test Thoroughly:**
   - Follow testing chapters in each guide
   - Use checklist to verify all items
7. **Deliver:**
   - Provide guides as client deliverables
   - Include checklist with completed items

---

### For Sales/Proposal Team

**Need to scope a consent implementation project?**

1. **Review:** [SOW Template](templates/Consent_Implementation_SOW_Template.md)
2. **Understand Scope:**
   - Standard implementation: GA4 + Google Ads + Meta + TikTok (~40-70 hours)
   - Add 2-4 hours per additional platform
   - Complex sites (100+ pages, 50+ cookies): Add 20-30%
3. **Customize SOW:**
   - Update client information
   - Adjust deliverables based on client needs
   - Price appropriately
4. **Technical Questions:**
   - Reference [Master Implementation Guide](guides/Cookiebot_Master_Implementation_Guide.md) for technical details
   - Use [Compliance Checklist](checklists/Consent_Compliance_Checklist.csv) to understand full scope
5. **Typical Pricing Guidance:**
   - Standard Implementation: $8,000 - $15,000
   - With server-side GTM: Add $3,000 - $5,000
   - Additional platforms: $500 - $1,000 each
   - Monthly retainer: $500 - $2,000/month

---

## 🎯 Common Use Cases

### Use Case 1: First-Time Consent Implementation

**Scenario:** Client has no consent management, needs GDPR compliance

**Path:**
1. Start with [Master Implementation Guide](guides/Cookiebot_Master_Implementation_Guide.md)
2. Set up Cookiebot account (Chapter 2)
3. Scan and categorize cookies (Chapter 3)
4. Configure banner (Chapter 4)
5. Implement Consent Mode (Chapter 5)
6. Configure GTM (Chapter 6)
7. Set up platforms (Chapters 7-10)
8. Test thoroughly (Chapter 12)
9. Deliver documentation

**Timeline:** 3-4 weeks

---

### Use Case 2: Upgrading to Consent Mode v2

**Scenario:** Client has v1, needs v2 for Google Ads EEA compliance

**Path:**
1. Read [Google Consent Mode v2 Guide](guides/Google_Consent_Mode_v2_Guide.md) — Chapter 2 (v1 vs v2)
2. Update consent signals to include `ad_user_data` and `ad_personalization`
3. Verify in GA4 and Google Ads
4. Test in EEA region
5. Document changes

**Timeline:** 1-2 days

---

### Use Case 3: Adding New Platform (e.g., TikTok)

**Scenario:** Consent already implemented, adding TikTok Pixel

**Path:**
1. Read [TikTok Consent Configuration Guide](guides/Consent_TikTok_Configuration.md)
2. Create GTM tag with consent gate
3. Configure events
4. Test
5. Deploy

**Timeline:** 2-4 hours

---

### Use Case 4: Troubleshooting Consent Issues

**Scenario:** Tags firing before consent, or not firing after consent

**Path:**
1. Identify affected platform
2. Go to relevant guide's Troubleshooting section:
   - [GTM Troubleshooting](guides/Cookiebot_GTM_Integration_Guide.md#9-troubleshooting)
   - [GA4 Troubleshooting](guides/Consent_GA4_Configuration.md#8-troubleshooting-ga4-consent)
   - [Meta Troubleshooting](guides/Consent_Meta_Facebook_Configuration.md#8-troubleshooting)
   - [Google Ads Troubleshooting](guides/Consent_Google_Ads_Configuration.md#8-troubleshooting)
   - [TikTok Troubleshooting](guides/Consent_TikTok_Configuration.md#7-troubleshooting)
3. Follow diagnostic steps
4. Verify fix

**Timeline:** 30 minutes - 2 hours

---

## 📋 Regulations Covered

This documentation provides guidance for compliance with:

| Regulation | Region | Coverage |
|------------|--------|----------|
| **GDPR** | EU/EEA/UK | ✅ Comprehensive (opt-in model) |
| **CCPA/CPRA** | California | ✅ Comprehensive (opt-out + LDU) |
| **LGPD** | Brazil | ✅ Covered (similar to GDPR) |
| **POPIA** | South Africa | ✅ Covered (consent required) |
| **PIPEDA** | Canada | ⚠️ Partial (provincial variations) |
| **nFADP** | Switzerland | ✅ Covered (GDPR-like) |

**Note:** This documentation provides **technical implementation guidance**, not legal advice. Clients should consult qualified legal counsel for compliance verification.

---

## ⚙️ Technical Requirements

### Minimum Requirements

- **Cookiebot Account:** Essential tier or higher ($12+/month)
- **Google Tag Manager:** Free (container already set up)
- **GA4 Property:** Free (recommended)
- **Website Access:** Ability to add Cookiebot script to `<head>`

### Supported Platforms

**Analytics:**
- ✅ Google Analytics 4 (GA4)
- ✅ Hotjar
- ✅ Microsoft Clarity
- ✅ Heap Analytics
- ⚠️ Others (general patterns apply)

**Advertising:**
- ✅ Google Ads (conversion + remarketing)
- ✅ Meta/Facebook Pixel
- ✅ TikTok Pixel
- ✅ LinkedIn Insight Tag
- ✅ Pinterest Tag
- ⚠️ Others (general patterns apply)

**CMS Compatibility:**
- ✅ WordPress (plugin available)
- ✅ Shopify
- ✅ Wix
- ✅ Squarespace
- ✅ Custom HTML sites
- ✅ Any site that allows `<head>` script injection

---

## 🔄 Maintenance & Updates

### Keeping Documentation Current

**This documentation should be updated when:**
- Google releases Consent Mode updates
- Cookiebot changes features/UI
- New privacy regulations enacted
- New platforms added
- Best practices evolve

**Update Frequency:** Quarterly review recommended

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | December 2025 | Initial comprehensive documentation release |

---

## 🆘 Getting Help

### Internal Support

**Questions about implementation?**
- Review relevant guide first
- Check Troubleshooting sections
- Consult with senior team members
- Use internal Slack channel: #consent-implementations

### External Resources

**Official Documentation:**
- [Cookiebot Help Center](https://www.cookiebot.com/en/help/)
- [Google Consent Mode Docs](https://support.google.com/google-ads/answer/10000067)
- [GA4 Consent Mode](https://support.google.com/analytics/answer/9976101)
- [Meta Pixel Docs](https://www.facebook.com/business/help/952192354843755)
- [TikTok Pixel Docs](https://ads.tiktok.com/help/article?aid=10000357)

**Community:**
- [GTM Community](https://www.en.advertisercommunity.com/t5/Google-Tag-Manager/ct-p/Google-Tag-Manager)
- [GA4 Community](https://support.google.com/analytics/community)

---

## 📝 Contributing

### Internal Contributors

**Have improvements or corrections?**
1. Create a branch
2. Make updates
3. Submit for review
4. Update version history

**Guidelines:**
- Keep technical accuracy paramount
- Include screenshots where helpful
- Use consistent formatting
- Test all code examples
- Maintain neutral, professional tone

---

## ⚖️ Legal Disclaimer

**IMPORTANT:**

This documentation provides **technical implementation guidance** for consent management tools. It does **NOT constitute legal advice**.

Compliance with GDPR, CCPA, and other privacy regulations requires legal interpretation specific to your business, data processing activities, and jurisdictions served.

**JY/co recommends that all clients consult with qualified legal counsel to ensure their privacy practices meet all applicable regulatory requirements.**

**Use at your own risk.** JY/co is not liable for any compliance issues arising from use of this documentation.

---

## 📞 Contact

**JY/co**
**Website:** [https://jyco.com](https://jyco.com)
**Email:** support@jyco.com

**For Project Inquiries:**
**Email:** sales@jyco.com

---

## 🏆 About JY/co

**JY/co** specializes in privacy-first digital marketing implementations, helping businesses maintain marketing effectiveness while respecting user privacy and achieving regulatory compliance.

**Services:**
- Consent Management Implementation
- Google Consent Mode v2 Upgrades
- Privacy Compliance Audits
- Analytics & Tracking Setup
- Server-Side GTM Implementation
- Ongoing Consent Management

---

**Document Version:** 1.0
**Last Updated:** December 2025
**Maintained By:** JY/co Technical Team

---

## 📚 Appendix: File Conversion Notes

**Markdown to DOCX Conversion:**

All guides are provided in Markdown (.md) format for easy version control. To convert to DOCX for client delivery:

**Option 1: Pandoc (Recommended)**
```bash
pandoc Cookiebot_Master_Implementation_Guide.md -o Cookiebot_Master_Implementation_Guide.docx
```

**Option 2: Online Converters**
- [CloudConvert](https://cloudconvert.com/md-to-docx)
- [Convertio](https://convertio.co/md-docx/)

**Option 3: Manual**
- Copy content into Word/Google Docs
- Apply styles manually

**Note:** Pandoc preserves formatting best. Install: https://pandoc.org/

---

**End of README**

*Happy Implementing! 🚀*
