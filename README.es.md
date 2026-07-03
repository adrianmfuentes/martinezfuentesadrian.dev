# martinezfuentesadrian.dev

Sitio web personal y portfolio de Adrián Martínez Fuentes, construido con Next.js. El sitio es bilingüe (inglés y español), incluye un conjunto de pequeñas herramientas web orientadas a seguridad, y se ejecuta como contenedor Docker en un servidor propio.

Sitio en producción: https://amf.amfserver.duckdns.org

## Descripción general

El proyecto funciona como portfolio, CV y punto de contacto, y además aloja varias utilidades independientes (escáner de puertos, validador de cabeceras HTTP, comprobador de certificados, herramientas de contraseñas y una herramienta básica de descubrimiento web) que sirven también como muestra del tipo de trabajo que realiza el autor del sitio. Todas las páginas visibles para el usuario viven bajo una ruta con prefijo de idioma (`/en` o `/es`), con las traducciones almacenadas como diccionarios JSON.

## Tecnologías

- Next.js 16 (App Router, Turbopack)
- React 19 y TypeScript
- Tailwind CSS con componentes shadcn/ui (basados en primitivas de Radix)
- React Three Fiber y Drei para los elementos 3D de la página de inicio
- Framer Motion para las transiciones de página y de componentes
- React Hook Form con Zod para la validación de formularios
- Groq SDK para la función de chat
- Upstash Redis para el límite de peticiones (rate limiting)
- EmailJS para el formulario de contacto

## Estructura del proyecto

```text
app/
  [lang]/            Páginas localizadas (about, cv, portfolio, contact, tools/*)
  [lang]/dictionaries/  Ficheros de traducción en.json y es.json
  api/                 Rutas de API (comprobación de certificados, contraseñas,
                        escaneo de puertos, validación de cabeceras, descubrimiento web)
  actions/              Server actions (formulario de contacto, email, chat, gestión de PDF)
components/
  ui/                   Componentes base de shadcn/ui
lib/                    Utilidades compartidas (gestión de variables de entorno, rate limiting, etc.)
scripts/                Scripts de mantenimiento y pruebas
```

## Herramientas de seguridad

Bajo `/tools` hay disponible un conjunto de pequeñas herramientas, cada una implementada como su propia ruta y endpoint de API:

- Comprobador de certificados: inspecciona los detalles del certificado TLS de un dominio.
- Validador de cabeceras HTTP: revisa las cabeceras de seguridad devueltas por una URL determinada.
- Comprobador y generador de contraseñas: evalúa la fortaleza de una contraseña y genera contraseñas seguras.
- Escáner de puertos: realiza un escaneo básico sobre un host objetivo, limitado por las restricciones CORS del navegador.
- Descubrimiento web: recopila información públicamente disponible sobre un sitio objetivo.

Estas herramientas están pensadas para uso personal, autorizado y con fines educativos.

## Puesta en marcha

Requisitos: Node.js 18 o superior, y pnpm.

```bash
pnpm install
pnpm dev
```

El sitio estará disponible en `http://localhost:3000`.

Otros comandos útiles:

```bash
pnpm build          # Build de producción
pnpm start          # Arranca el build de producción
pnpm lint           # Ejecuta ESLint
pnpm test:emailjs   # Prueba la integración con EmailJS
```

### Variables de entorno

La aplicación lee su configuración a partir de variables de entorno en tiempo de ejecución. Copia `.env.example` si existe, o define las siguientes según sea necesario:

| Variable | Uso |
| --- | --- |
| `EMAILJS_SERVICE_ID`, `EMAILJS_PUBLIC_KEY`, `EMAILJS_CONTACT_TEMPLATE_ID` | Envío del formulario de contacto a través de EmailJS |
| `GROQ_API_KEY` | Función de chat |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Almacenamiento para el límite de peticiones |
| `ADMIN_SECRET`, `ADMIN_PASSWORD`, `ADMIN_ALLOWED_IPS` | Autenticación y control de acceso al panel de administración |
| `GITHUB_TOKEN` | Límites de peticiones más altos para la API de estadísticas de GitHub |
| `SITE_URL` | URL base usada en enlaces y plantillas de correo |

Ninguna de estas variables es necesaria para navegar el sitio en local, pero las funciones que dependen de ellas quedarán desactivadas o devolverán un error hasta que se configuren.

## Despliegue e integración continua

La aplicación se empaqueta como imagen Docker (`Dockerfile`, usando el output standalone de Next.js). En cada push a `main`, GitHub Actions construye esa imagen para `linux/arm64`, la publica en el GitHub Container Registry, y la despliega por SSH en un servidor propio con Docker y Nginx Proxy Manager (`docker-compose.yml`). GitHub Actions también ejecuta una comprobación de build y de auditoría de dependencias en cada push y pull request, y Dependabot mantiene las dependencias actualizadas, fusionando automáticamente las actualizaciones menores una vez que el build pasa.

Desplegar requiere los siguientes secrets del repositorio: `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`, `SSH_DEPLOY_PATH`, y opcionalmente `SSH_PORT`. El servidor necesita un fichero `.env` persistente en `SSH_DEPLOY_PATH` junto a `docker-compose.yml`, con las variables de entorno indicadas arriba.

## Licencia

Este es un proyecto personal. El código fuente es público como referencia, pero no está licenciado para su reutilización o redistribución.

## Contacto

Adrián Martínez Fuentes — disponible a través del formulario de contacto del sitio.
