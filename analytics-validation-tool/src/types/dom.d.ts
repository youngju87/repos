/**
 * DOM Type Extensions
 *
 * Proper TypeScript type extensions for browser DOM augmentations.
 */

/**
 * Data Layer Observer interface
 */
interface DataLayerObserver {
  dataLayerName: string;
  events: Array<{
    timestamp: number;
    source: string;
    data: unknown;
  }>;
  observe(): void;
  getEvents(): Array<{
    timestamp: number;
    source: string;
    data: unknown;
  }>;
}

/**
 * Script Observer interface
 */
interface ScriptObserver {
  scripts: Array<{
    id: string;
    src: string | null;
    async: boolean;
    defer: boolean;
    type: string | null;
    dynamicallyInjected: boolean;
    timestamp: number;
  }>;
  observe(): void;
  getScripts(): Array<{
    id: string;
    src: string | null;
    async: boolean;
    defer: boolean;
    type: string | null;
    dynamicallyInjected: boolean;
    timestamp: number;
  }>;
}

/**
 * Error Observer interface
 */
interface ErrorObserver {
  errors: Array<{
    message: string;
    source: string;
    lineno: number;
    colno: number;
    error: string | null;
    timestamp: number;
  }>;
  observe(): void;
  getErrors(): Array<{
    message: string;
    source: string;
    lineno: number;
    colno: number;
    error: string | null;
    timestamp: number;
  }>;
}

/**
 * Extend global Window interface
 */
declare global {
  interface Window {
    /** AVT Data Layer Observer */
    __AVT_DATA_LAYER_OBSERVER__?: DataLayerObserver;

    /** AVT Script Observer */
    __AVT_SCRIPT_OBSERVER__?: ScriptObserver;

    /** AVT Error Observer */
    __AVT_ERROR_OBSERVER__?: ErrorObserver;

    /** Data layer (GA4, GTM, etc.) */
    dataLayer?: unknown[];

    /** Google Tag Manager */
    google_tag_manager?: Record<string, unknown>;

    /** Google Analytics */
    ga?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;

    /** Adobe Analytics */
    s?: Record<string, unknown>;
    _satellite?: Record<string, unknown>;

    /** Meta Pixel */
    fbq?: (...args: unknown[]) => void;

    /** Segment */
    analytics?: {
      track: (...args: unknown[]) => void;
      page: (...args: unknown[]) => void;
      identify: (...args: unknown[]) => void;
      [key: string]: unknown;
    };

    /** Allow any dynamic property for custom tracking */
    [key: string]: unknown;
  }

  /**
   * Extend HTMLScriptElement for script tracking
   */
  interface HTMLScriptElement {
    /** AVT Script ID for tracking */
    __avt_script_id__?: string;
  }
}

export {};
