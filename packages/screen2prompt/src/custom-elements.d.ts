import { WidgetMode } from './types';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      's2p-widget': {
        licenseKey?: string;
        'license-key'?: string;
        dontShowInProd?: boolean;
        'dont-show-in-prod'?: boolean;
        'data-testid'?: string;
        class?: string;
        id?: string;
      };
      's2p-toolbar': {
        mode?: WidgetMode;
        annotationCount?: number;
        'annotation-count'?: number;
        placementCount?: number;
        'placement-count'?: number;
        onModeChange?: (e: CustomEvent<WidgetMode>) => void;
        class?: string;
      };
      's2p-annotation-layer': { class?: string };
      's2p-annotation-popup': { class?: string };
      's2p-annotation-markers': { class?: string };
      's2p-layout-panel': { canvasMode?: boolean; class?: string };
      's2p-wireframe-item': { placementId?: string; canvas?: boolean; key?: string; class?: string };
      's2p-wireframe-canvas': { class?: string };
    }
  }
}
