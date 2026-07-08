"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@components/ui/card"
import { CalendarDays, Clock } from "lucide-react"
import type { BlogPostMeta } from "@/lib/blog"

interface BlogSectionProps {
  lang: string
  posts: readonly BlogPostMeta[]
  dictionary: {
    title: string
    subtitle: string
    empty: string
    minRead: string
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
  return (
    <section className="py-16" aria-label={dictionary.title}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2 font-poppins">{dictionary.title}</h2>
        <p className="text-lg text-foreground/70">{dictionary.subtitle}</p>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-foreground/60">{dictionary.empty}</p>
      ) : (
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {posts.map((post) => (
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
                        <span key={tag} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  )
}
