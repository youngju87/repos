#!/usr/bin/env python3
"""
Content Gap Finder - CLI (Refactored)
Main entry point for SEO content gap analysis
Uses pipeline orchestrator for clean separation of concerns
"""

import asyncio
import sys
import logging
from pathlib import Path

import click
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from pipeline.orchestrator import ContentGapPipeline
from pipeline.result_formatter import ResultFormatter
from cache.content_cache import ContentCache
from cache.serp_cache import SerpCache

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

console = Console()


@click.group()
@click.version_option(version='2.0.0', prog_name='SEO Content Gap Finder')
def cli():
    """SEO Content Gap Finder - Find content opportunities with NLP-powered analysis

    Version 2.0 - Now with caching, batch processing, and multiple export formats!
    """
    pass


@cli.command()
@click.option('--keyword', required=True, help='Keyword to analyze')
@click.option('--depth', default=10, help='Number of SERP results to analyze (default: 10)')
@click.option('--your-url', default=None, help='Your URL to compare against competitors')
@click.option('--cache/--no-cache', default=True, help='Use caching for faster repeated analyses (default: enabled)')
@click.option('--format', type=click.Choice(['console', 'json', 'markdown', 'csv']), default='console',
              help='Output format (default: console)')
@click.option('--output', default=None, help='Output file path (required for json/markdown/csv formats)')
@click.option('--headless/--no-headless', default=True, help='Run browser in headless mode (default: enabled)')
def analyze(keyword, depth, your_url, cache, format, output, headless):
    """Analyze content gaps for a keyword

    Examples:

      # Basic analysis with console output
      $ python content_gap_cli.py analyze --keyword "project management"

      # Compare your content against competitors
      $ python content_gap_cli.py analyze --keyword "crm software" --your-url "https://yoursite.com/crm"

      # Export to JSON for API integration
      $ python content_gap_cli.py analyze --keyword "seo tools" --format json --output report.json

      # Export to Markdown for client reports
      $ python content_gap_cli.py analyze --keyword "email marketing" --format markdown --output report.md

      # Disable caching for fresh data
      $ python content_gap_cli.py analyze --keyword "ai tools" --no-cache
    """

    # Validate output file for non-console formats
    if format != 'console' and not output:
        console.print("[red]Error:[/red] --output is required for json/markdown/csv formats")
        sys.exit(1)

    console.print(f"\n[bold blue]SEO Content Gap Analysis v2.0[/bold blue]", justify="center")
    console.print(f"[cyan]Keyword: {keyword}[/cyan]")
    if your_url:
        console.print(f"[cyan]Your URL: {your_url}[/cyan]")
    console.print()

    try:
        # Initialize caches if enabled
        content_cache = ContentCache() if cache else None
        serp_cache = SerpCache() if cache else None

        if cache:
            console.print("[dim]Cache enabled - checking for cached data...[/dim]")

        # Initialize pipeline
        pipeline = ContentGapPipeline(headless=headless, use_spacy=True)

        # Run analysis with progress tracking
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task(f"Analyzing '{keyword}'...", total=None)

            # Run the pipeline
            result = asyncio.run(pipeline.analyze(
                keyword=keyword,
                depth=depth,
                your_url=your_url,
                content_cache=content_cache,
                serp_cache=serp_cache
            ))

            progress.update(task, completed=True)

        console.print(f"[green]Analysis complete![/green]\n")

        # Format and display/export results
        formatter = ResultFormatter()

        if format == 'console':
            # Display rich console output
            formatter.display_full_report(result)

        elif format == 'json':
            # Export to JSON
            json_output = formatter.to_json(result.gap_analysis, indent=2)
            Path(output).write_text(json_output, encoding='utf-8')
            console.print(f"[green]JSON report saved to:[/green] {output}")

        elif format == 'markdown':
            # Export to Markdown
            md_output = formatter.to_markdown(result.gap_analysis)
            Path(output).write_text(md_output, encoding='utf-8')
            console.print(f"[green]Markdown report saved to:[/green] {output}")

        elif format == 'csv':
            # Export to CSV
            csv_output = formatter.to_csv(result.gap_analysis)
            Path(output).write_text(csv_output, encoding='utf-8')
            console.print(f"[green]CSV report saved to:[/green] {output}")

        # Show cache stats if enabled
        if cache and content_cache:
            stats = content_cache.get_stats()
            console.print(f"\n[dim]Cache: {stats['valid_entries']} entries, {stats['cache_size_mb']} MB[/dim]")

        console.print(f"\n[bold green]Analysis Complete![/bold green]")

    except KeyboardInterrupt:
        console.print("\n[yellow]Analysis cancelled by user[/yellow]")
        sys.exit(1)

    except Exception as e:
        console.print(f"\n[bold red]Error:[/bold red] {str(e)}")
        logger.exception("Analysis failed")
        sys.exit(1)


@cli.command()
@click.option('--keywords-file', required=True, type=click.Path(exists=True),
              help='Text file with keywords (one per line)')
@click.option('--depth', default=10, help='Number of SERP results per keyword (default: 10)')
@click.option('--output-dir', default='reports', help='Output directory for reports (default: reports/)')
@click.option('--format', type=click.Choice(['json', 'markdown', 'csv']), default='markdown',
              help='Output format for batch reports (default: markdown)')
@click.option('--max-concurrent', default=3, help='Max concurrent analyses (default: 3)')
@click.option('--cache/--no-cache', default=True, help='Use caching (default: enabled)')
def batch(keywords_file, depth, output_dir, format, max_concurrent, cache):
    """Batch analyze multiple keywords from a file

    Examples:

      # Analyze keywords from file, output to Markdown
      $ python content_gap_cli.py batch --keywords-file keywords.txt

      # Batch analyze with JSON output
      $ python content_gap_cli.py batch --keywords-file keywords.txt --format json --output-dir results/

      # Faster batch with more concurrent analyses
      $ python content_gap_cli.py batch --keywords-file keywords.txt --max-concurrent 5
    """

    console.print(f"\n[bold blue]Batch Content Gap Analysis[/bold blue]", justify="center")
    console.print()

    # Read keywords
    keywords = Path(keywords_file).read_text(encoding='utf-8').strip().split('\n')
    keywords = [k.strip() for k in keywords if k.strip()]

    console.print(f"[cyan]Keywords to analyze:[/cyan] {len(keywords)}")
    console.print(f"[cyan]Output directory:[/cyan] {output_dir}")
    console.print(f"[cyan]Format:[/cyan] {format}\n")

    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True, parents=True)

    try:
        # Initialize caches
        content_cache = ContentCache() if cache else None
        serp_cache = SerpCache() if cache else None

        # Initialize pipeline
        pipeline = ContentGapPipeline(headless=True, use_spacy=True)

        # Run batch analysis
        console.print("[bold]Starting batch analysis...[/bold]\n")

        results = asyncio.run(pipeline.batch_analyze(
            keywords=keywords,
            depth=depth,
            max_concurrent=max_concurrent,
            content_cache=content_cache,
            serp_cache=serp_cache
        ))

        # Export results
        formatter = ResultFormatter()
        successful = 0

        for result in results:
            if result.gap_analysis:
                # Generate filename from keyword
                safe_keyword = "".join(c if c.isalnum() else "_" for c in result.gap_analysis.keyword)
                filename = f"{safe_keyword}.{format}"
                filepath = output_path / filename

                # Export based on format
                if format == 'json':
                    content = formatter.to_json(result.gap_analysis, indent=2)
                elif format == 'markdown':
                    content = formatter.to_markdown(result.gap_analysis)
                elif format == 'csv':
                    content = formatter.to_csv(result.gap_analysis)

                filepath.write_text(content, encoding='utf-8')
                console.print(f"[green]✓[/green] {result.gap_analysis.keyword} -> {filename}")
                successful += 1
            else:
                console.print(f"[red]✗[/red] Failed: {result.keyword}")

        console.print(f"\n[bold green]Batch Analysis Complete![/bold green]")
        console.print(f"Successful: {successful}/{len(keywords)}")
        console.print(f"Reports saved to: {output_path}\n")

    except KeyboardInterrupt:
        console.print("\n[yellow]Batch analysis cancelled by user[/yellow]")
        sys.exit(1)

    except Exception as e:
        console.print(f"\n[bold red]Error:[/bold red] {str(e)}")
        logger.exception("Batch analysis failed")
        sys.exit(1)


@cli.command()
def cache_stats():
    """Show cache statistics"""

    console.print("\n[bold]Cache Statistics[/bold]\n")

    # Content cache stats
    try:
        content_cache = ContentCache()
        content_stats = content_cache.get_stats()

        console.print("[cyan]Content Cache:[/cyan]")
        console.print(f"  Total entries: {content_stats['total_entries']}")
        console.print(f"  Valid entries: {content_stats['valid_entries']}")
        console.print(f"  Expired entries: {content_stats['expired_entries']}")
        console.print(f"  Cache size: {content_stats['cache_size_mb']} MB\n")
    except Exception as e:
        console.print(f"[red]Content cache error:[/red] {e}\n")

    # SERP cache stats
    try:
        serp_cache = SerpCache()
        serp_stats = serp_cache.get_stats()

        console.print("[cyan]SERP Cache:[/cyan]")
        console.print(f"  Total entries: {serp_stats['total_entries']}")
        console.print(f"  Valid entries: {serp_stats['valid_entries']}")
        console.print(f"  Expired entries: {serp_stats['expired_entries']}")
        console.print(f"  Cache size: {serp_stats['cache_size_mb']} MB")

        if serp_stats.get('recent_keywords'):
            console.print(f"\n[cyan]Recent keywords:[/cyan]")
            for kw_data in serp_stats['recent_keywords'][:5]:
                console.print(f"  - {kw_data['keyword']}")

        console.print()
    except Exception as e:
        console.print(f"[red]SERP cache error:[/red] {e}\n")


@cli.command()
@click.option('--content/--serp/--all', default=False, help='Which cache to clear')
@click.confirmation_option(prompt='Are you sure you want to clear the cache?')
def cache_clear(content, serp, all):
    """Clear cached data"""

    if all or (not content and not serp):
        # Clear both
        content_cache = ContentCache()
        serp_cache = SerpCache()

        content_deleted = content_cache.clear_all()
        serp_deleted = serp_cache.clear_all()

        console.print(f"[green]Cleared {content_deleted} content cache entries[/green]")
        console.print(f"[green]Cleared {serp_deleted} SERP cache entries[/green]\n")
    elif content:
        content_cache = ContentCache()
        deleted = content_cache.clear_all()
        console.print(f"[green]Cleared {deleted} content cache entries[/green]\n")
    elif serp:
        serp_cache = SerpCache()
        deleted = serp_cache.clear_all()
        console.print(f"[green]Cleared {deleted} SERP cache entries[/green]\n")


if __name__ == '__main__':
    cli()
