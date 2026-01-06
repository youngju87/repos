# JY/co Server-Side Tracking
## Master Setup Guide - Part 2

**Continuation from Part 1**

---

## Chapter 4: GA4 Server-Side Configuration {#chapter-4-ga4-server-side}

### 4.1 Why GA4 via sGTM?

#### Benefits of Server-Side GA4

| Benefit | Client-Side Only | + Server-Side |
|---------|------------------|---------------|
| **Data collection rate** | 60-80% (ad blockers, ITP) | 95-99% |
| **Cookie lifetime** | 7 days (Safari) | 2 years (first-party) |
| **PII handling** | Sent from browser | Redacted/hashed server-side |
| **Data enrichment** | Limited | Server-side data joining |
| **Reliability** | JavaScript errors affect tracking | Server ensures delivery |

#### How GA4 sGTM Works

```
1. User interacts with page
   ↓
2. Web GTM fires GA4 tag
   - Configured with server_container_url
   ↓
3. Data sent to sGTM (not directly to GA4)
   - URL: https://gtm.yourdomain.com/g/collect
   ↓
4. sGTM GA4 Client receives request
   - Parses Measurement Protocol format
   ↓
5. sGTM GA4 Tag fires
   - Sends to Google Analytics 4
   - Can enrich with server-side data
   ↓
6. Data appears in GA4 reports
```

### 4.2 GA4 Client Setup

The GA4 Client is already created when you provision the server. Here's how to configure it:

#### Client Configuration

1. In GTM Server container → **Clients**
2. You should see **"Client - GA4"** (or create new)
3. Click to edit

**Configuration Settings:**

```
Client Name: Client - GA4
Client Type: GA4

Settings:
┌─────────────────────────────────────────────────┐
│ Request Paths                                    │
├─────────────────────────────────────────────────┤
│ ☑ Claim GET requests to default GA4 paths      │
│   Paths: /g/collect                             │
│                                                  │
│ ☑ Claim POST requests to default GA4 paths     │
│   Paths: /g/collect, /g/batch                   │
│                                                  │
│ ☐ Claim GET requests to default UA paths       │
│   (Leave unchecked unless using Universal Ana.) │
│                                                  │
│ ☐ Claim POST requests to default UA paths      │
│   (Leave unchecked unless using Universal Ana.) │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Additional Settings                              │
├─────────────────────────────────────────────────┤
│ ☑ Activate Preview Header Validation           │
│   (Required for GTM preview mode)               │
│                                                  │
│ ☑ Compress server response                     │
│   (Reduces bandwidth, improves speed)           │
│                                                  │
│ ☐ Include original request IP in logs          │
│   (Enable if you need IP for debugging)        │
└─────────────────────────────────────────────────┘
```

**[INSERT SCREENSHOT: GA4 Client configuration]**

4. Click **Save**

#### What the GA4 Client Does

When a request arrives at `/g/collect`:

1. **Parses** the Measurement Protocol payload
2. **Extracts** event parameters:
   - `event_name` (e.g., "purchase")
   - `event_params` (e.g., transaction_id, value)
   - `user_properties`
   - `items` (ecommerce array)
3. **Makes data available** to variables and tags via:
   - `{{Event Name}}` built-in variable
   - Event Data variables for parameters

### 4.3 GA4 Tag Configuration

Create a single GA4 tag that fires for all events:

#### Step 1: Create GA4 Tag

1. **Tags** → **New**
2. Click tag configuration
3. **Tag Type:** Google Analytics: GA4
4. Configuration:

```
Tag Name: GA4 - All Events
Tag Type: Google Analytics: GA4

┌─────────────────────────────────────────────────┐
│ Configuration                                    │
├─────────────────────────────────────────────────┤
│ Event Name: {{Event Name}}                      │
│   (Built-in variable, auto-populated)           │
│                                                  │
│ Configuration Tag: [Leave blank]                │
│   (Not needed in server-side)                   │
│                                                  │
│ Measurement ID: Inherit from client             │
│   ○ Inherit from client (recommended)           │
│   ○ Override (if you need different ID)         │
│       [G-XXXXXXXXXX]                            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Event Parameters                                 │
├─────────────────────────────────────────────────┤
│ (Usually auto-included from client request)     │
│                                                  │
│ Add custom parameters if needed:                │
│ ┌───────────────┬───────────────────────────┐  │
│ │ Parameter     │ Value                     │  │
│ ├───────────────┼───────────────────────────┤  │
│ │ server_       │ true                      │  │
│ │ processed     │                           │  │
│ └───────────────┴───────────────────────────┘  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ User Properties                                  │
├─────────────────────────────────────────────────┤
│ ┌───────────────┬───────────────────────────┐  │
│ │ Property      │ Value                     │  │
│ ├───────────────┼───────────────────────────┤  │
│ │ user_id       │ {{User - user_id}}        │  │
│ └───────────────┴───────────────────────────┘  │
│                                                  │
│ (Other properties auto-included from request)   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Advanced Settings                                │
├─────────────────────────────────────────────────┤
│ Send to:                                         │
│   ○ Google Analytics 4 (default)                │
│   ○ Both GA4 and Big Query (if BQ linked)       │
│                                                  │
│ ☑ Redact visitor IP address                    │
│   (Recommended for privacy)                     │
│                                                  │
│ Server Container URL:                           │
│   [Leave blank - not needed in server container]│
└─────────────────────────────────────────────────┘
```

**[INSERT SCREENSHOT: GA4 tag configuration]**

#### Step 2: Set Trigger

1. **Triggering** section → Click to add trigger
2. Create new trigger:

```
Trigger Name: Trigger - All GA4 Events
Trigger Type: Custom

This trigger fires on: Some Events

Conditions:
┌────────────────┬──────────┬────────────┐
│ Variable       │ Operator │ Value      │
├────────────────┼──────────┼────────────┤
│ Client Name    │ equals   │ GA4        │
└────────────────┴──────────┴────────────┘
```

3. **Save trigger**
4. **Save tag**

**[INSERT SCREENSHOT: Trigger configuration]**

### 4.4 Event Parameter Mapping

GA4 events arrive with parameters. Here's how they flow:

#### Automatic Parameters

These are automatically sent from client to GA4 tag:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `event_name` | Event type | `purchase`, `page_view` |
| `page_location` | Full URL | `https://example.com/product` |
| `page_title` | Page title | `Product Name - Store` |
| `page_referrer` | Previous page | `https://google.com` |
| `engagement_time_msec` | Time on page | `15000` |
| `session_id` | Session identifier | `1234567890` |
| `ga_session_id` | GA session ID | `1234567890` |

#### Ecommerce Parameters

For ecommerce events (purchase, add_to_cart, etc.):

| Parameter | Description | Example |
|-----------|-------------|---------|
| `transaction_id` | Order ID | `ORDER-12345` |
| `value` | Transaction value | `99.99` |
| `currency` | Currency code | `USD` |
| `tax` | Tax amount | `8.99` |
| `shipping` | Shipping cost | `5.00` |
| `items` | Products array | `[{item_id: "123", ...}]` |

#### Custom Parameters

You can add custom parameters server-side:

```javascript
// Example: Add server timestamp
{
  "event_name": "purchase",
  "event_params": {
    "transaction_id": "ORDER-12345",
    "value": 99.99,
    "server_timestamp": "2025-01-15T10:30:00Z",  // Added server-side
    "server_processed": true                      // Custom flag
  }
}
```

**To add in GA4 tag:**

Event Parameters section → Add row:
- Parameter Name: `server_timestamp`
- Value: `{{Current Timestamp}}` (Custom JS variable)

### 4.5 User Identification

#### User ID

If you have logged-in users, send `user_id` to stitch sessions:

**From Web GTM:**
```javascript
// In dataLayer push
dataLayer.push({
  'user_id': '12345'  // Customer ID
});
```

**In sGTM GA4 Tag:**
- User Properties → Add row:
  - Property: `user_id`
  - Value: `{{User - user_id}}` (Event Data variable)

#### Client ID

GA4 automatically handles client ID (_ga cookie):

- **Web GTM:** Sends existing `_ga` cookie value
- **sGTM:** Forwards to GA4
- **Result:** Same user tracked across sessions

#### Enhanced User Data (Optional)

For better attribution, you can send hashed PII:

**Create variables:**

```
Variable Name: User - email_sha256
Variable Type: Custom JavaScript

function() {
  var email = data.user_email; // From event parameter
  if (!email) return undefined;

  // SHA-256 hashing (use native sGTM function)
  return sha256(email.toLowerCase().trim());
}
```

**Add to GA4 tag** (User Properties):
- `user_email_sha256`: `{{User - email_sha256}}`

### 4.6 Consent Mode Integration

#### How Consent Mode Works with sGTM

```
1. User visits page (no consent yet)
   ↓
2. Consent defaults set in web GTM
   gtag('consent', 'default', {
     analytics_storage: 'denied'
   });
   ↓
3. GA4 events sent to sGTM with consent state
   Header: x-ga-gcs = "G100" (analytics denied)
   ↓
4. User accepts consent
   gtag('consent', 'update', {
     analytics_storage: 'granted'
   });
   ↓
5. Subsequent events sent with new state
   Header: x-ga-gcs = "G110" (analytics granted)
   ↓
6. sGTM respects consent state
   - Denied: Cookieless ping (no user data)
   - Granted: Full tracking
```

#### Reading Consent State in sGTM

**Create variable:**

```
Variable Name: Consent - Analytics Storage
Variable Type: HTTP Request
Component Type: Headers
Header Name: x-ga-gcs

Returns: G1 string
- Contains '1' at position 2 = analytics_storage granted
- Contains '0' at position 2 = analytics_storage denied
```

**Use in trigger conditions:**

```
Trigger Name: Trigger - GA4 With Consent
Conditions:
- Client Name equals GA4
- Consent - Analytics Storage contains G1
  (Position 2 = '1' means granted)
```

### 4.7 Debugging GA4 Server-Side

#### Enable Debug Mode

**In Web GTM:**

```javascript
// Add to GA4 Configuration tag
gtag('config', 'G-XXXXXXXXXX', {
  'debug_mode': true
});
```

**Or via URL parameter:**

```
https://yoursite.com?gtm_debug=true
```

#### Check sGTM Preview

1. In GTM Server container → Click **Preview**
2. Copy the debug URL parameter
3. Add to your website: `?gtm_debug=x_abcdef123`
4. Browse site, trigger events
5. In Preview panel:
   - **Requests** tab: See incoming GA4 requests
   - **Tags** tab: See GA4 tag firing

**[INSERT SCREENSHOT: sGTM Preview mode showing GA4 requests]**

#### Verify in GA4 DebugView

1. GA4 property → **Configure** → **DebugView**
2. Should see events in real-time
3. Check event parameters

**[INSERT SCREENSHOT: GA4 DebugView with sGTM events]**

#### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| No events in DebugView | `debug_mode` not enabled | Enable in web GTM config tag |
| Events show but no data | Parameters not mapping | Check Event Data variables |
| User properties missing | Not set in GA4 tag | Add to User Properties section |
| Duplicate events | Both client + server tags | Disable client-side GA4 tag (keep only sGTM) |

---

## Chapter 5: Meta (Facebook) Conversions API {#chapter-5-meta-conversions-api}

### 5.1 Why Meta CAPI?

#### The iOS 14.5+ Problem

Since iOS 14.5 (April 2021), Apple requires apps to show App Tracking Transparency (ATT) prompt. Result:
- ~70% of iOS users opt out of tracking
- Meta Pixel can't track post-click conversions
- Attribution window reduced from 28 days → 7 days (web) or 1 day (app)
- Campaign performance declines

#### How CAPI Helps

**Meta Conversions API** sends conversion data directly from your server to Meta:

| Metric | Pixel Only | Pixel + CAPI |
|--------|------------|--------------|
| **Conversions captured** | 50-70% | 85-95% |
| **Attribution window** | 7 days click, 1 day view | 28 days click, 1 day view |
| **Event Match Quality** | Poor (60-70) | Good (85-95+) |
| **Ad performance** | Declining | Improved |
| **iOS tracking** | Limited | Enhanced |

#### CAPI vs. Pixel

```
Traditional Pixel Only:
User clicks ad → Lands on site → Pixel fires → Converts
                    ↓ (If blocked by ATT or ad blocker)
                  ❌ No tracking

With CAPI:
User clicks ad → Lands on site → Pixel fires → Converts
                                              ↓
                                    sGTM sends CAPI event
                                              ↓
                                    ✅ Conversion tracked
```

### 5.2 Prerequisites

Before implementing Meta CAPI, gather these credentials:

#### Checklist

- [ ] **Meta Pixel ID**
  - Location: Events Manager → Data Sources → Select Pixel → Settings
  - Format: 15-digit number (e.g., `1234567890123456`)

- [ ] **Meta Conversions API Access Token**
  - Location: Business Settings → System Users → Create/Select → Generate New Token
  - Permissions required: `ads_management`, `business_management`
  - Format: Long alphanumeric string starting with `EAA...`

- [ ] **Test Event Code** (optional but recommended)
  - Location: Events Manager → Test Events → Generate Test Event Code
  - Format: `TEST12345`

- [ ] **Meta Pixel already installed on website**
  - Required for event deduplication
  - Both Pixel and CAPI send events, Meta deduplicates using event_id

#### Generating Access Token (Detailed Steps)

1. Go to [Facebook Business Settings](https://business.facebook.com/settings/)
2. Left menu → **Users** → **System Users**
3. Click **"Add"** → **Create System User**
   - Name: `sGTM Server-Side Tracking`
   - Role: Admin
4. Click **"Create System User"**
5. Click **"Generate New Token"**
6. Select App: Choose your Facebook app (or create one)
7. Token Expiration: **Never** (recommended for server use)
8. Permissions: Check:
   - ✅ `ads_management`
   - ✅ `business_management`
9. Click **"Generate Token"**
10. **Copy token immediately** (you won't see it again)
11. Store securely (password manager, environment variable, etc.)

**[INSERT SCREENSHOT: System user token generation]**

#### Assigning Assets to System User

1. Still in System Users → Select the user you created
2. Click **"Add Assets"**
3. **Ad Accounts** → Select relevant ad accounts → **Save Changes**
4. **Pixels** → Select your pixel → **Save Changes**

**[INSERT SCREENSHOT: Assigning pixel to system user]**

### 5.3 Meta Client vs. GA4 Client

There are two approaches to send data to Meta CAPI from sGTM:

#### Approach 1: Use GA4 Client (Recommended)

**How it works:**
- Web GTM fires GA4 events with Measurement Protocol
- sGTM GA4 Client receives events
- Meta CAPI tags transform GA4 events → Meta events
- Sent to Meta Conversions API

**Pros:**
- ✅ No additional client needed
- ✅ Easier setup (one transport method)
- ✅ Consistent event naming across platforms

**Cons:**
- ⚠️ Must map GA4 event names → Meta event names

**Use when:** You're already using GA4 sGTM (most common)

#### Approach 2: Use Dedicated Meta Client

**How it works:**
- Web GTM fires Meta Pixel events
- sGTM Meta Client receives events
- Meta CAPI tags send to Meta Conversions API

**Pros:**
- ✅ Direct Pixel format (no mapping needed)
- ✅ Easier to replicate exact Pixel behavior

**Cons:**
- ⚠️ Requires separate transport setup
- ⚠️ More complex web GTM configuration

**Use when:** Not using GA4, or need exact Pixel parity

**Recommendation:** Use Approach 1 (GA4 Client) for simplicity.

### 5.4 Event Mapping (GA4 to Meta)

Map GA4 events to Meta Conversions API events:

| GA4 Event | Meta CAPI Event | Notes |
|-----------|-----------------|-------|
| `page_view` | `PageView` | All pages |
| `view_item` | `ViewContent` | Product detail pages |
| `view_item_list` | `ViewContent` | Optional: or use for categories |
| `add_to_cart` | `AddToCart` | |
| `begin_checkout` | `InitiateCheckout` | |
| `add_payment_info` | `AddPaymentInfo` | |
| `purchase` | `Purchase` | ⭐ Most important |
| `search` | `Search` | With `search_string` parameter |
| `sign_up` | `CompleteRegistration` | |
| `generate_lead` | `Lead` | Form submissions |

### 5.5 Required vs. Optional Parameters

#### Required Parameters (All Events)

| Parameter | Description | Example | How to Get |
|-----------|-------------|---------|------------|
| `event_name` | Meta event name | `Purchase` | Hardcoded per tag |
| `event_time` | Unix timestamp | `1673456789` | `{{Event - timestamp}}` |
| `action_source` | Where event occurred | `website` | Constant: `website` |
| `event_source_url` | Page URL | `https://example.com/checkout` | `{{Page - URL}}` |
| `event_id` | Unique dedup ID | `purchase_12345_abc` | `{{Event - event_id}}` |

#### User Data Parameters (Highly Recommended)

More user data = better Event Match Quality:

| Parameter | Description | Example | Hashing |
|-----------|-------------|---------|---------|
| `em` | Email | `user@example.com` | SHA-256 |
| `ph` | Phone | `+15551234567` | SHA-256 |
| `fn` | First name | `john` | SHA-256 |
| `ln` | Last name | `smith` | SHA-256 |
| `ct` | City | `new york` | SHA-256 |
| `st` | State | `ny` | SHA-256 |
| `zp` | Zip code | `10001` | SHA-256 |
| `country` | Country code | `us` | SHA-256 |
| `external_id` | User ID | `12345` | SHA-256 |
| `client_ip_address` | IP address | `192.168.1.1` | None |
| `client_user_agent` | User agent | `Mozilla/5.0...` | None |
| `fbc` | Facebook click ID | `fb.1.123...` | None |
| `fbp` | Facebook browser ID | `fb.1.123...` | None |

**⚠️ Important:** Meta automatically hashes parameters in the `user_data` object. You can send plain text or pre-hashed (SHA-256).

#### Custom Data Parameters (Event-Specific)

**For Purchase:**

| Parameter | Description | Example |
|-----------|-------------|---------|
| `currency` | ISO currency code | `USD` |
| `value` | Transaction value | `99.99` |
| `content_ids` | Product IDs | `["123", "456"]` |
| `content_type` | Type of content | `product` |
| `contents` | Products array | `[{id:"123", quantity:1}]` |
| `num_items` | Item count | `3` |

**For AddToCart / ViewContent:**

| Parameter | Description | Example |
|-----------|-------------|---------|
| `currency` | ISO currency code | `USD` |
| `value` | Product value | `29.99` |
| `content_ids` | Product ID(s) | `["123"]` |
| `content_name` | Product name | `Blue T-Shirt` |
| `content_category` | Category | `Apparel/Men` |

**For Search:**

| Parameter | Description | Example |
|-----------|-------------|---------|
| `search_string` | Search query | `running shoes` |

### 5.6 User Data Parameters (Hashing)

#### Why Hashing Matters

Meta requires personal data to be hashed (SHA-256) for privacy:

```
Plaintext: user@example.com
SHA-256:   b4c9a289323b21a01c3e940f150eb9b8c542587f1abfd8f0e1cc1ffc5e475514
```

#### Hashing in sGTM

**Option 1: Let Meta Auto-Hash**

Meta's official CAPI tag automatically hashes user data. Just pass plaintext:

```javascript
// In Meta CAPI tag configuration
User Data:
- em: {{User - email}}        // Plain: user@example.com
- ph: {{User - phone}}        // Plain: +15551234567
- fn: {{User - first_name}}   // Plain: John

// Meta tag hashes automatically before sending
```

**Option 2: Hash Server-Side First**

Create SHA-256 variables:

```javascript
// Variable Name: User - email_sha256
// Variable Type: Custom JavaScript

function() {
  var email = data.user_email; // From event parameter
  if (!email) return undefined;

  // Normalize
  email = email.toLowerCase().trim();

  // SHA-256 hash (use native sGTM function)
  return sha256(email);
}
```

Then use in Meta tag:
```javascript
User Data:
- em: {{User - email_sha256}}  // Pre-hashed
```

**Recommendation:** Use Option 1 (auto-hash) unless you need hashes for other platforms too.

#### Data Normalization Rules

Before hashing, normalize data according to Meta's requirements:

| Field | Normalization | Example |
|-------|---------------|---------|
| **Email** | Lowercase, trim spaces | `User@Example.com` → `user@example.com` |
| **Phone** | Remove spaces, dashes, parentheses;<br>Include country code | `(555) 123-4567` → `15551234567` |
| **First/Last Name** | Lowercase, remove spaces | `John Smith` → first: `john`, last: `smith` |
| **City** | Lowercase, remove spaces | `New York` → `newyork` |
| **State** | 2-letter code, lowercase | `New York` → `ny` |
| **Zip** | Remove spaces, dashes | `10001-1234` → `10001` |
| **Country** | 2-letter ISO code, lowercase | `United States` → `us` |

### 5.7 Event Deduplication

**Critical:** Both browser Pixel and server CAPI send the same events. Meta deduplicates using `event_id`.

#### How Deduplication Works

```
Timeline:
T+0s: User clicks "Purchase" button
      ↓
T+1s: Browser Pixel fires
      fbq('track', 'Purchase', {...}, {eventID: 'abc123'});
      → Sent to Meta
      ↓
T+2s: Server CAPI fires
      event_id: 'abc123'
      → Sent to Meta
      ↓
Meta sees both events with same event_id
→ Keeps only ONE event (first received)
✅ No duplicate conversions
```

#### Generating event_id

**In Web GTM** (before sending to sGTM):

```javascript
// Variable Name: Generate Event ID
// Variable Type: Custom JavaScript

function() {
  var eventName = {{Event}};
  var timestamp = Date.now();
  var random = Math.random().toString(36).substring(2, 10);

  return eventName + '_' + timestamp + '_' + random;
}

// Returns: "purchase_1673456789_a3b5c7d9"
```

**Use in both Pixel and sGTM:**

**Web GTM Pixel Tag:**
```javascript
fbq('track', 'Purchase', {
  value: 99.99,
  currency: 'USD'
}, {
  eventID: {{Generate Event ID}}  // ← Same ID
});
```

**sGTM Meta CAPI Tag:**
```
event_id: {{Event - event_id}}  // ← Receives same ID from web
```

**⚠️ Critical:** The `event_id` must be **identical** in both Pixel and CAPI events.

### 5.8 Test Events

Use Meta's Test Events tool to verify CAPI is working:

#### Setup Test Events

1. Go to [Events Manager](https://business.facebook.com/events_manager/)
2. Select your Pixel
3. **Test Events** tab
4. Click **"Generate Test Event Code"**
5. Copy the test code (e.g., `TEST12345`)

**[INSERT SCREENSHOT: Test Events page]**

#### Send Test Event

**In sGTM Meta CAPI Tag:**

Add to Custom Data:
- Parameter: `test_event_code`
- Value: `TEST12345` (your code)

**Or create a Constant variable:**
```
Variable Name: Const - Meta Test Event Code
Value: TEST12345
```

Use in tag:
```
test_event_code: {{Const - Meta Test Event Code}}
```

#### Verify Test Events

1. Trigger a purchase on your site
2. Go to Events Manager → Test Events
3. You should see the event appear within 30 seconds

**[INSERT SCREENSHOT: Test event received]**

**What to check:**
- ✅ Event name correct (e.g., `Purchase`)
- ✅ Event time recent
- ✅ User data present (email, phone, etc.)
- ✅ Event parameters correct (value, currency, etc.)

#### Remove Test Code Before Launch

**⚠️ Important:** Remove `test_event_code` from production tags!

Test events don't count toward conversion optimization.

### 5.9 Event Match Quality Score

Event Match Quality (EMQ) shows how well Meta can match events to users.

#### Score Ranges

| Score | Quality | Typical User Data |
|-------|---------|-------------------|
| **0-3.4** | Poor | IP + User Agent only |
| **3.5-5.4** | OK | + fbp/fbc cookies |
| **5.5-6.9** | Good | + email OR phone |
| **7.0-8.9** | Great | + email + phone + name |
| **9.0-10** | Excellent | + multiple parameters |

#### How to Improve EMQ

**Add more user parameters:**

| Added Parameter | EMQ Increase |
|----------------|--------------|
| + Email | +2.0 to +3.0 |
| + Phone | +1.5 to +2.5 |
| + First Name + Last Name | +0.5 to +1.0 |
| + City + State + Zip | +0.5 to +1.0 |
| + external_id (user ID) | +0.5 to +1.0 |

**Example progression:**

```
Initial: IP + User Agent only
EMQ: 2.5 (Poor)
↓
+ fbp cookie
EMQ: 4.0 (OK)
↓
+ Email
EMQ: 6.5 (Good)
↓
+ Phone
EMQ: 8.0 (Great)
↓
+ Name + Address
EMQ: 9.2 (Excellent)
```

#### Where to Find EMQ

1. Events Manager → Your Pixel
2. **Overview** tab
3. Look for "Event Match Quality" metric
4. Click "View Details" for per-event breakdown

**[INSERT SCREENSHOT: Event Match Quality dashboard]**

**Target:** 7.0+ for optimal performance

---

*[Continuing with remaining chapters in next message due to length...]*

**Status:** Chapters 1-5 complete (Infrastructure, GA4, Meta CAPI)
**Next:** Chapters 6-12 (Google Ads, TikTok, Pinterest, Web GTM, Testing, Consent, Monitoring)

Would you like me to continue with the remaining chapters, or should I proceed to create the other documentation files (platform-specific guides, container template, etc.)?
