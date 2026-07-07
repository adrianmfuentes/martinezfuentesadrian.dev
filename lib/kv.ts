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

export interface CmsOverrides {
  expOverride: unknown | null
  eduOverride: unknown | null
  certOverride: unknown | null
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
