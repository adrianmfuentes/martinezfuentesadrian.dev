import type { Metadata } from 'next'
import './globals.css'
import ClientHtml from './client-html'

export const metadata: Metadata = {
  title: 'Adrián Martínez Fuentes - Desarrollador Full Stack',
  description: 'Portafolio personal de Adrián Martínez Fuentes, desarrollador web con experiencia en Next.js, React y herramientas de ciberseguridad.',
  keywords: 'desarrollador, full stack, Next.js, React, portafolio',
  authors: [{ name: 'Adrián Martínez Fuentes' }],
  openGraph: {
    title: 'Adrián Martínez Fuentes - Portafolio',
    description: 'Explora mi trabajo en desarrollo web y herramientas útiles.',
    url: 'https://martinezfuentesadrian.dev',
    siteName: 'martinezfuentesadrian.dev',
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
    <ClientHtml>
      {children}
    </ClientHtml>
  );
}