"""
Scrapy settings for price intelligence scrapers
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Scrapy settings
BOT_NAME = 'price_intelligence'

SPIDER_MODULES = ['scrapers.spiders']
NEWSPIDER_MODULE = 'scrapers.spiders'

# Obey robots.txt rules (disable for development, enable in production)
ROBOTSTXT_OBEY = os.getenv('SCRAPER_RESPECT_ROBOTS_TXT', 'false').lower() == 'true'

# Configure maximum concurrent requests
CONCURRENT_REQUESTS = int(os.getenv('SCRAPER_CONCURRENT_REQUESTS', 8))

# Configure a delay for requests (respectful scraping)
DOWNLOAD_DELAY = float(os.getenv('SCRAPER_DOWNLOAD_DELAY', 2))

# The download delay setting will honor only one of:
CONCURRENT_REQUESTS_PER_DOMAIN = 4
CONCURRENT_REQUESTS_PER_IP = 4

# Disable cookies (enabled by default)
COOKIES_ENABLED = False

# Disable Telemetry (avoid unnecessary data collection)
TELNETCONSOLE_ENABLED = False

# Override the default request headers:
DEFAULT_REQUEST_HEADERS = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate',
}

# Enable or disable spider middlewares
SPIDER_MIDDLEWARES = {
    'scrapers.middlewares.ErrorHandlingMiddleware': 543,
}

# Enable or disable downloader middlewares
DOWNLOADER_MIDDLEWARES = {
    'scrapers.middlewares.RotateUserAgentMiddleware': 400,
    'scrapy.downloadermiddlewares.useragent.UserAgentMiddleware': None,
}

# Enable or disable extensions
EXTENSIONS = {
    'scrapy.extensions.telnet.TelnetConsole': None,
}

# Configure item pipelines
ITEM_PIPELINES = {
    'scrapers.pipelines.ValidationPipeline': 100,
    'scrapers.pipelines.PriceNormalizationPipeline': 200,
    'scrapers.pipelines.DatabasePipeline': 300,
}

# Enable and configure the AutoThrottle extension
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 2
AUTOTHROTTLE_MAX_DELAY = 10
AUTOTHROTTLE_TARGET_CONCURRENCY = 2.0
AUTOTHROTTLE_DEBUG = False

# Enable and configure HTTP caching (for development)
HTTPCACHE_ENABLED = True
HTTPCACHE_EXPIRATION_SECS = 0
HTTPCACHE_DIR = 'httpcache'
HTTPCACHE_IGNORE_HTTP_CODES = []
HTTPCACHE_STORAGE = 'scrapy.extensions.httpcache.FilesystemCacheStorage'

# Database settings
DB_USER = os.getenv('DB_USER', 'priceuser')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'pricepass123')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'price_intelligence')
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Redis settings (for distributed scraping in the future)
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))

# Logging
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_FORMAT = '%(levelname)s: %(message)s'
