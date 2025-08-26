#!/usr/bin/env node

/**
 * Script para testear la configuración de EmailJS
 * Ejecutar con: node scripts/test-emailjs.js
 */

require('dotenv').config({ path: '.env' })

function testEmailJSConfiguration() {
  console.log("🧪 Testeando configuración de EmailJS...\n")
  
  const errors = []
  const warnings = []
  
  // Verificar variables de entorno
  console.log("📋 Verificando variables de entorno:")
  
  if (process.env.EMAILJS_SERVICE_ID) {
    console.log("✅ EMAILJS_SERVICE_ID:", process.env.EMAILJS_SERVICE_ID)
  } else {
    console.log("❌ EMAILJS_SERVICE_ID: No configurado")
    errors.push("EMAILJS_SERVICE_ID no está configurado")
  }
  
  if (process.env.EMAILJS_PUBLIC_KEY) {
    console.log("✅ EMAILJS_PUBLIC_KEY:", process.env.EMAILJS_PUBLIC_KEY.substring(0, 8) + "...")
  } else {
    console.log("❌ EMAILJS_PUBLIC_KEY: No configurado")
    errors.push("EMAILJS_PUBLIC_KEY no está configurado")
  }
  
  const templateId = process.env.EMAILJS_CONTACT_TEMPLATE_ID ?? process.env.EMAILJS_TEMPLATE_ID
  if (templateId) {
    console.log("✅ TEMPLATE_ID:", templateId)
  } else {
    console.log("❌ TEMPLATE_ID: No configurado")
    errors.push("EMAILJS_TEMPLATE_ID o EMAILJS_CONTACT_TEMPLATE_ID debe estar configurado")
  }
  
  if (process.env.SITE_URL) {
    console.log("✅ SITE_URL:", process.env.SITE_URL)
  } else {
    console.log("⚠️ SITE_URL: No configurado (usando localhost por defecto)")
    warnings.push("SITE_URL no está configurado")
  }
  
  console.log("\n📊 Resumen:")
  
  if (errors.length === 0) {
    console.log("🎉 ¡Configuración completa! EmailJS debería funcionar correctamente.")
    
    if (warnings.length > 0) {
      console.log("\n⚠️ Advertencias:")
      warnings.forEach(warning => console.log(`   - ${warning}`))
    }
    
    console.log("\n💡 Próximos pasos:")
    console.log("   1. Asegúrate de que tu plantilla de EmailJS esté configurada correctamente")
    console.log("   2. Verifica que el servicio EmailJS esté activo")
    console.log("   3. Prueba enviando un mensaje desde tu formulario de contacto")
    
  } else {
    console.log("❌ Configuración incompleta. Errores encontrados:")
    errors.forEach(error => console.log(`   - ${error}`))
    
    console.log("\n🔧 Para configurar EmailJS:")
    console.log("   1. Visita https://www.emailjs.com/")
    console.log("   2. Crea una cuenta y configura un servicio")
    console.log("   3. Crea una plantilla de email")
    console.log("   4. Copia las credenciales a tu archivo .env.local")
    console.log("   5. Ejecuta este script nuevamente para verificar")
  }
}

testEmailJSConfiguration()
