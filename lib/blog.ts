import "server-only"
import fs from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"
import DOMPurify from "isomorphic-dompurify"
import { getBlogOverrides, type BlogPostRecord } from "./kv"

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

export interface BlogPostDraft {
  title: string
  description: string
  date: string
  tags: string[]
  content: string
}

const WORDS_PER_MINUTE = 200

function contentDir(lang: string): string {
  return path.join(process.cwd(), "content", "blog", lang)
}

function readingMinutesFor(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

interface FrontMatterLike {
  title?: unknown
  description?: unknown
  date?: unknown
  tags?: unknown
}

function toMeta(slug: string, data: FrontMatterLike, content: string): BlogPostMeta {
  return {
    slug,
    title: typeof data.title === "string" ? data.title : slug,
    description: typeof data.description === "string" ? data.description : "",
    date: typeof data.date === "string" ? data.date : "",
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingMinutes: readingMinutesFor(content),
  }
}

async function readFilesystemPosts(lang: string): Promise<Map<string, BlogPostMeta>> {
  let files: string[]
  try {
    files = await fs.readdir(contentDir(lang))
  } catch {
    return new Map()
  }

  const entries = await Promise.all(
    files
      .filter((file) => file.endsWith(".md"))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(contentDir(lang), file), "utf8")
        const { data, content } = matter(raw)
        const slug = file.replace(/\.md$/, "")
        return [slug, toMeta(slug, data, content)] as const
      })
  )

  return new Map(entries)
}

async function readFilesystemDraft(lang: string, slug: string): Promise<BlogPostDraft | null> {
  try {
    const raw = await fs.readFile(path.join(contentDir(lang), `${slug}.md`), "utf8")
    const { data, content } = matter(raw)
    const meta = toMeta(slug, data, content)
    return { title: meta.title, description: meta.description, date: meta.date, tags: meta.tags, content: content.trim() }
  } catch {
    return null
  }
}

async function renderHtml(content: string): Promise<string> {
  const processed = await remark().use(html).process(content)
  return DOMPurify.sanitize(processed.toString())
}

export async function getAllPosts(lang: string): Promise<BlogPostMeta[]> {
  const [filesystemPosts, overrides] = await Promise.all([readFilesystemPosts(lang), getBlogOverrides(lang)])

  const merged = new Map(filesystemPosts)
  for (const [slug, entry] of Object.entries(overrides)) {
    if ("deleted" in entry) {
      merged.delete(slug)
    } else {
      merged.set(slug, toMeta(slug, entry, entry.content))
    }
  }

  return [...merged.values()].sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getPostBySlug(lang: string, slug: string): Promise<BlogPost | null> {
  const overrides = await getBlogOverrides(lang)
  const entry = overrides[slug]

  if (entry) {
    if ("deleted" in entry) return null
    return { ...toMeta(slug, entry, entry.content), contentHtml: await renderHtml(entry.content) }
  }

  try {
    const raw = await fs.readFile(path.join(contentDir(lang), `${slug}.md`), "utf8")
    const { data, content } = matter(raw)
    return { ...toMeta(slug, data, content), contentHtml: await renderHtml(content) }
  } catch {
    return null
  }
}

export async function getPostDraft(lang: string, slug: string): Promise<BlogPostDraft | null> {
  const overrides = await getBlogOverrides(lang)
  const entry = overrides[slug]

  if (entry) {
    if ("deleted" in entry) return null
    const { title, description, date, tags, content } = entry as BlogPostRecord
    return { title, description, date, tags, content }
  }

  return readFilesystemDraft(lang, slug)
}
