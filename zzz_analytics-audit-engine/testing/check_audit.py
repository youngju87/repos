"""Quick script to check latest audit results"""
import sys
from sqlalchemy import create_engine, desc
from sqlalchemy.orm import sessionmaker
from database.models_sqlite import Base, Audit, Page

# Connect to database
engine = create_engine("sqlite:///./analytics_audit.db")
Session = sessionmaker(bind=engine)
session = Session()

# Get latest audit
latest_audit = session.query(Audit).order_by(desc(Audit.started_at)).first()

if not latest_audit:
    print("No audits found")
    sys.exit(1)

print(f"\n=== Latest Audit ===")
print(f"Audit ID: {latest_audit.audit_id}")
print(f"URL: {latest_audit.site_url}")
print(f"Pages Audited: {latest_audit.pages_successfully_crawled}")
print(f"Overall Score: {latest_audit.overall_score:.1f}/100")
print(f"\n=== Scores ===")
print(f"Implementation: {latest_audit.implementation_score:.1f}/100")
print(f"Compliance: {latest_audit.compliance_score:.1f}/100")
print(f"Performance: {latest_audit.performance_score:.1f}/100")

# Get page data
pages = session.query(Page).filter_by(audit_id=latest_audit.audit_id).all()

print(f"\n=== GA4 Detection ===")
ga4_pages = [p for p in pages if p.has_ga4]
print(f"GA4 Coverage: {len(ga4_pages)}/{len(pages)} pages ({len(ga4_pages)/len(pages)*100:.0f}%)")

if ga4_pages:
    print(f"\nGA4 Measurement IDs found:")
    for page in ga4_pages:
        if page.ga4_measurement_ids:
            print(f"  {page.url}: {page.ga4_measurement_ids}")

print(f"\n=== GTM Detection ===")
gtm_pages = [p for p in pages if p.has_gtm]
print(f"GTM Coverage: {len(gtm_pages)}/{len(pages)} pages ({len(gtm_pages)/len(pages)*100:.0f}%)")

print(f"\n=== Page Details ===")
for page in pages:
    print(f"\n{page.url}")
    print(f"  GA4: {page.has_ga4} - IDs: {page.ga4_measurement_ids}")
    print(f"  GTM: {page.has_gtm} - IDs: {page.gtm_container_ids}")
    print(f"  GA4 Requests: {len(page.ga4_requests) if page.ga4_requests else 0}")
    print(f"  GA4 Events: {page.ga4_events_detected if page.ga4_events_detected else 'None'}")
    print(f"  Ecommerce Events: {page.ecommerce_events if page.ecommerce_events else 'None'}")
    print(f"  Page Type: {page.page_type if page.page_type else 'standard'}")

session.close()
