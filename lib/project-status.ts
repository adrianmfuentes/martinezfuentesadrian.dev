export type ProjectStatus = "online" | "offline"

const TIMEOUT_MS = 4000
const REVALIDATE_SECONDS = 900

async function checkUrl(url: string): Promise<ProjectStatus> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    // GET (not HEAD) so Next's Data Cache can store the result and revalidate the
    // page on the same ISR schedule instead of forcing it fully dynamic.
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      next: { revalidate: REVALIDATE_SECONDS },
      signal: controller.signal,
    })
    return res.ok ? "online" : "offline"
  } catch {
    return "offline"
  } finally {
    clearTimeout(timeoutId)
  }
}

// Runs at page render/ISR-revalidation time against a fixed, hardcoded set of URLs
// (the site's own demo deployments) — never user-supplied, so no SSRF exposure.
export async function getProjectStatuses(urls: readonly string[]): Promise<Record<string, ProjectStatus>> {
  const uniqueUrls = Array.from(new Set(urls.filter(Boolean)))
  const entries = await Promise.all(uniqueUrls.map(async (url) => [url, await checkUrl(url)] as const))
  return Object.fromEntries(entries)
}
