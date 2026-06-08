# --- Build Stage ---
FROM node:20-bookworm AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1

# Tailwind 4 and Next 16 use native binaries (Rust) for perf.
# We must force-install the Linux versions.
RUN npm install @tailwindcss/oxide-linux-arm64-gnu lightningcss-linux-arm64-gnu

# Build the application using standard Next.js build
RUN npx next build

# --- Production Stage ---
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN groupadd --gid 1001 nodejs
RUN useradd --uid 1001 --gid nodejs --shell /bin/sh --create-home nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
