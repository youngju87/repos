import re
import html
from bs4 import BeautifulSoup
import quopri

# Read and decode the original file
with open(r'C:\Users\Justin\source\repos\working\Shopify+Playbook_+Analytics+Implementation.doc', 'rb') as f:
    content = f.read()

# Decode quoted-printable
decoded = quopri.decodestring(content)

# Parse with BeautifulSoup
soup = BeautifulSoup(decoded, 'html.parser')

# Remove script and style elements
for script in soup(["script", "style"]):
    script.decompose()

# Extract the body content
body = soup.find('body')
if not body:
    body = soup

# Function to convert HTML elements to Markdown
def html_to_markdown(element, depth=0):
    markdown = []

    for child in element.children:
        if isinstance(child, str):
            text = child.strip()
            if text:
                markdown.append(text)
        else:
            tag = child.name

            if tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                level = int(tag[1])
                text = child.get_text().strip()
                markdown.append(f"\n\n{'#' * level} {text}\n")

            elif tag == 'p':
                text = child.get_text().strip()
                if text:
                    markdown.append(f"\n{text}\n")

            elif tag == 'pre':
                code = child.get_text()
                # Check if it has a code child
                code_elem = child.find('code')
                if code_elem:
                    code = code_elem.get_text()
                markdown.append(f"\n```\n{code}\n```\n")

            elif tag == 'code' and child.parent.name != 'pre':
                text = child.get_text()
                markdown.append(f"`{text}`")

            elif tag in ['ul', 'ol']:
                markdown.append('\n')
                for li in child.find_all('li', recursive=False):
                    prefix = '-' if tag == 'ul' else '1.'
                    text = li.get_text().strip()
                    markdown.append(f"{prefix} {text}\n")
                markdown.append('\n')

            elif tag == 'table':
                markdown.append('\n\n')
                rows = child.find_all('tr')
                if rows:
                    # Process header row
                    headers = []
                    first_row = rows[0]
                    for cell in first_row.find_all(['th', 'td']):
                        headers.append(cell.get_text().strip())

                    if headers:
                        markdown.append('| ' + ' | '.join(headers) + ' |\n')
                        markdown.append('| ' + ' | '.join(['---'] * len(headers)) + ' |\n')

                    # Process data rows
                    for row in rows[1:]:
                        cells = []
                        for cell in row.find_all(['td', 'th']):
                            cells.append(cell.get_text().strip())
                        if cells:
                            markdown.append('| ' + ' | '.join(cells) + ' |\n')

                markdown.append('\n')

            elif tag == 'strong' or tag == 'b':
                text = child.get_text().strip()
                markdown.append(f"**{text}**")

            elif tag == 'em' or tag == 'i':
                text = child.get_text().strip()
                markdown.append(f"*{text}*")

            elif tag == 'a':
                text = child.get_text().strip()
                href = child.get('href', '')
                if href:
                    markdown.append(f"[{text}]({href})")
                else:
                    markdown.append(text)

            elif tag == 'br':
                markdown.append('\n')

            elif tag == 'hr':
                markdown.append('\n\n---\n\n')

            elif tag in ['div', 'span', 'section', 'article']:
                markdown.append(html_to_markdown(child, depth + 1))

            else:
                # For other tags, just get the text
                text = child.get_text().strip()
                if text:
                    markdown.append(text)

    return ' '.join(markdown)

# Convert to markdown
markdown_content = html_to_markdown(body)

# Clean up extra whitespace
markdown_content = re.sub(r'\n{3,}', '\n\n', markdown_content)
markdown_content = re.sub(r' {2,}', ' ', markdown_content)

# Save to file
with open(r'C:\Users\Justin\source\repos\working\temp_extracted.txt', 'w', encoding='utf-8') as f:
    f.write(markdown_content)

print(f"Extracted {len(markdown_content)} characters")
print("Content saved to temp_extracted.txt")
