import { create } from 'zustand';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { AIModel, AICategory } from '../types/ai';
import { aiApi, supabase } from '../lib/supabase';

let updatesChannel: RealtimeChannel | null = null;

interface AIStore {
  models: AIModel[];
  loading: boolean;
  error: string | null;
  selectedCategory: AICategory | null;
  selectedCompany: string | null;
  searchTerm: string;
  
  // Actions
  fetchModels: () => Promise<void>;
  setSelectedCategory: (category: AICategory | null) => void;
  setSelectedCompany: (company: string | null) => void;
  setSearchTerm: (term: string) => void;
  getFilteredModels: () => AIModel[];
  subscribeToUpdates: () => void;
  unsubscribeFromUpdates: () => void;
}

export const useAIStore = create<AIStore>((set, get) => ({
  models: [],
  loading: false,
  error: null,
  selectedCategory: null,
  selectedCompany: null,
  searchTerm: '',

  fetchModels: async () => {
    set({ loading: true, error: null });
    try {
      const data = await aiApi.getAllModels();
      set({ models: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
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
    if (updatesChannel) return;
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
      .subscribe();
  },

  unsubscribeFromUpdates: () => {
    if (updatesChannel) {
      updatesChannel.unsubscribe();
      updatesChannel = null;
    }
  }
}));