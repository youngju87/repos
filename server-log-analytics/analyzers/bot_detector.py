"""
Bot Detector - Identifies bot traffic vs human traffic
Uses user-agent parsing and pattern matching
"""

import logging
import re
from typing import Dict, Optional

logger = logging.getLogger(__name__)

# Try to import user-agents library
try:
    from user_agents import parse as parse_user_agent
    USER_AGENTS_AVAILABLE = True
except ImportError:
    logger.warning("user-agents library not available. Bot detection will be basic.")
    USER_AGENTS_AVAILABLE = False


class BotDetector:
    """
    Detects and classifies bot traffic
    """

    # Known bot patterns in user agents
    BOT_PATTERNS = [
        # Search engine bots
        (r'googlebot', 'googlebot'),
        (r'bingbot', 'bingbot'),
        (r'yahoo! slurp', 'yahoo_bot'),
        (r'duckduckbot', 'duckduckbot'),
        (r'baiduspider', 'baiduspider'),
        (r'yandexbot', 'yandexbot'),

        # Social media bots
        (r'facebookexternalhit', 'facebook_bot'),
        (r'twitterbot', 'twitter_bot'),
        (r'linkedinbot', 'linkedin_bot'),
        (r'slackbot', 'slack_bot'),

        # Monitoring/tools
        (r'pingdom', 'pingdom'),
        (r'uptimerobot', 'uptimerobot'),
        (r'newrelic', 'newrelic'),
        (r'datadog', 'datadog'),

        # SEO tools
        (r'semrushbot', 'semrush'),
        (r'ahrefsbot', 'ahrefs'),
        (r'mj12bot', 'majestic'),
        (r'rogerbot', 'moz'),

        # Other common bots
        (r'bot', 'generic_bot'),
        (r'crawler', 'crawler'),
        (r'spider', 'spider'),
        (r'scraper', 'scraper'),
    ]

    # Compile patterns
    COMPILED_PATTERNS = [(re.compile(pattern, re.I), name) for pattern, name in BOT_PATTERNS]

    def __init__(self):
        self.bot_count = 0
        self.human_count = 0

    def detect(self, user_agent: str, ip_address: str = "") -> Dict:
        """
        Detect if traffic is from a bot

        Args:
            user_agent: User-Agent string
            ip_address: Client IP (for additional checks)

        Returns:
            Dict with is_bot, bot_type, device_type, browser, os
        """
        if not user_agent:
            return self._default_result(is_bot=True, bot_type='unknown')

        user_agent_lower = user_agent.lower()

        # Check against bot patterns
        for pattern, bot_name in self.COMPILED_PATTERNS:
            if pattern.search(user_agent_lower):
                self.bot_count += 1
                return {
                    'is_bot': True,
                    'bot_type': bot_name,
                    'device_type': 'bot',
                    'browser': bot_name,
                    'os': 'bot'
                }

        # Use user-agents library if available
        if USER_AGENTS_AVAILABLE:
            parsed = parse_user_agent(user_agent)

            is_bot = parsed.is_bot

            if is_bot:
                self.bot_count += 1
                return {
                    'is_bot': True,
                    'bot_type': 'detected_bot',
                    'device_type': 'bot',
                    'browser': str(parsed.browser.family),
                    'os': str(parsed.os.family)
                }

            # Human traffic
            self.human_count += 1
            return {
                'is_bot': False,
                'bot_type': '',
                'device_type': self._get_device_type(parsed),
                'browser': str(parsed.browser.family),
                'os': str(parsed.os.family)
            }

        # Fallback: basic human detection
        self.human_count += 1
        return {
            'is_bot': False,
            'bot_type': '',
            'device_type': self._detect_device_basic(user_agent),
            'browser': self._detect_browser_basic(user_agent),
            'os': self._detect_os_basic(user_agent)
        }

    def _default_result(self, is_bot: bool, bot_type: str = '') -> Dict:
        """Return default detection result"""
        return {
            'is_bot': is_bot,
            'bot_type': bot_type,
            'device_type': 'unknown',
            'browser': 'unknown',
            'os': 'unknown'
        }

    def _get_device_type(self, parsed_ua) -> str:
        """Get device type from parsed user agent"""
        if parsed_ua.is_mobile:
            return 'mobile'
        elif parsed_ua.is_tablet:
            return 'tablet'
        elif parsed_ua.is_pc:
            return 'desktop'
        else:
            return 'other'

    def _detect_device_basic(self, user_agent: str) -> str:
        """Basic device detection from user agent string"""
        ua_lower = user_agent.lower()

        if any(mobile in ua_lower for mobile in ['mobile', 'android', 'iphone', 'ipod']):
            return 'mobile'
        elif any(tablet in ua_lower for tablet in ['tablet', 'ipad']):
            return 'tablet'
        else:
            return 'desktop'

    def _detect_browser_basic(self, user_agent: str) -> str:
        """Basic browser detection"""
        ua_lower = user_agent.lower()

        if 'chrome' in ua_lower:
            return 'Chrome'
        elif 'firefox' in ua_lower:
            return 'Firefox'
        elif 'safari' in ua_lower:
            return 'Safari'
        elif 'edge' in ua_lower or 'edg' in ua_lower:
            return 'Edge'
        elif 'opera' in ua_lower or 'opr' in ua_lower:
            return 'Opera'
        else:
            return 'Other'

    def _detect_os_basic(self, user_agent: str) -> str:
        """Basic OS detection"""
        ua_lower = user_agent.lower()

        if 'windows' in ua_lower:
            return 'Windows'
        elif 'mac' in ua_lower or 'macintosh' in ua_lower:
            return 'macOS'
        elif 'linux' in ua_lower:
            return 'Linux'
        elif 'android' in ua_lower:
            return 'Android'
        elif 'ios' in ua_lower or 'iphone' in ua_lower or 'ipad' in ua_lower:
            return 'iOS'
        else:
            return 'Other'

    def get_stats(self) -> Dict:
        """Get detection statistics"""
        total = self.bot_count + self.human_count

        return {
            'bot_count': self.bot_count,
            'human_count': self.human_count,
            'total_processed': total,
            'bot_percentage': round(self.bot_count / total * 100, 2) if total > 0 else 0
        }


if __name__ == "__main__":
    # Test the detector
    detector = BotDetector()

    test_agents = [
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
        "facebookexternalhit/1.1",
        "curl/7.68.0"
    ]

    print("Bot Detection Tests:\n")

    for ua in test_agents:
        result = detector.detect(ua)
        print(f"User-Agent: {ua[:60]}...")
        print(f"  Is Bot: {result['is_bot']}")
        print(f"  Type: {result['bot_type'] or result['browser']}")
        print(f"  Device: {result['device_type']}")
        print()

    print("\nDetection Stats:")
    stats = detector.get_stats()
    print(f"  Total: {stats['total_processed']}")
    print(f"  Bots: {stats['bot_count']} ({stats['bot_percentage']}%)")
    print(f"  Humans: {stats['human_count']}")
