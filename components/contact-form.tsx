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
import { Send, Loader2, Calendar, MessageSquare, Video, Phone, Clock, CalendarCheck } from "lucide-react"
import { submitContactRequest } from "@/app/actions/contact"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")

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
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      subject: "",
      priority: "medium",
    },
  })

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
        contactMethod: activeTab,
        meetingDetails:
          activeTab === "meeting"
            ? {
                type: meetingType,
                date: selectedDate,
                time: selectedTime,
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
        setShowConfirmation(true)
      } else {
        throw new Error(result.error ?? "Failed to send contact request")
      }
    } catch (error) {
      console.error("Contact form error:", error)
      toast({
        title: "Error",
        description: dictionary.error ?? "An error occurred while sending your request.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate available dates (next 14 days)
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i + 1) // Start from tomorrow
    return date.toISOString().split("T")[0]
  })

  // Generate available time slots
  const availableTimes = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"]

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
                    <div>
                      <Label htmlFor="date" className="block mb-2">
                        Select Date
                      </Label>
                      <Select value={selectedDate} onValueChange={setSelectedDate}>
                        <SelectTrigger id="date">
                          <SelectValue placeholder="Select a date" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDates.map((date) => (
                            <SelectItem key={date} value={date}>
                              {new Date(date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="time" className="block mb-2">
                        Select Time
                      </Label>
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger id="time">
                          <SelectValue placeholder="Select a time" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTimes.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    disabled={isSubmitting || !selectedDate || !selectedTime}
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
              </TabsContent>

              <TabsContent value="call">
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
                            placeholder="Please provide your phone number and any details about the call..."
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
            <p className="text-sm text-muted-foreground">
              {activeTab === "message"
                ? "I'll respond to your message as soon as possible."
                : activeTab === "meeting"
                  ? `Your meeting request for ${selectedDate} at ${selectedTime} has been scheduled.`
                  : "I'll call you back at your preferred time."}
            </p>
          </div>
          <Button onClick={() => setShowConfirmation(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </section>
  )
}
