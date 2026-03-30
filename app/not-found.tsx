import Link from "next/link"

// Global 404 — rendered by the root layout (no Navbar/Footer).
// Paths reaching here are outside the /[lang]/ segment (e.g. /unknown).
export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      <Link
        href="/es"
        className="absolute left-6 top-6 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        ← martinezfuentesadrian.dev
      </Link>

      <p
        aria-hidden
        className="select-none text-[9rem] font-black leading-none tracking-tighter text-foreground/10 sm:text-[13rem]"
      >
        404
      </p>

      <div className="-mt-10 space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Página no encontrada
        </h1>
        <p className="mx-auto max-w-sm text-muted-foreground">
          Esta página no existe o ha sido movida.
        </p>
      </div>

      <Link
        href="/es"
        className="rounded-lg bg-primary px-7 py-2.5 text-sm font-semibold text-primary-foreground ring-offset-background transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Ir al inicio
      </Link>
    </div>
  )
}
