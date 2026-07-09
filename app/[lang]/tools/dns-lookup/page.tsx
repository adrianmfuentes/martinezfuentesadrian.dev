import { DnsLookup } from "../../../../components/dns-lookup"
import { getDictionary } from "../../dictionaries"

export default async function DnsLookupPage({
  params,
}: {
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang as "en" | "es")

  return <DnsLookup dictionary={dictionary.dnsLookup} />
}
