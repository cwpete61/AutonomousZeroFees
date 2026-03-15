FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat curl openssl
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# Build stage
FROM base AS builder
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@agency/workers
# Generate prisma client in builder
RUN cd packages/db && npx prisma generate

# Production
FROM node:20 AS runner
RUN apt-get update && apt-get install -y openssl
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app
ENV NODE_ENV=production
RUN npx playwright install --with-deps chromium

COPY --from=builder /app/apps/workers ./apps/workers
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Re-generate prisma client in runner to ensure binaries match
RUN cd packages/db && npx prisma generate
RUN pnpm install --prod --frozen-lockfile --filter=@agency/workers

EXPOSE 4001
CMD ["node", "apps/workers/dist/main.js"]
