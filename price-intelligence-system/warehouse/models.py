"""
SQLAlchemy ORM Models for Price Intelligence Warehouse
Maps to the star schema defined in schema.sql
"""

from datetime import datetime
from sqlalchemy import (
    Boolean, Column, Date, DateTime, Integer, String,
    Numeric, Text, ForeignKey, UniqueConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid

Base = declarative_base()


class DimDate(Base):
    """Date dimension for time-series analysis"""
    __tablename__ = 'dim_dates'

    date_id = Column(Integer, primary_key=True)
    date = Column(Date, nullable=False, unique=True)
    day_of_week = Column(String(10), nullable=False)
    day_of_month = Column(Integer, nullable=False)
    day_of_year = Column(Integer, nullable=False)
    week_of_year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    month_name = Column(String(10), nullable=False)
    quarter = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    is_weekend = Column(Boolean, nullable=False)
    is_holiday = Column(Boolean, default=False)
    holiday_name = Column(String(100))

    # Relationships
    prices = relationship("FactPrice", back_populates="date")


class DimProduct(Base):
    """Product catalog dimension"""
    __tablename__ = 'dim_products'

    product_id = Column(Integer, primary_key=True)
    sku = Column(String(100), unique=True, nullable=False)
    product_name = Column(String(500), nullable=False)
    brand = Column(String(200))
    category = Column(String(100), nullable=False)
    subcategory = Column(String(100))
    upc = Column(String(50))
    manufacturer_id = Column(String(100))
    description = Column(Text)
    image_url = Column(String(1000))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    prices = relationship("FactPrice", back_populates="product")

    def __repr__(self):
        return f"<Product(sku='{self.sku}', name='{self.product_name}')>"


class DimCompetitor(Base):
    """Competitor/retailer dimension"""
    __tablename__ = 'dim_competitors'

    competitor_id = Column(Integer, primary_key=True)
    competitor_name = Column(String(200), unique=True, nullable=False)
    domain = Column(String(500), nullable=False)
    country_code = Column(String(2), default='US')
    market_segment = Column(String(50))  # 'discount', 'premium', 'mid-tier'
    is_authorized_reseller = Column(Boolean, default=True)
    scraper_enabled = Column(Boolean, default=True)
    scraper_config = Column(JSONB)  # Store scraper-specific settings
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    prices = relationship("FactPrice", back_populates="competitor")
    scrape_runs = relationship("DimScrapeRun", back_populates="competitor")

    def __repr__(self):
        return f"<Competitor(name='{self.competitor_name}', domain='{self.domain}')>"


class DimScrapeRun(Base):
    """Scrape run metadata for monitoring data quality"""
    __tablename__ = 'dim_scrape_runs'

    run_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    competitor_id = Column(Integer, ForeignKey('dim_competitors.competitor_id'))
    run_started_at = Column(DateTime, nullable=False)
    run_completed_at = Column(DateTime)
    status = Column(String(20), nullable=False)  # 'running', 'completed', 'failed'
    products_scraped = Column(Integer, default=0)
    products_failed = Column(Integer, default=0)
    error_message = Column(Text)
    scraper_version = Column(String(20))

    # Relationships
    competitor = relationship("DimCompetitor", back_populates="scrape_runs")
    prices = relationship("FactPrice", back_populates="scrape_run")

    def __repr__(self):
        return f"<ScrapeRun(run_id='{self.run_id}', status='{self.status}')>"


class FactPrice(Base):
    """Core fact table storing all price observations"""
    __tablename__ = 'fact_prices'
    __table_args__ = (
        UniqueConstraint('product_id', 'competitor_id', 'scraped_at',
                        name='uq_price_observation'),
        Index('idx_fact_prices_product', 'product_id'),
        Index('idx_fact_prices_competitor', 'competitor_id'),
        Index('idx_fact_prices_date', 'date_id'),
        Index('idx_fact_prices_scraped_at', 'scraped_at'),
        Index('idx_fact_prices_product_competitor', 'product_id', 'competitor_id'),
        Index('idx_fact_prices_product_date', 'product_id', 'date_id', 'competitor_id'),
    )

    price_id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey('dim_products.product_id'), nullable=False)
    competitor_id = Column(Integer, ForeignKey('dim_competitors.competitor_id'), nullable=False)
    date_id = Column(Integer, ForeignKey('dim_dates.date_id'), nullable=False)
    run_id = Column(UUID(as_uuid=True), ForeignKey('dim_scrape_runs.run_id'))

    # Price metrics
    price_amount = Column(Numeric(10, 2), nullable=False)
    original_price = Column(Numeric(10, 2))
    currency_code = Column(String(3), default='USD')

    # Availability
    in_stock = Column(Boolean, nullable=False, default=True)
    stock_quantity = Column(Integer)

    # Shipping
    shipping_cost = Column(Numeric(10, 2))
    shipping_days = Column(Integer)
    free_shipping = Column(Boolean, default=False)

    # Promotions
    promotion_applied = Column(Boolean, default=False)
    promotion_text = Column(Text)
    discount_percentage = Column(Numeric(5, 2))

    # Product details at time of scrape
    product_url = Column(String(1000))
    seller_name = Column(String(200))
    seller_rating = Column(Numeric(3, 2))
    product_condition = Column(String(20), default='new')

    # Metadata
    scraped_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    scrape_method = Column(String(50), default='web')

    # Relationships
    product = relationship("DimProduct", back_populates="prices")
    competitor = relationship("DimCompetitor", back_populates="prices")
    date = relationship("DimDate", back_populates="prices")
    scrape_run = relationship("DimScrapeRun", back_populates="prices")

    def __repr__(self):
        return (f"<Price(product_id={self.product_id}, "
                f"competitor_id={self.competitor_id}, "
                f"amount={self.price_amount})>")

    @property
    def effective_price(self):
        """Calculate total price including shipping"""
        total = float(self.price_amount)
        if self.shipping_cost and not self.free_shipping:
            total += float(self.shipping_cost)
        return round(total, 2)

    @property
    def discount_amount(self):
        """Calculate discount amount if original price exists"""
        if self.original_price:
            return float(self.original_price) - float(self.price_amount)
        return 0.0
