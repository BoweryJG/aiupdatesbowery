import { useState, useEffect, useRef } from 'react';
import type { AINews } from '../../types/ai';
import { formatDistanceToNow } from '../../utils/dateUtils';
import { LoadingSkeleton } from '../LoadingSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Search } from 'lucide-react';
import { haptics } from '../../utils/haptics';
import '../../styles/mobile-prismatic-stream.css';

interface MobilePrismaticStreamProps {
  articles: AINews[];
  onVoiceCommand?: (command: any) => void;
  loading?: boolean;
  onRefresh?: () => void;
}

export function MobilePrismaticStream({ articles, onVoiceCommand, loading = false, onRefresh }: MobilePrismaticStreamProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isPulling = useRef(false);
  
  // Filter articles by category if selected
  const filteredArticles = selectedCategory 
    ? articles.filter(article => article.news_type === selectedCategory)
    : articles;

  // Group articles by importance for better visual hierarchy
  const sortedArticles = [...filteredArticles].sort((a, b) => 
    (b.importance_score || 0) - (a.importance_score || 0)
  );

  // Pull-to-refresh functionality
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onRefresh) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current) return;
      
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY.current);
      
      if (distance > 0 && container.scrollTop === 0) {
        e.preventDefault();
        setPullDistance(Math.min(distance, 150));
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;
      
      isPulling.current = false;
      
      if (pullDistance > 80) {
        setIsRefreshing(true);
        await onRefresh();
        setIsRefreshing(false);
      }
      
      setPullDistance(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, onRefresh]);

  return (
    <div ref={containerRef} className="prismatic-container" style={{ transform: `translateY(${pullDistance}px)` }}>
      {/* Pull-to-refresh indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-0 left-0 right-0 flex justify-center py-4 z-40"
          >
            <div className="flex items-center gap-2 text-white">
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm">
                {isRefreshing ? 'Refreshing...' : pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Category navigation */}
      <nav className="category-nav">
        <div className="category-scroll">
          <button 
            className={`category-pill ${!selectedCategory ? 'active' : ''}`}
            onClick={() => {
              haptics.light();
              setSelectedCategory(null);
            }}
          >
            All
          </button>
          <button 
            className={`category-pill ${selectedCategory === 'ai' ? 'active' : ''}`}
            onClick={() => {
              haptics.light();
              setSelectedCategory('ai');
            }}
          >
            🤖 AI
          </button>
          <button 
            className={`category-pill ${selectedCategory === 'world' ? 'active' : ''}`}
            onClick={() => {
              haptics.light();
              setSelectedCategory('world');
            }}
          >
            🌍 World
          </button>
          <button 
            className={`category-pill ${selectedCategory === 'business' ? 'active' : ''}`}
            onClick={() => {
              haptics.light();
              setSelectedCategory('business');
            }}
          >
            💼 Business
          </button>
          <button 
            className={`category-pill ${selectedCategory === 'nyc' ? 'active' : ''}`}
            onClick={() => {
              haptics.light();
              setSelectedCategory('nyc');
            }}
          >
            🗽 NYC
          </button>
          <button 
            className={`category-pill ${selectedCategory === 'costa-rica' ? 'active' : ''}`}
            onClick={() => {
              haptics.light();
              setSelectedCategory('costa-rica');
            }}
          >
            🌴 Costa Rica
          </button>
        </div>
      </nav>

      {/* Loading state */}
      {loading && (
        <div className="px-4 py-2">
          <LoadingSkeleton variant="news-strip" count={8} />
        </div>
      )}

      {/* No results state */}
      {!loading && sortedArticles.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 px-6"
        >
          <Search className="w-16 h-16 text-gray-600 mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">No articles found</h3>
          <p className="text-gray-500 text-center">
            {selectedCategory 
              ? `No ${selectedCategory} articles available right now`
              : 'No articles match your current filters'}
          </p>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="mt-4 px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors"
            >
              View all articles
            </button>
          )}
        </motion.div>
      )}

      {/* News strips */}
      {!loading && sortedArticles.map((article, index) => (
        <a 
          key={article.id}
          href={`#article-${article.id}`}
          id={`article-${article.id}`}
          className="news-strip"
          style={{ '--strip-delay': `${index * 50}ms` } as any}
        >
          <div 
            className="strip-content" 
            data-type={article.news_type || 'ai'}
          >
            {/* Micro thumbnail */}
            {(() => {
              const imageUrl = article.image_url 
                ? (typeof article.image_url === 'object' && article.image_url.$ 
                    ? article.image_url.$.url 
                    : typeof article.image_url === 'string' 
                      ? article.image_url 
                      : null)
                : null;
              
              return imageUrl ? (
                <img 
                  className="strip-thumbnail"
                  src={imageUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              ) : null;
            })()}
            
            {/* Text content */}
            <div className="strip-text">
              <h3 className="strip-headline">{article.title}</h3>
              <div className="strip-meta">
                <span>{article.source}</span>
                <span>{formatDistanceToNow(new Date(article.published_date))}</span>
              </div>
            </div>

            {/* Importance indicator */}
            {article.importance_score && article.importance_score >= 8 && (
              <div 
                className="strip-importance" 
                data-level="high"
                aria-label="Breaking news"
              />
            )}

            {/* Hidden expanded content */}
            <div className="strip-full-content">
              <p>{article.summary || article.content}</p>
              <div className="article-meta">
                <span>{article.location}</span>
                {article.sub_location && <span> • {article.sub_location}</span>}
                {article.companies.length > 0 && (
                  <div className="companies">
                    {article.companies.join(' • ')}
                  </div>
                )}
              </div>
              <a 
                href={article.source_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="read-more"
              >
                Read full article →
              </a>
            </div>
          </div>
        </a>
      ))}

      {/* Voice input FAB */}
      <button 
        className="voice-fab"
        onClick={() => {
          haptics.medium();
          onVoiceCommand?.({ type: 'toggle' });
        }}
        aria-label="Voice commands"
      >
        🎤
      </button>
    </div>
  );
}