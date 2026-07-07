import { NextRequest, NextResponse } from 'next/server'
import { Socket } from 'node:net'
import { z } from 'zod'
import { isBlockedHost } from '@/lib/ssrf-guard'
import { getClientIp } from '@/lib/get-client-ip'
import { rateLimit } from '@/lib/rate-limit'

const portScanSchema = z.object({
  host: z.string().min(1).max(253), // Validar host
  ports: z.array(z.number().int().min(1).max(65535)).min(1).max(100), // Máximo 100 puertos
})

// Opens raw TCP sockets to attacker-supplied hosts — throttle harder than a typical API route.
const limiter = rateLimit({
  interval: 60 * 60 * 1000,
  uniqueTokenPerInterval: 500,
  limit: 20,
})

export async function POST(request: NextRequest) {
  try {
    const ip = await getClientIp()
    try {
      await limiter.check(ip)
    } catch {
      return NextResponse.json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const body = await request.json()
    const { host, ports } = portScanSchema.parse(body)

    if (await isBlockedHost(host)) {
      return NextResponse.json({ success: false, error: 'Host not allowed' }, { status: 400 })
    }

    const results = await Promise.all(
      ports.map(async (port: number) => {
        return new Promise((resolve) => {
          const socket = new Socket()
          socket.setTimeout(3000)

          socket.on('connect', () => {
            socket.destroy()
            resolve({ port, isOpen: true, status: 'open' })
          })

          socket.on('timeout', () => {
            socket.destroy()
            resolve({ port, isOpen: false, status: 'closed' })
          })

          socket.on('error', () => {
            resolve({ port, isOpen: false, status: 'closed' })
          })

          socket.connect(port, host)
        })
      })
    )

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error("Error during port scan:", error)
    return NextResponse.json({ success: false, error: 'Scan failed' }, { status: 500 })
  }
}
