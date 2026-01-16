# Bug Fix Summary - Timestamp Type Mismatch

## Issue
The original SQL query had type mismatch errors when comparing GA4's `event_timestamp` (INT64) with TIMESTAMP values returned by date functions.

## Error Message
```
No matching signature for operator >= for argument types INT64, TIMESTAMP
```

## Root Cause
GA4 stores `event_timestamp` as INT64 (microseconds since Unix epoch), but BigQuery's date manipulation functions like `TIMESTAMP_SUB()` and `TIMESTAMP_ADD()` return TIMESTAMP types. Direct comparison between these types fails.

## Solution
Wrap TIMESTAMP functions with `UNIX_MICROS()` to convert back to INT64 before comparison.

### Changes Made

#### 1. Strategy 2 (Item List Name) - Lines 126-129
**Before:**
```sql
AND ve.event_timestamp >= TIMESTAMP_SUB(
  TIMESTAMP_MICROS(atc.add_to_cart_timestamp),
  INTERVAL lookback_days DAY
)
```

**After:**
```sql
AND ve.event_timestamp >= UNIX_MICROS(TIMESTAMP_SUB(
  TIMESTAMP_MICROS(atc.add_to_cart_timestamp),
  INTERVAL lookback_days DAY
))
```

#### 2. Strategy 3 (Cross-Session) - Lines 158-161
**Before:**
```sql
AND ve.event_timestamp >= TIMESTAMP_SUB(
  TIMESTAMP_MICROS(atc.add_to_cart_timestamp),
  INTERVAL lookback_days DAY
)
```

**After:**
```sql
AND ve.event_timestamp >= UNIX_MICROS(TIMESTAMP_SUB(
  TIMESTAMP_MICROS(atc.add_to_cart_timestamp),
  INTERVAL lookback_days DAY
))
```

#### 3. Strategy 5 (User Frequency) - Lines 211-214
**Before:**
```sql
AND ve.event_timestamp >= TIMESTAMP_SUB(
  TIMESTAMP_MICROS(atc.add_to_cart_timestamp),
  INTERVAL lookback_days DAY
)
```

**After:**
```sql
AND ve.event_timestamp >= UNIX_MICROS(TIMESTAMP_SUB(
  TIMESTAMP_MICROS(atc.add_to_cart_timestamp),
  INTERVAL lookback_days DAY
))
```

#### 4. Final Output JOIN - Lines 280-283
**Before:**
```sql
AND up.event_timestamp <= TIMESTAMP_ADD(
  TIMESTAMP_MICROS(bm.add_to_cart_timestamp),
  INTERVAL 30 MINUTE
)
```

**After:**
```sql
AND up.event_timestamp <= UNIX_MICROS(TIMESTAMP_ADD(
  TIMESTAMP_MICROS(bm.add_to_cart_timestamp),
  INTERVAL 30 MINUTE
))
```

#### 5. Diagnostic Query 1 - Line 303
**Before:**
```sql
AND up.event_timestamp <= TIMESTAMP_ADD(TIMESTAMP_MICROS(bm.add_to_cart_timestamp), INTERVAL 30 MINUTE)
```

**After:**
```sql
AND up.event_timestamp <= UNIX_MICROS(TIMESTAMP_ADD(TIMESTAMP_MICROS(bm.add_to_cart_timestamp), INTERVAL 30 MINUTE))
```

#### 6. Diagnostic Query 2 - Line 336
**Before:**
```sql
AND up.event_timestamp <= TIMESTAMP_ADD(TIMESTAMP_MICROS(bm.add_to_cart_timestamp), INTERVAL 30 MINUTE)
```

**After:**
```sql
AND up.event_timestamp <= UNIX_MICROS(TIMESTAMP_ADD(TIMESTAMP_MICROS(bm.add_to_cart_timestamp), INTERVAL 30 MINUTE))
```

## GA4 Timestamp Reference

### How GA4 Stores Timestamps
```sql
event_timestamp: INT64  -- Microseconds since 1970-01-01 00:00:00 UTC
```

### Conversion Functions
```sql
-- INT64 → TIMESTAMP
TIMESTAMP_MICROS(event_timestamp)

-- TIMESTAMP → INT64
UNIX_MICROS(timestamp_value)
```

### Correct Comparison Pattern
```sql
-- Comparing two event_timestamp values (both INT64) - WORKS
WHERE event_timestamp_1 < event_timestamp_2

-- Comparing with date math - REQUIRES CONVERSION
WHERE event_timestamp >= UNIX_MICROS(TIMESTAMP_SUB(
  TIMESTAMP_MICROS(reference_timestamp),
  INTERVAL 30 DAY
))
```

## Testing
After fixes applied, the query should:
1. ✅ Compile without type errors
2. ✅ Properly filter events within the lookback window
3. ✅ Correctly match purchases to add_to_cart events within 30 minutes
4. ✅ Return expected parent item attributions

## Files Updated
1. `upsell_parent_attribution.sql` - Fixed 6 timestamp comparison locations
2. `IMPLEMENTATION_GUIDE.md` - Added troubleshooting section for this error
