#!/usr/bin/env python3
"""
Final comprehensive processor for the Shopify Playbook
Handles all formatting, code blocks, tables, and content organization
"""
import re
from bs4 import BeautifulSoup
import quopri

print("Starting comprehensive document processing...")

# Step 1: Read and decode the original HTML file
print("Step 1: Reading and decoding original HTML document...")
with open(r'C:\Users\Justin\source\repos\working\Shopify+Playbook_+Analytics+Implementation.doc', 'rb') as f:
    content = f.read()

# Decode quoted-printable
decoded = quopri.decodestring(content)

# Step 2: Parse with BeautifulSoup
print("Step 2: Parsing HTML structure...")
soup = BeautifulSoup(decoded, 'html.parser')

# Remove script and style elements
for script in soup(["script", "style", "head", "meta", "link"]):
    script.decompose()

# Extract body content
body = soup.find('body')
if not body:
    body = soup

# Step 3: Process content section by section
print("Step 3: Processing content sections...")

def clean_text(text):
    """Clean and normalize text"""
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def process_element(elem, depth=0):
    """Recursively process HTML elements and convert to Markdown"""
    if elem.name is None:  # Text node
        text = str(elem).strip()
        return text if text else ''

    tag = elem.name
    result = []

    # Handle different HTML tags
    if tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
        level = int(tag[1])
        text = clean_text(elem.get_text())
        if text:
            result.append(f"\n\n{'#' * level} {text}\n\n")

    elif tag == 'p':
        text = clean_text(elem.get_text())
        if text:
            result.append(f"\n{text}\n")

    elif tag == 'pre':
        code = elem.get_text()
        # Detect language
        lang = ''
        if '<script' in code or '(function' in code:
            lang = 'javascript'
        elif '<!-- ' in code or '<html' in code or '<noscript' in code:
            lang = 'html'
        elif '{%' in code or '{{' in code:
            lang = 'liquid'
        elif code.strip().startswith('{') and '"export' in code:
            lang = 'json'

        result.append(f"\n```{lang}\n{code}\n```\n")

    elif tag == 'code' and elem.parent.name != 'pre':
        code = elem.get_text().strip()
        result.append(f"`{code}`")

    elif tag in ['ul', 'ol']:
        result.append('\n')
        for li in elem.find_all('li', recursive=False):
            prefix = '-' if tag == 'ul' else '1.'
            text = clean_text(li.get_text())
            result.append(f"{prefix} {text}\n")
        result.append('\n')

    elif tag == 'table':
        result.append('\n\n')
        rows = elem.find_all('tr')
        if rows:
            for idx, row in enumerate(rows):
                cells = []
                for cell in row.find_all(['th', 'td']):
                    cells.append(clean_text(cell.get_text()))

                if cells:
                    result.append('| ' + ' | '.join(cells) + ' |\n')

                    # Add separator after first row (header)
                    if idx == 0:
                        result.append('| ' + ' | '.join(['---'] * len(cells)) + ' |\n')

        result.append('\n')

    elif tag in ['strong', 'b']:
        text = clean_text(elem.get_text())
        result.append(f"**{text}**")

    elif tag in ['em', 'i']:
        text = clean_text(elem.get_text())
        result.append(f"*{text}*")

    elif tag == 'a':
        text = clean_text(elem.get_text())
        href = elem.get('href', '')
        if href and text:
            result.append(f"[{text}]({href})")
        elif text:
            result.append(text)

    elif tag == 'br':
        result.append('\n')

    elif tag == 'hr':
        result.append('\n\n---\n\n')

    elif tag in ['div', 'span', 'section', 'article', 'main']:
        # Recursively process children
        for child in elem.children:
            child_content = process_element(child, depth + 1)
            if child_content:
                result.append(child_content)

    else:
        # For other tags, just get the text
        text = clean_text(elem.get_text())
        if text:
            result.append(text)

    return ' '.join(result) if result else ''

# Process the body
print("Step 4: Converting HTML to Markdown...")
markdown_content = process_element(body)

# Step 5: Post-processing cleanup
print("Step 5: Applying post-processing cleanup...")

# Clean up excessive whitespace
markdown_content = re.sub(r'\n{4,}', '\n\n\n', markdown_content)
markdown_content = re.sub(r' {2,}', ' ', markdown_content)

# Fix common typos
markdown_content = markdown_content.replace('intragration', 'integration')
markdown_content = markdown_content.replace('DEPREICATED', 'DEPRECATED')
markdown_content = markdown_content.replace('DEPRICATED', 'DEPRECATED')

# Ensure proper spacing around headings
markdown_content = re.sub(r'\n(#{1,6}\s+.+)\n', r'\n\n\1\n\n', markdown_content)

# Ensure proper spacing around code blocks
markdown_content = re.sub(r'(```\w*)\n', r'\n\1\n', markdown_content)
markdown_content = re.sub(r'\n(```)\n', r'\n\1\n\n', markdown_content)

# Step 6: Build final structured document
print("Step 6: Building final structured document with TOC...")

final_document = """# Shopify Analytics Implementation Playbook

**Document Owner:** DACT/VF Digital Analytics Team
**Version:** 2.0
**Last Updated:** January 2026
**Status:** Active

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
3. [Google Tag Manager Setup](#google-tag-manager-setup)
4. [Third-Party Vendor Implementation](#third-party-vendor-implementation)
5. [DataLayer Design & Implementation](#datalayer-design--implementation)
6. [Code Snippets](#code-snippets)
7. [Testing & Validation](#testing--validation)
8. [Helpful Resources](#helpful-resources)

---

"""

# Add the processed content
final_document += markdown_content

# Final cleanup
final_document = re.sub(r'\n{4,}', '\n\n\n', final_document)

# Step 7: Save the final document
print("Step 7: Saving final document...")
output_file = r'C:\Users\Justin\source\repos\working\Shopify_Analytics_Implementation_Playbook.md'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(final_document)

# Step 8: Generate statistics
section_count = len(re.findall(r'^##\s+', final_document, re.MULTILINE))
h3_count = len(re.findall(r'^###\s+', final_document, re.MULTILINE))
code_block_count = len(re.findall(r'```\w*\n', final_document))
table_count = len(re.findall(r'^\|\s*\w+', final_document, re.MULTILINE)) // 3

print("\n" + "="*60)
print("[SUCCESS] Document processing complete!")
print("="*60)
print(f"Location: {output_file}")
print(f"Total size: {len(final_document):,} characters")
print(f"Main sections (##): {section_count}")
print(f"Subsections (###): {h3_count}")
print(f"Code blocks: {code_block_count}")
print(f"Tables: ~{table_count}")
print("="*60)
