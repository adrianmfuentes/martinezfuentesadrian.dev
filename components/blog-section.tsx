"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@components/ui/card"
import { CalendarDays, Clock, Rss, Search, X } from "lucide-react"
import type { BlogPostMeta } from "@/lib/blog"

interface BlogSectionProps {
  lang: string
  posts: readonly BlogPostMeta[]
  dictionary: {
    title: string
    subtitle: string
    empty: string
    minRead: string
    rss: string
    searchPlaceholder: string
    allTags: string
    noResults: string
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

function formatDate(date: string, lang: string): string {
  if (!date) return ""
  return new Date(date).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function BlogSection({ lang, posts, dictionary }: Readonly<BlogSectionProps>) {
  const [query, setQuery] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    for (const post of posts) {
      for (const tag of post.tags) tags.add(tag)
    }
    return [...tags].sort((a, b) => a.localeCompare(b))
  }, [posts])

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter((post) => {
      const matchesQuery =
        !q || post.title.toLowerCase().includes(q) || post.description.toLowerCase().includes(q)
      const matchesTag = !activeTag || post.tags.includes(activeTag)
      return matchesQuery && matchesTag
    })
  }, [posts, query, activeTag])

  const hasFilteredResults = filteredPosts.length > 0

  return (
    <section className="py-16" aria-label={dictionary.title}>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2 font-poppins">{dictionary.title}</h2>
        <p className="text-lg text-foreground/70">{dictionary.subtitle}</p>
        <a
          href={`/${lang}/feed.xml`}
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-foreground/50 hover:text-primary transition-colors"
        >
          <Rss className="h-3.5 w-3.5" />
          {dictionary.rss}
        </a>
      </div>

      {posts.length > 0 && (
        <div className="max-w-2xl mx-auto mb-10 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={dictionary.searchPlaceholder}
              aria-label={dictionary.searchPlaceholder}
              className="w-full rounded-full border border-border bg-background/60 py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary/50"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTag(null)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  activeTag === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
              >
                {dictionary.allTags}
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag((current) => (current === tag ? null : tag))}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${
                    activeTag === tag
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {(() => {
        if (posts.length === 0) {
          return (
            <p className="text-center text-foreground/60">{dictionary.empty}</p>
          )
        }
        if (!hasFilteredResults) {
          return (
            <div className="text-center">
              <p className="text-foreground/60 mb-3">{dictionary.noResults}</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setActiveTag(null)
                }}
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <X className="h-3.5 w-3.5" />
                {dictionary.allTags}
              </button>
            </div>
          )
        }
        return (
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {filteredPosts.map((post) => (
              <motion.div key={post.slug} variants={itemVariants}>
                <Link href={`/${lang}/blog/${post.slug}`} className="group block h-full">
                  <Card className="h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40">
                    <CardContent className="p-6 flex-grow flex flex-col">
                      <div className="flex items-center gap-3 text-xs text-foreground/50 mb-3">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(post.date, lang)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {post.readingMinutes} {dictionary.minRead}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2 transition-colors group-hover:text-primary">
                        {post.title}
                      </h3>
                      <p className="text-foreground/80 mb-4 flex-grow">{post.description}</p>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {post.tags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setActiveTag(tag)
                            }}
                            className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full hover:bg-primary/20 transition-colors cursor-pointer border-0"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )
      })()}
    </section>
  )
}
