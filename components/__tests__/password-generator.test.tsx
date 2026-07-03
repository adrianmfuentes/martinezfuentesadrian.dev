import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PasswordGenerator } from "@components/password-generator"

const dictionary = {
  title: "Password Generator",
  description: "Generate secure passwords",
  length: "Length",
  minLength: "Minimum length",
  includeGreek: "Include Greek letters",
  includeSpecial: "Include special characters",
  generate: "Generate",
  copy: "Copy to clipboard",
  copied: "Copied!",
  strength: "Strength",
  weak: "Weak",
  medium: "Medium",
  strong: "Strong",
  veryStrong: "Very strong",
  show: "Show",
  hide: "Hide",
}

// Character pools mirrored from the component so tests can compute expected
// pool contents without importing implementation details.
const LATIN = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
const DIGITS = "0123456789"
const GREEK = "αβγδεζηθικλμνξοπρστυφχψω"
const SPECIAL = "!@#$%^&*()-+"

function mockCryptoByte(byte: number) {
  vi.spyOn(globalThis.crypto, "getRandomValues").mockImplementation((arr: any) => {
    arr[0] = byte
    return arr
  })
}

function getPasswordInput(): HTMLInputElement {
  const input = document.querySelector('input[readonly]')
  if (!input) throw new Error("password display input not found")
  return input as HTMLInputElement
}

describe("PasswordGenerator", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("renders the title and description, with no password initially", () => {
    render(<PasswordGenerator dictionary={dictionary} />)
    expect(screen.getAllByText(dictionary.title)[0]).toBeInTheDocument()
    expect(screen.getAllByText(dictionary.description)[0]).toBeInTheDocument()
    expect(screen.queryByText(dictionary.copy)).not.toBeInTheDocument()
  })

  it("generates a password of the default length using only latin+digit characters by default", async () => {
    const user = userEvent.setup()
    render(<PasswordGenerator dictionary={dictionary} />)

    await user.click(screen.getByRole("button", { name: dictionary.generate }))

    const passwordInput = getPasswordInput()
    expect(passwordInput.value).toHaveLength(25)
    expect(passwordInput.value).toMatch(/^[a-zA-Z0-9]+$/)
  })

  it("respects a custom length typed into the length field", async () => {
    const user = userEvent.setup()
    render(<PasswordGenerator dictionary={dictionary} />)

    const lengthInput = screen.getByLabelText(dictionary.length)
    fireEvent.change(lengthInput, { target: { value: "12" } })

    await user.click(screen.getByRole("button", { name: dictionary.generate }))

    const passwordInput = getPasswordInput()
    expect(passwordInput.value).toHaveLength(12)
  })

  it("clamps the length to the minimum when a value below the minimum is entered", async () => {
    const user = userEvent.setup()
    render(<PasswordGenerator dictionary={dictionary} />)

    const lengthInput = screen.getByLabelText(dictionary.length)
    fireEvent.change(lengthInput, { target: { value: "3" } })
    expect((lengthInput as HTMLInputElement).value).toBe("8")

    await user.click(screen.getByRole("button", { name: dictionary.generate }))
    const passwordInput = getPasswordInput()
    expect(passwordInput.value).toHaveLength(8)
  })

  it("falls back to the minimum length when a non-numeric value is entered", () => {
    render(<PasswordGenerator dictionary={dictionary} />)

    const lengthInput = screen.getByLabelText(dictionary.length)
    fireEvent.change(lengthInput, { target: { value: "abc" } })
    expect((lengthInput as HTMLInputElement).value).toBe("8")
  })

  it("excludes greek and special characters when their checkboxes are unchecked (deterministic pool check)", async () => {
    const user = userEvent.setup()
    render(<PasswordGenerator dictionary={dictionary} />)

    const pool = LATIN + DIGITS
    // Ask for the very last index in the expected pool; if the component's
    // actual pool were smaller (or larger), this index would resolve to a
    // different, wrong character.
    mockCryptoByte(pool.length - 1)

    await user.click(screen.getByRole("button", { name: dictionary.generate }))

    const passwordInput = getPasswordInput()
    expect(passwordInput.value).toBe(pool.at(-1)!.repeat(25))
  })

  it("includes special characters in the pool when 'include special' is checked", async () => {
    const user = userEvent.setup()
    render(<PasswordGenerator dictionary={dictionary} />)

    await user.click(screen.getByLabelText(dictionary.includeSpecial))

    const pool = LATIN + DIGITS + SPECIAL
    mockCryptoByte(pool.length - 1)

    await user.click(screen.getByRole("button", { name: dictionary.generate }))

    const passwordInput = getPasswordInput()
    expect(passwordInput.value).toBe(pool.at(-1)!.repeat(25))
    expect(passwordInput.value[0]).toBe(SPECIAL.at(-1))
  })

  it("includes greek characters in the pool when 'include greek' is checked", async () => {
    const user = userEvent.setup()
    render(<PasswordGenerator dictionary={dictionary} />)

    await user.click(screen.getByLabelText(dictionary.includeGreek))

    const pool = LATIN + DIGITS + GREEK
    mockCryptoByte(pool.length - 1)

    await user.click(screen.getByRole("button", { name: dictionary.generate }))

    const passwordInput = getPasswordInput()
    expect(passwordInput.value).toBe(pool.at(-1)!.repeat(25))
    expect(passwordInput.value[0]).toBe(GREEK.at(-1))
  })

  it("toggles password visibility between text and password input types", async () => {
    const user = userEvent.setup()
    render(<PasswordGenerator dictionary={dictionary} />)

    await user.click(screen.getByRole("button", { name: dictionary.generate }))
    const passwordInput = getPasswordInput()

    // Shown by default (showPassword starts true)
    expect(passwordInput.type).toBe("text")

    const toggleButtons = screen.getAllByRole("button")
    // the eye/copy icon buttons are rendered after generate; find the one
    // that toggles type by clicking each and checking effect
    const eyeButton = toggleButtons.find((btn) => btn.querySelector("svg.lucide-eye-off"))
    expect(eyeButton).toBeTruthy()
    await user.click(eyeButton!)
    expect(passwordInput.type).toBe("password")
  })

  it("copies the generated password to the clipboard and shows the copied state", async () => {
    render(<PasswordGenerator dictionary={dictionary} />)

    fireEvent.click(screen.getByRole("button", { name: dictionary.generate }))
    const passwordInput = getPasswordInput()
    const value = passwordInput.value

    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    })

    const toggleButtons = screen.getAllByRole("button")
    const copyButton = toggleButtons.find((btn) => btn.querySelector("svg.lucide-copy"))
    expect(copyButton).toBeTruthy()

    fireEvent.click(copyButton!)

    await screen.findByText(dictionary.copied)
    expect(writeText).toHaveBeenCalledWith(value)
    expect(screen.getByText(dictionary.copied)).toBeInTheDocument()
  })

  it("shows a weak strength badge for a short generated password pool lacking variety", async () => {
    const user = userEvent.setup()
    render(<PasswordGenerator dictionary={dictionary} />)

    const lengthInput = screen.getByLabelText(dictionary.length)
    fireEvent.change(lengthInput, { target: { value: "8" } })

    // Force every character to be the same lowercase letter -> only one
    // character-class present -> low strength score.
    mockCryptoByte(0)

    await user.click(screen.getByRole("button", { name: dictionary.generate }))

    expect(screen.getByText(dictionary.weak)).toBeInTheDocument()
  })
})
