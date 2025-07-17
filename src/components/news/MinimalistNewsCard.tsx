import { motion } from 'framer-motion';
import { Clock, MapPin, AlertCircle } from 'lucide-react';
import type { AINews } from '../../types/ai';
import { formatDistanceToNow } from '../../utils/dateUtils';
import { useLinkValidation } from '../../services/linkValidator';
import { ResponsiveImage } from '../ui/ResponsiveImage';

interface MinimalistNewsCardProps {
  news: AINews;
  onClick: () => void;
  index?: number;
}

export function MinimalistNewsCard({ news, onClick, index = 0 }: MinimalistNewsCardProps) {
  const linkValidation = useLinkValidation(news.source_url);
  
  // Extract image URL from nested structure
  const getImageUrl = () => {
    if (!news.image_url) return null;
    
    // Handle nested JSON structure from RSS feeds
    if (typeof news.image_url === 'object' && news.image_url.$) {
      return news.image_url.$.url;
    }
    
    // Handle string URLs
    if (typeof news.image_url === 'string') {
      return news.image_url;
    }
    
    return null;
  };
  
  const imageUrl = getImageUrl();
  
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

        {/* Image Section - Mobile Optimized */}
        <div className="relative bg-gray-900/50 overflow-hidden group/image">
          <ResponsiveImage
            src={imageUrl || ''}
            alt={news.title}
            className="group-hover/image:scale-110 transition-transform duration-500"
            aspectRatio="4/3"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          
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

        {/* Content - Mobile Optimized */}
        <div className="p-3 sm:p-4 lg:p-5">
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

              {/* Title - Mobile Optimized */}
              <h3 className="text-sm sm:text-base lg:text-lg font-medium text-white line-clamp-2 
                           group-hover:text-transparent group-hover:bg-clip-text 
                           group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300
                           transition-all duration-300 leading-tight">
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