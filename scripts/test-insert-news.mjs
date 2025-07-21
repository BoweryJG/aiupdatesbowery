import { createClient } from '@supabase/supabase-js';

// Use environment variables from .env file
const supabaseUrl = 'https://fiozmyoedptukpkzuhqm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpb3pteW9lZHB0dWtwa3p1aHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MTUxODcsImV4cCI6MjA2NTM5MTE4N30.XrzLFbtoOKcX0kU5K7MSPQKwTDNm6cFtefUGxSJzm-o';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sample news articles for different categories
const sampleArticles = [
  // AI News
  {
    title: 'OpenAI Announces GPT-5 with Breakthrough Reasoning Capabilities',
    summary: 'OpenAI has unveiled GPT-5, featuring advanced reasoning and multimodal capabilities that surpass previous models.',
    content: 'OpenAI has announced the release of GPT-5, marking a significant leap in artificial intelligence capabilities...',
    source: 'OpenAI Blog',
    source_url: 'https://openai.com/blog/gpt-5-announcement',
    published_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    news_type: 'ai',
    category: 'product_launch',
    tags: ['gpt-5', 'llm', 'multimodal', 'ai breakthrough'],
    companies: ['OpenAI'],
    sentiment: 'positive',
    importance_score: 9,
    is_featured: true,
    link_status: 'valid',
    language: 'en'
  },
  // World News
  {
    title: 'Global Climate Summit Reaches Historic Agreement on Carbon Reduction',
    summary: 'World leaders commit to ambitious new targets for carbon emission reductions by 2030.',
    content: 'In a breakthrough moment at the Global Climate Summit, representatives from 195 countries have agreed...',
    source: 'BBC World News',
    source_url: 'https://www.bbc.com/news/world-climate-summit',
    published_date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    news_type: 'world',
    category: 'climate',
    tags: ['climate change', 'global summit', 'carbon reduction'],
    companies: [],
    sentiment: 'positive',
    importance_score: 8,
    is_featured: true,
    link_status: 'valid',
    language: 'en'
  },
  // Business News
  {
    title: 'Tech Stocks Rally as AI Companies Report Record Earnings',
    summary: 'Major technology companies see significant gains following strong quarterly earnings driven by AI investments.',
    content: 'The stock market experienced a significant rally today as major technology companies reported...',
    source: 'Bloomberg Markets',
    source_url: 'https://www.bloomberg.com/markets/tech-rally',
    published_date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    news_type: 'business',
    category: 'markets',
    tags: ['stock market', 'tech stocks', 'earnings'],
    companies: ['Microsoft', 'Google', 'NVIDIA'],
    sentiment: 'positive',
    importance_score: 7,
    is_featured: false,
    link_status: 'valid',
    language: 'en'
  },
  // NYC News
  {
    title: 'New Subway Extension to Connect Bowery with Brooklyn Tech Hub',
    summary: 'MTA announces plans for new subway line connecting Lower East Side to Brooklyn tech district.',
    content: 'The Metropolitan Transportation Authority unveiled ambitious plans today for a new subway extension...',
    source: 'NY Times Metro',
    source_url: 'https://www.nytimes.com/nyregion/subway-extension',
    published_date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    news_type: 'nyc',
    location: 'New York',
    sub_location: 'Bowery',
    category: 'transit',
    tags: ['subway', 'mta', 'bowery', 'infrastructure'],
    companies: ['MTA'],
    sentiment: 'positive',
    importance_score: 8,
    is_featured: true,
    link_status: 'valid',
    language: 'en'
  },
  // Costa Rica News
  {
    title: 'Costa Rica Launches Eco-Tourism Initiative in Dominical Region',
    summary: 'New sustainable tourism program aims to protect biodiversity while supporting local communities.',
    content: 'The Costa Rican government announced a groundbreaking eco-tourism initiative focused on the Dominical region...',
    source: 'Tico Times',
    source_url: 'https://ticotimes.net/eco-tourism-dominical',
    published_date: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    news_type: 'costa-rica',
    location: 'Costa Rica',
    sub_location: 'Dominical',
    category: 'tourism',
    tags: ['eco-tourism', 'dominical', 'sustainability'],
    companies: [],
    sentiment: 'positive',
    importance_score: 7,
    is_featured: false,
    link_status: 'valid',
    language: 'en'
  },
  // More AI news
  {
    title: 'Anthropic Raises $2 Billion in Latest Funding Round',
    summary: 'AI safety company Anthropic secures major funding to advance Claude and constitutional AI research.',
    content: 'Anthropic, the AI safety company behind Claude, has successfully raised $2 billion in a Series C funding round...',
    source: 'TechCrunch',
    source_url: 'https://techcrunch.com/anthropic-funding',
    published_date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    news_type: 'ai',
    category: 'funding',
    tags: ['anthropic', 'claude', 'ai safety', 'funding'],
    companies: ['Anthropic'],
    sentiment: 'positive',
    importance_score: 8,
    is_featured: false,
    link_status: 'valid',
    language: 'en'
  }
];

async function insertSampleNews() {
  console.log('Inserting sample news articles...');
  
  try {
    // Insert the sample articles
    const { data, error } = await supabase
      .from('ai_news')
      .insert(sampleArticles)
      .select();
    
    if (error) {
      console.error('Error inserting articles:', error);
    } else {
      console.log(`Successfully inserted ${data.length} sample articles`);
      console.log('Articles by type:');
      const types = data.reduce((acc, article) => {
        acc[article.news_type] = (acc[article.news_type] || 0) + 1;
        return acc;
      }, {});
      console.log(types);
    }
  } catch (err) {
    console.error('Fatal error:', err);
  }
}

// Run the script
insertSampleNews();