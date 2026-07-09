"use client"

import { motion } from "framer-motion"

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

interface CursorGlowProps {
  mousePosition: { x: number; y: number }
}

export function CursorGlow({ mousePosition }: Readonly<CursorGlowProps>) {
  return (
    <motion.div
      className="pointer-events-none fixed h-96 w-96 rounded-full bg-primary/5 blur-3xl"
      animate={{
        x: mousePosition.x - 192,
        y: mousePosition.y - 192,
      }}
      transition={{ type: "spring", damping: 40, stiffness: 300 }}
    />
  )
}
