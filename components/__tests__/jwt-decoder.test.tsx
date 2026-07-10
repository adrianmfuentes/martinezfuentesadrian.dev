import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { JwtDecoder } from "@components/jwt-decoder"

const dictionary = {
  title: "JWT Decoder",
  description: "Decode and verify JSON Web Tokens",
  tokenLabel: "Token",
  tokenPlaceholder: "Paste a JWT",
  decodeButton: "Decode",
  resetButton: "Reset",
  secretLabel: "Secret",
  secretPlaceholder: "Enter the secret",
  verifyButton: "Verify",
  header: "Header",
  payload: "Payload",
  copy: "Copy",
  copied: "Copied!",
  expiryStatus: {
    valid: "Valid",
    expired: "Expired",
    notYetValid: "Not yet valid",
    noExpiry: "No expiry",
  },
  signatureStatus: {
    valid: "Signature valid",
    invalid: "Signature invalid",
    unsupported: "Unsupported algorithm",
  },
  errors: {
    invalidToken: "Invalid token",
    emptyToken: "Token is required",
  },
}

function base64UrlEncode(input: ArrayBuffer | string): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input)
  let binary = ""
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

async function signHs256(signingInput: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signingInput))
  return base64UrlEncode(sig)
}

async function buildToken(header: object, payload: object, secret = "supersecret"): Promise<string> {
  const headerPart = base64UrlEncode(JSON.stringify(header))
  const payloadPart = base64UrlEncode(JSON.stringify(payload))
  const signingInput = `${headerPart}.${payloadPart}`
  const signature = await signHs256(signingInput, secret)
  return `${signingInput}.${signature}`
}

describe("JwtDecoder", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("renders the title and description", () => {
    render(<JwtDecoder dictionary={dictionary} />)
    expect(screen.getByText(dictionary.title)).toBeInTheDocument()
    expect(screen.getByText(dictionary.description)).toBeInTheDocument()
  })

  it("disables the decode button until a token is entered", () => {
    render(<JwtDecoder dictionary={dictionary} />)
    expect(screen.getByRole("button", { name: dictionary.decodeButton })).toBeDisabled()

    fireEvent.change(screen.getByPlaceholderText(dictionary.tokenPlaceholder), {
      target: { value: "a.b.c" },
    })
    expect(screen.getByRole("button", { name: dictionary.decodeButton })).not.toBeDisabled()
  })

  it("shows an invalid token error for a malformed token", () => {
    render(<JwtDecoder dictionary={dictionary} />)
    fireEvent.change(screen.getByPlaceholderText(dictionary.tokenPlaceholder), {
      target: { value: "not-a-jwt" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.decodeButton }))

    expect(screen.getByText(dictionary.errors.invalidToken)).toBeInTheDocument()
  })

  it("decodes a valid token and shows a 'valid' expiry badge with formatted claims", async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600
    const token = await buildToken(
      { alg: "HS256", typ: "JWT" },
      { sub: "user-1", exp: futureExp }
    )

    render(<JwtDecoder dictionary={dictionary} />)
    fireEvent.change(screen.getByPlaceholderText(dictionary.tokenPlaceholder), {
      target: { value: token },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.decodeButton }))

    expect(await screen.findByText(dictionary.expiryStatus.valid)).toBeInTheDocument()
    expect(screen.getByText('"user-1"')).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`^${futureExp} \\(`))).toBeInTheDocument()
  })

  it("shows an 'expired' badge for a token whose exp is in the past", async () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600
    const token = await buildToken({ alg: "HS256" }, { exp: pastExp })

    render(<JwtDecoder dictionary={dictionary} />)
    fireEvent.change(screen.getByPlaceholderText(dictionary.tokenPlaceholder), {
      target: { value: token },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.decodeButton }))

    expect(await screen.findByText(dictionary.expiryStatus.expired)).toBeInTheDocument()
  })

  it("shows a 'not yet valid' badge for a token with a future nbf and no exp", async () => {
    const futureNbf = Math.floor(Date.now() / 1000) + 3600
    const token = await buildToken({ alg: "HS256" }, { nbf: futureNbf })

    render(<JwtDecoder dictionary={dictionary} />)
    fireEvent.change(screen.getByPlaceholderText(dictionary.tokenPlaceholder), {
      target: { value: token },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.decodeButton }))

    expect(await screen.findByText(dictionary.expiryStatus.notYetValid)).toBeInTheDocument()
  })

  it("shows a 'no expiry' badge for a token without exp or nbf", async () => {
    const token = await buildToken({ alg: "HS256" }, { sub: "user-1" })

    render(<JwtDecoder dictionary={dictionary} />)
    fireEvent.change(screen.getByPlaceholderText(dictionary.tokenPlaceholder), {
      target: { value: token },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.decodeButton }))

    expect(await screen.findByText(dictionary.expiryStatus.noExpiry)).toBeInTheDocument()
  })

  it("verifies a valid HS256 signature against the correct secret", async () => {
    const token = await buildToken({ alg: "HS256" }, { sub: "user-1" }, "supersecret")

    render(<JwtDecoder dictionary={dictionary} />)
    fireEvent.change(screen.getByPlaceholderText(dictionary.tokenPlaceholder), {
      target: { value: token },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.decodeButton }))
    await screen.findByText(dictionary.expiryStatus.noExpiry)

    fireEvent.change(screen.getByPlaceholderText(dictionary.secretPlaceholder), {
      target: { value: "supersecret" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.verifyButton }))

    expect(await screen.findByText(dictionary.signatureStatus.valid)).toBeInTheDocument()
  })

  it("reports an invalid signature for the wrong secret", async () => {
    const token = await buildToken({ alg: "HS256" }, { sub: "user-1" }, "supersecret")

    render(<JwtDecoder dictionary={dictionary} />)
    fireEvent.change(screen.getByPlaceholderText(dictionary.tokenPlaceholder), {
      target: { value: token },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.decodeButton }))
    await screen.findByText(dictionary.expiryStatus.noExpiry)

    fireEvent.change(screen.getByPlaceholderText(dictionary.secretPlaceholder), {
      target: { value: "wrong-secret" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.verifyButton }))

    expect(await screen.findByText(dictionary.signatureStatus.invalid)).toBeInTheDocument()
  })

  it("reports an unsupported algorithm for a non-HS256 token", async () => {
    const token = await buildToken({ alg: "RS256" }, { sub: "user-1" })

    render(<JwtDecoder dictionary={dictionary} />)
    fireEvent.change(screen.getByPlaceholderText(dictionary.tokenPlaceholder), {
      target: { value: token },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.decodeButton }))
    await screen.findByText(dictionary.expiryStatus.noExpiry)

    fireEvent.change(screen.getByPlaceholderText(dictionary.secretPlaceholder), {
      target: { value: "anything" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.verifyButton }))

    expect(await screen.findByText(dictionary.signatureStatus.unsupported)).toBeInTheDocument()
  })

  it("copies the header and payload claims to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })

    const token = await buildToken({ alg: "HS256" }, { sub: "user-1" })

    render(<JwtDecoder dictionary={dictionary} />)
    fireEvent.change(screen.getByPlaceholderText(dictionary.tokenPlaceholder), {
      target: { value: token },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.decodeButton }))
    await screen.findByText(dictionary.expiryStatus.noExpiry)

    const copyButtons = screen.getAllByRole("button", { name: new RegExp(dictionary.copy) })
    expect(copyButtons).toHaveLength(2)
    const [headerCopyButton, payloadCopyButton] = copyButtons

    fireEvent.click(headerCopyButton)
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(JSON.stringify({ alg: "HS256" }, null, 2)))
    expect(await screen.findByText(dictionary.copied)).toBeInTheDocument()

    fireEvent.click(payloadCopyButton)
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(JSON.stringify({ sub: "user-1" }, null, 2)))
  })

  it("resets the token, secret and decoded state when the reset button is clicked", async () => {
    const token = await buildToken({ alg: "HS256" }, { sub: "user-1" })

    render(<JwtDecoder dictionary={dictionary} />)
    const tokenInput = screen.getByPlaceholderText(dictionary.tokenPlaceholder) as HTMLTextAreaElement
    fireEvent.change(tokenInput, { target: { value: token } })
    fireEvent.click(screen.getByRole("button", { name: dictionary.decodeButton }))
    await screen.findByText(dictionary.expiryStatus.noExpiry)

    fireEvent.click(screen.getByRole("button", { name: dictionary.resetButton }))

    expect(tokenInput.value).toBe("")
    expect(screen.queryByText(dictionary.expiryStatus.noExpiry)).not.toBeInTheDocument()
  })
})
