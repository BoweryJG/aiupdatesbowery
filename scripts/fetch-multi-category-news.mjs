import { createClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';
import fetch from 'node-fetch';
// Define RSS feeds and configuration directly in the script
const RSS_FEEDS = [
  // AI & Technology (existing feeds)
  { url: 'https://openai.com/blog/rss.xml', source: 'OpenAI Blog', newsType: 'ai', company: 'OpenAI', priority: 10 },
  { url: 'https://blog.google/technology/ai/rss/', source: 'Google AI Blog', newsType: 'ai', company: 'Google', priority: 10 },
  { url: 'https://www.anthropic.com/index/rss.xml', source: 'Anthropic Blog', newsType: 'ai', company: 'Anthropic', priority: 10 },
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch AI', newsType: 'ai', priority: 8 },
  { url: 'https://venturebeat.com/ai/feed/', source: 'VentureBeat AI', newsType: 'ai', priority: 7 },
  { url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml', source: 'The Verge AI', newsType: 'ai', priority: 7 },
  { url: 'https://www.wired.com/feed/tag/ai/latest/rss', source: 'Wired AI', newsType: 'ai', priority: 7 },
  { url: 'https://arstechnica.com/ai/feed/', source: 'Ars Technica AI', newsType: 'ai', priority: 6 },
  
  // World News
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World News', newsType: 'world', priority: 9 },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', newsType: 'world', priority: 8 },
  { url: 'https://feeds.npr.org/1004/rss.xml', source: 'NPR World News', newsType: 'world', priority: 8 },
  { url: 'https://rss.cnn.com/rss/edition_world.rss', source: 'CNN World', newsType: 'world', priority: 7 },
  { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian World', newsType: 'world', priority: 8 },
  
  // Business News
  { url: 'https://feeds.bloomberg.com/markets/news.rss', source: 'Bloomberg Markets', newsType: 'business', priority: 9 },
  { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', source: 'CNBC Business', newsType: 'business', priority: 8 },
  { url: 'https://feeds.marketwatch.com/marketwatch/topstories/', source: 'MarketWatch', newsType: 'business', priority: 7 },
  { url: 'https://fortune.com/feed/', source: 'Fortune', newsType: 'business', priority: 7 },
  
  // NYC News
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml', source: 'NY Times Metro', newsType: 'nyc', location: 'New York', priority: 9 },
  { url: 'https://gothamist.com/feed', source: 'Gothamist', newsType: 'nyc', location: 'New York', priority: 8 },
  { url: 'https://patch.com/new-york/new-york-city/rss.xml', source: 'NYC Patch', newsType: 'nyc', location: 'New York', priority: 6 },
  
  // Costa Rica News
  { url: 'https://ticotimes.net/feed', source: 'Tico Times', newsType: 'costa-rica', location: 'Costa Rica', language: 'en', priority: 9 },
  { url: 'https://qcostarica.com/feed/', source: 'Q Costa Rica', newsType: 'costa-rica', location: 'Costa Rica', language: 'en', priority: 8 }
];

const LOCATION_KEYWORDS = {
  'Bowery': ['bowery', 'lower east side', 'les', 'east village', 'noho', 'nolita'],
  'Ojochal': ['ojochal', 'uvita', 'dominical', 'costa ballena', 'south pacific costa rica', 'puntarenas'],
  'Dominical': ['dominical', 'dominicalito', 'playa dominical', 'baru', 'escaleras']
};

const NEWS_CATEGORIES = {
  ai: ['product_launch', 'funding', 'research', 'partnership', 'ethics_policy', 'technical_breakthrough', 'hardware', 'use_case'],
  world: ['politics', 'conflict', 'climate', 'health', 'science', 'culture', 'disasters', 'human_interest'],
  business: ['markets', 'earnings', 'deals', 'economy', 'startups', 'crypto', 'real_estate', 'commodities'],
  nyc: ['crime', 'politics', 'transit', 'real_estate', 'culture', 'food', 'events', 'weather'],
  'costa-rica': ['tourism', 'expat_life', 'real_estate', 'environment', 'politics', 'culture', 'weather', 'wildlife']
};

const CATEGORY_KEYWORDS = {
  'product_launch': ['launch', 'announce', 'release', 'introduce', 'unveil', 'debut'],
  'funding': ['funding', 'investment', 'raise', 'valuation', 'series', 'round'],
  'research': ['research', 'study', 'paper', 'breakthrough', 'discover', 'finding'],
  'partnership': ['partnership', 'collaborate', 'team up', 'join forces', 'alliance'],
  'ethics_policy': ['regulation', 'ethics', 'policy', 'governance', 'law', 'compliance'],
  'technical_breakthrough': ['breakthrough', 'milestone', 'achievement', 'innovation'],
  'hardware': ['chip', 'gpu', 'processor', 'hardware', 'computing power'],
  'use_case': ['application', 'use case', 'implementation', 'deploy', 'real-world'],
  'politics': ['election', 'president', 'prime minister', 'government', 'parliament', 'policy'],
  'conflict': ['war', 'conflict', 'military', 'attack', 'peace', 'ceasefire'],
  'climate': ['climate', 'global warming', 'emissions', 'renewable', 'environment'],
  'health': ['pandemic', 'vaccine', 'disease', 'health', 'medical', 'outbreak'],
  'markets': ['stock', 'shares', 'dow', 'nasdaq', 'trading', 'market'],
  'earnings': ['earnings', 'profit', 'revenue', 'quarterly', 'results'],
  'deals': ['merger', 'acquisition', 'deal', 'buyout', 'takeover'],
  'economy': ['inflation', 'gdp', 'unemployment', 'recession', 'growth'],
  'transit': ['mta', 'subway', 'bus', 'traffic', 'congestion', 'transit'],
  'crime': ['crime', 'arrest', 'police', 'nypd', 'shooting', 'robbery'],
  'tourism': ['tourist', 'visitor', 'travel', 'destination', 'hotel', 'resort'],
  'expat_life': ['expat', 'resident', 'retirement', 'living in', 'move to'],
  'wildlife': ['wildlife', 'animal', 'conservation', 'national park', 'biodiversity']
};

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Initialize RSS parser
const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail', 'enclosure', 'dc:creator', 'author']
  },
  timeout: 10000 // 10 second timeout
});

// Link validator
async function validateLink(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsAggregator/1.0)'
      }
    });
    return {
      isValid: response.ok,
      status: response.status
    };
  } catch (error) {
    return {
      isValid: false,
      status: 0,
      error: error.message
    };
  }
}

// Categorize article based on content
function categorizeArticle(title, content, newsType) {
  const text = `${title} ${content}`.toLowerCase();
  const categories = NEWS_CATEGORIES[newsType] || NEWS_CATEGORIES.ai;
  
  for (const category of categories) {
    const keywords = CATEGORY_KEYWORDS[category];
    if (keywords && keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }
  
  return 'general';
}

// Extract tags based on news type
function extractTags(title, content, newsType) {
  const text = `${title} ${content}`.toLowerCase();
  const tags = [];
  
  // Common tech tags for AI news
  if (newsType === 'ai') {
    const aiTags = ['llm', 'gpt', 'claude', 'gemini', 'transformer', 'neural network',
                    'machine learning', 'deep learning', 'ai safety', 'chatbot',
                    'computer vision', 'nlp', 'generative ai', 'multimodal',
                    'foundation model', 'rag', 'ai agent', 'open source'];
    tags.push(...aiTags.filter(tag => text.includes(tag.toLowerCase())));
  }
  
  // Add location-based tags
  for (const [location, keywords] of Object.entries(LOCATION_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      tags.push(location.toLowerCase());
    }
  }
  
  return [...new Set(tags)]; // Remove duplicates
}

// Extract companies from text
function extractCompanies(title, content) {
  const text = `${title} ${content}`;
  const companies = [
    'OpenAI', 'Google', 'Anthropic', 'Meta', 'Microsoft', 'Apple',
    'NVIDIA', 'Amazon', 'Tesla', 'IBM', 'Mistral', 'Stability AI',
    'Bloomberg', 'Goldman Sachs', 'JPMorgan', 'Bank of America',
    'New York Times', 'Wall Street Journal', 'CNN', 'BBC'
  ];
  
  return companies.filter(company => 
    text.includes(company) || text.toLowerCase().includes(company.toLowerCase())
  );
}

// Calculate importance score
function calculateImportanceScore(article, newsType) {
  let score = 5; // Base score
  const text = `${article.title} ${article.content}`.toLowerCase();
  
  // High-impact keywords
  const impactKeywords = {
    high: ['breaking', 'exclusive', 'urgent', 'crisis', 'emergency', 'major'],
    medium: ['announcement', 'launch', 'release', 'update', 'new'],
    financial: ['billion', 'million', 'acquisition', 'merger', 'ipo']
  };
  
  if (impactKeywords.high.some(k => text.includes(k))) score += 3;
  if (impactKeywords.medium.some(k => text.includes(k))) score += 1;
  if (impactKeywords.financial.some(k => text.includes(k))) score += 2;
  
  // News type importance
  if (newsType === 'world' && text.includes('conflict')) score += 2;
  if (newsType === 'business' && article.companies.length > 2) score += 1;
  
  // Recency boost
  const hoursOld = (Date.now() - new Date(article.published_date).getTime()) / (1000 * 60 * 60);
  if (hoursOld < 3) score += 2;
  else if (hoursOld < 12) score += 1;
  
  // Location-specific boost
  if (article.sub_location) score += 1;
  
  return Math.min(score, 10);
}

// Determine sentiment
function determineSentiment(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  
  const positive = ['success', 'breakthrough', 'launch', 'achievement', 'innovative', 
                   'growth', 'profit', 'gain', 'win', 'positive', 'improve'];
  const negative = ['fail', 'loss', 'decline', 'crisis', 'crash', 'concern', 
                   'issue', 'problem', 'criticism', 'lawsuit', 'fall', 'drop'];
  
  const posCount = positive.filter(word => text.includes(word)).length;
  const negCount = negative.filter(word => text.includes(word)).length;
  
  if (posCount > negCount + 1) return 'positive';
  if (negCount > posCount + 1) return 'negative';
  return 'neutral';
}

// Check if article matches location keywords
function getLocationInfo(title, content, feedLocation, feedSubLocation) {
  const text = `${title} ${content}`.toLowerCase();
  
  let location = feedLocation;
  let subLocation = feedSubLocation;
  
  // Check for specific sub-locations
  for (const [loc, keywords] of Object.entries(LOCATION_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      if (['Bowery', 'Ojochal', 'Dominical'].includes(loc)) {
        subLocation = loc;
      }
    }
  }
  
  return { location, subLocation };
}

// Fetch from a single RSS feed
async function fetchFromFeed(feed) {
  try {
    console.log(`Fetching from ${feed.source}...`);
    const rssFeed = await parser.parseURL(feed.url);
    const articles = [];
    
    // Limit articles per feed based on priority
    const maxArticles = feed.priority >= 9 ? 10 : feed.priority >= 7 ? 7 : 5;
    
    for (const item of rssFeed.items.slice(0, maxArticles)) {
      // Extract content
      const content = item.contentSnippet || item.summary || item.description || '';
      const fullContent = item.content || item['content:encoded'] || content;
      
      // Get location info
      const { location, subLocation } = getLocationInfo(
        item.title, 
        content, 
        feed.location, 
        feed.subLocation
      );
      
      // Extract article data
      const article = {
        title: item.title,
        summary: content.slice(0, 500),
        content: fullContent,
        source: feed.source,
        source_url: item.link,
        published_date: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        news_type: feed.newsType,
        location: location,
        sub_location: subLocation,
        language: feed.language || 'en',
        category: categorizeArticle(item.title, content, feed.newsType),
        tags: extractTags(item.title, content, feed.newsType),
        companies: extractCompanies(item.title, content),
        sentiment: determineSentiment(item.title, content),
        image_url: item.enclosure?.url || item['media:thumbnail'] || null,
        author: item.creator || item.author || item['dc:creator'] || null,
        is_featured: false,
        link_status: 'unchecked'
      };
      
      // Add company if specified in feed
      if (feed.company && !article.companies.includes(feed.company)) {
        article.companies.push(feed.company);
      }
      
      // Calculate importance score
      article.importance_score = calculateImportanceScore(article, feed.newsType);
      
      articles.push(article);
    }
    
    return articles;
  } catch (error) {
    console.error(`Error fetching ${feed.source}:`, error.message);
    return [];
  }
}

// Fetch news from all feeds in parallel batches
async function fetchAllNews() {
  const allArticles = [];
  const batchSize = 10; // Process 10 feeds at a time
  
  for (let i = 0; i < RSS_FEEDS.length; i += batchSize) {
    const batch = RSS_FEEDS.slice(i, i + batchSize);
    const batchPromises = batch.map(feed => fetchFromFeed(feed));
    const batchResults = await Promise.allSettled(batchPromises);
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value) {
        allArticles.push(...result.value);
      }
    }
    
    // Small delay between batches
    if (i + batchSize < RSS_FEEDS.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return allArticles;
}

// Validate article links in batches
async function validateArticles(articles) {
  const batchSize = 20;
  
  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);
    const validationPromises = batch.map(async (article) => {
      const validation = await validateLink(article.source_url);
      article.link_status = validation.isValid ? 'valid' : 'invalid';
      article.last_validated = new Date().toISOString();
      
      // If invalid, try to get archive.org URL
      if (!validation.isValid) {
        try {
          const archiveUrl = `https://web.archive.org/web/*/${article.source_url}`;
          article.alternate_url = archiveUrl;
        } catch (e) {
          // Ignore archive lookup errors
        }
      }
    });
    
    await Promise.allSettled(validationPromises);
  }
  
  return articles;
}

// Main function
async function main() {
  console.log('Starting multi-category news fetch at', new Date().toISOString());
  
  try {
    // Fetch from all sources
    console.log(`Fetching from ${RSS_FEEDS.length} RSS feeds...`);
    const allArticles = await fetchAllNews();
    console.log(`Fetched ${allArticles.length} articles total`);
    
    // Remove duplicates based on URL
    const uniqueArticles = [];
    const seenUrls = new Set();
    
    // Check existing URLs in database from last 48 hours
    const { data: existingArticles } = await supabase
      .from('news')
      .select('source_url')
      .gte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());
    
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
    
    console.log(`${uniqueArticles.length} new unique articles to process`);
    
    if (uniqueArticles.length > 0) {
      // Validate links
      console.log('Validating article links...');
      const validatedArticles = await validateArticles(uniqueArticles);
      
      // Sort by importance and mark top articles as featured
      const sortedArticles = validatedArticles.sort((a, b) => b.importance_score - a.importance_score);
      
      // Mark top 5 articles per news type as featured
      const newsTypes = ['ai', 'world', 'business', 'nyc', 'costa-rica'];
      for (const newsType of newsTypes) {
        const typeArticles = sortedArticles.filter(a => a.news_type === newsType);
        typeArticles.slice(0, 5).forEach(article => article.is_featured = true);
      }
      
      // Insert into database
      const { data, error } = await supabase
        .from('news')
        .insert(validatedArticles)
        .select();
      
      if (error) {
        console.error('Error inserting articles:', error);
      } else {
        console.log(`Successfully inserted ${data.length} articles`);
        
        // Log statistics
        const stats = newsTypes.map(type => ({
          type,
          count: data.filter(a => a.news_type === type).length
        }));
        console.log('Articles by type:', stats);
      }
    } else {
      console.log('No new articles to insert');
    }
    
    // Clean up old articles (keep last 90 days)
    const { error: deleteError } = await supabase
      .from('news')
      .delete()
      .lt('published_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());
    
    if (deleteError) {
      console.error('Error cleaning old articles:', deleteError);
    } else {
      console.log('Cleaned up old articles');
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
  
  console.log('Multi-category news fetch completed successfully');
}

// Run the script
main();