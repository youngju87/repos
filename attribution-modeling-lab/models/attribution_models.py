"""
Attribution Models - Implements 6 different attribution strategies
"""

import math
from typing import Dict, List
from collections import defaultdict
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from database.models import Channel, UserJourney, AttributionResult
import numpy as np
from sklearn.linear_model import LogisticRegression


class AttributionModel:
    """Base class for attribution models"""

    def __init__(self, name: str):
        self.name = name

    def attribute(self, journey: UserJourney) -> AttributionResult:
        """
        Attribute revenue to channels for a single journey

        Args:
            journey: UserJourney object

        Returns:
            AttributionResult with channel credits
        """
        raise NotImplementedError("Subclasses must implement attribute()")

    def attribute_batch(self, journeys: List[UserJourney]) -> List[AttributionResult]:
        """Attribute credit for multiple journeys"""
        return [self.attribute(journey) for journey in journeys if journey.converted]


class LastTouchAttribution(AttributionModel):
    """
    Last-Touch Attribution
    Gives 100% credit to the final touchpoint before conversion
    """

    def __init__(self):
        super().__init__("Last-Touch")

    def attribute(self, journey: UserJourney) -> AttributionResult:
        """Give all credit to last touchpoint"""
        if not journey.converted or not journey.touchpoints:
            return AttributionResult(
                journey_id=journey.journey_id,
                model_name=self.name,
                channel_credits={}
            )

        # Last touchpoint gets 100% credit
        last_channel = journey.last_touch.channel
        revenue = journey.revenue

        return AttributionResult(
            journey_id=journey.journey_id,
            model_name=self.name,
            channel_credits={last_channel: revenue}
        )


class FirstTouchAttribution(AttributionModel):
    """
    First-Touch Attribution
    Gives 100% credit to the first touchpoint
    """

    def __init__(self):
        super().__init__("First-Touch")

    def attribute(self, journey: UserJourney) -> AttributionResult:
        """Give all credit to first touchpoint"""
        if not journey.converted or not journey.touchpoints:
            return AttributionResult(
                journey_id=journey.journey_id,
                model_name=self.name,
                channel_credits={}
            )

        # First touchpoint gets 100% credit
        first_channel = journey.first_touch.channel
        revenue = journey.revenue

        return AttributionResult(
            journey_id=journey.journey_id,
            model_name=self.name,
            channel_credits={first_channel: revenue}
        )


class LinearAttribution(AttributionModel):
    """
    Linear Attribution
    Splits credit equally across all touchpoints
    """

    def __init__(self):
        super().__init__("Linear")

    def attribute(self, journey: UserJourney) -> AttributionResult:
        """Split credit equally among all touchpoints"""
        if not journey.converted or not journey.touchpoints:
            return AttributionResult(
                journey_id=journey.journey_id,
                model_name=self.name,
                channel_credits={}
            )

        revenue = journey.revenue
        num_touchpoints = journey.touchpoint_count
        credit_per_touchpoint = revenue / num_touchpoints

        # Aggregate by channel
        channel_credits = defaultdict(float)
        for touchpoint in journey.touchpoints:
            channel_credits[touchpoint.channel] += credit_per_touchpoint

        return AttributionResult(
            journey_id=journey.journey_id,
            model_name=self.name,
            channel_credits=dict(channel_credits)
        )


class TimeDecayAttribution(AttributionModel):
    """
    Time-Decay Attribution
    More recent touchpoints get more credit (exponential decay)
    """

    def __init__(self, half_life_days: float = 7.0):
        """
        Args:
            half_life_days: Number of days for credit to decay to 50%
        """
        super().__init__("Time-Decay")
        self.half_life_days = half_life_days

    def attribute(self, journey: UserJourney) -> AttributionResult:
        """Assign credit with exponential time decay"""
        if not journey.converted or not journey.touchpoints:
            return AttributionResult(
                journey_id=journey.journey_id,
                model_name=self.name,
                channel_credits={}
            )

        revenue = journey.revenue
        conversion_time = journey.conversion.timestamp

        # Calculate decay weights
        weights = []
        for touchpoint in journey.touchpoints:
            # Days before conversion
            days_before = (conversion_time - touchpoint.timestamp).total_seconds() / 86400

            # Exponential decay: weight = 2^(-days / half_life)
            weight = math.pow(2, -days_before / self.half_life_days)
            weights.append(weight)

        # Normalize weights to sum to 1.0
        total_weight = sum(weights)
        normalized_weights = [w / total_weight for w in weights]

        # Assign credit
        channel_credits = defaultdict(float)
        for touchpoint, weight in zip(journey.touchpoints, normalized_weights):
            channel_credits[touchpoint.channel] += revenue * weight

        return AttributionResult(
            journey_id=journey.journey_id,
            model_name=self.name,
            channel_credits=dict(channel_credits)
        )


class PositionBasedAttribution(AttributionModel):
    """
    Position-Based (U-Shaped) Attribution
    40% to first touch, 40% to last touch, 20% split among middle touches
    """

    def __init__(self, first_touch_weight: float = 0.4, last_touch_weight: float = 0.4):
        """
        Args:
            first_touch_weight: Fraction for first touch (default 0.4)
            last_touch_weight: Fraction for last touch (default 0.4)
        """
        super().__init__("Position-Based")
        self.first_touch_weight = first_touch_weight
        self.last_touch_weight = last_touch_weight
        self.middle_weight = 1.0 - first_touch_weight - last_touch_weight

    def attribute(self, journey: UserJourney) -> AttributionResult:
        """Assign credit with position-based weighting"""
        if not journey.converted or not journey.touchpoints:
            return AttributionResult(
                journey_id=journey.journey_id,
                model_name=self.name,
                channel_credits={}
            )

        revenue = journey.revenue
        num_touchpoints = journey.touchpoint_count

        channel_credits = defaultdict(float)

        if num_touchpoints == 1:
            # Single touch gets 100%
            channel_credits[journey.touchpoints[0].channel] = revenue

        elif num_touchpoints == 2:
            # Split between first and last
            weight = revenue / 2
            channel_credits[journey.touchpoints[0].channel] += weight
            channel_credits[journey.touchpoints[1].channel] += weight

        else:
            # First touch
            channel_credits[journey.touchpoints[0].channel] += revenue * self.first_touch_weight

            # Last touch
            channel_credits[journey.touchpoints[-1].channel] += revenue * self.last_touch_weight

            # Middle touches
            middle_touchpoints = journey.touchpoints[1:-1]
            credit_per_middle = (revenue * self.middle_weight) / len(middle_touchpoints)

            for touchpoint in middle_touchpoints:
                channel_credits[touchpoint.channel] += credit_per_middle

        return AttributionResult(
            journey_id=journey.journey_id,
            model_name=self.name,
            channel_credits=dict(channel_credits)
        )


class DataDrivenAttribution(AttributionModel):
    """
    Data-Driven Attribution
    Uses machine learning to assign credit based on actual conversion probability

    This is a simplified implementation using logistic regression
    to estimate each touchpoint's contribution to conversion probability
    """

    def __init__(self):
        super().__init__("Data-Driven")
        self.model = None
        self.channel_to_index = {}
        self.is_trained = False

    def train(self, journeys: List[UserJourney]):
        """
        Train the attribution model on historical journeys

        Args:
            journeys: List of both converting and non-converting journeys
        """
        if len(journeys) < 100:
            print(f"Warning: Only {len(journeys)} journeys for training. Need 100+ for reliable results.")

        # Create channel index
        all_channels = set()
        for journey in journeys:
            all_channels.update(journey.unique_channels)

        self.channel_to_index = {channel: i for i, channel in enumerate(sorted(all_channels, key=lambda c: c.value))}

        # Create feature matrix
        X = []
        y = []

        for journey in journeys:
            # Features: binary indicator for each channel presence
            features = [0] * len(self.channel_to_index)

            for touchpoint in journey.touchpoints:
                idx = self.channel_to_index[touchpoint.channel]
                features[idx] = 1  # Binary: channel present or not

            X.append(features)
            y.append(1 if journey.converted else 0)

        # Train logistic regression
        self.model = LogisticRegression(max_iter=1000, random_state=42)
        self.model.fit(X, y)

        self.is_trained = True

        print(f"✓ Data-driven model trained on {len(journeys):,} journeys")
        print(f"  Channels analyzed: {len(self.channel_to_index)}")
        print(f"  Conversion rate: {sum(y)/len(y)*100:.1f}%")

    def attribute(self, journey: UserJourney) -> AttributionResult:
        """Assign credit based on learned channel contributions"""
        if not journey.converted or not journey.touchpoints:
            return AttributionResult(
                journey_id=journey.journey_id,
                model_name=self.name,
                channel_credits={}
            )

        if not self.is_trained:
            # Fallback to linear if not trained
            print("Warning: Data-driven model not trained. Using linear attribution.")
            linear = LinearAttribution()
            return linear.attribute(journey)

        revenue = journey.revenue

        # Get model coefficients (importance) for each channel
        channel_weights = {}

        for touchpoint in journey.touchpoints:
            channel = touchpoint.channel
            if channel in self.channel_to_index:
                idx = self.channel_to_index[channel]
                # Use absolute coefficient as weight (importance)
                weight = abs(self.model.coef_[0][idx])
                channel_weights[channel] = channel_weights.get(channel, 0) + weight

        # Normalize weights
        total_weight = sum(channel_weights.values())

        if total_weight == 0:
            # Fallback to linear if no weights
            linear = LinearAttribution()
            return linear.attribute(journey)

        # Assign credit proportional to weights
        channel_credits = {
            channel: revenue * (weight / total_weight)
            for channel, weight in channel_weights.items()
        }

        return AttributionResult(
            journey_id=journey.journey_id,
            model_name=self.name,
            channel_credits=channel_credits
        )


class AttributionEngine:
    """
    Main engine that runs multiple attribution models and compares results
    """

    def __init__(self):
        """Initialize all attribution models"""
        self.models = {
            "Last-Touch": LastTouchAttribution(),
            "First-Touch": FirstTouchAttribution(),
            "Linear": LinearAttribution(),
            "Time-Decay": TimeDecayAttribution(half_life_days=7),
            "Position-Based": PositionBasedAttribution(),
            "Data-Driven": DataDrivenAttribution()
        }

        self.results = {}  # {model_name: List[AttributionResult]}

    def train_data_driven(self, journeys: List[UserJourney]):
        """Train the data-driven model"""
        self.models["Data-Driven"].train(journeys)

    def run_all_models(self, journeys: List[UserJourney]) -> Dict[str, List[AttributionResult]]:
        """
        Run all attribution models on a set of journeys

        Args:
            journeys: List of user journeys

        Returns:
            Dictionary of {model_name: [AttributionResult]}
        """
        # Filter to only converted journeys
        converted_journeys = [j for j in journeys if j.converted]

        print(f"\nRunning attribution models on {len(converted_journeys):,} converting journeys...")

        for model_name, model in self.models.items():
            print(f"  • {model_name}...")
            results = model.attribute_batch(converted_journeys)
            self.results[model_name] = results

        print("✓ All models complete\n")

        return self.results

    def get_model_results(self, model_name: str) -> List[AttributionResult]:
        """Get results for a specific model"""
        return self.results.get(model_name, [])


if __name__ == "__main__":
    # Test attribution models
    from data_generator.journey_generator import JourneyGenerator

    print("Testing Attribution Models\n" + "="*60 + "\n")

    # Generate test data
    generator = JourneyGenerator(seed=42)
    journeys = generator.generate_journeys(num_journeys=500, conversion_rate=0.20)

    # Create engine
    engine = AttributionEngine()

    # Train data-driven model
    engine.train_data_driven(journeys)

    # Run all models
    results = engine.run_all_models(journeys)

    # Show example for first journey
    first_journey = [j for j in journeys if j.converted][0]

    print("="*60)
    print(f"Example: {first_journey.path_summary}")
    print(f"Revenue: ${first_journey.revenue:.2f}")
    print("="*60 + "\n")

    for model_name in engine.models.keys():
        result = engine.models[model_name].attribute(first_journey)

        print(f"{model_name}:")
        for channel, credit in sorted(result.channel_credits.items(), key=lambda x: x[1], reverse=True):
            percentage = (credit / first_journey.revenue) * 100
            print(f"  {channel.value:25s} ${credit:7.2f} ({percentage:5.1f}%)")
        print()
