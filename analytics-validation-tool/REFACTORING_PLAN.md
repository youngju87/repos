# Production-Level Refactoring Plan

## Executive Summary

This document outlines a comprehensive refactoring strategy to transform the Analytics Validation Tool into a best-in-class production system. Based on detailed code analysis, we've identified 44 improvement areas across 6 categories.

## Implementation Strategy

### Phase 1: Foundation (Critical - Week 1)
**Goal**: Fix critical reliability and safety issues

#### 1.1 Structured Logging ✅
- **Status**: COMPLETED
- **Files Created**:
  - `src/core/utils/logger.ts` - Logger interface and implementations
- **Next Steps**: Integrate into all modules

#### 1.2 Input Validation ✅
- **Status**: COMPLETED
- **Files Created**:
  - `src/core/utils/validation.ts` - Comprehensive validation utilities
- **Next Steps**: Apply to all public APIs

#### 1.3 Memory Leak Fixes
- **Target**: `src/core/utils/timing.ts`
- **Issue**: Unbounded marks accumulation in Timer class
- **Solution**:
  ```typescript
  private marks: Map<string, number> = new Map();
  private maxMarks = 1000; // Configurable limit

  mark(label: string): void {
    if (this.marks.size >= this.maxMarks) {
      // Remove oldest mark
      const firstKey = this.marks.keys().next().value;
      this.marks.delete(firstKey);
    }
    this.marks.set(label, performance.now());
  }
  ```

#### 1.4 Error Context Enhancement
- **Target**: All error classes in `src/core/utils/errors.ts`
- **Add**: Context field to all errors
  ```typescript
  export class AVTError extends Error {
    public readonly timestamp: number;
    public readonly context?: Record<string, unknown>;

    constructor(
      component: string,
      message: string,
      context?: Record<string, unknown>
    ) {
      super(`[${component}] ${message}`);
      this.timestamp = Date.now();
      this.context = context;
    }
  }
  ```

### Phase 2: Code Quality (High Priority - Week 2)

#### 2.1 Abstract BaseCollector
- **Target**: Create `src/core/collectors/BaseCollector.ts`
- **Benefits**: Reduce 300+ lines of duplication
- **Design**:
  ```typescript
  export abstract class BaseCollector<TData, TOptions = CollectorOptions>
    implements Collector<TData> {

    protected logger: Logger;
    protected attached = false;
    protected cleanupFunctions: Array<() => void> = [];

    constructor(protected options: TOptions) {
      this.logger = getLogger({ collector: this.constructor.name });
    }

    async attach(page: Page): Promise<void> {
      if (this.attached) {
        throw new CollectorError(
          this.constructor.name,
          'Collector already attached'
        );
      }

      try {
        await this.doAttach(page);
        this.attached = true;
        this.logger.debug('Collector attached');
      } catch (error) {
        this.logger.error('Failed to attach collector', error as Error);
        throw wrapError(error, this.constructor.name, 'Failed to attach');
      }
    }

    async detach(): Promise<void> {
      if (!this.attached) {
        return;
      }

      try {
        await this.doDetach();

        // Execute cleanup functions
        for (const cleanup of this.cleanupFunctions) {
          try {
            cleanup();
          } catch (error) {
            this.logger.warn('Cleanup function failed', {
              error: error instanceof Error ? error.message : String(error)
            });
          }
        }

        this.attached = false;
        this.cleanupFunctions = [];
        this.logger.debug('Collector detached');
      } catch (error) {
        this.logger.error('Failed to detach collector', error as Error);
        throw wrapError(error, this.constructor.name, 'Failed to detach');
      }
    }

    abstract doAttach(page: Page): Promise<void>;
    abstract doDetach(): Promise<void>;
    abstract collect(): Promise<TData>;
  }
  ```

#### 2.2 Configuration Validation
- **Target**: All config interfaces
- **Add**: Validate methods to each config object
  ```typescript
  // src/core/browser/types.ts
  export function validateBrowserPoolConfig(
    config: Partial<BrowserPoolConfig>
  ): BrowserPoolConfig {
    const validated = { ...DEFAULT_POOL_CONFIG, ...config };

    validatePositiveNumber(validated.minBrowsers, 'minBrowsers', { min: 0 });
    validatePositiveNumber(validated.maxBrowsers, 'maxBrowsers', { min: 1 });

    if (validated.maxBrowsers < validated.minBrowsers) {
      throw new ValidationError(
        'maxBrowsers must be >= minBrowsers',
        'maxBrowsers'
      );
    }

    if (validated.maxContextsPerBrowser < 1) {
      throw new ValidationError(
        'maxContextsPerBrowser must be >= 1',
        'maxContextsPerBrowser'
      );
    }

    return validated;
  }
  ```

#### 2.3 Graceful Degradation
- **Target**: `src/core/scanner/PageScanner.ts`
- **Pattern**: Continue on collector failures
  ```typescript
  // In scan() method
  const collectors = [
    { name: 'network', instance: networkCollector },
    { name: 'script', instance: scriptCollector },
    { name: 'dataLayer', instance: dataLayerCollector },
    { name: 'console', instance: consoleCollector },
  ];

  for (const { name, instance } of collectors) {
    try {
      await instance.attach(page);
    } catch (error) {
      this.logger.warn(`Failed to attach ${name} collector`, {
        error: error instanceof Error ? error.message : String(error)
      });
      // Continue without this collector
    }
  }
  ```

### Phase 3: Type Safety (Week 3)

#### 3.1 Remove Any Casts
- **Files to fix**:
  - `src/validation/ValidationEngine.ts` (line 216)
  - `src/core/collectors/DataLayerCollector.ts` (multiple locations)
  - `src/core/collectors/ScriptCollector.ts` (lines 198-199)

#### 3.2 Proper DOM Type Extensions
- **Create**: `src/types/dom.d.ts`
  ```typescript
  declare global {
    interface Window {
      __AVT_DATA_LAYER_OBSERVER__?: DataLayerObserver;
      __AVT_SCRIPT_OBSERVER__?: ScriptObserver;
      __AVT_ERROR_OBSERVER__?: ErrorObserver;
      dataLayer?: unknown[];
      [key: string]: unknown;
    }

    interface HTMLScriptElement {
      __avt_script_id__?: string;
    }
  }

  export {};
  ```

#### 3.3 Discriminated Union Types
- **Target**: `src/types/index.ts`
- **Add**: Tagged unions for common patterns
  ```typescript
  export type AnalyticsRequest = NetworkRequest & {
    isAnalyticsRequest: true;
    platform?: KnownPlatform;
    requestType?: 'pageview' | 'event' | 'ecommerce' | 'timing';
  };

  export type DataLayerPushData =
    | { event: string; [key: string]: unknown }
    | { 'gtm.start': number; [key: string]: unknown }
    | Record<string, unknown>;
  ```

### Phase 4: Architecture (Week 4)

#### 4.1 Split ReportBuilder
- **Create files**:
  - `src/reporting/IssueExtractor.ts`
  - `src/reporting/BaselineComparator.ts`
  - `src/reporting/IssueCategorizer.ts`
  - `src/reporting/SummaryCalculator.ts`

- **New ReportBuilder**:
  ```typescript
  export class ReportBuilder {
    constructor(
      private issueExtractor: IssueExtractor,
      private baselineComparator: BaselineComparator,
      private summaryCal culator: SummaryCalculator,
      private ciDetector: CIDetector
    ) {}

    buildRunReport(inputs: PageReportInput[]): RunReport {
      // Orchestrates the specialized classes
    }
  }
  ```

#### 4.2 Dependency Injection for JourneyEngine
- **Target**: `src/journey/JourneyEngine.ts`
- **Pattern**:
  ```typescript
  export interface JourneyDependencies {
    createScanner: () => PageScanner;
    createDetectionEngine: () => DetectionEngine;
    createValidationEngine: (rules: AnyRuleDef[]) => ValidationEngine;
  }

  export class JourneyEngine {
    constructor(
      config: JourneyEngineConfig,
      actionRegistry: ActionHandlerRegistry,
      dependencies: JourneyDependencies
    ) {
      // ...
    }
  }
  ```

### Phase 5: API Improvements (Week 5)

#### 5.1 Builder Patterns
- **Create**: `src/core/scanner/ScanOptionsBuilder.ts`
  ```typescript
  export class ScanOptionsBuilder {
    private options: Partial<ScanOptions> = {};

    withTimeout(ms: number): this {
      this.options.timeout = validatePositiveNumber(ms, 'timeout');
      return this;
    }

    withViewport(type: 'mobile' | 'desktop' | 'tablet'): this {
      switch (type) {
        case 'mobile':
          this.options.viewport = MOBILE_VIEWPORT;
          break;
        case 'desktop':
          this.options.viewport = DEFAULT_VIEWPORT;
          break;
        case 'tablet':
          this.options.viewport = TABLET_VIEWPORT;
          break;
      }
      return this;
    }

    captureScreenshots(enabled = true): this {
      this.options.captureScreenshot = enabled;
      return this;
    }

    build(): ScanOptions {
      return mergeOptions(this.options);
    }
  }
  ```

#### 5.2 Convenience Functions
- **Create**: `src/convenience.ts`
  ```typescript
  /**
   * All-in-one URL audit
   */
  export async function auditUrl(
    url: string,
    rules: AnyRuleDef[],
    options?: Partial<ScanOptions>
  ): Promise<AuditResult> {
    const logger = getLogger({ operation: 'auditUrl' });
    logger.info('Starting audit', { url });

    try {
      // Scan
      const scan = await scanUrl(url, options);
      logger.debug('Scan complete', {
        requests: scan.networkRequests.length,
        scripts: scan.scripts.length
      });

      // Detect
      const detection = await detectTags(scan);
      logger.debug('Detection complete', {
        tags: detection.tags.length
      });

      // Validate
      const engine = createValidationEngine();
      const validation = await engine.validate(scan, detection, rules);
      logger.info('Audit complete', {
        score: validation.summary.score,
        issues: validation.summary.issues.total
      });

      return { scan, detection, validation };
    } catch (error) {
      logger.error('Audit failed', error as Error, { url });
      throw error;
    }
  }

  /**
   * Batch URL audit with progress
   */
  export async function auditUrls(
    urls: string[],
    rules: AnyRuleDef[],
    options?: {
      scanOptions?: Partial<ScanOptions>;
      concurrency?: number;
      onProgress?: (completed: number, total: number, url: string) => void;
    }
  ): Promise<Map<string, AuditResult>> {
    // Implementation with concurrency control and progress reporting
  }
  ```

#### 5.3 Factory Functions
- **Add to existing modules**:
  ```typescript
  // src/core/scanner/index.ts
  export function createDefaultScanner(
    options?: Partial<BrowserPoolConfig>
  ): PageScanner {
    const browserManager = new BrowserManager(
      validateBrowserPoolConfig(options || {})
    );
    return new PageScanner(browserManager);
  }

  // src/validation/index.ts
  export function createDefaultValidationEngine(
    environment = 'production'
  ): ValidationEngine {
    const engine = new ValidationEngine({ environment });
    registerBuiltInHandlers(engine);
    return engine;
  }
  ```

### Phase 6: Production Features (Week 6)

#### 6.1 Metrics Interface
- **Create**: `src/core/utils/metrics.ts`
  ```typescript
  export interface Metrics {
    recordScanDuration(duration: number, complexity: 'low' | 'medium' | 'high'): void;
    recordDetectorLatency(detectorId: string, duration: number): void;
    recordValidationScore(score: number): void;
    recordMemoryUsage(bytes: number): void;
    recordErrorRate(errorType: string): void;
    recordBrowserPoolUtilization(active: number, total: number): void;
  }

  export class ConsoleMetrics implements Metrics {
    private metrics: Map<string, number[]> = new Map();

    recordScanDuration(duration: number, complexity: string): void {
      this.record(`scan.duration.${complexity}`, duration);
    }

    // ... implementations

    getStatistics(): Record<string, {
      count: number;
      min: number;
      max: number;
      avg: number;
      p95: number;
    }> {
      // Calculate statistics
    }
  }
  ```

#### 6.2 Retry Logic
- **Create**: `src/core/utils/retry.ts`
  ```typescript
  export interface RetryOptions {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    retryableErrors?: Array<new (...args: any[]) => Error>;
  }

  export async function withRetry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const opts: RetryOptions = {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      ...options,
    };

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === opts.maxAttempts) {
          break;
        }

        // Check if error is retryable
        if (opts.retryableErrors) {
          const isRetryable = opts.retryableErrors.some(
            ErrorClass => error instanceof ErrorClass
          );
          if (!isRetryable) {
            throw error;
          }
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
          opts.maxDelay
        );

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
  ```

#### 6.3 Health Checks
- **Create**: `src/core/utils/health.ts`
  ```typescript
  export interface HealthCheck {
    name: string;
    check(): Promise<HealthStatus>;
  }

  export interface HealthStatus {
    healthy: boolean;
    message?: string;
    details?: Record<string, unknown>;
  }

  export class BrowserPoolHealthCheck implements HealthCheck {
    name = 'browser-pool';

    constructor(private browserManager: BrowserManager) {}

    async check(): Promise<HealthStatus> {
      const stats = this.browserManager.getStats();

      if (stats.totalBrowsers === 0) {
        return {
          healthy: false,
          message: 'No browsers available',
        };
      }

      const utilization = stats.activeBrowsers / stats.totalBrowsers;
      if (utilization > 0.9) {
        return {
          healthy: false,
          message: 'Browser pool near capacity',
          details: { utilization, ...stats },
        };
      }

      return {
        healthy: true,
        details: stats,
      };
    }
  }
  ```

### Phase 7: Documentation & Examples (Week 7)

#### 7.1 Comprehensive JSDoc
- **Pattern for all public APIs**:
  ```typescript
  /**
   * Scan a single URL for analytics implementation
   *
   * @param url - The URL to scan (must be http:// or https://)
   * @param options - Optional scan configuration
   *
   * @returns Promise resolving to scan results
   *
   * @throws {ValidationError} If URL is invalid
   * @throws {NavigationError} If page navigation fails
   * @throws {TimeoutError} If scan exceeds timeout
   *
   * @example
   * ```typescript
   * const result = await scanUrl('https://example.com', {
   *   timeout: 60000,
   *   waitUntil: 'networkidle',
   * });
   *
   * console.log(`Found ${result.summary.analyticsRequests} analytics requests`);
   * ```
   *
   * @see {@link ScanOptions} for available options
   * @see {@link PageScanResult} for result structure
   */
  export async function scanUrl(
    url: string,
    options?: Partial<ScanOptions>
  ): Promise<PageScanResult> {
    // ...
  }
  ```

#### 7.2 Error Message Improvements
- **Pattern**: Include actionable suggestions
  ```typescript
  export class NavigationError extends AVTError {
    constructor(message: string, public readonly url: string) {
      const suggestions = [
        'Try increasing the timeout option',
        'Check if the URL is accessible',
        'Verify network connectivity',
        'Check for authentication requirements',
      ];

      super(
        'Navigation',
        `${message}\n\nSuggestions:\n${suggestions.map(s => `  - ${s}`).join('\n')}`,
        { url }
      );
    }
  }
  ```

### Phase 8: Testing Infrastructure (Week 8)

#### 8.1 Unit Test Foundation
- **Create**: `src/__tests__/setup.ts`
- **Pattern**: Mock browser interactions
- **Tools**: Jest, playwright test fixtures

#### 8.2 Integration Tests
- **Create**: `tests/integration/`
- **Cover**:
  - Complete scan → detect → validate flows
  - Error scenarios
  - Resource cleanup
  - Concurrent operations

## Implementation Checklist

### Critical (Must Do)
- [x] Structured logging system
- [x] Input validation utilities
- [ ] Memory leak fixes in Timer
- [ ] Error context enhancement
- [ ] Configuration validation
- [ ] Graceful degradation in scanner

### High Priority (Should Do)
- [ ] Abstract BaseCollector
- [ ] Remove any casts
- [ ] Proper DOM type extensions
- [ ] Split ReportBuilder
- [ ] Add retry logic

### Medium Priority (Nice to Have)
- [ ] Builder patterns
- [ ] Convenience functions
- [ ] Metrics interface
- [ ] Health checks
- [ ] Comprehensive JSDoc

### Long Term (Future)
- [ ] Plugin system architecture
- [ ] Performance optimizations
- [ ] Streaming for large responses
- [ ] Advanced caching strategies

## Migration Guide

### Breaking Changes

1. **Logger Integration**
   ```typescript
   // Before
   if (debug) console.log('message');

   // After
   logger.debug('message', { context });
   ```

2. **Configuration Validation**
   ```typescript
   // Before
   const manager = new BrowserManager(config);

   // After
   const manager = new BrowserManager(validateBrowserPoolConfig(config));
   ```

3. **Error Handling**
   ```typescript
   // Before
   throw new AVTError('Component', 'message');

   // After
   throw new AVTError('Component', 'message', { context, timestamp });
   ```

## Success Metrics

### Code Quality
- Reduce code duplication by 40%
- Achieve 90%+ type safety (no any casts)
- 100% public API JSDoc coverage

### Reliability
- Zero memory leaks under continuous operation
- 99.9% resource cleanup success rate
- < 1% error rate in production

### Performance
- P95 scan latency < 15s
- Browser pool utilization < 80%
- Memory growth < 10MB per 1000 scans

### Usability
- Setup time < 5 minutes
- 3 lines of code for basic use case
- All errors include actionable suggestions

## Timeline

- **Week 1**: Foundation (logging, validation, memory fixes)
- **Week 2**: Code quality (BaseCollector, validation, degradation)
- **Week 3**: Type safety (remove any, proper types)
- **Week 4**: Architecture (split classes, DI)
- **Week 5**: API improvements (builders, convenience)
- **Week 6**: Production features (metrics, retry, health)
- **Week 7**: Documentation (JSDoc, guides, examples)
- **Week 8**: Testing (unit, integration, e2e)

**Total Duration**: 8 weeks for complete production-grade refactor

## Next Steps

1. Review this plan with stakeholders
2. Prioritize phases based on business needs
3. Set up tracking (e.g., GitHub project board)
4. Begin Phase 1 implementation
5. Establish code review process
6. Set up CI/CD for automated testing

---

**Last Updated**: January 2026
**Status**: Planning Complete, Ready for Implementation
