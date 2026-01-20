"""
Ecommerce Tracking Validator - Validates ecommerce implementation
"""

import re
import logging
from typing import Dict, List, Optional
from enum import Enum
from playwright.async_api import Page

logger = logging.getLogger(__name__)


class PageType(Enum):
    """Ecommerce page types"""
    PRODUCT = 'product'
    CART = 'cart'
    CHECKOUT = 'checkout'
    STANDARD = 'standard'


class EcommerceValidator:
    """
    Validates ecommerce tracking implementation
    Detects page types and checks for appropriate tracking
    """

    # URL patterns for page type detection
    PRODUCT_PATTERNS = ['/product', '/item', '/p/', '/shop/']
    CART_PATTERNS = ['/cart', '/basket', '/bag']
    CHECKOUT_PATTERNS = ['/checkout', '/payment', '/billing']

    @staticmethod
    def detect_page_type(url: str) -> PageType:
        """
        Detect page type from URL

        Args:
            url: Page URL

        Returns:
            PageType enum value
        """
        url_lower = url.lower()

        # Check for checkout pages first (most specific)
        if any(pattern in url_lower for pattern in EcommerceValidator.CHECKOUT_PATTERNS):
            return PageType.CHECKOUT

        # Check for cart pages
        if any(pattern in url_lower for pattern in EcommerceValidator.CART_PATTERNS):
            return PageType.CART

        # Check for product pages
        if any(pattern in url_lower for pattern in EcommerceValidator.PRODUCT_PATTERNS):
            return PageType.PRODUCT

        return PageType.STANDARD

    @staticmethod
    async def detect_page_type_with_content(page: Page, url: str) -> PageType:
        """
        Detect page type using both URL and page content

        Args:
            page: Playwright Page object
            url: Page URL

        Returns:
            PageType enum value
        """
        # First try URL-based detection
        url_type = EcommerceValidator.detect_page_type(url)

        # If not detected from URL, check content
        if url_type == PageType.STANDARD:
            try:
                content_indicators = await page.evaluate(r"""
                    () => {
                        const bodyText = document.body.innerText.toLowerCase();
                        return {
                            has_price: /\$\d+|\£\d+|\€\d+/.test(bodyText),
                            has_add_to_cart: bodyText.includes('add to cart') ||
                                           bodyText.includes('add to bag'),
                            has_checkout: bodyText.includes('checkout') ||
                                        bodyText.includes('proceed to')
                        };
                    }
                """)

                # Determine type from content
                if content_indicators.get('has_add_to_cart'):
                    return PageType.PRODUCT
                elif content_indicators.get('has_checkout'):
                    return PageType.CHECKOUT

            except Exception as e:
                logger.warning(f"Error detecting page type from content: {e}")

        return url_type

    @staticmethod
    def validate_tracking(
        page_type: PageType,
        ecommerce_events: List[str]
    ) -> List[Dict]:
        """
        Validate ecommerce tracking for page type

        Args:
            page_type: Type of page
            ecommerce_events: List of ecommerce event names detected

        Returns:
            List of validation issues
        """
        issues = []

        # Skip validation for standard pages
        if page_type == PageType.STANDARD:
            return issues

        # No ecommerce events found on ecommerce page
        if not ecommerce_events:
            severity = 'critical' if page_type == PageType.CHECKOUT else 'warning'
            issues.append({
                'severity': severity,
                'category': 'ecommerce',
                'message': f'{page_type.value.title()} page detected but no ecommerce events found',
                'recommendation': f'Implement ecommerce tracking on {page_type.value} pages for revenue attribution'
            })
            return issues

        # Page-specific event validation
        if page_type == PageType.PRODUCT:
            if 'view_item' not in ecommerce_events:
                issues.append({
                    'severity': 'info',
                    'category': 'ecommerce',
                    'message': 'Product page missing view_item event',
                    'recommendation': 'Add view_item event to track product views for better attribution'
                })

        elif page_type == PageType.CHECKOUT:
            if 'begin_checkout' not in ecommerce_events:
                issues.append({
                    'severity': 'warning',
                    'category': 'ecommerce',
                    'message': 'Checkout page missing begin_checkout event',
                    'recommendation': 'Add begin_checkout event to track checkout funnel'
                })

            if 'purchase' not in ecommerce_events:
                issues.append({
                    'severity': 'critical',
                    'category': 'ecommerce',
                    'message': 'Checkout page missing purchase event',
                    'recommendation': 'Add purchase event to track completed transactions'
                })

        elif page_type == PageType.CART:
            if 'view_cart' not in ecommerce_events and 'begin_checkout' not in ecommerce_events:
                issues.append({
                    'severity': 'info',
                    'category': 'ecommerce',
                    'message': 'Cart page missing cart-related events',
                    'recommendation': 'Consider adding view_cart or begin_checkout events'
                })

        return issues
