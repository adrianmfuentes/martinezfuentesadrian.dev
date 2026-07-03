import { CertificatesChecker } from "../../../../components/certificates-checker"
import { getDictionary } from "../../dictionaries"

export default async function CertificatesCheckerPage({
  params,
}: {
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang as "en" | "es")

  return <CertificatesChecker dictionary={dictionary.certificatesChecker} />
}
