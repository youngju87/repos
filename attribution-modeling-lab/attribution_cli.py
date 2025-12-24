"""
Attribution Modeling CLI - Command-line interface for attribution analysis
"""

import click
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich import box
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from data_generator.journey_generator import JourneyGenerator
from models.attribution_models import AttributionEngine
from models.comparison_engine import ComparisonEngine
from database.models import Channel

console = Console()


@click.group()
def cli():
    """Attribution Modeling Lab - Compare Multi-Touch Attribution Models"""
    pass


@cli.command()
@click.option('--journeys', default=1000, help='Number of journeys to generate')
@click.option('--conversion-rate', default=0.15, help='Conversion rate (0.0-1.0)')
@click.option('--avg-length', default=4, help='Average touchpoints per journey')
def generate(journeys, conversion_rate, avg_length):
    """Generate sample journey data"""
    console.print(f"\n[bold cyan]Generating Sample Data[/bold cyan]\n")

    generator = JourneyGenerator(seed=42)

    journey_data = generator.generate_journeys(
        num_journeys=journeys,
        conversion_rate=conversion_rate,
        avg_journey_length=avg_length
    )

    # Save to file (simplified - would use database in production)
    import pickle
    with open('sample_journeys.pkl', 'wb') as f:
        pickle.dump(journey_data, f)

    console.print(f"\n[green]✓ Data saved to sample_journeys.pkl[/green]\n")

    # Show summary
    converted = sum(1 for j in journey_data if j.converted)
    total_revenue = sum(j.revenue for j in journey_data if j.converted)
    total_cost = sum(j.total_cost for j in journey_data)

    summary = f"""
[bold]Dataset Summary:[/bold]
  Total Journeys:     {len(journey_data):,}
  Conversions:        {converted:,} ({converted/len(journey_data)*100:.1f}%)
  Total Revenue:      ${total_revenue:,.2f}
  Total Cost:         ${total_cost:,.2f}
  ROI:                {((total_revenue - total_cost)/total_cost*100):.1f}%

  Avg Touchpoints:    {sum(j.touchpoint_count for j in journey_data)/len(journey_data):.1f}
  Avg Journey Length: {sum(j.journey_duration_days for j in journey_data if j.converted)/converted:.1f} days
    """

    console.print(Panel(summary.strip(), title="Generation Complete", border_style="green"))


@cli.command()
def analyze():
    """Run attribution analysis on generated data"""
    console.print(f"\n[bold cyan]Running Attribution Analysis[/bold cyan]\n")

    # Load data
    try:
        import pickle
        with open('sample_journeys.pkl', 'rb') as f:
            journeys = pickle.load(f)

        console.print(f"[green]✓ Loaded {len(journeys):,} journeys[/green]\n")
    except FileNotFoundError:
        console.print("[red]Error: No data found. Run 'generate' first.[/red]\n")
        return

    # Run attribution models
    engine = AttributionEngine()

    # Train data-driven model
    console.print("Training data-driven model...")
    engine.train_data_driven(journeys)
    console.print()

    # Run all models
    results = engine.run_all_models(journeys)

    # Create comparison
    comparison_engine = ComparisonEngine()
    comparison_engine.load_results(journeys, results)
    comparison = comparison_engine.create_comparison()

    # Save results
    import pickle
    with open('attribution_results.pkl', 'wb') as f:
        pickle.dump({
            'journeys': journeys,
            'results': results,
            'comparison': comparison
        }, f)

    console.print("[green]✓ Results saved to attribution_results.pkl[/green]\n")


@cli.command()
def compare():
    """Compare attribution models side-by-side"""
    console.print(f"\n[bold cyan]Model Comparison[/bold cyan]\n")

    # Load results
    try:
        import pickle
        with open('attribution_results.pkl', 'rb') as f:
            data = pickle.load(f)

        comparison = data['comparison']
    except FileNotFoundError:
        console.print("[red]Error: No results found. Run 'analyze' first.[/red]\n")
        return

    # Create comparison table
    table = Table(title="Attribution by Channel & Model", box=box.ROUNDED, show_header=True)

    table.add_column("Channel", style="cyan", no_wrap=True)
    table.add_column("Cost", justify="right", style="dim")

    for model in comparison.models:
        table.add_column(model, justify="right")

    # Get all channels
    all_channels = set()
    for perf_dict in comparison.channel_performance.values():
        all_channels.update(perf_dict.keys())

    # Add rows
    for channel in sorted(all_channels, key=lambda c: c.value):
        row = [channel.value]

        # Get cost (same across models)
        first_model = comparison.models[0]
        if channel in comparison.channel_performance[first_model]:
            cost = comparison.channel_performance[first_model][channel].total_cost
            row.append(f"${cost:,.0f}")
        else:
            row.append("-")

        # Add revenue for each model
        for model in comparison.models:
            perf_dict = comparison.channel_performance[model]

            if channel in perf_dict:
                revenue = perf_dict[channel].attributed_revenue
                row.append(f"${revenue:,.0f}")
            else:
                row.append("-")

        table.add_row(*row)

    console.print(table)

    # Model agreement score
    agreement = comparison.get_model_agreement_score()

    console.print(f"\n[bold]Model Agreement Score:[/bold] {agreement:.2%}")

    if agreement > 0.8:
        console.print("[green]✓ Models show high agreement[/green]")
    elif agreement > 0.5:
        console.print("[yellow]⚠ Moderate disagreement between models[/yellow]")
    else:
        console.print("[red]⚠ Significant disagreement - investigate further[/red]")

    console.print()


@cli.command()
@click.option('--model', default='Data-Driven', help='Model to analyze')
def roas(model):
    """Show ROAS (Return on Ad Spend) by channel"""
    console.print(f"\n[bold cyan]ROAS Analysis - {model}[/bold cyan]\n")

    # Load results
    try:
        import pickle
        with open('attribution_results.pkl', 'rb') as f:
            data = pickle.load(f)

        comparison = data['comparison']
    except FileNotFoundError:
        console.print("[red]Error: No results found. Run 'analyze' first.[/red]\n")
        return

    if model not in comparison.models:
        console.print(f"[red]Error: Model '{model}' not found.[/red]")
        console.print(f"Available models: {', '.join(comparison.models)}")
        return

    # Create ROAS table
    table = Table(title=f"ROAS by Channel ({model})", box=box.ROUNDED)

    table.add_column("Rank", style="dim", width=6)
    table.add_column("Channel", style="cyan")
    table.add_column("Revenue", justify="right", style="green")
    table.add_column("Cost", justify="right")
    table.add_column("ROAS", justify="right", style="bold")
    table.add_column("CPA", justify="right")
    table.add_column("Status", justify="center")

    perf_dict = comparison.channel_performance[model]

    # Sort by ROAS
    channels_sorted = sorted(
        perf_dict.items(),
        key=lambda x: x[1].roas,
        reverse=True
    )

    for i, (channel, perf) in enumerate(channels_sorted, 1):
        # Status indicator
        if perf.roas >= 3.0:
            status = "🟢"
        elif perf.roas >= 1.5:
            status = "🟡"
        else:
            status = "🔴"

        table.add_row(
            str(i),
            channel.value,
            f"${perf.attributed_revenue:,.0f}",
            f"${perf.total_cost:,.0f}",
            f"{perf.roas:.2f}x",
            f"${perf.cpa:.2f}" if perf.cpa > 0 else "-",
            status
        )

    console.print(table)

    console.print("\n[dim]🟢 Excellent (3.0x+)  🟡 Good (1.5x+)  🔴 Needs Improvement[/dim]\n")


@cli.command()
def disagreements():
    """Show channels with biggest disagreement across models"""
    console.print(f"\n[bold cyan]Model Disagreements[/bold cyan]\n")

    # Load results
    try:
        import pickle
        with open('attribution_results.pkl', 'rb') as f:
            data = pickle.load(f)

        journeys = data['journeys']
        results = data['results']
    except FileNotFoundError:
        console.print("[red]Error: No results found. Run 'analyze' first.[/red]\n")
        return

    # Get disagreements
    comparison_engine = ComparisonEngine()
    comparison_engine.load_results(journeys, results)

    disagreements_list = comparison_engine.get_biggest_disagreements(top_n=10)

    # Create table
    table = Table(title="Channels with Biggest Attribution Variance", box=box.ROUNDED)

    table.add_column("Rank", style="dim", width=6)
    table.add_column("Channel", style="cyan")
    table.add_column("Mean Revenue", justify="right")
    table.add_column("Min-Max Range", justify="right")
    table.add_column("Variation", justify="right", style="yellow")

    for i, dis in enumerate(disagreements_list, 1):
        table.add_row(
            str(i),
            dis['channel'].value,
            f"${dis['mean_revenue']:,.0f}",
            f"${dis['min_revenue']:,.0f} - ${dis['max_revenue']:,.0f}",
            f"{dis['coefficient_of_variation']*100:.0f}%"
        )

    console.print(table)

    # Show details for top disagreement
    if disagreements_list:
        console.print(f"\n[bold]Top Disagreement: {disagreements_list[0]['channel'].value}[/bold]\n")

        detail_table = Table(box=box.SIMPLE)
        detail_table.add_column("Model", style="cyan")
        detail_table.add_column("Attributed Revenue", justify="right")

        for model, revenue in sorted(
            disagreements_list[0]['model_revenues'].items(),
            key=lambda x: x[1],
            reverse=True
        ):
            detail_table.add_row(model, f"${revenue:,.2f}")

        console.print(detail_table)
        console.print()


@cli.command()
def recommendations():
    """Get budget optimization recommendations"""
    console.print(f"\n[bold cyan]Budget Recommendations[/bold cyan]\n")

    # Load results
    try:
        import pickle
        with open('attribution_results.pkl', 'rb') as f:
            data = pickle.load(f)

        journeys = data['journeys']
        results = data['results']
    except FileNotFoundError:
        console.print("[red]Error: No results found. Run 'analyze' first.[/red]\n")
        return

    # Get recommendations
    comparison_engine = ComparisonEngine()
    comparison_engine.load_results(journeys, results)

    recs = comparison_engine.get_budget_recommendations()

    if not recs:
        console.print("[green]No significant budget changes recommended.[/green]\n")
        return

    console.print("[yellow]Based on Last-Touch vs Data-Driven comparison:[/yellow]\n")

    for i, rec in enumerate(recs[:10], 1):
        action_color = "green" if rec['action'] == "INCREASE" else "red"
        action_symbol = "📈" if rec['action'] == "INCREASE" else "📉"

        panel_content = f"""
[bold]{action_symbol} {rec['action']} Budget[/bold]

[bold]Attribution Comparison:[/bold]
  Last-Touch:   ${rec['last_touch_revenue']:>12,.2f}
  Data-Driven:  ${rec['data_driven_revenue']:>12,.2f}
  Difference:   ${rec['difference']:>12,.2f} ([{action_color}]{rec['difference_pct']:+.0f}%[/{action_color}])

[bold]Current Performance:[/bold]
  ROAS: {rec['current_roas']:.2f}x

[bold]Reason:[/bold]
  {rec['reason']}
        """

        console.print(Panel(
            panel_content.strip(),
            title=f"{i}. {rec['channel'].value}",
            border_style=action_color
        ))
        console.print()


@cli.command()
@click.option('--journey-id', help='Specific journey ID to analyze')
def journey(journey_id):
    """Analyze a specific user journey"""
    console.print(f"\n[bold cyan]Journey Analysis[/bold cyan]\n")

    # Load results
    try:
        import pickle
        with open('attribution_results.pkl', 'rb') as f:
            data = pickle.load(f)

        journeys = data['journeys']
        results = data['results']
    except FileNotFoundError:
        console.print("[red]Error: No results found. Run 'analyze' first.[/red]\n")
        return

    # Find journey
    if journey_id:
        target_journey = next((j for j in journeys if j.journey_id == journey_id), None)
    else:
        # Show first converting journey
        target_journey = next((j for j in journeys if j.converted), None)

    if not target_journey:
        console.print("[red]Journey not found.[/red]\n")
        return

    # Journey summary
    console.print(f"[bold]Journey ID:[/bold] {target_journey.journey_id}")
    console.print(f"[bold]User:[/bold] {target_journey.user_id}")
    console.print(f"[bold]Path:[/bold] {target_journey.path_summary}")
    console.print(f"[bold]Touchpoints:[/bold] {target_journey.touchpoint_count}")
    console.print(f"[bold]Duration:[/bold] {target_journey.journey_duration_days:.1f} days")
    console.print(f"[bold]Cost:[/bold] ${target_journey.total_cost:.2f}")
    console.print(f"[bold]Revenue:[/bold] ${target_journey.revenue:.2f}")
    console.print(f"[bold]ROI:[/bold] {target_journey.roi*100:.1f}%\n")

    # Attribution comparison for this journey
    from models.attribution_models import AttributionEngine

    engine = AttributionEngine()

    table = Table(title="Attribution Comparison for This Journey", box=box.ROUNDED)
    table.add_column("Model", style="cyan")

    # Add column for each unique channel in journey
    for channel in target_journey.unique_channels:
        table.add_column(channel.value, justify="right")

    # Calculate attribution for each model
    for model_name, model in engine.models.items():
        if model_name == "Data-Driven" and not model.is_trained:
            continue  # Skip if not trained

        result = model.attribute(target_journey)

        row = [model_name]

        for channel in target_journey.unique_channels:
            credit = result.channel_credits.get(channel, 0)
            percentage = (credit / target_journey.revenue * 100) if target_journey.revenue > 0 else 0
            row.append(f"${credit:.2f} ({percentage:.0f}%)")

        table.add_row(*row)

    console.print(table)
    console.print()


@cli.command()
def summary():
    """Show overall analysis summary"""
    console.print(f"\n[bold cyan]Attribution Analysis Summary[/bold cyan]\n")

    # Load results
    try:
        import pickle
        with open('attribution_results.pkl', 'rb') as f:
            data = pickle.load(f)

        journeys = data['journeys']
        comparison = data['comparison']
    except FileNotFoundError:
        console.print("[red]Error: No results found. Run 'analyze' first.[/red]\n")
        return

    # Overall metrics
    converted = [j for j in journeys if j.converted]
    total_revenue = sum(j.revenue for j in converted)
    total_cost = sum(j.total_cost for j in journeys)

    summary_text = f"""
[bold]Dataset:[/bold]
  Total Journeys:     {len(journeys):,}
  Conversions:        {len(converted):,} ({len(converted)/len(journeys)*100:.1f}%)
  Total Revenue:      ${total_revenue:,.2f}
  Total Cost:         ${total_cost:,.2f}
  ROI:                {((total_revenue - total_cost)/total_cost*100):.1f}%

[bold]Journey Characteristics:[/bold]
  Avg Touchpoints:    {sum(j.touchpoint_count for j in journeys)/len(journeys):.1f}
  Avg Duration:       {sum(j.journey_duration_days for j in converted)/len(converted):.1f} days
  Avg Revenue:        ${sum(j.revenue for j in converted)/len(converted):.2f}

[bold]Attribution Models:[/bold]
  Models Analyzed:    {len(comparison.models)}
  Model Agreement:    {comparison.get_model_agreement_score():.1%}
    """

    console.print(Panel(summary_text.strip(), title="Summary", border_style="cyan"))
    console.print()


if __name__ == '__main__':
    cli()
