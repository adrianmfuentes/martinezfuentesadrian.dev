import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySessionToken, ADMIN_COOKIE } from "@/lib/admin-auth"
import { getPostDraft } from "@/lib/blog"

async function verifyRequest(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  return !!token && (await verifySessionToken(token))
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await verifyRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slug } = await params
  const { searchParams } = new URL(request.url)
  const lang = searchParams.get("lang")
  if (lang !== "en" && lang !== "es") {
    return NextResponse.json({ error: "Invalid lang" }, { status: 400 })
  }

  const draft = await getPostDraft(lang, slug)
  if (!draft) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ slug, ...draft })
}
