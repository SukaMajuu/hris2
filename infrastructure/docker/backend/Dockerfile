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

# Copy the binary from builder
COPY --from=builder /app/main .

# Copy Firebase credentials
COPY apps/backend/firebase-credentials.json .

# Copy .env file
COPY apps/backend/.env .

# Expose port
EXPOSE 8080

# Command to run the executable
CMD ["./main"]
