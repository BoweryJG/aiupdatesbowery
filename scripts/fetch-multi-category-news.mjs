import { createClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory for .env file resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

// Load environment variables with multiple fallback strategies
function loadEnvironmentVariables() {
  // Try multiple .env file locations
  const envPaths = [
    join(projectRoot, '.env'),
    join(projectRoot, '.env.local'),
    join(process.cwd(), '.env'),
    '.env'
  ];
  
  let envLoaded = false;
  for (const envPath of envPaths) {
    try {
      const result = dotenv.config({ path: envPath });
      if (!result.error) {
        console.log(`✓ Loaded environment from: ${envPath}`);
        envLoaded = true;
        break;
      }
    } catch (error) {
      // Continue to next path
    }
  }
  
  if (!envLoaded) {
    console.warn('⚠️  Could not load .env file, using system environment variables');
  }
  
  // Validate required environment variables
  const requiredVars = {
    SUPABASE_URL: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  };
  
  const missing = [];
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please check your .env file contains:');
    console.error('SUPABASE_URL=your_supabase_url');
    console.error('SUPABASE_SERVICE_KEY=your_service_key');
    process.exit(1);
  }
  
  return requiredVars;
}

// Load and validate environment
const env = loadEnvironmentVariables();
// Define RSS feeds and configuration directly in the script
const RSS_FEEDS = [
  // AI & Technology (existing feeds)
  { url: 'https://openai.com/blog/rss.xml', source: 'OpenAI Blog', newsType: 'ai', company: 'OpenAI', priority: 10 },
  { url: 'https://blog.google/technology/ai/rss/', source: 'Google AI Blog', newsType: 'ai', company: 'Google', priority: 10 },
  { url: 'https://www.anthropic.com/news/rss.xml', source: 'Anthropic Blog', newsType: 'ai', company: 'Anthropic', priority: 10 },
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch AI', newsType: 'ai', priority: 8 },
  { url: 'https://venturebeat.com/category/ai/feed/', source: 'VentureBeat AI', newsType: 'ai', priority: 7 },
  { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge AI', newsType: 'ai', priority: 7 },
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
  { url: 'https://patch.com/feeds/all', source: 'NYC Patch', newsType: 'nyc', location: 'New York', priority: 6 },
  
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

// Initialize Supabase client with validated environment variables
const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY
);

// Initialize RSS parser with SSL configuration
const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail', 'enclosure', 'dc:creator', 'author']
  },
  timeout: 15000, // 15 second timeout
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; NewsAggregator/1.0)',
    'Accept': 'application/rss+xml, application/xml, text/xml',
    'Accept-Encoding': 'gzip, deflate'
  },
  requestOptions: {
    rejectUnauthorized: false, // Allow self-signed certificates
    timeout: 15000,
    agent: false // Disable keep-alive for better SSL handling
  }
});

// Link validator with SSL fix
async function validateLink(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsAggregator/1.0)',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'
      },
      // SSL/TLS options for node-fetch
      agent: false,
      rejectUnauthorized: false
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

// Retry mechanism with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = initialDelay * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Enhanced feed fetching with error recovery
async function fetchFromFeed(feed) {
  const fetchOperation = async () => {
    console.log(`Fetching from ${feed.source}...`);
    
    // Create parser instance with enhanced SSL/TLS configuration
    const feedParser = new Parser({
      customFields: {
        item: ['media:content', 'media:thumbnail', 'enclosure', 'dc:creator', 'author']
      },
      timeout: 20000, // 20 second timeout for problematic feeds
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsAggregator/1.0; +https://aiupdatesbowery.com)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
        'Accept-Encoding': 'gzip, deflate',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      },
      requestOptions: {
        rejectUnauthorized: false, // Allow self-signed certificates
        timeout: 20000,
        agent: false, // Disable keep-alive for better SSL handling
        secureProtocol: 'TLSv1_2_method' // Force TLS 1.2
      }
    });
    
    const rssFeed = await feedParser.parseURL(feed.url);
    
    if (!rssFeed || !rssFeed.items || rssFeed.items.length === 0) {
      throw new Error(`No items found in RSS feed for ${feed.source}`);
    }
    
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
  };

  try {
    return await retryWithBackoff(fetchOperation, 3, 2000);
  } catch (error) {
    console.error(`❌ Failed to fetch ${feed.source} after retries:`, error.message);
    
    // Log the failure for monitoring
    try {
      await supabase
        .from('feed_errors')
        .insert({
          feed_source: feed.source,
          feed_url: feed.url,
          error_message: error.message,
          error_type: 'fetch_failure',
          created_at: new Date().toISOString()
        });
    } catch (logError) {
      console.warn('Could not log feed error:', logError.message);
    }
    
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

// Health check and self-healing
async function performHealthCheck() {
  console.log('🔍 Performing health check...');
  
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('ai_news')
      .select('count')
      .limit(1);
    
    if (error) {
      throw new Error(`Supabase connection failed: ${error.message}`);
    }
    
    console.log('✓ Supabase connection healthy');
    
    // Test at least one RSS feed
    const testFeed = RSS_FEEDS.find(feed => feed.priority >= 9);
    if (testFeed) {
      const testParser = new Parser({ timeout: 10000 });
      await testParser.parseURL(testFeed.url);
      console.log('✓ RSS feed connectivity healthy');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

// Enhanced main function with comprehensive error handling
async function main() {
  console.log('🚀 Starting multi-category news fetch at', new Date().toISOString());
  
  // Perform health check first
  const isHealthy = await performHealthCheck();
  if (!isHealthy) {
    console.error('❌ Health check failed, attempting self-healing...');
    
    // Wait 30 seconds and try again
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    const secondCheck = await performHealthCheck();
    if (!secondCheck) {
      console.error('❌ Self-healing failed, exiting with error code');
      process.exit(1);
    }
  }
  
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
      .from('ai_news')
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
      // Skip validation for faster processing in case of issues
      console.log('Skipping link validation for faster processing...');
      const validatedArticles = uniqueArticles.map(article => ({
        ...article,
        link_status: 'unchecked',
        last_validated: new Date().toISOString()
      }));
      
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
        .from('ai_news')
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
      console.log('✓ No new articles to insert');
    }
    
    // Clean up old articles (keep last 90 days) with error handling
    try {
      const { error: deleteError } = await supabase
        .from('ai_news')
        .delete()
        .lt('published_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());
      
      if (deleteError) {
        console.error('⚠️  Error cleaning old articles:', deleteError.message);
      } else {
        console.log('✓ Cleaned up old articles');
      }
    } catch (cleanupError) {
      console.warn('⚠️  Could not perform cleanup:', cleanupError.message);
    }
    
    // Log successful completion
    const endTime = new Date().toISOString();
    console.log(`✅ Multi-category news fetch completed successfully at ${endTime}`);
    
    // Final health check
    const finalHealth = await performHealthCheck();
    if (!finalHealth) {
      console.warn('⚠️  Final health check failed - future runs may have issues');
    }
    
  } catch (error) {
    console.error('💥 Fatal error in main process:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Log the fatal error for monitoring
    try {
      await supabase
        .from('feed_errors')
        .insert({
          feed_source: 'MAIN_PROCESS',
          feed_url: 'N/A',
          error_message: error.message,
          error_type: 'fatal_error',
          created_at: new Date().toISOString()
        });
    } catch (logError) {
      console.error('Could not log fatal error:', logError.message);
    }
    
    process.exit(1);
  }
}

// Run the script
main();