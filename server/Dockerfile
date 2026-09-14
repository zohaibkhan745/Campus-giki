# ==========================================
# 1. Build Stage
# ==========================================
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install OpenSSL required by Prisma CLI
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package manifests and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies for TypeScript compilation)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code and build configs
COPY tsconfig*.json nest-cli.json ./
COPY src ./src/

# Compile NestJS application
RUN npm run build

# ==========================================
# 2. Production Stage
# ==========================================
FROM node:20-bookworm-slim AS runner

WORKDIR /app

# Install OpenSSL for Prisma engine runtime
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

# Install only production dependencies (P13: reduces image size by ~100MB+)
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev && npx prisma generate

COPY --from=builder /app/dist ./dist

# Copy entrypoint script and normalize line endings for Linux
COPY docker-entrypoint.sh ./
RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh

# Create uploads directory and ensure node user has full write permissions
RUN mkdir -p /app/uploads && chown -R node:node /app

USER node

EXPOSE 5000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
