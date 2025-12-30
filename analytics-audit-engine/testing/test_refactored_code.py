"""
Test script to verify the refactored code works correctly
Tests the new helper classes and refactored page_crawler.py
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from crawler.page_crawler import AnalyticsCrawler


async def test_refactored_crawler():
    """Test the refactored crawler on a real website"""
    print("=" * 80)
    print("TESTING REFACTORED CODE")
    print("=" * 80)
    print()

    # Test URL - using a site we know has GA4
    test_url = "https://www.cambriausa.com"

    print(f"Testing URL: {test_url}")
    print(f"Max Pages: 2")
    print()

    try:
        # Create crawler instance
        crawler = AnalyticsCrawler(
            start_url=test_url,
            max_pages=2,
            timeout=30000
        )

        # Run crawl
        print("Starting crawl...")
        pages = await crawler.crawl()

        print(f"\n[SUCCESS] Crawl completed successfully!")
        print(f"Pages crawled: {len(pages)}")
        print()

        # Display results for each page
        for i, page in enumerate(pages, 1):
            print(f"\n{'=' * 80}")
            print(f"PAGE {i}: {page.url}")
            print(f"{'=' * 80}")

            # GA4 Detection
            print(f"\nGA4 Detection:")
            print(f"  Has GA4: {page.has_ga4}")
            print(f"  Measurement IDs: {page.ga4_measurement_ids}")
            print(f"  GA4 Requests: {len(page.ga4_requests)}")

            # Event Validation
            print(f"\nEvent Validation:")
            print(f"  Events Detected: {page.ga4_events_detected}")
            print(f"  Has Page View: {page.has_page_view_event}")
            print(f"  Has Ecommerce Events: {page.has_ecommerce_events}")
            print(f"  Ecommerce Events: {page.ecommerce_events}")

            # Page Type
            print(f"\nEcommerce:")
            print(f"  Page Type: {page.page_type or 'standard'}")

            # Issues
            print(f"\nIssues Found: {len(page.issues)}")
            for issue in page.issues:
                print(f"  - [{issue['severity'].upper()}] {issue['message']}")

        print(f"\n{'=' * 80}")
        print("[SUCCESS] ALL TESTS PASSED")
        print(f"{'=' * 80}")

        return True

    except Exception as e:
        print(f"\n[FAILED] TEST FAILED")
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("Testing refactored Analytics Audit Engine...")
    print()

    # Run test
    result = asyncio.run(test_refactored_crawler())

    # Exit with appropriate code
    sys.exit(0 if result else 1)
