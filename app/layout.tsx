import type { Metadata } from 'next'
import './globals.css'
import { Inter, Poppins } from "next/font/google"
import { ThemeProvider } from "@components/theme-provider"

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
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
