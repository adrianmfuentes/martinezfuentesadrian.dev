import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { PasswordChecker } from "@components/password-checker"

const dictionary = {
  title: "Password Checker",
  description: "Check your password strength",
  passwordLabel: "Password",
  passwordPlaceholder: "Enter your password",
  analyzeButton: "Analyze",
  showPassword: "Show password",
  hidePassword: "Hide password",
  analysis: {
    title: "Analysis",
    length: "Length",
    lowercase: "Lowercase",
    uppercase: "Uppercase",
    digits: "Digits",
    special: "Special",
    whitespace: "Whitespace",
    entropy: "Entropy",
    strength: "Strength",
    remarks: "Remarks",
    pwned: "Breach check",
    pwnedStatus: {
      checking: "Checking...",
      notFound: "Not found in breaches",
      found: "Found in {count} breaches",
      error: "Could not check",
    },
  },
  strengthLevels: {
    veryWeak: "Very weak",
    weak: "Weak",
    moderate: "Moderate",
    strong: "Strong",
    veryStrong: "Very strong",
  },
  strengthRemarks: {
    veryWeak: "very weak remark",
    weak: "weak remark",
    moderate: "moderate remark",
    strong: "strong remark",
    veryStrong: "very strong remark",
  },
  minLengthWarning: "Password should be at least {min} characters",
  resetButton: "Reset",
}

function mockFetchOnce(response: Partial<Response> & { jsonBody?: unknown }) {
  const { jsonBody, ...rest } = response
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => jsonBody,
    ...rest,
  })
}

describe("PasswordChecker", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("renders with the analyze button disabled when the password is empty", () => {
    render(<PasswordChecker dictionary={dictionary} />)
    expect(screen.getByRole("button", { name: dictionary.analyzeButton })).toBeDisabled()
  })

  it("shows a warning when the password is shorter than the minimum length", () => {
    render(<PasswordChecker dictionary={dictionary} />)
    const input = screen.getByPlaceholderText(dictionary.passwordPlaceholder)
    fireEvent.change(input, { target: { value: "abc" } })
    expect(screen.getByText("Password should be at least 8 characters")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: dictionary.analyzeButton })).not.toBeDisabled()
  })

  it("toggles the password input visibility", () => {
    render(<PasswordChecker dictionary={dictionary} />)
    const input = screen.getByPlaceholderText(dictionary.passwordPlaceholder) as HTMLInputElement
    expect(input.type).toBe("password")

    fireEvent.click(screen.getByRole("button", { name: dictionary.showPassword }))
    expect(input.type).toBe("text")

    fireEvent.click(screen.getByRole("button", { name: dictionary.hidePassword }))
    expect(input.type).toBe("password")
  })

  it("analyzes a weak password, calls the pwned-check API, and shows 'not found' when count is 0", async () => {
    const fetchMock = mockFetchOnce({ jsonBody: { count: 0 } })
    vi.stubGlobal("fetch", fetchMock)

    render(<PasswordChecker dictionary={dictionary} />)
    const input = screen.getByPlaceholderText(dictionary.passwordPlaceholder)
    // lowercase-only, 7 chars -> entropy = 7*log2(26) ≈ 32.9 -> "weak" bucket (28<=x<36)
    fireEvent.change(input, { target: { value: "abcdefg" } })
    fireEvent.click(screen.getByRole("button", { name: dictionary.analyzeButton }))

    // Strength renders synchronously
    expect(await screen.findByText(dictionary.strengthLevels.weak)).toBeInTheDocument()

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/check-password",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "abcdefg" }),
      })
    )

    await waitFor(() => {
      expect(screen.getByText(dictionary.analysis.pwnedStatus.notFound)).toBeInTheDocument()
    })
  })

  it("shows a breach count when the password has been pwned", async () => {
    const fetchMock = mockFetchOnce({ jsonBody: { count: 12345 } })
    vi.stubGlobal("fetch", fetchMock)

    render(<PasswordChecker dictionary={dictionary} />)
    const input = screen.getByPlaceholderText(dictionary.passwordPlaceholder)
    fireEvent.change(input, { target: { value: "password1" } })
    fireEvent.click(screen.getByRole("button", { name: dictionary.analyzeButton }))

    await waitFor(() => {
      expect(
        screen.getByText(`Found in ${(12345).toLocaleString()} breaches`)
      ).toBeInTheDocument()
    })
  })

  it("shows a loading state while the pwned check is in flight", async () => {
    let resolveFetch: (value: unknown) => void = () => {}
    const pending = new Promise((resolve) => {
      resolveFetch = resolve
    })
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(pending)
    )

    render(<PasswordChecker dictionary={dictionary} />)
    const input = screen.getByPlaceholderText(dictionary.passwordPlaceholder)
    fireEvent.change(input, { target: { value: "password1" } })
    fireEvent.click(screen.getByRole("button", { name: dictionary.analyzeButton }))

    expect(await screen.findByText(dictionary.analysis.pwnedStatus.checking)).toBeInTheDocument()

    resolveFetch({ ok: true, json: async () => ({ count: 0 }) })

    await waitFor(() => {
      expect(screen.getByText(dictionary.analysis.pwnedStatus.notFound)).toBeInTheDocument()
    })
  })

  it("shows an error state when the pwned-check request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")))

    render(<PasswordChecker dictionary={dictionary} />)
    const input = screen.getByPlaceholderText(dictionary.passwordPlaceholder)
    fireEvent.change(input, { target: { value: "password1" } })
    fireEvent.click(screen.getByRole("button", { name: dictionary.analyzeButton }))

    await waitFor(() => {
      expect(screen.getByText(dictionary.analysis.pwnedStatus.error)).toBeInTheDocument()
    })
  })

  it("shows an error state when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) })
    )

    render(<PasswordChecker dictionary={dictionary} />)
    const input = screen.getByPlaceholderText(dictionary.passwordPlaceholder)
    fireEvent.change(input, { target: { value: "password1" } })
    fireEvent.click(screen.getByRole("button", { name: dictionary.analyzeButton }))

    await waitFor(() => {
      expect(screen.getByText(dictionary.analysis.pwnedStatus.error)).toBeInTheDocument()
    })
  })

  it("computes and displays detailed character-class counts and entropy", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ count: 0 }) }))

    render(<PasswordChecker dictionary={dictionary} />)
    const input = screen.getByPlaceholderText(dictionary.passwordPlaceholder)
    // 2 lowercase, 2 uppercase, 2 digits, 1 special, length 7
    fireEvent.change(input, { target: { value: "aA1!bB2" } })
    fireEvent.click(screen.getByRole("button", { name: dictionary.analyzeButton }))

    await screen.findByText(dictionary.analysis.title)

    expect(screen.getByText("7")).toBeInTheDocument() // length
    // lowercase count 'a','b' = 2, uppercase 'A','B' = 2, digits '1','2' = 2, special '!' = 1
    const twos = screen.getAllByText("2")
    expect(twos.length).toBeGreaterThanOrEqual(3)
    expect(screen.getByText("1")).toBeInTheDocument()
  })

  it("resets the analysis and password field when the reset button is clicked", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ count: 0 }) }))

    render(<PasswordChecker dictionary={dictionary} />)
    const input = screen.getByPlaceholderText(dictionary.passwordPlaceholder) as HTMLInputElement
    fireEvent.change(input, { target: { value: "password1" } })
    fireEvent.click(screen.getByRole("button", { name: dictionary.analyzeButton }))

    await screen.findByText(dictionary.analysis.title)

    fireEvent.click(screen.getByRole("button", { name: dictionary.resetButton }))

    expect(screen.queryByText(dictionary.analysis.title)).not.toBeInTheDocument()
    expect(input.value).toBe("")
  })

  it("does nothing when analyze is triggered with an empty password", () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    render(<PasswordChecker dictionary={dictionary} />)
    // Button is disabled, so clicking should have no effect regardless
    fireEvent.click(screen.getByRole("button", { name: dictionary.analyzeButton }))
    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.queryByText(dictionary.analysis.title)).not.toBeInTheDocument()
  })
})
