"""
Sessionizer - Groups HTTP requests into user sessions
Analyzes user journeys, calculates session metrics, identifies patterns
"""

import logging
from typing import Dict, List, Optional, Set
from dataclasses import dataclass
from datetime import datetime, timedelta
from collections import defaultdict

logger = logging.getLogger(__name__)


@dataclass
class SessionMetrics:
    """Calculated session metrics"""
    session_id: str
    start_time: datetime
    end_time: datetime
    duration_seconds: int

    page_views: int
    unique_pages: int

    total_bytes: int
    avg_response_time_ms: float

    entry_page: str
    exit_page: str

    is_bounce: bool  # Single page view
    converted: bool  # Reached conversion goal

    ip_address: str
    user_agent: str
    is_bot: bool


@dataclass
class RequestEvent:
    """Individual request within a session"""
    timestamp: datetime
    path: str
    query_string: str
    status_code: int
    response_bytes: int
    response_time_ms: int


class Sessionizer:
    """
    Groups requests into sessions and calculates session metrics
    """

    # Default session timeout (30 minutes)
    DEFAULT_SESSION_TIMEOUT = timedelta(minutes=30)

    # Conversion goal paths (customize based on your application)
    CONVERSION_PATHS = [
        '/checkout/complete',
        '/purchase/success',
        '/signup/complete',
        '/order/confirmation'
    ]

    def __init__(self, session_timeout: timedelta = None):
        """
        Initialize sessionizer

        Args:
            session_timeout: Max time between requests in same session
        """
        self.session_timeout = session_timeout or self.DEFAULT_SESSION_TIMEOUT
        self.sessions_created = 0

    def sessionize(
        self,
        requests: List[Dict],
        group_by: str = "session_id"
    ) -> List[SessionMetrics]:
        """
        Group requests into sessions and calculate metrics

        Args:
            requests: List of request dicts with keys:
                     session_id, timestamp, path, query_string, status_code,
                     response_bytes, response_time_ms, ip_address, user_agent, is_bot
            group_by: Field to group by (session_id, ip_address, or combination)

        Returns:
            List of SessionMetrics objects
        """
        # Group requests by session identifier
        grouped = self._group_requests(requests, group_by)

        sessions = []

        for session_key, session_requests in grouped.items():
            # Skip empty sessions
            if not session_requests:
                continue

            # Sort by timestamp
            session_requests.sort(key=lambda r: r['timestamp'])

            # Calculate session metrics
            metrics = self._calculate_session_metrics(
                session_key,
                session_requests
            )

            if metrics:
                sessions.append(metrics)
                self.sessions_created += 1

        logger.info(f"Created {len(sessions)} sessions from {len(requests)} requests")

        return sessions

    def _group_requests(
        self,
        requests: List[Dict],
        group_by: str
    ) -> Dict[str, List[Dict]]:
        """Group requests by session identifier"""
        grouped = defaultdict(list)

        for request in requests:
            # Get session key
            if group_by == "session_id":
                key = request.get('session_id', '')
            elif group_by == "ip_address":
                key = request.get('ip_address', '')
            elif group_by == "ip_user_agent":
                # Combination of IP and user agent
                ip = request.get('ip_address', '')
                ua = request.get('user_agent', '')
                key = f"{ip}:{ua}"
            else:
                key = request.get('session_id', '')

            # Skip if no key
            if not key:
                continue

            grouped[key].append(request)

        return grouped

    def _calculate_session_metrics(
        self,
        session_id: str,
        requests: List[Dict]
    ) -> Optional[SessionMetrics]:
        """Calculate metrics for a session"""

        if not requests:
            return None

        # Extract timestamps
        timestamps = [r['timestamp'] for r in requests]
        start_time = min(timestamps)
        end_time = max(timestamps)

        # Calculate duration
        duration_seconds = int((end_time - start_time).total_seconds())

        # Page views
        page_views = len(requests)

        # Unique pages (distinct paths)
        unique_paths = set(r['path'] for r in requests)
        unique_pages = len(unique_paths)

        # Total bytes transferred
        total_bytes = sum(r.get('response_bytes', 0) for r in requests)

        # Average response time
        response_times = [r.get('response_time_ms', 0) for r in requests]
        avg_response_time_ms = sum(response_times) / len(response_times) if response_times else 0

        # Entry and exit pages
        entry_page = requests[0]['path']
        exit_page = requests[-1]['path']

        # Bounce (single page view)
        is_bounce = (page_views == 1)

        # Conversion (reached goal page)
        converted = any(
            r['path'] in self.CONVERSION_PATHS
            for r in requests
        )

        # User info (from first request)
        ip_address = requests[0].get('ip_address', '')
        user_agent = requests[0].get('user_agent', '')
        is_bot = requests[0].get('is_bot', 0) == 1

        return SessionMetrics(
            session_id=session_id,
            start_time=start_time,
            end_time=end_time,
            duration_seconds=duration_seconds,
            page_views=page_views,
            unique_pages=unique_pages,
            total_bytes=total_bytes,
            avg_response_time_ms=avg_response_time_ms,
            entry_page=entry_page,
            exit_page=exit_page,
            is_bounce=is_bounce,
            converted=converted,
            ip_address=ip_address,
            user_agent=user_agent,
            is_bot=is_bot
        )

    def analyze_user_journey(
        self,
        session_id: str,
        requests: List[Dict]
    ) -> Dict:
        """
        Analyze the complete user journey for a session

        Args:
            session_id: Session identifier
            requests: List of requests in the session

        Returns:
            Dictionary with journey analysis
        """
        if not requests:
            return {}

        # Sort by timestamp
        requests = sorted(requests, key=lambda r: r['timestamp'])

        # Extract path sequence
        path_sequence = [r['path'] for r in requests]

        # Time between pages
        time_on_page = []
        for i in range(len(requests) - 1):
            time_diff = (requests[i+1]['timestamp'] - requests[i]['timestamp']).total_seconds()
            time_on_page.append({
                'page': requests[i]['path'],
                'seconds': time_diff
            })

        # Errors encountered
        errors = [
            r for r in requests
            if r.get('status_code', 200) >= 400
        ]

        # Conversion funnel progress
        funnel_steps = self._analyze_funnel(path_sequence)

        return {
            'session_id': session_id,
            'path_sequence': path_sequence,
            'time_on_page': time_on_page,
            'total_pages': len(path_sequence),
            'unique_pages': len(set(path_sequence)),
            'errors': len(errors),
            'error_paths': [e['path'] for e in errors],
            'funnel_progress': funnel_steps,
            'converted': any(p in self.CONVERSION_PATHS for p in path_sequence)
        }

    def _analyze_funnel(self, path_sequence: List[str]) -> Dict:
        """
        Analyze progress through conversion funnel

        Example funnel: Landing → Product → Cart → Checkout → Complete
        """
        funnel_stages = {
            'landing': False,
            'product_view': False,
            'cart': False,
            'checkout': False,
            'complete': False
        }

        for path in path_sequence:
            # Landing page
            if path == '/' or path == '/home':
                funnel_stages['landing'] = True

            # Product page
            elif '/product/' in path or '/item/' in path:
                funnel_stages['product_view'] = True

            # Shopping cart
            elif '/cart' in path or '/basket' in path:
                funnel_stages['cart'] = True

            # Checkout
            elif '/checkout' in path:
                funnel_stages['checkout'] = True

            # Completion
            elif path in self.CONVERSION_PATHS:
                funnel_stages['complete'] = True

        # Calculate furthest stage reached
        stages_order = ['landing', 'product_view', 'cart', 'checkout', 'complete']
        furthest_stage = 'none'

        for stage in stages_order:
            if funnel_stages[stage]:
                furthest_stage = stage
            else:
                break

        return {
            'stages': funnel_stages,
            'furthest_stage': furthest_stage,
            'completion_rate': 1.0 if funnel_stages['complete'] else 0.0
        }

    def find_common_paths(
        self,
        sessions: List[SessionMetrics],
        min_frequency: int = 10
    ) -> List[Dict]:
        """
        Find most common user journey paths

        Args:
            sessions: List of session metrics
            min_frequency: Minimum number of occurrences

        Returns:
            List of common paths with frequencies
        """
        # This would require access to full request sequences
        # For now, analyze entry → exit patterns

        entry_exit_patterns = defaultdict(int)

        for session in sessions:
            pattern = f"{session.entry_page} → {session.exit_page}"
            entry_exit_patterns[pattern] += 1

        # Filter by minimum frequency
        common_paths = [
            {
                'path': pattern,
                'frequency': count,
                'is_conversion': any(goal in pattern for goal in self.CONVERSION_PATHS)
            }
            for pattern, count in entry_exit_patterns.items()
            if count >= min_frequency
        ]

        # Sort by frequency
        common_paths.sort(key=lambda x: x['frequency'], reverse=True)

        return common_paths

    def calculate_engagement_score(self, session: SessionMetrics) -> float:
        """
        Calculate engagement score (0.0 to 1.0)

        Based on:
        - Session duration
        - Page depth
        - Conversion
        """
        score = 0.0

        # Duration score (up to 0.3)
        # 5+ minutes = max score
        duration_score = min(session.duration_seconds / 300, 1.0) * 0.3
        score += duration_score

        # Page depth score (up to 0.4)
        # 10+ pages = max score
        depth_score = min(session.page_views / 10, 1.0) * 0.4
        score += depth_score

        # Conversion bonus (0.3)
        if session.converted:
            score += 0.3

        return round(score, 2)

    def get_stats(self) -> Dict:
        """Get sessionizer statistics"""
        return {
            'sessions_created': self.sessions_created,
            'session_timeout_minutes': self.session_timeout.total_seconds() / 60
        }


if __name__ == "__main__":
    # Test the sessionizer
    from datetime import datetime, timedelta

    sessionizer = Sessionizer()

    # Sample requests
    base_time = datetime.now()

    test_requests = [
        # Session 1: User browses and converts
        {
            'session_id': 'abc123',
            'timestamp': base_time,
            'path': '/',
            'query_string': '',
            'status_code': 200,
            'response_bytes': 5000,
            'response_time_ms': 120,
            'ip_address': '192.168.1.1',
            'user_agent': 'Mozilla/5.0...',
            'is_bot': 0
        },
        {
            'session_id': 'abc123',
            'timestamp': base_time + timedelta(seconds=30),
            'path': '/product/123',
            'query_string': '',
            'status_code': 200,
            'response_bytes': 8000,
            'response_time_ms': 150,
            'ip_address': '192.168.1.1',
            'user_agent': 'Mozilla/5.0...',
            'is_bot': 0
        },
        {
            'session_id': 'abc123',
            'timestamp': base_time + timedelta(seconds=90),
            'path': '/cart',
            'query_string': '',
            'status_code': 200,
            'response_bytes': 6000,
            'response_time_ms': 100,
            'ip_address': '192.168.1.1',
            'user_agent': 'Mozilla/5.0...',
            'is_bot': 0
        },
        {
            'session_id': 'abc123',
            'timestamp': base_time + timedelta(seconds=180),
            'path': '/checkout/complete',
            'query_string': '',
            'status_code': 200,
            'response_bytes': 3000,
            'response_time_ms': 200,
            'ip_address': '192.168.1.1',
            'user_agent': 'Mozilla/5.0...',
            'is_bot': 0
        },
        # Session 2: User bounces
        {
            'session_id': 'def456',
            'timestamp': base_time + timedelta(minutes=5),
            'path': '/',
            'query_string': '',
            'status_code': 200,
            'response_bytes': 5000,
            'response_time_ms': 80,
            'ip_address': '192.168.1.2',
            'user_agent': 'Mozilla/5.0...',
            'is_bot': 0
        }
    ]

    print("Sessionization Test:\n")

    # Create sessions
    sessions = sessionizer.sessionize(test_requests)

    print(f"Created {len(sessions)} sessions from {len(test_requests)} requests\n")

    for session in sessions:
        print(f"Session: {session.session_id}")
        print(f"  Duration: {session.duration_seconds} seconds")
        print(f"  Page Views: {session.page_views}")
        print(f"  Unique Pages: {session.unique_pages}")
        print(f"  Entry → Exit: {session.entry_page} → {session.exit_page}")
        print(f"  Bounce: {session.is_bounce}")
        print(f"  Converted: {session.converted}")
        print(f"  Avg Response Time: {session.avg_response_time_ms:.1f}ms")

        # Calculate engagement score
        engagement = sessionizer.calculate_engagement_score(session)
        print(f"  Engagement Score: {engagement}")

        print()

    # Analyze user journey for first session
    session1_requests = [r for r in test_requests if r['session_id'] == 'abc123']
    journey = sessionizer.analyze_user_journey('abc123', session1_requests)

    print("User Journey Analysis (Session abc123):")
    print(f"  Path Sequence: {' → '.join(journey['path_sequence'])}")
    print(f"  Total Pages: {journey['total_pages']}")
    print(f"  Converted: {journey['converted']}")
    print(f"  Funnel Progress: {journey['funnel_progress']['furthest_stage']}")
    print()

    print(f"Stats: {sessionizer.get_stats()}")
