# Complete Setup Guide - Server Log Analytics

This guide will walk you through setting up the entire log analytics system from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Database Setup](#database-setup)
4. [Sample Data](#sample-data)
5. [Ingestion](#ingestion)
6. [Analytics](#analytics)
7. [Dashboard](#dashboard)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Python 3.11+** - [Download](https://www.python.org/downloads/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** (optional) - For version control

### System Requirements
- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 10GB free space
- **OS**: Windows, macOS, or Linux

---

## Installation

### Step 1: Clone/Download Project

```bash
cd working
cd server-log-analytics
```

### Step 2: Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Python Dependencies

```bash
pip install -r requirements.txt
```

Expected output:
```
Successfully installed clickhouse-driver-0.2.6 pandas-2.1.4 ...
```

---

## Database Setup

### Step 1: Start ClickHouse

```bash
# Start ClickHouse container
docker-compose up -d

# Verify it's running
docker-compose ps
```

Expected output:
```
NAME                          STATUS    PORTS
log-analytics-clickhouse      Up        0.0.0.0:8123->8123/tcp, 0.0.0.0:9000->9000/tcp
```

### Step 2: Initialize Database

```bash
python scripts/init_db.py
```

Expected output:
```
ClickHouse Database Initialization

Connecting to ClickHouse at localhost:9000...
✓ Connected to ClickHouse

Step 1: Creating database
✓ Database 'logs' created/verified

Step 2: Creating tables
✓ Table 'fact_requests' created/verified
✓ Table 'fact_sessions' created/verified
✓ Table 'security_events' created/verified
✓ Table 'anomalies' created/verified
✓ Table 'dim_user_agents' created/verified

Step 3: Creating materialized views
✓ Materialized view 'mv_hourly_traffic' created/verified
✓ Materialized view 'mv_daily_summary' created/verified
✓ Materialized view 'mv_top_pages_daily' created/verified
✓ Materialized view 'mv_bot_stats' created/verified

Verifying setup...

Tables created:
  • anomalies
  • dim_user_agents
  • fact_requests
  • fact_sessions
  • mv_bot_stats
  • mv_daily_summary
  • mv_hourly_traffic
  • mv_top_pages_daily
  • security_events

Disk usage: 0.00 B

✓ Database initialization complete!
```

---

## Sample Data

### Generate Sample Logs

```bash
python sample_data/generate_sample_logs.py
```

Expected output:
```
Generating 10,000 sample log lines...
✓ Generated 10,000 lines
✓ Saved to: C:\Users\...\sample_data\nginx_access.log

Scenario breakdown:
  70% Normal traffic
  15% Bot traffic
   5% Slow requests
   8% Error responses
   2% Attack attempts
```

This creates a realistic log file with:
- **Normal traffic**: Regular user requests
- **Bot traffic**: Googlebot, Bingbot, etc.
- **Slow requests**: High latency scenarios
- **Errors**: 4xx and 5xx responses
- **Attack attempts**: SQL injection, XSS, path traversal

---

## Ingestion

### Ingest Sample Logs

```bash
python ingest_logs.py --file sample_data/nginx_access.log --format nginx
```

Expected output:
```
Starting log ingestion
File: sample_data/nginx_access.log
Format: nginx
Batch size: 10,000

Read 10,000 lines from file

Processing logs... ████████████████████ 100%

============================================================
Ingestion Complete
============================================================

Parsing:
  Total lines:         10,000
  Parsed successfully: 9,987 (99.9%)
  Parse errors:        13

Database:
  Inserted to DB:      9,987

Bot Detection:
  Bots detected:       1,498 (15.0%)

Security:
  Threats detected:    198

  ⚠ WARNING: 198 security threats detected!
  Run: python analytics_cli.py security-scan

Performance:
  Processing time:     2.34 seconds
  Throughput:          4,273 lines/second

============================================================
```

### Ingest Your Own Logs

**Nginx:**
```bash
python ingest_logs.py --file /var/log/nginx/access.log --format nginx
```

**Apache:**
```bash
python ingest_logs.py --file /var/log/apache2/access.log --format apache
```

**CloudFlare (JSON):**
```bash
python ingest_logs.py --file cloudflare_logs.json --format cloudflare
```

**Options:**
- `--batch-size 5000` - Smaller batches (default: 10,000)
- `--no-bot-detection` - Skip bot detection
- `--no-security-scan` - Skip security scanning

---

## Analytics

### Traffic Summary

```bash
python analytics_cli.py traffic-summary --days 7
```

Output:
```
Traffic Summary (Last 7 Days)

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Traffic Summary                                   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Volume:
  Total Requests:      9,987
  Requests/Day:        1,427
  Unique IPs:          10
  Data Transferred:    0.15 GB

Performance:
  Avg Response Time:   324ms
  P95 Response Time:   1,245ms

Quality:
  Error Rate:          8.12%
  Total Errors:        811

Traffic:
  Bot Traffic:         15.0%
  Human Traffic:       85.0%
```

### Top Pages

```bash
python analytics_cli.py top-pages --days 7 --limit 10
```

### Performance Analysis

```bash
python analytics_cli.py performance --endpoint /api/users --days 7
```

### Slowest Endpoints

```bash
python analytics_cli.py slowest --threshold 1000 --days 7
```

### Bot Stats

```bash
python analytics_cli.py bot-stats --days 30
```

### Top IPs

```bash
python analytics_cli.py top-ips --limit 20 --days 1
```

### Database Info

```bash
python analytics_cli.py database-info
```

---

## Dashboard

### Start Dashboard

```bash
python dashboard/app.py
```

Output:
```
============================================================
Server Log Analytics Dashboard
============================================================

Starting dashboard on http://localhost:8050

Make sure ClickHouse is running and data is ingested!

Press Ctrl+C to stop

Dash is running on http://0.0.0.0:8050/

 * Serving Flask app 'app'
 * Debug mode: on
```

### Access Dashboard

Open your browser and navigate to:
```
http://localhost:8050
```

### Dashboard Features

The dashboard includes:

1. **KPI Cards**
   - Total requests
   - Average latency
   - Error rate
   - Bot traffic percentage

2. **Traffic Over Time**
   - Dual-axis chart showing requests and latency

3. **Status Code Distribution**
   - Pie chart of HTTP status codes

4. **Top 10 Pages**
   - Horizontal bar chart

5. **Latency Distribution**
   - Histogram of response times

6. **Bot vs Human Traffic**
   - Area chart over time

7. **Top Bot Types**
   - Breakdown of bot traffic

**Auto-refresh:** Dashboard updates every 30 seconds automatically

---

## Troubleshooting

### ClickHouse Connection Errors

**Error:** `Connection refused`

**Solution:**
```bash
# Check if ClickHouse is running
docker-compose ps

# If not running, start it
docker-compose up -d

# View logs
docker-compose logs clickhouse

# Restart if needed
docker-compose restart clickhouse
```

### Slow Ingestion

**Problem:** Ingestion takes too long

**Solutions:**
1. Reduce batch size:
   ```bash
   python ingest_logs.py --file logs.txt --batch-size 5000
   ```

2. Disable bot detection or security scanning:
   ```bash
   python ingest_logs.py --file logs.txt --no-bot-detection --no-security-scan
   ```

3. Check ClickHouse CPU/memory usage:
   ```bash
   docker stats log-analytics-clickhouse
   ```

### Parse Errors

**Problem:** Many parse errors during ingestion

**Solution:**
1. Verify log format matches:
   - Use `--format nginx` for Nginx logs
   - Use `--format apache` for Apache logs
   - Use `--format cloudflare` for CloudFlare JSON

2. Check log file encoding (should be UTF-8)

3. Examine malformed lines in your log file

### Dashboard Shows No Data

**Problem:** Dashboard is empty or shows "No data"

**Solutions:**
1. Verify data was ingested:
   ```bash
   python analytics_cli.py database-info
   ```

2. Check time range (default is 7 days - might not have data in that range)

3. Test database connection:
   ```bash
   docker exec -it log-analytics-clickhouse clickhouse-client
   SELECT count() FROM logs.fact_requests;
   ```

### Port Conflicts

**Problem:** Port 8123 or 9000 already in use

**Solution:**
Edit `docker-compose.yml` and change ports:
```yaml
ports:
  - "8124:8123"  # Changed from 8123
  - "9001:9000"  # Changed from 9000
```

Then update connection in code to use new ports.

---

## Next Steps

### 1. Production Deployment

For production use:

1. **Secure ClickHouse:**
   - Set strong passwords
   - Enable SSL/TLS
   - Configure firewall rules

2. **Scale ClickHouse:**
   - Use ClickHouse cluster for high volume
   - Configure replication
   - Optimize table partitioning

3. **Continuous Ingestion:**
   - Set up log shipping from servers
   - Use Fluentd/Logstash for real-time ingestion
   - Configure retention policies

### 2. Customize for Your Use Case

1. **Modify conversion goals:**
   Edit `analyzers/sessionizer.py`:
   ```python
   CONVERSION_PATHS = [
       '/your-success-page',
       '/your-checkout-page'
   ]
   ```

2. **Add custom metrics:**
   Extend ClickHouse schema with your fields

3. **Adjust alert thresholds:**
   Edit `analyzers/anomaly_detector.py`

### 3. Set Up Alerts

Integrate with notification systems:
- **Slack**: Use webhooks for critical alerts
- **Email**: Configure SMTP for reports
- **PagerDuty**: For incident management

### 4. Schedule Regular Reports

Use cron (Linux/Mac) or Task Scheduler (Windows):

```bash
# Daily summary at 9 AM
0 9 * * * /path/to/venv/bin/python /path/to/analytics_cli.py traffic-summary --days 1
```

---

## Architecture Summary

```
┌─────────────────┐
│   Log Files     │ (Nginx, Apache, CloudFlare)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ingest_logs.py │ (Parser + Bot Detection + Security Scan)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   ClickHouse    │ (Columnar Database)
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌──────────────┐
│ analytics_cli.py│  │ dashboard/   │
│   (CLI Queries) │  │   app.py     │
└─────────────────┘  └──────────────┘
```

---

## File Structure

```
server-log-analytics/
├── parsers/
│   └── log_parser.py          # Multi-format log parser
├── analyzers/
│   ├── bot_detector.py        # Bot detection
│   ├── security_scanner.py    # Security threat detection
│   ├── sessionizer.py         # Session analysis
│   └── anomaly_detector.py    # Anomaly detection
├── database/
│   ├── clickhouse_schema.sql  # Database schema
│   └── clickhouse_client.py   # DB connector
├── dashboard/
│   └── app.py                 # Plotly Dash dashboard
├── scripts/
│   └── init_db.py            # Database initialization
├── sample_data/
│   └── generate_sample_logs.py # Sample data generator
├── ingest_logs.py            # Main ingestion pipeline
├── analytics_cli.py          # CLI tool
├── docker-compose.yml        # ClickHouse setup
├── requirements.txt          # Python dependencies
├── README.md                 # Project overview
├── QUICKSTART.md             # Quick start guide
└── SETUP_GUIDE.md           # This file
```

---

## Support

For issues or questions:
1. Check this guide's [Troubleshooting](#troubleshooting) section
2. Review the [README.md](README.md) for project overview
3. Check ClickHouse logs: `docker-compose logs clickhouse`

---

**You're all set!** 🎉

Start analyzing your server logs and discover valuable insights about performance, security, and user behavior.
