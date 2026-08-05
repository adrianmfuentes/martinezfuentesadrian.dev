import * as Sentry from "@sentry/nextjs"

// A no-op until NEXT_PUBLIC_SENTRY_DSN is set — self-hosted deploy, so this
// stays fully opt-in rather than assuming a Sentry account exists.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  tracesSampleRate: 0.1,
})
