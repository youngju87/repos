# Deployment Guide - SEO Content Gap Finder v2.0

**Production-Ready Deployment Options**

---

## Table of Contents

1. [Quick Deployment Options](#quick-deployment-options)
2. [Local Production Setup](#local-production-setup)
3. [Scheduled Automation](#scheduled-automation)
4. [Docker Deployment](#docker-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [Performance Optimization](#performance-optimization)

---

## Quick Deployment Options

| Option | Best For | Complexity | Cost |
|--------|----------|------------|------|
| **Local** | Personal use, testing | Low | Free |
| **Cron/Task Scheduler** | Automated reports | Low | Free |
| **Docker** | Containerized deployment | Medium | Free/Minimal |
| **AWS EC2** | Scalable cloud deployment | Medium | $10-50/month |
| **Web API** | Team access, integration | High | Varies |

---

## Local Production Setup

### Prerequisites

```bash
# System requirements
- Python 3.8+
- 4GB RAM minimum
- 2GB disk space
- Internet connection
```

### Installation

```bash
# 1. Clone repository
git clone <your-repo-url>
cd seo-content-gap-finder

# 2. Create virtual environment
python -m venv venv

# 3. Activate
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# 4. Install dependencies
pip install -r requirements.txt

# 5. Install browser
python -m playwright install chromium

# 6. Download NLP model
python -m spacy download en_core_web_sm

# 7. Test installation
python testing/test_standalone.py
```

### Quick Start

```bash
# Basic analysis
python content_gap_cli.py analyze --keyword "your keyword"

# With caching (10x faster)
python content_gap_cli.py analyze --keyword "your keyword" --cache

# Batch processing
python content_gap_cli.py batch --keywords-file keywords.txt
```

---

## Scheduled Automation

### Linux/Mac - Cron Jobs

**Daily Analysis at 2 AM:**

```bash
# Edit crontab
crontab -e

# Add line (adjust paths)
0 2 * * * cd /home/user/seo-content-gap-finder && /home/user/seo-content-gap-finder/venv/bin/python content_gap_cli.py batch --keywords-file /home/user/keywords.txt --output-dir /home/user/reports/ --cache
```

**Weekly Analysis (Monday 3 AM):**

```bash
0 3 * * 1 cd /path/to/project && ./venv/bin/python content_gap_cli.py batch --keywords-file keywords.txt --format markdown --output-dir weekly-reports/
```

**View Cron Logs:**

```bash
# Check if cron job ran
grep CRON /var/log/syslog

# Or create custom log
0 2 * * * cd /path/to/project && ./venv/bin/python content_gap_cli.py batch --keywords-file keywords.txt >> /var/log/seo-gap-finder.log 2>&1
```

### Windows - Task Scheduler

**Create Scheduled Task:**

1. Open **Task Scheduler**
2. Click **Create Basic Task**
3. Name: "SEO Gap Finder - Daily"
4. Trigger: Daily at 2:00 AM
5. Action: **Start a program**
   - Program: `C:\path\to\seo-content-gap-finder\venv\Scripts\python.exe`
   - Arguments: `content_gap_cli.py batch --keywords-file keywords.txt --output-dir reports/`
   - Start in: `C:\path\to\seo-content-gap-finder`
6. Finish and test

**PowerShell Script (Advanced):**

```powershell
# scheduled-analysis.ps1
Set-Location "C:\path\to\seo-content-gap-finder"
.\venv\Scripts\Activate.ps1

python content_gap_cli.py batch `
  --keywords-file keywords.txt `
  --format markdown `
  --output-dir "D:\Reports\$(Get-Date -Format 'yyyy-MM-dd')" `
  --cache

# Email results (optional)
$reportPath = "D:\Reports\$(Get-Date -Format 'yyyy-MM-dd')"
Send-MailMessage -To "you@example.com" -From "bot@example.com" -Subject "SEO Gap Analysis - $(Get-Date)" -Attachments (Get-ChildItem $reportPath).FullName
```

---

## Docker Deployment

### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers
RUN python -m playwright install chromium
RUN python -m playwright install-deps

# Download spaCy model
RUN python -m spacy download en_core_web_sm

# Copy application
COPY . .

# Create directories
RUN mkdir -p reports cache

# Expose port (if running as web service)
EXPOSE 5000

# Default command
ENTRYPOINT ["python", "content_gap_cli.py"]
CMD ["--help"]
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  seo-gap-finder:
    build: .
    container_name: seo-gap-finder
    volumes:
      - ./keywords.txt:/app/keywords.txt
      - ./reports:/app/reports
      - ./cache:/app/cache
    environment:
      - CACHE_ENABLED=true
      - LOG_LEVEL=INFO
    command: batch --keywords-file keywords.txt --output-dir reports/ --cache
```

### Build & Run

```bash
# Build image
docker build -t seo-gap-finder .

# Run single analysis
docker run --rm seo-gap-finder analyze --keyword "project management"

# Run batch with volume mounts
docker run --rm \
  -v $(pwd)/keywords.txt:/app/keywords.txt \
  -v $(pwd)/reports:/app/reports \
  seo-gap-finder batch --keywords-file keywords.txt --output-dir reports/

# Run with docker-compose
docker-compose up

# Run in background (detached)
docker-compose up -d

# View logs
docker-compose logs -f
```

### Scheduled Docker Run

**Linux/Mac (Cron + Docker):**

```bash
# Daily at 2 AM
0 2 * * * docker run --rm -v /home/user/seo-gap/keywords.txt:/app/keywords.txt -v /home/user/reports:/app/reports seo-gap-finder batch --keywords-file keywords.txt --output-dir reports/
```

---

## Cloud Deployment

### AWS EC2 Deployment

**Step 1: Launch EC2 Instance**

- AMI: Ubuntu 22.04 LTS
- Instance Type: t3.medium (2 vCPU, 4GB RAM)
- Storage: 20GB gp3
- Security Group: SSH (22) from your IP

**Step 2: Connect & Setup**

```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python & dependencies
sudo apt install -y python3 python3-pip python3-venv

# Clone repository
git clone <your-repo-url>
cd seo-content-gap-finder

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
python -m playwright install chromium
python -m playwright install-deps
python -m spacy download en_core_web_sm
```

**Step 3: Setup Automated Analysis**

```bash
# Create keywords file
nano keywords.txt
# Add your keywords (one per line)

# Test analysis
python content_gap_cli.py analyze --keyword "test" --depth 5

# Setup cron for daily reports
crontab -e

# Add line (2 AM daily)
0 2 * * * cd /home/ubuntu/seo-content-gap-finder && /home/ubuntu/seo-content-gap-finder/venv/bin/python content_gap_cli.py batch --keywords-file keywords.txt --output-dir reports/ --cache
```

**Step 4: Access Reports**

Option A: SCP to local machine
```bash
scp -i your-key.pem -r ubuntu@your-ec2-ip:/home/ubuntu/seo-content-gap-finder/reports/ ./local-reports/
```

Option B: Setup S3 sync
```bash
# Install AWS CLI
sudo apt install -y awscli

# Configure AWS credentials
aws configure

# Sync reports to S3
aws s3 sync reports/ s3://your-bucket/seo-reports/
```

### AWS Lambda (Serverless)

**Note:** Not recommended due to:
- Cold start times (10-30 seconds)
- Chromium binary size limits
- 15-minute Lambda timeout may not be enough

**If you must use Lambda:**

1. Use Lambda Layers for dependencies
2. Include headless Chromium binary
3. Increase timeout to 15 minutes
4. Allocate 2GB+ memory
5. Consider AWS Fargate instead

---

## Performance Optimization

### 1. Enable Caching

**Massive performance boost - 10x faster on repeated analyses**

```bash
# First run (no cache): 45-90 seconds
python content_gap_cli.py analyze --keyword "test" --cache

# Second run (cached): 5-10 seconds
python content_gap_cli.py analyze --keyword "test" --cache
```

### 2. Optimize Batch Processing

```bash
# Default (3 concurrent): ~4 minutes for 10 keywords
python content_gap_cli.py batch --keywords-file keywords.txt

# Faster (5 concurrent): ~3 minutes for 10 keywords
python content_gap_cli.py batch --keywords-file keywords.txt --max-concurrent 5

# Maximum (8 concurrent): ~2 minutes but may hit rate limits
python content_gap_cli.py batch --keywords-file keywords.txt --max-concurrent 8
```

### 3. Reduce Depth for Speed

```bash
# Deep analysis (20 results): ~90 seconds
python content_gap_cli.py analyze --keyword "test" --depth 20

# Standard (10 results): ~45 seconds
python content_gap_cli.py analyze --keyword "test" --depth 10

# Quick (5 results): ~25 seconds
python content_gap_cli.py analyze --keyword "test" --depth 5
```

### 4. Cache Management

```bash
# View cache stats
python content_gap_cli.py cache-stats

# Clear old cache (monthly)
python content_gap_cli.py cache-clear --all

# Cache grows ~0.5 MB per keyword analyzed
# 100 keywords ≈ 50 MB
# 1000 keywords ≈ 500 MB
```

### 5. Resource Allocation

**Recommended by use case:**

| Use Case | CPU | RAM | Disk | Concurrent |
|----------|-----|-----|------|------------|
| Personal (1-10/day) | 2 cores | 4GB | 10GB | 3 |
| Agency (50-100/day) | 4 cores | 8GB | 50GB | 5 |
| Enterprise (500+/day) | 8 cores | 16GB | 100GB | 8 |

---

## Monitoring & Logging

### Basic Logging

```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
python content_gap_cli.py analyze --keyword "test"

# Log to file
python content_gap_cli.py analyze --keyword "test" 2>&1 | tee analysis.log
```

### Advanced Monitoring

Create `monitor.py`:

```python
import asyncio
import time
from pipeline.orchestrator import ContentGapPipeline

async def monitor_analysis(keyword):
    start = time.time()

    pipeline = ContentGapPipeline()
    result = await pipeline.analyze(keyword=keyword, depth=10)

    duration = time.time() - start

    print(f"Keyword: {keyword}")
    print(f"Duration: {duration:.2f}s")
    print(f"Gaps Found: {len(result.gap_analysis.gaps)}")
    print(f"Success: {result.success}")

    return {
        'keyword': keyword,
        'duration': duration,
        'gaps': len(result.gap_analysis.gaps),
        'success': result.success
    }

# Run
asyncio.run(monitor_analysis("your keyword"))
```

---

## Security Best Practices

### 1. Don't Commit Cache Files

Add to `.gitignore`:

```
.content_cache.db
.serp_cache.db
*.db
reports/
```

### 2. Environment Variables

Use `.env` file for sensitive config:

```bash
# .env
PROXY_URL=http://your-proxy:8080
API_KEY=your-api-key-here
```

Load in code:

```python
from dotenv import load_dotenv
load_dotenv()
```

### 3. Rate Limiting

Avoid IP bans:

```python
# In pipeline/orchestrator.py
# Add delays between requests
await asyncio.sleep(2)  # 2 second delay
```

---

## Backup & Recovery

### Backup Strategy

```bash
# Backup cache (weekly)
tar -czf cache-backup-$(date +%Y%m%d).tar.gz .content_cache.db .serp_cache.db

# Backup reports (daily)
tar -czf reports-backup-$(date +%Y%m%d).tar.gz reports/

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups/seo-gap-finder"
DATE=$(date +%Y%m%d)

mkdir -p $BACKUP_DIR

# Backup cache
tar -czf $BACKUP_DIR/cache-$DATE.tar.gz .content_cache.db .serp_cache.db

# Backup reports (last 30 days)
find reports/ -mtime -30 | tar -czf $BACKUP_DIR/reports-$DATE.tar.gz -T -

# Delete backups older than 90 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +90 -delete
```

---

## Troubleshooting Production Issues

### Issue: High Memory Usage

**Solution:**
```bash
# Reduce concurrent analyses
python content_gap_cli.py batch --keywords-file keywords.txt --max-concurrent 1

# Or analyze in smaller batches
split -l 10 keywords.txt batch_
# Analyze each batch_ file separately
```

### Issue: SERP Scraping Blocked

**Solution:**
```bash
# Use proxy
# Add to pipeline/orchestrator.py:
# self.serp_scraper = SerpScraper(proxy="http://your-proxy:8080")

# Reduce request rate
# Add delays in scraper

# Rotate user agents
# Implement in scraper code
```

### Issue: Disk Space Full (Cache Growth)

**Solution:**
```bash
# Check cache size
python content_gap_cli.py cache-stats

# Clear old cache
python content_gap_cli.py cache-clear --all

# Or set up auto-cleanup (add to cron)
0 0 1 * * cd /path/to/project && /path/to/venv/bin/python content_gap_cli.py cache-clear --all
```

---

## Next Steps

1. Choose deployment option
2. Setup according to guide
3. Test with small keyword set
4. Scale up gradually
5. Monitor performance
6. Optimize as needed

For questions, see [SETUP_GUIDE.md](SETUP_GUIDE.md) or [README.md](README.md).

---

**Production-Ready Deployment Complete!**

© 2025 SEO Content Gap Finder v2.0
