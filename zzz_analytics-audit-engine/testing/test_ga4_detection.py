"""Direct test of GA4 detection without CLI"""
import asyncio
from crawler.page_crawler import AnalyticsCrawler

async def test_ga4():
    print("\n=== Testing GA4 Detection on Cambria ===\n")

    crawler = AnalyticsCrawler("https://www.cambriausa.com", max_pages=2)
    pages = await crawler.crawl()

    print(f"Crawled {len(pages)} pages\n")

    for page in pages:
        print(f"\nPage: {page.url}")
        print(f"  GA4 Detected: {page.has_ga4}")
        print(f"  GA4 Measurement IDs: {page.ga4_measurement_ids}")
        print(f"  GA4 Requests Count: {len(page.ga4_requests)}")
        if page.ga4_requests:
            print(f"  First GA4 Request: {page.ga4_requests[0]['url'][:100]}...")
        print(f"  GTM Detected: {page.has_gtm}")
        print(f"  GTM Container IDs: {page.gtm_container_ids}")
        print(f"  GA4 Events: {page.ga4_events_detected}")
        print(f"  Page View Event: {page.has_page_view_event}")
        print(f"  Ecommerce Events: {page.ecommerce_events}")
        print(f"  Page Type: {page.page_type}")

    # Summary
    ga4_count = sum(1 for p in pages if p.has_ga4)
    print(f"\n=== Summary ===")
    print(f"GA4 Coverage: {ga4_count}/{len(pages)} pages ({ga4_count/len(pages)*100:.0f}%)")
    print(f"Expected: 100% (Cambria has GA4 via GTM)")
    print(f"\nTest {'PASSED' if ga4_count == len(pages) else 'FAILED'}!")

if __name__ == "__main__":
    asyncio.run(test_ga4())
