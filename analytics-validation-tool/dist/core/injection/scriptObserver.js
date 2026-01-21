"use strict";
/**
 * Script Observer - Injected Script
 *
 * This script is injected into pages BEFORE navigation to track
 * all script elements as they are added to the DOM, including:
 * - Static scripts in the HTML
 * - Dynamically injected scripts
 * - Script load success/failure
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateScriptObserverScript = generateScriptObserverScript;
/**
 * Generate the script observer injection code
 *
 * @returns JavaScript code to inject
 */
function generateScriptObserverScript() {
    return `
(function() {
  'use strict';

  // Namespace for our observer
  window.__AVT_SCRIPT_OBSERVER__ = window.__AVT_SCRIPT_OBSERVER__ || {
    scripts: [],
    documentOrder: 0,
    initialized: false,
    mutationObserver: null,

    /**
     * Generate unique ID
     */
    generateId: function() {
      return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Extract data attributes from element
     */
    getDataAttributes: function(element) {
      var dataAttrs = {};
      if (element.dataset) {
        for (var key in element.dataset) {
          dataAttrs[key] = element.dataset[key];
        }
      }
      return dataAttrs;
    },

    /**
     * Check if script is in head
     */
    isInHead: function(element) {
      var parent = element.parentElement;
      while (parent) {
        if (parent.tagName === 'HEAD') return true;
        parent = parent.parentElement;
      }
      return false;
    },

    /**
     * Process a script element
     */
    processScript: function(scriptEl, isDynamic) {
      var self = this;
      var id = this.generateId();

      var scriptInfo = {
        id: id,
        src: scriptEl.src || undefined,
        isInline: !scriptEl.src,
        type: scriptEl.type || undefined,
        async: scriptEl.async,
        defer: scriptEl.defer,
        noModule: scriptEl.noModule || false,
        crossOrigin: scriptEl.crossOrigin || undefined,
        integrity: scriptEl.integrity || undefined,
        documentOrder: this.documentOrder++,
        inHead: this.isInHead(scriptEl),
        dynamicallyInjected: isDynamic,
        detectedAt: Date.now(),
        loadedAt: undefined,
        loadFailed: false,
        loadError: undefined,
        dataAttributes: this.getDataAttributes(scriptEl),
        elementId: scriptEl.id || undefined,
        className: scriptEl.className || undefined,
        content: undefined,
        contentTruncated: false
      };

      // Capture inline script content (truncated if very large)
      if (scriptInfo.isInline) {
        var content = scriptEl.textContent || '';
        var maxLength = 50000; // 50KB max
        if (content.length > maxLength) {
          scriptInfo.content = content.substring(0, maxLength);
          scriptInfo.contentTruncated = true;
        } else {
          scriptInfo.content = content;
        }
        // Inline scripts are "loaded" immediately
        scriptInfo.loadedAt = Date.now();
      } else {
        // Track load events for external scripts
        scriptEl.addEventListener('load', function() {
          scriptInfo.loadedAt = Date.now();
        });

        scriptEl.addEventListener('error', function(event) {
          scriptInfo.loadFailed = true;
          scriptInfo.loadError = 'Failed to load script: ' + (scriptEl.src || 'unknown');
        });

        // If script is already loaded (cached), mark it
        if (scriptEl.readyState === 'complete' ||
            (scriptEl.src && document.readyState !== 'loading')) {
          // Check if it's in the cache by looking for the load event
          setTimeout(function() {
            if (!scriptInfo.loadedAt && !scriptInfo.loadFailed) {
              // Assume loaded if no error after brief delay
              scriptInfo.loadedAt = Date.now();
            }
          }, 100);
        }
      }

      // Store reference to element for later queries
      scriptEl.__avt_script_id__ = id;

      this.scripts.push(scriptInfo);
      return scriptInfo;
    },

    /**
     * Process all existing scripts in document
     */
    processExistingScripts: function() {
      var scripts = document.querySelectorAll('script');
      for (var i = 0; i < scripts.length; i++) {
        if (!scripts[i].__avt_script_id__) {
          this.processScript(scripts[i], false);
        }
      }
    },

    /**
     * Set up MutationObserver to catch dynamically added scripts
     */
    setupMutationObserver: function() {
      var self = this;

      this.mutationObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          mutation.addedNodes.forEach(function(node) {
            // Direct script addition
            if (node.nodeName === 'SCRIPT' && !node.__avt_script_id__) {
              self.processScript(node, true);
            }

            // Scripts added within a container
            if (node.querySelectorAll) {
              var scripts = node.querySelectorAll('script');
              scripts.forEach(function(script) {
                if (!script.__avt_script_id__) {
                  self.processScript(script, true);
                }
              });
            }
          });
        });
      });

      // Start observing as soon as we have a document element
      var startObserving = function() {
        if (document.documentElement) {
          self.mutationObserver.observe(document.documentElement, {
            childList: true,
            subtree: true
          });
        } else {
          setTimeout(startObserving, 0);
        }
      };

      startObserving();
    },

    /**
     * Override document.createElement to catch scripts before they're added
     */
    interceptScriptCreation: function() {
      var self = this;
      var originalCreateElement = document.createElement.bind(document);

      document.createElement = function(tagName) {
        var element = originalCreateElement.apply(document, arguments);

        if (tagName.toLowerCase() === 'script') {
          // We'll process it when it's added to DOM via MutationObserver
          // But we can mark it as dynamically created here
          element.__avt_dynamic__ = true;
        }

        return element;
      };
    },

    /**
     * Initialize the observer
     */
    init: function() {
      if (this.initialized) return;
      this.initialized = true;

      // Intercept script creation
      this.interceptScriptCreation();

      // Set up mutation observer
      this.setupMutationObserver();

      // Process any existing scripts
      if (document.readyState !== 'loading') {
        this.processExistingScripts();
      } else {
        var self = this;
        document.addEventListener('DOMContentLoaded', function() {
          self.processExistingScripts();
        });
      }
    },

    /**
     * Get all collected script data (called by PageScanner)
     */
    getData: function() {
      // Do a final pass to catch any scripts we might have missed
      this.processExistingScripts();

      return {
        scripts: this.scripts
      };
    },

    /**
     * Cleanup
     */
    cleanup: function() {
      if (this.mutationObserver) {
        this.mutationObserver.disconnect();
      }
    }
  };

  // Initialize immediately
  window.__AVT_SCRIPT_OBSERVER__.init();
})();
`;
}
//# sourceMappingURL=scriptObserver.js.map