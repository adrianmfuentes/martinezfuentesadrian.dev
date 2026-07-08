# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN corepack enable

# ---- Dependencies ----
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml .npmrc ./
# --ignore-scripts blocks lifecycle scripts for the whole dependency tree.
# sharp (Next.js Image Optimization) still needs its native binary built, so
# it's rebuilt explicitly afterwards, scoped to just that one package via
# pnpm's onlyBuiltDependencies allowlist (package.json).
RUN pnpm install --frozen-lockfile --ignore-scripts \
  && pnpm rebuild sharp

# ---- Build ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ---- Runtime ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
# Blog markdown is read from disk at request time via fs, not bundled by Next's
# build trace (which only follows static imports), so it needs a manual copy
# just like public/.
COPY --from=builder /app/content ./content
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
