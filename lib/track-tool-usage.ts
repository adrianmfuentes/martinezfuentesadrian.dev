// Fire-and-forget usage ping for client-only tools (no server round trip for
// their actual work), so they still show up on the public /tools/stats page.
export function trackToolUsage(tool: string): void {
  if (typeof window === "undefined") return
  fetch("/api/tool-usage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tool }),
    keepalive: true,
  }).catch(() => {})
}
