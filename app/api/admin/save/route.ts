import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySessionToken, ADMIN_COOKIE } from "@/lib/admin-auth"
import { setContentOverride, setExperienceCounter, ContentSection, CMS_CONTENT_TAG } from "@/lib/kv"
import { revalidatePath, revalidateTag } from "next/cache"

async function verifyRequest(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  return !!token && (await verifySessionToken(token))
}

export async function POST(request: Request) {
  if (!(await verifyRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { type } = body

    if (type === "counter") {
      await setExperienceCounter(body.data)
      revalidateTag(CMS_CONTENT_TAG, { expire: 0 })
      revalidatePath("/es/about", "page")
      revalidatePath("/en/about", "page")
    } else if (type === "content") {
      const { lang, section, data } = body as {
        lang: string
        section: ContentSection
        data: unknown
      }
      await setContentOverride(lang, section, data)
      revalidateTag(CMS_CONTENT_TAG, { expire: 0 })
      revalidatePath(`/${lang}/cv`, "page")
      revalidatePath(`/${lang}/about`, "page")
    } else {
      return NextResponse.json({ error: "Unknown type" }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Save failed" }, { status: 500 })
  }
}
