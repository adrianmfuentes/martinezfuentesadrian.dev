import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { verifySessionToken, ADMIN_COOKIE } from "@/lib/admin-auth"
import { upsertBlogPost, deleteBlogPost, renameBlogPost } from "@/lib/kv"
import { getAllPosts } from "@/lib/blog"

async function verifyRequest(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  return !!token && (await verifySessionToken(token))
}

function revalidateBlog(lang: string, slugs: string[]) {
  revalidatePath(`/${lang}/blog`, "page")
  for (const slug of slugs) revalidatePath(`/${lang}/blog/${slug}`, "page")
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export async function GET(request: Request) {
  if (!(await verifyRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const lang = searchParams.get("lang")
  if (lang !== "en" && lang !== "es") {
    return NextResponse.json({ error: "Invalid lang" }, { status: 400 })
  }

  const posts = await getAllPosts(lang)
  return NextResponse.json({ posts })
}

export async function POST(request: Request) {
  if (!(await verifyRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { lang, slug, originalSlug, title, description, date, tags, content } = body as {
      lang: string
      slug: string
      originalSlug?: string
      title: string
      description: string
      date: string
      tags: string[]
      content: string
    }

    if (lang !== "en" && lang !== "es") {
      return NextResponse.json({ error: "Invalid lang" }, { status: 400 })
    }
    if (typeof slug !== "string" || !SLUG_PATTERN.test(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 })
    }
    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const data = {
      title,
      description: description ?? "",
      date: date ?? "",
      tags: Array.isArray(tags) ? tags.map(String) : [],
      content: content ?? "",
    }

    if (originalSlug && originalSlug !== slug) {
      await renameBlogPost(lang, originalSlug, slug, data)
      revalidateBlog(lang, [originalSlug, slug])
    } else {
      await upsertBlogPost(lang, slug, data)
      revalidateBlog(lang, [slug])
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Save failed" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!(await verifyRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { lang, slug } = body as { lang: string; slug: string }

    if (lang !== "en" && lang !== "es") {
      return NextResponse.json({ error: "Invalid lang" }, { status: 400 })
    }
    if (typeof slug !== "string" || !slug) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 })
    }

    await deleteBlogPost(lang, slug)
    revalidateBlog(lang, [slug])

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
