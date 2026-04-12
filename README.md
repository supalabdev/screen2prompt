# Screen2Prompt

A free, open source dev-only widget that overlays any web app — letting developers annotate UI elements, place wireframe components, and generate structured markdown prompts for AI coding agents.

Instead of typing _"change the blue button on the sidebar"_, you click the element, write the feedback, and Screen2Prompt generates a structured markdown block with the exact CSS selector, React component tree, computed styles, and your feedback — everything an AI agent needs to act correctly.

**Works with:** Claude Code, Cursor, Codex, Windsurf, and any AI tool that accepts text prompts.

---

## Modes

| Mode | Description |
|------|-------------|
| **Annotation** | Click any element on the page and annotate it |
| **Layout** | Drag wireframe components over the existing page |
| **Wireframe** | Blank canvas to design new screens from scratch |

All modes are free and open source.

---

## Quick Start

### CDN (any framework)

```html
<!-- Add to your app — dev only, never ship to production -->
<script src="https://cdn.screen2prompt.supalab.dev/v1/screen2prompt.js"></script>
```

### Next.js (App Router)

```tsx
// app/layout.tsx
import Script from 'next/script'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <Script src="https://cdn.screen2prompt.supalab.dev/v1/screen2prompt.js" />
        )}
      </body>
    </html>
  )
}
```

### Vite + React

```tsx
// src/main.tsx
if (import.meta.env.DEV) {
  const script = document.createElement('script')
  script.src = 'https://cdn.screen2prompt.supalab.dev/v1/screen2prompt.js'
  document.head.appendChild(script)
}
```

Once loaded, a floating toolbar appears at the bottom of the page. Use **Cmd+Shift+F** (or **Ctrl+Shift+F**) to toggle it.

---

## npm

```bash
bun add screen2prompt   # or npm / yarn / pnpm
```

```tsx
// Next.js
import { Screen2Prompt } from 'screen2prompt/next'

{process.env.NODE_ENV === 'development' && <Screen2Prompt />}
```

---

## How It Works

After annotating elements, click **Copy** in the toolbar. The widget outputs structured markdown:

````markdown
## Page Feedback

### 1. Submit Button
- **Selector:** `form > button[type="submit"]`
- **Component:** `<CheckoutForm> > <SubmitButton>`
- **File:** `src/components/CheckoutForm.tsx:48`
- **Feedback:** Change label to "Complete Purchase" and increase font size to 16px
````

Paste this directly into Claude Code, Cursor, or any AI agent.

---

## Monorepo

```
screen2prompt-monorepo/
├── apps/web/               # Next.js landing page
├── packages/screen2prompt/ # Stencil.js widget (CDN + npm)
└── docs/                   # Architecture, output format spec
```

## Development

```bash
bun install             # install all dependencies

bun run dev             # all packages in watch mode
bun run dev:web         # landing page only (localhost:3000)

# Widget
cd packages/screen2prompt
bun run dev             # Stencil watch mode
bun run build:cdn       # build CDN bundle → dist/cdn/screen2prompt.js
bun run build           # full build (CDN + React + Next.js wrappers)

# Quality
bun run lint
bun run check-types
```

---

## Contributing

Pull requests are welcome. For major changes, open an issue first.

---

## License

[GPL v3](./LICENSE) — free to use, modify, and distribute. Derivative works must remain open source under GPL v3.

Made by [Supalab Dev](https://supalab.dev).
