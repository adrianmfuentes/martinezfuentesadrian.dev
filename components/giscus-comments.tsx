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
    script.setAttribute("data-repo", REPO)
    script.setAttribute("data-repo-id", REPO_ID)
    script.setAttribute("data-category", CATEGORY)
    script.setAttribute("data-category-id", CATEGORY_ID)
    script.setAttribute("data-mapping", "pathname")
    script.setAttribute("data-strict", "0")
    script.setAttribute("data-reactions-enabled", "1")
    script.setAttribute("data-emit-metadata", "0")
    script.setAttribute("data-input-position", "bottom")
    script.setAttribute("data-theme", resolvedTheme === "light" ? "light" : "dark")
    script.setAttribute("data-lang", lang)

    const container = containerRef.current
    container.appendChild(script)

    return () => {
      container.innerHTML = ""
    }
  }, [lang, resolvedTheme])

  if (!REPO || !REPO_ID || !CATEGORY || !CATEGORY_ID) return null

  return <div ref={containerRef} className="mt-12 pt-8 border-t border-border" />
}
