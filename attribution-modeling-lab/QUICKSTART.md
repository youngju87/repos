# Quick Start - Attribution Modeling Lab

Get started with multi-touch attribution analysis in 10 minutes.

## Prerequisites

- Python 3.11+
- Virtual environment (recommended)

## Setup (5 minutes)

### 1. Navigate to Project

```bash
cd C:\Users\Justin\source\repos\attribution-modeling-lab
```

### 2. Create Virtual Environment

```bash
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

## Quick Start (5 minutes)

### Step 1: Generate Sample Data

```bash
python attribution_cli.py generate --journeys 1000 --conversion-rate 0.15
```

Output:
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

### Step 2: Run Attribution Analysis

```bash
python attribution_cli.py analyze
```

This will:
- Train the data-driven model
- Run all 6 attribution models
- Save results for comparison

Output:
```
Running Attribution Analysis

✓ Loaded 1,000 journeys

Training data-driven model...
✓ Data-driven model trained on 1,000 journeys
  Channels analyzed: 12
  Conversion rate: 15.0%

Running attribution models on 150 converting journeys...
  • Last-Touch...
  • First-Touch...
  • Linear...
  • Time-Decay...
  • Position-Based...
  • Data-Driven...
✓ All models complete
```

### Step 3: Compare Models

```bash
python attribution_cli.py compare
```

See side-by-side comparison of how each model attributes revenue:

```
┌─────────────────────────┬──────────┬─────────────┬─────────────┬────────┬─────────────┬──────────────┬──────────────┐
│ Channel                 │ Cost     │ Last-Touch  │ First-Touch │ Linear │ Time-Decay  │ Position-... │ Data-Driven  │
├─────────────────────────┼──────────┼─────────────┼─────────────┼────────┼─────────────┼──────────────┼──────────────┤
│ Paid Search - Brand     │ $625     │ $11,234     │ $3,021      │ $5,447 │ $9,112      │ $7,285       │ $5,892       │
│ Display Ads             │ $210     │ $1,247      │ $6,892      │ $4,123 │ $2,034      │ $4,556       │ $6,234       │
│ Email                   │ $43      │ $3,421      │ $1,235      │ $4,567 │ $3,789      │ $3,891       │ $4,123       │
│ ...                     │          │             │             │        │             │              │              │
└─────────────────────────┴──────────┴─────────────┴─────────────┴────────┴─────────────┴──────────────┴──────────────┘

Model Agreement Score: 67%
⚠ Moderate disagreement between models
```

### Step 4: View ROAS by Channel

```bash
python attribution_cli.py roas --model "Data-Driven"
```

See which channels have the best return on ad spend:

```
┌──────┬─────────────────────┬───────────┬─────────┬────────┬─────────┬────────┐
│ Rank │ Channel             │ Revenue   │ Cost    │ ROAS   │ CPA     │ Status │
├──────┼─────────────────────┼───────────┼─────────┼────────┼─────────┼────────┤
│ 1    │ Email               │ $4,123    │ $43     │ 95.88x │ $8.60   │ 🟢     │
│ 2    │ Organic Search      │ $3,456    │ $0      │ ∞      │ $0.00   │ 🟢     │
│ 3    │ Display Ads         │ $6,234    │ $210    │ 29.69x │ $42.00  │ 🟢     │
│ 4    │ Paid Search - Brand │ $5,892    │ $625    │ 9.43x  │ $125.00 │ 🟢     │
│ 5    │ Social - Paid       │ $2,145    │ $384    │ 5.59x  │ $76.80  │ 🟢     │
└──────┴─────────────────────┴───────────┴─────────┴────────┴─────────┴────────┘

🟢 Excellent (3.0x+)  🟡 Good (1.5x+)  🔴 Needs Improvement
```

### Step 5: Get Budget Recommendations

```bash
python attribution_cli.py recommendations
```

See where to reallocate budget:

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

## All Available Commands

### Data Generation

```bash
# Generate custom dataset
python attribution_cli.py generate --journeys 5000 --conversion-rate 0.20 --avg-length 5
```

### Analysis

```bash
# Run attribution analysis
python attribution_cli.py analyze

# View overall summary
python attribution_cli.py summary
```

### Comparisons

```bash
# Compare all models
python attribution_cli.py compare

# View ROAS for specific model
python attribution_cli.py roas --model "Linear"
python attribution_cli.py roas --model "Last-Touch"
```

### Insights

```bash
# Show biggest disagreements across models
python attribution_cli.py disagreements

# Get budget recommendations
python attribution_cli.py recommendations

# Analyze specific journey
python attribution_cli.py journey
python attribution_cli.py journey --journey-id abc123
```

## Understanding the Output

### Model Agreement Score

- **80-100%**: Models strongly agree - any model will give similar insights
- **50-80%**: Moderate disagreement - compare models carefully
- **0-50%**: High disagreement - investigate why models differ

### ROAS (Return on Ad Spend)

- **3.0x+**: Excellent - keep investing
- **1.5-3.0x**: Good - solid performer
- **1.0-1.5x**: Breaking even - needs optimization
- **<1.0x**: Losing money - reduce or cut budget

### Attribution Models Explained

**Last-Touch**: All credit to final touchpoint
- Use when: Short sales cycles, direct response

**First-Touch**: All credit to first touchpoint
- Use when: Measuring awareness campaigns

**Linear**: Equal credit to all touchpoints
- Use when: All touchpoints equally important

**Time-Decay**: More credit to recent touchpoints
- Use when: Recency matters, longer sales cycles

**Position-Based**: 40% first, 40% last, 20% middle
- Use when: Balancing awareness and conversion

**Data-Driven**: ML-based credit allocation
- Use when: Large dataset, complex journeys, most accurate

## Sample Workflow

### Typical Analysis Flow

```bash
# 1. Generate data
python attribution_cli.py generate --journeys 2000

# 2. Run analysis
python attribution_cli.py analyze

# 3. View summary
python attribution_cli.py summary

# 4. Compare models
python attribution_cli.py compare

# 5. Check disagreements
python attribution_cli.py disagreements

# 6. Get recommendations
python attribution_cli.py recommendations

# 7. View ROAS
python attribution_cli.py roas --model "Data-Driven"
```

## Real-World Use Cases

### Use Case 1: Evaluate Display Advertising

**Question**: Is our display advertising working?

```bash
python attribution_cli.py roas --model "Data-Driven"
```

Look for "Display Ads" in the table:
- High ROAS in data-driven but low in last-touch → Keep display (it's working for awareness)
- Low ROAS across all models → Cut display budget

### Use Case 2: Optimize Email Marketing

**Question**: Should we invest more in email?

```bash
python attribution_cli.py recommendations
```

If email shows up with "INCREASE" → Invest more
If email shows "DECREASE" → Reduce spend

### Use Case 3: Justify Budget Decisions

**Question**: Prove to management that our attribution is correct

```bash
python attribution_cli.py compare
python attribution_cli.py disagreements
```

Show:
- Where models agree (reliable conclusions)
- Where models disagree (need more investigation)
- Data-driven vs last-touch differences

## Next Steps

1. **Use Real Data**: Replace sample generator with actual journey data
2. **Customize Models**: Adjust time-decay half-life, position-based weights
3. **Export Reports**: Save results to CSV/PDF
4. **Build Dashboard**: Create interactive Plotly dashboard
5. **Integrate with Analytics**: Connect to GA4, Adobe Analytics, etc.

## Troubleshooting

### "No data found. Run 'generate' first"

You need to generate data before running analysis:
```bash
python attribution_cli.py generate
```

### "Model not found"

Check available models with:
```bash
python attribution_cli.py compare
```

Use exact model name: "Last-Touch", "First-Touch", "Linear", "Time-Decay", "Position-Based", "Data-Driven"

### Low model agreement

This is normal! It means:
- Different models have different assumptions
- Some channels are harder to attribute (like display awareness)
- You should investigate the disagreements

---

**Time to first insights: ~10 minutes**

Start analyzing your attribution now!
