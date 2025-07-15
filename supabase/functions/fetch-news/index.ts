// Supabase Edge Function to fetch news from various sources
// Deploy this to Supabase Functions to run periodically

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface NewsItem {
  title: string;
  content?: string;
  summary?: string;
  source: string;
  source_url: string;
  published_date: string;
  category: string;
  tags: string[];
  companies: string[];
  importance_score?: number;
  image_url?: string;
  author?: string;
}

// Example RSS feeds (expand this list)
const RSS_FEEDS = [
  { url: 'https://openai.com/blog/rss/', source: 'OpenAI Blog', company: 'OpenAI' },
  { url: 'https://blog.google/technology/ai/rss/', source: 'Google AI Blog', company: 'Google' },
];

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Fetch news from various sources
    const newsItems: NewsItem[] = [];

    // Example: Fetch from RSS feeds (you'd need to implement RSS parsing)
    // for (const feed of RSS_FEEDS) {
    //   const items = await fetchRSSFeed(feed);
    //   newsItems.push(...items);
    // }

    // Example: Fetch from news APIs
    // const apiNews = await fetchFromNewsAPI();
    // newsItems.push(...apiNews);

    // Deduplicate news items
    const uniqueNews = deduplicateNews(newsItems);

    // Save to database
    const { error } = await supabase
      .from('ai_news')
      .insert(uniqueNews);

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Fetched and saved ${uniqueNews.length} news items` 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function deduplicateNews(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const key = item.source_url || item.title;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Helper function to extract companies from text
function extractCompanies(text: string): string[] {
  const companies = [
    'OpenAI', 'Google', 'Microsoft', 'Meta', 'Anthropic', 
    'Apple', 'Amazon', 'NVIDIA', 'Tesla', 'IBM', 'Mistral',
    'Stability AI', 'Midjourney', 'Cohere', 'Hugging Face'
  ];
  
  const found: string[] = [];
  const lowerText = text.toLowerCase();
  
  for (const company of companies) {
    if (lowerText.includes(company.toLowerCase())) {
      found.push(company);
    }
  }
  
  return found;
}

// Helper function to calculate importance score
function calculateImportanceScore(item: NewsItem): number {
  let score = 5;
  const text = (item.title + ' ' + (item.content || '')).toLowerCase();
  
  // Impact keywords
  if (text.includes('breakthrough') || text.includes('revolutionary')) score += 3;
  if (text.includes('billion') || text.includes('acquisition')) score += 2;
  if (text.includes('release') || text.includes('launch')) score += 1;
  
  // Major companies boost
  if (item.companies.some(c => ['OpenAI', 'Google', 'Microsoft', 'Anthropic'].includes(c))) {
    score += 1;
  }
  
  return Math.min(score, 10);
}