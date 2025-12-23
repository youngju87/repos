"""
Scrapy items for price intelligence data
"""

import scrapy


class PriceItem(scrapy.Item):
    """Item representing a single price observation"""

    # Product identifiers
    sku = scrapy.Field()
    product_name = scrapy.Field()
    product_url = scrapy.Field()
    upc = scrapy.Field()

    # Competitor information
    competitor_name = scrapy.Field()
    seller_name = scrapy.Field()
    seller_rating = scrapy.Field()

    # Price data
    price_amount = scrapy.Field()
    original_price = scrapy.Field()
    currency_code = scrapy.Field()

    # Availability
    in_stock = scrapy.Field()
    stock_quantity = scrapy.Field()

    # Shipping
    shipping_cost = scrapy.Field()
    shipping_days = scrapy.Field()
    free_shipping = scrapy.Field()

    # Promotions
    promotion_applied = scrapy.Field()
    promotion_text = scrapy.Field()
    discount_percentage = scrapy.Field()

    # Product details
    brand = scrapy.Field()
    category = scrapy.Field()
    subcategory = scrapy.Field()
    description = scrapy.Field()
    image_url = scrapy.Field()
    product_condition = scrapy.Field()

    # Metadata
    scraped_at = scrapy.Field()
    scrape_method = scrapy.Field()
