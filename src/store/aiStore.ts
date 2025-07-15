import { create } from 'zustand';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { AIModel, AICategory } from '../types/ai';
import { aiApi, supabase, isOnline, ApiError } from '../lib/supabase';

let updatesChannel: RealtimeChannel | null = null;

interface AIStore {
  models: AIModel[];
  loading: boolean;
  error: string | null;
  errorDetails: {
    code?: string;
    retryable?: boolean;
    timestamp?: number;
  } | null;
  isOffline: boolean;
  selectedCategory: AICategory | null;
  selectedCompany: string | null;
  searchTerm: string;
  lastFetchTimestamp: number | null;
  
  // Actions
  fetchModels: () => Promise<void>;
  setSelectedCategory: (category: AICategory | null) => void;
  setSelectedCompany: (company: string | null) => void;
  setSearchTerm: (term: string) => void;
  getFilteredModels: () => AIModel[];
  subscribeToUpdates: () => void;
  unsubscribeFromUpdates: () => void;
  checkOnlineStatus: () => void;
  clearError: () => void;
  retryLastFetch: () => Promise<void>;
}

// Store for tracking last operation for retry
let lastAIOperation: (() => Promise<void>) | null = null;

export const useAIStore = create<AIStore>((set, get) => ({
  models: [],
  loading: false,
  error: null,
  errorDetails: null,
  isOffline: !isOnline(),
  selectedCategory: null,
  selectedCompany: null,
  searchTerm: '',
  lastFetchTimestamp: null,

  fetchModels: async () => {
    const operation = async () => {
      set({ loading: true, error: null, errorDetails: null });
      try {
        const data = await aiApi.getAllModels();
        set({ 
          models: data, 
          loading: false,
          lastFetchTimestamp: Date.now(),
          isOffline: false
        });
      } catch (error) {
        const isApiError = error instanceof ApiError;
        const errorMessage = isApiError 
          ? error.message 
          : 'An unexpected error occurred while fetching AI models';
        
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
        console.error('Failed to fetch AI models:', error);
      }
    };
    
    lastAIOperation = operation;
    await operation();
  },

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedCompany: (company) => set({ selectedCompany: company }),
  setSearchTerm: (term) => set({ searchTerm: term }),

  getFilteredModels: () => {
    const { models, selectedCategory, selectedCompany, searchTerm } = get();
    
    return models.filter(model => {
      const matchesCategory = !selectedCategory || model.category === selectedCategory;
      const matchesCompany = !selectedCompany || model.company === selectedCompany;
      const matchesSearch = !searchTerm || 
        model.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (model.company && model.company.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesCategory && matchesCompany && matchesSearch;
    });
  },

  subscribeToUpdates: () => {
    if (updatesChannel || !isOnline()) return;
    
    try {
      updatesChannel = supabase
        .channel('ai_updates_channel')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'ai_updates' },
          payload => {
            const newModel = payload.new as AIModel;
            set(state => ({ models: [newModel, ...state.models] }));
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to AI model updates');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Failed to subscribe to AI model updates');
            updatesChannel = null;
          }
        });
    } catch (error) {
      console.error('Error setting up AI updates subscription:', error);
      updatesChannel = null;
    }
  },

  unsubscribeFromUpdates: () => {
    if (updatesChannel) {
      updatesChannel.unsubscribe();
      updatesChannel = null;
    }
  },
  
  checkOnlineStatus: () => {
    const online = isOnline();
    const wasOffline = get().isOffline;
    
    set({ isOffline: !online });
    
    // If we're back online after being offline, refresh data
    if (wasOffline && online) {
      console.log('Back online, refreshing AI models...');
      const store = get();
      
      // Re-subscribe to real-time updates
      store.subscribeToUpdates();
      
      // Retry last operation if there was one
      if (lastAIOperation) {
        lastAIOperation();
      }
    }
  },
  
  clearError: () => {
    set({ error: null, errorDetails: null });
  },
  
  retryLastFetch: async () => {
    if (lastAIOperation) {
      await lastAIOperation();
    } else {
      // Default to fetching all models
      await get().fetchModels();
    }
  }
}));

// Set up online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useAIStore.getState().checkOnlineStatus();
  });
  
  window.addEventListener('offline', () => {
    useAIStore.getState().checkOnlineStatus();
  });
}