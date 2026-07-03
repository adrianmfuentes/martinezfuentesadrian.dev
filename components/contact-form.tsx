"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"
import { Textarea } from "@components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form"
import { toast } from "@/hooks/use-toast"
import { Send, Loader2, CheckCircle, XCircle, Mail, MessageSquare, Clock, Zap } from 'lucide-react'
import { submitContactRequest } from "@/app/actions/contact"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group"
import { Label } from "@components/ui/label"
import { Alert, AlertDescription } from "@components/ui/alert"
import { Separator } from "@components/ui/separator"
import { motion } from "framer-motion"

// lucide-react's brand icons (Github, Linkedin) are deprecated in favor of https://simpleicons.org —
// inlined here so the icon keeps rendering without depending on a removed export.
function LinkedinIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function GithubIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

interface ContactFormProps {
  dictionary: {
    title: string
    description: string
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
    contactMethods: {
      title: string
      email: {
        label: string
        value: string
        responseTime: string
      }
      linkedin: {
        label: string
        contact_title: string
        value: string
        responseTime: string
      }
      github: {
        label: string
        contact_title: string
        value: string
        responseTime: string
      }
    }
    formInfo: {
      responseTime: string
      available: string
      availability: string[]
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
      const sanitizedValues = {
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
        subject: values.subject?.trim() ?? "",
        priority: values.priority ?? "medium",
        contactMethod: "message" as const,
      }

      const result = await submitContactRequest(sanitizedValues)

      if (result.success) {        
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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-2 font-poppins">{dictionary.title}</h2>
        <p className="text-base text-foreground/60 max-w-2xl mx-auto">{dictionary.description}</p>
      </div>

      <div className="max-w-6xl mx-auto">
        {submitStatus.type && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
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
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Right Column - Form (First on mobile, last on desktop) */}
          <motion.div
            className="lg:col-span-2 order-first lg:order-last"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Card className="backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 shadow-lg hover:shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  Envía tu mensaje
                </CardTitle>
                <CardDescription>Completa el formulario y me pondré en contacto contigo</CardDescription>
              </CardHeader>
              <Separator className="mb-0" />
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">{dictionary.name}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder={dictionary.placeholders.name}
                                  {...field}
                                  className="pl-10"
                                />
                                <MessageSquare className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">{dictionary.email}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder={dictionary.placeholders.email}
                                  {...field}
                                  className="pl-10"
                                />
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">{dictionary.subject}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder={dictionary.placeholders.subject}
                                {...field}
                                className="pl-10"
                              />
                              <Zap className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">{dictionary.priority}</FormLabel>
                          <RadioGroup
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                            className="flex gap-4 pt-2"
                          >
                            <motion.div className="flex items-center space-x-2 cursor-pointer group" whileHover={{ scale: 1.05 }}>
                              <RadioGroupItem value="low" id="low" />
                              <Label htmlFor="low" className="cursor-pointer text-sm group-hover:text-primary transition-colors">{dictionary.priorityLow}</Label>
                            </motion.div>
                            <motion.div className="flex items-center space-x-2 cursor-pointer group" whileHover={{ scale: 1.05 }}>
                              <RadioGroupItem value="medium" id="medium" />
                              <Label htmlFor="medium" className="cursor-pointer text-sm group-hover:text-primary transition-colors">{dictionary.priorityMedium}</Label>
                            </motion.div>
                            <motion.div className="flex items-center space-x-2 cursor-pointer group" whileHover={{ scale: 1.05 }}>
                              <RadioGroupItem value="high" id="high" />
                              <Label htmlFor="high" className="cursor-pointer text-sm group-hover:text-primary transition-colors">{dictionary.priorityHigh}</Label>
                            </motion.div>
                          </RadioGroup>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">{dictionary.message}</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder={dictionary.placeholders.message}
                              className="min-h-[160px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        type="submit"
                        className="w-full gap-2 transition-all duration-200 text-base font-medium py-6"
                        disabled={isSubmitting}
                        size="lg"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Enviando...
                          </>
                        ) : submitStatus.type === 'success' ? (
                          <>
                            <CheckCircle className="h-5 w-5" />
                            ¡Enviado!
                          </>
                        ) : (
                          <>
                            <Send className="h-5 w-5" />
                            {dictionary.send}
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Left Column - Info & Alternative Contact Methods (Second on mobile, first on desktop) */}
          <motion.div
            className="lg:col-span-1 space-y-6 order-last lg:order-first"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Contact Methods Card */}
            <motion.div variants={itemVariants}>
              <Card className="h-full backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors duration-300">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    {dictionary.contactMethods.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Email */}
                  <motion.a
                    href={`mailto:${dictionary.contactMethods.email.value}`}
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/75 transition-colors group cursor-pointer"
                    whileHover={{ x: 4 }}
                  >
                    <Mail className="h-5 w-5 text-primary mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{dictionary.contactMethods.email.label}</p>
                      <p className="text-xs text-foreground/60 truncate hover:text-foreground underline">{dictionary.contactMethods.email.value}</p>
                      <p className="text-xs text-primary mt-1">{dictionary.contactMethods.email.responseTime}</p>
                    </div>
                  </motion.a>

                  {/* LinkedIn */}
                  <motion.a
                    href={dictionary.contactMethods.linkedin.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/75 transition-colors group cursor-pointer"
                    whileHover={{ x: 4 }}
                  >
                    <LinkedinIcon className="h-5 w-5 text-primary mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{dictionary.contactMethods.linkedin.label}</p>
                      <p className="text-xs text-foreground/60 hover:text-foreground underline">{dictionary.contactMethods.linkedin.contact_title}</p>
                      <p className="text-xs text-primary mt-1">{dictionary.contactMethods.linkedin.responseTime}</p>
                    </div>
                  </motion.a>

                  {/* GitHub */}
                  <motion.a
                    href={dictionary.contactMethods.github.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/75 transition-colors group cursor-pointer"
                    whileHover={{ x: 4 }}
                  >
                    <GithubIcon className="h-5 w-5 text-primary mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{dictionary.contactMethods.github.label}</p>
                      <p className="text-xs text-foreground/60 hover:text-foreground underline">{dictionary.contactMethods.github.contact_title}</p>
                      <p className="text-xs text-primary mt-1">{dictionary.contactMethods.github.responseTime}</p>
                    </div>
                  </motion.a>
                </CardContent>
              </Card>
            </motion.div>

            {/* Response Time Info - Simplified */}
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-foreground/70 mb-3 font-medium">{dictionary.formInfo.available}</p>
                      <div className="space-y-1">
                        {dictionary.formInfo.availability.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">{dictionary.confirmation.title}</DialogTitle>
          </DialogHeader>
          <motion.div
            className="py-6 text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <motion.div
              className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6, repeat: 1 }}
            >
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-300" />
            </motion.div>
            <p className="font-medium mb-2 text-lg">{dictionary.confirmation.message}</p>
            <p className="text-sm text-muted-foreground mb-6">
              {dictionary.confirmation.response}
            </p>
          </motion.div>
          <Button 
            onClick={() => setShowConfirmation(false)} 
            className="w-full"
          >
            {dictionary.confirmation.close}
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  )
}