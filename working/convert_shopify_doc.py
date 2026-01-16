#!/usr/bin/env python3
"""
Convert Shopify HTML document to clean Markdown format
"""

import re
import html

def decode_quoted_printable(text):
    """Decode quoted-printable encoding"""
    text = text.replace('=\r\n', '')
    text = text.replace('=\n', '')
    text = re.sub(r'=([0-9A-F]{2})', lambda m: chr(int(m.group(1), 16)), text)
    return text

def extract_html_content(file_path):
    """Extract HTML content from the email-formatted file"""
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Find the HTML section
    html_start = content.find('<html')
    if html_start == -1:
        return content

    content = content[html_start:]

    # Decode quoted-printable
    content = decode_quoted_printable(content)

    # Decode HTML entities
    content = html.unescape(content)

    return content

def clean_html_to_text(html_content):
    """Convert HTML to clean text with structure preserved"""
    # Remove style and script tags
    html_content = re.sub(r'<style[^>]*>.*?</style>', '', html_content, flags=re.DOTALL)
    html_content = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL)

    # Remove HTML comments
    html_content = re.sub(r'<!--.*?-->', '', html_content, flags=re.DOTALL)

    # Remove head section
    html_content = re.sub(r'<head[^>]*>.*?</head>', '', html_content, flags=re.DOTALL)

    # Convert headers
    for i in range(1, 7):
        html_content = re.sub(
            rf'<h{i}[^>]*>(.*?)</h{i}>',
            lambda m: '\n' + '#' * i + ' ' + m.group(1).strip() + '\n',
            html_content,
            flags=re.DOTALL
        )

    # Convert paragraphs
    html_content = re.sub(r'<p[^>]*>(.*?)</p>', r'\1\n\n', html_content, flags=re.DOTALL)

    # Convert lists
    html_content = re.sub(r'<li[^>]*>(.*?)</li>', r'- \1\n', html_content, flags=re.DOTALL)
    html_content = re.sub(r'<ul[^>]*>', '\n', html_content)
    html_content = re.sub(r'</ul>', '\n', html_content)
    html_content = re.sub(r'<ol[^>]*>', '\n', html_content)
    html_content = re.sub(r'</ol>', '\n', html_content)

    # Convert code blocks
    html_content = re.sub(
        r'<pre[^>]*>(.*?)</pre>',
        lambda m: '\n```\n' + m.group(1).strip() + '\n```\n',
        html_content,
        flags=re.DOTALL
    )

    # Convert links
    html_content = re.sub(
        r'<a[^>]*href=["\']([^"\']*)["\'][^>]*>(.*?)</a>',
        r'[\2](\1)',
        html_content,
        flags=re.DOTALL
    )

    # Convert strong/bold
    html_content = re.sub(r'<strong[^>]*>(.*?)</strong>', r'**\1**', html_content, flags=re.DOTALL)
    html_content = re.sub(r'<b[^>]*>(.*?)</b>', r'**\1**', html_content, flags=re.DOTALL)

    # Convert em/italic
    html_content = re.sub(r'<em[^>]*>(.*?)</em>', r'*\1*', html_content, flags=re.DOTALL)
    html_content = re.sub(r'<i[^>]*>(.*?)</i>', r'*\1*', html_content, flags=re.DOTALL)

    # Convert tables to markdown tables (basic)
    html_content = re.sub(r'<table[^>]*>', '\n', html_content)
    html_content = re.sub(r'</table>', '\n', html_content)
    html_content = re.sub(r'<thead[^>]*>', '', html_content)
    html_content = re.sub(r'</thead>', '', html_content)
    html_content = re.sub(r'<tbody[^>]*>', '', html_content)
    html_content = re.sub(r'</tbody>', '', html_content)
    html_content = re.sub(r'<tr[^>]*>', '', html_content)
    html_content = re.sub(r'</tr>', '\n', html_content)
    html_content = re.sub(r'<th[^>]*>(.*?)</th>', r'| \1 ', html_content, flags=re.DOTALL)
    html_content = re.sub(r'<td[^>]*>(.*?)</td>', r'| \1 ', html_content, flags=re.DOTALL)

    # Remove remaining HTML tags
    html_content = re.sub(r'<[^>]+>', '', html_content)

    # Clean up whitespace
    html_content = re.sub(r'\n{3,}', '\n\n', html_content)
    html_content = re.sub(r' +', ' ', html_content)

    return html_content.strip()

def main():
    input_file = r'C:\Users\Justin\source\repos\working\Shopify+Playbook_+Analytics+Implementation.doc'
    output_file = r'C:\Users\Justin\source\repos\working\Shopify_Analytics_Implementation_Guide.md'

    print("Extracting HTML content...")
    html_content = extract_html_content(input_file)

    print("Converting to Markdown...")
    markdown_content = clean_html_to_text(html_content)

    print("Writing output file...")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(markdown_content)

    print(f"Conversion complete! Output saved to: {output_file}")

if __name__ == '__main__':
    main()
