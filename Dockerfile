# ── Stage 1: Dependencies ──────────────────────────────────────────────────
FROM node:22-alpine AS dependencies

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency manifests
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

# Install all dependencies (including devDependencies needed for build)
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
RUN pnpm run prisma:generate

# ── Stage 2: Builder ───────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/src/generated ./src/generated
COPY . .

# Build application with NestJS & SWC
RUN pnpm run build

# ── Stage 3: Production Runner ─────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl curl

# Create non-root system user
RUN addgroup -S eduvia && adduser -S eduvia -G eduvia

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy compiled application code and Prisma generated client
COPY --from=builder /app/dist ./dist
COPY --from=dependencies /app/src/generated ./src/generated

# Set correct permissions
RUN chown -R eduvia:eduvia /app

USER eduvia

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "dist/main.js"]
