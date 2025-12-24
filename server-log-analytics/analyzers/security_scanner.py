"""
Security Scanner - Detects malicious activity in logs
Identifies SQL injection, XSS, path traversal, and other attacks
"""

import logging
import re
from typing import Dict, List, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class SecurityThreat:
    """Detected security threat"""
    threat_type: str
    severity: str  # low, medium, high, critical
    pattern_matched: str
    confidence: float  # 0.0 to 1.0
    description: str


class SecurityScanner:
    """
    Scans HTTP requests for security threats
    """

    # SQL Injection patterns
    SQL_INJECTION_PATTERNS = [
        (r"(\bUNION\b.*\bSELECT\b)", "SQL Injection - UNION SELECT", 0.9),
        (r"(\bDROP\b.*\bTABLE\b)", "SQL Injection - DROP TABLE", 0.95),
        (r"(\bDELETE\b.*\bFROM\b)", "SQL Injection - DELETE FROM", 0.85),
        (r"('.*OR.*'1'='1)", "SQL Injection - OR 1=1", 0.9),
        (r"(;.*\b(SELECT|INSERT|UPDATE|DELETE)\b)", "SQL Injection - Semicolon", 0.8),
        (r"(\bEXEC\b.*\bxp_)", "SQL Injection - EXEC xp_", 0.95),
    ]

    # XSS (Cross-Site Scripting) patterns
    XSS_PATTERNS = [
        (r"(<script[^>]*>)", "XSS - Script tag", 0.9),
        (r"(javascript:)", "XSS - JavaScript protocol", 0.85),
        (r"(on\w+\s*=)", "XSS - Event handler", 0.7),
        (r"(<iframe[^>]*>)", "XSS - IFrame", 0.8),
        (r"(<object[^>]*>)", "XSS - Object tag", 0.8),
    ]

    # Path Traversal patterns
    PATH_TRAVERSAL_PATTERNS = [
        (r"\.\./", "Path Traversal - ../ sequence", 0.85),
        (r"\.\.\\", "Path Traversal - ..\\ sequence", 0.85),
        (r"(/etc/passwd)", "Path Traversal - /etc/passwd", 0.95),
        (r"(/windows/system)", "Path Traversal - Windows system", 0.9),
    ]

    # Command Injection patterns
    COMMAND_INJECTION_PATTERNS = [
        (r"[;&|`]", "Command Injection - Shell metacharacters", 0.6),
        (r"\$\(.*\)", "Command Injection - Command substitution", 0.8),
        (r"(wget|curl).*http", "Command Injection - wget/curl", 0.85),
    ]

    # Other attack patterns
    OTHER_PATTERNS = [
        (r"(<\?php)", "PHP Code Injection", 0.9),
        (r"(eval\s*\()", "Code Injection - eval()", 0.85),
        (r"(\bbase64_decode\b)", "Suspicious - base64_decode", 0.6),
    ]

    def __init__(self):
        # Compile all patterns
        self.sql_patterns = [(re.compile(p, re.I), desc, conf) for p, desc, conf in self.SQL_INJECTION_PATTERNS]
        self.xss_patterns = [(re.compile(p, re.I), desc, conf) for p, desc, conf in self.XSS_PATTERNS]
        self.path_patterns = [(re.compile(p, re.I), desc, conf) for p, desc, conf in self.PATH_TRAVERSAL_PATTERNS]
        self.cmd_patterns = [(re.compile(p, re.I), desc, conf) for p, desc, conf in self.COMMAND_INJECTION_PATTERNS]
        self.other_patterns = [(re.compile(p, re.I), desc, conf) for p, desc, conf in self.OTHER_PATTERNS]

        self.threats_detected = 0

    def scan(self, path: str, query_string: str, method: str = "GET") -> List[SecurityThreat]:
        """
        Scan a request for security threats

        Args:
            path: Request path
            query_string: Query string
            method: HTTP method

        Returns:
            List of SecurityThreat objects
        """
        threats = []

        # Combine path and query string for scanning
        full_request = f"{path}?{query_string}"

        # Scan for SQL injection
        threats.extend(self._scan_patterns(
            full_request,
            self.sql_patterns,
            "sql_injection"
        ))

        # Scan for XSS
        threats.extend(self._scan_patterns(
            full_request,
            self.xss_patterns,
            "xss"
        ))

        # Scan for path traversal
        threats.extend(self._scan_patterns(
            path,
            self.path_patterns,
            "path_traversal"
        ))

        # Scan for command injection
        threats.extend(self._scan_patterns(
            query_string,
            self.cmd_patterns,
            "command_injection"
        ))

        # Scan for other threats
        threats.extend(self._scan_patterns(
            full_request,
            self.other_patterns,
            "code_injection"
        ))

        self.threats_detected += len(threats)

        return threats

    def _scan_patterns(
        self,
        text: str,
        patterns: List[tuple],
        threat_type: str
    ) -> List[SecurityThreat]:
        """Scan text against pattern list"""
        threats = []

        for pattern, description, confidence in patterns:
            if pattern.search(text):
                # Determine severity based on confidence
                if confidence >= 0.9:
                    severity = "critical"
                elif confidence >= 0.8:
                    severity = "high"
                elif confidence >= 0.7:
                    severity = "medium"
                else:
                    severity = "low"

                threat = SecurityThreat(
                    threat_type=threat_type,
                    severity=severity,
                    pattern_matched=pattern.pattern,
                    confidence=confidence,
                    description=description
                )

                threats.append(threat)

        return threats

    def check_rate_limit(
        self,
        ip_address: str,
        request_count: int,
        time_window_seconds: int,
        threshold: int
    ) -> Optional[SecurityThreat]:
        """
        Check if IP is exceeding rate limits

        Args:
            ip_address: Client IP
            request_count: Number of requests in time window
            time_window_seconds: Time window in seconds
            threshold: Max requests allowed

        Returns:
            SecurityThreat if rate limit exceeded, None otherwise
        """
        if request_count > threshold:
            excess = request_count - threshold

            # Determine severity
            if excess > threshold * 2:
                severity = "critical"
            elif excess > threshold:
                severity = "high"
            else:
                severity = "medium"

            return SecurityThreat(
                threat_type="rate_limit_exceeded",
                severity=severity,
                pattern_matched=f"{request_count} requests in {time_window_seconds}s",
                confidence=1.0,
                description=f"IP {ip_address} made {request_count} requests (limit: {threshold})"
            )

        return None

    def check_suspicious_ip(self, ip_address: str, known_bad_ips: set) -> Optional[SecurityThreat]:
        """Check if IP is in known bad IP list"""
        if ip_address in known_bad_ips:
            return SecurityThreat(
                threat_type="known_malicious_ip",
                severity="high",
                pattern_matched=ip_address,
                confidence=0.95,
                description=f"Request from known malicious IP: {ip_address}"
            )

        return None

    def get_stats(self) -> Dict:
        """Get scanner statistics"""
        return {
            'threats_detected': self.threats_detected
        }


if __name__ == "__main__":
    # Test the scanner
    scanner = SecurityScanner()

    test_requests = [
        {
            "path": "/users",
            "query": "id=1",
            "description": "Normal request"
        },
        {
            "path": "/search",
            "query": "q=' OR '1'='1",
            "description": "SQL Injection attempt"
        },
        {
            "path": "/comment",
            "query": "text=<script>alert('XSS')</script>",
            "description": "XSS attempt"
        },
        {
            "path": "/download",
            "query": "file=../../../../etc/passwd",
            "description": "Path traversal attempt"
        },
        {
            "path": "/api",
            "query": "cmd=$(whoami)",
            "description": "Command injection attempt"
        }
    ]

    print("Security Scan Tests:\n")

    for test in test_requests:
        print(f"{test['description']}:")
        print(f"  Path: {test['path']}")
        print(f"  Query: {test['query']}")

        threats = scanner.scan(test['path'], test['query'])

        if threats:
            print(f"  ⚠ THREATS DETECTED: {len(threats)}")
            for threat in threats:
                print(f"    - {threat.description} ({threat.severity}, {threat.confidence*100:.0f}% confidence)")
        else:
            print("  ✓ No threats detected")

        print()

    print(f"\nTotal threats detected: {scanner.get_stats()['threats_detected']}")
