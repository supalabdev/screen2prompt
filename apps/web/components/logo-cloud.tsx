"use client"
import React, { useEffect, useState } from "react"

import { Claude } from "@/components/ui/svgs/claude"
import { AnimatePresence, motion } from "motion/react"
import { OpenClaw } from "./ui/svgs/open-claw"
import { Codex } from "./ui/svgs/codex"
import { Windsurf } from "./ui/svgs/windsurf"
import { Cursor } from "./ui/svgs/cursor"
import { AntiGravity } from "./ui/svgs/antigravity"

const logoGroups: React.ReactNode[][] = [
  [
    <Claude key="claude" className="h-7 w-full" />,
    <AntiGravity key="antigravity" className="h-7 w-full" />,
    <Codex key="codex" className="h-7 w-full" />,
  ],
  [
    <Windsurf key="windsurf" className="h-7 w-full" />,
    <OpenClaw key="openclaw" className="h-7 w-full" />,
    <Cursor key="cursor" className="h-7 w-full" />,
  ],
]

export default function LogoCloud() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % logoGroups.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full overflow-hidden">
      <div className="mx-auto grid h-8 max-w-2xl grid-cols-3 items-center gap-8">
        <AnimatePresence initial={false} mode="popLayout">
          {logoGroups[currentIndex].map((logo, i) => (
            <motion.div
              key={`group-${currentIndex}-${i}`}
              className="flex items-center justify-center **:fill-foreground!"
              initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 12, filter: "blur(6px)", scale: 0.5 }}
              transition={{
                delay: i * 0.1,
                duration: 1.5,
                type: "spring",
                bounce: 0.2,
              }}
            >
              {logo}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
