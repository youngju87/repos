# Quick Start - Price Intelligence System

Get up and running in 5 minutes.

## Prerequisites

- Docker Desktop installed and running
- Python 3.11+ installed

## Step-by-Step

### 1. Start Docker (1 minute)

```bash
cd price-intelligence-system
docker-compose up -d
```

Wait for containers to start. You should see:
```
✔ Container price-intel-db     Started
✔ Container price-intel-redis  Started
```

### 2. Set Up Python Environment (2 minutes)

```bash
# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Initialize Database (1 minute)

```bash
# Check database is ready
python scripts/init_db.py

# Load sample data
python scripts/load_sample_data.py
```

This creates 50 products, 5 competitors, and 90 days of pricing history (~22,500 records).

### 4. Launch Dashboard (1 minute)

```bash
python dashboard/app.py
```

Open browser to **http://localhost:8050**

## What You'll See

### Overview Tab
- Total products: 50
- Competitors: 5 (Amazon, Walmart, Target, Best Buy, Unauthorized Seller)
- Price changes: Historical trends
- Category breakdown: Electronics, Home & Garden, Sports

### Price Trends Tab
- Select any product
- See price history across all competitors
- Compare pricing strategies
- View stock availability

### Competitors Tab
- Competitive positioning matrix
- Average prices by category
- Price volatility analysis

### MAP Violations Tab
- Unauthorized sellers pricing below MAP
- Violation tracking

## Common Commands

```bash
# Stop everything
docker-compose down

# Reset database (start fresh)
docker-compose down -v
docker-compose up -d
python scripts/init_db.py
python scripts/load_sample_data.py

# View database logs
docker-compose logs postgres

# Access database directly
docker exec -it price-intel-db psql -U priceuser -d price_intelligence
```

## Troubleshooting

**Port 5432 already in use:**
```bash
# Stop other PostgreSQL services
# Or change port in docker-compose.yml
```

**Dashboard won't start:**
```bash
# Check if port 8050 is available
# Check that database is running: docker-compose ps
```

**Sample data load fails:**
```bash
# Ensure database initialized first
python scripts/init_db.py
```

## Next Steps

1. Explore the dashboard - click through all tabs
2. Read [SETUP.md](SETUP.md) for detailed documentation
3. Check [ROADMAP.md](ROADMAP.md) for extension ideas
4. Review [PORTFOLIO.md](PORTFOLIO.md) for showcasing tips

## File Structure Quick Reference

```
price-intelligence-system/
├── dashboard/              # Plotly Dash web application
│   ├── app.py             # Main entry point
│   ├── layouts/           # UI components
│   └── callbacks/         # Interactive logic
├── scrapers/              # Web scraping framework
│   ├── spiders/           # Scraper implementations
│   ├── pipelines.py       # Data processing
│   └── settings.py        # Scrapy configuration
├── warehouse/             # Database models
│   ├── schema.sql         # Database schema
│   └── models.py          # SQLAlchemy ORM
├── scripts/               # Utility scripts
│   ├── init_db.py         # Database setup
│   └── load_sample_data.py # Sample data generator
└── docker-compose.yml     # Infrastructure definition
```

## Key Technologies

- **Database:** PostgreSQL 15 (time-series optimized star schema)
- **Caching:** Redis (for future use)
- **Scraping:** Scrapy + Playwright
- **Dashboard:** Plotly Dash + Bootstrap
- **Orchestration:** Docker Compose

## Sample SQL Queries

```sql
-- Latest prices for all products
SELECT * FROM vw_latest_prices;

-- Price changes in last 7 days
SELECT * FROM vw_price_changes
WHERE current_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY ABS(price_change_pct) DESC;

-- Average price by competitor
SELECT
    c.competitor_name,
    AVG(fp.price_amount) as avg_price
FROM fact_prices fp
JOIN dim_competitors c ON fp.competitor_id = c.competitor_id
WHERE fp.scraped_at >= NOW() - INTERVAL '30 days'
GROUP BY c.competitor_name;
```

---

That's it! You now have a fully functional price intelligence system running locally.

**Time to completion:** ~5 minutes
**Next:** Explore the dashboard and customize for your use case!
