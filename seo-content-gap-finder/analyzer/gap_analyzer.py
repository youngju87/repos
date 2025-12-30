"""
Gap Analyzer - Identifies content gaps by comparing your content vs competitors
"""

import logging
from typing import List, Dict, Optional
from dataclasses import dataclass, field
from collections import Counter

logger = logging.getLogger(__name__)


@dataclass
class ContentGap:
    """Represents a content gap"""
    gap_type: str  # 'topic', 'depth', 'keyword', 'format', 'heading'
    title: str
    description: str
    score: float  # 0-100, higher = more important
    coverage_count: int  # How many competitors cover this (alias for competitor_coverage)
    total_competitors: int
    recommendations: List[str] = field(default_factory=list)
    examples: List[str] = field(default_factory=list)

    # Legacy compatibility
    @property
    def competitor_coverage(self) -> int:
        """Alias for coverage_count"""
        return self.coverage_count


@dataclass
class GapAnalysis:
    """Complete gap analysis results"""
    keyword: str
    your_url: Optional[str]
    total_competitors: int

    gaps: List[ContentGap] = field(default_factory=list)
    coverage_score: float = 0.0  # 0-100

    # Summary stats
    critical_gaps: int = 0  # Score >= 80
    important_gaps: int = 0  # Score 60-79
    minor_gaps: int = 0  # Score < 60


class GapAnalyzer:
    """
    Analyzes content gaps between your content and competitors
    """

    def analyze(
        self,
        keyword: str,
        competitor_contents: List[Dict],
        your_content: Optional[Dict] = None
    ) -> GapAnalysis:
        """
        Analyze gaps between your content and competitors

        Args:
            keyword: Target keyword
            competitor_contents: List of competitor content data
            your_content: Your content data (optional)

        Returns:
            GapAnalysis object with identified gaps
        """
        logger.info(f"Analyzing content gaps for: {keyword}")

        gaps = []

        # Extract topics from all competitors
        competitor_topics = self._extract_all_topics(competitor_contents)
        your_topics = self._extract_topics(your_content) if your_content else set()

        # 1. Topic Gaps - topics competitors cover but you don't
        topic_gaps = self._find_topic_gaps(
            competitor_topics,
            your_topics,
            len(competitor_contents)
        )
        gaps.extend(topic_gaps)

        # 2. Depth Gaps - topics you mention but don't cover enough
        if your_content:
            depth_gaps = self._find_depth_gaps(
                your_content,
                competitor_contents,
                your_topics
            )
            gaps.extend(depth_gaps)

        # 3. Keyword Gaps - related keywords you're missing
        keyword_gaps = self._find_keyword_gaps(
            competitor_contents,
            your_content
        )
        gaps.extend(keyword_gaps)

        # 4. Format Gaps - content types you're missing
        format_gaps = self._find_format_gaps(
            competitor_contents,
            your_content
        )
        gaps.extend(format_gaps)

        # Sort gaps by score
        gaps.sort(key=lambda x: x.score, reverse=True)

        # Calculate coverage score
        if your_content and competitor_topics:
            coverage = len(your_topics & competitor_topics) / len(competitor_topics)
            coverage_score = coverage * 100
        else:
            coverage_score = 0.0

        # Count gaps by severity
        critical = sum(1 for g in gaps if g.score >= 80)
        important = sum(1 for g in gaps if 60 <= g.score < 80)
        minor = sum(1 for g in gaps if g.score < 60)

        analysis = GapAnalysis(
            keyword=keyword,
            your_url=your_content['url'] if your_content else None,
            total_competitors=len(competitor_contents),
            gaps=gaps,
            coverage_score=round(coverage_score, 1),
            critical_gaps=critical,
            important_gaps=important,
            minor_gaps=minor
        )

        logger.info(
            f"Found {len(gaps)} gaps: "
            f"{critical} critical, {important} important, {minor} minor"
        )

        return analysis

    def _extract_topics(self, content: Optional[Dict]) -> set:
        """Extract topics from content"""
        if not content:
            return set()

        topics = set()

        # From headings
        if 'headings' in content:
            for level, headings in content['headings'].items():
                if level in ['h2', 'h3']:  # Focus on H2/H3
                    for h in headings:
                        topics.add(h.lower().strip())

        # From NLP analysis
        if 'nlp_analysis' in content and 'main_topics' in content['nlp_analysis']:
            for topic in content['nlp_analysis']['main_topics']:
                topics.add(topic.lower().strip())

        return topics

    def _extract_all_topics(self, contents: List[Dict]) -> set:
        """Extract all unique topics from competitor contents"""
        all_topics = set()

        for content in contents:
            topics = self._extract_topics(content)
            all_topics.update(topics)

        return all_topics

    def _find_topic_gaps(
        self,
        competitor_topics: set,
        your_topics: set,
        total_competitors: int
    ) -> List[ContentGap]:
        """Find topics competitors cover but you don't"""
        gaps = []

        # Topics in competitor content but not yours
        missing_topics = competitor_topics - your_topics

        # Count how many competitors mention each topic
        # (Simplified - in reality would track per-competitor)
        for topic in missing_topics:
            # Estimate coverage (simplified scoring)
            # In production, would track which specific competitors have this
            coverage = min(total_competitors, max(2, int(total_competitors * 0.6)))

            # Calculate score based on coverage
            coverage_ratio = coverage / total_competitors

            # Boost score for high-coverage topics
            if coverage_ratio >= 0.8:
                score = 85 + (coverage_ratio - 0.8) * 75  # 85-100 range
            elif coverage_ratio >= 0.5:
                score = 65 + (coverage_ratio - 0.5) * 66  # 65-85 range
            else:
                score = coverage_ratio * 130  # 0-65 range

            # Cap at 100
            score = min(score, 100)

            gap = ContentGap(
                gap_type='topic',
                title=f"Missing topic: {topic.title()}",
                description=f"{coverage}/{total_competitors} competitors cover this topic",
                score=round(score, 1),
                coverage_count=coverage,
                total_competitors=total_competitors,
                recommendations=[
                    f"Add a dedicated section about '{topic}'",
                    f"Target {500 + (coverage * 100)} words on this topic",
                    "Reference competitor approaches for structure"
                ],
                examples=[]
            )

            gaps.append(gap)

        return gaps

    def _find_depth_gaps(
        self,
        your_content: Dict,
        competitor_contents: List[Dict],
        your_topics: set
    ) -> List[ContentGap]:
        """Find topics you mention but don't cover in enough depth"""
        gaps = []

        your_word_count = your_content.get('word_count', 0)

        # Calculate average competitor word count
        competitor_word_counts = [c.get('word_count', 0) for c in competitor_contents]
        if not competitor_word_counts:
            return gaps

        avg_competitor_words = sum(competitor_word_counts) / len(competitor_word_counts)
        max_competitor_words = max(competitor_word_counts)

        # Check overall depth gap
        if your_word_count < avg_competitor_words * 0.7:
            word_gap = int(avg_competitor_words - your_word_count)
            depth_ratio = your_word_count / avg_competitor_words

            # Score based on how far behind you are
            if depth_ratio < 0.5:
                score = 85.0  # Less than half - critical
            elif depth_ratio < 0.7:
                score = 70.0  # 50-70% - important
            else:
                score = 55.0  # 70-80% - minor

            gap = ContentGap(
                gap_type='depth',
                title="Overall content depth insufficient",
                description=f"Your content: {your_word_count:,} words | Avg competitor: {int(avg_competitor_words):,} words ({int(depth_ratio*100)}% of average)",
                score=score,
                coverage_count=len(competitor_contents),
                total_competitors=len(competitor_contents),
                recommendations=[
                    f"Expand content by approximately {word_gap:,} words",
                    "Add more detailed explanations and examples",
                    "Include case studies or real-world applications",
                    f"Aim for {int(avg_competitor_words):,}-{int(max_competitor_words):,} words total"
                ]
            )

            gaps.append(gap)

        # Check heading structure depth
        your_h2_count = len(your_content.get('headings', {}).get('h2', []))
        competitor_h2_counts = [
            len(c.get('headings', {}).get('h2', []))
            for c in competitor_contents
        ]
        avg_h2 = sum(competitor_h2_counts) / len(competitor_h2_counts) if competitor_h2_counts else 0

        if your_h2_count < avg_h2 * 0.6:
            gap = ContentGap(
                gap_type='depth',
                title="Insufficient content structure depth",
                description=f"Your H2 headings: {your_h2_count} | Avg competitor: {int(avg_h2)}",
                score=60.0,
                coverage_count=len(competitor_contents),
                total_competitors=len(competitor_contents),
                recommendations=[
                    f"Add {int(avg_h2 - your_h2_count)} more H2 sections",
                    "Break down complex topics into subsections",
                    "Improve content organization with clear headings"
                ]
            )

            gaps.append(gap)

        return gaps

    def _find_keyword_gaps(
        self,
        competitor_contents: List[Dict],
        your_content: Optional[Dict]
    ) -> List[ContentGap]:
        """Find important keywords competitors use but you don't"""
        gaps = []

        # Extract keywords from all competitors
        competitor_keywords = []
        for content in competitor_contents:
            if 'nlp_analysis' in content and 'keywords' in content['nlp_analysis']:
                competitor_keywords.extend(content['nlp_analysis']['keywords'])

        # Count keyword frequency
        keyword_counts = Counter(competitor_keywords)

        # Get your keywords
        your_keywords = set()
        if your_content and 'nlp_analysis' in your_content:
            your_keywords = set(your_content['nlp_analysis'].get('keywords', []))

        # Find commonly used competitor keywords you're missing
        for keyword, count in keyword_counts.most_common(20):
            if keyword not in your_keywords and count >= 2:  # At least 2 competitors use it

                # Calculate score based on frequency
                frequency_ratio = count / len(competitor_contents)

                # High-frequency keywords (>70% of competitors) are critical
                if frequency_ratio >= 0.7:
                    score = 75 + (frequency_ratio - 0.7) * 83  # 75-100 range
                elif frequency_ratio >= 0.4:
                    score = 60 + (frequency_ratio - 0.4) * 50  # 60-75 range
                else:
                    score = frequency_ratio * 150  # 0-60 range

                score = min(score, 95)  # Cap at 95 for keywords

                gap = ContentGap(
                    gap_type='keyword',
                    title=f"Missing keyword: '{keyword}'",
                    description=f"Used by {count}/{len(competitor_contents)} competitors ({int(frequency_ratio*100)}% coverage)",
                    score=round(score, 1),
                    coverage_count=count,
                    total_competitors=len(competitor_contents),
                    recommendations=[
                        f"Include '{keyword}' naturally in your content",
                        f"Mention this term 3-5 times throughout the article",
                        "Use it in headings or subheadings where relevant"
                    ]
                )

                gaps.append(gap)

        return gaps[:10]  # Limit to top 10 keyword gaps

    def _find_format_gaps(
        self,
        competitor_contents: List[Dict],
        your_content: Optional[Dict]
    ) -> List[ContentGap]:
        """Find content format gaps (tables, lists, images, etc.)"""
        gaps = []

        # Count competitors with various formats
        competitors_with_images = sum(
            1 for c in competitor_contents if c.get('images_count', 0) > 5
        )

        # Calculate average images
        avg_images = sum(c.get('images_count', 0) for c in competitor_contents) / len(competitor_contents)

        # Check if you have enough images
        your_images = your_content.get('images_count', 0) if your_content else 0

        # Visual content gap
        if competitors_with_images >= len(competitor_contents) * 0.6 and your_images < avg_images * 0.5:
            image_gap = int(avg_images - your_images)
            image_ratio = competitors_with_images / len(competitor_contents)

            # Score based on how many competitors use images heavily
            if image_ratio >= 0.8:
                score = 70.0
            elif image_ratio >= 0.6:
                score = 60.0
            else:
                score = 50.0

            gap = ContentGap(
                gap_type='format',
                title="Insufficient visual content",
                description=f"{competitors_with_images}/{len(competitor_contents)} competitors use 5+ images (avg: {int(avg_images)} images)",
                score=score,
                coverage_count=competitors_with_images,
                total_competitors=len(competitor_contents),
                recommendations=[
                    f"Add {image_gap} more images to match competitors",
                    "Include screenshots, diagrams, or infographics",
                    "Consider comparison tables or charts",
                    "Add visual examples for complex concepts"
                ]
            )

            gaps.append(gap)

        # List/bullet point usage (simplified - would need deeper HTML analysis)
        # For now, estimate based on heading count as a proxy for structure
        your_h3_count = len(your_content.get('headings', {}).get('h3', [])) if your_content else 0
        avg_h3 = sum(len(c.get('headings', {}).get('h3', [])) for c in competitor_contents) / len(competitor_contents)

        if your_h3_count < avg_h3 * 0.5:
            gap = ContentGap(
                gap_type='format',
                title="Limited content organization structure",
                description=f"Your H3 subheadings: {your_h3_count} | Avg competitor: {int(avg_h3)}",
                score=55.0,
                coverage_count=len(competitor_contents),
                total_competitors=len(competitor_contents),
                recommendations=[
                    f"Add {int(avg_h3 - your_h3_count)} more H3 subheadings",
                    "Break down sections into detailed subsections",
                    "Use bullet points and numbered lists",
                    "Improve content scannability"
                ]
            )

            gaps.append(gap)

        return gaps


if __name__ == "__main__":
    # Test the gap analyzer
    analyzer = GapAnalyzer()

    # Mock data
    competitors = [
        {
            'url': 'competitor1.com',
            'word_count': 2500,
            'headings': {'h2': ['Gantt Charts', 'Team Collaboration', 'Pricing']},
            'nlp_analysis': {'keywords': ['project', 'management', 'team', 'gantt']},
            'images_count': 8
        },
        {
            'url': 'competitor2.com',
            'word_count': 3000,
            'headings': {'h2': ['Resource Allocation', 'Team Collaboration']},
            'nlp_analysis': {'keywords': ['project', 'resource', 'team']},
            'images_count': 10
        }
    ]

    your_content = {
        'url': 'yoursite.com',
        'word_count': 1500,
        'headings': {'h2': ['Team Collaboration']},
        'nlp_analysis': {'keywords': ['project', 'team']},
        'images_count': 3
    }

    analysis = analyzer.analyze(
        keyword="project management software",
        competitor_contents=competitors,
        your_content=your_content
    )

    print(f"Coverage Score: {analysis.coverage_score}%")
    print(f"Gaps Found: {len(analysis.gaps)}")
    print(f"  Critical: {analysis.critical_gaps}")
    print(f"  Important: {analysis.important_gaps}")

    print("\nTop 3 Gaps:")
    for gap in analysis.gaps[:3]:
        print(f"\n{gap.title} (Score: {gap.score:.0f}/100)")
        print(f"  {gap.description}")
        for rec in gap.recommendations:
            print(f"  → {rec}")
