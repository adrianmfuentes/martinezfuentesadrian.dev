import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ContactForm } from "@components/contact-form"
import { submitContactRequest } from "@/app/actions/contact"
import { toast } from "@/hooks/use-toast"

vi.mock("framer-motion", () => {
  const React = require("react")
  // Cache the generated component per tag so `motion.div` (etc.) resolves to a
  // stable component identity across renders. Without this, the Proxy `get`
  // trap below would mint a brand-new forwardRef function on every property
  // access, and since JSX re-evaluates `motion.div` on every render, React
  // would see a different component type each time and force a full
  // unmount/remount of the subtree on every re-render (e.g. every keystroke) -
  // silently discarding any DOM node references captured beforehand.
  const cache = new Map<string, ReturnType<typeof React.forwardRef>>()
  const passthrough = (Tag: string) => {
    if (!cache.has(Tag)) {
      const Component = React.forwardRef((props: any, ref: any) => {
        const { children, ...rest } = props
        const { initial, animate, exit, transition, whileHover, whileTap, whileInView, viewport, variants, ...domProps } = rest
        return React.createElement(Tag, { ...domProps, ref }, children)
      })
      Component.displayName = `motion.${Tag}`
      cache.set(Tag, Component)
    }
    return cache.get(Tag)
  }
  return {
    motion: new Proxy({}, { get: (_, tag: string) => passthrough(tag) }),
    AnimatePresence: ({ children }: any) => children,
  }
})

vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }))
vi.mock("@/app/actions/contact", () => ({ submitContactRequest: vi.fn() }))

const dictionary = {
  title: "Contact",
  description: "Get in touch",
  name: "Name",
  email: "Email",
  subject: "Subject",
  message: "Message",
  send: "Send",
  success: "Success",
  error: "Error",
  priority: "Priority",
  priorityLow: "Low",
  priorityMedium: "Medium",
  priorityHigh: "High",
  placeholders: {
    name: "Your name",
    email: "Your email",
    subject: "Your subject",
    message: "Your message",
  },
  validation: {
    nameRequired: "Name must be at least 2 characters",
    emailRequired: "Please enter a valid email address",
    messageRequired: "Message must be at least 10 characters",
  },
  confirmation: {
    title: "Message sent!",
    message: "Your message was sent successfully.",
    response: "I will respond as soon as possible.",
    close: "Close",
  },
  contactMethods: {
    title: "Other ways to reach me",
    email: {
      label: "Email",
      value: "test@example.com",
      responseTime: "Within 24h",
    },
    linkedin: {
      label: "LinkedIn",
      contact_title: "Connect with me",
      value: "https://linkedin.com/in/test",
      responseTime: "Within 48h",
    },
    github: {
      label: "GitHub",
      contact_title: "Follow me",
      value: "https://github.com/test",
      responseTime: "Within a week",
    },
  },
  formInfo: {
    responseTime: "Fast response",
    available: "Currently available",
    availability: ["Mon-Fri 9am-5pm"],
  },
}

function fillValidForm(container: HTMLElement) {
  const nameInput = screen.getByPlaceholderText(dictionary.placeholders.name)
  const emailInput = screen.getByPlaceholderText(dictionary.placeholders.email)
  const messageInput = screen.getByPlaceholderText(dictionary.placeholders.message)

  fireEvent.change(nameInput, { target: { value: "John Doe" } })
  fireEvent.change(emailInput, { target: { value: "john@example.com" } })
  fireEvent.change(messageInput, { target: { value: "This is a valid message body." } })

  return { nameInput, emailInput, messageInput }
}

describe("ContactForm", () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it("renders the form title, description and fields", () => {
    render(<ContactForm dictionary={dictionary} />)

    expect(screen.getAllByText(dictionary.title)[0]).toBeInTheDocument()
    expect(screen.getAllByText(dictionary.description)[0]).toBeInTheDocument()
    expect(screen.getByPlaceholderText(dictionary.placeholders.name)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(dictionary.placeholders.email)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(dictionary.placeholders.subject)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(dictionary.placeholders.message)).toBeInTheDocument()
  })

  it("shows validation errors when submitted empty", async () => {
    const { container } = render(<ContactForm dictionary={dictionary} />)
    const form = container.querySelector("form")
    expect(form).not.toBeNull()

    fireEvent.submit(form!)

    await waitFor(() => {
      expect(screen.getByText(dictionary.validation.nameRequired)).toBeInTheDocument()
      expect(screen.getByText(dictionary.validation.emailRequired)).toBeInTheDocument()
      expect(screen.getByText(dictionary.validation.messageRequired)).toBeInTheDocument()
    })

    expect(submitContactRequest).not.toHaveBeenCalled()
  })

  it("shows an email validation error for an invalid email format while other fields are valid", async () => {
    const { container } = render(<ContactForm dictionary={dictionary} />)
    const form = container.querySelector("form")

    fireEvent.change(screen.getByPlaceholderText(dictionary.placeholders.name), { target: { value: "John Doe" } })
    fireEvent.change(screen.getByPlaceholderText(dictionary.placeholders.email), { target: { value: "not-an-email" } })
    fireEvent.change(screen.getByPlaceholderText(dictionary.placeholders.message), { target: { value: "This is a valid message body." } })

    fireEvent.submit(form!)

    await waitFor(() => {
      expect(screen.getByText(dictionary.validation.emailRequired)).toBeInTheDocument()
    })
    expect(submitContactRequest).not.toHaveBeenCalled()
  })

  it("submits successfully with valid data and shows the confirmation dialog", async () => {
    vi.mocked(submitContactRequest).mockResolvedValue({ success: true })

    const { container } = render(<ContactForm dictionary={dictionary} />)
    const form = container.querySelector("form")

    fillValidForm(container)

    fireEvent.submit(form!)

    await waitFor(() => {
      expect(submitContactRequest).toHaveBeenCalledTimes(1)
    })

    expect(submitContactRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "John Doe",
        email: "john@example.com",
        message: "This is a valid message body.",
        subject: "",
        priority: "medium",
        contactMethod: "message",
      })
    )

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining("enviado"),
        })
      )
    })

    await waitFor(() => {
      expect(screen.getAllByText(dictionary.confirmation.title)[0]).toBeInTheDocument()
    })
    expect(screen.getByText(dictionary.confirmation.message)).toBeInTheDocument()
  })

  it("surfaces an error message when submission fails", async () => {
    vi.mocked(submitContactRequest).mockResolvedValue({ success: false, error: "Failed to send contact request" })

    const { container } = render(<ContactForm dictionary={dictionary} />)
    const form = container.querySelector("form")

    fillValidForm(container)

    fireEvent.submit(form!)

    await waitFor(() => {
      expect(submitContactRequest).toHaveBeenCalledTimes(1)
    })

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
        })
      )
    })

    await waitFor(() => {
      expect(
        screen.getByText("Ha ocurrido un error al enviar tu mensaje. Por favor, intenta de nuevo más tarde.")
      ).toBeInTheDocument()
    })

    expect(screen.queryByText(dictionary.confirmation.title)).not.toBeInTheDocument()
  })

  it("surfaces a rate-limit specific error message", async () => {
    vi.mocked(submitContactRequest).mockResolvedValue({
      success: false,
      error: "Too many requests. Please try again later.",
    })

    const { container } = render(<ContactForm dictionary={dictionary} />)
    const form = container.querySelector("form")

    fillValidForm(container)
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(
        screen.getByText(
          "Has enviado demasiados mensajes. Por favor, espera un momento antes de intentar de nuevo."
        )
      ).toBeInTheDocument()
    })
  })

  it("updates the submitted priority when a different radio option is selected", async () => {
    vi.mocked(submitContactRequest).mockResolvedValue({ success: true })

    const { container } = render(<ContactForm dictionary={dictionary} />)
    const form = container.querySelector("form")

    fillValidForm(container)

    const highPriorityRadio = screen.getByRole("radio", { name: dictionary.priorityHigh })
    fireEvent.click(highPriorityRadio)

    fireEvent.submit(form!)

    await waitFor(() => {
      expect(submitContactRequest).toHaveBeenCalledTimes(1)
    })

    expect(submitContactRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        priority: "high",
      })
    )
  })

  it("closes the confirmation dialog when the close button is clicked", async () => {
    vi.mocked(submitContactRequest).mockResolvedValue({ success: true })

    const { container } = render(<ContactForm dictionary={dictionary} />)
    const form = container.querySelector("form")

    fillValidForm(container)
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(screen.getAllByText(dictionary.confirmation.title)[0]).toBeInTheDocument()
    })

    // The dialog has two "Close" buttons: our explicit confirmation button and
    // Radix's built-in X icon button (sr-only text "Close"). Target ours.
    const closeButtons = screen.getAllByRole("button", { name: dictionary.confirmation.close })
    fireEvent.click(closeButtons[0])

    await waitFor(() => {
      expect(screen.queryByText(dictionary.confirmation.message)).not.toBeInTheDocument()
    })
  })
})
