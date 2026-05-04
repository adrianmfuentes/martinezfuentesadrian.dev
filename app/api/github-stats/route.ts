import { NextResponse } from "next/server"

const GITHUB_USERNAME = "adrianmfuentes"

export async function GET() {
  try {
    const headers: HeadersInit = {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "portfolio-site",
    }

    if (process.env.GITHUB_TOKEN) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`
    }

    const [userRes, commitsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
        headers,
        next: { revalidate: 3600 },
      }),
      fetch(
        `https://api.github.com/search/commits?q=author:${GITHUB_USERNAME}&per_page=1`,
        {
          headers: {
            ...headers,
            "Accept": "application/vnd.github.cloak-preview",
          },
          next: { revalidate: 3600 },
        }
      ),
    ])

    const [userData, commitsData] = await Promise.all([
      userRes.json(),
      commitsRes.json(),
    ])

    return NextResponse.json({
      repos: userData.public_repos ?? 0,
      commits: commitsData.total_count ?? 0,
    })
  } catch {
    return NextResponse.json({ repos: 0, commits: 0 })
  }
}
