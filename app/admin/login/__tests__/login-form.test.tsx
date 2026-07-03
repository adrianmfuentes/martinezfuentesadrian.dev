import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { LoginForm } from "@/app/admin/login/login-form"

const push = vi.fn()
const refresh = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}))

function mockFetchOnce(ok: boolean, jsonBody: unknown = {}) {
  return vi.fn().mockResolvedValue({
    ok,
    json: async () => jsonBody,
  })
}

describe("LoginForm", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it("submits the password, then pushes to /admin and refreshes on success", async () => {
    vi.stubGlobal("fetch", mockFetchOnce(true, { ok: true }))

    render(<LoginForm />)
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "correct-pw" } })
    fireEvent.click(screen.getByRole("button", { name: "Login" }))

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/admin")
    })
    expect(refresh).toHaveBeenCalledTimes(1)

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/admin/auth",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "correct-pw" }),
      })
    )
  })

  it("shows the server error message and does not navigate on failure", async () => {
    vi.stubGlobal("fetch", mockFetchOnce(false, { error: "Wrong password, try again" }))

    render(<LoginForm />)
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "bad-pw" } })
    fireEvent.click(screen.getByRole("button", { name: "Login" }))

    await waitFor(() => {
      expect(screen.getByText("Wrong password, try again")).toBeInTheDocument()
    })
    expect(push).not.toHaveBeenCalled()
    expect(refresh).not.toHaveBeenCalled()
  })

  it("falls back to a generic 'Invalid password' message when the error body has no error field", async () => {
    vi.stubGlobal("fetch", mockFetchOnce(false, {}))

    render(<LoginForm />)
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "bad-pw" } })
    fireEvent.click(screen.getByRole("button", { name: "Login" }))

    await waitFor(() => {
      expect(screen.getByText("Invalid password")).toBeInTheDocument()
    })
    expect(push).not.toHaveBeenCalled()
  })

  it("shows a disabled 'Verifying…' state while the request is in flight", async () => {
    let resolveFetch: (value: unknown) => void = () => {}
    const pending = new Promise((resolve) => {
      resolveFetch = resolve
    })
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pending))

    render(<LoginForm />)
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "some-pw" } })
    fireEvent.click(screen.getByRole("button", { name: "Login" }))

    const verifyingButton = await screen.findByRole("button", { name: "Verifying…" })
    expect(verifyingButton).toBeDisabled()
    expect(screen.getByPlaceholderText("Password")).toBeDisabled()

    resolveFetch({ ok: true, json: async () => ({ ok: true }) })

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/admin")
    })
  })
})
