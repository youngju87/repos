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
export declare function generateDataLayerObserverScript(dataLayerNames: string[]): string;
/**
 * Default data layer names to observe
 */
export declare const DEFAULT_DATA_LAYER_NAMES: string[];
//# sourceMappingURL=dataLayerObserver.d.ts.map