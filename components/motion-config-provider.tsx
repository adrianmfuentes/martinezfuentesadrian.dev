"use client"

import { MotionConfig } from "framer-motion"
import type { ReactNode } from "react"

// Makes every framer-motion animation site-wide respect the OS-level
// "reduce motion" setting in one place, instead of each component having to
// remember to check `prefers-reduced-motion` individually.
export function MotionConfigProvider({ children }: Readonly<{ children: ReactNode }>) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
