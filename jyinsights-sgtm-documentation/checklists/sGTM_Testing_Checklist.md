# sGTM Testing & QA Checklist

**JY/co Server-Side Tracking**
**Version:** 1.0.0

---

## Testing Overview

This comprehensive checklist ensures your sGTM implementation is production-ready. Complete each section sequentially and document results.

**Project Information:**
- Client Name: ________________
- Implementation Date: ________________
- Tester Name: ________________
- Environment: ☐ Staging  ☐ Production

---

## Pre-Launch Checklist

### Infrastructure Verification

| Item | Status | Notes |
|------|--------|-------|
| ☐ sGTM server accessible at custom domain | ☐ Pass ☐ Fail | |
| ☐ Health endpoint returns "ok" (`/healthy`) | ☐ Pass ☐ Fail | |
| ☐ SSL certificate valid (no warnings) | ☐ Pass ☐ Fail | |
| ☐ DNS records configured correctly | ☐ Pass ☐ Fail | |
| ☐ Server container published (not draft) | ☐ Pass ☐ Fail | |
| ☐ Server container version documented | ☐ Pass ☐ Fail | Version: _____ |
| ☐ Auto-scaling enabled (if GCP) | ☐ Pass ☐ Fail | |
| ☐ Monitoring/alerts configured | ☐ Pass ☐ Fail | |

**Infrastructure Test Commands:**

```bash
# Test health endpoint
curl https://gtm.clientdomain.com/healthy
# Expected: "ok"

# Test SSL
curl -I https://gtm.clientdomain.com
# Expected: HTTP/2 200

# Check DNS resolution
nslookup gtm.clientdomain.com
# Expected: Valid A/AAAA records
```

---

### Container Configuration

| Item | Status | Notes |
|------|--------|-------|
| ☐ GA4 Client configured | ☐ Pass ☐ Fail | |
| ☐ GA4 Client claiming correct path | ☐ Pass ☐ Fail | Path: _____ |
| ☐ GA4 Tag configured with Measurement ID | ☐ Pass ☐ Fail | ID: G-__________ |
| ☐ Meta CAPI tag configured (if applicable) | ☐ Pass ☐ Fail | |
| ☐ Meta Pixel ID verified | ☐ Pass ☐ Fail | ID: __________ |
| ☐ Meta Access Token configured | ☐ Pass ☐ Fail | |
| ☐ Google Ads tag configured (if applicable) | ☐ Pass ☐ Fail | |
| ☐ Google Ads Conversion ID verified | ☐ Pass ☐ Fail | ID: AW-__________ |
| ☐ All constant variables populated | ☐ Pass ☐ Fail | |
| ☐ No placeholder values remaining | ☐ Pass ☐ Fail | |
| ☐ Triggers configured correctly | ☐ Pass ☐ Fail | |
| ☐ Variables extracting data correctly | ☐ Pass ☐ Fail | |

---

### Web GTM Configuration

| Item | Status | Notes |
|------|--------|-------|
| ☐ GA4 Config tag updated with `server_container_url` | ☐ Pass ☐ Fail | |
| ☐ Custom domain set correctly | ☐ Pass ☐ Fail | Domain: _____ |
| ☐ `first_party_collection: true` enabled | ☐ Pass ☐ Fail | |
| ☐ Event ID variable created | ☐ Pass ☐ Fail | |
| ☐ Event ID passed to GA4 events | ☐ Pass ☐ Fail | |
| ☐ Event ID passed to Meta Pixel (if applicable) | ☐ Pass ☐ Fail | |
| ☐ Debug mode enabled for testing | ☐ Pass ☐ Fail | |
| ☐ Web GTM container published | ☐ Pass ☐ Fail | Version: _____ |

---

## Event Testing Matrix

### GA4 Events

Test each event type and verify data accuracy:

#### page_view

| Check | Status | Notes |
|-------|--------|-------|
| ☐ Event fires on page load | ☐ Pass ☐ Fail | |
| ☐ `page_location` correct | ☐ Pass ☐ Fail | |
| ☐ `page_title` correct | ☐ Pass ☐ Fail | |
| ☐ `page_referrer` present | ☐ Pass ☐ Fail | |
| ☐ Client ID (_ga cookie) present | ☐ Pass ☐ Fail | |
| ☐ Session ID present | ☐ Pass ☐ Fail | |
| ☐ Event visible in GA4 DebugView | ☐ Pass ☐ Fail | Timestamp: _____ |
| ☐ sGTM server receives request | ☐ Pass ☐ Fail | |
| ☐ GA4 Tag fires in sGTM Preview | ☐ Pass ☐ Fail | |

**Test URL:** ________________

---

#### view_item

| Check | Status | Notes |
|-------|--------|-------|
| ☐ Event fires on product page | ☐ Pass ☐ Fail | |
| ☐ `items` array populated | ☐ Pass ☐ Fail | |
| ☐ `item_id` correct | ☐ Pass ☐ Fail | |
| ☐ `item_name` correct | ☐ Pass ☐ Fail | |
| ☐ `price` correct | ☐ Pass ☐ Fail | |
| ☐ `item_brand` present (if applicable) | ☐ Pass ☐ Fail | |
| ☐ `item_category` present | ☐ Pass ☐ Fail | |
| ☐ `currency` correct | ☐ Pass ☐ Fail | |
| ☐ `value` calculated correctly | ☐ Pass ☐ Fail | |
| ☐ Event visible in GA4 DebugView | ☐ Pass ☐ Fail | |
| ☐ sGTM GA4 Tag fires | ☐ Pass ☐ Fail | |

**Test Product:** ________________
**Expected item_id:** ________________

---

#### add_to_cart

| Check | Status | Notes |
|-------|--------|-------|
| ☐ Event fires on add to cart click | ☐ Pass ☐ Fail | |
| ☐ `items` array populated | ☐ Pass ☐ Fail | |
| ☐ `item_id` matches product | ☐ Pass ☐ Fail | |
| ☐ `quantity` correct | ☐ Pass ☐ Fail | |
| ☐ `price` correct | ☐ Pass ☐ Fail | |
| ☐ `value` = price × quantity | ☐ Pass ☐ Fail | |
| ☐ `currency` correct | ☐ Pass ☐ Fail | |
| ☐ Event ID present and unique | ☐ Pass ☐ Fail | event_id: _____ |
| ☐ Event visible in GA4 DebugView | ☐ Pass ☐ Fail | |
| ☐ sGTM receives request | ☐ Pass ☐ Fail | |
| ☐ GA4 Tag fires in sGTM | ☐ Pass ☐ Fail | |

**Test Scenario:** Add [Product Name] with quantity [X]

---

#### begin_checkout

| Check | Status | Notes |
|-------|--------|-------|
| ☐ Event fires on checkout page load | ☐ Pass ☐ Fail | |
| ☐ `items` array includes all cart items | ☐ Pass ☐ Fail | Item count: _____ |
| ☐ `value` = total cart value | ☐ Pass ☐ Fail | |
| ☐ `currency` correct | ☐ Pass ☐ Fail | |
| ☐ `coupon` present (if applied) | ☐ Pass ☐ Fail | |
| ☐ Event ID present | ☐ Pass ☐ Fail | |
| ☐ Event visible in GA4 DebugView | ☐ Pass ☐ Fail | |
| ☐ sGTM GA4 Tag fires | ☐ Pass ☐ Fail | |

**Test Cart Value:** ________________

---

#### add_shipping_info

| Check | Status | Notes |
|-------|--------|-------|
| ☐ Event fires on shipping method selection | ☐ Pass ☐ Fail | |
| ☐ `shipping_tier` present | ☐ Pass ☐ Fail | Value: _____ |
| ☐ `value` includes shipping | ☐ Pass ☐ Fail | |
| ☐ `items` array present | ☐ Pass ☐ Fail | |
| ☐ Event visible in GA4 DebugView | ☐ Pass ☐ Fail | |
| ☐ sGTM GA4 Tag fires | ☐ Pass ☐ Fail | |

---

#### add_payment_info

| Check | Status | Notes |
|-------|--------|-------|
| ☐ Event fires on payment method selection | ☐ Pass ☐ Fail | |
| ☐ `payment_type` present | ☐ Pass ☐ Fail | Value: _____ |
| ☐ `value` correct | ☐ Pass ☐ Fail | |
| ☐ `items` array present | ☐ Pass ☐ Fail | |
| ☐ Event visible in GA4 DebugView | ☐ Pass ☐ Fail | |
| ☐ sGTM GA4 Tag fires | ☐ Pass ☐ Fail | |

---

#### purchase

**CRITICAL EVENT - Triple Check All Items**

| Check | Status | Notes |
|-------|--------|-------|
| ☐ Event fires on order confirmation page | ☐ Pass ☐ Fail | |
| ☐ `transaction_id` unique and correct | ☐ Pass ☐ Fail | ID: _____ |
| ☐ `value` matches order total | ☐ Pass ☐ Fail | Expected: _____ |
| ☐ `tax` amount correct | ☐ Pass ☐ Fail | |
| ☐ `shipping` amount correct | ☐ Pass ☐ Fail | |
| ☐ `currency` correct | ☐ Pass ☐ Fail | |
| ☐ `coupon` present (if used) | ☐ Pass ☐ Fail | |
| ☐ `items` array includes all products | ☐ Pass ☐ Fail | Item count: _____ |
| ☐ Each item has correct `quantity` | ☐ Pass ☐ Fail | |
| ☐ Each item has correct `price` | ☐ Pass ☐ Fail | |
| ☐ Event ID present and unique | ☐ Pass ☐ Fail | event_id: _____ |
| ☐ Event fires only ONCE per order | ☐ Pass ☐ Fail | |
| ☐ Refresh page does NOT fire duplicate | ☐ Pass ☐ Fail | |
| ☐ Event visible in GA4 DebugView | ☐ Pass ☐ Fail | Timestamp: _____ |
| ☐ sGTM receives request | ☐ Pass ☐ Fail | |
| ☐ GA4 Tag fires in sGTM | ☐ Pass ☐ Fail | |

**Test Order Details:**
- Order ID: ________________
- Total Value: ________________
- Items: ________________
- Expected Revenue in GA4: ________________

---

### Meta CAPI Events (if applicable)

#### PageView

| Check | Status | Notes |
|-------|--------|-------|
| ☐ GA4 page_view triggers Meta PageView | ☐ Pass ☐ Fail | |
| ☐ Meta CAPI Tag fires in sGTM | ☐ Pass ☐ Fail | |
| ☐ `event_name` = "PageView" | ☐ Pass ☐ Fail | |
| ☐ `event_id` matches GA4 event_id | ☐ Pass ☐ Fail | |
| ☐ `event_source_url` present | ☐ Pass ☐ Fail | |
| ☐ User data (email, phone) hashed | ☐ Pass ☐ Fail | |
| ☐ `client_user_agent` present | ☐ Pass ☐ Fail | |
| ☐ `client_ip_address` present | ☐ Pass ☐ Fail | |
| ☐ `fbc` cookie present | ☐ Pass ☐ Fail | |
| ☐ `fbp` cookie present | ☐ Pass ☐ Fail | |
| ☐ Event visible in Meta Test Events | ☐ Pass ☐ Fail | |
| ☐ Event Match Quality score shown | ☐ Pass ☐ Fail | Score: _____ /10 |

**Target EMQ Score:** 8.0+

---

#### ViewContent

| Check | Status | Notes |
|-------|--------|-------|
| ☐ GA4 view_item triggers Meta ViewContent | ☐ Pass ☐ Fail | |
| ☐ Meta CAPI Tag fires in sGTM | ☐ Pass ☐ Fail | |
| ☐ `event_name` = "ViewContent" | ☐ Pass ☐ Fail | |
| ☐ `event_id` matches GA4 event_id | ☐ Pass ☐ Fail | |
| ☐ `content_ids` array populated | ☐ Pass ☐ Fail | |
| ☐ `content_type` = "product" | ☐ Pass ☐ Fail | |
| ☐ `value` present | ☐ Pass ☐ Fail | |
| ☐ `currency` correct | ☐ Pass ☐ Fail | |
| ☐ User data present and hashed | ☐ Pass ☐ Fail | |
| ☐ Event visible in Meta Test Events | ☐ Pass ☐ Fail | |
| ☐ Event Match Quality 8.0+ | ☐ Pass ☐ Fail | Score: _____ |

---

#### AddToCart

| Check | Status | Notes |
|-------|--------|-------|
| ☐ GA4 add_to_cart triggers Meta AddToCart | ☐ Pass ☐ Fail | |
| ☐ Meta CAPI Tag fires in sGTM | ☐ Pass ☐ Fail | |
| ☐ `event_name` = "AddToCart" | ☐ Pass ☐ Fail | |
| ☐ `event_id` matches GA4 AND browser Pixel | ☐ Pass ☐ Fail | |
| ☐ `content_ids` matches product | ☐ Pass ☐ Fail | |
| ☐ `value` correct | ☐ Pass ☐ Fail | |
| ☐ `currency` correct | ☐ Pass ☐ Fail | |
| ☐ User data present | ☐ Pass ☐ Fail | |
| ☐ Event visible in Meta Test Events | ☐ Pass ☐ Fail | |
| ☐ ONLY 1 event shows (deduplication works) | ☐ Pass ☐ Fail | |
| ☐ Event Match Quality 8.0+ | ☐ Pass ☐ Fail | Score: _____ |

**Deduplication Test:**
- Browser Pixel event_id: ________________
- Server CAPI event_id: ________________
- ☐ event_ids MATCH EXACTLY

---

#### InitiateCheckout

| Check | Status | Notes |
|-------|--------|-------|
| ☐ GA4 begin_checkout triggers InitiateCheckout | ☐ Pass ☐ Fail | |
| ☐ Meta CAPI Tag fires in sGTM | ☐ Pass ☐ Fail | |
| ☐ `event_name` = "InitiateCheckout" | ☐ Pass ☐ Fail | |
| ☐ `event_id` matches GA4 event_id | ☐ Pass ☐ Fail | |
| ☐ `value` = cart total | ☐ Pass ☐ Fail | |
| ☐ `currency` correct | ☐ Pass ☐ Fail | |
| ☐ `num_items` = cart item count | ☐ Pass ☐ Fail | |
| ☐ User data present | ☐ Pass ☐ Fail | |
| ☐ Event visible in Meta Test Events | ☐ Pass ☐ Fail | |
| ☐ Event Match Quality 8.0+ | ☐ Pass ☐ Fail | Score: _____ |

---

#### Purchase (Meta CAPI)

**CRITICAL EVENT - Must Match GA4 Purchase**

| Check | Status | Notes |
|-------|--------|-------|
| ☐ GA4 purchase triggers Meta Purchase | ☐ Pass ☐ Fail | |
| ☐ Meta CAPI Tag fires in sGTM | ☐ Pass ☐ Fail | |
| ☐ `event_name` = "Purchase" | ☐ Pass ☐ Fail | |
| ☐ `event_id` matches GA4 AND browser Pixel | ☐ Pass ☐ Fail | |
| ☐ `value` matches order total | ☐ Pass ☐ Fail | Expected: _____ |
| ☐ `currency` correct | ☐ Pass ☐ Fail | |
| ☐ `content_ids` includes all products | ☐ Pass ☐ Fail | |
| ☐ `num_items` = total quantity | ☐ Pass ☐ Fail | |
| ☐ User data (email, phone) present | ☐ Pass ☐ Fail | |
| ☐ User data properly hashed (SHA-256) | ☐ Pass ☐ Fail | |
| ☐ Event visible in Meta Test Events | ☐ Pass ☐ Fail | |
| ☐ ONLY 1 Purchase shows (deduplication) | ☐ Pass ☐ Fail | |
| ☐ Event Match Quality 8.0+ | ☐ Pass ☐ Fail | Score: _____ |
| ☐ Conversion shows in Meta Events Manager | ☐ Pass ☐ Fail | ETA: 15-30 min |

**Purchase Verification:**
- Browser Pixel event_id: ________________
- Server CAPI event_id: ________________
- ☐ event_ids MATCH EXACTLY
- Order ID in Meta: ________________

---

### Google Ads Enhanced Conversions (if applicable)

#### Purchase Conversion

| Check | Status | Notes |
|-------|--------|-------|
| ☐ GA4 purchase triggers Google Ads conversion | ☐ Pass ☐ Fail | |
| ☐ Google Ads Tag fires in sGTM | ☐ Pass ☐ Fail | |
| ☐ Conversion ID correct | ☐ Pass ☐ Fail | ID: AW-________ |
| ☐ Conversion Label correct | ☐ Pass ☐ Fail | Label: ________ |
| ☐ `value` matches order total | ☐ Pass ☐ Fail | |
| ☐ `currency` correct | ☐ Pass ☐ Fail | |
| ☐ `transaction_id` present | ☐ Pass ☐ Fail | |
| ☐ User data (email) present | ☐ Pass ☐ Fail | |
| ☐ User data hashed correctly | ☐ Pass ☐ Fail | |
| ☐ Enhanced conversions enabled | ☐ Pass ☐ Fail | |
| ☐ Conversion shows in Google Ads | ☐ Pass ☐ Fail | ETA: 30-60 min |

**Test in Google Ads:**
1. Google Ads → Tools → Conversions
2. Find conversion action
3. Check for test conversion
4. Verify enhanced conversion data present

---

## Platform Verification

### GA4 Verification

| Check | Status | Notes |
|-------|--------|-------|
| ☐ GA4 DebugView shows all test events | ☐ Pass ☐ Fail | |
| ☐ Event parameters correct | ☐ Pass ☐ Fail | |
| ☐ User properties present | ☐ Pass ☐ Fail | |
| ☐ No error events | ☐ Pass ☐ Fail | |
| ☐ Realtime report shows activity | ☐ Pass ☐ Fail | Wait 5 min |
| ☐ Events report shows data (next day) | ☐ Pass ☐ Fail | Wait 24 hrs |
| ☐ Conversions report shows purchase (next day) | ☐ Pass ☐ Fail | Wait 24 hrs |
| ☐ Revenue matches test orders | ☐ Pass ☐ Fail | Expected: _____ |

**GA4 DebugView Screenshot:** [Attach]

---

### Meta Events Manager Verification

| Check | Status | Notes |
|-------|--------|-------|
| ☐ Test Events tool shows sGTM events | ☐ Pass ☐ Fail | |
| ☐ Event Match Quality scores visible | ☐ Pass ☐ Fail | Avg: _____ |
| ☐ All EMQ scores 8.0+ | ☐ Pass ☐ Fail | |
| ☐ Deduplication working (single events) | ☐ Pass ☐ Fail | |
| ☐ Events tab shows activity | ☐ Pass ☐ Fail | Wait 15 min |
| ☐ Purchase conversion recorded | ☐ Pass ☐ Fail | Wait 30 min |
| ☐ Attribution working in Ads Manager | ☐ Pass ☐ Fail | Wait 24 hrs |

**Event Match Quality Breakdown:**
- PageView: _____ /10
- ViewContent: _____ /10
- AddToCart: _____ /10
- InitiateCheckout: _____ /10
- Purchase: _____ /10

**Meta Events Manager Screenshot:** [Attach]

---

### Google Ads Verification

| Check | Status | Notes |
|-------|--------|-------|
| ☐ Conversions page shows test conversion | ☐ Pass ☐ Fail | Wait 30-60 min |
| ☐ Conversion value matches order | ☐ Pass ☐ Fail | |
| ☐ Enhanced conversion data present | ☐ Pass ☐ Fail | |
| ☐ Conversion status = "Completed" | ☐ Pass ☐ Fail | |

**Google Ads Screenshot:** [Attach]

---

## Cross-Browser Testing

Test on multiple browsers to ensure compatibility:

### Desktop Browsers

| Browser | Version | Status | Issues |
|---------|---------|--------|--------|
| ☐ Chrome | _____ | ☐ Pass ☐ Fail | |
| ☐ Firefox | _____ | ☐ Pass ☐ Fail | |
| ☐ Safari | _____ | ☐ Pass ☐ Fail | |
| ☐ Edge | _____ | ☐ Pass ☐ Fail | |

### Mobile Browsers

| Browser | Device | Status | Issues |
|---------|--------|--------|--------|
| ☐ Chrome (Android) | _____ | ☐ Pass ☐ Fail | |
| ☐ Safari (iOS) | _____ | ☐ Pass ☐ Fail | |
| ☐ Samsung Internet | _____ | ☐ Pass ☐ Fail | |

**Key Tests for Each Browser:**
- [ ] Events fire correctly
- [ ] No console errors
- [ ] Cookies set properly
- [ ] Purchase tracking works

---

## Privacy & Consent Testing

### Cookie Behavior

| Check | Status | Notes |
|-------|--------|-------|
| ☐ `_ga` cookie set from client domain | ☐ Pass ☐ Fail | |
| ☐ `_ga` cookie has 2-year expiration | ☐ Pass ☐ Fail | |
| ☐ No third-party analytics cookies | ☐ Pass ☐ Fail | |
| ☐ `_fbc` and `_fbp` cookies present (if Meta) | ☐ Pass ☐ Fail | |

### Consent Mode Testing (if applicable)

| Check | Status | Notes |
|-------|--------|-------|
| ☐ Default consent state = denied | ☐ Pass ☐ Fail | |
| ☐ Tags wait for consent update | ☐ Pass ☐ Fail | |
| ☐ Tags fire after consent granted | ☐ Pass ☐ Fail | |
| ☐ Consent state visible in GTM Preview | ☐ Pass ☐ Fail | |
| ☐ GA4 shows consent parameters | ☐ Pass ☐ Fail | |

**Consent Scenarios to Test:**
- [ ] Accept all → All tags fire
- [ ] Deny all → Only necessary tags fire
- [ ] Accept analytics only → GA4 fires, ads don't
- [ ] Accept ads only → Ads fire, analytics in limited mode

---

## Performance Testing

### Page Load Impact

| Metric | Before sGTM | After sGTM | Delta | Status |
|--------|-------------|------------|-------|--------|
| Page Load Time | _____ ms | _____ ms | _____ ms | ☐ Pass ☐ Fail |
| First Contentful Paint | _____ ms | _____ ms | _____ ms | ☐ Pass ☐ Fail |
| Time to Interactive | _____ ms | _____ ms | _____ ms | ☐ Pass ☐ Fail |
| Total Blocking Time | _____ ms | _____ ms | _____ ms | ☐ Pass ☐ Fail |

**Acceptable Performance Impact:** <100ms additional load time

**Tool Used:** ☐ Chrome DevTools  ☐ Lighthouse  ☐ WebPageTest

---

### Server Response Times

| Endpoint | Response Time | Status |
|----------|---------------|--------|
| `/gtm.js` | _____ ms | ☐ Pass ☐ Fail |
| `/g/collect` (GA4) | _____ ms | ☐ Pass ☐ Fail |
| `/healthy` | _____ ms | ☐ Pass ☐ Fail |

**Target Response Time:** <200ms

---

## Error Handling & Edge Cases

### Error Scenarios

| Scenario | Expected Behavior | Status | Notes |
|----------|-------------------|--------|-------|
| ☐ sGTM server temporarily down | Web GTM falls back to direct sending | ☐ Pass ☐ Fail | |
| ☐ Invalid Measurement ID | Error in GTM Preview, no GA4 hits | ☐ Pass ☐ Fail | |
| ☐ Missing user data | Event still sends with available data | ☐ Pass ☐ Fail | |
| ☐ Duplicate transaction_id | GA4 deduplicates automatically | ☐ Pass ☐ Fail | |
| ☐ Currency mismatch | Conversion uses specified currency | ☐ Pass ☐ Fail | |

### Edge Cases

| Test Case | Status | Notes |
|-----------|--------|-------|
| ☐ Purchase with $0 value (free order) | ☐ Pass ☐ Fail | |
| ☐ Purchase with discount code | ☐ Pass ☐ Fail | |
| ☐ Purchase with multiple items | ☐ Pass ☐ Fail | Items: _____ |
| ☐ Refunded order (if tracking refunds) | ☐ Pass ☐ Fail | |
| ☐ Back button after purchase | ☐ Pass ☐ Fail | Should NOT fire duplicate |
| ☐ Direct visit to order confirmation URL | ☐ Pass ☐ Fail | Should NOT fire purchase |

---

## Security & Data Privacy

| Check | Status | Notes |
|-------|--------|-------|
| ☐ PII (email, phone) hashed before sending | ☐ Pass ☐ Fail | |
| ☐ IP addresses redacted (if required by policy) | ☐ Pass ☐ Fail | |
| ☐ No sensitive data in URLs | ☐ Pass ☐ Fail | |
| ☐ HTTPS only (no HTTP traffic) | ☐ Pass ☐ Fail | |
| ☐ API secrets not exposed in client-side code | ☐ Pass ☐ Fail | |
| ☐ Access tokens stored securely | ☐ Pass ☐ Fail | |
| ☐ Container permissions limited | ☐ Pass ☐ Fail | |

---

## Documentation & Handoff

| Item | Status | Notes |
|------|--------|-------|
| ☐ Testing results documented | ☐ Complete | |
| ☐ Screenshots captured | ☐ Complete | Count: _____ |
| ☐ Issues log created | ☐ Complete | Issues: _____ |
| ☐ Client training scheduled | ☐ Complete | Date: _____ |
| ☐ Access credentials documented | ☐ Complete | |
| ☐ Monitoring alerts configured | ☐ Complete | |
| ☐ Support contact provided to client | ☐ Complete | |

---

## Pre-Production Final Checklist

**Before switching from staging to production:**

| Item | Status |
|------|--------|
| ☐ All tests pass on staging environment | ☐ Complete |
| ☐ Client approval received | ☐ Complete |
| ☐ Production GTM containers ready | ☐ Complete |
| ☐ Production credentials configured | ☐ Complete |
| ☐ Debug mode disabled | ☐ Complete |
| ☐ Backup of previous setup created | ☐ Complete |
| ☐ Rollback plan documented | ☐ Complete |
| ☐ Monitoring dashboard set up | ☐ Complete |
| ☐ 24-hour monitoring schedule planned | ☐ Complete |
| ☐ Support team briefed | ☐ Complete |

---

## Post-Launch Monitoring (First 48 Hours)

### Hour 1-2

| Check | Status | Notes |
|-------|--------|-------|
| ☐ GA4 Realtime shows activity | ☐ Pass | |
| ☐ No error spikes in GTM | ☐ Pass | |
| ☐ Server response times normal | ☐ Pass | |
| ☐ At least 1 test purchase completed | ☐ Pass | |

### Hour 24

| Check | Status | Notes |
|-------|--------|-------|
| ☐ GA4 Events report shows yesterday's data | ☐ Pass | |
| ☐ Purchase conversions recorded | ☐ Pass | Count: _____ |
| ☐ Revenue matches expected | ☐ Pass | Expected: _____ |
| ☐ Meta conversions visible | ☐ Pass | Count: _____ |
| ☐ Google Ads conversions visible | ☐ Pass | Count: _____ |
| ☐ No unexpected data gaps | ☐ Pass | |

### Hour 48

| Check | Status | Notes |
|-------|--------|-------|
| ☐ Data flow consistent | ☐ Pass | |
| ☐ No client-reported issues | ☐ Pass | |
| ☐ Server costs within expected range | ☐ Pass | Cost: _____ |
| ☐ Performance acceptable | ☐ Pass | |
| ☐ Ready to close monitoring period | ☐ Pass | |

---

## Known Issues & Resolutions

| Issue # | Description | Severity | Resolution | Status |
|---------|-------------|----------|------------|--------|
| 1 | | ☐ High ☐ Med ☐ Low | | ☐ Open ☐ Resolved |
| 2 | | ☐ High ☐ Med ☐ Low | | ☐ Open ☐ Resolved |
| 3 | | ☐ High ☐ Med ☐ Low | | ☐ Open ☐ Resolved |

---

## Sign-Off

### Testing Team

**Tester Name:** ________________
**Date Completed:** ________________
**Signature:** ________________

**All Tests Pass:** ☐ Yes  ☐ No (see issues log)

### Client Approval (if applicable)

**Client Name:** ________________
**Date Approved:** ________________
**Signature:** ________________

---

## Appendix: Testing Tools

### Recommended Tools

1. **GTM Preview Mode**
   - URL: GTM container → Preview button
   - Use for: Tag firing verification

2. **GA4 DebugView**
   - URL: GA4 Property → Admin → DebugView
   - Use for: Real-time event verification

3. **Meta Test Events Tool**
   - URL: Events Manager → Test Events
   - Use for: CAPI testing, EMQ scores

4. **Google Ads Conversions**
   - URL: Google Ads → Tools → Conversions
   - Use for: Conversion verification

5. **Chrome DevTools**
   - Network tab: Monitor requests
   - Console: Check for errors
   - Application tab: Inspect cookies

6. **Browser Extensions**
   - Google Tag Assistant Legacy
   - Meta Pixel Helper
   - GA4 Event Tracker

### Test Event URLs

- GA4 DebugView: `https://analytics.google.com/analytics/web/#/a{account-id}/p{property-id}/reports/realtime-debug`
- Meta Test Events: `https://business.facebook.com/events_manager2/test_events/`
- Google Ads Conversions: `https://ads.google.com/aw/conversions/`

---

**Checklist Version:** 1.0.0
**Last Updated:** January 2025
**Created By:** JY/co
**Support:** support@jyco.io

---

**Testing completed. Implementation ready for production.**
