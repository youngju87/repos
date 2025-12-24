"""
Model Comparison Engine - Aggregates and compares attribution model results
"""

from collections import defaultdict
from typing import Dict, List
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from database.models import (
    Channel, UserJourney, AttributionResult,
    ChannelPerformance, ModelComparison
)


class ComparisonEngine:
    """
    Compares attribution results across multiple models
    """

    def __init__(self):
        self.journeys = []
        self.attribution_results = {}  # {model_name: List[AttributionResult]}

    def load_results(
        self,
        journeys: List[UserJourney],
        attribution_results: Dict[str, List[AttributionResult]]
    ):
        """
        Load journeys and attribution results

        Args:
            journeys: List of user journeys
            attribution_results: Dict of {model_name: [AttributionResult]}
        """
        self.journeys = journeys
        self.attribution_results = attribution_results

    def aggregate_by_channel(self) -> Dict[str, Dict[Channel, ChannelPerformance]]:
        """
        Aggregate attribution results by channel for each model

        Returns:
            Dict of {model_name: {Channel: ChannelPerformance}}
        """
        # Create journey lookup for costs
        journey_lookup = {j.journey_id: j for j in self.journeys}

        # Aggregate for each model
        model_aggregations = {}

        for model_name, results in self.attribution_results.items():
            channel_stats = defaultdict(lambda: {
                'attributed_revenue': 0.0,
                'attributed_conversions': 0.0,
                'total_cost': 0.0,
                'touchpoint_count': 0
            })

            # Aggregate attribution results
            for result in results:
                for channel, credit in result.channel_credits.items():
                    channel_stats[channel]['attributed_revenue'] += credit
                    channel_stats[channel]['attributed_conversions'] += 1  # Each journey = 1 conversion

            # Add cost and touchpoint data from journeys
            for journey in self.journeys:
                for touchpoint in journey.touchpoints:
                    channel = touchpoint.channel
                    channel_stats[channel]['total_cost'] += touchpoint.cost
                    channel_stats[channel]['touchpoint_count'] += 1

            # Create ChannelPerformance objects
            channel_performance = {}
            for channel, stats in channel_stats.items():
                channel_performance[channel] = ChannelPerformance(
                    channel=channel,
                    model_name=model_name,
                    attributed_revenue=stats['attributed_revenue'],
                    attributed_conversions=stats['attributed_conversions'],
                    total_cost=stats['total_cost'],
                    touchpoint_count=stats['touchpoint_count']
                )

            model_aggregations[model_name] = channel_performance

        return model_aggregations

    def create_comparison(self) -> ModelComparison:
        """
        Create a ModelComparison object with all aggregated data

        Returns:
            ModelComparison object
        """
        channel_performance = self.aggregate_by_channel()

        # Calculate total revenue
        converted_journeys = [j for j in self.journeys if j.converted]
        total_revenue = sum(j.revenue for j in converted_journeys)

        comparison = ModelComparison(
            journey_count=len(self.journeys),
            total_revenue=total_revenue,
            models=list(self.attribution_results.keys()),
            channel_performance=channel_performance
        )

        return comparison

    def get_channel_comparison_table(self) -> List[Dict]:
        """
        Get a table comparing each channel across all models

        Returns:
            List of dicts with channel comparison data
        """
        comparison = self.create_comparison()

        # Get all channels
        all_channels = set()
        for perf_dict in comparison.channel_performance.values():
            all_channels.update(perf_dict.keys())

        # Build comparison table
        table = []

        for channel in sorted(all_channels, key=lambda c: c.value):
            row = {
                'channel': channel.value,
                'total_cost': 0,
                'touchpoints': 0
            }

            # Add metrics for each model
            for model_name in comparison.models:
                perf_dict = comparison.channel_performance[model_name]

                if channel in perf_dict:
                    perf = perf_dict[channel]

                    row[f'{model_name}_revenue'] = perf.attributed_revenue
                    row[f'{model_name}_roas'] = perf.roas
                    row[f'{model_name}_cpa'] = perf.cpa

                    # Use first model's cost/touchpoint data (same across models)
                    if row['total_cost'] == 0:
                        row['total_cost'] = perf.total_cost
                        row['touchpoints'] = perf.touchpoint_count
                else:
                    row[f'{model_name}_revenue'] = 0
                    row[f'{model_name}_roas'] = 0
                    row[f'{model_name}_cpa'] = 0

            table.append(row)

        return table

    def get_model_agreement_matrix(self) -> Dict[str, Dict[str, float]]:
        """
        Calculate pairwise agreement between models

        Returns:
            Matrix of {model1: {model2: agreement_score}}
        """
        comparison = self.create_comparison()
        models = comparison.models

        agreement_matrix = {}

        for model1 in models:
            agreement_matrix[model1] = {}

            for model2 in models:
                if model1 == model2:
                    agreement_matrix[model1][model2] = 1.0
                    continue

                # Calculate correlation of revenue attribution
                perf1 = comparison.channel_performance[model1]
                perf2 = comparison.channel_performance[model2]

                # Get common channels
                common_channels = set(perf1.keys()) & set(perf2.keys())

                if not common_channels:
                    agreement_matrix[model1][model2] = 0.0
                    continue

                # Calculate correlation coefficient
                revenues1 = [perf1[ch].attributed_revenue for ch in common_channels]
                revenues2 = [perf2[ch].attributed_revenue for ch in common_channels]

                # Pearson correlation
                mean1 = sum(revenues1) / len(revenues1)
                mean2 = sum(revenues2) / len(revenues2)

                numerator = sum((r1 - mean1) * (r2 - mean2) for r1, r2 in zip(revenues1, revenues2))
                denominator1 = sum((r1 - mean1) ** 2 for r1 in revenues1) ** 0.5
                denominator2 = sum((r2 - mean2) ** 2 for r2 in revenues2) ** 0.5

                if denominator1 == 0 or denominator2 == 0:
                    correlation = 0.0
                else:
                    correlation = numerator / (denominator1 * denominator2)

                agreement_matrix[model1][model2] = max(0, correlation)  # Clamp to [0, 1]

        return agreement_matrix

    def get_biggest_disagreements(self, top_n: int = 5) -> List[Dict]:
        """
        Find channels with the biggest disagreement across models

        Args:
            top_n: Number of top disagreements to return

        Returns:
            List of {channel, variance, models_data}
        """
        comparison = self.create_comparison()

        # Calculate variance for each channel
        disagreements = []

        all_channels = set()
        for perf_dict in comparison.channel_performance.values():
            all_channels.update(perf_dict.keys())

        for channel in all_channels:
            revenues = []
            model_revenues = {}

            for model_name in comparison.models:
                perf_dict = comparison.channel_performance[model_name]

                if channel in perf_dict:
                    revenue = perf_dict[channel].attributed_revenue
                    revenues.append(revenue)
                    model_revenues[model_name] = revenue
                else:
                    model_revenues[model_name] = 0

            if len(revenues) < 2:
                continue

            # Calculate coefficient of variation (CV)
            mean_revenue = sum(revenues) / len(revenues)

            if mean_revenue == 0:
                continue

            variance = sum((r - mean_revenue) ** 2 for r in revenues) / len(revenues)
            std_dev = variance ** 0.5
            cv = std_dev / mean_revenue  # Coefficient of variation

            disagreements.append({
                'channel': channel,
                'mean_revenue': mean_revenue,
                'std_dev': std_dev,
                'coefficient_of_variation': cv,
                'min_revenue': min(revenues),
                'max_revenue': max(revenues),
                'range': max(revenues) - min(revenues),
                'model_revenues': model_revenues
            })

        # Sort by coefficient of variation (highest disagreement first)
        disagreements.sort(key=lambda x: x['coefficient_of_variation'], reverse=True)

        return disagreements[:top_n]

    def get_budget_recommendations(self) -> List[Dict]:
        """
        Generate budget reallocation recommendations based on model differences

        Returns:
            List of recommendations
        """
        comparison = self.create_comparison()

        recommendations = []

        # Compare Last-Touch vs Data-Driven (most common comparison)
        if "Last-Touch" in comparison.models and "Data-Driven" in comparison.models:
            last_touch_perf = comparison.channel_performance["Last-Touch"]
            data_driven_perf = comparison.channel_performance["Data-Driven"]

            all_channels = set(last_touch_perf.keys()) | set(data_driven_perf.keys())

            for channel in all_channels:
                lt_revenue = last_touch_perf[channel].attributed_revenue if channel in last_touch_perf else 0
                dd_revenue = data_driven_perf[channel].attributed_revenue if channel in data_driven_perf else 0

                if lt_revenue == 0 and dd_revenue == 0:
                    continue

                # Calculate difference
                diff = dd_revenue - lt_revenue
                diff_pct = (diff / lt_revenue * 100) if lt_revenue > 0 else 0

                if abs(diff_pct) > 20:  # Significant difference (> 20%)
                    if diff > 0:
                        action = "INCREASE"
                        reason = f"Data-driven shows {abs(diff_pct):.0f}% more value than last-touch"
                    else:
                        action = "DECREASE"
                        reason = f"Last-touch overvalues by {abs(diff_pct):.0f}%"

                    # Get ROAS for context
                    roas = data_driven_perf[channel].roas if channel in data_driven_perf else 0

                    recommendations.append({
                        'channel': channel,
                        'action': action,
                        'last_touch_revenue': lt_revenue,
                        'data_driven_revenue': dd_revenue,
                        'difference': diff,
                        'difference_pct': diff_pct,
                        'reason': reason,
                        'current_roas': roas
                    })

        # Sort by absolute difference
        recommendations.sort(key=lambda x: abs(x['difference']), reverse=True)

        return recommendations


if __name__ == "__main__":
    # Test the comparison engine
    from data_generator.journey_generator import JourneyGenerator
    from models.attribution_models import AttributionEngine

    print("Testing Comparison Engine\n" + "="*60 + "\n")

    # Generate data
    generator = JourneyGenerator(seed=42)
    journeys = generator.generate_journeys(num_journeys=1000, conversion_rate=0.15)

    # Run attribution models
    engine = AttributionEngine()
    engine.train_data_driven(journeys)
    results = engine.run_all_models(journeys)

    # Create comparison
    comparison_engine = ComparisonEngine()
    comparison_engine.load_results(journeys, results)

    # Get comparison
    comparison = comparison_engine.create_comparison()

    print(f"Model Agreement Score: {comparison.get_model_agreement_score():.2f}")
    print()

    # Show biggest disagreements
    print("Biggest Disagreements Across Models:")
    print("="*60)

    disagreements = comparison_engine.get_biggest_disagreements(top_n=5)

    for i, dis in enumerate(disagreements, 1):
        print(f"\n{i}. {dis['channel'].value}")
        print(f"   Mean Revenue: ${dis['mean_revenue']:,.2f}")
        print(f"   Range: ${dis['min_revenue']:,.2f} - ${dis['max_revenue']:,.2f}")
        print(f"   Variation: {dis['coefficient_of_variation']*100:.1f}%")
        print("   By Model:")
        for model, revenue in sorted(dis['model_revenues'].items(), key=lambda x: x[1], reverse=True):
            print(f"     {model:20s} ${revenue:10,.2f}")

    # Show recommendations
    print("\n" + "="*60)
    print("Budget Recommendations:")
    print("="*60)

    recs = comparison_engine.get_budget_recommendations()

    for i, rec in enumerate(recs[:5], 1):
        print(f"\n{i}. {rec['channel'].value} - {rec['action']}")
        print(f"   Last-Touch:   ${rec['last_touch_revenue']:,.2f}")
        print(f"   Data-Driven:  ${rec['data_driven_revenue']:,.2f}")
        print(f"   Difference:   ${rec['difference']:+,.2f} ({rec['difference_pct']:+.0f}%)")
        print(f"   Reason: {rec['reason']}")
        print(f"   Current ROAS: {rec['current_roas']:.2f}x")
