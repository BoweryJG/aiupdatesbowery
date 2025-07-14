import React from 'react';
import { motion } from 'framer-motion';
import { Glass } from './Glass';
import { Search, Filter, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAIStore } from '../../store/aiStore';
import type { AICategory } from '../../types/ai';

const categories: { value: AICategory; label: string }[] = [
  { value: 'language_model', label: 'Language Models' },
  { value: 'image_generation', label: 'Image Generation' },
  { value: 'multimodal_model', label: 'Multimodal' },
  { value: 'reasoning_model', label: 'Reasoning' },
  { value: 'video_generation', label: 'Video' },
  { value: 'conversational_ai', label: 'Conversational' },
  { value: 'search_ai', label: 'Search' },
  { value: 'ai_agent', label: 'AI Agents' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'general_ai', label: 'General AI' },
];

export const FilterBar: React.FC = () => {
  const {
    searchTerm,
    selectedCategory,
    selectedCompany,
    setSearchTerm,
    setSelectedCategory,
    setSelectedCompany,
    models
  } = useAIStore();

  // Get unique companies
  const companies = Array.from(new Set(models.map(m => m.company).filter(Boolean))) as string[];

  return (
    <Glass className="p-4 mb-8">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search AI models, companies, or features..."
              className={cn(
                "w-full pl-10 pr-4 py-3 rounded-lg",
                "bg-white/5 border border-white/10",
                "text-white placeholder-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-electric-cyan/50 focus:border-electric-cyan/50",
                "transition-all duration-200"
              )}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="relative group">
          <button className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-lg",
            "bg-white/5 border border-white/10",
            "text-white hover:bg-white/10 hover:border-white/20",
            "transition-all duration-200",
            selectedCategory && "border-electric-cyan/50 bg-electric-cyan/10"
          )}>
            <Filter className="w-5 h-5" />
            <span className="text-sm">
              {selectedCategory 
                ? categories.find(c => c.value === selectedCategory)?.label 
                : 'All Categories'}
            </span>
            {selectedCategory && (
              <X 
                className="w-4 h-4 ml-1 hover:text-red-400 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCategory(null);
                }}
              />
            )}
          </button>

          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 0, y: -10 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="absolute top-full mt-2 left-0 z-20 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity"
          >
            <Glass className="p-2 min-w-[200px]">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm",
                    "hover:bg-white/10 transition-colors",
                    selectedCategory === category.value && "bg-electric-cyan/20 text-electric-cyan"
                  )}
                >
                  {category.label}
                </button>
              ))}
            </Glass>
          </motion.div>
        </div>

        {/* Company Filter */}
        {companies.length > 0 && (
          <div className="relative group">
            <button className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-lg",
              "bg-white/5 border border-white/10",
              "text-white hover:bg-white/10 hover:border-white/20",
              "transition-all duration-200",
              selectedCompany && "border-electric-cyan/50 bg-electric-cyan/10"
            )}>
              <span className="text-sm">
                {selectedCompany || 'All Companies'}
              </span>
              {selectedCompany && (
                <X 
                  className="w-4 h-4 ml-1 hover:text-red-400 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCompany(null);
                  }}
                />
              )}
            </button>

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 0, y: -10 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute top-full mt-2 right-0 z-20 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity"
            >
              <Glass className="p-2 min-w-[200px] max-h-64 overflow-y-auto">
                {companies.sort().map((company) => (
                  <button
                    key={company}
                    onClick={() => setSelectedCompany(company)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm",
                      "hover:bg-white/10 transition-colors",
                      selectedCompany === company && "bg-electric-cyan/20 text-electric-cyan"
                    )}
                  >
                    {company}
                  </button>
                ))}
              </Glass>
            </motion.div>
          </div>
        )}
      </div>
    </Glass>
  );
};