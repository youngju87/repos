"""
Content Extractor - Extracts and analyzes content from URLs
Uses multiple libraries for robustness
"""

import logging
import requests
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime
from bs4 import BeautifulSoup
from urllib.parse import urlparse

logger = logging.getLogger(__name__)


@dataclass
class ExtractedContent:
    """Extracted content from a URL"""
    url: str
    title: str
    text: str
    word_count: int

    # Structure
    headings: Dict[str, List[str]] = field(default_factory=dict)
    paragraphs: List[str] = field(default_factory=list)

    # Metadata
    meta_description: str = ""
    meta_keywords: List[str] = field(default_factory=list)

    # Content metrics
    images_count: int = 0
    links_count: int = 0

    # Extraction info
    extracted_at: datetime = field(default_factory=datetime.utcnow)
    extraction_method: str = "beautifulsoup"
    success: bool = True
    error_message: str = ""


class ContentExtractor:
    """
    Extracts content from web pages using multiple methods
    """

    def __init__(self, timeout: int = 30):
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

    def extract(self, url: str) -> ExtractedContent:
        """
        Extract content from URL

        Args:
            url: URL to extract content from

        Returns:
            ExtractedContent object
        """
        logger.info(f"Extracting content from: {url}")

        try:
            # Fetch the page
            response = self.session.get(url, timeout=self.timeout)
            response.raise_for_status()

            html = response.text

            # Parse with BeautifulSoup
            soup = BeautifulSoup(html, 'lxml')

            # Extract various elements
            title = self._extract_title(soup)
            text = self._extract_text(soup)
            headings = self._extract_headings(soup)
            paragraphs = self._extract_paragraphs(soup)
            meta_description = self._extract_meta_description(soup)
            meta_keywords = self._extract_meta_keywords(soup)

            # Count elements
            images_count = len(soup.find_all('img'))
            links_count = len(soup.find_all('a', href=True))
            word_count = len(text.split())

            content = ExtractedContent(
                url=url,
                title=title,
                text=text,
                word_count=word_count,
                headings=headings,
                paragraphs=paragraphs,
                meta_description=meta_description,
                meta_keywords=meta_keywords,
                images_count=images_count,
                links_count=links_count,
                extraction_method="beautifulsoup",
                success=True
            )

            logger.info(f"Extracted {word_count} words from {url}")
            return content

        except Exception as e:
            logger.error(f"Error extracting {url}: {e}")

            return ExtractedContent(
                url=url,
                title="",
                text="",
                word_count=0,
                success=False,
                error_message=str(e)
            )

    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extract page title"""
        # Try <title> tag
        title_tag = soup.find('title')
        if title_tag:
            return title_tag.get_text().strip()

        # Try H1
        h1 = soup.find('h1')
        if h1:
            return h1.get_text().strip()

        return ""

    def _extract_text(self, soup: BeautifulSoup) -> str:
        """Extract main text content"""
        # Remove unwanted elements
        for element in soup(['script', 'style', 'nav', 'header', 'footer', 'aside']):
            element.decompose()

        # Get text from main content areas
        main_content = soup.find('main') or soup.find('article') or soup.find('body')

        if main_content:
            text = main_content.get_text(separator=' ', strip=True)
        else:
            text = soup.get_text(separator=' ', strip=True)

        # Clean up whitespace
        text = ' '.join(text.split())

        return text

    def _extract_headings(self, soup: BeautifulSoup) -> Dict[str, List[str]]:
        """Extract all headings (H1-H6)"""
        headings = {
            'h1': [],
            'h2': [],
            'h3': [],
            'h4': [],
            'h5': [],
            'h6': []
        }

        for level in range(1, 7):
            tag = f'h{level}'
            for heading in soup.find_all(tag):
                text = heading.get_text().strip()
                if text:
                    headings[tag].append(text)

        return headings

    def _extract_paragraphs(self, soup: BeautifulSoup) -> List[str]:
        """Extract paragraph text"""
        paragraphs = []

        for p in soup.find_all('p'):
            text = p.get_text().strip()
            if len(text) > 50:  # Only substantial paragraphs
                paragraphs.append(text)

        return paragraphs

    def _extract_meta_description(self, soup: BeautifulSoup) -> str:
        """Extract meta description"""
        meta = soup.find('meta', attrs={'name': 'description'})
        if meta and meta.get('content'):
            return meta['content'].strip()

        # Try Open Graph description
        og_desc = soup.find('meta', attrs={'property': 'og:description'})
        if og_desc and og_desc.get('content'):
            return og_desc['content'].strip()

        return ""

    def _extract_meta_keywords(self, soup: BeautifulSoup) -> List[str]:
        """Extract meta keywords"""
        meta = soup.find('meta', attrs={'name': 'keywords'})
        if meta and meta.get('content'):
            keywords = meta['content'].split(',')
            return [k.strip() for k in keywords if k.strip()]

        return []

    def extract_batch(self, urls: List[str], max_concurrent: int = 5) -> List[ExtractedContent]:
        """
        Extract content from multiple URLs

        Args:
            urls: List of URLs to extract
            max_concurrent: Maximum concurrent requests

        Returns:
            List of ExtractedContent objects
        """
        results = []

        for url in urls:
            try:
                content = self.extract(url)
                results.append(content)
            except Exception as e:
                logger.error(f"Failed to extract {url}: {e}")
                results.append(ExtractedContent(
                    url=url,
                    title="",
                    text="",
                    word_count=0,
                    success=False,
                    error_message=str(e)
                ))

        return results


if __name__ == "__main__":
    # Test the extractor
    import sys

    if len(sys.argv) < 2:
        print("Usage: python content_extractor.py <url>")
        sys.exit(1)

    url = sys.argv[1]
    extractor = ContentExtractor()
    content = extractor.extract(url)

    if content.success:
        print(f"\nTitle: {content.title}")
        print(f"Word Count: {content.word_count}")
        print(f"Images: {content.images_count}")
        print(f"Links: {content.links_count}")

        print(f"\nHeadings:")
        for level, headings in content.headings.items():
            if headings:
                print(f"  {level.upper()}: {len(headings)} headings")
                for h in headings[:3]:
                    print(f"    • {h}")

        print(f"\nFirst 500 characters:")
        print(content.text[:500])

    else:
        print(f"Extraction failed: {content.error_message}")
