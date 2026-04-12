import { createStore } from '@stencil/store';
import { Annotation, MultiSelectTarget, Placement, Settings, WidgetMode, WidgetState } from '../types';

/**
 * Initialize the default settings
 */
const defaultSettings: Settings = {
  outputDetail: 'standard',
  markerColor: '#14b8a6', // teal-500
  clearOnCopy: false,
  primaryColor: '#14b8a6',
};

/**
 * Initialize the default viewport size (fallback for SSR)
 */
const getDefaultViewport = () => ({
  width: typeof window !== 'undefined' ? window.innerWidth : 1440,
  height: typeof window !== 'undefined' ? window.innerHeight : 900,
});

/**
 * Initialize the global widget store
 */
const initialState: WidgetState = {
  mode: 'idle',
  annotations: [],
  placements: [],
  wireframePlacements: [],
  wireframeDescription: '',
  hoveredElement: null,
  activeAnnotationTarget: null,
  activeMultiSelect: null,
  popupAnnotationId: null,
  toolbarPosition: { x: 20, y: 20 },
  settings: defaultSettings,
  viewport: getDefaultViewport(),
};

const storeResult = createStore<WidgetState>(initialState);
export const state = storeResult.state;

type OnChangeFn = <K extends keyof WidgetState>(
  key: K,
  callback: (newValue: WidgetState[K]) => void
) => void;
export const onChange: OnChangeFn = (key, callback) => storeResult.onChange(key, callback);

/**
 * Add an annotation to the store
 */
export const addAnnotation = (annotation: Annotation) => {
  state.annotations = [...state.annotations, annotation];
};

/**
 * Remove an annotation by ID
 */
export const removeAnnotation = (id: number) => {
  state.annotations = state.annotations.filter(a => a.id !== id);
};

/**
 * Update an annotation
 */
export const updateAnnotation = (id: number, updates: Partial<Annotation>) => {
  state.annotations = state.annotations.map(a =>
    a.id === id ? { ...a, ...updates } : a
  );
};

/**
 * Clear all annotations
 */
export const clearAnnotations = () => {
  state.annotations = [];
};

/**
 * Add a placement in layout mode
 */
export const addPlacement = (placement: Placement) => {
  state.placements = [...state.placements, placement];
};

/**
 * Remove a placement by ID
 */
export const removePlacement = (id: string) => {
  state.placements = state.placements.filter(p => p.id !== id);
};

/**
 * Update a placement
 */
export const updatePlacement = (id: string, updates: Partial<Placement>) => {
  state.placements = state.placements.map(p =>
    p.id === id ? { ...p, ...updates } : p
  );
};

/**
 * Clear all placements
 */
export const clearPlacements = () => {
  state.placements = [];
};

/**
 * Wireframe canvas placement actions
 */
export const addWireframePlacement = (placement: Placement) => {
  state.wireframePlacements = [...state.wireframePlacements, placement];
};

export const removeWireframePlacement = (id: string) => {
  state.wireframePlacements = state.wireframePlacements.filter(p => p.id !== id);
};

export const updateWireframePlacement = (id: string, updates: Partial<Placement>) => {
  state.wireframePlacements = state.wireframePlacements.map(p =>
    p.id === id ? { ...p, ...updates } : p
  );
};

export const clearWireframePlacements = () => {
  state.wireframePlacements = [];
};

export const setWireframeDescription = (desc: string) => {
  state.wireframeDescription = desc;
};

/**
 * Set the widget mode
 */
export const setMode = (mode: WidgetMode) => {
  state.mode = mode;
};

/**
 * Set the hovered element
 */
export const setHoveredElement = (element: HTMLElement | null) => {
  state.hoveredElement = element;
};

/**
 * Set the element being targeted for annotation (opens popup)
 */
export const setActiveAnnotationTarget = (element: HTMLElement | null) => {
  state.activeAnnotationTarget = element;
};

/**
 * Set the multi-select target (drag-to-select area with resolved elements)
 */
export const setActiveMultiSelect = (target: MultiSelectTarget | null) => {
  state.activeMultiSelect = target;
};

/**
 * Set the annotation ID being edited in the popup (null = create new)
 */
export const setPopupAnnotationId = (id: number | null) => {
  state.popupAnnotationId = id;
};

/**
 * Update settings
 */
export const updateSettings = (settings: Partial<Settings>) => {
  state.settings = { ...state.settings, ...settings };
};

/**
 * Update viewport dimensions
 */
export const updateViewport = (width: number, height: number) => {
  state.viewport = { width, height };
};

