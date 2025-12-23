"""
Example spider template for scraping product prices
This is a demonstration spider - customize for actual competitor websites
"""

import scrapy
from datetime import datetime
from scrapers.items import PriceItem


class ExampleSpider(scrapy.Spider):
    """
    Example spider for educational purposes

    In production, you would:
    1. Respect robots.txt
    2. Implement proper rate limiting
    3. Handle pagination
    4. Parse actual competitor websites
    5. Implement error handling
    """

    name = 'example'
    allowed_domains = ['example.com']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # In production, load product list from database or configuration
        self.products_to_scrape = [
            {'sku': 'ELEC-001', 'url': 'https://example.com/product1'},
            {'sku': 'ELEC-002', 'url': 'https://example.com/product2'},
        ]

    def start_requests(self):
        """Generate initial requests for products to scrape"""
        for product in self.products_to_scrape:
            yield scrapy.Request(
                url=product['url'],
                callback=self.parse_product,
                meta={'sku': product['sku']}
            )

    def parse_product(self, response):
        """
        Parse product page to extract pricing data

        NOTE: This is a template - you need to customize the selectors
        for each competitor website you're scraping.
        """
        item = PriceItem()

        # Product identifiers
        item['sku'] = response.meta['sku']
        item['product_url'] = response.url

        # Extract from page (customize selectors for actual sites)
        # These are example selectors and won't work on real sites
        item['product_name'] = response.css('h1.product-title::text').get()
        item['price_amount'] = self.extract_price(
            response.css('span.price::text').get()
        )

        # Optional fields
        item['original_price'] = self.extract_price(
            response.css('span.original-price::text').get()
        )

        # Stock status
        in_stock_text = response.css('span.availability::text').get()
        item['in_stock'] = 'in stock' in in_stock_text.lower() if in_stock_text else True

        # Shipping
        free_ship = response.css('span.free-shipping::text').get()
        item['free_shipping'] = bool(free_ship)

        # Promotion
        promo_text = response.css('div.promotion::text').get()
        if promo_text:
            item['promotion_applied'] = True
            item['promotion_text'] = promo_text.strip()

        # Competitor info
        item['competitor_name'] = 'Example Retailer'
        item['seller_name'] = 'Example Retailer'

        # Product details
        item['brand'] = response.css('span.brand::text').get()
        item['category'] = 'Electronics'  # Or extract from page
        item['description'] = response.css('div.description::text').get()
        item['image_url'] = response.css('img.product-image::attr(src)').get()

        # Metadata
        item['scraped_at'] = datetime.utcnow()
        item['scrape_method'] = 'web'
        item['currency_code'] = 'USD'

        yield item

    @staticmethod
    def extract_price(price_text):
        """
        Extract numeric price from text

        Examples:
            "$99.99" -> 99.99
            "$1,299.00" -> 1299.00
            "€45,99" -> 45.99
        """
        if not price_text:
            return None

        import re
        # Remove currency symbols and commas
        price_clean = re.sub(r'[^\d.]', '', price_text)

        try:
            return float(price_clean)
        except ValueError:
            return None


"""
REAL-WORLD SPIDER EXAMPLE STRUCTURE:

class AmazonSpider(scrapy.Spider):
    name = 'amazon'
    allowed_domains = ['amazon.com']

    def start_requests(self):
        # Load products from database
        products = get_products_to_scrape('amazon')
        for product in products:
            url = f"https://www.amazon.com/dp/{product.asin}"
            yield scrapy.Request(url, callback=self.parse)

    def parse(self, response):
        # Amazon-specific selectors
        item = PriceItem()
        item['product_name'] = response.css('#productTitle::text').get()
        item['price_amount'] = self.extract_amazon_price(response)
        # ... more fields
        yield item


class WalmartSpider(scrapy.Spider):
    name = 'walmart'
    allowed_domains = ['walmart.com']

    # Walmart might load prices via JavaScript
    # You'd use Playwright or Selenium for this

    def parse(self, response):
        # Walmart-specific parsing logic
        pass


IMPORTANT LEGAL & ETHICAL CONSIDERATIONS:
1. Always check robots.txt and respect it
2. Implement proper rate limiting (2-5 seconds between requests)
3. Identify your bot in User-Agent
4. Only scrape publicly available data
5. Don't overload servers
6. Be prepared to switch to APIs if available
7. Check Terms of Service for each website
"""
