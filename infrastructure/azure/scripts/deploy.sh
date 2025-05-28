#!/bin/bash

# Exit on error
set -e

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Check required environment variables
required_vars=(
  "RESOURCE_GROUP"
  "LOCATION"
  "ACR_NAME"
  "FRONTEND_APP_NAME"
  "BACKEND_APP_NAME"
  "SUPABASE_DB_HOST"
  "SUPABASE_DB_USERNAME"
  "SUPABASE_DB_PASSWORD"
  "SUPABASE_URL"
  "SUPABASE_KEY"
  "SUPABASE_ANON_KEY"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "Error: $var is not set"
    exit 1
  fi
done

# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query "username" -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)
ACR_URL="${ACR_NAME}.azurecr.io"

# Deploy backend to App Service
echo "Deploying backend to App Service..."
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file ../templates/app-service.json \
  --parameters \
    backendAppName=$BACKEND_APP_NAME \
    location=$LOCATION \
    containerRegistryUrl=$ACR_URL \
    containerRegistryUsername=$ACR_USERNAME \
    containerRegistryPassword=$ACR_PASSWORD \
    supabaseDbHost=$SUPABASE_DB_HOST \
    supabaseDbUsername=$SUPABASE_DB_USERNAME \
    supabaseDbPassword=$SUPABASE_DB_PASSWORD \
    supabaseUrl=$SUPABASE_URL \
    supabaseKey=$SUPABASE_KEY

# Deploy frontend to Container Apps
echo "Deploying frontend to Container Apps..."
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file ../templates/container-app.json \
  --parameters \
    frontendAppName=$FRONTEND_APP_NAME \
    location=$LOCATION \
    containerRegistryUrl=$ACR_URL \
    containerRegistryUsername=$ACR_USERNAME \
    containerRegistryPassword=$ACR_PASSWORD \
    backendAppName=$BACKEND_APP_NAME \
    supabaseUrl=$SUPABASE_URL \
    supabaseAnonKey=$SUPABASE_ANON_KEY

echo "Deployment completed successfully!"
echo "Frontend URL: $(az containerapp show --name $FRONTEND_APP_NAME --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)"
echo "Backend URL: https://$BACKEND_APP_NAME.azurewebsites.net"
