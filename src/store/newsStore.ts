import { create } from 'zustand';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { AINews, NewsFilters, NewsCategory } from '../types/ai';
import { newsApi, supabase, isOnline, ApiError } from '../lib/supabase';

let newsChannel: RealtimeChannel | null = null;

const isToday = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

interface NewsStore {
  news: AINews[];
  todaysHeadlines: AINews[];
  trendingTopics: Array<{ tag: string; mention_count: number }>;
  loading: boolean;
  error: string | null;
  errorDetails: {
    code?: string;
    retryable?: boolean;
    timestamp?: number;
  } | null;
  isOffline: boolean;
  filters: NewsFilters;
  lastFetchTimestamp: number | null;
  
  // Actions
  fetchTodaysHeadlines: () => Promise<void>;
  fetchNewsWithFilters: () => Promise<void>;
  fetchTrendingTopics: () => Promise<void>;
  setDateRange: (range: 'today' | 'week' | 'month' | 'all') => void;
  setCategory: (category: NewsCategory | undefined) => void;
  setSearchTerm: (term: string) => void;
  setCompaniesFilter: (companies: string[]) => void;
  setTagsFilter: (tags: string[]) => void;
  setMinImportanceScore: (score: number | undefined) => void;
  incrementViewCount: (newsId: string) => Promise<void>;
  subscribeToNews: () => void;
  unsubscribeFromNews: () => void;
  checkOnlineStatus: () => void;
  clearError: () => void;
  retryLastFetch: () => Promise<void>;
}

// Store for tracking last operation for retry
let lastOperation: (() => Promise<void>) | null = null;

export const useNewsStore = create<NewsStore>((set, get) => ({
  news: [],
  todaysHeadlines: [],
  trendingTopics: [],
  loading: false,
  error: null,
  errorDetails: null,
  isOffline: !isOnline(),
  filters: {
    dateRange: 'today',
    newsType: undefined,
    location: undefined
  },
  lastFetchTimestamp: null,

  fetchTodaysHeadlines: async () => {
    const operation = async () => {
      set({ loading: true, error: null, errorDetails: null });
      try {
        const data = await newsApi.getTodaysHeadlines();
        set({ 
          todaysHeadlines: data, 
          loading: false,
          lastFetchTimestamp: Date.now(),
          isOffline: false
        });
      } catch (error) {
        const isApiError = error instanceof ApiError;
        const errorMessage = isApiError 
          ? error.message 
          : 'An unexpected error occurred while fetching headlines';
        
        set({ 
          error: errorMessage,
          errorDetails: isApiError ? {
            code: error.code,
            retryable: error.retryable,
            timestamp: Date.now()
          } : null,
          loading: false,
          isOffline: errorMessage.includes('connection')
        });
        
        // Log for debugging
        console.error('Failed to fetch today\'s headlines:', error);
      }
    };
    
    lastOperation = operation;
    await operation();
  },

  fetchNewsWithFilters: async () => {
    const operation = async () => {
      set({ loading: true, error: null, errorDetails: null });
      try {
        const data = await newsApi.getNewsWithFilters(get().filters);
        set({ 
          news: data, 
          loading: false,
          lastFetchTimestamp: Date.now(),
          isOffline: false
        });
      } catch (error) {
        const isApiError = error instanceof ApiError;
        const errorMessage = isApiError 
          ? error.message 
          : 'An unexpected error occurred while fetching news';
        
        set({ 
          error: errorMessage,
          errorDetails: isApiError ? {
            code: error.code,
            retryable: error.retryable,
            timestamp: Date.now()
          } : null,
          loading: false,
          isOffline: errorMessage.includes('connection')
        });
        
        // Log for debugging
        console.error('Failed to fetch news with filters:', error);
      }
    };
    
    lastOperation = operation;
    await operation();
  },

  fetchTrendingTopics: async () => {
    try {
      const data = await newsApi.getTrendingTopics();
      set({ 
        trendingTopics: data,
        isOffline: false 
      });
    } catch (error) {
      // Trending topics are not critical, just log the error
      console.error('Failed to fetch trending topics:', error);
      
      if (error instanceof ApiError && error.code === 'NETWORK_OFFLINE') {
        set({ isOffline: true });
      }
    }
  },

  setDateRange: (range) => {
    set((state) => ({ filters: { ...state.filters, dateRange: range } }));
    get().fetchNewsWithFilters();
  },

  setCategory: (category) => {
    set((state) => ({ filters: { ...state.filters, category } }));
    get().fetchNewsWithFilters();
  },

  setSearchTerm: (term) => {
    set((state) => ({ filters: { ...state.filters, searchTerm: term } }));
    get().fetchNewsWithFilters();
  },

  setCompaniesFilter: (companies) => {
    set((state) => ({ filters: { ...state.filters, companies } }));
    get().fetchNewsWithFilters();
  },

  setTagsFilter: (tags) => {
    set((state) => ({ filters: { ...state.filters, tags } }));
    get().fetchNewsWithFilters();
  },

  setMinImportanceScore: (score) => {
    set((state) => ({ filters: { ...state.filters, minImportanceScore: score } }));
    get().fetchNewsWithFilters();
  },

  incrementViewCount: async (newsId: string) => {
    try {
      await newsApi.incrementViewCount(newsId);
    } catch (error) {
      // View count is not critical, just log the error
      console.error('Failed to increment view count:', error);
    }
  },

  subscribeToNews: () => {
    if (newsChannel || !isOnline()) return;
    
    try {
      newsChannel = supabase
        .channel('ai_news_channel')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'ai_news' },
          payload => {
            const newArticle = payload.new as AINews;
            set(state => ({
              news: [newArticle, ...state.news],
              todaysHeadlines: isToday(newArticle.published_date)
                ? [newArticle, ...state.todaysHeadlines]
                : state.todaysHeadlines
            }));
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to news updates');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Failed to subscribe to news updates');
            newsChannel = null;
          }
        });
    } catch (error) {
      console.error('Error setting up news subscription:', error);
      newsChannel = null;
    }
  },

  unsubscribeFromNews: () => {
    if (newsChannel) {
      newsChannel.unsubscribe();
      newsChannel = null;
    }
  },
  
  checkOnlineStatus: () => {
    const online = isOnline();
    const wasOffline = get().isOffline;
    
    set({ isOffline: !online });
    
    // If we're back online after being offline, refresh data
    if (wasOffline && online) {
      console.log('Back online, refreshing data...');
      const store = get();
      
      // Re-subscribe to real-time updates
      store.subscribeToNews();
      
      // Retry last operation if there was one
      if (lastOperation) {
        lastOperation();
      }
    }
  },
  
  clearError: () => {
    set({ error: null, errorDetails: null });
  },
  
  retryLastFetch: async () => {
    if (lastOperation) {
      await lastOperation();
    } else {
      // Default to fetching with current filters
      await get().fetchNewsWithFilters();
    }
  }
}));

// Set up online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useNewsStore.getState().checkOnlineStatus();
  });
  
  window.addEventListener('offline', () => {
    useNewsStore.getState().checkOnlineStatus();
  });
}