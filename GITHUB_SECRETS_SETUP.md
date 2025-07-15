# GitHub Secrets Configuration Guide

## Overview
Your news aggregator is now live with sample data! To enable automated news fetching every day, you need to configure GitHub secrets.

## Current Status
✅ **Website deployed**: https://aiupdatesbowery.netlify.app  
✅ **Database populated**: 59 news articles across all categories  
✅ **All articles marked as valid**: News should now display properly  
❌ **GitHub Actions**: Waiting for secrets configuration  

## Required GitHub Secrets

### 1. SUPABASE_URL
**Value**: `https://fiozmyoedptukpkzuhqm.supabase.co`
- This is your Supabase project URL
- Already available in your `.env` file

### 2. SUPABASE_SERVICE_KEY
**How to get it**:
1. Go to https://supabase.com/dashboard
2. Select your project (aiupdatesbowery)
3. Go to Settings → API
4. Find "service_role" key (NOT the anon key)
5. Copy the entire key

**Important**: The service key has admin privileges. Keep it secret!

### 3. NEWS_API_KEY (Optional)
**How to get it**:
1. Go to https://newsapi.org/register
2. Sign up for a free account
3. Get your API key from the dashboard
4. This adds more news sources but is optional

## Step-by-Step Setup

1. **Go to your GitHub repository**
   - https://github.com/[your-username]/aiupdatesbowery

2. **Navigate to Settings**
   - Click the "Settings" tab in your repository

3. **Find Secrets section**
   - In the left sidebar, click "Secrets and variables"
   - Click "Actions"

4. **Add each secret**
   - Click "New repository secret"
   - Add name: `SUPABASE_URL`
   - Add value: `https://fiozmyoedptukpkzuhqm.supabase.co`
   - Click "Add secret"
   
   - Repeat for `SUPABASE_SERVICE_KEY` with the service key from Supabase
   - Optionally add `NEWS_API_KEY` if you have one

## Testing the Workflow

After adding secrets:
1. Go to the "Actions" tab in your repository
2. Find "Fetch Multi-Category News Daily"
3. Click "Run workflow" → "Run workflow"
4. Monitor the progress

## What the Workflow Does

Every day at 5 AM EST, the workflow:
- Fetches news from 30+ RSS feeds
- Categories: AI, World Events, Business, NYC/Bowery, Costa Rica
- Validates all links before storage
- Scores articles by importance
- Removes duplicates
- Cleans up old articles (60+ days)

## News Categories Covered

- **AI**: OpenAI, Anthropic, Google AI, Meta AI, research papers
- **World Events**: BBC, CNN, Reuters, AP News
- **Business**: Bloomberg, WSJ, Financial Times, TechCrunch
- **NYC/Bowery**: NY Times Metro, NY1, Curbed NY, local news
- **Costa Rica**: Tico Times, Costa Rica Star (Ojochal/Dominical focus)

## Troubleshooting

If the workflow fails:
- Check the Actions tab for error messages
- Verify all secrets are correctly set
- Ensure the service key (not anon key) is used
- Check that secret names match exactly (case-sensitive)

## Manual News Fetching

While setting up secrets, you can manually run:
```bash
node scripts/fetch-multi-category-news.mjs
```

This requires the service key in your `.env.local` file:
```
SUPABASE_SERVICE_KEY=your-service-key-here
```

## Next Steps

1. Add the GitHub secrets
2. Test the workflow manually
3. Check the website for new articles
4. The workflow will run daily automatically

Your luxury news aggregator is ready! 🎉