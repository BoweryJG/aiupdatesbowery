import { motion } from 'framer-motion';
import { Calendar, Filter, Search } from 'lucide-react';
import { Glass } from './Glass';
import { useNewsStore } from '../../store/newsStore';
import type { NewsCategory } from '../../types/ai';

const dateRangeOptions = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' }
] as const;

const categoryOptions: { value: NewsCategory; label: string }[] = [
  { value: 'research', label: 'Research' },
  { value: 'product_launch', label: 'Product Launch' },
  { value: 'funding', label: 'Funding' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'technical_breakthrough', label: 'Breakthrough' },
  { value: 'industry_news', label: 'Industry' },
  { value: 'ethics_policy', label: 'Ethics & Policy' },
  { value: 'general', label: 'General' }
];

export function NewsFilterBar() {
  const { 
    filters, 
    setDateRange, 
    setCategory, 
    setSearchTerm,
    setMinImportanceScore 
  } = useNewsStore();

  return (
    <Glass className="p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-electric-cyan" />
          <div className="flex gap-1">
            {dateRangeOptions.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDateRange(option.value)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  filters.dateRange === option.value
                    ? 'bg-electric-cyan text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-quantum-purple" />
          <select
            value={filters.category || ''}
            onChange={(e) => setCategory(e.target.value as NewsCategory || undefined)}
            className="bg-gray-800 text-gray-300 rounded-lg px-3 py-1 text-sm border border-gray-700 
                     focus:border-quantum-purple focus:outline-none"
          >
            <option value="">All Categories</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Importance Score Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Min Impact:</span>
          <select
            value={filters.minImportanceScore || ''}
            onChange={(e) => setMinImportanceScore(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-gray-800 text-gray-300 rounded-lg px-3 py-1 text-sm border border-gray-700 
                     focus:border-neon-green focus:outline-none"
          >
            <option value="">Any</option>
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}+
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search headlines..."
              value={filters.searchTerm || ''}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 text-gray-300 rounded-lg pl-10 pr-4 py-1.5 text-sm 
                       border border-gray-700 focus:border-electric-cyan focus:outline-none"
            />
          </div>
        </div>
      </div>
    </Glass>
  );
}