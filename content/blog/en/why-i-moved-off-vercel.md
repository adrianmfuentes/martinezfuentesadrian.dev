---
title: "Why I moved this portfolio off Vercel and onto my own server"
description: "How this site ended up deployed on my own Oracle Ampere A1 server with Docker, Portainer and Nginx Proxy Manager, and the real problems I had to solve along the way."
date: "2026-08-01"
tags: ["Docker", "CI/CD", "Self-hosting"]
---

Vercel worked fine for this portfolio. But I wanted to actually understand what happens between `git push` and an HTTP request being served, without a platform abstracting that part away. So this site now runs as a Docker container on my own Oracle Ampere A1 (ARM64) server, fronted by Portainer and Nginx Proxy Manager.

## The core piece: Next.js in standalone mode

`output: 'standalone'` in `next.config.js` produces a self-contained `server.js` that doesn't need a full `node_modules` in production. The final Dockerfile is a tiny `node:22-alpine` image that copies that standalone output plus `public/` and `.next/static`. The less obvious part: the blog reads `.md` files from `content/` off disk at request time (`fs.readFile`), not via a static import, so Next's build trace never follows it — that folder has to be copied by hand in the Dockerfile, or the posts silently disappear in production.

## Native ARM, not QEMU

Oracle Ampere A1 is ARM64, so the image has to be built for `linux/arm64`. My first attempt used `ubuntu-latest` with QEMU emulating ARM in the GitHub Actions build, and `pnpm rebuild sharp` (the native binary behind Next's Image Optimization) crashed with an illegal instruction mid-emulation. The fix was switching to a native ARM runner (`ubuntu-24.04-arm`, free for public repos) and skipping emulation entirely.

## The pipeline

Deploys are manual `workflow_dispatch`, never automatic on every push:

1. Check that the latest SonarCloud run on `main` passed — if not, the deploy doesn't even start.
2. Build the ARM64 image and push it to `ghcr.io`.
3. Copy `docker-compose.yml` to the server over SCP, then `docker compose pull && up -d` over SSH.
4. If anything fails, a GitHub issue gets opened automatically with the commit and a link to the run.
5. If it succeeds, IndexNow (Bing, Yandex, Seznam, Naver) gets notified about the updated sitemap.

Portainer gives me visibility into the container without SSHing in every time, and Nginx Proxy Manager handles TLS and the reverse proxy in front of several services on the same box. If you want the full detail, the `Dockerfile` and `.github/workflows/deploy.yml` are in the [repository](https://github.com/adrianmfuentes/martinezfuentesadrian.dev).
