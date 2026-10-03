# -----------------------------------------------------------------------------
# AVANYA LUXURY E-COMMERCE - PRODUCTION DOCKERFILE
# Multi-stage build optimized for security, minimal size, and performance
# -----------------------------------------------------------------------------

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl

# -----------------------------------------------------------------------------
# 1. DEPENDENCIES STAGE
# -----------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app

# Copy package descriptors
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install exact production & build dependencies
RUN npm ci

# -----------------------------------------------------------------------------
# 2. BUILDER STAGE
# -----------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client for the Linux container architecture
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Compile Next.js with standalone output
RUN npm run build

# -----------------------------------------------------------------------------
# 3. RUNNER STAGE (Production Minimal Runtime)
# -----------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create unprivileged system user for zero-root security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set up storage and upload permissions
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public/uploads
RUN mkdir -p /app/.next && chown -R nextjs:nodejs /app/.next

# Copy public assets & compiled standalone runtime
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

# Container Healthcheck verifying application readiness
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Launch Next.js Standalone Node server
CMD ["node", "server.js"]
