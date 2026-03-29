import { getDictionary } from "@/app/[lang]/dictionaries"
import { getExperienceCounter } from "@/lib/kv"
import { DashboardClient } from "./dashboard-client"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
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
