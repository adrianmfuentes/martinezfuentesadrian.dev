import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getDictionary } from "../../dictionaries"
import { pageMetadata, SITE_URL } from "@/lib/seo"

export const revalidate = 86400

interface EndpointDoc {
  toolId: string
  method: "GET" | "POST"
  path: string
  rateLimit: string
  params: string
  curl: string
}

const ENDPOINTS: EndpointDoc[] = [
  {
    toolId: "dns-lookup",
    method: "POST",
    path: "/api/dns-lookup",
    rateLimit: "20 req/hour per IP",
    params: '{ "domain": string }',
    curl: `curl -X POST ${SITE_URL}/api/dns-lookup \\\n  -H "Content-Type: application/json" \\\n  -d '{"domain":"example.com"}'`,
  },
  {
    toolId: "certificates-checker",
    method: "POST",
    path: "/api/certificate-check",
    rateLimit: "20 req/hour per IP",
    params: '{ "host": string, "port": number }',
    curl: `curl -X POST ${SITE_URL}/api/certificate-check \\\n  -H "Content-Type: application/json" \\\n  -d '{"host":"example.com","port":443}'`,
  },
  {
    toolId: "port-scanner",
    method: "POST",
    path: "/api/port-scan",
    rateLimit: "20 req/hour per IP",
    params: '{ "host": string, "ports": number[] } (max 100 ports)',
    curl: `curl -X POST ${SITE_URL}/api/port-scan \\\n  -H "Content-Type: application/json" \\\n  -d '{"host":"example.com","ports":[80,443]}'`,
  },
  {
    toolId: "http-headers-validator",
    method: "GET",
    path: "/api/validate-headers",
    rateLimit: "unauthenticated, best-effort",
    params: "?url=https://example.com",
    curl: `curl "${SITE_URL}/api/validate-headers?url=https://example.com"`,
  },
  {
    toolId: "web-discovery",
    method: "GET",
    path: "/api/web-discovery",
    rateLimit: "10 req/hour per IP",
    params: "?baseUrl=https://example.com&path=/",
    curl: `curl "${SITE_URL}/api/web-discovery?baseUrl=https://example.com&path=/"`,
  },
  {
    toolId: "password-checker",
    method: "POST",
    path: "/api/check-password",
    rateLimit: "unauthenticated, best-effort",
    params: '{ "password": string }',
    curl: `curl -X POST ${SITE_URL}/api/check-password \\\n  -H "Content-Type: application/json" \\\n  -d '{"password":"correcthorsebatterystaple"}'`,
  },
]

export async function generateMetadata({
  params,
}: {
  readonly params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as "en" | "es")
  return pageMetadata({
    lang: lang as "en" | "es",
    path: "/tools/api",
    title: dict.toolsApi.title,
    description: dict.toolsApi.subtitle,
  })
}

export default async function ToolsApiPage({
  params,
}: {
  readonly params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as "en" | "es")
  const nameById = new Map(dict.tools.items.map((item) => [item.id, item]))

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="container mx-auto max-w-3xl">
        <Link
          href={`/${lang}/tools`}
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {dict.toolsApi.backToTools}
        </Link>

        <h1 className="text-3xl font-bold font-poppins mb-2">{dict.toolsApi.title}</h1>
        <p className="text-foreground/70 mb-10">{dict.toolsApi.subtitle}</p>

        <div className="space-y-8">
          {ENDPOINTS.map((endpoint) => {
            const tool = nameById.get(endpoint.toolId)
            return (
              <div key={endpoint.toolId} className="rounded-lg border border-border p-5">
                <h2 className="text-lg font-semibold mb-1">{tool?.name ?? endpoint.toolId}</h2>
                {tool?.description && <p className="text-sm text-foreground/70 mb-4">{tool.description}</p>}

                <dl className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm mb-4">
                  <dt className="font-medium text-foreground/60">{dict.toolsApi.endpointLabel}</dt>
                  <dd className="font-mono">
                    <span className="text-primary">{endpoint.method}</span> {endpoint.path}
                  </dd>
                  <dt className="font-medium text-foreground/60">{dict.toolsApi.parametersLabel}</dt>
                  <dd className="font-mono break-all">{endpoint.params}</dd>
                  <dt className="font-medium text-foreground/60">{dict.toolsApi.rateLimitLabel}</dt>
                  <dd>{endpoint.rateLimit}</dd>
                </dl>

                <p className="text-xs font-medium text-foreground/60 mb-1.5">{dict.toolsApi.exampleLabel}</p>
                <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{endpoint.curl}</code></pre>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
