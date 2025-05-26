FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY ./apps/frontend/package*.json ./

RUN npm install --package-lock-only

RUN npm ci

# Copy application code
COPY ./apps/frontend .

# Build the Next.js application
RUN npm run build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built application from builder stage
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
