#!/usr/bin/env python3
"""
Create enhanced Shopify Playbook from the already-extracted content
"""
import re

print("Creating enhanced Shopify Analytics Implementation Playbook...")

# Read the pre-extracted content
with open(r'C:\Users\Justin\source\repos\working\temp_extracted.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Clean up line number prefixes and arrows
content = re.sub(r'\d+→', '', content)
content = re.sub(r'→', '', content)

# Split content into lines for processing
lines = content.split('\n')

# Process content to fix code blocks
processed_lines = []
in_code_block = False
code_buffer = []
code_lang = ''

for i, line in enumerate(lines):
    stripped = line.strip()

    # Detect start of code blocks
    if not in_code_block:
        # Check for HTML/Script blocks
        if stripped.startswith('<!-- Google Tag Manager') or stripped.startswith('<script>(function'):
            in_code_block = True
            code_lang = 'html'
            processed_lines.append('\n```' + code_lang)
            code_buffer = [line]
            continue

        # Check for JavaScript blocks
        elif stripped.startswith('<script defer>') or (stripped.startswith('(function()') and 'CONFIGURATION' in '\n'.join(lines[i:i+10])):
            in_code_block = True
            code_lang = 'liquid'
            processed_lines.append('\n```' + code_lang)
            code_buffer = [line]
            continue

    # If in code block, accumulate lines
    if in_code_block:
        code_buffer.append(line)

        # Check for end of code block
        if (code_lang == 'html' and '<!-- End Google Tag Manager (noscript) -->' in stripped) or \
           (code_lang == 'liquid' and stripped == '})();') or \
           (code_lang == 'liquid' and stripped == '</script>'):
            # Check if next few lines are still part of code
            is_end = True
            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                if next_line.startswith('//') or next_line.startswith('var ') or next_line.startswith('function') or next_line.startswith('}'):
                    is_end = False

            if is_end:
                processed_lines.extend(code_buffer)
                processed_lines.append('```\n')
                in_code_block = False
                code_buffer = []
                code_lang = ''
            continue

    # Regular line processing
    processed_lines.append(line)

content = '\n'.join(processed_lines)

# Clean up common issues
content = content.replace('intragration', 'integration')
content = content.replace('DEPREICATED', 'DEPRECATED')
content = content.replace('DEPRICATED', 'DEPRECATED')

# Fix spacing issues
content = re.sub(r'\n{4,}', '\n\n\n', content)

# Create the final structured document
final_doc = """# Shopify Analytics Implementation Playbook

**Document Owner:** DACT/VF Digital Analytics Team
**Version:** 2.0
**Last Updated:** January 2026
**Status:** Active

> This playbook provides comprehensive guidance for implementing Google Analytics 4 (GA4) tracking on Shopify stores using Google Tag Manager (GTM) and custom dataLayer implementation.

---

## Team Contacts

| Name | Email |
| --- | --- |
| Valter Violini | valter_violini@vfc.com |
| Justin Young | justin_young@vfc.com |
| Joshua Barratt | joshua_barratt@vfc.com |
| Denis Zakharych | denis_zakharych@vfc.com |
| Nastasia Demarini | nastasia_demarini@vfc.com |
| Sergiu Cetulean | sergiu_cetulean@vfc.com |
| Renzo Bignami | renzo_bignami@vfc.com |

---

## Table of Contents

1. [Introduction](#introduction)
2. [Data Collection & Web Analytics](#data-collection--web-analytics)
   - [Analytics Platform](#analytics-platform)
   - [Shopify Sandbox Limitations](#shopify-sandbox-limitations)
   - [Important Notes](#important-notes)
3. [Google Tag Manager Setup](#google-tag-manager-setup)
   - [GTM Container IDs by Brand](#gtm-container-ids-by-brand)
   - [Installation Instructions](#installation-instructions)
   - [Current GTM Configurations](#current-gtm-configurations)
4. [Third-Party Vendor Implementation](#third-party-vendor-implementation)
5. [DataLayer Design & Theme Snippets](#datalayer-design--theme-snippets)
   - [Event Tracking Overview](#event-tracking-overview)
   - [Shopify to GA4 Event Mapping](#shopify-to-ga4-event-mapping)
   - [Events by Brand](#events-by-brand)
6. [Implementation Guide](#implementation-guide)
   - [Hybrid Snippet + Custom Pixel](#hybrid-snippet--custom-pixel)
   - [Step-by-Step Instructions](#step-by-step-instructions)
7. [Code Snippets](#code-snippets)
   - [Storefront dataLayer Snippet](#storefront-datalayer-snippet)
   - [Checkout Custom Pixel](#checkout-custom-pixel)
   - [GTM Container Templates](#gtm-container-templates)
8. [Testing & Validation](#testing--validation)
9. [Helpful Resources](#helpful-resources)

---

"""

# Add the processed content
final_doc += content

# Final cleanup - remove any remaining issues
final_doc = re.sub(r'\n{4,}', '\n\n\n', final_doc)

# Add helpful sections at the end if they don't exist
if 'Testing' not in final_doc[-5000:]:
    final_doc += """

---

## Testing & Validation

### Testing Methods

1. **Console Debugging**
   - Open browser developer console
   - Type `dataLayer` to see all events
   - Verify event structure and data accuracy

2. **Browser Extension**
   - Use Google Tag Assistant or dataLayer Inspector
   - Real-time monitoring of events
   - Validate GTM container loading

3. **Network Requests**
   - Monitor Network tab in DevTools
   - Filter by "google-analytics.com" or "analytics"
   - Verify GA4 events are firing with correct parameters

4. **GA4 DebugView**
   - Enable debug mode in GA4
   - Real-time event validation
   - Parameter verification

### Common Issues

- **Duplicate Events:** Check for multiple GTM containers or legacy tracking codes
- **Missing Events:** Verify triggers are configured correctly in GTM
- **Incorrect Data:** Review dataLayer structure and variable mappings

---

## Helpful Resources

### Official Documentation

- [Shopify Customer Events API](https://shopify.dev/docs/api/customer-events)
- [Google Tag Manager Documentation](https://support.google.com/tagmanager)
- [GA4 E-commerce Events](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)

### VF Internal Resources

- Brand-specific GTM container reviews (see GTM Configuration section)
- Solution Design Reference (SDR) documents
- Implementation guides for third-party vendors

### Tools

- [Google Tag Assistant](https://tagassistant.google.com/)
- [GA4 DebugView](https://support.google.com/analytics/answer/7201382)
- [dataLayer Inspector Chrome Extension](https://chrome.google.com/webstore)

---

## Document History

| Date | Version | Changes | Author |
| --- | --- | --- | --- |
| January 2026 | 2.0 | Complete restructure and formatting | Digital Analytics Team |
| 2025 | 1.x | Original implementations | Various |

---

*This document is maintained by the DACT/VF Digital Analytics Team. For questions or updates, contact any team member listed in the Team Contacts section.*
"""

# Save the final document
output_file = r'C:\Users\Justin\source\repos\working\Shopify_Analytics_Implementation_Playbook.md'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(final_doc)

# Generate statistics
section_count = len(re.findall(r'^##\s+[A-Z]', final_doc, re.MULTILINE))
h3_count = len(re.findall(r'^###\s+[A-Z]', final_doc, re.MULTILINE))
code_blocks = len(re.findall(r'```', final_doc)) // 2
tables = len(re.findall(r'^\|.*\|.*\|', final_doc, re.MULTILINE))

print("\n" + "="*70)
print(" DOCUMENT CREATION COMPLETE")
print("="*70)
print(f"\nFile: {output_file}")
print(f"Size: {len(final_doc):,} characters ({len(final_doc)//1024} KB)")
print(f"Main Sections (##): {section_count}")
print(f"Subsections (###): {h3_count}")
print(f"Code Blocks: {code_blocks}")
print(f"Table Rows: {tables}")
print(f"\n[SUCCESS] Document is ready for use!")
print("="*70)
