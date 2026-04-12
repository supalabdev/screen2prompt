const INFRA_SUFFIXES = [
  'Context', 'Provider', 'Consumer', 'Boundary', 'Router',
  'Fallback', 'Handler', 'Node', 'ErrorBoundary', 'Observer',
  'Wrapper', 'Container', 'Portal', 'Old', 'Legacy', 'Internal',
];

const INFRA_EXACT = new Set([
  'Suspense', 'Fragment', 'StrictMode', 'Profiler',
  'HotReload', 'DevRootHTTPAccessFallbackBoundary',
  'ServerRoot', 'Root',
]);

// Prefixes that indicate Next.js/React internals
const INFRA_PREFIXES = ['Inner', 'Outer', 'Dev', 'App', 'Page'];

function isInfraComponent(name: string): boolean {
  if (INFRA_EXACT.has(name)) return true;
  if (INFRA_SUFFIXES.some(suffix => name.endsWith(suffix))) return true;
  if (INFRA_PREFIXES.some(prefix => name.startsWith(prefix) && name.length > prefix.length + 3)) return true;
  return false;
}

function getFiberKey(element: HTMLElement): string | undefined {
  return Object.keys(element).find(
    k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance')
  );
}

/**
 * Walk the React fiber tree upward from an element and return
 * the component name hierarchy (top-down order, user-defined components only).
 * Filters out Next.js/React infrastructure components.
 */
export function getReactComponentTree(element: HTMLElement): string[] {
  const fiberKey = getFiberKey(element);
  if (!fiberKey) return [];

  const tree: string[] = [];
  let fiber = (element as any)[fiberKey];
  let iterations = 0;

  while (fiber && iterations < 60) {
    iterations++;
    const name = fiber.type?.displayName ?? fiber.type?.name;
    if (name && /^[A-Z]/.test(name) && !isInfraComponent(name)) {
      tree.unshift(name);
    }
    if (fiber.return === fiber) break;
    fiber = fiber.return;
  }

  return tree.slice(0, 10);
}

/**
 * Return the source file path and line number for an element
 * (only available in React development builds).
 */
export function getSourceFilePath(element: HTMLElement): string | undefined {
  const fiberKey = Object.keys(element).find(k => k.startsWith('__reactFiber'));
  if (!fiberKey) return undefined;
  const debug = (element as any)[fiberKey]?._debugSource;
  if (!debug) return undefined;
  return `${debug.fileName}:${debug.lineNumber}`;
}

/**
 * Snapshot of computed styles relevant for AI context.
 */
export function getComputedStyleSnapshot(
  element: HTMLElement,
  detail: 'compact' | 'standard' | 'detailed' | 'forensic'
): Record<string, string> {
  if (detail === 'compact' || detail === 'standard') return {};

  const computed = window.getComputedStyle(element);

  if (detail === 'forensic') {
    const result: Record<string, string> = {};
    for (let i = 0; i < computed.length; i++) {
      const prop = computed[i];
      result[prop] = computed.getPropertyValue(prop);
    }
    return result;
  }

  // detailed: curated set
  const props = [
    'width', 'height', 'display', 'flexDirection', 'gap',
    'padding', 'margin', 'backgroundColor', 'color', 'fontSize',
    'fontWeight', 'borderRadius', 'border', 'boxShadow', 'opacity',
  ];
  const result: Record<string, string> = {};
  for (const prop of props) {
    const value = computed.getPropertyValue(prop);
    if (value && value !== 'none' && value !== 'normal' && value !== 'auto') {
      result[prop] = value;
    }
  }
  return result;
}
