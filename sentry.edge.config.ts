import * as Sentry from "@sentry/nextjs"

// A no-op until SENTRY_DSN is set. Covers middleware.ts and any edge routes.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  tracesSampleRate: 0.1,
})
