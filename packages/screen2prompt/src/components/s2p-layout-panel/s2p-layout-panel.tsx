import { Component, Prop, State } from '@stencil/core';
import {
  WIREFRAME_COMPONENTS,
  CATEGORIES,
  WireframeCategory,
  WireframeComponentDef,
  snapToGrid,
} from '../../utils/wireframeComponents';
import { state, addPlacement, addWireframePlacement } from '../../store/widgetStore';
import { Placement } from '../../types';
import { findContentArea, getAlignment } from '../../utils/cssHints';

@Component({
  tag: 's2p-layout-panel',
  styleUrl: 's2p-layout-panel.css',
  shadow: true,
})
export class S2pLayoutPanel {
  /** When true, dropped components go to wireframePlacements (canvas mode) */
  @Prop() canvasMode: boolean = false;

  @State() activeCategory: WireframeCategory = 'navigation';
  @State() draggingId: string | null = null;

  /** Ghost element that follows the cursor during drag */
  private ghost: HTMLDivElement | null = null;
  private dragDef: WireframeComponentDef | null = null;
  private boundMouseMove!: (e: MouseEvent) => void;
  private boundMouseUp!: (e: MouseEvent) => void;

  connectedCallback() {
    this.boundMouseMove = this.handleDragMove.bind(this);
    this.boundMouseUp = this.handleDragEnd.bind(this);
  }

  private startDrag(def: WireframeComponentDef, e: MouseEvent) {
    e.preventDefault();
    this.draggingId = def.id;
    this.dragDef = def;

    // Create a ghost element
    const scale = Math.min(1, 200 / def.defaultWidth);
    const ghostW = def.defaultWidth * scale;
    const ghostH = def.defaultHeight * scale;

    this.ghost = document.createElement('div');
    this.ghost.style.cssText = `
      position: fixed;
      width: ${ghostW}px;
      height: ${ghostH}px;
      pointer-events: none;
      z-index: 999996;
      opacity: 0.7;
      transform: translate(-50%, -50%);
      border: 2px solid ${state.settings.primaryColor};
      border-radius: 6px;
      overflow: hidden;
      background: lab(0% 0 0);
    `;
    this.ghost.innerHTML = def.svg.replace(/#14b8a6/g, state.settings.primaryColor);
    const svgEl = this.ghost.querySelector('svg');
    if (svgEl) {
      svgEl.style.width = '100%';
      svgEl.style.height = '100%';
      svgEl.setAttribute('preserveAspectRatio', 'none');
    }
    document.body.appendChild(this.ghost);
    this.positionGhost(e.clientX, e.clientY);

    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
  }

  private positionGhost(x: number, y: number) {
    if (this.ghost) {
      this.ghost.style.left = `${x}px`;
      this.ghost.style.top = `${y}px`;
    }
  }

  private handleDragMove(e: MouseEvent) {
    this.positionGhost(e.clientX, e.clientY);
  }

  private handleDragEnd(e: MouseEvent) {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);

    if (this.ghost) {
      document.body.removeChild(this.ghost);
      this.ghost = null;
    }

    if (!this.dragDef) {
      this.draggingId = null;
      return;
    }

    const def = this.dragDef;
    this.dragDef = null;
    this.draggingId = null;

    // Place centered on drop point, snapped to grid (page-relative coords)
    const x = snapToGrid(e.clientX - def.defaultWidth / 2 + window.scrollX);
    const y = snapToGrid(e.clientY - def.defaultHeight / 2 + window.scrollY);

    const contentArea = findContentArea(state.viewport.width);
    const alignment = getAlignment(x, def.defaultWidth, contentArea, state.viewport.width);
    const isOutsideViewport =
      x + def.defaultWidth > state.viewport.width || y + def.defaultHeight > state.viewport.height || x < 0 || y < 0;

    const placement: Placement = {
      id: `${def.id}-${Date.now()}`, // overwritten below
      componentType: def.name,
      bounds: { x, y, width: def.defaultWidth, height: def.defaultHeight },
      alignment,
      isOutsideViewport,
    };

    const prefix = this.canvasMode ? 'wf' : 'lm';
    placement.id = `${prefix}-${def.id}-${Date.now()}`;
    this.canvasMode ? addWireframePlacement(placement) : addPlacement(placement);
  }

  private filteredComponents(): WireframeComponentDef[] {
    return WIREFRAME_COMPONENTS.filter(c => c.category === this.activeCategory);
  }

  render() {
    return (
      <div class="s2p-panel">
        <div class="s2p-panel__header">
          <span class="s2p-panel__title">Layout Components</span>
          <span class="s2p-panel__hint">Drag to place</span>
        </div>

        <div class="s2p-panel__categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              class={`s2p-panel__cat-btn ${this.activeCategory === cat.id ? 's2p-panel__cat-btn--active' : ''}`}
              onClick={() => { this.activeCategory = cat.id; }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div class="s2p-panel__grid">
          {this.filteredComponents().map(def => (
            <div
              key={def.id}
              class={`s2p-panel__item ${this.draggingId === def.id ? 's2p-panel__item--dragging' : ''}`}
              onMouseDown={(e) => this.startDrag(def, e)}
              title={`${def.name} (${def.defaultWidth}×${def.defaultHeight})`}
            >
              <div class="s2p-panel__item-preview" innerHTML={def.svg.replace(/#14b8a6/g, state.settings.primaryColor)} />
              <span class="s2p-panel__item-label">{def.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
