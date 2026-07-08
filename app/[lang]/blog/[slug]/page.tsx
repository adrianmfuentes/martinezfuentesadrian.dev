import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarDays, Clock } from "lucide-react"
import { getAllPosts, getPostBySlug } from "@/lib/blog"
import { getDictionary } from "../../dictionaries"

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

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
    },
  }
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

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
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
    </div>
  )
}
