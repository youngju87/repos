"""
Network Request Monitor - Captures and analyzes tag firing
"""

import re
import logging
from typing import Dict, List, Set, Optional
from datetime import datetime
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class NetworkRequest:
    """Represents a captured network request"""
    url: str
    method: str
    timestamp: str
    request_type: str  # 'ga4', 'facebook', 'gtm', etc.

    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        return {
            'url': self.url,
            'method': self.method,
            'timestamp': self.timestamp,
            'type': self.request_type
        }


class NetworkMonitor:
    """
    Monitors network requests to detect tag firing
    Extracts measurement IDs and validates tracking implementation
    """

    # Request patterns for different analytics platforms
    GA4_PATTERN = r'/g/collect'
    FACEBOOK_PATTERN = r'facebook\.com/tr'
    GTM_PATTERN = r'googletagmanager\.com/gtm\.js'

    # Measurement ID extraction pattern
    MEASUREMENT_ID_PATTERN = r'[?&]tid=([A-Z0-9-]+)'

    def __init__(self):
        """Initialize the network monitor"""
        self.ga4_requests: List[NetworkRequest] = []
        self.facebook_requests: List[NetworkRequest] = []
        self.gtm_requests: List[NetworkRequest] = []
        self.ga4_measurement_ids: Set[str] = set()

    def handle_request(self, request) -> None:
        """
        Handle a network request from Playwright

        Args:
            request: Playwright Request object
        """
        try:
            url = request.url
            method = request.method
            timestamp = datetime.utcnow().isoformat()

            # Check for GA4 requests
            if self.GA4_PATTERN in url:
                self._handle_ga4_request(url, method, timestamp)

            # Check for Facebook Pixel requests
            elif re.search(self.FACEBOOK_PATTERN, url):
                self._handle_facebook_request(url, method, timestamp)

            # Check for GTM requests
            elif self.GTM_PATTERN in url:
                self._handle_gtm_request(url, method, timestamp)

        except Exception as e:
            logger.warning(f"Error handling network request: {e}")

    def _handle_ga4_request(self, url: str, method: str, timestamp: str) -> None:
        """Handle GA4 network request"""
        # Extract measurement ID
        tid_match = re.search(self.MEASUREMENT_ID_PATTERN, url)
        if tid_match:
            measurement_id = tid_match.group(1)
            if measurement_id.startswith('G-'):
                self.ga4_measurement_ids.add(measurement_id)

        # Store request
        request = NetworkRequest(
            url=url,
            method=method,
            timestamp=timestamp,
            request_type='ga4'
        )
        self.ga4_requests.append(request)

        logger.debug(f"Captured GA4 request: {len(self.ga4_measurement_ids)} IDs found")

    def _handle_facebook_request(self, url: str, method: str, timestamp: str) -> None:
        """Handle Facebook Pixel network request"""
        request = NetworkRequest(
            url=url,
            method=method,
            timestamp=timestamp,
            request_type='facebook'
        )
        self.facebook_requests.append(request)

        logger.debug(f"Captured Facebook Pixel request")

    def _handle_gtm_request(self, url: str, method: str, timestamp: str) -> None:
        """Handle GTM network request"""
        request = NetworkRequest(
            url=url,
            method=method,
            timestamp=timestamp,
            request_type='gtm'
        )
        self.gtm_requests.append(request)

        logger.debug(f"Captured GTM request")

    def get_ga4_summary(self) -> Dict:
        """
        Get summary of GA4 network activity

        Returns:
            Dictionary with GA4 measurement IDs and request count
        """
        return {
            'measurement_ids': list(self.ga4_measurement_ids),
            'request_count': len(self.ga4_requests),
            'requests': [req.to_dict() for req in self.ga4_requests]
        }

    def get_facebook_summary(self) -> Dict:
        """
        Get summary of Facebook Pixel network activity

        Returns:
            Dictionary with request count and details
        """
        return {
            'request_count': len(self.facebook_requests),
            'requests': [req.to_dict() for req in self.facebook_requests]
        }

    def has_ga4_activity(self) -> bool:
        """Check if any GA4 requests were captured"""
        return len(self.ga4_requests) > 0

    def has_facebook_activity(self) -> bool:
        """Check if any Facebook Pixel requests were captured"""
        return len(self.facebook_requests) > 0

    def reset(self) -> None:
        """Reset all captured data"""
        self.ga4_requests.clear()
        self.facebook_requests.clear()
        self.gtm_requests.clear()
        self.ga4_measurement_ids.clear()
