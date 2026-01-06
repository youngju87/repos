<?php
/**
 * Events Handling Class
 *
 * Handles JavaScript-based events and AJAX interactions.
 *
 * @package JYCO_Tracking
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * JYCO_Events class
 */
class JYCO_Events {

	/**
	 * Initialize
	 */
	public function init() {
		// Enqueue frontend scripts
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );

		// Handle server-side add to cart tracking
		add_action( 'woocommerce_add_to_cart', array( $this, 'track_add_to_cart' ), 10, 6 );

		// AJAX endpoints for getting product data
		add_action( 'wp_ajax_jyco_get_product_data', array( $this, 'ajax_get_product_data' ) );
		add_action( 'wp_ajax_nopriv_jyco_get_product_data', array( $this, 'ajax_get_product_data' ) );

		// Track user login
		add_action( 'wp_login', array( $this, 'track_login' ), 10, 2 );

		// Track user registration
		add_action( 'user_register', array( $this, 'track_registration' ) );
	}

	/**
	 * Enqueue frontend scripts
	 */
	public function enqueue_scripts() {
		// Only load on frontend
		if ( is_admin() ) {
			return;
		}

		// Enqueue main tracking script
		wp_enqueue_script(
			'jyco-tracking',
			JYCO_TRACKING_PLUGIN_URL . 'assets/js/jyco-tracking.js',
			array( 'jquery' ),
			JYCO_TRACKING_VERSION,
			true
		);

		// Pass data to JavaScript
		wp_localize_script(
			'jyco-tracking',
			'jyco_params',
			array(
				'debug'          => (bool) get_option( 'jyco_debug_mode', false ),
				'ajax_url'       => admin_url( 'admin-ajax.php' ),
				'nonce'          => wp_create_nonce( 'jyco_tracking' ),
				'currency'       => get_woocommerce_currency(),
				'enabled_events' => get_option( 'jyco_enabled_events', array() ),
				'cart_items'     => $this->get_cart_items_for_js(),
			)
		);
	}

	/**
	 * Get cart items formatted for JavaScript
	 *
	 * @return array
	 */
	private function get_cart_items_for_js() {
		if ( ! WC()->cart ) {
			return array();
		}

		$items = array();
		$index = 0;

		foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
			$product = $cart_item['data'];

			if ( ! $product ) {
				continue;
			}

			$items[ $cart_item_key ] = array(
				'item_id'       => (string) $product->get_id(),
				'item_name'     => $product->get_name(),
				'item_category' => $this->get_product_category( $product ),
				'price'         => (float) $product->get_price(),
				'quantity'      => $cart_item['quantity'],
				'index'         => $index,
			);

			$index++;
		}

		return $items;
	}

	/**
	 * Track add to cart (server-side for non-AJAX)
	 *
	 * @param string $cart_item_key Cart item key.
	 * @param int    $product_id    Product ID.
	 * @param int    $quantity      Quantity.
	 * @param int    $variation_id  Variation ID.
	 * @param array  $variation     Variation data.
	 * @param array  $cart_item_data Cart item data.
	 */
	public function track_add_to_cart( $cart_item_key, $product_id, $quantity, $variation_id, $variation, $cart_item_data ) {
		// Only track if not AJAX (AJAX is handled by JavaScript)
		if ( wp_doing_ajax() ) {
			return;
		}

		// Get product
		$product = wc_get_product( $variation_id ? $variation_id : $product_id );

		if ( ! $product ) {
			return;
		}

		// Store in session to output on next page load
		$event_data = array(
			'event'    => 'add_to_cart',
			'currency' => get_woocommerce_currency(),
			'value'    => (float) ( $product->get_price() * $quantity ),
			'items'    => array(
				array(
					'item_id'       => (string) $product->get_id(),
					'item_name'     => $product->get_name(),
					'item_category' => $this->get_product_category( $product ),
					'price'         => (float) $product->get_price(),
					'quantity'      => $quantity,
				),
			),
		);

		WC()->session->set( 'jyco_pending_event', $event_data );

		// Output on next page load
		add_action( 'wp_footer', array( $this, 'output_pending_event' ) );
	}

	/**
	 * Output pending event from session
	 */
	public function output_pending_event() {
		if ( ! WC()->session ) {
			return;
		}

		$event_data = WC()->session->get( 'jyco_pending_event' );

		if ( empty( $event_data ) ) {
			return;
		}

		// Clear from session
		WC()->session->set( 'jyco_pending_event', null );

		// Output event
		?>
		<script>
		window.dataLayer = window.dataLayer || [];
		window.dataLayer.push({ ecommerce: null });
		window.dataLayer.push(<?php echo wp_json_encode( $event_data, JSON_UNESCAPED_UNICODE ); ?>);
		</script>
		<?php
	}

	/**
	 * AJAX: Get product data
	 */
	public function ajax_get_product_data() {
		check_ajax_referer( 'jyco_tracking', 'nonce' );

		$product_id = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;

		if ( ! $product_id ) {
			wp_send_json_error( 'Invalid product ID' );
		}

		$product = wc_get_product( $product_id );

		if ( ! $product ) {
			wp_send_json_error( 'Product not found' );
		}

		$data = array(
			'item_id'       => (string) $product->get_id(),
			'item_name'     => $product->get_name(),
			'item_category' => $this->get_product_category( $product ),
			'item_brand'    => $this->get_product_brand( $product ),
			'price'         => (float) $product->get_price(),
		);

		// Add variant for variable products
		if ( $product->is_type( 'variation' ) ) {
			$data['item_variant'] = $this->get_variation_name( $product );
		}

		wp_send_json_success( $data );
	}

	/**
	 * Track user login
	 *
	 * @param string  $user_login Username.
	 * @param WP_User $user       User object.
	 */
	public function track_login( $user_login, $user ) {
		// Store in session to output on next page load
		$event_data = array(
			'event'   => 'login',
			'method'  => 'wordpress',
			'user_id' => (string) $user->ID,
		);

		// Use transient since session might not be available yet
		set_transient( 'jyco_login_event_' . $user->ID, $event_data, 60 );
	}

	/**
	 * Track user registration
	 *
	 * @param int $user_id User ID.
	 */
	public function track_registration( $user_id ) {
		// Store in session to output on next page load
		$event_data = array(
			'event'   => 'sign_up',
			'method'  => 'wordpress',
			'user_id' => (string) $user_id,
		);

		// Use transient since session might not be available yet
		set_transient( 'jyco_signup_event_' . $user_id, $event_data, 60 );
	}

	/**
	 * Get product category
	 *
	 * @param WC_Product $product Product object.
	 * @return string
	 */
	private function get_product_category( $product ) {
		$categories = get_the_terms( $product->get_id(), 'product_cat' );

		if ( $categories && ! is_wp_error( $categories ) ) {
			$categories_array = array();
			foreach ( $categories as $category ) {
				$categories_array[] = $category->name;
			}
			return implode( '/', array_slice( $categories_array, 0, 5 ) );
		}

		return '';
	}

	/**
	 * Get product brand
	 *
	 * @param WC_Product $product Product object.
	 * @return string
	 */
	private function get_product_brand( $product ) {
		// Check for common brand taxonomies
		$brand_taxonomies = array( 'product_brand', 'brand', 'yith_product_brand', 'pwb-brand' );

		foreach ( $brand_taxonomies as $taxonomy ) {
			if ( taxonomy_exists( $taxonomy ) ) {
				$brands = get_the_terms( $product->get_id(), $taxonomy );
				if ( $brands && ! is_wp_error( $brands ) ) {
					return $brands[0]->name;
				}
			}
		}

		return apply_filters( 'jyco_product_brand', '', $product );
	}

	/**
	 * Get variation name
	 *
	 * @param WC_Product $product Product object.
	 * @return string
	 */
	private function get_variation_name( $product ) {
		if ( ! $product->is_type( 'variation' ) ) {
			return '';
		}

		$attributes    = $product->get_attributes();
		$variant_parts = array();

		foreach ( $attributes as $key => $value ) {
			$variant_parts[] = ucfirst( $value );
		}

		return implode( ' / ', $variant_parts );
	}
}
