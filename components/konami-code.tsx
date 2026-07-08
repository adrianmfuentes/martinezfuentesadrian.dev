"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { TerminalSquare, Volume2, VolumeX } from "lucide-react"
import { playAccessGranted, playError, playKeyTick, playSubmit } from "@/lib/terminal-sound"
import { MatrixRain } from "@components/matrix-rain"

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

const BOOT_HEADER = ["┌────────────────────────────┐", "│      A D R I A N M F       │", "└────────────────────────────┘"]

const VALID_PAGES = new Set(["about", "cv", "portfolio", "tools", "blog", "contact", "home"])

const BOOT_LINE_INTERVAL_MS = 240
const BOOT_FINISH_DELAY_MS = 550
const SOUND_MUTED_KEY = "konami-sound-muted"

interface KonamiCommands {
  help: string
  whoami: string
  about: string
  skills: string
  ls: string
  sudo: string
  navigating: string
  notFound: string
  themeUsage: string
  themeSet: string
  matrixOn: string
  matrixOff: string
  exit: string
}

interface CommandOutcome {
  outputLines: string[]
  shouldClear?: boolean
  navigateTo?: string
  shouldClose?: boolean
  theme?: "light" | "dark"
  matrixIntense?: boolean
  playErrorSound?: boolean
}

function handleCdCommand(args: string[], raw: string, commands: KonamiCommands): CommandOutcome {
  const target = args[0]?.toLowerCase()
  if (target && VALID_PAGES.has(target)) {
    return { outputLines: [commands.navigating.replace("{page}", target === "home" ? "" : target)], navigateTo: target }
  }
  return { outputLines: [commands.notFound.replace("{cmd}", raw)], playErrorSound: true }
}

function handleThemeCommand(args: string[], commands: KonamiCommands): CommandOutcome {
  const value = args[0]?.toLowerCase()
  if (value === "light" || value === "dark") {
    return { outputLines: [commands.themeSet.replace("{theme}", value)], theme: value }
  }
  return { outputLines: [commands.themeUsage] }
}

function handleMatrixCommand(commands: KonamiCommands, matrixIntense: boolean): CommandOutcome {
  const next = !matrixIntense
  return { outputLines: [next ? commands.matrixOn : commands.matrixOff], matrixIntense: next }
}

function resolveCommand(cmd: string, args: string[], raw: string, commands: KonamiCommands, lang: string, matrixIntense: boolean): CommandOutcome {
  switch (cmd) {
    case "help":
      return { outputLines: [commands.help] }
    case "whoami":
      return { outputLines: [commands.whoami] }
    case "about":
      return { outputLines: [commands.about] }
    case "skills":
      return { outputLines: [commands.skills] }
    case "ls":
      return { outputLines: [commands.ls] }
    case "cd":
    case "open":
      return handleCdCommand(args, raw, commands)
    case "sudo":
      return { outputLines: [commands.sudo], playErrorSound: true }
    case "theme":
      return handleThemeCommand(args, commands)
    case "matrix":
      return handleMatrixCommand(commands, matrixIntense)
    case "clear":
      return { outputLines: [], shouldClear: true }
    case "date":
      return { outputLines: [new Date().toLocaleString(lang === "es" ? "es-ES" : "en-US")] }
    case "echo":
      return { outputLines: [args.join(" ")] }
    case "exit":
    case "close":
      return { outputLines: [commands.exit], shouldClose: true }
    default:
      return { outputLines: [commands.notFound.replace("{cmd}", raw)], playErrorSound: true }
  }
}

interface KonamiCodeProps {
  lang?: string
  dictionary: {
    title: string
    bootLines?: string[]
    lines: readonly string[]
    closeHint: string
    prompt?: string
    inputPlaceholder?: string
    muteHint?: string
    unmuteHint?: string
    commands?: KonamiCommands
  }
}

interface HistoryEntry {
  type: "input" | "output"
  text: string
}

export function KonamiCode({ lang = "en", dictionary }: Readonly<KonamiCodeProps>) {
  const router = useRouter()
  const { setTheme } = useTheme()

  const hasShell = Boolean(dictionary.commands)
  const bootLines = dictionary.bootLines ?? []
  const commands = dictionary.commands

  const [active, setActive] = useState(false)
  const [phase, setPhase] = useState<"boot" | "shell">("shell")
  const [bootIndex, setBootIndex] = useState(0)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [input, setInput] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyCursor, setHistoryCursor] = useState<number | null>(null)
  const [muted, setMuted] = useState(() => typeof window !== "undefined" && window.localStorage.getItem(SOUND_MUTED_KEY) === "true")
  const [matrixIntense, setMatrixIntense] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const bootTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      const next = !prev
      window.localStorage.setItem(SOUND_MUTED_KEY, String(next))
      return next
    })
  }, [])

  useEffect(() => {
    let progress: string[] = []

    const handleKeyDown = (event: KeyboardEvent) => {
      if (active) return
      const key = event.key.toLowerCase()
      progress = [...progress, key].slice(-KONAMI_SEQUENCE.length)
      if (progress.length === KONAMI_SEQUENCE.length && progress.every((k, i) => k === KONAMI_SEQUENCE[i])) {
        progress = []
        const useBootSequence = hasShell && bootLines.length > 0
        setActive(true)
        setBootIndex(0)
        if (useBootSequence) {
          setPhase("boot")
          setHistory([])
        } else {
          setPhase("shell")
          setHistory(dictionary.lines.map((text) => ({ type: "output", text })))
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [active, dictionary.lines, hasShell, bootLines.length])

  const finishBoot = useCallback(() => {
    if (bootTimerRef.current) clearTimeout(bootTimerRef.current)
    setPhase("shell")
    setHistory(dictionary.lines.map((text) => ({ type: "output", text })))
    if (!muted) playAccessGranted()
  }, [dictionary.lines, muted])

  useEffect(() => {
    if (!active || phase !== "boot") return

    if (bootIndex >= bootLines.length) {
      bootTimerRef.current = setTimeout(finishBoot, BOOT_FINISH_DELAY_MS)
      return () => {
        if (bootTimerRef.current) clearTimeout(bootTimerRef.current)
      }
    }

    bootTimerRef.current = setTimeout(() => setBootIndex((i) => i + 1), BOOT_LINE_INTERVAL_MS)
    return () => {
      if (bootTimerRef.current) clearTimeout(bootTimerRef.current)
    }
  }, [active, phase, bootIndex, bootLines.length, finishBoot])

  useEffect(() => {
    if (!active) return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(false)
      if (phase === "boot") finishBoot()
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [active, phase, finishBoot])

  useEffect(() => {
    if (active && phase === "shell" && hasShell) {
      inputRef.current?.focus()
    }
  }, [active, phase, hasShell])

  const close = useCallback(() => setActive(false), [])

  const runCommand = useCallback(
    (raw: string) => {
      const promptLabel = dictionary.prompt ?? "guest@adrianmf"
      const promptLine = `${promptLabel}:~$ ${raw}`

      if (!raw.trim() || !commands) {
        setHistory((h) => [...h, { type: "input", text: promptLine }])
        return
      }

      if (!muted) playSubmit()

      const [cmdRaw, ...args] = raw.trim().split(/\s+/)
      const outcome = resolveCommand(cmdRaw.toLowerCase(), args, raw, commands, lang, matrixIntense)

      if (outcome.playErrorSound && !muted) playError()
      if (outcome.theme) setTheme(outcome.theme)
      if (outcome.matrixIntense !== undefined) setMatrixIntense(outcome.matrixIntense)

      if (outcome.shouldClear) {
        setHistory([])
        return
      }

      setHistory((h) => [
        ...h,
        { type: "input", text: promptLine },
        ...outcome.outputLines.filter(Boolean).map((text) => ({ type: "output" as const, text })),
      ])

      if (outcome.navigateTo) {
        const target = outcome.navigateTo
        setTimeout(() => {
          setActive(false)
          router.push(target === "home" ? `/${lang}` : `/${lang}/${target}`)
        }, 700)
      }
      if (outcome.shouldClose) {
        setTimeout(() => setActive(false), 400)
      }
    },
    [commands, dictionary.prompt, lang, matrixIntense, muted, router, setTheme]
  )

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault()
      runCommand(input)
      if (input.trim()) setCommandHistory((h) => [...h, input])
      setHistoryCursor(null)
      setInput("")
    },
    [input, runCommand]
  )

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!muted && event.key.length === 1) playKeyTick()
      if (event.key === "ArrowUp") {
        event.preventDefault()
        if (commandHistory.length === 0) return
        const nextCursor = historyCursor === null ? commandHistory.length - 1 : Math.max(0, historyCursor - 1)
        setHistoryCursor(nextCursor)
        setInput(commandHistory[nextCursor])
      } else if (event.key === "ArrowDown") {
        event.preventDefault()
        if (historyCursor === null) return
        const nextCursor = historyCursor + 1
        if (nextCursor >= commandHistory.length) {
          setHistoryCursor(null)
          setInput("")
        } else {
          setHistoryCursor(nextCursor)
          setInput(commandHistory[nextCursor])
        }
      }
    },
    [commandHistory, historyCursor, muted]
  )

  const progressPercent = bootLines.length > 0 ? Math.round((Math.min(bootIndex, bootLines.length) / bootLines.length) * 100) : 100

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
          onClick={() => {
            if (phase === "boot") finishBoot()
            else inputRef.current?.focus()
          }}
        >
          {hasShell && <MatrixRain intense={matrixIntense} />}

          <div className="relative z-10 max-w-xl w-full">
            <div className="flex items-center justify-between gap-2 mb-6 text-lg">
              <div className="flex items-center gap-2">
                <TerminalSquare className="h-5 w-5" />
                <span>{dictionary.title}</span>
              </div>
              {hasShell && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    toggleMuted()
                  }}
                  aria-label={muted ? dictionary.unmuteHint : dictionary.muteHint}
                  className="opacity-60 hover:opacity-100"
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              )}
            </div>

            {phase === "boot" ? (
              <div className="text-sm sm:text-base space-y-1">
                {BOOT_HEADER.map((line) => (
                  <p key={line} className="opacity-80 whitespace-pre">
                    {line}
                  </p>
                ))}
                <div className="h-3" />
                {bootLines.slice(0, bootIndex).map((line, i) => (
                  <p key={`${line}-${i}`}>
                    <span className="opacity-60">$</span> {line}
                  </p>
                ))}
                <p className="mt-3 opacity-80">
                  [{"█".repeat(Math.floor(progressPercent / 5)).padEnd(20, "░")}] {progressPercent}%
                </p>
              </div>
            ) : (
              <>
                <div className="text-sm sm:text-base space-y-1 mb-2" aria-live="polite">
                  {history.map((entry, i) => (
                    <motion.p
                      key={`${entry.type}-${i}-${entry.text}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={entry.type === "input" ? "opacity-90" : "opacity-75 pl-4"}
                    >
                      {entry.type === "output" && <span className="opacity-60">{"> "}</span>}
                      {entry.text}
                    </motion.p>
                  ))}
                </div>

                {hasShell ? (
                  <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
                    <span className="opacity-90">{dictionary.prompt ?? "guest@adrianmf"}:~$</span>
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={handleInputKeyDown}
                      onClick={(event) => event.stopPropagation()}
                      aria-label={dictionary.inputPlaceholder ?? "Terminal input"}
                      placeholder={dictionary.inputPlaceholder}
                      autoComplete="off"
                      spellCheck={false}
                      className="flex-1 bg-transparent outline-none placeholder:opacity-40 caret-green-400"
                    />
                  </form>
                ) : null}
              </>
            )}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                close()
              }}
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
