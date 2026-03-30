"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const dict = {
  en: {
    code: "500",
    title: "Something went wrong",
    description: "An unexpected error occurred. You can try again or return home.",
    retry: "Try again",
    home: "Return home",
  },
  es: {
    code: "500",
    title: "Algo salió mal",
    description: "Ocurrió un error inesperado. Puedes intentarlo de nuevo o volver al inicio.",
    retry: "Intentar de nuevo",
    home: "Volver al inicio",
  },
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const pathname = usePathname() ?? ""
  const lang: "en" | "es" = pathname.startsWith("/en") ? "en" : "es"
  const t = dict[lang]

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section className="flex min-h-[72vh] flex-col items-center justify-center gap-8 px-4 text-center">
      <p
        aria-hidden
        className="select-none text-[9rem] font-black leading-none tracking-tighter text-foreground/10 sm:text-[13rem]"
      >
        {t.code}
      </p>
      <div className="-mt-10 space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.title}</h1>
        <p className="mx-auto max-w-sm text-muted-foreground">{t.description}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-7 py-2.5 text-sm font-semibold text-primary-foreground ring-offset-background transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {t.retry}
        </button>
        <Link
          href={`/${lang}`}
          className="rounded-lg border border-input bg-background px-7 py-2.5 text-sm font-semibold ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {t.home}
        </Link>
      </div>
    </section>
  )
}
