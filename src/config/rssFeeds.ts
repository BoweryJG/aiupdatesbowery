export interface RSSFeed {
  url: string;
  source: string;
  newsType: 'ai' | 'world' | 'business' | 'nyc' | 'costa-rica' | 'local';
  location?: string;
  subLocation?: string;
  language?: string;
  company?: string;
  priority?: number;
}

export const RSS_FEEDS: RSSFeed[] = [
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
  { url: 'https://feeds.reuters.com/reuters/worldNews', source: 'Reuters World', newsType: 'world', priority: 9 },
  
  // Business News
  { url: 'https://feeds.bloomberg.com/markets/news.rss', source: 'Bloomberg Markets', newsType: 'business', priority: 9 },
  { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', source: 'CNBC Business', newsType: 'business', priority: 8 },
  { url: 'https://feeds.ft.com/rss/home/us', source: 'Financial Times', newsType: 'business', priority: 9 },
  { url: 'https://feeds.marketwatch.com/marketwatch/topstories/', source: 'MarketWatch', newsType: 'business', priority: 7 },
  { url: 'https://fortune.com/feed/', source: 'Fortune', newsType: 'business', priority: 7 },
  { url: 'https://www.economist.com/business/rss.xml', source: 'The Economist Business', newsType: 'business', priority: 8 },
  
  // New York City News
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml', source: 'NY Times Metro', newsType: 'nyc', location: 'New York', priority: 9 },
  { url: 'https://ny1.com/services/contentfeed.nyc%7call-boroughs%7cnews.landing.rss', source: 'NY1', newsType: 'nyc', location: 'New York', priority: 8 },
  { url: 'https://gothamist.com/feed', source: 'Gothamist', newsType: 'nyc', location: 'New York', priority: 8 },
  { url: 'https://www.timeout.com/newyork/feed.xml', source: 'Time Out NY', newsType: 'nyc', location: 'New York', priority: 7 },
  { url: 'https://patch.com/new-york/new-york-city/rss.xml', source: 'NYC Patch', newsType: 'nyc', location: 'New York', priority: 6 },
  { url: 'https://www.amny.com/feed/', source: 'amNewYork', newsType: 'nyc', location: 'New York', priority: 7 },
  
  // Bowery NYC Specific
  { url: 'https://evgrieve.com/feeds/posts/default', source: 'EV Grieve', newsType: 'nyc', location: 'New York', subLocation: 'Bowery', priority: 8 },
  { url: 'https://www.theboweryboys.com/feed/', source: 'The Bowery Boys', newsType: 'nyc', location: 'New York', subLocation: 'Bowery', priority: 7 },
  { url: 'https://boweryboogie.com/feed/', source: 'Bowery Boogie', newsType: 'nyc', location: 'New York', subLocation: 'Bowery', priority: 9 },
  
  // Costa Rica News
  { url: 'https://ticotimes.net/feed', source: 'Tico Times', newsType: 'costa-rica', location: 'Costa Rica', language: 'en', priority: 9 },
  { url: 'https://qcostarica.com/feed/', source: 'Q Costa Rica', newsType: 'costa-rica', location: 'Costa Rica', language: 'en', priority: 8 },
  { url: 'https://news.co.cr/feed/', source: 'Costa Rica Star', newsType: 'costa-rica', location: 'Costa Rica', language: 'en', priority: 8 },
  { url: 'https://costaricantimes.com/feed', source: 'Costa Rican Times', newsType: 'costa-rica', location: 'Costa Rica', language: 'en', priority: 7 },
  
  // Ojochal/Dominical Specific (Local Costa Rica)
  { url: 'https://howlermag.com/feed/', source: 'Howler Magazine', newsType: 'costa-rica', location: 'Costa Rica', subLocation: 'Dominical', language: 'en', priority: 7 },
  { url: 'https://www.dominicaldays.com/feed/', source: 'Dominical Days', newsType: 'costa-rica', location: 'Costa Rica', subLocation: 'Dominical', language: 'en', priority: 8 },
  // Note: Many local Ojochal/Dominical sources are Facebook groups or don't have RSS
  // We'll need to supplement with Costa Rica general news filtered by location keywords
];

// Keywords for location-based filtering
export const LOCATION_KEYWORDS = {
  'Bowery': ['bowery', 'lower east side', 'les', 'east village', 'noho', 'nolita'],
  'Ojochal': ['ojochal', 'uvita', 'dominical', 'costa ballena', 'south pacific costa rica', 'puntarenas'],
  'Dominical': ['dominical', 'dominicalito', 'playa dominical', 'baru', 'escaleras']
};

// Categories for news classification
export const NEWS_CATEGORIES = {
  ai: ['product_launch', 'funding', 'research', 'partnership', 'ethics_policy', 'technical_breakthrough', 'hardware', 'use_case'],
  world: ['politics', 'conflict', 'climate', 'health', 'science', 'culture', 'disasters', 'human_interest'],
  business: ['markets', 'earnings', 'deals', 'economy', 'startups', 'crypto', 'real_estate', 'commodities'],
  nyc: ['crime', 'politics', 'transit', 'real_estate', 'culture', 'food', 'events', 'weather'],
  'costa-rica': ['tourism', 'expat_life', 'real_estate', 'environment', 'politics', 'culture', 'weather', 'wildlife']
};

// Keywords for categorization
export const CATEGORY_KEYWORDS = {
  // AI categories (existing)
  'product_launch': ['launch', 'announce', 'release', 'introduce', 'unveil', 'debut'],
  'funding': ['funding', 'investment', 'raise', 'valuation', 'series', 'round'],
  'research': ['research', 'study', 'paper', 'breakthrough', 'discover', 'finding'],
  'partnership': ['partnership', 'collaborate', 'team up', 'join forces', 'alliance'],
  'ethics_policy': ['regulation', 'ethics', 'policy', 'governance', 'law', 'compliance'],
  'technical_breakthrough': ['breakthrough', 'milestone', 'achievement', 'innovation'],
  'hardware': ['chip', 'gpu', 'processor', 'hardware', 'computing power'],
  'use_case': ['application', 'use case', 'implementation', 'deploy', 'real-world'],
  
  // World news categories
  'politics': ['election', 'president', 'prime minister', 'government', 'parliament', 'policy'],
  'conflict': ['war', 'conflict', 'military', 'attack', 'peace', 'ceasefire'],
  'climate': ['climate', 'global warming', 'emissions', 'renewable', 'environment'],
  'health': ['pandemic', 'vaccine', 'disease', 'health', 'medical', 'outbreak'],
  
  // Business categories
  'markets': ['stock', 'shares', 'dow', 'nasdaq', 'trading', 'market'],
  'earnings': ['earnings', 'profit', 'revenue', 'quarterly', 'results'],
  'deals': ['merger', 'acquisition', 'deal', 'buyout', 'takeover'],
  'economy': ['inflation', 'gdp', 'unemployment', 'recession', 'growth'],
  
  // NYC categories
  'transit': ['mta', 'subway', 'bus', 'traffic', 'congestion', 'transit'],
  'crime': ['crime', 'arrest', 'police', 'nypd', 'shooting', 'robbery'],
  
  // Costa Rica categories
  'tourism': ['tourist', 'visitor', 'travel', 'destination', 'hotel', 'resort'],
  'expat_life': ['expat', 'resident', 'retirement', 'living in', 'move to'],
  'wildlife': ['wildlife', 'animal', 'conservation', 'national park', 'biodiversity']
};