# Screen2Prompt — Installation Guide: React + Vite

This guide is written for AI agents. Follow each step exactly. Do not skip steps or reorder them.

---

## Prerequisites

- React ≥ 17
- Vite (any version)
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

## Step 2 — Add the widget to your app

Import `Screen2Prompt` from `screen2prompt/react` (or `@supalab/screen2prompt/react` when published) and render it once at the root of your app — typically in `src/App.tsx` or `src/main.tsx`.

```tsx
// src/App.tsx
import { Screen2Prompt } from 'screen2prompt/react'

function App() {
  return (
    <>
      {/* your existing app content */}

      <Screen2Prompt licenseKey={import.meta.env.VITE_S2P_KEY ?? ''} />
    </>
  )
}

export default App
```

The `<Screen2Prompt />` component must be rendered inside the React tree. It auto-registers its Web Components and mounts a floating toolbar over the page.

---

## Step 3 — Add the license key environment variable

Create a `.env.local` file at the root of your Vite project (if it doesn't exist) and add:

```
VITE_S2P_KEY=your-license-key-here
```

> `.env.local` is gitignored by Vite by default. Do not commit license keys.

---

## Step 4 — (Optional) Hide in production

Pass `dontShowInProd` to prevent the widget from rendering in production builds:

```tsx
<Screen2Prompt
  licenseKey={import.meta.env.VITE_S2P_KEY ?? ''}
  dontShowInProd={import.meta.env.PROD}
/>
```

`import.meta.env.PROD` is `true` when Vite builds in production mode and `false` in dev.

---

## Step 5 — (Optional) Add the upgrade URL

If the user runs without a valid license, the toolbar shows a lock icon on Layout and Wireframe mode buttons. Clicking the lock — or the key icon — opens the URL you provide via `buyLicenseUrl`.

Add the env variable:

```
VITE_S2P_BUY_LICENCE_PAGE_URL=https://yoursite.com/pricing
```

Then pass it to the component:

```tsx
<Screen2Prompt
  licenseKey={import.meta.env.VITE_S2P_KEY ?? ''}
  buyLicenseUrl={import.meta.env.VITE_S2P_BUY_LICENCE_PAGE_URL ?? ''}
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

## Verification

After completing these steps:

1. Run `vite dev`
2. Open the app in the browser
3. A floating toolbar should appear in the bottom-right corner of the page
4. Click the annotation icon (cursor) to activate annotation mode and click any element

If the toolbar does not appear, check the browser console for errors and confirm the `screen2prompt/react` import resolved correctly.

---

## Troubleshooting

**Toolbar does not appear**
- Confirm `<Screen2Prompt>` is inside the React tree and the component is mounted
- Check that `dontShowInProd` is not accidentally set to `true`

**TypeScript error on `import.meta.env.VITE_S2P_KEY`**
- Add `/// <reference types="vite/client" />` to `src/vite-env.d.ts` (Vite scaffolds this file by default)

**Custom Elements warning in console**
- This is harmless — Stencil may log a warning if `defineCustomElements` is called more than once
