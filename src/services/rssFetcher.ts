// RSS Feed Fetcher Service
// Note: This would typically run on a backend server, not in the browser
// due to CORS restrictions. This is provided as a reference implementation.

interface RSSFeed {
  name: string;
  url: string;
  category: string;
  company?: string;
}

const AI_RSS_FEEDS: RSSFeed[] = [
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog/rss/',
    category: 'research',
    company: 'OpenAI'
  },
  {
    name: 'Google AI Blog',
    url: 'https://blog.google/technology/ai/rss/',
    category: 'research',
    company: 'Google'
  },
  {
    name: 'MIT News - AI',
    url: 'https://news.mit.edu/rss/topic/artificial-intelligence2',
    category: 'research'
  },
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    category: 'industry_news'
  },
  {
    name: 'VentureBeat AI',
    url: 'https://venturebeat.com/ai/feed/',
    category: 'industry_news'
  },
  {
    name: 'The Verge AI',
    url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
    category: 'industry_news'
  }
];

// Example function to parse RSS (would need a proper RSS parser library)
export async function fetchRSSFeeds() {
  // This is a placeholder - in production, you would:
  // 1. Use a proper RSS parser library like 'rss-parser'
  // 2. Run this on a backend server to avoid CORS issues
  // 3. Parse and transform the RSS items to match our AINews interface
  // 4. Save to Supabase database
  
  console.log('RSS feeds would be fetched from:', AI_RSS_FEEDS);
  
  // Example of what the implementation might look like:
  /*
  const Parser = require('rss-parser');
  const parser = new Parser();
  
  for (const feed of AI_RSS_FEEDS) {
    try {
      const rssFeed = await parser.parseURL(feed.url);
      
      for (const item of rssFeed.items) {
        const newsItem = {
          title: item.title,
          content: item.content || item.contentSnippet,
          summary: item.contentSnippet,
          source: feed.name,
          source_url: item.link,
          published_date: new Date(item.pubDate),
          category: feed.category,
          companies: feed.company ? [feed.company] : [],
          tags: extractTags(item.title + ' ' + item.content),
          // ... other fields
        };
        
        // Save to Supabase
        await supabase.from('ai_news').insert(newsItem);
      }
    } catch (error) {
      console.error(`Failed to fetch ${feed.name}:`, error);
    }
  }
  */
}

// Helper function to extract tags from content
export function extractTags(content: string): string[] {
  const aiKeywords = [
    'gpt', 'llm', 'transformer', 'neural network', 'machine learning',
    'deep learning', 'ai safety', 'chatbot', 'computer vision', 'nlp',
    'reinforcement learning', 'generative ai', 'multimodal', 'foundation model'
  ];
  
  const lowercaseContent = content.toLowerCase();
  return aiKeywords.filter(keyword => lowercaseContent.includes(keyword));
}

// Function to categorize news based on content
export function categorizeNews(title: string, content: string): string {
  const text = (title + ' ' + content).toLowerCase();
  
  if (text.includes('funding') || text.includes('raises') || text.includes('investment')) {
    return 'funding';
  } else if (text.includes('launch') || text.includes('release') || text.includes('announce')) {
    return 'product_launch';
  } else if (text.includes('research') || text.includes('paper') || text.includes('study')) {
    return 'research';
  } else if (text.includes('partnership') || text.includes('collaboration')) {
    return 'partnership';
  } else if (text.includes('ethics') || text.includes('regulation') || text.includes('policy')) {
    return 'ethics_policy';
  } else if (text.includes('breakthrough') || text.includes('innovation')) {
    return 'technical_breakthrough';
  }
  
  return 'general';
}

// Function to calculate importance score
export function calculateImportanceScore(item: {
  title: string;
  content: string;
  source: string;
}): number {
  let score = 5; // Base score
  
  const text = (item.title + ' ' + item.content).toLowerCase();
  
  // High-impact keywords
  if (text.includes('breakthrough') || text.includes('revolutionary')) score += 3;
  if (text.includes('billion') || text.includes('acquisition')) score += 2;
  if (text.includes('open source') || text.includes('available now')) score += 2;
  
  // Major companies
  const majorCompanies = ['openai', 'google', 'microsoft', 'meta', 'anthropic'];
  if (majorCompanies.some(company => text.includes(company))) score += 1;
  
  // Trusted sources
  const trustedSources = ['MIT News', 'OpenAI Blog', 'Google AI Blog'];
  if (trustedSources.includes(item.source)) score += 1;
  
  return Math.min(score, 10);
}