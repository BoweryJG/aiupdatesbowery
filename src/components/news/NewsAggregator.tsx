import { useState, useEffect, useCallback } from 'react';
import { useNewsStore } from '../../store/newsStore';
import { MinimalistNewsCard } from './MinimalistNewsCard';
import { SwipeableNewsModal } from './SwipeableNewsModal';
import { MobilePrismaticStream } from './MobilePrismaticStream';
import { VoiceInput } from '../voice/VoiceInput';
import { LoadingSkeleton } from '../LoadingSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3x3, Layers, Search, RefreshCw } from 'lucide-react';
import type { AINews } from '../../types/ai';

export function NewsAggregator() {
  const [viewMode, setViewMode] = useState<'stream' | 'grid'>('stream');
  const [selectedArticle, setSelectedArticle] = useState<AINews | null>(null);
  const [selectedArticleIndex, setSelectedArticleIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const { 
    news, 
    loading, 
    error, 
    filters,
    fetchNewsWithFilters,
    setCategory,
    setSearchTerm,
    setCompaniesFilter,
    setMinImportanceScore,
    setDateRange
  } = useNewsStore();

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch news on mount and filter changes
  useEffect(() => {
    fetchNewsWithFilters();
  }, [filters]);

  // Handle voice commands
  const handleVoiceCommand = useCallback((action: any) => {
    switch (action.type) {
      case 'filter':
        if (action.payload.newsType) {
          setCategory(action.payload.newsType);
        }
        if (action.payload.companies) {
          setCompaniesFilter(action.payload.companies);
        }
        if (action.payload.minImportanceScore) {
          setMinImportanceScore(action.payload.minImportanceScore);
        }
        if (action.payload.dateRange) {
          setDateRange(action.payload.dateRange);
        }
        break;
        
      case 'search':
        if (action.payload.searchTerm) {
          setSearchTerm(action.payload.searchTerm);
        }
        break;
        
      case 'open':
        const index = action.payload.index || 0;
        if (news[index]) {
          setSelectedArticle(news[index]);
          setSelectedArticleIndex(index);
        }
        break;
        
      case 'navigate':
        if (action.payload.view) {
          setViewMode(action.payload.view);
        }
        break;
    }
  }, [news, setCategory, setSearchTerm, setCompaniesFilter, setMinImportanceScore, setDateRange]);

  // Open article handler
  const handleOpenArticle = (article: AINews, index: number) => {
    setSelectedArticle(article);
    setSelectedArticleIndex(index);
  };

  if (loading && news.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading news: {error}</p>
          <button 
            onClick={() => fetchNewsWithFilters()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Mobile view - always use stream
  if (isMobile) {
    return (
      <>
        <MobilePrismaticStream 
          articles={news}
          onVoiceCommand={handleVoiceCommand}
          loading={loading}
          onRefresh={() => fetchNewsWithFilters()}
        />
        <VoiceInput 
          onCommand={handleVoiceCommand}
          className="fixed bottom-4 right-4 z-50"
        />
      </>
    );
  }

  // Desktop view - allow switching
  return (
    <div className="min-h-screen bg-black">
      {/* View mode toggle */}
      <div className="bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-end gap-4">
              {/* View toggle */}
              <div className="flex bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('stream')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'stream' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
              </div>
              
              {/* Voice input */}
              <VoiceInput onCommand={handleVoiceCommand} />
            </div>
          </div>
        </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Loading state */}
          {loading && news.length === 0 ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={viewMode === 'stream' ? 'max-w-4xl mx-auto' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'}
            >
              <LoadingSkeleton 
                variant={viewMode === 'stream' ? 'news-strip' : 'news-card'} 
                count={viewMode === 'stream' ? 8 : 12} 
              />
            </motion.div>
          ) : news.length === 0 ? (
            /* No results state */
            <motion.div
              key="no-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto text-center py-20"
            >
              <Search className="w-20 h-20 text-gray-600 mx-auto mb-6" />
              <h3 className="text-2xl font-medium text-gray-300 mb-3">No articles found</h3>
              <p className="text-gray-500 mb-8">
                Try adjusting your filters or search terms to find more articles
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategory(undefined);
                  setCompaniesFilter([]);
                  setMinImportanceScore(undefined);
                  setDateRange('all');
                  fetchNewsWithFilters();
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white 
                         rounded-lg hover:bg-purple-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Clear all filters
              </button>
            </motion.div>
          ) : viewMode === 'stream' ? (
            <motion.div
              key="stream"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-4xl mx-auto"
            >
              <MobilePrismaticStream 
                articles={news}
                onVoiceCommand={handleVoiceCommand}
                loading={loading}
                onRefresh={() => fetchNewsWithFilters()}
              />
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {news.map((article, index) => (
                <MinimalistNewsCard
                  key={article.id}
                  news={article}
                  onClick={() => handleOpenArticle(article, index)}
                  index={index}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Swipeable modal for article viewing */}
      {selectedArticle && (
        <SwipeableNewsModal
          isOpen={!!selectedArticle}
          onClose={() => setSelectedArticle(null)}
          articles={news}
          initialIndex={selectedArticleIndex}
        />
      )}
    </div>
  );
}