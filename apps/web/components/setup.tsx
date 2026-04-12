"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"

// ─── tab data ────────────────────────────────────────────────────────────────

type TabId = "agent" | "nextjs" | "vite"

const TABS: { id: TabId; label: string }[] = [
  { id: "agent", label: "Using Agent" },
  { id: "nextjs", label: "Next.js" },
  { id: "vite", label: "Vite + React" },
]

// ─── code snippets ────────────────────────────────────────────────────────────

const AGENT_PROMPT = `# About Screen2Prompt

Screen2Prompt is a free, open source, development-only widget that overlays the user's app
and lets them communicate visual UI changes to AI agents with precision. Instead of typing
vague descriptions like "change the blue button on the sidebar", the user clicks the element,
writes the feedback, and Screen2Prompt generates a structured markdown block containing the
exact CSS selector, React component tree, computed styles, and the feedback — everything an
AI agent needs to act correctly.

All three modes are available with no license required:
- Annotation Mode: click any element and annotate it.
- Layout Mode: drag wireframe components over the existing page.
- Wireframe Mode: blank canvas for designing new screens from scratch.

It is installed as a single CDN script tag and must never run in production.

---

# Setup Instructions

Set up Screen2Prompt in this workspace.

1. Find the framework (Next.js App Router, Pages Router, Vite, Nuxt, etc.)
2. Add a dev-only script tag — it must never run in production:
   - Next.js App Router: add a next/script tag in app/layout.tsx wrapped in
     {process.env.NODE_ENV === 'development' && (...)}
   - Vite / React: inject dynamically in src/main.tsx inside if (import.meta.env.DEV)
3. CDN URL: https://cdn.screen2prompt.supalab.dev/v1/screen2prompt.js
4. Start the dev server. A floating toolbar should appear in the bottom-right corner.
5. If the toolbar is missing, check the browser console for errors containing "screen2prompt".`

const NEXTJS_SNIPPET = `// app/layout.tsx
import Script from 'next/script'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}

        {process.env.NODE_ENV === 'development' && (
          <Script
            src="https://cdn.screen2prompt.supalab.dev/v1/screen2prompt.js"
          />
        )}
      </body>
    </html>
  )
}`

const VITE_SNIPPET = `// src/main.tsx
if (import.meta.env.DEV) {
  const script = document.createElement('script')
  script.src = 'https://cdn.screen2prompt.supalab.dev/v1/screen2prompt.js'
  document.head.appendChild(script)
}`

// ─── sub-components ───────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handle = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handle}
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.svg
            key="check"
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-brand"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <polyline points="20 6 9 17 4 12" />
          </motion.svg>
        ) : (
          <motion.svg
            key="copy"
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </motion.svg>
        )}
      </AnimatePresence>
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

function FileBlock({
  filename,
  code,
  dim = false,
}: {
  filename: string
  code: string
  dim?: boolean
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
        <span className="font-mono text-xs text-muted-foreground">{filename}</span>
        <CopyButton text={code} />
      </div>
      <pre
        className={`overflow-x-auto px-4 py-3 text-xs leading-relaxed ${
          dim ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  )
}

// ─── tab content ──────────────────────────────────────────────────────────────

function AgentContent() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
        <span className="font-mono text-xs text-muted-foreground">
          paste into Claude Code, Codex, or any AI agent
        </span>
        <CopyButton text={AGENT_PROMPT} />
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap px-4 py-3 text-xs leading-relaxed text-foreground">
        <code className="font-mono">{AGENT_PROMPT}</code>
      </pre>
    </div>
  )
}

function NextjsContent() {
  return (
    <div className="flex flex-col divide-y divide-border/50">
      <FileBlock filename="app/layout.tsx" code={NEXTJS_SNIPPET} />
    </div>
  )
}

function ViteContent() {
  return (
    <div className="flex flex-col divide-y divide-border/50">
      <FileBlock filename="src/main.tsx" code={VITE_SNIPPET} />
    </div>
  )
}

const CONTENT: Record<TabId, React.ReactNode> = {
  agent: <AgentContent />,
  nextjs: <NextjsContent />,
  vite: <ViteContent />,
}

// ─── main component ───────────────────────────────────────────────────────────

export function Setup() {
  const [active, setActive] = useState<TabId>("agent")

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-3xl font-medium leading-snug" id="setup">
          Prompt Setup
        </h2>
        <p className="text-sm text-muted-foreground">
          One script tag. Dev-only. Free and open source.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-input bg-card">
        {/* Tab bar */}
        <div className="flex items-center gap-1 border-b border-input px-3 pt-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`relative px-3 py-2 text-xs font-medium transition-colors ${
                active === tab.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {active === tab.id && (
                <motion.div
                  layoutId="setup-tab-indicator"
                  className="absolute inset-x-0 bottom-0 h-px bg-brand"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {CONTENT[active]}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="text-xs text-muted-foreground">
        All three modes —{" "}
        <span className="font-semibold text-foreground">Annotation</span>,{" "}
        <span className="font-semibold text-foreground">Layout</span>, and{" "}
        <span className="font-semibold text-foreground">Wireframe</span> — are
        free and open source.
      </p>
    </section>
  )
}
