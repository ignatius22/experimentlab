FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages ./packages
COPY apps ./apps

RUN corepack enable && pnpm install --frozen-lockfile
RUN pnpm build

FROM node:20-slim AS runner

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Next standalone server, static assets, background worker, and Prisma migrations.
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/dist/event-worker.cjs ./apps/web/event-worker.cjs
COPY --from=builder /app/packages/db/prisma ./packages/db/prisma
COPY entrypoint.sh ./entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/app/entrypoint.sh"]
