import { NextResponse } from "next/server"
import { getAllPosts } from "@/lib/blog"
import { SITE_URL, SITE_NAME } from "@/lib/seo"

export const revalidate = 3600

const DESCRIPTIONS: Record<"en" | "es", string> = {
  en: "Posts on code, security, and things I'm building.",
  es: "Artículos sobre código, seguridad y cosas que estoy construyendo.",
}

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale = lang === "en" ? "en" : "es"

  const posts = await getAllPosts(locale)
  const feedUrl = `${SITE_URL}/${locale}/feed.json`
  const homePageUrl = `${SITE_URL}/${locale}/blog`

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: SITE_NAME,
    home_page_url: homePageUrl,
    feed_url: feedUrl,
    description: DESCRIPTIONS[locale],
    language: locale,
    items: posts.map((post) => {
      const url = `${SITE_URL}/${locale}/blog/${post.slug}`
      return {
        id: url,
        url,
        title: post.title,
        summary: post.description,
        date_published: post.date ? new Date(post.date).toISOString() : undefined,
        tags: post.tags,
      }
    }),
  }

  return NextResponse.json(feed, {
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
    },
  })
}
