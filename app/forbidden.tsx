// Rendered when forbidden() is called from a server component.
// Requires experimental.authInterrupts: true in next.config.js (already enabled).
import Link from "next/link"

export default function Forbidden() {
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
        403
      </p>

      <div className="-mt-10 space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Acceso denegado
        </h1>
        <p className="mx-auto max-w-sm text-muted-foreground">
          No tienes permiso para acceder a esta página.
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
