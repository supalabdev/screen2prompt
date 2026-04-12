# AGENTS.md

This file provides guidance for AI coding agents operating in this repository.

---

## What is Screen2Prompt?

Screen2Prompt is a **development-only** widget delivered via CDN script tag. It overlays any web app and lets developers annotate UI elements, place wireframe components, and generate structured markdown prompts for AI coding agents (Claude Code, Cursor, Codex, Windsurf, etc.).

**CDN URL:** `https://cdn.screen2prompt.supalab.dev/v1/screen2prompt.js`

Install by adding one `<script>` tag with a `data-license` attribute. Always wrapped in a dev-only guard so it never ships to production.

---

## Monorepo Structure

```
apps/web/                  # Next.js 16 landing page + future license portal
packages/screen2prompt/    # Stencil.js widget (fully built, CDN-ready)
packages/eslint-config/    # Shared ESLint (@repo/eslint-config)
packages/typescript-config/ # Shared tsconfig (@repo/typescript-config)
docs/                      # Product specs
HOW_TO_INSTALL.md          # Full installation guide per framework
```

**No admin app exists.** `apps/web` is the only user-facing app.

---

## Installing Screen2Prompt in a User's Project

When a user asks you to install Screen2Prompt, use `HOW_TO_INSTALL.md` as the authoritative reference. Key principles:

- **Always use the CDN URL** — no npm install needed.
- **Always add a dev-only guard** — the widget must never run in production.
- **License key** — use `S2P-XPTO` for local development. Replace with the user's real key when they have one.
- **`data-license` attribute** — the license key is passed on the `<script>` tag.

Quick reference by framework:

### Next.js (App Router)
```tsx
// app/layout.tsx
import Script from 'next/script'

{process.env.NODE_ENV === 'development' && (
  <Script
    src="https://cdn.screen2prompt.supalab.dev/v1/screen2prompt.js"
    data-license={process.env.NEXT_PUBLIC_S2P_KEY}
  />
)}
```
```
# .env.local
NEXT_PUBLIC_S2P_KEY=S2P-XPTO
```

### Vite + React
```tsx
// src/main.tsx
if (import.meta.env.DEV) {
  const s = document.createElement('script')
  s.src = 'https://cdn.screen2prompt.supalab.dev/v1/screen2prompt.js'
  s.dataset.license = import.meta.env.VITE_S2P_KEY
  document.head.appendChild(s)
}
```
```
# .env.local
VITE_S2P_KEY=S2P-XPTO
```

See `HOW_TO_INSTALL.md` for Vue 3, Nuxt, Angular, Next.js Pages Router, and vanilla HTML.

---

## Widget Behavior

**Three modes (controlled by toolbar):**
| Mode | Tier | What it does |
|------|------|-------------|
| Annotation | Free | Click/drag-select elements → writes feedback → captures CSS selector, React component tree, computed styles |
| Layout | Pro | Drag wireframe blocks onto existing page to indicate restructuring |
| Wireframe | Pro | Blank canvas to sketch new pages from scratch |

**Output:** Structured markdown with viewport metadata, element context, and feedback. Four detail levels: compact → standard → detailed → forensic. The markdown is designed to be pasted directly into an AI agent prompt.

**License keys:**
| Key format | Purpose |
|-----------|---------|
| `S2P-XPTO` | Local dev bypass — all features unlocked |
| `S2P-DEV-0000-0000` | Internal dev key (used in this monorepo's .env) |
| `S2P-XXXX-XXXX-XXXX` | Real paid key from screen2prompt.dev |

Free tier = Annotation only. Pro = all modes. Validation: `POST https://api.screen2prompt.com/v1/validate` with 24h cache.

---

## Working in apps/web

Tech stack: Next.js 16 App Router, React 19, Tailwind CSS 4, TypeScript strict, shadcn/ui, Motion.

**Current state:**
- Home page (`/`) is complete except for a demo video placeholder.
- Login page (`/login`) is a scaffold.
- License purchase/dashboard pages are not yet built.

When modifying `apps/web`:
- Use `bun add` for dependencies (never npm/yarn).
- `'use client'` is required for any component using hooks, event listeners, or browser APIs.
- Check `apps/web/.env` for env var names (`NEXT_PUBLIC_S2P_KEY`).

---

## Working in packages/screen2prompt

The widget is fully implemented. Only modify if fixing bugs or adding features.

```bash
cd packages/screen2prompt
bun run build      # Full build (Stencil + esbuild for React/Next/CDN bundles)
bun run build:cdn  # CDN IIFE bundle only → dist/cdn/screen2prompt.js
bun run dev        # Stencil watch mode
```

Key source files:
- `src/store/widgetStore.ts` — global state
- `src/utils/markdownGenerator.ts` — markdown output generation
- `src/utils/licenseValidator.ts` — license validation + caching
- `src/cdn/index.ts` — CDN entry point (auto-mounts via `script[data-license]` selector)
- `src/types.ts` — all shared TypeScript types

**Constraints:** Bundle < 60kb gzip. Zero external runtime dependencies. Shadow DOM only — never mutate host app DOM.

---

## Development Commands

```bash
bun install              # Install all workspace dependencies
bun run dev              # All apps (parallel)
bun run dev:web          # Only apps/web
bun run build            # Build all
bun run check-types      # TypeScript validation across workspace
bun run lint
bun run format
```
