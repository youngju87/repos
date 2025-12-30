"""
Result Formatter - Formats pipeline results for display
Supports multiple output formats: Rich tables, JSON, Markdown, CSV
"""

import json
import logging
from typing import Any, Dict, List
from datetime import datetime

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.markdown import Markdown

logger = logging.getLogger(__name__)


class ResultFormatter:
    """
    Formats pipeline results for various output formats
    """

    def __init__(self, console: Console = None):
        """
        Initialize formatter

        Args:
            console: Rich console (optional, creates new if not provided)
        """
        self.console = console or Console()

    def format_serp_table(self, serp_data) -> Table:
        """
        Format SERP results as Rich table

        Args:
            serp_data: SerpData object

        Returns:
            Rich Table object
        """
        table = Table(title=f"SERP Results: {serp_data.keyword}")
        table.add_column("#", style="cyan", width=3)
        table.add_column("Title", style="white", max_width=60)
        table.add_column("Domain", style="green", max_width=30)

        for result in serp_data.results[:20]:  # Top 20
            # Truncate long titles
            title = result.title[:60] + "..." if len(result.title) > 60 else result.title

            table.add_row(
                str(result.position),
                title,
                result.domain
            )

        return table

    def format_gap_analysis_table(self, analysis) -> Table:
        """
        Format gap analysis summary as Rich table

        Args:
            analysis: GapAnalysis object

        Returns:
            Rich Table object
        """
        summary = Table(title="Gap Analysis Summary")
        summary.add_column("Metric", style="cyan", width=25)
        summary.add_column("Value", style="white")

        if analysis.your_url:
            summary.add_row("Your URL", analysis.your_url)
            summary.add_row("Coverage Score", f"{analysis.coverage_score}%")

        summary.add_row("Competitors Analyzed", str(analysis.total_competitors))
        summary.add_row("Total Gaps Found", str(len(analysis.gaps)))
        summary.add_row("Critical Gaps", f"[red]{analysis.critical_gaps}[/red]")
        summary.add_row("Important Gaps", f"[yellow]{analysis.important_gaps}[/yellow]")
        summary.add_row("Minor Gaps", f"[blue]{analysis.minor_gaps}[/blue]")

        return summary

    def format_gaps_detailed(self, analysis, limit: int = 10):
        """
        Format detailed gap list for console output

        Args:
            analysis: GapAnalysis object
            limit: Maximum number of gaps to display
        """
        if not analysis.gaps:
            self.console.print("[yellow]No content gaps found[/yellow]")
            return

        self.console.print(f"\n[bold]Top {min(limit, len(analysis.gaps))} Content Gaps:[/bold]\n")

        for i, gap in enumerate(analysis.gaps[:limit], 1):
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

            self.console.print(f"[{color}]{i}. {gap.title} (Score: {gap.score:.0f}/100)[/{color}]")
            self.console.print(f"   [{severity}] {gap.description}")

            if gap.recommendations:
                self.console.print(f"   [dim]→ {gap.recommendations[0]}[/dim]")

            self.console.print()

    def format_pipeline_stats(self, result) -> Table:
        """
        Format pipeline execution statistics

        Args:
            result: PipelineResult object

        Returns:
            Rich Table object
        """
        stats = Table(title="Pipeline Statistics")
        stats.add_column("Metric", style="cyan")
        stats.add_column("Value", style="white")

        stats.add_row("Keyword", result.keyword)
        stats.add_row("Duration", f"{result.total_duration_seconds:.2f}s")
        stats.add_row("URLs Found", str(result.total_urls_found))
        stats.add_row("Successful Extractions", f"[green]{result.successful_extractions}[/green]")

        if result.failed_extractions > 0:
            stats.add_row("Failed Extractions", f"[red]{result.failed_extractions}[/red]")

        stats.add_row("Gaps Identified", str(len(result.gap_analysis.gaps)))

        return stats

    def to_json(self, analysis, indent: int = 2) -> str:
        """
        Convert gap analysis to JSON

        Args:
            analysis: GapAnalysis object
            indent: JSON indentation

        Returns:
            JSON string
        """
        data = {
            'keyword': analysis.keyword,
            'your_url': analysis.your_url,
            'coverage_score': analysis.coverage_score,
            'total_competitors': analysis.total_competitors,
            'gaps': [
                {
                    'title': gap.title,
                    'type': gap.gap_type,
                    'score': gap.score,
                    'description': gap.description,
                    'recommendations': gap.recommendations,
                    'coverage_count': gap.coverage_count
                }
                for gap in analysis.gaps
            ],
            'stats': {
                'total_gaps': len(analysis.gaps),
                'critical_gaps': analysis.critical_gaps,
                'important_gaps': analysis.important_gaps,
                'minor_gaps': analysis.minor_gaps
            }
        }

        return json.dumps(data, indent=indent)

    def to_markdown(self, analysis) -> str:
        """
        Convert gap analysis to Markdown

        Args:
            analysis: GapAnalysis object

        Returns:
            Markdown string
        """
        md = f"""# Content Gap Analysis: {analysis.keyword}

## Summary

| Metric | Value |
|--------|-------|
| Your URL | {analysis.your_url or 'Not provided'} |
| Coverage Score | {analysis.coverage_score}% |
| Competitors Analyzed | {analysis.total_competitors} |
| Total Gaps | {len(analysis.gaps)} |
| Critical Gaps | {analysis.critical_gaps} |
| Important Gaps | {analysis.important_gaps} |
| Minor Gaps | {analysis.minor_gaps} |

## Content Gaps

"""

        # Add top gaps
        for i, gap in enumerate(analysis.gaps[:20], 1):
            if gap.score >= 80:
                severity = "🔴 CRITICAL"
            elif gap.score >= 60:
                severity = "🟡 IMPORTANT"
            else:
                severity = "🔵 MINOR"

            md += f"""### {i}. {gap.title} ({gap.score:.0f}/100)

**{severity}** - {gap.description}

**Coverage**: {gap.coverage_count}/{analysis.total_competitors} competitors

**Recommendations**:
"""
            for rec in gap.recommendations:
                md += f"- {rec}\n"

            md += "\n---\n\n"

        md += f"""
## Report Generated

- **Date**: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}
- **Tool**: SEO Content Gap Finder
"""

        return md

    def to_csv(self, analysis) -> str:
        """
        Convert gap analysis to CSV format

        Args:
            analysis: GapAnalysis object

        Returns:
            CSV string
        """
        import csv
        import io

        output = io.StringIO()
        writer = csv.writer(output)

        # Header
        writer.writerow([
            'Rank',
            'Title',
            'Type',
            'Score',
            'Description',
            'Coverage',
            'Recommendations'
        ])

        # Data
        for i, gap in enumerate(analysis.gaps, 1):
            writer.writerow([
                i,
                gap.title,
                gap.gap_type,
                gap.score,
                gap.description,
                f"{gap.coverage_count}/{analysis.total_competitors}",
                '; '.join(gap.recommendations)
            ])

        return output.getvalue()

    def display_full_report(self, result):
        """
        Display complete analysis report to console

        Args:
            result: PipelineResult object
        """
        # Header
        self.console.print("\n[bold blue]SEO Content Gap Analysis Report[/bold blue]\n", justify="center")

        # SERP Results
        serp_table = self.format_serp_table(result.serp_data)
        self.console.print(serp_table)
        self.console.print()

        # Pipeline Stats
        stats_table = self.format_pipeline_stats(result)
        self.console.print(stats_table)
        self.console.print()

        # Gap Analysis Summary
        gap_summary = self.format_gap_analysis_table(result.gap_analysis)
        self.console.print(gap_summary)
        self.console.print()

        # Detailed Gaps
        self.format_gaps_detailed(result.gap_analysis, limit=10)

        # Footer
        self.console.print(f"\n[bold green]Analysis Complete![/bold green]")

    def export_to_file(
        self,
        analysis,
        output_path: str,
        format: str = 'json'
    ):
        """
        Export analysis to file

        Args:
            analysis: GapAnalysis object
            output_path: Output file path
            format: Output format (json, markdown, csv)
        """
        if format == 'json':
            content = self.to_json(analysis)
        elif format == 'markdown' or format == 'md':
            content = self.to_markdown(analysis)
        elif format == 'csv':
            content = self.to_csv(analysis)
        else:
            raise ValueError(f"Unsupported format: {format}")

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)

        logger.info(f"Exported analysis to {output_path} ({format})")
