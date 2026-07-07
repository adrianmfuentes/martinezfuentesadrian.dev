import dns from "node:dns/promises"
import net from "node:net"

// These "network tools" (port scanner, cert checker, web discovery) accept an
// arbitrary host/URL from any unauthenticated visitor and connect to it from
// the server. Without this guard they'd let anyone probe the Docker network
// this app runs in (other containers, Portainer, Nginx Proxy Manager) or
// cloud metadata endpoints. Block loopback/private/link-local/metadata targets.
const BLOCKED_HOSTNAMES = new Set(["localhost", "metadata.google.internal"])

function isBlockedIp(ip: string): boolean {
  const family = net.isIP(ip)
  if (family === 4) {
    const parts = ip.split(".").map(Number)
    const [a, b] = parts
    if (a === 127) return true // loopback
    if (a === 10) return true // private
    if (a === 172 && b >= 16 && b <= 31) return true // private
    if (a === 192 && b === 168) return true // private
    if (a === 169 && b === 254) return true // link-local + cloud metadata (169.254.169.254)
    if (a === 0) return true // "this network"
    return false
  }
  if (family === 6) {
    const normalized = ip.toLowerCase()
    if (normalized === "::1") return true // loopback
    if (normalized.startsWith("::ffff:")) return isBlockedIp(normalized.slice(7)) // IPv4-mapped
    if (normalized.startsWith("fe80:")) return true // link-local
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true // unique local (fc00::/7)
    return false
  }
  return true // not a parseable IP — treat as unsafe
}

/**
 * Resolves `host` and reports whether it (or any of its resolved addresses)
 * points at a loopback/private/link-local/metadata address. Resolving here
 * (rather than trusting the hostname alone) blocks the common case of
 * attacker-controlled DNS pointing a public-looking name at an internal IP.
 */
export async function isBlockedHost(host: string): Promise<boolean> {
  const hostname = host.toLowerCase().replace(/^\[|]$/g, "")
  if (BLOCKED_HOSTNAMES.has(hostname)) return true

  if (net.isIP(hostname)) return isBlockedIp(hostname)

  try {
    const results = await dns.lookup(hostname, { all: true })
    return results.some((r) => isBlockedIp(r.address))
  } catch {
    return true // unresolvable host — refuse rather than risk it
  }
}
