import { Annotation, Placement, Settings } from '../types';
import { findContentArea, getAlignment, getCSSHints } from './cssHints';

interface GeneratorInput {
  annotations: Annotation[];
  placements: Placement[];
  wireframePlacements: Placement[];
  wireframeDescription: string;
  settings: Settings;
  viewport: { width: number; height: number };
  pathname?: string;
}

/**
 * Generate the Page Feedback section from annotations.
 */
function generatePageFeedback(
  annotations: Annotation[],
  viewport: { width: number; height: number },
  detail: Settings['outputDetail'],
  pathname: string
): string {
  if (annotations.length === 0) return '';

  const lines: string[] = [
    `## Page Feedback: ${pathname}`,
    `**Viewport:** ${viewport.width}×${viewport.height}`,
    '',
  ];

  annotations.forEach((ann, i) => {
    const title = ann.label ?? ann.selector;
    lines.push(`### ${i + 1}. ${title}`);
    lines.push(`**Location:** ${ann.selector}`);

    if (ann.sourcePath && detail !== 'compact') {
      lines.push(`**Source:** ${ann.sourcePath}`);
    }

    if (ann.componentTree?.length && detail !== 'compact') {
      lines.push(`**React Tree:** ${ann.componentTree.join(' > ')}`);
    }

    if (ann.computedStyles && Object.keys(ann.computedStyles).length > 0 && (detail === 'detailed' || detail === 'forensic')) {
      lines.push('**Computed Styles:**');
      lines.push('```css');
      for (const [prop, value] of Object.entries(ann.computedStyles)) {
        lines.push(`${prop}: ${value};`);
      }
      lines.push('```');
    }

    lines.push(`**Feedback:** ${ann.feedback}`);
    lines.push('');
  });

  return lines.join('\n').trimEnd();
}

/**
 * Group placements into rows based on Y proximity.
 */
function groupIntoRows(placements: Placement[]): Array<{ y: number; items: Placement[] }> {
  const sorted = [...placements].sort((a, b) => a.bounds.y - b.bounds.y);
  const rows: Array<{ y: number; items: Placement[] }> = [];
  const ROW_THRESHOLD = 60;

  for (const p of sorted) {
    const row = rows.find(r => Math.abs(r.y - p.bounds.y) < ROW_THRESHOLD);
    if (row) {
      row.items.push(p);
    } else {
      rows.push({ y: p.bounds.y, items: [p] });
    }
  }

  return rows;
}

/**
 * Generate the Design Layout section from placements.
 */
function generateDesignLayout(
  placements: Placement[],
  viewport: { width: number; height: number }
): string {
  if (placements.length === 0) return '';

  const contentArea = findContentArea(viewport.width);
  const lines: string[] = [
    '## Design Layout',
    `> ${placements.length} component${placements.length > 1 ? 's' : ''} placed`,
    '',
    '### Reference Frame',
    `- Viewport: \`${viewport.width}×${viewport.height}px\``,
    `- Content area: \`${contentArea.width}px\` wide, left edge at \`x=${contentArea.x}\`, right at \`x=${contentArea.right}\` (\`${contentArea.selector}\`)`,
    '',
    '### Components',
  ];

  placements.forEach((p, i) => {
    const alignment = getAlignment(p.bounds.x, p.bounds.width, contentArea, viewport.width);
    const cssHints = getCSSHints(p.bounds, alignment, contentArea);
    const outside = p.isOutsideViewport ? '\n   - **Outside viewport**' : '';

    lines.push(
      `${i + 1}. **${p.componentType}** — \`${p.bounds.width}×${p.bounds.height}px\` at \`(${p.bounds.x}, ${p.bounds.y})\``
    );
    lines.push(`   - ${p.alignment.charAt(0).toUpperCase() + p.alignment.slice(1)}-aligned`);
    lines.push(`   - CSS: \`${cssHints}\`` + outside);
  });

  // Row analysis
  const rows = groupIntoRows(placements);
  lines.push('', '### Layout Analysis');
  rows.forEach((row, i) => {
    const names = row.items.map(p => p.componentType).join(', ');
    lines.push(`- Row ${i + 1} (y≈${Math.round(row.y)}): ${names}`);
  });

  // Suggested implementation
  lines.push('', '### Suggested Implementation');
  const suggestion = placements.map(p => p.componentType.toLowerCase()).join(', ');
  lines.push(`- Add ${suggestion} following the layout analysis above`);

  return lines.join('\n');
}

/**
 * Generate the Wireframe New Page section.
 */
function generateWireframeNewPage(
  placements: Placement[],
  description: string,
  viewport: { width: number; height: number }
): string {
  if (placements.length === 0 && !description.trim()) return '';

  const lines: string[] = ['## Wireframe New Page'];

  if (description.trim()) {
    lines.push(`> ${description.trim()}`);
    lines.push('');
  }

  if (placements.length > 0) {
    lines.push(`> ${placements.length} component${placements.length > 1 ? 's' : ''} placed`);
    lines.push('', '### Components');

    const contentArea = findContentArea(viewport.width);
    placements.forEach((p, i) => {
      const alignment = getAlignment(p.bounds.x, p.bounds.width, contentArea, viewport.width);
      const cssHints = getCSSHints(p.bounds, alignment, contentArea);
      lines.push(
        `${i + 1}. **${p.componentType}** — \`${p.bounds.width}×${p.bounds.height}px\` at \`(${p.bounds.x}, ${p.bounds.y})\``
      );
      lines.push(`   - ${alignment.charAt(0).toUpperCase() + alignment.slice(1)}-aligned`);
      lines.push(`   - CSS: \`${cssHints}\``);
    });

    const rows = groupIntoRows(placements);
    lines.push('', '### Layout Analysis');
    rows.forEach((row, i) => {
      const names = row.items.map(p => p.componentType).join(', ');
      lines.push(`- Row ${i + 1} (y≈${Math.round(row.y)}): ${names}`);
    });
  }

  return lines.join('\n');
}

/**
 * Generate the complete markdown output from widget state.
 */
export function generateMarkdown(input: GeneratorInput): string {
  const { annotations, placements, wireframePlacements, wireframeDescription, settings, viewport } = input;
  const pathname = input.pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '/');

  const sections: string[] = [];

  const pageFeedback = generatePageFeedback(annotations, viewport, settings.outputDetail, pathname);
  if (pageFeedback) sections.push(pageFeedback);

  const designLayout = generateDesignLayout(placements, viewport);
  if (designLayout) sections.push(designLayout);

  const wireframePage = generateWireframeNewPage(wireframePlacements, wireframeDescription, viewport);
  if (wireframePage) sections.push(wireframePage);

  return sections.join('\n\n');
}
