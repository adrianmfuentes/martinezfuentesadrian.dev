import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DashboardClient } from "@/app/admin/dashboard-client"
import { computeExperienceLabel } from "@/lib/experience"

// Radix Tabs switches the active tab from a `onMouseDown`/`onFocus` handler on
// the trigger, not `onClick` — plain `fireEvent.click` (a bare "click" event)
// doesn't reach either handler, so tab-switching interactions must go through
// `@testing-library/user-event`, which fires the full pointer/focus sequence.

const push = vi.fn()
const refresh = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}))

function makeInitialData() {
  return {
    counter: { startDate: "2026-01-29", autoIncrement: true },
    en: {
      cv: {
        experience: {
          items: [
            {
              title: "Eng EN Job",
              organization: "Acme EN",
              location: "Remote",
              period: "2023-2024",
              department: "Eng",
              description: ["did stuff"],
            },
          ],
        },
        education: {
          items: [
            { title: "BSc EN", organization: "Uni EN", period: "2019-2023", gpa: "", honours: "", description: "" },
          ],
        },
        certifications: {
          items: [{ title: "Cert EN", organization: "Org EN", period: "2022", description: "desc" }],
        },
      },
    },
    es: {
      cv: {
        experience: {
          items: [
            {
              title: "Trabajo ES",
              organization: "Acme ES",
              location: "Remoto",
              period: "2023-2024",
              department: "Ing",
              description: ["hizo cosas"],
            },
          ],
        },
        education: {
          items: [
            { title: "Grado ES", organization: "Uni ES", period: "2019-2023", gpa: "", honours: "", description: "" },
          ],
        },
        certifications: {
          items: [{ title: "Cert ES", organization: "Org ES", period: "2022", description: "desc" }],
        },
      },
    },
  }
}

function mockFetchOk() {
  return vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
}

describe("DashboardClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it("logs out: calls /api/admin/logout then pushes to /admin/login", async () => {
    vi.stubGlobal("fetch", mockFetchOk())

    render(<DashboardClient initialData={makeInitialData()} />)
    fireEvent.click(screen.getByRole("button", { name: /logout/i }))

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith("/api/admin/logout", { method: "POST" })
    })
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/admin/login")
    })
  })

  it("updates the live ES/EN preview text when the start date changes (auto-increment on)", () => {
    render(<DashboardClient initialData={makeInitialData()} />)

    const dateInput = screen.getByDisplayValue("2026-01-29")
    fireEvent.change(dateInput, { target: { value: "2020-01-01" } })

    const expectedEs = computeExperienceLabel("2020-01-01", "es")
    const expectedEn = computeExperienceLabel("2020-01-01", "en")

    expect(screen.getByText(expectedEs)).toBeInTheDocument()
    expect(screen.getByText(expectedEn)).toBeInTheDocument()
  })

  it("hides the computed preview once auto-increment is toggled off", () => {
    render(<DashboardClient initialData={makeInitialData()} />)

    expect(screen.getByText(/current computed value/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole("switch"))

    expect(screen.queryByText(/current computed value/i)).not.toBeInTheDocument()
  })

  it("saves the counter with the right payload and shows a transient 'Saved' state that resets", async () => {
    const fetchMock = mockFetchOk()
    vi.stubGlobal("fetch", fetchMock)
    vi.useFakeTimers()

    const initialData = makeInitialData()
    render(<DashboardClient initialData={initialData} />)

    fireEvent.click(screen.getByRole("button", { name: /^save$/i }))

    // Flush the resolved fetch() promise's microtasks under fake timers.
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/save",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "counter", data: initialData.counter }),
      })
    )

    expect(screen.getByText("Saved")).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2500)
    })

    expect(screen.queryByText("Saved")).not.toBeInTheDocument()
  })

  it("switching the ES/EN language bar changes which item list is shown", async () => {
    const user = userEvent.setup()
    render(<DashboardClient initialData={makeInitialData()} />)

    await user.click(screen.getByRole("tab", { name: "Experience" }))

    expect(screen.getByText("Trabajo ES")).toBeInTheDocument()
    expect(screen.queryByText("Eng EN Job")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "en" }))

    expect(screen.getByText("Eng EN Job")).toBeInTheDocument()
    expect(screen.queryByText("Trabajo ES")).not.toBeInTheDocument()
  })

  it("adds a new collapsed item with an '(untitled)' placeholder, which can be expanded and removed", async () => {
    const user = userEvent.setup()
    render(<DashboardClient initialData={makeInitialData()} />)

    await user.click(screen.getByRole("tab", { name: "Experience" }))
    fireEvent.click(screen.getByRole("button", { name: /add item/i }))

    const untitled = screen.getByText("(untitled)")
    expect(untitled).toBeInTheDocument()

    // Collapsed: field labels shouldn't be in the document yet.
    expect(screen.queryByText("Title")).not.toBeInTheDocument()

    // Expand.
    fireEvent.click(untitled)
    expect(screen.getByText("Title")).toBeInTheDocument()
    expect(screen.getByText("Organization")).toBeInTheDocument()

    // Remove via the trash icon button (second button in the card header).
    const toggleButton = untitled.closest("button")!
    const header = toggleButton.parentElement!
    const trashButton = header.querySelectorAll("button")[1]
    fireEvent.click(trashButton)

    expect(screen.queryByText("(untitled)")).not.toBeInTheDocument()
  })

  it("editing a field value and saving fires save() with the right content payload shape", async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchOk()
    vi.stubGlobal("fetch", fetchMock)

    render(<DashboardClient initialData={makeInitialData()} />)
    await user.click(screen.getByRole("tab", { name: "Experience" }))

    // Expand the seed ES item (default lang is "es").
    fireEvent.click(screen.getByText("Trabajo ES"))

    const titleInput = screen.getByDisplayValue("Trabajo ES") as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: "Trabajo ES Editado" } })

    fireEvent.click(screen.getByRole("button", { name: /^save$/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    const [, requestInit] = fetchMock.mock.calls[0]
    const body = JSON.parse(requestInit.body)

    expect(body.type).toBe("content")
    expect(body.lang).toBe("es")
    expect(body.section).toBe("experience")
    expect(body.data.items[0].title).toBe("Trabajo ES Editado")
  })
})
