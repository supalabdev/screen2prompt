/**
 * Widget mode enumeration
 */
export type WidgetMode = 'idle' | 'annotation' | 'layout' | 'wireframe';

/**
 * Annotation types for different element selections
 */
export type AnnotationType = 'element' | 'text-selection' | 'placement' | 'rearrange' | 'area';

/**
 * Single annotation with feedback and element information
 */
export interface Annotation {
  id: number;
  type: AnnotationType;
  /** Human-readable title (used in markdown heading). Falls back to selector if absent. */
  label?: string;
  selector: string;
  sourcePath?: string;
  componentTree?: string[];
  computedStyles?: Record<string, string>;
  feedback: string;
  position: { x: number; y: number };
  viewport: { width: number; height: number };
  /** Viewport-relative bounds for area/multi-select annotations */
  areaBounds?: { x: number; y: number; width: number; height: number };
}

/**
 * Represents a completed drag-to-select area with resolved elements
 */
export interface MultiSelectTarget {
  leaves: HTMLElement[];
  description: string;
  commonParent: HTMLElement | null;
  rect: { x: number; y: number; width: number; height: number };
}

/**
 * Placement of wireframe component during layout mode
 */
export interface Placement {
  id: string;
  componentType: string;
  bounds: { x: number; y: number; width: number; height: number };
  alignment: 'left' | 'center' | 'right' | 'custom';
  isOutsideViewport: boolean;
}

/**
 * User settings for widget behavior and output
 */
export interface Settings {
  outputDetail: 'compact' | 'standard' | 'detailed' | 'forensic';
  markerColor: string;
  clearOnCopy: boolean;
  primaryColor: string;
}

/**
 * Global widget state
 */
export interface WidgetState {
  mode: WidgetMode;
  annotations: Annotation[];
  placements: Placement[];
  wireframePlacements: Placement[];
  wireframeDescription: string;
  hoveredElement: HTMLElement | null;
  activeAnnotationTarget: HTMLElement | null;
  activeMultiSelect: MultiSelectTarget | null;
  popupAnnotationId: number | null;
  toolbarPosition: { x: number; y: number };
  settings: Settings;
  viewport: { width: number; height: number };
}
