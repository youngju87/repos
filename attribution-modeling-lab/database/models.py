"""
Data Models for Attribution Modeling
Defines the structure for user journeys, touchpoints, and conversions
"""

from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional
from enum import Enum


class Channel(Enum):
    """Marketing channels"""
    PAID_SEARCH_BRAND = "Paid Search - Brand"
    PAID_SEARCH_GENERIC = "Paid Search - Generic"
    DISPLAY = "Display Ads"
    SOCIAL_PAID = "Social - Paid"
    SOCIAL_ORGANIC = "Social - Organic"
    EMAIL = "Email"
    DIRECT = "Direct"
    ORGANIC_SEARCH = "Organic Search"
    REFERRAL = "Referral"
    AFFILIATE = "Affiliate"
    VIDEO = "Video Ads"
    RETARGETING = "Retargeting"


@dataclass
class Touchpoint:
    """A single marketing touchpoint in a customer journey"""
    touchpoint_id: str
    user_id: str
    timestamp: datetime
    channel: Channel
    campaign: str
    cost: float  # Cost of this interaction

    # Optional metadata
    device: str = "desktop"
    landing_page: str = ""
    utm_source: str = ""
    utm_medium: str = ""
    utm_campaign: str = ""
    utm_content: str = ""

    def __repr__(self):
        return f"Touchpoint({self.channel.value} at {self.timestamp})"


@dataclass
class Conversion:
    """A conversion event"""
    conversion_id: str
    user_id: str
    timestamp: datetime
    revenue: float
    conversion_type: str = "purchase"  # purchase, signup, lead, etc.

    def __repr__(self):
        return f"Conversion(${self.revenue} at {self.timestamp})"


@dataclass
class UserJourney:
    """Complete customer journey from first touch to conversion"""
    journey_id: str
    user_id: str
    touchpoints: List[Touchpoint]
    conversion: Optional[Conversion]

    # Computed properties
    @property
    def converted(self) -> bool:
        """Whether this journey resulted in a conversion"""
        return self.conversion is not None

    @property
    def touchpoint_count(self) -> int:
        """Number of touchpoints in journey"""
        return len(self.touchpoints)

    @property
    def total_cost(self) -> float:
        """Total marketing cost for this journey"""
        return sum(tp.cost for tp in self.touchpoints)

    @property
    def revenue(self) -> float:
        """Revenue from conversion (0 if no conversion)"""
        return self.conversion.revenue if self.conversion else 0.0

    @property
    def roi(self) -> float:
        """Return on investment"""
        if self.total_cost == 0:
            return 0.0
        return (self.revenue - self.total_cost) / self.total_cost

    @property
    def channels_in_journey(self) -> List[Channel]:
        """List of channels involved in journey"""
        return [tp.channel for tp in self.touchpoints]

    @property
    def unique_channels(self) -> List[Channel]:
        """Unique channels (no duplicates)"""
        return list(dict.fromkeys(self.channels_in_journey))

    @property
    def journey_duration_days(self) -> float:
        """Days from first touch to conversion"""
        if not self.touchpoints or not self.conversion:
            return 0.0

        first_touch = self.touchpoints[0].timestamp
        conversion_time = self.conversion.timestamp

        return (conversion_time - first_touch).total_seconds() / 86400

    @property
    def first_touch(self) -> Optional[Touchpoint]:
        """First touchpoint"""
        return self.touchpoints[0] if self.touchpoints else None

    @property
    def last_touch(self) -> Optional[Touchpoint]:
        """Last touchpoint before conversion"""
        return self.touchpoints[-1] if self.touchpoints else None

    @property
    def path_summary(self) -> str:
        """Summary of channel path (e.g., 'Display → Email → Paid Search')"""
        return " → ".join(tp.channel.value for tp in self.touchpoints)

    def get_touchpoints_by_channel(self, channel: Channel) -> List[Touchpoint]:
        """Get all touchpoints for a specific channel"""
        return [tp for tp in self.touchpoints if tp.channel == channel]

    def __repr__(self):
        status = "Converted" if self.converted else "No Conversion"
        return f"UserJourney({self.touchpoint_count} touchpoints, {status}, ${self.revenue})"


@dataclass
class AttributionResult:
    """Result of an attribution model for a single journey"""
    journey_id: str
    model_name: str
    channel_credits: dict  # {Channel: credit_amount}

    def __repr__(self):
        return f"AttributionResult({self.model_name}, {len(self.channel_credits)} channels)"


@dataclass
class ChannelPerformance:
    """Aggregated performance metrics for a channel under a specific model"""
    channel: Channel
    model_name: str

    # Attribution metrics
    attributed_revenue: float
    attributed_conversions: float

    # Cost metrics
    total_cost: float
    touchpoint_count: int

    # Computed metrics
    @property
    def roi(self) -> float:
        """Return on investment"""
        if self.total_cost == 0:
            return 0.0
        return (self.attributed_revenue - self.total_cost) / self.total_cost

    @property
    def roas(self) -> float:
        """Return on ad spend"""
        if self.total_cost == 0:
            return 0.0
        return self.attributed_revenue / self.total_cost

    @property
    def cpa(self) -> float:
        """Cost per acquisition"""
        if self.attributed_conversions == 0:
            return 0.0
        return self.total_cost / self.attributed_conversions

    @property
    def revenue_per_touchpoint(self) -> float:
        """Average revenue per touchpoint"""
        if self.touchpoint_count == 0:
            return 0.0
        return self.attributed_revenue / self.touchpoint_count

    def __repr__(self):
        return f"ChannelPerformance({self.channel.value}, {self.model_name}, ROAS: {self.roas:.2f}x)"


@dataclass
class ModelComparison:
    """Comparison of multiple attribution models"""
    journey_count: int
    total_revenue: float
    models: List[str]
    channel_performance: dict  # {model_name: {Channel: ChannelPerformance}}

    def get_channel_across_models(self, channel: Channel) -> dict:
        """Get performance for a channel across all models"""
        return {
            model: perf[channel]
            for model, perf in self.channel_performance.items()
            if channel in perf
        }

    def get_model_agreement_score(self) -> float:
        """
        Calculate how much models agree (0.0 = total disagreement, 1.0 = perfect agreement)
        Based on variance in attributed revenue across models
        """
        # Get all channels
        all_channels = set()
        for perf_dict in self.channel_performance.values():
            all_channels.update(perf_dict.keys())

        # Calculate coefficient of variation for each channel
        variances = []
        for channel in all_channels:
            revenues = [
                perf[channel].attributed_revenue
                for model, perf in self.channel_performance.items()
                if channel in perf
            ]

            if revenues and len(revenues) > 1:
                mean_revenue = sum(revenues) / len(revenues)
                if mean_revenue > 0:
                    variance = sum((r - mean_revenue) ** 2 for r in revenues) / len(revenues)
                    cv = (variance ** 0.5) / mean_revenue  # Coefficient of variation
                    variances.append(cv)

        # Agreement score: 1 - average CV (capped at 0)
        if variances:
            avg_cv = sum(variances) / len(variances)
            return max(0, 1 - avg_cv)

        return 1.0  # Perfect agreement if no variance

    def __repr__(self):
        return f"ModelComparison({len(self.models)} models, {self.journey_count} journeys, ${self.total_revenue:,.2f})"
