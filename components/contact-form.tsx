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
import { Send, Loader2 } from 'lucide-react'
import { submitContactRequest } from "@/app/actions/contact"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface ContactFormProps {
  dictionary: {
    title: string
    subtitle: string
    name: string
    email: string
    subject: string
    message: string
    send: string
    success: string
    error: string
    priority: string
    priorityLow: string
    priorityMedium: string
    priorityHigh: string
    placeholders: {
      name: string
      email: string
      subject: string
      message: string
    }
    validation: {
      nameRequired: string
      emailRequired: string
      messageRequired: string
    }
    confirmation: {
      title: string
      message: string
      response: string
      close: string
    }
  }
}

export function ContactForm({ dictionary }: Readonly<ContactFormProps>) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const formSchema = z.object({
    name: z.string().min(2, {
      message: dictionary.validation.nameRequired,
    }),
    email: z.string()
      .regex(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        { message: dictionary.validation.emailRequired }
      )
      .refine(val => !!val, {
        message: dictionary.validation.emailRequired,
      }),
    message: z.string().min(10, {
      message: dictionary.validation.messageRequired,
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
        contactMethod: "message",
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
        description: dictionary.error,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
                          <Input placeholder={dictionary.placeholders.name} {...field} />
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
                          <Input placeholder={dictionary.placeholders.email} {...field} />
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
                      <FormLabel>{dictionary.subject}</FormLabel>
                      <FormControl>
                        <Input placeholder={dictionary.placeholders.subject} {...field} />
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
                      <FormLabel>{dictionary.priority}</FormLabel>
                      <div className="flex space-x-4">
                        <RadioGroup
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          className="flex space-x-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="low" id="low" />
                            <Label htmlFor="low">{dictionary.priorityLow}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="medium" id="medium" />
                            <Label htmlFor="medium">{dictionary.priorityMedium}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="high" id="high" />
                            <Label htmlFor="high">{dictionary.priorityHigh}</Label>
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
                        <Textarea 
                          placeholder={dictionary.placeholders.message} 
                          className="min-h-[150px]" 
                          {...field} 
                        />
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
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-xl">{dictionary.confirmation.title}</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
              <Send className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <p className="mb-2">{dictionary.confirmation.message}</p>
            <p className="text-sm text-muted-foreground mb-4">
              {dictionary.confirmation.response}
            </p>
          </div>
          <Button onClick={() => setShowConfirmation(false)}>{dictionary.confirmation.close}</Button>
        </DialogContent>
      </Dialog>
    </section>
  )
}