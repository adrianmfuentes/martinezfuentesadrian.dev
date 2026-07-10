import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { HashGenerator } from "@components/hash-generator"

const dictionary = {
  title: "Hash Generator",
  description: "Generate cryptographic hashes",
  textTab: "Text",
  fileTab: "File",
  textLabel: "Text",
  textPlaceholder: "Enter text to hash",
  fileLabel: "File",
  filePlaceholder: "Choose a file",
  generateButton: "Generate",
  generating: "Generating...",
  resetButton: "Reset",
  copy: "Copy",
  copied: "Copied!",
  errors: {
    empty: "Please enter some text",
    fileTooLarge: "File is too large",
  },
}

// Known digests for the input "abc"
const MD5_ABC = "900150983cd24fb0d6963f7d28e17f72"
const SHA1_ABC = "a9993e364706816aba3e25717850c26c9cd0d89d"
const SHA256_ABC = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
const SHA512_ABC =
  "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f"

describe("HashGenerator", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("renders the title and description", () => {
    render(<HashGenerator dictionary={dictionary} />)
    expect(screen.getByText(dictionary.title)).toBeInTheDocument()
    expect(screen.getByText(dictionary.description)).toBeInTheDocument()
  })

  it("disables the generate button until text is entered", () => {
    render(<HashGenerator dictionary={dictionary} />)
    expect(screen.getByRole("button", { name: dictionary.generateButton })).toBeDisabled()

    fireEvent.change(screen.getByPlaceholderText(dictionary.textPlaceholder), {
      target: { value: "abc" },
    })
    expect(screen.getByRole("button", { name: dictionary.generateButton })).not.toBeDisabled()
  })

  it("computes the known MD5/SHA-1/SHA-256/SHA-512 digests of 'abc' from text input", async () => {
    render(<HashGenerator dictionary={dictionary} />)
    fireEvent.change(screen.getByPlaceholderText(dictionary.textPlaceholder), {
      target: { value: "abc" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.generateButton }))

    expect(await screen.findByText(MD5_ABC)).toBeInTheDocument()
    expect(screen.getByText(SHA1_ABC)).toBeInTheDocument()
    expect(screen.getByText(SHA256_ABC)).toBeInTheDocument()
    expect(screen.getByText(SHA512_ABC)).toBeInTheDocument()
  })

  it("switches to file mode and back to text mode", () => {
    render(<HashGenerator dictionary={dictionary} />)
    fireEvent.click(screen.getByRole("button", { name: dictionary.fileTab }))
    expect(screen.getByText(dictionary.filePlaceholder)).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: dictionary.textTab }))
    expect(screen.getByPlaceholderText(dictionary.textPlaceholder)).toBeInTheDocument()
  })

  it("switches to file mode, hashes an uploaded file, and shows its name", async () => {
    render(<HashGenerator dictionary={dictionary} />)
    fireEvent.click(screen.getByRole("button", { name: dictionary.fileTab }))

    const file = new File(["abc"], "message.txt", { type: "text/plain" })
    // jsdom's File/Blob don't implement arrayBuffer() — stub it like a real browser would.
    file.arrayBuffer = async () => new TextEncoder().encode("abc").buffer
    const input = document.getElementById("hash-file-input") as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    expect(await screen.findByText("message.txt")).toBeInTheDocument()
    expect(await screen.findByText(MD5_ABC)).toBeInTheDocument()
  })

  it("shows a file-too-large error and skips hashing for an oversized file", async () => {
    render(<HashGenerator dictionary={dictionary} />)
    fireEvent.click(screen.getByRole("button", { name: dictionary.fileTab }))

    const file = new File(["abc"], "big.bin")
    Object.defineProperty(file, "size", { value: 26 * 1024 * 1024 })
    const input = document.getElementById("hash-file-input") as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    expect(await screen.findByText(dictionary.errors.fileTooLarge)).toBeInTheDocument()
    expect(screen.queryByText(MD5_ABC)).not.toBeInTheDocument()
  })

  it("copies a hash to the clipboard and shows the copied state", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })

    render(<HashGenerator dictionary={dictionary} />)
    fireEvent.change(screen.getByPlaceholderText(dictionary.textPlaceholder), {
      target: { value: "abc" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.generateButton }))

    await screen.findByText(MD5_ABC)

    const copyButtons = screen.getAllByRole("button", { name: new RegExp(dictionary.copy) })
    fireEvent.click(copyButtons[0])

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(MD5_ABC))
    expect(await screen.findByText(dictionary.copied)).toBeInTheDocument()
  })

  it("resets text, hashes and error when the reset button is clicked", async () => {
    render(<HashGenerator dictionary={dictionary} />)
    const textarea = screen.getByPlaceholderText(dictionary.textPlaceholder) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: "abc" } })
    fireEvent.click(screen.getByRole("button", { name: dictionary.generateButton }))

    await screen.findByText(MD5_ABC)

    fireEvent.click(screen.getByRole("button", { name: dictionary.resetButton }))

    expect(textarea.value).toBe("")
    expect(screen.queryByText(MD5_ABC)).not.toBeInTheDocument()
  })
})
