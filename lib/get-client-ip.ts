import "server-only"
import { headers } from "next/headers"

// Only trustworthy behind the Nginx Proxy Manager reverse proxy this app is deployed behind,
// which always sets x-forwarded-for/x-real-ip and isn't reachable directly by clients.
export async function getClientIp(): Promise<string> {
  const headerList = await headers()
  const forwardedFor = headerList.get("x-forwarded-for")
  if (forwardedFor) return forwardedFor.split(",")[0].trim()
  return headerList.get("x-real-ip") ?? "unknown"
}
