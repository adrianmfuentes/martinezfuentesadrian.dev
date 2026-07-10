"use client"

import { useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { computeExperienceLabel } from "@/lib/experience"
import type { ExperienceCounter } from "@/lib/kv"
import { LogOut, Plus, Trash2, ChevronDown, ChevronUp, Save, Check, AlertCircle } from "lucide-react"

type Lang = "en" | "es"

interface DashboardData {
  counter: ExperienceCounter
  en: { cv: any }
  es: { cv: any }
}

// ─── Top-level component ────────────────────────────────────────────────────

export function DashboardClient({ initialData }: Readonly<{ initialData: DashboardData }>) {
  const router = useRouter()
  const [lang, setLang] = useState<Lang>("es")
  const [counter, setCounter] = useState<ExperienceCounter>(initialData.counter)
  const [content, setContent] = useState({ en: initialData.en.cv, es: initialData.es.cv })
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const save = async (key: string, payload: object) => {
    setSaving(key)
    setSaveError(null)
    try {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Save failed")
      }
      setSaved(key)
      setTimeout(() => setSaved(null), 2500)
    } catch {
      setSaveError(key)
      setTimeout(() => setSaveError(null), 3000)
    } finally {
      setSaving(null)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
  }

  const updateSection = (section: string, items: any[]) => {
    setContent((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [section]: { items } },
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold font-poppins tracking-tight">Admin Panel</h1>
        <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </header>

      <div className="container max-w-3xl mx-auto px-4 py-8">
        <Tabs defaultValue="counter">
          <TabsList className="grid grid-cols-5 mb-8 w-full">
            <TabsTrigger value="counter">Counter</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="certifications">Certs</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
          </TabsList>

          {/* ── Experience Counter ── */}
          <TabsContent value="counter">
            <CounterTab
              counter={counter}
              onChange={setCounter}
              onSave={() =>
                save("counter", { type: "counter", data: counter })
              }
              saving={saving === "counter"}
              saved={saved === "counter"}
              error={saveError === "counter"}
            />
          </TabsContent>

          {/* ── Experience ── */}
          <TabsContent value="experience">
            <LangBar lang={lang} setLang={setLang} />
            <SectionEditor
              key={`exp-${lang}`}
              items={content[lang]?.experience?.items ?? []}
              fields={["title", "organization", "location", "period", "department", "description"]}
              emptyItem={{ title: "", organization: "", location: "", period: "", department: "", description: [] }}
              onSave={(items) => {
                updateSection("experience", items)
                save(`exp-${lang}`, { type: "content", lang, section: "experience", data: { items } })
              }}
              saving={saving === `exp-${lang}`}
              saved={saved === `exp-${lang}`}
              error={saveError === `exp-${lang}`}
            />
          </TabsContent>

          {/* ── Education ── */}
          <TabsContent value="education">
            <LangBar lang={lang} setLang={setLang} />
            <SectionEditor
              key={`edu-${lang}`}
              items={content[lang]?.education?.items ?? []}
              fields={["title", "organization", "period", "gpa", "honours", "description"]}
              emptyItem={{ title: "", organization: "", period: "", gpa: "", honours: "", description: [] }}
              onSave={(items) => {
                updateSection("education", items)
                save(`edu-${lang}`, { type: "content", lang, section: "education", data: { items } })
              }}
              saving={saving === `edu-${lang}`}
              saved={saved === `edu-${lang}`}
              error={saveError === `edu-${lang}`}
            />
          </TabsContent>

          {/* ── Certifications ── */}
          <TabsContent value="certifications">
            <LangBar lang={lang} setLang={setLang} />
            <SectionEditor
              key={`cert-${lang}`}
              items={content[lang]?.certifications?.items ?? []}
              fields={["title", "organization", "period", "description"]}
              emptyItem={{ title: "", organization: "", period: "", description: "" }}
              onSave={(items) => {
                updateSection("certifications", items)
                save(`cert-${lang}`, { type: "content", lang, section: "certifications", data: { items } })
              }}
              saving={saving === `cert-${lang}`}
              saved={saved === `cert-${lang}`}
              error={saveError === `cert-${lang}`}
            />
          </TabsContent>

          {/* ── Blog ── */}
          <TabsContent value="blog">
            <LangBar lang={lang} setLang={setLang} />
            <BlogTab key={`blog-${lang}`} lang={lang} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// ─── Language bar ───────────────────────────────────────────────────────────

function LangBar({ lang, setLang }: Readonly<{ lang: Lang; setLang: (l: Lang) => void }>) {
  return (
    <div className="flex gap-2 mb-5">
      {(["es", "en"] as Lang[]).map((l) => (
        <Button
          key={l}
          variant={lang === l ? "default" : "outline"}
          size="sm"
          onClick={() => setLang(l)}
          className="uppercase tracking-widest text-xs w-14"
        >
          {l}
        </Button>
      ))}
    </div>
  )
}

// ─── Counter tab ────────────────────────────────────────────────────────────

function CounterTab({
  counter,
  onChange,
  onSave,
  saving,
  saved,
  error,
}: Readonly<{
  counter: ExperienceCounter
  onChange: (c: ExperienceCounter) => void
  onSave: () => void
  saving: boolean
  saved: boolean
  error: boolean
}>) {
  const previewEs = computeExperienceLabel(counter.startDate || "2026-01-29", "es")
  const previewEn = computeExperienceLabel(counter.startDate || "2026-01-29", "en")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-poppins">Experience Counter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-3">
          <Switch
            id="auto"
            checked={counter.autoIncrement}
            onCheckedChange={(v) => onChange({ ...counter, autoIncrement: v })}
          />
          <Label htmlFor="auto" className="cursor-pointer">
            Auto-increment monthly
          </Label>
        </div>

        <div className="space-y-2">
          <Label>Start date</Label>
          <Input
            type="date"
            value={counter.startDate}
            onChange={(e) => onChange({ ...counter, startDate: e.target.value })}
            className="max-w-xs"
          />
        </div>

        {counter.autoIncrement && counter.startDate && (
          <div className="rounded-lg bg-muted px-4 py-3 space-y-1 text-sm">
            <p className="text-muted-foreground text-xs uppercase tracking-wide font-medium mb-1">
              Current computed value
            </p>
            <p>
              <span className="text-muted-foreground">ES:</span>{" "}
              <span className="font-medium">{previewEs}</span>
            </p>
            <p>
              <span className="text-muted-foreground">EN:</span>{" "}
              <span className="font-medium">{previewEn}</span>
            </p>
          </div>
        )}

        <SaveButton onSave={onSave} saving={saving} saved={saved} error={error} />
      </CardContent>
    </Card>
  )
}

// ─── Section editor ─────────────────────────────────────────────────────────

function SectionEditor({
  items: initialItems,
  fields,
  emptyItem,
  onSave,
  saving,
  saved,
  error,
}: Readonly<{
  items: any[]
  fields: string[]
  emptyItem: Record<string, any>
  onSave: (items: any[]) => void
  saving: boolean
  saved: boolean
  error: boolean
}>) {
  const [items, setItems] = useState<{ key: string; data: any }[]>(() => toKeyedItems(initialItems))

  // Sync when parent switches language
  const [prevInitialItems, setPrevInitialItems] = useState(initialItems)
  if (initialItems !== prevInitialItems) {
    setPrevInitialItems(initialItems)
    setItems(toKeyedItems(initialItems))
  }

  const update = (key: string, field: string, value: any) => {
    setItems((prev) => prev.map((it) => (it.key === key ? { key, data: { ...it.data, [field]: value } } : it)))
  }

  const remove = (key: string) => setItems((prev) => prev.filter((it) => it.key !== key))

  const add = () => setItems((prev) => [...prev, { key: crypto.randomUUID(), data: { ...emptyItem } }])

  return (
    <div className="space-y-3">
      {items.map(({ key, data }) => (
        <ItemCard
          key={key}
          item={data}
          fields={fields}
          onUpdate={(field, value) => update(key, field, value)}
          onRemove={() => remove(key)}
        />
      ))}

      <Button variant="outline" onClick={add} className="w-full gap-2 border-dashed">
        <Plus className="h-4 w-4" />
        Add item
      </Button>

      <div className="flex justify-end pt-2">
        <SaveButton onSave={() => onSave(items.map((it) => it.data))} saving={saving} saved={saved} error={error} />
      </div>
    </div>
  )
}

function toKeyedItems(items: any[]) {
  return items.map((data) => ({ key: crypto.randomUUID(), data }))
}

// ─── Item card ──────────────────────────────────────────────────────────────

function ItemCard({
  item,
  fields,
  onUpdate,
  onRemove,
}: Readonly<{
  item: any
  fields: string[]
  onUpdate: (field: string, value: any) => void
  onRemove: () => void
}>) {
  const [open, setOpen] = useState(false)

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors">
        <button
          type="button"
          className="flex-1 min-w-0 text-left cursor-pointer"
          onClick={() => setOpen((v) => !v)}
        >
          <p className="font-medium text-sm truncate">{item.title || "(untitled)"}</p>
          {item.organization && (
            <p className="text-xs text-muted-foreground truncate">{item.organization}</p>
          )}
        </button>
        <div className="flex items-center gap-1 ml-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {open && (
        <CardContent className="px-4 pb-4 pt-0 space-y-3 border-t border-border">
          {fields.map((field) => (
            <FieldInput
              key={field}
              field={field}
              value={item[field]}
              onChange={(v) => onUpdate(field, v)}
            />
          ))}
        </CardContent>
      )}
    </Card>
  )
}

// ─── Field input ─────────────────────────────────────────────────────────────

function FieldInput({
  field,
  value,
  onChange,
}: Readonly<{
  field: string
  value: any
  onChange: (v: any) => void
}>) {
  const label = field.charAt(0).toUpperCase() + field.slice(1)
  const isArray = Array.isArray(value)
  const isLongText = field === "description" || isArray

  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground capitalize">
        {label}
        {isArray && (
          <span className="ml-1 font-normal text-muted-foreground/60">(one per line)</span>
        )}
      </Label>
      {isLongText ? (
        <Textarea
          rows={isArray ? 4 : 2}
          value={isArray ? (value as string[]).join("\n") : (value ?? "")}
          onChange={(e) => {
            if (isArray) {
              onChange(e.target.value.split("\n"))
            } else {
              onChange(e.target.value)
            }
          }}
          className="text-sm resize-y"
        />
      ) : (
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="text-sm"
        />
      )}
    </div>
  )
}

// ─── Save button ─────────────────────────────────────────────────────────────

function SaveButton({
  onSave,
  saving,
  saved,
  error,
}: Readonly<{
  onSave: () => void
  saving: boolean
  saved: boolean
  error?: boolean
}>) {
  let content: ReactNode
  if (error) {
    content = (
      <>
        <AlertCircle className="h-4 w-4" />
        Error
      </>
    )
  } else if (saved) {
    content = (
      <>
        <Check className="h-4 w-4" />
        Saved
      </>
    )
  } else if (saving) {
    content = "Saving…"
  } else {
    content = (
      <>
        <Save className="h-4 w-4" />
        Save
      </>
    )
  }

  return (
    <Button onClick={onSave} disabled={saving} variant={error ? "destructive" : "default"} className="gap-2 min-w-28">
      {content}
    </Button>
  )
}

// ─── Blog tab ───────────────────────────────────────────────────────────────

interface BlogPostMeta {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
  readingMinutes: number
}

interface BlogDraft {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
  content: string
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
}

function emptyDraft(): BlogDraft {
  return { slug: "", title: "", description: "", date: new Date().toISOString().slice(0, 10), tags: [], content: "" }
}

function BlogTab({ lang }: Readonly<{ lang: Lang }>) {
  const [posts, setPosts] = useState<BlogPostMeta[] | null>(null)
  const [editing, setEditing] = useState<BlogDraft | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

  const loadPosts = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/blog?lang=${lang}`)
      const body = await res.json()
      setPosts(res.ok ? body.posts : [])
    } catch {
      setPosts([])
    }
  }, [lang])

  useEffect(() => {
    let cancelled = false
    fetch(`/api/admin/blog?lang=${lang}`)
      .then((res) => res.json().then((body) => ({ ok: res.ok, body })))
      .then(({ ok, body }) => {
        if (!cancelled) setPosts(ok ? body.posts : [])
      })
      .catch(() => {
        if (!cancelled) setPosts([])
      })
    return () => {
      cancelled = true
    }
  }, [lang])

  const openEdit = async (slug: string) => {
    const res = await fetch(`/api/admin/blog/${slug}?lang=${lang}`)
    if (!res.ok) return
    setEditing(await res.json())
  }

  const handleDelete = async () => {
    if (!deleting) return
    setDeletingBusy(true)
    try {
      await fetch("/api/admin/blog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang, slug: deleting }),
      })
      setDeleting(null)
      await loadPosts()
    } finally {
      setDeletingBusy(false)
    }
  }

  if (editing) {
    return (
      <BlogEditor
        lang={lang}
        draft={editing}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null)
          loadPosts()
        }}
      />
    )
  }

  return (
    <div className="space-y-3">
      {posts === null && <p className="text-sm text-muted-foreground px-1">Loading…</p>}
      {posts?.length === 0 && <p className="text-sm text-muted-foreground px-1">No posts yet.</p>}

      {posts?.map((post) => (
        <Card key={post.slug} className="overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors">
            <button
              type="button"
              className="flex-1 min-w-0 text-left cursor-pointer"
              onClick={() => openEdit(post.slug)}
            >
              <p className="font-medium text-sm truncate">{post.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {post.date || "no date"} · {post.slug}
              </p>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive ml-3 flex-shrink-0"
              onClick={() => setDeleting(post.slug)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </Card>
      ))}

      <Button variant="outline" onClick={() => setEditing(emptyDraft())} className="w-full gap-2 border-dashed">
        <Plus className="h-4 w-4" />
        New post
      </Button>

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes “{deleting}” from the {lang.toUpperCase()} blog. This can&apos;t be undone from here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletingBusy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingBusy ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Blog editor ────────────────────────────────────────────────────────────

function BlogEditor({
  lang,
  draft,
  onCancel,
  onSaved,
}: Readonly<{
  lang: Lang
  draft: BlogDraft
  onCancel: () => void
  onSaved: () => void
}>) {
  const [form, setForm] = useState<BlogDraft>(draft)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isNew = !draft.slug
  const originalSlug = draft.slug

  const setField = <K extends keyof BlogDraft>(field: K, value: BlogDraft[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleTitleChange = (title: string) => {
    setForm((prev) => {
      const slugMatchesTitle = isNew && (prev.slug === "" || prev.slug === slugify(prev.title))
      return { ...prev, title, slug: slugMatchesTitle ? slugify(title) : prev.slug }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          slug: form.slug,
          originalSlug: isNew ? undefined : originalSlug,
          title: form.title,
          description: form.description,
          date: form.date,
          tags: form.tags,
          content: form.content,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Save failed")
      }
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-poppins">
          {isNew ? "New post" : "Edit post"} · {lang.toUpperCase()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="blog-title" className="text-xs text-muted-foreground">Title</Label>
          <Input id="blog-title" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} className="text-sm" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="blog-slug" className="text-xs text-muted-foreground">Slug</Label>
          <Input
            id="blog-slug"
            value={form.slug}
            onChange={(e) => setField("slug", slugify(e.target.value))}
            className="text-sm font-mono"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="blog-description" className="text-xs text-muted-foreground">Description</Label>
          <Textarea
            id="blog-description"
            rows={2}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            className="text-sm resize-y"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="blog-date" className="text-xs text-muted-foreground">Date</Label>
            <Input
              id="blog-date"
              type="date"
              value={form.date}
              onChange={(e) => setField("date", e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="blog-tags" className="text-xs text-muted-foreground">Tags (comma separated)</Label>
            <Input
              id="blog-tags"
              value={form.tags.join(", ")}
              onChange={(e) =>
                setField(
                  "tags",
                  e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                )
              }
              className="text-sm"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="blog-content" className="text-xs text-muted-foreground">Content (Markdown)</Label>
          <Textarea
            id="blog-content"
            rows={16}
            value={form.content}
            onChange={(e) => setField("content", e.target.value)}
            className="text-sm font-mono resize-y"
          />
        </div>

        {error && (
          <p className="flex items-center gap-1.5 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !form.title.trim() || !form.slug.trim()}
            className="gap-2 min-w-28"
          >
            {saving ? "Saving…" : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
