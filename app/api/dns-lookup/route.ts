import { NextRequest, NextResponse } from 'next/server'
import dns from 'node:dns/promises'
import { z } from 'zod'
import { isBlockedHost } from '@/lib/ssrf-guard'
import { getClientIp } from '@/lib/get-client-ip'
import { rateLimit } from '@/lib/rate-limit'

const dnsLookupSchema = z.object({
  domain: z.string().min(1).max(253),
})

const RECORD_TYPES = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME'] as const
type RecordType = (typeof RECORD_TYPES)[number]

const limiter = rateLimit({
  interval: 60 * 60 * 1000,
  uniqueTokenPerInterval: 500,
  limit: 20,
})

async function resolveRecord(domain: string, type: RecordType) {
  try {
    switch (type) {
      case 'A':
        return await dns.resolve4(domain)
      case 'AAAA':
        return await dns.resolve6(domain)
      case 'MX':
        return await dns.resolveMx(domain)
      case 'TXT':
        return (await dns.resolveTxt(domain)).map((chunks) => chunks.join(''))
      case 'NS':
        return await dns.resolveNs(domain)
      case 'CNAME':
        return await dns.resolveCname(domain)
    }
  } catch {
    return [] // No records of this type (or lookup failed) — not a fatal error for the whole request
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = await getClientIp()
    try {
      await limiter.check(ip)
    } catch {
      return NextResponse.json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const body = await request.json()
    const { domain } = dnsLookupSchema.parse(body)
    const normalizedDomain = domain.trim().toLowerCase()

    if (await isBlockedHost(normalizedDomain)) {
      return NextResponse.json({ success: false, error: 'Host not allowed' }, { status: 400 })
    }

    const entries = await Promise.all(
      RECORD_TYPES.map(async (type) => [type, await resolveRecord(normalizedDomain, type)] as const)
    )

    const records = Object.fromEntries(entries) as Record<RecordType, unknown[]>

    return NextResponse.json({ success: true, domain: normalizedDomain, records })
  } catch (error) {
    console.error('Error during DNS lookup:', error)
    return NextResponse.json({ success: false, error: 'Lookup failed' }, { status: 500 })
  }
}
