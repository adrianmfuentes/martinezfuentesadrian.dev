// Pure functions — safe to import in both server and client components.
// Centralizes the facts that change automatically with the calendar (age,
// current academic year, graduation status) so nothing needs to be edited
// by hand as time passes.

type Locale = "en" | "es"

const PROGRAM_START_DATE = "2022-09-01"
const PROGRAM_YEARS = 4
// TFG (SVAES) defended 2026-07-23, graded 10/10.
const GRADUATION_DATE = "2026-07-23"

function ordinalSuffix(year: number): string {
  if (year === 1) return "st"
  if (year === 2) return "nd"
  if (year === 3) return "rd"
  return "th"
}

function monthsBetween(startDate: string, endDate: Date): number {
  const start = new Date(startDate)
  return Math.max(0, (endDate.getFullYear() - start.getFullYear()) * 12 + (endDate.getMonth() - start.getMonth()))
}

export function getAge(birthDate: string, referenceDate: Date = new Date()): number {
  const birth = new Date(birthDate)
  let age = referenceDate.getFullYear() - birth.getFullYear()
  const monthDifference = referenceDate.getMonth() - birth.getMonth()

  if (monthDifference < 0 || (monthDifference === 0 && referenceDate.getDate() < birth.getDate())) {
    age--
  }

  return age
}

export function isGraduated(referenceDate: Date = new Date()): boolean {
  return referenceDate >= new Date(GRADUATION_DATE)
}

export function getCurrentYear(referenceDate: Date = new Date()): number {
  const totalMonths = monthsBetween(PROGRAM_START_DATE, referenceDate)
  return Math.min(Math.max(Math.floor(totalMonths / 12) + 1, 1), PROGRAM_YEARS)
}

export function computeYearsStudyingLabel(locale: Locale, referenceDate: Date = new Date()): string {
  const cappedDate = isGraduated(referenceDate) ? new Date(GRADUATION_DATE) : referenceDate
  const years = Math.max(1, Math.floor(monthsBetween(PROGRAM_START_DATE, cappedDate) / 12))
  return locale === "es" ? `+${years} años` : `+${years} years`
}

export function computeEducationPeriod(locale: Locale, referenceDate: Date = new Date()): string {
  const startYear = new Date(PROGRAM_START_DATE).getFullYear()

  if (isGraduated(referenceDate)) {
    return `${startYear} - ${new Date(GRADUATION_DATE).getFullYear()}`
  }

  return locale === "es" ? `${startYear} - Presente` : `${startYear} - Present`
}

export function computeDegreeStatusLabel(locale: Locale, referenceDate: Date = new Date()): string {
  if (isGraduated(referenceDate)) {
    return locale === "es" ? "Graduado en Ingeniería del Software" : "Software Engineering Graduate"
  }

  const year = getCurrentYear(referenceDate)

  if (locale === "es") return `Estudiante de ${year}º de Ingeniería del Software`

  return `${year}${ordinalSuffix(year)}-Year Software Engineering Student`
}
