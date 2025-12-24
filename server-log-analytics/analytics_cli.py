"""
Analytics CLI - Command-line interface for server log analytics
"""

import click
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from datetime import datetime, timedelta
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.clickhouse_client import ClickHouseClient

console = Console()


@click.group()
def cli():
    """Server Log Analytics CLI - Query and analyze your server logs"""
    pass


@cli.command()
@click.option('--days', default=7, help='Number of days to analyze')
@click.option('--limit', default=20, help='Number of results')
def top_pages(days, limit):
    """Show top pages by traffic"""
    console.print(f"\n[bold cyan]Top {limit} Pages (Last {days} Days)[/bold cyan]\n")

    try:
        client = ClickHouseClient()
        results = client.get_top_pages(days=days, limit=limit)

        if not results:
            console.print("[yellow]No data found[/yellow]")
            return

        # Create table
        table = Table(show_header=True, header_style="bold magenta")
        table.add_column("Rank", style="dim", width=6)
        table.add_column("Path", style="cyan")
        table.add_column("Requests", justify="right", style="green")
        table.add_column("Avg Latency", justify="right")
        table.add_column("Error Rate", justify="right")

        for i, row in enumerate(results, 1):
            path = row['path']
            requests = f"{row['requests']:,}"
            latency = f"{row['avg_latency_ms']:.0f}ms"
            error_rate = f"{row['error_rate']:.2f}%"

            # Color code latency
            if row['avg_latency_ms'] > 1000:
                latency = f"[red]{latency}[/red]"
            elif row['avg_latency_ms'] > 500:
                latency = f"[yellow]{latency}[/yellow]"

            table.add_row(str(i), path, requests, latency, error_rate)

        console.print(table)

    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


@cli.command()
@click.option('--endpoint', required=True, help='Endpoint path to analyze')
@click.option('--days', default=7, help='Number of days to analyze')
def performance(endpoint, days):
    """Analyze performance metrics for an endpoint"""
    console.print(f"\n[bold cyan]Performance Analysis: {endpoint}[/bold cyan]\n")

    try:
        client = ClickHouseClient()
        metrics = client.get_performance_metrics(endpoint, days=days)

        if not metrics:
            console.print("[yellow]No data found for this endpoint[/yellow]")
            return

        # Create metrics panel
        info = f"""
[bold]Total Requests:[/bold] {metrics['total_requests']:,}
[bold]Date Range:[/bold] {metrics['start_date']} to {metrics['end_date']}

[bold cyan]Latency Percentiles:[/bold cyan]
  P50 (Median):  {metrics['p50_latency_ms']:.0f}ms
  P95:           {metrics['p95_latency_ms']:.0f}ms
  P99:           {metrics['p99_latency_ms']:.0f}ms
  Max:           {metrics['max_latency_ms']:.0f}ms

[bold cyan]Error Metrics:[/bold cyan]
  Success Rate:  {metrics['success_rate']:.2f}%
  Error Rate:    {metrics['error_rate']:.2f}%

[bold cyan]Response Times:[/bold cyan]
  Average:       {metrics['avg_latency_ms']:.0f}ms
  Median:        {metrics['p50_latency_ms']:.0f}ms
        """

        console.print(Panel(info.strip(), title="Endpoint Metrics", border_style="cyan"))

        # Status code breakdown
        if 'status_breakdown' in metrics:
            console.print("\n[bold]Status Code Breakdown:[/bold]")
            table = Table(show_header=True, header_style="bold")
            table.add_column("Status Code")
            table.add_column("Count", justify="right")
            table.add_column("Percentage", justify="right")

            for status, count in sorted(metrics['status_breakdown'].items()):
                pct = (count / metrics['total_requests']) * 100
                table.add_row(str(status), f"{count:,}", f"{pct:.1f}%")

            console.print(table)

    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


@cli.command()
@click.option('--days', default=30, help='Number of days to analyze')
def bot_stats(days):
    """Show bot traffic analysis"""
    console.print(f"\n[bold cyan]Bot Traffic Analysis (Last {days} Days)[/bold cyan]\n")

    try:
        client = ClickHouseClient()
        stats = client.get_bot_stats(days=days)

        if not stats:
            console.print("[yellow]No data found[/yellow]")
            return

        # Overall stats
        total = stats['total_requests']
        human = stats['human_requests']
        bot = stats['bot_requests']
        bot_pct = (bot / total) * 100 if total > 0 else 0

        summary = f"""
[bold]Total Requests:[/bold] {total:,}
[bold]Human Traffic:[/bold]  {human:,} ({100-bot_pct:.1f}%)
[bold]Bot Traffic:[/bold]    {bot:,} ({bot_pct:.1f}%)
        """

        console.print(Panel(summary.strip(), title="Traffic Summary", border_style="cyan"))

        # Bot type breakdown
        if 'bot_breakdown' in stats and stats['bot_breakdown']:
            console.print("\n[bold]Bot Type Breakdown:[/bold]")
            table = Table(show_header=True, header_style="bold")
            table.add_column("Bot Type", style="cyan")
            table.add_column("Requests", justify="right", style="green")
            table.add_column("% of Total", justify="right")
            table.add_column("% of Bot Traffic", justify="right")

            for bot_type, count in sorted(stats['bot_breakdown'].items(), key=lambda x: x[1], reverse=True):
                pct_total = (count / total) * 100
                pct_bot = (count / bot) * 100 if bot > 0 else 0

                table.add_row(
                    bot_type,
                    f"{count:,}",
                    f"{pct_total:.1f}%",
                    f"{pct_bot:.1f}%"
                )

            console.print(table)

    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


@cli.command()
@click.option('--days', default=1, help='Number of days to scan')
@click.option('--min-severity', default='medium', type=click.Choice(['low', 'medium', 'high', 'critical']))
def security_scan(days, min_severity):
    """Show security threats detected"""
    console.print(f"\n[bold red]Security Scan (Last {days} Days)[/bold red]\n")
    console.print(f"Minimum Severity: [bold]{min_severity.upper()}[/bold]\n")

    try:
        client = ClickHouseClient()

        # This would query the security_events table
        # For now, show a sample query structure
        query = f"""
        SELECT
            threat_type,
            severity,
            count() as threat_count,
            groupArray(distinct ip_address) as source_ips
        FROM security_events
        WHERE date >= today() - {days}
          AND severity IN ('medium', 'high', 'critical')
        GROUP BY threat_type, severity
        ORDER BY threat_count DESC
        """

        console.print("[yellow]Security scanning requires security_events table to be populated[/yellow]")
        console.print("[yellow]Run ingestion with security scanning enabled[/yellow]")

    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


@cli.command()
@click.option('--threshold', default=1000, help='Latency threshold in milliseconds')
@click.option('--days', default=7, help='Number of days to analyze')
@click.option('--limit', default=20, help='Number of results')
def slowest(threshold, days, limit):
    """Find slowest endpoints above threshold"""
    console.print(f"\n[bold cyan]Slowest Endpoints (P95 > {threshold}ms)[/bold cyan]\n")

    try:
        client = ClickHouseClient()

        query = f"""
        SELECT
            path,
            quantile(0.50)(response_time_ms) as p50,
            quantile(0.95)(response_time_ms) as p95,
            quantile(0.99)(response_time_ms) as p99,
            count() as requests
        FROM fact_requests
        WHERE date >= today() - {days}
          AND response_time_ms > 0
        GROUP BY path
        HAVING p95 > {threshold} AND requests > 100
        ORDER BY p95 DESC
        LIMIT {limit}
        """

        results = client.client.execute(query)

        if not results:
            console.print(f"[green]No endpoints with P95 > {threshold}ms found[/green]")
            return

        table = Table(show_header=True, header_style="bold red")
        table.add_column("Rank", style="dim", width=6)
        table.add_column("Endpoint", style="cyan")
        table.add_column("P50", justify="right")
        table.add_column("P95", justify="right", style="yellow")
        table.add_column("P99", justify="right", style="red")
        table.add_column("Requests", justify="right")

        for i, row in enumerate(results, 1):
            table.add_row(
                str(i),
                row[0],  # path
                f"{row[1]:.0f}ms",  # p50
                f"{row[2]:.0f}ms",  # p95
                f"{row[3]:.0f}ms",  # p99
                f"{row[4]:,}"  # requests
            )

        console.print(table)
        console.print(f"\n[yellow]💡 Recommendation: Optimize endpoints with P95 > 1000ms[/yellow]")

    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


@cli.command()
@click.option('--days', default=7, help='Number of days to analyze')
def traffic_summary(days):
    """Show overall traffic summary"""
    console.print(f"\n[bold cyan]Traffic Summary (Last {days} Days)[/bold cyan]\n")

    try:
        client = ClickHouseClient()

        # Overall metrics
        query = f"""
        SELECT
            count() as total_requests,
            count(distinct date) as days,
            count(distinct ip_address) as unique_ips,
            sum(response_bytes) as total_bytes,
            avg(response_time_ms) as avg_latency,
            quantile(0.95)(response_time_ms) as p95_latency,
            countIf(status_code >= 400) as errors,
            countIf(is_bot = 1) as bot_requests
        FROM fact_requests
        WHERE date >= today() - {days}
        """

        result = client.client.execute(query)

        if not result:
            console.print("[yellow]No data found[/yellow]")
            return

        row = result[0]
        total_requests = row[0]
        days_count = row[1]
        unique_ips = row[2]
        total_bytes = row[3]
        avg_latency = row[4]
        p95_latency = row[5]
        errors = row[6]
        bot_requests = row[7]

        # Calculate derived metrics
        requests_per_day = total_requests / days_count if days_count > 0 else 0
        error_rate = (errors / total_requests * 100) if total_requests > 0 else 0
        bot_percentage = (bot_requests / total_requests * 100) if total_requests > 0 else 0
        total_gb = total_bytes / (1024**3)

        summary = f"""
[bold cyan]Volume:[/bold cyan]
  Total Requests:      {total_requests:,}
  Requests/Day:        {requests_per_day:,.0f}
  Unique IPs:          {unique_ips:,}
  Data Transferred:    {total_gb:.2f} GB

[bold cyan]Performance:[/bold cyan]
  Avg Response Time:   {avg_latency:.0f}ms
  P95 Response Time:   {p95_latency:.0f}ms

[bold cyan]Quality:[/bold cyan]
  Error Rate:          {error_rate:.2f}%
  Total Errors:        {errors:,}

[bold cyan]Traffic:[/bold cyan]
  Bot Traffic:         {bot_percentage:.1f}%
  Human Traffic:       {100-bot_percentage:.1f}%
        """

        console.print(Panel(summary.strip(), title="Traffic Summary", border_style="cyan"))

    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


@cli.command()
@click.option('--limit', default=10, help='Number of IPs to show')
@click.option('--days', default=1, help='Number of days to analyze')
def top_ips(limit, days):
    """Show top IPs by request count"""
    console.print(f"\n[bold cyan]Top {limit} IPs (Last {days} Days)[/bold cyan]\n")

    try:
        client = ClickHouseClient()

        query = f"""
        SELECT
            ip_address,
            count() as requests,
            count(distinct path) as unique_pages,
            countIf(status_code >= 400) as errors,
            avg(response_time_ms) as avg_latency,
            any(is_bot) as is_bot
        FROM fact_requests
        WHERE date >= today() - {days}
        GROUP BY ip_address
        ORDER BY requests DESC
        LIMIT {limit}
        """

        results = client.client.execute(query)

        if not results:
            console.print("[yellow]No data found[/yellow]")
            return

        table = Table(show_header=True, header_style="bold")
        table.add_column("Rank", style="dim", width=6)
        table.add_column("IP Address", style="cyan")
        table.add_column("Requests", justify="right", style="green")
        table.add_column("Unique Pages", justify="right")
        table.add_column("Errors", justify="right")
        table.add_column("Avg Latency", justify="right")
        table.add_column("Type")

        for i, row in enumerate(results, 1):
            ip_type = "🤖 Bot" if row[5] else "👤 Human"

            table.add_row(
                str(i),
                row[0],  # ip
                f"{row[1]:,}",  # requests
                str(row[2]),  # unique pages
                str(row[3]),  # errors
                f"{row[4]:.0f}ms",  # avg latency
                ip_type
            )

        console.print(table)

    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


@cli.command()
def database_info():
    """Show database connection and table info"""
    console.print("\n[bold cyan]Database Information[/bold cyan]\n")

    try:
        client = ClickHouseClient()

        # Get table sizes
        query = """
        SELECT
            table,
            formatReadableSize(total_bytes) as size,
            formatReadableQuantity(total_rows) as rows
        FROM system.tables
        WHERE database = currentDatabase()
          AND name LIKE 'fact_%' OR name LIKE 'dim_%'
        ORDER BY total_bytes DESC
        """

        results = client.client.execute(query)

        if results:
            table = Table(show_header=True, header_style="bold")
            table.add_column("Table", style="cyan")
            table.add_column("Size", justify="right", style="green")
            table.add_column("Rows", justify="right")

            for row in results:
                table.add_row(row[0], row[1], row[2])

            console.print(table)
        else:
            console.print("[yellow]No tables found. Run init_db.py first[/yellow]")

        # Connection info
        info = f"""
[bold]Host:[/bold] {client.host}:{client.port}
[bold]Database:[/bold] {client.database}
[bold]Status:[/bold] [green]Connected ✓[/green]
        """
        console.print(f"\n{info}")

    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        console.print("[yellow]Make sure ClickHouse is running (docker-compose up -d)[/yellow]")


if __name__ == '__main__':
    cli()
