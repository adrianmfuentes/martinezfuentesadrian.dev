import { getDictionary } from "../dictionaries"
import { ToolsSection } from "../../../components/tools-section"

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
