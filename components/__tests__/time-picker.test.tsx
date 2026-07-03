import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TimePickerDemo } from "@/components/time-picker"

describe("TimePickerDemo", () => {
  it("initializes hour/minute/second inputs from the given date", () => {
    const date = new Date(2026, 0, 1, 9, 5, 30)
    render(<TimePickerDemo date={date} setDate={vi.fn()} />)

    expect(screen.getByLabelText("Hours")).toHaveValue("9")
    expect(screen.getByLabelText("Minutes")).toHaveValue("5")
    expect(screen.getByLabelText("Seconds")).toHaveValue("30")
  })

  it("renders empty inputs when date is undefined", () => {
    render(<TimePickerDemo date={undefined} setDate={vi.fn()} />)

    expect(screen.getByLabelText("Hours")).toHaveValue("")
    expect(screen.getByLabelText("Minutes")).toHaveValue("")
    expect(screen.getByLabelText("Seconds")).toHaveValue("")
  })

  it("calls setDate with an updated hour when a valid hour is typed", async () => {
    const setDate = vi.fn()
    const date = new Date(2026, 0, 1, 9, 5, 30)
    const user = userEvent.setup()
    render(<TimePickerDemo date={date} setDate={setDate} />)

    const hourInput = screen.getByLabelText("Hours")
    await user.clear(hourInput)
    await user.type(hourInput, "14")

    expect(setDate).toHaveBeenCalled()
    const lastCallDate = setDate.mock.calls.at(-1)?.[0] as Date
    expect(lastCallDate.getHours()).toBe(14)
  })

  it("ignores an out-of-range hour value", async () => {
    const setDate = vi.fn()
    const date = new Date(2026, 0, 1, 9, 5, 30)
    const user = userEvent.setup()
    render(<TimePickerDemo date={date} setDate={setDate} />)

    const hourInput = screen.getByLabelText("Hours")
    await user.clear(hourInput)
    await user.type(hourInput, "99")

    // 99 is out of the 0-23 range, so the hour input keeps its last valid value
    expect(hourInput).toHaveValue("9")
  })

  it("clears the field when a non-numeric value is entered", async () => {
    const setDate = vi.fn()
    const date = new Date(2026, 0, 1, 9, 5, 30)
    const user = userEvent.setup()
    render(<TimePickerDemo date={date} setDate={setDate} />)

    const minuteInput = screen.getByLabelText("Minutes")
    await user.clear(minuteInput)

    expect(minuteInput).toHaveValue("")
  })

  it("updates minute state on valid input within range", async () => {
    const setDate = vi.fn()
    const date = new Date(2026, 0, 1, 9, 5, 30)
    const user = userEvent.setup()
    render(<TimePickerDemo date={date} setDate={setDate} />)

    const minuteInput = screen.getByLabelText("Minutes")
    await user.clear(minuteInput)
    await user.type(minuteInput, "45")

    expect(minuteInput).toHaveValue("45")
    const lastCallDate = setDate.mock.calls.at(-1)?.[0] as Date
    expect(lastCallDate.getMinutes()).toBe(45)
  })

  it("updates second state on valid input within range", async () => {
    const setDate = vi.fn()
    const date = new Date(2026, 0, 1, 9, 5, 30)
    const user = userEvent.setup()
    render(<TimePickerDemo date={date} setDate={setDate} />)

    const secondInput = screen.getByLabelText("Seconds")
    await user.clear(secondInput)
    await user.type(secondInput, "12")

    expect(secondInput).toHaveValue("12")
    const lastCallDate = setDate.mock.calls.at(-1)?.[0] as Date
    expect(lastCallDate.getSeconds()).toBe(12)
  })

  it("resets its internal state when a new date instance is passed in", () => {
    const setDate = vi.fn()
    const date1 = new Date(2026, 0, 1, 9, 5, 30)
    const { rerender } = render(<TimePickerDemo date={date1} setDate={setDate} />)

    expect(screen.getByLabelText("Hours")).toHaveValue("9")

    const date2 = new Date(2026, 0, 1, 20, 15, 45)
    rerender(<TimePickerDemo date={date2} setDate={setDate} />)

    expect(screen.getByLabelText("Hours")).toHaveValue("20")
    expect(screen.getByLabelText("Minutes")).toHaveValue("15")
    expect(screen.getByLabelText("Seconds")).toHaveValue("45")
  })
})
