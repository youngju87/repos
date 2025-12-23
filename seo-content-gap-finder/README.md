# SEO Content Gap Finder with NLP

An AI-powered content strategy tool that analyzes search engine results, identifies content gaps using natural language processing, and generates data-driven content briefs.

## The Problem It Solves

Content teams waste countless hours:
- **Manually analyzing competitor content** across 100+ URLs
- **Guessing what topics to cover** without data
- **Missing content opportunities** that competitors dominate
- **Creating content that doesn't rank** due to gaps in coverage

This tool automates competitive content analysis and surfaces exactly what to write about.

## What It Does

### 1. SERP Analysis
- Scrapes Google search results for target keywords
- Extracts top 10-20 ranking pages
- Analyzes content from competing URLs
- Tracks SERP features (featured snippets, PAA, etc.)

### 2. Content Extraction & Processing
- Extracts headings (H1, H2, H3)
- Analyzes word count and content depth
- Identifies key topics and entities
- Measures content freshness

### 3. NLP Topic Analysis
- **Topic Clustering**: Groups similar content themes using BERT embeddings
- **Entity Extraction**: Identifies people, places, products mentioned
- **Semantic Analysis**: Understands content meaning beyond keywords
- **Topic Modeling**: Discovers hidden themes with LDA

### 4. Gap Identification
- **Coverage Gaps**: Topics competitors cover but you don't
- **Depth Gaps**: Areas where competitors have more comprehensive content
- **Keyword Gaps**: Search terms you're missing
- **Format Gaps**: Content types you should create (videos, infographics, etc.)

### 5. Opportunity Scoring
Ranks content opportunities by:
- **Search volume**: How many people search for this
- **Keyword difficulty**: How hard to rank
- **Gap size**: How far behind you are
- **Business relevance**: Alignment with your goals

### 6. Automated Content Briefs
Generates outlines including:
- Recommended headings structure
- Key topics to cover
- Target word count
- Competing URLs to reference
- Related keywords to include

## Architecture

```
┌─────────────────┐
│  Keyword Input  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│  SERP Scraper   │────▶│ Google SERP  │
│  (SerpAPI/      │     │ HTML Parser  │
│   Playwright)   │     └──────┬───────┘
└────────┬────────┘            │
         │              ┌──────▼───────┐
         │              │  Content     │
         │              │  Extractor   │
         │              └──────┬───────┘
         │                     │
         ▼                     ▼
┌─────────────────────────────────┐
│      PostgreSQL Database        │
│  (Keywords, URLs, Content)      │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│  NLP Pipeline   │────▶│ BERT         │
│  - spaCy NER    │     │ Embeddings   │
│  - Topic Model  │     │ Clustering   │
└────────┬────────┘     └──────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│  Gap Analysis   │────▶│ Opportunity  │
│  Engine         │     │ Scoring      │
└────────┬────────┘     └──────┬───────┘
         │                     │
         ▼                     ▼
┌─────────────────────────────────┐
│      Visualization              │
│  - Topic Map (D3.js/Plotly)    │
│  - Gap Matrix                   │
│  - Content Briefs               │
└─────────────────────────────────┘
```

## Tech Stack

- **SERP Scraping**: SerpAPI (paid) or Playwright (free)
- **Content Extraction**: BeautifulSoup, Newspaper3k, Trafilatura
- **NLP**: spaCy, sentence-transformers (BERT), scikit-learn
- **Database**: PostgreSQL (content storage), Vector DB (Pinecone/Qdrant)
- **Analysis**: pandas, numpy, networkx
- **Visualization**: Plotly, D3.js, Next.js (web app)
- **Brief Generation**: OpenAI GPT-4 (optional), Jinja2 templates

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt
python -m spacy download en_core_web_lg

# Start database
docker-compose up -d

# Run analysis
python content_gap.py analyze --keyword "project management software" --depth 10

# Generate visualizations
python content_gap.py visualize --analysis-id <id>

# Create content brief
python content_gap.py brief --keyword "project management software"

# Start web dashboard
python dashboard/app.py
```

## Usage Examples

### 1. Analyze Single Keyword

```bash
python content_gap.py analyze \
    --keyword "best crm software 2024" \
    --your-url "https://yoursite.com/crm-guide" \
    --competitors 10
```

**Output:**
```
Analyzing: best crm software 2024
✓ Scraped 10 SERP results
✓ Extracted content from 10 URLs
✓ Identified 47 topics
✓ Found 23 content gaps

Top Gaps:
1. CRM Integration Capabilities (92/100 score)
   - 8/10 competitors cover this
   - You: Not mentioned
   - Recommended: Add 500-word section

2. Pricing Comparison Table (88/100 score)
   - 7/10 competitors have this
   - Format gap: Interactive comparison
```

### 2. Batch Analysis

```bash
python content_gap.py batch --keywords keywords.txt --output reports/
```

### 3. Topic Clustering

```bash
python content_gap.py cluster \
    --keyword "content marketing" \
    --visualize \
    --output topic_map.html
```

Creates interactive topic visualization showing content themes.

### 4. Generate Content Brief

```bash
python content_gap.py brief \
    --keyword "email marketing automation" \
    --format markdown \
    --output briefs/email-marketing.md
```

**Output**: `briefs/email-marketing.md`
```markdown
# Content Brief: Email Marketing Automation

## Target Keyword
- Primary: email marketing automation
- Search Volume: 14,800/mo
- Difficulty: 67/100
- Ranking Opportunity: High

## Recommended Structure

### H1: Complete Guide to Email Marketing Automation (2024)

### H2: What is Email Marketing Automation?
- Define automation
- Key benefits
- Use cases

### H2: Top Email Automation Platforms
- Platform comparison table
- Feature breakdown
- Pricing analysis

### H2: Email Automation Workflows
- Welcome series
- Abandoned cart
- Re-engagement campaigns

[... full outline ...]

## Target Metrics
- Word count: 3,200-3,800 words
- Images: 8-10 (including comparison table)
- External links: 5-7
- Internal links: 8-12

## Topics to Cover (from competitor analysis)
1. Trigger-based emails (10/10 competitors)
2. Segmentation strategies (9/10 competitors)
3. A/B testing automation (7/10 competitors)
...
```

## Data Model

### Keywords Table
- keyword_id, keyword_text, search_volume, difficulty
- serp_last_updated, analysis_status

### SERP Results Table
- result_id, keyword_id, url, position, title
- meta_description, has_featured_snippet

### Content Table
- content_id, url, scraped_at
- full_text, word_count, headings_json
- entities_json, topics_json

### Topics Table
- topic_id, topic_name, topic_cluster
- embedding_vector (for semantic search)

### Gaps Table
- gap_id, keyword_id, gap_type, description
- severity, opportunity_score

## Features

### Current (MVP)
- [x] SERP scraping (Playwright fallback)
- [x] Content extraction
- [x] Basic NLP (spaCy entities)
- [x] Gap identification
- [x] Simple scoring
- [ ] Topic clustering (BERT)
- [ ] Visualization dashboard
- [ ] Content brief generation

### Planned (V1.1)
- [ ] SerpAPI integration (faster, more reliable)
- [ ] Advanced topic modeling (LDA, NMF)
- [ ] Competitor tracking over time
- [ ] GPT-4 content brief generation
- [ ] Chrome extension for on-page analysis

### Advanced (V2.0)
- [ ] Multi-language support
- [ ] Video content analysis (YouTube)
- [ ] Social media content gaps
- [ ] Automated content outline generation
- [ ] ROI prediction for content

## Use Cases

### 1. Content Strategist
"I need to know what content to create for Q1"

→ Run batch analysis on 50 target keywords
→ Get prioritized list of content opportunities
→ Generate briefs for top 10

### 2. SEO Agency
"Client wants to rank for 'project management tools'"

→ Analyze SERP
→ Identify what competitors cover
→ Create data-driven content brief
→ Show client the gaps visually

### 3. In-House Content Team
"We published 50 articles but traffic isn't growing"

→ Analyze existing content vs SERPs
→ Find gaps in our coverage
→ Update old content with missing topics

### 4. Affiliate Marketer
"Which product comparison should I create?"

→ Analyze multiple product keywords
→ Find lowest competition gaps
→ Target opportunities with high volume + low competition

## Sample Output

### Gap Analysis Report

```
Content Gap Analysis: "project management software"

Your URL: yoursite.com/project-management-guide
Analyzed: 10 competitor URLs

COVERAGE SCORE: 62/100 (Below Average)

Critical Gaps (High Impact):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Gantt Chart Features (Score: 95/100)
   Coverage: 9/10 competitors | You: ✗
   Impact: HIGH - Core feature for PM tools
   Action: Add 600-word section on Gantt charts

2. Team Collaboration Features (Score: 89/100)
   Coverage: 8/10 competitors | You: ✗
   Impact: HIGH - Key decision factor
   Action: Create comparison table

3. Pricing Tiers Comparison (Score: 87/100)
   Coverage: 10/10 competitors | You: Partial
   Impact: MEDIUM - Update existing section
   Action: Expand pricing analysis

Topics You Cover Well:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Project templates (10/10 quality score)
✓ Time tracking (9/10 quality score)

Depth Gaps:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Integration capabilities
  Your coverage: 200 words | Avg competitor: 650 words
  Gap: 450 words needed

Keyword Gaps:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- "resource allocation" (Vol: 2,400/mo) - 0 mentions
- "workload management" (Vol: 1,900/mo) - 1 mention
- "project dependencies" (Vol: 1,200/mo) - 0 mentions
```

### Topic Map Visualization

Interactive D3.js visualization showing:
- Circles = Topics (size = importance)
- Colors = Topic clusters
- Connections = Related topics
- Your coverage highlighted vs competitors

## Performance

- **SERP Scraping**: ~10 results in 15-30 seconds
- **Content Extraction**: ~10 URLs in 45-60 seconds
- **NLP Analysis**: ~10 pages in 2-3 minutes
- **Report Generation**: <5 seconds

**Scalability**: Can analyze 100+ keywords overnight

## Competitive Advantage

**vs MarketMuse** ($thousands/month):
- ✅ Free and open source
- ✅ Transparent methodology
- ✅ Customizable scoring
- ❌ Less training data (for now)

**vs Clearscope/Surfer SEO**:
- ✅ Gap-focused (not just optimization)
- ✅ Visual topic maps
- ✅ Competitor tracking
- ❌ No real-time editing UI (yet)

**vs Manual Analysis**:
- ✅ 100x faster
- ✅ Data-driven, not subjective
- ✅ Scalable to 100s of keywords
- ✅ Repeatable process

## Why This Is Portfolio Gold

1. **Hot Skills**: NLP, BERT embeddings, semantic search
2. **Business Value**: Content teams pay $500-$2k/month for tools like this
3. **Modern Stack**: Python ML libraries, vector databases, interactive viz
4. **Clear Output**: Non-technical stakeholders understand gap reports
5. **Extensible**: Clear path to AI content generation

## Roadmap

**Week 1-2**: Core scraping and gap detection
**Week 3-4**: NLP and topic clustering
**Week 5-6**: Visualization dashboard
**Week 7-8**: Content brief generator with GPT-4

## Legal & Ethical

- Respects robots.txt
- Rate-limited scraping
- For competitive research (fair use)
- Caches results to minimize re-scraping
- Attribution to sources in reports

## License

MIT

## Author

Built by [Your Name] to demonstrate NLP, web scraping, and content strategy expertise.

**Portfolio**: [your-site]
**LinkedIn**: [your-linkedin]

---

This tool has analyzed **[X]** keywords, identified **[Y]** content gaps, and helped create **[Z]** data-driven content briefs.
