# AI Updates Bowery

Real-time AI news aggregation and model tracking dashboard.

🚀 **Live at**: https://aiupdatesbowery.netlify.app

## Overview

AI Updates Bowery is a comprehensive AI intelligence platform that aggregates news headlines and tracks AI models across the industry. It provides real-time updates, categorization, and visualization of AI developments.

## Features

### 📰 News Aggregation
- **Today's Headlines**: View the latest AI news with importance scoring
- **Date-based Filtering**: Filter by Today, This Week, This Month, or All Time
- **Category Organization**: News organized into Research, Product Launches, Funding, etc.
- **Smart Categorization**: Automatic categorization of news articles
- **Company Tracking**: Track news by major AI companies

### 🤖 AI Model Tracking
- **Real-time AI Model Updates**: Monitor updates from major AI companies
- **Impact Scoring**: Critical updates highlighted with impact scores
- **Advanced Filtering**: Filter by category, company, or search terms

### 🎨 Modern UI
- **Dual View Mode**: Switch between Headlines and AI Models views
- **Responsive Design**: Built with React, TypeScript, and Tailwind CSS
- **Interactive Elements**: Smooth animations with Framer Motion
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

## Database Setup

1. Run the migration script in Supabase:
   ```sql
   -- Execute the contents of supabase/migrations/001_create_ai_news_table.sql
   ```

2. Set up the Edge Function for news fetching:
   ```bash
   supabase functions deploy fetch-news
   ```

3. Schedule the Edge Function to run periodically (e.g., every 30 minutes)

## News Sources

The platform can aggregate news from:
- RSS feeds (OpenAI, Google AI, MIT News, TechCrunch, VentureBeat)
- News APIs (configurable)
- Direct web scraping (with appropriate permissions)

## Deployment

The site is deployed on Netlify and automatically deploys from the main branch.

## Future Enhancements

- [ ] Data visualization charts for news trends
- [ ] Email/notification alerts for breaking news
- [ ] User accounts with personalized feeds
- [ ] API endpoints for third-party integrations
- [ ] Mobile app version

## License

MIT