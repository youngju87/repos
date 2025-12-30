"""
Business Impact Calculator - Converts technical issues into business costs and ROI
"""

from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class BusinessImpactCalculator:
    """
    Calculates the business impact and ROI of analytics issues

    Helps translate technical findings into business language that
    decision-makers understand.
    """

    # Industry benchmarks (based on research)
    INDUSTRY_BENCHMARKS = {
        'overall_score': {
            'average': 72,
            'top_10_percent': 90,
            'top_25_percent': 82
        },
        'ga4_coverage': {
            'average': 85,
            'top_10_percent': 98,
            'top_25_percent': 92
        },
        'gtm_coverage': {
            'average': 92,
            'top_10_percent': 100,
            'top_25_percent': 98
        },
        'consent_coverage': {
            'average': 78,
            'top_10_percent': 100,
            'top_25_percent': 95
        }
    }

    # Effort estimates (in hours)
    EFFORT_ESTIMATES = {
        'critical': {
            'ga4_missing': 0.5,  # Per page
            'consent_missing': 4.0,  # Global fix
            'datalayer_order': 1.0,  # Per page
            'privacy_violation': 6.0
        },
        'warning': {
            'duplicate_tags': 1.0,
            'slow_performance': 2.0,
            'incomplete_implementation': 1.5
        },
        'info': {
            'privacy_policy_link': 0.25,
            'ua_migration': 0.5
        }
    }

    def __init__(self, hourly_rate: float = 150.0):
        """
        Initialize calculator

        Args:
            hourly_rate: Consulting/developer hourly rate for cost estimates
        """
        self.hourly_rate = hourly_rate

    def calculate_financial_impact(self, audit_summary: Dict,
                                   monthly_traffic: int = None,
                                   avg_order_value: float = None,
                                   conversion_rate: float = None) -> Dict:
        """
        Calculate the financial impact of audit findings

        Args:
            audit_summary: Audit results from AuditAnalyzer
            monthly_traffic: Site monthly traffic (if known)
            avg_order_value: Average order value (if ecommerce)
            conversion_rate: Site conversion rate as decimal (e.g., 0.02 = 2%)

        Returns:
            Dictionary with financial impact calculations
        """

        # Use estimates if actual data not provided
        monthly_traffic = monthly_traffic or 10000
        avg_order_value = avg_order_value or 100.0
        conversion_rate = conversion_rate or 0.02

        impact = {
            'monthly_traffic': monthly_traffic,
            'avg_order_value': avg_order_value,
            'conversion_rate': conversion_rate,
            'currency': 'USD'
        }

        # Calculate lost revenue from missing tracking
        ga4_coverage = audit_summary['tag_coverage']['ga4']
        if ga4_coverage < 90:
            missing_percentage = (100 - ga4_coverage) / 100
            # Assume 15% of decisions are impacted by missing data
            impact['lost_revenue_missing_tracking'] = (
                monthly_traffic * missing_percentage * 0.15 *
                conversion_rate * avg_order_value * 12  # Annual
            )
        else:
            impact['lost_revenue_missing_tracking'] = 0

        # Calculate impact from slow performance
        # Each 100ms delay = ~1% conversion loss (industry research)
        critical_perf_issues = len([
            i for i in audit_summary['issues']
            if i['category'] == 'performance' and i['severity'] == 'critical'
        ])
        if critical_perf_issues > 0:
            # Assume each critical perf issue adds ~200ms
            conversion_loss_pct = critical_perf_issues * 0.02
            impact['lost_revenue_performance'] = (
                monthly_traffic * conversion_loss_pct *
                conversion_rate * avg_order_value * 12  # Annual
            )
        else:
            impact['lost_revenue_performance'] = 0

        # Calculate GDPR fine risk
        consent_coverage = audit_summary['tag_coverage']['consent']
        if consent_coverage < 50:
            impact['gdpr_fine_risk'] = 'HIGH'
            impact['gdpr_fine_amount'] = 'Up to €20M or 4% annual revenue'
        elif consent_coverage < 80:
            impact['gdpr_fine_risk'] = 'MEDIUM'
            impact['gdpr_fine_amount'] = 'Up to €10M or 2% annual revenue'
        else:
            impact['gdpr_fine_risk'] = 'LOW'
            impact['gdpr_fine_amount'] = 'Minimal'

        # Total annual loss
        impact['total_annual_loss'] = (
            impact['lost_revenue_missing_tracking'] +
            impact['lost_revenue_performance']
        )

        return impact

    def calculate_fix_cost(self, audit_summary: Dict) -> Dict:
        """
        Estimate the cost and time to fix identified issues

        Args:
            audit_summary: Audit results from AuditAnalyzer

        Returns:
            Dictionary with cost and time estimates
        """

        total_hours = 0
        issue_breakdown = []

        # Group issues by severity and type
        for issue in audit_summary['issues']:
            severity = issue['severity']
            category = issue['category']

            # Estimate hours based on issue type
            hours = self._estimate_issue_hours(issue)
            cost = hours * self.hourly_rate

            total_hours += hours
            issue_breakdown.append({
                'severity': severity,
                'category': category,
                'title': issue['title'],
                'hours': hours,
                'cost': cost
            })

        return {
            'total_hours': round(total_hours, 1),
            'total_cost': round(total_hours * self.hourly_rate, 2),
            'hourly_rate': self.hourly_rate,
            'timeline_weeks': self._estimate_timeline(total_hours),
            'issue_breakdown': issue_breakdown
        }

    def calculate_roi(self, financial_impact: Dict, fix_cost: Dict) -> Dict:
        """
        Calculate ROI of fixing the issues

        Args:
            financial_impact: Output from calculate_financial_impact()
            fix_cost: Output from calculate_fix_cost()

        Returns:
            ROI calculations
        """

        annual_benefit = financial_impact['total_annual_loss']
        investment = fix_cost['total_cost']

        if investment == 0:
            roi_multiple = 0
            payback_days = 0
        else:
            roi_multiple = annual_benefit / investment
            payback_days = (investment / annual_benefit) * 365 if annual_benefit > 0 else 999

        return {
            'investment': investment,
            'annual_benefit': annual_benefit,
            'roi_multiple': round(roi_multiple, 1),
            'roi_percentage': round((roi_multiple - 1) * 100, 1),
            'payback_days': round(payback_days, 0)
        }

    def get_benchmark_comparison(self, audit_summary: Dict) -> Dict:
        """
        Compare audit scores against industry benchmarks

        Args:
            audit_summary: Audit results from AuditAnalyzer

        Returns:
            Benchmark comparison data
        """

        comparisons = {}

        # Overall score
        overall = audit_summary['overall_score']
        comparisons['overall_score'] = {
            'your_score': overall,
            'industry_average': self.INDUSTRY_BENCHMARKS['overall_score']['average'],
            'top_25_percent': self.INDUSTRY_BENCHMARKS['overall_score']['top_25_percent'],
            'top_10_percent': self.INDUSTRY_BENCHMARKS['overall_score']['top_10_percent'],
            'gap_to_average': overall - self.INDUSTRY_BENCHMARKS['overall_score']['average'],
            'percentile': self._calculate_percentile(overall, 'overall_score')
        }

        # GA4 coverage
        ga4 = audit_summary['tag_coverage']['ga4']
        comparisons['ga4_coverage'] = {
            'your_coverage': ga4,
            'industry_average': self.INDUSTRY_BENCHMARKS['ga4_coverage']['average'],
            'top_25_percent': self.INDUSTRY_BENCHMARKS['ga4_coverage']['top_25_percent'],
            'top_10_percent': self.INDUSTRY_BENCHMARKS['ga4_coverage']['top_10_percent'],
            'gap_to_average': ga4 - self.INDUSTRY_BENCHMARKS['ga4_coverage']['average']
        }

        # GTM coverage
        gtm = audit_summary['tag_coverage']['gtm']
        comparisons['gtm_coverage'] = {
            'your_coverage': gtm,
            'industry_average': self.INDUSTRY_BENCHMARKS['gtm_coverage']['average'],
            'top_25_percent': self.INDUSTRY_BENCHMARKS['gtm_coverage']['top_25_percent'],
            'top_10_percent': self.INDUSTRY_BENCHMARKS['gtm_coverage']['top_10_percent'],
            'gap_to_average': gtm - self.INDUSTRY_BENCHMARKS['gtm_coverage']['average']
        }

        # Consent coverage
        consent = audit_summary['tag_coverage']['consent']
        comparisons['consent_coverage'] = {
            'your_coverage': consent,
            'industry_average': self.INDUSTRY_BENCHMARKS['consent_coverage']['average'],
            'top_25_percent': self.INDUSTRY_BENCHMARKS['consent_coverage']['top_25_percent'],
            'top_10_percent': self.INDUSTRY_BENCHMARKS['consent_coverage']['top_10_percent'],
            'gap_to_average': consent - self.INDUSTRY_BENCHMARKS['consent_coverage']['average']
        }

        return comparisons

    def prioritize_issues(self, audit_summary: Dict) -> List[Dict]:
        """
        Prioritize issues by impact and effort (create priority matrix)

        Args:
            audit_summary: Audit results from AuditAnalyzer

        Returns:
            List of issues sorted by priority with effort/impact ratings
        """

        prioritized = []

        for issue in audit_summary['issues']:
            effort = self._estimate_issue_hours(issue)
            impact = self._estimate_issue_impact(issue)

            # Calculate priority score (higher = more urgent)
            # High impact, low effort = highest priority
            if effort == 0:
                priority_score = 0
            else:
                priority_score = impact / effort

            prioritized.append({
                **issue,
                'effort_hours': effort,
                'effort_category': self._categorize_effort(effort),
                'impact_score': impact,
                'impact_category': self._categorize_impact(impact),
                'priority_score': priority_score,
                'priority_category': self._categorize_priority(priority_score)
            })

        # Sort by priority score (descending)
        prioritized.sort(key=lambda x: x['priority_score'], reverse=True)

        return prioritized

    def _estimate_issue_hours(self, issue: Dict) -> float:
        """Estimate hours to fix an issue"""

        severity = issue['severity']
        title = issue['title'].lower()

        # Pattern matching for common issues
        if 'ga4' in title and 'missing' in title:
            affected_count = len(issue.get('affected_urls', []))
            return max(affected_count * 0.5, 0.5)
        elif 'consent' in title:
            return 4.0
        elif 'datalayer' in title:
            return 1.0
        elif 'duplicate' in title:
            return 1.0
        elif 'performance' in title or 'script' in title:
            return 2.0

        # Default estimates by severity
        defaults = {'critical': 2.0, 'warning': 1.0, 'info': 0.5}
        return defaults.get(severity, 1.0)

    def _estimate_issue_impact(self, issue: Dict) -> float:
        """Estimate business impact score (0-100)"""

        severity = issue['severity']
        category = issue['category']

        # Base impact by severity
        base_impact = {'critical': 100, 'warning': 50, 'info': 20}
        impact = base_impact.get(severity, 30)

        # Multiply by category importance
        category_multipliers = {
            'privacy': 1.5,  # Legal risk
            'implementation': 1.3,  # Revenue impact
            'performance': 1.2,  # Conversion impact
            'seo': 1.0
        }

        multiplier = category_multipliers.get(category, 1.0)
        return impact * multiplier

    def _categorize_effort(self, hours: float) -> str:
        """Categorize effort into buckets"""
        if hours < 1:
            return 'Quick Win (< 1 hour)'
        elif hours < 4:
            return 'Medium (1-4 hours)'
        else:
            return 'Large (4+ hours)'

    def _categorize_impact(self, impact_score: float) -> str:
        """Categorize impact into buckets"""
        if impact_score >= 100:
            return 'Critical Impact'
        elif impact_score >= 60:
            return 'High Impact'
        elif impact_score >= 30:
            return 'Medium Impact'
        else:
            return 'Low Impact'

    def _categorize_priority(self, priority_score: float) -> str:
        """Categorize priority"""
        if priority_score >= 50:
            return 'DO FIRST (High Impact, Quick Win)'
        elif priority_score >= 20:
            return 'DO NEXT (High Impact, More Effort)'
        elif priority_score >= 10:
            return 'PLAN FOR (Medium Priority)'
        else:
            return 'DO LATER (Low Priority)'

    def _estimate_timeline(self, total_hours: float) -> str:
        """Estimate timeline in weeks"""
        # Assume 20 hours/week of work
        weeks = total_hours / 20

        if weeks < 1:
            return '1 week'
        elif weeks < 2:
            return '1-2 weeks'
        elif weeks < 4:
            return '2-4 weeks'
        elif weeks < 8:
            return '1-2 months'
        else:
            return f'{int(weeks/4)} months'

    def _calculate_percentile(self, score: float, metric: str) -> int:
        """Calculate percentile ranking"""
        benchmarks = self.INDUSTRY_BENCHMARKS.get(metric, {})

        if score >= benchmarks.get('top_10_percent', 90):
            return 90
        elif score >= benchmarks.get('top_25_percent', 80):
            return 75
        elif score >= benchmarks.get('average', 70):
            return 50
        elif score >= 50:
            return 25
        else:
            return 10
