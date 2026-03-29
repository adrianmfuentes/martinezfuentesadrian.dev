// Pure function — safe to import in both server and client components

export function computeExperienceLabel(startDate: string, locale: "en" | "es"): string {
  const start = new Date(startDate)
  const now = new Date()

  const totalMonths = Math.max(
    0,
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  )

  if (totalMonths === 0) return locale === "es" ? "< 1 mes" : "< 1 month"

  if (totalMonths < 12) {
    if (locale === "es") return `${totalMonths} ${totalMonths === 1 ? "mes" : "meses"}`
    return `${totalMonths} ${totalMonths === 1 ? "month" : "months"}`
  }

  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12

  if (locale === "es") {
    let label = `${years} ${years === 1 ? "año" : "años"}`
    if (months > 0) label += ` y ${months} ${months === 1 ? "mes" : "meses"}`
    return label
  }

  let label = `${years} ${years === 1 ? "year" : "years"}`
  if (months > 0) label += ` and ${months} ${months === 1 ? "month" : "months"}`
  return label
}
