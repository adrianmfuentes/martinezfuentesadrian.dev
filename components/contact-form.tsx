"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"
import { Textarea } from "@components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form"
import { toast } from "@/hooks/use-toast"
import { Send, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { submitContactRequest } from "@/app/actions/contact"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group"
import { Label } from "@components/ui/label"
import { Alert, AlertDescription } from "@components/ui/alert" 

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
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

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
    setSubmitStatus({ type: null, message: '' })

    try {
      console.log("🚀 Enviando formulario de contacto...");
      
      // Sanitize inputs
      const sanitizedValues = {
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
        subject: values.subject?.trim() ?? "",
        priority: values.priority ?? "medium",
        contactMethod: "message" as const,
      }

      // Send contact request using server action
      const result = await submitContactRequest(sanitizedValues)

      if (result.success) {
        console.log("✅ Formulario enviado exitosamente");
        
        // Mostrar notificación de éxito elegante
        toast({
          title: "¡Mensaje enviado con éxito! ✨",
          description: "Gracias por contactarme. Te responderé lo antes posible.",
          duration: 5000,
        })
        
        setSubmitStatus({
          type: 'success',
          message: 'Tu mensaje ha sido enviado correctamente. Te responderé pronto.'
        })
        
        form.reset()
        setShowConfirmation(true)
      } else {
        throw new Error(result.error ?? "Failed to send contact request")
      }
    } catch (error) {
      console.error("❌ Error en formulario de contacto:", error)
      
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      
      // Determinar el tipo de error y mostrar mensaje apropiado
      let userFriendlyMessage = ""
      if (errorMessage.includes("Rate limit") || errorMessage.includes("Too many requests")) {
        userFriendlyMessage = "Has enviado demasiados mensajes. Por favor, espera un momento antes de intentar de nuevo."
      } else if (errorMessage.includes("spam")) {
        userFriendlyMessage = "Tu mensaje ha sido marcado como spam. Por favor, revisa el contenido e intenta de nuevo."
      } else if (errorMessage.includes("configuration") || errorMessage.includes("SERVICE_ID") || errorMessage.includes("PUBLIC_KEY") || errorMessage.includes("TEMPLATE_ID")) {
        userFriendlyMessage = "Hay un problema con la configuración del servicio de email. Por favor, contacta al administrador."
      } else if (errorMessage.includes("authentication")) {
        userFriendlyMessage = "Error de autenticación del servicio de email. Por favor, intenta más tarde."
      } else if (errorMessage.includes("quota")) {
        userFriendlyMessage = "Se ha excedido el límite de emails. Por favor, intenta más tarde."
      } else if (errorMessage.includes("unavailable")) {
        userFriendlyMessage = "El servicio de email no está disponible temporalmente. Por favor, intenta más tarde."
      } else if (errorMessage.includes("Invalid form data")) {
        userFriendlyMessage = "Los datos del formulario no son válidos. Por favor, revisa la información e intenta de nuevo."
      } else {
        userFriendlyMessage = "Ha ocurrido un error al enviar tu mensaje. Por favor, intenta de nuevo más tarde."
      }
      
      toast({
        title: "Error al enviar mensaje ❌",
        description: userFriendlyMessage,
        variant: "destructive",
        duration: 8000,
      })
      
      setSubmitStatus({
        type: 'error',
        message: userFriendlyMessage
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
        {/* Alert de estado */}
        {submitStatus.type && (
          <div className="mb-6">
            <Alert className={`${
              submitStatus.type === 'success' 
                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' 
                : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
            }`}>
              {submitStatus.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <AlertDescription className={`${
                submitStatus.type === 'success' 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {submitStatus.message}
              </AlertDescription>
            </Alert>
          </div>
        )}

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

                <Button 
                  type="submit" 
                  className="w-full gap-2 transition-all duration-200" 
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando mensaje...
                    </>
                  ) : submitStatus.type === 'success' ? ( // NOSONAR
                    <>
                      <CheckCircle className="h-4 w-4" />
                      ¡Enviado!
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