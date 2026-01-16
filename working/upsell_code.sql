-- CONFIGURATION PARAMETERS
DECLARE lookback_days INT64 DEFAULT 14;
DECLARE upsell_list_pattern STRING DEFAULT '%UpSell%';
DECLARE color_code_length INT64 DEFAULT 3;  -- Last 3 characters are color codes

-- 1: SINGLE TABLE SCAN - Extract all relevant events at once
-- Filter out malformed item_ids (must match pattern: alphanumeric, 10+ chars, no colons)
WITH base_events AS (
  SELECT
    user_pseudo_id,
    event_name,
    event_timestamp,
    event_date,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
    items.item_id,
    -- Extract base product ID (without color code)
    SUBSTR(items.item_id, 1, LENGTH(items.item_id) - color_code_length) AS base_product_id,
    items.item_name,
    items.price,
    items.quantity,
    items.item_list_name,
    LOWER(items.item_list_name) LIKE LOWER(upsell_list_pattern) AS is_upsell_item
  FROM
    `nora-tnf-232219.analytics_254456401.events_*`,
    UNNEST(items) AS items
  WHERE
    _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL lookback_days DAY))
                      AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
    AND event_name IN ('purchase', 'view_item', 'add_to_cart')
    -- Filter out malformed item_ids
    AND REGEXP_CONTAINS(items.item_id, r'^[A-Za-z0-9]{10,}$')
),

-- 2: UPSELL PURCHASES (deduplicated at user/session/item level)
upsell_purchases_raw AS (
  SELECT
    user_pseudo_id,
    event_timestamp,
    event_date,
    session_id,
    item_id AS upsell_item_id,
    base_product_id AS upsell_base_product_id,
    item_name AS upsell_item_name,
    price AS upsell_price,
    quantity AS upsell_quantity,
    item_list_name,
    (price * quantity) AS upsell_revenue,
    -- Deduplicate: keep one row per user/session/item combination
    ROW_NUMBER() OVER (
      PARTITION BY user_pseudo_id, session_id, item_id
      ORDER BY event_timestamp DESC
    ) AS dedup_rn
  FROM base_events
  WHERE event_name = 'purchase'
    AND is_upsell_item = TRUE
),

upsell_purchases AS (
  SELECT
    user_pseudo_id,
    event_timestamp,
    event_date,
    session_id,
    upsell_item_id,
    upsell_base_product_id,
    upsell_item_name,
    upsell_price,
    upsell_quantity,
    item_list_name,
    upsell_revenue
  FROM upsell_purchases_raw
  WHERE dedup_rn = 1
),

-- 3: VIEW_ITEM EVENTS (POTENTIAL PARENTS) - deduplicated
view_events AS (
  SELECT
    user_pseudo_id,
    event_timestamp,
    event_date,
    session_id,
    viewed_item_id,
    viewed_base_product_id,
    viewed_item_name
  FROM (
    SELECT
      user_pseudo_id,
      event_timestamp,
      event_date,
      session_id,
      item_id AS viewed_item_id,
      SUBSTR(item_id, 1, LENGTH(item_id) - color_code_length) AS viewed_base_product_id,
      item_name AS viewed_item_name,
      -- Keep only one view per user/session/item (most recent)
      ROW_NUMBER() OVER (
        PARTITION BY user_pseudo_id, session_id, item_id
        ORDER BY event_timestamp DESC
      ) AS dedup_rn
    FROM base_events
    WHERE event_name = 'view_item'
  )
  WHERE dedup_rn = 1
),

-- 4: ADD_TO_CART EVENTS FOR UPSELLS (deduplicated at user/session/item level)
upsell_add_to_cart AS (
  SELECT
    user_pseudo_id,
    add_to_cart_timestamp,
    event_date,
    session_id,
    upsell_item_id,
    upsell_base_product_id,
    upsell_item_name,
    item_list_name
  FROM (
    SELECT
      user_pseudo_id,
      event_timestamp AS add_to_cart_timestamp,
      event_date,
      session_id,
      item_id AS upsell_item_id,
      SUBSTR(item_id, 1, LENGTH(item_id) - color_code_length) AS upsell_base_product_id,
      item_name AS upsell_item_name,
      item_list_name,
      -- Deduplicate: keep one add_to_cart per user/session/item (earliest)
      ROW_NUMBER() OVER (
        PARTITION BY user_pseudo_id, session_id, item_id
        ORDER BY event_timestamp ASC
      ) AS dedup_rn
    FROM base_events
    WHERE event_name = 'add_to_cart'
      AND is_upsell_item = TRUE
  )
  WHERE dedup_rn = 1
),

-- STRATEGY 1: SAME-SESSION SEQUENTIAL (Last view_item before add_to_cart)
-- Highest confidence: user viewed parent, then added upsell in same session
strategy_1_sequential AS (
  SELECT
    atc.user_pseudo_id,
    atc.session_id AS atc_session_id,
    atc.upsell_item_id,
    atc.upsell_base_product_id,
    atc.add_to_cart_timestamp,
    ve.viewed_item_id AS parent_item_id,
    ve.viewed_base_product_id AS parent_base_product_id,
    ve.viewed_item_name AS parent_item_name,
    'sequential_same_session' AS match_strategy,
    90 AS confidence_score,
    ROW_NUMBER() OVER (
      PARTITION BY atc.user_pseudo_id, atc.session_id, atc.upsell_item_id
      ORDER BY ve.event_timestamp DESC  -- Most recent view before add_to_cart
    ) AS rn
  FROM upsell_add_to_cart atc
  INNER JOIN view_events ve
    ON atc.user_pseudo_id = ve.user_pseudo_id
    AND atc.session_id = ve.session_id
    AND ve.event_timestamp < atc.add_to_cart_timestamp
    -- Exclude same item (exact match)
    AND ve.viewed_item_id != atc.upsell_item_id
    -- Exclude same base product (different color of same item)
    AND ve.viewed_base_product_id != atc.upsell_base_product_id
),

-- STRATEGY 2: ITEM_LIST_NAME EXTRACTION (Same session + list name contains parent)
-- High confidence: item_list_name explicitly references the parent product
strategy_2_list_name AS (
  SELECT
    atc.user_pseudo_id,
    atc.session_id AS atc_session_id,
    atc.upsell_item_id,
    atc.upsell_base_product_id,
    atc.add_to_cart_timestamp,
    ve.viewed_item_id AS parent_item_id,
    ve.viewed_base_product_id AS parent_base_product_id,
    ve.viewed_item_name AS parent_item_name,
    'item_list_name_match' AS match_strategy,
    85 AS confidence_score,
    ROW_NUMBER() OVER (
      PARTITION BY atc.user_pseudo_id, atc.session_id, atc.upsell_item_id
      ORDER BY ve.event_timestamp DESC
    ) AS rn
  FROM upsell_add_to_cart atc
  INNER JOIN view_events ve
    ON atc.user_pseudo_id = ve.user_pseudo_id
    AND atc.session_id = ve.session_id
    AND ve.event_timestamp < atc.add_to_cart_timestamp
    AND (
      LOWER(atc.item_list_name) LIKE CONCAT('%', LOWER(ve.viewed_item_id), '%')
      OR LOWER(atc.item_list_name) LIKE CONCAT('%', LOWER(REGEXP_REPLACE(ve.viewed_item_name, r'[^a-zA-Z0-9]', '')), '%')
    )
    AND ve.viewed_item_id != atc.upsell_item_id
    AND ve.viewed_base_product_id != atc.upsell_base_product_id
),

-- STRATEGY 3: CROSS-SESSION RECENCY (Most recent view_item across sessions)
-- Medium confidence: user viewed item recently, then came back and bought upsell
strategy_3_cross_session AS (
  SELECT
    atc.user_pseudo_id,
    atc.session_id AS atc_session_id,
    atc.upsell_item_id,
    atc.upsell_base_product_id,
    atc.add_to_cart_timestamp,
    ve.viewed_item_id AS parent_item_id,
    ve.viewed_base_product_id AS parent_base_product_id,
    ve.viewed_item_name AS parent_item_name,
    'cross_session_recency' AS match_strategy,
    70 AS confidence_score,
    ROW_NUMBER() OVER (
      PARTITION BY atc.user_pseudo_id, atc.session_id, atc.upsell_item_id
      ORDER BY ve.event_timestamp DESC
    ) AS rn
  FROM upsell_add_to_cart atc
  INNER JOIN view_events ve
    ON atc.user_pseudo_id = ve.user_pseudo_id
    AND ve.session_id != atc.session_id  -- Explicitly cross-session only
    AND ve.event_timestamp < atc.add_to_cart_timestamp
    AND ve.event_timestamp >= UNIX_MICROS(TIMESTAMP_SUB(
      TIMESTAMP_MICROS(atc.add_to_cart_timestamp),
      INTERVAL lookback_days DAY
    ))
    AND ve.viewed_item_id != atc.upsell_item_id
    AND ve.viewed_base_product_id != atc.upsell_base_product_id
),

-- STRATEGY 4: SESSION CO-OCCURRENCE (viewed in same session, before add_to_cart only)
-- Lower confidence: viewed together but not immediately before
strategy_4_co_occurrence AS (
  SELECT
    atc.user_pseudo_id,
    atc.session_id AS atc_session_id,
    atc.upsell_item_id,
    atc.upsell_base_product_id,
    atc.add_to_cart_timestamp,
    ve.viewed_item_id AS parent_item_id,
    ve.viewed_base_product_id AS parent_base_product_id,
    ve.viewed_item_name AS parent_item_name,
    'session_co_occurrence' AS match_strategy,
    60 AS confidence_score,
    ROW_NUMBER() OVER (
      PARTITION BY atc.user_pseudo_id, atc.session_id, atc.upsell_item_id
      ORDER BY ve.event_timestamp DESC
    ) AS rn
  FROM upsell_add_to_cart atc
  INNER JOIN view_events ve
    ON atc.user_pseudo_id = ve.user_pseudo_id
    AND ve.session_id = atc.session_id
    AND ve.event_timestamp < atc.add_to_cart_timestamp
    AND ve.viewed_item_id != atc.upsell_item_id
    AND ve.viewed_base_product_id != atc.upsell_base_product_id
  WHERE NOT EXISTS (
    -- Only use this strategy if Strategy 1 didn't find a match
    SELECT 1 FROM strategy_1_sequential s1
    WHERE s1.user_pseudo_id = atc.user_pseudo_id
      AND s1.atc_session_id = atc.session_id
      AND s1.upsell_item_id = atc.upsell_item_id
      AND s1.rn = 1
  )
),

-- STRATEGY 5: USER-LEVEL FREQUENCY (most viewed item by this user before upsell)
-- Low confidence: based on user's browsing patterns
strategy_5_user_frequency AS (
  SELECT
    user_pseudo_id,
    atc_session_id,
    upsell_item_id,
    upsell_base_product_id,
    add_to_cart_timestamp,
    parent_item_id,
    parent_base_product_id,
    parent_item_name,
    match_strategy,
    confidence_score,
    ROW_NUMBER() OVER (
      PARTITION BY user_pseudo_id, atc_session_id, upsell_item_id
      ORDER BY view_count DESC, last_view_timestamp DESC
    ) AS rn
  FROM (
    SELECT
      atc.user_pseudo_id,
      atc.session_id AS atc_session_id,
      atc.upsell_item_id,
      atc.upsell_base_product_id,
      atc.add_to_cart_timestamp,
      ve.viewed_item_id AS parent_item_id,
      ve.viewed_base_product_id AS parent_base_product_id,
      ve.viewed_item_name AS parent_item_name,
      'user_frequency' AS match_strategy,
      50 AS confidence_score,
      COUNT(*) AS view_count,
      MAX(ve.event_timestamp) AS last_view_timestamp
    FROM upsell_add_to_cart atc
    INNER JOIN view_events ve
      ON atc.user_pseudo_id = ve.user_pseudo_id
      AND ve.event_timestamp < atc.add_to_cart_timestamp
      AND ve.event_timestamp >= UNIX_MICROS(TIMESTAMP_SUB(
        TIMESTAMP_MICROS(atc.add_to_cart_timestamp),
        INTERVAL lookback_days DAY
      ))
      AND ve.viewed_item_id != atc.upsell_item_id
      AND ve.viewed_base_product_id != atc.upsell_base_product_id
    GROUP BY
      atc.user_pseudo_id,
      atc.session_id,
      atc.upsell_item_id,
      atc.upsell_base_product_id,
      atc.add_to_cart_timestamp,
      ve.viewed_item_id,
      ve.viewed_base_product_id,
      ve.viewed_item_name
  )
),

-- STRATEGY 6: GLOBAL FALLBACK (most common parent for this upsell BASE PRODUCT globally)
-- Lowest confidence: statistical fallback when no user-level match found
-- Now uses base_product_id for better matching across colors
global_parent_stats AS (
  SELECT
    upsell_base_product_id,
    parent_base_product_id,
    -- Pick most common parent_item_id and name for this base product pair
    ARRAY_AGG(parent_item_id ORDER BY pair_count DESC LIMIT 1)[OFFSET(0)] AS parent_item_id,
    ARRAY_AGG(parent_item_name ORDER BY pair_count DESC LIMIT 1)[OFFSET(0)] AS parent_item_name,
    SUM(pair_count) AS total_pair_count,
    ROW_NUMBER() OVER (
      PARTITION BY upsell_base_product_id
      ORDER BY SUM(pair_count) DESC
    ) AS popularity_rank
  FROM (
    SELECT
      upsell_base_product_id,
      parent_base_product_id,
      parent_item_id,
      parent_item_name,
      COUNT(*) AS pair_count
    FROM (
      SELECT upsell_base_product_id, parent_base_product_id, parent_item_id, parent_item_name FROM strategy_1_sequential WHERE rn = 1
      UNION ALL
      SELECT upsell_base_product_id, parent_base_product_id, parent_item_id, parent_item_name FROM strategy_2_list_name WHERE rn = 1
    )
    GROUP BY upsell_base_product_id, parent_base_product_id, parent_item_id, parent_item_name
  )
  GROUP BY upsell_base_product_id, parent_base_product_id
),

strategy_6_global_fallback AS (
  SELECT
    atc.user_pseudo_id,
    atc.session_id AS atc_session_id,
    atc.upsell_item_id,
    atc.upsell_base_product_id,
    atc.add_to_cart_timestamp,
    gps.parent_item_id,
    gps.parent_base_product_id,
    gps.parent_item_name,
    'global_fallback' AS match_strategy,
    30 AS confidence_score,
    1 AS rn
  FROM upsell_add_to_cart atc
  INNER JOIN global_parent_stats gps
    ON atc.upsell_base_product_id = gps.upsell_base_product_id
    AND gps.popularity_rank = 1
    AND gps.parent_base_product_id != atc.upsell_base_product_id
),

-- COMBINE ALL STRATEGIES WITH PRIORITY
all_matches AS (
  SELECT user_pseudo_id, atc_session_id, upsell_item_id, upsell_base_product_id, add_to_cart_timestamp, parent_item_id, parent_base_product_id, parent_item_name, match_strategy, confidence_score, rn FROM strategy_1_sequential WHERE rn = 1
  UNION ALL
  SELECT user_pseudo_id, atc_session_id, upsell_item_id, upsell_base_product_id, add_to_cart_timestamp, parent_item_id, parent_base_product_id, parent_item_name, match_strategy, confidence_score, rn FROM strategy_2_list_name WHERE rn = 1
  UNION ALL
  SELECT user_pseudo_id, atc_session_id, upsell_item_id, upsell_base_product_id, add_to_cart_timestamp, parent_item_id, parent_base_product_id, parent_item_name, match_strategy, confidence_score, rn FROM strategy_3_cross_session WHERE rn = 1
  UNION ALL
  SELECT user_pseudo_id, atc_session_id, upsell_item_id, upsell_base_product_id, add_to_cart_timestamp, parent_item_id, parent_base_product_id, parent_item_name, match_strategy, confidence_score, rn FROM strategy_4_co_occurrence WHERE rn = 1
  UNION ALL
  SELECT user_pseudo_id, atc_session_id, upsell_item_id, upsell_base_product_id, add_to_cart_timestamp, parent_item_id, parent_base_product_id, parent_item_name, match_strategy, confidence_score, rn FROM strategy_5_user_frequency WHERE rn = 1
  UNION ALL
  SELECT user_pseudo_id, atc_session_id, upsell_item_id, upsell_base_product_id, add_to_cart_timestamp, parent_item_id, parent_base_product_id, parent_item_name, match_strategy, confidence_score, rn FROM strategy_6_global_fallback
),

-- Select best match per upsell (user/session/item) - highest confidence
best_matches AS (
  SELECT
    user_pseudo_id,
    atc_session_id,
    upsell_item_id,
    upsell_base_product_id,
    add_to_cart_timestamp,
    parent_item_id,
    parent_base_product_id,
    parent_item_name,
    match_strategy,
    confidence_score,
    ROW_NUMBER() OVER (
      PARTITION BY user_pseudo_id, atc_session_id, upsell_item_id
      ORDER BY confidence_score DESC, parent_item_id
    ) AS priority_rank
  FROM all_matches
),

-- FINAL OUTPUT with deduplication
final_output AS (
  SELECT
    up.event_date,
    up.user_pseudo_id,
    up.session_id,
    up.upsell_item_id,
    up.upsell_base_product_id,
    up.upsell_item_name,
    up.upsell_revenue,
    bm.parent_item_id,
    bm.parent_base_product_id,
    bm.parent_item_name,
    bm.match_strategy,
    bm.confidence_score,
    CASE
      WHEN bm.parent_item_id IS NOT NULL THEN TRUE
      ELSE FALSE
    END AS parent_identified,
    -- Final dedup: one row per user/session/upsell_item
    ROW_NUMBER() OVER (
      PARTITION BY up.user_pseudo_id, up.session_id, up.upsell_item_id
      ORDER BY up.event_timestamp DESC, bm.confidence_score DESC NULLS LAST
    ) AS final_dedup_rn
  FROM upsell_purchases up
  LEFT JOIN best_matches bm
    ON up.user_pseudo_id = bm.user_pseudo_id
    AND up.upsell_item_id = bm.upsell_item_id
    AND up.session_id = bm.atc_session_id
    AND bm.priority_rank = 1
)

-- OUTPUT: UPSELL REVENUE ATTRIBUTED TO PARENT ITEMS (fully deduplicated)
SELECT
  event_date,
  user_pseudo_id,
  session_id,
  upsell_item_id,
  upsell_base_product_id,
  upsell_item_name,
  upsell_revenue,
  parent_item_id,
  parent_base_product_id,
  parent_item_name,
  match_strategy,
  confidence_score,
  parent_identified
FROM final_output
WHERE final_dedup_rn = 1
ORDER BY event_date DESC, user_pseudo_id, session_id;


-- ============================================================================
-- DIAGNOSTICS: STRATEGY PERFORMANCE SUMMARY
-- ============================================================================
/*
WITH strategy_stats AS (
  SELECT
    match_strategy,
    COUNT(*) AS matches_found,
    AVG(confidence_score) AS avg_confidence,
    SUM(upsell_revenue) AS total_attributed_revenue
  FROM final_output
  WHERE final_dedup_rn = 1
    AND parent_identified = TRUE
  GROUP BY match_strategy
)
SELECT
  match_strategy,
  matches_found,
  ROUND(avg_confidence, 1) AS avg_confidence,
  ROUND(total_attributed_revenue, 2) AS total_revenue,
  ROUND(100.0 * matches_found / SUM(matches_found) OVER (), 1) AS pct_of_matches
FROM strategy_stats
ORDER BY avg_confidence DESC, matches_found DESC;
*/


-- ============================================================================
-- AGGREGATE VIEW: REVENUE BY PARENT ITEM (using base product for grouping)
-- ============================================================================
/*
SELECT
  parent_base_product_id,
  parent_item_name,
  COUNT(DISTINCT upsell_base_product_id) AS unique_upsell_products_driven,
  COUNT(*) AS total_upsell_purchases,
  SUM(upsell_revenue) AS total_upsell_revenue_attributed,
  ROUND(AVG(confidence_score), 1) AS avg_confidence,
  STRING_AGG(DISTINCT match_strategy ORDER BY match_strategy) AS strategies_used
FROM final_output
WHERE final_dedup_rn = 1
  AND parent_identified = TRUE
GROUP BY parent_base_product_id, parent_item_name
ORDER BY total_upsell_revenue_attributed DESC
LIMIT 100;
*/


-- ============================================================================
-- DATA QUALITY CHECK: Identify any remaining issues
-- ============================================================================
/*
-- Check for same base product matches (should be 0)
SELECT
  'same_base_product' AS issue_type,
  COUNT(*) AS issue_count,
  STRING_AGG(DISTINCT upsell_item_id LIMIT 5) AS example_items
FROM final_output
WHERE final_dedup_rn = 1
  AND upsell_base_product_id = parent_base_product_id

UNION ALL

-- Check for exact item_id matches (should be 0)
SELECT
  'exact_item_match' AS issue_type,
  COUNT(*) AS issue_count,
  STRING_AGG(DISTINCT upsell_item_id LIMIT 5) AS example_items
FROM final_output
WHERE final_dedup_rn = 1
  AND upsell_item_id = parent_item_id

UNION ALL

-- Check for duplicate rows (should be 0)
SELECT
  'duplicate_rows' AS issue_type,
  COUNT(*) AS issue_count,
  '' AS example_items
FROM (
  SELECT user_pseudo_id, session_id, upsell_item_id, COUNT(*) as cnt
  FROM final_output
  WHERE final_dedup_rn = 1
  GROUP BY user_pseudo_id, session_id, upsell_item_id
  HAVING COUNT(*) > 1
);
*/
