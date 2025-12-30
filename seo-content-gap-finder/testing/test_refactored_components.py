"""
Test script for refactored SEO Content Gap Finder components
Tests pipeline, formatters, gap analyzer, and caching
"""

import sys
import asyncio
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from pipeline.orchestrator import ContentGapPipeline
from pipeline.result_formatter import ResultFormatter
from analyzer.gap_analyzer import GapAnalyzer, ContentGap, GapAnalysis
from cache.content_cache import ContentCache
from cache.serp_cache import SerpCache


def test_gap_analyzer():
    """Test the enhanced gap analyzer"""
    print("\n" + "="*80)
    print("TEST 1: GAP ANALYZER")
    print("="*80)

    analyzer = GapAnalyzer()

    # Mock competitor data
    competitors = [
        {
            'url': 'competitor1.com',
            'word_count': 2500,
            'headings': {
                'h2': ['Getting Started', 'Features', 'Pricing', 'Integration'],
                'h3': ['Setup', 'Configuration', 'API Keys']
            },
            'nlp_analysis': {
                'keywords': ['software', 'management', 'project', 'team', 'collaboration'],
                'main_topics': ['project management', 'team collaboration']
            },
            'images_count': 8
        },
        {
            'url': 'competitor2.com',
            'word_count': 3000,
            'headings': {
                'h2': ['Overview', 'Features', 'Pricing', 'Support'],
                'h3': ['Free Trial', 'Enterprise', 'API']
            },
            'nlp_analysis': {
                'keywords': ['software', 'project', 'resource', 'team', 'planning'],
                'main_topics': ['resource allocation', 'project planning']
            },
            'images_count': 10
        },
        {
            'url': 'competitor3.com',
            'word_count': 2800,
            'headings': {
                'h2': ['Introduction', 'Features', 'Pricing', 'Integration', 'Support'],
                'h3': ['Slack', 'GitHub', 'Jira']
            },
            'nlp_analysis': {
                'keywords': ['software', 'management', 'team', 'workflow', 'automation'],
                'main_topics': ['workflow automation', 'team management']
            },
            'images_count': 12
        }
    ]

    # Your content (shorter, missing topics)
    your_content = {
        'url': 'yoursite.com/project-management',
        'word_count': 1500,
        'headings': {
            'h2': ['Features', 'Pricing'],
            'h3': ['Basic Plan']
        },
        'nlp_analysis': {
            'keywords': ['software', 'project', 'team'],
            'main_topics': ['project management']
        },
        'images_count': 3
    }

    # Run analysis
    analysis = analyzer.analyze(
        keyword="project management software",
        competitor_contents=competitors,
        your_content=your_content
    )

    # Verify results
    print(f"\n✓ Coverage Score: {analysis.coverage_score}%")
    print(f"✓ Total Gaps Found: {len(analysis.gaps)}")
    print(f"✓ Critical Gaps: {analysis.critical_gaps}")
    print(f"✓ Important Gaps: {analysis.important_gaps}")
    print(f"✓ Minor Gaps: {analysis.minor_gaps}")

    # Display top gaps
    print(f"\n✓ Top 5 Gaps:")
    for i, gap in enumerate(analysis.gaps[:5], 1):
        print(f"\n  {i}. {gap.title} (Score: {gap.score:.1f}/100)")
        print(f"     Type: {gap.gap_type} | Coverage: {gap.coverage_count}/{gap.total_competitors}")
        print(f"     {gap.description}")
        print(f"     Recommendations: {len(gap.recommendations)}")

    # Verify gap types present
    gap_types = set(gap.gap_type for gap in analysis.gaps)
    print(f"\n✓ Gap Types Found: {gap_types}")

    assert len(analysis.gaps) > 0, "No gaps found!"
    assert analysis.coverage_score >= 0 and analysis.coverage_score <= 100, "Invalid coverage score"
    assert 'topic' in gap_types or 'depth' in gap_types, "Expected topic or depth gaps"

    print("\n✅ GAP ANALYZER TEST PASSED")
    return True


def test_result_formatter():
    """Test the result formatter"""
    print("\n" + "="*80)
    print("TEST 2: RESULT FORMATTER")
    print("="*80)

    # Create mock analysis
    gaps = [
        ContentGap(
            gap_type='topic',
            title='Missing topic: Integration',
            description='8/10 competitors cover this topic',
            score=85.0,
            coverage_count=8,
            total_competitors=10,
            recommendations=['Add section about integrations', 'Include API documentation']
        ),
        ContentGap(
            gap_type='depth',
            title='Overall content depth insufficient',
            description='Your content: 1,500 words | Avg competitor: 2,800 words',
            score=70.0,
            coverage_count=10,
            total_competitors=10,
            recommendations=['Expand content by 1,300 words', 'Add more examples']
        ),
        ContentGap(
            gap_type='keyword',
            title="Missing keyword: 'automation'",
            description='Used by 7/10 competitors',
            score=65.0,
            coverage_count=7,
            total_competitors=10,
            recommendations=["Include 'automation' 3-5 times"]
        )
    ]

    analysis = GapAnalysis(
        keyword='project management software',
        your_url='yoursite.com',
        total_competitors=10,
        gaps=gaps,
        coverage_score=62.5,
        critical_gaps=1,
        important_gaps=1,
        minor_gaps=1
    )

    formatter = ResultFormatter()

    # Test JSON export
    print("\n✓ Testing JSON export...")
    json_output = formatter.to_json(analysis)
    assert '"keyword": "project management software"' in json_output
    assert '"coverage_score": 62.5' in json_output
    print("  ✓ JSON export working")

    # Test Markdown export
    print("\n✓ Testing Markdown export...")
    md_output = formatter.to_markdown(analysis)
    assert '# Content Gap Analysis' in md_output
    assert 'project management software' in md_output
    assert 'Missing topic: Integration' in md_output
    print("  ✓ Markdown export working")

    # Test CSV export
    print("\n✓ Testing CSV export...")
    csv_output = formatter.to_csv(analysis)
    assert 'Rank,Title,Type,Score' in csv_output
    assert 'topic' in csv_output
    print("  ✓ CSV export working")

    # Test table formatting (console output - just verify no errors)
    print("\n✓ Testing console table formatting...")
    table = formatter.format_gap_analysis_table(analysis)
    assert table is not None
    print("  ✓ Console tables working")

    print("\n✅ RESULT FORMATTER TEST PASSED")
    return True


def test_content_cache():
    """Test content caching"""
    print("\n" + "="*80)
    print("TEST 3: CONTENT CACHE")
    print("="*80)

    # Create cache with test database
    cache = ContentCache(cache_file=".test_content_cache.db", ttl_hours=24)

    # Test data
    test_url = "https://example.com/test-page"
    test_content = {
        'title': 'Test Page',
        'text': 'This is test content for caching',
        'word_count': 100,
        'headings': {'h2': ['Introduction', 'Conclusion']}
    }

    # Test set
    print("\n✓ Testing cache SET...")
    cache.set(test_url, test_content)
    print("  ✓ Content cached")

    # Test get (should hit)
    print("\n✓ Testing cache GET (hit)...")
    retrieved = cache.get(test_url)
    assert retrieved is not None, "Cache miss when should hit!"
    assert retrieved['title'] == test_content['title']
    assert retrieved['word_count'] == test_content['word_count']
    print("  ✓ Cache hit successful")

    # Test get for non-existent URL (should miss)
    print("\n✓ Testing cache GET (miss)...")
    missing = cache.get("https://example.com/nonexistent")
    assert missing is None, "Cache hit when should miss!"
    print("  ✓ Cache miss correct")

    # Test stats
    print("\n✓ Testing cache stats...")
    stats = cache.get_stats()
    assert stats['total_entries'] >= 1
    assert stats['valid_entries'] >= 1
    print(f"  ✓ Cache stats: {stats['total_entries']} total, {stats['valid_entries']} valid")

    # Test clear
    print("\n✓ Testing cache clear...")
    deleted = cache.clear_all()
    assert deleted >= 1
    print(f"  ✓ Cleared {deleted} entries")

    # Cleanup test database
    import os
    if os.path.exists(".test_content_cache.db"):
        os.remove(".test_content_cache.db")

    print("\n✅ CONTENT CACHE TEST PASSED")
    return True


def test_serp_cache():
    """Test SERP caching"""
    print("\n" + "="*80)
    print("TEST 4: SERP CACHE")
    print("="*80)

    # Create cache with test database
    cache = SerpCache(cache_file=".test_serp_cache.db", ttl_hours=72)

    # Test data
    test_keyword = "project management software"
    test_serp_data = {
        'keyword': test_keyword,
        'total_results': 1000000,
        'results': [
            {'position': 1, 'title': 'Best PM Software', 'url': 'https://example1.com'},
            {'position': 2, 'title': 'Top PM Tools', 'url': 'https://example2.com'},
        ]
    }

    # Test set
    print("\n✓ Testing SERP cache SET...")
    cache.set(test_keyword, test_serp_data, num_results=10)
    print("  ✓ SERP data cached")

    # Test get (should hit)
    print("\n✓ Testing SERP cache GET (hit)...")
    retrieved = cache.get(test_keyword, num_results=10)
    assert retrieved is not None, "SERP cache miss when should hit!"
    assert retrieved['keyword'] == test_keyword
    assert len(retrieved['results']) == 2
    print("  ✓ SERP cache hit successful")

    # Test get with different num_results (should miss)
    print("\n✓ Testing SERP cache GET (different num_results)...")
    missing = cache.get(test_keyword, num_results=20)
    assert missing is None, "SERP cache hit with different num_results!"
    print("  ✓ Cache correctly differentiates num_results")

    # Test stats
    print("\n✓ Testing SERP cache stats...")
    stats = cache.get_stats()
    assert stats['total_entries'] >= 1
    print(f"  ✓ SERP cache stats: {stats['total_entries']} total")
    print(f"  ✓ Recent keywords: {len(stats['recent_keywords'])}")

    # Test clear
    print("\n✓ Testing SERP cache clear...")
    deleted = cache.clear_all()
    assert deleted >= 1
    print(f"  ✓ Cleared {deleted} SERP entries")

    # Cleanup test database
    import os
    if os.path.exists(".test_serp_cache.db"):
        os.remove(".test_serp_cache.db")

    print("\n✅ SERP CACHE TEST PASSED")
    return True


async def test_pipeline_orchestrator():
    """Test pipeline orchestrator with mock data"""
    print("\n" + "="*80)
    print("TEST 5: PIPELINE ORCHESTRATOR")
    print("="*80)

    print("\n⚠️  Note: Pipeline test requires live internet connection")
    print("⚠️  Skipping full pipeline test (would scrape real websites)")
    print("⚠️  Instead, verifying pipeline initialization and structure")

    # Test pipeline initialization
    print("\n✓ Testing pipeline initialization...")
    pipeline = ContentGapPipeline(headless=True)
    assert pipeline.serp_scraper is not None
    assert pipeline.content_extractor is not None
    assert pipeline.nlp_analyzer is not None
    assert pipeline.gap_analyzer is not None
    print("  ✓ Pipeline components initialized")

    print("\n✓ Pipeline orchestrator structure verified")
    print("  ✓ For full end-to-end test, run actual analysis with CLI")

    print("\n✅ PIPELINE ORCHESTRATOR TEST PASSED")
    return True


def run_all_tests():
    """Run all component tests"""
    print("\n" + "="*80)
    print("SEO CONTENT GAP FINDER - REFACTORED COMPONENTS TEST SUITE")
    print("="*80)

    tests_passed = 0
    tests_failed = 0

    try:
        if test_gap_analyzer():
            tests_passed += 1
    except Exception as e:
        print(f"\n❌ Gap Analyzer Test FAILED: {e}")
        tests_failed += 1

    try:
        if test_result_formatter():
            tests_passed += 1
    except Exception as e:
        print(f"\n❌ Result Formatter Test FAILED: {e}")
        tests_failed += 1

    try:
        if test_content_cache():
            tests_passed += 1
    except Exception as e:
        print(f"\n❌ Content Cache Test FAILED: {e}")
        tests_failed += 1

    try:
        if test_serp_cache():
            tests_passed += 1
    except Exception as e:
        print(f"\n❌ SERP Cache Test FAILED: {e}")
        tests_failed += 1

    try:
        if asyncio.run(test_pipeline_orchestrator()):
            tests_passed += 1
    except Exception as e:
        print(f"\n❌ Pipeline Orchestrator Test FAILED: {e}")
        tests_failed += 1

    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    print(f"\n✅ Tests Passed: {tests_passed}")
    if tests_failed > 0:
        print(f"❌ Tests Failed: {tests_failed}")
    else:
        print("❌ Tests Failed: 0")

    total = tests_passed + tests_failed
    percentage = (tests_passed / total * 100) if total > 0 else 0
    print(f"\n📊 Success Rate: {percentage:.1f}%")

    if tests_failed == 0:
        print("\n🎉 ALL TESTS PASSED!")
        print("✅ Refactored components are working correctly")
        print("\nNext Steps:")
        print("1. Update CLI to use new pipeline")
        print("2. Test with real keywords")
        print("3. Verify end-to-end workflow")
        return True
    else:
        print(f"\n⚠️  {tests_failed} test(s) failed - review errors above")
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
