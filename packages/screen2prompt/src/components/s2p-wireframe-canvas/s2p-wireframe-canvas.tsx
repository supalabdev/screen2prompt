import { Component, State } from '@stencil/core';
import { state, setWireframeDescription } from '../../store/widgetStore';

@Component({
  tag: 's2p-wireframe-canvas',
  styleUrl: 's2p-wireframe-canvas.css',
  shadow: true,
})
export class S2pWireframeCanvas {
  /** 0 = fully transparent overlay (page fully visible), 1 = fully opaque */
  @State() overlayOpacity: number = 0.7;

  private handleDescriptionInput = (e: Event) => {
    setWireframeDescription((e.target as HTMLTextAreaElement).value);
  };

  private handleOpacityInput = (e: Event) => {
    this.overlayOpacity = parseFloat((e.target as HTMLInputElement).value);
  };

  render() {
    return (
      <div class="s2p-canvas">
        {/* Semi-transparent page dimmer */}
        <div
          class="s2p-canvas__overlay"
          style={{ opacity: `${this.overlayOpacity}` }}
        />

        {/* Dot grid layer */}
        <div class="s2p-canvas__grid" />

        {/* Controls bar */}
        <div class="s2p-canvas__bar">
          <textarea
            class="s2p-canvas__description"
            placeholder="Describe this new page (e.g. 'Dashboard for admin users with sidebar nav')…"
            rows={2}
            value={state.wireframeDescription}
            onInput={this.handleDescriptionInput}
          />
          <div class="s2p-canvas__opacity-ctrl">
            <span class="s2p-canvas__opacity-label">Page</span>
            <input
              type="range"
              class="s2p-canvas__slider"
              min="0"
              max="1"
              step="0.05"
              value={this.overlayOpacity}
              onInput={this.handleOpacityInput}
            />
            <span class="s2p-canvas__opacity-value">{Math.round(this.overlayOpacity * 100)}%</span>
          </div>
        </div>
      </div>
    );
  }
}
