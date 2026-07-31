import { CertificatesChecker } from "../../../../components/certificates-checker"
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
    path: "/tools/certificates-checker",
    title: dictionary.certificatesChecker.title,
    description: dictionary.certificatesChecker.description,
  })
}

export default async function CertificatesCheckerPage({
  params,
}: {
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang as "en" | "es")

  return <CertificatesChecker dictionary={dictionary.certificatesChecker} />
}
