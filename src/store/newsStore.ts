import { create } from 'zustand';
import type { AINews, NewsFilters, NewsCategory } from '../types/ai';
import { newsApi } from '../lib/supabase';

interface NewsStore {
  news: AINews[];
  todaysHeadlines: AINews[];
  trendingTopics: Array<{ tag: string; mention_count: number }>;
  loading: boolean;
  error: string | null;
  filters: NewsFilters;
  
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
}

export const useNewsStore = create<NewsStore>((set, get) => ({
  news: [],
  todaysHeadlines: [],
  trendingTopics: [],
  loading: false,
  error: null,
  filters: {
    dateRange: 'today'
  },

  fetchTodaysHeadlines: async () => {
    set({ loading: true, error: null });
    try {
      const data = await newsApi.getTodaysHeadlines();
      set({ todaysHeadlines: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchNewsWithFilters: async () => {
    set({ loading: true, error: null });
    try {
      const data = await newsApi.getNewsWithFilters(get().filters);
      set({ news: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchTrendingTopics: async () => {
    try {
      const data = await newsApi.getTrendingTopics();
      set({ trendingTopics: data });
    } catch (error) {
      console.error('Failed to fetch trending topics:', error);
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
      console.error('Failed to increment view count:', error);
    }
  }
}));