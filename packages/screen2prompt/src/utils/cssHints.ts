export interface ContentArea {
  x: number;
  right: number;
  width: number;
  selector: string;
}

export type Alignment = 'left' | 'center' | 'right' | 'custom';

/**
 * Find the most likely content container on the page.
 * Checks common selectors in priority order.
 */
export function findContentArea(viewportWidth: number): ContentArea {
  const selectors = ['main', 'article', '[role="main"]', '.content', '#content', '.container', '.wrapper'];

  for (const sel of selectors) {
    try {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      // Must be a reasonable content width (not full viewport, not tiny)
      if (rect.width > 200 && rect.width < viewportWidth * 0.98) {
        return {
          x: rect.left,
          right: rect.right,
          width: rect.width,
          selector: sel,
        };
      }
    } catch {
      continue;
    }
  }

  // Fallback: assume centered content with 80% width
  const width = Math.round(viewportWidth * 0.8);
  const x = Math.round((viewportWidth - width) / 2);
  return { x, right: x + width, width, selector: 'body' };
}

/**
 * Determine horizontal alignment of an element within the content area.
 */
export function getAlignment(
  elementX: number,
  elementWidth: number,
  contentArea: ContentArea,
  viewportWidth: number
): Alignment {
  const centerX = elementX + elementWidth / 2;
  const viewportCenterX = viewportWidth / 2;

  if (Math.abs(centerX - viewportCenterX) < 20) return 'center';
  if (elementX <= contentArea.x + 20) return 'left';
  if (elementX + elementWidth >= contentArea.right - 20) return 'right';
  return 'custom';
}

/**
 * Generate CSS hints for a placed element.
 */
export function getCSSHints(
  bounds: { x: number; y: number; width: number; height: number },
  alignment: Alignment,
  contentArea: ContentArea
): string {
  const hints: string[] = [];

  switch (alignment) {
    case 'center':
      hints.push('margin-inline: auto');
      hints.push(`width: ${bounds.width}px`);
      break;
    case 'left':
      hints.push('margin-left: 0');
      hints.push(`width: ${Math.round((bounds.width / contentArea.width) * 100)}%` + ` (${bounds.width}px)`);
      break;
    case 'right':
      hints.push('margin-left: auto');
      hints.push(`width: ${bounds.width}px`);
      break;
    case 'custom': {
      const marginLeft = bounds.x - contentArea.x;
      hints.push(`margin-left: ${marginLeft}px`);
      hints.push(`width: ${bounds.width}px`);
      break;
    }
  }

  return hints.join(', ');
}
