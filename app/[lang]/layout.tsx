import type React from "react"
import "./globals.css"
import { Inter, Poppins } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { locales } from "@/middleware"
import { getDictionary } from "./dictionaries"
import { AIChatWidget } from "@/components/ai-chat-widget"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
})

export const dynamicParams = false;

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({
  params
}: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as "en" | "es");
  // Retorna el objeto de metadata
  return {
    title: dict.metadata.title,
    description: dict.metadata.description,
    keywords: dict.metadata.keywords,
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
    <html lang={lang} className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <Navbar lang={lang} dictionary={dict.navigation} />
            <main className="flex-1">{children}</main>
            <Footer lang={lang} dictionary={dict.footer} />
	          <AIChatWidget
              dictionary={{
                chatTitle: lang === "en" ? "Virtual Assistant" : "Asistente Virtual",
                chatPlaceholder: lang === "en" ? "Type a message..." : "Escribe un mensaje...",
                chatSend: lang === "en" ? "Send" : "Enviar",
              }}
            />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
