import { createClient } from '@supabase/supabase-js';

// Use environment variables from .env file
const supabaseUrl = 'https://fiozmyoedptukpkzuhqm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpb3pteW9lZHB0dWtwa3p1aHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MTUxODcsImV4cCI6MjA2NTM5MTE4N30.XrzLFbtoOKcX0kU5K7MSPQKwTDNm6cFtefUGxSJzm-o';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugFrontend() {
  console.log('Testing the same query the frontend uses...\n');
  
  try {
    // Test 1: Get today's headlines (what the frontend fetches by default)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log(`Fetching news from today (${today.toISOString()})...`);
    
    const { data: todaysNews, error: todaysError } = await supabase
      .from('ai_news')
      .select('*')
      .gte('published_date', today.toISOString())
      .eq('link_status', 'valid')
      .order('importance_score', { ascending: false, nullsFirst: false })
      .order('published_date', { ascending: false })
      .limit(100);
    
    if (todaysError) {
      console.error('Error fetching today\'s news:', todaysError);
    } else {
      console.log(`Today's headlines: ${todaysNews?.length || 0} articles`);
      if (todaysNews && todaysNews.length > 0) {
        console.log('\nFirst 3 articles:');
        todaysNews.slice(0, 3).forEach((article, i) => {
          console.log(`${i + 1}. ${article.title} (${article.news_type})`);
        });
      }
    }
    
    // Test 2: Get news with default filters (dateRange: 'today')
    console.log('\n\nTesting default filter query...');
    const { data: filteredNews, error: filterError } = await supabase
      .from('ai_news')
      .select('*')
      .gte('published_date', today.toISOString())
      .neq('link_status', 'invalid')
      .order('published_date', { ascending: false })
      .order('importance_score', { ascending: false, nullsFirst: false })
      .limit(200);
    
    if (filterError) {
      console.error('Error with filtered query:', filterError);
    } else {
      console.log(`Filtered results: ${filteredNews?.length || 0} articles`);
    }
    
    // Test 3: Get ALL news (no date filter)
    console.log('\n\nFetching ALL news (no date filter)...');
    const { data: allNews, error: allError } = await supabase
      .from('ai_news')
      .select('*')
      .neq('link_status', 'invalid')
      .order('published_date', { ascending: false })
      .limit(50);
    
    if (allError) {
      console.error('Error fetching all news:', allError);
    } else {
      console.log(`All news: ${allNews?.length || 0} articles`);
      if (allNews && allNews.length > 0) {
        console.log('\nMost recent 5 articles:');
        allNews.slice(0, 5).forEach((article, i) => {
          const date = new Date(article.published_date);
          console.log(`${i + 1}. ${article.title}`);
          console.log(`   Type: ${article.news_type}, Published: ${date.toLocaleString()}`);
        });
      }
    }
    
    // Test 4: Check for any link_status issues
    console.log('\n\nChecking link_status values...');
    const { data: statusCheck, error: statusError } = await supabase
      .from('ai_news')
      .select('link_status')
      .limit(100);
    
    if (!statusError && statusCheck) {
      const statusCounts = statusCheck.reduce((acc, item) => {
        const status = item.link_status || 'null';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('Link status distribution:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
    }
    
  } catch (err) {
    console.error('Fatal error:', err);
  }
}

// Run the debug script
debugFrontend();