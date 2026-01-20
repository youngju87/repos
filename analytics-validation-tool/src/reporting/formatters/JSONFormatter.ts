/**
 * JSON Formatter
 *
 * Formats reports as machine-readable JSON.
 */

import type { ReportFormatter, RunReport, PageReport, Issue } from '../types';

/**
 * JSON formatter options
 */
export interface JSONFormatterOptions {
  /** Pretty print output */
  prettyPrint?: boolean;

  /** Indentation (if pretty print) */
  indent?: number;
}

/**
 * JSON Report Formatter
 */
export class JSONFormatter implements ReportFormatter {
  readonly format = 'json';

  constructor(private options: JSONFormatterOptions = {}) {
    this.options.prettyPrint = options.prettyPrint ?? true;
    this.options.indent = options.indent ?? 2;
  }

  /**
   * Format a run report
   */
  formatRun(report: RunReport): string {
    if (this.options.prettyPrint) {
      return JSON.stringify(report, null, this.options.indent);
    }
    return JSON.stringify(report);
  }

  /**
   * Format a page report
   */
  formatPage(report: PageReport): string {
    if (this.options.prettyPrint) {
      return JSON.stringify(report, null, this.options.indent);
    }
    return JSON.stringify(report);
  }

  /**
   * Format issues
   */
  formatIssues(issues: Issue[]): string {
    if (this.options.prettyPrint) {
      return JSON.stringify(issues, null, this.options.indent);
    }
    return JSON.stringify(issues);
  }
}
