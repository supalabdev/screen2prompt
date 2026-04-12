"use client"

import { cn } from "@/lib/utils"

export type CodeBlockProps = {
  children: React.ReactNode
  className?: string
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  return (
    <pre
      className={cn(
        "overflow-x-auto rounded-md bg-muted px-4 py-3 text-sm",
        className
      )}
    >
      {children}
    </pre>
  )
}

export type CodeBlockCodeProps = {
  code: string
  language?: string
  className?: string
}

export function CodeBlockCode({ code, className }: CodeBlockCodeProps) {
  return <code className={cn("font-mono", className)}>{code}</code>
}
