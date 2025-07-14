import { createClient } from '@supabase/supabase-js';
import type { AIModel } from '../types/ai';

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