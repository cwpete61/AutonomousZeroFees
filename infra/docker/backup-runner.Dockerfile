FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat curl postgresql-client
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# Install only backup-related dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/db/package.json ./packages/db/
COPY packages/services/backup-service/package.json ./packages/services/backup-service/
COPY packages/services/storage-service/package.json ./packages/services/storage-service/
COPY packages/logger/package.json ./packages/logger/
COPY packages/config/package.json ./packages/config/
RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm turbo run build --filter=@agency/backup-service --filter=@agency/storage-service

# Production — lightweight container with pg_dump
FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/packages/services/backup-service/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/db/prisma ./packages/db/prisma
CMD ["node", "dist/index.js"]
