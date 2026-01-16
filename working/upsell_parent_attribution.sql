-- ============================================================================
-- UPSELL PARENT ITEM ATTRIBUTION - MULTI-STRATEGY MATCHING
-- ============================================================================
-- Purpose: Identify parent items that drove upsell purchases with high accuracy
-- Target: Increase identification rate from ~50% to 75-85%
-- Author: Claude Code
-- Date: 2025-12-09
-- ============================================================================

-- CONFIGURATION PARAMETERS
DECLARE lookback_days INT64 DEFAULT 30;  -- How far back to look for parent views
DECLARE upsell_list_pattern STRING DEFAULT '%UpSell%';  -- Pattern to identify upsell items (case-insensitive via LOWER)

-- ============================================================================
-- STEP 1: IDENTIFY UPSELL PURCHASES
-- ============================================================================
WITH upsell_purchases AS (
  SELECT
    user_pseudo_id,
    event_timestamp,
    event_date,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
    items.item_id AS upsell_item_id,
    items.item_name AS upsell_item_name,
    items.price AS upsell_price,
    items.quantity AS upsell_quantity,
    items.item_list_name,
    (items.price * items.quantity) AS upsell_revenue
  FROM
    `project.dataset.events_*`,  -- UPDATE WITH YOUR PROJECT/DATASET
    UNNEST(items) AS items
  WHERE
    _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL lookback_days DAY))
                      AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
    AND event_name = 'purchase'
    AND LOWER(items.item_list_name) LIKE LOWER(upsell_list_pattern)  -- Identifies upsell items (case-insensitive)
),

-- ============================================================================
-- STEP 2: GET ALL VIEW_ITEM EVENTS (POTENTIAL PARENTS)
-- ============================================================================
view_events AS (
  SELECT
    user_pseudo_id,
    event_timestamp,
    event_date,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
    items.item_id AS viewed_item_id,
    items.item_name AS viewed_item_name
  FROM
    `project.dataset.events_*`,
    UNNEST(items) AS items
  WHERE
    _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL lookback_days DAY))
                      AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
    AND event_name = 'view_item'
),

-- ============================================================================
-- STEP 3: GET ADD_TO_CART EVENTS FOR UPSELLS
-- ============================================================================
upsell_add_to_cart AS (
  SELECT
    user_pseudo_id,
    event_timestamp AS add_to_cart_timestamp,
    event_date,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
    items.item_id AS upsell_item_id,
    items.item_name AS upsell_item_name,
    items.item_list_name
  FROM
    `project.dataset.events_*`,
    UNNEST(items) AS items
  WHERE
    _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL lookback_days DAY))
                      AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
    AND event_name = 'add_to_cart'
    AND LOWER(items.item_list_name) LIKE LOWER(upsell_list_pattern)  -- Case-insensitive match
),

-- ============================================================================
-- STRATEGY 1: SAME-SESSION SEQUENTIAL (Last view_item before add_to_cart)
-- ============================================================================
strategy_1_sequential AS (
  SELECT
    atc.user_pseudo_id,
    atc.upsell_item_id,
    atc.add_to_cart_timestamp,
    ve.viewed_item_id AS parent_item_id,
    ve.viewed_item_name AS parent_item_name,
    'sequential_same_session' AS match_strategy,
    90 AS confidence_score,  -- High confidence
    ROW_NUMBER() OVER (
      PARTITION BY atc.user_pseudo_id, atc.upsell_item_id, atc.add_to_cart_timestamp
      ORDER BY ve.event_timestamp DESC  -- Most recent view before add_to_cart
    ) AS rn
  FROM upsell_add_to_cart atc
  INNER JOIN view_events ve
    ON atc.user_pseudo_id = ve.user_pseudo_id
    AND atc.session_id = ve.session_id
    AND ve.event_timestamp < atc.add_to_cart_timestamp  -- View happened before add_to_cart
    AND ve.viewed_item_id != atc.upsell_item_id  -- Don't match upsell viewing itself
),

-- ============================================================================
-- STRATEGY 2: ITEM_LIST_NAME EXTRACTION
-- ============================================================================
-- If item_list_name contains parent item ID (e.g., "upsell_vest_123")
strategy_2_list_name AS (
  SELECT
    atc.user_pseudo_id,
    atc.upsell_item_id,
    atc.add_to_cart_timestamp,
    ve.viewed_item_id AS parent_item_id,
    ve.viewed_item_name AS parent_item_name,
    'item_list_name_match' AS match_strategy,
    85 AS confidence_score,
    ROW_NUMBER() OVER (
      PARTITION BY atc.user_pseudo_id, atc.upsell_item_id, atc.add_to_cart_timestamp
      ORDER BY ve.event_timestamp DESC
    ) AS rn
  FROM upsell_add_to_cart atc
  INNER JOIN view_events ve
    ON atc.user_pseudo_id = ve.user_pseudo_id
    AND ve.event_timestamp < atc.add_to_cart_timestamp
    AND ve.event_timestamp >= UNIX_MICROS(TIMESTAMP_SUB(
      TIMESTAMP_MICROS(atc.add_to_cart_timestamp),
      INTERVAL lookback_days DAY
    ))
    -- Try to extract parent item from item_list_name
    -- Adjust this logic based on your actual item_list_name format
    AND (
      LOWER(atc.item_list_name) LIKE CONCAT('%', LOWER(ve.viewed_item_id), '%')
      OR LOWER(atc.item_list_name) LIKE CONCAT('%', LOWER(REGEXP_REPLACE(ve.viewed_item_name, r'[^a-zA-Z0-9]', '')), '%')
    )
),

-- ============================================================================
-- STRATEGY 3: CROSS-SESSION RECENCY (Most recent view_item across sessions)
-- ============================================================================
strategy_3_cross_session AS (
  SELECT
    atc.user_pseudo_id,
    atc.upsell_item_id,
    atc.add_to_cart_timestamp,
    ve.viewed_item_id AS parent_item_id,
    ve.viewed_item_name AS parent_item_name,
    'cross_session_recency' AS match_strategy,
    70 AS confidence_score,  -- Medium confidence
    ROW_NUMBER() OVER (
      PARTITION BY atc.user_pseudo_id, atc.upsell_item_id, atc.add_to_cart_timestamp
      ORDER BY ve.event_timestamp DESC
    ) AS rn
  FROM upsell_add_to_cart atc
  INNER JOIN view_events ve
    ON atc.user_pseudo_id = ve.user_pseudo_id
    AND ve.event_timestamp < atc.add_to_cart_timestamp
    AND ve.event_timestamp >= UNIX_MICROS(TIMESTAMP_SUB(
      TIMESTAMP_MICROS(atc.add_to_cart_timestamp),
      INTERVAL lookback_days DAY
    ))
    AND ve.viewed_item_id != atc.upsell_item_id
),

-- ============================================================================
-- STRATEGY 4: SESSION CO-OCCURRENCE (viewed together in any session)
-- ============================================================================
strategy_4_co_occurrence AS (
  SELECT
    atc.user_pseudo_id,
    atc.upsell_item_id,
    atc.add_to_cart_timestamp,
    ve.viewed_item_id AS parent_item_id,
    ve.viewed_item_name AS parent_item_name,
    'session_co_occurrence' AS match_strategy,
    60 AS confidence_score,
    ROW_NUMBER() OVER (
      PARTITION BY atc.user_pseudo_id, atc.upsell_item_id, atc.add_to_cart_timestamp
      ORDER BY ve.event_timestamp DESC
    ) AS rn
  FROM upsell_add_to_cart atc
  INNER JOIN view_events ve
    ON atc.user_pseudo_id = ve.user_pseudo_id
    AND ve.session_id = atc.session_id  -- Same session
    AND ve.viewed_item_id != atc.upsell_item_id
  WHERE
    -- Even if view came after add_to_cart (user browsed around)
    ve.event_timestamp != atc.add_to_cart_timestamp
),

-- ============================================================================
-- STRATEGY 5: USER-LEVEL FREQUENCY (most common parent for this user+upsell)
-- ============================================================================
strategy_5_user_frequency AS (
  SELECT
    atc.user_pseudo_id,
    atc.upsell_item_id,
    atc.add_to_cart_timestamp,
    ve.viewed_item_id AS parent_item_id,
    ve.viewed_item_name AS parent_item_name,
    'user_frequency' AS match_strategy,
    50 AS confidence_score,  -- Lower confidence
    ROW_NUMBER() OVER (
      PARTITION BY atc.user_pseudo_id, atc.upsell_item_id, atc.add_to_cart_timestamp
      ORDER BY COUNT(*) DESC, MAX(ve.event_timestamp) DESC
    ) AS rn
  FROM upsell_add_to_cart atc
  INNER JOIN view_events ve
    ON atc.user_pseudo_id = ve.user_pseudo_id
    AND ve.event_timestamp < atc.add_to_cart_timestamp
    AND ve.event_timestamp >= UNIX_MICROS(TIMESTAMP_SUB(
      TIMESTAMP_MICROS(atc.add_to_cart_timestamp),
      INTERVAL lookback_days DAY
    ))
    AND ve.viewed_item_id != atc.upsell_item_id
  GROUP BY
    atc.user_pseudo_id,
    atc.upsell_item_id,
    atc.add_to_cart_timestamp,
    ve.viewed_item_id,
    ve.viewed_item_name
),

-- ============================================================================
-- COMBINE ALL STRATEGIES WITH PRIORITY
-- ============================================================================
all_matches AS (
  SELECT * FROM strategy_1_sequential WHERE rn = 1
  UNION ALL
  SELECT * FROM strategy_2_list_name WHERE rn = 1
  UNION ALL
  SELECT * FROM strategy_3_cross_session WHERE rn = 1
  UNION ALL
  SELECT * FROM strategy_4_co_occurrence WHERE rn = 1
  UNION ALL
  SELECT * FROM strategy_5_user_frequency WHERE rn = 1
),

-- Select best match per upsell add_to_cart (highest confidence)
best_matches AS (
  SELECT
    user_pseudo_id,
    upsell_item_id,
    add_to_cart_timestamp,
    parent_item_id,
    parent_item_name,
    match_strategy,
    confidence_score,
    ROW_NUMBER() OVER (
      PARTITION BY user_pseudo_id, upsell_item_id, add_to_cart_timestamp
      ORDER BY confidence_score DESC, parent_item_id
    ) AS priority_rank
  FROM all_matches
)

-- ============================================================================
-- FINAL OUTPUT: UPSELL REVENUE ATTRIBUTED TO PARENT ITEMS
-- ============================================================================
SELECT
  up.event_date,
  up.user_pseudo_id,
  up.session_id,
  up.upsell_item_id,
  up.upsell_item_name,
  up.upsell_revenue,
  bm.parent_item_id,
  bm.parent_item_name,
  bm.match_strategy,
  bm.confidence_score,
  -- Flag if we found a match
  CASE
    WHEN bm.parent_item_id IS NOT NULL THEN TRUE
    ELSE FALSE
  END AS parent_identified
FROM upsell_purchases up
LEFT JOIN best_matches bm
  ON up.user_pseudo_id = bm.user_pseudo_id
  AND up.upsell_item_id = bm.upsell_item_id
  AND up.event_timestamp >= bm.add_to_cart_timestamp
  AND up.event_timestamp <= UNIX_MICROS(TIMESTAMP_ADD(
    TIMESTAMP_MICROS(bm.add_to_cart_timestamp),
    INTERVAL 30 MINUTE  -- Assume purchase happens within 30 min of add_to_cart
  ))
WHERE bm.priority_rank = 1 OR bm.priority_rank IS NULL
ORDER BY up.event_date DESC, up.event_timestamp DESC;

-- ============================================================================
-- DIAGNOSTICS: STRATEGY PERFORMANCE SUMMARY
-- ============================================================================
-- Uncomment to see which strategies are performing best:
/*
WITH strategy_stats AS (
  SELECT
    bm.match_strategy,
    COUNT(*) AS matches_found,
    AVG(bm.confidence_score) AS avg_confidence,
    SUM(up.upsell_revenue) AS total_attributed_revenue
  FROM upsell_purchases up
  LEFT JOIN best_matches bm
    ON up.user_pseudo_id = bm.user_pseudo_id
    AND up.upsell_item_id = bm.upsell_item_id
    AND up.event_timestamp >= bm.add_to_cart_timestamp
    AND up.event_timestamp <= UNIX_MICROS(TIMESTAMP_ADD(TIMESTAMP_MICROS(bm.add_to_cart_timestamp), INTERVAL 30 MINUTE))
  WHERE bm.priority_rank = 1
  GROUP BY bm.match_strategy
)
SELECT
  match_strategy,
  matches_found,
  ROUND(avg_confidence, 1) AS avg_confidence,
  ROUND(total_attributed_revenue, 2) AS total_revenue,
  ROUND(100.0 * matches_found / SUM(matches_found) OVER (), 1) AS pct_of_matches
FROM strategy_stats
ORDER BY matches_found DESC;
*/

-- ============================================================================
-- AGGREGATE VIEW: REVENUE BY PARENT ITEM
-- ============================================================================
-- Uncomment to see parent item performance:
/*
SELECT
  bm.parent_item_id,
  bm.parent_item_name,
  COUNT(DISTINCT up.upsell_item_id) AS unique_upsells_driven,
  COUNT(*) AS total_upsell_purchases,
  SUM(up.upsell_revenue) AS total_upsell_revenue_attributed,
  ROUND(AVG(bm.confidence_score), 1) AS avg_confidence,
  -- Show distribution of match strategies
  STRING_AGG(DISTINCT bm.match_strategy ORDER BY bm.match_strategy) AS strategies_used
FROM upsell_purchases up
INNER JOIN best_matches bm
  ON up.user_pseudo_id = bm.user_pseudo_id
  AND up.upsell_item_id = bm.upsell_item_id
  AND up.event_timestamp >= bm.add_to_cart_timestamp
  AND up.event_timestamp <= UNIX_MICROS(TIMESTAMP_ADD(TIMESTAMP_MICROS(bm.add_to_cart_timestamp), INTERVAL 30 MINUTE))
WHERE bm.priority_rank = 1
GROUP BY bm.parent_item_id, bm.parent_item_name
ORDER BY total_upsell_revenue_attributed DESC
LIMIT 100;
*/
