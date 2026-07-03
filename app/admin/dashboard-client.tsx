"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { computeExperienceLabel } from "@/lib/experience"
import type { ExperienceCounter } from "@/lib/kv"
import { LogOut, Plus, Trash2, ChevronDown, ChevronUp, Save, Check } from "lucide-react"

type Lang = "en" | "es"

interface DashboardData {
  counter: ExperienceCounter
  en: { cv: any }
  es: { cv: any }
}

// ─── Top-level component ────────────────────────────────────────────────────

export function DashboardClient({ initialData }: { initialData: DashboardData }) {
  const router = useRouter()
  const [lang, setLang] = useState<Lang>("es")
  const [counter, setCounter] = useState<ExperienceCounter>(initialData.counter)
  const [content, setContent] = useState({ en: initialData.en.cv, es: initialData.es.cv })
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  const save = async (key: string, payload: object) => {
    setSaving(key)
    try {
      await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      setSaved(key)
      setTimeout(() => setSaved(null), 2500)
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
          <TabsList className="grid grid-cols-4 mb-8 w-full">
            <TabsTrigger value="counter">Counter</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="certifications">Certs</TabsTrigger>
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
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// ─── Language bar ───────────────────────────────────────────────────────────

function LangBar({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
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
}: {
  counter: ExperienceCounter
  onChange: (c: ExperienceCounter) => void
  onSave: () => void
  saving: boolean
  saved: boolean
}) {
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

        <SaveButton onSave={onSave} saving={saving} saved={saved} />
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
}: {
  items: any[]
  fields: string[]
  emptyItem: Record<string, any>
  onSave: (items: any[]) => void
  saving: boolean
  saved: boolean
}) {
  const [items, setItems] = useState<any[]>(initialItems)

  // Sync when parent switches language
  const [prevInitialItems, setPrevInitialItems] = useState(initialItems)
  if (initialItems !== prevInitialItems) {
    setPrevInitialItems(initialItems)
    setItems(initialItems)
  }

  const update = (idx: number, field: string, value: any) => {
    setItems((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  const remove = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx))

  const add = () => setItems((prev) => [...prev, { ...emptyItem }])

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <ItemCard
          key={idx}
          item={item}
          fields={fields}
          onUpdate={(field, value) => update(idx, field, value)}
          onRemove={() => remove(idx)}
        />
      ))}

      <Button variant="outline" onClick={add} className="w-full gap-2 border-dashed">
        <Plus className="h-4 w-4" />
        Add item
      </Button>

      <div className="flex justify-end pt-2">
        <SaveButton onSave={() => onSave(items)} saving={saving} saved={saved} />
      </div>
    </div>
  )
}

// ─── Item card ──────────────────────────────────────────────────────────────

function ItemCard({
  item,
  fields,
  onUpdate,
  onRemove,
}: {
  item: any
  fields: string[]
  onUpdate: (field: string, value: any) => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Card className="overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{item.title || "(untitled)"}</p>
          {item.organization && (
            <p className="text-xs text-muted-foreground truncate">{item.organization}</p>
          )}
        </div>
        <div className="flex items-center gap-1 ml-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
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
}: {
  field: string
  value: any
  onChange: (v: any) => void
}) {
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
}: {
  onSave: () => void
  saving: boolean
  saved: boolean
}) {
  return (
    <Button onClick={onSave} disabled={saving} className="gap-2 min-w-28">
      {saved ? (
        <>
          <Check className="h-4 w-4" />
          Saved
        </>
      ) : saving ? (
        "Saving…"
      ) : (
        <>
          <Save className="h-4 w-4" />
          Save
        </>
      )}
    </Button>
  )
}
