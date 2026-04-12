// Tailwind utility scale values
const TAILWIND_SCALES = new Set([
  'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl',
  'full', 'auto', 'none', 'screen', 'min', 'max', 'fit',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '14', '16',
  '20', '24', '28', '32', '36', '40', '44', '48', '52', '56', '60', '64', '72', '80', '96',
]);

// Single-word Tailwind utilities
const TAILWIND_SINGLE = new Set([
  'flex', 'grid', 'block', 'inline', 'hidden', 'relative', 'absolute', 'fixed', 'sticky',
  'static', 'overflow', 'truncate', 'uppercase', 'lowercase', 'capitalize', 'italic',
  'underline', 'bold', 'semibold', 'normal', 'medium', 'light', 'thin',
  'rounded', 'border', 'shadow', 'outline', 'ring', 'space', 'divide', 'gap',
  'grow', 'shrink', 'wrap', 'nowrap', 'col', 'row',
]);

// Tailwind utility prefixes — classes starting with these are utility-only
const TAILWIND_PREFIXES = [
  'font-', 'text-', 'bg-', 'border-', 'shadow-', 'ring-', 'outline-',
  'tracking-', 'leading-', 'justify-', 'items-', 'content-', 'self-',
  'place-', 'gap-', 'space-', 'divide-', 'overflow-', 'object-',
  'inset-', 'top-', 'bottom-', 'left-', 'right-', 'z-', 'opacity-',
  'cursor-', 'select-', 'pointer-', 'resize-', 'appearance-',
  'w-', 'h-', 'min-', 'max-', 'p-', 'px-', 'py-', 'pt-', 'pb-', 'pl-', 'pr-',
  'm-', 'mx-', 'my-', 'mt-', 'mb-', 'ml-', 'mr-',
  'rounded-', 'translate-', 'rotate-', 'scale-', 'skew-',
  'transition-', 'duration-', 'ease-', 'delay-',
  'dark:', 'hover:', 'focus:', 'active:', 'disabled:', 'sm:', 'md:', 'lg:', 'xl:',
  'aspect-', 'columns-', 'flex-', 'grid-', 'col-', 'row-', 'order-',
  'decoration-', 'indent-', 'align-', 'whitespace-', 'break-', 'line-',
  'fill-', 'stroke-', 'sr-',
];

/**
 * Returns true if a CSS class name is descriptive enough to use in a selector.
 * Filters out Tailwind utilities, hashed tokens, and framework-generated classes.
 */
function isDescriptiveClass(cls: string): boolean {
  if (cls.length < 4) return false;
  if (/^\d+$/.test(cls)) return false; // all numeric
  if (/^[a-zA-Z0-9]{5,8}$/.test(cls) && /\d/.test(cls)) return false; // hashed token
  if (/^css-/.test(cls)) return false; // CSS-in-JS generated
  if (TAILWIND_SINGLE.has(cls)) return false;

  // Check known Tailwind prefixes (including responsive/state variants with colon)
  if (TAILWIND_PREFIXES.some(p => cls.startsWith(p) || cls.includes(':' + p.replace(':', '')))) return false;

  // Tailwind pattern: [prefix]-[scale] e.g. h-12, w-full, text-xl, max-w-xs, flex-col, flex-1
  if (/^[a-z]+(-[a-z0-9]+){1,3}$/.test(cls)) {
    const parts = cls.split('-');
    const lastPart = parts[parts.length - 1];
    if (TAILWIND_SCALES.has(lastPart) || /^\d+$/.test(lastPart)) return false;
    // Short segments are likely utilities (e.g. flex-col, items-center, justify-end)
    if (parts.every(p => p.length <= 6)) return false;
  }

  return true;
}

/**
 * Build the simplest selector for an element at a single DOM level:
 * tag, optionally followed by descriptive classes.
 */
function buildSegment(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase();
  const classes = Array.from(el.classList)
    .filter(isDescriptiveClass)
    .slice(0, 2) // max 2 classes per segment
    .map(c => `.${CSS.escape(c)}`)
    .join('');
  return `${tag}${classes}`;
}

/**
 * Generate a unique, readable CSS selector for an element.
 *
 * Priority:
 * 1. Unique #id
 * 2. Ancestor chain with :nth-child added at every level that has
 *    multiple same-tag siblings — tries shortest unique path first.
 */
export function getUniqueCSSSelector(element: HTMLElement): string {
  // 1. Try unique ID
  if (element.id) {
    const escaped = `#${CSS.escape(element.id)}`;
    try {
      if (document.querySelectorAll(escaped).length === 1) return escaped;
    } catch {
      // invalid selector, skip
    }
  }

  // 2. Build ancestor chain (stop at body / html / s2p-widget, max 8 levels)
  //    At each level, append :nth-child when the element shares its tag
  //    with one or more siblings — this disambiguates repeated list items.
  const segments: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current.tagName !== 'BODY' && current.tagName !== 'HTML') {
    if (current.tagName.toLowerCase() === 's2p-widget') break;

    const parent: HTMLElement | null = current.parentElement;
    let segment = buildSegment(current);

    if (parent) {
      const sameTagCount = Array.from(parent.children).filter(
        (s): s is Element => (s as Element).tagName === current!.tagName
      ).length;

      if (sameTagCount > 1) {
        const index = Array.from(parent.children).indexOf(current) + 1;
        segment += `:nth-child(${index})`;
      }
    }

    segments.unshift(segment);
    current = parent;
    if (segments.length >= 8) break;
  }

  // 3. Try progressively longer paths — return the shortest that is unique
  for (let depth = 1; depth <= segments.length; depth++) {
    const selector = segments.slice(segments.length - depth).join(' > ');
    try {
      if (document.querySelectorAll(selector).length === 1) return selector;
    } catch {
      // invalid selector, continue
    }
  }

  return segments.join(' > ');
}
