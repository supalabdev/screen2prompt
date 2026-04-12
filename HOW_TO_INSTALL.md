# Screen2Prompt — Installation Guide for AI Agents

This guide is intended for AI coding assistants (Claude Code, Cursor, Codex, etc.) helping a user install Screen2Prompt in their project.

---

## What is Screen2Prompt?

Screen2Prompt is a **free, open source, development-only** widget that overlays the user's app and lets them annotate UI elements, place wireframe components, and generate structured prompts for AI agents. It must **never** run in production.

All three modes (Annotation, Layout, Wireframe) are available with no license or payment required.

---

## Key Concepts

- **CDN script** — the primary installation method. No npm install needed. A single `<script>` tag loads the widget.
- **Dev-only guard** — always wrap the installation in a development check so the widget is stripped from production builds.
- **No license key needed** — the widget is fully open source. Just add the script tag.

---

## CDN URL

```
https://cdn.screen2prompt.supalab.dev/v1/screen2prompt.js
```

---

## Next.js — App Router

**File: `app/layout.tsx`**

```tsx
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

---

## Next.js — Pages Router

**File: `pages/_app.tsx`**

```tsx
import type { AppProps } from 'next/app'
import Script from 'next/script'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />

      {process.env.NODE_ENV === 'development' && (
        <Script src="https://cdn.screen2prompt.supalab.dev/v1/screen2prompt.js" />
      )}
    </>
  )
}
```

---

## Vite + React

**Option A — dynamic injection in `main.tsx` (recommended)**

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

if (import.meta.env.DEV) {
  const script = document.createElement('script')
  script.src = 'https://cdn.screen2prompt.supalab.dev/v1/screen2prompt.js'
  document.head.appendChild(script)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

**Option B — directly in `index.html`**

```html
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>

  <!-- Screen2Prompt — remove before going to production -->
  <script src="https://cdn.screen2prompt.supalab.dev/v1/screen2prompt.js"></script>
</body>
```

> **Agent note:** Option B does not have an automatic dev guard. Prefer Option A.

---

## Vue 3 (Vite)

**File: `src/main.ts`**

```ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')

if (import.meta.env.DEV) {
  const script = document.createElement('script')
  script.src = 'https://cdn.screen2prompt.supalab.dev/v1/screen2prompt.js'
  document.head.appendChild(script)
}
```

---

## Nuxt 3

**File: `plugins/screen2prompt.client.ts`**

```ts
export default defineNuxtPlugin(() => {
  if (process.env.NODE_ENV !== 'development') return

  const script = document.createElement('script')
  script.src = 'https://cdn.screen2prompt.supalab.dev/v1/screen2prompt.js'
  document.head.appendChild(script)
})
```

---

## Angular

**File: `src/environments/environment.ts`** (development)
```ts
export const environment = { production: false }
```

**File: `src/main.ts`**
```ts
import { bootstrapApplication } from '@angular/platform-browser'
import { AppComponent } from './app/app.component'
import { appConfig } from './app/app.config'
import { environment } from './environments/environment'

bootstrapApplication(AppComponent, appConfig).catch(console.error)

if (!environment.production) {
  const script = document.createElement('script')
  script.src = 'https://cdn.screen2prompt.supalab.dev/v1/screen2prompt.js'
  document.head.appendChild(script)
}
```

---

## Vanilla HTML

```html
<body>
  <!-- app content -->

  <!-- Screen2Prompt: remove this script tag before deploying to production -->
  <script src="https://cdn.screen2prompt.supalab.dev/v1/screen2prompt.js"></script>
</body>
```

---

## Verification

After installation, tell the user to:

1. Start the dev server
2. Look for a small floating toolbar at the bottom-center of the page
3. If the toolbar doesn't appear, open the browser console and check for errors containing `screen2prompt`

Common issues:

| Symptom | Cause | Fix |
|---------|-------|-----|
| Toolbar not visible | Script loaded in production | Check the dev guard condition |
| `s2p-widget` not defined | Script failed to load | Check network tab for CDN errors |
| Toolbar appears then disappears | `dontShowInProd` set incorrectly | Check the attribute value |
