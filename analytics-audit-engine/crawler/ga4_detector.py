"""
GA4 Detection - Multi-method GA4 implementation detection
"""

import logging
from typing import Dict, List, Set
from playwright.async_api import Page

logger = logging.getLogger(__name__)


class GA4Detector:
    """
    Detects GA4 implementation using multiple methods:
    1. Direct gtag.js detection
    2. dataLayer analysis
    3. Network request monitoring (provided externally)
    """

    @staticmethod
    async def detect_direct_gtag(page: Page) -> Dict:
        """
        Detect GA4 via direct gtag.js implementation

        Args:
            page: Playwright Page object

        Returns:
            Dictionary with detection results
        """
        try:
            result = await page.evaluate("""
                () => {
                    if (window.gtag) {
                        const scripts = Array.from(document.scripts);
                        const gtagScripts = scripts.filter(s =>
                            s.src && s.src.includes('googletagmanager.com/gtag')
                        );

                        const ids = gtagScripts.map(s => {
                            const match = s.src.match(/id=([A-Z0-9-]+)/);
                            return match ? match[1] : null;
                        }).filter(Boolean);

                        return {
                            has_gtag: true,
                            measurement_ids: ids
                        };
                    }
                    return {
                        has_gtag: false,
                        measurement_ids: []
                    };
                }
            """)

            logger.debug(f"Direct gtag detection: {result['has_gtag']}")
            return result

        except Exception as e:
            logger.warning(f"Error detecting direct gtag: {e}")
            return {'has_gtag': False, 'measurement_ids': []}

    @staticmethod
    async def detect_datalayer_config(page: Page) -> List[str]:
        """
        Detect GA4 via dataLayer config commands

        Args:
            page: Playwright Page object

        Returns:
            List of GA4 measurement IDs found in dataLayer
        """
        try:
            measurement_ids = await page.evaluate("""
                () => {
                    if (!window.dataLayer) return [];

                    const ga4Configs = window.dataLayer.filter(item => {
                        return Array.isArray(item) &&
                               item[0] === 'config' &&
                               item[1] &&
                               typeof item[1] === 'string' &&
                               item[1].startsWith('G-');
                    });

                    return ga4Configs.map(item => item[1]);
                }
            """)

            logger.debug(f"dataLayer config detection: {len(measurement_ids)} IDs")
            return measurement_ids

        except Exception as e:
            logger.warning(f"Error detecting dataLayer config: {e}")
            return []

    @staticmethod
    def combine_results(
        gtag_result: Dict,
        datalayer_ids: List[str],
        network_ids: Set[str]
    ) -> Dict:
        """
        Combine results from all detection methods

        Args:
            gtag_result: Results from direct gtag detection
            datalayer_ids: Measurement IDs from dataLayer
            network_ids: Measurement IDs from network monitoring

        Returns:
            Combined detection results
        """
        all_ids = set()
        all_ids.update(gtag_result.get('measurement_ids', []))
        all_ids.update(datalayer_ids)
        all_ids.update(network_ids)

        # Filter to only G- IDs (valid GA4 measurement IDs)
        valid_ids = [id for id in all_ids if id.startswith('G-')]

        return {
            'has_ga4': len(valid_ids) > 0,
            'measurement_ids': sorted(valid_ids),  # Sort for consistency
            'detection_methods': {
                'gtag': gtag_result.get('has_gtag', False),
                'datalayer': len(datalayer_ids) > 0,
                'network': len(network_ids) > 0
            }
        }


class EventValidator:
    """Validates GA4 events in dataLayer"""

    # Standard GA4 ecommerce events
    ECOMMERCE_EVENTS = {
        'purchase',
        'add_to_cart',
        'remove_from_cart',
        'begin_checkout',
        'view_item',
        'view_item_list',
        'add_payment_info',
        'add_shipping_info'
    }

    @staticmethod
    async def validate_events(page: Page) -> Dict:
        """
        Validate GA4 events in dataLayer

        Args:
            page: Playwright Page object

        Returns:
            Dictionary with event validation results
        """
        try:
            result = await page.evaluate("""
                () => {
                    if (!window.dataLayer) {
                        return {
                            all_events: [],
                            has_page_view: false,
                            ecommerce_events: []
                        };
                    }

                    const events = new Set();
                    const ecommerceEvents = [];
                    let hasPageView = false;

                    const ecommerceEventTypes = [
                        'purchase', 'add_to_cart', 'remove_from_cart',
                        'begin_checkout', 'view_item', 'view_item_list',
                        'add_payment_info', 'add_shipping_info'
                    ];

                    window.dataLayer.forEach(item => {
                        if (item.event) {
                            events.add(item.event);

                            // Check for page_view
                            if (item.event === 'page_view' || item.event === 'gtm.js') {
                                hasPageView = true;
                            }

                            // Check for ecommerce events
                            if (ecommerceEventTypes.includes(item.event)) {
                                ecommerceEvents.push({
                                    event: item.event,
                                    has_ecommerce_object: !!item.ecommerce
                                });
                            }
                        }

                        // Also check for ecommerce object
                        if (item.ecommerce) {
                            if (item.ecommerce.purchase) {
                                ecommerceEvents.push({
                                    event: 'purchase',
                                    has_ecommerce_object: true
                                });
                            }
                            if (item.ecommerce.add) {
                                ecommerceEvents.push({
                                    event: 'add_to_cart',
                                    has_ecommerce_object: true
                                });
                            }
                        }
                    });

                    return {
                        all_events: Array.from(events),
                        has_page_view: hasPageView,
                        ecommerce_events: ecommerceEvents
                    };
                }
            """)

            logger.debug(f"Event validation: {len(result['all_events'])} events found")
            return result

        except Exception as e:
            logger.warning(f"Error validating events: {e}")
            return {
                'all_events': [],
                'has_page_view': False,
                'ecommerce_events': []
            }
