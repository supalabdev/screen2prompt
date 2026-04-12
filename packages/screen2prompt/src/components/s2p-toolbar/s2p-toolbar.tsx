import {
  Component,
  Element,
  Prop,
  State,
  Event,
  EventEmitter,
  Listen,
} from "@stencil/core";
import { WidgetMode } from "../../types";
import {
  state,
  clearAnnotations,
  clearPlacements,
  clearWireframePlacements,
  updateViewport,
  updateSettings,
} from "../../store/widgetStore";
import { generateMarkdown } from "../../utils/markdownGenerator";
import {
  CursorIcon,
  GridIcon,
  LayoutIcon,
  CopyIcon,
  TrashIcon,
  SettingsIcon,
  DragHandleIcon,
} from "./icons";

/**
 * Draggable toolbar component
 *
 * Features:
 *   - Drag via PointerEvents (no external deps)
 *   - Mode buttons (annotation/layout/wireframe)
 *   - Copy and Clear buttons
 *   - Settings button
 *   - Annotation count badge
 *   - Keyboard shortcut: Cmd+Shift+F to toggle
 */
@Component({
  tag: "s2p-toolbar",
  styleUrl: "s2p-toolbar.css",
  shadow: true,
})
export class S2pToolbar {
  @Element() el!: HTMLElement;

  @Prop() mode: WidgetMode = "idle";
  @Prop() annotationCount: number = 0;
  @Prop() placementCount: number = 0;

  @Event() modeChange!: EventEmitter<WidgetMode>;

  @State() posX: number = 0;
  @State() posY: number = 0;
  @State() isDragging: boolean = false;
  @State() copied: boolean = false;
  @State() showSettings: boolean = false;

  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private dragStartPosX: number = 0;
  private dragStartPosY: number = 0;
  private pointerId: number = 0;

  componentWillLoad() {
    this.posY = window.innerHeight - 76;
    state.toolbarPosition = { x: this.posX, y: this.posY };
  }

  componentDidLoad() {
    const toolbar = this.el.shadowRoot?.querySelector('.s2p-toolbar') as HTMLElement | null;
    const w = toolbar?.offsetWidth ?? 260;
    this.posX = Math.round((window.innerWidth - w) / 2);
    state.toolbarPosition = { x: this.posX, y: this.posY };
  }

  @Listen("keydown", { target: "window" })
  handleKeyDown(event: KeyboardEvent) {
    const isMacShortcut =
      event.metaKey && event.shiftKey && event.code === "KeyF";
    const isWindowsShortcut =
      event.ctrlKey && event.shiftKey && event.code === "KeyF";

    if (isMacShortcut || isWindowsShortcut) {
      event.preventDefault();
      this.toggleMode();
    }

    if (event.code === "Escape" && this.mode !== "idle") {
      event.preventDefault();
      this.mode = "idle";
      this.modeChange.emit("idle");
    }
  }

  private handlePointerDown = (event: PointerEvent) => {
    this.isDragging = true;
    this.pointerId = event.pointerId;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragStartPosX = this.posX;
    this.dragStartPosY = this.posY;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  private handlePointerMove = (event: PointerEvent) => {
    if (!this.isDragging || event.pointerId !== this.pointerId) return;
    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;
    this.posX = this.dragStartPosX + deltaX;
    this.posY = this.dragStartPosY + deltaY;
    state.toolbarPosition = { x: this.posX, y: this.posY };
  };

  private handlePointerUp = (event: PointerEvent) => {
    if (event.pointerId !== this.pointerId) return;
    this.isDragging = false;
  };

  private toggleMode = () => {
    const nextMode: WidgetMode = this.mode === "idle" ? "annotation" : "idle";
    this.mode = nextMode;
    this.modeChange.emit(nextMode);
  };

  private setAnnotationMode = () => {
    const nextMode: WidgetMode =
      this.mode === "annotation" ? "idle" : "annotation";
    this.mode = nextMode;
    this.modeChange.emit(nextMode);
  };

  private setLayoutMode = () => {
    const nextMode: WidgetMode = this.mode === "layout" ? "idle" : "layout";
    this.mode = nextMode;
    this.modeChange.emit(nextMode);
  };

  private setWireframeMode = () => {
    const nextMode: WidgetMode =
      this.mode === "wireframe" ? "idle" : "wireframe";
    this.mode = nextMode;
    this.modeChange.emit(nextMode);
  };

  private handleCopy = async () => {
    updateViewport(window.innerWidth, window.innerHeight);

    const markdown = generateMarkdown({
      annotations: state.annotations,
      placements: state.placements,
      wireframePlacements: state.wireframePlacements,
      wireframeDescription: state.wireframeDescription,
      settings: state.settings,
      viewport: state.viewport,
    });

    try {
      await navigator.clipboard.writeText(markdown);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = markdown;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }

    if (state.settings.clearOnCopy) {
      clearAnnotations();
      clearPlacements();
      clearWireframePlacements();
    }

    this.copied = true;
    setTimeout(() => {
      this.copied = false;
    }, 2000);
  };

  private handleClear = () => {
    clearAnnotations();
    clearPlacements();
    clearWireframePlacements();
  };

  private handleSettings = () => {
    this.showSettings = !this.showSettings;
  };

  private setColor = (color: string) => {
    updateSettings({ primaryColor: color });
  };

  render() {
    return (
      <div
        class="s2p-toolbar-root"
        style={{ left: `${this.posX}px`, top: `${this.posY}px`, '--s2p-primary': state.settings.primaryColor } as any}
        onPointerMove={this.handlePointerMove}
        onPointerUp={this.handlePointerUp}
        onPointerLeave={this.handlePointerUp}
      >
        {(this.mode === "layout" || this.mode === "wireframe") && (
          <s2p-layout-panel canvasMode={this.mode === "wireframe"} />
        )}

        {this.showSettings && (
          <div class="s2p-settings">
            <div class="s2p-settings__title">Primary Color</div>
            <div class="s2p-settings__swatches">
              {[
                { label: "Orange", value: "#f97316" },
                { label: "Red",    value: "#ef4444" },
                { label: "Blue",   value: "#3b82f6" },
                { label: "Teal",   value: "#14b8a6" },
                { label: "Yellow", value: "#eab308" },
                { label: "Purple", value: "#a855f7" },
                { label: "Pink",   value: "#ec4899" },
                { label: "White",  value: "#f4f4f5" },
                { label: "Black",  value: "#27272a" },
              ].map(c => (
                <button
                  key={c.value}
                  class={`s2p-settings__swatch ${state.settings.primaryColor === c.value ? "s2p-settings__swatch--active" : ""}`}
                  style={{ background: c.value }}
                  title={c.label}
                  onClick={() => this.setColor(c.value)}
                />
              ))}
            </div>
          </div>
        )}

        <div
          class="s2p-toolbar"
          style={{ cursor: this.isDragging ? "grabbing" : "grab" }}
        >
          {/* Drag Handle */}
          <div
            class="s2p-toolbar__handle"
            onPointerDown={this.handlePointerDown}
            title="Drag to move toolbar"
          >
            <DragHandleIcon />
          </div>

          {/* Mode Buttons */}
          <div class="s2p-toolbar__group">
            <button
              class={`s2p-toolbar__btn ${this.mode === "annotation" ? "s2p-toolbar__btn--active" : ""}`}
              onClick={this.setAnnotationMode}
              title="Annotation mode (Cmd+Shift+F)"
            >
              <CursorIcon />
            </button>

            <button
              class={`s2p-toolbar__btn ${this.mode === "layout" ? "s2p-toolbar__btn--active" : ""}`}
              onClick={this.setLayoutMode}
              title="Layout mode"
            >
              <GridIcon />
            </button>

            <button
              class={`s2p-toolbar__btn ${this.mode === "wireframe" ? "s2p-toolbar__btn--active" : ""}`}
              onClick={this.setWireframeMode}
              title="Wireframe mode"
            >
              <LayoutIcon />
            </button>
          </div>

          {/* Separator */}
          <div class="s2p-toolbar__separator" />

          {/* Action Buttons */}
          <div class="s2p-toolbar__group">
            <button
              class={`s2p-toolbar__btn ${this.copied ? "s2p-toolbar__btn--copied" : ""}`}
              onClick={this.handleCopy}
              title={this.copied ? "Copied!" : "Copy to clipboard"}
              disabled={this.annotationCount === 0 && this.placementCount === 0}
            >
              {this.copied ? "✓" : <CopyIcon />}
            </button>

            <button
              class="s2p-toolbar__btn"
              onClick={this.handleClear}
              title="Clear all annotations"
              disabled={this.annotationCount === 0 && this.placementCount === 0}
            >
              <TrashIcon />
            </button>

            <button
              class="s2p-toolbar__btn"
              onClick={this.handleSettings}
              title="Settings"
            >
              <SettingsIcon />
            </button>
          </div>

          {/* Annotation Counter Badge */}
          {this.annotationCount > 0 && (
            <div class="s2p-toolbar__badge">
              {this.annotationCount > 99 ? "99+" : this.annotationCount}
            </div>
          )}
        </div>
      </div>
    );
  }
}
