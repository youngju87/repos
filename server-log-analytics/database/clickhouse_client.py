"""
ClickHouse Client - Handles connection and data insertion
"""

import logging
from typing import List, Dict
from datetime import datetime

from clickhouse_driver import Client
from parsers.log_parser import ParsedLogEntry

logger = logging.getLogger(__name__)


class ClickHouseClient:
    """
    Client for interacting with ClickHouse database
    """

    def __init__(
        self,
        host: str = 'localhost',
        port: int = 9000,
        database: str = 'logs',
        user: str = 'default',
        password: str = ''
    ):
        self.client = Client(
            host=host,
            port=port,
            database=database,
            user=user,
            password=password
        )

        logger.info(f"Connected to ClickHouse: {host}:{port}/{database}")

    def insert_requests(self, entries: List[ParsedLogEntry]) -> int:
        """
        Insert parsed log entries into fact_requests table

        Args:
            entries: List of ParsedLogEntry objects

        Returns:
            Number of rows inserted
        """
        if not entries:
            return 0

        # Convert entries to row tuples
        rows = []
        for entry in entries:
            row = (
                entry.timestamp,
                entry.method,
                entry.path,
                entry.query_string,
                entry.http_version,
                entry.status_code,
                entry.response_bytes,
                entry.response_time_ms or 0,
                entry.ip_address,
                entry.user_agent,
                entry.referer,
                entry.session_id,
                0,  # is_bot (will be updated by bot detector)
                '',  # bot_type
                '',  # device_type
                '',  # browser
                '',  # os
                '',  # country_code
                '',  # city
                0,  # is_suspicious
                '',  # attack_type
                entry.log_format
            )
            rows.append(row)

        # Batch insert
        query = """
            INSERT INTO fact_requests (
                timestamp, method, path, query_string, http_version,
                status_code, response_bytes, response_time_ms,
                ip_address, user_agent, referer, session_id,
                is_bot, bot_type, device_type, browser, os,
                country_code, city, is_suspicious, attack_type, log_format
            ) VALUES
        """

        try:
            self.client.execute(query, rows)
            logger.info(f"Inserted {len(rows)} requests into ClickHouse")
            return len(rows)

        except Exception as e:
            logger.error(f"Error inserting into ClickHouse: {e}")
            raise

    def execute_query(self, query: str) -> List[tuple]:
        """
        Execute a SQL query

        Args:
            query: SQL query string

        Returns:
            List of result tuples
        """
        try:
            result = self.client.execute(query)
            return result
        except Exception as e:
            logger.error(f"Error executing query: {e}")
            raise

    def get_table_count(self, table: str) -> int:
        """Get row count for a table"""
        result = self.execute_query(f"SELECT count() FROM {table}")
        return result[0][0] if result else 0

    def get_date_range(self) -> tuple:
        """Get min/max dates in fact_requests"""
        query = "SELECT min(date), max(date) FROM fact_requests"
        result = self.execute_query(query)
        return result[0] if result else (None, None)

    def get_top_pages(self, days: int = 7, limit: int = 10) -> List[Dict]:
        """Get top pages by request count"""
        query = f"""
            SELECT
                path,
                count() as requests,
                avg(response_time_ms) as avg_latency,
                sum(response_bytes) as total_bytes
            FROM fact_requests
            WHERE date >= today() - {days}
            GROUP BY path
            ORDER BY requests DESC
            LIMIT {limit}
        """

        results = self.execute_query(query)

        return [
            {
                'path': row[0],
                'requests': row[1],
                'avg_latency': round(row[2], 2),
                'total_bytes': row[3]
            }
            for row in results
        ]

    def get_performance_metrics(self, path: str = None, days: int = 7) -> Dict:
        """Get performance metrics for endpoint(s)"""
        where_clause = f"AND path = '{path}'" if path else ""

        query = f"""
            SELECT
                count() as total_requests,
                quantile(0.50)(response_time_ms) as p50,
                quantile(0.95)(response_time_ms) as p95,
                quantile(0.99)(response_time_ms) as p99,
                max(response_time_ms) as max_latency,
                avg(response_time_ms) as avg_latency,
                countIf(status_code >= 500) as server_errors,
                countIf(status_code >= 400 AND status_code < 500) as client_errors
            FROM fact_requests
            WHERE date >= today() - {days}
            {where_clause}
        """

        result = self.execute_query(query)

        if not result:
            return {}

        row = result[0]
        return {
            'total_requests': row[0],
            'p50_latency': round(row[1], 2),
            'p95_latency': round(row[2], 2),
            'p99_latency': round(row[3], 2),
            'max_latency': row[4],
            'avg_latency': round(row[5], 2),
            'server_errors': row[6],
            'client_errors': row[7],
            'error_rate': round((row[6] + row[7]) / row[0] * 100, 2) if row[0] > 0 else 0
        }

    def get_bot_stats(self, days: int = 7) -> Dict:
        """Get bot traffic statistics"""
        query = f"""
            SELECT
                countIf(is_bot = 1) as bot_requests,
                countIf(is_bot = 0) as human_requests,
                count() as total_requests
            FROM fact_requests
            WHERE date >= today() - {days}
        """

        result = self.execute_query(query)

        if not result:
            return {}

        row = result[0]
        total = row[2]

        return {
            'bot_requests': row[0],
            'human_requests': row[1],
            'total_requests': total,
            'bot_percentage': round(row[0] / total * 100, 2) if total > 0 else 0
        }

    def get_security_events(self, days: int = 1, limit: int = 50) -> List[Dict]:
        """Get recent security events"""
        query = f"""
            SELECT
                timestamp,
                threat_type,
                severity,
                ip_address,
                path,
                pattern_matched,
                action
            FROM security_events
            WHERE timestamp >= now() - INTERVAL {days} DAY
            ORDER BY timestamp DESC
            LIMIT {limit}
        """

        results = self.execute_query(query)

        return [
            {
                'timestamp': row[0],
                'threat_type': row[1],
                'severity': row[2],
                'ip_address': row[3],
                'path': row[4],
                'pattern_matched': row[5],
                'action': row[6]
            }
            for row in results
        ]

    def insert_security_event(
        self,
        threat_type: str,
        severity: str,
        ip_address: str,
        method: str,
        path: str,
        query_string: str,
        pattern: str,
        confidence: float,
        action: str = 'logged'
    ):
        """Insert a security event"""
        query = """
            INSERT INTO security_events (
                timestamp, threat_type, severity, ip_address,
                method, path, query_string, pattern_matched,
                confidence_score, action
            ) VALUES
        """

        row = (
            datetime.utcnow(),
            threat_type,
            severity,
            ip_address,
            method,
            path,
            query_string,
            pattern,
            confidence,
            action
        )

        try:
            self.client.execute(query, [row])
        except Exception as e:
            logger.error(f"Error inserting security event: {e}")

    def close(self):
        """Close database connection"""
        self.client.disconnect()


if __name__ == "__main__":
    # Test the client
    import os
    from dotenv import load_dotenv

    load_dotenv()

    client = ClickHouseClient(
        host=os.getenv('CLICKHOUSE_HOST', 'localhost'),
        port=int(os.getenv('CLICKHOUSE_PORT', 9000)),
        database=os.getenv('CLICKHOUSE_DB', 'logs')
    )

    # Test queries
    print("Database Stats:")
    print(f"  Total requests: {client.get_table_count('fact_requests'):,}")

    date_range = client.get_date_range()
    print(f"  Date range: {date_range[0]} to {date_range[1]}")

    print("\nTop 5 Pages:")
    top_pages = client.get_top_pages(days=7, limit=5)
    for page in top_pages:
        print(f"  {page['path']}: {page['requests']:,} requests")

    print("\nBot Stats:")
    bot_stats = client.get_bot_stats(days=7)
    print(f"  Bot traffic: {bot_stats.get('bot_percentage', 0)}%")

    client.close()
