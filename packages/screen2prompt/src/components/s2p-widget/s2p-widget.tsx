import { Component, Prop, State } from '@stencil/core';
import { WidgetMode } from '../../types';
import {
  state,
  setMode,
} from '../../store/widgetStore';

@Component({
  tag: 's2p-widget',
  styleUrl: 's2p-widget.css',
  shadow: true,
})
export class S2pWidget {
  @Prop() dontShowInProd: boolean = false;

  @State() mode: WidgetMode = 'idle';

  disconnectedCallback() {
    setMode('idle');
  }

  render() {
    if (typeof window === 'undefined') return null;
    if (this.dontShowInProd) return null;

    const primaryColor = state.settings.primaryColor;
    return (
      <div class="s2p-root" style={{ '--s2p-primary': primaryColor } as any}>
        <s2p-toolbar
          mode={this.mode}
          annotationCount={state.annotations.length}
          placementCount={state.placements.length + state.wireframePlacements.length}
          onModeChange={(e: CustomEvent<WidgetMode>) => {
            const next = e.detail;
            this.mode = next;
            setMode(next);
          }}
        />

        {this.mode === 'annotation' && <s2p-annotation-layer />}

        {this.mode === 'layout' && state.placements.map(p => (
          <s2p-wireframe-item key={p.id} placementId={p.id} />
        ))}

        {this.mode === 'wireframe' && <s2p-wireframe-canvas />}

        {this.mode === 'wireframe' && state.wireframePlacements.map(p => (
          <s2p-wireframe-item key={p.id} placementId={p.id} canvas />
        ))}

        {(state.activeAnnotationTarget !== null || state.activeMultiSelect !== null || state.popupAnnotationId !== null) && (
          <s2p-annotation-popup />
        )}

        <s2p-annotation-markers />
      </div>
    );
  }
}
