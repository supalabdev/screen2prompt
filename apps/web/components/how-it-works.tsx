"use client"

import { motion } from "motion/react"

const steps = [
  {
    number: "01",
    title: "Install the widget",
    description:
      "Install the Screen2Prompt widget in your dev environment. It works with any web-based UI. No code changes needed.",
    tag: "setup",
  },
  {
    number: "02",
    title: "Activate on your screen",
    description:
      "Click the Screen2Prompt icon in the corner of your dev environment. The annotation layer loads without touching your codebase.",
    tag: "activate",
  },
  {
    number: "03",
    title: "Click, annotate, wireframe",
    description:
      "Click any element to annotate it. Drag wireframe components to show where new UI belongs. Or open a blank canvas to sketch a new screen from scratch.",
    tag: "annotate",
  },
  {
    number: "04",
    title: "Copy the structured output",
    description:
      "Hit Copy. Screen2Prompt generates a precise markdown block with the exact CSS selector, React component tree, computed styles, and your feedback — all at once.",
    tag: "copy",
  },
  {
    number: "05",
    title: "Paste into your AI agent",
    description:
      "Drop it into Claude Code, Codex, or any AI tool. No more vague descriptions — the agent knows exactly which element, where it lives, and what to change.",
    tag: "paste",
  },
]

export function HowItWorks() {
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-3xl leading-snug font-medium" id="how-it-works">
          How it works
        </h2>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">Screen2Prompt</span> converts UI
          feedback into structured markdown that AI coding agents can use
          precisely. Click any element, add annotations, drag in wireframe
          components, or sketch a new screen, then paste the output into Claude
          Code, Codex, or any other AI tool.
        </p>
      </div>

      <div className="flex flex-col">
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            className="flex gap-4"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              delay: index * 0.08,
              duration: 0.45,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            {/* Left rail: number + connector */}
            <div className="flex flex-col items-center">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-brand/25 bg-brand/8 font-mono text-[11px] font-semibold text-brand">
                {step.number}
              </div>
              {index < steps.length - 1 && (
                <div className="my-2 w-px flex-1 bg-border" />
              )}
            </div>

            {/* Right: content */}
            <div
              className={`flex flex-col gap-1 ${
                index < steps.length - 1 ? "pb-6" : "pb-0"
              }`}
            >
              <span className="text-sm leading-snug font-semibold text-foreground">
                {step.title}
              </span>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
