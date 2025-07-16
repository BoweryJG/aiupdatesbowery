import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Reddit subreddits for different news categories
const REDDIT_SOURCES = [
  // AI & Technology
  { subreddit: 'artificial', category: 'ai', priority: 10 },
  { subreddit: 'MachineLearning', category: 'ai', priority: 9 },
  { subreddit: 'OpenAI', category: 'ai', priority: 8 },
  { subreddit: 'ChatGPT', category: 'ai', priority: 7 },
  { subreddit: 'singularity', category: 'ai', priority: 6 },
  
  // World News
  { subreddit: 'worldnews', category: 'world', priority: 10 },
  { subreddit: 'news', category: 'world', priority: 9 },
  { subreddit: 'politics', category: 'world', priority: 8 },
  
  // Business
  { subreddit: 'business', category: 'business', priority: 8 },
  { subreddit: 'stocks', category: 'business', priority: 7 },
  { subreddit: 'investing', category: 'business', priority: 7 },
  { subreddit: 'entrepreneur', category: 'business', priority: 6 },
  
  // NYC
  { subreddit: 'nyc', category: 'nyc', priority: 9 },
  { subreddit: 'newyorkcity', category: 'nyc', priority: 8 },
  
  // Costa Rica
  { subreddit: 'costa_rica', category: 'costa-rica', priority: 8 },
  { subreddit: 'costarica', category: 'costa-rica', priority: 7 }
];

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Fetch from Reddit subreddit
async function fetchRedditPosts(subreddit, limit = 25) {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.data.children.map(child => child.data);
  } catch (error) {
    console.error(`Error fetching r/${subreddit}:`, error.message);
    return [];
  }
}

// Extract image URL from Reddit post
function extractImageUrl(post) {
  // Direct image posts
  if (post.url && (post.url.includes('.jpg') || post.url.includes('.png') || post.url.includes('.gif'))) {
    return post.url;
  }
  
  // Reddit gallery
  if (post.is_gallery && post.media_metadata) {
    const firstImageId = Object.keys(post.media_metadata)[0];
    if (firstImageId) {
      const imageData = post.media_metadata[firstImageId];
      if (imageData.s && imageData.s.u) {
        return imageData.s.u.replace(/&amp;/g, '&');
      }
    }
  }
  
  // Preview images
  if (post.preview && post.preview.images && post.preview.images.length > 0) {
    return post.preview.images[0].source.url.replace(/&amp;/g, '&');
  }
  
  // Thumbnail
  if (post.thumbnail && post.thumbnail.startsWith('http')) {
    return post.thumbnail;
  }
  
  return null;
}

// Calculate importance score for Reddit post
function calculateImportanceScore(post) {
  let score = 5;
  
  // Upvotes influence
  if (post.ups > 1000) score += 3;
  else if (post.ups > 500) score += 2;
  else if (post.ups > 100) score += 1;
  
  // Comments influence
  if (post.num_comments > 100) score += 2;
  else if (post.num_comments > 50) score += 1;
  
  // Stickied posts are important
  if (post.stickied) score += 1;
  
  // Recent posts get boost
  const hoursOld = (Date.now() - post.created_utc * 1000) / (1000 * 60 * 60);
  if (hoursOld < 1) score += 2;
  else if (hoursOld < 6) score += 1;
  
  return Math.min(score, 10);
}

// Determine sentiment from Reddit post
function determineSentiment(title, selftext) {
  const text = `${title} ${selftext || ''}`.toLowerCase();
  
  const positive = ['good', 'great', 'amazing', 'breakthrough', 'success', 'win', 'awesome', 'excellent'];
  const negative = ['bad', 'terrible', 'awful', 'fail', 'disaster', 'crisis', 'concern', 'problem'];
  
  const posCount = positive.filter(word => text.includes(word)).length;
  const negCount = negative.filter(word => text.includes(word)).length;
  
  if (posCount > negCount) return 'positive';
  if (negCount > posCount) return 'negative';
  return 'neutral';
}

// Process Reddit posts into news format
function processRedditPosts(posts, category, subreddit) {
  return posts
    .filter(post => !post.over_18 && !post.is_video) // Filter out NSFW and video posts
    .map(post => {
      const imageUrl = extractImageUrl(post);
      
      return {
        title: post.title,
        summary: post.selftext ? post.selftext.slice(0, 500) : post.title,
        content: post.selftext || post.title,
        source: `r/${subreddit}`,
        source_url: `https://reddit.com${post.permalink}`,
        published_date: new Date(post.created_utc * 1000).toISOString(),
        news_type: category,
        location: category === 'nyc' ? 'New York' : category === 'costa-rica' ? 'Costa Rica' : null,
        sub_location: null,
        language: 'en',
        category: 'general',
        tags: [subreddit],
        companies: [],
        sentiment: determineSentiment(post.title, post.selftext),
        image_url: imageUrl,
        author: post.author,
        is_featured: false,
        importance_score: calculateImportanceScore(post),
        link_status: 'valid',
        last_validated: new Date().toISOString()
      };
    })
    .filter(article => article.image_url); // Only keep articles with images
}

export const handler = async (event, context) => {
  console.log('Starting Reddit news fetch at', new Date().toISOString());
  
  try {
    const allArticles = [];
    
    // Process each subreddit
    for (const source of REDDIT_SOURCES) {
      console.log(`Fetching from r/${source.subreddit}...`);
      const posts = await fetchRedditPosts(source.subreddit, 50);
      const articles = processRedditPosts(posts, source.category, source.subreddit);
      
      console.log(`Found ${articles.length} articles with images from r/${source.subreddit}`);
      allArticles.push(...articles);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`Total articles with images: ${allArticles.length}`);
    
    if (allArticles.length > 0) {
      // Check for duplicates
      const { data: existingArticles } = await supabase
        .from('news')
        .select('source_url')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
      const existingUrls = new Set(existingArticles?.map(a => a.source_url) || []);
      const uniqueArticles = allArticles.filter(a => !existingUrls.has(a.source_url));
      
      console.log(`${uniqueArticles.length} new unique articles to insert`);
      
      if (uniqueArticles.length > 0) {
        // Sort by importance and mark top articles as featured
        const sortedArticles = uniqueArticles.sort((a, b) => b.importance_score - a.importance_score);
        
        // Mark top 3 articles per category as featured
        const categories = ['ai', 'world', 'business', 'nyc', 'costa-rica'];
        for (const category of categories) {
          const categoryArticles = sortedArticles.filter(a => a.news_type === category);
          categoryArticles.slice(0, 3).forEach(article => article.is_featured = true);
        }
        
        // Insert into database
        const { data, error } = await supabase
          .from('news')
          .insert(uniqueArticles)
          .select();
        
        if (error) {
          console.error('Error inserting articles:', error);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to insert articles', details: error })
          };
        }
        
        console.log(`Successfully inserted ${data.length} articles`);
        
        // Log statistics
        const stats = categories.map(category => ({
          category,
          count: data.filter(a => a.news_type === category).length,
          withImages: data.filter(a => a.news_type === category && a.image_url).length
        }));
        
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Reddit news fetch completed successfully',
            inserted: data.length,
            stats: stats
          })
        };
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Reddit news fetch completed - no new articles',
        inserted: 0
      })
    };
    
  } catch (error) {
    console.error('Fatal error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Fatal error', details: error.message })
    };
  }
};