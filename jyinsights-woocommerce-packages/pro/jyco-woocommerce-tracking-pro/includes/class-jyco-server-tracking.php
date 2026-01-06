<?php
/**
 * Server-Side Tracking Class
 *
 * Handles server-side event tracking via GA4 Measurement Protocol.
 * Provides backup tracking for critical events like purchases.
 *
 * @package JYCO_Tracking_Pro
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * JYCO_Server_Tracking class
 */
class JYCO_Server_Tracking {

	/**
	 * GA4 Measurement ID
	 *
	 * @var string
	 */
	private $measurement_id;

	/**
	 * GA4 API Secret
	 *
	 * @var string
	 */
	private $api_secret;

	/**
	 * Debug mode
	 *
	 * @var bool
	 */
	private $debug;

	/**
	 * Initialize
	 */
	public function init() {
		// Only initialize if enabled
		if ( ! get_option( 'jyco_server_side_enabled', true ) ) {
			return;
		}

		$this->measurement_id = get_option( 'jyco_measurement_id', '' );
		$this->api_secret     = get_option( 'jyco_api_secret', '' );
		$this->debug          = get_option( 'jyco_debug_mode', false );

		// Check if credentials are configured
		if ( empty( $this->measurement_id ) || empty( $this->api_secret ) ) {
			return;
		}

		// Hook into purchase event
		add_action( 'woocommerce_thankyou', array( $this, 'track_purchase' ), 20, 1 );

		// Optional: Track order status changes
		add_action( 'woocommerce_order_status_completed', array( $this, 'track_order_completed' ), 10, 1 );
		add_action( 'woocommerce_order_status_refunded', array( $this, 'track_refund' ), 10, 1 );
	}

	/**
	 * Track purchase event server-side
	 *
	 * @param int $order_id Order ID.
	 */
	public function track_purchase( $order_id ) {
		if ( ! $order_id ) {
			return;
		}

		$order = wc_get_order( $order_id );

		if ( ! $order ) {
			return;
		}

		// Check if already tracked server-side
		if ( get_post_meta( $order_id, '_jyco_server_tracked', true ) ) {
			return;
		}

		// Mark as tracked
		update_post_meta( $order_id, '_jyco_server_tracked', true );

		// Build purchase event
		$event = array(
			'name'   => 'purchase',
			'params' => array(
				'transaction_id' => (string) $order->get_order_number(),
				'affiliation'    => get_bloginfo( 'name' ),
				'value'          => (float) $order->get_total(),
				'tax'            => (float) $order->get_total_tax(),
				'shipping'       => (float) $order->get_shipping_total(),
				'currency'       => $order->get_currency(),
				'coupon'         => implode( ', ', $order->get_coupon_codes() ),
				'items'          => $this->get_order_items( $order ),
			),
		);

		// Add user properties
		$user_properties = $this->get_user_properties( $order );

		// Send to GA4
		$this->send_event( $event, $order, $user_properties );
	}

	/**
	 * Track order completed (status change to completed)
	 *
	 * @param int $order_id Order ID.
	 */
	public function track_order_completed( $order_id ) {
		$order = wc_get_order( $order_id );

		if ( ! $order ) {
			return;
		}

		// Custom event for order completion
		$event = array(
			'name'   => 'order_completed',
			'params' => array(
				'transaction_id' => (string) $order->get_order_number(),
				'value'          => (float) $order->get_total(),
				'currency'       => $order->get_currency(),
			),
		);

		$this->send_event( $event, $order );
	}

	/**
	 * Track refund
	 *
	 * @param int $order_id Order ID.
	 */
	public function track_refund( $order_id ) {
		$order = wc_get_order( $order_id );

		if ( ! $order ) {
			return;
		}

		$event = array(
			'name'   => 'refund',
			'params' => array(
				'transaction_id' => (string) $order->get_order_number(),
				'value'          => (float) $order->get_total(),
				'currency'       => $order->get_currency(),
				'items'          => $this->get_order_items( $order ),
			),
		);

		$this->send_event( $event, $order );
	}

	/**
	 * Get order items formatted for GA4
	 *
	 * @param WC_Order $order Order object.
	 * @return array
	 */
	private function get_order_items( $order ) {
		$items = array();
		$index = 0;

		foreach ( $order->get_items() as $item ) {
			$product = $item->get_product();

			if ( ! $product ) {
				continue;
			}

			$item_data = array(
				'item_id'       => (string) $product->get_id(),
				'item_name'     => $item->get_name(),
				'item_brand'    => $this->get_product_brand( $product ),
				'item_category' => $this->get_product_category( $product ),
				'price'         => (float) $order->get_item_total( $item, false ),
				'quantity'      => $item->get_quantity(),
				'index'         => $index,
			);

			// Add variant for variable products
			if ( $product->is_type( 'variation' ) ) {
				$item_data['item_variant'] = $this->get_variation_name( $product );
			}

			// Add SKU if available
			if ( $product->get_sku() ) {
				$item_data['item_sku'] = $product->get_sku();
			}

			$items[] = $item_data;
			$index++;
		}

		return $items;
	}

	/**
	 * Get user properties from order
	 *
	 * @param WC_Order $order Order object.
	 * @return array
	 */
	private function get_user_properties( $order ) {
		$properties = array();

		// Customer type
		$customer_id = $order->get_customer_id();
		if ( $customer_id ) {
			// Check if first order
			$orders = wc_get_orders(
				array(
					'customer_id' => $customer_id,
					'limit'       => 2,
					'return'      => 'ids',
				)
			);

			$properties['customer_type'] = count( $orders ) === 1 ? 'new' : 'returning';

			// Calculate LTV (Pro feature)
			$ltv = 0;
			$all_orders = wc_get_orders(
				array(
					'customer_id' => $customer_id,
					'limit'       => -1,
					'status'      => array( 'completed', 'processing' ),
				)
			);

			foreach ( $all_orders as $customer_order ) {
				$ltv += (float) $customer_order->get_total();
			}

			$properties['customer_ltv'] = $ltv;
		} else {
			$properties['customer_type'] = 'guest';
		}

		return $properties;
	}

	/**
	 * Get client ID from cookie
	 *
	 * @return string
	 */
	private function get_client_id() {
		// Try to get GA4 client ID from cookie
		if ( isset( $_COOKIE['_ga'] ) ) {
			$ga_cookie = sanitize_text_field( wp_unslash( $_COOKIE['_ga'] ) );
			$parts     = explode( '.', $ga_cookie );
			if ( count( $parts ) === 4 ) {
				return $parts[2] . '.' . $parts[3];
			}
		}

		// Generate a fallback client ID
		return uniqid( 'ss_', true );
	}

	/**
	 * Send event to GA4 Measurement Protocol
	 *
	 * @param array    $event           Event data.
	 * @param WC_Order $order           Order object.
	 * @param array    $user_properties User properties (optional).
	 */
	private function send_event( $event, $order, $user_properties = array() ) {
		$client_id = $this->get_client_id();

		// Build payload
		$payload = array(
			'client_id' => $client_id,
			'events'    => array( $event ),
		);

		// Add user properties if provided
		if ( ! empty( $user_properties ) ) {
			$payload['user_properties'] = $user_properties;
		}

		// Add user ID if available
		$customer_id = $order->get_customer_id();
		if ( $customer_id ) {
			$payload['user_id'] = (string) $customer_id;
		}

		// Determine endpoint (debug or production)
		$endpoint = $this->debug ? 'debug/mp/collect' : 'mp/collect';

		// Build URL
		$url = 'https://www.google-analytics.com/' . $endpoint . '?' . http_build_query(
			array(
				'measurement_id' => $this->measurement_id,
				'api_secret'     => $this->api_secret,
			)
		);

		// Send request (non-blocking)
		$response = wp_remote_post(
			$url,
			array(
				'body'     => wp_json_encode( $payload ),
				'headers'  => array( 'Content-Type' => 'application/json' ),
				'blocking' => false, // Don't wait for response
				'timeout'  => 1,
			)
		);

		// Log if debug mode
		if ( $this->debug ) {
			$this->log_request( $payload, $response );
		}
	}

	/**
	 * Log request for debugging
	 *
	 * @param array $payload  Request payload.
	 * @param mixed $response Response from API.
	 */
	private function log_request( $payload, $response ) {
		$log_entry = array(
			'timestamp' => current_time( 'mysql' ),
			'payload'   => $payload,
			'response'  => is_wp_error( $response ) ? $response->get_error_message() : 'Sent (non-blocking)',
		);

		// Store in transient for admin review
		$logs = get_transient( 'jyco_server_tracking_logs' );
		if ( ! $logs ) {
			$logs = array();
		}

		$logs[] = $log_entry;

		// Keep only last 20 logs
		$logs = array_slice( $logs, -20 );

		set_transient( 'jyco_server_tracking_logs', $logs, DAY_IN_SECONDS );
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
