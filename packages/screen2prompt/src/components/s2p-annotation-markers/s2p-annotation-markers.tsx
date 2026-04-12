import { Component, State } from '@stencil/core';
import {
  state,
  onChange,
  setActiveAnnotationTarget,
  setActiveMultiSelect,
  setPopupAnnotationId,
} from '../../store/widgetStore';

interface MarkerPosition {
  id: number;
  x: number;
  y: number;
  index: number;
}

@Component({
  tag: 's2p-annotation-markers',
  styleUrl: 's2p-annotation-markers.css',
  shadow: true,
})
export class S2pAnnotationMarkers {
  @State() positions: MarkerPosition[] = [];

  private boundScroll!: () => void;
  private boundResize!: () => void;

  connectedCallback() {
    this.boundScroll = this.recomputePositions.bind(this);
    this.boundResize = this.recomputePositions.bind(this);

    window.addEventListener('scroll', this.boundScroll, { passive: true });
    window.addEventListener('resize', this.boundResize);
    onChange('annotations', () => this.recomputePositions());
    this.recomputePositions();
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.boundScroll);
    window.removeEventListener('resize', this.boundResize);
  }

  private recomputePositions() {
    this.positions = state.annotations
      .map((ann, i) => {
        // Area/multi-select annotations use stored bounds
        if (ann.type === 'area' && ann.areaBounds) {
          return {
            id: ann.id,
            x: ann.areaBounds.x - 10,
            y: ann.areaBounds.y - 10,
            index: i + 1,
          };
        }

        try {
          const el = document.querySelector(ann.selector) as HTMLElement | null;
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          return {
            id: ann.id,
            x: rect.left - 10,
            y: rect.top - 10,
            index: i + 1,
          };
        } catch {
          return null;
        }
      })
      .filter((m): m is MarkerPosition => m !== null);
  }

  private handleMarkerClick(id: number) {
    const ann = state.annotations.find(a => a.id === id);
    if (!ann) return;

    if (ann.type === 'area' && ann.areaBounds) {
      // Restore the area highlight and open popup in edit mode
      setActiveMultiSelect({
        leaves: [],
        description: ann.label ?? 'Area selection',
        commonParent: null,
        rect: ann.areaBounds,
      });
    } else {
      try {
        const el = document.querySelector(ann.selector) as HTMLElement | null;
        if (el) setActiveAnnotationTarget(el);
      } catch {
        // selector may be invalid if DOM changed
      }
    }

    setPopupAnnotationId(id);
  }

  render() {
    if (this.positions.length === 0) return null;

    return (
      <div class="s2p-markers-container">
        {this.positions.map(m => (
          <div
            key={String(m.id)}
            class="s2p-marker"
            style={{ left: `${m.x}px`, top: `${m.y}px` }}
            onClick={() => this.handleMarkerClick(m.id)}
            title={`Annotation ${m.index} — click to edit`}
          >
            {m.index}
          </div>
        ))}
      </div>
    );
  }
}
