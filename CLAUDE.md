# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Screen2Prompt** is a development-only widget (CDN script) that overlays any web app, letting developers annotate UI elements, place wireframe components, and generate structured markdown prompts for AI coding agents (Claude Code, Cursor, Copilot, etc.).

### Monorepo Layout

```
screen2prompt-monorepo/
├── apps/web/               # Next.js 16 — landing page + license purchase/management
├── packages/screen2prompt/ # Stencil.js widget — BUILT, ready for CDN deployment
├── packages/eslint-config/ # Shared ESLint config (@repo/eslint-config)
├── packages/typescript-config/ # Shared tsconfig (@repo/typescript-config)
├── docs/                   # Product specs (CONTEXT.md, ARCHITECTURE.md, PRD.md, etc.)
├── HOW_TO_INSTALL.md       # AI-agent installation guide for users' projects
└── turbo.json              # Turbo v2 task graph
```

> There is **no admin app**. The `apps/web` landing page handles everything user-facing.

---

## Development Commands

```bash
# Install (Bun only — do not use npm/yarn)
bun install

# Dev servers
bun run dev           # All apps in parallel
bun run dev:web       # Only apps/web (localhost:3000)

# Build / quality
bun run build
bun run lint
bun run check-types
bun run format
```

### Widget-specific (packages/screen2prompt)
```bash
cd packages/screen2prompt
bun run build          # Stencil + esbuild (React/Next/CDN bundles)
bun run build:cdn      # IIFE minified CDN bundle only
bun run dev            # Stencil watch mode
```

---

## apps/web — Landing Page & License Portal

**Stack:** Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4, shadcn/ui, TypeScript strict, Motion (Framer Motion v12)

**Current status:**
- Home page (`/`) is complete. Missing only the demo video (to be recorded).
- Login page (`/login`) exists — auth flow TBD.
- License purchase and management pages are **not yet built** (next major milestone).

**Environment:**
```
# apps/web/.env
NEXT_PUBLIC_S2P_KEY="S2P-DEV-0000-0000"
```

**Key routes:**
| Route | Status | Purpose |
|-------|--------|---------|
| `/` | Done (no video) | Landing page — hero, how-it-works, pricing, setup, logo-cloud |
| `/login` | Scaffold | Login / signup |
| `/dashboard` | Not built | License management portal |

**Component organization:**
- `components/` — Page-section components (pricing, how-it-works, setup, widget-demo, etc.)
- `components/ui/` — shadcn primitives + AI/chat-specific UI (response-stream, chain-of-thought, reasoning, markdown, code-block)
- `components/ui/svgs/` — Brand SVG logos (Claude, Cursor, Codex, Windsurf, etc.)

---

## packages/screen2prompt — Widget (Complete)

The widget is **fully implemented** with Stencil.js Web Components. It is built and ready for CDN deployment (planned: Cloudflare CDN).

**CDN URL (production target):** `https://cdn.screen2prompt.dev/v1/screen2prompt.js`

**Three modes:**
- **Annotation** — free tier. Click elements → captures CSS selector, React component tree, computed styles → generates markdown prompt.
- **Layout** — pro tier. Drag wireframe components over existing page.
- **Wireframe** — pro tier. Canvas for designing new screens from scratch.

**License gating:** Free = annotation only. Pro = all modes. Dev bypass key: `S2P-DEV-0000-0000`. License validated via `https://api.screen2prompt.com/v1/validate` with 24h cache.

**Integration targets (all built and in dist/):**
- CDN/script tag (`dist/cdn/screen2prompt.js`) — primary distribution
- React wrapper (`./react`)
- Next.js wrapper (`./next`, includes `'use client'`)
- Loader (`./loader`)

**Build outputs:** `dist/` contains all targets. The Stencil build uses a custom plugin to inject `S2P_BUY_LICENSE_URL` at build time.

---

## Turbo Task Graph

| Task | Depends on | Notes |
|------|-----------|-------|
| `build` | `^build` | Outputs: `.next/**`, `dist/**` |
| `dev` | `^dev:prepare` | No cache, persistent |
| `dev:prepare` | `^dev:prepare` | Outputs: `dist/**` |
| `lint` | `^lint` | |
| `check-types` | `^check-types` | |

Use `turbo run <task> --filter=<package>` to target a single workspace.

---

## Key Rules

- **Package manager is Bun.** Use `bun add`, `bun remove`. Never npm/yarn.
- **TypeScript strict.** No `any`, no `@ts-ignore`.
- **Next.js 16 App Router.** Server/client component boundaries matter. Verify behavior before modifying routing or API routes.
- **Widget is dev-only.** It must never run in production builds of users' apps. The CDN bundle includes this guard.
- **Shadow DOM in widget.** The widget uses Shadow DOM for CSS isolation and must never mutate the host app's DOM.
- **Bundle constraint.** Widget core must stay < 60kb gzip. No external runtime dependencies except Stencil.js.

---

## Documentation

All product specs live in `docs/`:
- `CONTEXT.md` — What it is, who it's for
- `ARCHITECTURE.md` — Stencil.js component design, store, utilities
- `OUTPUT_FORMAT.md` — Markdown output format spec (4 detail levels)
- `PRD.md` — Features, business model, success criteria
- `ROADMAP.md` — Development phases

`HOW_TO_INSTALL.md` — Full installation guide for AI agents helping users add the widget to their project (Next.js App/Pages Router, Vite+React, Vue 3, Nuxt, Angular, vanilla HTML).
