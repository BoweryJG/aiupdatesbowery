# AI Updates Bowery

Real-time AI model tracking and intelligence aggregation dashboard.

🚀 **Live at**: https://aiupdatesbowery.netlify.app

## Overview

AI Updates Bowery is a real-time intelligence aggregation service for the AI industry. It tracks AI models across different companies and categories, providing impact scoring and filtering capabilities.

## Features

- **Real-time AI Model Tracking**: Monitor updates from major AI companies
- **Impact Scoring**: Critical updates highlighted with impact scores
- **Advanced Filtering**: Filter by category, company, or search terms
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **3D Visualizations**: Interactive visualizations using Three.js

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Three.js (React Three Fiber)
- Supabase
- Zustand

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment

The site is deployed on Netlify and automatically deploys from the main branch.

## License

MIT