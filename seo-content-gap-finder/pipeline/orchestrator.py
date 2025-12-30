"""
Content Gap Pipeline Orchestrator
Coordinates the entire analysis workflow
"""

import asyncio
import logging
from typing import List, Optional, Dict, Any
from dataclasses import dataclass, field
from datetime import datetime

# Import scraper components
from scraper.serp_scraper import SerpScraper, SerpData
from scraper.content_extractor import ContentExtractor, ExtractedContent

# Import analyzer components
from analyzer.nlp_analyzer import NLPAnalyzer, TopicAnalysis
from analyzer.gap_analyzer import GapAnalyzer, GapAnalysis

logger = logging.getLogger(__name__)


@dataclass
class PipelineResult:
    """Complete pipeline analysis result"""
    keyword: str
    serp_data: SerpData
    extracted_contents: List[ExtractedContent]
    analyzed_contents: List[Dict[str, Any]]
    gap_analysis: 'GapAnalysis'

    # Metadata
    started_at: datetime
    completed_at: datetime
    total_duration_seconds: float
    success: bool = True
    error_message: str = ""

    # Stats
    total_urls_found: int = 0
    successful_extractions: int = 0
    failed_extractions: int = 0


class ContentGapPipeline:
    """
    Main pipeline orchestrator for content gap analysis

    Coordinates:
    1. SERP scraping
    2. Content extraction
    3. NLP analysis
    4. Gap identification
    5. Result aggregation
    """

    def __init__(
        self,
        headless: bool = True,
        timeout: int = 30,
        use_spacy: bool = True
    ):
        """
        Initialize pipeline with all components

        Args:
            headless: Run browser in headless mode
            timeout: Timeout for HTTP requests
            use_spacy: Use spaCy for NLP (vs basic fallback)
        """
        self.serp_scraper = SerpScraper(headless=headless)
        self.content_extractor = ContentExtractor(timeout=timeout)
        self.nlp_analyzer = NLPAnalyzer(use_spacy=use_spacy)
        self.gap_analyzer = GapAnalyzer()

        logger.info("Pipeline initialized")

    async def analyze(
        self,
        keyword: str,
        depth: int = 10,
        your_url: Optional[str] = None
    ) -> PipelineResult:
        """
        Run complete content gap analysis pipeline

        Args:
            keyword: Target keyword to analyze
            depth: Number of SERP results to analyze
            your_url: Your URL to compare against competitors

        Returns:
            PipelineResult with complete analysis
        """
        started_at = datetime.utcnow()
        logger.info(f"Starting pipeline for keyword: {keyword}")

        try:
            # Step 1: Scrape SERP
            logger.info(f"Step 1: Scraping SERP for '{keyword}'...")
            serp_data = await self._scrape_serp(keyword, depth)
            logger.info(f"✓ Found {len(serp_data.results)} organic results")

            # Step 2: Extract content from URLs
            logger.info("Step 2: Extracting content from URLs...")
            extracted_contents = await self._extract_content(serp_data, your_url)
            logger.info(f"✓ Extracted content from {len(extracted_contents)} URLs")

            # Step 3: NLP analysis
            logger.info("Step 3: Running NLP analysis...")
            analyzed_contents, your_analyzed = await self._analyze_content(
                extracted_contents,
                your_url
            )
            logger.info(f"✓ NLP analysis complete")

            # Step 4: Identify gaps
            logger.info("Step 4: Identifying content gaps...")
            gap_analysis = self._identify_gaps(
                keyword=keyword,
                analyzed_contents=analyzed_contents,
                your_analyzed=your_analyzed
            )
            logger.info(f"✓ Found {len(gap_analysis.gaps)} content gaps")

            # Calculate stats
            completed_at = datetime.utcnow()
            duration = (completed_at - started_at).total_seconds()

            successful = sum(1 for c in extracted_contents if c.success)
            failed = len(extracted_contents) - successful

            result = PipelineResult(
                keyword=keyword,
                serp_data=serp_data,
                extracted_contents=extracted_contents,
                analyzed_contents=analyzed_contents,
                gap_analysis=gap_analysis,
                started_at=started_at,
                completed_at=completed_at,
                total_duration_seconds=round(duration, 2),
                total_urls_found=len(serp_data.results),
                successful_extractions=successful,
                failed_extractions=failed,
                success=True
            )

            logger.info(f"Pipeline completed in {duration:.2f}s")
            return result

        except Exception as e:
            logger.error(f"Pipeline failed: {e}", exc_info=True)

            # Return error result
            completed_at = datetime.utcnow()
            duration = (completed_at - started_at).total_seconds()

            return PipelineResult(
                keyword=keyword,
                serp_data=SerpData(keyword=keyword, total_results=0, results=[]),
                extracted_contents=[],
                analyzed_contents=[],
                gap_analysis=None,
                started_at=started_at,
                completed_at=completed_at,
                total_duration_seconds=round(duration, 2),
                success=False,
                error_message=str(e)
            )

    async def _scrape_serp(self, keyword: str, depth: int) -> SerpData:
        """Scrape Google SERP"""
        try:
            serp_data = await self.serp_scraper.search(keyword, num_results=depth)
            return serp_data
        except Exception as e:
            logger.error(f"SERP scraping failed: {e}")
            raise

    async def _extract_content(
        self,
        serp_data: SerpData,
        your_url: Optional[str] = None
    ) -> List[ExtractedContent]:
        """Extract content from SERP URLs"""
        urls_to_extract = [r.url for r in serp_data.results]

        # Add your URL if provided
        if your_url and your_url not in urls_to_extract:
            urls_to_extract.insert(0, your_url)

        extracted_contents = []

        for url in urls_to_extract:
            try:
                content = self.content_extractor.extract(url)
                if content.success:
                    extracted_contents.append(content)
                else:
                    logger.warning(f"Failed to extract {url}: {content.error_message}")
            except Exception as e:
                logger.error(f"Error extracting {url}: {e}")
                continue

        return extracted_contents

    async def _analyze_content(
        self,
        extracted_contents: List[ExtractedContent],
        your_url: Optional[str] = None
    ) -> tuple[List[Dict[str, Any]], Optional[Dict[str, Any]]]:
        """Run NLP analysis on extracted content"""

        # Separate your content from competitors
        if your_url:
            your_content_raw = next((c for c in extracted_contents if c.url == your_url), None)
            competitor_contents = [c for c in extracted_contents if c.url != your_url]
        else:
            your_content_raw = None
            competitor_contents = extracted_contents

        # Analyze competitor content
        analyzed_contents = []
        for content in competitor_contents:
            try:
                nlp_result = self.nlp_analyzer.analyze(content.text, content.url)

                analyzed_contents.append({
                    'url': content.url,
                    'word_count': content.word_count,
                    'headings': content.headings,
                    'nlp_analysis': {
                        'keywords': nlp_result.keywords,
                        'main_topics': nlp_result.main_topics,
                        'entities': nlp_result.entities
                    },
                    'images_count': content.images_count
                })
            except Exception as e:
                logger.error(f"NLP analysis failed for {content.url}: {e}")
                continue

        # Analyze your content
        your_analyzed = None
        if your_content_raw:
            try:
                nlp_result = self.nlp_analyzer.analyze(your_content_raw.text, your_content_raw.url)
                your_analyzed = {
                    'url': your_content_raw.url,
                    'word_count': your_content_raw.word_count,
                    'headings': your_content_raw.headings,
                    'nlp_analysis': {
                        'keywords': nlp_result.keywords,
                        'main_topics': nlp_result.main_topics,
                        'entities': nlp_result.entities
                    },
                    'images_count': your_content_raw.images_count
                }
            except Exception as e:
                logger.error(f"NLP analysis failed for your URL: {e}")

        return analyzed_contents, your_analyzed

    def _identify_gaps(
        self,
        keyword: str,
        analyzed_contents: List[Dict[str, Any]],
        your_analyzed: Optional[Dict[str, Any]] = None
    ) -> 'GapAnalysis':
        """Identify content gaps"""
        try:
            analysis = self.gap_analyzer.analyze(
                keyword=keyword,
                competitor_contents=analyzed_contents,
                your_content=your_analyzed
            )
            return analysis
        except Exception as e:
            logger.error(f"Gap analysis failed: {e}")
            raise

    async def batch_analyze(
        self,
        keywords: List[str],
        depth: int = 10,
        your_url: Optional[str] = None,
        max_concurrent: int = 3
    ) -> List[PipelineResult]:
        """
        Analyze multiple keywords in batch

        Args:
            keywords: List of keywords to analyze
            depth: Number of SERP results per keyword
            your_url: Your URL to compare
            max_concurrent: Maximum concurrent analyses

        Returns:
            List of PipelineResult objects
        """
        logger.info(f"Starting batch analysis for {len(keywords)} keywords")

        results = []

        # Process in batches to avoid overwhelming resources
        for i in range(0, len(keywords), max_concurrent):
            batch = keywords[i:i + max_concurrent]

            # Run batch concurrently
            tasks = [
                self.analyze(keyword, depth, your_url)
                for keyword in batch
            ]

            batch_results = await asyncio.gather(*tasks, return_exceptions=True)

            # Filter out exceptions
            for result in batch_results:
                if isinstance(result, Exception):
                    logger.error(f"Batch analysis error: {result}")
                else:
                    results.append(result)

        logger.info(f"Batch analysis complete: {len(results)}/{len(keywords)} successful")
        return results
