"""
Scrapy pipelines for processing scraped price data
"""

from datetime import datetime
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
import re

from warehouse.models import (
    DimProduct, DimCompetitor, DimDate, DimScrapeRun, FactPrice
)

logger = logging.getLogger(__name__)


class ValidationPipeline:
    """Validate scraped items before processing"""

    def process_item(self, item, spider):
        # Required fields
        required_fields = ['sku', 'product_name', 'price_amount', 'competitor_name']

        for field in required_fields:
            if field not in item or not item[field]:
                raise ValueError(f"Missing required field: {field}")

        # Validate price is numeric and positive
        try:
            price = float(item['price_amount'])
            if price <= 0:
                raise ValueError(f"Invalid price: {price}")
            item['price_amount'] = price
        except (ValueError, TypeError) as e:
            raise ValueError(f"Invalid price_amount: {item.get('price_amount')}")

        # Validate in_stock is boolean
        if 'in_stock' not in item:
            item['in_stock'] = True
        else:
            item['in_stock'] = bool(item['in_stock'])

        return item


class PriceNormalizationPipeline:
    """Normalize and clean price data"""

    def process_item(self, item, spider):
        # Normalize currency code
        if 'currency_code' not in item or not item['currency_code']:
            item['currency_code'] = 'USD'

        # Calculate discount percentage if both prices exist
        if 'original_price' in item and item['original_price']:
            original = float(item['original_price'])
            current = float(item['price_amount'])
            if original > current:
                discount_pct = ((original - current) / original) * 100
                item['discount_percentage'] = round(discount_pct, 2)
                item['promotion_applied'] = True
            else:
                item['promotion_applied'] = False
        else:
            item['promotion_applied'] = False

        # Normalize shipping
        if 'free_shipping' not in item:
            item['free_shipping'] = False

        # Set default scrape method
        if 'scrape_method' not in item:
            item['scrape_method'] = 'web'

        # Set scraped timestamp
        if 'scraped_at' not in item:
            item['scraped_at'] = datetime.utcnow()

        # Clean product name
        if 'product_name' in item:
            item['product_name'] = self.clean_text(item['product_name'])

        return item

    @staticmethod
    def clean_text(text):
        """Clean and normalize text"""
        if not text:
            return text
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        return text


class DatabasePipeline:
    """Save items to PostgreSQL database"""

    def __init__(self, database_url):
        self.database_url = database_url
        self.engine = None
        self.Session = None
        self.session = None
        self.current_run = None

    @classmethod
    def from_crawler(cls, crawler):
        return cls(
            database_url=crawler.settings.get('DATABASE_URL')
        )

    def open_spider(self, spider):
        """Initialize database connection and create scrape run"""
        self.engine = create_engine(self.database_url)
        self.Session = sessionmaker(bind=self.engine)
        self.session = self.Session()

        # Get or create competitor
        competitor = self.get_or_create_competitor(
            spider.name,
            spider.allowed_domains[0] if hasattr(spider, 'allowed_domains') else 'unknown.com'
        )

        # Create scrape run
        self.current_run = DimScrapeRun(
            competitor_id=competitor.competitor_id,
            run_started_at=datetime.utcnow(),
            status='running',
            scraper_version='1.0.0'
        )
        self.session.add(self.current_run)
        self.session.commit()

        logger.info(f"Started scrape run {self.current_run.run_id} for {competitor.competitor_name}")

    def close_spider(self, spider):
        """Close database connection and finalize scrape run"""
        if self.current_run:
            self.current_run.run_completed_at = datetime.utcnow()
            self.current_run.status = 'completed'
            self.session.commit()
            logger.info(f"Completed scrape run {self.current_run.run_id}")

        if self.session:
            self.session.close()

    def process_item(self, item, spider):
        """Save item to database"""
        try:
            # Get or create product
            product = self.get_or_create_product(item)

            # Get or create competitor
            competitor = self.get_or_create_competitor(
                item['competitor_name'],
                item.get('product_url', 'unknown.com').split('/')[2] if '/' in item.get('product_url', '') else 'unknown.com'
            )

            # Get date dimension
            date_id = self.get_date_id(item['scraped_at'])

            # Create price fact
            price_fact = FactPrice(
                product_id=product.product_id,
                competitor_id=competitor.competitor_id,
                date_id=date_id,
                run_id=self.current_run.run_id,
                price_amount=item['price_amount'],
                original_price=item.get('original_price'),
                currency_code=item.get('currency_code', 'USD'),
                in_stock=item.get('in_stock', True),
                stock_quantity=item.get('stock_quantity'),
                shipping_cost=item.get('shipping_cost'),
                shipping_days=item.get('shipping_days'),
                free_shipping=item.get('free_shipping', False),
                promotion_applied=item.get('promotion_applied', False),
                promotion_text=item.get('promotion_text'),
                discount_percentage=item.get('discount_percentage'),
                product_url=item.get('product_url'),
                seller_name=item.get('seller_name', item['competitor_name']),
                seller_rating=item.get('seller_rating'),
                product_condition=item.get('product_condition', 'new'),
                scraped_at=item['scraped_at'],
                scrape_method=item.get('scrape_method', 'web')
            )

            self.session.add(price_fact)
            self.session.commit()

            # Update scrape run counters
            self.current_run.products_scraped += 1
            self.session.commit()

            logger.debug(f"Saved price for {item['sku']}: ${item['price_amount']}")

        except IntegrityError as e:
            self.session.rollback()
            logger.warning(f"Duplicate price record (already scraped): {item['sku']}")
            self.current_run.products_failed += 1
            self.session.commit()

        except Exception as e:
            self.session.rollback()
            logger.error(f"Error saving item {item.get('sku', 'unknown')}: {e}")
            self.current_run.products_failed += 1
            self.current_run.error_message = str(e)[:500]
            self.session.commit()

        return item

    def get_or_create_product(self, item):
        """Get existing product or create new one"""
        product = self.session.query(DimProduct).filter_by(sku=item['sku']).first()

        if not product:
            product = DimProduct(
                sku=item['sku'],
                product_name=item['product_name'],
                brand=item.get('brand'),
                category=item.get('category', 'Unknown'),
                subcategory=item.get('subcategory'),
                upc=item.get('upc'),
                description=item.get('description'),
                image_url=item.get('image_url'),
                is_active=True
            )
            self.session.add(product)
            self.session.commit()
            logger.info(f"Created new product: {item['sku']}")
        else:
            # Update product details if they've changed
            if item.get('image_url') and not product.image_url:
                product.image_url = item['image_url']
            if item.get('description') and not product.description:
                product.description = item['description']
            product.updated_at = datetime.utcnow()
            self.session.commit()

        return product

    def get_or_create_competitor(self, name, domain):
        """Get existing competitor or create new one"""
        competitor = self.session.query(DimCompetitor).filter_by(
            competitor_name=name
        ).first()

        if not competitor:
            competitor = DimCompetitor(
                competitor_name=name,
                domain=domain,
                scraper_enabled=True
            )
            self.session.add(competitor)
            self.session.commit()
            logger.info(f"Created new competitor: {name}")

        return competitor

    def get_date_id(self, date_obj):
        """Get date_id from date dimension"""
        if isinstance(date_obj, datetime):
            date_obj = date_obj.date()

        dim_date = self.session.query(DimDate).filter(
            DimDate.date == date_obj
        ).first()

        if dim_date:
            return dim_date.date_id

        # If date doesn't exist, return None (should not happen with populated dim_dates)
        logger.warning(f"Date {date_obj} not found in dim_dates")
        return None
