import { ApiError } from '../lib/supabase';

/**
 * Maps error codes to user-friendly messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_OFFLINE: 'No internet connection. Please check your network and try again.',
  TIMEOUT: 'The request took too long to complete. Please try again.',
  API_ERROR: 'We encountered an issue loading the content. Please try again.',
  MAX_RETRIES_EXCEEDED: 'We were unable to complete the request after multiple attempts.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  
  // Supabase-specific errors
  '42P01': 'The requested data source is not available.',
  '23505': 'This item already exists.',
  '23503': 'Related data not found.',
  'PGRST301': 'The request could not be completed. Please try again.',
  'PGRST204': 'No data found for the requested resource.',
};

/**
 * Gets a user-friendly error message based on the error
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    // Check if we have a specific message for this error code
    if (error.code && ERROR_MESSAGES[error.code]) {
      return ERROR_MESSAGES[error.code];
    }
    
    // Return the ApiError message which is already user-friendly
    return error.message;
  }
  
  if (error instanceof Error) {
    // Check for common network errors
    if (error.message.includes('NetworkError') || 
        error.message.includes('Failed to fetch')) {
      return ERROR_MESSAGES.NETWORK_OFFLINE;
    }
    
    // Check for timeout errors
    if (error.message.includes('timeout')) {
      return ERROR_MESSAGES.TIMEOUT;
    }
    
    // For other errors, try to make them more user-friendly
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('connection')) {
      return 'Connection error. Please check your internet connection.';
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return 'The requested content could not be found.';
    }
    
    if (message.includes('unauthorized') || message.includes('401')) {
      return 'You do not have permission to access this content.';
    }
    
    if (message.includes('server') || message.includes('500')) {
      return 'Server error. Please try again later.';
    }
  }
  
  // Default message for unknown errors
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Determines if an error should show a retry button
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.retryable;
  }
  
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Network and timeout errors are typically retryable
    if (message.includes('network') || 
        message.includes('timeout') ||
        message.includes('connection') ||
        message.includes('failed to fetch')) {
      return true;
    }
    
    // Server errors might be temporary
    if (message.includes('500') || 
        message.includes('502') || 
        message.includes('503') || 
        message.includes('504')) {
      return true;
    }
  }
  
  return false;
}

/**
 * Formats time since an error occurred
 */
export function getTimeSinceError(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) {
    return 'just now';
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  
  return 'more than a day ago';
}