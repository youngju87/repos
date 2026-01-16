# Upsell Parent Attribution - Implementation Guide

## Overview
This solution increases parent item identification from ~50% to an expected **75-85%** using a multi-strategy waterfall matching approach.

---

## Quick Start

### 1. Update Configuration Parameters
Open `upsell_parent_attribution.sql` and update:

```sql
-- Line 3-4: Update with your GA4 BigQuery project and dataset
FROM `project.dataset.events_*`  -- Change to: `your-project.analytics_123456789.events_*`

-- Line 13: Adjust lookback window (default: 30 days)
DECLARE lookback_days INT64 DEFAULT 30;

-- Line 12: Update upsell identifier pattern
DECLARE upsell_list_pattern STRING DEFAULT '%UpSell%';  -- Matches "UpSellCompleteTheLook"
```

### 2. Run the Query
Execute the main query in BigQuery to get attributed upsell revenue by parent item.

### 3. Review Diagnostics
Uncomment the diagnostic queries at the bottom to see:
- Which matching strategies are performing best
- Overall identification rate
- Revenue attribution by parent item

---

## How It Works

### Strategy Waterfall (Prioritized)

The query tries 5 different matching strategies and selects the **highest confidence match**:

| Strategy | Description | Confidence | When It Works |
|----------|-------------|------------|---------------|
| **1. Sequential Same-Session** | Last view_item before add_to_cart in same session | 90 | User views vest PDP, adds beanie from upsell carousel → **vest = parent** |
| **2. Item List Name Match** | Extract parent ID from item_list_name field | 85 | item_list_name = "upsell_vest_pdp_123" → **vest = parent** |
| **3. Cross-Session Recency** | Most recent view_item within lookback window | 70 | User views vest Monday, returns Friday to buy beanie → **vest = parent** |
| **4. Session Co-Occurrence** | Viewed together in same session (any order) | 60 | User adds beanie, then browses vest PDP in same session → **vest = parent** |
| **5. User Frequency** | Most common parent viewed by this user with this upsell | 50 | User repeatedly views vest + beanie over time → **vest = parent** |

### Why This Improves Identification Rate

**Current approach (Strategy 1 only):** ~50% match rate
- ❌ Fails on cross-session journeys
- ❌ Fails when no view_item before add_to_cart
- ❌ Fails when upsell added without viewing parent

**New approach (All 5 strategies):** Expected 75-85% match rate
- ✅ Captures cross-session attribution (Strategy 3)
- ✅ Leverages item_list_name data (Strategy 2)
- ✅ Finds co-browsing patterns (Strategy 4)
- ✅ Uses historical user behavior (Strategy 5)
- ✅ Prioritizes high-confidence matches

---

## Expected Results

### Before (Current Approach)
```
Total Upsell Purchases: 1000
Parent Identified: 500 (50%)
Unmatched: 500 (50%)
```

### After (Multi-Strategy)
```
Total Upsell Purchases: 1000
Parent Identified: 750-850 (75-85%)
  - Sequential: 400 (40%)
  - Cross-Session: 200 (20%)
  - List Name: 100 (10%)
  - Co-Occurrence: 50 (5%)
Unmatched: 150-250 (15-25%)
```

---

## Configuration Options

### Lookback Window
```sql
DECLARE lookback_days INT64 DEFAULT 30;
```
- **Shorter (7-14 days):** Higher confidence matches, lower identification rate
- **Longer (30-60 days):** More matches, but may include stale user behavior
- **Recommended:** Start with 30 days, analyze diagnostics, adjust

### Upsell Pattern Matching
```sql
DECLARE upsell_list_pattern STRING DEFAULT '%UpSell%';
```
The query uses **case-insensitive matching** with `LOWER()`, so this pattern will match:
- `'UpSellCompleteTheLook'` ✅
- `'upsellcompletethelook'` ✅
- `'UPSELLCOMPLETETHELOOK'` ✅
- Any variation with "upsell" in it ✅

Update based on your `item_list_name` convention:
- `'%UpSell%'` - Matches "UpSellCompleteTheLook", "CrossSellItems", etc.
- `'%CompleteTheLook%'` - More specific match
- `'UpSell%'` - Only matches if starts with "UpSell"

### Item List Name Extraction (Strategy 2)
If your `item_list_name` follows a pattern like `"upsell_[parent_id]_pdp"`, you can improve Strategy 2:

```sql
-- Current (fuzzy matching):
AND LOWER(atc.item_list_name) LIKE CONCAT('%', LOWER(ve.viewed_item_id), '%')

-- Enhanced (exact extraction):
AND ve.viewed_item_id = REGEXP_EXTRACT(atc.item_list_name, r'upsell_([^_]+)_pdp')
```

### Purchase-to-Cart Time Window
```sql
-- Line 280-283: Assumes purchase happens within 30 min of add_to_cart
INTERVAL 30 MINUTE
```
Adjust based on your average checkout duration.

### Important Note on Timestamp Handling
GA4's `event_timestamp` is stored as INT64 (microseconds since epoch). The query properly converts between TIMESTAMP and INT64 types using:
- `TIMESTAMP_MICROS()` - Convert INT64 microseconds to TIMESTAMP
- `UNIX_MICROS()` - Convert TIMESTAMP back to INT64 microseconds

---

## Output Schema

### Main Query Output
```
event_date              STRING      Date of upsell purchase
user_pseudo_id          STRING      GA4 user identifier
session_id              INT64       GA4 session ID
upsell_item_id          STRING      The upsell product purchased
upsell_item_name        STRING      Upsell product name
upsell_revenue          FLOAT64     Revenue from upsell (price × quantity)
parent_item_id          STRING      Identified parent item (NULL if no match)
parent_item_name        STRING      Parent item name
match_strategy          STRING      Which strategy found the match
confidence_score        INT64       Confidence level (50-90)
parent_identified       BOOL        TRUE if parent found, FALSE otherwise
```

### Example Output
```
event_date    | upsell_item_id | upsell_revenue | parent_item_id | match_strategy          | confidence
2025-12-09    | beanie_001     | 25.00          | vest_123       | sequential_same_session | 90
2025-12-09    | beanie_001     | 25.00          | shoe_456       | cross_session_recency   | 70
2025-12-08    | beanie_001     | 25.00          | jacket_789     | item_list_name_match    | 85
2025-12-08    | gloves_002     | 15.00          | NULL           | NULL                    | NULL
```

---

## Diagnostic Queries

### Strategy Performance Summary
Uncomment lines 321-340 to see:
```
match_strategy              | matches_found | avg_confidence | total_revenue | pct_of_matches
sequential_same_session     | 450           | 90.0           | 11,250        | 56.3%
cross_session_recency       | 200           | 70.0           | 5,000         | 25.0%
item_list_name_match        | 100           | 85.0           | 2,500         | 12.5%
session_co_occurrence       | 50            | 60.0           | 1,250         | 6.2%
```

### Revenue by Parent Item
Uncomment lines 347-372 to see:
```
parent_item_id | parent_item_name | unique_upsells | total_revenue | avg_confidence
vest_123       | Winter Vest      | 5              | 2,450         | 82.5
shoe_456       | Running Shoes    | 3              | 1,890         | 75.0
jacket_789     | Rain Jacket      | 4              | 1,200         | 68.0
```

---

## Tradeoffs & Limitations

### ✅ Strengths
- **No data layer changes required** - works with existing GA4 data
- **Transparent attribution** - confidence scores show match quality
- **Flexible** - easy to add/remove strategies
- **Diagnostic-friendly** - can analyze which strategies work best for your data

### ⚠️ Limitations

#### 1. Cross-Device Journeys Not Captured
**Problem:** User views vest on mobile, purchases beanie on desktop
**Impact:** Missed attribution (unless using User-ID for cross-device tracking)
**Workaround:** If you have User-ID implemented, replace `user_pseudo_id` with `user_id`

#### 2. Indirect Influence Not Captured
**Problem:** User sees beanie upsell on vest PDP but doesn't add to cart until later via search
**Impact:** May attribute to wrong parent (most recent view_item)
**Mitigation:** Strategy 5 (user frequency) helps with repeat behavior patterns

#### 3. Lookback Window Tradeoff
**Short window (7 days):** More accurate, fewer matches
**Long window (90 days):** More matches, stale user intent
**Recommendation:** Test 14, 30, 60 days and compare match rate vs. confidence

#### 4. Assumes One Parent Per Upsell Purchase
**Problem:** User may have seen beanie on BOTH vest and shoe PDPs before purchasing
**Current behavior:** Attributes to highest confidence match (typically most recent)
**Alternative:** Could split revenue across multiple parents (requires fractional attribution)

---

## Advanced: Fractional Attribution

If you want to **split revenue across multiple parents**, modify the final SELECT:

```sql
-- Instead of best_matches (selects top 1), use all_candidate_matches:
WITH all_candidate_matches AS (
  SELECT
    user_pseudo_id,
    upsell_item_id,
    add_to_cart_timestamp,
    parent_item_id,
    parent_item_name,
    match_strategy,
    confidence_score,
    -- Weight by confidence score
    confidence_score / SUM(confidence_score) OVER (
      PARTITION BY user_pseudo_id, upsell_item_id, add_to_cart_timestamp
    ) AS attribution_weight
  FROM all_matches
  WHERE confidence_score >= 60  -- Only use medium+ confidence matches
)

-- Final output with fractional revenue
SELECT
  up.upsell_item_id,
  up.upsell_revenue,
  acm.parent_item_id,
  acm.attribution_weight,
  up.upsell_revenue * acm.attribution_weight AS attributed_revenue
FROM upsell_purchases up
INNER JOIN all_candidate_matches acm
  ON up.user_pseudo_id = acm.user_pseudo_id
  AND up.upsell_item_id = acm.upsell_item_id
```

**Example:**
- Beanie generates $120 revenue
- User viewed vest (confidence 90), shoe (confidence 70), jacket (confidence 60)
- Total confidence: 220
- Attribution: Vest $49.09, Shoe $38.18, Jacket $32.73

---

## Recommended Data Layer Improvements

While the SQL solution works with existing data, these changes would dramatically improve accuracy:

### 🔥 High Impact

#### 1. Add Parent Item ID to Upsell Events
**Implementation:** When user clicks upsell item, include parent item context

```javascript
// Current
dataLayer.push({
  event: 'add_to_cart',
  ecommerce: {
    items: [{
      item_id: 'beanie_001',
      item_name: 'Winter Beanie',
      item_list_name: 'upsell_carousel'
    }]
  }
});

// Enhanced
dataLayer.push({
  event: 'add_to_cart',
  ecommerce: {
    items: [{
      item_id: 'beanie_001',
      item_name: 'Winter Beanie',
      item_list_name: 'upsell_carousel',
      item_list_id: 'vest_123',  // ← ADD THIS: Parent item ID
      affiliation: 'pdp_upsell'   // ← ADD THIS: Source type
    }]
  }
});
```

**Impact:** Would give you **95%+ identification rate** with perfect accuracy

#### 2. Structured Item List Names
**Current:** `item_list_name: "upsell_carousel"`
**Enhanced:** `item_list_name: "upsell_vest_123_pdp"`

**Format:** `upsell_{parent_item_id}_{context}`

**Impact:** Dramatically improves Strategy 2 matching

### 💡 Medium Impact

#### 3. Track Upsell Impressions
```javascript
dataLayer.push({
  event: 'view_item_list',
  ecommerce: {
    item_list_id: 'vest_123_upsells',  // Parent context
    item_list_name: 'PDP Upsell Carousel',
    items: [
      { item_id: 'beanie_001', item_name: 'Winter Beanie' },
      { item_id: 'gloves_002', item_name: 'Winter Gloves' }
    ]
  }
});
```

**Impact:** Would enable impression-to-purchase attribution

#### 4. Custom Event Parameters
Add to `add_to_cart` events:
```javascript
event_params: {
  source_page_type: 'pdp',
  source_item_id: 'vest_123',  // The parent PDP
  interaction_type: 'upsell_carousel_click'
}
```

---

## Testing & Validation

### Step 1: Validate Match Rate
Run the main query and calculate:
```sql
SELECT
  COUNT(*) AS total_upsell_purchases,
  SUM(CASE WHEN parent_identified THEN 1 ELSE 0 END) AS matched,
  ROUND(100.0 * SUM(CASE WHEN parent_identified THEN 1 ELSE 0 END) / COUNT(*), 1) AS match_rate_pct
FROM (
  -- Main query here
)
```

**Target:** 75-85% match rate

### Step 2: Spot Check Accuracy
Manually verify a sample of matches:
1. Pick 20 random upsell purchases
2. Look at user journey in GA4 (User Explorer)
3. Verify the attributed parent makes sense
4. Calculate accuracy: `correct_matches / total_checked`

**Target:** >90% accuracy on matched records

### Step 3: Compare to Current Approach
Run side-by-side comparison:
```sql
WITH current_approach AS (
  -- Your existing query (strategy 1 only)
),
new_approach AS (
  -- This multi-strategy query
)
SELECT
  'Current' AS method,
  COUNT(*) AS matches,
  SUM(revenue) AS attributed_revenue
FROM current_approach
UNION ALL
SELECT
  'New' AS method,
  COUNT(*) AS matches,
  SUM(revenue) AS attributed_revenue
FROM new_approach
```

### Step 4: Monitor Strategy Distribution
Track which strategies are doing the heavy lifting:
- If Strategy 1 (sequential) is <30%, you may have data quality issues
- If Strategy 5 (frequency) is >30%, consider longer lookback window
- If Strategy 2 (list name) is 0%, implement structured item_list_name

---

## Troubleshooting

### Low Match Rate (<60%)

**Check:**
1. Is `upsell_list_pattern` correctly identifying upsell items?
   ```sql
   -- Check what item_list_name values exist in your data
   SELECT
     item_list_name,
     COUNT(*) AS occurrences,
     -- Test if pattern matches
     CASE
       WHEN LOWER(item_list_name) LIKE LOWER('%UpSell%') THEN 'MATCHES'
       ELSE 'NO MATCH'
     END AS pattern_match
   FROM `project.dataset.events_*`,
     UNNEST(items) AS items
   WHERE event_name IN ('purchase', 'add_to_cart')
     AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
     AND item_list_name IS NOT NULL
   GROUP BY item_list_name
   ORDER BY occurrences DESC
   LIMIT 100;
   ```

   Look for your upsell list names (like "UpSellCompleteTheLook") and verify the pattern_match column shows "MATCHES".

2. Are view_item events firing on PDPs?
   ```sql
   SELECT COUNT(*) AS view_item_count
   FROM `project.dataset.events_*`
   WHERE event_name = 'view_item'
   AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
   ```

3. Is the lookback window too short?
   - Try increasing to 60-90 days

### Strategy 2 (Item List Name) Returns Zero Matches

**Fix:** Your item_list_name doesn't contain parent item IDs. Either:
1. Update data layer to include parent ID in item_list_name
2. Remove Strategy 2 from the query (won't hurt match rate if not working)

### High Match Rate but Low Confidence Scores

**Check:** If avg_confidence < 70, you're relying heavily on lower-confidence strategies
**Action:** Implement recommended data layer improvements

### Query Performance Issues

**Optimizations:**
1. Add date range partition filter at the top of each CTE
2. Use clustered tables if running regularly
3. Materialize intermediate results (upsell_purchases, view_events) as tables
4. Add `LIMIT` to final query during testing

### Type Mismatch Errors (INT64 vs TIMESTAMP)

**Error:** `No matching signature for operator >= for argument types INT64, TIMESTAMP`

**Cause:** GA4's `event_timestamp` is INT64 (microseconds), but date functions return TIMESTAMP types.

**Fix:** Already handled in the query using `UNIX_MICROS()` to convert TIMESTAMP back to INT64:
```sql
-- Correct (used in query):
AND ve.event_timestamp >= UNIX_MICROS(TIMESTAMP_SUB(
  TIMESTAMP_MICROS(atc.add_to_cart_timestamp),
  INTERVAL lookback_days DAY
))

-- Incorrect (would cause error):
AND ve.event_timestamp >= TIMESTAMP_SUB(...)
```

---

## Next Steps

### Immediate (Test the Query)
1. Update configuration parameters in the SQL file
2. Run against last 7 days of data (small test)
3. Review diagnostics and match rate
4. Spot check 10-20 matches for accuracy

### Short Term (Optimize)
1. Adjust lookback window based on your customer journey length
2. Tune Strategy 2 if you have structured item_list_names
3. Set up scheduled query to run daily
4. Create dashboard with match rate trends

### Long Term (Improve Data Collection)
1. Implement parent_item_id in upsell add_to_cart events (95%+ match rate)
2. Add structured item_list_name format
3. Track upsell impressions (view_item_list)
4. Consider fractional attribution model

---

## Questions?

### How do I handle multiple item_list_name patterns?
Update the pattern to match all:
```sql
DECLARE upsell_list_pattern STRING DEFAULT '%upsell%|%recommended%|%you_may_like%';
-- Then use REGEXP_CONTAINS instead of LIKE
WHERE REGEXP_CONTAINS(items.item_list_name, upsell_list_pattern)
```

### Can I use this for other attribution problems?
Yes! The multi-strategy waterfall approach works for:
- Cross-sell attribution
- Promoted item attribution
- Email campaign attribution
- Influencer marketing attribution

### How do I export this to a visualization tool?
1. Save query results to a BigQuery table:
   ```sql
   CREATE OR REPLACE TABLE `project.dataset.upsell_attribution_daily`
   AS (
     -- Main query here
   )
   ```
2. Connect Looker/Tableau/Data Studio to that table
3. Build dashboards showing:
   - Match rate over time
   - Revenue by parent item
   - Strategy performance trends

---

## Support

For issues or questions:
- Review the diagnostic queries (lines 321-372)
- Check the troubleshooting section above
- Verify your GA4 data structure matches assumptions (view_item events, item_list_name field, etc.)
