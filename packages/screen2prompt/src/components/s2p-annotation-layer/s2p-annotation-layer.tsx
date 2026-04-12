import { Component, State } from '@stencil/core';
import { MultiSelectTarget } from '../../types';
import { state, setActiveAnnotationTarget, setActiveMultiSelect } from '../../store/widgetStore';

const DRAG_THRESHOLD = 6;
const MIN_AREA = 20;
const MAX_LABEL_ITEMS = 5;

// ── Element helpers ──────────────────────────────────────────────────────────

function describeEl(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase();
  const text = el.textContent?.trim().slice(0, 30) ?? '';

  if (tag === 'a' && text) return `link "${text}"`;
  if (tag === 'button' && text) return `button "${text}"`;
  if (tag === 'img') {
    const alt = el.getAttribute('alt');
    return alt ? `image "${alt}"` : 'image';
  }
  if (tag === 'input') {
    const type = (el as HTMLInputElement).type || 'text';
    const placeholder = (el as HTMLInputElement).placeholder;
    return placeholder ? `${type} input "${placeholder}"` : `${type} input`;
  }
  if (text) return `${tag} "${text}"`;
  if (el.id) return `${tag}#${el.id}`;
  const cls = Array.from(el.classList).find(c => c.length >= 3 && !/^\d/.test(c));
  if (cls) return `${tag}.${cls}`;
  return tag;
}

function getLeafElementsInRect(
  rect: { x: number; y: number; width: number; height: number },
  isWidget: (el: Element) => boolean
): HTMLElement[] {
  const all = Array.from(document.querySelectorAll('*')) as HTMLElement[];

  const contained = all.filter(el => {
    if (isWidget(el)) return false;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    // Element must be fully inside the selection rect (2px tolerance)
    return (
      r.left >= rect.x - 2 &&
      r.top >= rect.y - 2 &&
      r.right <= rect.x + rect.width + 2 &&
      r.bottom <= rect.y + rect.height + 2
    );
  });

  // Keep only leaves: no other contained element is a descendant of this one
  return contained.filter(el => !contained.some(other => other !== el && el.contains(other)));
}

function findCommonParent(elements: HTMLElement[]): HTMLElement | null {
  if (elements.length === 0) return null;
  if (elements.length === 1) return elements[0].parentElement;

  // Start from the parent of first leaf and walk up until all are contained
  let candidate: HTMLElement | null = elements[0].parentElement;
  while (candidate) {
    if (elements.every(el => candidate!.contains(el))) return candidate;
    candidate = candidate.parentElement;
  }
  return null;
}

function buildMultiSelectDescription(leaves: HTMLElement[]): string {
  const descriptions = leaves.map(describeEl);
  const shown = descriptions.slice(0, MAX_LABEL_ITEMS);
  const extra = descriptions.length - MAX_LABEL_ITEMS;
  let desc = `${leaves.length} element${leaves.length !== 1 ? 's' : ''}: ${shown.join(', ')}`;
  if (extra > 0) desc += ` +${extra} more`;
  return desc;
}

// ── Component ────────────────────────────────────────────────────────────────

@Component({
  tag: 's2p-annotation-layer',
  styleUrl: 's2p-annotation-layer.css',
  shadow: true,
})
export class S2pAnnotationLayer {
  @State() highlightRect: DOMRect | null = null;
  @State() isVisible: boolean = false;
  @State() dragRect: { x: number; y: number; width: number; height: number } | null = null;

  private currentTarget: HTMLElement | null = null;
  private dragStart: { x: number; y: number } | null = null;
  private isDragging: boolean = false;
  private didDrag: boolean = false;

  private boundMouseDown!: (e: MouseEvent) => void;
  private boundMouseMove!: (e: MouseEvent) => void;
  private boundMouseUp!: (e: MouseEvent) => void;
  private boundClick!: (e: MouseEvent) => void;
  private boundKeyDown!: (e: KeyboardEvent) => void;

  connectedCallback() {
    this.boundMouseDown = this.handleMouseDown.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
    this.boundClick = this.handleClick.bind(this);
    this.boundKeyDown = this.handleKeyDown.bind(this);

    document.addEventListener('mousedown', this.boundMouseDown);
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
    document.addEventListener('click', this.boundClick, true);
    document.addEventListener('keydown', this.boundKeyDown);
  }

  disconnectedCallback() {
    document.removeEventListener('mousedown', this.boundMouseDown);
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    document.removeEventListener('click', this.boundClick, true);
    document.removeEventListener('keydown', this.boundKeyDown);
    state.hoveredElement = null;
    this.isVisible = false;
    this.highlightRect = null;
    this.currentTarget = null;
    this.dragRect = null;
    this.dragStart = null;
    this.isDragging = false;
  }

  private isWidgetElement(target: EventTarget | null): boolean {
    if (!target) return false;
    const el = target as HTMLElement;
    if (el.tagName?.toLowerCase().startsWith('s2p-')) return true;
    return el.getRootNode() instanceof ShadowRoot;
  }

  private handleMouseDown(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (this.isWidgetElement(target)) return;
    this.dragStart = { x: e.clientX, y: e.clientY };
    this.isDragging = false;
    this.didDrag = false;
  }

  private handleMouseMove(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (this.isWidgetElement(target)) return;

    if (this.dragStart) {
      const dx = e.clientX - this.dragStart.x;
      const dy = e.clientY - this.dragStart.y;

      if (!this.isDragging && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
        this.isDragging = true;
        this.isVisible = false; // hide element hover highlight while dragging
      }

      if (this.isDragging) {
        this.dragRect = {
          x: Math.min(this.dragStart.x, e.clientX),
          y: Math.min(this.dragStart.y, e.clientY),
          width: Math.abs(dx),
          height: Math.abs(dy),
        };
        return;
      }
    }

    if (target === this.currentTarget) return;
    this.currentTarget = target;
    state.hoveredElement = target;
    this.highlightRect = target.getBoundingClientRect();
    this.isVisible = true;
  }

  private handleMouseUp(e: MouseEvent) {
    if (
      this.isDragging &&
      this.dragRect &&
      this.dragRect.width > MIN_AREA &&
      this.dragRect.height > MIN_AREA
    ) {
      this.didDrag = true;

      const rect = { ...this.dragRect };
      const leaves = getLeafElementsInRect(rect, this.isWidgetElement.bind(this));

      if (leaves.length > 0) {
        const commonParent = findCommonParent(leaves);
        const description = buildMultiSelectDescription(leaves);
        const target: MultiSelectTarget = { leaves, description, commonParent, rect };
        setActiveMultiSelect(target);
        e.preventDefault();
      }
    }

    this.isDragging = false;
    this.dragStart = null;
    this.dragRect = null;
  }

  private handleClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (this.isWidgetElement(target)) return;

    if (this.didDrag) {
      this.didDrag = false;
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    setActiveAnnotationTarget(target);
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      setActiveAnnotationTarget(null);
      setActiveMultiSelect(null);
      this.isVisible = false;
      this.dragRect = null;
      this.isDragging = false;
      this.dragStart = null;
    }
  }

  render() {
    const multiSelect = state.activeMultiSelect;

    return [
      this.isVisible && this.highlightRect && !this.isDragging && !multiSelect && (
        <div
          class="s2p-highlight"
          style={{
            top: `${this.highlightRect.top}px`,
            left: `${this.highlightRect.left}px`,
            width: `${this.highlightRect.width}px`,
            height: `${this.highlightRect.height}px`,
          }}
        />
      ),

      this.isDragging && this.dragRect && (
        <div
          class="s2p-drag-selection"
          style={{
            top: `${this.dragRect.y}px`,
            left: `${this.dragRect.x}px`,
            width: `${this.dragRect.width}px`,
            height: `${this.dragRect.height}px`,
          }}
        />
      ),

      multiSelect && !this.isDragging && (
        <div
          class="s2p-area-highlight"
          style={{
            top: `${multiSelect.rect.y}px`,
            left: `${multiSelect.rect.x}px`,
            width: `${multiSelect.rect.width}px`,
            height: `${multiSelect.rect.height}px`,
          }}
        />
      ),
    ];
  }
}
