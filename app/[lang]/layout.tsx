import type React from "react"
import { Navbar } from "@components/NavBar"
import { Footer } from "@components/Footer"
import { getDictionary } from "./dictionaries"
import { AIChatWidgetLoader } from "@components/ai-chat-widget-loader"
import { Toaster } from "@components/ui/toaster"

const locales = ["en", "es"]

export const dynamicParams = false;

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

// ...existing code...
export async function generateMetadata({
  params
}: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as "en" | "es");
  
  return {
    title: dict.metadata.title,
    description: dict.metadata.description,
    keywords: dict.metadata.keywords,
    metadataBase: new URL('https://amf.amfserver.duckdns.org'),
    openGraph: {
      title: dict.metadata.title,
      description: dict.metadata.description,
      type: 'website',
      locale: lang === 'es' ? 'es_ES' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.metadata.title,
      description: dict.metadata.description,
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/favicon.ico',
    }
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const dict = await getDictionary(lang as "en" | "es");
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar lang={lang} dictionary={dict.navigation} />
      <main className="flex-1">{children}</main>
      <Footer lang={lang} dictionary={dict.footer} />
      <AIChatWidgetLoader
        dictionary={{
          chatTitle: dict.chat.title,
          chatPlaceholder: dict.chat.placeholder,
          chatSend: dict.chat.send,
        }}
      />
      <Toaster />
    </div>
  );
}
