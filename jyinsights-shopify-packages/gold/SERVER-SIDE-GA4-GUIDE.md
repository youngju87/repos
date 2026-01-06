# Server-Side Google Analytics 4 (GA4) Setup Guide

**Package:** JY Insights Gold Plus
**Version:** 1.2
**Last Updated:** January 6, 2026
**Support:** contact@jyinsights.com

---

## Table of Contents

1. [Overview](#overview)
2. [Why Server-Side GA4?](#why-server-side-ga4)
3. [Architecture](#architecture)
4. [Prerequisites](#prerequisites)
5. [Setup Steps](#setup-steps)
6. [Configuration](#configuration)
7. [Testing & Validation](#testing--validation)
8. [Troubleshooting](#troubleshooting)

---

## Overview

Server-Side Google Analytics 4 (sGTM - Server-Side Google Tag Manager) allows you to collect analytics data through your own server infrastructure instead of sending it directly from the browser to Google's servers. This provides better data accuracy, enhanced privacy controls, and improved performance.

### What is Server-Side Tagging?

- **Client-side tracking**: Browser → Google Analytics (traditional approach)
- **Server-side tracking**: Browser → Your Server → Google Analytics (enhanced approach)

---

## Why Server-Side GA4?

### Benefits

✅ **Improved Data Accuracy**
- Bypass ad blockers and browser tracking prevention (Safari ITP, Firefox ETP)
- Recover 20-30% of lost conversion data
- More reliable cookie duration and attribution

✅ **Enhanced Privacy & Compliance**
- Keep first-party data on your own server
- Better control over what data is sent to third parties
- Easier GDPR/CCPA compliance with data redaction
- Reduced PII (Personally Identifiable Information) exposure

✅ **Better Performance**
- Reduced browser payload (fewer client-side requests)
- Faster page load times
- Single server endpoint for multiple marketing platforms

✅ **Advanced Data Enrichment**
- Add server-side data (CRM data, inventory levels, etc.)
- Hash PII on the server for Enhanced Conversions
- Enrich events with additional context

### Trade-offs

⚠️ **Infrastructure Costs**
- Requires cloud hosting (Google Cloud Platform recommended)
- ~$50-200/month depending on traffic volume

⚠️ **Setup Complexity**
- Requires technical expertise
- More complex debugging than client-side

⚠️ **Maintenance**
- Requires ongoing monitoring and updates
- Custom server logic needs maintenance

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│                                                                 │
│  ┌────────────────┐         ┌──────────────────┐              │
│  │ Shopify Store  │────────>│  Client GTM      │              │
│  │ (Data Layer)   │         │  (Web Container) │              │
│  └────────────────┘         └──────────────────┘              │
│                                      │                          │
└──────────────────────────────────────┼──────────────────────────┘
                                       │
                                       │ HTTPS (first-party domain)
                                       │ e.g., analytics.yourstore.com
                                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER-SIDE GTM CONTAINER                    │
│                  (Google Cloud Platform / App Engine)           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Server GTM Container                                   │  │
│  │  - Receives events from client                          │  │
│  │  - Processes, enriches, transforms data                 │  │
│  │  - Routes to downstream platforms                       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                             │                                   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
    ┌──────────────┐  ┌─────────────┐  ┌────────────┐
    │ GA4 Property │  │ Google Ads  │  │ Meta CAPI  │
    │ (Server Hit) │  │ (Enhanced)  │  │ (Server)   │
    └──────────────┘  └─────────────┘  └────────────┘
```

---

## Prerequisites

### Required Accounts

1. **Google Cloud Platform (GCP)** account
   - Billing enabled
   - Permissions: Project Editor or Owner

2. **Google Tag Manager** account
   - Web container (already have this)
   - Server container (will create)

3. **Google Analytics 4** property
   - Already configured with client-side tracking

### Technical Requirements

- Custom domain or subdomain for server endpoint
  - Example: `analytics.yourstore.com`
  - Must be able to add DNS records
- SSL certificate (automatic with Cloud Run)

### Estimated Costs

- **Google Cloud Run**: ~$50-100/month (50K-200K hits/day)
- **Google App Engine**: ~$100-200/month (higher traffic)
- **First 1 million requests/month**: Often within GCP free tier

---

## Setup Steps

### Step 1: Create Server-Side GTM Container

1. Go to [Google Tag Manager](https://tagmanager.google.com)
2. Click **Create Container**
3. Container setup:
   - **Container name**: `[Your Store] - Server`
   - **Target platform**: **Server**
4. Click **Create**

### Step 2: Deploy to Google Cloud Platform

#### Option A: Automatic Setup (Google Cloud Run - Recommended)

1. In your new server container, click **Tagging Server URL** (top right)
2. Click **Automatically provision tagging server**
3. Choose your Google Cloud Project (or create new)
4. Select **Region**: Choose closest to your audience
   - US: `us-central1`
   - Europe: `europe-west1`
   - Asia: `asia-east1`
5. Click **Provision**
6. Wait 5-10 minutes for provisioning
7. Note the **Tagging Server URL**: `https://[random-string].run.app`

#### Option B: Manual Setup (Google Cloud Run)

```bash
# 1. Install Google Cloud SDK
# https://cloud.google.com/sdk/docs/install

# 2. Initialize and authenticate
gcloud init
gcloud auth login

# 3. Set project
gcloud config set project YOUR_PROJECT_ID

# 4. Deploy GTM server container
gcloud run deploy gtm-server \
  --image=gcr.io/cloud-tagging-10302018/gtm-cloud-image:stable \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --set-env-vars="CONTAINER_CONFIG=YOUR_CONTAINER_CONFIG"

# 5. Get the service URL
gcloud run services describe gtm-server --region=us-central1
```

### Step 3: Configure Custom Domain (Recommended)

Using a first-party domain (e.g., `analytics.yourstore.com`) significantly improves cookie lifespan and tracking accuracy.

#### 3.1 Create DNS Records

In your DNS provider (Cloudflare, GoDaddy, etc.), add a CNAME record:

```
Type: CNAME
Name: analytics (or your subdomain)
Value: ghs.googlehosted.com
TTL: Auto or 3600
```

#### 3.2 Map Domain in Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **Cloud Run** > Your service
3. Click **Add Mapping** (under "Domain Mappings")
4. Enter your domain: `analytics.yourstore.com`
5. Follow verification steps
6. Wait for SSL provisioning (5-10 minutes)

#### 3.3 Update Server GTM Container

1. In GTM Server container, go to **Admin** > **Container Settings**
2. Update **Server Container URL**: `https://analytics.yourstore.com`
3. Click **Save**

### Step 4: Configure Client-Side GTM to Send to Server

1. Open your **Web GTM container** (existing client-side container)
2. Go to **Tags** > **GA4 Configuration** tag
3. Click **Server Container URL** (expand "Configuration Settings")
4. Enter your server URL:
   - With custom domain: `https://analytics.yourstore.com`
   - Without custom domain: `https://[random-string].run.app`
5. **Save** and **Submit** changes
6. Publish the container

### Step 5: Configure Server-Side GA4 Tag

1. Open your **Server GTM container**
2. Create new **Tag**:
   - **Tag Type**: GA4 (Google Analytics: GA4 Event)
   - **Measurement ID**: `{{GA4 Measurement ID}}` (create variable with your GA4 ID)
   - **Event Name**: `{{Event Name}}` (automatically captured from client)
   - **Send to**: Server
3. **Triggering**: All Events (or custom logic)
4. **Save** tag
5. **Submit** and **Publish** container

### Step 6: Create Server-Side Variables

Create these variables in your **Server GTM container**:

#### Variable: GA4 Measurement ID
- **Type**: Constant
- **Value**: `G-XXXXXXXXXX` (your GA4 Measurement ID)

#### Variable: Event Name
- **Type**: Event Data
- **Key**: `event_name`

#### Variable: Client ID
- **Type**: Event Data
- **Key**: `client_id`

---

## Configuration

### Enhanced Conversions (User Data)

For better attribution and measurement, send hashed user data to GA4:

#### In Client GTM (Web Container)

Already handled by Gold Plus package - user data is hashed with SHA-256 and sent via data layer.

#### In Server GTM Container

1. Create **User Data Variables**:
   - `Event Data - email_sha256` (type: Event Data, key: `user_data.email_sha256`)
   - `Event Data - phone_sha256` (type: Event Data, key: `user_data.phone_sha256`)
   - `Event Data - address` (type: Event Data, key: `user_data.address`)

2. Update your **GA4 Server Tag**:
   - Expand **User Properties**
   - Add fields:
     - `sha256_email_address`: `{{Event Data - email_sha256}}`
     - `sha256_phone_number`: `{{Event Data - phone_sha256}}`
     - `address`: `{{Event Data - address}}`

### Cookie Management

Configure first-party cookies via server-side GTM:

1. In Server GTM, create **Tag** of type **Set First-Party Cookie**
2. Configure:
   - **Cookie Name**: `_ga` (Google Analytics client ID)
   - **Cookie Value**: `{{Client ID}}`
   - **Cookie Path**: `/`
   - **Max-Age**: `63072000` (2 years)
   - **SameSite**: `Lax`
3. **Trigger**: All Events
4. **Save** and **Publish**

### Consent Mode v2

Server-side GTM respects consent signals from client-side:

1. Ensure Cookiebot (or your CMP) is configured in client GTM
2. Consent signals are automatically forwarded to server GTM
3. Server tags respect consent categories (analytics_storage, ad_storage)

---

## Testing & Validation

### 1. Preview Mode

1. In **Server GTM container**, click **Preview**
2. Enter your tagging server URL: `https://analytics.yourstore.com`
3. In a new tab, visit your Shopify store
4. In Preview mode, verify:
   - Events are received from client
   - GA4 tag fires successfully
   - Outgoing requests to GA4 succeed

### 2. GA4 DebugView

1. Visit your store with `?debug_mode=1` parameter
2. In GA4, go to **Admin** > **DebugView**
3. Verify events appear with:
   - Correct event names
   - Ecommerce parameters populated
   - User properties set
   - Server-side indicator (check event origin)

### 3. Network Tab Inspection

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Visit your store and trigger events
4. Look for requests to your server endpoint:
   - URL: `https://analytics.yourstore.com/g/collect`
   - Method: POST
   - Status: 200 OK
5. Check response headers for `x-gtm-server-version`

### 4. Server Logs (Google Cloud)

```bash
# View Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50
```

Or in [Cloud Console](https://console.cloud.google.com):
- Go to **Cloud Run** > Your service > **Logs**

---

## Troubleshooting

### Issue: Events Not Reaching Server

**Symptoms**: No requests in Preview mode, no events in server logs

**Solutions**:
1. Verify **Server Container URL** is set correctly in client GTM
2. Check CORS settings - server must allow requests from your domain
3. Verify SSL certificate is valid (no browser warnings)
4. Check Cloud Run service is deployed and running

### Issue: Events Reach Server But Not GA4

**Symptoms**: Server Preview shows events, but GA4 doesn't receive them

**Solutions**:
1. Verify **GA4 Measurement ID** variable is correct in server GTM
2. Check GA4 tag is firing in Preview mode
3. Verify GA4 tag has correct **Measurement Protocol endpoint**
4. Check server logs for error messages

### Issue: High Cloud Costs

**Symptoms**: Unexpectedly high GCP bills

**Solutions**:
1. Set up **Budget Alerts** in GCP
2. Review request volume in Cloud Run metrics
3. Implement rate limiting or bot filtering
4. Consider caching strategies for high-traffic pages
5. Use **Cloud Run minimum instances** = 0 (scales to zero)

### Issue: Lost Attribution After Switch

**Symptoms**: Attribution breaks, new vs. returning user counts off

**Solutions**:
1. Ensure custom domain is used (not `.run.app` URL)
2. Verify first-party cookies are set correctly
3. Check cookie `_ga` is preserved across client/server
4. Allow 7-14 days for data to normalize after migration

### Issue: Consent Mode Not Working

**Symptoms**: Tags fire even when consent denied

**Solutions**:
1. Verify consent signals are passed from client to server
2. Check Consent Initialization trigger in client GTM
3. Ensure server tags respect `ad_storage` and `analytics_storage` consent types
4. Test in incognito mode with consent denied

---

## Advanced Configuration

### Multi-Platform Routing

Route the same event data to multiple platforms from server GTM:

```
Client GTM → Server GTM → ┬→ GA4
                          ├→ Google Ads Enhanced Conversions
                          ├→ Meta Conversions API (CAPI)
                          ├→ TikTok Events API
                          └→ Your Custom Endpoint
```

See `SERVER-SIDE-FACEBOOK-CAPI-GUIDE.md` for Facebook CAPI setup.

### Data Transformation

Transform events in server GTM before sending:

```javascript
// Example: Transform add_to_cart to GA4 and Meta formats
function transformEvent(eventData) {
  // GA4 format (standard ecommerce)
  var ga4Event = {
    event_name: 'add_to_cart',
    items: eventData.ecommerce.items
  };

  // Meta format (different structure)
  var metaEvent = {
    event_name: 'AddToCart',
    content_ids: eventData.ecommerce.items.map(i => i.item_id),
    content_type: 'product'
  };

  return { ga4: ga4Event, meta: metaEvent };
}
```

### Data Redaction

Remove PII before sending to third parties:

1. Create **Transformation** tag in server GTM
2. Use **Event Data** variables to redact fields
3. Example: Strip email from URL parameters, remove IP addresses

---

## Monitoring & Maintenance

### Key Metrics to Monitor

- **Request Volume**: Track in Cloud Run metrics
- **Error Rate**: Monitor 4xx/5xx responses
- **Latency**: P50, P95, P99 response times
- **Cost**: Daily/monthly GCP spend
- **Data Quality**: Compare client vs. server event counts in GA4

### Recommended Alerts

Set up alerts in Google Cloud:
1. **Budget Alert**: Notify at 50%, 75%, 90% of monthly budget
2. **Error Rate Alert**: Notify if error rate > 5%
3. **Latency Alert**: Notify if P95 latency > 500ms

---

## Migration Checklist

When transitioning from client-only to server-side GA4:

- [ ] Server container created and deployed
- [ ] Custom domain configured (recommended)
- [ ] SSL certificate provisioned
- [ ] Client GTM updated with server URL
- [ ] Server GA4 tag configured
- [ ] Enhanced Conversions variables created
- [ ] Cookie management configured
- [ ] Tested in Preview mode
- [ ] Validated in GA4 DebugView
- [ ] Monitored for 7-14 days
- [ ] Compared client vs. server data quality
- [ ] Budget alerts configured

---

## Resources

- [Google Server-Side Tagging Documentation](https://developers.google.com/tag-platform/tag-manager/server-side)
- [Google Cloud Run Pricing](https://cloud.google.com/run/pricing)
- [GA4 Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
- [Consent Mode v2 Implementation](https://developers.google.com/tag-platform/security/guides/consent)

---

## Support

For help with server-side GA4 setup:

- **Email**: contact@jyinsights.com
- **Package**: JY Insights Gold Plus v1.2
- **Documentation**: See `README.md`, `gold-sdr-document.md`

---

*Last Updated: January 6, 2026*
