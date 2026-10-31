# ==============================================================================
# Eduvia Backend - Production Dockerfile (Multi-stage Node.js 22 LTS Alpine)
# ==============================================================================

ARG PNPM_VERSION=11.22.0

# ── Stage 1: Dependencies ─────────────────────────────────────────────────────
FROM node:22-alpine AS deps
ARG PNPM_VERSION
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

RUN npm install -g pnpm@${PNPM_VERSION}

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ── Stage 2: Builder ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
ARG PNPM_VERSION
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

RUN npm install -g pnpm@${PNPM_VERSION}

COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json nest-cli.json ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma Client and compile NestJS app
RUN pnpm run prisma:generate
RUN pnpm run build

# Remove development dependencies to keep production footprint minimal
RUN pnpm prune --prod

# ── Stage 3: Runner ───────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl curl
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Run container as a dedicated non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 eduvia

COPY --from=builder --chown=eduvia:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=eduvia:nodejs /app/dist ./dist
COPY --from=builder --chown=eduvia:nodejs /app/package.json ./package.json
COPY --from=builder --chown=eduvia:nodejs /app/prisma ./prisma

USER eduvia

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=20s \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/main"]
