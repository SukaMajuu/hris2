# Deployment Guide

This guide explains how to deploy the HRIS application to Azure using Azure Container Apps for the frontend and Azure App Service for the backend.

## Prerequisites

-   Azure CLI installed and configured
-   Docker installed and configured
-   Access to an Azure subscription
-   Supabase account and project

## Deployment Architecture

The application is deployed using the following Azure services:

-   **Frontend**: Azure Container Apps (ACA)
-   **Backend**: Azure App Service
-   **Container Registry**: Azure Container Registry (ACR)

## Deployment Steps

### 1. Set Up Environment Variables

Create a `.env` file in the `infrastructure/azure` directory with the following variables:

```
# Azure Resource Group
RESOURCE_GROUP=hris-rg
LOCATION=eastus

# Azure Container Registry
ACR_NAME=hrisacr

# Application Names
FRONTEND_APP_NAME=hris-frontend
BACKEND_APP_NAME=hris-backend

# Supabase Configuration
SUPABASE_DB_HOST=your-supabase-db-host
SUPABASE_DB_PORT=6543
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USERNAME=postgres
SUPABASE_DB_PASSWORD=your-supabase-db-password
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

### 2. Build and Push Docker Images

Build and push the Docker images to Azure Container Registry:

```bash
# Login to ACR
az acr login --name $ACR_NAME

# Build and push frontend image
docker build -t $ACR_NAME.azurecr.io/hris-frontend:latest -f infrastructure/docker/frontend/Dockerfile .
docker push $ACR_NAME.azurecr.io/hris-frontend:latest

# Build and push backend image
docker build -t $ACR_NAME.azurecr.io/hris-backend:latest -f infrastructure/docker/backend/Dockerfile .
docker push $ACR_NAME.azurecr.io/hris-backend:latest
```

### 3. Deploy Infrastructure

Run the deployment script:

```bash
cd infrastructure/azure/scripts
chmod +x deploy.sh
./deploy.sh
```

This script will:

1. Deploy the backend to Azure App Service
2. Deploy the frontend to Azure Container Apps
3. Configure the necessary environment variables and connections

### 4. Verify Deployment

After deployment, the script will output the URLs for both the frontend and backend applications. You can access these URLs to verify that the deployment was successful.

## Manual Deployment

If you prefer to deploy manually, you can use the following commands:

### Deploy Backend to App Service

```bash
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file infrastructure/azure/templates/app-service.json \
  --parameters \
    backendAppName=$BACKEND_APP_NAME \
    location=$LOCATION \
    containerRegistryUrl=$ACR_NAME.azurecr.io \
    containerRegistryUsername=$ACR_USERNAME \
    containerRegistryPassword=$ACR_PASSWORD \
    supabaseDbHost=$SUPABASE_DB_HOST \
    supabaseDbUsername=$SUPABASE_DB_USERNAME \
    supabaseDbPassword=$SUPABASE_DB_PASSWORD \
    supabaseUrl=$SUPABASE_URL \
    supabaseKey=$SUPABASE_KEY
```

### Deploy Frontend to Container Apps

```bash
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file infrastructure/azure/templates/container-app.json \
  --parameters \
    frontendAppName=$FRONTEND_APP_NAME \
    location=$LOCATION \
    containerRegistryUrl=$ACR_NAME.azurecr.io \
    containerRegistryUsername=$ACR_USERNAME \
    containerRegistryPassword=$ACR_PASSWORD \
    backendAppName=$BACKEND_APP_NAME
```

## Troubleshooting

### Common Issues

1. **Container App Deployment Fails**

    - Check the ACR credentials
    - Verify that the image exists in the registry
    - Check the Container App logs

2. **App Service Deployment Fails**

    - Verify the App Service Plan exists
    - Check the App Service logs
    - Verify the environment variables

3. **Connection Issues Between Frontend and Backend**
    - Verify the NEXT_PUBLIC_API_URL environment variable
    - Check CORS settings in the backend
    - Verify network security groups

## Maintenance

### Updating the Application

To update the application:

1. Build and push new Docker images to ACR
2. Restart the Container App and App Service

```bash
# Restart Container App
az containerapp restart --name $FRONTEND_APP_NAME --resource-group $RESOURCE_GROUP

# Restart App Service
az webapp restart --name $BACKEND_APP_NAME --resource-group $RESOURCE_GROUP
```

### Scaling

-   **Container Apps**: Automatically scales based on HTTP traffic
-   **App Service**: Can be scaled manually or automatically based on metrics
