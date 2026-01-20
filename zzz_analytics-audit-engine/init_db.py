#!/usr/bin/env python3
"""
Initialize SQLite database for Analytics Audit Engine
Creates all required tables from SQLAlchemy models
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine

# Load environment variables
load_dotenv()

def init_database():
    """Create all database tables"""

    # Get database URL from environment
    db_url = os.getenv('DATABASE_URL', 'sqlite:///./analytics_audit.db')

    print("=" * 60)
    print("Analytics Audit Engine - Database Initialization")
    print("=" * 60)
    print(f"\nDatabase URL: {db_url}")

    # Detect database type and import appropriate models
    if db_url.startswith('sqlite'):
        print("Database type: SQLite")
        from database.models_sqlite import Base
    else:
        print("Database type: PostgreSQL")
        from database.models import Base

    # Create engine
    engine = create_engine(db_url)

    # Create all tables
    print("\nCreating database tables...")
    Base.metadata.create_all(engine)

    # List created tables
    print("\n[OK] Database initialized successfully!\n")
    print("Tables created:")
    for table in Base.metadata.sorted_tables:
        print(f"  - {table.name}")

    print("\n" + "=" * 60)
    print("Ready to run audits!")
    print("=" * 60)
    print("\nTry running:")
    print("  python audit_cli.py scan --url https://yoursite.com --max-pages 5\n")

if __name__ == "__main__":
    init_database()
