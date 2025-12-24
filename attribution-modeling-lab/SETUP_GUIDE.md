# Complete Setup Guide - Attribution Modeling Lab

Step-by-step guide to set up and use the Attribution Modeling Lab.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Generate Sample Data](#generate-sample-data)
4. [Run Attribution Analysis](#run-attribution-analysis)
5. [View Results](#view-results)
6. [Launch Dashboard](#launch-dashboard)
7. [Understanding the Results](#understanding-the-results)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Python 3.11 or newer** - [Download](https://www.python.org/downloads/)
- **VS Code** (recommended) or any code editor

### System Requirements
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 500MB free space
- **OS**: Windows, macOS, or Linux

---

## Installation

### Step 1: Open VS Code

1. Open VS Code
2. Click **File** → **Open Folder**
3. Navigate to: `C:\Users\Justin\source\repos\attribution-modeling-lab`
4. Click **Select Folder**

### Step 2: Open Integrated Terminal

Press `` Ctrl + ` `` (backtick) or click **Terminal** → **New Terminal**

### Step 3: Create Virtual Environment

In the terminal, type:

```bash
python -m venv venv
```

Wait for it to complete (~30 seconds).

### Step 4: Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

✅ You should see `(venv)` at the start of your terminal line.

### Step 5: Select Python Interpreter

1. Press `Ctrl + Shift + P`
2. Type: `Python: Select Interpreter`
3. Choose the one with `(venv)` - looks like:
   ```
   Python 3.11.x ('venv': venv) .\venv\Scripts\python.exe
   ```

### Step 6: Install Packages

In the terminal:

```bash
pip install -r requirements.txt
```

This takes 2-3 minutes. You'll see packages installing.

✅ **Success** when you see: `Successfully installed...`

---

## Generate Sample Data

Now let's create realistic user journey data to analyze.

### Basic Generation

```bash
python attribution_cli.py generate
```

This creates 1,000 journeys with 15% conversion rate.

### Custom Generation

Want more data or different parameters?

```bash
# 5,000 journeys with 20% conversion rate
python attribution_cli.py generate --journeys 5000 --conversion-rate 0.20

# Longer journeys (average 6 touchpoints)
python attribution_cli.py generate --journeys 2000 --avg-length 6
```

### What Gets Generated

The generator creates:
- **User journeys** across 12 marketing channels
- **Touchpoints** with timestamps, costs, campaigns
- **Conversions** with revenue amounts
- **Realistic patterns** (email nurture, retargeting, etc.)

**Output Example:**
```
Generating 1,000 journeys...
  Target conversions: 150 (15.0%)
  Avg journey length: 4 touchpoints

✓ Generated 1,000 journeys
  Conversions: 150
  Total touchpoints: 4,287

Dataset Summary:
  Total Journeys:     1,000
  Conversions:        150 (15.0%)
  Total Revenue:      $24,850.00
  Total Cost:         $8,574.00
  ROI:                189.9%
```

**File Created:** `sample_journeys.pkl`

---

## Run Attribution Analysis

Now analyze the journeys with all 6 attribution models.

### Run Analysis

```bash
python attribution_cli.py analyze
```

This will:
1. Load your generated journeys
2. Train the data-driven ML model
3. Run all 6 attribution models
4. Save results for comparison

### What Happens

**Step 1: Training Data-Driven Model**
```
✓ Data-driven model trained on 1,000 journeys
  Channels analyzed: 12
  Conversion rate: 15.0%
```

The ML model learns which channels correlate with conversions.

**Step 2: Running All Models**
```
Running attribution models on 150 converting journeys...
  • Last-Touch...
  • First-Touch...
  • Linear...
  • Time-Decay...
  • Position-Based...
  • Data-Driven...
✓ All models complete
```

Each model calculates credit differently.

**File Created:** `attribution_results.pkl`

---

## View Results

Now explore the results with various CLI commands.

### 1. Overall Summary

```bash
python attribution_cli.py summary
```

Shows:
- Dataset statistics
- Journey characteristics
- Model agreement score

**Example Output:**
```
┌─────────────────────────────────────┐
│ Summary                             │
├─────────────────────────────────────┤
│ Dataset:                            │
│   Total Journeys:     1,000         │
│   Conversions:        150 (15.0%)   │
│   Total Revenue:      $24,850.00    │
│   Total Cost:         $8,574.00     │
│   ROI:                189.9%        │
│                                     │
│ Journey Characteristics:            │
│   Avg Touchpoints:    4.3           │
│   Avg Duration:       18.2 days     │
│   Avg Revenue:        $165.67       │
│                                     │
│ Attribution Models:                 │
│   Models Analyzed:    6             │
│   Model Agreement:    67%           │
└─────────────────────────────────────┘
```

### 2. Compare Models Side-by-Side

```bash
python attribution_cli.py compare
```

See how each model distributes revenue across channels.

**Example Table:**
```
┌────────────────────┬────────┬────────────┬─────────────┬────────┬────────────┬───────────┬─────────────┐
│ Channel            │ Cost   │ Last-Touch │ First-Touch │ Linear │ Time-Decay │ Position  │ Data-Driven │
├────────────────────┼────────┼────────────┼─────────────┼────────┼────────────┼───────────┼─────────────┤
│ Paid Search-Brand  │ $625   │ $11,234    │ $3,021      │ $5,447 │ $9,112     │ $7,285    │ $5,892      │
│ Display Ads        │ $210   │ $1,247     │ $6,892      │ $4,123 │ $2,034     │ $4,556    │ $6,234      │
│ Email              │ $43    │ $3,421     │ $1,235      │ $4,567 │ $3,789     │ $3,891    │ $4,123      │
│ Social - Paid      │ $384   │ $2,145     │ $3,892      │ $3,012 │ $2,567     │ $3,234    │ $3,456      │
└────────────────────┴────────┴────────────┴─────────────┴────────┴────────────┴───────────┴─────────────┘

Model Agreement Score: 67%
⚠ Moderate disagreement between models
```

### 3. View ROAS by Channel

```bash
python attribution_cli.py roas --model "Data-Driven"
```

See which channels have best return on investment.

**Example Output:**
```
┌──────┬─────────────────────┬───────────┬─────────┬────────┬─────────┬────────┐
│ Rank │ Channel             │ Revenue   │ Cost    │ ROAS   │ CPA     │ Status │
├──────┼─────────────────────┼───────────┼─────────┼────────┼─────────┼────────┤
│ 1    │ Email               │ $4,123    │ $43     │ 95.88x │ $8.60   │ 🟢     │
│ 2    │ Organic Search      │ $3,456    │ $0      │ ∞      │ $0.00   │ 🟢     │
│ 3    │ Display Ads         │ $6,234    │ $210    │ 29.69x │ $42.00  │ 🟢     │
│ 4    │ Paid Search - Brand │ $5,892    │ $625    │ 9.43x  │ $125.00 │ 🟢     │
└──────┴─────────────────────┴───────────┴─────────┴────────┴─────────┴────────┘

🟢 Excellent (3.0x+)  🟡 Good (1.5x+)  🔴 Needs Improvement
```

**Try different models:**
```bash
python attribution_cli.py roas --model "Last-Touch"
python attribution_cli.py roas --model "Linear"
```

### 4. Find Disagreements

```bash
python attribution_cli.py disagreements
```

Shows channels where models disagree most.

**Example:**
```
Channels with Biggest Attribution Variance

┌──────┬─────────────────┬──────────────┬─────────────────┬───────────┐
│ Rank │ Channel         │ Mean Revenue │ Min-Max Range   │ Variation │
├──────┼─────────────────┼──────────────┼─────────────────┼───────────┤
│ 1    │ Display Ads     │ $4,214       │ $1,247 - $6,892 │ 54%       │
│ 2    │ Social - Paid   │ $3,134       │ $2,145 - $3,892 │ 28%       │
└──────┴─────────────────┴──────────────┴─────────────────┴───────────┘

Top Disagreement: Display Ads

  Model               Attributed Revenue
  Last-Touch                  $1,247.00
  Position-Based              $4,556.00
  Data-Driven                 $6,234.00
  First-Touch                 $6,892.00
```

**Why this matters:** Big disagreements mean you need to investigate which model is right for your business.

### 5. Get Budget Recommendations

```bash
python attribution_cli.py recommendations
```

See where to reallocate marketing budget.

**Example:**
```
Budget Recommendations

Based on Last-Touch vs Data-Driven comparison:

┌─────────────────────────────────────────────┐
│ 1. Display Ads                              │
│                                             │
│ 📈 INCREASE Budget                          │
│                                             │
│ Attribution Comparison:                     │
│   Last-Touch:         $1,247.00             │
│   Data-Driven:        $6,234.00             │
│   Difference:       +$4,987.00 (+400%)      │
│                                             │
│ Current Performance:                        │
│   ROAS: 29.69x                              │
│                                             │
│ Reason:                                     │
│   Data-driven shows 400% more value than    │
│   last-touch                                │
└─────────────────────────────────────────────┘
```

### 6. Analyze Specific Journey

```bash
python attribution_cli.py journey
```

See how different models attribute a single customer journey.

**Example:**
```
Journey ID: abc-123-def
User: user_42
Path: Display Ads → Email → Paid Search - Brand
Touchpoints: 3
Duration: 14.2 days
Cost: $7.20
Revenue: $199.00
ROI: 2,664.6%

Attribution Comparison for This Journey

┌──────────────────┬─────────────┬───────┬──────────────────┐
│ Model            │ Display Ads │ Email │ Paid Search      │
├──────────────────┼─────────────┼───────┼──────────────────┤
│ Last-Touch       │ $0 (0%)     │ $0    │ $199.00 (100%)   │
│ First-Touch      │ $199 (100%) │ $0    │ $0.00 (0%)       │
│ Linear           │ $66 (33%)   │ $66   │ $66.33 (33%)     │
│ Time-Decay       │ $20 (10%)   │ $60   │ $119.00 (60%)    │
│ Position-Based   │ $80 (40%)   │ $40   │ $79.60 (40%)     │
│ Data-Driven      │ $75 (38%)   │ $55   │ $69.00 (35%)     │
└──────────────────┴─────────────┴───────┴──────────────────┘
```

---

## Launch Dashboard

For interactive visual exploration, launch the dashboard.

### Start Dashboard

```bash
python dashboard_app.py
```

### Open in Browser

1. Terminal will show: `Starting dashboard on http://localhost:8050`
2. Open your web browser
3. Go to: `http://localhost:8050`

### Dashboard Features

**1. KPI Cards (Top)**
- Total Revenue
- Conversions
- Average Journey Length
- Model Agreement Score

**2. Model Selector**
- Choose which models to compare
- Select multiple models at once

**3. Revenue Attribution Chart**
- Bar chart showing revenue by channel
- Grouped by model for easy comparison

**4. ROAS Chart**
- Color-coded ROAS by channel
- Red < 1.0 (losing money)
- Green > 3.0 (excellent)

**5. Model Agreement Heatmap**
- Shows which models agree/disagree
- Dark green = high agreement
- Light/red = disagreement

**6. Cost vs Revenue Scatter**
- Bubble chart showing ROI
- Above diagonal = profitable
- Below diagonal = losing money

**7. Journey Length Distribution**
- Histogram of touchpoint counts
- Shows typical customer journey complexity

**8. Budget Recommendations**
- Actionable recommendations
- Increase/decrease suggestions
- Based on model comparisons

### Navigate the Dashboard

- **Select Models**: Use dropdown to compare different models
- **Hover Charts**: Hover over charts for detailed values
- **Zoom**: Click and drag on charts to zoom
- **Reset**: Double-click chart to reset zoom

---

## Understanding the Results

### Model Agreement Score

**What it means:**

- **80-100%**: Models strongly agree
  - ✅ Any model will give similar insights
  - Safe to use simpler models (Last-Touch, Linear)

- **50-80%**: Moderate disagreement
  - ⚠️ Need to compare models carefully
  - Use Data-Driven or Time-Decay for accuracy

- **0-50%**: High disagreement
  - 🚨 Investigate why models differ
  - Different channels play different roles
  - Need sophisticated attribution

### ROAS Interpretation

**Return on Ad Spend (ROAS) = Revenue / Cost**

- **10.0x+**: Outstanding (every $1 spent returns $10)
- **3.0-10.0x**: Excellent
- **1.5-3.0x**: Good
- **1.0-1.5x**: Break-even range
- **<1.0x**: Losing money on this channel

### When to Use Which Model

**Last-Touch**
- ✅ Short sales cycles (e-commerce, direct response)
- ✅ Simple reporting for executives
- ❌ Undervalues awareness channels

**First-Touch**
- ✅ Brand awareness campaigns
- ✅ Understanding customer acquisition
- ❌ Ignores nurturing touchpoints

**Linear**
- ✅ All touchpoints equal importance
- ✅ Fair baseline for comparison
- ❌ Doesn't account for timing or position

**Time-Decay**
- ✅ Longer sales cycles (B2B, high-value)
- ✅ When recency matters
- ✅ Good balance of awareness and conversion

**Position-Based (U-Shaped)**
- ✅ Balances first-touch and last-touch
- ✅ Good for mid-length sales cycles
- ⚠️ Middle touches might be important too

**Data-Driven (Recommended)**
- ✅ Most accurate with sufficient data
- ✅ Learns actual impact of each channel
- ❌ Requires 100+ conversions
- ❌ Less explainable to non-technical stakeholders

---

## Troubleshooting

### Problem: "No data found. Run 'generate' first"

**Solution:**
```bash
python attribution_cli.py generate
```

You must generate data before analyzing.

---

### Problem: "Model not found"

**Solution:** Check available models:
```bash
python attribution_cli.py compare
```

Use exact names:
- `Last-Touch`
- `First-Touch`
- `Linear`
- `Time-Decay`
- `Position-Based`
- `Data-Driven`

---

### Problem: Dashboard shows "No data found"

**Solution:** Run analysis first:
```bash
python attribution_cli.py analyze
```

Dashboard needs `attribution_results.pkl` file.

---

### Problem: "ModuleNotFoundError: No module named 'plotly'"

**Solution:** Install requirements:
```bash
pip install -r requirements.txt
```

---

### Problem: Low model agreement (<50%)

**This is normal!** It means:
- Different channels play different roles
- Some channels (display, social) hard to attribute
- You should compare models to understand impact

**Action:** Use `python attribution_cli.py disagreements` to investigate.

---

### Problem: Virtual environment not activating (PowerShell)

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try activating again.

---

## Next Steps

### 1. Use Real Data

Replace sample generator with actual journey data from:
- Google Analytics 4 (User Explorer)
- Adobe Analytics
- Custom tracking system

### 2. Customize Models

Edit `models/attribution_models.py`:
- Adjust time-decay half-life
- Change position-based weights
- Add custom attribution logic

### 3. Export Reports

Add CSV/PDF export functionality:
```python
comparison_table.to_csv('attribution_report.csv')
```

### 4. Integrate with Analytics

Connect to your analytics platform:
- GA4 API for journey data
- BigQuery for large datasets
- Adobe Analytics integration

### 5. Automate Analysis

Schedule regular attribution analysis:
- Daily/weekly reports
- Automated budget recommendations
- Alert on significant changes

---

## File Structure

```
attribution-modeling-lab/
├── models/
│   ├── attribution_models.py      # 6 attribution models
│   └── comparison_engine.py       # Model comparison logic
├── data_generator/
│   └── journey_generator.py       # Sample data generator
├── database/
│   └── models.py                  # Data models
├── attribution_cli.py             # CLI interface
├── dashboard_app.py               # Plotly Dash dashboard
├── requirements.txt               # Python packages
├── README.md                      # Project overview
├── QUICKSTART.md                  # Quick start guide
└── SETUP_GUIDE.md                # This file
```

---

## Support

For issues or questions:
1. Check this guide's [Troubleshooting](#troubleshooting) section
2. Review [QUICKSTART.md](QUICKSTART.md) for quick reference
3. Check [README.md](README.md) for conceptual overview

---

**You're all set!** 🎉

Start analyzing attribution and optimize your marketing budget with data-driven insights.
