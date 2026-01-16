#!/usr/bin/env python3
"""
Comprehensive cleanup and formatting of the Shopify Playbook
"""
import re
import json

# Read the current markdown file
with open(r'C:\Users\Justin\source\repos\working\Shopify_Analytics_Implementation_Playbook.md', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix code blocks - find sections that should be code blocks but aren't properly formatted
def fix_code_blocks(text):
    """Properly format code blocks with correct language tags"""
    # Fix HTML code blocks (GTM snippets)
    text = re.sub(
        r'<!-- Google Tag Manager -->\s*<script>',
        r'```html\n<!-- Google Tag Manager -->\n<script>',
        text
    )
    text = re.sub(
        r'<!-- End Google Tag Manager \(noscript\) -->',
        r'<!-- End Google Tag Manager (noscript) -->\n```',
        text
    )

    # Find and fix JavaScript code blocks
    lines = text.split('\n')
    result = []
    in_js_block = False
    js_buffer = []

    for i, line in enumerate(lines):
        stripped = line.strip()

        # Detect start of JavaScript code (function definitions, script tags, etc.)
        if not in_js_block and (
            (stripped.startswith('(function') or stripped.startswith('function(') or
             stripped.startswith('window.dataLayer') or stripped.startswith('var CONFIG'))
            and i > 0 and not lines[i-1].strip().startswith('```')
        ):
            # Check if we're not already in a code block
            in_js_block = True
            result.append('```javascript')
            js_buffer = [line]
        elif in_js_block:
            js_buffer.append(line)
            # Check for end of JS block (closing script tag or end of function)
            if stripped.endswith('</script>') or (stripped == '})();' and i < len(lines)-1 and not lines[i+1].strip().startswith('}')):
                result.extend(js_buffer)
                result.append('```')
                in_js_block = False
                js_buffer = []
        else:
            result.append(line)

    return '\n'.join(result)

# 2. Clean up tables - ensure all tables are properly formatted
def fix_tables(text):
    """Ensure all Markdown tables are properly formatted"""
    lines = text.split('\n')
    result = []
    in_table = False

    for i, line in enumerate(lines):
        stripped = line.strip()

        # Detect table rows
        if '|' in stripped and stripped.count('|') >= 2:
            if not in_table:
                # Start of table - add spacing
                if i > 0 and result and result[-1].strip():
                    result.append('')
                in_table = True

            # Clean up the table row
            cells = [cell.strip() for cell in stripped.split('|')]
            # Remove empty first/last cells if present
            if cells and not cells[0]:
                cells = cells[1:]
            if cells and not cells[-1]:
                cells = cells[:-1]

            result.append('| ' + ' | '.join(cells) + ' |')
        else:
            if in_table:
                # End of table - add spacing
                result.append('')
                in_table = False
            result.append(line)

    return '\n'.join(result)

# 3. Remove duplicate headings and content
def remove_duplicates(text):
    """Remove duplicate sections and headings"""
    # Remove the duplicate original title block at the beginning
    text = re.sub(
        r'---\s*# Shopify Playbook: Analytics Implementation\s+- Introduction.*?(?=##\s+Introduction)',
        '\n\n---\n\n',
        text,
        flags=re.DOTALL
    )
    return text

# 4. Fix spacing issues
def fix_spacing(text):
    """Fix spacing throughout the document"""
    # Remove excessive blank lines (more than 3 in a row)
    text = re.sub(r'\n{4,}', '\n\n\n', text)

    # Ensure proper spacing around headings
    text = re.sub(r'(\n#{1,6}\s+.+\n)(\S)', r'\1\n\2', text)
    text = re.sub(r'(\S\n)(#{1,6}\s+.+)', r'\1\n\2', text)

    # Ensure proper spacing around code blocks
    text = re.sub(r'(\n```\w*\n)', r'\n\1', text)
    text = re.sub(r'(\n```\n)(\S)', r'\1\n\2', text)

    return text

# 5. Clean up formatting issues
def clean_formatting(text):
    """Clean up various formatting issues"""
    # Fix common typos
    text = text.replace('intragration', 'integration')
    text = text.replace('DEPREICATED', 'DEPRECATED')
    text = text.replace('DEPRICATED', 'DEPRECATED')

    # Fix arrow symbols and special characters
    text = text.replace(' ', '')  # Remove any remaining arrows

    # Fix list formatting
    text = re.sub(r'\n\s*-\s+-\s+', '\n- ', text)

    return text

# Apply all cleanup functions
print("Applying cleanup transformations...")
content = remove_duplicates(content)
print("- Removed duplicates")
content = fix_code_blocks(content)
print("- Fixed code blocks")
content = fix_tables(content)
print("- Fixed tables")
content = fix_spacing(content)
print("- Fixed spacing")
content = clean_formatting(content)
print("- Cleaned formatting")

# Save the cleaned document
output_file = r'C:\Users\Justin\source\repos\working\Shopify_Analytics_Implementation_Playbook.md'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(content)

# Count sections and code blocks for verification
section_count = len(re.findall(r'^##\s+', content, re.MULTILINE))
code_block_count = len(re.findall(r'```\w*\n', content))
table_count = len(re.findall(r'^\|.*\|$', content, re.MULTILINE)) // 3  # Approximate

print("\n[SUCCESS] Document cleaned and formatted!")
print(f"[INFO] Location: {output_file}")
print(f"[INFO] Total size: {len(content):,} characters")
print(f"[INFO] Sections (h2): {section_count}")
print(f"[INFO] Code blocks: {code_block_count}")
print(f"[INFO] Tables: ~{table_count}")
