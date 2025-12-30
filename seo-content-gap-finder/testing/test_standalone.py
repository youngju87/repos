"""
Standalone test script - tests components without external dependencies
Tests: Gap Analyzer, Caches (SQLite only)
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))


def test_gap_analyzer():
    """Test gap analyzer with mock data"""
    print("\n" + "="*80)
    print("TEST 1: GAP ANALYZER (Enhanced Scoring)")
    print("="*80)

    # Import here to avoid dependency issues
    from analyzer.gap_analyzer import GapAnalyzer

    analyzer = GapAnalyzer()

    # Mock competitor data
    competitors = [
        {
            'url': 'comp1.com',
            'word_count': 2500,
            'headings': {'h2': ['Getting Started', 'Features', 'Pricing'], 'h3': ['Setup', 'API']},
            'nlp_analysis': {'keywords': ['software', 'project', 'team'], 'main_topics': ['project management']},
            'images_count': 8
        },
        {
            'url': 'comp2.com',
            'word_count': 3000,
            'headings': {'h2': ['Overview', 'Features', 'Pricing'], 'h3': ['Trial', 'API']},
            'nlp_analysis': {'keywords': ['software', 'resource', 'team'], 'main_topics': ['resource allocation']},
            'images_count': 10
        }
    ]

    your_content = {
        'url': 'yoursite.com',
        'word_count': 1500,
        'headings': {'h2': ['Features'], 'h3': []},
        'nlp_analysis': {'keywords': ['software'], 'main_topics': []},
        'images_count': 3
    }

    # Run analysis
    analysis = analyzer.analyze(
        keyword="project management",
        competitor_contents=competitors,
        your_content=your_content
    )

    # Verify
    print(f"\n[OK] Coverage Score: {analysis.coverage_score}%")
    print(f"[OK] Gaps Found: {len(analysis.gaps)}")
    print(f"  - Critical: {analysis.critical_gaps}")
    print(f"  - Important: {analysis.important_gaps}")
    print(f"  - Minor: {analysis.minor_gaps}")

    # Show top gaps
    print(f"\n[OK] Top 5 Gaps:")
    for i, gap in enumerate(analysis.gaps[:5], 1):
        print(f"  {i}. [{gap.gap_type.upper()}] {gap.title}")
        print(f"     Score: {gap.score:.1f}/100 | Coverage: {gap.coverage_count}/{gap.total_competitors}")

    assert len(analysis.gaps) > 0
    assert 0 <= analysis.coverage_score <= 100

    print("\n[PASS] GAP ANALYZER TEST PASSED")
    return True


def test_content_cache():
    """Test content cache"""
    print("\n" + "="*80)
    print("TEST 2: CONTENT CACHE")
    print("="*80)

    from cache.content_cache import ContentCache

    cache = ContentCache(cache_file=".test_cache.db", ttl_hours=24)

    # Test set/get
    test_url = "https://example.com/test"
    test_data = {'title': 'Test', 'word_count': 100}

    print("\n[OK] Testing cache SET...")
    cache.set(test_url, test_data)

    print("[OK] Testing cache GET (hit)...")
    retrieved = cache.get(test_url)
    assert retrieved is not None
    assert retrieved['title'] == 'Test'
    print(f"  Retrieved: {retrieved}")

    print("[OK] Testing cache GET (miss)...")
    missing = cache.get("https://nonexistent.com")
    assert missing is None

    # Stats
    stats = cache.get_stats()
    print(f"\n[OK] Cache stats:")
    print(f"  Total entries: {stats['total_entries']}")
    print(f"  Valid entries: {stats['valid_entries']}")
    print(f"  Cache size: {stats['cache_size_mb']} MB")

    # Cleanup
    cache.clear_all()
    if os.path.exists(".test_cache.db"):
        os.remove(".test_cache.db")

    print("\n[PASS] CONTENT CACHE TEST PASSED")
    return True


def test_serp_cache():
    """Test SERP cache"""
    print("\n" + "="*80)
    print("TEST 3: SERP CACHE")
    print("="*80)

    from cache.serp_cache import SerpCache

    cache = SerpCache(cache_file=".test_serp.db", ttl_hours=72)

    # Test set/get
    keyword = "project management"
    serp_data = {
        'keyword': keyword,
        'results': [{'position': 1, 'url': 'https://example.com'}]
    }

    print("\n[OK] Testing SERP cache SET...")
    cache.set(keyword, serp_data, num_results=10)

    print("[OK] Testing SERP cache GET (hit)...")
    retrieved = cache.get(keyword, num_results=10)
    assert retrieved is not None
    assert retrieved['keyword'] == keyword
    print(f"  Retrieved keyword: {retrieved['keyword']}")

    print("[OK] Testing SERP cache GET (miss - different num_results)...")
    missing = cache.get(keyword, num_results=20)
    assert missing is None

    # Stats
    stats = cache.get_stats()
    print(f"\n[OK] SERP cache stats:")
    print(f"  Total entries: {stats['total_entries']}")
    print(f"  Recent keywords: {len(stats.get('recent_keywords', []))}")

    # Cleanup
    cache.clear_all()
    if os.path.exists(".test_serp.db"):
        os.remove(".test_serp.db")

    print("\n[PASS] SERP CACHE TEST PASSED")
    return True


def run_tests():
    """Run all standalone tests"""
    print("\n" + "="*80)
    print("SEO CONTENT GAP FINDER - STANDALONE COMPONENT TESTS")
    print("="*80)
    print("\nTesting refactored components (no external dependencies required)")

    passed = 0
    failed = 0

    tests = [
        ("Gap Analyzer", test_gap_analyzer),
        ("Content Cache", test_content_cache),
        ("SERP Cache", test_serp_cache),
    ]

    for name, test_func in tests:
        try:
            if test_func():
                passed += 1
        except Exception as e:
            print(f"\n[FAIL] {name} Test FAILED: {e}")
            import traceback
            traceback.print_exc()
            failed += 1

    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    print(f"\n[PASS] Passed: {passed}")
    print(f"[FAIL] Failed: {failed}")

    total = passed + failed
    percentage = (passed / total * 100) if total > 0 else 0
    print(f"\n[STATS] Success Rate: {percentage:.1f}%")

    if failed == 0:
        print("\n[SUCCESS] ALL TESTS PASSED!")
        print("\n[PASS] Refactored components verified:")
        print("  [OK] Gap Analyzer - Enhanced scoring working")
        print("  [OK] Content Cache - SQLite caching functional")
        print("  [OK] SERP Cache - Keyword caching operational")
        print("\n[NOTE] Full pipeline test requires dependencies (run pip install -r requirements.txt)")
        return True
    else:
        print(f"\n[WARNING] {failed} test(s) failed")
        return False


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
