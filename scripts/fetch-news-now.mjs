import { createClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';
import fetch from 'node-fetch';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
      ['image', 'image']
    ]
  }
});

// EXPANDED RSS FEEDS WITH MORE SOURCES
const RSS_FEEDS = [
  // AI & Technology - MORE SOURCES
  { url: 'https://openai.com/blog/rss.xml', source: 'OpenAI Blog', newsType: 'ai', company: 'OpenAI', priority: 10 },
  { url: 'https://blog.google/technology/ai/rss/', source: 'Google AI Blog', newsType: 'ai', company: 'Google', priority: 10 },
  { url: 'https://www.anthropic.com/index/rss.xml', source: 'Anthropic Blog', newsType: 'ai', company: 'Anthropic', priority: 10 },
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch AI', newsType: 'ai', priority: 8 },
  { url: 'https://venturebeat.com/ai/feed/', source: 'VentureBeat AI', newsType: 'ai', priority: 7 },
  { url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml', source: 'The Verge AI', newsType: 'ai', priority: 7 },
  { url: 'https://www.wired.com/feed/tag/ai/latest/rss', source: 'Wired AI', newsType: 'ai', priority: 7 },
  { url: 'https://arstechnica.com/ai/feed/', source: 'Ars Technica AI', newsType: 'ai', priority: 6 },
  { url: 'https://www.technologyreview.com/feed/', source: 'MIT Tech Review', newsType: 'ai', priority: 8 },
  { url: 'https://feeds.feedburner.com/TheHackersNews', source: 'The Hacker News', newsType: 'ai', priority: 6 },
  { url: 'https://www.engadget.com/rss.xml', source: 'Engadget', newsType: 'ai', priority: 6 },
  { url: 'https://spectrum.ieee.org/feeds/feed.rss', source: 'IEEE Spectrum', newsType: 'ai', priority: 7 },
  
  // World News - MORE SOURCES
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World News', newsType: 'world', priority: 9 },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', newsType: 'world', priority: 8 },
  { url: 'https://feeds.npr.org/1004/rss.xml', source: 'NPR World News', newsType: 'world', priority: 8 },
  { url: 'https://rss.cnn.com/rss/edition_world.rss', source: 'CNN World', newsType: 'world', priority: 7 },
  { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian World', newsType: 'world', priority: 8 },
  { url: 'https://www.reuters.com/rssFeed/worldNews', source: 'Reuters World', newsType: 'world', priority: 9 },
  { url: 'https://feeds.washingtonpost.com/rss/world', source: 'Washington Post World', newsType: 'world', priority: 8 },
  { url: 'https://feeds.apnews.com/rss/apf-topnews', source: 'AP News', newsType: 'world', priority: 9 },
  
  // Business News - MORE SOURCES
  { url: 'https://feeds.bloomberg.com/markets/news.rss', source: 'Bloomberg Markets', newsType: 'business', priority: 9 },
  { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', source: 'CNBC Business', newsType: 'business', priority: 8 },
  { url: 'https://feeds.marketwatch.com/marketwatch/topstories/', source: 'MarketWatch', newsType: 'business', priority: 7 },
  { url: 'https://fortune.com/feed/', source: 'Fortune', newsType: 'business', priority: 7 },
  { url: 'https://feeds.ft.com/rss/home', source: 'Financial Times', newsType: 'business', priority: 9 },
  { url: 'https://www.wsj.com/xml/rss/3_7085.xml', source: 'WSJ Tech', newsType: 'business', priority: 9 },
  { url: 'https://www.economist.com/business/rss.xml', source: 'The Economist Business', newsType: 'business', priority: 8 },
  { url: 'https://feeds.inc.com/home/updates', source: 'Inc Magazine', newsType: 'business', priority: 6 },
  
  // NYC News - MORE SOURCES
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml', source: 'NY Times Metro', newsType: 'nyc', location: 'New York', priority: 9 },
  { url: 'https://gothamist.com/feed', source: 'Gothamist', newsType: 'nyc', location: 'New York', priority: 8 },
  { url: 'https://patch.com/new-york/new-york-city/rss.xml', source: 'NYC Patch', newsType: 'nyc', location: 'New York', priority: 6 },
  { url: 'https://ny1.com/services/contentfeed.nyc%7call-boroughs%7cnews.landing.rss', source: 'NY1', newsType: 'nyc', location: 'New York', priority: 8 },
  { url: 'https://www.amny.com/feed/', source: 'AM New York', newsType: 'nyc', location: 'New York', priority: 6 },
  { url: 'https://nypost.com/feed/', source: 'NY Post', newsType: 'nyc', location: 'New York', priority: 7 },
  
  // Costa Rica News
  { url: 'https://ticotimes.net/feed', source: 'Tico Times', newsType: 'costa-rica', location: 'Costa Rica', language: 'en', priority: 9 },
  { url: 'https://qcostarica.com/feed/', source: 'Q Costa Rica', newsType: 'costa-rica', location: 'Costa Rica', language: 'en', priority: 8 },
  { url: 'https://news.co.cr/feed/', source: 'Costa Rica News', newsType: 'costa-rica', location: 'Costa Rica', language: 'en', priority: 7 }
];

// Extract image from various RSS feed formats
function extractImageUrl(item) {
  // Try multiple sources for images
  if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
    return item.mediaContent.$.url;
  }
  
  if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
    return item.mediaThumbnail.$.url;
  }
  
  if (item.enclosure && item.enclosure.url && item.enclosure.type && item.enclosure.type.startsWith('image/')) {
    return item.enclosure.url;
  }
  
  if (item.image) {
    return typeof item.image === 'string' ? item.image : item.image.url || item.image.$ && item.image.$.url;
  }
  
  // Try to extract from content
  if (item.contentEncoded || item['content:encoded']) {
    const content = item.contentEncoded || item['content:encoded'];
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
  }
  
  return null;
}

async function fetchAndSaveNews() {
  console.log('🚀 Starting aggressive news fetch...\n');
  
  let totalSaved = 0;
  let totalWithImages = 0;
  
  for (const feedConfig of RSS_FEEDS) {
    try {
      console.log(`📰 Fetching from ${feedConfig.source}...`);
      const feed = await parser.parseURL(feedConfig.url);
      
      let savedCount = 0;
      let imageCount = 0;
      
      for (const item of feed.items.slice(0, 20)) { // Get up to 20 items per feed
        try {
          const imageUrl = extractImageUrl(item);
          if (imageUrl) imageCount++;
          
          const newsItem = {
            title: item.title,
            content: item.contentEncoded || item['content:encoded'] || item.content || item.description,
            summary: item.description || item.summary,
            source: feedConfig.source,
            source_url: item.link,
            published_date: new Date(item.pubDate || item.pubdate || item.published || new Date()),
            category: 'general',
            tags: item.categories || [],
            companies: feedConfig.company ? [feedConfig.company] : [],
            news_type: feedConfig.newsType,
            location: feedConfig.location || null,
            sub_location: null,
            importance_score: feedConfig.priority,
            image_url: imageUrl,
            author: item.creator || item.author || null,
            language: feedConfig.language || 'en',
            link_status: 'valid'
          };
          
          // Check if article already exists
          const { data: existing } = await supabase
            .from('news')
            .select('id')
            .eq('source_url', newsItem.source_url)
            .single();
          
          if (!existing) {
            const { error } = await supabase
              .from('news')
              .insert([newsItem]);
            
            if (!error) {
              savedCount++;
            }
          }
        } catch (itemError) {
          console.error(`Error processing item: ${itemError.message}`);
        }
      }
      
      totalSaved += savedCount;
      totalWithImages += imageCount;
      console.log(`✅ Saved ${savedCount} articles (${imageCount} with images) from ${feedConfig.source}`);
      
    } catch (error) {
      console.error(`❌ Failed to fetch ${feedConfig.source}: ${error.message}`);
    }
  }
  
  console.log(`\n🎉 FETCH COMPLETE!`);
  console.log(`📊 Total articles saved: ${totalSaved}`);
  console.log(`🖼️  Articles with images: ${totalWithImages}`);
  
  // Get current stats
  const { data: allArticles, error: countError } = await supabase
    .from('news')
    .select('id, image_url');
  
  if (!countError) {
    const totalArticles = allArticles.length;
    const articlesWithImages = allArticles.filter(a => a.image_url).length;
    console.log(`\n📈 DATABASE TOTALS:`);
    console.log(`📰 Total articles in database: ${totalArticles}`);
    console.log(`🖼️  Total with images: ${articlesWithImages} (${Math.round(articlesWithImages/totalArticles*100)}%)`);
  }
}

// Run immediately
fetchAndSaveNews().catch(console.error);