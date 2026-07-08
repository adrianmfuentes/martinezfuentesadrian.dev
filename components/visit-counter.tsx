"use client"

import { useEffect, useState } from "react"
import { Eye } from "lucide-react"

interface VisitCounterProps {
  label: string
}

export function VisitCounter({ label }: Readonly<VisitCounterProps>) {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/visit-count")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.count === "number") setCount(data.count)
      })
      .catch(() => {})
  }, [])

  if (count === null) return null

  return (
    <p className="flex items-center justify-center gap-1.5 text-xs text-foreground/50 mt-2">
      <Eye className="h-3.5 w-3.5" />
      {label.replace("{count}", count.toLocaleString())}
    </p>
  )
}
