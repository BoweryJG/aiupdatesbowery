#!/bin/bash
# Deploy to Netlify

echo "Building project..."
npm run build

echo "Creating deployment..."
netlify sites:create --name aiupdatesbowery --team RepSpheres

echo "Deploying to production..."
netlify deploy --prod --dir dist --site aiupdatesbowery.netlify.app

echo "Deployment complete!"