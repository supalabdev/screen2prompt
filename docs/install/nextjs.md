# Screen2Prompt — Installation Guide: Next.js App Router

This guide is written for AI agents. Follow each step exactly. Do not skip steps or reorder them.

This guide covers **Next.js 13+ with the App Router**. The widget uses Stencil Web Components, which require client-side rendering — the setup below ensures it never runs on the server.

---

## Prerequisites

- Next.js ≥ 13 with App Router
- React ≥ 17
- npm, yarn, pnpm, or bun

---

## Step 1 — Install the package

```bash
# npm
npm install @supalab/screen2prompt

# yarn
yarn add @supalab/screen2prompt

# pnpm
pnpm add @supalab/screen2prompt

# bun
bun add @supalab/screen2prompt
```

> **Note for monorepo / local dev:** the package name is `screen2prompt` (without the `@supalab/` scope). Use the same import paths shown below.

---

## Step 2 — Add the widget to your root layout

Import `Screen2Prompt` from `screen2prompt/next`. This entry point already includes `'use client'`, `next/dynamic`, and `ssr: false` — no wrapper file is needed.

Edit `app/layout.tsx` (or `app/layout.js`):

```tsx
// app/layout.tsx
import { Screen2Prompt } from 'screen2prompt/next'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Screen2Prompt licenseKey={process.env.NEXT_PUBLIC_S2P_KEY ?? ''} />
      </body>
    </html>
  )
}
```

**Do not** import from `screen2prompt/react` in a Server Component — use `screen2prompt/next` instead. The `/next` entry handles the client boundary automatically.

---

## Step 3 — Add the license key environment variable

Create a `.env.local` file at the root of your Next.js project (if it doesn't exist) and add:

```
NEXT_PUBLIC_S2P_KEY=your-license-key-here
```

> Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Do not commit license keys — `.env.local` is gitignored by Next.js by default.

---

## Step 4 — (Optional) Hide in production

Pass `dontShowInProd` to prevent the widget from rendering in production:

```tsx
<Screen2Prompt
  licenseKey={process.env.NEXT_PUBLIC_S2P_KEY ?? ''}
  dontShowInProd={process.env.NODE_ENV === 'production'}
/>
```

`process.env.NODE_ENV` is replaced at build time by Next.js — when building for production it becomes `'production'`, so the widget is removed from the bundle entirely.

---

## Step 5 — (Optional) Add the upgrade URL

If the user runs without a valid license, the toolbar shows a lock icon on Layout and Wireframe mode buttons. Clicking the lock — or the key icon — opens the URL you provide via `buyLicenseUrl`.

Add to `.env.local`:

```
NEXT_PUBLIC_S2P_BUY_LICENCE_PAGE_URL=https://yoursite.com/pricing
```

Then pass it to the component:

```tsx
<Screen2Prompt
  licenseKey={process.env.NEXT_PUBLIC_S2P_KEY ?? ''}
  buyLicenseUrl={process.env.NEXT_PUBLIC_S2P_BUY_LICENCE_PAGE_URL ?? ''}
/>
```

If omitted, the upgrade button is hidden.

---

## Props reference

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `licenseKey` | `string` | Yes | `''` | Your Screen2Prompt license key |
| `dontShowInProd` | `boolean` | No | `false` | When `true`, widget does not render |
| `buyLicenseUrl` | `string` | No | `''` | URL opened when user clicks locked buttons or the upgrade key icon |

## License model

| Feature | Free | License required |
|---|---|---|
| Annotation mode | ✓ | — |
| Layout mode | — | ✓ |
| Wireframe mode | — | ✓ |

Without a valid license, Layout and Wireframe buttons show a padlock overlay and redirect to `buyLicenseUrl` instead of activating the mode.

---

## Entry point reference

| Import path | Use case |
|---|---|
| `screen2prompt/next` | Next.js App Router (Server + Client components) |
| `screen2prompt/react` | Vite + React, or Next.js Client Components only |

---

## Verification

After completing these steps:

1. Run `next dev`
2. Open the app in the browser
3. A floating toolbar should appear in the bottom-right corner of the page
4. Click the annotation icon (cursor) to activate annotation mode and click any element

If the toolbar does not appear, check the browser console for errors and confirm the import path is `screen2prompt/next`.

---

## Troubleshooting

**Hydration error or "Class constructor cannot be invoked without new"**
- Make sure you are importing from `screen2prompt/next`, not `screen2prompt/react`
- The `/next` entry uses `ssr: false` which prevents this error

**Toolbar does not appear**
- Confirm `<Screen2Prompt>` is inside `<body>` in the root layout
- Check that `dontShowInProd` is not accidentally set to `true`
- Open DevTools → Elements and search for `s2p-widget` to confirm the custom element mounted

**TypeScript error on `process.env.NEXT_PUBLIC_S2P_KEY`**
- The variable must be prefixed with `NEXT_PUBLIC_` to be available in the browser
- Add it to `.env.local` and restart the dev server

**Pages Router (legacy)**
- This guide covers App Router only
- For Pages Router, import from `screen2prompt/react` inside a component with `'use client'` semantics, or use `next/dynamic` with `ssr: false` manually in `_app.tsx`
