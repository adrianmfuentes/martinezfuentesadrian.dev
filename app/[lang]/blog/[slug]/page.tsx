import Link from "next/link"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { ArrowLeft, CalendarDays, Clock } from "lucide-react"
import { getAllPosts, getPostBySlug } from "@/lib/blog"
import { getDictionary } from "../../dictionaries"
import { pageMetadata, SITE_URL, SITE_NAME } from "@/lib/seo"
import { GiscusComments } from "@components/giscus-comments"

export const revalidate = 3600

export async function generateStaticParams({ params }: { readonly params: { lang: string } }) {
  const posts = await getAllPosts(params.lang)
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  readonly params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  const post = await getPostBySlug(lang, slug)
  if (!post) return {}

  return pageMetadata({
    lang: lang as "en" | "es",
    path: `/blog/${slug}`,
    title: post.title,
    description: post.description,
    type: "article",
  })
}

function formatDate(date: string, lang: string): string {
  if (!date) return ""
  return new Date(date).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const PROSE_CLASSES =
  "[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 " +
  "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 " +
  "[&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-foreground/85 " +
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 " +
  "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 " +
  "[&_strong]:font-semibold " +
  "[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm " +
  "[&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-4 " +
  "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-foreground/70"

export default async function BlogPostPage({
  params,
}: {
  readonly params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  const dict = await getDictionary(lang as "en" | "es")

  if (!dict) {
    throw new Error("Dictionary not found")
  }

  const post = await getPostBySlug(lang, slug)
  if (!post) notFound()

  const allPosts = await getAllPosts(lang)
  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug && p.tags.some((tag) => post.tags.includes(tag)))
    .slice(0, 3)

  const nonce = (await headers()).get("x-nonce") ?? undefined

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: lang === 'es' ? 'es-ES' : 'en-US',
    url: `${SITE_URL}/${lang}/blog/${slug}`,
    mainEntityOfPage: `${SITE_URL}/${lang}/blog/${slug}`,
    author: { '@type': 'Person', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Person', name: SITE_NAME, url: SITE_URL },
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href={`/${lang}/blog`}
        className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        {dict.blog.backToBlog}
      </Link>

      <h1 className="text-4xl font-bold font-poppins mb-3">{post.title}</h1>

      <div className="flex items-center gap-4 text-sm text-foreground/50 mb-8">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4" />
          {formatDate(post.date, lang)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {post.readingMinutes} {dict.blog.minRead}
        </span>
      </div>

      <div className={PROSE_CLASSES} dangerouslySetInnerHTML={{ __html: post.contentHtml }} />

      {relatedPosts.length > 0 && (
        <div className="mt-16 pt-8 border-t border-border">
          <h2 className="text-xl font-semibold mb-4">{dict.blog.relatedPosts}</h2>
          <ul className="space-y-3">
            {relatedPosts.map((related) => (
              <li key={related.slug}>
                <Link
                  href={`/${lang}/blog/${related.slug}`}
                  className="group flex flex-col gap-1 rounded-lg border border-border p-4 transition-colors hover:border-primary/40"
                >
                  <span className="font-medium group-hover:text-primary transition-colors">
                    {related.title}
                  </span>
                  <span className="text-sm text-foreground/60">{related.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <GiscusComments lang={lang} />
    </div>
  )
}
