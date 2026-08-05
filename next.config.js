const path = require('path')
const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  // Self-contained server bundle for the Docker image (see Dockerfile)
  output: 'standalone',
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  // Remove the X-Powered-By: Next.js header (minor security + removes one header)
  poweredByHeader: false,

  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    // Required to use the forbidden() function in server components
    authInterrupts: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/es',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        // Long-lived cache for immutable public images
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // PDFs may be updated; cache for 1 day, serve stale for 7 days while revalidating
        source: "/cv/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        // Configuración CORS para todas las rutas de API
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NODE_ENV === "production"
              ? "https://amf.amfserver.duckdns.org"
              : "http://localhost:3000"
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS"
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Requested-With"
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true"
          }
        ]
      },
      {
        // Configuración de seguridad general
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload"
          },
          // Content-Security-Policy is set in middleware.ts instead of here,
          // since it needs a fresh per-request nonce for script-src.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()"
          }
        ]
      }
    ]
  },
  webpack(config) {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@components": path.resolve(process.cwd(), "components"),
      "@components/*": path.resolve(process.cwd(), "components"),
      "@": path.resolve(process.cwd()),
      "@/components": path.resolve(process.cwd(), "components"),
    }
    return config
  },
}

// A no-op wrapper until SENTRY_AUTH_TOKEN is set (source map upload is skipped
// without it) — same opt-in posture as the sentry.*.config.ts files.
module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  disableLogger: true,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  automaticVercelMonitors: false,
  telemetry: false,
})