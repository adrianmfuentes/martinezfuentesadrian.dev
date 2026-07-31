import { DnsLookup } from "../../../../components/dns-lookup"
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
    path: "/tools/dns-lookup",
    title: dictionary.dnsLookup.title,
    description: dictionary.dnsLookup.description,
  })
}

export default async function DnsLookupPage({
  params,
}: {
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang as "en" | "es")

  return <DnsLookup dictionary={dictionary.dnsLookup} />
}
