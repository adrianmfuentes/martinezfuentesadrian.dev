import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
}

// ThemeProvider + fonts are inherited from app/client-html.tsx (root layout)
// This layout strips out the portfolio Navbar/Footer/AIChatWidget
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
