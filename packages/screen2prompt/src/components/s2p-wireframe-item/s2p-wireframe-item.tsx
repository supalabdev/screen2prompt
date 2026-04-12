import { Component, Prop, State } from '@stencil/core';
import { getComponentById, snapToGrid } from '../../utils/wireframeComponents';
import {
  state,
  updatePlacement, removePlacement,
  updateWireframePlacement, removeWireframePlacement,
} from '../../store/widgetStore';
import { findContentArea, getAlignment } from '../../utils/cssHints';

type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';
const MIN_W = 80;
const MIN_H = 32;

@Component({
  tag: 's2p-wireframe-item',
  styleUrl: 's2p-wireframe-item.css',
  shadow: true,
})
export class S2pWireframeItem {
  @Prop() placementId!: string;
  /** When true, reads/writes wireframePlacements instead of placements */
  @Prop() canvas: boolean = false;

  @State() isHovered: boolean = false;
  @State() isDragging: boolean = false;
  @State() isResizing: boolean = false;
  @State() scrollX: number = typeof window !== 'undefined' ? window.scrollX : 0;
  @State() scrollY: number = typeof window !== 'undefined' ? window.scrollY : 0;

  private pointerId: number = 0;
  private boundScroll!: () => void;
  private startX: number = 0;
  private startY: number = 0;
  private startBounds = { x: 0, y: 0, width: 0, height: 0 };
  private resizeHandle: ResizeHandle | null = null;

  connectedCallback() {
    this.boundScroll = () => {
      this.scrollX = window.scrollX;
      this.scrollY = window.scrollY;
    };
    window.addEventListener('scroll', this.boundScroll, { passive: true });
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.boundScroll);
  }

  private get placement() {
    const arr = this.canvas ? state.wireframePlacements : state.placements;
    return arr.find(p => p.id === this.placementId);
  }

  private update(id: string, updates: Partial<import('../../types').Placement>) {
    this.canvas ? updateWireframePlacement(id, updates) : updatePlacement(id, updates);
  }

  private remove(id: string) {
    this.canvas ? removeWireframePlacement(id) : removePlacement(id);
  }

  // ── Drag ──────────────────────────────────────────────────────────────────

  private handlePointerDown = (e: PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.dataset.action || target.dataset.resize) return;
    e.preventDefault();
    e.stopPropagation();

    const p = this.placement;
    if (!p) return;

    this.isDragging = true;
    this.pointerId = e.pointerId;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startBounds = { ...p.bounds };

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  // ── Resize ─────────────────────────────────────────────────────────────────

  private handleResizeDown = (e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const p = this.placement;
    if (!p) return;

    this.isResizing = true;
    this.resizeHandle = (e.currentTarget as HTMLElement).dataset.resize as ResizeHandle;
    this.pointerId = e.pointerId;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startBounds = { ...p.bounds };

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  // ── Move (shared for drag + resize) ────────────────────────────────────────

  private handlePointerMove = (e: PointerEvent) => {
    if (e.pointerId !== this.pointerId) return;
    const p = this.placement;
    if (!p) return;

    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;

    if (this.isDragging) {
      const newX = snapToGrid(this.startBounds.x + dx);
      const newY = snapToGrid(this.startBounds.y + dy);
      const contentArea = findContentArea(state.viewport.width);
      const alignment = getAlignment(newX, p.bounds.width, contentArea, state.viewport.width);
      const isOutsideViewport =
        newX + p.bounds.width > state.viewport.width ||
        newY + p.bounds.height > state.viewport.height ||
        newX < 0 || newY < 0;
      this.update(this.placementId, {
        bounds: { ...p.bounds, x: newX, y: newY },
        alignment,
        isOutsideViewport,
      });
    }

    if (this.isResizing && this.resizeHandle) {
      const h = this.resizeHandle;
      let { x, y, width, height } = this.startBounds;

      if (h.includes('e')) width = Math.max(MIN_W, snapToGrid(width + dx));
      if (h.includes('s')) height = Math.max(MIN_H, snapToGrid(height + dy));
      if (h.includes('w')) {
        const newW = Math.max(MIN_W, snapToGrid(width - dx));
        x = snapToGrid(x + (width - newW));
        width = newW;
      }
      if (h.includes('n')) {
        const newH = Math.max(MIN_H, snapToGrid(height - dy));
        y = snapToGrid(y + (height - newH));
        height = newH;
      }

      const contentArea = findContentArea(state.viewport.width);
      const alignment = getAlignment(x, width, contentArea, state.viewport.width);
      const isOutsideViewport =
        x + width > state.viewport.width || y + height > state.viewport.height || x < 0 || y < 0;

      this.update(this.placementId, { bounds: { x, y, width, height }, alignment, isOutsideViewport });
    }
  };

  private handlePointerUp = (e: PointerEvent) => {
    if (e.pointerId !== this.pointerId) return;
    this.isDragging = false;
    this.isResizing = false;
    this.resizeHandle = null;
  };

  private handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    this.remove(this.placementId);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  render() {
    const p = this.placement;
    if (!p) return null;

    const def = getComponentById(p.componentType.toLowerCase().replace(/\s/g, '-'));
    const primaryColor = state.settings.primaryColor;
    const svgContent = def?.svg
      ? def.svg
          .replace(/#14b8a6/g, primaryColor)
          .replace('<svg ', '<svg preserveAspectRatio="none" ')
      : '';

    const handles: ResizeHandle[] = ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'];
    const active = this.isHovered || this.isDragging || this.isResizing;

    return (
      <div
        class={`s2p-item ${this.isDragging ? 's2p-item--dragging' : ''} ${this.isResizing ? 's2p-item--resizing' : ''} ${p.isOutsideViewport ? 's2p-item--outside' : ''}`}
        style={{
          left: `${p.bounds.x - this.scrollX}px`,
          top: `${p.bounds.y - this.scrollY}px`,
          width: `${p.bounds.width}px`,
          height: `${p.bounds.height}px`,
        }}
        onPointerDown={this.handlePointerDown}
        onPointerMove={this.handlePointerMove}
        onPointerUp={this.handlePointerUp}
        onMouseEnter={() => { this.isHovered = true; }}
        onMouseLeave={() => { this.isHovered = false; }}
      >
        {/* SVG preview */}
        <div class="s2p-item__preview" innerHTML={svgContent} />

        {active && (
          <button class="s2p-item__delete" data-action="delete" onClick={this.handleDelete} title="Remove">✕</button>
        )}

        {/* Resize handles */}
        {active && handles.map(dir => (
          <div
            key={dir}
            class={`s2p-handle s2p-handle--${dir}`}
            data-resize={dir}
            onPointerDown={this.handleResizeDown}
            onPointerMove={this.handlePointerMove}
            onPointerUp={this.handlePointerUp}
          />
        ))}

      </div>
    );
  }
}
