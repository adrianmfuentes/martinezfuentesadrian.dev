import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifySessionToken, ADMIN_COOKIE } from "@/lib/admin-auth"
import { LoginForm } from "./login-form"

export default async function LoginPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  if (token && (await verifySessionToken(token))) {
    redirect("/admin")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <LoginForm />
    </div>
  )
}
