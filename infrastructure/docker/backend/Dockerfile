# Build stage
FROM golang:latest AS builder

WORKDIR /app

# Install git and build dependencies
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Copy go mod and sum files
COPY apps/backend/go.mod apps/backend/go.sum ./

# Download all dependencies
RUN go mod download

# Copy the source code
COPY apps/backend .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/main.go

# Final stage
FROM debian:bullseye-slim

WORKDIR /app

# Accept build arguments for environment variables
ARG DATABASE_URL
ARG SUPABASE_URL
ARG SUPABASE_KEY
ARG SUPABASE_SERVICE_KEY
ARG PORT
ARG JWT_SECRET_KEY
ARG JWT_ACCESS_DURATION
ARG JWT_REFRESH_DURATION

# Set environment variables
ENV DATABASE_URL=$DATABASE_URL
ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_KEY=$SUPABASE_KEY
ENV SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY
ENV PORT=$PORT
ENV JWT_SECRET_KEY=$JWT_SECRET_KEY
ENV JWT_ACCESS_DURATION=$JWT_ACCESS_DURATION
ENV JWT_REFRESH_DURATION=$JWT_REFRESH_DURATION

# Copy the binary from builder
COPY --from=builder /app/main .

# Expose port
EXPOSE 8080

# Command to run the executable
CMD ["./main"]
