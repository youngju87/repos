#!/usr/bin/env python3
"""
Process Shopify Analytics Implementation Playbook from HTML to Markdown
"""
import re

# Read the extracted text
with open(r'C:\Users\Justin\source\repos\working\temp_extracted.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Clean up the content
# Remove excessive whitespace
content = re.sub(r'\n{3,}', '\n\n', content)
content = re.sub(r' {2,}', ' ', content)

# Fix code blocks - detect JavaScript/Liquid code sections
def detect_and_format_code_blocks(text):
    """Detect code sections and add proper language tags"""
    lines = text.split('\n')
    result = []
    in_code_block = False
    code_buffer = []
    current_lang = ''

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        # Check if line starts a code block
        if line.startswith('```') and not in_code_block:
            in_code_block = True
            # Look ahead to determine language
            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                # Detect language based on content
                if '<script' in next_line or 'function(' in next_line or 'var ' in next_line or '(function' in next_line:
                    current_lang = 'javascript'
                elif '<!DOCTYPE' in next_line or '<html' in next_line or '<!-- Google Tag Manager' in next_line:
                    current_lang = 'html'
                elif '{%' in next_line or '{{' in next_line or 'liquid' in next_line.lower():
                    current_lang = 'liquid'
                elif '"export' in next_line or '"container"' in next_line:
                    current_lang = 'json'
                else:
                    current_lang = ''

            result.append(f'```{current_lang}')
            i += 1
            continue

        # Check if line ends a code block
        if line.startswith('```') and in_code_block:
            in_code_block = False
            result.append('```')
            current_lang = ''
            i += 1
            continue

        result.append(lines[i])
        i += 1

    return '\n'.join(result)

# Apply code block formatting
content = detect_and_format_code_blocks(content)

# Create the structured Markdown document
markdown = """# Shopify Analytics Implementation Playbook

**Version:** 2.0
**Last Updated:** January 2026
**Team:** DACT/VF Digital Analytics

---

## Table of Contents

1. [Introduction](#introduction)
2. [Team Contacts](#team-contacts)
3. [Data Collection & Web Analytics](#data-collection--web-analytics)
   - [Platform Overview](#platform-overview)
   - [Shopify Sandbox Limitations](#shopify-sandbox-limitations)
   - [Important Notes](#important-notes)
4. [Google Tag Manager Setup](#google-tag-manager-setup)
   - [GTM Container IDs by Brand](#gtm-container-ids-by-brand)
   - [Current GTM Configuration](#current-gtm-configuration)
5. [Third-Party Vendor Implementation](#third-party-vendor-implementation)
6. [DataLayer Design & Theme Snippets](#datalayer-design--theme-snippets)
   - [Overview](#overview)
   - [Event Mapping](#event-mapping)
   - [Implementation Instructions](#implementation-instructions)
7. [Code Snippets](#code-snippets)
   - [Storefront Snippet](#storefront-snippet)
   - [Checkout Custom Pixel](#checkout-custom-pixel)
   - [GTM Container Templates](#gtm-container-templates)
8. [Testing & Validation](#testing--validation)
9. [Helpful Resources](#helpful-resources)

---

"""

# Add the rest of the content
markdown += content

# Additional cleanup specific to Confluence exports
# Fix HTML comments in code
markdown = re.sub(r'→', '', markdown)  # Remove arrows from line numbers

# Clean up excessive newlines again after all processing
markdown = re.sub(r'\n{4,}', '\n\n\n', markdown)

# Save the final Markdown file
output_file = r'C:\Users\Justin\source\repos\working\Shopify_Analytics_Implementation_Playbook.md'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(markdown)

print(f"Markdown file created: {output_file}")
print(f"Total size: {len(markdown)} characters")
print("Document successfully converted!")
