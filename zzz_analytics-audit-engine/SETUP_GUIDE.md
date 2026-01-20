# Complete Setup Guide - Analytics Audit Engine

Comprehensive setup instructions to get the Analytics Audit Engine running on your machine.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation in VS Code](#installation-in-vs-code)
3. [Database Setup](#database-setup)
4. [First Audit](#first-audit)
5. [Viewing Reports](#viewing-reports)
6. [Common Use Cases](#common-use-cases)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Python 3.12+** - [Download](https://www.python.org/downloads/) - Use `py --version` on Windows to check
- **VS Code** (recommended) - [Download](https://code.visualstudio.com/)
- **Internet connection** (for crawling websites)

### System Requirements

- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 1GB free space
- **OS**: Windows 10+, macOS 10.14+, or Linux

---

## Installation in VS Code

### Step 1: Open Project Folder

1. Open VS Code
2. Click **File** → **Open Folder**
3. Navigate to: `C:\Users\Justin\source\repos\working\analytics-audit-engine`
4. Click **Select Folder**

✅ You should see all project files in the left sidebar.

### Step 2: Open Integrated Terminal

Press `` Ctrl + ` `` (backtick key) or:
- Click **Terminal** → **New Terminal**

✅ Terminal panel opens at the bottom of VS Code.

### Step 3: Create Virtual Environment

**Windows:**
In the terminal:

```bash
py -3.12 -m venv venv
```

Wait ~30 seconds. A `venv` folder will appear.

**Mac/Linux:**
```bash
python3 -m venv venv
```

### Step 4: Using Virtual Environment

**Windows (Recommended - No Activation Needed):**

Instead of activating the virtual environment (which requires changing PowerShell execution policy), use the Python executable directly:

```bash
# This works without activation and avoids permission issues
venv\Scripts\python.exe --version
```

✅ You should see: `Python 3.12.x`

**Mac/Linux:**
```bash
source venv/bin/activate
```

✅ You should see `(venv)` at the start of your terminal line:
```
(venv) ~/analytics-audit-engine$
```

**Note for Windows PowerShell users:** If you want to activate the venv traditionally, you'll need to bypass execution policy:
```powershell
powershell -ExecutionPolicy Bypass -Command "& {.\venv\Scripts\Activate.ps1}"
```

### Step 5: Select Python Interpreter

1. Press `Ctrl + Shift + P`
2. Type: `Python: Select Interpreter`
3. Select the one with `(venv)`:
   ```
   Python 3.11.x ('venv': venv) .\venv\Scripts\python.exe
   ```

✅ Bottom-right of VS Code shows: `Python 3.11.x ('venv': venv)`

### Step 6: Install Python Packages

**Windows:**
```bash
venv\Scripts\python.exe -m pip install --upgrade pip
venv\Scripts\python.exe -m pip install -r requirements.txt
```

**Mac/Linux (with venv activated):**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This takes 2-3 minutes. You'll see packages installing:
```
Collecting playwright==1.40.0
Collecting beautifulsoup4==4.12.2
...
Successfully installed playwright-1.40.0 ...
```

✅ **Success** when installation completes without errors.

### Step 7: Install Playwright Browser

Playwright needs a browser to crawl websites:

**Windows:**
```bash
venv\Scripts\python.exe -m playwright install chromium
```

**Mac/Linux (with venv activated):**
```bash
playwright install chromium
```

Downloads Chromium (~150MB). Takes 1-2 minutes.

✅ **Success message:**
```
Chromium 119.0.6045.9 downloaded successfully
```

---

## Database Setup

### Step 8: Configure Database

The audit engine can use either PostgreSQL (with Docker) or SQLite (simpler, no Docker needed).

#### Option A: SQLite (Recommended for Getting Started)

SQLite is already configured in your `.env` file:

```bash
DATABASE_URL=sqlite:///./analytics_audit.db
```

✅ No additional setup needed! The database will be created automatically on first use.

#### Option B: PostgreSQL (For Production)

If you prefer PostgreSQL:

1. Install Docker Desktop
2. Start PostgreSQL:
   ```bash
   docker-compose up -d
   ```
3. Update `.env`:
   ```bash
   # Comment out SQLite
   # DATABASE_URL=sqlite:///./analytics_audit.db

   # Uncomment PostgreSQL settings
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=analytics_audit
   DB_USER=audituser
   DB_PASSWORD=auditpass123
   ```

**Note:** PostgreSQL provides better performance for large-scale audits, but SQLite works great for most use cases.

---

## First Audit

Let's run your first analytics audit!

### Step 9: Run Test Audit

We'll audit a demo website to verify everything works:

**Windows:**
```bash
venv\Scripts\python.exe audit_cli.py scan --url https://demo.playwright.dev/todomvc --max-pages 5
```

**Mac/Linux (with venv activated):**
```bash
python audit_cli.py scan --url https://demo.playwright.dev/todomvc --max-pages 5
```

**What this command does:**
- Scans the demo website
- Checks up to 5 pages
- Detects analytics tools (GA4, GTM, Meta Pixel, etc.)
- Stores results in database

### Step 10: Watch the Progress

You'll see output like:

```
🔍 Starting Analytics Audit

URL: https://demo.playwright.dev/todomvc
Max pages: 5
Depth: 3

⏳ Crawling website...
  Page 1/5: https://demo.playwright.dev/todomvc
  Page 2/5: https://demo.playwright.dev/todomvc/#/
  Page 3/5: ...

✓ Crawl complete
  Pages found: 5
  Pages scanned: 5

🔍 Scanning for analytics tags...
  ✓ Scanned 5 pages
  ✓ Found 0 analytics tools (this is a demo site)

📊 Analyzing findings...
  ✓ Generated 12 findings

✓ Audit Complete!
============================================================
Audit ID: 1
Score: 45/100
Status: NEEDS_IMPROVEMENT

Findings:
  ✗ 8 issues
  ⚠ 4 warnings
  ✓ 0 passed

Results saved to database (Audit ID: 1)

To view report:
  python audit_cli.py report 1
============================================================
```

✅ **Success!** Your first audit is complete.

---

## Viewing Reports

### Step 11: Generate HTML Report

```bash
python audit_cli.py report 1
```

**Output:**

```
📊 Generating Report

Audit ID: 1
URL: https://demo.playwright.dev/todomvc
Date: 2024-12-24 10:30:45

Generating HTML report...
  ✓ Report generated successfully

Report location: reports/audit_1_report.html

✓ Open this file in your browser to view the full report
```

### Step 12: Open Report in Browser

**In VS Code:**
1. Look in the **Explorer** (left sidebar)
2. Find the `reports/` folder
3. Right-click `audit_1_report.html`
4. Choose **"Reveal in File Explorer"** (Windows) or **"Reveal in Finder"** (Mac)
5. Double-click the HTML file

**Or directly from terminal:**

**Windows:**
```bash
start reports/audit_1_report.html
```

**Mac:**
```bash
open reports/audit_1_report.html
```

**Linux:**
```bash
xdg-open reports/audit_1_report.html
```

✅ Your browser opens showing a professional audit report!

---

## Understanding the Report

### Report Sections

**1. Overview**
- Overall audit score (0-100)
- Number of pages scanned
- Analytics tools detected
- Summary of findings

**2. Analytics Tools Detected**
- Google Analytics 4
- Google Tag Manager
- Meta Pixel (Facebook)
- Google Ads
- LinkedIn Insight
- TikTok Pixel
- Twitter Pixel
- Hotjar
- Microsoft Clarity
- Segment

**3. Findings by Severity**

**Critical (Red):**
- No analytics installed
- GTM not configured
- Broken tracking codes

**Warning (Yellow):**
- Missing on some pages
- Inconsistent implementation
- Best practice violations

**Info (Blue):**
- Recommendations
- Optimization suggestions

**4. Page-by-Page Breakdown**
- Tools found on each page
- Issues per page
- Missing implementations

**5. Recommendations**
- Prioritized action items
- Implementation steps
- Best practices

---

## Common Use Cases

### Use Case 1: Audit Your Own Website

**Windows:**
```bash
venv\Scripts\python.exe audit_cli.py scan --url https://yourwebsite.com --max-pages 20
```

**Mac/Linux:**
```bash
python audit_cli.py scan --url https://yourwebsite.com --max-pages 20
```

**What you get:**
- Which analytics tools are installed
- Pages missing tracking
- Implementation issues
- Audit score (0-100)

**Next steps:**
1. Review report
2. Fix critical issues
3. Re-audit to verify fixes

---

### Use Case 2: Client Audit

**Scenario:** Audit a client's website before proposal

**Windows:**
```bash
venv\Scripts\python.exe audit_cli.py scan --url https://clientwebsite.com --max-pages 50
```

**Mac/Linux:**
```bash
python audit_cli.py scan --url https://clientwebsite.com --max-pages 50
```

**Deliverables:**
1. Professional HTML report
2. Audit score and findings
3. Recommended fixes
4. Implementation roadmap

**Value:** Charge $500-$2,000 per audit

---

### Use Case 3: Compliance Check

**Scenario:** Ensure GDPR/privacy compliance

**Windows:**
```bash
venv\Scripts\python.exe audit_cli.py scan --url https://website.com --max-pages 30
```

**Mac/Linux:**
```bash
python audit_cli.py scan --url https://website.com --max-pages 30
```

**Check for:**
- Consent management
- Cookie notices
- Privacy policy links
- Data collection transparency

---

### Use Case 4: Competitive Analysis

**Scenario:** See what analytics competitors use

**Windows:**
```bash
# Audit multiple competitors
venv\Scripts\python.exe audit_cli.py scan --url https://competitor1.com --max-pages 10
venv\Scripts\python.exe audit_cli.py scan --url https://competitor2.com --max-pages 10
venv\Scripts\python.exe audit_cli.py scan --url https://competitor3.com --max-pages 10
```

**Mac/Linux:**
```bash
# Audit multiple competitors
python audit_cli.py scan --url https://competitor1.com --max-pages 10
python audit_cli.py scan --url https://competitor2.com --max-pages 10
python audit_cli.py scan --url https://competitor3.com --max-pages 10
```

**Insights:**
- Tools competitors use
- Their tracking sophistication
- Implementation quality

---

## Command Reference

### Scan Website

**Windows:**
```bash
venv\Scripts\python.exe audit_cli.py scan --url <URL> [OPTIONS]
```

**Mac/Linux:**
```bash
python audit_cli.py scan --url <URL> [OPTIONS]
```

**Options:**
- `--url` - Website URL to audit (required)
- `--max-pages 20` - Maximum pages to scan (default: 50)
- `--format html` - Report format: html, pdf, or both (default: html)
- `--output ./reports` - Output directory (default: ./reports)

**Examples (Windows):**
```bash
# Quick audit (10 pages)
venv\Scripts\python.exe audit_cli.py scan --url https://example.com --max-pages 10

# Deep audit (100 pages)
venv\Scripts\python.exe audit_cli.py scan --url https://example.com --max-pages 100
```

### View Previous Audit

**Windows:**
```bash
venv\Scripts\python.exe audit_cli.py view --audit-id <AUDIT_ID>
```

**Mac/Linux:**
```bash
python audit_cli.py view --audit-id <AUDIT_ID>
```

Display audit summary and results in terminal.

---

## Advanced Usage

### Batch Auditing

Audit multiple sites from a file:

Create `sites.txt`:
```
https://site1.com
https://site2.com
https://site3.com
```

**Windows (PowerShell):**
```powershell
Get-Content sites.txt | ForEach-Object {
  venv\Scripts\python.exe audit_cli.py scan --url $_ --max-pages 20
}
```

**Mac/Linux:**
```bash
while read url; do
  python audit_cli.py scan --url "$url" --max-pages 20
done < sites.txt
```

### Scheduled Audits

**Windows (Task Scheduler):**
```bash
# Create batch file: audit_weekly.bat
@echo off
cd C:\Users\Justin\source\repos\analytics-audit-engine
venv\Scripts\python.exe audit_cli.py scan --url https://yoursite.com --max-pages 30
```

Schedule in Task Scheduler to run weekly.

**Mac/Linux (Cron):**
```bash
# Edit crontab
crontab -e

# Add weekly audit (Mondays at 9 AM)
0 9 * * 1 cd /path/to/analytics-audit-engine && ./venv/bin/python audit_cli.py scan --url https://yoursite.com --max-pages 30
```

---

## Troubleshooting

### Problem: "playwright: command not found"

**Solution:**
```bash
pip install playwright
playwright install chromium
```

### Problem: "Database locked" error

**Cause:** Another process accessing database

**Solution:**
```bash
# Close other terminal windows
# Or delete database and reinitialize
rm audit_engine.db
python scripts/init_db.py
```

### Problem: "Connection timeout" during crawl

**Causes:**
- Slow website
- Website blocking bots
- Network issues

**Solutions:**
```bash
# Reduce max pages (Windows)
venv\Scripts\python.exe audit_cli.py scan --url https://site.com --max-pages 5

# Mac/Linux
python audit_cli.py scan --url https://site.com --max-pages 5

# Increase timeout (edit crawler/page_crawler.py)
# Change timeout in page.goto() from 30000 to 60000
```

### Problem: "No analytics tools found" on site with GA4

**Possible causes:**
- GA4 loaded via GTM (not directly)
- Async loading of scripts
- Custom implementation

**Solution:**
Check GTM container - if GTM detected, GA4 likely configured there.

### Problem: PowerShell won't activate venv

**Solution (Recommended):**
Don't activate - use the Python executable directly:
```powershell
venv\Scripts\python.exe audit_cli.py scan --url https://yoursite.com
```

**Alternative - Change Execution Policy:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
venv\Scripts\Activate.ps1
```

### Problem: "Module not found" errors

**Solution:**
```bash
# Ensure virtual environment is activated (see (venv) in terminal)
# Reinstall dependencies
pip install -r requirements.txt
```

### Problem: UnicodeEncodeError on Windows

**Symptom:** `UnicodeEncodeError: 'charmap' codec can't encode character` when running audits

**Cause:** Windows PowerShell/CMD doesn't support Unicode characters used by the `rich` progress bars

**Solutions:**

**Option 1: Use Windows Terminal (Recommended)**
- Install [Windows Terminal](https://aka.ms/terminal) from Microsoft Store
- Supports full Unicode rendering
- Better overall terminal experience

**Option 2: Set encoding environment variable**
```powershell
$env:PYTHONIOENCODING="utf-8"
venv\Scripts\python.exe audit_cli.py scan --url https://yoursite.com --max-pages 5
```

**Option 3: Use Python library instead of CLI**
- See [example_usage.py](example_usage.py) for programmatic usage
- Avoids terminal rendering issues completely

**Note:** The tool still works despite the error - pages are crawled successfully. The error is cosmetic and only affects the progress display.

### Problem: Virtual environment not activating in VS Code

**Symptom:** Running `python --version` shows wrong Python (e.g., Anaconda instead of venv)

**Solutions:**

**Option 1: Use full path to venv Python**
```powershell
venv\Scripts\python.exe audit_cli.py scan --url https://yoursite.com
```

**Option 2: Reload VS Code window**
1. Press `Ctrl+Shift+P`
2. Type: `Developer: Reload Window`
3. Open new terminal - should auto-activate

**Option 3: Close and reopen folder**
- Close VS Code
- File → Open Folder
- Select `analytics-audit-engine` folder directly (not parent folder)

---

## Performance Optimization

### For Faster Audits

1. **Reduce page count:**
   ```bash
   # Windows
   venv\Scripts\python.exe audit_cli.py scan --url https://site.com --max-pages 10

   # Mac/Linux
   python audit_cli.py scan --url https://site.com --max-pages 10
   ```

2. **Target specific sections:**
   ```bash
   # Windows
   venv\Scripts\python.exe audit_cli.py scan --url https://site.com/blog --max-pages 15
   ```

### For More Accurate Audits

1. **Increase page count:**
   ```bash
   # Windows
   venv\Scripts\python.exe audit_cli.py scan --url https://site.com --max-pages 100

   # Mac/Linux
   python audit_cli.py scan --url https://site.com --max-pages 100
   ```

2. **Check all site sections:**
   - Homepage
   - Product/service pages
   - Blog
   - Contact page

3. **Re-audit quarterly:**
   Track implementation changes over time

---

## Workflow Example

### Complete Client Audit Workflow

**Goal:** Deliver comprehensive analytics audit

**Day 1: Initial Audit**

**Windows:**
```bash
# Run comprehensive audit
venv\Scripts\python.exe audit_cli.py scan --url https://clientsite.com --max-pages 50
```

**Mac/Linux:**
```bash
# Run comprehensive audit
python audit_cli.py scan --url https://clientsite.com --max-pages 50
```

The scan command automatically generates an HTML report in the `./reports/` directory.

**Day 2: Analysis**
- Review report
- Document findings
- Create fix recommendations
- Estimate implementation time

**Day 3: Present to Client**
- Share HTML report
- Explain critical issues
- Propose implementation plan
- Quote price

**Week 2: Implement Fixes**
- Install missing tools
- Fix broken implementations
- Add consent management

**Week 3: Re-Audit**

**Windows:**
```bash
# Verify fixes
venv\Scripts\python.exe audit_cli.py scan --url https://clientsite.com --max-pages 50

# View original audit
venv\Scripts\python.exe audit_cli.py view --audit-id 1

# View after fixes
venv\Scripts\python.exe audit_cli.py view --audit-id 2
```

**Mac/Linux:**
```bash
# Verify fixes
python audit_cli.py scan --url https://clientsite.com --max-pages 50

# View original audit
python audit_cli.py view --audit-id 1

# View after fixes
python audit_cli.py view --audit-id 2
```

**Deliverable:**
- Before: Score 45/100
- After: Score 92/100
- Value delivered: Proven improvement

---

## File Structure

```
analytics-audit-engine/
├── crawler/
│   └── page_crawler.py            # Website crawler
├── analyzer/
│   └── audit_analyzer.py          # Audit analyzer
├── reports/
│   ├── report_generator.py        # HTML/PDF generator
│   └── *.html                     # Generated reports
├── database/
│   └── models.py                  # Data models
├── audit_cli.py                   # Main CLI tool
├── init_db.py                     # Database setup
├── analytics_audit.db             # SQLite database
├── requirements.txt
└── SETUP_GUIDE.md                 # This file
```

---

## Success Checklist

- [ ] Virtual environment activated (`(venv)` shown)
- [ ] All dependencies installed
- [ ] Playwright browser installed
- [ ] Database initialized (`audit_engine.db` exists)
- [ ] Test audit completed successfully
- [ ] Report generated and opened in browser
- [ ] Audit score and findings visible

If all checked, you're ready to audit websites! ✅

---

## Next Steps

### 1. Customize Detection

Edit `crawler/page_crawler.py` to detect more tools:
- Add custom analytics platforms
- Detect consent management platforms
- Check for privacy compliance

### 2. Enhance Scoring

Edit `analyzer/audit_analyzer.py`:
- Adjust scoring weights
- Add custom rules
- Create industry-specific scores

### 3. Improve Reports

Edit `reports/report_generator.py`:
- Add company branding
- Include more charts
- Custom recommendations

### 4. Automate Delivery

- Schedule regular audits
- Email reports automatically
- Integrate with project management tools

---

## Pricing Guide

### Service Pricing

**Single Audit:** $500-$2,000
- Basic: $500 (10-20 pages)
- Standard: $1,000 (50 pages)
- Comprehensive: $2,000 (100+ pages)

**Monthly Monitoring:** $200-$1,000/month
- Automated monthly audits
- Change detection
- Email reports

**Implementation:** $100-$300/hour
- Fix detected issues
- Install tracking
- Configure tools

---

## Support

For issues:
1. Check [Troubleshooting](#troubleshooting)
2. Review [README.md](README.md) for overview
3. Check code comments in crawler/analyzer files

---

**Time to first audit: ~10 minutes**

Start auditing websites and helping businesses improve their analytics! 🎯
