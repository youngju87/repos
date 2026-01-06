# JY/co WooCommerce Tracking Packages

**Production-Ready GA4 Analytics Implementation for WooCommerce**

Version 1.0.0 | January 2025 | By JY/co

---

## Overview

This repository contains two productized WordPress/WooCommerce analytics implementation packages designed for consulting businesses. Both packages are **production-ready, robust solutions** comparable to plugins like MonsterInsights, Pixel Manager for WooCommerce, or GTM4WP — but custom, lightweight, and fully owned.

### Package Options

#### 🟢 STARTER Package
**Plugin-based implementation** — Lightweight custom WordPress plugin with essential GA4 ecommerce tracking.

**Perfect for:** Small to medium WooCommerce stores, clients on a budget, standard tracking requirements.

#### 🟣 PRO Package
**Advanced implementation** — Everything in Starter plus server-side backup, consent management, subscription tracking, and enhanced features.

**Perfect for:** Enterprise clients, stores with WooCommerce Subscriptions, GDPR compliance requirements, mission-critical tracking.

---

## Quick Comparison

| Feature | Starter | Pro |
|---------|---------|-----|
| **Price Point** | $$ | $$$$ |
| **Installation** | Plugin upload | Plugin upload |
| **Basic GA4 Events** | ✅ All 14 events | ✅ All 14 events |
| **GTM Container** | ✅ Included | ✅ Included |
| **Documentation** | ✅ Full SDR | ✅ Enhanced SDR |
| **AJAX Add to Cart** | ✅ | ✅ |
| **Variable Products** | ✅ | ✅ |
| **User Tracking** | Basic | Enhanced (LTV, cohort) |
| **Server-Side Backup** | ❌ | ✅ Measurement Protocol |
| **Consent Mode v2** | Basic defaults | ✅ Full integration (5 platforms) |
| **WooCommerce Subscriptions** | ❌ | ✅ Full lifecycle (8 events) |
| **Refund Tracking** | ❌ | ✅ Server-side |
| **Multi-Currency** | Basic | ✅ Full support |
| **Developer Hooks** | Limited | ✅ Extensive |
| **Support** | Standard | Priority |

---

## Package Contents

### STARTER Package (`/starter/`)

```
starter/
├── jyco-woocommerce-tracking/          Plugin folder (ZIP for client)
│   ├── jyco-woocommerce-tracking.php   Main plugin file
│   ├── includes/
│   │   ├── class-jyco-datalayer.php    DataLayer generation
│   │   ├── class-jyco-events.php       Event handling
│   │   └── class-jyco-settings.php     Admin settings
│   ├── assets/
│   │   └── js/
│   │       └── jyco-tracking.js        Frontend JavaScript
│   └── readme.txt                       WordPress.org format readme
├── starter-gtm-container.json           GTM container (import to GTM)
└── STARTER-SDR.md                       Solution Design Reference
```

**What's Included:**
- WordPress plugin (ready to install)
- GTM container with all event tags configured
- Complete Solution Design Reference (SDR) document
- Installation and configuration guide
- Testing checklist
- Troubleshooting guide

### PRO Package (`/pro/`)

```
pro/
├── jyco-woocommerce-tracking-pro/      Plugin folder (ZIP for client)
│   ├── jyco-woocommerce-tracking-pro.php
│   ├── includes/
│   │   ├── class-jyco-datalayer.php
│   │   ├── class-jyco-events.php
│   │   ├── class-jyco-settings.php     (Enhanced with Pro settings)
│   │   ├── class-jyco-server-tracking.php    ⭐ Pro: Server-side MP
│   │   ├── class-jyco-consent.php            ⭐ Pro: Consent Mode v2
│   │   └── class-jyco-subscriptions.php      ⭐ Pro: Subscriptions
│   ├── assets/
│   │   └── js/
│   │       └── jyco-tracking.js        (Same as Starter)
│   └── readme.txt
├── pro-gtm-container.json              GTM container (with subscription tags)
└── PRO-SDR.md                          Enhanced SDR document
```

**What's Included:**
- Everything from Starter, plus:
- Server-side tracking class (Measurement Protocol)
- Consent Mode v2 integration (5 platforms)
- WooCommerce Subscriptions tracking
- Enhanced user data (LTV, customer type)
- Priority support documentation

---

## GA4 Events Supported

Both packages track all standard GA4 ecommerce events:

| Event | Description | Page/Trigger |
|-------|-------------|--------------|
| `page_view` | Every page load | All pages |
| `view_item_list` | Product list viewed | Shop, category, tag pages |
| `select_item` | Product clicked from list | Product clicks |
| `view_item` | Single product viewed | Product page |
| `add_to_cart` | Item added to cart | Add to cart button (AJAX + standard) |
| `remove_from_cart` | Item removed from cart | Cart page remove |
| `view_cart` | Cart page viewed | Cart page |
| `begin_checkout` | Checkout started | Checkout page |
| `add_shipping_info` | Shipping method selected | Checkout |
| `add_payment_info` | Payment method selected | Checkout |
| `purchase` | Order completed | Thank you page |
| `search` | Search performed | Search results |
| `login` | User logged in | Login success |
| `sign_up` | User registered | Registration success |

### Pro-Exclusive Events

| Event | Description |
|-------|-------------|
| `subscription_start` | Subscription activated |
| `subscription_cancel` | Subscription cancelled |
| `subscription_expire` | Subscription expired |
| `subscription_renewal` | Renewal payment success |
| `subscription_renewal_failed` | Renewal payment failed |
| `subscription_reactivate` | Subscription reactivated |
| `subscription_trial_end` | Trial period ended |
| `order_completed` | Order status → Completed |
| `refund` | Order refunded |

---

## Installation Overview

### For Both Packages

1. **Install Plugin**
   - Upload ZIP via WordPress admin → Plugins → Add New → Upload
   - Or extract to `/wp-content/plugins/` via FTP
   - Activate plugin

2. **Configure Settings**
   - Go to **JY/co Tracking** in WordPress admin
   - Enter GA4 Measurement ID (optional for GTM-only)
   - Select events to track
   - Configure privacy settings

3. **Import GTM Container**
   - Go to Google Tag Manager
   - Admin → Import Container
   - Select the provided JSON file
   - Choose "Merge" or "Overwrite"
   - Update GA4 Measurement ID variable
   - Publish container

4. **Test Setup**
   - Enable debug mode in plugin
   - Browse the site
   - Check browser console for `[JY/co]` logs
   - Use GTM Preview mode
   - Verify events in GA4 DebugView

### Pro Package Additional Steps

1. **Generate GA4 API Secret** (for server-side tracking)
   - GA4 → Admin → Data Streams → Measurement Protocol API secrets
   - Create new secret
   - Copy and paste into plugin settings

2. **Configure Consent Mode** (if needed)
   - Select consent platform from dropdown
   - Test consent banner integration

3. **Enable Subscriptions Tracking** (if using WooCommerce Subscriptions)
   - Automatic - just ensure WC Subscriptions is active

---

## Use Cases

### When to Use STARTER

✅ Client has standard WooCommerce store
✅ Budget-conscious project
✅ No GDPR consent requirements (or basic only)
✅ No subscription products
✅ Client-side tracking is sufficient

**Example Client:** Small e-commerce business selling physical products, US-based, basic analytics needs.

### When to Use PRO

✅ Enterprise client or high-value project
✅ GDPR/CCPA compliance required
✅ Selling subscription products (memberships, SaaS)
✅ High traffic (ad blockers concerns)
✅ External payment gateways (PayPal, Stripe redirects)
✅ Need for enhanced data (LTV, customer segmentation)

**Example Client:** EU-based SaaS company selling monthly subscriptions, needs GDPR compliance, wants bulletproof tracking including server-side backup.

---

## Technical Requirements

### WordPress & WooCommerce

- **WordPress:** 5.8 or higher
- **WooCommerce:** 6.0 or higher
- **PHP:** 7.4 or higher (8.x recommended)

### Pro Package Additional Requirements

- **WooCommerce Subscriptions:** 3.0+ (if using subscription tracking)
- **Consent Platform:** One of the supported plugins (if using Consent Mode)

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Server Requirements

- `wp_remote_post()` enabled (for Pro server-side tracking)
- SSL certificate (HTTPS required for GA4)
- Cron jobs enabled (standard WordPress)

---

## Compatibility

### Tested Themes

✅ Storefront (Official WooCommerce theme)
✅ Astra
✅ GeneratePress
✅ Kadence
✅ Flatsome
✅ OceanWP
⚠️ Divi (works, may need custom selectors)
⚠️ Avada (works, may need custom selectors)

### Tested Plugins

#### ✅ Compatible

- WooCommerce Subscriptions
- WooCommerce Memberships
- WPML (Multilingual)
- Elementor / Elementor Pro
- WPBakery Page Builder
- Yoast SEO
- Rank Math SEO
- WooCommerce Blocks (basic support)

#### ⚠️ Conflicts (Disable One)

- MonsterInsights (duplicate tracking)
- PixelYourSite (duplicate events)
- GTM4WP (duplicate dataLayer)
- Enhanced Ecommerce for WP (not needed)

### Caching Plugins

Both packages work with all major caching plugins:
- WP Rocket ✅
- LiteSpeed Cache ✅
- W3 Total Cache ✅
- WP Super Cache ✅
- SG Optimizer ✅
- Cloudflare APO ✅

**Note:** May need to exclude JavaScript file from minification. See SDR for configuration.

---

## What Clients Receive

### Deliverables

1. **WordPress Plugin** (ZIP file, ready to install)
2. **GTM Container** (JSON file, ready to import)
3. **Solution Design Reference** (PDF/DOCX/MD)
   - Architecture overview
   - Installation guide
   - Configuration steps
   - Event reference
   - Testing checklist
   - Troubleshooting guide
   - Caching plugin configurations
4. **Support Document** (Optional)
   - How to maintain
   - Common issues
   - Contact information

### Implementation Time Estimates

**STARTER Package:**
- Installation: 15 minutes
- Configuration: 15 minutes
- Testing: 30 minutes
- **Total:** ~1 hour

**PRO Package:**
- Installation: 15 minutes
- Configuration: 30 minutes (includes API secret, consent setup)
- Testing: 45 minutes (includes server-side and consent testing)
- **Total:** ~1.5 hours

---

## Customization & White-Labeling

Both packages can be easily white-labeled:

### Change Branding

1. **Plugin Name**
   - Edit main plugin file header
   - Change `Plugin Name: JY/co WooCommerce Tracking` to your name

2. **Menu Label**
   - Edit `class-jyco-settings.php`
   - Change `__( 'JY/co Tracking', 'text-domain' )`

3. **Text Domain**
   - Find/replace `jyco-tracking` with your slug
   - Update `load_plugin_textdomain()` call

4. **Function Prefixes**
   - Optional: Change `jyco_` prefix to avoid conflicts
   - Use find/replace: `jyco_` → `yourprefix_`

5. **File Names**
   - Rename plugin folder
   - Update main plugin file name
   - Update references in code

### Add Custom Features

Use WordPress hooks provided:

```php
// Example: Add custom product data
add_filter( 'jyco_format_item', function( $item, $product ) {
    $item['custom_field'] = get_post_meta( $product->get_id(), 'custom', true );
    return $item;
}, 10, 2 );
```

---

## Pricing Strategy

### Suggested Client Pricing

**STARTER Package:**
- **One-Time Implementation:** $800 - $1,500
- **Monthly Retainer (optional):** $150 - $300/mo (includes monitoring, updates)

**PRO Package:**
- **One-Time Implementation:** $2,500 - $5,000
- **Monthly Retainer (optional):** $300 - $500/mo (includes priority support)

### Value Proposition

Compare to alternatives:
- MonsterInsights Pro: $399/year (recurring)
- PixelYourSite Pro: $149/year (recurring)
- GTM4WP Premium: $99/year (recurring)
- Custom Developer: $3,000 - $10,000+ (one-time)

**Your advantage:** One-time fee, fully custom, client owns the code, no ongoing subscription.

---

## Support & Maintenance

### For Clients

Both packages include:
- **Initial Support:** 30 days email support after delivery
- **Documentation:** Complete SDR with troubleshooting
- **Updates:** Minor updates for 1 year (bug fixes, WooCommerce compatibility)

### For You (Developer/Agency)

- **Starter Support:** Standard email support
- **Pro Support:** Priority email support (24hr response time)
- **Consulting:** Available for complex customizations

**Contact:** support@jyco.io

---

## Changelog

### Version 1.0.0 (January 2025)

**Initial Release**

**STARTER Package:**
- Complete GA4 ecommerce tracking (14 events)
- WordPress plugin with settings page
- GTM container with all tags
- AJAX add-to-cart support
- Variable product support
- User data with SHA-256 hashed email
- Debug mode
- HPOS compatibility
- Privacy settings
- Full documentation

**PRO Package:**
- All Starter features
- Server-side tracking via Measurement Protocol
- Google Consent Mode v2 (5 platform integrations)
- WooCommerce Subscriptions tracking (8 events)
- Enhanced user data (LTV, customer type)
- Refund tracking
- Order completion tracking
- Developer hooks
- Advanced debugging

---

## License

This software is proprietary and licensed to JY/co.

**For Clients:** Each plugin installation is licensed to the client for use on their WordPress site(s) as specified in your service agreement.

**For Developers/Agencies:** Contact JY/co for licensing terms.

**© 2025 JY/co. All rights reserved.**

---

## Documentation

- [Starter Package SDR](starter/STARTER-SDR.md)
- [Pro Package SDR](pro/PRO-SDR.md)

---

## Credits

**Developed by:** JY/co
**Website:** https://jyco.io
**Contact:** hello@jyco.io

**Built with:**
- WordPress
- WooCommerce
- Google Analytics 4
- Google Tag Manager

---

## Next Steps

### To Use These Packages

1. **Review both SDR documents** to understand the implementation
2. **Test both packages** on a staging site
3. **Customize branding** if needed
4. **Create client deliverables** (ZIPs, PDFs)
5. **Set up your pricing** and packaging

### To Get Support

- **Email:** support@jyco.io
- **Documentation:** See SDR documents
- **Consulting:** Available for custom implementations

---

**Ready to deliver production-ready analytics to your clients!** 🚀
