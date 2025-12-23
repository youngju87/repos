#!/usr/bin/env python3
"""
Content Gap Finder - CLI
Main entry point for SEO content gap analysis
"""

import asyncio
import sys
import logging
from pathlib import Path

import click
from rich.console import Console
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from scraper.serp_scraper import SerpScraper
from scraper.content_extractor import ContentExtractor
from analyzer.nlp_analyzer import NLPAnalyzer
from analyzer.gap_analyzer import GapAnalyzer

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

console = Console()


@click.group()
def cli():
    """SEO Content Gap Finder - Find content opportunities with NLP"""
    pass


@cli.command()
@click.option('--keyword', required=True, help='Keyword to analyze')
@click.option('--depth', default=10, help='Number of SERP results to analyze')
@click.option('--your-url', default=None, help='Your URL to compare against')
def analyze(keyword, depth, your_url):
    """Analyze content gaps for a keyword"""

    console.print(f"\n[bold blue]SEO Content Gap Analysis[/bold blue]", justify="center")
    console.print(f"[cyan]Keyword: {keyword}[/cyan]\n")

    try:
        # Step 1: Scrape SERP
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task(f"Searching Google for '{keyword}'...", total=None)

            scraper = SerpScraper(headless=True)
            serp_data = asyncio.run(scraper.search(keyword, num_results=depth))

            progress.update(task, completed=True)

        console.print(f"[green]✓[/green] Found {len(serp_data.results)} organic results\n")

        # Display SERP results
        _display_serp_results(serp_data)

        # Step 2: Extract content from URLs
        console.print("\n[bold]Extracting Content...[/bold]")

        urls_to_extract = [r.url for r in serp_data.results]

        # Add your URL if provided
        your_content_data = None
        if your_url:
            urls_to_extract.insert(0, your_url)

        extractor = ContentExtractor()

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            extract_task = progress.add_task("Extracting content...", total=len(urls_to_extract))

            extracted_contents = []
            for url in urls_to_extract:
                content = extractor.extract(url)
                if content.success:
                    extracted_contents.append(content)
                progress.advance(extract_task)

        successful = len(extracted_contents)
        console.print(f"[green]✓[/green] Extracted content from {successful}/{len(urls_to_extract)} URLs\n")

        # Separate your content
        if your_url:
            your_content_raw = next((c for c in extracted_contents if c.url == your_url), None)
            competitor_contents = [c for c in extracted_contents if c.url != your_url]
        else:
            your_content_raw = None
            competitor_contents = extracted_contents

        # Step 3: NLP Analysis
        console.print("[bold]Analyzing Content with NLP...[/bold]")

        nlp_analyzer = NLPAnalyzer()

        analyzed_contents = []
        for content in competitor_contents:
            nlp_result = nlp_analyzer.analyze(content.text, content.url)

            analyzed_contents.append({
                'url': content.url,
                'word_count': content.word_count,
                'headings': content.headings,
                'nlp_analysis': {
                    'keywords': nlp_result.keywords,
                    'main_topics': nlp_result.main_topics,
                    'entities': nlp_result.entities
                },
                'images_count': content.images_count
            })

        your_analyzed = None
        if your_content_raw:
            nlp_result = nlp_analyzer.analyze(your_content_raw.text, your_content_raw.url)
            your_analyzed = {
                'url': your_content_raw.url,
                'word_count': your_content_raw.word_count,
                'headings': your_content_raw.headings,
                'nlp_analysis': {
                    'keywords': nlp_result.keywords,
                    'main_topics': nlp_result.main_topics,
                    'entities': nlp_result.entities
                },
                'images_count': your_content_raw.images_count
            }

        console.print(f"[green]✓[/green] NLP analysis complete\n")

        # Step 4: Gap Analysis
        console.print("[bold]Identifying Content Gaps...[/bold]")

        gap_analyzer = GapAnalyzer()
        analysis = gap_analyzer.analyze(
            keyword=keyword,
            competitor_contents=analyzed_contents,
            your_content=your_analyzed
        )

        console.print(f"[green]✓[/green] Found {len(analysis.gaps)} content gaps\n")

        # Display results
        _display_gap_analysis(analysis)

        console.print(f"\n[bold green]Analysis Complete![/bold green]")

    except Exception as e:
        console.print(f"[bold red]Error:[/bold red] {str(e)}")
        logger.exception("Analysis failed")
        sys.exit(1)


@cli.command()
@click.option('--keyword', required=True, help='Keyword for content brief')
@click.option('--output', default='brief.md', help='Output file path')
def brief(keyword, output):
    """Generate content brief for a keyword"""

    console.print(f"\n[bold]Generating Content Brief: {keyword}[/bold]\n")

    console.print("[yellow]Note:[/yellow] Brief generation requires running analysis first.")
    console.print(f"Run: python content_gap_cli.py analyze --keyword \"{keyword}\"\n")

    # Placeholder brief
    brief_content = f"""# Content Brief: {keyword}

## Target Keyword
- Primary: {keyword}
- Search Intent: Informational
- Difficulty: TBD

## Recommended Structure

### H1: [Main Title about {keyword}]

### H2: What is {keyword}?
- Definition
- Key concepts
- Why it matters

### H2: [Topic from Gap Analysis]
- Details...

### H2: Best Practices
- Tips and recommendations

### H2: Conclusion
- Summary
- Call to action

## Target Metrics
- Word count: 2,500-3,500 words
- Images: 6-8
- Internal links: 8-12
- External links: 5-7

## Topics to Cover
[Run analysis to populate]

## Keywords to Include
[Run analysis to populate]

---
Generated by SEO Content Gap Finder
"""

    Path(output).write_text(brief_content)
    console.print(f"[green]✓[/green] Content brief saved to: {output}\n")


def _display_serp_results(serp_data):
    """Display SERP results in a table"""
    table = Table(title="Top 10 Organic Results")
    table.add_column("#", style="cyan", width=3)
    table.add_column("Title", style="white")
    table.add_column("Domain", style="green")

    for result in serp_data.results[:10]:
        table.add_row(
            str(result.position),
            result.title[:60] + "..." if len(result.title) > 60 else result.title,
            result.domain
        )

    console.print(table)


def _display_gap_analysis(analysis):
    """Display gap analysis results"""

    # Summary table
    summary = Table(title="Analysis Summary")
    summary.add_column("Metric", style="cyan")
    summary.add_column("Value", style="white")

    if analysis.your_url:
        summary.add_row("Your URL", analysis.your_url)
        summary.add_row("Coverage Score", f"{analysis.coverage_score}%")

    summary.add_row("Competitors Analyzed", str(analysis.total_competitors))
    summary.add_row("Total Gaps Found", str(len(analysis.gaps)))
    summary.add_row("Critical Gaps", f"[red]{analysis.critical_gaps}[/red]")
    summary.add_row("Important Gaps", f"[yellow]{analysis.important_gaps}[/yellow]")
    summary.add_row("Minor Gaps", f"[blue]{analysis.minor_gaps}[/blue]")

    console.print(summary)
    console.print()

    # Display top gaps
    if analysis.gaps:
        console.print("[bold]Top Content Gaps:[/bold]\n")

        for i, gap in enumerate(analysis.gaps[:10], 1):
            # Color based on score
            if gap.score >= 80:
                color = "red"
                severity = "CRITICAL"
            elif gap.score >= 60:
                color = "yellow"
                severity = "IMPORTANT"
            else:
                color = "blue"
                severity = "MINOR"

            console.print(f"[{color}]{i}. {gap.title} (Score: {gap.score:.0f}/100)[/{color}]")
            console.print(f"   [{severity}] {gap.description}")

            if gap.recommendations:
                console.print(f"   [dim]→ {gap.recommendations[0]}[/dim]")

            console.print()


if __name__ == '__main__':
    cli()
