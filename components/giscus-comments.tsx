"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

const REPO = process.env.NEXT_PUBLIC_GISCUS_REPO
const REPO_ID = process.env.NEXT_PUBLIC_GISCUS_REPO_ID
const CATEGORY = process.env.NEXT_PUBLIC_GISCUS_CATEGORY
const CATEGORY_ID = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID

interface GiscusCommentsProps {
  lang: string
}

// Renders nothing unless all four NEXT_PUBLIC_GISCUS_* vars are set — see
// README's "Optional integrations" section for the GitHub Discussions setup
// this depends on.
export function GiscusComments({ lang }: Readonly<GiscusCommentsProps>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!REPO || !REPO_ID || !CATEGORY || !CATEGORY_ID || !containerRef.current) return

    const script = document.createElement("script")
    script.src = "https://giscus.app/client.js"
    script.async = true
    script.crossOrigin = "anonymous"
    script.dataset.repo = REPO
    script.dataset.repoId = REPO_ID
    script.dataset.category = CATEGORY
    script.dataset.categoryId = CATEGORY_ID
    script.dataset.mapping = "pathname"
    script.dataset.strict = "0"
    script.dataset.reactionsEnabled = "1"
    script.dataset.emitMetadata = "0"
    script.dataset.inputPosition = "bottom"
    script.dataset.theme = resolvedTheme === "light" ? "light" : "dark"
    script.dataset.lang = lang

    const container = containerRef.current
    container.appendChild(script)

    return () => {
      container.innerHTML = ""
    }
  }, [lang, resolvedTheme])

  if (!REPO || !REPO_ID || !CATEGORY || !CATEGORY_ID) return null

  return <div ref={containerRef} className="mt-12 pt-8 border-t border-border" />
}
