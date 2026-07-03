import { PortScanner } from "../../../../components/port-scanner"
import { getDictionary } from "../../dictionaries"

export default async function PortScannerPage({
  params,
}: {
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang as "en" | "es")

  return <PortScanner dictionary={dictionary.portScanner} />
}
