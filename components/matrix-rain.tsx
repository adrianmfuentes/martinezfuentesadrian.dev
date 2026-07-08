"use client"

import { useEffect, useRef } from "react"
import { secureRandom } from "@/lib/secure-random"

const CHARACTERS = "01アイウエオカキクケコサシスセソタチツテト".split("")
const FONT_SIZE = 16

interface MatrixRainProps {
  intense?: boolean
}

export function MatrixRain({ intense = false }: Readonly<MatrixRainProps>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let width = (canvas.width = canvas.offsetWidth)
    let height = (canvas.height = canvas.offsetHeight)
    let columns = Math.max(1, Math.floor(width / FONT_SIZE))
    let drops = new Array(columns).fill(0).map(() => secureRandom() * -50)

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
      columns = Math.max(1, Math.floor(width / FONT_SIZE))
      drops = new Array(columns).fill(0).map(() => secureRandom() * -50)
    }
    window.addEventListener("resize", handleResize)

    let frame = 0
    let animationId: number

    const draw = () => {
      frame += 1
      if (frame % (intense ? 1 : 2) === 0) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.08)"
        ctx.fillRect(0, 0, width, height)
        ctx.font = `${FONT_SIZE}px monospace`

        for (let i = 0; i < drops.length; i++) {
          const char = CHARACTERS[Math.floor(secureRandom() * CHARACTERS.length)]
          ctx.fillStyle = intense ? "rgba(74, 222, 128, 0.9)" : "rgba(34, 197, 94, 0.5)"
          ctx.fillText(char, i * FONT_SIZE, drops[i] * FONT_SIZE)

          if (drops[i] * FONT_SIZE > height && secureRandom() > 0.975) {
            drops[i] = 0
          }
          drops[i] += 1
        }
      }
      animationId = requestAnimationFrame(draw)
    }
    animationId = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationId)
    }
  }, [intense])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      tabIndex={-1}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
    />
  )
}
