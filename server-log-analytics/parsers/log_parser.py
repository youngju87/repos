"""
Log Parser - Parses multiple log formats (Nginx, Apache, CloudFlare)
Extracts structured data from raw log lines
"""

import re
import logging
from typing import Dict, Optional, List
from datetime import datetime
from dataclasses import dataclass
from urllib.parse import urlparse, parse_qs
import hashlib

logger = logging.getLogger(__name__)


@dataclass
class ParsedLogEntry:
    """Structured log entry"""
    # Request info
    timestamp: datetime
    method: str
    path: str
    query_string: str
    http_version: str

    # Response
    status_code: int
    response_bytes: int
    response_time_ms: Optional[int] = None

    # Client
    ip_address: str
    user_agent: str
    referer: str = ""

    # Session
    session_id: str = ""

    # Metadata
    log_format: str = "nginx"
    raw_line: str = ""


class LogParser:
    """
    Parses various log formats into structured data
    """

    # Nginx combined log format regex
    NGINX_PATTERN = re.compile(
        r'(?P<ip>[\d\.]+) - (?P<remote_user>\S+) '
        r'\[(?P<time>[^\]]+)\] '
        r'"(?P<method>\S+) (?P<path>\S+) (?P<protocol>[^"]+)" '
        r'(?P<status>\d{3}) '
        r'(?P<size>\d+|-) '
        r'"(?P<referer>[^"]*)" '
        r'"(?P<user_agent>[^"]*)"'
        r'(?: "(?P<forwarded_for>[^"]*)")?'
        r'(?: (?P<response_time>[\d\.]+))?'
    )

    # Apache combined log format
    APACHE_PATTERN = re.compile(
        r'(?P<ip>[\d\.]+) '
        r'(?P<ident>\S+) '
        r'(?P<user>\S+) '
        r'\[(?P<time>[^\]]+)\] '
        r'"(?P<request>[^"]+)" '
        r'(?P<status>\d{3}) '
        r'(?P<size>\d+|-) '
        r'"(?P<referer>[^"]*)" '
        r'"(?P<user_agent>[^"]*)"'
    )

    def __init__(self):
        self.parsed_count = 0
        self.error_count = 0

    def parse_line(self, line: str, format_type: str = "nginx") -> Optional[ParsedLogEntry]:
        """
        Parse a single log line

        Args:
            line: Raw log line
            format_type: Format type (nginx, apache, cloudflare)

        Returns:
            ParsedLogEntry or None if parsing fails
        """
        return self.parse(line, format_type)

    def parse(self, line: str, log_format: str = "nginx") -> Optional[ParsedLogEntry]:
        """
        Parse a single log line

        Args:
            line: Raw log line
            log_format: Format type (nginx, apache, cloudflare)

        Returns:
            ParsedLogEntry or None if parsing fails
        """
        try:
            if log_format == "nginx":
                return self._parse_nginx(line)
            elif log_format == "apache":
                return self._parse_apache(line)
            elif log_format == "cloudflare":
                return self._parse_cloudflare(line)
            else:
                logger.error(f"Unknown log format: {log_format}")
                return None

        except Exception as e:
            self.error_count += 1
            logger.debug(f"Error parsing line: {e}")
            return None

    def _parse_nginx(self, line: str) -> Optional[ParsedLogEntry]:
        """Parse Nginx access log format"""
        match = self.NGINX_PATTERN.match(line)

        if not match:
            return None

        groups = match.groupdict()

        # Parse timestamp
        timestamp = self._parse_timestamp(groups['time'])

        # Parse request
        method, path, query_string, http_version = self._parse_request_line(
            f"{groups['method']} {groups['path']} {groups['protocol']}"
        )

        # Parse response size
        size_str = groups['size']
        response_bytes = int(size_str) if size_str != '-' else 0

        # Parse response time (if available)
        response_time_ms = None
        if groups.get('response_time'):
            try:
                response_time_ms = int(float(groups['response_time']) * 1000)
            except ValueError:
                pass

        # Generate session ID from IP + User Agent
        session_id = self._generate_session_id(
            groups['ip'],
            groups.get('user_agent', '')
        )

        entry = ParsedLogEntry(
            timestamp=timestamp,
            method=method,
            path=path,
            query_string=query_string,
            http_version=http_version,
            status_code=int(groups['status']),
            response_bytes=response_bytes,
            response_time_ms=response_time_ms,
            ip_address=groups['ip'],
            user_agent=groups.get('user_agent', ''),
            referer=groups.get('referer', ''),
            session_id=session_id,
            log_format='nginx',
            raw_line=line[:500]  # Limit stored raw line
        )

        self.parsed_count += 1
        return entry

    def _parse_apache(self, line: str) -> Optional[ParsedLogEntry]:
        """Parse Apache combined log format"""
        match = self.APACHE_PATTERN.match(line)

        if not match:
            return None

        groups = match.groupdict()

        # Parse timestamp
        timestamp = self._parse_timestamp(groups['time'])

        # Parse request line
        method, path, query_string, http_version = self._parse_request_line(
            groups['request']
        )

        # Parse response size
        size_str = groups['size']
        response_bytes = int(size_str) if size_str != '-' else 0

        # Generate session ID
        session_id = self._generate_session_id(
            groups['ip'],
            groups.get('user_agent', '')
        )

        entry = ParsedLogEntry(
            timestamp=timestamp,
            method=method,
            path=path,
            query_string=query_string,
            http_version=http_version,
            status_code=int(groups['status']),
            response_bytes=response_bytes,
            ip_address=groups['ip'],
            user_agent=groups.get('user_agent', ''),
            referer=groups.get('referer', ''),
            session_id=session_id,
            log_format='apache',
            raw_line=line[:500]
        )

        self.parsed_count += 1
        return entry

    def _parse_cloudflare(self, line: str) -> Optional[ParsedLogEntry]:
        """Parse CloudFlare JSON log format"""
        import json

        try:
            data = json.loads(line)

            # CloudFlare uses different field names
            timestamp = datetime.fromtimestamp(data['EdgeStartTimestamp'] / 1000)

            # Parse request
            method = data.get('ClientRequestMethod', 'GET')
            uri = data.get('ClientRequestURI', '/')
            path, query_string = self._split_uri(uri)

            entry = ParsedLogEntry(
                timestamp=timestamp,
                method=method,
                path=path,
                query_string=query_string,
                http_version=data.get('ClientRequestProtocol', 'HTTP/1.1'),
                status_code=int(data.get('EdgeResponseStatus', 200)),
                response_bytes=int(data.get('EdgeResponseBytes', 0)),
                ip_address=data.get('ClientIP', ''),
                user_agent=data.get('ClientRequestUserAgent', ''),
                referer=data.get('ClientRequestReferer', ''),
                session_id=self._generate_session_id(
                    data.get('ClientIP', ''),
                    data.get('ClientRequestUserAgent', '')
                ),
                log_format='cloudflare',
                raw_line=line[:500]
            )

            self.parsed_count += 1
            return entry

        except (json.JSONDecodeError, KeyError) as e:
            logger.debug(f"Error parsing CloudFlare log: {e}")
            return None

    def _parse_timestamp(self, time_str: str) -> datetime:
        """Parse various timestamp formats"""
        # Nginx/Apache format: 01/Jan/2024:12:00:00 +0000
        formats = [
            '%d/%b/%Y:%H:%M:%S %z',
            '%Y-%m-%d %H:%M:%S',
            '%Y-%m-%dT%H:%M:%S',
        ]

        for fmt in formats:
            try:
                return datetime.strptime(time_str, fmt)
            except ValueError:
                continue

        # Fallback to current time if parsing fails
        logger.warning(f"Could not parse timestamp: {time_str}")
        return datetime.utcnow()

    def _parse_request_line(self, request: str) -> tuple:
        """
        Parse HTTP request line

        Returns: (method, path, query_string, http_version)
        """
        parts = request.split()

        if len(parts) < 2:
            return ('GET', '/', '', 'HTTP/1.1')

        method = parts[0]
        uri = parts[1]
        http_version = parts[2] if len(parts) > 2 else 'HTTP/1.1'

        path, query_string = self._split_uri(uri)

        return (method, path, query_string, http_version)

    def _split_uri(self, uri: str) -> tuple:
        """Split URI into path and query string"""
        if '?' in uri:
            path, query = uri.split('?', 1)
            return (path, query)
        return (uri, '')

    def _generate_session_id(self, ip: str, user_agent: str) -> str:
        """
        Generate deterministic session ID from IP + User Agent

        This is simplified - production would use cookies or more sophisticated logic
        """
        if not ip or not user_agent:
            return ''

        # Hash IP + User Agent for privacy
        session_key = f"{ip}:{user_agent}".encode('utf-8')
        return hashlib.md5(session_key).hexdigest()[:16]

    def parse_batch(self, lines: List[str], log_format: str = "nginx") -> List[ParsedLogEntry]:
        """
        Parse multiple log lines

        Args:
            lines: List of raw log lines
            log_format: Format type

        Returns:
            List of ParsedLogEntry objects (successful parses only)
        """
        entries = []

        for line in lines:
            if not line.strip():
                continue

            entry = self.parse(line, log_format)
            if entry:
                entries.append(entry)

        logger.info(
            f"Parsed {len(entries)}/{len(lines)} lines successfully "
            f"({self.error_count} errors)"
        )

        return entries


if __name__ == "__main__":
    # Test the parser
    parser = LogParser()

    # Sample Nginx log
    nginx_log = '192.168.1.1 - - [01/Jan/2024:12:00:00 +0000] "GET /api/users?page=1 HTTP/1.1" 200 1234 "https://example.com" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" 0.123'

    entry = parser.parse(nginx_log, 'nginx')

    if entry:
        print(f"Parsed Nginx log:")
        print(f"  Timestamp: {entry.timestamp}")
        print(f"  Method: {entry.method}")
        print(f"  Path: {entry.path}")
        print(f"  Query: {entry.query_string}")
        print(f"  Status: {entry.status_code}")
        print(f"  Response Time: {entry.response_time_ms}ms")
        print(f"  IP: {entry.ip_address}")
        print(f"  Session ID: {entry.session_id}")

    # Sample Apache log
    apache_log = '192.168.1.1 - - [01/Jan/2024:12:00:00 +0000] "POST /api/login HTTP/1.1" 200 512 "https://example.com/login" "Mozilla/5.0"'

    entry = parser.parse(apache_log, 'apache')

    if entry:
        print(f"\nParsed Apache log:")
        print(f"  Method: {entry.method}")
        print(f"  Path: {entry.path}")
        print(f"  Status: {entry.status_code}")

    # Sample CloudFlare JSON log
    cloudflare_log = '''{"ClientIP":"192.168.1.1","ClientRequestMethod":"GET","ClientRequestURI":"/api/data","EdgeStartTimestamp":1704110400000,"EdgeResponseStatus":200,"EdgeResponseBytes":1234,"ClientRequestUserAgent":"Mozilla/5.0","ClientRequestReferer":"https://example.com","ClientRequestProtocol":"HTTP/2"}'''

    entry = parser.parse(cloudflare_log, 'cloudflare')

    if entry:
        print(f"\nParsed CloudFlare log:")
        print(f"  Method: {entry.method}")
        print(f"  Path: {entry.path}")
        print(f"  Status: {entry.status_code}")
        print(f"  IP: {entry.ip_address}")

    print(f"\nParser Stats:")
    print(f"  Successfully parsed: {parser.parsed_count}")
    print(f"  Errors: {parser.error_count}")
