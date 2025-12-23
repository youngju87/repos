"""
NLP Analyzer - Extracts topics, entities, and semantic meaning from content
Uses spaCy for NLP and basic topic modeling
"""

import logging
from typing import List, Dict, Set
from dataclasses import dataclass, field
from collections import Counter
import re

logger = logging.getLogger(__name__)

# Try to import spaCy (optional dependency for now)
try:
    import spacy
    SPACY_AVAILABLE = True
    try:
        nlp = spacy.load("en_core_web_lg")
    except OSError:
        logger.warning("spaCy model not found. Run: python -m spacy download en_core_web_lg")
        SPACY_AVAILABLE = False
        nlp = None
except ImportError:
    logger.warning("spaCy not installed. NLP features will be limited.")
    SPACY_AVAILABLE = False
    nlp = None


@dataclass
class TopicAnalysis:
    """NLP analysis results for content"""
    url: str

    # Entities
    entities: Dict[str, List[str]] = field(default_factory=dict)
    entity_count: int = 0

    # Topics/Keywords
    keywords: List[str] = field(default_factory=list)
    noun_phrases: List[str] = field(default_factory=list)

    # Semantic topics
    main_topics: List[str] = field(default_factory=list)

    # Metrics
    unique_words: int = 0
    lexical_diversity: float = 0.0


class NLPAnalyzer:
    """
    Analyzes content using NLP to extract topics and entities
    """

    def __init__(self, use_spacy: bool = True):
        self.use_spacy = use_spacy and SPACY_AVAILABLE
        if not self.use_spacy:
            logger.info("Using basic NLP (spaCy not available)")

    def analyze(self, text: str, url: str = "") -> TopicAnalysis:
        """
        Analyze text to extract topics and entities

        Args:
            text: Text content to analyze
            url: Source URL (for reference)

        Returns:
            TopicAnalysis object
        """
        if self.use_spacy and nlp:
            return self._analyze_with_spacy(text, url)
        else:
            return self._analyze_basic(text, url)

    def _analyze_with_spacy(self, text: str, url: str) -> TopicAnalysis:
        """Analyze using spaCy"""
        # Process text with spaCy
        doc = nlp(text[:1000000])  # Limit text length

        # Extract entities by type
        entities = {}
        for ent in doc.ents:
            entity_type = ent.label_
            entity_text = ent.text

            if entity_type not in entities:
                entities[entity_type] = []

            entities[entity_type].append(entity_text)

        # Extract noun phrases
        noun_phrases = [chunk.text for chunk in doc.noun_chunks]

        # Extract keywords (nouns and proper nouns)
        keywords = []
        for token in doc:
            if token.pos_ in ['NOUN', 'PROPN'] and not token.is_stop:
                keywords.append(token.lemma_.lower())

        # Count most common keywords
        keyword_counts = Counter(keywords)
        top_keywords = [word for word, count in keyword_counts.most_common(20)]

        # Extract main topics (most common noun phrases)
        np_counts = Counter(noun_phrases)
        main_topics = [phrase for phrase, count in np_counts.most_common(10)]

        # Calculate lexical diversity
        words = [token.text.lower() for token in doc if token.is_alpha]
        unique_words = len(set(words))
        total_words = len(words)
        lexical_diversity = unique_words / total_words if total_words > 0 else 0

        return TopicAnalysis(
            url=url,
            entities=entities,
            entity_count=len(doc.ents),
            keywords=top_keywords,
            noun_phrases=list(set(noun_phrases))[:50],  # Limit to 50
            main_topics=main_topics,
            unique_words=unique_words,
            lexical_diversity=round(lexical_diversity, 3)
        )

    def _analyze_basic(self, text: str, url: str) -> TopicAnalysis:
        """Basic analysis without spaCy"""
        # Simple word extraction
        words = re.findall(r'\b[a-z]{3,}\b', text.lower())

        # Remove common stop words
        stop_words = {
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
            'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
            'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
            'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
            'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me'
        }

        filtered_words = [w for w in words if w not in stop_words]

        # Count word frequency
        word_counts = Counter(filtered_words)
        keywords = [word for word, count in word_counts.most_common(20)]

        # Extract simple "topics" (2-3 word sequences)
        bigrams = []
        for i in range(len(words) - 1):
            if words[i] not in stop_words and words[i+1] not in stop_words:
                bigrams.append(f"{words[i]} {words[i+1]}")

        bigram_counts = Counter(bigrams)
        main_topics = [phrase for phrase, count in bigram_counts.most_common(10)]

        unique_words = len(set(filtered_words))
        total_words = len(filtered_words)
        lexical_diversity = unique_words / total_words if total_words > 0 else 0

        return TopicAnalysis(
            url=url,
            entities={},  # No entity extraction without spaCy
            entity_count=0,
            keywords=keywords,
            noun_phrases=[],
            main_topics=main_topics,
            unique_words=unique_words,
            lexical_diversity=round(lexical_diversity, 3)
        )

    def extract_topics_from_headings(self, headings: Dict[str, List[str]]) -> List[str]:
        """
        Extract topics specifically from headings

        Args:
            headings: Dictionary of headings by level (h1, h2, h3, etc.)

        Returns:
            List of topics
        """
        topics = []

        # Combine all headings
        all_headings = []
        for level in ['h2', 'h3']:  # Focus on H2 and H3 for topics
            if level in headings:
                all_headings.extend(headings[level])

        # Extract topics from headings
        for heading in all_headings:
            # Clean heading text
            clean_heading = heading.lower().strip()

            # Remove common prefixes
            prefixes = ['what is', 'how to', 'why', 'when', 'where', 'the']
            for prefix in prefixes:
                if clean_heading.startswith(prefix):
                    clean_heading = clean_heading[len(prefix):].strip()

            if len(clean_heading) > 3:
                topics.append(clean_heading)

        return topics

    def compare_topics(
        self,
        your_topics: Set[str],
        competitor_topics: List[Set[str]]
    ) -> Dict[str, any]:
        """
        Compare your topics against competitors

        Args:
            your_topics: Set of your topics
            competitor_topics: List of competitor topic sets

        Returns:
            Comparison analysis
        """
        # Flatten competitor topics
        all_competitor_topics = set()
        for topics in competitor_topics:
            all_competitor_topics.update(topics)

        # Find gaps (topics competitors have but you don't)
        gaps = all_competitor_topics - your_topics

        # Find unique topics (you have but competitors don't)
        unique = your_topics - all_competitor_topics

        # Find common topics
        common = your_topics & all_competitor_topics

        # Calculate coverage
        coverage = len(common) / len(all_competitor_topics) if all_competitor_topics else 0

        return {
            'gaps': list(gaps),
            'unique_topics': list(unique),
            'common_topics': list(common),
            'coverage_score': round(coverage * 100, 1),
            'total_competitor_topics': len(all_competitor_topics),
            'your_topic_count': len(your_topics)
        }


if __name__ == "__main__":
    # Test the analyzer
    sample_text = """
    Project management software helps teams collaborate and organize work.
    Popular tools include Asana, Trello, and Monday.com. Key features include
    task management, team collaboration, and project tracking. Many platforms
    offer Gantt charts, time tracking, and resource allocation capabilities.
    """

    analyzer = NLPAnalyzer()
    analysis = analyzer.analyze(sample_text, "test_url")

    print(f"Keywords: {analysis.keywords}")
    print(f"Main Topics: {analysis.main_topics}")
    print(f"Entities: {analysis.entities}")
    print(f"Unique Words: {analysis.unique_words}")
    print(f"Lexical Diversity: {analysis.lexical_diversity}")
