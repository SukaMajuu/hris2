# HRIS Setup Guide

This document provides comprehensive instructions for setting up and deploying the Human Resource Information System (HRIS).

## Table of Contents

- [HRIS Setup Guide](#hris-setup-guide)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Local Development Setup](#local-development-setup)
  - [CI/CD Configuration](#cicd-configuration)

## Prerequisites

Before you begin, ensure you have the following installed:

-   Node.js 18.x or newer
-   Go 1.21 or newer
-   Docker and Docker Compose
-   Azure CLI (for deployment)
-   Git

## Local Development Setup

This approach runs the database in Docker while running the frontend and backend directly on your machine for faster development:

1. Clone the repository

    ```bash
    git clone https://github.com/SukaMajuu/hris.git
    cd hris
    ```

2. Run the setup script (first-time only)

    ```bash
    npm run setup
    ```

3. Start the development environment

    ```bash
    npm run dev
    ```

4. Your services will be available at:
    - Frontend: http://localhost:3000
    - Backend API: http://localhost:8080
    - PostgreSQL: localhost:5432

> **Note:** Contact your project manager :D for the environment variables (.env files).

## CI/CD Configuration

The project includes GitHub Actions workflows for:

-   **Continuous Integration**: Runs on pull requests to verify code quality and test coverage
-   **Continuous Deployment**: Automatically deploys to Azure when code is pushed to main
