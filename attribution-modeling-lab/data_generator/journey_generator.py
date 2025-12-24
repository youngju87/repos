"""
User Journey Generator - Creates realistic multi-touch customer journeys
"""

import random
import uuid
from datetime import datetime, timedelta
from typing import List
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from database.models import Channel, Touchpoint, Conversion, UserJourney


class JourneyGenerator:
    """
    Generates realistic user journeys with multiple touchpoints
    """

    # Channel costs (average cost per touchpoint)
    CHANNEL_COSTS = {
        Channel.PAID_SEARCH_BRAND: 2.50,
        Channel.PAID_SEARCH_GENERIC: 4.00,
        Channel.DISPLAY: 0.50,
        Channel.SOCIAL_PAID: 1.20,
        Channel.SOCIAL_ORGANIC: 0.00,
        Channel.EMAIL: 0.10,
        Channel.DIRECT: 0.00,
        Channel.ORGANIC_SEARCH: 0.00,
        Channel.REFERRAL: 0.50,
        Channel.AFFILIATE: 3.00,
        Channel.VIDEO: 0.80,
        Channel.RETARGETING: 1.50,
    }

    # Typical journey patterns (channel sequences that commonly lead to conversion)
    COMMON_PATTERNS = [
        # Awareness → Research → Conversion
        [Channel.DISPLAY, Channel.ORGANIC_SEARCH, Channel.PAID_SEARCH_BRAND],
        [Channel.SOCIAL_PAID, Channel.EMAIL, Channel.DIRECT],
        [Channel.VIDEO, Channel.ORGANIC_SEARCH, Channel.PAID_SEARCH_GENERIC, Channel.PAID_SEARCH_BRAND],

        # Email nurture sequences
        [Channel.PAID_SEARCH_GENERIC, Channel.EMAIL, Channel.EMAIL, Channel.DIRECT],
        [Channel.DISPLAY, Channel.EMAIL, Channel.EMAIL, Channel.EMAIL, Channel.DIRECT],

        # Retargeting sequences
        [Channel.DISPLAY, Channel.ORGANIC_SEARCH, Channel.RETARGETING, Channel.PAID_SEARCH_BRAND],
        [Channel.SOCIAL_PAID, Channel.RETARGETING, Channel.RETARGETING, Channel.DIRECT],

        # Quick conversions
        [Channel.PAID_SEARCH_BRAND],
        [Channel.DIRECT],
        [Channel.ORGANIC_SEARCH, Channel.PAID_SEARCH_BRAND],

        # Long consideration
        [Channel.DISPLAY, Channel.SOCIAL_ORGANIC, Channel.ORGANIC_SEARCH,
         Channel.EMAIL, Channel.RETARGETING, Channel.PAID_SEARCH_BRAND],

        # Multi-channel awareness
        [Channel.VIDEO, Channel.DISPLAY, Channel.SOCIAL_PAID, Channel.ORGANIC_SEARCH, Channel.EMAIL, Channel.DIRECT],
    ]

    # Campaign names by channel
    CAMPAIGNS = {
        Channel.PAID_SEARCH_BRAND: ["Brand Campaign", "Brand - Exact Match", "Competitor Conquesting"],
        Channel.PAID_SEARCH_GENERIC: ["Category Keywords", "Product Keywords", "Generic Broad Match"],
        Channel.DISPLAY: ["Display - Prospecting", "Display - Retargeting", "GDN - Interest Targeting"],
        Channel.SOCIAL_PAID: ["Facebook Prospecting", "Instagram Story Ads", "LinkedIn B2B Campaign"],
        Channel.EMAIL: ["Welcome Series", "Newsletter", "Promotional Email", "Abandoned Cart"],
        Channel.VIDEO: ["YouTube Pre-Roll", "Video Discovery Ads", "YouTube Brand Campaign"],
        Channel.RETARGETING: ["Site Retargeting", "Cart Abandonment", "Post-Purchase Upsell"],
    }

    def __init__(self, seed: int = None):
        """
        Initialize generator

        Args:
            seed: Random seed for reproducibility
        """
        if seed:
            random.seed(seed)

        self.journeys_generated = 0

    def generate_journeys(
        self,
        num_journeys: int = 1000,
        conversion_rate: float = 0.15,
        avg_journey_length: int = 4,
        start_date: datetime = None
    ) -> List[UserJourney]:
        """
        Generate a set of user journeys

        Args:
            num_journeys: Number of journeys to generate
            conversion_rate: Percentage that convert (0.0 to 1.0)
            avg_journey_length: Average number of touchpoints
            start_date: Starting date for journeys (default: 90 days ago)

        Returns:
            List of UserJourney objects
        """
        if start_date is None:
            start_date = datetime.now() - timedelta(days=90)

        journeys = []
        num_conversions = int(num_journeys * conversion_rate)

        print(f"Generating {num_journeys:,} journeys...")
        print(f"  Target conversions: {num_conversions:,} ({conversion_rate*100:.1f}%)")
        print(f"  Avg journey length: {avg_journey_length} touchpoints")

        # Generate converting journeys
        for i in range(num_conversions):
            journey = self._generate_single_journey(
                user_id=f"user_{i+1}",
                start_date=start_date,
                avg_journey_length=avg_journey_length,
                should_convert=True
            )
            journeys.append(journey)

        # Generate non-converting journeys
        for i in range(num_conversions, num_journeys):
            journey = self._generate_single_journey(
                user_id=f"user_{i+1}",
                start_date=start_date,
                avg_journey_length=max(1, avg_journey_length - 2),  # Shorter journeys
                should_convert=False
            )
            journeys.append(journey)

        self.journeys_generated = len(journeys)

        print(f"✓ Generated {len(journeys):,} journeys")
        print(f"  Conversions: {sum(1 for j in journeys if j.converted):,}")
        print(f"  Total touchpoints: {sum(j.touchpoint_count for j in journeys):,}")

        return journeys

    def _generate_single_journey(
        self,
        user_id: str,
        start_date: datetime,
        avg_journey_length: int,
        should_convert: bool
    ) -> UserJourney:
        """Generate a single user journey"""

        journey_id = str(uuid.uuid4())

        # Determine journey pattern
        if random.random() < 0.6:
            # 60% use common patterns
            pattern = random.choice(self.COMMON_PATTERNS).copy()

            # Vary the length slightly
            length_variation = random.randint(-1, 2)
            if length_variation > 0:
                # Add random touches
                for _ in range(length_variation):
                    pattern.insert(
                        random.randint(1, len(pattern)),
                        random.choice(list(Channel))
                    )
            elif length_variation < 0 and len(pattern) > 1:
                # Remove some touches
                for _ in range(abs(length_variation)):
                    if len(pattern) > 1:
                        pattern.pop(random.randint(0, len(pattern)-1))

        else:
            # 40% random journeys
            journey_length = max(1, int(random.gauss(avg_journey_length, 2)))
            pattern = [random.choice(list(Channel)) for _ in range(journey_length)]

        # Generate touchpoints
        touchpoints = []
        current_time = start_date + timedelta(days=random.randint(0, 60))

        for i, channel in enumerate(pattern):
            touchpoint = self._generate_touchpoint(
                user_id=user_id,
                channel=channel,
                timestamp=current_time
            )
            touchpoints.append(touchpoint)

            # Time between touches (1 hour to 7 days)
            if i < len(pattern) - 1:
                hours_gap = random.choice([
                    random.randint(1, 24),      # Same day
                    random.randint(24, 72),     # 1-3 days
                    random.randint(72, 168),    # 3-7 days
                ])
                current_time += timedelta(hours=hours_gap)

        # Generate conversion if applicable
        conversion = None
        if should_convert:
            conversion_time = current_time + timedelta(hours=random.randint(1, 48))

            # Revenue varies by journey
            base_revenue = random.choice([49, 79, 99, 149, 199, 299, 499, 999])
            revenue = base_revenue + random.uniform(-10, 10)

            conversion = Conversion(
                conversion_id=str(uuid.uuid4()),
                user_id=user_id,
                timestamp=conversion_time,
                revenue=revenue,
                conversion_type="purchase"
            )

        journey = UserJourney(
            journey_id=journey_id,
            user_id=user_id,
            touchpoints=touchpoints,
            conversion=conversion
        )

        return journey

    def _generate_touchpoint(
        self,
        user_id: str,
        channel: Channel,
        timestamp: datetime
    ) -> Touchpoint:
        """Generate a single touchpoint"""

        # Get campaign name
        if channel in self.CAMPAIGNS:
            campaign = random.choice(self.CAMPAIGNS[channel])
        else:
            campaign = f"{channel.value} Campaign"

        # Get cost with some randomness
        base_cost = self.CHANNEL_COSTS.get(channel, 1.0)
        cost = max(0, base_cost + random.gauss(0, base_cost * 0.3))

        touchpoint = Touchpoint(
            touchpoint_id=str(uuid.uuid4()),
            user_id=user_id,
            timestamp=timestamp,
            channel=channel,
            campaign=campaign,
            cost=round(cost, 2),
            device=random.choice(["desktop", "mobile", "tablet"]),
            landing_page=f"/{random.choice(['home', 'products', 'category', 'search', 'special-offer'])}"
        )

        return touchpoint

    def generate_benchmark_dataset(self) -> List[UserJourney]:
        """
        Generate a benchmark dataset for testing attribution models

        Returns dataset with known patterns for validation
        """
        journeys = []

        # Pattern 1: Single-touch conversions (should be same across all models)
        for i in range(100):
            journey = UserJourney(
                journey_id=f"single_touch_{i}",
                user_id=f"user_single_{i}",
                touchpoints=[
                    Touchpoint(
                        touchpoint_id=str(uuid.uuid4()),
                        user_id=f"user_single_{i}",
                        timestamp=datetime.now() - timedelta(days=1),
                        channel=Channel.DIRECT,
                        campaign="Direct Traffic",
                        cost=0.0
                    )
                ],
                conversion=Conversion(
                    conversion_id=str(uuid.uuid4()),
                    user_id=f"user_single_{i}",
                    timestamp=datetime.now(),
                    revenue=100.0
                )
            )
            journeys.append(journey)

        # Pattern 2: Two-touch journeys (test position-based)
        for i in range(100):
            journey = UserJourney(
                journey_id=f"two_touch_{i}",
                user_id=f"user_two_{i}",
                touchpoints=[
                    Touchpoint(
                        touchpoint_id=str(uuid.uuid4()),
                        user_id=f"user_two_{i}",
                        timestamp=datetime.now() - timedelta(days=7),
                        channel=Channel.DISPLAY,
                        campaign="Display Awareness",
                        cost=1.0
                    ),
                    Touchpoint(
                        touchpoint_id=str(uuid.uuid4()),
                        user_id=f"user_two_{i}",
                        timestamp=datetime.now() - timedelta(days=1),
                        channel=Channel.PAID_SEARCH_BRAND,
                        campaign="Brand Search",
                        cost=3.0
                    )
                ],
                conversion=Conversion(
                    conversion_id=str(uuid.uuid4()),
                    user_id=f"user_two_{i}",
                    timestamp=datetime.now(),
                    revenue=200.0
                )
            )
            journeys.append(journey)

        # Pattern 3: Long journeys (test time-decay)
        for i in range(100):
            touchpoints = []
            for j in range(7):
                touchpoints.append(
                    Touchpoint(
                        touchpoint_id=str(uuid.uuid4()),
                        user_id=f"user_long_{i}",
                        timestamp=datetime.now() - timedelta(days=14-j*2),
                        channel=random.choice(list(Channel)),
                        campaign=f"Touch {j+1}",
                        cost=1.0
                    )
                )

            journey = UserJourney(
                journey_id=f"long_{i}",
                user_id=f"user_long_{i}",
                touchpoints=touchpoints,
                conversion=Conversion(
                    conversion_id=str(uuid.uuid4()),
                    user_id=f"user_long_{i}",
                    timestamp=datetime.now(),
                    revenue=300.0
                )
            )
            journeys.append(journey)

        print(f"✓ Generated benchmark dataset: {len(journeys)} journeys")

        return journeys


if __name__ == "__main__":
    # Test the generator
    generator = JourneyGenerator(seed=42)

    # Generate sample journeys
    journeys = generator.generate_journeys(
        num_journeys=100,
        conversion_rate=0.20,
        avg_journey_length=4
    )

    # Print some examples
    print("\n" + "="*60)
    print("Sample Journeys:")
    print("="*60)

    for i, journey in enumerate(journeys[:5]):
        print(f"\nJourney {i+1}:")
        print(f"  User: {journey.user_id}")
        print(f"  Path: {journey.path_summary}")
        print(f"  Touchpoints: {journey.touchpoint_count}")
        print(f"  Cost: ${journey.total_cost:.2f}")
        print(f"  Revenue: ${journey.revenue:.2f}")
        print(f"  Converted: {journey.converted}")
        if journey.converted:
            print(f"  Duration: {journey.journey_duration_days:.1f} days")
            print(f"  ROI: {journey.roi*100:.1f}%")
