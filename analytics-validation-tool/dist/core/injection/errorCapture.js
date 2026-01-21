"use strict";
/**
 * Error Capture - Injected Script
 *
 * This script is injected into pages BEFORE navigation to capture
 * JavaScript errors and unhandled promise rejections.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateErrorCaptureScript = generateErrorCaptureScript;
/**
 * Generate the error capture injection code
 *
 * @returns JavaScript code to inject
 */
function generateErrorCaptureScript() {
    return `
(function() {
  'use strict';

  // Namespace for our error capture
  window.__AVT_ERROR_CAPTURE__ = window.__AVT_ERROR_CAPTURE__ || {
    errors: [],
    initialized: false,

    /**
     * Generate unique ID
     */
    generateId: function() {
      return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Record an error
     */
    recordError: function(errorData) {
      this.errors.push({
        id: this.generateId(),
        ...errorData,
        timestamp: Date.now()
      });
    },

    /**
     * Initialize error capture
     */
    init: function() {
      if (this.initialized) return;
      this.initialized = true;

      var self = this;

      // Capture uncaught errors
      window.addEventListener('error', function(event) {
        // Check if it's a script error vs resource error
        if (event.error || event.message) {
          self.recordError({
            errorType: 'javascript',
            message: event.message || 'Unknown error',
            name: event.error ? event.error.name : undefined,
            stack: event.error ? event.error.stack : undefined,
            url: event.filename,
            lineNumber: event.lineno,
            columnNumber: event.colno
          });
        } else if (event.target && event.target.tagName) {
          // Resource loading error
          var target = event.target;
          self.recordError({
            errorType: 'resource',
            message: 'Failed to load resource: ' + (target.src || target.href || 'unknown'),
            url: target.src || target.href,
            resourceType: target.tagName.toLowerCase()
          });
        }
      }, true); // Use capture phase to catch all errors

      // Capture unhandled promise rejections
      window.addEventListener('unhandledrejection', function(event) {
        var reason = event.reason;
        var message = 'Unhandled Promise Rejection';
        var stack = undefined;
        var name = undefined;

        if (reason instanceof Error) {
          message = reason.message;
          stack = reason.stack;
          name = reason.name;
        } else if (typeof reason === 'string') {
          message = reason;
        } else if (reason && typeof reason.toString === 'function') {
          message = reason.toString();
        }

        self.recordError({
          errorType: 'javascript',
          message: message,
          name: name || 'UnhandledRejection',
          stack: stack
        });
      });

      // Capture security errors (CSP violations)
      document.addEventListener('securitypolicyviolation', function(event) {
        self.recordError({
          errorType: 'security',
          message: 'CSP Violation: ' + event.violatedDirective,
          blockedUri: event.blockedURI,
          violatedDirective: event.violatedDirective,
          originalPolicy: event.originalPolicy,
          url: event.sourceFile,
          lineNumber: event.lineNumber,
          columnNumber: event.columnNumber
        });
      });
    },

    /**
     * Get all collected errors (called by PageScanner)
     */
    getData: function() {
      return {
        errors: this.errors
      };
    }
  };

  // Initialize immediately
  window.__AVT_ERROR_CAPTURE__.init();
})();
`;
}
//# sourceMappingURL=errorCapture.js.map