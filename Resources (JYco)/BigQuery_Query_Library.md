# BigQuery SQL Query Library for GA4
**JY/co Digital Analytics Consulting**

---

## Table of Contents

1. [Setup & Configuration](#setup--configuration)
2. [Session Analysis](#session-analysis)
3. [User Analysis](#user-analysis)
4. [Ecommerce Analysis](#ecommerce-analysis)
5. [Event Analysis](#event-analysis)
6. [Conversion Analysis](#conversion-analysis)
7. [Utility Queries](#utility-queries)
8. [Advanced Analysis](#advanced-analysis)

---

## Setup & Configuration

### How to Use These Queries

1. **Replace Project/Dataset/Table:**
   - Find: `your-project.analytics_XXXXXX.events_*`
   - Replace with your actual project, dataset, and table name

2. **Date Ranges:**
   - Format: `events_YYYYMMDD` for single day
   - Format: `events_*` for all days
   - Format: `events_202401*` for specific month
   - Use `WHERE _TABLE_SUFFIX BETWEEN 'YYYYMMDD' AND 'YYYYMMDD'` for date ranges

3. **Running Queries:**
   - Go to BigQuery console: https://console.cloud.google.com/bigquery
   - Create a new query
   - Paste and customize the SQL
   - Click "Run"

4. **Cost Optimization:**
   - Always specify date ranges to limit data scanned
   - Use partitioned columns (_TABLE_SUFFIX)
   - Preview results before running full query
   - Consider scheduling queries that run regularly

---

## Session Analysis

### 1. Sessions by Source/Medium

```sql
/*
 * Description: Count sessions and users by traffic source and medium
 * Date Range: Last 30 days
 * Customize: Adjust date range in WHERE clause
 */

SELECT
  traffic_source.source AS source,
  traffic_source.medium AS medium,
  COUNT(DISTINCT CONCAT(user_pseudo_id, (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id'))) AS sessions,
  COUNT(DISTINCT user_pseudo_id) AS users
FROM
  `your-project.analytics_XXXXXX.events_*`
WHERE
  _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
    AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
GROUP BY
  source, medium
ORDER BY
  sessions DESC
```

---

### 2. Sessions by Landing Page

```sql
/*
 * Description: Count sessions by landing page (first page in session)
 * Useful for: Understanding entry points to your site
 */

WITH landing_pages AS (
  SELECT
    CONCAT(user_pseudo_id, (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id')) AS session_id,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') AS page_location,
    event_timestamp,
    ROW_NUMBER() OVER (PARTITION BY CONCAT(user_pseudo_id, (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id')) ORDER BY event_timestamp ASC) AS page_rank
  FROM
    `your-project.analytics_XXXXXX.events_*`
  WHERE
    _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
      AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
    AND event_name = 'page_view'
)

SELECT
  page_location AS landing_page,
  COUNT(DISTINCT session_id) AS sessions
FROM
  landing_pages
WHERE
  page_rank = 1
GROUP BY
  landing_page
ORDER BY
  sessions DESC
LIMIT 100
```

---

### 3. Session Duration Distribution

```sql
/*
 * Description: Analyze session duration patterns
 * Shows: Distribution of session lengths in buckets
 */

WITH session_duration AS (
  SELECT
    CONCAT(user_pseudo_id, (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id')) AS session_id,
    MIN(event_timestamp) AS session_start,
    MAX(event_timestamp) AS session_end,
    (MAX(event_timestamp) - MIN(event_timestamp)) / 1000000 AS duration_seconds
  FROM
    `your-project.analytics_XXXXXX.events_*`
  WHERE
    _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
      AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
  GROUP BY
    session_id
)

SELECT
  CASE
    WHEN duration_seconds < 10 THEN '0-10 seconds'
    WHEN duration_seconds < 30 THEN '10-30 seconds'
    WHEN duration_seconds < 60 THEN '30-60 seconds'
    WHEN duration_seconds < 180 THEN '1-3 minutes'
    WHEN duration_seconds < 600 THEN '3-10 minutes'
    WHEN duration_seconds < 1800 THEN '10-30 minutes'
    ELSE '30+ minutes'
  END AS duration_bucket,
  COUNT(*) AS session_count,
  ROUND(AVG(duration_seconds), 2) AS avg_duration_seconds
FROM
  session_duration
GROUP BY
  duration_bucket
ORDER BY
  MIN(duration_seconds)
```

---

### 4. Sessions by Device Category

```sql
/*
 * Description: Session and user counts by device type
 * Breakdown: Desktop, Mobile, Tablet
 */

SELECT
  device.category AS device_category,
  COUNT(DISTINCT CONCAT(user_pseudo_id, (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id'))) AS sessions,
  COUNT(DISTINCT user_pseudo_id) AS users,
  ROUND(COUNT(DISTINCT CONCAT(user_pseudo_id, (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id'))) / COUNT(DISTINCT user_pseudo_id), 2) AS sessions_per_user
FROM
  `your-project.analytics_XXXXXX.events_*`
WHERE
  _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
    AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
GROUP BY
  device_category
ORDER BY
  sessions DESC
```

---

## User Analysis

### 5. New vs Returning Users

```sql
/*
 * Description: Count new vs returning users by day
 * Uses: user_first_touch_timestamp to determine new users
 */

SELECT
  PARSE_DATE('%Y%m%d', event_date) AS date,
  CASE
    WHEN TIMESTAMP_MICROS(user_first_touch_timestamp) >= TIMESTAMP(PARSE_DATE('%Y%m%d', event_date))
    THEN 'New User'
    ELSE 'Returning User'
  END AS user_type,
  COUNT(DISTINCT user_pseudo_id) AS users
FROM
  `your-project.analytics_XXXXXX.events_*`
WHERE
  _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
    AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
GROUP BY
  date, user_type
ORDER BY
  date DESC, user_type
```

---

### 6. User Acquisition Cohorts

```sql
/*
 * Description: Cohort analysis showing user retention by acquisition date
 * Shows: How many users return after their first visit
 */

WITH user_first_visit AS (
  SELECT
    user_pseudo_id,
    MIN(PARSE_DATE('%Y%m%d', event_date)) AS first_visit_date
  FROM
    `your-project.analytics_XXXXXX.events_*`
  WHERE
    _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY))
      AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
  GROUP BY
    user_pseudo_id
),

user_activity AS (
  SELECT
    e.user_pseudo_id,
    f.first_visit_date,
    PARSE_DATE('%Y%m%d', e.event_date) AS activity_date,
    DATE_DIFF(PARSE_DATE('%Y%m%d', e.event_date), f.first_visit_date, DAY) AS days_since_first_visit
  FROM
    `your-project.analytics_XXXXXX.events_*` e
  JOIN
    user_first_visit f
  ON
    e.user_pseudo_id = f.user_pseudo_id
  WHERE
    e._TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY))
      AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
  GROUP BY
    e.user_pseudo_id, f.first_visit_date, activity_date
)

SELECT
  first_visit_date AS cohort_date,
  COUNT(DISTINCT CASE WHEN days_since_first_visit = 0 THEN user_pseudo_id END) AS day_0_users,
  COUNT(DISTINCT CASE WHEN days_since_first_visit BETWEEN 1 AND 7 THEN user_pseudo_id END) AS day_1_7_users,
  COUNT(DISTINCT CASE WHEN days_since_first_visit BETWEEN 8 AND 14 THEN user_pseudo_id END) AS day_8_14_users,
  COUNT(DISTINCT CASE WHEN days_since_first_visit BETWEEN 15 AND 30 THEN user_pseudo_id END) AS day_15_30_users,
  COUNT(DISTINCT CASE WHEN days_since_first_visit > 30 THEN user_pseudo_id END) AS day_30_plus_users
FROM
  user_activity
GROUP BY
  cohort_date
ORDER BY
  cohort_date DESC
```

---

### 7. Users by Geography

```sql
/*
 * Description: User and session counts by country and city
 * Useful for: Understanding geographic distribution
 */

SELECT
  geo.country,
  geo.city,
  COUNT(DISTINCT user_pseudo_id) AS users,
  COUNT(DISTINCT CONCAT(user_pseudo_id, (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id'))) AS sessions
FROM
  `your-project.analytics_XXXXXX.events_*`
WHERE
  _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
    AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
GROUP BY
  country, city
ORDER BY
  users DESC
LIMIT 100
```

---

### 8. Users by Browser and OS

```sql
/*
 * Description: User distribution across browsers and operating systems
 * Useful for: Technical optimization and compatibility planning
 */

SELECT
  device.operating_system,
  device.web_info.browser,
  COUNT(DISTINCT user_pseudo_id) AS users,
  COUNT(DISTINCT CONCAT(user_pseudo_id, (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id'))) AS sessions
FROM
  `your-project.analytics_XXXXXX.events_*`
WHERE
  _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
    AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
GROUP BY
  operating_system, browser
ORDER BY
  users DESC
```

---

## Ecommerce Analysis

### 9. Revenue by Source/Medium

```sql
/*
 * Description: Total revenue attributed to each traffic source
 * Event: purchase
 * Note: Adjust attribution model as needed
 */

SELECT
  traffic_source.source,
  traffic_source.medium,
  COUNT(DISTINCT CONCAT(user_pseudo_id, (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id'))) AS sessions,
  COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id') END) AS transactions,
  ROUND(SUM(CASE WHEN event_name = 'purchase' THEN ecommerce.purchase_revenue END), 2) AS revenue,
  ROUND(SUM(CASE WHEN event_name = 'purchase' THEN ecommerce.purchase_revenue END) / COUNT(DISTINCT CONCAT(user_pseudo_id, (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id'))), 2) AS revenue_per_session
FROM
  `your-project.analytics_XXXXXX.events_*`
WHERE
  _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
    AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
GROUP BY
  source, medium
ORDER BY
  revenue DESC
```

---

### 10. Product Performance

```sql
/*
 * Description: Analyze individual product performance
 * Metrics: Views, add to carts, purchases, revenue
 */

WITH product_events AS (
  SELECT
    event_name,
    items.item_id,
    items.item_name,
    items.item_brand,
    items.item_category,
    items.price,
    items.quantity
  FROM
    `your-project.analytics_XXXXXX.events_*`,
    UNNEST(items) AS items
  WHERE
    _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
      AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
    AND event_name IN ('view_item', 'add_to_cart', 'purchase')
)

SELECT
  item_id,
  item_name,
  item_brand,
  item_category,
  COUNT(CASE WHEN event_name = 'view_item' THEN 1 END) AS item_views,
  COUNT(CASE WHEN event_name = 'add_to_cart' THEN 1 END) AS add_to_carts,
  COUNT(CASE WHEN event_name = 'purchase' THEN 1 END) AS purchases,
  SUM(CASE WHEN event_name = 'purchase' THEN price * quantity END) AS revenue,
  ROUND(COUNT(CASE WHEN event_name = 'add_to_cart' THEN 1 END) / NULLIF(COUNT(CASE WHEN event_name = 'view_item' THEN 1 END), 0) * 100, 2) AS add_to_cart_rate,
  ROUND(COUNT(CASE WHEN event_name = 'purchase' THEN 1 END) / NULLIF(COUNT(CASE WHEN event_name = 'view_item' THEN 1 END), 0) * 100, 2) AS purchase_rate
FROM
  product_events
GROUP BY
  item_id, item_name, item_brand, item_category
ORDER BY
  revenue DESC
LIMIT 100
```

---

### 11. Purchase Funnel Analysis

```sql
/*
 * Description: Ecommerce funnel from view to purchase
 * Shows: Drop-off rates at each step
 */

WITH funnel_events AS (
  SELECT
    CONCAT(user_pseudo_id, (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id')) AS session_id,
    MAX(CASE WHEN event_name = 'view_item' THEN 1 ELSE 0 END) AS viewed_product,
    MAX(CASE WHEN event_name = 'add_to_cart' THEN 1 ELSE 0 END) AS added_to_cart,
    MAX(CASE WHEN event_name = 'begin_checkout' THEN 1 ELSE 0 END) AS began_checkout,
    MAX(CASE WHEN event_name = 'add_payment_info' THEN 1 ELSE 0 END) AS added_payment,
    MAX(CASE WHEN event_name = 'purchase' THEN 1 ELSE 0 END) AS purchased
  FROM
    `your-project.analytics_XXXXXX.events_*`
  WHERE
    _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
      AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
  GROUP BY
    session_id
)

SELECT
  'Step 1: Viewed Product' AS funnel_step,
  SUM(viewed_product) AS sessions,
  ROUND(SUM(viewed_product) / SUM(viewed_product) * 100, 2) AS percentage
FROM funnel_events

UNION ALL

SELECT
  'Step 2: Added to Cart' AS funnel_step,
  SUM(added_to_cart) AS sessions,
  ROUND(SUM(added_to_cart) / SUM(viewed_product) * 100, 2) AS percentage
FROM funnel_events

UNION ALL

SELECT
  'Step 3: Began Checkout' AS funnel_step,
  SUM(began_checkout) AS sessions,
  ROUND(SUM(began_checkout) / SUM(viewed_product) * 100, 2) AS percentage
FROM funnel_events

UNION ALL

SELECT
  'Step 4: Added Payment Info' AS funnel_step,
  SUM(added_payment) AS sessions,
  ROUND(SUM(added_payment) / SUM(viewed_product) * 100, 2) AS percentage
FROM funnel_events

UNION ALL

SELECT
  'Step 5: Completed Purchase' AS funnel_step,
  SUM(purchased) AS sessions,
  ROUND(SUM(purchased) / SUM(viewed_product) * 100, 2) AS percentage
FROM funnel_events

ORDER BY
  funnel_step
```

---

### 12. Average Order Value (AOV) Trends

```sql
/*
 * Description: Daily average order value and transaction trends
 * Useful for: Monitoring revenue metrics over time
 */

SELECT
  PARSE_DATE('%Y%m%d', event_date) AS date,
  COUNT(DISTINCT (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id')) AS transactions,
  ROUND(SUM(ecommerce.purchase_revenue), 2) AS total_revenue,
  ROUND(AVG(ecommerce.purchase_revenue), 2) AS avg_order_value,
  ROUND(MIN(ecommerce.purchase_revenue), 2) AS min_order_value,
  ROUND(MAX(ecommerce.purchase_revenue), 2) AS max_order_value
FROM
  `your-project.analytics_XXXXXX.events_*`
WHERE
  _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY))
    AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
  AND event_name = 'purchase'
GROUP BY
  date
ORDER BY
  date DESC
```

---

## Event Analysis

### 13. Top Events by Count

```sql
/*
 * Description: Most frequently fired events
 * Useful for: Understanding user interactions
 */

SELECT
  event_name,
  COUNT(*) AS event_count,
  COUNT(DISTINCT user_pseudo_id) AS unique_users,
  COUNT(DISTINCT CONCAT(user_pseudo_id, (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id'))) AS sessions_with_event
FROM
  `your-project.analytics_XXXXXX.events_*`
WHERE
  _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
    AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
GROUP BY
  event_name
ORDER BY
  event_count DESC
LIMIT 50
```

---

### 14. Event Parameter Breakdown

```sql
/*
 * Description: Analyze parameters for a specific event
 * Customize: Change 'button_click' to your event name
 */

SELECT
  param.key AS parameter_name,
  param.value.string_value AS string_value,
  param.value.int_value AS int_value,
  param.value.double_value AS double_value,
  COUNT(*) AS occurrences
FROM
  `your-project.analytics_XXXXXX.events_*`,
  UNNEST(event_params) AS param
WHERE
  _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
    AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
  AND event_name = 'button_click' -- CHANGE THIS to your event name
GROUP BY
  parameter_name, string_value, int_value, double_value
ORDER BY
  parameter_name, occurrences DESC
```

---

### 15. Custom Event Analysis Template

```sql
/*
 * Description: Template for analyzing a custom event
 * Customize: Replace event name and parameter keys
 */

SELECT
  PARSE_DATE('%Y%m%d', event_date) AS date,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'your_parameter_key') AS parameter_value,
  COUNT(*) AS event_count,
  COUNT(DISTINCT user_pseudo_id) AS unique_users
FROM
  `your-project.analytics_XXXXXX.events_*`
WHERE
  _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
    AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
  AND event_name = 'your_event_name' -- CHANGE THIS
GROUP BY
  date, parameter_value
ORDER BY
  date DESC, event_count DESC
```

---

### 16. Page Performance Analysis

```sql
/*
 * Description: Analyze page views, engagement time, and scroll depth
 * Metrics: Views, users, avg time, scroll rate
 */

SELECT
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') AS page_url,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title') AS page_title,
  COUNT(*) AS page_views,
  COUNT(DISTINCT user_pseudo_id) AS unique_users,
  ROUND(AVG((SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'engagement_time_msec')) / 1000, 2) AS avg_engagement_seconds,
  ROUND(COUNT(DISTINCT CASE WHEN event_name = 'scroll' THEN CONCAT(user_pseudo_id, event_timestamp) END) / COUNT(DISTINCT CONCAT(user_pseudo_id, event_timestamp)) * 100, 2) AS scroll_rate_percent
FROM
  `your-project.analytics_XXXXXX.events_*`
WHERE
  _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
    AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
  AND event_name IN ('page_view', 'scroll', 'user_engagement')
GROUP BY
  page_url, page_title
ORDER BY
  page_views DESC
LIMIT 100
```

---

## Conversion Analysis

### 17. Conversion Rate by Channel

```sql
/*
 * Description: Calculate conversion rates by traffic source
 * Customize: Change conversion event name as needed
 */

SELECT
  traffic_source.source,
  traffic_source.medium,
  COUNT(DISTINCT CONCAT(user_pseudo_id, (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id'))) AS sessions,
  COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN CONCAT(user_pseudo_id, (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id')) END) AS converting_sessions,
  ROUND(COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN CONCAT(user_pseudo_id, (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id')) END) / COUNT(DISTINCT CONCAT(user_pseudo_id, (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id'))) * 100, 2) AS conversion_rate
FROM
  `your-project.analytics_XXXXXX.events_*`
WHERE
  _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
    AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
GROUP BY
  source, medium
HAVING
  sessions >= 100 -- Minimum sessions for statistical significance
ORDER BY
  conversion_rate DESC
```

---

### 18. Time to Conversion

```sql
/*
 * Description: Calculate time between first touch and conversion
 * Shows: How long it takes users to convert
 */

WITH first_touch AS (
  SELECT
    user_pseudo_id,
    MIN(TIMESTAMP_MICROS(event_timestamp)) AS first_touch_time
  FROM
    `your-project.analytics_XXXXXX.events_*`
  WHERE
    _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY))
      AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
  GROUP BY
    user_pseudo_id
),

conversions AS (
  SELECT
    user_pseudo_id,
    TIMESTAMP_MICROS(event_timestamp) AS conversion_time
  FROM
    `your-project.analytics_XXXXXX.events_*`
  WHERE
    _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY))
      AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
    AND event_name = 'purchase' -- CHANGE to your conversion event
)

SELECT
  CASE
    WHEN TIMESTAMP_DIFF(c.conversion_time, f.first_touch_time, HOUR) < 1 THEN '< 1 hour'
    WHEN TIMESTAMP_DIFF(c.conversion_time, f.first_touch_time, HOUR) < 24 THEN '1-24 hours'
    WHEN TIMESTAMP_DIFF(c.conversion_time, f.first_touch_time, DAY) < 7 THEN '1-7 days'
    WHEN TIMESTAMP_DIFF(c.conversion_time, f.first_touch_time, DAY) < 30 THEN '7-30 days'
    ELSE '30+ days'
  END AS time_to_conversion,
  COUNT(*) AS conversions,
  ROUND(AVG(TIMESTAMP_DIFF(c.conversion_time, f.first_touch_time, HOUR)), 2) AS avg_hours_to_conversion
FROM
  conversions c
JOIN
  first_touch f
ON
  c.user_pseudo_id = f.user_pseudo_id
WHERE
  c.conversion_time >= f.first_touch_time
GROUP BY
  time_to_conversion
ORDER BY
  MIN(TIMESTAMP_DIFF(c.conversion_time, f.first_touch_time, HOUR))
```

---

### 19. Multi-Touch Attribution Path

```sql
/*
 * Description: Show the sequence of channels users touch before converting
 * Note: Simplified version - real attribution is more complex
 */

WITH user_touchpoints AS (
  SELECT
    user_pseudo_id,
    TIMESTAMP_MICROS(event_timestamp) AS touchpoint_time,
    CONCAT(traffic_source.source, ' / ', traffic_source.medium) AS channel,
    event_name
  FROM
    `your-project.analytics_XXXXXX.events_*`
  WHERE
    _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
      AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
),

converters AS (
  SELECT DISTINCT
    user_pseudo_id,
    MIN(touchpoint_time) AS conversion_time
  FROM
    user_touchpoints
  WHERE
    event_name = 'purchase'
  GROUP BY
    user_pseudo_id
),

path_events AS (
  SELECT
    t.user_pseudo_id,
    t.channel,
    t.touchpoint_time,
    ROW_NUMBER() OVER (PARTITION BY t.user_pseudo_id ORDER BY t.touchpoint_time) AS touchpoint_number
  FROM
    user_touchpoints t
  JOIN
    converters c
  ON
    t.user_pseudo_id = c.user_pseudo_id
  WHERE
    t.touchpoint_time <= c.conversion_time
)

SELECT
  STRING_AGG(channel, ' > ' ORDER BY touchpoint_number) AS conversion_path,
  COUNT(DISTINCT user_pseudo_id) AS converters
FROM
  path_events
GROUP BY
  user_pseudo_id
HAVING
  COUNT(*) <= 5 -- Limit to paths with 5 or fewer touchpoints
GROUP BY
  conversion_path
ORDER BY
  converters DESC
LIMIT 50
```

---

## Utility Queries

### 20. Unnest Event Parameters Helper

```sql
/*
 * Description: Helper query to see all parameters for an event
 * Useful for: Understanding event structure and debugging
 */

SELECT
  event_name,
  param.key AS parameter_key,
  param.value.string_value,
  param.value.int_value,
  param.value.float_value,
  param.value.double_value
FROM
  `your-project.analytics_XXXXXX.events_*`,
  UNNEST(event_params) AS param
WHERE
  _TABLE_SUFFIX = FORMAT_DATE('%Y%m%d', CURRENT_DATE() - 1)
  AND event_name = 'your_event_name' -- CHANGE THIS
LIMIT 10
```

---

### 21. Date Range Template

```sql
/*
 * Description: Flexible date range query template
 * Customize: Adjust date calculations as needed
 */

-- Last 7 days
SELECT * FROM `your-project.analytics_XXXXXX.events_*`
WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())

-- Last 30 days
SELECT * FROM `your-project.analytics_XXXXXX.events_*`
WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
  AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())

-- Specific date range
SELECT * FROM `your-project.analytics_XXXXXX.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20240101' AND '20240131'

-- Current month to date
SELECT * FROM `your-project.analytics_XXXXXX.events_*`
WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_TRUNC(CURRENT_DATE(), MONTH))
  AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())

-- Previous complete month
SELECT * FROM `your-project.analytics_XXXXXX.events_*`
WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_TRUNC(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH), MONTH))
  AND FORMAT_DATE('%Y%m%d', LAST_DAY(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)))
```

---

### 22. Sessionization Query

```sql
/*
 * Description: Create session-level aggregations
 * Groups: Events into sessions with key metrics
 */

SELECT
  user_pseudo_id,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
  MIN(TIMESTAMP_MICROS(event_timestamp)) AS session_start,
  MAX(TIMESTAMP_MICROS(event_timestamp)) AS session_end,
  COUNT(DISTINCT CASE WHEN event_name = 'page_view' THEN event_timestamp END) AS page_views,
  COUNT(DISTINCT event_name) AS unique_events,
  MAX(CASE WHEN event_name = 'purchase' THEN 1 ELSE 0 END) AS converted,
  SUM(CASE WHEN event_name = 'purchase' THEN ecommerce.purchase_revenue ELSE 0 END) AS session_revenue
FROM
  `your-project.analytics_XXXXXX.events_*`
WHERE
  _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
    AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
GROUP BY
  user_pseudo_id, session_id
LIMIT 1000
```

---

### 23. Data Quality Check

```sql
/*
 * Description: Check for common data quality issues
 * Useful for: Validating tracking implementation
 */

SELECT
  'Total Events' AS metric,
  COUNT(*) AS value
FROM `your-project.analytics_XXXXXX.events_*`
WHERE _TABLE_SUFFIX = FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))

UNION ALL

SELECT
  'Events with Session ID' AS metric,
  COUNT(*) AS value
FROM `your-project.analytics_XXXXXX.events_*`
WHERE _TABLE_SUFFIX = FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
  AND (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') IS NOT NULL

UNION ALL

SELECT
  'Purchase Events' AS metric,
  COUNT(*) AS value
FROM `your-project.analytics_XXXXXX.events_*`
WHERE _TABLE_SUFFIX = FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
  AND event_name = 'purchase'

UNION ALL

SELECT
  'Purchases with Transaction ID' AS metric,
  COUNT(*) AS value
FROM `your-project.analytics_XXXXXX.events_*`
WHERE _TABLE_SUFFIX = FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
  AND event_name = 'purchase'
  AND (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id') IS NOT NULL

UNION ALL

SELECT
  'Duplicate Transaction IDs' AS metric,
  COUNT(*) - COUNT(DISTINCT (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id')) AS value
FROM `your-project.analytics_XXXXXX.events_*`
WHERE _TABLE_SUFFIX = FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
  AND event_name = 'purchase'
```

---

## Advanced Analysis

### 24. User Lifetime Value (LTV)

```sql
/*
 * Description: Calculate user lifetime value
 * Shows: Total revenue per user since first visit
 */

SELECT
  user_pseudo_id,
  MIN(PARSE_DATE('%Y%m%d', event_date)) AS first_seen_date,
  MAX(PARSE_DATE('%Y%m%d', event_date)) AS last_seen_date,
  DATE_DIFF(MAX(PARSE_DATE('%Y%m%d', event_date)), MIN(PARSE_DATE('%Y%m%d', event_date)), DAY) AS customer_lifetime_days,
  COUNT(DISTINCT (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id')) AS total_sessions,
  COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'transaction_id') END) AS total_purchases,
  ROUND(SUM(CASE WHEN event_name = 'purchase' THEN ecommerce.purchase_revenue END), 2) AS lifetime_value
FROM
  `your-project.analytics_XXXXXX.events_*`
WHERE
  _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 365 DAY))
    AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
GROUP BY
  user_pseudo_id
HAVING
  total_purchases > 0
ORDER BY
  lifetime_value DESC
LIMIT 1000
```

---

### 25. Search Query Performance

```sql
/*
 * Description: Analyze internal site search performance
 * Shows: Top searches and their conversion rates
 */

WITH search_sessions AS (
  SELECT
    CONCAT(user_pseudo_id, (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id')) AS session_id,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'search_term') AS search_term
  FROM
    `your-project.analytics_XXXXXX.events_*`
  WHERE
    _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
      AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
    AND event_name = 'search'
),

conversions AS (
  SELECT DISTINCT
    CONCAT(user_pseudo_id, (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id')) AS session_id
  FROM
    `your-project.analytics_XXXXXX.events_*`
  WHERE
    _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
      AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
    AND event_name = 'purchase'
)

SELECT
  s.search_term,
  COUNT(DISTINCT s.session_id) AS search_sessions,
  COUNT(DISTINCT c.session_id) AS converting_sessions,
  ROUND(COUNT(DISTINCT c.session_id) / COUNT(DISTINCT s.session_id) * 100, 2) AS conversion_rate
FROM
  search_sessions s
LEFT JOIN
  conversions c
ON
  s.session_id = c.session_id
WHERE
  s.search_term IS NOT NULL
GROUP BY
  s.search_term
HAVING
  search_sessions >= 10 -- Minimum for significance
ORDER BY
  search_sessions DESC
LIMIT 100
```

---

## Query Optimization Tips

### Best Practices for Cost and Performance

1. **Always Use Date Filters:**
   ```sql
   WHERE _TABLE_SUFFIX BETWEEN 'YYYYMMDD' AND 'YYYYMMDD'
   ```

2. **Limit Result Sets:**
   ```sql
   LIMIT 1000
   ```

3. **Use SELECT Specific Columns:**
   ```sql
   -- Good
   SELECT event_name, user_pseudo_id FROM ...

   -- Avoid (expensive)
   SELECT * FROM ...
   ```

4. **Filter Early:**
   ```sql
   -- Filter before JOINs and GROUP BY operations
   WHERE event_name = 'purchase'
   ```

5. **Preview Before Running:**
   - Use "Query validator" in BigQuery to estimate cost
   - Test with small date ranges first

6. **Schedule Regular Queries:**
   - Use scheduled queries for reports you run often
   - Saves time and ensures consistency

---

## Cost Estimation

**BigQuery Pricing (as of 2024):**
- On-demand: $6.25 per TB scanned
- Typical GA4 daily export: 1-10 GB per day depending on traffic

**Example Costs:**
- 30 days of data (300 GB): ~$1.88 per query
- 90 days of data (900 GB): ~$5.63 per query
- 365 days of data (3.65 TB): ~$22.81 per query

**Tip:** Use partitioned queries with date filters to minimize costs.

---

## Support

For questions or custom query development, contact:

**JY/co LLC**
Digital Analytics Consulting
[YOUR EMAIL]
[YOUR WEBSITE]

---

**END OF QUERY LIBRARY**
