import { BlogSection } from "@components/blog-section"
import { getDictionary } from "../dictionaries"
import { getAllPosts } from "@/lib/blog"
import { pageMetadata } from "@/lib/seo"

export const revalidate = 3600

const DESCRIPTIONS = {
  es: "Artículos sobre desarrollo web, ciberseguridad y buenas prácticas de programación escritos por Adrián Martínez Fuentes.",
  en: "Articles about web development, cybersecurity and software engineering best practices, written by Adrián Martínez Fuentes.",
} as const

export async function generateMetadata({
  params,
}: {
  readonly params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as "en" | "es")
  const base = pageMetadata({
    lang: lang as "en" | "es",
    path: "/blog",
    title: dict.blog.title,
    description: DESCRIPTIONS[lang as "en" | "es"],
  })

  return {
    ...base,
    alternates: {
      ...base.alternates,
      types: {
        "application/rss+xml": `/${lang}/feed.xml`,
        "application/feed+json": `/${lang}/feed.json`,
      },
    },
  }
}

export default async function BlogPage({
  params,
}: {
  readonly params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as "en" | "es");

  if (!dict) {
    throw new Error("Dictionary not found");
  }

  const posts = await getAllPosts(lang)

  return (
    <div className="container mx-auto px-4 py-12">
      <BlogSection lang={lang} posts={posts} dictionary={dict.blog} />
    </div>
  )
}
