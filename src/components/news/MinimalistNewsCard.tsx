import { motion } from 'framer-motion';
import { Clock, MapPin, AlertCircle, ImageOff } from 'lucide-react';
import { useState, useCallback } from 'react';
import type { AINews } from '../../types/ai';
import { formatDistanceToNow } from '../../utils/dateUtils';
import { useLinkValidation } from '../../services/linkValidator';

interface MinimalistNewsCardProps {
  news: AINews;
  onClick: () => void;
  index?: number;
}

export function MinimalistNewsCard({ news, onClick, index = 0 }: MinimalistNewsCardProps) {
  const linkValidation = useLinkValidation(news.source_url);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const getNewsTypeAccent = (type?: string) => {
    switch (type) {
      case 'ai': return 'from-purple-500 to-blue-500';
      case 'world': return 'from-blue-500 to-cyan-500';
      case 'business': return 'from-green-500 to-emerald-500';
      case 'nyc': return 'from-orange-500 to-red-500';
      case 'costa-rica': return 'from-green-500 to-teal-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getImportanceGlow = (score?: number | null) => {
    if (!score) return '';
    if (score >= 8) return 'shadow-lg shadow-red-500/20';
    if (score >= 6) return 'shadow-md shadow-cyan-500/10';
    return '';
  };

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  // Fallback image - a branded placeholder
  const fallbackImage = `data:image/svg+xml,%3Csvg width='800' height='450' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='gradient' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23111827;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%231f2937;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='450' fill='url(%23gradient)'/%3E%3Ctext x='50%25' y='50%25' font-family='system-ui' font-size='24' fill='%236b7280' text-anchor='middle' dominant-baseline='middle'%3EAI Updates%3C/text%3E%3C/svg%3E`;

  const shouldShowImage = news.image_url && !imageError;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`group relative cursor-pointer ${getImportanceGlow(news.importance_score)}`}
    >
      {/* Luxury card container */}
      <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-900/30 to-black/50 
                    backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden
                    hover:border-white/10 transition-all duration-300">
        
        {/* Category accent line */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${getNewsTypeAccent(news.news_type)} z-10`} />

        {/* Image Section */}
        <div className="relative aspect-[16/10] sm:aspect-video bg-gray-900/50 overflow-hidden group/image">
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-800/50">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/30 to-transparent animate-shimmer" 
                   style={{ backgroundSize: '200% 100%' }} />
            </div>
          )}
          
          {/* Image */}
          <img
            src={shouldShowImage ? news.image_url! : fallbackImage}
            alt={news.title}
            loading="lazy"
            onError={handleImageError}
            onLoad={handleImageLoad}
            className={`w-full h-full object-cover transition-all duration-700 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            } group-hover/image:scale-110`}
          />
          
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          
          {/* Error state */}
          {imageError && !shouldShowImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
              <div className="text-center">
                <ImageOff className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Image unavailable</p>
              </div>
            </div>
          )}
          
          {/* Importance indicator overlay on image */}
          {news.importance_score && news.importance_score >= 7 && (
            <div className="absolute top-3 right-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-3 h-3 rounded-full ${
                  news.importance_score >= 8 ? 'bg-red-500' : 'bg-cyan-500'
                } shadow-lg`}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          {/* Header with metadata */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              {/* Source and time */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500 mb-2">
                <span className="font-medium truncate">{news.source}</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span className="whitespace-nowrap">{formatDistanceToNow(new Date(news.published_date))}</span>
                </div>
                {news.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{news.sub_location || news.location}</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="text-sm sm:text-base font-medium text-white line-clamp-2 
                           group-hover:text-transparent group-hover:bg-clip-text 
                           group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300
                           transition-all duration-300">
                {news.title}
              </h3>
            </div>
          </div>

          {/* Summary - only show on hover */}
          <motion.p 
            initial={{ height: 0, opacity: 0 }}
            whileHover={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-gray-400 line-clamp-2 overflow-hidden"
          >
            {news.summary}
          </motion.p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 gap-2">
            {/* Tags/Companies */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {news.news_type && (
                <span className={`px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-gradient-to-r ${getNewsTypeAccent(news.news_type)} bg-opacity-10 whitespace-nowrap`}>
                  {news.news_type.toUpperCase()}
                </span>
              )}
              {news.companies.slice(0, 1).map((company) => (
                <span key={company} className="text-[10px] sm:text-xs text-gray-500 truncate">
                  {company}
                </span>
              ))}
            </div>

            {/* Link status indicator */}
            {linkValidation && !linkValidation.isValid && (
              <AlertCircle className="w-3 h-3 text-yellow-500 flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Hover effect overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none"
        />

        {/* Luxury shine effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%)',
            transform: 'translateX(-100%)',
          }}
          animate={{
            transform: ['translateX(-100%)', 'translateX(100%)'],
          }}
          transition={{
            duration: 0.8,
            ease: 'easeInOut',
            repeat: 0,
          }}
        />
      </div>
    </motion.article>
  );
}