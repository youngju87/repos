"""
Log Ingestion Pipeline - Main entry point for ingesting server logs
Ties together parser, bot detection, security scanning, and database insertion
"""

import click
import logging
import sys
import time
from pathlib import Path
from typing import List, Dict
from datetime import datetime
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from parsers.log_parser import LogParser, ParsedLogEntry
from analyzers.bot_detector import BotDetector
from analyzers.security_scanner import SecurityScanner, SecurityThreat
from database.clickhouse_client import ClickHouseClient

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

console = Console()


class LogIngestionPipeline:
    """
    Main ingestion pipeline that processes logs end-to-end
    """

    def __init__(
        self,
        log_format: str = 'nginx',
        batch_size: int = 10000,
        enable_bot_detection: bool = True,
        enable_security_scan: bool = True
    ):
        """
        Initialize ingestion pipeline

        Args:
            log_format: Log format (nginx, apache, cloudflare)
            batch_size: Number of logs to process in each batch
            enable_bot_detection: Whether to detect bots
            enable_security_scan: Whether to scan for security threats
        """
        self.log_format = log_format
        self.batch_size = batch_size
        self.enable_bot_detection = enable_bot_detection
        self.enable_security_scan = enable_security_scan

        # Initialize components
        self.parser = LogParser()
        self.bot_detector = BotDetector() if enable_bot_detection else None
        self.security_scanner = SecurityScanner() if enable_security_scan else None
        self.db_client = ClickHouseClient()

        # Statistics
        self.stats = {
            'total_lines': 0,
            'parsed_successfully': 0,
            'parse_errors': 0,
            'inserted_to_db': 0,
            'bots_detected': 0,
            'threats_detected': 0,
            'processing_time': 0
        }

    def ingest_file(self, file_path: str) -> Dict:
        """
        Ingest a log file

        Args:
            file_path: Path to log file

        Returns:
            Statistics dictionary
        """
        start_time = time.time()

        console.print(f"\n[bold cyan]Starting log ingestion[/bold cyan]")
        console.print(f"File: {file_path}")
        console.print(f"Format: {self.log_format}")
        console.print(f"Batch size: {self.batch_size:,}\n")

        # Read file
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
        except Exception as e:
            console.print(f"[red]Error reading file: {e}[/red]")
            return self.stats

        self.stats['total_lines'] = len(lines)
        console.print(f"Read {len(lines):,} lines from file\n")

        # Process in batches
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TaskProgressColumn(),
            console=console
        ) as progress:

            task = progress.add_task(
                "[cyan]Processing logs...",
                total=len(lines)
            )

            batch = []
            security_events = []

            for i, line in enumerate(lines):
                # Parse log line
                entry = self.parser.parse_line(line.strip(), format_type=self.log_format)

                if entry:
                    self.stats['parsed_successfully'] += 1

                    # Bot detection
                    if self.bot_detector:
                        bot_info = self.bot_detector.detect(
                            entry.user_agent,
                            entry.ip_address
                        )
                        # Add bot info to entry (would need to extend ParsedLogEntry)
                        # For now, just count
                        if bot_info['is_bot']:
                            self.stats['bots_detected'] += 1

                    # Security scanning
                    if self.security_scanner:
                        threats = self.security_scanner.scan(
                            entry.path,
                            entry.query_string,
                            entry.method
                        )
                        if threats:
                            self.stats['threats_detected'] += len(threats)
                            # Store threats for later insertion
                            for threat in threats:
                                security_events.append({
                                    'timestamp': entry.timestamp,
                                    'threat': threat,
                                    'ip': entry.ip_address,
                                    'path': entry.path
                                })

                    batch.append(entry)
                else:
                    self.stats['parse_errors'] += 1

                # Insert batch when full
                if len(batch) >= self.batch_size:
                    inserted = self._insert_batch(batch)
                    self.stats['inserted_to_db'] += inserted
                    batch = []

                progress.update(task, advance=1)

            # Insert remaining batch
            if batch:
                inserted = self._insert_batch(batch)
                self.stats['inserted_to_db'] += inserted

            # Insert security events if any
            if security_events:
                self._insert_security_events(security_events)

        # Calculate timing
        self.stats['processing_time'] = time.time() - start_time

        # Print summary
        self._print_summary()

        return self.stats

    def _insert_batch(self, batch: List[ParsedLogEntry]) -> int:
        """Insert a batch of log entries to database"""
        try:
            return self.db_client.insert_requests(batch)
        except Exception as e:
            logger.error(f"Error inserting batch: {e}")
            return 0

    def _insert_security_events(self, events: List[Dict]):
        """Insert security events to database"""
        try:
            # Prepare security event rows
            rows = []
            for event in events:
                threat = event['threat']
                row = (
                    event['timestamp'],
                    threat.threat_type,
                    threat.severity,
                    event['ip'],
                    event['path'],
                    threat.description,
                    threat.pattern_matched,
                    threat.confidence
                )
                rows.append(row)

            if rows:
                query = """
                INSERT INTO security_events
                (timestamp, threat_type, severity, ip_address, path,
                 description, pattern_matched, confidence)
                VALUES
                """
                self.db_client.client.execute(query, rows)
                logger.info(f"Inserted {len(rows)} security events")

        except Exception as e:
            logger.error(f"Error inserting security events: {e}")

    def _print_summary(self):
        """Print ingestion summary"""
        stats = self.stats

        console.print("\n" + "="*60)
        console.print("[bold green]Ingestion Complete[/bold green]")
        console.print("="*60 + "\n")

        # Parsing stats
        parse_rate = (stats['parsed_successfully'] / stats['total_lines'] * 100) if stats['total_lines'] > 0 else 0

        console.print("[bold cyan]Parsing:[/bold cyan]")
        console.print(f"  Total lines:        {stats['total_lines']:,}")
        console.print(f"  Parsed successfully: {stats['parsed_successfully']:,} ({parse_rate:.1f}%)")
        console.print(f"  Parse errors:       {stats['parse_errors']:,}")

        # Database stats
        console.print(f"\n[bold cyan]Database:[/bold cyan]")
        console.print(f"  Inserted to DB:     {stats['inserted_to_db']:,}")

        # Security stats
        if self.enable_bot_detection:
            bot_rate = (stats['bots_detected'] / stats['parsed_successfully'] * 100) if stats['parsed_successfully'] > 0 else 0
            console.print(f"\n[bold cyan]Bot Detection:[/bold cyan]")
            console.print(f"  Bots detected:      {stats['bots_detected']:,} ({bot_rate:.1f}%)")

        if self.enable_security_scan:
            console.print(f"\n[bold cyan]Security:[/bold cyan]")
            console.print(f"  Threats detected:   {stats['threats_detected']:,}")

            if stats['threats_detected'] > 0:
                console.print(f"\n  [yellow]⚠ WARNING: {stats['threats_detected']} security threats detected![/yellow]")
                console.print(f"  [yellow]Run: python analytics_cli.py security-scan[/yellow]")

        # Performance stats
        console.print(f"\n[bold cyan]Performance:[/bold cyan]")
        console.print(f"  Processing time:    {stats['processing_time']:.2f} seconds")

        if stats['processing_time'] > 0:
            lines_per_sec = stats['total_lines'] / stats['processing_time']
            console.print(f"  Throughput:         {lines_per_sec:,.0f} lines/second")

        console.print("\n" + "="*60 + "\n")


@click.command()
@click.option(
    '--file',
    required=True,
    type=click.Path(exists=True),
    help='Path to log file'
)
@click.option(
    '--format',
    'log_format',
    type=click.Choice(['nginx', 'apache', 'cloudflare'], case_sensitive=False),
    default='nginx',
    help='Log format type'
)
@click.option(
    '--batch-size',
    default=10000,
    help='Batch size for database inserts'
)
@click.option(
    '--no-bot-detection',
    is_flag=True,
    help='Disable bot detection'
)
@click.option(
    '--no-security-scan',
    is_flag=True,
    help='Disable security scanning'
)
@click.option(
    '--follow',
    is_flag=True,
    help='Follow log file for new entries (tail -f mode)'
)
def main(file, log_format, batch_size, no_bot_detection, no_security_scan, follow):
    """
    Ingest server logs into analytics warehouse

    Examples:

        # Ingest Nginx logs
        python ingest_logs.py --file /var/log/nginx/access.log --format nginx

        # Ingest Apache logs without bot detection
        python ingest_logs.py --file access.log --format apache --no-bot-detection

        # Ingest CloudFlare logs with smaller batches
        python ingest_logs.py --file cf_logs.json --format cloudflare --batch-size 5000

        # Follow log file for continuous ingestion
        python ingest_logs.py --file /var/log/nginx/access.log --follow
    """

    # Initialize pipeline
    pipeline = LogIngestionPipeline(
        log_format=log_format,
        batch_size=batch_size,
        enable_bot_detection=not no_bot_detection,
        enable_security_scan=not no_security_scan
    )

    # Check database connection
    try:
        # Test connection
        pipeline.db_client.client.execute("SELECT 1")
    except Exception as e:
        console.print(f"[red]Cannot connect to ClickHouse: {e}[/red]")
        console.print("[yellow]Make sure ClickHouse is running:[/yellow]")
        console.print("  docker-compose up -d")
        sys.exit(1)

    if follow:
        console.print("[yellow]Follow mode not yet implemented[/yellow]")
        console.print("[yellow]Use --file without --follow for now[/yellow]")
        sys.exit(1)
    else:
        # One-time ingestion
        pipeline.ingest_file(file)


if __name__ == '__main__':
    main()
