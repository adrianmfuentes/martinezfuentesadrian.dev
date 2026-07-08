"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TerminalSquare } from "lucide-react"

const KONAMI_SEQUENCE = [
  "arrowup",
  "arrowup",
  "arrowdown",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "arrowleft",
  "arrowright",
  "b",
  "a",
]

interface KonamiCodeProps {
  dictionary: {
    title: string
    lines: readonly string[]
    closeHint: string
  }
}

export function KonamiCode({ dictionary }: Readonly<KonamiCodeProps>) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    let progress: string[] = []

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      progress = [...progress, key].slice(-KONAMI_SEQUENCE.length)
      if (progress.length === KONAMI_SEQUENCE.length && progress.every((k, i) => k === KONAMI_SEQUENCE[i])) {
        setActive(true)
        progress = []
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (!active) return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(false)
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [active])

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-auto bg-black/95 p-8 pt-24 font-mono text-green-400"
          role="dialog"
          aria-modal="true"
          aria-label={dictionary.title}
        >
          <div className="max-w-xl w-full">
            <div className="flex items-center gap-2 mb-6 text-lg">
              <TerminalSquare className="h-5 w-5" />
              <span>{dictionary.title}</span>
            </div>
            {dictionary.lines.map((line, i) => (
              <motion.p
                key={line}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.4 }}
                className="mb-2 text-sm sm:text-base"
              >
                <span className="opacity-60">$</span> {line}
              </motion.p>
            ))}
            <button
              type="button"
              onClick={() => setActive(false)}
              className="mt-8 text-xs opacity-50 hover:opacity-80 underline underline-offset-2"
            >
              {dictionary.closeHint}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
