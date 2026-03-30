"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const dict = {
  en: {
    code: "404",
    title: "Page not found",
    description: "The page you're looking for doesn't exist or has been moved.",
    cta: "Return home",
  },
  es: {
    code: "404",
    title: "Página no encontrada",
    description: "La página que buscas no existe o ha sido movida.",
    cta: "Volver al inicio",
  },
}

export default function NotFound() {
  const pathname = usePathname() ?? ""
  const lang: "en" | "es" = pathname.startsWith("/en") ? "en" : "es"
  const t = dict[lang]

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
      <Link
        href={`/${lang}`}
        className="rounded-lg bg-primary px-7 py-2.5 text-sm font-semibold text-primary-foreground ring-offset-background transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {t.cta}
      </Link>
    </section>
  )
}
