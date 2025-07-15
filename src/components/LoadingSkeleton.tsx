import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'text' | 'headline' | 'news-card' | 'news-strip';
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  variant = 'card', 
  count = 1,
  className = '' 
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 ${className}`}>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 mb-2 ${className}`}>
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className={`animate-pulse space-y-2 ${className}`}>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        );
      
      case 'headline':
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-4 ${className}`}>
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        );
      
      case 'news-card':
        return (
          <div className={`bg-gradient-to-br from-gray-900/50 via-gray-900/30 to-black/50 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden ${className}`}>
            <div className="animate-pulse">
              {/* Image skeleton */}
              <div className="aspect-video bg-gray-800/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/30 to-transparent animate-shimmer" 
                     style={{ backgroundSize: '200% 100%' }} />
              </div>
              {/* Content skeleton */}
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-3 bg-gray-700 rounded w-20"></div>
                  <div className="h-3 bg-gray-700 rounded w-16"></div>
                </div>
                <div className="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-full"></div>
              </div>
            </div>
          </div>
        );
      
      case 'news-strip':
        return (
          <div className={`h-12 mb-0.5 bg-white/5 border border-white/5 backdrop-blur-xl ${className}`}>
            <div className="animate-pulse flex items-center p-3">
              <div className="w-8 h-8 bg-gray-700 rounded mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </div>
              <div className="h-3 bg-gray-700 rounded w-16 ml-2"></div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          {renderSkeleton()}
        </React.Fragment>
      ))}
    </>
  );
};