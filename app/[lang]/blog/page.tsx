import { BlogSection } from "@components/blog-section"
import { getDictionary } from "../dictionaries"
import { getAllPosts } from "@/lib/blog"

export const revalidate = 3600

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
