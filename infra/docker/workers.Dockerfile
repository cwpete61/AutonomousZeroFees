FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat curl
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/workers/package.json ./apps/workers/
COPY packages/db/package.json ./packages/db/
COPY packages/orchestrator/package.json ./packages/orchestrator/
COPY packages/agents/scout-agent/package.json ./packages/agents/scout-agent/
COPY packages/agents/outreach-agent/package.json ./packages/agents/outreach-agent/
COPY packages/agents/design-preview-agent/package.json ./packages/agents/design-preview-agent/
COPY packages/agents/sales-close-agent/package.json ./packages/agents/sales-close-agent/
COPY packages/agents/web-build-agent/package.json ./packages/agents/web-build-agent/
COPY packages/agents/client-success-agent/package.json ./packages/agents/client-success-agent/
COPY packages/agents/content-agent/package.json ./packages/agents/content-agent/
COPY packages/agents/error-agent/package.json ./packages/agents/error-agent/
COPY packages/agents/code-agent/package.json ./packages/agents/code-agent/
COPY packages/types/package.json ./packages/types/
COPY packages/logger/package.json ./packages/logger/
COPY packages/config/package.json ./packages/config/
COPY packages/events/package.json ./packages/events/
RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm turbo run build --filter=@agency/workers

# Production — includes Playwright for Scout Agent
FROM base AS runner
ENV NODE_ENV=production
RUN npx playwright install --with-deps chromium
COPY --from=builder /app/apps/workers/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/db/prisma ./packages/db/prisma
EXPOSE 4001
CMD ["node", "dist/bootstrap.js"]
