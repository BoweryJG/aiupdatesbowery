import { create } from 'zustand';
import type { AIModel, AICategory } from '../types/ai';
import { aiApi } from '../lib/supabase';

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
  }
}));