<?php
/**
 * Plugin Name: JY/co WooCommerce Tracking Pro
 * Plugin URI: https://jyco.io
 * Description: Advanced GA4 ecommerce tracking for WooCommerce with server-side backup, consent mode, and multi-currency support
 * Version: 1.0.0
 * Author: JY/co
 * Author URI: https://jyco.io
 * Text Domain: jyco-tracking-pro
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * WC requires at least: 6.0
 * WC tested up to: 8.0
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin constants
define( 'JYCO_TRACKING_PRO_VERSION', '1.0.0' );
define( 'JYCO_TRACKING_PRO_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'JYCO_TRACKING_PRO_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'JYCO_TRACKING_PRO_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

/**
 * Main plugin class
 */
class JYCO_WooCommerce_Tracking_Pro {

	/**
	 * Single instance of the class
	 *
	 * @var JYCO_WooCommerce_Tracking_Pro
	 */
	protected static $_instance = null;

	/**
	 * DataLayer instance
	 *
	 * @var JYCO_DataLayer
	 */
	public $datalayer = null;

	/**
	 * Events instance
	 *
	 * @var JYCO_Events
	 */
	public $events = null;

	/**
	 * Settings instance
	 *
	 * @var JYCO_Settings
	 */
	public $settings = null;

	/**
	 * Server tracking instance
	 *
	 * @var JYCO_Server_Tracking
	 */
	public $server_tracking = null;

	/**
	 * Consent instance
	 *
	 * @var JYCO_Consent
	 */
	public $consent = null;

	/**
	 * Subscriptions instance
	 *
	 * @var JYCO_Subscriptions
	 */
	public $subscriptions = null;

	/**
	 * Main instance
	 *
	 * Ensures only one instance is loaded or can be loaded.
	 *
	 * @return JYCO_WooCommerce_Tracking_Pro
	 */
	public static function instance() {
		if ( is_null( self::$_instance ) ) {
			self::$_instance = new self();
		}
		return self::$_instance;
	}

	/**
	 * Constructor
	 */
	public function __construct() {
		// Check if WooCommerce is active
		add_action( 'plugins_loaded', array( $this, 'init' ) );

		// Activation hook
		register_activation_hook( __FILE__, array( $this, 'activate' ) );

		// Add settings link on plugins page
		add_filter( 'plugin_action_links_' . JYCO_TRACKING_PRO_PLUGIN_BASENAME, array( $this, 'plugin_action_links' ) );
	}

	/**
	 * Initialize the plugin
	 */
	public function init() {
		// Check for WooCommerce
		if ( ! class_exists( 'WooCommerce' ) ) {
			add_action( 'admin_notices', array( $this, 'woocommerce_missing_notice' ) );
			return;
		}

		// Declare HPOS compatibility
		add_action( 'before_woocommerce_init', array( $this, 'declare_hpos_compatibility' ) );

		// Load plugin classes
		$this->includes();

		// Initialize core classes
		$this->datalayer = new JYCO_DataLayer();
		$this->events    = new JYCO_Events();
		$this->settings  = new JYCO_Settings();

		// Initialize Pro features
		$this->server_tracking = new JYCO_Server_Tracking();
		$this->consent         = new JYCO_Consent();

		// Initialize components
		$this->datalayer->init();
		$this->events->init();
		$this->settings->init();
		$this->server_tracking->init();
		$this->consent->init();

		// Initialize Subscriptions support if available
		if ( class_exists( 'WC_Subscriptions' ) ) {
			$this->subscriptions = new JYCO_Subscriptions();
			$this->subscriptions->init();
		}

		// Load text domain
		load_plugin_textdomain( 'jyco-tracking-pro', false, dirname( JYCO_TRACKING_PRO_PLUGIN_BASENAME ) . '/languages' );
	}

	/**
	 * Include required files
	 */
	private function includes() {
		// Core classes
		require_once JYCO_TRACKING_PRO_PLUGIN_DIR . 'includes/class-jyco-datalayer.php';
		require_once JYCO_TRACKING_PRO_PLUGIN_DIR . 'includes/class-jyco-events.php';
		require_once JYCO_TRACKING_PRO_PLUGIN_DIR . 'includes/class-jyco-settings.php';

		// Pro features
		require_once JYCO_TRACKING_PRO_PLUGIN_DIR . 'includes/class-jyco-server-tracking.php';
		require_once JYCO_TRACKING_PRO_PLUGIN_DIR . 'includes/class-jyco-consent.php';
		require_once JYCO_TRACKING_PRO_PLUGIN_DIR . 'includes/class-jyco-subscriptions.php';
	}

	/**
	 * Declare HPOS compatibility
	 */
	public function declare_hpos_compatibility() {
		if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
		}
	}

	/**
	 * Plugin activation
	 */
	public function activate() {
		// Set default options
		$defaults = array(
			'jyco_measurement_id'      => '',
			'jyco_api_secret'          => '',
			'jyco_debug_mode'          => false,
			'jyco_server_side_enabled' => true,
			'jyco_consent_mode'        => 'none',
			'jyco_enabled_events'      => array(
				'page_view',
				'view_item_list',
				'select_item',
				'view_item',
				'add_to_cart',
				'remove_from_cart',
				'view_cart',
				'begin_checkout',
				'add_shipping_info',
				'add_payment_info',
				'purchase',
				'search',
				'login',
				'sign_up',
			),
			'jyco_exclude_roles'       => array( 'administrator' ),
		);

		foreach ( $defaults as $key => $value ) {
			if ( false === get_option( $key ) ) {
				add_option( $key, $value );
			}
		}
	}

	/**
	 * WooCommerce missing notice
	 */
	public function woocommerce_missing_notice() {
		?>
		<div class="error">
			<p>
				<?php
				echo wp_kses_post(
					sprintf(
						/* translators: %s: WooCommerce plugin link */
						__( '<strong>JY/co WooCommerce Tracking Pro</strong> requires WooCommerce to be installed and active. You can download %s here.', 'jyco-tracking-pro' ),
						'<a href="https://wordpress.org/plugins/woocommerce/" target="_blank">WooCommerce</a>'
					)
				);
				?>
			</p>
		</div>
		<?php
	}

	/**
	 * Add settings link to plugins page
	 *
	 * @param array $links Plugin action links.
	 * @return array
	 */
	public function plugin_action_links( $links ) {
		$settings_link = '<a href="' . esc_url( admin_url( 'admin.php?page=jyco-tracking-settings' ) ) . '">' . esc_html__( 'Settings', 'jyco-tracking-pro' ) . '</a>';
		array_unshift( $links, $settings_link );
		return $links;
	}
}

/**
 * Returns the main instance of JYCO_WooCommerce_Tracking_Pro
 *
 * @return JYCO_WooCommerce_Tracking_Pro
 */
function JYCO_Tracking_Pro() {
	return JYCO_WooCommerce_Tracking_Pro::instance();
}

// Initialize the plugin
JYCO_Tracking_Pro();
