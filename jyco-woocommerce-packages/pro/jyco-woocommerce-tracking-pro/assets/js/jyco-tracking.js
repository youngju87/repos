/**
 * JY/co WooCommerce Tracking
 * Frontend event handlers
 *
 * @package JYCO_Tracking
 */

(function($) {
	'use strict';

	var JYCO = {
		/**
		 * Debug mode flag
		 */
		debug: false,

		/**
		 * Enabled events
		 */
		enabledEvents: [],

		/**
		 * Currency
		 */
		currency: 'USD',

		/**
		 * Cart items data
		 */
		cartItems: {},

		/**
		 * Initialize tracking
		 */
		init: function() {
			// Get params from localized script
			if (typeof jyco_params !== 'undefined') {
				this.debug = jyco_params.debug || false;
				this.enabledEvents = jyco_params.enabled_events || [];
				this.currency = jyco_params.currency || 'USD';
				this.cartItems = jyco_params.cart_items || {};
			}

			this.log('JY/co Tracking initialized', {
				debug: this.debug,
				enabledEvents: this.enabledEvents
			});

			// Bind events
			this.bindEvents();

			// Check for pending events (login/signup)
			this.checkPendingEvents();
		},

		/**
		 * Bind event listeners
		 */
		bindEvents: function() {
			// AJAX add to cart
			$(document.body).on('added_to_cart', this.onAddToCart.bind(this));

			// Remove from cart
			$(document.body).on('removed_from_cart', this.onRemoveFromCart.bind(this));

			// Product clicks (select_item)
			this.bindProductClicks();

			// Checkout events
			if ($('form.checkout').length) {
				$(document.body).on('updated_checkout', this.onCheckoutUpdate.bind(this));
			}

			// Search form submit
			$('form.search-form, form[role="search"]').on('submit', this.onSearch.bind(this));
		},

		/**
		 * Bind product click tracking
		 */
		bindProductClicks: function() {
			var self = this;

			// Standard WooCommerce product links
			$('.products .product a.woocommerce-loop-product__link, .products .product a.wc-block-grid__product-link').each(function(index) {
				var $link = $(this);
				var $product = $link.closest('.product');

				// Only bind once
				if ($link.data('jyco-bound')) {
					return;
				}
				$link.data('jyco-bound', true);

				$link.on('click', function(e) {
					// Get product data from DOM
					var productData = self.getProductDataFromDOM($product, index);

					if (productData) {
						var listName = self.getListName();

						self.pushEvent({
							event: 'select_item',
							ecommerce: {
								item_list_name: listName,
								items: [productData]
							}
						});
					}
				});
			});
		},

		/**
		 * Get product data from DOM
		 *
		 * @param {jQuery} $product Product element
		 * @param {number} index Product index
		 * @return {object|null}
		 */
		getProductDataFromDOM: function($product, index) {
			var $link = $product.find('a.woocommerce-loop-product__link, a.wc-block-grid__product-link').first();
			var $title = $product.find('.woocommerce-loop-product__title, .wc-block-grid__product-title');
			var $price = $product.find('.price .amount, .wc-block-grid__product-price .amount');

			// Get product ID from link or data attribute
			var productId = $product.data('product_id') || $product.data('id') || '';
			var productName = $title.text().trim() || '';
			var priceText = $price.first().text().replace(/[^0-9.,]/g, '');
			var price = parseFloat(priceText.replace(',', '.')) || 0;

			if (!productName) {
				return null;
			}

			return {
				item_id: String(productId),
				item_name: productName,
				price: price,
				index: index
			};
		},

		/**
		 * Get list name based on current page
		 *
		 * @return {string}
		 */
		getListName: function() {
			if ($('body').hasClass('post-type-archive-product')) {
				return 'Shop';
			} else if ($('body').hasClass('tax-product_cat')) {
				var categoryName = $('h1.page-title, h1.woocommerce-products-header__title').first().text().trim();
				return categoryName || 'Category';
			} else if ($('body').hasClass('tax-product_tag')) {
				return 'Tag';
			} else if ($('body').hasClass('search-results')) {
				return 'Search Results';
			}
			return 'Product List';
		},

		/**
		 * Handle AJAX add to cart
		 *
		 * @param {Event} e Event object
		 * @param {object} fragments Fragments data
		 * @param {string} cart_hash Cart hash
		 * @param {jQuery} $button Button element
		 */
		onAddToCart: function(e, fragments, cart_hash, $button) {
			if (!this.isEventEnabled('add_to_cart')) {
				return;
			}

			var self = this;
			var productId = $button.data('product_id') || '';
			var quantity = $button.data('quantity') || 1;

			if (!productId) {
				this.log('Add to cart: No product ID found');
				return;
			}

			// Get product data
			this.getProductData(productId, function(productData) {
				if (!productData) {
					return;
				}

				productData.quantity = quantity;

				var eventData = {
					event: 'add_to_cart',
					ecommerce: {
						currency: self.currency,
						value: productData.price * quantity,
						items: [productData]
					}
				};

				self.pushEvent(eventData);
			});
		},

		/**
		 * Handle remove from cart
		 *
		 * @param {Event} e Event object
		 * @param {object} fragments Fragments data
		 * @param {string} cart_hash Cart hash
		 */
		onRemoveFromCart: function(e, fragments, cart_hash) {
			if (!this.isEventEnabled('remove_from_cart')) {
				return;
			}

			// Cart update event - we'll track the specific item if we can identify it
			var eventData = {
				event: 'remove_from_cart',
				ecommerce: {
					currency: this.currency
				}
			};

			this.pushEvent(eventData);
		},

		/**
		 * Handle checkout update (shipping/payment selection)
		 *
		 * @param {Event} e Event object
		 */
		onCheckoutUpdate: function(e) {
			var self = this;

			// Check if shipping method was selected
			var $shippingMethod = $('input[name^="shipping_method"]:checked');
			if ($shippingMethod.length && this.isEventEnabled('add_shipping_info')) {
				if (!this.shippingTracked) {
					setTimeout(function() {
						self.trackShippingInfo($shippingMethod.val());
					}, 100);
					this.shippingTracked = true;
				}
			}

			// Check if payment method was selected
			var $paymentMethod = $('input[name="payment_method"]:checked');
			if ($paymentMethod.length && this.isEventEnabled('add_payment_info')) {
				if (!this.paymentTracked) {
					setTimeout(function() {
						self.trackPaymentInfo($paymentMethod.val());
					}, 100);
					this.paymentTracked = true;
				}
			}
		},

		/**
		 * Track shipping info selection
		 *
		 * @param {string} shippingMethod Shipping method ID
		 */
		trackShippingInfo: function(shippingMethod) {
			var eventData = {
				event: 'add_shipping_info',
				ecommerce: {
					currency: this.currency,
					shipping_tier: shippingMethod
				}
			};

			this.pushEvent(eventData);
		},

		/**
		 * Track payment info selection
		 *
		 * @param {string} paymentMethod Payment method ID
		 */
		trackPaymentInfo: function(paymentMethod) {
			var eventData = {
				event: 'add_payment_info',
				ecommerce: {
					currency: this.currency,
					payment_type: paymentMethod
				}
			};

			this.pushEvent(eventData);
		},

		/**
		 * Handle search form submit
		 *
		 * @param {Event} e Event object
		 */
		onSearch: function(e) {
			if (!this.isEventEnabled('search')) {
				return;
			}

			var $form = $(e.currentTarget);
			var searchTerm = $form.find('input[type="search"], input.search-field').val();

			if (searchTerm) {
				var eventData = {
					event: 'search',
					search_term: searchTerm
				};

				this.pushEvent(eventData);
			}
		},

		/**
		 * Get product data via AJAX
		 *
		 * @param {string|number} productId Product ID
		 * @param {function} callback Callback function
		 */
		getProductData: function(productId, callback) {
			if (typeof jyco_params === 'undefined') {
				callback(null);
				return;
			}

			$.ajax({
				url: jyco_params.ajax_url,
				type: 'POST',
				data: {
					action: 'jyco_get_product_data',
					product_id: productId,
					nonce: jyco_params.nonce
				},
				success: function(response) {
					if (response.success && response.data) {
						callback(response.data);
					} else {
						callback(null);
					}
				},
				error: function() {
					callback(null);
				}
			});
		},

		/**
		 * Check for pending events (stored in localStorage)
		 */
		checkPendingEvents: function() {
			// This would handle login/signup events if stored client-side
			// For now, these are handled server-side via transients
		},

		/**
		 * Push event to dataLayer
		 *
		 * @param {object} eventData Event data object
		 */
		pushEvent: function(eventData) {
			// Check if event is enabled
			if (!this.isEventEnabled(eventData.event)) {
				return;
			}

			window.dataLayer = window.dataLayer || [];

			// Clear previous ecommerce object
			window.dataLayer.push({ ecommerce: null });

			// Push event
			window.dataLayer.push(eventData);

			this.log(eventData.event, eventData);
		},

		/**
		 * Check if event is enabled
		 *
		 * @param {string} eventName Event name
		 * @return {boolean}
		 */
		isEventEnabled: function(eventName) {
			if (this.enabledEvents.length === 0) {
				return true; // If no events specified, track all
			}
			return this.enabledEvents.indexOf(eventName) !== -1;
		},

		/**
		 * Log to console if debug mode is enabled
		 *
		 * @param {string} message Log message
		 * @param {*} data Optional data to log
		 */
		log: function(message, data) {
			if (!this.debug) {
				return;
			}

			if (typeof data !== 'undefined') {
				console.log('[JY/co]', message, data);
			} else {
				console.log('[JY/co]', message);
			}
		}
	};

	// Initialize on document ready
	$(document).ready(function() {
		JYCO.init();
	});

	// Make JYCO available globally for debugging
	window.JYCO = JYCO;

})(jQuery);
