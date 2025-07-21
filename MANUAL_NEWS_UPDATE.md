# Manual News Update Instructions

To manually update news in your AI Updates Bowery application, use these commands:

## Fetch All News Categories
```bash
npm run fetch-news
```
This fetches news from all configured RSS feeds including AI, World, Business, NYC, and Costa Rica news.

## Fetch Reddit News Only
```bash
npm run fetch-reddit
```
This fetches AI-related news specifically from Reddit.

## Important Notes
- News fetching is now MANUAL ONLY - no more automated spam!
- Run these commands whenever you want fresh news
- The application will show the latest news from your database
- RSS feeds may occasionally fail due to network issues - this is normal

## Troubleshooting
If you see many failed feeds, it's usually due to:
1. RSS feeds being temporarily down
2. Network connectivity issues
3. Changed RSS feed URLs

The script will still insert any successfully fetched articles.