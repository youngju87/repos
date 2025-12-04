# JY/co Server-Side Tracking
## Master Setup Guide

**Version:** 1.0.0
**Last Updated:** January 2025
**Author:** JY/co
**Service:** JY/co Server-Side Tracking

---

## Document Information

**Purpose:** Comprehensive guide for implementing Google Tag Manager Server-Side (sGTM) with multi-platform integrations.

**Audience:**
- Internal implementation team
- Technical clients
- Subcontractors and partners

**Prerequisites:**
- Intermediate knowledge of Google Tag Manager
- Basic understanding of DNS and domain configuration
- Access to Google Cloud Platform or Stape.io account
- Admin access to marketing platforms (Meta, Google Ads, etc.)

---

## Table of Contents

1. [Introduction to Server-Side Tracking](#chapter-1-introduction)
2. [Hosting & Infrastructure Setup](#chapter-2-hosting--infrastructure)
3. [GTM Server Container Configuration](#chapter-3-gtm-server-container)
4. [GA4 Server-Side Configuration](#chapter-4-ga4-server-side)
5. [Meta (Facebook) Conversions API](#chapter-5-meta-conversions-api)
6. [Google Ads Enhanced Conversions](#chapter-6-google-ads-enhanced-conversions)
7. [TikTok Events API](#chapter-7-tiktok-events-api)
8. [Pinterest Conversions API](#chapter-8-pinterest-conversions-api)
9. [Web Container Integration](#chapter-9-web-container-integration)
10. [Testing & Debugging](#chapter-10-testing--debugging)
11. [Consent Mode Integration](#chapter-11-consent-mode)
12. [Monitoring & Maintenance](#chapter-12-monitoring--maintenance)

---

## Chapter 1: Introduction to Server-Side Tracking {#chapter-1-introduction}

### 1.1 What is GTM Server-Side?

Google Tag Manager Server-Side (sGTM) is a server-based tag management solution that fundamentally changes how tracking data flows from your website to marketing and analytics platforms.

**Traditional Client-Side Tracking:**
```
User Browser → Third-Party Scripts → Marketing Platforms
                (gtag.js, fbq, etc.)
```

**Server-Side Tracking:**
```
User Browser → Your Server → Marketing Platforms
    (GTM Web)   (sGTM)       (API calls)
```

#### How It Works

1. **Data Collection:** Your website sends data to a server container you control
2. **Server Processing:** The server validates, processes, and enriches the data
3. **Distribution:** Server sends data to marketing platforms via server-to-server API calls

#### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User's Browser                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Web GTM Container (Client-Side)            │    │
│  │  - Collects user interactions                       │    │
│  │  - Pushes to dataLayer                             │    │
│  │  - Sends to sGTM server                            │    │
│  └─────────────────┬──────────────────────────────────┘    │
│                    │                                        │
└────────────────────┼────────────────────────────────────────┘
                     │
                     │ HTTPS Request
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              sGTM Server (gtm.yourdomain.com)               │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Clients (Receive incoming data)                      │  │
│  │  - GA4 Client                                         │  │
│  │  - Universal Analytics Client (if needed)            │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│                     ▼                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Server-Side Tags (Process & send data)              │  │
│  │  - GA4 Tag                                            │  │
│  │  - Meta CAPI Tag                                      │  │
│  │  - Google Ads Tag                                     │  │
│  │  - TikTok Events API Tag                             │  │
│  │  - Pinterest Conversions API Tag                     │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
└─────────────────────┼───────────────────────────────────────┘
                      │
                      │ Server-to-Server API Calls
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Marketing Platforms                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   GA4    │  │   Meta   │  │Google Ads│  │  TikTok  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Benefits of Server-Side Tracking

#### Data Quality Benefits

| Benefit | Explanation | Impact |
|---------|-------------|--------|
| **Bypass Ad Blockers** | Server requests aren't blocked by browser extensions | Recover 20-40% of lost tracking data |
| **Extended Cookie Lifetime** | First-party cookies last 2 years vs. 7 days (Safari ITP) | Better user attribution and retargeting |
| **ITP/ETP Resistance** | Not subject to Intelligent Tracking Prevention | More accurate conversion attribution |
| **Reduced Data Loss** | Less impacted by browser privacy features | Improved data completeness |

#### Privacy & Compliance Benefits

| Benefit | Explanation | Impact |
|---------|-------------|--------|
| **Data Control** | See and control exactly what's sent to each platform | Better GDPR/CCPA compliance |
| **PII Handling** | Hash or redact PII server-side before sending | Reduced privacy risk |
| **Consent Management** | Server-side consent enforcement | Consistent consent handling |
| **Data Minimization** | Send only necessary data to each platform | Privacy-friendly tracking |

#### Performance Benefits

| Benefit | Explanation | Impact |
|---------|-------------|--------|
| **Faster Page Load** | Fewer client-side scripts = less JavaScript | Improved Core Web Vitals |
| **Reduced Network Requests** | Single request to sGTM vs. multiple to platforms | Better mobile performance |
| **Async Processing** | Server handles API calls asynchronously | No impact on page speed |

#### Business Benefits

| Benefit | Explanation | Impact |
|---------|-------------|--------|
| **Better Ad Performance** | Higher data quality = better targeting | Improved ROAS, lower CPA |
| **Future-Proof** | Ready for cookieless future | Sustainable tracking strategy |
| **Platform Consistency** | Same data sent to all platforms | Consistent reporting |
| **Enhanced Conversions** | Server-side user data enrichment | Better conversion attribution |

### 1.3 When to Recommend sGTM

#### Primary Indicators

✅ **Strong Candidates:**
- Ecommerce stores with >$10,000/month ad spend
- High-value conversion tracking (B2B leads, SaaS signups)
- Safari/iOS traffic >30% of total
- Privacy-conscious industries (healthcare, finance, legal)
- Currently experiencing data loss from ad blockers
- Multiple marketing platforms in use

✅ **Good Candidates:**
- Growing advertising budgets
- Need for enhanced conversions (Google Ads, Meta)
- Regulatory compliance requirements (GDPR, CCPA)
- Poor Event Match Quality scores (Meta)
- Declining ROAS over time

❌ **Not Recommended:**
- Very small budgets (<$5,000/month total ad spend)
- Single platform tracking only
- No technical resources for implementation
- Client unwilling to handle hosting costs

#### ROI Calculation Example

**Scenario:** Ecommerce store with $50,000/month ad spend

| Metric | Before sGTM | After sGTM | Improvement |
|--------|-------------|------------|-------------|
| Tracked Conversions | 150/month | 210/month | +40% |
| Cost Per Acquisition | $333 | $238 | -28% |
| ROAS | 3.0x | 4.2x | +40% |
| **Monthly Benefit** | - | **+$9,000** | - |

**Investment:**
- Implementation: $3,500-7,500 (one-time)
- Hosting: $50-200/month

**Payback Period:** <1 month

### 1.4 Architecture Overview

#### Key Components

**1. Clients**
- Receive incoming HTTP requests from web/app
- Parse request data into usable format
- Most common: GA4 Client, Universal Analytics Client

**2. Tags**
- Process data and send to destination platforms
- Examples: GA4 Tag, Meta CAPI Tag, Google Ads Tag
- Can transform, enrich, or filter data before sending

**3. Triggers**
- Determine when tags should fire
- Based on client name, event name, or custom conditions
- More complex logic than web GTM triggers

**4. Variables**
- Extract data from incoming requests
- Transform data (hashing, formatting, etc.)
- Store constants (API keys, IDs)

**5. Transport**
- How data gets from web to server
- GA4: Built-in transport via Measurement Protocol
- Custom: Can use sendBeacon, fetch, or XHR

#### Data Flow Example: Purchase Event

```
1. User completes purchase
   ↓
2. Web GTM fires GA4 Event Tag
   - Event: purchase
   - Parameters: transaction_id, value, items, etc.
   ↓
3. GA4 tag sends to server_container_url
   - URL: https://gtm.clientdomain.com/g/collect
   ↓
4. sGTM receives request at GA4 Client
   - Client parses GA4 protocol
   - Extracts event data
   ↓
5. Triggers evaluate
   - "Trigger - Purchase Event" fires
   ↓
6. Multiple tags fire in parallel:
   - GA4 Tag → Google Analytics 4
   - Meta CAPI Tag → Facebook Conversions API
   - Google Ads Tag → Google Ads
   - TikTok Tag → TikTok Events API
   ↓
7. Each platform receives data
   - Deduplicated with browser events
   - Enhanced with server-side data
```

### 1.5 Cost Considerations

#### Hosting Costs

**Option 1: Google Cloud Run (Recommended)**

| Traffic Level | Estimated Cost | Best For |
|---------------|----------------|----------|
| <1M requests/mo | $0 (free tier) | Small sites, testing |
| 1-10M requests/mo | $20-50/mo | Most implementations |
| 10-50M requests/mo | $50-200/mo | High-traffic sites |
| 50M+ requests/mo | $200-500/mo | Enterprise |

**Pricing factors:**
- Requests (per 1M): ~$0.40
- CPU time: ~$0.00002400 per vCPU-second
- Memory: ~$0.00000250 per GiB-second
- Network egress: First 1GB free, then ~$0.12/GB

**Option 2: Stape.io (Managed Hosting)**

| Plan | Price | Requests | Best For |
|------|-------|----------|----------|
| Starter | $20/mo | 1M/mo | Small sites |
| Business | $50/mo | 10M/mo | Growing sites |
| Pro | $100/mo | 50M/mo | Large sites |
| Enterprise | $200+/mo | 100M+/mo | Enterprise |

**Includes:**
- Managed infrastructure
- Automatic scaling
- SSL certificate
- Email support
- No GCP account needed

**Option 3: AWS (via Stape)**

| Traffic Level | Estimated Cost | Best For |
|---------------|----------------|----------|
| 1-10M requests/mo | $30-60/mo | AWS-native clients |
| 10-50M requests/mo | $60-150/mo | AWS infrastructure |

**Option 4: Addingwell (EU Hosting)**

| Plan | Price | Best For |
|------|-------|----------|
| Starter | €49/mo | EU data residency |
| Business | €99/mo | GDPR compliance |

#### Implementation Costs

**Internal Costs (Your Time):**

| Component | Estimated Hours | Notes |
|-----------|----------------|-------|
| Infrastructure setup | 2-4 hours | First time: 4 hours, subsequent: 2 hours |
| GA4 configuration | 1-2 hours | Standard setup |
| Meta CAPI | 2-3 hours | Includes deduplication testing |
| Google Ads | 1-2 hours | Per conversion type |
| TikTok Events API | 1-2 hours | If client uses TikTok |
| Pinterest API | 1-2 hours | If client uses Pinterest |
| Testing & QA | 3-5 hours | Thorough testing |
| Documentation | 1-2 hours | Client handoff |
| **Total** | **12-24 hours** | Varies by platform count |

**Client Pricing (Recommended):**

| Package | Price Range | Includes |
|---------|-------------|----------|
| **Starter** | $3,500-5,000 | sGTM setup + GA4 + Meta CAPI |
| **Standard** | $5,000-7,500 | + Google Ads + 1 additional platform |
| **Premium** | $7,500-12,000 | + Multiple platforms + custom setup |
| **Monthly Maintenance** | $200-500/mo | Monitoring, updates, support |

#### Total Cost of Ownership (First Year)

**Example: Standard Package**

| Item | Cost |
|------|------|
| Implementation (one-time) | $5,000 |
| Hosting (12 months @ $75/mo) | $900 |
| Maintenance (optional, 12 months @ $300/mo) | $3,600 |
| **Total Year 1** | **$9,500** |
| **Annual (years 2+)** | **$4,500** (hosting + maintenance) |

**ROI Justification:**
- If sGTM improves ROAS by 20% on $50K/month ad spend
- Additional revenue: ~$10K/month = $120K/year
- Cost: $9,500/year
- **Net benefit: $110,500/year**

---

## Chapter 2: Hosting & Infrastructure Setup {#chapter-2-hosting--infrastructure}

### 2.1 Hosting Options Comparison

| Feature | Google Cloud Run | Stape.io | AWS (Stape) | Addingwell |
|---------|------------------|----------|-------------|------------|
| **Setup Difficulty** | Medium | Easy | Medium | Easy |
| **Cost (low traffic)** | $0-20/mo | $20/mo | $30/mo | €49/mo |
| **Cost (high traffic)** | $50-200/mo | $100-200/mo | $60-150/mo | €99+/mo |
| **Auto-scaling** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Custom domain** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **EU hosting** | ✅ Yes (regions) | ✅ Yes | ✅ Yes | ✅ Yes (only) |
| **Support** | Community | Email | Email | Email |
| **SSL certificate** | ✅ Auto | ✅ Auto | ✅ Auto | ✅ Auto |
| **GTM integration** | Manual | Auto | Auto | Auto |
| **Best for** | Tech-savvy, cost-sensitive | Ease of use | AWS ecosystem | EU clients |

**Recommendation by Use Case:**

- **Most clients:** Stape.io (easiest, good support)
- **Budget-conscious:** Google Cloud Run (free tier, scales well)
- **Enterprise/AWS shops:** AWS via Stape
- **EU data residency:** Addingwell or GCP EU regions

### 2.2 Google Cloud Platform Setup (Step-by-Step)

#### Prerequisites

- [ ] Google account with billing enabled
- [ ] Domain with DNS access
- [ ] GTM Server container created (can create during setup)

#### Step 1: Create GCP Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click project dropdown (top left) → **"New Project"**
3. Project details:
   - **Project name:** `[Client Name] sGTM`
   - **Project ID:** Will auto-generate (note this down)
   - **Location:** Select organization (or No organization)
4. Click **"Create"**
5. Wait for project creation (~30 seconds)

**[INSERT SCREENSHOT: GCP New Project screen]**

#### Step 2: Enable Billing

1. Go to **Billing** in left menu
2. Link a billing account (or create new)
3. Verify billing is enabled for the project

**Note:** Free tier includes:
- 2M requests/month free
- 360,000 GB-seconds memory free
- 180,000 vCPU-seconds free

#### Step 3: Enable Required APIs

1. Go to **APIs & Services** → **Library**
2. Search and enable each:
   - **Cloud Run API**
   - **Cloud Build API**
   - **Artifact Registry API**
   - **Cloud Logging API** (optional, for debugging)

**[INSERT SCREENSHOT: APIs enabled confirmation]**

Or enable via Cloud Shell:

```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

#### Step 4: Create GTM Server Container

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Click **"Create Account"** (or use existing)
3. Account Setup:
   - **Account Name:** `[Client Name] Server-Side`
   - **Country:** Select client's country
   - **Container Setup:**
     - **Container name:** `[Client Name] sGTM Server`
     - **Target platform:** **Server** ⭐
4. Click **"Create"**
5. Accept Terms of Service

**[INSERT SCREENSHOT: GTM Server container creation]**

#### Step 5: Provision Server (Automatic)

1. In the new Server container, you'll see a setup wizard
2. Click **"Automatically provision tagging server"**
3. Configuration:
   - **Google Cloud Platform project:** Select the project created in Step 1
   - **Service name:** `gtm-server` (or custom)
   - **Region:** Select closest to your users
     - US: `us-central1`, `us-east1`, `us-west1`
     - EU: `europe-west1` (Belgium), `europe-west3` (Frankfurt)
     - Asia: `asia-southeast1` (Singapore), `asia-northeast1` (Tokyo)
4. Click **"Create"**
5. **Wait 5-10 minutes** for deployment

**[INSERT SCREENSHOT: Provisioning in progress]**

You'll see:
- ✅ Cloud Run service created
- ✅ Container deployed
- ✅ Default URL assigned (e.g., `https://gtm-server-abc123.run.app`)

#### Step 6: Verify Deployment

1. Copy the **Server Container URL** shown in GTM
2. Open in browser: `https://your-url.run.app/healthy`
3. Should return: `ok`

**[INSERT SCREENSHOT: /healthy endpoint returning ok]**

If you see "ok", the server is running! ✅

#### Step 7: Configure Custom Domain

**Why custom domain?**
- First-party cookies (not blocked by ITP)
- Professional appearance
- Better cookie lifetime

**Choose subdomain:**
- Recommended: `gtm.clientdomain.com`
- Alternatives: `analytics.clientdomain.com`, `tracking.clientdomain.com`

**Steps:**

1. **In Google Cloud Console:**
   - Go to **Cloud Run** → Select your service
   - Click **"Manage Custom Domains"** (top)
   - Click **"Add Mapping"**
   - Select your service
   - **Domain:** Enter `gtm.clientdomain.com`
   - Click **"Continue"**

2. **Add DNS Records:**

   GCP will show DNS records to add. Example:

   ```
   Type: A
   Name: gtm
   Value: 216.239.32.21

   Type: A
   Name: gtm
   Value: 216.239.34.21

   Type: AAAA
   Name: gtm
   Value: 2001:4860:4802:32::15

   Type: AAAA
   Name: gtm
   Value: 2001:4860:4802:34::15
   ```

3. **In DNS Provider (Cloudflare, GoDaddy, etc.):**
   - Add all A and AAAA records shown
   - **TTL:** 300 (5 minutes) initially, increase to 3600 later

**[INSERT SCREENSHOT: DNS records in Cloudflare]**

4. **Verify Domain:**
   - Back in GCP, click **"Verify"**
   - May take 5-60 minutes for DNS propagation
   - Once verified, SSL certificate auto-provisions (~15 minutes)

5. **Update GTM Container:**
   - In GTM Server container → **Admin** → **Container Settings**
   - **Server container URL:** `https://gtm.clientdomain.com`
   - Save

**[INSERT SCREENSHOT: GTM container settings with custom domain]**

6. **Test Custom Domain:**
   - Visit `https://gtm.clientdomain.com/healthy`
   - Should return `ok`
   - Check SSL: Should show valid certificate ✅

#### Step 8: Configure Firewall Rules (Optional)

For security, restrict access to known IP ranges:

1. Go to **Cloud Run** → Your service → **Security** tab
2. **Ingress:** Keep as "All" (needed for browser requests)
3. For added security, use **Cloud Armor** (advanced)

**Note:** Most implementations don't need firewall rules, as authentication happens at the tag level.

#### Step 9: Enable Logging (Recommended)

1. In Cloud Run service → **Logs** tab
2. Enable **Cloud Logging**
3. Set log level:
   - **Production:** Errors only
   - **Testing:** All requests

Useful for debugging failed tag requests.

### 2.3 Stape.io Setup (Step-by-Step)

Stape.io is a managed hosting provider specifically for sGTM. Easier than GCP but with monthly cost.

#### Step 1: Create Stape Account

1. Go to [stape.io](https://stape.io/)
2. Click **"Sign Up"**
3. Sign up with:
   - Google account (easiest, auto-connects GTM)
   - Email + password

#### Step 2: Create Container

1. After login, click **"Create Container"**
2. Container settings:
   - **Container name:** `[Client Name] sGTM`
   - **Hosting region:**
     - **US East** (Virginia) - Best for US East Coast
     - **US West** (Oregon) - Best for US West Coast
     - **EU** (Frankfurt) - Best for Europe
     - **Asia** (Singapore) - Best for Asia/Australia
   - **Container type:** Server-Side GTM
3. **Plan selection:**
   - **Starter** ($20/mo) - 1M requests
   - **Business** ($50/mo) - 10M requests
   - **Pro** ($100/mo) - 50M requests
4. Click **"Create Container"**

**[INSERT SCREENSHOT: Stape container creation]**

#### Step 3: Connect to Google Tag Manager

**Option A: Automatic (if signed up with Google)**

1. Stape detects your GTM accounts
2. Select the Server container to link
3. Click **"Connect"**
4. Done! Stape automatically configures the connection

**Option B: Manual**

1. In Stape dashboard, copy the **Container URL**
   - Example: `https://abc123.stape.io`
2. In GTM:
   - Go to **Admin** → **Container Settings**
   - **Server container URL:** Paste the Stape URL
   - Save

#### Step 4: Configure Custom Domain

1. In Stape dashboard → **Custom Domain** tab
2. **Domain:** Enter `gtm.clientdomain.com`
3. Click **"Add Domain"**
4. Stape provides DNS records:

**Cloudflare Users:**
```
Type: CNAME
Name: gtm
Target: cname.stape.io
Proxy: OFF (disable orange cloud)
```

**Other DNS Providers:**
```
Type: CNAME
Name: gtm
Target: cname.stape.io
```

5. Add DNS record in your DNS provider
6. Back in Stape, click **"Verify Domain"**
7. SSL certificate auto-provisions (~10 minutes)

**[INSERT SCREENSHOT: Stape custom domain setup]**

#### Step 5: Update GTM Container

1. In GTM Server container → **Admin** → **Container Settings**
2. **Server container URL:** `https://gtm.clientdomain.com`
3. Save

#### Step 6: Verify Setup

1. Visit `https://gtm.clientdomain.com/healthy`
2. Should return `ok` ✅
3. Check Stape dashboard for request logs

**[INSERT SCREENSHOT: Stape dashboard showing requests]**

### 2.4 Custom Domain Configuration (Deep Dive)

#### Why Custom Domain Matters

| Scenario | Default URL | Custom Domain |
|----------|-------------|---------------|
| **Cookie domain** | `.run.app` (third-party) | `.clientdomain.com` (first-party) |
| **ITP/ETP** | Blocked/limited | Not blocked |
| **Cookie lifetime** | 7 days max | 2 years (your setting) |
| **Ad blocker impact** | Often blocked | Rarely blocked |
| **Professional** | ❌ Looks technical | ✅ Branded |

#### DNS Configuration Best Practices

**Subdomain Choice:**

✅ **Recommended:**
- `gtm.clientdomain.com` (clear purpose)
- `analytics.clientdomain.com` (descriptive)
- `tags.clientdomain.com` (descriptive)

❌ **Avoid:**
- `tracking.clientdomain.com` (may be blocked by ad blockers)
- `ads.clientdomain.com` (definitely blocked)
- `facebook.clientdomain.com` (suspicious)

**TTL Settings:**

- **During setup:** 300 seconds (5 minutes) - allows quick changes
- **After verification:** 3600 seconds (1 hour) - reduces DNS queries
- **Production:** 86400 seconds (24 hours) - optimal

**Cloudflare Specific:**

If using Cloudflare:
- **Disable proxy** (turn off orange cloud) for CNAME record
- Reason: sGTM needs direct connection for SSL
- After SSL provisions, can re-enable proxy if desired (advanced)

### 2.5 SSL Certificate Setup

#### Automatic SSL (GCP & Stape)

Both Google Cloud Run and Stape.io automatically provision SSL certificates via Let's Encrypt:

1. **DNS verification:** After DNS records added
2. **Certificate issuance:** Automatic (5-30 minutes)
3. **Auto-renewal:** Happens automatically every 60 days

**Verification:**

```bash
# Check certificate
curl -vI https://gtm.clientdomain.com/healthy 2>&1 | grep -A 10 "SSL certificate"

# Or visit in browser and check lock icon
```

**Troubleshooting:**

| Issue | Cause | Solution |
|-------|-------|----------|
| Certificate not provisioning | DNS not propagated | Wait 24 hours, verify DNS records |
| "NET::ERR_CERT_COMMON_NAME_INVALID" | Wrong domain in config | Double-check domain spelling |
| Mixed content warnings | HTTP links on page | Ensure all resources use HTTPS |

### 2.6 Load Balancing & Scaling

#### Auto-Scaling (Default)

**Google Cloud Run:**
- Automatically scales from 0 to 1000+ instances
- Scale-to-zero: No cost when idle
- Scale up: Based on CPU/memory/requests

**Settings:**
```
Min instances: 0 (cost-effective) or 1 (faster cold starts)
Max instances: 100 (default) or higher for high traffic
Concurrency: 80 (default) - requests per instance
CPU: 1 vCPU (default) - sufficient for most
Memory: 512 MB (default) - can increase if needed
```

**When to adjust:**

- **High traffic expected:** Set min instances to 1-5 (reduces cold starts)
- **Cost optimization:** Keep at 0 (only pay when active)
- **Spike handling:** Increase max instances to 500+

**Stape.io:**
- Handles scaling automatically
- Included in plan
- No configuration needed

#### Cold Starts

**What is a cold start?**
- When no instances are running (scale-to-zero)
- First request starts a new instance (~1-3 seconds delay)
- Subsequent requests use warm instances (<100ms)

**Mitigation strategies:**

1. **Set minimum instances to 1:**
   ```
   GCP Console → Cloud Run → Edit Service → Minimum Instances: 1
   Cost: ~$8-15/month
   Benefit: No cold starts
   ```

2. **Use Cloud Scheduler (ping service):**
   ```
   Keep one instance warm by pinging every 5 minutes
   Cost: <$1/month
   ```

3. **Accept cold starts:**
   - For most clients, occasional 1-2 second delay is acceptable
   - Happens only when idle for >15 minutes

### 2.7 Monitoring & Alerts

#### Google Cloud Monitoring

1. Go to **Cloud Console** → **Monitoring**
2. Create dashboard for sGTM

**Key metrics to monitor:**

| Metric | What to Track | Alert Threshold |
|--------|---------------|-----------------|
| **Request count** | Total requests/minute | <10% of normal = issue |
| **Error rate** | Failed requests % | >5% |
| **Latency** | Response time (p95) | >2 seconds |
| **Memory usage** | Container memory | >80% |
| **CPU usage** | Container CPU | >80% |
| **Instance count** | Active containers | Unexpected spike |

**[INSERT SCREENSHOT: Cloud Monitoring dashboard]**

#### Setting Up Alerts

1. **Cloud Console** → **Monitoring** → **Alerting**
2. Click **"Create Policy"**
3. Example alert: High error rate

```yaml
Alert Policy:
  Name: "sGTM High Error Rate"
  Condition:
    Resource type: Cloud Run Service
    Metric: request_count (filter: response_code >= 400)
    Threshold: >5% of total requests
    Duration: 5 minutes
  Notification:
    Email: your-email@domain.com
    Slack: (optional, via webhook)
```

4. Create similar alerts for:
   - Error rate >5%
   - Latency p95 >2 seconds
   - Memory >80%

#### Stape.io Monitoring

Stape provides built-in monitoring:

1. **Dashboard** shows:
   - Request volume (real-time graph)
   - Error rate
   - Top events
   - Geographic distribution

2. **Email alerts** (automatic):
   - Container down
   - High error rate
   - Quota exceeded

**[INSERT SCREENSHOT: Stape dashboard]**

#### Log Analysis

**GCP Logs:**

```
Cloud Console → Cloud Run → Logs

Useful filters:
- severity="ERROR"
- textPayload:"failed"
- httpRequest.status>=400
```

**Common log entries:**

```
✅ Success: 200 OK
   POST /g/collect
   Client: GA4
   Tags fired: 4

❌ Error: 400 Bad Request
   POST /g/collect
   Error: Invalid measurement_id

⚠️ Warning: Tag timeout
   Tag: Meta CAPI - Purchase
   Status: Timeout after 5000ms
```

---

## Chapter 3: GTM Server Container Configuration {#chapter-3-gtm-server-container}

### 3.1 Container Structure Overview

A well-organized Server container is critical for maintainability.

#### Container Hierarchy

```
Server Container
├── Clients (Data Receivers)
│   └── Client - GA4
│   └── Client - Universal Analytics (if needed)
│
├── Tags (Data Senders)
│   ├── 📁 GA4
│   │   └── GA4 - All Events
│   ├── 📁 Meta CAPI
│   │   └── Meta CAPI - PageView
│   │   └── Meta CAPI - ViewContent
│   │   └── Meta CAPI - Purchase
│   │   └── etc.
│   ├── 📁 Google Ads
│   │   └── Google Ads - Purchase Conversion
│   └── 📁 TikTok
│       └── TikTok - CompletePayment
│       └── etc.
│
├── Triggers
│   └── Trigger - All GA4 Events
│   └── Trigger - PageView
│   └── Trigger - Purchase
│   └── etc.
│
└── Variables
    ├── 📁 Event Data
    │   └── Event - event_name
    │   └── Event - timestamp
    │   └── Event - event_id
    ├── 📁 Page Data
    │   └── Page - URL
    │   └── Page - hostname
    ├── 📁 User Data
    │   └── User - email
    │   └── User - email_sha256
    │   └── User - user_id
    ├── 📁 Ecommerce Data
    │   └── Ecom - transaction_id
    │   └── Ecom - value
    │   └── Ecom - currency
    │   └── Ecom - items
    ├── 📁 Client Data
    │   └── Client - IP Address
    │   └── Client - User Agent
    └── 📁 Constants
        └── Const - GA4 Measurement ID
        └── Const - Meta Pixel ID
        └── Const - Meta Access Token
        └── etc.
```

### 3.2 Understanding Clients

Clients are the **entry points** for data into your server container.

#### What is a Client?

A Client:
- **Receives** HTTP requests from browsers/apps
- **Parses** request data into a usable format
- **Claims** requests it can handle
- **Provides** data to tags via the request object

#### Built-in Clients

| Client Type | Use Case | Request Path |
|-------------|----------|--------------|
| **GA4** | Google Analytics 4 events | `/g/collect` |
| **Universal Analytics** | Legacy GA events | `/collect`, `/batch` |
| **Measurement Protocol (deprecated)** | Direct GA MP calls | `/r/collect` |

#### GA4 Client (Most Common)

**Configuration:**

```
Client Name: Client - GA4
Client Type: GA4

Settings:
├── Claim GET requests to default GA4 paths: ✅
├── Claim POST requests to default GA4 paths: ✅
├── Claim GET requests to default UA paths: ❌
├── Claim POST requests to default UA paths: ❌
├── Activate Preview Header Validation: ✅
└── Compress server response: ✅
```

**What it does:**
1. Listens for requests to `/g/collect`
2. Parses GA4 Measurement Protocol format
3. Extracts event data (`event_name`, `event_params`, etc.)
4. Makes data available to tags

**[INSERT SCREENSHOT: GA4 Client configuration]**

#### How Clients "Claim" Requests

When a request arrives at sGTM:

1. Server checks each Client's claim rules
2. First Client that matches "claims" the request
3. That Client parses the data
4. Triggers evaluate based on the claiming Client

**Example flow:**

```
Request: POST https://gtm.domain.com/g/collect
         (GA4 format data)
         ↓
Client - GA4 checks: "Is this /g/collect?" → YES
         ↓
Client - GA4 claims request
         ↓
Triggers check: "Client Name = GA4" → Fire tags
```

### 3.3 Understanding Server-Side Tags

Tags in sGTM **send data** to destination platforms.

#### Differences from Web GTM

| Aspect | Web GTM | Server GTM |
|--------|---------|------------|
| **Execution** | JavaScript in browser | Server-side code |
| **Network** | Client → Platform | Server → Platform |
| **Data access** | `dataLayer`, DOM, cookies | Request object only |
| **Speed impact** | Affects page load | No page impact |
| **Ad blockers** | Can be blocked | Cannot be blocked |

#### Built-in Tags

| Tag Type | Use Case | Authentication |
|----------|----------|----------------|
| **Google Analytics: GA4** | Send events to GA4 | Measurement ID |
| **Google Ads Conversions** | Track conversions | Conversion ID + Label |
| **Floodlight Counter** | Campaign Manager 360 | Config Tag ID |

#### Community Gallery Tags

Most platform tags come from the Community Template Gallery:

| Platform | Template Name | Author |
|----------|---------------|--------|
| **Meta CAPI** | Facebook Conversions API | Meta (official) |
| **TikTok Events API** | TikTok Events API | TikTok (official) |
| **Pinterest Conversions** | Pinterest Conversions API | Pinterest (official) |
| **Snapchat CAPI** | Snapchat Conversions API | Snapchat (official) |

**To add Community Template:**

1. In GTM Server container → **Tags** → **New**
2. Click tag configuration → **Discover more tag types in the Community Template Gallery**
3. Search for platform (e.g., "Meta")
4. Click template → **Add to workspace**
5. Accept terms → Template is now available

**[INSERT SCREENSHOT: Community Template Gallery]**

### 3.4 Understanding Triggers

Triggers determine **when tags fire**.

#### Server-Side Trigger Logic

Triggers in sGTM use different conditions than web GTM:

**Common Trigger Conditions:**

| Condition Type | Variable | Use Case |
|----------------|----------|----------|
| **Client Name** | `{{Client Name}}` | Fire only for specific client (e.g., GA4) |
| **Event Name** | `{{Event Name}}` | Fire for specific events (e.g., `purchase`) |
| **Custom parameter** | `{{x-ga-<param>}}` | Fire based on GA4 parameter |
| **Request path** | `{{Request Path}}` | Fire for specific endpoints |

**Example Triggers:**

```
Trigger Name: Trigger - All GA4 Events
Type: Custom
Condition: Client Name equals GA4
```

```
Trigger Name: Trigger - Purchase
Type: Custom
Conditions:
  - Client Name equals GA4
  - Event Name equals purchase
```

```
Trigger Name: Trigger - High-Value Purchase
Type: Custom
Conditions:
  - Client Name equals GA4
  - Event Name equals purchase
  - Ecom - value greater than 500
```

#### Best Practices

✅ **Do:**
- Name triggers clearly: `Trigger - [Condition]`
- Use folders to organize by platform
- Document complex trigger logic

❌ **Don't:**
- Use overly complex conditions (hard to debug)
- Forget to test edge cases
- Leave default "All Pages" triggers (not applicable in sGTM)

### 3.5 Understanding Variables

Variables extract and transform data from incoming requests.

#### Variable Types

**1. Built-in Variables**

Always available, no configuration needed:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `{{Client Name}}` | Which client claimed request | `GA4` |
| `{{Container ID}}` | Server container ID | `GTM-XXXXXX` |
| `{{Container Version}}` | Published version number | `5` |
| `{{Event Name}}` | GA4 event name | `purchase` |
| `{{Request Path}}` | URL path of request | `/g/collect` |
| `{{Request Method}}` | HTTP method | `POST` |

**[INSERT SCREENSHOT: Built-in variables enabled]**

**2. Event Data Variables**

Extract parameters from GA4 events:

```
Variable Name: Event - event_id
Variable Type: Event Data
Key Path: x-ga-mp2-event_id
   or: event_id (depending on client)

Returns: Unique event identifier
```

```
Variable Name: Ecom - transaction_id
Variable Type: Event Data
Key Path: x-ga-mp2-transaction_id

Returns: Order ID (e.g., "ORDER-12345")
```

**Common Event Data Variables:**

| Variable Name | Key Path | Data Type |
|---------------|----------|-----------|
| `Event - event_name` | `event_name` | String |
| `Event - timestamp` | `x-ga-mp2-timestamp_micros` | Number |
| `Page - URL` | `page_location` | String |
| `Page - hostname` | `page_hostname` | String |
| `User - user_id` | `user_id` | String |
| `Ecom - transaction_id` | `x-ga-mp2-transaction_id` | String |
| `Ecom - value` | `value` | Number |
| `Ecom - currency` | `currency` | String |

**3. Custom JavaScript Variables**

Transform or combine data:

```javascript
// Variable Name: User - email_sha256
// Variable Type: Custom JavaScript

function() {
  var email = data.email; // From Event Data variable
  if (!email) return undefined;

  // SHA-256 hashing (use built-in function in sGTM)
  return sha256(email.toLowerCase().trim());
}
```

```javascript
// Variable Name: Ecom - item_ids
// Variable Type: Custom JavaScript

function() {
  var items = data.items; // Ecommerce items array
  if (!items || !items.length) return undefined;

  return items.map(function(item) {
    return item.item_id;
  });
}
```

**4. HTTP Request Variables**

Extract data from HTTP request:

| Variable Name | Header/Cookie | Use Case |
|---------------|---------------|----------|
| `Client - IP Address` | `X-Forwarded-For` header | User's IP |
| `Client - User Agent` | `User-Agent` header | Browser/device info |
| `Cookie - _fbc` | `_fbc` cookie | Facebook click ID |
| `Cookie - _fbp` | `_fbp` cookie | Facebook browser ID |
| `Cookie - _ga` | `_ga` cookie | GA client ID |

**5. Constant Variables**

Store configuration values (API keys, IDs):

```
Variable Name: Const - Meta Pixel ID
Variable Type: Constant
Value: 1234567890123456
```

```
Variable Name: Const - Meta Access Token
Variable Type: Constant
Value: EAAG... (long token)
```

**⚠️ Security Note:** Never expose sensitive tokens in client-side GTM or public repositories.

### 3.6 Naming Conventions

Consistent naming makes containers maintainable.

#### JY/co Standard Naming Convention

| Type | Format | Examples |
|------|--------|----------|
| **Clients** | `Client - [Platform]` | `Client - GA4`<br>`Client - UA` |
| **Tags** | `[Platform] - [Event/Action]` | `GA4 - All Events`<br>`Meta CAPI - Purchase`<br>`Google Ads - Lead Conversion` |
| **Triggers** | `Trigger - [Condition]` | `Trigger - All GA4 Events`<br>`Trigger - Purchase`<br>`Trigger - High Value Purchase` |
| **Variables - Event** | `Event - [parameter]` | `Event - event_name`<br>`Event - timestamp` |
| **Variables - Page** | `Page - [attribute]` | `Page - URL`<br>`Page - hostname` |
| **Variables - User** | `User - [attribute]` | `User - email`<br>`User - user_id` |
| **Variables - Ecom** | `Ecom - [attribute]` | `Ecom - transaction_id`<br>`Ecom - value`<br>`Ecom - items` |
| **Variables - Client** | `Client - [attribute]` | `Client - IP Address`<br>`Client - User Agent` |
| **Variables - Cookie** | `Cookie - [name]` | `Cookie - _fbc`<br>`Cookie - _ga` |
| **Variables - Const** | `Const - [Platform] [Type]` | `Const - Meta Pixel ID`<br>`Const - GA4 Measurement ID` |

#### Benefits of Consistent Naming

✅ **Quick identification:** Know what each element does at a glance
✅ **Easy filtering:** Search "Meta CAPI" to find all Meta tags
✅ **Team collaboration:** Everyone follows same pattern
✅ **Client handoff:** Professional, organized container

### 3.7 Folder Organization

Use folders to keep container organized:

**Recommended Folder Structure:**

```
📁 Clients
   └── Client - GA4
   └── Client - UA (if needed)

📁 Tags - GA4
   └── GA4 - All Events

📁 Tags - Meta CAPI
   └── Meta CAPI - PageView
   └── Meta CAPI - ViewContent
   └── Meta CAPI - AddToCart
   └── Meta CAPI - Purchase

📁 Tags - Google Ads
   └── Google Ads - Purchase Conversion
   └── Google Ads - Lead Conversion

📁 Tags - TikTok
   └── TikTok - PageView
   └── TikTok - ViewContent
   └── TikTok - CompletePayment

📁 Tags - Pinterest
   └── Pinterest - PageVisit
   └── Pinterest - Checkout

📁 Triggers
   └── (all triggers here)

📁 Variables - Event Data
   └── Event - event_name
   └── Event - timestamp
   └── Event - event_id

📁 Variables - Page Data
   └── Page - URL
   └── Page - hostname
   └── Page - path

📁 Variables - User Data
   └── User - email
   └── User - email_sha256
   └── User - user_id
   └── User - phone
   └── (other user fields)

📁 Variables - Ecommerce
   └── Ecom - transaction_id
   └── Ecom - value
   └── Ecom - currency
   └── Ecom - items
   └── Ecom - item_ids

📁 Variables - Client Data
   └── Client - IP Address
   └── Client - User Agent

📁 Variables - Cookies
   └── Cookie - _fbc
   └── Cookie - _fbp
   └── Cookie - _ga
   └── Cookie - _gcl_aw

📁 Variables - Constants
   └── Const - GA4 Measurement ID
   └── Const - Meta Pixel ID
   └── Const - Meta Access Token
   └── Const - Google Ads Conversion ID
   └── Const - Google Ads Labels
   └── (other API keys/IDs)
```

**Creating Folders:**

1. In GTM, go to **Tags** (or Variables, Triggers)
2. Click **"New Folder"**
3. Name folder following convention above
4. Drag elements into folder

**[INSERT SCREENSHOT: Organized folder structure in GTM]**

---

*[Chapters 4-12 will follow in subsequent message due to length limits. This establishes the foundation for infrastructure setup and container organization.]*

**Next sections to create:**
- Chapter 4: GA4 Server-Side Configuration
- Chapter 5: Meta Conversions API
- Chapter 6: Google Ads Enhanced Conversions
- Chapter 7: TikTok Events API
- Chapter 8: Pinterest Conversions API
- Chapter 9: Web Container Integration
- Chapter 10: Testing & Debugging
- Chapter 11: Consent Mode Integration
- Chapter 12: Monitoring & Maintenance

Would you like me to continue with the remaining chapters?
