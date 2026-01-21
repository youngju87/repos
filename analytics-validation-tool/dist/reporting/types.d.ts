/**
 * Reporting Types
 *
 * Type definitions for reporting and alerting system.
 */
import type { PageScanResult } from '../types';
import type { TagDetectionResult } from '../detection/types';
import type { ValidationReport } from '../validation/types';
/**
 * Issue severity levels
 */
export type IssueSeverity = 'critical' | 'error' | 'warning' | 'info';
/**
 * Report status
 */
export type ReportStatus = 'passed' | 'failed' | 'degraded' | 'error';
/**
 * Comparison result (for regression detection)
 */
export type ComparisonStatus = 'improved' | 'same' | 'degraded' | 'new';
/**
 * Single issue found during validation
 */
export interface Issue {
    /** Unique issue ID */
    id: string;
    /** Issue severity */
    severity: IssueSeverity;
    /** Rule that failed */
    ruleId: string;
    /** Rule name */
    ruleName: string;
    /** Short description */
    message: string;
    /** Detailed explanation */
    details?: string;
    /** Platform this issue relates to */
    platform?: string;
    /** Page URL where issue occurred */
    pageUrl: string;
    /** Evidence supporting this issue */
    evidence: Array<{
        type: string;
        description: string;
        actual?: unknown;
        expected?: unknown;
    }>;
    /** Suggested remediation */
    suggestion?: string;
    /** Issue category */
    category?: string;
    /** Link to documentation */
    documentationUrl?: string;
}
/**
 * Issue summary grouped by severity
 */
export interface IssueSummary {
    /** Total issue count */
    total: number;
    /** Critical issues */
    critical: number;
    /** Error issues */
    error: number;
    /** Warning issues */
    warning: number;
    /** Info issues */
    info: number;
    /** Issues by platform */
    byPlatform: Record<string, number>;
    /** Issues by category */
    byCategory: Record<string, number>;
    /** All issues */
    issues: Issue[];
}
/**
 * Report for a single page scan
 */
export interface PageReport {
    /** Page URL */
    url: string;
    /** Scan timestamp */
    timestamp: number;
    /** Scan ID */
    scanId: string;
    /** Detection ID */
    detectionId?: string;
    /** Validation report ID */
    validationId?: string;
    /** Page scan result */
    scan: PageScanResult;
    /** Tag detection result */
    detection?: TagDetectionResult;
    /** Validation report */
    validation?: ValidationReport;
    /** Issues found on this page */
    issues: Issue[];
    /** Page-level status */
    status: ReportStatus;
    /** Page-level summary */
    summary: {
        /** Scan successful */
        scanSuccess: boolean;
        /** Tags detected */
        tagsDetected: number;
        /** Validation score (0-100) */
        validationScore?: number;
        /** Rules passed */
        rulesPassed: number;
        /** Rules failed */
        rulesFailed: number;
        /** Issue counts */
        issues: IssueSummary;
    };
    /** Performance metrics */
    performance: {
        /** Scan duration (ms) */
        scanDuration: number;
        /** Detection duration (ms) */
        detectionDuration?: number;
        /** Validation duration (ms) */
        validationDuration?: number;
        /** Total duration (ms) */
        totalDuration: number;
    };
}
/**
 * Report for a journey execution
 * (To be implemented in Phase 5)
 */
export interface JourneyReport {
    /** Journey ID */
    id: string;
    /** Journey name */
    name: string;
    /** Journey status */
    status: ReportStatus;
    /** Step reports */
    steps: Array<{
        stepName: string;
        pageReport: PageReport;
        stepStatus: ReportStatus;
    }>;
    /** Journey-level issues */
    issues: Issue[];
    /** Journey summary */
    summary: IssueSummary;
}
/**
 * Thresholds for determining run status
 */
export interface RunThresholds {
    /** Max allowed critical issues */
    maxCritical?: number;
    /** Max allowed errors */
    maxErrors?: number;
    /** Max allowed warnings */
    maxWarnings?: number;
    /** Minimum validation score */
    minScore?: number;
    /** Fail on warnings */
    failOnWarnings?: boolean;
}
/**
 * Baseline for regression detection
 */
export interface RunBaseline {
    /** Baseline run ID */
    runId: string;
    /** Baseline timestamp */
    timestamp: number;
    /** Baseline issue count */
    issueCount: number;
    /** Baseline score */
    score: number;
}
/**
 * Comparison with baseline
 */
export interface BaselineComparison {
    /** Baseline used */
    baseline: RunBaseline;
    /** Comparison status */
    status: ComparisonStatus;
    /** Change in issue count */
    issueCountDelta: number;
    /** Change in score */
    scoreDelta: number;
    /** New issues */
    newIssues: Issue[];
    /** Resolved issues */
    resolvedIssues: string[];
    /** Degraded issues (worse severity) */
    degradedIssues: Issue[];
}
/**
 * Complete run report
 */
export interface RunReport {
    /** Unique run ID */
    id: string;
    /** Run timestamp */
    timestamp: number;
    /** Run environment */
    environment: string;
    /** Run configuration */
    config: {
        /** Target URLs */
        urls: string[];
        /** Thresholds */
        thresholds: RunThresholds;
        /** Baseline (if provided) */
        baseline?: RunBaseline;
    };
    /** Page reports */
    pages: PageReport[];
    /** Journey reports */
    journeys: JourneyReport[];
    /** Overall run status */
    status: ReportStatus;
    /** Overall summary */
    summary: {
        /** Total pages scanned */
        totalPages: number;
        /** Total journeys executed */
        totalJourneys: number;
        /** Pages passed */
        pagesPassed: number;
        /** Pages failed */
        pagesFailed: number;
        /** Overall validation score (0-100) */
        overallScore: number;
        /** Total issues */
        issues: IssueSummary;
        /** Performance totals */
        totalDuration: number;
    };
    /** Baseline comparison */
    baselineComparison?: BaselineComparison;
    /** Metadata */
    metadata: {
        /** Tool version */
        toolVersion: string;
        /** CI/CD context */
        ci?: {
            /** CI platform */
            platform: string;
            /** Build ID */
            buildId?: string;
            /** Commit SHA */
            commitSha?: string;
            /** Branch */
            branch?: string;
            /** PR number */
            prNumber?: string;
        };
        /** Custom metadata */
        custom?: Record<string, unknown>;
    };
}
/**
 * Report formatter interface
 */
export interface ReportFormatter {
    /** Format type identifier */
    readonly format: string;
    /** Format a run report */
    formatRun(report: RunReport): string;
    /** Format a page report */
    formatPage(report: PageReport): string;
    /** Format issues */
    formatIssues(issues: Issue[]): string;
}
/**
 * Report output options
 */
export interface ReportOutputOptions {
    /** Output file path */
    outputPath?: string;
    /** Whether to write to console */
    console?: boolean;
    /** Format to use */
    format: 'json' | 'markdown' | 'html' | 'console';
    /** Pretty print JSON */
    prettyPrint?: boolean;
}
/**
 * Alert severity threshold
 */
export interface AlertThreshold {
    /** Minimum severity to trigger alert */
    minSeverity: IssueSeverity;
    /** Minimum issue count */
    minIssueCount?: number;
    /** Only alert on new issues */
    onlyNew?: boolean;
    /** Only alert on regressions */
    onlyRegressions?: boolean;
}
/**
 * Alert context
 */
export interface AlertContext {
    /** Report being alerted on */
    report: RunReport;
    /** Issues that triggered alert */
    triggerIssues: Issue[];
    /** Alert threshold used */
    threshold: AlertThreshold;
    /** Alert message */
    message: string;
}
/**
 * Alert dispatcher interface
 */
export interface AlertDispatcher {
    /** Dispatcher type */
    readonly type: string;
    /** Send alert */
    send(context: AlertContext): Promise<void>;
}
/**
 * Slack alert configuration
 */
export interface SlackAlertConfig {
    /** Webhook URL */
    webhookUrl: string;
    /** Channel (optional, webhook default used if not specified) */
    channel?: string;
    /** Username */
    username?: string;
    /** Icon emoji */
    iconEmoji?: string;
}
/**
 * Email alert configuration
 */
export interface EmailAlertConfig {
    /** SMTP host */
    host: string;
    /** SMTP port */
    port: number;
    /** Use TLS */
    secure?: boolean;
    /** Auth credentials */
    auth?: {
        user: string;
        pass: string;
    };
    /** From address */
    from: string;
    /** To addresses */
    to: string[];
    /** CC addresses */
    cc?: string[];
    /** Subject template */
    subjectTemplate?: string;
}
/**
 * Generic webhook alert configuration
 */
export interface WebhookAlertConfig {
    /** Webhook URL */
    url: string;
    /** HTTP method */
    method?: 'POST' | 'PUT';
    /** Custom headers */
    headers?: Record<string, string>;
    /** Payload template */
    payloadTemplate?: string;
}
/**
 * Alert configuration
 */
export interface AlertConfig {
    /** Alert type */
    type: 'slack' | 'email' | 'webhook';
    /** Alert threshold */
    threshold: AlertThreshold;
    /** Type-specific config */
    config: SlackAlertConfig | EmailAlertConfig | WebhookAlertConfig;
    /** Enabled */
    enabled?: boolean;
}
/**
 * CI/CD exit code
 */
export declare enum ExitCode {
    /** All checks passed */
    SUCCESS = 0,
    /** Warnings only (configurable) */
    WARNINGS = 1,
    /** Errors detected */
    ERRORS = 2
}
/**
 * CI/CD context detection
 */
export interface CIContext {
    /** CI platform */
    platform: 'github' | 'gitlab' | 'jenkins' | 'circle' | 'travis' | 'unknown';
    /** Build ID */
    buildId?: string;
    /** Commit SHA */
    commitSha?: string;
    /** Branch */
    branch?: string;
    /** PR/MR number */
    prNumber?: string;
    /** Build URL */
    buildUrl?: string;
    /** Is PR/MR build */
    isPullRequest: boolean;
}
//# sourceMappingURL=types.d.ts.map