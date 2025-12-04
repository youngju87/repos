<?php
/**
 * Subscriptions Tracking Class
 *
 * Handles tracking for WooCommerce Subscriptions plugin.
 *
 * @package JYCO_Tracking_Pro
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * JYCO_Subscriptions class
 */
class JYCO_Subscriptions {

	/**
	 * Initialize
	 */
	public function init() {
		// Subscription lifecycle events
		add_action( 'woocommerce_subscription_status_active', array( $this, 'track_subscription_start' ), 10, 1 );
		add_action( 'woocommerce_subscription_status_cancelled', array( $this, 'track_subscription_cancel' ), 10, 1 );
		add_action( 'woocommerce_subscription_status_expired', array( $this, 'track_subscription_expire' ), 10, 1 );
		add_action( 'woocommerce_subscription_status_pending-cancel', array( $this, 'track_subscription_pending_cancel' ), 10, 1 );

		// Renewal events
		add_action( 'woocommerce_subscription_renewal_payment_complete', array( $this, 'track_renewal_success' ), 10, 2 );
		add_action( 'woocommerce_subscription_renewal_payment_failed', array( $this, 'track_renewal_failed' ), 10, 2 );

		// Reactivation
		add_action( 'woocommerce_subscription_status_on-hold_to_active', array( $this, 'track_subscription_reactivate' ), 10, 1 );

		// Trial conversions
		add_action( 'woocommerce_subscription_trial_end', array( $this, 'track_trial_end' ), 10, 1 );
	}

	/**
	 * Track subscription start/activation
	 *
	 * @param WC_Subscription $subscription Subscription object.
	 */
	public function track_subscription_start( $subscription ) {
		$event_data = array(
			'event'            => 'subscription_start',
			'subscription_id'  => (string) $subscription->get_id(),
			'value'            => (float) $subscription->get_total(),
			'currency'         => $subscription->get_currency(),
			'billing_period'   => $subscription->get_billing_period(),
			'billing_interval' => (int) $subscription->get_billing_interval(),
			'items'            => $this->get_subscription_items( $subscription ),
		);

		// Check if trial
		if ( $subscription->get_trial_end_date() ) {
			$event_data['has_trial'] = true;
			$event_data['trial_days'] = $this->calculate_trial_days( $subscription );
		}

		$this->push_event( $event_data );
	}

	/**
	 * Track subscription cancellation
	 *
	 * @param WC_Subscription $subscription Subscription object.
	 */
	public function track_subscription_cancel( $subscription ) {
		$event_data = array(
			'event'                => 'subscription_cancel',
			'subscription_id'      => (string) $subscription->get_id(),
			'value'                => (float) $subscription->get_total(),
			'currency'             => $subscription->get_currency(),
			'cancellation_reason'  => $this->get_cancellation_reason( $subscription ),
			'subscription_length'  => $this->calculate_subscription_length( $subscription ),
			'total_renewals'       => $subscription->get_payment_count() - 1,
		);

		$this->push_event( $event_data );
	}

	/**
	 * Track subscription expiration
	 *
	 * @param WC_Subscription $subscription Subscription object.
	 */
	public function track_subscription_expire( $subscription ) {
		$event_data = array(
			'event'               => 'subscription_expire',
			'subscription_id'     => (string) $subscription->get_id(),
			'value'               => (float) $subscription->get_total(),
			'currency'            => $subscription->get_currency(),
			'subscription_length' => $this->calculate_subscription_length( $subscription ),
			'total_renewals'      => $subscription->get_payment_count() - 1,
		);

		$this->push_event( $event_data );
	}

	/**
	 * Track pending cancellation
	 *
	 * @param WC_Subscription $subscription Subscription object.
	 */
	public function track_subscription_pending_cancel( $subscription ) {
		$event_data = array(
			'event'           => 'subscription_pending_cancel',
			'subscription_id' => (string) $subscription->get_id(),
			'value'           => (float) $subscription->get_total(),
			'currency'        => $subscription->get_currency(),
		);

		$this->push_event( $event_data );
	}

	/**
	 * Track renewal payment success
	 *
	 * @param WC_Subscription $subscription Subscription object.
	 * @param WC_Order        $order        Renewal order.
	 */
	public function track_renewal_success( $subscription, $order ) {
		$event_data = array(
			'event'           => 'subscription_renewal',
			'transaction_id'  => (string) $order->get_order_number(),
			'subscription_id' => (string) $subscription->get_id(),
			'value'           => (float) $order->get_total(),
			'tax'             => (float) $order->get_total_tax(),
			'shipping'        => (float) $order->get_shipping_total(),
			'currency'        => $order->get_currency(),
			'renewal_number'  => $subscription->get_payment_count(),
			'items'           => $this->get_order_items( $order ),
		);

		$this->push_event( $event_data );
	}

	/**
	 * Track renewal payment failure
	 *
	 * @param WC_Subscription $subscription Subscription object.
	 * @param WC_Order        $order        Renewal order.
	 */
	public function track_renewal_failed( $subscription, $order ) {
		$event_data = array(
			'event'           => 'subscription_renewal_failed',
			'subscription_id' => (string) $subscription->get_id(),
			'value'           => (float) $order->get_total(),
			'currency'        => $order->get_currency(),
			'renewal_number'  => $subscription->get_payment_count(),
		);

		$this->push_event( $event_data );
	}

	/**
	 * Track subscription reactivation
	 *
	 * @param WC_Subscription $subscription Subscription object.
	 */
	public function track_subscription_reactivate( $subscription ) {
		$event_data = array(
			'event'           => 'subscription_reactivate',
			'subscription_id' => (string) $subscription->get_id(),
			'value'           => (float) $subscription->get_total(),
			'currency'        => $subscription->get_currency(),
		);

		$this->push_event( $event_data );
	}

	/**
	 * Track trial end
	 *
	 * @param WC_Subscription $subscription Subscription object.
	 */
	public function track_trial_end( $subscription ) {
		$event_data = array(
			'event'           => 'subscription_trial_end',
			'subscription_id' => (string) $subscription->get_id(),
			'value'           => (float) $subscription->get_total(),
			'currency'        => $subscription->get_currency(),
			'trial_days'      => $this->calculate_trial_days( $subscription ),
			'converted'       => 'active' === $subscription->get_status(),
		);

		$this->push_event( $event_data );
	}

	/**
	 * Get subscription items formatted for GA4
	 *
	 * @param WC_Subscription $subscription Subscription object.
	 * @return array
	 */
	private function get_subscription_items( $subscription ) {
		$items = array();
		$index = 0;

		foreach ( $subscription->get_items() as $item ) {
			$product = $item->get_product();

			if ( ! $product ) {
				continue;
			}

			$item_data = array(
				'item_id'       => (string) $product->get_id(),
				'item_name'     => $item->get_name(),
				'item_category' => $this->get_product_category( $product ),
				'price'         => (float) $subscription->get_item_total( $item, false ),
				'quantity'      => $item->get_quantity(),
				'index'         => $index,
			);

			// Add subscription-specific data
			$item_data['subscription_item'] = true;

			$items[] = $item_data;
			$index++;
		}

		return $items;
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
				'item_id'   => (string) $product->get_id(),
				'item_name' => $item->get_name(),
				'price'     => (float) $order->get_item_total( $item, false ),
				'quantity'  => $item->get_quantity(),
				'index'     => $index,
			);

			$items[] = $item_data;
			$index++;
		}

		return $items;
	}

	/**
	 * Calculate trial days
	 *
	 * @param WC_Subscription $subscription Subscription object.
	 * @return int
	 */
	private function calculate_trial_days( $subscription ) {
		$trial_end = $subscription->get_trial_end_date();
		$start     = $subscription->get_date( 'start' );

		if ( ! $trial_end || ! $start ) {
			return 0;
		}

		$trial_end_timestamp = strtotime( $trial_end );
		$start_timestamp     = strtotime( $start );

		return (int) ( ( $trial_end_timestamp - $start_timestamp ) / DAY_IN_SECONDS );
	}

	/**
	 * Calculate subscription length in days
	 *
	 * @param WC_Subscription $subscription Subscription object.
	 * @return int
	 */
	private function calculate_subscription_length( $subscription ) {
		$start = $subscription->get_date( 'start' );
		$end   = $subscription->get_date( 'end' );

		if ( ! $end ) {
			$end = current_time( 'mysql' );
		}

		$start_timestamp = strtotime( $start );
		$end_timestamp   = strtotime( $end );

		return (int) ( ( $end_timestamp - $start_timestamp ) / DAY_IN_SECONDS );
	}

	/**
	 * Get cancellation reason
	 *
	 * @param WC_Subscription $subscription Subscription object.
	 * @return string
	 */
	private function get_cancellation_reason( $subscription ) {
		// Try to get reason from order notes
		$notes = wcs_get_objects_property( $subscription, 'customer_note' );

		if ( $notes ) {
			return $notes;
		}

		// Check for cancellation reason meta
		$reason = get_post_meta( $subscription->get_id(), '_cancellation_reason', true );

		return $reason ? $reason : 'No reason provided';
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
			return $categories[0]->name;
		}

		return '';
	}

	/**
	 * Push event to dataLayer
	 *
	 * @param array $event_data Event data.
	 */
	private function push_event( $event_data ) {
		// Store in session to output on next page load
		if ( ! WC()->session ) {
			return;
		}

		WC()->session->set( 'jyco_pending_subscription_event', $event_data );

		// Add action to output on next page load
		add_action( 'wp_footer', array( $this, 'output_pending_event' ) );
	}

	/**
	 * Output pending subscription event
	 */
	public function output_pending_event() {
		if ( ! WC()->session ) {
			return;
		}

		$event_data = WC()->session->get( 'jyco_pending_subscription_event' );

		if ( empty( $event_data ) ) {
			return;
		}

		// Clear from session
		WC()->session->set( 'jyco_pending_subscription_event', null );

		// Output event
		?>
		<script>
		window.dataLayer = window.dataLayer || [];
		window.dataLayer.push({ ecommerce: null });
		window.dataLayer.push(<?php echo wp_json_encode( $event_data, JSON_UNESCAPED_UNICODE ); ?>);
		</script>
		<?php
	}
}
