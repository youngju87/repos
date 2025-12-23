-- Price Intelligence Data Warehouse Schema
-- Star Schema Design for Time-Series Price Analytics

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DIMENSION TABLES
-- ============================================

-- Dimension: Date
CREATE TABLE dim_dates (
    date_id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    day_of_week VARCHAR(10) NOT NULL,
    day_of_month INT NOT NULL,
    day_of_year INT NOT NULL,
    week_of_year INT NOT NULL,
    month INT NOT NULL,
    month_name VARCHAR(10) NOT NULL,
    quarter INT NOT NULL,
    year INT NOT NULL,
    is_weekend BOOLEAN NOT NULL,
    is_holiday BOOLEAN DEFAULT FALSE,
    holiday_name VARCHAR(100)
);

CREATE INDEX idx_dim_dates_date ON dim_dates(date);
CREATE INDEX idx_dim_dates_year_month ON dim_dates(year, month);

-- Dimension: Products
CREATE TABLE dim_products (
    product_id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    product_name VARCHAR(500) NOT NULL,
    brand VARCHAR(200),
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    upc VARCHAR(50),
    manufacturer_id VARCHAR(100),
    description TEXT,
    image_url VARCHAR(1000),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dim_products_sku ON dim_products(sku);
CREATE INDEX idx_dim_products_category ON dim_products(category);
CREATE INDEX idx_dim_products_brand ON dim_products(brand);

-- Dimension: Competitors
CREATE TABLE dim_competitors (
    competitor_id SERIAL PRIMARY KEY,
    competitor_name VARCHAR(200) NOT NULL UNIQUE,
    domain VARCHAR(500) NOT NULL,
    country_code VARCHAR(2) DEFAULT 'US',
    market_segment VARCHAR(50), -- e.g., 'discount', 'premium', 'mid-tier'
    is_authorized_reseller BOOLEAN DEFAULT TRUE,
    scraper_enabled BOOLEAN DEFAULT TRUE,
    scraper_config JSONB, -- Store scraper-specific settings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dim_competitors_domain ON dim_competitors(domain);

-- Dimension: Scrape Runs (for monitoring data quality)
CREATE TABLE dim_scrape_runs (
    run_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_id INT REFERENCES dim_competitors(competitor_id),
    run_started_at TIMESTAMP NOT NULL,
    run_completed_at TIMESTAMP,
    status VARCHAR(20) NOT NULL, -- 'running', 'completed', 'failed'
    products_scraped INT DEFAULT 0,
    products_failed INT DEFAULT 0,
    error_message TEXT,
    scraper_version VARCHAR(20)
);

CREATE INDEX idx_dim_scrape_runs_competitor ON dim_scrape_runs(competitor_id);
CREATE INDEX idx_dim_scrape_runs_status ON dim_scrape_runs(status);
CREATE INDEX idx_dim_scrape_runs_started ON dim_scrape_runs(run_started_at);

-- ============================================
-- FACT TABLES
-- ============================================

-- Fact: Prices (grain: one price observation)
CREATE TABLE fact_prices (
    price_id BIGSERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES dim_products(product_id),
    competitor_id INT NOT NULL REFERENCES dim_competitors(competitor_id),
    date_id INT NOT NULL REFERENCES dim_dates(date_id),
    run_id UUID REFERENCES dim_scrape_runs(run_id),

    -- Price metrics
    price_amount DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2), -- Before discount
    currency_code VARCHAR(3) DEFAULT 'USD',

    -- Availability
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    stock_quantity INT,

    -- Shipping
    shipping_cost DECIMAL(10, 2),
    shipping_days INT,
    free_shipping BOOLEAN DEFAULT FALSE,

    -- Promotions
    promotion_applied BOOLEAN DEFAULT FALSE,
    promotion_text TEXT,
    discount_percentage DECIMAL(5, 2),

    -- Product details at time of scrape
    product_url VARCHAR(1000),
    seller_name VARCHAR(200), -- For marketplace listings
    seller_rating DECIMAL(3, 2),
    product_condition VARCHAR(20) DEFAULT 'new', -- 'new', 'used', 'refurbished'

    -- Metadata
    scraped_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    scrape_method VARCHAR(50) DEFAULT 'web', -- 'web', 'api', 'manual'

    -- For deduplication
    UNIQUE(product_id, competitor_id, scraped_at)
);

-- Indexes for common queries
CREATE INDEX idx_fact_prices_product ON fact_prices(product_id);
CREATE INDEX idx_fact_prices_competitor ON fact_prices(competitor_id);
CREATE INDEX idx_fact_prices_date ON fact_prices(date_id);
CREATE INDEX idx_fact_prices_scraped_at ON fact_prices(scraped_at);
CREATE INDEX idx_fact_prices_in_stock ON fact_prices(in_stock);
CREATE INDEX idx_fact_prices_product_competitor ON fact_prices(product_id, competitor_id);

-- Composite index for time-series queries
CREATE INDEX idx_fact_prices_product_date ON fact_prices(product_id, date_id, competitor_id);

-- ============================================
-- ANALYTICS VIEWS
-- ============================================

-- View: Latest Prices per Product per Competitor
CREATE OR REPLACE VIEW vw_latest_prices AS
SELECT DISTINCT ON (fp.product_id, fp.competitor_id)
    fp.price_id,
    p.sku,
    p.product_name,
    p.category,
    c.competitor_name,
    fp.price_amount,
    fp.original_price,
    fp.in_stock,
    fp.promotion_applied,
    fp.discount_percentage,
    fp.scraped_at
FROM fact_prices fp
JOIN dim_products p ON fp.product_id = p.product_id
JOIN dim_competitors c ON fp.competitor_id = c.competitor_id
WHERE p.is_active = TRUE
  AND c.scraper_enabled = TRUE
ORDER BY fp.product_id, fp.competitor_id, fp.scraped_at DESC;

-- View: Price Changes (day-over-day)
CREATE OR REPLACE VIEW vw_price_changes AS
SELECT
    curr.product_id,
    curr.competitor_id,
    curr.price_amount AS current_price,
    prev.price_amount AS previous_price,
    curr.price_amount - prev.price_amount AS price_change,
    ROUND(((curr.price_amount - prev.price_amount) / prev.price_amount) * 100, 2) AS price_change_pct,
    curr.scraped_at AS current_date,
    prev.scraped_at AS previous_date
FROM fact_prices curr
JOIN fact_prices prev ON
    curr.product_id = prev.product_id
    AND curr.competitor_id = prev.competitor_id
    AND prev.scraped_at = (
        SELECT MAX(scraped_at)
        FROM fact_prices
        WHERE product_id = curr.product_id
          AND competitor_id = curr.competitor_id
          AND scraped_at < curr.scraped_at
    )
WHERE curr.price_amount != prev.price_amount;

-- View: MAP Violations (products priced below minimum advertised price)
CREATE OR REPLACE VIEW vw_map_violations AS
SELECT
    p.sku,
    p.product_name,
    c.competitor_name,
    fp.price_amount AS current_price,
    100.00 AS map_price, -- This should come from a MAP policy table
    fp.price_amount - 100.00 AS violation_amount,
    fp.scraped_at
FROM fact_prices fp
JOIN dim_products p ON fp.product_id = p.product_id
JOIN dim_competitors c ON fp.competitor_id = c.competitor_id
WHERE fp.price_amount < 100.00 -- Placeholder for actual MAP logic
  AND c.is_authorized_reseller = TRUE
  AND fp.scraped_at >= CURRENT_DATE - INTERVAL '7 days';

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to populate date dimension for a year
CREATE OR REPLACE FUNCTION populate_date_dimension(start_year INT, end_year INT)
RETURNS VOID AS $$
DECLARE
    current_date DATE;
BEGIN
    current_date := (start_year || '-01-01')::DATE;

    WHILE current_date <= (end_year || '-12-31')::DATE LOOP
        INSERT INTO dim_dates (
            date,
            day_of_week,
            day_of_month,
            day_of_year,
            week_of_year,
            month,
            month_name,
            quarter,
            year,
            is_weekend
        ) VALUES (
            current_date,
            TO_CHAR(current_date, 'Day'),
            EXTRACT(DAY FROM current_date),
            EXTRACT(DOY FROM current_date),
            EXTRACT(WEEK FROM current_date),
            EXTRACT(MONTH FROM current_date),
            TO_CHAR(current_date, 'Month'),
            EXTRACT(QUARTER FROM current_date),
            EXTRACT(YEAR FROM current_date),
            EXTRACT(DOW FROM current_date) IN (0, 6)
        )
        ON CONFLICT (date) DO NOTHING;

        current_date := current_date + INTERVAL '1 day';
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Populate date dimension for 2024-2027
SELECT populate_date_dimension(2024, 2027);

-- ============================================
-- INITIAL DATA QUALITY CHECKS
-- ============================================

-- Add comments for documentation
COMMENT ON TABLE fact_prices IS 'Core fact table storing all price observations';
COMMENT ON TABLE dim_products IS 'Product catalog dimension';
COMMENT ON TABLE dim_competitors IS 'Competitor/retailer dimension';
COMMENT ON TABLE dim_dates IS 'Date dimension for time-series analysis';
COMMENT ON COLUMN fact_prices.price_amount IS 'Actual selling price at time of scrape';
COMMENT ON COLUMN fact_prices.original_price IS 'MSRP or pre-discount price';

-- Grant permissions (adjust for production)
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
