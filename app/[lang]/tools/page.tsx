import { getDictionary } from "../dictionaries"
import { ToolsSection } from "../../../components/tools-section"
import { pageMetadata } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  readonly params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as "en" | "es")
  return pageMetadata({
    lang: lang as "en" | "es",
    path: "/tools",
    title: dict.tools.title,
    description: dict.tools.description,
  })
}

export default async function ToolsPage({
  params,
}: {
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as "en" | "es")

  return (
    <div className="min-h-screen pt-20">
      <ToolsSection dictionary={dict.tools} />
    </div>
  )
}
