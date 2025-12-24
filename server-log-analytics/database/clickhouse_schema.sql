-- ClickHouse Schema for Server Log Analytics
-- Optimized for high-volume log ingestion and fast analytical queries

-- ============================================
-- FACT TABLE: Requests (grain: one HTTP request)
-- ============================================

CREATE TABLE IF NOT EXISTS fact_requests (
    -- Primary identifiers
    request_id UUID DEFAULT generateUUIDv4(),
    timestamp DateTime,
    date Date DEFAULT toDate(timestamp),

    -- Request details
    method LowCardinality(String),
    path String,
    query_string String,
    http_version LowCardinality(String),

    -- Response
    status_code UInt16,
    response_bytes UInt64,
    response_time_ms UInt32,

    -- Client information
    ip_address IPv4,
    user_agent String,
    referer String,

    -- Session
    session_id FixedString(16),

    -- Parsed details (for analytics)
    is_bot UInt8,
    bot_type LowCardinality(String),
    device_type LowCardinality(String),
    browser LowCardinality(String),
    os LowCardinality(String),

    -- Geographic (if using GeoIP)
    country_code FixedString(2),
    city String,

    -- Security flags
    is_suspicious UInt8,
    attack_type LowCardinality(String),

    -- Metadata
    log_format LowCardinality(String),
    ingested_at DateTime DEFAULT now()

) ENGINE = MergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, timestamp)
SETTINGS index_granularity = 8192;

-- Indexes for common queries
CREATE INDEX idx_path ON fact_requests (path) TYPE bloom_filter GRANULARITY 1;
CREATE INDEX idx_status ON fact_requests (status_code) TYPE set(0) GRANULARITY 1;
CREATE INDEX idx_session ON fact_requests (session_id) TYPE bloom_filter GRANULARITY 1;


-- ============================================
-- FACT TABLE: Sessions (grain: one user session)
-- ============================================

CREATE TABLE IF NOT EXISTS fact_sessions (
    session_id FixedString(16),

    -- Timing
    start_time DateTime,
    end_time DateTime,
    duration_seconds UInt32,

    -- Activity
    page_views UInt16,
    unique_pages UInt16,

    -- Data transfer
    total_bytes UInt64,
    avg_response_time_ms UInt32,

    -- Pages
    entry_page String,
    exit_page String,
    pages_visited Array(String),

    -- Behavior
    is_bounce UInt8,
    has_conversion UInt8,

    -- Client
    ip_address IPv4,
    user_agent String,

    -- Metadata
    created_at DateTime DEFAULT now()

) ENGINE = MergeTree()
ORDER BY start_time
SETTINGS index_granularity = 8192;


-- ============================================
-- DIMENSION TABLE: User Agents
-- ============================================

CREATE TABLE IF NOT EXISTS dim_user_agents (
    user_agent_hash UInt64,
    user_agent String,

    -- Parsed details
    is_bot UInt8,
    bot_name String,
    browser String,
    browser_version String,
    os String,
    os_version String,
    device_type String,

    first_seen DateTime,
    last_seen DateTime,
    request_count UInt64

) ENGINE = MergeTree()
ORDER BY user_agent_hash
SETTINGS index_granularity = 8192;


-- ============================================
-- ANOMALIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS anomalies (
    anomaly_id UUID DEFAULT generateUUIDv4(),
    detected_at DateTime,

    -- Anomaly details
    anomaly_type LowCardinality(String), -- traffic_spike, error_rate, latency, security
    severity LowCardinality(String), -- low, medium, high, critical

    -- Context
    metric_name String,
    expected_value Float64,
    actual_value Float64,
    deviation_score Float64,

    -- Time range
    time_window_start DateTime,
    time_window_end DateTime,

    -- Additional data
    affected_paths Array(String),
    affected_ips Array(IPv4),

    description String,

    -- Status
    status LowCardinality(String) DEFAULT 'new', -- new, investigating, resolved, false_positive
    resolved_at Nullable(DateTime)

) ENGINE = MergeTree()
ORDER BY detected_at
SETTINGS index_granularity = 8192;


-- ============================================
-- SECURITY EVENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS security_events (
    event_id UUID DEFAULT generateUUIDv4(),
    timestamp DateTime,

    -- Event type
    threat_type LowCardinality(String), -- sql_injection, xss, path_traversal, rate_limit, brute_force
    severity LowCardinality(String),

    -- Source
    ip_address IPv4,
    user_agent String,

    -- Request details
    method String,
    path String,
    query_string String,

    -- Detection
    pattern_matched String,
    confidence_score Float32,

    -- Action taken
    action LowCardinality(String), -- logged, blocked, rate_limited

    -- Metadata
    details String

) ENGINE = MergeTree()
ORDER BY timestamp
SETTINGS index_granularity = 8192;


-- ============================================
-- MATERIALIZED VIEWS (for common aggregations)
-- ============================================

-- Hourly traffic statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_hourly_traffic
ENGINE = SumMingMergeTree()
PARTITION BY toYYYYMM(hour)
ORDER BY hour
AS SELECT
    toStartOfHour(timestamp) AS hour,
    count() AS requests,
    uniq(ip_address) AS unique_ips,
    sum(response_bytes) AS total_bytes,
    avg(response_time_ms) AS avg_response_time,
    quantile(0.95)(response_time_ms) AS p95_response_time,
    sum(status_code >= 500) AS server_errors,
    sum(status_code >= 400 AND status_code < 500) AS client_errors
FROM fact_requests
GROUP BY hour;


-- Top pages by traffic (daily)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_top_pages_daily
ENGINE = SumMingMergeTree()
PARTITION BY date
ORDER BY (date, requests DESC)
AS SELECT
    date,
    path,
    count() AS requests,
    avg(response_time_ms) AS avg_latency,
    sum(response_bytes) AS total_bytes
FROM fact_requests
GROUP BY date, path;


-- Bot traffic statistics (daily)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_bot_stats_daily
ENGINE = SumMingMergeTree()
PARTITION BY date
ORDER BY date
AS SELECT
    date,
    is_bot,
    bot_type,
    count() AS requests,
    sum(response_bytes) AS bytes_transferred
FROM fact_requests
GROUP BY date, is_bot, bot_type;


-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to classify status codes
CREATE FUNCTION IF NOT EXISTS classifyStatus AS (status_code) ->
    multiIf(
        status_code < 200, 'informational',
        status_code < 300, 'success',
        status_code < 400, 'redirect',
        status_code < 500, 'client_error',
        'server_error'
    );


-- Function to extract domain from path
CREATE FUNCTION IF NOT EXISTS extractDomain AS (url) ->
    domain(url);


-- ============================================
-- SAMPLE QUERIES (as comments for reference)
-- ============================================

/*
-- Top 10 slowest endpoints (P95 latency)
SELECT
    path,
    count() AS requests,
    quantile(0.50)(response_time_ms) AS p50,
    quantile(0.95)(response_time_ms) AS p95,
    quantile(0.99)(response_time_ms) AS p99
FROM fact_requests
WHERE date >= today() - 7
GROUP BY path
HAVING requests > 100
ORDER BY p95 DESC
LIMIT 10;


-- Traffic over time (requests per hour)
SELECT
    toStartOfHour(timestamp) AS hour,
    count() AS requests,
    avg(response_time_ms) AS avg_latency
FROM fact_requests
WHERE date >= today() - 1
GROUP BY hour
ORDER BY hour;


-- Bot vs Human traffic
SELECT
    date,
    countIf(is_bot = 0) AS human_requests,
    countIf(is_bot = 1) AS bot_requests,
    round(countIf(is_bot = 1) / count() * 100, 2) AS bot_percentage
FROM fact_requests
WHERE date >= today() - 30
GROUP BY date
ORDER BY date;


-- Top pages by unique visitors
SELECT
    path,
    uniq(ip_address) AS unique_visitors,
    count() AS page_views
FROM fact_requests
WHERE date >= today() - 7
GROUP BY path
ORDER BY unique_visitors DESC
LIMIT 20;


-- Status code distribution
SELECT
    status_code,
    count() AS count,
    round(count() / (SELECT count() FROM fact_requests WHERE date = today()) * 100, 2) AS percentage
FROM fact_requests
WHERE date = today()
GROUP BY status_code
ORDER BY count DESC;


-- Geographic traffic (if using GeoIP)
SELECT
    country_code,
    count() AS requests,
    uniq(ip_address) AS unique_ips,
    avg(response_time_ms) AS avg_latency
FROM fact_requests
WHERE date >= today() - 7
  AND country_code != ''
GROUP BY country_code
ORDER BY requests DESC
LIMIT 20;


-- User sessions with high page views
SELECT
    session_id,
    page_views,
    duration_seconds,
    entry_page,
    exit_page,
    has_conversion
FROM fact_sessions
WHERE start_time >= now() - INTERVAL 24 HOUR
  AND page_views > 10
ORDER BY page_views DESC
LIMIT 50;


-- Detect SQL injection attempts
SELECT
    ip_address,
    count() AS attempts,
    groupArray(path) AS suspicious_paths
FROM fact_requests
WHERE (
    path LIKE '%UNION%SELECT%'
    OR path LIKE '%DROP%TABLE%'
    OR query_string LIKE '%'' OR ''1''=''1%'
)
AND date >= today() - 1
GROUP BY ip_address
HAVING attempts > 3
ORDER BY attempts DESC;


-- Response time percentiles by endpoint
SELECT
    path,
    quantile(0.50)(response_time_ms) AS p50,
    quantile(0.75)(response_time_ms) AS p75,
    quantile(0.90)(response_time_ms) AS p90,
    quantile(0.95)(response_time_ms) AS p95,
    quantile(0.99)(response_time_ms) AS p99,
    max(response_time_ms) AS max_latency
FROM fact_requests
WHERE date >= today() - 7
  AND response_time_ms > 0
GROUP BY path
HAVING count() > 100
ORDER BY p95 DESC
LIMIT 20;
*/
