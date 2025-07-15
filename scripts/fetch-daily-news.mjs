import { createClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';
import fetch from 'node-fetch';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// RSS feeds to check
const RSS_FEEDS = [
  { url: 'https://openai.com/blog/rss.xml', source: 'OpenAI Blog', company: 'OpenAI' },
  { url: 'https://blog.google/technology/ai/rss/', source: 'Google AI Blog', company: 'Google' },
  { url: 'https://www.anthropic.com/index/rss.xml', source: 'Anthropic Blog', company: 'Anthropic' },
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch AI', company: null },
  { url: 'https://venturebeat.com/ai/feed/', source: 'VentureBeat AI', company: null },
  { url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml', source: 'The Verge AI', company: null },
  { url: 'https://www.wired.com/feed/tag/ai/latest/rss', source: 'Wired AI', company: null }
];

// AI keywords for categorization and tagging
const AI_KEYWORDS = {
  categories: {
    'product_launch': ['launch', 'announce', 'release', 'introduce', 'unveil', 'debut'],
    'funding': ['funding', 'investment', 'raise', 'valuation', 'series', 'round'],
    'research': ['research', 'study', 'paper', 'breakthrough', 'discover', 'finding'],
    'partnership': ['partnership', 'collaborate', 'team up', 'join forces', 'alliance'],
    'ethics_policy': ['regulation', 'ethics', 'policy', 'governance', 'law', 'compliance'],
    'technical_breakthrough': ['breakthrough', 'milestone', 'achievement', 'innovation'],
    'hardware': ['chip', 'gpu', 'processor', 'hardware', 'computing power'],
    'use_case': ['application', 'use case', 'implementation', 'deploy', 'real-world']
  },
  tags: [
    'llm', 'gpt', 'claude', 'gemini', 'transformer', 'neural network',
    'machine learning', 'deep learning', 'ai safety', 'chatbot',
    'computer vision', 'nlp', 'generative ai', 'multimodal',
    'foundation model', 'rag', 'ai agent', 'open source'
  ],
  companies: [
    'OpenAI', 'Google', 'Anthropic', 'Meta', 'Microsoft', 'Apple',
    'NVIDIA', 'Amazon', 'Tesla', 'IBM', 'Mistral', 'Stability AI',
    'Midjourney', 'Cohere', 'Hugging Face', 'DeepMind', 'Perplexity',
    'Character.AI', 'Inflection', 'Adept', 'Runway', 'ElevenLabs'
  ]
};

// Helper functions
function categorizeArticle(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  
  for (const [category, keywords] of Object.entries(AI_KEYWORDS.categories)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }
  return 'industry_news';
}

function extractTags(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  return AI_KEYWORDS.tags.filter(tag => text.includes(tag.toLowerCase()));
}

function extractCompanies(title, content) {
  const text = `${title} ${content}`;
  return AI_KEYWORDS.companies.filter(company => 
    text.includes(company) || text.toLowerCase().includes(company.toLowerCase())
  );
}

function calculateImportanceScore(article) {
  let score = 5; // Base score
  const text = `${article.title} ${article.content}`.toLowerCase();
  
  // High-impact keywords
  if (text.includes('breakthrough') || text.includes('revolutionary')) score += 2;
  if (text.includes('billion') || text.includes('acquisition')) score += 2;
  if (text.includes('open source') || text.includes('free tier')) score += 1;
  
  // Major companies boost
  const majorCompanies = ['OpenAI', 'Google', 'Anthropic', 'Meta', 'Microsoft'];
  if (article.companies.some(c => majorCompanies.includes(c))) score += 1;
  
  // Recent news boost
  const hoursOld = (Date.now() - new Date(article.published_date).getTime()) / (1000 * 60 * 60);
  if (hoursOld < 6) score += 1;
  
  return Math.min(score, 10);
}

function determineSentiment(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  
  const positive = ['success', 'breakthrough', 'launch', 'achievement', 'innovative', 'leading'];
  const negative = ['struggle', 'fail', 'concern', 'issue', 'problem', 'criticism', 'lawsuit'];
  
  const posCount = positive.filter(word => text.includes(word)).length;
  const negCount = negative.filter(word => text.includes(word)).length;
  
  if (posCount > negCount) return 'positive';
  if (negCount > posCount) return 'negative';
  return 'neutral';
}

// Fetch news from RSS feeds
async function fetchFromRSS() {
  const parser = new Parser({
    customFields: {
      item: ['media:content', 'media:thumbnail', 'enclosure']
    }
  });
  
  const articles = [];
  
  for (const feed of RSS_FEEDS) {
    try {
      console.log(`Fetching from ${feed.source}...`);
      const rssFeed = await parser.parseURL(feed.url);
      
      for (const item of rssFeed.items.slice(0, 5)) { // Limit to 5 per feed
        const content = item.contentSnippet || item.summary || item.description || '';
        const companies = extractCompanies(item.title, content);
        if (feed.company && !companies.includes(feed.company)) {
          companies.push(feed.company);
        }
        
        const article = {
          title: item.title,
          summary: content.slice(0, 500),
          content: item.content || content,
          source: feed.source,
          source_url: item.link,
          published_date: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          category: categorizeArticle(item.title, content),
          tags: extractTags(item.title, content),
          companies: companies,
          sentiment: determineSentiment(item.title, content),
          image_url: item.enclosure?.url || item['media:thumbnail'] || null,
          author: item.creator || item.author || null,
          is_featured: false
        };
        
        article.importance_score = calculateImportanceScore(article);
        articles.push(article);
      }
    } catch (error) {
      console.error(`Error fetching ${feed.source}:`, error.message);
    }
  }
  
  return articles;
}

// Fetch from NewsAPI (optional - requires API key)
async function fetchFromNewsAPI() {
  if (!process.env.NEWS_API_KEY) {
    console.log('No NewsAPI key provided, skipping...');
    return [];
  }
  
  const queries = [
    'artificial intelligence',
    'OpenAI OR Anthropic OR "Google AI"',
    'machine learning breakthrough',
    'AI regulation policy'
  ];
  
  const articles = [];
  
  for (const query of queries) {
    try {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&apiKey=${process.env.NEWS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.articles) {
        for (const item of data.articles.slice(0, 3)) { // Limit per query
          const companies = extractCompanies(item.title, item.description);
          
          const article = {
            title: item.title,
            summary: item.description,
            content: item.content || item.description,
            source: item.source.name,
            source_url: item.url,
            published_date: new Date(item.publishedAt).toISOString(),
            category: categorizeArticle(item.title, item.description),
            tags: extractTags(item.title, item.description),
            companies: companies,
            sentiment: determineSentiment(item.title, item.description),
            image_url: item.urlToImage,
            author: item.author,
            is_featured: false
          };
          
          article.importance_score = calculateImportanceScore(article);
          articles.push(article);
        }
      }
    } catch (error) {
      console.error(`Error fetching NewsAPI for "${query}":`, error.message);
    }
  }
  
  return articles;
}

// Main function
async function main() {
  console.log('Starting AI news fetch at', new Date().toISOString());
  
  try {
    // Fetch from all sources
    const rssArticles = await fetchFromRSS();
    const newsApiArticles = await fetchFromNewsAPI();
    
    const allArticles = [...rssArticles, ...newsApiArticles];
    console.log(`Fetched ${allArticles.length} articles total`);
    
    // Remove duplicates based on URL
    const uniqueArticles = [];
    const seenUrls = new Set();
    
    // First, check existing URLs in database from last 24 hours
    const { data: existingArticles } = await supabase
      .from('ai_news')
      .select('source_url')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    if (existingArticles) {
      existingArticles.forEach(article => seenUrls.add(article.source_url));
    }
    
    // Filter out duplicates
    for (const article of allArticles) {
      if (!seenUrls.has(article.source_url)) {
        uniqueArticles.push(article);
        seenUrls.add(article.source_url);
      }
    }
    
    console.log(`${uniqueArticles.length} new unique articles to insert`);
    
    if (uniqueArticles.length > 0) {
      // Mark top 3 as featured
      uniqueArticles
        .sort((a, b) => b.importance_score - a.importance_score)
        .slice(0, 3)
        .forEach(article => article.is_featured = true);
      
      // Insert into database
      const { data, error } = await supabase
        .from('ai_news')
        .insert(uniqueArticles)
        .select();
      
      if (error) {
        console.error('Error inserting articles:', error);
      } else {
        console.log(`Successfully inserted ${data.length} articles`);
      }
    } else {
      console.log('No new articles to insert');
    }
    
    // Clean up old articles (keep last 60 days)
    const { error: deleteError } = await supabase
      .from('ai_news')
      .delete()
      .lt('published_date', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString());
    
    if (deleteError) {
      console.error('Error cleaning old articles:', deleteError);
    } else {
      console.log('Cleaned up old articles');
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
  
  console.log('News fetch completed successfully');
}

// Run the script
main();