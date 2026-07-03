/**
 * Utility functions for handling environment-specific URLs and configurations
 */

/**
 * Get the base URL for the application
 * Uses environment variables to determine the correct URL
 */
export function getBaseUrl(): string {
  // Check if we're in browser environment
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // Check for custom app URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // Check for site URL (fallback)
  if (process.env.SITE_URL) {
    return process.env.SITE_URL
  }

  // Default to localhost for development
  return 'http://localhost:3000'
}

/**
 * Get the API base URL
 */
export function getApiUrl(): string {
  return `${getBaseUrl()}/api`
}

/**
 * Check if we're in production environment
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Check if we're in development environment
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Get CORS allowed origins based on environment
 */
export function getCorsOrigins(): string[] {
  if (isProduction()) {
    return [
      'https://martinezfuentesadrian.dev',
      'https://www.martinezfuentesadrian.dev'
    ]
  }
  
  return [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ]
}

/**
 * Build absolute URL for API endpoints
 */
export function buildApiUrl(endpoint: string): string {
  const baseUrl = getApiUrl()
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${baseUrl}${normalizedEndpoint}`
}

/**
 * Build absolute URL for pages
 */
export function buildPageUrl(path: string): string {
  const baseUrl = getBaseUrl()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}
