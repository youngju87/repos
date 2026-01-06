=== JY/co WooCommerce Tracking ===
Contributors: jyco
Tags: woocommerce, google analytics, ga4, ecommerce, tracking, gtm, google tag manager
Requires at least: 5.8
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

GA4 ecommerce tracking for WooCommerce via Google Tag Manager dataLayer.

== Description ==

**JY/co WooCommerce Tracking** provides production-ready GA4 ecommerce tracking for WooCommerce stores through Google Tag Manager's dataLayer.

= Features =

* Complete GA4 ecommerce event tracking
* Lightweight and performance-optimized
* Google Tag Manager dataLayer integration
* Support for all standard WooCommerce events
* AJAX add-to-cart tracking
* Variable product support
* User tracking with hashed email
* Debug mode for testing
* HPOS (High-Performance Order Storage) compatible
* Privacy-focused with role exclusion

= Tracked Events =

* page_view - Every page load
* view_item_list - Shop and category pages
* select_item - Product clicks from lists
* view_item - Single product pages
* add_to_cart - Add to cart (AJAX and standard)
* remove_from_cart - Remove from cart
* view_cart - Cart page
* begin_checkout - Checkout page
* add_shipping_info - Shipping method selection
* add_payment_info - Payment method selection
* purchase - Order completion
* search - Search results
* login - User login
* sign_up - User registration

= Perfect For =

* WooCommerce store owners
* Digital marketing professionals
* E-commerce agencies
* Anyone using Google Tag Manager with WooCommerce

= Requirements =

* WordPress 5.8 or higher
* WooCommerce 6.0 or higher
* PHP 7.4 or higher
* Google Tag Manager (recommended) or GA4 Measurement ID

== Installation ==

= Automatic Installation =

1. Log in to your WordPress dashboard
2. Navigate to Plugins → Add New
3. Search for "JY/co WooCommerce Tracking"
4. Click "Install Now" and then "Activate"

= Manual Installation =

1. Download the plugin ZIP file
2. Log in to your WordPress dashboard
3. Navigate to Plugins → Add New → Upload Plugin
4. Choose the ZIP file and click "Install Now"
5. Click "Activate Plugin"

= Configuration =

1. Go to JY/co Tracking in your WordPress admin menu
2. Enter your GA4 Measurement ID (optional if using GTM only)
3. Select which events to track
4. Configure privacy settings
5. Save settings
6. Import the provided GTM container JSON file (see documentation)
7. Test using Debug Mode and GTM Preview

== Frequently Asked Questions ==

= Do I need Google Tag Manager? =

While the plugin works with direct GA4 integration, we strongly recommend using Google Tag Manager for maximum flexibility and ease of use. A pre-configured GTM container is provided with the plugin.

= Does this work with AJAX add to cart? =

Yes! The plugin fully supports AJAX add-to-cart functionality, including the default WooCommerce AJAX add to cart on shop pages.

= Is this compatible with variable products? =

Yes, the plugin correctly tracks variable products with their selected variations.

= Does this work with [caching plugin]? =

The plugin is designed to work with most caching plugins. For best results:
- Exclude the tracking JavaScript from minification
- Use fragment caching if available

See the documentation for specific caching plugin configurations.

= Can I exclude certain user roles from tracking? =

Yes! In the settings page, you can select which user roles to exclude from tracking (e.g., administrators, editors).

= Is this GDPR compliant? =

The plugin provides tools for privacy compliance:
- User emails are hashed (SHA-256)
- User role exclusion
- Compatible with consent management platforms

You are responsible for implementing proper consent management and complying with applicable privacy laws.

= Does this work with WooCommerce Blocks? =

Basic support for WooCommerce Blocks is included. Full block-based checkout support is in development.

== Screenshots ==

1. Settings page - General configuration
2. Event selection - Choose which events to track
3. Privacy settings - Exclude user roles
4. Debug mode - Console output showing tracked events
5. GTM Preview - Events firing in Google Tag Manager

== Changelog ==

= 1.0.0 =
* Initial release
* Support for all GA4 ecommerce events
* Google Tag Manager dataLayer integration
* AJAX add-to-cart tracking
* Variable product support
* User tracking with hashed email
* Debug mode
* HPOS compatibility
* Privacy settings

== Upgrade Notice ==

= 1.0.0 =
Initial release of JY/co WooCommerce Tracking.

== Documentation ==

Complete documentation is available at: https://jyco.io/docs/woocommerce-tracking

Includes:
* Installation guide
* GTM container setup
* Event reference
* Troubleshooting
* Caching plugin compatibility
* Custom implementation examples

== Support ==

For support, please visit: https://jyco.io/support

== About JY/co ==

JY/co provides analytics implementation and consulting services for e-commerce businesses.

Learn more at: https://jyco.io
