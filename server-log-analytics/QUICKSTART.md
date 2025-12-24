# Quick Start - Server Log Analytics

Get your log analytics warehouse running in 20 minutes.

## Prerequisites

- Python 3.11+
- Docker Desktop
- Sample server logs (we'll provide examples)

## Setup (15 minutes)

### 1. Start ClickHouse Database

```bash
cd server-log-analytics

# Start ClickHouse
docker-compose up -d

# Verify it's running
docker-compose ps
```

### 2. Install Python Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install packages
pip install -r requirements.txt
```

### 3. Initialize Database

```bash
# Create tables
python scripts/init_db.py
```

## Ingest Logs (5 minutes)

### Example 1: Sample Nginx Logs

```bash
# Ingest provided sample data
python ingest_logs.py --file sample_data/nginx_access.log --format nginx

# Output:
# Parsed 10,000 log lines
# Inserted 9,987 requests (13 malformed)
# Processing time: 2.3 seconds
```

### Example 2: Your Own Logs

```bash
# Nginx logs
python ingest_logs.py --file /var/log/nginx/access.log --format nginx

# Apache logs
python ingest_logs.py --file /var/log/apache2/access.log --format apache

# CloudFlare logs (JSON)
python ingest_logs.py --file cloudflare_logs.json --format cloudflare
```

### Example 3: Continuous Monitoring

```bash
# Watch log file for new entries
python ingest_logs.py --file /var/log/nginx/access.log --format nginx --follow
```

## View Analytics

### CLI Queries

```bash
# Top pages by traffic
python analytics_cli.py top-pages --days 7

# Performance metrics
python analytics_cli.py performance --endpoint /api/users

# Bot traffic analysis
python analytics_cli.py bot-stats --days 30

# Security threats
python analytics_cli.py security-scan --days 1
```

### Dashboard

```bash
# Start dashboard
python dashboard/app.py

# Visit http://localhost:8050
```

### Direct SQL

```bash
# Connect to ClickHouse
docker exec -it log-analytics-clickhouse clickhouse-client

# Run queries
SELECT
    path,
    count() as requests,
    avg(response_time_ms) as avg_latency
FROM fact_requests
WHERE date = today()
GROUP BY path
ORDER BY requests DESC
LIMIT 10;
```

## Sample Outputs

### Top Pages

```
Top 10 Pages (Last 7 Days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Path                    Requests    Avg Latency
────────────────────────────────────────────
/api/products           245,891     127ms
/api/users              189,234     98ms
/search                 156,432     203ms
/                       134,567     45ms
/api/orders             98,234      156ms
```

### Performance Analysis

```
Endpoint Performance: /api/users
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Metric              Value
────────────────────────────────────
Total Requests      189,234
P50 Latency         78ms
P95 Latency         245ms
P99 Latency         512ms
Error Rate          0.3%

Status Code Breakdown:
  200 OK:           188,689 (99.7%)
  404 Not Found:    342 (0.2%)
  500 Server Error: 203 (0.1%)
```

### Bot Traffic

```
Bot Traffic Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bot Type            Requests    % of Total
────────────────────────────────────────────
Human Traffic       1,234,567   77.2%
Googlebot           189,234     11.8%
Bingbot             67,891      4.2%
Other Bots          108,234     6.8%
```

### Security Alerts

```
Security Scan (Last 24 Hours)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Threat Type         Count    Top IPs
────────────────────────────────────────────
SQL Injection       47       45.33.32.156 (23)
XSS Attempt         12       104.28.14.15 (8)
Path Traversal      8        192.168.1.100 (5)
Rate Limit Hit      156      various

⚠ RECOMMENDED ACTIONS:
• Block IP 45.33.32.156 (47 SQL injection attempts)
• Review rate limits for /api/search
```

## Understanding Your Data

### Data Flow

```
Log File → Parser → ClickHouse → Analytics → Dashboard
                                     ↓
                                  Alerts
```

### Tables Created

1. **fact_requests** - Every HTTP request (millions of rows)
2. **fact_sessions** - User sessions (sessionized requests)
3. **dim_user_agents** - User agent lookup table
4. **anomalies** - Detected anomalies

### Retention

By default:
- Raw logs: 90 days
- Aggregated metrics: 1 year
- Anomaly records: Forever

Configure in `config.yaml`

## Common Use Cases

### 1. Find Slow Endpoints

```bash
python analytics_cli.py slowest --threshold 1000ms --limit 20
```

Shows endpoints with P95 > 1 second.

### 2. Traffic Spike Investigation

```bash
python analytics_cli.py spike-detect --date 2024-01-15
```

Identifies unusual traffic patterns.

### 3. Geographic Analysis

```bash
python analytics_cli.py geo-traffic --days 7
```

Shows traffic by country.

### 4. User Journey

```bash
python analytics_cli.py journey --session-id abc123
```

Complete path for a specific session.

## Troubleshooting

### "Connection refused" to ClickHouse

```bash
# Check if ClickHouse is running
docker-compose ps

# View logs
docker-compose logs clickhouse

# Restart
docker-compose restart clickhouse
```

### Slow ingestion

- Reduce batch size: `--batch-size 1000`
- Use async mode: `--async`
- Check ClickHouse CPU usage

### Query timeout

- Add indexes (see `scripts/optimize.sql`)
- Reduce date range
- Use materialized views for common queries

## Performance Tips

### Ingestion

- Batch insert (default: 10,000 lines)
- Use async inserts for real-time
- Compress log files before ingestion

### Queries

- Always filter by date first
- Use appropriate date granularity
- Leverage ClickHouse's columnar storage

### Storage

- Partition by month automatically applied
- Compression ratio: ~5:1 for access logs
- Expect ~200MB per million log lines

## Next Steps

1. **Set up continuous ingestion** from your servers
2. **Configure alerts** for critical thresholds
3. **Create custom dashboards** for your KPIs
4. **Schedule reports** via cron/Airflow

## Advanced Features

### Sessionization

Automatically groups requests into sessions:

```sql
SELECT
    session_id,
    count() as page_views,
    max(timestamp) - min(timestamp) as duration
FROM fact_requests
WHERE session_id != ''
GROUP BY session_id
LIMIT 10;
```

### Anomaly Detection

ML-based detection of unusual patterns:

```bash
python scripts/detect_anomalies.py --date today
```

### Custom Metrics

Define business metrics in `config/metrics.yaml`:

```yaml
conversion_rate:
  numerator: "path = '/checkout/complete'"
  denominator: "path LIKE '/product/%'"
```

---

**Time to first insights: ~20 minutes**

Ready to analyze your server logs!
