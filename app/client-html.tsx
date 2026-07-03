"use client"

import { Inter, Poppins } from "next/font/google"
import { ThemeProvider } from "@components/theme-provider"
import { usePathname } from 'next/navigation'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
})

export default function ClientHtml({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const lang = pathname.startsWith('/es') ? 'es' : 'en'

  return (
    <html lang={lang} className="dark" suppressHydrationWarning>
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