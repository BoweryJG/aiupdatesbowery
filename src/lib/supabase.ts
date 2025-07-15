import { createClient } from '@supabase/supabase-js';
import type { AIModel, AINews, NewsFilters } from '../types/ai';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// API functions for AI updates
export const aiApi = {
  async getAllModels(): Promise<AIModel[]> {
    const { data, error } = await supabase
      .from('ai_updates')
      .select('*')
      .order('impact_score', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getModelsByCategory(category: string): Promise<AIModel[]> {
    const { data, error } = await supabase
      .from('ai_updates')
      .select('*')
      .eq('category', category)
      .order('impact_score', { ascending: false, nullsFirst: false });

    if (error) throw error;
    return data || [];
  },

  async getModelsByCompany(company: string): Promise<AIModel[]> {
    const { data, error } = await supabase
      .from('ai_updates')
      .select('*')
      .eq('company', company)
      .order('impact_score', { ascending: false, nullsFirst: false });

    if (error) throw error;
    return data || [];
  },

  async getTopModels(limit: number = 10): Promise<AIModel[]> {
    const { data, error } = await supabase
      .from('ai_updates')
      .select('*')
      .order('impact_score', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
};

// API functions for multi-category news
export const newsApi = {
  async getTodaysHeadlines(): Promise<AINews[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .gte('published_date', today.toISOString())
      .eq('link_status', 'valid')
      .order('importance_score', { ascending: false, nullsFirst: false })
      .order('published_date', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  },

  async getNewsWithFilters(filters: NewsFilters): Promise<AINews[]> {
    let query = supabase.from('news').select('*');

    // Apply date range filter
    if (filters.dateRange) {
      const now = new Date();
      const startDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      if (filters.dateRange !== 'all') {
        query = query.gte('published_date', startDate.toISOString());
      }
    }

    // Apply news type filter
    if ((filters as any).newsType) {
      query = query.eq('news_type', (filters as any).newsType);
    }

    // Apply location filter
    if ((filters as any).location) {
      query = query.eq('location', (filters as any).location);
    }

    // Apply category filter
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    // Apply companies filter
    if (filters.companies && filters.companies.length > 0) {
      query = query.overlaps('companies', filters.companies);
    }

    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    // Apply importance score filter
    if (filters.minImportanceScore) {
      query = query.gte('importance_score', filters.minImportanceScore);
    }

    // Apply search term
    if (filters.searchTerm) {
      query = query.or(
        `title.ilike.%${filters.searchTerm}%,content.ilike.%${filters.searchTerm}%,summary.ilike.%${filters.searchTerm}%`
      );
    }

    // Filter out invalid links
    query = query.neq('link_status', 'invalid');

    // Order by importance and date
    query = query
      .order('published_date', { ascending: false })
      .order('importance_score', { ascending: false, nullsFirst: false })
      .limit(200);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getTrendingTopics(): Promise<Array<{ tag: string; mention_count: number }>> {
    const { data, error } = await supabase
      .from('trending_topics')
      .select('*');

    if (error) throw error;
    return data || [];
  },

  async incrementViewCount(newsId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_view_count', { news_id: newsId });
    if (error) throw error;
  },

  async getNewsByLocation(location: string, subLocation?: string): Promise<AINews[]> {
    let query = supabase.from('news').select('*').eq('location', location);
    
    if (subLocation) {
      query = query.eq('sub_location', subLocation);
    }
    
    query = query
      .neq('link_status', 'invalid')
      .order('published_date', { ascending: false })
      .limit(50);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
};