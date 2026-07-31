"use client"

import * as React from "react"
import { Label } from "@components/ui/label"
import { Input } from "@components/ui/input"

interface TimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
}

export function TimePickerDemo({ date, setDate }: Readonly<TimePickerProps>) {
  const minuteRef = React.useRef<HTMLInputElement>(null)
  const hourRef = React.useRef<HTMLInputElement>(null)
  const secondRef = React.useRef<HTMLInputElement>(null)

  const [hour, setHour] = React.useState<number | string>(date ? date.getHours() : "")
  const [minute, setMinute] = React.useState<number | string>(date ? date.getMinutes() : "")
  const [second, setSecond] = React.useState<number | string>(date ? date.getSeconds() : "")

  // Re-sync from the parent only when it hands us a genuinely different moment
  // (compared by value, not object identity — every edit below produces a new
  // Date instance with the same clock value). This is React's documented
  // "adjust state during render" pattern, not an effect, so echoing the same
  // instant back never re-triggers anything.
  const dateTime = date ? date.getTime() : undefined
  const [prevDateTime, setPrevDateTime] = React.useState(dateTime)
  if (dateTime !== prevDateTime) {
    setPrevDateTime(dateTime)
    if (date) {
      setHour(date.getHours())
      setMinute(date.getMinutes())
      setSecond(date.getSeconds())
    } else {
      setHour("")
      setMinute("")
      setSecond("")
    }
  }

  // Compute and emit the updated Date directly from the change handlers
  // (which always close over the current `date` prop) instead of an effect —
  // avoids re-deriving a new Date purely because the parent echoed one back.
  function emitTime(next: { hour?: number; minute?: number; second?: number }) {
    if (!date) return
    const newDate = new Date(date)
    if (next.hour !== undefined) newDate.setHours(next.hour)
    if (next.minute !== undefined) newDate.setMinutes(next.minute)
    if (next.second !== undefined) newDate.setSeconds(next.second)
    setDate(newDate)
  }

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (Number.isNaN(value)) {
      setHour("")
      return
    }
    if (value >= 0 && value <= 23) {
      setHour(value)
      emitTime({ hour: value })
      if (value.toString().length === 2) minuteRef.current?.focus()
    }
  }

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (Number.isNaN(value)) {
      setMinute("")
      return
    }
    if (value >= 0 && value <= 59) {
      setMinute(value)
      emitTime({ minute: value })
      if (value.toString().length === 2) secondRef.current?.focus()
    }
  }

  const handleSecondChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (Number.isNaN(value)) {
      setSecond("")
      return
    }
    if (value >= 0 && value <= 59) {
      setSecond(value)
      emitTime({ second: value })
    }
  }

  return (
    <div className="flex items-end gap-2">
      <div className="grid gap-1 text-center">
        <Label htmlFor="hours" className="text-xs">
          Hours
        </Label>
        <Input
          ref={hourRef}
          id="hours"
          className="w-16 text-center"
          value={hour}
          onChange={handleHourChange}
          placeholder="00"
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="minutes" className="text-xs">
          Minutes
        </Label>
        <Input
          ref={minuteRef}
          id="minutes"
          className="w-16 text-center"
          value={minute}
          onChange={handleMinuteChange}
          placeholder="00"
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="seconds" className="text-xs">
          Seconds
        </Label>
        <Input
          ref={secondRef}
          id="seconds"
          className="w-16 text-center"
          value={second}
          onChange={handleSecondChange}
          placeholder="00"
        />
      </div>
    </div>
  )
}
