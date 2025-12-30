"""
Web crawler using Playwright for JavaScript-heavy sites
Detects analytics tags, consent banners, and collects page data
"""

import asyncio
import logging
from typing import List, Dict, Optional, Set
from urllib.parse import urljoin, urlparse
from dataclasses import dataclass, field
from datetime import datetime

from playwright.async_api import async_playwright, Page, Browser
from bs4 import BeautifulSoup

# Import helper classes
from .network_monitor import NetworkMonitor
from .ga4_detector import GA4Detector, EventValidator
from .ecommerce_validator import EcommerceValidator, PageType

logger = logging.getLogger(__name__)


@dataclass
class CrawledPage:
    """Represents a single crawled page with detected tags"""
    url: str
    title: str
    status_code: int
    load_time: float
    html_content: str

    # Analytics tags detected
    has_ga4: bool = False
    ga4_measurement_ids: List[str] = field(default_factory=list)
    has_gtm: bool = False
    gtm_container_ids: List[str] = field(default_factory=list)
    has_universal_analytics: bool = False
    ua_tracking_ids: List[str] = field(default_factory=list)

    # Other tracking
    has_facebook_pixel: bool = False
    facebook_pixel_ids: List[str] = field(default_factory=list)
    has_linkedin_insight: bool = False
    has_hotjar: bool = False
    has_google_ads: bool = False

    # Consent & Privacy
    has_consent_banner: bool = False
    consent_platform: Optional[str] = None
    has_privacy_policy_link: bool = False

    # dataLayer
    has_datalayer: bool = False
    datalayer_events: List[Dict] = field(default_factory=list)
    datalayer_defined_before_gtm: bool = True

    # GA4 Events (NEW)
    ga4_events_detected: List[str] = field(default_factory=list)
    has_page_view_event: bool = False
    has_ecommerce_events: bool = False
    ecommerce_events: List[str] = field(default_factory=list)
    page_type: Optional[str] = None  # homepage, product, cart, checkout, etc.

    # Tag Firing (NEW)
    tags_fired: Dict[str, List[Dict]] = field(default_factory=dict)
    ga4_requests: List[Dict] = field(default_factory=list)
    facebook_requests: List[Dict] = field(default_factory=list)

    # Performance
    total_scripts: int = 0
    tracking_scripts: int = 0

    # Issues detected
    issues: List[Dict] = field(default_factory=list)

    # Metadata
    crawled_at: datetime = field(default_factory=datetime.utcnow)


class AnalyticsCrawler:
    """
    Crawls websites and detects analytics implementation
    Uses Playwright for JavaScript execution
    """

    def __init__(
        self,
        start_url: str,
        max_pages: int = 50,
        timeout: int = 30000,
        wait_for_network_idle: bool = True,
        respect_robots: bool = True,
        user_agent: Optional[str] = None
    ):
        self.start_url = start_url
        self.max_pages = max_pages
        self.timeout = timeout
        self.wait_for_network_idle = wait_for_network_idle
        self.respect_robots = respect_robots
        self.user_agent = user_agent or "AnalyticsAuditBot/1.0"

        self.visited_urls: Set[str] = set()
        self.pages_to_crawl: List[str] = [start_url]
        self.crawled_pages: List[CrawledPage] = []

        self.domain = urlparse(start_url).netloc

    async def crawl(self) -> List[CrawledPage]:
        """Main crawl method"""
        logger.info(f"Starting crawl of {self.start_url} (max {self.max_pages} pages)")

        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(headless=True)

            try:
                while self.pages_to_crawl and len(self.crawled_pages) < self.max_pages:
                    url = self.pages_to_crawl.pop(0)

                    if url in self.visited_urls:
                        continue

                    try:
                        page_data = await self._crawl_page(browser, url)
                        if page_data:
                            self.crawled_pages.append(page_data)
                            self.visited_urls.add(url)

                            # Extract more URLs to crawl (same domain only)
                            new_urls = self._extract_links(page_data.html_content, url)
                            self.pages_to_crawl.extend(new_urls)

                            logger.info(f"Crawled {len(self.crawled_pages)}/{self.max_pages}: {url}")

                    except Exception as e:
                        logger.error(f"Error crawling {url}: {e}")
                        continue

            finally:
                await browser.close()

        logger.info(f"Crawl complete. Processed {len(self.crawled_pages)} pages")
        return self.crawled_pages

    async def _crawl_page(self, browser: Browser, url: str) -> Optional[CrawledPage]:
        """Crawl a single page and extract analytics data"""
        page = await browser.new_page(user_agent=self.user_agent)

        try:
            # Create page data object (we'll populate it)
            page_data = CrawledPage(
                url=url,
                title="",
                status_code=200,
                load_time=0.0,
                html_content=""
            )

            # Set up network request monitoring BEFORE navigation
            network_monitor = NetworkMonitor()

            # Attach request listener
            page.on('request', network_monitor.handle_request)

            # Navigate and wait for network idle
            start_time = datetime.utcnow()

            if self.wait_for_network_idle:
                await page.goto(url, timeout=self.timeout, wait_until="networkidle")
            else:
                await page.goto(url, timeout=self.timeout, wait_until="domcontentloaded")

            # Wait a bit more for async tags to fire
            await page.wait_for_timeout(2000)  # 2 seconds

            load_time = (datetime.utcnow() - start_time).total_seconds()

            # Get page content and title
            html_content = await page.content()
            title = await page.title()

            # Update page data
            page_data.title = title
            page_data.load_time = load_time
            page_data.html_content = html_content

            # Get network monitoring summaries
            ga4_summary = network_monitor.get_ga4_summary()
            facebook_summary = network_monitor.get_facebook_summary()

            page_data.ga4_requests = ga4_summary['requests']
            page_data.facebook_requests = facebook_summary['requests']

            # Detect analytics tags (enhanced with network data)
            await self._detect_analytics_tags(page, page_data, ga4_summary['measurement_ids'])

            # Check dataLayer and validate events
            await self._check_datalayer(page, page_data)

            # Validate GA4 events
            await self._validate_ga4_events(page, page_data)

            # Validate ecommerce tracking
            await self._validate_ecommerce(page, page_data)

            # Detect consent banner
            await self._detect_consent_banner(page, page_data)

            # Count scripts
            page_data.total_scripts = await page.evaluate("() => document.scripts.length")

            # Parse HTML for additional analysis
            self._parse_html(html_content, page_data)

            return page_data

        except Exception as e:
            logger.error(f"Error processing {url}: {e}")
            return None

        finally:
            await page.close()

    async def _detect_analytics_tags(self, page: Page, page_data: CrawledPage, ga4_ids_from_network: set = None):
        """Detect various analytics tags using GA4Detector helper class"""
        try:
            if ga4_ids_from_network is None:
                ga4_ids_from_network = set()

            # Use GA4Detector helper class for three-method detection
            gtag_result = await GA4Detector.detect_direct_gtag(page)
            datalayer_ids = await GA4Detector.detect_datalayer_config(page)

            # Combine results from all detection methods
            detection_result = GA4Detector.combine_results(
                gtag_result=gtag_result,
                datalayer_ids=datalayer_ids,
                network_ids=ga4_ids_from_network
            )

            # Update page data with detection results
            page_data.has_ga4 = detection_result['has_ga4'] or len(page_data.ga4_requests) > 0
            page_data.ga4_measurement_ids = detection_result['measurement_ids']

        except Exception as e:
            logger.error(f"Error detecting analytics tags: {e}")
            # Set defaults on error
            page_data.has_ga4 = False
            page_data.ga4_measurement_ids = []

    async def _validate_ga4_events(self, page: Page, page_data: CrawledPage):
        """Validate GA4 event tracking using EventValidator helper class"""
        try:
            # Use EventValidator helper class
            validation_result = await EventValidator.validate_events(page)

            # Store GA4 events from validation
            page_data.ga4_events_detected = validation_result['all_events']
            page_data.has_page_view_event = validation_result['has_page_view']
            page_data.has_ecommerce_events = len(validation_result['ecommerce_events']) > 0
            page_data.ecommerce_events = [evt['event'] for evt in validation_result['ecommerce_events']]

            # Add issues for missing critical events
            if page_data.has_ga4 and not page_data.has_page_view_event:
                page_data.issues.append({
                    'severity': 'warning',
                    'category': 'implementation',
                    'message': 'GA4 detected but no page_view event found',
                    'recommendation': 'Verify GA4 configuration is firing page_view events'
                })

        except Exception as e:
            logger.error(f"Error validating GA4 events: {e}")
            # Set defaults on error
            page_data.ga4_events_detected = []
            page_data.has_page_view_event = False
            page_data.has_ecommerce_events = False
            page_data.ecommerce_events = []

    async def _validate_ecommerce(self, page: Page, page_data: CrawledPage):
        """Validate ecommerce tracking using EcommerceValidator helper class"""
        try:
            # Use EcommerceValidator to detect page type and validate tracking
            page_type = await EcommerceValidator.detect_page_type_with_content(page, page_data.url)
            page_data.page_type = page_type.value

            # Validate tracking for the detected page type
            validation_issues = EcommerceValidator.validate_tracking(
                page_type=page_type,
                ecommerce_events=page_data.ecommerce_events
            )

            # Add validation issues to page data
            page_data.issues.extend(validation_issues)

        except Exception as e:
            logger.error(f"Error validating ecommerce tracking: {e}")
            # Set default page type on error
            page_data.page_type = PageType.STANDARD.value

        # Check for GTM
        gtm_check = await page.evaluate("""
            () => {
                if (window.google_tag_manager) {
                    const containers = Object.keys(window.google_tag_manager);
                    return {has_gtm: true, container_ids: containers};
                }
                return {has_gtm: false, container_ids: []};
            }
        """)

        page_data.has_gtm = gtm_check['has_gtm']
        page_data.gtm_container_ids = gtm_check['container_ids']

        # Check for Universal Analytics (legacy)
        ua_check = await page.evaluate("""
            () => {
                if (window.ga && window.ga.getAll) {
                    const trackers = window.ga.getAll();
                    const ids = trackers.map(t => t.get('trackingId'));
                    return {has_ua: true, ids: ids};
                }
                return {has_ua: false, ids: []};
            }
        """)

        page_data.has_universal_analytics = ua_check['has_ua']
        page_data.ua_tracking_ids = ua_check['ids']

        # Check for Facebook Pixel
        fb_check = await page.evaluate("""
            () => {
                if (window.fbq) {
                    // Try to extract pixel ID
                    const scripts = Array.from(document.scripts);
                    const fbScripts = scripts.filter(s => s.textContent.includes('fbq'));
                    // This is simplified - real implementation would parse the init call
                    return {has_fb: true, ids: []};
                }
                return {has_fb: false, ids: []};
            }
        """)

        page_data.has_facebook_pixel = fb_check['has_fb']

        # Check for other common tools
        page_data.has_hotjar = await page.evaluate("() => !!window.hj")
        page_data.has_linkedin_insight = await page.evaluate("() => !!window._linkedin_data_partner_ids")

    async def _check_datalayer(self, page: Page, page_data: CrawledPage):
        """Check dataLayer implementation"""

        datalayer_check = await page.evaluate("""
            () => {
                if (window.dataLayer) {
                    return {
                        exists: true,
                        events: window.dataLayer.filter(item => item.event).slice(0, 10)
                    };
                }
                return {exists: false, events: []};
            }
        """)

        page_data.has_datalayer = datalayer_check['exists']
        page_data.datalayer_events = datalayer_check['events']

        # Check if dataLayer is defined before GTM
        if page_data.has_gtm and page_data.has_datalayer:
            # Parse HTML to check order
            soup = BeautifulSoup(page_data.html_content, 'lxml')
            scripts = soup.find_all('script')

            datalayer_index = None
            gtm_index = None

            for i, script in enumerate(scripts):
                if script.string and 'dataLayer' in script.string and datalayer_index is None:
                    datalayer_index = i
                if script.get('src') and 'googletagmanager.com/gtm.js' in script.get('src', ''):
                    gtm_index = i
                    break

            if datalayer_index is not None and gtm_index is not None:
                page_data.datalayer_defined_before_gtm = datalayer_index < gtm_index

                if not page_data.datalayer_defined_before_gtm:
                    page_data.issues.append({
                        'severity': 'critical',
                        'category': 'implementation',
                        'message': 'dataLayer defined after GTM - this will cause data loss',
                        'recommendation': 'Move dataLayer initialization before GTM script'
                    })

    async def _detect_consent_banner(self, page: Page, page_data: CrawledPage):
        """Detect consent management platforms"""

        # Check for common consent platforms
        consent_check = await page.evaluate("""
            () => {
                const platforms = {
                    'OneTrust': !!window.OneTrust || !!window.OptanonWrapper,
                    'Cookiebot': !!window.Cookiebot,
                    'CookieYes': !!window.CookieYes,
                    'Osano': !!window.Osano,
                    'Termly': !!window.termly,
                    'Quantcast': !!window.__cmp
                };

                for (const [platform, detected] of Object.entries(platforms)) {
                    if (detected) return platform;
                }

                // Generic check for cookie banner
                const banner = document.querySelector('[class*="cookie"], [id*="cookie"], [class*="consent"], [id*="consent"]');
                return banner ? 'Unknown' : null;
            }
        """)

        if consent_check:
            page_data.has_consent_banner = True
            page_data.consent_platform = consent_check

        # Check if GA4/GTM fires before consent (compliance issue)
        if page_data.has_consent_banner and (page_data.has_ga4 or page_data.has_gtm):
            # This is a simplified check - proper implementation would monitor network requests
            page_data.issues.append({
                'severity': 'warning',
                'category': 'privacy',
                'message': 'Consent banner detected but tags may fire before consent',
                'recommendation': 'Implement tag firing delays or Google Consent Mode'
            })

    def _parse_html(self, html: str, page_data: CrawledPage):
        """Parse HTML for additional checks"""
        soup = BeautifulSoup(html, 'lxml')

        # Check for privacy policy link
        privacy_links = soup.find_all('a', href=True)
        for link in privacy_links:
            href = link.get('href', '').lower()
            text = link.get_text().lower()
            if 'privacy' in href or 'privacy' in text:
                page_data.has_privacy_policy_link = True
                break

        # Count tracking scripts
        scripts = soup.find_all('script', src=True)
        tracking_domains = [
            'google-analytics.com',
            'googletagmanager.com',
            'facebook.net',
            'hotjar.com',
            'doubleclick.net'
        ]

        page_data.tracking_scripts = sum(
            1 for script in scripts
            if any(domain in script.get('src', '') for domain in tracking_domains)
        )

        # Check for duplicate tags
        gtm_scripts = [s for s in scripts if 'googletagmanager.com/gtm.js' in s.get('src', '')]
        if len(gtm_scripts) > 1:
            page_data.issues.append({
                'severity': 'warning',
                'category': 'implementation',
                'message': f'Duplicate GTM tags detected ({len(gtm_scripts)} instances)',
                'recommendation': 'Remove duplicate GTM implementations'
            })

    def _extract_links(self, html: str, base_url: str) -> List[str]:
        """Extract same-domain links for further crawling"""
        soup = BeautifulSoup(html, 'lxml')
        links = []

        for anchor in soup.find_all('a', href=True):
            href = anchor['href']
            full_url = urljoin(base_url, href)
            parsed = urlparse(full_url)

            # Only crawl same domain, ignore fragments and certain paths
            if (parsed.netloc == self.domain and
                full_url not in self.visited_urls and
                not parsed.fragment and
                not any(ext in parsed.path.lower() for ext in ['.pdf', '.jpg', '.png', '.zip'])):
                links.append(full_url)

        return list(set(links))[:20]  # Limit new URLs per page


async def crawl_site(url: str, max_pages: int = 50) -> List[CrawledPage]:
    """Convenience function to crawl a site"""
    crawler = AnalyticsCrawler(url, max_pages=max_pages)
    return await crawler.crawl()


if __name__ == "__main__":
    # Example usage
    import sys

    if len(sys.argv) < 2:
        print("Usage: python page_crawler.py <url>")
        sys.exit(1)

    url = sys.argv[1]
    results = asyncio.run(crawl_site(url, max_pages=10))

    print(f"\nCrawled {len(results)} pages")
    for page in results:
        print(f"\n{page.url}")
        print(f"  GA4: {page.has_ga4} {page.ga4_measurement_ids}")
        print(f"  GTM: {page.has_gtm} {page.gtm_container_ids}")
        print(f"  Consent: {page.has_consent_banner} ({page.consent_platform})")
        print(f"  Issues: {len(page.issues)}")
