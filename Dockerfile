# --- Build Stage ---
FROM node:20-bookworm AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY scripts/ensure-native-css.mjs ./scripts/ensure-native-css.mjs
RUN npm ci

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

ARG BACKEND_URL=http://api:8000
ARG NEXT_PUBLIC_API_URL=
ENV BACKEND_URL=$BACKEND_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# --- Production Stage ---
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --gid 1001 nodejs
RUN useradd --uid 1001 --gid nodejs --shell /bin/sh --create-home nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
