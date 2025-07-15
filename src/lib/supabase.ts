import { createClient } from '@supabase/supabase-js';
import type { AIModel, AINews, NewsFilters } from '../types/ai';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Network connectivity detection
export const isOnline = () => navigator.onLine;

// Custom error class for better error handling
export class ApiError extends Error {
  code?: string;
  status?: number;
  retryable: boolean;
  
  constructor(
    message: string,
    code?: string,
    status?: number,
    retryable: boolean = true
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.retryable = retryable;
  }
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  timeout: 30000, // 30 seconds
};

// Sleep utility for exponential backoff
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Calculate delay for exponential backoff
const getRetryDelay = (retryCount: number): number => {
  const delay = RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
};

// Generic retry wrapper for API calls
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  options: Partial<typeof RETRY_CONFIG> = {}
): Promise<T> {
  const config = { ...RETRY_CONFIG, ...options };
  let lastError: Error | null = null;

  // Check network connectivity first
  if (!isOnline()) {
    throw new ApiError(
      'No internet connection. Please check your network and try again.',
      'NETWORK_OFFLINE',
      0,
      true
    );
  }

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new ApiError(
            `Operation '${operationName}' timed out after ${config.timeout}ms`,
            'TIMEOUT',
            0,
            true
          ));
        }, config.timeout);
      });

      // Race between operation and timeout
      const result = await Promise.race([operation(), timeoutPromise]);
      
      // If successful, return the result
      return result;
    } catch (error) {
      lastError = error as Error;
      
      // Check if error is retryable
      const isRetryable = error instanceof ApiError ? error.retryable : true;
      const isNetworkError = 
        error instanceof Error && 
        (error.message.includes('NetworkError') || 
         error.message.includes('Failed to fetch') ||
         error.message.includes('TIMEOUT'));
      
      if (!isRetryable || (!isNetworkError && attempt === config.maxRetries)) {
        // Log the error for debugging
        console.error(`[${operationName}] Final error after ${attempt + 1} attempts:`, error);
        
        // Throw a more user-friendly error
        if (error instanceof ApiError) {
          throw error;
        } else if (error instanceof Error) {
          throw new ApiError(
            `Failed to ${operationName}: ${error.message}`,
            'API_ERROR',
            undefined,
            false
          );
        } else {
          throw new ApiError(
            `An unexpected error occurred during ${operationName}`,
            'UNKNOWN_ERROR',
            undefined,
            false
          );
        }
      }
      
      // If we have more retries, wait before trying again
      if (attempt < config.maxRetries) {
        const delay = getRetryDelay(attempt);
        console.warn(
          `[${operationName}] Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`,
          error
        );
        await sleep(delay);
        
        // Check if we're back online before retrying
        if (!isOnline()) {
          throw new ApiError(
            'Lost internet connection. Please check your network and try again.',
            'NETWORK_OFFLINE',
            0,
            true
          );
        }
      }
    }
  }

  // This should never be reached, but just in case
  throw lastError || new ApiError(
    `Failed to ${operationName} after all retry attempts`,
    'MAX_RETRIES_EXCEEDED',
    undefined,
    false
  );
}

// Cache configuration
const CACHE_CONFIG = {
  keyPrefix: 'aiupdates_cache_',
  defaultTTL: 5 * 60 * 1000, // 5 minutes
};

// Simple cache implementation
class SimpleCache {
  static set(key: string, data: any, ttl: number = CACHE_CONFIG.defaultTTL): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(CACHE_CONFIG.keyPrefix + key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  static get<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(CACHE_CONFIG.keyPrefix + key);
      if (!cached) return null;

      const { data, timestamp, ttl } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      if (age > ttl) {
        localStorage.removeItem(CACHE_CONFIG.keyPrefix + key);
        return null;
      }

      return data as T;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }

  static clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_CONFIG.keyPrefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }
}

// API functions for AI updates
export const aiApi = {
  async getAllModels(): Promise<AIModel[]> {
    const cacheKey = 'all_models';
    
    // Try to get from cache first
    const cached = SimpleCache.get<AIModel[]>(cacheKey);
    if (cached && isOnline()) {
      return cached;
    }
    
    // If offline, return cached data even if expired
    if (!isOnline() && cached) {
      console.warn('Offline: returning cached data for getAllModels');
      return cached;
    }
    
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('ai_updates')
        .select('*')
        .order('impact_score', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw new ApiError(
          `Failed to fetch AI models: ${error.message}`,
          error.code,
          undefined,
          true
        );
      }
      
      const result = data || [];
      // Cache the successful response
      SimpleCache.set(cacheKey, result);
      return result;
    }, 'fetch all AI models');
  },

  async getModelsByCategory(category: string): Promise<AIModel[]> {
    const cacheKey = `models_by_category_${category}`;
    
    // Try to get from cache first
    const cached = SimpleCache.get<AIModel[]>(cacheKey);
    if (cached && isOnline()) {
      return cached;
    }
    
    // If offline, return cached data even if expired
    if (!isOnline() && cached) {
      console.warn('Offline: returning cached data for getModelsByCategory');
      return cached;
    }
    
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('ai_updates')
        .select('*')
        .eq('category', category)
        .order('impact_score', { ascending: false, nullsFirst: false });

      if (error) {
        throw new ApiError(
          `Failed to fetch models for category ${category}: ${error.message}`,
          error.code,
          undefined,
          true
        );
      }
      
      const result = data || [];
      // Cache the successful response
      SimpleCache.set(cacheKey, result);
      return result;
    }, `fetch models by category: ${category}`);
  },

  async getModelsByCompany(company: string): Promise<AIModel[]> {
    const cacheKey = `models_by_company_${company}`;
    
    // Try to get from cache first
    const cached = SimpleCache.get<AIModel[]>(cacheKey);
    if (cached && isOnline()) {
      return cached;
    }
    
    // If offline, return cached data even if expired
    if (!isOnline() && cached) {
      console.warn('Offline: returning cached data for getModelsByCompany');
      return cached;
    }
    
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('ai_updates')
        .select('*')
        .eq('company', company)
        .order('impact_score', { ascending: false, nullsFirst: false });

      if (error) {
        throw new ApiError(
          `Failed to fetch models for company ${company}: ${error.message}`,
          error.code,
          undefined,
          true
        );
      }
      
      const result = data || [];
      // Cache the successful response
      SimpleCache.set(cacheKey, result);
      return result;
    }, `fetch models by company: ${company}`);
  },

  async getTopModels(limit: number = 10): Promise<AIModel[]> {
    const cacheKey = `top_models_${limit}`;
    
    // Try to get from cache first
    const cached = SimpleCache.get<AIModel[]>(cacheKey);
    if (cached && isOnline()) {
      return cached;
    }
    
    // If offline, return cached data even if expired
    if (!isOnline() && cached) {
      console.warn('Offline: returning cached data for getTopModels');
      return cached;
    }
    
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('ai_updates')
        .select('*')
        .order('impact_score', { ascending: false, nullsFirst: false })
        .limit(limit);

      if (error) {
        throw new ApiError(
          `Failed to fetch top ${limit} models: ${error.message}`,
          error.code,
          undefined,
          true
        );
      }
      
      const result = data || [];
      // Cache the successful response
      SimpleCache.set(cacheKey, result);
      return result;
    }, `fetch top ${limit} models`);
  }
};

// API functions for multi-category news
export const newsApi = {
  async getTodaysHeadlines(): Promise<AINews[]> {
    const cacheKey = 'todays_headlines';
    
    // Try to get from cache first (shorter TTL for headlines)
    const cached = SimpleCache.get<AINews[]>(cacheKey);
    if (cached && isOnline()) {
      return cached;
    }
    
    // If offline, return cached data even if expired
    if (!isOnline() && cached) {
      console.warn('Offline: returning cached data for getTodaysHeadlines');
      return cached;
    }
    
    return withRetry(async () => {
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

      if (error) {
        throw new ApiError(
          `Failed to fetch today's headlines: ${error.message}`,
          error.code,
          undefined,
          true
        );
      }
      
      const result = data || [];
      // Cache with shorter TTL for headlines (2 minutes)
      SimpleCache.set(cacheKey, result, 2 * 60 * 1000);
      return result;
    }, 'fetch today\'s headlines');
  },

  async getNewsWithFilters(filters: NewsFilters): Promise<AINews[]> {
    const cacheKey = `news_filtered_${JSON.stringify(filters)}`;
    
    // Try to get from cache first
    const cached = SimpleCache.get<AINews[]>(cacheKey);
    if (cached && isOnline()) {
      return cached;
    }
    
    // If offline, return cached data even if expired
    if (!isOnline() && cached) {
      console.warn('Offline: returning cached data for getNewsWithFilters');
      return cached;
    }
    
    return withRetry(async () => {
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
      if (error) {
        throw new ApiError(
          `Failed to fetch filtered news: ${error.message}`,
          error.code,
          undefined,
          true
        );
      }
      
      const result = data || [];
      // Cache the successful response
      SimpleCache.set(cacheKey, result);
      return result;
    }, 'fetch filtered news');
  },

  async getTrendingTopics(): Promise<Array<{ tag: string; mention_count: number }>> {
    const cacheKey = 'trending_topics';
    
    // Try to get from cache first
    const cached = SimpleCache.get<Array<{ tag: string; mention_count: number }>>(cacheKey);
    if (cached && isOnline()) {
      return cached;
    }
    
    // If offline, return cached data even if expired
    if (!isOnline() && cached) {
      console.warn('Offline: returning cached data for getTrendingTopics');
      return cached;
    }
    
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('trending_topics')
        .select('*');

      if (error) {
        throw new ApiError(
          `Failed to fetch trending topics: ${error.message}`,
          error.code,
          undefined,
          true
        );
      }
      
      const result = data || [];
      // Cache for 10 minutes
      SimpleCache.set(cacheKey, result, 10 * 60 * 1000);
      return result;
    }, 'fetch trending topics');
  },

  async incrementViewCount(newsId: string): Promise<void> {
    // View count doesn't need caching, but still needs retry logic
    return withRetry(async () => {
      const { error } = await supabase.rpc('increment_view_count', { news_id: newsId });
      if (error) {
        throw new ApiError(
          `Failed to increment view count: ${error.message}`,
          error.code,
          undefined,
          false // Not critical, don't retry as aggressively
        );
      }
    }, 'increment view count', { maxRetries: 1 });
  },

  async getNewsByLocation(location: string, subLocation?: string): Promise<AINews[]> {
    const cacheKey = `news_by_location_${location}_${subLocation || 'all'}`;
    
    // Try to get from cache first
    const cached = SimpleCache.get<AINews[]>(cacheKey);
    if (cached && isOnline()) {
      return cached;
    }
    
    // If offline, return cached data even if expired
    if (!isOnline() && cached) {
      console.warn('Offline: returning cached data for getNewsByLocation');
      return cached;
    }
    
    return withRetry(async () => {
      let query = supabase.from('news').select('*').eq('location', location);
      
      if (subLocation) {
        query = query.eq('sub_location', subLocation);
      }
      
      query = query
        .neq('link_status', 'invalid')
        .order('published_date', { ascending: false })
        .limit(50);

      const { data, error } = await query;
      if (error) {
        throw new ApiError(
          `Failed to fetch news for location ${location}: ${error.message}`,
          error.code,
          undefined,
          true
        );
      }
      
      const result = data || [];
      // Cache the successful response
      SimpleCache.set(cacheKey, result);
      return result;
    }, `fetch news by location: ${location}`);
  }
};