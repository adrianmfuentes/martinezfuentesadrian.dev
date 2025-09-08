"use server"

/**
 * Función para testear la configuración de EmailJS
 * Verifica que todas las variables de entorno estén configuradas correctamente
 */
export async function testEmailJSConfiguration(): Promise<{
  success: boolean
  errors: string[]
  warnings: string[]
}> {
  const errors: string[] = []
  const warnings: string[] = []

  // Verificar variables de entorno requeridas
  if (!process.env.EMAILJS_SERVICE_ID) {
    errors.push("EMAILJS_SERVICE_ID no está configurado")
  }

  if (!process.env.EMAILJS_PUBLIC_KEY) {
    errors.push("EMAILJS_PUBLIC_KEY no está configurado")
  }

  const templateId = process.env.EMAILJS_CONTACT_TEMPLATE_ID ?? process.env.EMAILJS_TEMPLATE_ID
  if (!templateId) {
    errors.push("EMAILJS_TEMPLATE_ID o EMAILJS_CONTACT_TEMPLATE_ID debe estar configurado")
  }

  if (!process.env.SITE_URL) {
    warnings.push("SITE_URL no está configurado, usando localhost por defecto")
  }

  // Si hay errores, no continuar con el test
  if (errors.length > 0) {
    return {
      success: false,
      errors,
      warnings
    }
  }

  try {
    return {
      success: true,
      errors: [],
      warnings
    }
  } catch (error) {
    console.error("Error testing EmailJS configuration:", error)
    errors.push(`Error de configuración: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    
    return {
      success: false,
      errors,
      warnings
    }
  }
}
