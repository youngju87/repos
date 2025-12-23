"""
Scrapy middlewares for price intelligence scrapers
"""

from scrapy import signals
from scrapy.http import HtmlResponse
import random
import logging

logger = logging.getLogger(__name__)


USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
]


class RotateUserAgentMiddleware:
    """Rotate user agents to avoid detection"""

    def process_request(self, request, spider):
        user_agent = random.choice(USER_AGENTS)
        request.headers['User-Agent'] = user_agent
        logger.debug(f"Using User-Agent: {user_agent}")


class ErrorHandlingMiddleware:
    """Enhanced error handling for failed requests"""

    @classmethod
    def from_crawler(cls, crawler):
        middleware = cls()
        crawler.signals.connect(middleware.spider_error, signal=signals.spider_error)
        return middleware

    def spider_error(self, failure, response, spider):
        """Log spider errors"""
        logger.error(f"Spider error on {response.url}: {failure}")

    def process_spider_exception(self, response, exception, spider):
        """Handle spider exceptions"""
        logger.error(f"Exception while processing {response.url}: {exception}")
        return []
