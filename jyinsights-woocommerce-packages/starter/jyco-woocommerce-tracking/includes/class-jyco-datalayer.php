<?php
/**
 * DataLayer Generation Class
 *
 * Handles the output of the dataLayer to the page head.
 *
 * @package JYCO_Tracking
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * JYCO_DataLayer class
 */
class JYCO_DataLayer {

	/**
	 * Initialize
	 */
	public function init() {
		add_action( 'wp_head', array( $this, 'output_datalayer' ), 1 );
	}

	/**
	 * Main dataLayer output function
	 */
	public function output_datalayer() {
		// Check if user should be tracked
		if ( ! $this->should_track_user() ) {
			return;
		}

		$data = array(
			'page_type' => $this->get_page_type(),
			'user'      => $this->get_user_data(),
		);

		// Add ecommerce data based on page type
		$ecommerce_data = $this->get_ecommerce_data();
		if ( ! empty( $ecommerce_data ) ) {
			$data['ecommerce'] = $ecommerce_data;
		}

		// Allow filtering
		$data = apply_filters( 'jyco_datalayer_data', $data );

		// Output dataLayer
		?>
		<script>
		window.dataLayer = window.dataLayer || [];
		window.dataLayer.push(<?php echo wp_json_encode( $data, JSON_UNESCAPED_UNICODE ); ?>);
		</script>
		<?php
	}

	/**
	 * Check if current user should be tracked
	 *
	 * @return bool
	 */
	private function should_track_user() {
		if ( ! is_user_logged_in() ) {
			return true;
		}

		$exclude_roles = get_option( 'jyco_exclude_roles', array() );
		if ( empty( $exclude_roles ) ) {
			return true;
		}

		$user = wp_get_current_user();
		foreach ( $exclude_roles as $role ) {
			if ( in_array( $role, (array) $user->roles, true ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Get current page type
	 *
	 * @return string
	 */
	private function get_page_type() {
		if ( is_front_page() ) {
			return 'home';
		} elseif ( is_shop() || is_product_category() || is_product_tag() ) {
			return 'collection';
		} elseif ( is_product() ) {
			return 'product';
		} elseif ( is_cart() ) {
			return 'cart';
		} elseif ( is_checkout() && ! is_order_received_page() ) {
			return 'checkout';
		} elseif ( is_order_received_page() ) {
			return 'purchase';
		} elseif ( is_search() ) {
			return 'search';
		} elseif ( is_account_page() ) {
			return 'account';
		} elseif ( is_page() ) {
			return 'page';
		} elseif ( is_single() ) {
			return 'post';
		} elseif ( is_archive() ) {
			return 'archive';
		}

		return 'other';
	}

	/**
	 * Get user data
	 *
	 * @return array
	 */
	private function get_user_data() {
		$user_data = array(
			'logged_in' => is_user_logged_in(),
		);

		if ( is_user_logged_in() ) {
			$user = wp_get_current_user();
			$user_data['user_id']     = (string) $user->ID;
			$user_data['user_email']  = hash( 'sha256', strtolower( trim( $user->user_email ) ) );
			$user_data['user_role']   = ! empty( $user->roles ) ? $user->roles[0] : '';
		}

		return apply_filters( 'jyco_user_data', $user_data );
	}

	/**
	 * Get ecommerce data based on page type
	 *
	 * @return array|null
	 */
	private function get_ecommerce_data() {
		$page_type = $this->get_page_type();

		switch ( $page_type ) {
			case 'product':
				return $this->get_product_page_data();
			case 'cart':
				return $this->get_cart_page_data();
			case 'checkout':
				return $this->get_checkout_page_data();
			case 'purchase':
				return $this->get_purchase_data();
			case 'collection':
				return $this->get_collection_page_data();
			case 'search':
				return $this->get_search_data();
			default:
				return null;
		}
	}

	/**
	 * Get product page data (view_item event)
	 *
	 * @return array
	 */
	private function get_product_page_data() {
		global $product;

		if ( ! $product || ! is_object( $product ) ) {
			$product = wc_get_product( get_the_ID() );
		}

		if ( ! $product ) {
			return null;
		}

		$items = array( $this->format_item( $product, 1, 0 ) );

		return array(
			'event'    => 'view_item',
			'currency' => get_woocommerce_currency(),
			'value'    => (float) $product->get_price(),
			'items'    => $items,
		);
	}

	/**
	 * Get cart page data (view_cart event)
	 *
	 * @return array|null
	 */
	private function get_cart_page_data() {
		if ( ! WC()->cart || WC()->cart->is_empty() ) {
			return null;
		}

		$items = $this->get_cart_items();

		return array(
			'event'    => 'view_cart',
			'currency' => get_woocommerce_currency(),
			'value'    => (float) WC()->cart->get_subtotal(),
			'items'    => $items,
		);
	}

	/**
	 * Get checkout page data (begin_checkout event)
	 *
	 * @return array|null
	 */
	private function get_checkout_page_data() {
		if ( ! WC()->cart || WC()->cart->is_empty() ) {
			return null;
		}

		$items = $this->get_cart_items();

		return array(
			'event'    => 'begin_checkout',
			'currency' => get_woocommerce_currency(),
			'value'    => (float) WC()->cart->get_subtotal(),
			'items'    => $items,
		);
	}

	/**
	 * Get purchase data (purchase event)
	 *
	 * @return array|null
	 */
	private function get_purchase_data() {
		global $wp;

		if ( empty( $wp->query_vars['order-received'] ) ) {
			return null;
		}

		$order_id = absint( $wp->query_vars['order-received'] );
		$order    = wc_get_order( $order_id );

		if ( ! $order ) {
			return null;
		}

		// Check if already tracked (prevent duplicate on refresh)
		if ( get_post_meta( $order_id, '_jyco_tracked', true ) ) {
			return null;
		}

		// Mark as tracked
		update_post_meta( $order_id, '_jyco_tracked', true );

		$items = array();
		$index = 0;

		foreach ( $order->get_items() as $item ) {
			$product = $item->get_product();
			if ( ! $product ) {
				continue;
			}

			$items[] = $this->format_item( $product, $item->get_quantity(), $index );
			$index++;
		}

		return array(
			'event'          => 'purchase',
			'transaction_id' => (string) $order->get_order_number(),
			'currency'       => $order->get_currency(),
			'value'          => (float) $order->get_total(),
			'tax'            => (float) $order->get_total_tax(),
			'shipping'       => (float) $order->get_shipping_total(),
			'items'          => $items,
		);
	}

	/**
	 * Get collection page data (view_item_list event)
	 *
	 * @return array|null
	 */
	private function get_collection_page_data() {
		global $wp_query;

		if ( ! have_posts() ) {
			return null;
		}

		$items     = array();
		$index     = 0;
		$list_name = $this->get_list_name();

		// Get products from loop
		if ( $wp_query->have_posts() ) {
			while ( $wp_query->have_posts() ) {
				$wp_query->the_post();
				$product = wc_get_product( get_the_ID() );

				if ( ! $product ) {
					continue;
				}

				$item              = $this->format_item( $product, 1, $index );
				$item['item_list_name'] = $list_name;
				$items[]           = $item;
				$index++;

				// Limit to first 20 products for performance
				if ( $index >= 20 ) {
					break;
				}
			}
			wp_reset_postdata();
		}

		if ( empty( $items ) ) {
			return null;
		}

		return array(
			'event'          => 'view_item_list',
			'item_list_name' => $list_name,
			'items'          => $items,
		);
	}

	/**
	 * Get search data
	 *
	 * @return array|null
	 */
	private function get_search_data() {
		$search_term = get_search_query();

		if ( empty( $search_term ) ) {
			return null;
		}

		return array(
			'event'       => 'search',
			'search_term' => $search_term,
		);
	}

	/**
	 * Get cart items formatted for GA4
	 *
	 * @return array
	 */
	private function get_cart_items() {
		$items = array();
		$index = 0;

		foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
			$product = $cart_item['data'];

			if ( ! $product ) {
				continue;
			}

			$items[] = $this->format_item( $product, $cart_item['quantity'], $index );
			$index++;
		}

		return $items;
	}

	/**
	 * Format a single item for GA4 items array
	 *
	 * @param WC_Product $product  Product object.
	 * @param int        $quantity Quantity.
	 * @param int        $index    Index in list.
	 * @return array
	 */
	private function format_item( $product, $quantity = 1, $index = 0 ) {
		$item = array(
			'item_id'       => (string) $product->get_id(),
			'item_name'     => $product->get_name(),
			'item_brand'    => $this->get_product_brand( $product ),
			'item_category' => $this->get_product_category( $product ),
			'price'         => (float) $product->get_price(),
			'quantity'      => $quantity,
			'index'         => $index,
		);

		// Add variant for variable products
		if ( $product->is_type( 'variation' ) ) {
			$item['item_variant'] = $this->get_variation_name( $product );
		}

		// Add SKU if available
		if ( $product->get_sku() ) {
			$item['item_sku'] = $product->get_sku();
		}

		return apply_filters( 'jyco_format_item', $item, $product, $quantity, $index );
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
			return implode( '/', array_slice( $categories_array, 0, 5 ) ); // Limit to 5 levels
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

		// Allow custom brand via filter
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

		$attributes = $product->get_attributes();
		$variant_parts = array();

		foreach ( $attributes as $key => $value ) {
			$variant_parts[] = ucfirst( $value );
		}

		return implode( ' / ', $variant_parts );
	}

	/**
	 * Get list name for collection pages
	 *
	 * @return string
	 */
	private function get_list_name() {
		if ( is_shop() ) {
			return 'Shop';
		} elseif ( is_product_category() ) {
			$category = get_queried_object();
			return $category->name;
		} elseif ( is_product_tag() ) {
			$tag = get_queried_object();
			return 'Tag: ' . $tag->name;
		} elseif ( is_search() ) {
			return 'Search Results';
		}

		return 'Product List';
	}
}
