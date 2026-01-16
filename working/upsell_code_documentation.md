# Upsell Attribution Query Documentation

## What This Query Does

This SQL query analyzes Google Analytics 4 (GA4) data to answer one key question:

**"When a customer buys an upsell product, what was the 'parent' product that triggered that upsell?"**

For example, if a customer views a winter jacket and then adds matching gloves (shown as an upsell), this query connects those gloves back to the jacket that drove the sale.

---

## Why This Matters

Understanding which products drive upsell purchases helps you:
- Identify your best-performing parent products for upsells
- Optimize which upsell products to show with which parent products
- Calculate true revenue attribution (how much upsell revenue each parent product generates)
- Make better merchandising decisions

---

## How It Works (The Logic)

### Step 1: Gather the Data
The query pulls three types of events from the last 14 days:
- **Purchases** - When someone buys an upsell product
- **Product Views** - When someone views any product (potential parents)
- **Add to Cart** - When someone adds an upsell product to their cart

### Step 2: Clean the Data
Before matching, the query:
- **Removes duplicates** - If the same item appears multiple times in a session, keep only one
- **Filters out bad data** - Removes malformed product IDs (e.g., IDs with colons or invalid formats)
- **Extracts base product IDs** - Strips the color code (last 3 characters) so "Blue Jacket" and "Red Jacket" are recognized as the same product

### Step 3: Match Upsells to Parents (6 Strategies)

The query uses multiple strategies to find the parent product, ranked by confidence:

| Strategy | Confidence | Description |
|----------|------------|-------------|
| **1. Sequential Same Session** | 90% | User viewed a product, then immediately added the upsell in the same session. Most reliable. |
| **2. Item List Name Match** | 85% | The upsell's list name contains the parent product ID or name (e.g., "Upsell for Jacket XYZ"). |
| **3. Cross-Session Recency** | 70% | User viewed a product in a previous session, then came back and bought the upsell. |
| **4. Session Co-occurrence** | 60% | User viewed the parent product somewhere in the same session (fallback if Strategy 1 fails). |
| **5. User Frequency** | 50% | Based on the user's most-viewed product in the lookback period. |
| **6. Global Fallback** | 30% | Uses the most common parent for this upsell product across all customers. |

### Step 4: Pick the Best Match
If multiple strategies find a match, the query picks the one with the highest confidence score.

### Step 5: Output the Results
One row per upsell purchase, showing:
- The upsell product and its revenue
- The matched parent product
- Which strategy was used and its confidence score

---

## Key Rules & Filters

### Same-Product Exclusion
The query ensures the parent is truly a **different** product:
- Exact same item ID? **Excluded**
- Same base product, different color? **Excluded** (e.g., "Black Beanie" can't be the parent of "Pink Beanie")

### Data Quality
- **Malformed IDs filtered**: Only accepts product IDs that are alphanumeric and 10+ characters
- **Fully deduplicated**: Guarantees one output row per user/session/upsell item

---

## Configuration Options

At the top of the query, you can adjust:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `lookback_days` | 14 | How many days of data to analyze |
| `upsell_list_pattern` | `%UpSell%` | Pattern to identify upsell products (matches item_list_name) |
| `color_code_length` | 3 | Number of characters at the end of item_id that represent color/size |

---

## Output Columns

| Column | Description |
|--------|-------------|
| `event_date` | Date of the upsell purchase |
| `user_pseudo_id` | Anonymous user identifier |
| `session_id` | GA4 session identifier |
| `upsell_item_id` | Full product ID of the upsell item purchased |
| `upsell_base_product_id` | Base product ID (without color code) |
| `upsell_item_name` | Name of the upsell product |
| `upsell_revenue` | Revenue from this upsell purchase |
| `parent_item_id` | Full product ID of the matched parent |
| `parent_base_product_id` | Base product ID of the parent |
| `parent_item_name` | Name of the parent product |
| `match_strategy` | Which strategy found this match |
| `confidence_score` | Confidence level (30-90) |
| `parent_identified` | TRUE if a parent was found, FALSE otherwise |

---

## Diagnostic Queries

The file includes commented-out diagnostic queries you can run:

1. **Strategy Performance Summary** - See which strategies are finding the most matches
2. **Revenue by Parent Item** - See which parent products drive the most upsell revenue
3. **Data Quality Check** - Verify there are no duplicate rows or invalid matches

To use these, uncomment the relevant section at the bottom of the SQL file.

---

## Example Interpretation

```
upsell_item_name: Women's Montana Ski Mitts
upsell_revenue: $65
parent_item_name: Women's Freedom Insulated Pants
match_strategy: sequential_same_session
confidence_score: 90
```

**Translation**: A customer viewed the Freedom Insulated Pants, then added the Montana Ski Mitts (shown as an upsell) to their cart and purchased them. We're 90% confident this is the correct parent attribution.
