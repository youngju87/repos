# Quick Start - SEO Content Gap Finder

Get your first content gap analysis in 15 minutes.

## Prerequisites

- Python 3.11+
- Docker Desktop (for database)

## Setup (10 minutes)

### 1. Install Dependencies

```bash
cd seo-content-gap-finder

# Create virtual environment
python -m venv venv

# Activate
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install packages
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_lg

# Install Playwright browsers
playwright install chromium
```

### 2. Start Database

```bash
docker-compose up -d
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env if needed (defaults work fine)
```

## Run Your First Analysis (5 minutes)

### Example 1: Simple Gap Analysis

```bash
python content_gap_cli.py analyze \
    --keyword "best project management software" \
    --depth 5
```

**What happens:**
1. Scrapes Google top 5 results
2. Extracts content from each URL
3. Analyzes topics and entities
4. Identifies gaps vs competitors
5. Generates gap report

**Output:**
```
Analyzing: best project management software
✓ Scraped 5 SERP results
✓ Extracted content from 5 URLs
✓ Found 23 topics across competitors

Content Gaps Found:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Gantt Chart Features (Score: 92/100)
   - Coverage: 5/5 competitors
   - Common in: H2 sections
   - Avg word count: 450 words

2. Team Collaboration (Score: 88/100)
   - Coverage: 4/5 competitors
   - Common in: Feature lists

3. Pricing Comparison (Score: 85/100)
   - Coverage: 5/5 competitors
   - Format: Tables/charts
```

### Example 2: Include Your URL

```bash
python content_gap_cli.py analyze \
    --keyword "email marketing tools" \
    --your-url "https://yoursite.com/email-guide" \
    --depth 10
```

Now it will compare YOUR content against competitors.

### Example 3: Generate Content Brief

```bash
python content_gap_cli.py brief \
    --keyword "content marketing strategy" \
    --output briefs/content-marketing.md
```

Creates a markdown file with:
- Recommended outline
- Topics to cover
- Target word count
- Competitor references

## View Results

### Terminal Output
Results print to terminal with Rich formatting.

### Database
All results stored in PostgreSQL:
```bash
# Access database
docker exec -it seo-content-db psql -U seouser -d content_gap
```

### Export Reports
```bash
python content_gap_cli.py export \
    --analysis-id <id> \
    --format json \
    --output report.json
```

## Understanding Results

### Gap Scores (0-100)

**90-100**: Critical gap
- All/most competitors cover this
- High search volume or engagement
- **Action**: Must add to your content

**70-89**: Important gap
- Many competitors cover
- Moderate importance
- **Action**: Should add

**50-69**: Minor gap
- Some competitors mention
- Lower priority
- **Action**: Consider adding

**<50**: Optional
- Few competitors cover
- Low impact
- **Action**: Skip or brief mention

### Gap Types

1. **Topic Gaps**: Entire sections missing
2. **Depth Gaps**: Topic covered but too brief
3. **Format Gaps**: Missing tables, images, videos
4. **Keyword Gaps**: Related terms not mentioned

## Common Commands

```bash
# Analyze single keyword
python content_gap_cli.py analyze --keyword "your keyword"

# Batch analysis from file
python content_gap_cli.py batch --keywords keywords.txt

# Generate brief
python content_gap_cli.py brief --keyword "your keyword"

# View past analysis
python content_gap_cli.py list

# Export results
python content_gap_cli.py export --analysis-id <id> --format markdown
```

## Tips for Best Results

### Keyword Selection
✅ Use long-tail keywords (3-5 words)
✅ Include year for timely content ("2024", "2025")
✅ Focus on informational intent
❌ Avoid navigational keywords ("facebook login")

### Analysis Depth
- `--depth 5`: Quick analysis (2-3 min)
- `--depth 10`: Standard (5-7 min)
- `--depth 20`: Comprehensive (10-15 min)

### Including Your URL
Always include `--your-url` to get:
- Specific gaps in YOUR content
- Coverage comparison
- Actionable recommendations

## Troubleshooting

### "No SERP results found"
- Check internet connection
- Try different keyword
- Google may be rate-limiting (wait 5 min)

### "Content extraction failed"
- Some sites block scrapers
- Results still show for successful URLs
- Try fewer URLs (`--depth 5`)

### Slow performance
- Normal for first run (model loading)
- Reduce depth for faster results
- Use `--cache` flag to reuse previous scrapes

## Next Steps

1. **Run 5-10 analyses** to understand the output
2. **Generate content briefs** for your target keywords
3. **Track results** - rerun monthly to see SERP changes
4. **Customize** - edit scoring logic in `analyzer/gap_analyzer.py`

---

**Time to first analysis: ~15 minutes**
**Time per keyword analysis: 3-7 minutes**

Ready to find your content gaps!
