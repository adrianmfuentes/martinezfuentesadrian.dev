import type React from "react"
import { Navbar } from "@components/NavBar"
import { Footer } from "@components/Footer"
import { getDictionary } from "./dictionaries"
import { AIChatWidgetLoader } from "@components/ai-chat-widget-loader"
import { KonamiCode } from "@components/konami-code"
import { Toaster } from "@components/ui/toaster"
import { pageMetadata, SITE_URL, SITE_NAME } from "@/lib/seo"
import { MotionConfigProvider } from "@components/motion-config-provider"

const locales = ["en", "es"]

export const dynamicParams = false;

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({
  params
}: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as "en" | "es");

  const base = pageMetadata({
    lang: lang as "en" | "es",
    path: "",
    title: dict.metadata.title,
    description: dict.metadata.description,
    keywords: dict.metadata.keywords,
  })

  return {
    ...base,
    title: {
      template: `%s · ${SITE_NAME}`,
      default: dict.metadata.title,
    },
    metadataBase: new URL(SITE_URL),
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/favicon.ico',
    },
    // Search-engine ownership verification (Search Console / Bing Webmaster
    // Tools "HTML tag" method). The Google token isn't a secret — it's meant
    // to sit in public page source — so it ships as a hardcoded fallback and
    // can still be overridden per-deployment via env var if it ever changes.
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? '5bdBtbVVlDdQ6JUwkWaJCmlyhbeLnKbCT499wtb3DRs',
      other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
        ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
        : undefined,
    },
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
    <MotionConfigProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar lang={lang} dictionary={dict.navigation} commandDictionary={dict.commandPalette} />
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
        <KonamiCode dictionary={dict.konami} lang={lang} />
      </div>
    </MotionConfigProvider>
  );
}
