#!/bin/bash

# Exit on error
set -e

source .env.deploy

# Create Resource Group if it doesn't exist
echo "Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create the Azure Container Registry
echo "Creating Azure Container Registry..."
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Standard

# Create App Service Plan (Linux)
echo "Creating App Service Plan..."
az appservice plan create \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE_PLAN \
  --is-linux \
  --sku B1

# Create Frontend Web App
echo "Creating Frontend Web App..."
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $FRONTEND_APP_NAME \
  --deployment-container-image-name nginx:alpine

# Create Backend Web App
echo "Creating Backend Web App..."
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $BACKEND_APP_NAME \
  --deployment-container-image-name nginx:alpine

# Configure Frontend Web App
echo "Configuring Frontend Web App..."
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $FRONTEND_APP_NAME \
  --settings \
  WEBSITES_PORT=3000 \
  NEXT_PUBLIC_API_URL=https://$BACKEND_APP_NAME.azurewebsites.net

# Configure Backend Web App
echo "Configuring Backend Web App..."
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_APP_NAME \
  --settings \
  WEBSITES_PORT=80 \
  APP_ENV=production \
  APP_DEBUG=false \
  DB_CONNECTION=pgsql \
  DB_HOST=$SUPABASE_DB_HOST \
  DB_PORT=$SUPABASE_DB_PORT \
  DB_DATABASE=$SUPABASE_DB_NAME \
  DB_USERNAME=$SUPABASE_DB_USERNAME \
  DB_PASSWORD=$SUPABASE_DB_PASSWORD \
  SUPABASE_URL=$SUPABASE_URL \
  SUPABASE_KEY=$SUPABASE_KEY

# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username --output tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value --output tsv)
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer --output tsv)

# Configure Frontend Web App with ACR
echo "Configuring Frontend Web App for container deployment..."
az webapp config container set \
  --resource-group $RESOURCE_GROUP \
  --name $FRONTEND_APP_NAME \
  --docker-custom-image-name "$ACR_LOGIN_SERVER/hris-frontend:latest" \
  --docker-registry-server-url "https://$ACR_LOGIN_SERVER" \
  --docker-registry-server-user $ACR_USERNAME \
  --docker-registry-server-password $ACR_PASSWORD

# Configure Backend Web App with ACR
echo "Configuring Backend Web App for container deployment..."
az webapp config container set \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_APP_NAME \
  --docker-custom-image-name "$ACR_LOGIN_SERVER/hris-backend:latest" \
  --docker-registry-server-url "https://$ACR_LOGIN_SERVER" \
  --docker-registry-server-user $ACR_USERNAME \
  --docker-registry-server-password $ACR_PASSWORD

# List all resources in the resource group
echo "Listing all resources in $RESOURCE_GROUP..."
az resource list --resource-group $RESOURCE_GROUP --output table
