#!/bin/bash
# Deploy to Netlify

echo "Building project..."
npm run build

echo "Creating deployment..."
netlify sites:create --name ai-intelligence-dash --team RepSpheres

echo "Deploying to production..."
netlify deploy --prod --dir dist --site ai-intelligence-dash.netlify.app

echo "Deployment complete!"