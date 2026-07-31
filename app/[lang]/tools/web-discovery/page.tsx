import { WebDiscovery } from "../../../../components/web-discovery"
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
    path: "/tools/web-discovery",
    title: dictionary.webDiscovery.title,
    description: dictionary.webDiscovery.description,
  })
}

export default async function WebDiscoveryPage({
  params,
}: {
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang as "en" | "es")

  return <WebDiscovery dictionary={dictionary.webDiscovery} />
}
