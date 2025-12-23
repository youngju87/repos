# Setup Guide - Price Intelligence System

Complete setup instructions to get the system running on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker Desktop** (for Windows/Mac) or **Docker Engine** (for Linux)
  - Download: https://www.docker.com/products/docker-desktop
  - Verify: `docker --version` and `docker-compose --version`

- **Python 3.11+**
  - Download: https://www.python.org/downloads/
  - Verify: `python --version`

- **Git** (optional, for version control)
  - Download: https://git-scm.com/downloads

## Step 1: Clone or Download the Project

```bash
# If using Git
git clone <your-repo-url>
cd price-intelligence-system

# Or download and extract ZIP
```

## Step 2: Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file with your settings (optional - defaults work fine)
# On Windows: notepad .env
# On Mac/Linux: nano .env
```

The default values in `.env.example` work out of the box for local development.

## Step 3: Start Docker Infrastructure

This will start PostgreSQL and Redis containers:

```bash
# Start containers in background
docker-compose up -d

# Verify containers are running
docker-compose ps

# Check logs if needed
docker-compose logs postgres
```

**Expected output:**
- `price-intel-db` container running on port 5432
- `price-intel-redis` container running on port 6379

**Troubleshooting:**
- If port 5432 is already in use, stop other PostgreSQL instances or change the port in `docker-compose.yml`
- On Windows, ensure Docker Desktop is running

## Step 4: Create Python Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate

# On Mac/Linux:
source venv/bin/activate

# You should see (venv) in your terminal prompt
```

## Step 5: Install Python Dependencies

```bash
# Upgrade pip first
pip install --upgrade pip

# Install all requirements
pip install -r requirements.txt

# This will take a few minutes - installs ~50 packages
```

**Note:** If you get errors installing `psycopg2-binary` on Mac, you may need:
```bash
brew install postgresql
```

## Step 6: Initialize Database

The database schema is automatically created when Docker starts (via `schema.sql`), but let's verify:

```bash
# Run the initialization script
python scripts/init_db.py
```

**Expected output:**
```
============================================================
Price Intelligence System - Database Initialization
============================================================
Testing connection to localhost:5432/price_intelligence...
✓ Connected successfully!
  PostgreSQL version: PostgreSQL 15.x

Verifying schema...
  ✓ dim_dates
  ✓ dim_products
  ✓ dim_competitors
  ✓ dim_scrape_runs
  ✓ fact_prices

✓ All tables verified!

Checking date dimension...
  Date dimension has 1461 rows
  Date range: 2024-01-01 to 2027-12-31

✓ Database initialization complete!
```

**Troubleshooting:**
- If connection fails, ensure Docker containers are running: `docker-compose ps`
- Check database logs: `docker-compose logs postgres`

## Step 7: Load Sample Data

```bash
# Load realistic sample data (50 products, 5 competitors, 90 days history)
python scripts/load_sample_data.py
```

**Expected output:**
```
============================================================
Loading Sample Data for Price Intelligence System
============================================================
Creating competitors...
  ✓ Created 5 competitors
Creating products...
  ✓ Created 50 products
Generating 90 days of price history...
  Progress: 22500 price records created...

✓ Sample data loaded successfully!
============================================================

Database summary:
  Products: 50
  Competitors: 5
  Price records: 22500
  Scrape runs: 450
```

This will take 1-2 minutes depending on your system.

## Step 8: Start the Dashboard

```bash
# Run the dashboard application
python dashboard/app.py
```

**Expected output:**
```
============================================================
Price Intelligence Dashboard Starting...
============================================================
  URL: http://localhost:8050
  Debug mode: True
============================================================
Dash is running on http://0.0.0.0:8050/

 * Serving Flask app 'app'
 * Debug mode: on
```

## Step 9: Access the Dashboard

Open your web browser and navigate to:

**http://localhost:8050**

You should see the Price Intelligence Dashboard with:
- Overview tab with statistics and charts
- Price Trends tab with time-series analysis
- Competitor Analysis tab with positioning matrix
- MAP Violations tab

## Optional: Database Management with pgAdmin

To visually explore the database:

```bash
# Start pgAdmin
docker-compose --profile tools up -d pgadmin

# Access pgAdmin at http://localhost:5050
# Login: admin@priceintel.local / admin
```

Add server in pgAdmin:
- Host: `price-intel-db` (container name)
- Port: `5432`
- Database: `price_intelligence`
- Username: `priceuser`
- Password: `pricepass123`

## Verify Everything Works

1. **Dashboard loads** at http://localhost:8050
2. **Statistics show data**:
   - Total Products: 50
   - Active Competitors: 5
   - Price records: ~22,500
3. **Charts render** with sample data
4. **Price Trends tab** allows product selection and date filtering

## Next Steps

### Run a Test Scrape (Coming Soon)

```bash
# This feature is in development
# scrapy crawl example -a category=electronics
```

### Customize for Your Use Case

1. **Add Your Products**: Edit `scripts/load_sample_data.py` or insert via SQL
2. **Build Custom Scrapers**: Create spiders in `scrapers/spiders/`
3. **Adjust Dashboard**: Modify `dashboard/layouts/` and `dashboard/callbacks/`

## Common Issues

### Port Already in Use

If port 5432 or 8050 is in use:

```bash
# Find what's using the port (Windows)
netstat -ano | findstr :5432

# Change ports in docker-compose.yml or .env
```

### Docker Container Won't Start

```bash
# Stop all containers
docker-compose down

# Remove volumes and restart fresh
docker-compose down -v
docker-compose up -d
```

### Python Package Installation Fails

```bash
# Try installing problematic packages individually
pip install psycopg2-binary
pip install scrapy

# Or use conda instead of pip (if you have Anaconda)
conda create -n price-intel python=3.11
conda activate price-intel
pip install -r requirements.txt
```

### Database Connection Errors

Check that:
1. Docker containers are running: `docker-compose ps`
2. PostgreSQL is healthy: `docker-compose logs postgres`
3. Environment variables are correct in `.env`

## Stopping the System

```bash
# Stop the dashboard (Ctrl+C in the terminal where it's running)

# Stop Docker containers
docker-compose down

# Stop and remove all data (reset)
docker-compose down -v
```

## Development Workflow

Typical workflow when working on the project:

```bash
# 1. Start infrastructure
docker-compose up -d

# 2. Activate Python environment
source venv/bin/activate  # or venv\Scripts\activate on Windows

# 3. Start dashboard
python dashboard/app.py

# 4. Work on code, refresh browser to see changes

# 5. When done
docker-compose down
```

## System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 2GB for Docker images and data
- **CPU**: Any modern processor (2+ cores recommended)
- **OS**: Windows 10+, macOS 10.14+, or Linux

## Need Help?

- Check the main [README.md](README.md) for project overview
- Review code comments in `warehouse/schema.sql` for data model
- Look at `dashboard/callbacks/` for examples of SQL queries
- See `scrapers/spiders/example_spider.py` for scraping templates

---

## Success Checklist

- [ ] Docker containers running
- [ ] Python virtual environment activated
- [ ] Dependencies installed
- [ ] Database initialized
- [ ] Sample data loaded
- [ ] Dashboard accessible at http://localhost:8050
- [ ] All tabs in dashboard show data

If all boxes are checked, you're ready to start customizing the system!
