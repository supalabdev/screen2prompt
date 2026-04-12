"use client"

import { motion, AnimatePresence } from "motion/react"
import { useEffect, useRef, useState } from "react"

import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/ui/chat-container"

import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ui/reasoning"
import { ResponseStream } from "@/components/ui/response-stream"
import { buttonVariants } from "./ui/button"

type Phase = "idle" | "user" | "thinking" | "response" | "done"

const USER_MESSAGE = "Can you make the submit button bigger?"
const AI_RESPONSE = "I couldn't find what you're looking for :("

const THINKING_STEPS = [
  "Let me search for the submit button in your codebase.",
  "Explored 3 searches",
  'Grepped "submit" — no matches',
  'Grepped "button" — no matches',
  'Grepped type="submit" — no matches',
]

// Timing in ms
const T_USER = 700
const T_THINKING = 2000
const STEP_INTERVAL = 900
const T_CLOSE_REASONING =
  T_THINKING + THINKING_STEPS.length * STEP_INTERVAL + 500
const T_RESPONSE = T_CLOSE_REASONING + 500
const T_DONE = T_RESPONSE + 1200

export function ChatConversationSimulator() {
  const [phase, setPhase] = useState<Phase>("idle")
  const [visibleSteps, setVisibleSteps] = useState(0)
  const [isStreaming, setIsStreaming] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const schedule = (fn: () => void, delay: number) => {
    const t = setTimeout(fn, delay)
    timers.current.push(t)
  }

  useEffect(() => {
    schedule(() => setPhase("user"), T_USER)

    schedule(() => {
      setPhase("thinking")
      setIsStreaming(true)
    }, T_THINKING)

    THINKING_STEPS.forEach((_, i) => {
      schedule(
        () => setVisibleSteps(i + 1),
        T_THINKING + 600 + i * STEP_INTERVAL
      )
    })

    schedule(() => setIsStreaming(false), T_CLOSE_REASONING)
    schedule(() => setPhase("response"), T_RESPONSE)
    schedule(() => setPhase("done"), T_DONE)

    return () => timers.current.forEach(clearTimeout)
  }, [])

  return (
    <ChatContainerRoot className="scrollbar-mac h-full p-0">
      <ChatContainerContent className="flex h-full flex-col gap-4 overflow-hidden p-0">
        {/* User bubble */}
        <motion.div
          className="flex justify-end overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={
            phase !== "idle" ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
          }
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="max-w-65 rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm leading-snug text-primary-foreground">
            {USER_MESSAGE}
          </div>
        </motion.div>

        {/* AI area */}
        <AnimatePresence>
          {phase !== "idle" && phase !== "user" && (
            <motion.div
              className="flex flex-col gap-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {/* Reasoning block */}
              <Reasoning isStreaming={isStreaming}>
                <ReasoningTrigger className="text-xs text-muted-foreground">
                  {isStreaming ? "Thinking..." : "Thought for 3s"}
                </ReasoningTrigger>
                <ReasoningContent
                  className="mt-2"
                  contentClassName="text-xs space-y-1.5"
                >
                  {THINKING_STEPS.slice(0, visibleSteps).map((step, i) => (
                    <StepLine key={i} text={step} />
                  ))}
                </ReasoningContent>
              </Reasoning>

              {/* Error response */}
              <AnimatePresence>
                {(phase === "response" || phase === "done") && (
                  <motion.div
                    className="flex items-start gap-2 text-sm text-destructive"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <span className="mt-px select-none">⚠</span>
                    <ResponseStream
                      textStream={AI_RESPONSE}
                      mode="typewriter"
                      speed={38}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA */}
              <AnimatePresence>
                {phase === "done" && (
                  <motion.div
                    className="mt-1 flex h-16 flex-wrap items-center gap-3 md:h-10"
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 22,
                      mass: 0.8,
                    }}
                  >
                    <span className="text-xs text-muted-foreground">
                      With Screen2Prompt this would just work →
                    </span>
                    <motion.button
                      className={buttonVariants({
                        variant: "outline",
                        className:
                          "cursor-pointer border-brand! bg-brand/10! text-brand shadow-none outline-none",
                      })}
                      whileTap={{ scale: 0.97 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      }}
                    >
                      <motion.span
                        className="size-1.5 rounded-full bg-brand"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{
                          duration: 1.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      Try Screen2Prompt
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </ChatContainerContent>
    </ChatContainerRoot>
  )
}

function StepLine({ text }: { text: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {text}
    </motion.p>
  )
}
