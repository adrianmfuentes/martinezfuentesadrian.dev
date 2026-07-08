import "server-only"
import fs from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"
import DOMPurify from "isomorphic-dompurify"

export interface BlogPostMeta {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
  readingMinutes: number
}

export interface BlogPost extends BlogPostMeta {
  contentHtml: string
}

const WORDS_PER_MINUTE = 200

function contentDir(lang: string): string {
  return path.join(process.cwd(), "content", "blog", lang)
}

function readingMinutesFor(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

function toMeta(slug: string, data: Record<string, unknown>, content: string): BlogPostMeta {
  return {
    slug,
    title: typeof data.title === "string" ? data.title : slug,
    description: typeof data.description === "string" ? data.description : "",
    date: typeof data.date === "string" ? data.date : "",
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingMinutes: readingMinutesFor(content),
  }
}

export async function getAllPosts(lang: string): Promise<BlogPostMeta[]> {
  let files: string[]
  try {
    files = await fs.readdir(contentDir(lang))
  } catch {
    return []
  }

  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith(".md"))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(contentDir(lang), file), "utf8")
        const { data, content } = matter(raw)
        return toMeta(file.replace(/\.md$/, ""), data, content)
      })
  )

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getPostBySlug(lang: string, slug: string): Promise<BlogPost | null> {
  try {
    const raw = await fs.readFile(path.join(contentDir(lang), `${slug}.md`), "utf8")
    const { data, content } = matter(raw)
    const processed = await remark().use(html).process(content)
    const contentHtml = DOMPurify.sanitize(processed.toString())
    return { ...toMeta(slug, data, content), contentHtml }
  } catch {
    return null
  }
}
