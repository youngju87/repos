# Quick Start - Analytics Audit Engine

Get up and running in 10 minutes.

## Prerequisites

- Docker Desktop
- Python 3.11+
- Internet connection (for crawling websites)

## Setup

### 1. Start Database (2 minutes)

```bash
cd analytics-audit-engine

# Start PostgreSQL
docker-compose up -d

# Verify it's running
docker-compose ps
```

### 2. Install Python Dependencies (3 minutes)

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Or Mac/Linux
source venv/bin/activate

# Install packages
pip install -r requirements.txt

# Install Playwright browsers (required for JavaScript rendering)
playwright install chromium
```

This downloads Chromium browser for Playwright (~150MB).

### 3. Set Up Environment (1 minute)

```bash
# Copy environment template
cp .env.example .env

# Default values work fine for local development
```

## Run Your First Audit

### Example 1: Audit a Demo Site

```bash
python audit_cli.py scan --url https://demo.google.com/analytics --max-pages 5
```

### Example 2: Audit Your Own Site

```bash
python audit_cli.py scan --url https://yoursite.com --max-pages 20 --format both
```

Parameters:
- `--url`: Website to audit (required)
- `--max-pages`: Maximum pages to crawl (default: 50)
- `--format`: Report format - html, pdf, or both (default: html)
- `--output`: Output directory (default: ./reports)

## What Happens

1. **Crawling** (1-5 min): Visits pages, executes JavaScript, detects tags
2. **Analysis** (<1 min): Calculates scores, identifies issues
3. **Reporting** (<1 min): Generates HTML/PDF report

## View Results

The CLI shows a summary:

```
Audit Scores
━━━━━━━━━━━━━━━━━━━━
Overall Score    72/100
Implementation   85/100
Compliance       65/100
Performance      80/100

Issues Found
━━━━━━━━━━━━━━━━━━━━
Critical         3
Warning          7
Info             2
```

Full report saved to: `./reports/audit_yoursite_20250101_120000.html`

## View Previous Audits

```bash
# List audits (coming soon)
python audit_cli.py list

# View specific audit
python audit_cli.py view --audit-id <audit-id-from-output>
```

## Common Use Cases

### Audit Client Website

```bash
python audit_cli.py scan --url https://clientsite.com --max-pages 100 --format pdf
```

Then send them the PDF report!

### Quick Homepage Check

```bash
python audit_cli.py scan --url https://site.com --max-pages 1
```

### Deep Site Audit

```bash
python audit_cli.py scan --url https://site.com --max-pages 200
```

Note: Crawling 200 pages takes ~40 minutes (respectful rate limiting).

## Sample Output

The HTML report includes:

- **Executive Summary**: Overall score, pages audited, issue counts
- **Score Breakdown**: Implementation, compliance, performance scores
- **Tag Coverage**: GA4, GTM, consent banner coverage percentages
- **Issues & Recommendations**: Categorized by severity with actionable fixes
- **Next Steps**: Prioritized action items

## Troubleshooting

### "Connection refused" error
```bash
# Check if database is running
docker-compose ps

# If not, start it
docker-compose up -d
```

### "Playwright not found"
```bash
# Install Playwright browsers
playwright install chromium
```

### "No module named 'crawler'"
```bash
# Make sure you're in the project directory
cd analytics-audit-engine

# And virtual environment is activated
source venv/bin/activate  # or venv\Scripts\activate on Windows
```

### Slow crawling
- This is normal - respectful crawling takes time
- Reduce `--max-pages` for faster audits
- First few pages include initial browser launch overhead

## Next Steps

1. **Audit your own sites** - Find analytics issues before they affect data
2. **Review the reports** - Learn what good implementation looks like
3. **Customize rules** - Edit `analyzer/audit_analyzer.py` for your needs
4. **Schedule audits** - Run monthly to catch configuration drift

## Understanding Scores

**Overall Score (0-100)**:
- 80-100: Excellent implementation
- 60-79: Good, minor improvements needed
- 40-59: Fair, several issues to address
- <40: Poor, significant problems

**What Affects Scores**:
- Implementation: Tag coverage, correct dataLayer setup
- Compliance: Consent banners, privacy policies
- Performance: Number of tracking scripts

## System Requirements

- RAM: 2GB minimum (Playwright browser)
- Disk: 500MB for dependencies
- Network: Required for crawling websites

---

**Time to first audit: ~10 minutes**

Ready to find analytics issues on your site? Run your first audit now!
