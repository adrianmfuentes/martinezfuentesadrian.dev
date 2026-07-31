"use client"

import { useEffect } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

interface FloatingShapeProps {
  delay: number
  duration: number
  x: number
  y: number
  size: string
  className?: string
}

export function FloatingShape({ delay, duration, x, y, size, className }: Readonly<FloatingShapeProps>) {
  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  return (
    <motion.div
      className={`absolute ${size} rounded-full blur-3xl opacity-20 pointer-events-none ${className ?? ""}`}
      style={{
        background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
      }}
      animate={
        reducedMotion
          ? undefined
          : {
              x: [0, x, 0],
              y: [0, y, 0],
            }
      }
      transition={{
        delay,
        duration,
        repeat: 1,
        ease: "easeInOut",
      }}
    />
  )
}

// Tracks the pointer with a framer-motion value instead of React state, so the
// whole section (cards, lists, etc.) doesn't re-render on every mousemove tick.
export function CursorGlow() {
  const x = useMotionValue(-384)
  const y = useMotionValue(-384)
  const springX = useSpring(x, { damping: 40, stiffness: 300 })
  const springY = useSpring(y, { damping: 40, stiffness: 300 })

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const handleMouseMove = (e: MouseEvent) => {
      x.set(e.clientX - 192)
      y.set(e.clientY - 192)
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [x, y])

  return (
    <motion.div
      className="pointer-events-none fixed h-96 w-96 rounded-full bg-primary/5 blur-3xl"
      style={{ x: springX, y: springY }}
    />
  )
}
