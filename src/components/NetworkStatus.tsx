import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi, AlertCircle } from 'lucide-react';
import { useNewsStore } from '../store/newsStore';

export const NetworkStatus: React.FC = () => {
  const { isOffline, error, errorDetails, clearError, retryLastFetch } = useNewsStore();
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (isOffline) {
      setShowOfflineMessage(true);
    } else {
      // Keep the message visible for a moment when coming back online
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOffline]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryLastFetch();
    } finally {
      setIsRetrying(false);
    }
  };

  // Don't show anything if there's no issue
  if (!showOfflineMessage && !error) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {/* Offline notification */}
      {showOfflineMessage && (
        <div className={`mb-2 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          isOffline 
            ? 'bg-orange-100 border border-orange-300' 
            : 'bg-green-100 border border-green-300'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {isOffline ? (
                <WifiOff className="h-5 w-5 text-orange-600" />
              ) : (
                <Wifi className="h-5 w-5 text-green-600" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                isOffline ? 'text-orange-800' : 'text-green-800'
              }`}>
                {isOffline ? 'You are offline' : 'Back online'}
              </p>
              <p className={`mt-1 text-sm ${
                isOffline ? 'text-orange-700' : 'text-green-700'
              }`}>
                {isOffline 
                  ? 'Showing cached content. Updates will sync when connection is restored.'
                  : 'Your connection has been restored.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error notification */}
      {error && errorDetails?.retryable && (
        <div className="p-4 bg-red-100 border border-red-300 rounded-lg shadow-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-red-800">
                Error loading content
              </p>
              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRetrying ? 'Retrying...' : 'Retry'}
                </button>
                <button
                  onClick={clearError}
                  className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};