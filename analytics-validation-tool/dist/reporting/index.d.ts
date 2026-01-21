/**
 * Reporting Module
 *
 * Report aggregation, formatting, and alerting for analytics validation.
 */
export * from './types';
export { ReportBuilder, createReportBuilder, type ReportBuilderConfig, type PageReportInput, } from './ReportBuilder';
export { AlertManager } from './AlertManager';
export { detectCIContext, getExitCode } from './CIDetector';
export * from './formatters';
export * from './dispatchers';
//# sourceMappingURL=index.d.ts.map