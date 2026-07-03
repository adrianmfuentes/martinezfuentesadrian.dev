// Pure function — safe to import in both server and client components

type Locale = "en" | "es"

const UNITS: Record<Locale, { month: [string, string]; year: [string, string]; lessThanMonth: string; and: string }> = {
  en: { month: ["month", "months"], year: ["year", "years"], lessThanMonth: "< 1 month", and: "and" },
  es: { month: ["mes", "meses"], year: ["año", "años"], lessThanMonth: "< 1 mes", and: "y" },
}

function pluralize(count: number, [singular, plural]: [string, string]): string {
  return `${count} ${count === 1 ? singular : plural}`
}

function getTotalMonths(startDate: string): number {
  const start = new Date(startDate)
  const now = new Date()
  return Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()))
}

export function computeExperienceLabel(startDate: string, locale: Locale): string {
  const totalMonths = getTotalMonths(startDate)
  const labels = UNITS[locale]

  if (totalMonths === 0) return labels.lessThanMonth
  if (totalMonths < 12) return pluralize(totalMonths, labels.month)

  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  const yearsLabel = pluralize(years, labels.year)

  return months > 0 ? `${yearsLabel} ${labels.and} ${pluralize(months, labels.month)}` : yearsLabel
}
