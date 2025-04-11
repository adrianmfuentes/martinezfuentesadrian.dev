import type React from "react"

export default function AssetsLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return <div className="min-h-screen">{children}</div>
}
