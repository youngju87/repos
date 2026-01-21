/**
 * CI/CD Context Detector
 *
 * Detects CI/CD platform and extracts build context from environment variables.
 */
import type { CIContext } from './types';
/**
 * Detect CI/CD context from environment variables
 */
export declare function detectCIContext(): CIContext;
/**
 * Get exit code based on report status
 */
export declare function getExitCode(status: 'passed' | 'failed' | 'degraded' | 'error', failOnWarnings?: boolean): number;
//# sourceMappingURL=CIDetector.d.ts.map