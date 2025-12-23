"""
SQLAlchemy ORM models for Analytics Audit Engine
"""

from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Boolean, Numeric, Text, DateTime,
    ForeignKey, ARRAY, JSON
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid

Base = declarative_base()


class Audit(Base):
    """Main audit run record"""
    __tablename__ = 'audits'

    audit_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    site_url = Column(String(1000), nullable=False)
    site_domain = Column(String(255), nullable=False)

    # Execution
    started_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    completed_at = Column(DateTime)
    status = Column(String(20), nullable=False, default='running')

    # Crawl stats
    total_pages_requested = Column(Integer, default=0)
    pages_successfully_crawled = Column(Integer, default=0)
    pages_failed = Column(Integer, default=0)

    # Scores
    overall_score = Column(Numeric(5, 2))
    implementation_score = Column(Numeric(5, 2))
    compliance_score = Column(Numeric(5, 2))
    performance_score = Column(Numeric(5, 2))

    # Issue counts
    critical_issues = Column(Integer, default=0)
    warning_issues = Column(Integer, default=0)
    info_issues = Column(Integer, default=0)

    # Configuration
    max_pages_config = Column(Integer, default=50)
    audit_config = Column(JSONB)

    # Metadata
    created_by = Column(String(100))
    notes = Column(Text)

    # Relationships
    pages = relationship("Page", back_populates="audit", cascade="all, delete-orphan")
    issues = relationship("Issue", back_populates="audit", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Audit(id={self.audit_id}, url={self.site_url}, score={self.overall_score})>"


class Page(Base):
    """Individual crawled page"""
    __tablename__ = 'pages'

    page_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    audit_id = Column(UUID(as_uuid=True), ForeignKey('audits.audit_id'), nullable=False)

    # Page details
    url = Column(String(1000), nullable=False)
    page_path = Column(String(500))
    title = Column(String(500))
    page_type = Column(String(50))

    # Response
    status_code = Column(Integer)
    load_time_seconds = Column(Numeric(6, 3))

    # Tag detection
    has_ga4 = Column(Boolean, default=False)
    ga4_measurement_ids = Column(ARRAY(String))
    has_gtm = Column(Boolean, default=False)
    gtm_container_ids = Column(ARRAY(String))
    has_universal_analytics = Column(Boolean, default=False)
    ua_tracking_ids = Column(ARRAY(String))

    # Other tracking
    has_facebook_pixel = Column(Boolean, default=False)
    facebook_pixel_ids = Column(ARRAY(String))
    has_linkedin_insight = Column(Boolean, default=False)
    has_hotjar = Column(Boolean, default=False)
    has_google_ads = Column(Boolean, default=False)

    # Consent & Privacy
    has_consent_banner = Column(Boolean, default=False)
    consent_platform = Column(String(50))
    has_privacy_policy_link = Column(Boolean, default=False)

    # dataLayer
    has_datalayer = Column(Boolean, default=False)
    datalayer_defined_before_gtm = Column(Boolean)
    datalayer_events = Column(JSONB)

    # Performance
    total_scripts = Column(Integer)
    tracking_scripts = Column(Integer)

    # Metadata
    html_content = Column(Text)
    crawled_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    audit = relationship("Audit", back_populates="pages")
    tags = relationship("Tag", back_populates="page", cascade="all, delete-orphan")
    datalayer_event_records = relationship("DataLayerEvent", back_populates="page", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Page(url={self.url}, ga4={self.has_ga4}, gtm={self.has_gtm})>"


class Issue(Base):
    """Problem found during audit"""
    __tablename__ = 'issues'

    issue_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    audit_id = Column(UUID(as_uuid=True), ForeignKey('audits.audit_id'), nullable=False)
    page_id = Column(UUID(as_uuid=True), ForeignKey('pages.page_id'))

    # Classification
    severity = Column(String(20), nullable=False)  # critical, warning, info
    category = Column(String(50), nullable=False)  # implementation, privacy, performance, seo

    # Description
    title = Column(String(200), nullable=False)
    description = Column(Text)
    recommendation = Column(Text)

    # Context
    affected_urls = Column(ARRAY(String))
    code_snippet = Column(Text)

    # Metadata
    detected_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    audit = relationship("Audit", back_populates="issues")

    def __repr__(self):
        return f"<Issue(severity={self.severity}, title={self.title})>"


class Tag(Base):
    """Individual tracking tag detected"""
    __tablename__ = 'tags'

    tag_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    page_id = Column(UUID(as_uuid=True), ForeignKey('pages.page_id'), nullable=False)

    # Tag details
    tag_type = Column(String(50), nullable=False)
    tag_identifier = Column(String(100))

    # Implementation
    load_position = Column(String(20))
    is_async = Column(Boolean)
    is_defer = Column(Boolean)

    # Configuration
    tag_config = Column(JSONB)

    # Metadata
    detected_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    page = relationship("Page", back_populates="tags")

    def __repr__(self):
        return f"<Tag(type={self.tag_type}, id={self.tag_identifier})>"


class DataLayerEvent(Base):
    """dataLayer event detected"""
    __tablename__ = 'datalayer_events'

    event_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    page_id = Column(UUID(as_uuid=True), ForeignKey('pages.page_id'), nullable=False)

    # Event details
    event_name = Column(String(100))
    event_parameters = Column(JSONB)
    event_index = Column(Integer)

    # Metadata
    detected_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    page = relationship("Page", back_populates="datalayer_event_records")

    def __repr__(self):
        return f"<DataLayerEvent(name={self.event_name})>"
