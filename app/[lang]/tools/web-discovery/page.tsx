import { WebDiscovery } from "../../../../components/web-discovery"
import { getDictionary } from "../../dictionaries"

export default async function WebDiscoveryPage({
  params,
}: {
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang as "en" | "es")

  return <WebDiscovery dictionary={dictionary.webDiscovery} />
}
