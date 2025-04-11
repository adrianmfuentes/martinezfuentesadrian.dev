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
import { Send, Loader2 } from "lucide-react"

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
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // In a real implementation, this would send the form data to a server
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Success!",
        description: dictionary.success,
      })

      form.reset()
    } catch (error) {
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

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
