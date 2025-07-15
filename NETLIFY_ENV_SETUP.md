# Netlify Environment Variables Setup

## Quick Setup to Fix 404 Errors

The 404 errors are occurring because the production environment doesn't have the required Supabase credentials.

### Required Environment Variables

Add these to your Netlify site:

1. **VITE_SUPABASE_URL**
   ```
   https://fiozmyoedptukpkzuhqm.supabase.co
   ```

2. **VITE_SUPABASE_ANON_KEY**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpb3pteW9lZHB0dWtwa3p1aHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MTUxODcsImV4cCI6MjA2NTM5MTE4N30.XrzLFbtoOKcX0kU5K7MSPQKwTDNm6cFtefUGxSJzm-o
   ```

### How to Add Environment Variables to Netlify

1. **Go to Netlify Dashboard**
   - Log in to https://app.netlify.com
   - Select your site: `aiupdatesbowery`

2. **Navigate to Environment Variables**
   - Click on "Site configuration" in the left sidebar
   - Click on "Environment variables"

3. **Add Variables**
   - Click "Add a variable"
   - For each variable:
     - Key: Enter the variable name exactly as shown above
     - Values: Enter the corresponding value
     - Scopes: Select all (Production, Preview, Local development)
   - Click "Create variable"

4. **Redeploy**
   - After adding both variables, go to "Deploys"
   - Click "Trigger deploy" → "Deploy site"

### Alternative Method (Using Netlify CLI)

If you have Netlify CLI installed:

```bash
# Set environment variables
netlify env:set VITE_SUPABASE_URL "https://fiozmyoedptukpkzuhqm.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpb3pteW9lZHB0dWtwa3p1aHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MTUxODcsImV4cCI6MjA2NTM5MTE4N30.XrzLFbtoOKcX0kU5K7MSPQKwTDNm6cFtefUGxSJzm-o"

# Redeploy
netlify deploy --prod
```

### Verification

After redeployment:
1. Visit your site
2. Open browser console (F12)
3. Check Network tab - you should no longer see 404 errors for API calls
4. News articles should load properly

### Troubleshooting

If issues persist:
- Ensure variable names are exact (case-sensitive)
- Check that there are no extra spaces in the values
- Try clearing your browser cache
- Check Netlify deploy logs for any build errors