# Quick Start - All Projects

Fast setup instructions for all 5 portfolio projects. Copy/paste commands to get each running.

---

## 1️⃣ Price Intelligence System

**What:** Competitive pricing tracker with warehouse & dashboard

```bash
cd price-intelligence-system

# Setup
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Start infrastructure
docker-compose up -d

# Initialize
python scripts/init_db.py
python scripts/load_sample_data.py

# Run dashboard
python dashboard/app.py
# Open: http://localhost:8050
```

**Time:** 10 minutes | **Guide:** [SETUP.md](price-intelligence-system/SETUP.md)

---

## 2️⃣ Analytics Audit Engine

**What:** Automated GA4/GTM compliance auditor

```bash
cd analytics-audit-engine

# Setup
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
playwright install chromium

# Initialize
python scripts/init_db.py

# Run audit
python audit_cli.py crawl https://demo.playwright.dev/todomvc --max-pages 5

# Generate report
python audit_cli.py report 1
# Open: reports/audit_1_report.html
```

**Time:** 10 minutes | **Guide:** [SETUP_GUIDE.md](analytics-audit-engine/SETUP_GUIDE.md)

---

## 3️⃣ SEO Content Gap Finder

**What:** NLP-powered content gap analyzer

```bash
cd seo-content-gap-finder

# Setup
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python -m spacy download en_core_web_sm
playwright install chromium

# Run analysis
python gap_finder_cli.py analyze "python web scraping" --max-results 5

# View gaps
python gap_finder_cli.py show-gaps results/python-web-scraping-gaps.json
```

**Time:** 12 minutes | **Guide:** [SETUP_GUIDE.md](seo-content-gap-finder/SETUP_GUIDE.md)

---

## 4️⃣ Server Log Analytics

**What:** ClickHouse-based log warehouse with security scanning

```bash
cd server-log-analytics

# Setup
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Start ClickHouse
docker-compose up -d

# Initialize
python scripts/init_db.py

# Generate & ingest sample data
python sample_data/generate_sample_logs.py
python ingest_logs.py --file sample_data/nginx_access.log --format nginx

# Run queries
python analytics_cli.py traffic-summary --days 7
python analytics_cli.py top-pages --days 7

# Start dashboard
python dashboard/app.py
# Open: http://localhost:8050
```

**Time:** 15 minutes | **Guide:** [SETUP_GUIDE.md](server-log-analytics/SETUP_GUIDE.md)

---

## 5️⃣ Attribution Modeling Lab

**What:** Multi-touch attribution comparison (6 models)

```bash
cd attribution-modeling-lab

# Setup
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Generate sample journeys
python attribution_cli.py generate --journeys 1000

# Run attribution analysis
python attribution_cli.py analyze

# View results
python attribution_cli.py compare
python attribution_cli.py roas --model "Data-Driven"
python attribution_cli.py recommendations

# Start dashboard
python dashboard_app.py
# Open: http://localhost:8050
```

**Time:** 10 minutes | **Guide:** [QUICKSTART.md](attribution-modeling-lab/QUICKSTART.md)

---

## 🔧 Prerequisites for All

Install these once for all projects:

1. **Python 3.11+**
   ```bash
   python --version  # Verify
   ```

2. **Docker Desktop** (for projects 1 & 4)
   ```bash
   docker --version  # Verify
   ```

3. **VS Code** (recommended)
   - Install Python extension
   - Install Pylance extension

---

## ⚡ VS Code Workflow (All Projects)

**Standard setup for any project:**

```bash
# 1. Open folder in VS Code
# File → Open Folder → Select project

# 2. Open terminal
# Press Ctrl + `

# 3. Create venv
python -m venv venv

# 4. Activate
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# 5. Select interpreter
# Ctrl+Shift+P → "Python: Select Interpreter" → Choose (venv)

# 6. Install deps
pip install -r requirements.txt

# 7. Run project-specific commands (see above)
```

---

## 🎯 Quick Commands Cheat Sheet

### Price Intelligence
```bash
docker-compose up -d              # Start
python dashboard/app.py           # Dashboard
docker-compose down              # Stop
```

### Analytics Audit
```bash
python audit_cli.py crawl <URL>        # Audit site
python audit_cli.py report <ID>        # Generate report
python audit_cli.py list               # List audits
```

### SEO Gap Finder
```bash
python gap_finder_cli.py analyze "<keyword>"     # Find gaps
python gap_finder_cli.py show-gaps <file>        # View results
```

### Server Log Analytics
```bash
python ingest_logs.py --file <file> --format nginx   # Ingest
python analytics_cli.py traffic-summary               # Stats
python dashboard/app.py                              # Dashboard
```

### Attribution Modeling
```bash
python attribution_cli.py generate        # Create data
python attribution_cli.py analyze         # Run models
python attribution_cli.py compare         # Compare
python dashboard_app.py                   # Dashboard
```

---

## 🐛 Common Issues (All Projects)

### "Python not recognized"
**Fix:** Add Python to PATH during installation

### "Module not found"
**Fix:**
```bash
# Ensure venv is activated (see (venv) in terminal)
pip install -r requirements.txt
```

### "Port already in use"
**Fix:** Change port in code or stop other services
```bash
# Find what's using port (Windows)
netstat -ano | findstr :8050
```

### "Permission denied" activating venv (PowerShell)
**Fix:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Docker won't start
**Fix:** Ensure Docker Desktop is running

---

## ✅ Success Checklist (Per Project)

- [ ] Virtual environment activated
- [ ] Dependencies installed (`pip list` shows packages)
- [ ] Project-specific tools installed (Playwright, Docker, etc.)
- [ ] Database/data initialized
- [ ] Sample data loaded (if applicable)
- [ ] Dashboard/CLI runs without errors
- [ ] Can view results

---

## 📊 Project Comparison

| Project | Setup Time | Complexity | Best For |
|---------|-----------|------------|----------|
| Attribution Lab | 10 min | Medium | Marketing analytics |
| Analytics Audit | 10 min | Low | Web analytics |
| Price Intelligence | 10 min | Medium | E-commerce |
| SEO Gap Finder | 12 min | Low | Content marketing |
| Log Analytics | 15 min | High | DevOps/Security |

---

## 🎓 Recommended Learning Order

**Beginner Path:**
1. Analytics Audit Engine (easiest)
2. SEO Gap Finder
3. Attribution Modeling Lab
4. Price Intelligence System
5. Server Log Analytics (most complex)

**Data Engineering Path:**
1. Price Intelligence (warehouse design)
2. Server Log Analytics (columnar DB)
3. Attribution Modeling (data processing)
4. Analytics Audit (web automation)
5. SEO Gap Finder (NLP)

---

## 🚀 Next Actions

After setup, try:

1. **Customize sample data** to your industry
2. **Modify dashboards** with your branding
3. **Add new features** specific to your use case
4. **Deploy to cloud** for public demos
5. **Create case studies** for portfolio

---

## 📞 Getting Help

Each project has:
- **README.md** - Overview & architecture
- **SETUP_GUIDE.md** - Detailed setup
- **Code comments** - Implementation details

**Stuck?** Check the setup guide for your project - includes troubleshooting section.

---

**Total setup time for all 5 projects: ~60 minutes**

**You'll have 5 production-ready data apps running locally!** 🎉
