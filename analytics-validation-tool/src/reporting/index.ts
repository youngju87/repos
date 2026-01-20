/**
 * Reporting Module
 *
 * Report aggregation, formatting, and alerting for analytics validation.
 */

// Core types
export * from './types';

// Report building
export {
  ReportBuilder,
  createReportBuilder,
  type ReportBuilderConfig,
  type PageReportInput,
} from './ReportBuilder';

// Alert management
export { AlertManager } from './AlertManager';

// CI detection
export { detectCIContext, getExitCode } from './CIDetector';

// Formatters
export * from './formatters';

// Dispatchers
export * from './dispatchers';
