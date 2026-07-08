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
    before?: string
    head?: string
  }
}

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "portfolio-site",
  }
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  return headers
}

// GitHub's public events API stopped including the `commits`/`size` fields on
// PushEvent payloads, so the commit count has to be derived from a compare call.
async function getPushCommitCount(repo: string, before?: string, head?: string): Promise<number | undefined> {
  if (!repo || !before || !head || /^0+$/.test(before)) return undefined
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/compare/${before}...${head}`, {
      headers: githubHeaders(),
      next: { revalidate: 3600 },
    })
    if (!res.ok) return undefined
    const data = await res.json()
    return typeof data.total_commits === "number" ? data.total_commits : undefined
  } catch {
    return undefined
  }
}

export async function getGithubActivity(): Promise<GithubActivityItem[]> {
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=20`, {
      headers: githubHeaders(),
      next: { revalidate: 3600 },
    })

    if (!res.ok) return []
    const events: GithubApiEvent[] = await res.json()
    if (!Array.isArray(events)) return []

    const filtered = events
      .filter((event): event is GithubApiEvent & { type: GithubEventType } => SUPPORTED_TYPES.has(event.type))
      .slice(0, MAX_ITEMS)

    return await Promise.all(
      filtered.map(async (event) => {
        const repo = event.repo?.name ?? ""
        const commitCount =
          event.type === "PushEvent"
            ? (event.payload?.commits?.length ?? (await getPushCommitCount(repo, event.payload?.before, event.payload?.head)) ?? 1)
            : undefined

        return {
          id: event.id,
          type: event.type,
          repo,
          repoUrl: `https://github.com/${repo}`,
          createdAt: event.created_at,
          commitCount,
          action: event.payload?.action,
          refType: event.payload?.ref_type,
        }
      })
    )
  } catch {
    return []
  }
}
