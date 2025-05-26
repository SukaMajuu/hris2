FROM node:18-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL_VALUE
ARG NEXT_PUBLIC_SUPABASE_URL_VALUE
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY_VALUE

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL_VALUE
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL_VALUE
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY_VALUE

# Copy package files and install dependencies
COPY ./apps/frontend/package*.json ./

RUN npm install --package-lock-only

RUN npm ci

# Copy application code
COPY ./apps/frontend .

RUN echo "--- DEBUG: Environment Variables before npm run build ---"
RUN echo "NEXT_PUBLIC_API_URL: [${NEXT_PUBLIC_API_URL}]"
RUN echo "NEXT_PUBLIC_SUPABASE_URL: [${NEXT_PUBLIC_SUPABASE_URL}]"
RUN echo "NEXT_PUBLIC_SUPABASE_ANON_KEY: [${NEXT_PUBLIC_SUPABASE_ANON_KEY}]"
RUN echo "---------------------------------------------------------"

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
