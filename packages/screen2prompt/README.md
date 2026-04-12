# screen2prompt

> Communicate visual design changes to AI agents with precision and structure.

A lightweight (~40kb gzip) Web Components widget that lets you annotate, mark up layout changes, and sketch wireframes directly on any web page — then copy a structured Markdown prompt ready to paste into Claude, ChatGPT, or any AI agent.

---

## Installation

```bash
npm install screen2prompt
# or
bun add screen2prompt
```

---

## Usage

### React (Next.js, Vite + React)

```tsx
// app/layout.tsx or main.tsx
'use client';

import { useEffect } from 'react';

export function Screen2PromptWidget() {
  useEffect(() => {
    import('screen2prompt/loader').then(({ defineCustomElements }) => {
      defineCustomElements();
    });
  }, []);

  return (
    <s2p-widget
      license-key={process.env.NEXT_PUBLIC_S2P_LICENSE_KEY}
    />
  );
}
```

```tsx
// Add the custom element types
/// <reference types="screen2prompt" />
```

### HTML / CDN

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/screen2prompt/dist/screen2prompt/screen2prompt.esm.js"></script>

<s2p-widget license-key="your-key-here"></s2p-widget>
```

---

## Modes

### Annotation Mode (`cursor icon`)
Click any element on the page to open a feedback popup. Write your comment — the widget captures the CSS selector, React component tree, and computed styles automatically.

**Keyboard shortcut:** `Cmd+Shift+F` (macOS) / `Ctrl+Shift+F` (Windows)

### Layout Mode (`grid icon`)
Opens a component panel with 15 wireframe components across 8 categories (Navigation, Hero, Card, Chart, Form, Media, Text, Footer). Drag components onto the page to mark up layout changes. Resize them by dragging the edge handles.

### Wireframe Mode (`layout icon`)
Opens a full-screen canvas with a dot grid and page dimmer. Sketch a new page from scratch by dragging components from the panel. Add a description of the new page in the textarea.

**Press `Escape` to exit any mode.**

---

## Output

Click the **Copy** button to copy a structured Markdown prompt to your clipboard:

```markdown
## Page Feedback: /dashboard

**Viewport:** 1440×900

### 1. .hero-section
**Feedback:** Make the heading larger, use Inter font

---

## Design Layout
> 2 components placed

### Components
1. **Navbar** — `1440×64px` at `(0, 0)`
   - Center-aligned
   - CSS: `width: 100%`

---

## Wireframe New Page
> New admin dashboard with sidebar navigation

### Components
1. **Sidebar** — `240×600px` at `(0, 72)`
   - Left-aligned
   - CSS: `position: fixed, left: 0`
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `license-key` | `string` | `''` | Your Screen2Prompt license key |
| `force-enable` | `boolean` | `false` | Show widget without a valid license (dev/testing) |

---

## License

Commercial license required for production use. [Get a license →](https://screen2prompt.com)

Development and evaluation use is free.
