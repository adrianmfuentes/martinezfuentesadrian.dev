"use client"

import { useParams } from "next/navigation"
import { Download, Printer } from "lucide-react"
import { Button } from "@components/ui/button"

const LABELS = {
  en: { json: "Export JSON", pdf: "Export PDF" },
  es: { json: "Exportar JSON", pdf: "Exportar PDF" },
} as const

interface ExportResultButtonsProps {
  data: unknown
  filename: string
}

// Reused across the security tools' result panels. JSON export is a plain
// client-side blob download; "PDF" is the browser's own print-to-PDF, scoped
// to the result by the @media print rules in globals.css (nav/footer hidden).
export function ExportResultButtons({ data, filename }: Readonly<ExportResultButtonsProps>) {
  const params = useParams()
  const lang = params?.lang === "es" ? "es" : "en"
  const labels = LABELS[lang]

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="no-print flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" onClick={downloadJson}>
        <Download className="h-4 w-4 mr-1.5" />
        {labels.json}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="h-4 w-4 mr-1.5" />
        {labels.pdf}
      </Button>
    </div>
  )
}
