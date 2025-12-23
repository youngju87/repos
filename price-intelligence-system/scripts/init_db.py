"""
Initialize the Price Intelligence database
Run this after starting Docker containers
"""

import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection string
DB_USER = os.getenv('DB_USER', 'priceuser')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'pricepass123')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'price_intelligence')

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"


def test_connection():
    """Test database connectivity"""
    print(f"Testing connection to {DB_HOST}:{DB_PORT}/{DB_NAME}...")
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            print(f"✓ Connected successfully!")
            print(f"  PostgreSQL version: {version.split(',')[0]}")
        return engine
    except Exception as e:
        print(f"✗ Connection failed: {e}")
        sys.exit(1)


def verify_schema(engine):
    """Verify that all expected tables exist"""
    print("\nVerifying schema...")

    expected_tables = [
        'dim_dates',
        'dim_products',
        'dim_competitors',
        'dim_scrape_runs',
        'fact_prices'
    ]

    with engine.connect() as conn:
        for table in expected_tables:
            result = conn.execute(text(f"""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables
                    WHERE table_schema = 'public'
                    AND table_name = '{table}'
                );
            """))
            exists = result.fetchone()[0]
            status = "✓" if exists else "✗"
            print(f"  {status} {table}")

            if not exists:
                print(f"\n✗ Table {table} does not exist!")
                print("  Run Docker Compose to initialize schema from schema.sql")
                return False

    print("\n✓ All tables verified!")
    return True


def check_date_dimension(engine):
    """Check if date dimension is populated"""
    print("\nChecking date dimension...")

    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM dim_dates;"))
        count = result.fetchone()[0]
        print(f"  Date dimension has {count} rows")

        if count > 0:
            result = conn.execute(text("""
                SELECT MIN(date), MAX(date) FROM dim_dates;
            """))
            min_date, max_date = result.fetchone()
            print(f"  Date range: {min_date} to {max_date}")
        else:
            print("  ⚠ Date dimension is empty - this is normal on first run")


def main():
    print("=" * 60)
    print("Price Intelligence System - Database Initialization")
    print("=" * 60)

    # Test connection
    engine = test_connection()

    # Verify schema
    if not verify_schema(engine):
        sys.exit(1)

    # Check date dimension
    check_date_dimension(engine)

    print("\n" + "=" * 60)
    print("✓ Database initialization complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("  1. Run: python scripts/load_sample_data.py")
    print("  2. Run: python dashboard/app.py")
    print("  3. Visit: http://localhost:8050")


if __name__ == "__main__":
    main()
