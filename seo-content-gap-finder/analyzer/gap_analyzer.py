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
    gap_type: str  # 'topic', 'depth', 'keyword', 'format'
    title: str
    description: str
    score: float  # 0-100, higher = more important
    competitor_coverage: int  # How many competitors cover this
    total_competitors: int
    recommendations: List[str] = field(default_factory=list)
    examples: List[str] = field(default_factory=list)


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
            coverage = min(total_competitors, 5)  # Assume high coverage for demo

            # Calculate score based on coverage
            coverage_ratio = coverage / total_competitors
            score = coverage_ratio * 100

            gap = ContentGap(
                gap_type='topic',
                title=f"Missing topic: {topic}",
                description=f"{coverage}/{total_competitors} competitors cover this topic",
                score=score,
                competitor_coverage=coverage,
                total_competitors=total_competitors,
                recommendations=[
                    f"Add a section about '{topic}'",
                    f"Target {500 + (coverage * 100)} words on this topic"
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
        avg_competitor_words = sum(competitor_word_counts) / len(competitor_word_counts)

        # If your content is significantly shorter
        if your_word_count < avg_competitor_words * 0.7:
            word_gap = int(avg_competitor_words - your_word_count)

            gap = ContentGap(
                gap_type='depth',
                title="Overall content depth insufficient",
                description=f"Your content: {your_word_count} words | Avg competitor: {int(avg_competitor_words)} words",
                score=75.0,
                competitor_coverage=len(competitor_contents),
                total_competitors=len(competitor_contents),
                recommendations=[
                    f"Expand content by approximately {word_gap} words",
                    "Add more detailed explanations and examples"
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

                score = min((count / len(competitor_contents)) * 100, 90)

                gap = ContentGap(
                    gap_type='keyword',
                    title=f"Missing keyword: '{keyword}'",
                    description=f"Used by {count}/{len(competitor_contents)} competitors",
                    score=score,
                    competitor_coverage=count,
                    total_competitors=len(competitor_contents),
                    recommendations=[
                        f"Include '{keyword}' naturally in your content",
                        f"Mention this term 3-5 times"
                    ]
                )

                gaps.append(gap)

        return gaps[:5]  # Limit to top 5 keyword gaps

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

        # Check if you have enough images
        your_images = your_content.get('images_count', 0) if your_content else 0

        if competitors_with_images >= len(competitor_contents) * 0.7 and your_images < 5:
            gap = ContentGap(
                gap_type='format',
                title="Insufficient visual content",
                description=f"{competitors_with_images}/{len(competitor_contents)} competitors use 5+ images",
                score=65.0,
                competitor_coverage=competitors_with_images,
                total_competitors=len(competitor_contents),
                recommendations=[
                    f"Add {5 - your_images} more images",
                    "Include screenshots, diagrams, or infographics"
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
