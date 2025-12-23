"""
Generate realistic sample data for Price Intelligence demonstration
Creates products, competitors, and 90 days of pricing history
"""

import os
import sys
from pathlib import Path
from datetime import datetime, timedelta
import random

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

from warehouse.models import (
    Base, DimProduct, DimCompetitor, DimDate,
    DimScrapeRun, FactPrice
)

# Load environment variables
load_dotenv()

# Database connection
DB_USER = os.getenv('DB_USER', 'priceuser')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'pricepass123')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'price_intelligence')

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"


# Sample data definitions
COMPETITORS = [
    {
        'competitor_name': 'Amazon',
        'domain': 'amazon.com',
        'market_segment': 'mid-tier',
        'is_authorized_reseller': True
    },
    {
        'competitor_name': 'Walmart',
        'domain': 'walmart.com',
        'market_segment': 'discount',
        'is_authorized_reseller': True
    },
    {
        'competitor_name': 'Target',
        'domain': 'target.com',
        'market_segment': 'mid-tier',
        'is_authorized_reseller': True
    },
    {
        'competitor_name': 'Best Buy',
        'domain': 'bestbuy.com',
        'market_segment': 'premium',
        'is_authorized_reseller': True
    },
    {
        'competitor_name': 'Unauthorized Seller Co',
        'domain': 'cheapdeals.example.com',
        'market_segment': 'discount',
        'is_authorized_reseller': False
    }
]

PRODUCTS = [
    # Electronics
    {'sku': 'ELEC-001', 'name': 'Wireless Noise-Cancelling Headphones', 'brand': 'SoundTech', 'category': 'Electronics', 'subcategory': 'Audio', 'base_price': 299.99},
    {'sku': 'ELEC-002', 'name': '4K Smart TV 55 inch', 'brand': 'ViewMax', 'category': 'Electronics', 'subcategory': 'TV', 'base_price': 699.99},
    {'sku': 'ELEC-003', 'name': 'Laptop Computer 15.6 inch', 'brand': 'TechPro', 'category': 'Electronics', 'subcategory': 'Computers', 'base_price': 1299.99},
    {'sku': 'ELEC-004', 'name': 'Wireless Gaming Mouse', 'brand': 'GameGear', 'category': 'Electronics', 'subcategory': 'Accessories', 'base_price': 79.99},
    {'sku': 'ELEC-005', 'name': 'Smartphone 128GB', 'brand': 'MobileTech', 'category': 'Electronics', 'subcategory': 'Phones', 'base_price': 899.99},
    {'sku': 'ELEC-006', 'name': 'Wireless Earbuds Pro', 'brand': 'SoundTech', 'category': 'Electronics', 'subcategory': 'Audio', 'base_price': 199.99},
    {'sku': 'ELEC-007', 'name': 'Tablet 10.5 inch', 'brand': 'TechPro', 'category': 'Electronics', 'subcategory': 'Tablets', 'base_price': 449.99},
    {'sku': 'ELEC-008', 'name': 'Smart Watch Series 5', 'brand': 'FitTime', 'category': 'Electronics', 'subcategory': 'Wearables', 'base_price': 349.99},
    {'sku': 'ELEC-009', 'name': 'Portable Bluetooth Speaker', 'brand': 'SoundTech', 'category': 'Electronics', 'subcategory': 'Audio', 'base_price': 129.99},
    {'sku': 'ELEC-010', 'name': 'External SSD 1TB', 'brand': 'DataStore', 'category': 'Electronics', 'subcategory': 'Storage', 'base_price': 159.99},

    # Home & Garden
    {'sku': 'HOME-001', 'name': 'Robot Vacuum Cleaner', 'brand': 'CleanBot', 'category': 'Home & Garden', 'subcategory': 'Appliances', 'base_price': 399.99},
    {'sku': 'HOME-002', 'name': 'Air Purifier HEPA Filter', 'brand': 'PureAir', 'category': 'Home & Garden', 'subcategory': 'Appliances', 'base_price': 249.99},
    {'sku': 'HOME-003', 'name': 'Smart Thermostat', 'brand': 'HomeTech', 'category': 'Home & Garden', 'subcategory': 'Smart Home', 'base_price': 179.99},
    {'sku': 'HOME-004', 'name': 'Cordless Drill Set', 'brand': 'PowerTools', 'category': 'Home & Garden', 'subcategory': 'Tools', 'base_price': 149.99},
    {'sku': 'HOME-005', 'name': 'LED Desk Lamp', 'brand': 'BrightLight', 'category': 'Home & Garden', 'subcategory': 'Lighting', 'base_price': 49.99},
    {'sku': 'HOME-006', 'name': 'Coffee Maker 12-Cup', 'brand': 'BrewMaster', 'category': 'Home & Garden', 'subcategory': 'Kitchen', 'base_price': 89.99},
    {'sku': 'HOME-007', 'name': 'Electric Pressure Cooker', 'brand': 'QuickCook', 'category': 'Home & Garden', 'subcategory': 'Kitchen', 'base_price': 119.99},
    {'sku': 'HOME-008', 'name': 'Standing Desk Adjustable', 'brand': 'ErgoWork', 'category': 'Home & Garden', 'subcategory': 'Furniture', 'base_price': 399.99},
    {'sku': 'HOME-009', 'name': 'Ergonomic Office Chair', 'brand': 'ErgoWork', 'category': 'Home & Garden', 'subcategory': 'Furniture', 'base_price': 299.99},
    {'sku': 'HOME-010', 'name': 'Indoor Plant Grow Light', 'brand': 'GreenGrow', 'category': 'Home & Garden', 'subcategory': 'Garden', 'base_price': 79.99},

    # Sports & Outdoors
    {'sku': 'SPORT-001', 'name': 'Yoga Mat Premium', 'brand': 'FitLife', 'category': 'Sports & Outdoors', 'subcategory': 'Fitness', 'base_price': 39.99},
    {'sku': 'SPORT-002', 'name': 'Adjustable Dumbbells 50lb', 'brand': 'StrongFit', 'category': 'Sports & Outdoors', 'subcategory': 'Fitness', 'base_price': 299.99},
    {'sku': 'SPORT-003', 'name': 'Running Shoes Men', 'brand': 'RunFast', 'category': 'Sports & Outdoors', 'subcategory': 'Footwear', 'base_price': 129.99},
    {'sku': 'SPORT-004', 'name': 'Camping Tent 4-Person', 'brand': 'OutdoorPro', 'category': 'Sports & Outdoors', 'subcategory': 'Camping', 'base_price': 199.99},
    {'sku': 'SPORT-005', 'name': 'Mountain Bike 27.5 inch', 'brand': 'TrailRider', 'category': 'Sports & Outdoors', 'subcategory': 'Cycling', 'base_price': 599.99},
    {'sku': 'SPORT-006', 'name': 'Fitness Tracker Watch', 'brand': 'FitTime', 'category': 'Sports & Outdoors', 'subcategory': 'Wearables', 'base_price': 99.99},
    {'sku': 'SPORT-007', 'name': 'Resistance Bands Set', 'brand': 'FitLife', 'category': 'Sports & Outdoors', 'subcategory': 'Fitness', 'base_price': 29.99},
    {'sku': 'SPORT-008', 'name': 'Water Bottle Insulated 32oz', 'brand': 'HydroFit', 'category': 'Sports & Outdoors', 'subcategory': 'Accessories', 'base_price': 34.99},
    {'sku': 'SPORT-009', 'name': 'Hiking Backpack 40L', 'brand': 'OutdoorPro', 'category': 'Sports & Outdoors', 'subcategory': 'Camping', 'base_price': 89.99},
    {'sku': 'SPORT-010', 'name': 'Folding Exercise Bike', 'brand': 'FitLife', 'category': 'Sports & Outdoors', 'subcategory': 'Fitness', 'base_price': 249.99},
]


def create_competitors(session):
    """Create competitor records"""
    print("Creating competitors...")
    competitors = []

    for comp_data in COMPETITORS:
        competitor = DimCompetitor(**comp_data)
        session.add(competitor)
        competitors.append(competitor)

    session.commit()
    print(f"  ✓ Created {len(competitors)} competitors")
    return competitors


def create_products(session):
    """Create product records"""
    print("Creating products...")
    products = []

    for prod_data in PRODUCTS:
        product = DimProduct(
            sku=prod_data['sku'],
            product_name=prod_data['name'],
            brand=prod_data['brand'],
            category=prod_data['category'],
            subcategory=prod_data['subcategory'],
            description=f"High-quality {prod_data['name'].lower()} from {prod_data['brand']}",
            is_active=True
        )
        session.add(product)
        products.append((product, prod_data['base_price']))

    session.commit()
    print(f"  ✓ Created {len(products)} products")
    return products


def get_date_id(session, date):
    """Get date_id for a given date"""
    dim_date = session.query(DimDate).filter(DimDate.date == date.date()).first()
    if dim_date:
        return dim_date.date_id
    return None


def generate_price_variation(base_price, competitor_segment, days_ago):
    """
    Generate realistic price variations based on:
    - Competitor market segment
    - Time (seasonal variations)
    - Random promotions
    """
    # Base multiplier by market segment
    segment_multipliers = {
        'discount': random.uniform(0.85, 0.95),
        'mid-tier': random.uniform(0.95, 1.05),
        'premium': random.uniform(1.05, 1.15)
    }

    price = base_price * segment_multipliers.get(competitor_segment, 1.0)

    # Add some time-based variation (simulate seasonal changes)
    seasonal_factor = 1 + (0.1 * random.random() * (days_ago / 90))
    price *= seasonal_factor

    # Random promotions (20% chance)
    has_promotion = random.random() < 0.20
    discount_pct = 0
    original_price = None

    if has_promotion:
        discount_pct = random.choice([5, 10, 15, 20, 25])
        original_price = price
        price *= (1 - discount_pct / 100)

    # Stock availability (95% in stock)
    in_stock = random.random() < 0.95

    # Shipping
    free_shipping = random.random() < 0.60
    shipping_cost = 0 if free_shipping else random.uniform(4.99, 12.99)

    return {
        'price': round(price, 2),
        'original_price': round(original_price, 2) if original_price else None,
        'in_stock': in_stock,
        'has_promotion': has_promotion,
        'discount_pct': discount_pct if has_promotion else None,
        'free_shipping': free_shipping,
        'shipping_cost': round(shipping_cost, 2) if not free_shipping else None
    }


def create_price_history(session, products, competitors, days=90):
    """Create historical pricing data"""
    print(f"Generating {days} days of price history...")

    total_records = 0
    batch_size = 1000
    batch = []

    # Generate prices for each day
    for days_ago in range(days, -1, -1):
        scrape_date = datetime.now() - timedelta(days=days_ago)
        date_id = get_date_id(session, scrape_date)

        if not date_id:
            continue

        # Create scrape run for this day
        for competitor in competitors:
            scrape_run = DimScrapeRun(
                competitor_id=competitor.competitor_id,
                run_started_at=scrape_date,
                run_completed_at=scrape_date + timedelta(minutes=random.randint(10, 30)),
                status='completed',
                products_scraped=len(products),
                products_failed=0,
                scraper_version='1.0.0'
            )
            session.add(scrape_run)
            session.flush()  # Get run_id

            # Each competitor doesn't always have all products (90% availability)
            for product, base_price in products:
                if random.random() > 0.90:  # Skip 10% of product-competitor combinations
                    continue

                pricing = generate_price_variation(
                    base_price,
                    competitor.market_segment,
                    days_ago
                )

                fact_price = FactPrice(
                    product_id=product.product_id,
                    competitor_id=competitor.competitor_id,
                    date_id=date_id,
                    run_id=scrape_run.run_id,
                    price_amount=pricing['price'],
                    original_price=pricing['original_price'],
                    in_stock=pricing['in_stock'],
                    promotion_applied=pricing['has_promotion'],
                    discount_percentage=pricing['discount_pct'],
                    free_shipping=pricing['free_shipping'],
                    shipping_cost=pricing['shipping_cost'],
                    scraped_at=scrape_date,
                    product_url=f"https://{competitor.domain}/p/{product.sku}",
                    seller_name=competitor.competitor_name
                )

                batch.append(fact_price)
                total_records += 1

                # Commit in batches for performance
                if len(batch) >= batch_size:
                    session.bulk_save_objects(batch)
                    session.commit()
                    batch = []
                    print(f"  Progress: {total_records} price records created...", end='\r')

    # Commit remaining records
    if batch:
        session.bulk_save_objects(batch)
        session.commit()

    print(f"\n  ✓ Created {total_records} price records")


def main():
    print("=" * 60)
    print("Loading Sample Data for Price Intelligence System")
    print("=" * 60)

    # Create engine and session
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Check if data already exists
        existing_products = session.query(DimProduct).count()
        if existing_products > 0:
            print(f"\n⚠ Warning: Database already contains {existing_products} products")
            response = input("Do you want to clear existing data and reload? (yes/no): ")
            if response.lower() != 'yes':
                print("Aborted.")
                return

            # Clear existing data (in correct order due to foreign keys)
            print("\nClearing existing data...")
            session.query(FactPrice).delete()
            session.query(DimScrapeRun).delete()
            session.query(DimProduct).delete()
            session.query(DimCompetitor).delete()
            session.commit()
            print("  ✓ Existing data cleared")

        # Create sample data
        competitors = create_competitors(session)
        products = create_products(session)
        create_price_history(session, products, competitors, days=90)

        print("\n" + "=" * 60)
        print("✓ Sample data loaded successfully!")
        print("=" * 60)
        print("\nDatabase summary:")
        print(f"  Products: {session.query(DimProduct).count()}")
        print(f"  Competitors: {session.query(DimCompetitor).count()}")
        print(f"  Price records: {session.query(FactPrice).count()}")
        print(f"  Scrape runs: {session.query(DimScrapeRun).count()}")

        print("\nNext step:")
        print("  Run: python dashboard/app.py")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    main()
