import { NextResponse } from "next/server"
import { getAllPosts } from "@/lib/blog"
import { SITE_URL, SITE_NAME } from "@/lib/seo"

export const revalidate = 3600

const DESCRIPTIONS: Record<"en" | "es", string> = {
  en: "Posts on code, security, and things I'm building.",
  es: "Artículos sobre código, seguridad y cosas que estoy construyendo.",
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale = lang === "en" ? "en" : "es"

  const posts = await getAllPosts(locale)
  const feedUrl = `${SITE_URL}/${locale}/feed.xml`
  const siteUrl = `${SITE_URL}/${locale}/blog`

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/${locale}/blog/${post.slug}`
      const pubDate = post.date ? new Date(post.date).toUTCString() : new Date().toUTCString()
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/feed.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(DESCRIPTIONS[locale])}</description>
    <language>${locale}</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  })
}
