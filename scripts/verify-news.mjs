import { createClient } from '@supabase/supabase-js';

// Use environment variables from .env file
const supabaseUrl = 'https://fiozmyoedptukpkzuhqm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpb3pteW9lZHB0dWtwa3p1aHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MTUxODcsImV4cCI6MjA2NTM5MTE4N30.XrzLFbtoOKcX0kU5K7MSPQKwTDNm6cFtefUGxSJzm-o';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyNews() {
  console.log('Checking news articles in database...\n');
  
  try {
    // Get all news articles
    const { data: allNews, error: allError } = await supabase
      .from('ai_news')
      .select('*')
      .order('published_date', { ascending: false });
    
    if (allError) {
      console.error('Error fetching news:', allError);
      return;
    }
    
    console.log(`Total articles in database: ${allNews?.length || 0}`);
    
    // Check by news type
    const { data: byType, error: typeError } = await supabase
      .from('ai_news')
      .select('news_type')
      .order('news_type');
    
    if (!typeError && byType) {
      const typeCounts = byType.reduce((acc, item) => {
        acc[item.news_type] = (acc[item.news_type] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\nArticles by type:');
      Object.entries(typeCounts).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
    }
    
    // Show recent articles
    if (allNews && allNews.length > 0) {
      console.log('\nMost recent articles:');
      allNews.slice(0, 5).forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title}`);
        console.log(`   Type: ${article.news_type}`);
        console.log(`   Source: ${article.source}`);
        console.log(`   Published: ${new Date(article.published_date).toLocaleString()}`);
        console.log(`   Featured: ${article.is_featured ? 'Yes' : 'No'}`);
      });
    }
    
    // Check if articles are recent enough
    const now = new Date();
    const recentCount = allNews?.filter(article => {
      const published = new Date(article.published_date);
      const hoursDiff = (now - published) / (1000 * 60 * 60);
      return hoursDiff < 24; // Within last 24 hours
    }).length || 0;
    
    console.log(`\nArticles published in last 24 hours: ${recentCount}`);
    
  } catch (err) {
    console.error('Fatal error:', err);
  }
}

// Run the verification
verifyNews();