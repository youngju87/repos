"""
Example usage of Analytics Audit Engine as a Python library
Demonstrates how to integrate auditing into other applications
"""

import asyncio
import os
from datetime import datetime

from crawler.page_crawler import AnalyticsCrawler
from analyzer.audit_analyzer import AuditAnalyzer
from reports.report_generator import ReportGenerator


def example_basic_audit():
    """
    Example 1: Basic audit workflow
    """
    print("=== Example 1: Basic Audit ===\n")

    # Configuration
    site_url = "https://demo.google.com/analytics"
    max_pages = 5

    # Database connection
    db_url = "postgresql://audituser:auditpass123@localhost:5433/analytics_audit"

    # Step 1: Crawl website
    print(f"Crawling {site_url}...")
    crawler = AnalyticsCrawler(site_url, max_pages=max_pages)
    crawled_pages = asyncio.run(crawler.crawl())
    print(f"✓ Crawled {len(crawled_pages)} pages\n")

    # Step 2: Analyze and store results
    print("Analyzing results...")
    analyzer = AuditAnalyzer(db_url)
    audit = analyzer.create_audit(
        site_url,
        crawled_pages,
        max_pages_config=max_pages,
        created_by="example_script"
    )
    print(f"✓ Analysis complete. Audit ID: {audit.audit_id}\n")

    # Step 3: Get summary
    summary = analyzer.get_audit_summary(str(audit.audit_id))

    print(f"Overall Score: {summary['overall_score']:.0f}/100")
    print(f"Critical Issues: {summary['critical_issues']}")
    print(f"GA4 Coverage: {summary['tag_coverage']['ga4']:.0f}%")
    print()

    # Step 4: Generate report
    print("Generating report...")
    generator = ReportGenerator()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = f"./reports/example_audit_{timestamp}.html"

    generator.generate_html_report(summary, report_path)
    print(f"✓ Report saved: {report_path}\n")

    return audit


def example_custom_analysis():
    """
    Example 2: Custom analysis of crawled pages
    """
    print("=== Example 2: Custom Analysis ===\n")

    site_url = "https://yoursite.com"
    max_pages = 10

    # Crawl with custom configuration
    crawler = AnalyticsCrawler(
        site_url,
        max_pages=max_pages,
        timeout=60000,  # 60 seconds
        wait_for_network_idle=True,
        user_agent="MyCustomAuditBot/1.0"
    )

    crawled_pages = asyncio.run(crawler.crawl())

    # Custom analysis: Find pages without GA4
    pages_missing_ga4 = [p for p in crawled_pages if not p.has_ga4]

    print(f"Total pages crawled: {len(crawled_pages)}")
    print(f"Pages missing GA4: {len(pages_missing_ga4)}")

    if pages_missing_ga4:
        print("\nPages missing GA4:")
        for page in pages_missing_ga4[:5]:  # Show first 5
            print(f"  - {page.url}")
            print(f"    Has GTM: {page.has_gtm}")
            print(f"    Has Consent: {page.has_consent_banner}")
    print()

    # Custom analysis: Find dataLayer issues
    datalayer_issues = [
        p for p in crawled_pages
        if p.has_gtm and p.has_datalayer and not p.datalayer_defined_before_gtm
    ]

    if datalayer_issues:
        print(f"\n{len(datalayer_issues)} pages with dataLayer order issues:")
        for page in datalayer_issues:
            print(f"  - {page.url}")
    print()

    return crawled_pages


def example_batch_auditing():
    """
    Example 3: Batch audit multiple sites
    """
    print("=== Example 3: Batch Auditing ===\n")

    sites_to_audit = [
        "https://site1.com",
        "https://site2.com",
        "https://site3.com"
    ]

    db_url = "postgresql://audituser:auditpass123@localhost:5433/analytics_audit"
    analyzer = AuditAnalyzer(db_url)

    results = []

    for site_url in sites_to_audit:
        print(f"Auditing {site_url}...")

        try:
            # Crawl
            crawler = AnalyticsCrawler(site_url, max_pages=20)
            crawled_pages = asyncio.run(crawler.crawl())

            # Analyze
            audit = analyzer.create_audit(site_url, crawled_pages)
            summary = analyzer.get_audit_summary(str(audit.audit_id))

            results.append({
                'url': site_url,
                'score': summary['overall_score'],
                'critical_issues': summary['critical_issues'],
                'audit_id': summary['audit_id']
            })

            print(f"  ✓ Score: {summary['overall_score']:.0f}/100\n")

        except Exception as e:
            print(f"  ✗ Error: {e}\n")
            continue

    # Summary comparison
    print("=== Batch Results ===")
    for result in results:
        print(f"{result['url']}")
        print(f"  Score: {result['score']:.0f}/100")
        print(f"  Critical Issues: {result['critical_issues']}")
        print(f"  Audit ID: {result['audit_id']}\n")

    return results


def example_report_customization():
    """
    Example 4: Generate custom reports
    """
    print("=== Example 4: Custom Reports ===\n")

    db_url = "postgresql://audituser:auditpass123@localhost:5433/analytics_audit"
    analyzer = AuditAnalyzer(db_url)

    # Assuming we have a previous audit
    # audit_id = "your-audit-id-here"
    # summary = analyzer.get_audit_summary(audit_id)

    # For demo, create a mock summary
    summary = {
        'audit_id': 'demo-123',
        'site_url': 'https://example.com',
        'overall_score': 75.0,
        'implementation_score': 80.0,
        'compliance_score': 70.0,
        'performance_score': 75.0,
        'pages_crawled': 25,
        'critical_issues': 2,
        'warning_issues': 5,
        'info_issues': 3,
        'tag_coverage': {
            'ga4': 92.0,
            'gtm': 100.0,
            'consent': 80.0
        },
        'issues': [
            {
                'severity': 'critical',
                'category': 'implementation',
                'title': 'dataLayer not defined before GTM',
                'recommendation': 'Move dataLayer initialization before GTM script'
            }
        ],
        'started_at': datetime.now().isoformat(),
        'completed_at': datetime.now().isoformat()
    }

    # Generate reports in both formats
    generator = ReportGenerator()

    html_path = "./reports/custom_report.html"
    generator.generate_html_report(summary, html_path)
    print(f"✓ HTML report: {html_path}")

    try:
        pdf_path = "./reports/custom_report.pdf"
        generator.generate_pdf_report(summary, pdf_path)
        print(f"✓ PDF report: {pdf_path}")
    except ImportError:
        print("ℹ PDF generation requires WeasyPrint")

    print()


def example_filtering_and_queries():
    """
    Example 5: Query audit data from database
    """
    print("=== Example 5: Database Queries ===\n")

    from sqlalchemy import create_engine, func
    from sqlalchemy.orm import sessionmaker
    from database.models import Audit, Page, Issue

    db_url = "postgresql://audituser:auditpass123@localhost:5433/analytics_audit"
    engine = create_engine(db_url)
    Session = sessionmaker(bind=engine)
    session = Session()

    # Query 1: Find all audits for a domain
    domain = "example.com"
    audits = session.query(Audit).filter(
        Audit.site_domain == domain
    ).order_by(Audit.started_at.desc()).all()

    print(f"Audits for {domain}: {len(audits)}")
    for audit in audits[:3]:
        print(f"  {audit.started_at}: Score {audit.overall_score}")
    print()

    # Query 2: Find pages missing GA4
    if audits:
        latest_audit = audits[0]
        pages_no_ga4 = session.query(Page).filter(
            Page.audit_id == latest_audit.audit_id,
            Page.has_ga4 == False
        ).all()

        print(f"Pages without GA4 in latest audit: {len(pages_no_ga4)}")
        for page in pages_no_ga4[:5]:
            print(f"  - {page.url}")
        print()

    # Query 3: Count issues by category
    if audits:
        issue_counts = session.query(
            Issue.category,
            Issue.severity,
            func.count(Issue.issue_id)
        ).filter(
            Issue.audit_id == audits[0].audit_id
        ).group_by(Issue.category, Issue.severity).all()

        print("Issue breakdown:")
        for category, severity, count in issue_counts:
            print(f"  {category} ({severity}): {count}")
        print()

    session.close()


if __name__ == "__main__":
    """
    Run examples
    """
    print("Analytics Audit Engine - Example Usage\n")
    print("Make sure Docker is running: docker-compose up -d\n")

    # Uncomment the examples you want to run:

    # example_basic_audit()
    # example_custom_analysis()
    # example_batch_auditing()
    # example_report_customization()
    # example_filtering_and_queries()

    print("Examples complete!")
    print("\nTo run actual audits:")
    print("  python audit_cli.py scan --url https://yoursite.com --max-pages 10")
