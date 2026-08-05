/**
 * Shared metadata builder for per-page SEO (title, description, canonical,
 * hreflang alternates, Open Graph, Twitter cards).
 */
import type { Metadata } from 'next'

export const SITE_URL = 'https://amf.amfserver.duckdns.org'
export const SITE_NAME = 'Adrián Martínez Fuentes'

function ogImageUrl(title: string, description: string): string {
  const params = new URLSearchParams({
    title: title.slice(0, 120),
    subtitle: description.slice(0, 160),
  })
  return `/api/og?${params.toString()}`
}

type Lang = 'en' | 'es'

interface PageMetadataInput {
  lang: Lang
  /** Path without the /es or /en prefix, e.g. "/about". Use "" for the home page. */
  path: string
  title: string
  description: string
  keywords?: string
  type?: 'website' | 'article'
}

export function pageMetadata({
  lang,
  path,
  title,
  description,
  keywords,
  type = 'website',
}: PageMetadataInput): Metadata {
  const canonical = `/${lang}${path}`
  const fullTitle = `${title} · ${SITE_NAME}`
  const ogImage = ogImageUrl(title, description)

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
      languages: {
        es: `/es${path}`,
        en: `/en${path}`,
        'x-default': `/es${path}`,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: lang === 'es' ? 'es_ES' : 'en_US',
      alternateLocale: lang === 'es' ? 'en_US' : 'es_ES',
      type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
  }
}
