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

  // Update component state when date changes
  React.useEffect(() => {
    if (date) {
      setHour(date.getHours())
      setMinute(date.getMinutes())
      setSecond(date.getSeconds())
    } else {
      setHour("")
      setMinute("")
      setSecond("")
    }
  }, [date])

  // Update date object when time changes
  const handleTimeChange = React.useCallback(() => {
    if (!date) return

    const newDate = new Date(date)
    if (typeof hour === "number") newDate.setHours(hour)
    if (typeof minute === "number") newDate.setMinutes(minute)
    if (typeof second === "number") newDate.setSeconds(second)
    setDate(newDate)
  }, [date, hour, minute, second, setDate])

  React.useEffect(() => {
    handleTimeChange()
  }, [hour, minute, second, handleTimeChange])

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (isNaN(value)) {
      setHour("")
      return
    }
    if (value >= 0 && value <= 23) {
      setHour(value)
      if (value.toString().length === 2) minuteRef.current?.focus()
    }
  }

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (isNaN(value)) {
      setMinute("")
      return
    }
    if (value >= 0 && value <= 59) {
      setMinute(value)
      if (value.toString().length === 2) secondRef.current?.focus()
    }
  }

  const handleSecondChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (isNaN(value)) {
      setSecond("")
      return
    }
    if (value >= 0 && value <= 59) {
      setSecond(value)
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