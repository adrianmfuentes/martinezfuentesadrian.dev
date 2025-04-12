"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Loader2, Calendar, MessageSquare, Video, Phone, Clock, CalendarCheck } from 'lucide-react'
import { submitContactRequest } from "@/app/actions/contact"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ContactFormProps {
  dictionary: {
    title: string
    subtitle: string
    name: string
    email: string
    message: string
    send: string
    success: string
    error: string
  }
}

export function ContactForm({ dictionary }: Readonly<ContactFormProps>) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("message")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [meetingType, setMeetingType] = useState("video")
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState<string>("")
  const [confirmationDetails, setConfirmationDetails] = useState({
    type: "",
    date: "",
    time: "",
    calendarLink: "",
  })

  const formSchema = z.object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    message: z.string().min(10, {
      message: "Message must be at least 10 characters.",
    }),
    subject: z.string().optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    phone: z.string().optional(),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      subject: "",
      priority: "medium",
      phone: "",
    },
  })

  // Generate available time slots based on the selected date
  const getAvailableTimeSlots = (selectedDate?: Date) => {
    if (!selectedDate) return []
    
    // Check if the selected date is today
    const today = new Date()
    const isToday = selectedDate.toDateString() === today.toDateString()
    
    // Base time slots
    const allTimeSlots = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
      "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
    ]
    
    // If it's today, filter out past times
    if (isToday) {
      const currentHour = today.getHours()
      const currentMinute = today.getMinutes()
      
      return allTimeSlots.filter(timeSlot => {
        const [hours, minutes] = timeSlot.split(':').map(Number)
        return (hours > currentHour) || (hours === currentHour && minutes > currentMinute + 30)
      })
    }
    
    // For weekend days, return fewer slots
    const dayOfWeek = selectedDate.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) { // 0 is Sunday, 6 is Saturday
      return ["10:00", "11:00", "12:00"]
    }
    
    return allTimeSlots
  }

  const availableTimeSlots = getAvailableTimeSlots(date)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // Sanitize inputs
      const sanitizedValues = {
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
        subject: values.subject?.trim() ?? "",
        priority: values.priority ?? "medium",
        phone: values.phone?.trim() ?? "",
        contactMethod: activeTab,
        meetingDetails:
          activeTab === "meeting"
            ? {
                type: meetingType,
                date: date ? format(date, "yyyy-MM-dd") : "",
                time: time,
              }
            : undefined,
      }

      // Send contact request using server action
      const result = await submitContactRequest(sanitizedValues)

      if (result.success) {
        toast({
          title: "Success!",
          description: dictionary.success,
        })
        form.reset()
        
        // Set confirmation details
        if (activeTab === "meeting" && date && time) {
          const formattedDate = format(date, "EEEE, MMMM do, yyyy")
          
          // Generate calendar file link
          const calendarLink = generateCalendarLink(
            values.name,
            values.email,
            `Meeting with ${values.name}`,
            values.message,
            date,
            time,
            meetingType
          )
          
          setConfirmationDetails({
            type: meetingType,
            date: formattedDate,
            time: time,
            calendarLink,
          })
        }
        
        setShowConfirmation(true)
      } else {
        throw new Error(result.error ?? "Failed to send contact request")
      }
    } catch (error) {
      console.error("Contact form error:", error)
      toast({
        title: "Error",
        description: dictionary.error,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to generate calendar file link
  function generateCalendarLink(
    name: string,
    email: string,
    subject: string,
    description: string,
    date: Date,
    time: string,
    meetingType: string
  ) {
    // Parse the time string
    const [hours, minutes] = time.split(":").map(Number)
    
    // Create start and end dates
    const startDate = new Date(date)
    startDate.setHours(hours, minutes, 0, 0)
    
    const endDate = new Date(startDate)
    endDate.setHours(startDate.getHours() + 1) // 1 hour meeting by default
    
    // Format dates for iCalendar
    const formatDateForICal = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, "")
    }
    
    const start = formatDateForICal(startDate)
    const end = formatDateForICal(endDate)
    
    // Determine location based on meeting type
    let location = ""
    if (meetingType === "video") {
      location = "Video call (link will be sent via email)"
    } else if (meetingType === "phone") {
      location = "Phone call"
    } else if (meetingType === "inperson") {
      location = "Office location"
    }
    
    // Create iCalendar content
    const icalContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Portfolio Website//Contact Form//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `SUMMARY:${subject}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `LOCATION:${location}`,
      `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
      `ORGANIZER;CN=${name}:mailto:${email}`,
      "STATUS:CONFIRMED",
      "SEQUENCE:0",
      "BEGIN:VALARM",
      "TRIGGER:-PT15M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Reminder",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n")
    
    // Create a Blob and generate a download link
    const blob = new Blob([icalContent], { type: "text/calendar;charset=utf-8" })
    return URL.createObjectURL(blob)
  }

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2 font-poppins">{dictionary.title}</h2>
        <p className="text-lg text-foreground/70">{dictionary.subtitle}</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="message" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Message</span>
                </TabsTrigger>
                <TabsTrigger value="meeting" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Meeting</span>
                </TabsTrigger>
                <TabsTrigger value="call" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>Request Call</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="message">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{dictionary.name}</FormLabel>
                            <FormControl>
                              <Input placeholder="Adrián Martínez" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{dictionary.email}</FormLabel>
                            <FormControl>
                              <Input placeholder="example123@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="What is this regarding?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <div className="flex space-x-4">
                            <RadioGroup
                              defaultValue={field.value}
                              onValueChange={field.onChange}
                              className="flex space-x-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="low" id="low" />
                                <Label htmlFor="low">Low</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="medium" id="medium" />
                                <Label htmlFor="medium">Medium</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="high" id="high" />
                                <Label htmlFor="high">High</Label>
                              </div>
                            </RadioGroup>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{dictionary.message}</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Your message here..." className="min-h-[150px]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {dictionary.send}...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          {dictionary.send}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="meeting">
                <Form {...form}>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Meeting Type</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                          variant={meetingType === "video" ? "default" : "outline"}
                          className="flex items-center justify-center gap-2 h-20"
                          onClick={() => setMeetingType("video")}
                        >
                          <Video className="h-5 w-5" />
                          <div>
                            <div className="font-medium">Video Call</div>
                            <div className="text-xs opacity-70">Google Meet / Zoom</div>
                          </div>
                        </Button>

                        <Button
                          variant={meetingType === "phone" ? "default" : "outline"}
                          className="flex items-center justify-center gap-2 h-20"
                          onClick={() => setMeetingType("phone")}
                        >
                          <Phone className="h-5 w-5" />
                          <div>
                            <div className="font-medium">Phone Call</div>
                            <div className="text-xs opacity-70">Direct phone call</div>
                          </div>
                        </Button>

                        <Button
                          variant={meetingType === "inperson" ? "default" : "outline"}
                          className="flex items-center justify-center gap-2 h-20"
                          onClick={() => setMeetingType("inperson")}
                        >
                          <Calendar className="h-5 w-5" />
                          <div>
                            <div className="font-medium">In Person</div>
                            <div className="text-xs opacity-70">Office meeting</div>
                          </div>
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Select Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              disabled={(date) => {
                                // Disable past dates and dates more than 30 days in the future
                                const today = new Date()
                                today.setHours(0, 0, 0, 0)
                                const thirtyDaysLater = new Date()
                                thirtyDaysLater.setDate(today.getDate() + 30)
                                return date < today || date > thirtyDaysLater
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label>Select Time</Label>
                        <Select
                          value={time}
                          onValueChange={setTime}
                          disabled={!date || availableTimeSlots.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a time" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTimeSlots.length > 0 ? (
                              availableTimeSlots.map((timeSlot) => (
                                <SelectItem key={timeSlot} value={timeSlot}>
                                  {timeSlot}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-slots" disabled>
                                No available time slots
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {date && availableTimeSlots.length === 0 && (
                          <p className="text-sm text-destructive">No available slots for this date</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{dictionary.name}</FormLabel>
                            <FormControl>
                              <Input placeholder="Adrián Martínez" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{dictionary.email}</FormLabel>
                            <FormControl>
                              <Input placeholder="example123@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {meetingType === "phone" && (
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meeting Agenda</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Please provide a brief description of what you'd like to discuss..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      onClick={form.handleSubmit(onSubmit)}
                      className="w-full gap-2"
                      disabled={isSubmitting || !date || !time}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Scheduling...
                        </>
                      ) : (
                        <>
                          <CalendarCheck className="h-4 w-4" />
                          Schedule Meeting
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </TabsContent>

              <TabsContent value="call">
                <Form {...form}>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{dictionary.name}</FormLabel>
                            <FormControl>
                              <Input placeholder="Adrián Martínez" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{dictionary.email}</FormLabel>
                            <FormControl>
                              <Input placeholder="example123@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <Label className="block mb-2">Preferred Time</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                          variant="outline"
                          className="flex items-center justify-center gap-2 h-16"
                          onClick={() => form.setValue("message", "Please call me as soon as possible.")}
                        >
                          <Clock className="h-4 w-4" />
                          <div>As Soon As Possible</div>
                        </Button>

                        <Button
                          variant="outline"
                          className="flex items-center justify-center gap-2 h-16"
                          onClick={() => form.setValue("message", "Please call me during morning hours (9AM-12PM).")}
                        >
                          <Clock className="h-4 w-4" />
                          <div>Morning (9AM-12PM)</div>
                        </Button>

                        <Button
                          variant="outline"
                          className="flex items-center justify-center gap-2 h-16"
                          onClick={() => form.setValue("message", "Please call me during afternoon hours (1PM-5PM).")}
                        >
                          <Clock className="h-4 w-4" />
                          <div>Afternoon (1PM-5PM)</div>
                        </Button>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Call Details</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Please provide any details about the call..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button onClick={form.handleSubmit(onSubmit)} className="w-full gap-2" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Requesting Call...
                        </>
                      ) : (
                        <>
                          <Phone className="h-4 w-4" />
                          Request Call Back
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Thank You!</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
              <CalendarCheck className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <p className="mb-2">Your request has been received successfully.</p>
            <p className="text-sm text-muted-foreground mb-4">
              {activeTab === "message"
                ? "I'll respond to your message as soon as possible."
                : activeTab === "meeting"
                  ? `Your ${confirmationDetails.type} meeting has been scheduled for ${confirmationDetails.date} at ${confirmationDetails.time}.`
                  : "I'll call you back at your preferred time."}
            </p>
            
            {activeTab === "meeting" && confirmationDetails.calendarLink && (
              <Button variant="outline" className="gap-2" asChild>
                <a href={confirmationDetails.calendarLink} download="meeting.ics">
                  <Calendar className="h-4 w-4" />
                  Add to Calendar
                </a>
              </Button>
            )}
          </div>
          <Button onClick={() => setShowConfirmation(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </section>
  )
}