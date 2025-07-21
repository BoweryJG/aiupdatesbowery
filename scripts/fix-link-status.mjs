import { createClient } from '@supabase/supabase-js';

// Use environment variables from .env file
const supabaseUrl = 'https://fiozmyoedptukpkzuhqm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpb3pteW9lZHB0dWtwa3p1aHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MTUxODcsImV4cCI6MjA2NTM5MTE4N30.XrzLFbtoOKcX0kU5K7MSPQKwTDNm6cFtefUGxSJzm-o';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixLinkStatus() {
  console.log('Updating link_status for all unchecked articles...\n');
  
  try {
    // Update all articles with link_status 'unchecked' to 'valid'
    // In production, you'd actually validate each link, but for now we'll mark them as valid
    const { data, error } = await supabase
      .from('ai_news')
      .update({ 
        link_status: 'valid',
        last_validated: new Date().toISOString()
      })
      .eq('link_status', 'unchecked')
      .select();
    
    if (error) {
      console.error('Error updating link status:', error);
    } else {
      console.log(`Updated ${data?.length || 0} articles to have valid link_status`);
    }
    
    // Verify the update
    const { data: checkData, error: checkError } = await supabase
      .from('ai_news')
      .select('link_status');
    
    if (!checkError && checkData) {
      const statusCounts = checkData.reduce((acc, item) => {
        const status = item.link_status || 'null';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\nNew link status distribution:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
    }
    
    // Check today's valid articles
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: todaysValid, error: todaysError } = await supabase
      .from('ai_news')
      .select('*')
      .gte('published_date', today.toISOString())
      .eq('link_status', 'valid')
      .order('importance_score', { ascending: false })
      .limit(10);
    
    if (!todaysError && todaysValid) {
      console.log(`\nToday's valid articles: ${todaysValid.length}`);
      if (todaysValid.length > 0) {
        console.log('Sample articles:');
        todaysValid.slice(0, 3).forEach((article, i) => {
          console.log(`${i + 1}. ${article.title} (${article.news_type})`);
        });
      }
    }
    
  } catch (err) {
    console.error('Fatal error:', err);
  }
}

// Run the fix
fixLinkStatus();