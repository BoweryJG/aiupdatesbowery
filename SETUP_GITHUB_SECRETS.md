# GitHub Secrets Setup

To enable the automated daily news fetching, you need to set up the following GitHub secrets:

## Required Secrets

1. **SUPABASE_URL**: Your Supabase project URL
   - Value: `https://fiozmyoedptukpkzuhqm.supabase.co`

2. **SUPABASE_SERVICE_KEY**: Your Supabase service key (NOT the anon key)
   - You need to get this from your Supabase dashboard:
     - Go to Settings > API
     - Copy the "service_role" key (has more permissions than anon key)

3. **NEWS_API_KEY** (Optional): For additional news sources
   - Sign up at https://newsapi.org/register
   - Get your free API key
   - This is optional - the script will work without it

## How to Add Secrets

1. Go to your GitHub repository
2. Click on "Settings" tab
3. Click on "Secrets and variables" > "Actions" in the left sidebar
4. Click "New repository secret"
5. Add each secret with the name and value

## Testing the Workflow

After setting up the secrets:
1. Go to the "Actions" tab in your repository
2. Click on "Fetch AI News Daily" workflow
3. Click "Run workflow" > "Run workflow" to test manually

The workflow will also run automatically every day at 5 AM EST.

## What the Script Does

- Fetches AI news from multiple RSS feeds (OpenAI, Google, Anthropic, tech news sites)
- Categorizes articles (product launches, funding, research, etc.)
- Extracts companies and tags
- Calculates importance scores
- Prevents duplicate entries
- Cleans up articles older than 60 days

## Local Testing

To test locally:
```bash
node scripts/test-fetch-news.mjs
```

This uses your local `.env` file credentials.