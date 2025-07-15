import React from 'react';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { getUserFriendlyErrorMessage, isRetryableError, getTimeSinceError } from '../utils/errorMessages';

interface ErrorRetryProps {
  error: unknown;
  errorDetails?: {
    code?: string;
    retryable?: boolean;
    timestamp?: number;
  } | null;
  onRetry: () => void | Promise<void>;
  isRetrying?: boolean;
  className?: string;
}

export const ErrorRetry: React.FC<ErrorRetryProps> = ({ 
  error, 
  errorDetails,
  onRetry, 
  isRetrying = false,
  className = ''
}) => {
  const errorMessage = getUserFriendlyErrorMessage(error);
  const canRetry = errorDetails?.retryable ?? isRetryableError(error);
  const isOffline = errorMessage.toLowerCase().includes('connection') || 
                   errorMessage.toLowerCase().includes('offline');

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {isOffline ? (
            <WifiOff className="h-6 w-6 text-red-600" />
          ) : (
            <AlertCircle className="h-6 w-6 text-red-600" />
          )}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-medium text-red-900">
            {isOffline ? 'Connection Lost' : 'Error Loading Content'}
          </h3>
          <p className="mt-2 text-sm text-red-700">
            {errorMessage}
          </p>
          
          {errorDetails?.timestamp && (
            <p className="mt-1 text-xs text-red-600">
              Error occurred {getTimeSinceError(errorDetails.timestamp)}
            </p>
          )}
          
          {canRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                disabled={isRetrying}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </button>
              
              {isOffline && (
                <p className="mt-2 text-xs text-red-600">
                  Make sure you're connected to the internet and try again.
                </p>
              )}
            </div>
          )}
          
          {!canRetry && (
            <p className="mt-3 text-sm text-red-600">
              This error cannot be resolved by retrying. Please contact support if the issue persists.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};