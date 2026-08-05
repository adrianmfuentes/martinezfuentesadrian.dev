import { Redis } from "@upstash/redis"
import { unstable_cache } from "next/cache"

export { computeExperienceLabel } from "./experience"

export const CMS_CONTENT_TAG = "cms-content"

export interface ExperienceCounter {
  startDate: string   // "YYYY-MM-DD"
  autoIncrement: boolean
}

export type ContentSection = "experience" | "education" | "certifications"

const DEFAULT_COUNTER: ExperienceCounter = {
  startDate: "2026-01-29",
  autoIncrement: true,
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

export async function getExperienceCounter(): Promise<ExperienceCounter> {
  const redis = getRedis()
  if (!redis) return DEFAULT_COUNTER
  try {
    const counter = await redis.get<ExperienceCounter>("experience:counter")
    return counter ?? DEFAULT_COUNTER
  } catch {
    return DEFAULT_COUNTER
  }
}

export async function setExperienceCounter(data: ExperienceCounter): Promise<void> {
  const redis = getRedis()
  if (!redis) throw new Error("Redis not configured")
  await redis.set("experience:counter", data)
}

export async function incrementVisitCount(): Promise<number | null> {
  const redis = getRedis()
  if (!redis) return null
  try {
    return await redis.incr("visits:total")
  } catch {
    return null
  }
}

export async function getVisitCount(): Promise<number | null> {
  const redis = getRedis()
  if (!redis) return null
  try {
    return await redis.get<number>("visits:total")
  } catch {
    return null
  }
}

// Best-effort per-tool usage counters, backing the public /tools/stats page.
// Never throws — a KV hiccup should never fail the tool request it's riding along with.
export async function incrementToolUsage(tool: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  try {
    await redis.hincrby("tools:usage", tool, 1)
  } catch {
    // ignore — analytics is not load-bearing
  }
}

export async function getToolUsageCounts(): Promise<Record<string, number>> {
  const redis = getRedis()
  if (!redis) return {}
  try {
    const raw = (await redis.hgetall<Record<string, string | number>>("tools:usage")) ?? {}
    return Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, Number(value)]))
  } catch {
    return {}
  }
}

export async function getContentOverride<T>(
  lang: string,
  section: ContentSection
): Promise<T | null> {
  const redis = getRedis()
  if (!redis) return null
  try {
    return await redis.get<T>(`content:${lang}:cv:${section}`)
  } catch {
    return null
  }
}

export async function setContentOverride<T>(
  lang: string,
  section: ContentSection,
  data: T
): Promise<void> {
  const redis = getRedis()
  if (!redis) throw new Error("Redis not configured")
  await redis.set(`content:${lang}:cv:${section}`, data)
}

export interface BlogPostRecord {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
  content: string
}

export type BlogEntry = BlogPostRecord | { deleted: true }

export async function getBlogOverrides(lang: string): Promise<Record<string, BlogEntry>> {
  const redis = getRedis()
  if (!redis) return {}
  try {
    return (await redis.get<Record<string, BlogEntry>>(`blog:posts:${lang}`)) ?? {}
  } catch {
    return {}
  }
}

export async function upsertBlogPost(
  lang: string,
  slug: string,
  data: Omit<BlogPostRecord, "slug">
): Promise<void> {
  const redis = getRedis()
  if (!redis) throw new Error("Redis not configured")
  const map = await getBlogOverrides(lang)
  map[slug] = { slug, ...data }
  await redis.set(`blog:posts:${lang}`, map)
}

export async function deleteBlogPost(lang: string, slug: string): Promise<void> {
  const redis = getRedis()
  if (!redis) throw new Error("Redis not configured")
  const map = await getBlogOverrides(lang)
  map[slug] = { deleted: true }
  await redis.set(`blog:posts:${lang}`, map)
}

export async function renameBlogPost(
  lang: string,
  oldSlug: string,
  newSlug: string,
  data: Omit<BlogPostRecord, "slug">
): Promise<void> {
  const redis = getRedis()
  if (!redis) throw new Error("Redis not configured")
  const map = await getBlogOverrides(lang)
  if (oldSlug !== newSlug) map[oldSlug] = { deleted: true }
  map[newSlug] = { slug: newSlug, ...data }
  await redis.set(`blog:posts:${lang}`, map)
}

export interface CmsOverrides {
  expOverride: unknown
  eduOverride: unknown
  certOverride: unknown
  counter: ExperienceCounter
}

// Wraps the live Redis lookups in Next's Data Cache so pages stay statically
// rendered instead of going fully dynamic on every request. Admin saves call
// revalidateTag(CMS_CONTENT_TAG) to pick up edits immediately.
export const getCachedCmsOverrides = unstable_cache(
  async (locale: string): Promise<CmsOverrides> => {
    const [expOverride, eduOverride, certOverride, counter] = await Promise.all([
      getContentOverride(locale, "experience"),
      getContentOverride(locale, "education"),
      getContentOverride(locale, "certifications"),
      getExperienceCounter(),
    ])
    return { expOverride, eduOverride, certOverride, counter }
  },
  ["cms-overrides"],
  { tags: [CMS_CONTENT_TAG], revalidate: 3600 }
)
