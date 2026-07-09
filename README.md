# Personal site for Adrián Martínez

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=adrianmfuentes_martinezfuentesadrian.dev&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=adrianmfuentes_martinezfuentesadrian.dev)

Leer en español: [README.es.md](README.es.md)

Personal website and portfolio of Adrian Martinez Fuentes, built with Next.js. The site is bilingual (English and Spanish), includes a set of small security-oriented web tools, and runs as a Docker container on a self-hosted server.

Live site: https://amf.amfserver.duckdns.org

## Overview

The project serves as a portfolio, CV and contact point, and also hosts a handful of standalone utilities (port scanner, HTTP header validator, certificate checker, password tools, and a basic web discovery tool) that double as demonstrations of the kind of work the site's author does. All user-facing pages live under a language-prefixed route (`/en` or `/es`), with translations stored as JSON dictionaries.

## Tech stack

- Next.js 16 (App Router, Turbopack)
- React 19 and TypeScript
- Tailwind CSS with shadcn/ui components (built on Radix primitives)
- React Three Fiber and Drei for the 3D elements on the home page
- Framer Motion for page and component transitions
- React Hook Form with Zod for form validation
- Groq SDK for the chat feature
- Upstash Redis for rate limiting
- EmailJS for the contact form

## Project structure

```text
app/
  [lang]/            Localized pages (about, cv, portfolio, contact, tools/*)
  [lang]/dictionaries/  en.json and es.json translation files
  api/                 API routes (certificate check, password check, port scan,
                        header validation, web discovery)
  actions/              Server actions (contact form, email, chat, PDF handling)
components/
  ui/                   Base shadcn/ui components
lib/                    Shared utilities (env handling, rate limiting, etc.)
scripts/                Maintenance and test scripts
```

## Security tools

A set of small tools is available under `/tools`, each implemented as its own route and API endpoint:

- Certificate checker: inspects a domain's TLS certificate details.
- HTTP headers validator: reviews the security headers returned by a given URL.
- Password checker and generator: evaluates password strength and generates strong passwords.
- Port scanner: performs a basic scan against a target host, limited by browser CORS constraints.
- Web discovery: gathers publicly available information about a target site.

These tools are meant for personal, authorized use and educational purposes.


## Deployment and CI

The app is packaged as a Docker image (`Dockerfile`, using Next.js's standalone output). On every push to `main`, GitHub Actions builds that image for `linux/arm64`, pushes it to the GitHub Container Registry, and deploys it over SSH to a self-hosted server running Docker and Nginx Proxy Manager (`docker-compose.yml`). GitHub Actions also runs a build and dependency audit check on every push and pull request, a SonarQube scan with a quality gate (`sonar.yml`, `sonar-project.properties`), and Dependabot keeps dependencies current, with patch and minor updates merged automatically once the build passes.

Static analysis with SonarQube requires the repository secrets `SONAR_TOKEN` and `SONAR_HOST_URL`, pointing at a SonarQube server.

Deploying requires the following repository secrets: `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`, `SSH_DEPLOY_PATH`, and optionally `SSH_PORT`. The server needs a persistent `.env` file at `SSH_DEPLOY_PATH` alongside `docker-compose.yml`, holding the runtime variables listed above.

## License

This is a personal project. The source code is public for reference, but it is not licensed for reuse or redistribution.

## Contact

Adrian Martinez Fuentes — reachable through the contact form on the site.
