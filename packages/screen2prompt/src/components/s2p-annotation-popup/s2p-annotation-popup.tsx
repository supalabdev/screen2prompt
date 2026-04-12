import { Component, State } from '@stencil/core';
import { Annotation } from '../../types';
import {
  state,
  setActiveAnnotationTarget,
  setActiveMultiSelect,
  setPopupAnnotationId,
  addAnnotation,
  updateAnnotation,
} from '../../store/widgetStore';
import { getUniqueCSSSelector } from '../../utils/cssSelector';
import { getReactComponentTree, getSourceFilePath, getComputedStyleSnapshot } from '../../utils/reactFiber';

function describeElement(el: HTMLElement): string {
  const selection = window.getSelection()?.toString().trim();
  if (selection) return `"${selection}"`;

  const tag = el.tagName.toLowerCase();
  const text = el.textContent?.trim().slice(0, 40);
  if ((tag === 'button' || tag === 'a') && text) return `${tag} "${text}"`;

  if (el.id) return `${tag}#${el.id}`;

  const cls = Array.from(el.classList).find(c => c.length >= 3 && !/^\d/.test(c));
  if (cls) return `${tag}.${cls}`;

  return tag;
}

@Component({
  tag: 's2p-annotation-popup',
  styleUrl: 's2p-annotation-popup.css',
  shadow: true,
})
export class S2pAnnotationPopup {
  @State() feedbackText: string = '';
  @State() elementDescription: string = '';
  @State() targetRect: { top: number; bottom: number; left: number; width: number; height: number } | null = null;
  @State() isEditMode: boolean = false;

  private lastTarget: HTMLElement | null = null;
  private lastMultiKey: string | null = null;

  componentWillRender() {
    const target = state.activeAnnotationTarget;
    const multi = state.activeMultiSelect;
    const editId = state.popupAnnotationId;

    if (!target && !multi && editId === null) {
      this.feedbackText = '';
      this.isEditMode = false;
      this.lastTarget = null;
      this.lastMultiKey = null;
      return;
    }

    if (multi) {
      const key = `${multi.rect.x},${multi.rect.y}`;
      if (key !== this.lastMultiKey) {
        this.lastMultiKey = key;
        this.targetRect = {
          top: multi.rect.y,
          bottom: multi.rect.y + multi.rect.height,
          left: multi.rect.x,
          width: multi.rect.width,
          height: multi.rect.height,
        };
        if (editId === null) {
          this.elementDescription = multi.description;
        }
      }
    } else if (target && target !== this.lastTarget) {
      this.lastTarget = target;
      const rect = target.getBoundingClientRect();
      this.targetRect = {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };
      this.elementDescription = describeElement(target);
    }

    if (editId !== null && this.feedbackText === '') {
      const ann = state.annotations.find(a => a.id === editId);
      if (ann) {
        this.feedbackText = ann.feedback;
        this.isEditMode = true;
        if (ann.label) this.elementDescription = ann.label;
      }
    }
  }

  private getPopupStyle(): { top: string; left: string } {
    if (!this.targetRect) return { top: '20px', left: '20px' };
    const POPUP_WIDTH = 320;
    const POPUP_HEIGHT = 190;
    const OFFSET = 8;
    let top = this.targetRect.bottom + OFFSET;
    let left = this.targetRect.left;

    if (top + POPUP_HEIGHT > window.innerHeight) top = this.targetRect.top - POPUP_HEIGHT - OFFSET;
    if (left + POPUP_WIDTH > window.innerWidth) left = window.innerWidth - POPUP_WIDTH - OFFSET;
    if (left < OFFSET) left = OFFSET;
    if (top < OFFSET) top = OFFSET;

    return { top: `${top}px`, left: `${left}px` };
  }

  private handleConfirm = () => {
    const target = state.activeAnnotationTarget;
    const multi = state.activeMultiSelect;
    if (!this.feedbackText.trim()) return;

    if (this.isEditMode && state.popupAnnotationId !== null) {
      updateAnnotation(state.popupAnnotationId, { feedback: this.feedbackText.trim() });
    } else if (multi) {
      const parent = multi.commonParent;
      const sourcePath = parent ? getSourceFilePath(parent) : undefined;
      const componentTree = parent ? getReactComponentTree(parent) : [];

      const annotation: Annotation = {
        id: Date.now(),
        type: 'area',
        label: multi.description,
        selector: 'multi-select',
        sourcePath,
        componentTree: componentTree.length ? componentTree : undefined,
        feedback: this.feedbackText.trim(),
        position: {
          x: multi.rect.x + multi.rect.width / 2,
          y: multi.rect.y,
        },
        viewport: { ...state.viewport },
        areaBounds: { ...multi.rect },
      };
      addAnnotation(annotation);
    } else if (target) {
      const selector = getUniqueCSSSelector(target);
      const componentTree = getReactComponentTree(target);
      const sourcePath = getSourceFilePath(target);
      const computedStyles = getComputedStyleSnapshot(target, state.settings.outputDetail);

      const annotation: Annotation = {
        id: Date.now(),
        type: 'element',
        selector,
        sourcePath,
        componentTree: componentTree.length ? componentTree : undefined,
        computedStyles: Object.keys(computedStyles).length ? computedStyles : undefined,
        feedback: this.feedbackText.trim(),
        position: {
          x: this.targetRect ? this.targetRect.left + this.targetRect.width / 2 : 0,
          y: this.targetRect ? this.targetRect.top : 0,
        },
        viewport: { ...state.viewport },
      };
      addAnnotation(annotation);
    }

    this.dismiss();
  };

  private dismiss = () => {
    setActiveAnnotationTarget(null);
    setActiveMultiSelect(null);
    setPopupAnnotationId(null);
    this.feedbackText = '';
    this.isEditMode = false;
    this.lastTarget = null;
    this.lastMultiKey = null;
  };

  render() {
    const hasTarget = state.activeAnnotationTarget !== null;
    const hasMulti = state.activeMultiSelect !== null;
    const hasEdit = state.popupAnnotationId !== null;

    if (!hasTarget && !hasMulti && !hasEdit) return null;

    const style = this.getPopupStyle();

    return (
      <div class="s2p-popup" style={style}>
        <div class="s2p-popup__header">
          <span class="s2p-popup__element-desc" title={this.elementDescription}>
            {this.elementDescription}
          </span>
          <button class="s2p-popup__close" onClick={this.dismiss}>✕</button>
        </div>

        <textarea
          class="s2p-popup__textarea"
          placeholder="Describe the change..."
          value={this.feedbackText}
          onInput={(e) => { this.feedbackText = (e.target as HTMLTextAreaElement).value; }}
          ref={(el) => el && setTimeout(() => el.focus(), 50)}
          rows={3}
        />

        <div class="s2p-popup__footer">
          <button class="s2p-popup__btn s2p-popup__btn--cancel" onClick={this.dismiss}>
            Cancel
          </button>
          <button
            class="s2p-popup__btn s2p-popup__btn--confirm"
            onClick={this.handleConfirm}
            disabled={!this.feedbackText.trim()}
          >
            {this.isEditMode ? 'Update' : 'Add annotation'}
          </button>
        </div>
      </div>
    );
  }
}
