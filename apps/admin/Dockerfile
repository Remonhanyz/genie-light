# Multi-stage Dockerfile for Custom Next.js CMS & Admin Panel (apps/cms)
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat curl

# Install dependencies
FROM base AS deps
WORKDIR /app

# Copy root workspace manifests
COPY package.json yarn.lock ./
COPY packages/database/package.json ./packages/database/
COPY packages/queries/package.json ./packages/queries/
COPY apps/web/package.json ./apps/web/
COPY apps/cms/package.json ./apps/cms/

# Install dependencies using Yarn
RUN yarn install --frozen-lockfile

# Builder stage
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client & Build Custom Next.js CMS
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN yarn build:database
RUN yarn workspace cms build

# Production Runner stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application and dependencies
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/cms ./apps/cms

USER nextjs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3001/ || exit 1

CMD ["yarn", "start:cms"]
