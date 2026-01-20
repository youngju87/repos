/**
 * Data Layer Observer - Injected Script
 *
 * This script is injected into pages BEFORE navigation to intercept
 * data layer pushes as they happen. It supports multiple data layer
 * implementations (GA4 dataLayer, Adobe digitalData, Tealium utag_data, etc.)
 *
 * The script creates a proxy around array push methods to capture all pushes.
 */

/**
 * Generate the data layer observer script
 *
 * @param dataLayerNames - Names of data layers to observe (e.g., ['dataLayer', 'digitalData'])
 * @returns JavaScript code to inject
 */
export function generateDataLayerObserverScript(dataLayerNames: string[]): string {
  return `
(function() {
  'use strict';

  // Namespace for our observer
  window.__AVT_DATA_LAYER_OBSERVER__ = window.__AVT_DATA_LAYER_OBSERVER__ || {
    events: [],
    snapshots: [],
    initialized: false,
    dataLayerNames: ${JSON.stringify(dataLayerNames)},

    /**
     * Capture stack trace for debugging
     */
    captureStack: function() {
      try {
        throw new Error();
      } catch (e) {
        return e.stack ? e.stack.split('\\n').slice(3).join('\\n') : undefined;
      }
    },

    /**
     * Record a data layer event
     */
    recordEvent: function(dataLayerName, data, index, source) {
      var event = {
        id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        dataLayerName: dataLayerName,
        data: this.safeClone(data),
        timestamp: Date.now(),
        source: source,
        index: index,
        stackTrace: source === 'push' ? this.captureStack() : undefined
      };
      this.events.push(event);
    },

    /**
     * Take a snapshot of a data layer's current state
     */
    takeSnapshot: function(dataLayerName, phase) {
      var dl = window[dataLayerName];
      if (!dl) return;

      var snapshot = {
        name: dataLayerName,
        contents: this.safeClone(Array.isArray(dl) ? dl : [dl]),
        timestamp: Date.now(),
        phase: phase
      };
      this.snapshots.push(snapshot);
    },

    /**
     * Safely clone an object (handle circular refs, functions, etc.)
     */
    safeClone: function(obj, seen) {
      seen = seen || new WeakSet();

      if (obj === null || typeof obj !== 'object') {
        return obj;
      }

      if (obj instanceof Date) {
        return obj.toISOString();
      }

      if (obj instanceof RegExp) {
        return obj.toString();
      }

      if (typeof obj === 'function') {
        return '[Function: ' + (obj.name || 'anonymous') + ']';
      }

      if (seen.has(obj)) {
        return '[Circular]';
      }
      seen.add(obj);

      if (Array.isArray(obj)) {
        return obj.map(function(item) {
          return this.safeClone(item, seen);
        }, this);
      }

      var result = {};
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          try {
            result[key] = this.safeClone(obj[key], seen);
          } catch (e) {
            result[key] = '[Error: ' + e.message + ']';
          }
        }
      }
      return result;
    },

    /**
     * Proxy the push method of an array-based data layer
     */
    proxyArrayPush: function(dataLayerName) {
      var self = this;
      var dl = window[dataLayerName];

      if (!dl || typeof dl.push !== 'function') {
        return;
      }

      // Store original push
      var originalPush = dl.push.bind(dl);

      // Override push
      dl.push = function() {
        var args = Array.prototype.slice.call(arguments);

        // Record each pushed item
        args.forEach(function(item, i) {
          self.recordEvent(dataLayerName, item, dl.length + i, 'push');
        });

        // Call original push
        return originalPush.apply(dl, arguments);
      };

      // Mark as proxied
      dl.__avt_proxied__ = true;
    },

    /**
     * Set up a property descriptor to catch data layer creation
     */
    watchForDataLayer: function(dataLayerName) {
      var self = this;
      var existingValue = window[dataLayerName];

      // If already exists, proxy it and capture initial state
      if (existingValue) {
        if (Array.isArray(existingValue)) {
          // Record existing items as initial events
          existingValue.forEach(function(item, index) {
            self.recordEvent(dataLayerName, item, index, 'initial');
          });
          this.proxyArrayPush(dataLayerName);
        } else {
          // Non-array data layer (like digitalData object)
          self.recordEvent(dataLayerName, existingValue, 0, 'initial');
        }
        this.takeSnapshot(dataLayerName, 'initial');
        return;
      }

      // Watch for future creation
      var value;
      try {
        Object.defineProperty(window, dataLayerName, {
          configurable: true,
          enumerable: true,
          get: function() {
            return value;
          },
          set: function(newValue) {
            value = newValue;

            if (Array.isArray(newValue)) {
              // Record existing items
              newValue.forEach(function(item, index) {
                self.recordEvent(dataLayerName, item, index, 'initial');
              });

              // Proxy push if not already
              if (!newValue.__avt_proxied__) {
                self.proxyArrayPush(dataLayerName);
              }
            } else if (newValue && typeof newValue === 'object') {
              self.recordEvent(dataLayerName, newValue, 0, 'initial');
            }

            self.takeSnapshot(dataLayerName, 'initial');
          }
        });
      } catch (e) {
        // Property might be non-configurable, fall back to polling
        self.pollForDataLayer(dataLayerName);
      }
    },

    /**
     * Fallback polling for data layers that can't be watched via defineProperty
     */
    pollForDataLayer: function(dataLayerName) {
      var self = this;
      var checkInterval = setInterval(function() {
        var dl = window[dataLayerName];
        if (dl && !dl.__avt_proxied__) {
          if (Array.isArray(dl)) {
            dl.forEach(function(item, index) {
              self.recordEvent(dataLayerName, item, index, 'initial');
            });
            self.proxyArrayPush(dataLayerName);
          } else {
            self.recordEvent(dataLayerName, dl, 0, 'initial');
          }
          self.takeSnapshot(dataLayerName, 'initial');
          clearInterval(checkInterval);
        }
      }, 50);

      // Stop polling after 30 seconds
      setTimeout(function() {
        clearInterval(checkInterval);
      }, 30000);
    },

    /**
     * Initialize the observer
     */
    init: function() {
      if (this.initialized) return;
      this.initialized = true;

      var self = this;

      // Watch all configured data layers
      this.dataLayerNames.forEach(function(name) {
        self.watchForDataLayer(name);
      });

      // Take snapshots at key lifecycle events
      document.addEventListener('DOMContentLoaded', function() {
        self.dataLayerNames.forEach(function(name) {
          self.takeSnapshot(name, 'dom-ready');
        });
      });

      window.addEventListener('load', function() {
        self.dataLayerNames.forEach(function(name) {
          self.takeSnapshot(name, 'load');
        });
      });
    },

    /**
     * Get all collected data (called by PageScanner)
     */
    getData: function() {
      // Take final snapshots
      var self = this;
      this.dataLayerNames.forEach(function(name) {
        self.takeSnapshot(name, 'final');
      });

      return {
        events: this.events,
        snapshots: this.snapshots
      };
    }
  };

  // Initialize immediately
  window.__AVT_DATA_LAYER_OBSERVER__.init();
})();
`;
}

/**
 * Default data layer names to observe
 */
export const DEFAULT_DATA_LAYER_NAMES = [
  'dataLayer', // Google Tag Manager / GA4
  'digitalData', // Adobe / W3C Customer Experience Digital Data
  'utag_data', // Tealium
  'tc_vars', // Commanders Act
  '_satellite', // Adobe Launch (check for object existence)
  's', // Adobe Analytics s object
];
