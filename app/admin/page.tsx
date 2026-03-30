import { cookies } from "next/headers"
import { forbidden } from "next/navigation"
import { getDictionary } from "@/app/[lang]/dictionaries"
import { getExperienceCounter } from "@/lib/kv"
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth"
import { DashboardClient } from "./dashboard-client"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value ?? ""
  if (!(await verifySessionToken(token))) forbidden()
  const [dictEn, dictEs, counter] = await Promise.all([
    getDictionary("en"),
    getDictionary("es"),
    getExperienceCounter(),
  ])

  const initialData = {
    counter,
    en: { cv: (dictEn as any).cv },
    es: { cv: (dictEs as any).cv },
  }

  return <DashboardClient initialData={initialData} />
}
