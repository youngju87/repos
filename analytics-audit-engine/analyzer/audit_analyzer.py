"""
Audit Analyzer - Processes crawled pages and generates audit results
Calculates scores, identifies issues, and stores results in database
"""

import logging
from typing import List, Dict
from datetime import datetime
from urllib.parse import urlparse

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import text

from crawler.page_crawler import CrawledPage
from database.models import Audit, Page, Issue, Tag, DataLayerEvent

logger = logging.getLogger(__name__)


class AuditAnalyzer:
    """
    Analyzes crawled pages and generates comprehensive audit results
    """

    def __init__(self, database_url: str):
        self.engine = create_engine(database_url)
        self.Session = sessionmaker(bind=self.engine)

    def create_audit(
        self,
        site_url: str,
        crawled_pages: List[CrawledPage],
        max_pages_config: int = 50,
        created_by: str = None
    ) -> Audit:
        """
        Create audit from crawled pages and analyze results
        """
        session = self.Session()

        try:
            # Create audit record
            parsed_url = urlparse(site_url)
            audit = Audit(
                site_url=site_url,
                site_domain=parsed_url.netloc,
                started_at=datetime.utcnow(),
                status='running',
                total_pages_requested=max_pages_config,
                pages_successfully_crawled=len(crawled_pages),
                max_pages_config=max_pages_config,
                created_by=created_by
            )

            session.add(audit)
            session.flush()  # Get audit_id

            logger.info(f"Created audit {audit.audit_id} for {site_url}")

            # Process each crawled page
            for crawled_page in crawled_pages:
                self._process_page(session, audit, crawled_page)

            # Analyze audit and generate issues
            self._analyze_audit(session, audit)

            # Calculate scores
            self._calculate_scores(session, audit)

            # Mark audit as completed
            audit.completed_at = datetime.utcnow()
            audit.status = 'completed'

            session.commit()

            logger.info(
                f"Audit {audit.audit_id} completed. "
                f"Score: {audit.overall_score}/100, "
                f"Issues: {audit.critical_issues} critical, {audit.warning_issues} warnings"
            )

            return audit

        except Exception as e:
            session.rollback()
            logger.error(f"Error creating audit: {e}")
            raise
        finally:
            session.close()

    def _process_page(self, session, audit: Audit, crawled_page: CrawledPage):
        """Convert CrawledPage to database Page record"""

        parsed_url = urlparse(crawled_page.url)

        page = Page(
            audit_id=audit.audit_id,
            url=crawled_page.url,
            page_path=parsed_url.path,
            title=crawled_page.title,
            page_type=self._classify_page_type(crawled_page.url),
            status_code=crawled_page.status_code,
            load_time_seconds=crawled_page.load_time,

            # Analytics tags
            has_ga4=crawled_page.has_ga4,
            ga4_measurement_ids=crawled_page.ga4_measurement_ids,
            has_gtm=crawled_page.has_gtm,
            gtm_container_ids=crawled_page.gtm_container_ids,
            has_universal_analytics=crawled_page.has_universal_analytics,
            ua_tracking_ids=crawled_page.ua_tracking_ids,

            # Other tracking
            has_facebook_pixel=crawled_page.has_facebook_pixel,
            facebook_pixel_ids=crawled_page.facebook_pixel_ids,
            has_linkedin_insight=crawled_page.has_linkedin_insight,
            has_hotjar=crawled_page.has_hotjar,
            has_google_ads=crawled_page.has_google_ads,

            # Privacy
            has_consent_banner=crawled_page.has_consent_banner,
            consent_platform=crawled_page.consent_platform,
            has_privacy_policy_link=crawled_page.has_privacy_policy_link,

            # dataLayer
            has_datalayer=crawled_page.has_datalayer,
            datalayer_defined_before_gtm=crawled_page.datalayer_defined_before_gtm,
            datalayer_events=crawled_page.datalayer_events,

            # Performance
            total_scripts=crawled_page.total_scripts,
            tracking_scripts=crawled_page.tracking_scripts,

            # Store HTML for potential re-analysis
            html_content=crawled_page.html_content[:100000],  # Limit size
            crawled_at=crawled_page.crawled_at
        )

        session.add(page)
        session.flush()  # Get page_id

        # Add issues from crawler
        for issue_data in crawled_page.issues:
            issue = Issue(
                audit_id=audit.audit_id,
                page_id=page.page_id,
                severity=issue_data['severity'],
                category=issue_data['category'],
                title=issue_data['message'],
                description=issue_data['message'],
                recommendation=issue_data.get('recommendation'),
                affected_urls=[crawled_page.url]
            )
            session.add(issue)

        # Add dataLayer events
        for idx, event in enumerate(crawled_page.datalayer_events):
            if isinstance(event, dict) and 'event' in event:
                dl_event = DataLayerEvent(
                    page_id=page.page_id,
                    event_name=event.get('event'),
                    event_parameters=event,
                    event_index=idx
                )
                session.add(dl_event)

    def _classify_page_type(self, url: str) -> str:
        """Classify page type based on URL patterns"""
        url_lower = url.lower()

        if url_lower.endswith('/') or url_lower.split('/')[-1] in ['', 'index.html', 'index.php']:
            return 'homepage'
        elif any(keyword in url_lower for keyword in ['/product', '/item', '/p/']):
            return 'product'
        elif any(keyword in url_lower for keyword in ['/checkout', '/cart', '/basket']):
            return 'checkout'
        elif any(keyword in url_lower for keyword in ['/thank', '/confirmation', '/success']):
            return 'confirmation'
        elif any(keyword in url_lower for keyword in ['/blog', '/article', '/post']):
            return 'content'
        elif any(keyword in url_lower for keyword in ['/category', '/collection']):
            return 'category'
        else:
            return 'other'

    def _analyze_audit(self, session, audit: Audit):
        """Analyze overall audit and generate cross-page issues"""

        pages = session.query(Page).filter(Page.audit_id == audit.audit_id).all()

        if not pages:
            return

        # Check 1: Inconsistent tag coverage
        ga4_pages = [p for p in pages if p.has_ga4]
        gtm_pages = [p for p in pages if p.has_gtm]

        ga4_coverage = len(ga4_pages) / len(pages) * 100
        gtm_coverage = len(gtm_pages) / len(pages) * 100

        if ga4_coverage < 90:
            missing_pages = [p.url for p in pages if not p.has_ga4]
            issue = Issue(
                audit_id=audit.audit_id,
                severity='warning' if ga4_coverage > 70 else 'critical',
                category='implementation',
                title=f'GA4 only on {ga4_coverage:.0f}% of pages',
                description=f'GA4 tracking is missing on {len(missing_pages)} pages',
                recommendation='Ensure GA4 tag is present on all pages via GTM or global template',
                affected_urls=missing_pages[:10]  # Limit to first 10
            )
            session.add(issue)

        # Check 2: Multiple GTM containers (usually an error)
        all_gtm_ids = set()
        for page in gtm_pages:
            if page.gtm_container_ids:
                all_gtm_ids.update(page.gtm_container_ids)

        if len(all_gtm_ids) > 1:
            issue = Issue(
                audit_id=audit.audit_id,
                severity='warning',
                category='implementation',
                title='Multiple GTM containers detected',
                description=f'Found {len(all_gtm_ids)} different GTM containers: {", ".join(all_gtm_ids)}',
                recommendation='Verify if multiple containers are intentional. Usually one container per property.'
            )
            session.add(issue)

        # Check 3: Important pages missing tags
        important_page_types = ['homepage', 'checkout', 'confirmation']
        for page_type in important_page_types:
            important_pages = [p for p in pages if p.page_type == page_type]
            if important_pages:
                missing_ga4 = [p for p in important_pages if not p.has_ga4]
                if missing_ga4:
                    issue = Issue(
                        audit_id=audit.audit_id,
                        severity='critical',
                        category='implementation',
                        title=f'GA4 missing on {page_type} page(s)',
                        description=f'Critical {page_type} pages do not have GA4 tracking',
                        recommendation='Add GA4 to these high-value pages immediately',
                        affected_urls=[p.url for p in missing_ga4]
                    )
                    session.add(issue)

        # Check 4: Privacy compliance
        consent_pages = [p for p in pages if p.has_consent_banner]
        consent_coverage = len(consent_pages) / len(pages) * 100

        if consent_coverage < 50:
            issue = Issue(
                audit_id=audit.audit_id,
                severity='critical',
                category='privacy',
                title='Missing consent management on most pages',
                description=f'Only {consent_coverage:.0f}% of pages have a consent banner',
                recommendation='Implement consistent cookie consent across all pages (GDPR/CCPA requirement)'
            )
            session.add(issue)

        # Check 5: Performance - too many tracking scripts
        avg_tracking_scripts = sum(p.tracking_scripts or 0 for p in pages) / len(pages)

        if avg_tracking_scripts > 10:
            issue = Issue(
                audit_id=audit.audit_id,
                severity='warning',
                category='performance',
                title=f'High number of tracking scripts ({avg_tracking_scripts:.0f} average)',
                description='Many tracking scripts can slow down page load times',
                recommendation='Consolidate tracking into GTM and remove unnecessary tags'
            )
            session.add(issue)

        # Check 6: Mixed GA4 and Universal Analytics (migration issue)
        if any(p.has_universal_analytics for p in pages) and any(p.has_ga4 for p in pages):
            issue = Issue(
                audit_id=audit.audit_id,
                severity='info',
                category='implementation',
                title='Both Universal Analytics and GA4 detected',
                description='Site is using both UA and GA4 (dual tagging)',
                recommendation='Plan UA removal by July 1, 2024 when UA stops processing data'
            )
            session.add(issue)

        session.flush()

    def _calculate_scores(self, session, audit: Audit):
        """Calculate audit scores using database function"""

        try:
            # Call PostgreSQL function to calculate scores
            result = session.execute(
                text("SELECT calculate_audit_score(:audit_id)"),
                {"audit_id": audit.audit_id}
            )
            overall_score = result.scalar()

            # Count issues by severity
            critical_count = session.query(Issue).filter(
                Issue.audit_id == audit.audit_id,
                Issue.severity == 'critical'
            ).count()

            warning_count = session.query(Issue).filter(
                Issue.audit_id == audit.audit_id,
                Issue.severity == 'warning'
            ).count()

            info_count = session.query(Issue).filter(
                Issue.audit_id == audit.audit_id,
                Issue.severity == 'info'
            ).count()

            audit.critical_issues = critical_count
            audit.warning_issues = warning_count
            audit.info_issues = info_count

            logger.info(
                f"Calculated scores for audit {audit.audit_id}: "
                f"Overall={overall_score}, Critical={critical_count}, Warnings={warning_count}"
            )

        except Exception as e:
            logger.error(f"Error calculating scores: {e}")
            # Fallback to basic scoring if function fails
            audit.overall_score = 50.0

    def get_audit_summary(self, audit_id: str) -> Dict:
        """Get summary of audit results"""
        session = self.Session()

        try:
            audit = session.query(Audit).filter(Audit.audit_id == audit_id).first()

            if not audit:
                raise ValueError(f"Audit {audit_id} not found")

            pages = session.query(Page).filter(Page.audit_id == audit_id).all()
            issues = session.query(Issue).filter(Issue.audit_id == audit_id).all()

            return {
                'audit_id': str(audit.audit_id),
                'site_url': audit.site_url,
                'overall_score': float(audit.overall_score) if audit.overall_score else 0,
                'implementation_score': float(audit.implementation_score) if audit.implementation_score else 0,
                'compliance_score': float(audit.compliance_score) if audit.compliance_score else 0,
                'performance_score': float(audit.performance_score) if audit.performance_score else 0,
                'pages_crawled': len(pages),
                'critical_issues': audit.critical_issues,
                'warning_issues': audit.warning_issues,
                'info_issues': audit.info_issues,
                'issues': [
                    {
                        'severity': issue.severity,
                        'category': issue.category,
                        'title': issue.title,
                        'recommendation': issue.recommendation
                    }
                    for issue in issues
                ],
                'tag_coverage': {
                    'ga4': sum(1 for p in pages if p.has_ga4) / len(pages) * 100 if pages else 0,
                    'gtm': sum(1 for p in pages if p.has_gtm) / len(pages) * 100 if pages else 0,
                    'consent': sum(1 for p in pages if p.has_consent_banner) / len(pages) * 100 if pages else 0
                },
                'started_at': audit.started_at.isoformat() if audit.started_at else None,
                'completed_at': audit.completed_at.isoformat() if audit.completed_at else None
            }

        finally:
            session.close()
