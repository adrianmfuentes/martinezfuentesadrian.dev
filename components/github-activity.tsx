"use client"

import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { es, enUS } from "date-fns/locale"
import { GitCommit, GitPullRequest, GitFork, Star, FolderPlus, GitBranch, Tag, Github } from "lucide-react" /* NOSONAR */
import { Card, CardContent } from "@components/ui/card"
import type { GithubActivityItem } from "@/lib/github-activity"

interface GithubActivityProps {
  lang: string
  items: readonly GithubActivityItem[]
  dictionary: {
    title: string
    subtitle: string
    viewProfile: string
    empty: string
    opened: string
    closed: string
    events: {
      push: string
      createRepo: string
      createRef: string
      pullRequest: string
      issue: string
      watch: string
      fork: string
      release: string
      default: string
    }
  }
}

const EVENT_ICONS: Record<GithubActivityItem["type"], typeof GitCommit> = {
  PushEvent: GitCommit,
  CreateEvent: FolderPlus,
  PullRequestEvent: GitPullRequest,
  IssuesEvent: GitBranch,
  WatchEvent: Star,
  ForkEvent: GitFork,
  ReleaseEvent: Tag,
}

function describeEvent(item: GithubActivityItem, dictionary: GithubActivityProps["dictionary"]): string {
  const action = item.action === "closed" ? dictionary.closed : dictionary.opened

  switch (item.type) {
    case "PushEvent":
      return dictionary.events.push
        .replace("{count}", String(item.commitCount ?? 0))
        .replace("{repo}", item.repo)
    case "CreateEvent":
      return item.refType === "repository"
        ? dictionary.events.createRepo.replace("{repo}", item.repo)
        : dictionary.events.createRef.replace("{repo}", item.repo)
    case "PullRequestEvent":
      return dictionary.events.pullRequest.replace("{action}", action).replace("{repo}", item.repo)
    case "IssuesEvent":
      return dictionary.events.issue.replace("{action}", action).replace("{repo}", item.repo)
    case "WatchEvent":
      return dictionary.events.watch.replace("{repo}", item.repo)
    case "ForkEvent":
      return dictionary.events.fork.replace("{repo}", item.repo)
    case "ReleaseEvent":
      return dictionary.events.release.replace("{repo}", item.repo)
    default:
      return dictionary.events.default.replace("{repo}", item.repo)
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
}

export function GithubActivity({ lang, items, dictionary }: Readonly<GithubActivityProps>) {
  if (items.length === 0) return null

  const locale = lang === "es" ? es : enUS

  return (
    <section className="py-16" aria-label={dictionary.title}>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2 font-poppins">{dictionary.title}</h2>
        <p className="text-lg text-foreground/70">{dictionary.subtitle}</p>
      </div>

      <Card className="max-w-2xl mx-auto border-primary/20">
        <CardContent className="p-6">
          <motion.ul
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {items.map((item) => {
              const Icon = EVENT_ICONS[item.type]
              return (
                <motion.li key={item.id} variants={itemVariants} className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 rounded-full bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <a
                      href={item.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-foreground/90 hover:text-primary transition-colors"
                    >
                      {describeEvent(item, dictionary)}
                    </a>
                    <p className="text-xs text-foreground/50">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale })}
                    </p>
                  </div>
                </motion.li>
              )
            })}
          </motion.ul>
        </CardContent>
      </Card>

      <div className="text-center mt-6">
        <a
          href="https://github.com/adrianmfuentes"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <Github className="h-4 w-4" /> {/* NOSONAR */}
          {dictionary.viewProfile}
        </a>
      </div>
    </section>
  )
}
