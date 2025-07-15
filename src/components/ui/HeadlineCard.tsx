import { motion } from 'framer-motion';
import { ExternalLink, Clock, TrendingUp, Tag, Building2 } from 'lucide-react';
import { Glass } from './Glass';
import type { AINews } from '../../types/ai';
import { formatDistanceToNow } from '../../utils/dateUtils';

interface HeadlineCardProps {
  news: AINews;
  onClick?: () => void;
  isCompact?: boolean;
}

export function HeadlineCard({ news, onClick, isCompact = false }: HeadlineCardProps) {
  const importanceColor = 
    news.importance_score && news.importance_score >= 8 
      ? 'border-neon-red' 
      : news.importance_score && news.importance_score >= 6 
      ? 'border-electric-cyan' 
      : 'border-gray-700';

  const sentimentIcon = {
    positive: '🚀',
    negative: '⚠️',
    neutral: '📊'
  };

  return (
    <motion.article
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Glass 
        className={`h-full cursor-pointer border-2 ${importanceColor} hover:border-opacity-100 border-opacity-50 transition-all`}
        onClick={onClick}
      >
        {(() => {
          const imageUrl = news.image_url 
            ? (typeof news.image_url === 'object' && news.image_url.$ 
                ? news.image_url.$.url 
                : typeof news.image_url === 'string' 
                  ? news.image_url 
                  : null)
            : null;
          
          return imageUrl && !isCompact ? (
            <div className="h-48 overflow-hidden rounded-t-lg">
              <img 
                src={imageUrl} 
                alt={news.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ) : null;
        })()}

        <div className={`p-6 ${isCompact ? 'py-4' : ''}`}>
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className={`font-bold text-white ${isCompact ? 'text-lg' : 'text-xl'} line-clamp-2`}>
              {news.title}
            </h3>
            {news.sentiment && (
              <span className="text-xl shrink-0">{sentimentIcon[news.sentiment]}</span>
            )}
          </div>

          {/* Summary */}
          {news.summary && !isCompact && (
            <p className="text-gray-300 text-sm line-clamp-3 mb-4">
              {news.summary}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-4">
            {news.source && (
              <div className="flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                <span>{news.source}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDistanceToNow(new Date(news.published_date))}</span>
            </div>

            {news.reading_time_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{news.reading_time_minutes} min read</span>
              </div>
            )}

            {news.importance_score && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Impact: {news.importance_score}/10</span>
              </div>
            )}
          </div>

          {/* Tags & Companies */}
          <div className="flex flex-wrap gap-2">
            {news.companies.map((company) => (
              <motion.span
                key={company}
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-1 px-2 py-1 bg-quantum-purple/20 
                         border border-quantum-purple/30 rounded-full text-xs text-quantum-purple"
              >
                <Building2 className="w-3 h-3" />
                {company}
              </motion.span>
            ))}
            
            {news.tags.slice(0, 3).map((tag) => (
              <motion.span
                key={tag}
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-1 px-2 py-1 bg-electric-cyan/20 
                         border border-electric-cyan/30 rounded-full text-xs text-electric-cyan"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </motion.span>
            ))}
          </div>

          {/* Read More Link */}
          <a
            href={news.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-sm text-electric-cyan 
                     hover:text-neon-green transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Read full article
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </Glass>
    </motion.article>
  );
}