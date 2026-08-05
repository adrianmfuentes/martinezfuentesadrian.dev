import Link from "next/link"
import { ArrowLeft, Activity, Users } from "lucide-react"
import { getDictionary } from "../../dictionaries"
import { getToolUsageCounts, getVisitCount } from "@/lib/kv"
import { pageMetadata } from "@/lib/seo"

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  readonly params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as "en" | "es")
  return pageMetadata({
    lang: lang as "en" | "es",
    path: "/tools/stats",
    title: dict.toolsStats.title,
    description: dict.toolsStats.subtitle,
  })
}

export default async function ToolsStatsPage({
  params,
}: {
  readonly params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as "en" | "es")

  const [usage, visits] = await Promise.all([getToolUsageCounts(), getVisitCount()])

  const nameById = new Map(dict.tools.items.map((item) => [item.id, item.name]))
  const rows = Object.entries(usage)
    .map(([id, count]) => ({ id, name: nameById.get(id) ?? id, count }))
    .sort((a, b) => b.count - a.count)

  const maxCount = rows.length > 0 ? rows[0].count : 0
  const totalRuns = rows.reduce((sum, row) => sum + row.count, 0)

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="container mx-auto max-w-2xl">
        <Link
          href={`/${lang}/tools`}
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {dict.toolsStats.backToTools}
        </Link>

        <h1 className="text-3xl font-bold font-poppins mb-2">{dict.toolsStats.title}</h1>
        <p className="text-foreground/70 mb-10">{dict.toolsStats.subtitle}</p>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="rounded-lg border border-border p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-2xl font-semibold tabular-nums">{visits ?? "—"}</p>
              <p className="text-xs text-foreground/60">{dict.toolsStats.totalVisits}</p>
            </div>
          </div>
          <div className="rounded-lg border border-border p-4 flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-2xl font-semibold tabular-nums">{totalRuns}</p>
              <p className="text-xs text-foreground/60">{dict.toolsStats.totalRuns}</p>
            </div>
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="text-center text-foreground/60">{dict.toolsStats.noData}</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => (
              <li key={row.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">{row.name}</span>
                  <span className="text-foreground/60 tabular-nums">{row.count}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${maxCount > 0 ? (row.count / maxCount) * 100 : 0}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
