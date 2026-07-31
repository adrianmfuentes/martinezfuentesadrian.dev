import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'
import { getAllPosts } from '@/lib/blog'

type Route = {
  path: string
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}

const routes: Route[] = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/cv', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/portfolio', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.7 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/tools', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/tools/password-checker', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/tools/port-scanner', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/tools/http-headers-validator', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/tools/password-generator', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/tools/certificates-checker', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/tools/jwt-decoder', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/tools/dns-lookup', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/tools/hash-generator', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/tools/web-discovery', changeFrequency: 'monthly', priority: 0.5 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date()

  const staticEntries = routes.flatMap(({ path, changeFrequency, priority }) =>
    (['es', 'en'] as const).map((lang) => ({
      url: `${SITE_URL}/${lang}${path}`,
      lastModified: currentDate,
      changeFrequency,
      priority,
      alternates: {
        languages: {
          es: `${SITE_URL}/es${path}`,
          en: `${SITE_URL}/en${path}`,
        },
      },
    }))
  )

  const [esPosts, enPosts] = await Promise.all([getAllPosts('es'), getAllPosts('en')])
  const postEntries = [
    ...esPosts.map((post) => ({
      url: `${SITE_URL}/es/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...enPosts.map((post) => ({
      url: `${SITE_URL}/en/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]

  return [...staticEntries, ...postEntries]
}
