import path from 'path'

let userConfig
try {
  // try to import ESM first
  userConfig = await import('./v0-user-next.config.mjs')
} catch (e) { // NOSONAR
  try {
    // fallback to CJS import
    userConfig = await import("./v0-user-next.config");
  } catch (innerError) {  // NOSONAR
    // no user config found, proceed without it
    console.warn("No user next.config file found, proceeding with default configuration.");
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  async headers() {
    return [
      {
        // Configuración CORS para todas las rutas de API
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NODE_ENV === "production" 
              ? "https://martinezfuentesadrian.dev" 
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
            key: "X-XSS-Protection",
            value: "1; mode=block"
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload"
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.emailjs.com https://vercel.live https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.emailjs.com https://vitals.vercel-insights.com https://vercel.live wss://ws-us3.pusher.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';"
          },
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

if (userConfig) {
  // ESM imports will have a "default" property
  const config = userConfig.default || userConfig

  for (const key in config) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key],
      }
    } else {
      nextConfig[key] = config[key]
    }
  }
}

export default nextConfig
