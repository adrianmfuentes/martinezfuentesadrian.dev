import { PortScanner } from "../../../../components/port-scanner"
import { getDictionary } from "../../dictionaries"
import { pageMetadata } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang as "en" | "es")
  return pageMetadata({
    lang: lang as "en" | "es",
    path: "/tools/port-scanner",
    title: dictionary.portScanner.title,
    description: dictionary.portScanner.description,
  })
}

export default async function PortScannerPage({
  params,
}: {
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang as "en" | "es")

  return <PortScanner dictionary={dictionary.portScanner} />
}
