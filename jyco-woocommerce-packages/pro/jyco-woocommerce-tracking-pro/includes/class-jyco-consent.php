<?php
/**
 * Consent Mode Class
 *
 * Handles Google Consent Mode v2 integration with popular consent management platforms.
 *
 * @package JYCO_Tracking_Pro
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * JYCO_Consent class
 */
class JYCO_Consent {

	/**
	 * Consent mode type
	 *
	 * @var string
	 */
	private $consent_mode;

	/**
	 * Initialize
	 */
	public function init() {
		$this->consent_mode = get_option( 'jyco_consent_mode', 'none' );

		// Only initialize if consent mode is enabled
		if ( 'none' === $this->consent_mode ) {
			return;
		}

		// Output consent mode defaults before GTM
		add_action( 'wp_head', array( $this, 'output_consent_mode_defaults' ), 0 );

		// Initialize specific consent platform integrations
		switch ( $this->consent_mode ) {
			case 'cookiebot':
				$this->init_cookiebot();
				break;
			case 'complianz':
				$this->init_complianz();
				break;
			case 'cookie_notice':
				$this->init_cookie_notice();
				break;
			case 'borlabs':
				$this->init_borlabs();
				break;
			case 'manual':
				$this->init_manual();
				break;
		}
	}

	/**
	 * Output consent mode defaults
	 *
	 * This must fire before GTM container loads.
	 */
	public function output_consent_mode_defaults() {
		?>
		<script>
		window.dataLayer = window.dataLayer || [];
		function gtag(){dataLayer.push(arguments);}

		// Set default consent state
		gtag('consent', 'default', {
			'analytics_storage': 'denied',
			'ad_storage': 'denied',
			'ad_user_data': 'denied',
			'ad_personalization': 'denied',
			'functionality_storage': 'denied',
			'personalization_storage': 'denied',
			'security_storage': 'granted',
			'wait_for_update': 500
		});
		</script>
		<?php
	}

	/**
	 * Initialize Cookiebot integration
	 */
	private function init_cookiebot() {
		if ( ! function_exists( 'cookiebot_active' ) || ! cookiebot_active() ) {
			return;
		}

		add_action( 'wp_head', array( $this, 'output_cookiebot_consent_mode' ), 1 );
	}

	/**
	 * Output Cookiebot consent mode integration
	 */
	public function output_cookiebot_consent_mode() {
		?>
		<script>
		window.addEventListener('CookiebotOnConsentReady', function() {
			gtag('consent', 'update', {
				'analytics_storage': Cookiebot.consent.statistics ? 'granted' : 'denied',
				'ad_storage': Cookiebot.consent.marketing ? 'granted' : 'denied',
				'ad_user_data': Cookiebot.consent.marketing ? 'granted' : 'denied',
				'ad_personalization': Cookiebot.consent.marketing ? 'granted' : 'denied',
				'functionality_storage': Cookiebot.consent.preferences ? 'granted' : 'denied',
				'personalization_storage': Cookiebot.consent.preferences ? 'granted' : 'denied'
			});
		});

		// Update consent when user changes preferences
		window.addEventListener('CookiebotOnAccept', function() {
			gtag('consent', 'update', {
				'analytics_storage': Cookiebot.consent.statistics ? 'granted' : 'denied',
				'ad_storage': Cookiebot.consent.marketing ? 'granted' : 'denied',
				'ad_user_data': Cookiebot.consent.marketing ? 'granted' : 'denied',
				'ad_personalization': Cookiebot.consent.marketing ? 'granted' : 'denied',
				'functionality_storage': Cookiebot.consent.preferences ? 'granted' : 'denied',
				'personalization_storage': Cookiebot.consent.preferences ? 'granted' : 'denied'
			});
		});

		window.addEventListener('CookiebotOnDecline', function() {
			gtag('consent', 'update', {
				'analytics_storage': 'denied',
				'ad_storage': 'denied',
				'ad_user_data': 'denied',
				'ad_personalization': 'denied',
				'functionality_storage': 'denied',
				'personalization_storage': 'denied'
			});
		});
		</script>
		<?php
	}

	/**
	 * Initialize Complianz integration
	 */
	private function init_complianz() {
		if ( ! function_exists( 'cmplz_get_cookiebanner' ) ) {
			return;
		}

		add_action( 'wp_head', array( $this, 'output_complianz_consent_mode' ), 1 );
	}

	/**
	 * Output Complianz consent mode integration
	 */
	public function output_complianz_consent_mode() {
		?>
		<script>
		document.addEventListener('cmplz_fire_categories', function(e) {
			var consentedCategories = e.detail.categories;

			gtag('consent', 'update', {
				'analytics_storage': consentedCategories.indexOf('statistics') > -1 ? 'granted' : 'denied',
				'ad_storage': consentedCategories.indexOf('marketing') > -1 ? 'granted' : 'denied',
				'ad_user_data': consentedCategories.indexOf('marketing') > -1 ? 'granted' : 'denied',
				'ad_personalization': consentedCategories.indexOf('marketing') > -1 ? 'granted' : 'denied',
				'functionality_storage': consentedCategories.indexOf('preferences') > -1 ? 'granted' : 'denied',
				'personalization_storage': consentedCategories.indexOf('preferences') > -1 ? 'granted' : 'denied'
			});
		});
		</script>
		<?php
	}

	/**
	 * Initialize Cookie Notice integration
	 */
	private function init_cookie_notice() {
		if ( ! class_exists( 'Cookie_Notice' ) ) {
			return;
		}

		add_action( 'wp_head', array( $this, 'output_cookie_notice_consent_mode' ), 1 );
	}

	/**
	 * Output Cookie Notice consent mode integration
	 */
	public function output_cookie_notice_consent_mode() {
		?>
		<script>
		document.addEventListener('cnAvailable', function() {
			if (typeof cnArgs !== 'undefined') {
				var analyticsConsent = cnArgs.onScriptAccepted.indexOf('analytics') > -1 ? 'granted' : 'denied';
				var marketingConsent = cnArgs.onScriptAccepted.indexOf('marketing') > -1 ? 'granted' : 'denied';

				gtag('consent', 'update', {
					'analytics_storage': analyticsConsent,
					'ad_storage': marketingConsent,
					'ad_user_data': marketingConsent,
					'ad_personalization': marketingConsent
				});
			}
		});

		document.addEventListener('cnConsentUpdate', function(e) {
			gtag('consent', 'update', {
				'analytics_storage': e.detail.categories.indexOf('analytics') > -1 ? 'granted' : 'denied',
				'ad_storage': e.detail.categories.indexOf('marketing') > -1 ? 'granted' : 'denied',
				'ad_user_data': e.detail.categories.indexOf('marketing') > -1 ? 'granted' : 'denied',
				'ad_personalization': e.detail.categories.indexOf('marketing') > -1 ? 'granted' : 'denied'
			});
		});
		</script>
		<?php
	}

	/**
	 * Initialize Borlabs Cookie integration
	 */
	private function init_borlabs() {
		if ( ! function_exists( 'BorlabsCookie' ) ) {
			return;
		}

		add_action( 'wp_head', array( $this, 'output_borlabs_consent_mode' ), 1 );
	}

	/**
	 * Output Borlabs Cookie consent mode integration
	 */
	public function output_borlabs_consent_mode() {
		?>
		<script>
		document.addEventListener('borlabs-cookie-consent-saved', function(e) {
			var consents = e.detail.consents || {};

			gtag('consent', 'update', {
				'analytics_storage': consents['statistics'] ? 'granted' : 'denied',
				'ad_storage': consents['marketing'] ? 'granted' : 'denied',
				'ad_user_data': consents['marketing'] ? 'granted' : 'denied',
				'ad_personalization': consents['marketing'] ? 'granted' : 'denied',
				'functionality_storage': consents['preferences'] ? 'granted' : 'denied',
				'personalization_storage': consents['preferences'] ? 'granted' : 'denied'
			});
		});
		</script>
		<?php
	}

	/**
	 * Initialize manual consent mode
	 *
	 * For custom implementations or other consent platforms.
	 */
	private function init_manual() {
		add_action( 'wp_head', array( $this, 'output_manual_consent_mode' ), 1 );
	}

	/**
	 * Output manual consent mode integration
	 *
	 * Provides a global function that can be called by custom consent code.
	 */
	public function output_manual_consent_mode() {
		?>
		<script>
		/**
		 * Update Google Consent Mode
		 *
		 * @param {Object} consents - Consent object with boolean values
		 * Example:
		 * window.jycoUpdateConsent({
		 *   analytics: true,
		 *   marketing: false,
		 *   preferences: true
		 * });
		 */
		window.jycoUpdateConsent = function(consents) {
			gtag('consent', 'update', {
				'analytics_storage': consents.analytics ? 'granted' : 'denied',
				'ad_storage': consents.marketing ? 'granted' : 'denied',
				'ad_user_data': consents.marketing ? 'granted' : 'denied',
				'ad_personalization': consents.marketing ? 'granted' : 'denied',
				'functionality_storage': consents.preferences ? 'granted' : 'denied',
				'personalization_storage': consents.preferences ? 'granted' : 'denied'
			});
		};
		</script>
		<?php
	}
}
