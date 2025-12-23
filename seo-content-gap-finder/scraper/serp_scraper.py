"""
SERP Scraper - Fetches Google search results
Uses Playwright to handle JavaScript and avoid detection
"""

import asyncio
import logging
from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime
from urllib.parse import quote_plus

from playwright.async_api import async_playwright, Page

logger = logging.getLogger(__name__)


@dataclass
class SerpResult:
    """Single search result from Google"""
    position: int
    url: str
    title: str
    snippet: str
    domain: str
    has_featured_snippet: bool = False


@dataclass
class SerpData:
    """Complete SERP data for a keyword"""
    keyword: str
    total_results: int
    results: List[SerpResult]
    featured_snippet: Optional[Dict] = None
    people_also_ask: List[str] = None
    scraped_at: datetime = None

    def __post_init__(self):
        if self.scraped_at is None:
            self.scraped_at = datetime.utcnow()
        if self.people_also_ask is None:
            self.people_also_ask = []


class SerpScraper:
    """
    Scrapes Google search results using Playwright
    """

    def __init__(self, headless: bool = True, delay: int = 2):
        self.headless = headless
        self.delay = delay  # Delay between requests in seconds

    async def search(self, keyword: str, num_results: int = 10) -> SerpData:
        """
        Search Google and extract SERP results

        Args:
            keyword: Search query
            num_results: Number of organic results to extract (max ~20)

        Returns:
            SerpData object with results
        """
        logger.info(f"Searching Google for: {keyword}")

        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(headless=self.headless)

            try:
                page = await browser.new_page(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                )

                # Build Google search URL
                encoded_query = quote_plus(keyword)
                search_url = f"https://www.google.com/search?q={encoded_query}&num={num_results}"

                # Navigate to Google
                await page.goto(search_url, wait_until="networkidle")
                await asyncio.sleep(self.delay)  # Respectful delay

                # Extract results
                results = await self._extract_organic_results(page, num_results)

                # Extract featured snippet if present
                featured_snippet = await self._extract_featured_snippet(page)

                # Extract People Also Ask
                paa_questions = await self._extract_people_also_ask(page)

                # Get total results count
                total_results = await self._extract_total_results(page)

                serp_data = SerpData(
                    keyword=keyword,
                    total_results=total_results,
                    results=results,
                    featured_snippet=featured_snippet,
                    people_also_ask=paa_questions
                )

                logger.info(f"Found {len(results)} organic results for '{keyword}'")
                return serp_data

            finally:
                await browser.close()

    async def _extract_organic_results(self, page: Page, num_results: int) -> List[SerpResult]:
        """Extract organic search results"""
        results = []

        # Google organic result selectors (these can change)
        # Targeting the main search result containers
        result_selectors = [
            'div.g',  # Standard result container
            'div[data-hveid]',  # Alternative
        ]

        for selector in result_selectors:
            result_elements = await page.query_selector_all(selector)

            if result_elements:
                logger.debug(f"Found {len(result_elements)} elements with selector: {selector}")

                position = 1
                for element in result_elements[:num_results]:
                    try:
                        # Extract URL
                        link_element = await element.query_selector('a[href]')
                        if not link_element:
                            continue

                        url = await link_element.get_attribute('href')
                        if not url or not url.startswith('http'):
                            continue

                        # Extract title
                        title_element = await element.query_selector('h3')
                        title = await title_element.inner_text() if title_element else ""

                        # Extract snippet
                        snippet_selectors = [
                            'div[data-sncf]',  # Snippet container
                            'div.VwiC3b',
                            'span.aCOpRe',
                            'div.s'
                        ]

                        snippet = ""
                        for snip_selector in snippet_selectors:
                            snippet_element = await element.query_selector(snip_selector)
                            if snippet_element:
                                snippet = await snippet_element.inner_text()
                                break

                        # Extract domain
                        domain = self._extract_domain(url)

                        result = SerpResult(
                            position=position,
                            url=url,
                            title=title,
                            snippet=snippet,
                            domain=domain
                        )

                        results.append(result)
                        position += 1

                        if len(results) >= num_results:
                            break

                    except Exception as e:
                        logger.debug(f"Error extracting result: {e}")
                        continue

                break  # Found results with this selector

        return results

    async def _extract_featured_snippet(self, page: Page) -> Optional[Dict]:
        """Extract featured snippet if present"""
        try:
            # Featured snippet selectors
            snippet_selectors = [
                'div.kp-blk',  # Knowledge panel
                'div.xpdopen',  # Expanded snippet
                'div.IZ6rdc',  # Standard featured snippet
            ]

            for selector in snippet_selectors:
                snippet_element = await page.query_selector(selector)
                if snippet_element:
                    text = await snippet_element.inner_text()
                    return {
                        'text': text[:500],  # Limit length
                        'type': 'featured_snippet'
                    }

        except Exception as e:
            logger.debug(f"Error extracting featured snippet: {e}")

        return None

    async def _extract_people_also_ask(self, page: Page) -> List[str]:
        """Extract People Also Ask questions"""
        questions = []

        try:
            # PAA question selectors
            paa_selectors = [
                'div.related-question-pair span',
                'div.cbphWd span',
            ]

            for selector in paa_selectors:
                elements = await page.query_selector_all(selector)
                for element in elements[:5]:  # Limit to 5 questions
                    text = await element.inner_text()
                    if text and '?' in text:
                        questions.append(text.strip())

                if questions:
                    break

        except Exception as e:
            logger.debug(f"Error extracting PAA: {e}")

        return list(set(questions))  # Remove duplicates

    async def _extract_total_results(self, page: Page) -> int:
        """Extract total results count"""
        try:
            stats_element = await page.query_selector('div#result-stats')
            if stats_element:
                stats_text = await stats_element.inner_text()
                # Extract number from text like "About 123,000,000 results"
                import re
                match = re.search(r'([\d,]+)', stats_text)
                if match:
                    return int(match.group(1).replace(',', ''))
        except Exception as e:
            logger.debug(f"Error extracting total results: {e}")

        return 0

    @staticmethod
    def _extract_domain(url: str) -> str:
        """Extract domain from URL"""
        from urllib.parse import urlparse
        parsed = urlparse(url)
        return parsed.netloc.replace('www.', '')


async def search_google(keyword: str, num_results: int = 10) -> SerpData:
    """Convenience function to search Google"""
    scraper = SerpScraper()
    return await scraper.search(keyword, num_results)


if __name__ == "__main__":
    # Test the scraper
    import sys

    if len(sys.argv) < 2:
        print("Usage: python serp_scraper.py 'your search query'")
        sys.exit(1)

    keyword = sys.argv[1]
    results = asyncio.run(search_google(keyword, num_results=10))

    print(f"\nSearch: {results.keyword}")
    print(f"Total Results: {results.total_results:,}")
    print(f"\nOrganic Results ({len(results.results)}):")
    print("=" * 80)

    for result in results.results:
        print(f"\n{result.position}. {result.title}")
        print(f"   {result.url}")
        print(f"   {result.snippet[:100]}...")

    if results.featured_snippet:
        print(f"\n\nFeatured Snippet:")
        print(results.featured_snippet['text'][:200])

    if results.people_also_ask:
        print(f"\n\nPeople Also Ask:")
        for q in results.people_also_ask:
            print(f"  • {q}")
