#!/usr/bin/env python3
"""
Analytics Audit Engine - Command Line Interface
Main entry point for running analytics audits
"""

import asyncio
import os
import sys
import logging
from pathlib import Path

import click
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.table import Table
from dotenv import load_dotenv

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from crawler.page_crawler import AnalyticsCrawler
from analyzer.audit_analyzer import AuditAnalyzer
from reports.report_generator import ReportGenerator

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

console = Console()


@click.group()
def cli():
    """Analytics Audit Engine - Professional website analytics auditing"""
    pass


@cli.command()
@click.option('--url', required=True, help='Website URL to audit')
@click.option('--max-pages', default=50, help='Maximum pages to crawl')
@click.option('--output', default='./reports', help='Output directory for reports')
@click.option('--format', type=click.Choice(['html', 'pdf', 'both']), default='html', help='Report format')
@click.option('--db-url', default=None, help='Database URL (defaults to env var)')
def scan(url, max_pages, output, format, db_url):
    """Scan a website and generate audit report"""

    console.print(f"\n[bold blue]Analytics Audit Engine[/bold blue]", justify="center")
    console.print(f"[cyan]Auditing: {url}[/cyan]\n")

    # Get database URL
    if db_url is None:
        # Check for DATABASE_URL first (SQLite or custom)
        db_url = os.getenv('DATABASE_URL')

        # Fall back to PostgreSQL config if DATABASE_URL not set
        if db_url is None:
            db_user = os.getenv('DB_USER', 'audituser')
            db_pass = os.getenv('DB_PASSWORD', 'auditpass123')
            db_host = os.getenv('DB_HOST', 'localhost')
            db_port = os.getenv('DB_PORT', '5432')
            db_name = os.getenv('DB_NAME', 'analytics_audit')
            db_url = f"postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"

    try:
        # Step 1: Crawl website
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            crawl_task = progress.add_task(f"Crawling {url} (max {max_pages} pages)...", total=None)

            crawler = AnalyticsCrawler(url, max_pages=max_pages)
            crawled_pages = asyncio.run(crawler.crawl())

            progress.update(crawl_task, completed=True)

        console.print(f"[green]✓[/green] Crawled {len(crawled_pages)} pages\n")

        # Step 2: Analyze results
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            analyze_task = progress.add_task("Analyzing audit results...", total=None)

            analyzer = AuditAnalyzer(db_url)
            audit = analyzer.create_audit(url, crawled_pages, max_pages_config=max_pages)
            audit_summary = analyzer.get_audit_summary(str(audit.audit_id))

            progress.update(analyze_task, completed=True)

        console.print(f"[green]✓[/green] Analysis complete\n")

        # Step 3: Display results
        _display_results(audit_summary)

        # Step 4: Generate reports
        output_dir = Path(output)
        output_dir.mkdir(parents=True, exist_ok=True)

        generator = ReportGenerator()

        timestamp = audit.started_at.strftime("%Y%m%d_%H%M%S")
        domain = url.replace('https://', '').replace('http://', '').replace('/', '_')

        if format in ['html', 'both']:
            html_path = output_dir / f"audit_{domain}_{timestamp}.html"
            generator.generate_html_report(audit_summary, str(html_path))
            console.print(f"[green]✓[/green] HTML report: {html_path}")

        if format in ['pdf', 'both']:
            pdf_path = output_dir / f"audit_{domain}_{timestamp}.pdf"
            try:
                generator.generate_pdf_report(audit_summary, str(pdf_path))
                console.print(f"[green]✓[/green] PDF report: {pdf_path}")
            except ImportError:
                console.print("[yellow]⚠[/yellow] PDF generation requires WeasyPrint: pip install weasyprint")

        console.print(f"\n[bold green]Audit Complete![/bold green]")
        console.print(f"Audit ID: {audit_summary['audit_id']}\n")

    except Exception as e:
        console.print(f"[bold red]Error:[/bold red] {str(e)}")
        logger.exception("Audit failed")
        sys.exit(1)


@cli.command()
@click.option('--audit-id', required=True, help='Audit ID to view')
@click.option('--db-url', default=None, help='Database URL')
def view(audit_id, db_url):
    """View results of a previous audit"""

    if db_url is None:
        db_user = os.getenv('DB_USER', 'audituser')
        db_pass = os.getenv('DB_PASSWORD', 'auditpass123')
        db_host = os.getenv('DB_HOST', 'localhost')
        db_port = os.getenv('DB_PORT', '5432')
        db_name = os.getenv('DB_NAME', 'analytics_audit')
        db_url = f"postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"

    try:
        analyzer = AuditAnalyzer(db_url)
        audit_summary = analyzer.get_audit_summary(audit_id)
        _display_results(audit_summary)

    except Exception as e:
        console.print(f"[bold red]Error:[/bold red] {str(e)}")
        sys.exit(1)


def _display_results(audit_summary):
    """Display audit results in terminal"""

    # Overall scores table
    scores_table = Table(title="Audit Scores", show_header=True, header_style="bold magenta")
    scores_table.add_column("Metric", style="cyan")
    scores_table.add_column("Score", justify="right")

    def score_color(score):
        if score >= 80:
            return "green"
        elif score >= 60:
            return "yellow"
        else:
            return "red"

    overall = audit_summary['overall_score']
    scores_table.add_row(
        "Overall Score",
        f"[{score_color(overall)}]{overall:.0f}/100[/{score_color(overall)}]"
    )

    impl = audit_summary['implementation_score']
    scores_table.add_row(
        "Implementation",
        f"[{score_color(impl)}]{impl:.0f}/100[/{score_color(impl)}]"
    )

    comp = audit_summary['compliance_score']
    scores_table.add_row(
        "Compliance",
        f"[{score_color(comp)}]{comp:.0f}/100[/{score_color(comp)}]"
    )

    perf = audit_summary['performance_score']
    scores_table.add_row(
        "Performance",
        f"[{score_color(perf)}]{perf:.0f}/100[/{score_color(perf)}]"
    )

    console.print(scores_table)
    console.print()

    # Issues summary
    issues_table = Table(title="Issues Found", show_header=True, header_style="bold magenta")
    issues_table.add_column("Severity", style="cyan")
    issues_table.add_column("Count", justify="right")

    issues_table.add_row("Critical", f"[red]{audit_summary['critical_issues']}[/red]")
    issues_table.add_row("Warning", f"[yellow]{audit_summary['warning_issues']}[/yellow]")
    issues_table.add_row("Info", f"[blue]{audit_summary['info_issues']}[/blue]")

    console.print(issues_table)
    console.print()

    # Tag coverage
    coverage_table = Table(title="Tag Coverage", show_header=True, header_style="bold magenta")
    coverage_table.add_column("Tag Type", style="cyan")
    coverage_table.add_column("Coverage", justify="right")

    ga4_cov = audit_summary['tag_coverage']['ga4']
    coverage_table.add_row(
        "Google Analytics 4",
        f"[{score_color(ga4_cov)}]{ga4_cov:.0f}%[/{score_color(ga4_cov)}]"
    )

    gtm_cov = audit_summary['tag_coverage']['gtm']
    coverage_table.add_row(
        "Google Tag Manager",
        f"[{score_color(gtm_cov)}]{gtm_cov:.0f}%[/{score_color(gtm_cov)}]"
    )

    consent_cov = audit_summary['tag_coverage']['consent']
    coverage_table.add_row(
        "Consent Banner",
        f"[{score_color(consent_cov)}]{consent_cov:.0f}%[/{score_color(consent_cov)}]"
    )

    console.print(coverage_table)
    console.print()

    # Top issues
    if audit_summary['issues']:
        console.print("[bold]Top Issues:[/bold]\n")
        critical_issues = [i for i in audit_summary['issues'] if i['severity'] == 'critical'][:3]
        warning_issues = [i for i in audit_summary['issues'] if i['severity'] == 'warning'][:3]

        for issue in critical_issues:
            console.print(f"[red]❌ CRITICAL:[/red] {issue['title']}")
            if issue['recommendation']:
                console.print(f"   💡 {issue['recommendation']}\n")

        for issue in warning_issues:
            console.print(f"[yellow]⚠ WARNING:[/yellow] {issue['title']}")
            if issue['recommendation']:
                console.print(f"   💡 {issue['recommendation']}\n")


if __name__ == '__main__':
    cli()
