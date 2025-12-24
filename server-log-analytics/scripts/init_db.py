"""
Database Initialization Script
Creates ClickHouse tables and views for log analytics
"""

import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from clickhouse_driver import Client
from rich.console import Console

console = Console()


def create_database(client: Client, database: str = 'logs'):
    """Create database if it doesn't exist"""
    try:
        client.execute(f"CREATE DATABASE IF NOT EXISTS {database}")
        console.print(f"[green]✓[/green] Database '{database}' created/verified")
    except Exception as e:
        console.print(f"[red]✗[/red] Error creating database: {e}")
        raise


def create_tables(client: Client):
    """Create all required tables"""

    tables = {
        'fact_requests': """
        CREATE TABLE IF NOT EXISTS fact_requests (
            request_id UUID DEFAULT generateUUIDv4(),
            timestamp DateTime,
            date Date DEFAULT toDate(timestamp),

            -- Request
            method LowCardinality(String),
            path String,
            query_string String,
            http_version String,

            -- Response
            status_code UInt16,
            response_bytes UInt64,
            response_time_ms UInt32,

            -- Client
            ip_address IPv4,
            user_agent String,
            referer String,

            -- Session
            session_id FixedString(16),

            -- Bot detection
            is_bot UInt8 DEFAULT 0,
            bot_type LowCardinality(String) DEFAULT '',

            -- Enrichment (placeholders)
            country_code FixedString(2) DEFAULT '',
            device_type LowCardinality(String) DEFAULT '',
            browser LowCardinality(String) DEFAULT '',
            os LowCardinality(String) DEFAULT ''

        ) ENGINE = MergeTree()
        PARTITION BY toYYYYMM(date)
        ORDER BY (date, timestamp)
        TTL date + INTERVAL 90 DAY
        SETTINGS index_granularity = 8192
        """,

        'fact_sessions': """
        CREATE TABLE IF NOT EXISTS fact_sessions (
            session_id FixedString(16),
            start_time DateTime,
            end_time DateTime,
            date Date DEFAULT toDate(start_time),
            duration_seconds UInt32,

            page_views UInt16,
            unique_pages UInt16,

            total_bytes UInt64,
            avg_response_time_ms UInt32,

            entry_page String,
            exit_page String,

            is_bounce UInt8,
            converted UInt8,

            ip_address IPv4,
            user_agent String,
            is_bot UInt8

        ) ENGINE = MergeTree()
        PARTITION BY toYYYYMM(date)
        ORDER BY (date, start_time)
        TTL date + INTERVAL 90 DAY
        """,

        'security_events': """
        CREATE TABLE IF NOT EXISTS security_events (
            event_id UUID DEFAULT generateUUIDv4(),
            timestamp DateTime,
            date Date DEFAULT toDate(timestamp),

            threat_type LowCardinality(String),
            severity LowCardinality(String),

            ip_address IPv4,
            path String,
            description String,
            pattern_matched String,
            confidence Float32,

            -- Actions taken
            blocked UInt8 DEFAULT 0,
            notified UInt8 DEFAULT 0

        ) ENGINE = MergeTree()
        PARTITION BY toYYYYMM(date)
        ORDER BY (date, timestamp, severity)
        TTL date + INTERVAL 365 DAY
        """,

        'anomalies': """
        CREATE TABLE IF NOT EXISTS anomalies (
            anomaly_id UUID DEFAULT generateUUIDv4(),
            timestamp DateTime,
            date Date DEFAULT toDate(timestamp),

            anomaly_type LowCardinality(String),
            severity LowCardinality(String),

            metric_name String,
            expected_value Float64,
            actual_value Float64,
            deviation_score Float64,

            description String,
            context String,

            investigated UInt8 DEFAULT 0

        ) ENGINE = MergeTree()
        PARTITION BY toYYYYMM(date)
        ORDER BY (date, timestamp, severity)
        """,

        'dim_user_agents': """
        CREATE TABLE IF NOT EXISTS dim_user_agents (
            user_agent_hash UInt64,
            user_agent String,

            is_bot UInt8,
            bot_type String,

            browser String,
            browser_version String,
            os String,
            os_version String,
            device_type String,

            first_seen DateTime,
            last_seen DateTime

        ) ENGINE = ReplacingMergeTree(last_seen)
        ORDER BY user_agent_hash
        """
    }

    for table_name, create_sql in tables.items():
        try:
            client.execute(create_sql)
            console.print(f"[green]✓[/green] Table '{table_name}' created/verified")
        except Exception as e:
            console.print(f"[red]✗[/red] Error creating table '{table_name}': {e}")
            raise


def create_materialized_views(client: Client):
    """Create materialized views for common queries"""

    views = {
        'mv_hourly_traffic': """
        CREATE MATERIALIZED VIEW IF NOT EXISTS mv_hourly_traffic
        ENGINE = SummingMergeTree()
        PARTITION BY toYYYYMM(date)
        ORDER BY (date, hour, path)
        AS SELECT
            toDate(timestamp) as date,
            toStartOfHour(timestamp) as hour,
            path,
            count() as request_count,
            sum(response_bytes) as total_bytes,
            avg(response_time_ms) as avg_latency,
            quantile(0.95)(response_time_ms) as p95_latency,
            countIf(status_code >= 400) as error_count,
            countIf(is_bot = 1) as bot_count
        FROM fact_requests
        GROUP BY date, hour, path
        """,

        'mv_daily_summary': """
        CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_summary
        ENGINE = SummingMergeTree()
        ORDER BY date
        AS SELECT
            date,
            count() as total_requests,
            count(distinct ip_address) as unique_ips,
            sum(response_bytes) as total_bytes,
            avg(response_time_ms) as avg_latency,
            quantile(0.50)(response_time_ms) as p50_latency,
            quantile(0.95)(response_time_ms) as p95_latency,
            quantile(0.99)(response_time_ms) as p99_latency,
            countIf(status_code = 200) as success_count,
            countIf(status_code >= 400) as error_count,
            countIf(is_bot = 1) as bot_requests
        FROM fact_requests
        GROUP BY date
        """,

        'mv_top_pages_daily': """
        CREATE MATERIALIZED VIEW IF NOT EXISTS mv_top_pages_daily
        ENGINE = SummingMergeTree()
        ORDER BY (date, path)
        AS SELECT
            date,
            path,
            count() as requests,
            sum(response_bytes) as bytes,
            avg(response_time_ms) as avg_latency,
            countIf(status_code >= 400) as errors
        FROM fact_requests
        GROUP BY date, path
        """,

        'mv_bot_stats': """
        CREATE MATERIALIZED VIEW IF NOT EXISTS mv_bot_stats
        ENGINE = SummingMergeTree()
        ORDER BY (date, bot_type)
        AS SELECT
            date,
            bot_type,
            count() as request_count
        FROM fact_requests
        WHERE is_bot = 1
        GROUP BY date, bot_type
        """
    }

    for view_name, create_sql in views.items():
        try:
            client.execute(create_sql)
            console.print(f"[green]✓[/green] Materialized view '{view_name}' created/verified")
        except Exception as e:
            console.print(f"[red]✗[/red] Error creating view '{view_name}': {e}")
            # Views might fail if they already exist, continue anyway
            console.print(f"[yellow]  Continuing...[/yellow]")


def verify_setup(client: Client):
    """Verify database setup"""
    console.print("\n[bold cyan]Verifying setup...[/bold cyan]\n")

    # Check tables
    result = client.execute("""
        SELECT name
        FROM system.tables
        WHERE database = currentDatabase()
          AND name NOT LIKE '.%'
        ORDER BY name
    """)

    console.print("[bold]Tables created:[/bold]")
    for row in result:
        console.print(f"  • {row[0]}")

    # Check disk usage
    result = client.execute("""
        SELECT
            formatReadableSize(sum(bytes)) as total_size
        FROM system.parts
        WHERE database = currentDatabase()
          AND active
    """)

    if result:
        console.print(f"\n[bold]Disk usage:[/bold] {result[0][0]}")


def main():
    """Main initialization function"""
    console.print("\n[bold cyan]ClickHouse Database Initialization[/bold cyan]\n")

    # Connection details
    host = 'localhost'
    port = 9000
    database = 'logs'

    console.print(f"Connecting to ClickHouse at {host}:{port}...")

    try:
        # Connect to ClickHouse (without database first)
        client = Client(host=host, port=port)
        console.print("[green]✓[/green] Connected to ClickHouse\n")

        # Create database
        console.print("[bold]Step 1: Creating database[/bold]")
        create_database(client, database)

        # Reconnect with database
        client = Client(host=host, port=port, database=database)
        console.print()

        # Create tables
        console.print("[bold]Step 2: Creating tables[/bold]")
        create_tables(client)
        console.print()

        # Create materialized views
        console.print("[bold]Step 3: Creating materialized views[/bold]")
        create_materialized_views(client)

        # Verify
        verify_setup(client)

        console.print("\n[bold green]✓ Database initialization complete![/bold green]\n")
        console.print("[yellow]Next steps:[/yellow]")
        console.print("  1. Ingest logs: python ingest_logs.py --file sample_data/nginx_access.log")
        console.print("  2. Run queries: python analytics_cli.py traffic-summary")
        console.print("  3. Start dashboard: python dashboard/app.py\n")

    except Exception as e:
        console.print(f"\n[bold red]✗ Initialization failed![/bold red]")
        console.print(f"[red]Error: {e}[/red]\n")
        console.print("[yellow]Make sure ClickHouse is running:[/yellow]")
        console.print("  docker-compose up -d\n")
        sys.exit(1)


if __name__ == '__main__':
    main()
