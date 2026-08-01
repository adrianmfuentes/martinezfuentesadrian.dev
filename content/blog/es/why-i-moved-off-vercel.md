---
title: "Por qué dejé Vercel y muevo este portfolio a mi propio servidor"
description: "Cómo acabé desplegando este sitio en un servidor Oracle Ampere A1 con Docker, Portainer y Nginx Proxy Manager, y los problemas reales que tuve que resolver por el camino."
date: "2026-08-01"
tags: ["Docker", "CI/CD", "Self-hosting"]
---

Vercel funcionaba bien para este portfolio. Pero quería entender de verdad qué pasa entre `git push` y una petición HTTP siendo servida, sin una plataforma abstrayendo esa parte. Así que este sitio ahora corre como un contenedor Docker en un servidor Oracle Ampere A1 (ARM64) propio, con Portainer y Nginx Proxy Manager por delante.

## La pieza central: Next.js en modo standalone

`output: 'standalone'` en `next.config.js` produce un `server.js` autocontenido, sin necesidad de `node_modules` completo en producción. El Dockerfile final es una imagen `node:22-alpine` minúscula que copia ese standalone más `public/` y `.next/static`. La parte menos obvia: el blog lee los `.md` de `content/` desde disco en tiempo de petición (`fs.readFile`), no vía import estático, así que el build trace de Next no lo sigue — hay que copiar esa carpeta a mano en el Dockerfile o los posts desaparecen en producción.

## ARM nativo, no QEMU

Oracle Ampere A1 es ARM64, así que la imagen tiene que compilarse para `linux/arm64`. Mi primer intento usaba `ubuntu-latest` con QEMU emulando ARM en el build de GitHub Actions, y `pnpm rebuild sharp` (el binario nativo de Next Image Optimization) petaba con una instrucción ilegal a mitad de la emulación. La solución fue usar un runner ARM nativo (`ubuntu-24.04-arm`, gratuito para repos públicos) y saltarme la emulación por completo.

## El pipeline

El deploy es `workflow_dispatch` manual, nunca automático en cada push:

1. Comprueba que el último run de SonarCloud en `main` pasó — si no, el deploy ni arranca.
2. Construye la imagen ARM64 y la sube a `ghcr.io`.
3. Copia `docker-compose.yml` al servidor por SCP y hace `docker compose pull && up -d` por SSH.
4. Si algo falla, se abre automáticamente un issue en GitHub con el commit y el link al run.
5. Si todo va bien, se avisa a IndexNow (Bing, Yandex, Seznam, Naver) del sitemap actualizado.

Portainer me da visibilidad del contenedor sin entrar por SSH cada vez, y Nginx Proxy Manager gestiona el TLS y el reverse proxy delante de varios servicios en la misma máquina. Si te interesa el detalle completo, el `Dockerfile` y `.github/workflows/deploy.yml` están en el [repositorio](https://github.com/adrianmfuentes/martinezfuentesadrian.dev).
