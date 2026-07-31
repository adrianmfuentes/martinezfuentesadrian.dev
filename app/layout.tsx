import type { Metadata } from 'next'
import './globals.css'
import { Inter, Poppins } from "next/font/google"
import { headers } from "next/headers"
import { ThemeProvider } from "@components/theme-provider"
import { SITE_URL, SITE_NAME } from "@/lib/seo"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: 'Adrián Martínez Fuentes - Desarrollador Full Stack',
  description: 'Portafolio personal de Adrián Martínez Fuentes, desarrollador web con experiencia en Next.js, React y herramientas de ciberseguridad.',
  keywords: 'desarrollador, full stack, Next.js, React, portafolio',
  authors: [{ name: 'Adrián Martínez Fuentes' }],
  openGraph: {
    title: 'Adrián Martínez Fuentes - Portafolio',
    description: 'Explora mi trabajo en desarrollo web y herramientas útiles.',
    url: 'https://amf.amfserver.duckdns.org',
    siteName: 'Adrián Martínez Fuentes',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adrián Martínez Fuentes',
    description: 'Desarrollador Full Stack y creador de herramientas web.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: SITE_NAME,
      url: SITE_URL,
      jobTitle: 'Full Stack Developer',
      image: `${SITE_URL}/images/me.jpeg`,
      sameAs: [
        'https://www.linkedin.com/in/adrianmfuentese',
        'https://github.com/adrianmfuentes',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { '@id': `${SITE_URL}/#person` },
      inLanguage: ['es-ES', 'en-US'],
    },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const requestHeaders = await headers()
  const lang = requestHeaders.get('x-locale') === 'en' ? 'en' : 'es'

  return (
    <html lang={lang} className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
