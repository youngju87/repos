-- Analytics Audit Engine Database Schema
-- Stores audit results, historical trends, and findings

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- AUDITS TABLE (Main audit runs)
-- ============================================

CREATE TABLE audits (
    audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_url VARCHAR(1000) NOT NULL,
    site_domain VARCHAR(255) NOT NULL,

    -- Audit execution
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'running', -- running, completed, failed

    -- Crawl stats
    total_pages_requested INT DEFAULT 0,
    pages_successfully_crawled INT DEFAULT 0,
    pages_failed INT DEFAULT 0,

    -- Overall scores (0-100)
    overall_score DECIMAL(5,2),
    implementation_score DECIMAL(5,2),
    compliance_score DECIMAL(5,2),
    performance_score DECIMAL(5,2),

    -- Issue counts
    critical_issues INT DEFAULT 0,
    warning_issues INT DEFAULT 0,
    info_issues INT DEFAULT 0,

    -- Configuration
    max_pages_config INT DEFAULT 50,
    audit_config JSONB,

    -- Metadata
    created_by VARCHAR(100),
    notes TEXT
);

CREATE INDEX idx_audits_domain ON audits(site_domain);
CREATE INDEX idx_audits_started ON audits(started_at);
CREATE INDEX idx_audits_status ON audits(status);

-- ============================================
-- PAGES TABLE (Individual pages crawled)
-- ============================================

CREATE TABLE pages (
    page_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(audit_id) ON DELETE CASCADE,

    -- Page details
    url VARCHAR(1000) NOT NULL,
    page_path VARCHAR(500),
    title VARCHAR(500),
    page_type VARCHAR(50), -- homepage, product, checkout, content, etc.

    -- Response
    status_code INT,
    load_time_seconds DECIMAL(6,3),

    -- Tag detection
    has_ga4 BOOLEAN DEFAULT FALSE,
    ga4_measurement_ids TEXT[],
    has_gtm BOOLEAN DEFAULT FALSE,
    gtm_container_ids TEXT[],
    has_universal_analytics BOOLEAN DEFAULT FALSE,
    ua_tracking_ids TEXT[],

    -- Other tracking
    has_facebook_pixel BOOLEAN DEFAULT FALSE,
    facebook_pixel_ids TEXT[],
    has_linkedin_insight BOOLEAN DEFAULT FALSE,
    has_hotjar BOOLEAN DEFAULT FALSE,
    has_google_ads BOOLEAN DEFAULT FALSE,

    -- Consent & Privacy
    has_consent_banner BOOLEAN DEFAULT FALSE,
    consent_platform VARCHAR(50),
    has_privacy_policy_link BOOLEAN DEFAULT FALSE,

    -- dataLayer
    has_datalayer BOOLEAN DEFAULT FALSE,
    datalayer_defined_before_gtm BOOLEAN,
    datalayer_events JSONB,

    -- Performance
    total_scripts INT,
    tracking_scripts INT,

    -- Metadata
    html_content TEXT, -- Store for re-analysis
    crawled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(audit_id, url)
);

CREATE INDEX idx_pages_audit ON pages(audit_id);
CREATE INDEX idx_pages_url ON pages(url);
CREATE INDEX idx_pages_has_ga4 ON pages(has_ga4);
CREATE INDEX idx_pages_has_gtm ON pages(has_gtm);

-- ============================================
-- ISSUES TABLE (Problems found during audit)
-- ============================================

CREATE TABLE issues (
    issue_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(audit_id) ON DELETE CASCADE,
    page_id UUID REFERENCES pages(page_id) ON DELETE CASCADE,

    -- Issue classification
    severity VARCHAR(20) NOT NULL, -- critical, warning, info
    category VARCHAR(50) NOT NULL, -- implementation, privacy, performance, seo

    -- Description
    title VARCHAR(200) NOT NULL,
    description TEXT,
    recommendation TEXT,

    -- Context
    affected_urls TEXT[], -- If affects multiple pages
    code_snippet TEXT, -- Example of the issue

    -- Metadata
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_issues_audit ON issues(audit_id);
CREATE INDEX idx_issues_severity ON issues(severity);
CREATE INDEX idx_issues_category ON issues(category);

-- ============================================
-- TAGS TABLE (All tags detected)
-- ============================================

CREATE TABLE tags (
    tag_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES pages(page_id) ON DELETE CASCADE,

    -- Tag details
    tag_type VARCHAR(50) NOT NULL, -- ga4, gtm, facebook_pixel, etc.
    tag_identifier VARCHAR(100), -- G-XXXXXX, GTM-XXXXX, etc.

    -- Implementation details
    load_position VARCHAR(20), -- head, body, footer
    is_async BOOLEAN,
    is_defer BOOLEAN,

    -- Configuration (if parseable)
    tag_config JSONB,

    -- Detected at
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tags_page ON tags(page_id);
CREATE INDEX idx_tags_type ON tags(tag_type);

-- ============================================
-- DATALAYER_EVENTS TABLE
-- ============================================

CREATE TABLE datalayer_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES pages(page_id) ON DELETE CASCADE,

    -- Event details
    event_name VARCHAR(100),
    event_parameters JSONB,
    event_index INT, -- Order in dataLayer array

    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_datalayer_page ON datalayer_events(page_id);
CREATE INDEX idx_datalayer_event_name ON datalayer_events(event_name);

-- ============================================
-- AUDIT_SUMMARY VIEW
-- ============================================

CREATE OR REPLACE VIEW vw_audit_summary AS
SELECT
    a.audit_id,
    a.site_url,
    a.started_at,
    a.completed_at,
    a.overall_score,
    a.pages_successfully_crawled,

    -- Tag coverage
    COUNT(DISTINCT CASE WHEN p.has_ga4 THEN p.page_id END) as pages_with_ga4,
    COUNT(DISTINCT CASE WHEN p.has_gtm THEN p.page_id END) as pages_with_gtm,
    ROUND(COUNT(DISTINCT CASE WHEN p.has_ga4 THEN p.page_id END)::numeric /
          NULLIF(COUNT(p.page_id), 0) * 100, 2) as ga4_coverage_pct,

    -- Issue counts
    COUNT(DISTINCT CASE WHEN i.severity = 'critical' THEN i.issue_id END) as critical_count,
    COUNT(DISTINCT CASE WHEN i.severity = 'warning' THEN i.issue_id END) as warning_count,

    -- Privacy
    COUNT(DISTINCT CASE WHEN p.has_consent_banner THEN p.page_id END) as pages_with_consent,

    -- Performance
    AVG(p.load_time_seconds) as avg_load_time,
    AVG(p.tracking_scripts) as avg_tracking_scripts

FROM audits a
LEFT JOIN pages p ON a.audit_id = p.audit_id
LEFT JOIN issues i ON a.audit_id = i.audit_id
WHERE a.status = 'completed'
GROUP BY a.audit_id;

-- ============================================
-- ISSUE SUMMARY VIEW
-- ============================================

CREATE OR REPLACE VIEW vw_issue_summary AS
SELECT
    i.audit_id,
    i.category,
    i.severity,
    COUNT(*) as issue_count,
    array_agg(DISTINCT i.title) as issue_titles
FROM issues i
GROUP BY i.audit_id, i.category, i.severity;

-- ============================================
-- TAG COVERAGE VIEW
-- ============================================

CREATE OR REPLACE VIEW vw_tag_coverage AS
SELECT
    a.audit_id,
    a.site_domain,
    COUNT(DISTINCT p.page_id) as total_pages,

    -- GA4
    COUNT(DISTINCT CASE WHEN p.has_ga4 THEN p.page_id END) as ga4_pages,
    ROUND(COUNT(DISTINCT CASE WHEN p.has_ga4 THEN p.page_id END)::numeric /
          NULLIF(COUNT(p.page_id), 0) * 100, 2) as ga4_coverage,

    -- GTM
    COUNT(DISTINCT CASE WHEN p.has_gtm THEN p.page_id END) as gtm_pages,
    ROUND(COUNT(DISTINCT CASE WHEN p.has_gtm THEN p.page_id END)::numeric /
          NULLIF(COUNT(p.page_id), 0) * 100, 2) as gtm_coverage,

    -- Consent
    COUNT(DISTINCT CASE WHEN p.has_consent_banner THEN p.page_id END) as consent_pages,
    ROUND(COUNT(DISTINCT CASE WHEN p.has_consent_banner THEN p.page_id END)::numeric /
          NULLIF(COUNT(p.page_id), 0) * 100, 2) as consent_coverage

FROM audits a
JOIN pages p ON a.audit_id = p.audit_id
GROUP BY a.audit_id, a.site_domain;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Calculate overall audit score
CREATE OR REPLACE FUNCTION calculate_audit_score(p_audit_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    v_implementation_score DECIMAL(5,2);
    v_compliance_score DECIMAL(5,2);
    v_performance_score DECIMAL(5,2);
    v_overall_score DECIMAL(5,2);
BEGIN
    -- Implementation score (tag coverage + correct setup)
    SELECT
        CASE
            WHEN COUNT(p.page_id) = 0 THEN 0
            ELSE (
                -- GA4 coverage worth 30 points
                (COUNT(CASE WHEN p.has_ga4 THEN 1 END)::numeric / COUNT(p.page_id) * 30) +
                -- GTM coverage worth 30 points
                (COUNT(CASE WHEN p.has_gtm THEN 1 END)::numeric / COUNT(p.page_id) * 30) +
                -- dataLayer properly configured worth 20 points
                (COUNT(CASE WHEN p.has_datalayer AND p.datalayer_defined_before_gtm THEN 1 END)::numeric / NULLIF(COUNT(CASE WHEN p.has_gtm THEN 1 END), 0) * 20) +
                -- No duplicate tags worth 20 points (simplified)
                20
            )
        END
    INTO v_implementation_score
    FROM pages p
    WHERE p.audit_id = p_audit_id;

    -- Compliance score (privacy + consent)
    SELECT
        CASE
            WHEN COUNT(p.page_id) = 0 THEN 0
            ELSE (
                -- Consent banner present worth 50 points
                (COUNT(CASE WHEN p.has_consent_banner THEN 1 END)::numeric / COUNT(p.page_id) * 50) +
                -- Privacy policy link worth 30 points
                (COUNT(CASE WHEN p.has_privacy_policy_link THEN 1 END)::numeric / COUNT(p.page_id) * 30) +
                -- Base points
                20
            )
        END
    INTO v_compliance_score
    FROM pages p
    WHERE p.audit_id = p_audit_id;

    -- Performance score (fewer tracking scripts = better)
    SELECT
        CASE
            WHEN AVG(p.tracking_scripts) <= 5 THEN 100
            WHEN AVG(p.tracking_scripts) <= 10 THEN 80
            WHEN AVG(p.tracking_scripts) <= 15 THEN 60
            ELSE 40
        END
    INTO v_performance_score
    FROM pages p
    WHERE p.audit_id = p_audit_id;

    -- Overall score (weighted average)
    v_overall_score := (
        v_implementation_score * 0.5 +
        v_compliance_score * 0.3 +
        v_performance_score * 0.2
    );

    -- Update audit record
    UPDATE audits
    SET
        implementation_score = v_implementation_score,
        compliance_score = v_compliance_score,
        performance_score = v_performance_score,
        overall_score = v_overall_score
    WHERE audit_id = p_audit_id;

    RETURN v_overall_score;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE audits IS 'Main audit runs and their overall results';
COMMENT ON TABLE pages IS 'Individual pages crawled during each audit';
COMMENT ON TABLE issues IS 'Problems and recommendations found during audits';
COMMENT ON TABLE tags IS 'Detailed information about each tracking tag detected';
COMMENT ON TABLE datalayer_events IS 'dataLayer events found on pages';
