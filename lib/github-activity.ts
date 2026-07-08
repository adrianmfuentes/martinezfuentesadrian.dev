const GITHUB_USERNAME = "adrianmfuentes"
const MAX_ITEMS = 6

export type GithubEventType =
  | "PushEvent"
  | "CreateEvent"
  | "PullRequestEvent"
  | "IssuesEvent"
  | "WatchEvent"
  | "ForkEvent"
  | "ReleaseEvent"

const SUPPORTED_TYPES = new Set<string>([
  "PushEvent",
  "CreateEvent",
  "PullRequestEvent",
  "IssuesEvent",
  "WatchEvent",
  "ForkEvent",
  "ReleaseEvent",
])

export interface GithubActivityItem {
  id: string
  type: GithubEventType
  repo: string
  repoUrl: string
  createdAt: string
  commitCount?: number
  action?: string
  refType?: string
}

interface GithubApiEvent {
  id: string
  type: string
  created_at: string
  repo?: { name?: string }
  payload?: {
    commits?: unknown[]
    action?: string
    ref_type?: string
  }
}

export async function getGithubActivity(): Promise<GithubActivityItem[]> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "portfolio-site",
    }
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    }

    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=20`, {
      headers,
      next: { revalidate: 3600 },
    })

    if (!res.ok) return []
    const events: GithubApiEvent[] = await res.json()
    if (!Array.isArray(events)) return []

    return events
      .filter((event): event is GithubApiEvent & { type: GithubEventType } => SUPPORTED_TYPES.has(event.type))
      .slice(0, MAX_ITEMS)
      .map((event) => ({
        id: event.id,
        type: event.type,
        repo: event.repo?.name ?? "",
        repoUrl: `https://github.com/${event.repo?.name ?? ""}`,
        createdAt: event.created_at,
        commitCount: event.payload?.commits?.length,
        action: event.payload?.action,
        refType: event.payload?.ref_type,
      }))
  } catch {
    return []
  }
}
