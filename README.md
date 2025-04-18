# HRIS - Human Resource Information System

A modern, full-stack human resource management system built with Next.js and Go, designed for scalable deployment on Azure.

## Overview

(soon)

## Technology Stack

### Frontend

-   **Framework**: Next.js (React)
-   **Styling**: TailwindCSS
-   **Testing**: Storybook, Playwright (E2E)

### Backend

-   **Framework**: Go (Gin)
-   **Database**: PostgreSQL
-   **API**: RESTful API
-   **Authentication**: Firebase Auth
-   **Testing**: Go testing package, testify

### DevOps

-   **Containerization**: Docker, Docker Compose
-   **CI/CD**: GitHub Actions
-   **Cloud**: Microsoft Azure (App Service, Container Registry)
-   **Infrastructure as Code**: Azure CLI, ARM templates

## Getting Started

Please check this [setup](./docs/setup.md)

## Project Structure

```
hris/
├── apps/
│   ├── frontend/         # Next.js application
│   └── backend/          # Go application
│       ├── cmd/          # Application entry points
│       ├── internal/     # Private application code
│       │   ├── domain/   # Domain models and interfaces
│       │   ├── repository/ # Repository implementations
│       │   └── usecase/  # Business logic
│       ├── pkg/          # Public packages
│       └── api/          # API handlers and middleware
├── .github/
│   └── workflows/        # GitHub Actions CI/CD workflows
├── infrastructure/
│   ├── azure/            # Azure deployment scripts and templates
│   │   ├── scripts/      # Deployment scripts
│   │   └── templates/    # ARM templates
│   └── docker/           # Docker configuration
│       ├── frontend/     # Frontend Dockerfile
│       └── backend/      # Backend Dockerfile
└── docs/
    ├── api/              # API documentation (Swagger)
    └── setup.md          # Detailed setup guide
```

## API Documentation

The API documentation is available in Swagger format at swagger.yaml. When the application is running, you can access the interactive API documentation at:

-   Development: http://localhost:8080/api/documentation
-   Production: https://hris-backend-sukamaju123.azurewebsites.net/api/documentation
