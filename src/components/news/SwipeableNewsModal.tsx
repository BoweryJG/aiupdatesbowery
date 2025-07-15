import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ExternalLink, Clock, Building2, MapPin, Globe } from 'lucide-react';
import type { AINews } from '../../types/ai';
import { formatDistanceToNow } from '../../utils/dateUtils';
import { useLinkValidation } from '../../services/linkValidator';

interface SwipeableNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: AINews[];
  initialIndex?: number;
}

export function SwipeableNewsModal({ isOpen, onClose, articles, initialIndex = 0 }: SwipeableNewsModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentArticle = articles[currentIndex];
  const linkValidation = useLinkValidation(currentArticle?.source_url);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleNext = () => {
    if (currentIndex < articles.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      handleNext();
    } else if (info.offset.x > threshold) {
      handlePrevious();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'Escape') onClose();
  };

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, currentIndex]);

  if (!isOpen || !currentArticle) return null;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };


  const getCategoryColor = (newsType?: string) => {
    switch (newsType) {
      case 'ai': return 'from-purple-600 to-blue-600';
      case 'world': return 'from-blue-600 to-cyan-600';
      case 'business': return 'from-green-600 to-emerald-600';
      case 'nyc': return 'from-orange-600 to-red-600';
      case 'costa-rica': return 'from-green-600 to-teal-600';
      default: return 'from-gray-600 to-gray-800';
    }
  };

  const getArticleUrl = () => {
    if (linkValidation?.isValid) {
      return linkValidation.alternateUrl || currentArticle.source_url;
    }
    return currentArticle.source_url;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div 
          ref={containerRef}
          className="relative w-full h-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 w-10 h-10 sm:w-12 sm:h-12 
                     bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center 
                     border border-white/20 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </motion.button>

          {/* Navigation buttons - hide on mobile for swipe gestures */}
          {currentIndex > 0 && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrevious}
              className="absolute left-2 sm:left-4 z-50 w-10 h-10 sm:w-12 sm:h-12 
                       bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center 
                       border border-white/20 hover:bg-white/20 transition-colors
                       hidden sm:flex"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </motion.button>
          )}

          {currentIndex < articles.length - 1 && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              className="absolute right-2 sm:right-4 z-50 w-10 h-10 sm:w-12 sm:h-12 
                       bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center 
                       border border-white/20 hover:bg-white/20 transition-colors
                       hidden sm:flex"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </motion.button>
          )}

          {/* Article content */}
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={handleDragEnd}
              className="absolute w-full max-w-3xl overflow-y-auto max-h-[90vh]"
            >
              <div className="bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-black/90 
                            backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/10 
                            shadow-2xl overflow-hidden">
                {/* Luxury accent bar */}
                <div className={`h-1 bg-gradient-to-r ${getCategoryColor(currentArticle.news_type)}`} />

                {/* Header */}
                <div className="p-4 sm:p-6 md:p-8 pb-2 sm:pb-4">
                  <div className="flex items-start justify-between gap-4 mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-white leading-tight">
                      {currentArticle.title}
                    </h2>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{currentArticle.source}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{formatDistanceToNow(new Date(currentArticle.published_date))}</span>
                    </div>
                    {currentArticle.location && (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{currentArticle.location}</span>
                        {currentArticle.sub_location && (
                          <span className="text-gray-500">• {currentArticle.sub_location}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Image */}
                {currentArticle.image_url && (
                  <div className="px-4 sm:px-6 md:px-8">
                    <div className="relative h-48 sm:h-64 md:h-96 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden">
                      <img 
                        src={currentArticle.image_url} 
                        alt={currentArticle.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-4 sm:p-6 md:p-8 pt-4 sm:pt-6">
                  <p className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed mb-4 sm:mb-6">
                    {currentArticle.summary || currentArticle.content}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                    {currentArticle.companies?.map((company) => (
                      <span 
                        key={company}
                        className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-purple-600/20 to-blue-600/20 
                                 border border-purple-500/30 rounded-full text-[10px] sm:text-xs text-purple-300
                                 flex items-center gap-0.5 sm:gap-1"
                      >
                        <Building2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {company}
                      </span>
                    ))}
                    {currentArticle.tags?.slice(0, 3).map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/5 border border-white/10 
                                 rounded-full text-[10px] sm:text-xs text-gray-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Read more button */}
                  <motion.a
                    href={getArticleUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 
                             bg-gradient-to-r from-white/10 to-white/5 
                             border border-white/20 rounded-full
                             text-sm sm:text-base text-white font-medium 
                             hover:from-white/20 hover:to-white/10
                             transition-all duration-200"
                  >
                    Read Full Article
                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </motion.a>

                  {/* Link validation indicator */}
                  {linkValidation && !linkValidation.isValid && linkValidation.alternateUrl && (
                    <p className="mt-2 text-xs text-yellow-400">
                      Using archived version (original link unavailable)
                    </p>
                  )}
                </div>

                {/* Bottom navigation */}
                <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                    <span>Article {currentIndex + 1} of {articles.length}</span>
                    <div className="flex gap-1">
                      {articles.slice(0, 10).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setDirection(index > currentIndex ? 1 : -1);
                            setCurrentIndex(index);
                          }}
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-200 ${
                            index === currentIndex 
                              ? 'w-6 sm:w-8 bg-white' 
                              : 'bg-white/30 hover:bg-white/50'
                          }`}
                        />
                      ))}
                      {articles.length > 10 && (
                        <span className="text-[10px] sm:text-xs text-gray-600 ml-1">+{articles.length - 10}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}