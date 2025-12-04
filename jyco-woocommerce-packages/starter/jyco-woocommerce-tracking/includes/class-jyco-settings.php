<?php
/**
 * Settings Class
 *
 * Handles the admin settings page.
 *
 * @package JYCO_Tracking
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * JYCO_Settings class
 */
class JYCO_Settings {

	/**
	 * Initialize
	 */
	public function init() {
		// Add admin menu
		add_action( 'admin_menu', array( $this, 'add_menu' ) );

		// Register settings
		add_action( 'admin_init', array( $this, 'register_settings' ) );

		// Add styles for settings page
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_styles' ) );
	}

	/**
	 * Add admin menu
	 */
	public function add_menu() {
		add_menu_page(
			__( 'JY/co Tracking', 'jyco-tracking' ),
			__( 'JY/co Tracking', 'jyco-tracking' ),
			'manage_options',
			'jyco-tracking-settings',
			array( $this, 'settings_page' ),
			'dashicons-chart-line',
			56
		);
	}

	/**
	 * Register settings
	 */
	public function register_settings() {
		// General settings section
		add_settings_section(
			'jyco_general_section',
			__( 'General Settings', 'jyco-tracking' ),
			array( $this, 'general_section_callback' ),
			'jyco-tracking-settings'
		);

		// GA4 Measurement ID
		register_setting( 'jyco_tracking_settings', 'jyco_measurement_id', array(
			'type'              => 'string',
			'sanitize_callback' => 'sanitize_text_field',
			'default'           => '',
		) );

		add_settings_field(
			'jyco_measurement_id',
			__( 'GA4 Measurement ID', 'jyco-tracking' ),
			array( $this, 'measurement_id_callback' ),
			'jyco-tracking-settings',
			'jyco_general_section'
		);

		// Debug mode
		register_setting( 'jyco_tracking_settings', 'jyco_debug_mode', array(
			'type'              => 'boolean',
			'sanitize_callback' => 'rest_sanitize_boolean',
			'default'           => false,
		) );

		add_settings_field(
			'jyco_debug_mode',
			__( 'Debug Mode', 'jyco-tracking' ),
			array( $this, 'debug_mode_callback' ),
			'jyco-tracking-settings',
			'jyco_general_section'
		);

		// Events settings section
		add_settings_section(
			'jyco_events_section',
			__( 'Event Settings', 'jyco-tracking' ),
			array( $this, 'events_section_callback' ),
			'jyco-tracking-settings'
		);

		// Enabled events
		register_setting( 'jyco_tracking_settings', 'jyco_enabled_events', array(
			'type'              => 'array',
			'sanitize_callback' => array( $this, 'sanitize_enabled_events' ),
			'default'           => array(),
		) );

		add_settings_field(
			'jyco_enabled_events',
			__( 'Enabled Events', 'jyco-tracking' ),
			array( $this, 'enabled_events_callback' ),
			'jyco-tracking-settings',
			'jyco_events_section'
		);

		// Privacy settings section
		add_settings_section(
			'jyco_privacy_section',
			__( 'Privacy Settings', 'jyco-tracking' ),
			array( $this, 'privacy_section_callback' ),
			'jyco-tracking-settings'
		);

		// Exclude user roles
		register_setting( 'jyco_tracking_settings', 'jyco_exclude_roles', array(
			'type'              => 'array',
			'sanitize_callback' => array( $this, 'sanitize_exclude_roles' ),
			'default'           => array(),
		) );

		add_settings_field(
			'jyco_exclude_roles',
			__( 'Exclude User Roles', 'jyco-tracking' ),
			array( $this, 'exclude_roles_callback' ),
			'jyco-tracking-settings',
			'jyco_privacy_section'
		);
	}

	/**
	 * Settings page HTML
	 */
	public function settings_page() {
		// Check user capabilities
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		// Save settings message
		if ( isset( $_GET['settings-updated'] ) ) {
			add_settings_error(
				'jyco_messages',
				'jyco_message',
				__( 'Settings saved successfully.', 'jyco-tracking' ),
				'updated'
			);
		}

		settings_errors( 'jyco_messages' );
		?>
		<div class="wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>

			<div class="jyco-settings-header">
				<p><?php esc_html_e( 'Configure GA4 ecommerce tracking for your WooCommerce store.', 'jyco-tracking' ); ?></p>
			</div>

			<form action="options.php" method="post">
				<?php
				settings_fields( 'jyco_tracking_settings' );
				do_settings_sections( 'jyco-tracking-settings' );
				submit_button( __( 'Save Settings', 'jyco-tracking' ) );
				?>
			</form>

			<div class="jyco-settings-footer">
				<h2><?php esc_html_e( 'Testing Your Setup', 'jyco-tracking' ); ?></h2>
				<ol>
					<li><?php esc_html_e( 'Enable Debug Mode above and save settings', 'jyco-tracking' ); ?></li>
					<li><?php esc_html_e( 'Open your website in a new tab', 'jyco-tracking' ); ?></li>
					<li><?php esc_html_e( 'Open browser console (F12)', 'jyco-tracking' ); ?></li>
					<li><?php esc_html_e( 'Look for [JY/co] log messages', 'jyco-tracking' ); ?></li>
					<li><?php esc_html_e( 'Use GTM Preview Mode or GA4 DebugView to verify events', 'jyco-tracking' ); ?></li>
				</ol>

				<h3><?php esc_html_e( 'Need Help?', 'jyco-tracking' ); ?></h3>
				<p>
					<?php esc_html_e( 'Documentation:', 'jyco-tracking' ); ?>
					<a href="https://jyco.io/docs/woocommerce-tracking" target="_blank">https://jyco.io/docs</a>
				</p>
			</div>
		</div>
		<?php
	}

	/**
	 * General section callback
	 */
	public function general_section_callback() {
		echo '<p>' . esc_html__( 'Basic configuration for GA4 tracking.', 'jyco-tracking' ) . '</p>';
	}

	/**
	 * Events section callback
	 */
	public function events_section_callback() {
		echo '<p>' . esc_html__( 'Choose which events to track. All events are pushed to the dataLayer for GTM.', 'jyco-tracking' ) . '</p>';
	}

	/**
	 * Privacy section callback
	 */
	public function privacy_section_callback() {
		echo '<p>' . esc_html__( 'Control which users are tracked.', 'jyco-tracking' ) . '</p>';
	}

	/**
	 * Measurement ID field
	 */
	public function measurement_id_callback() {
		$value = get_option( 'jyco_measurement_id', '' );
		?>
		<input
			type="text"
			name="jyco_measurement_id"
			value="<?php echo esc_attr( $value ); ?>"
			class="regular-text"
			placeholder="G-XXXXXXXXXX"
		>
		<p class="description">
			<?php esc_html_e( 'Optional. Only required if sending events directly to GA4. Leave empty if using GTM only.', 'jyco-tracking' ); ?>
		</p>
		<?php
	}

	/**
	 * Debug mode field
	 */
	public function debug_mode_callback() {
		$value = get_option( 'jyco_debug_mode', false );
		?>
		<label>
			<input
				type="checkbox"
				name="jyco_debug_mode"
				value="1"
				<?php checked( $value, true ); ?>
			>
			<?php esc_html_e( 'Enable debug logging in browser console', 'jyco-tracking' ); ?>
		</label>
		<p class="description">
			<?php esc_html_e( 'Shows detailed event data in browser console. Disable in production.', 'jyco-tracking' ); ?>
		</p>
		<?php
	}

	/**
	 * Enabled events field
	 */
	public function enabled_events_callback() {
		$enabled = get_option( 'jyco_enabled_events', array() );
		$events  = array(
			'page_view'         => __( 'Page View', 'jyco-tracking' ),
			'view_item_list'    => __( 'View Item List', 'jyco-tracking' ),
			'select_item'       => __( 'Select Item', 'jyco-tracking' ),
			'view_item'         => __( 'View Item', 'jyco-tracking' ),
			'add_to_cart'       => __( 'Add to Cart', 'jyco-tracking' ),
			'remove_from_cart'  => __( 'Remove from Cart', 'jyco-tracking' ),
			'view_cart'         => __( 'View Cart', 'jyco-tracking' ),
			'begin_checkout'    => __( 'Begin Checkout', 'jyco-tracking' ),
			'add_shipping_info' => __( 'Add Shipping Info', 'jyco-tracking' ),
			'add_payment_info'  => __( 'Add Payment Info', 'jyco-tracking' ),
			'purchase'          => __( 'Purchase', 'jyco-tracking' ),
			'search'            => __( 'Search', 'jyco-tracking' ),
			'login'             => __( 'Login', 'jyco-tracking' ),
			'sign_up'           => __( 'Sign Up', 'jyco-tracking' ),
		);

		echo '<fieldset>';
		foreach ( $events as $event_key => $event_label ) {
			$checked = in_array( $event_key, $enabled, true );
			?>
			<label style="display: block; margin-bottom: 8px;">
				<input
					type="checkbox"
					name="jyco_enabled_events[]"
					value="<?php echo esc_attr( $event_key ); ?>"
					<?php checked( $checked, true ); ?>
				>
				<?php echo esc_html( $event_label ); ?>
			</label>
			<?php
		}
		echo '</fieldset>';
		?>
		<p class="description">
			<?php esc_html_e( 'Select which events to track. All events use GA4 standard format.', 'jyco-tracking' ); ?>
		</p>
		<?php
	}

	/**
	 * Exclude roles field
	 */
	public function exclude_roles_callback() {
		$excluded = get_option( 'jyco_exclude_roles', array() );
		$roles    = wp_roles()->get_names();

		echo '<fieldset>';
		foreach ( $roles as $role_key => $role_name ) {
			$checked = in_array( $role_key, $excluded, true );
			?>
			<label style="display: block; margin-bottom: 8px;">
				<input
					type="checkbox"
					name="jyco_exclude_roles[]"
					value="<?php echo esc_attr( $role_key ); ?>"
					<?php checked( $checked, true ); ?>
				>
				<?php echo esc_html( translate_user_role( $role_name ) ); ?>
			</label>
			<?php
		}
		echo '</fieldset>';
		?>
		<p class="description">
			<?php esc_html_e( 'Prevent tracking for specific user roles (e.g., administrators, editors).', 'jyco-tracking' ); ?>
		</p>
		<?php
	}

	/**
	 * Sanitize enabled events
	 *
	 * @param array $input Input array.
	 * @return array
	 */
	public function sanitize_enabled_events( $input ) {
		if ( ! is_array( $input ) ) {
			return array();
		}

		$valid_events = array(
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
		);

		return array_intersect( $input, $valid_events );
	}

	/**
	 * Sanitize exclude roles
	 *
	 * @param array $input Input array.
	 * @return array
	 */
	public function sanitize_exclude_roles( $input ) {
		if ( ! is_array( $input ) ) {
			return array();
		}

		$valid_roles = array_keys( wp_roles()->get_names() );

		return array_intersect( $input, $valid_roles );
	}

	/**
	 * Enqueue admin styles
	 *
	 * @param string $hook Current admin page hook.
	 */
	public function enqueue_admin_styles( $hook ) {
		if ( 'toplevel_page_jyco-tracking-settings' !== $hook ) {
			return;
		}

		// Inline CSS for settings page
		wp_add_inline_style( 'wp-admin', '
			.jyco-settings-header {
				background: #fff;
				border-left: 4px solid #0073aa;
				padding: 16px;
				margin: 20px 0;
			}
			.jyco-settings-footer {
				background: #f9f9f9;
				border: 1px solid #ddd;
				padding: 20px;
				margin-top: 40px;
			}
			.jyco-settings-footer h2,
			.jyco-settings-footer h3 {
				margin-top: 0;
			}
			.jyco-settings-footer ol {
				margin-left: 20px;
			}
		' );
	}
}
