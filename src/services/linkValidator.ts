import { useState, useEffect } from 'react';

interface LinkValidationResult {
  isValid: boolean;
  statusCode?: number;
  alternateUrl?: string;
  error?: string;
  validatedAt: Date;
}

interface CachedValidation {
  url: string;
  result: LinkValidationResult;
  expiresAt: Date;
}

class LinkValidatorService {
  private cache: Map<string, CachedValidation> = new Map();
  private cacheDuration = 24 * 60 * 60 * 1000; // 24 hours
  private timeout = 5000; // 5 seconds timeout
  private batchSize = 10; // Validate 10 links at a time
  private queue: Set<string> = new Set();
  private isProcessing = false;

  /**
   * Validates a single URL
   */
  async validateUrl(url: string): Promise<LinkValidationResult> {
    // Check cache first
    const cached = this.getCachedValidation(url);
    if (cached) return cached;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NewsAggregator/1.0)'
        }
      });

      clearTimeout(timeoutId);

      const result: LinkValidationResult = {
        isValid: response.ok,
        statusCode: response.status,
        validatedAt: new Date()
      };

      // If not valid, try to get an archive.org version
      if (!result.isValid && response.status === 404) {
        result.alternateUrl = await this.getArchiveUrl(url);
        if (result.alternateUrl) {
          result.isValid = true;
        }
      }

      this.cacheValidation(url, result);
      return result;

    } catch (error: any) {
      const result: LinkValidationResult = {
        isValid: false,
        error: error.message || 'Network error',
        validatedAt: new Date()
      };

      // Try archive.org as fallback
      result.alternateUrl = await this.getArchiveUrl(url);
      if (result.alternateUrl) {
        result.isValid = true;
      }

      this.cacheValidation(url, result);
      return result;
    }
  }

  /**
   * Batch validate multiple URLs
   */
  async validateBatch(urls: string[]): Promise<Map<string, LinkValidationResult>> {
    const results = new Map<string, LinkValidationResult>();
    
    // Process in batches to avoid overwhelming the network
    for (let i = 0; i < urls.length; i += this.batchSize) {
      const batch = urls.slice(i, i + this.batchSize);
      const batchPromises = batch.map(url => 
        this.validateUrl(url).then(result => ({ url, result }))
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach(promiseResult => {
        if (promiseResult.status === 'fulfilled') {
          results.set(promiseResult.value.url, promiseResult.value.result);
        }
      });
    }
    
    return results;
  }

  /**
   * Queue URLs for background validation
   */
  queueForValidation(urls: string[]) {
    urls.forEach(url => this.queue.add(url));
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Process queued URLs in the background
   */
  private async processQueue() {
    if (this.isProcessing || this.queue.size === 0) return;
    
    this.isProcessing = true;
    
    while (this.queue.size > 0) {
      const batch = Array.from(this.queue).slice(0, this.batchSize);
      batch.forEach(url => this.queue.delete(url));
      
      await this.validateBatch(batch);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    this.isProcessing = false;
  }

  /**
   * Get archive.org URL as fallback
   */
  private async getArchiveUrl(url: string): Promise<string | undefined> {
    try {
      const archiveApiUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`;
      const response = await fetch(archiveApiUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (data.archived_snapshots?.closest?.available) {
          return data.archived_snapshots.closest.url;
        }
      }
    } catch (error) {
      console.error('Archive.org lookup failed:', error);
    }
    
    return undefined;
  }

  /**
   * Get cached validation result
   */
  private getCachedValidation(url: string): LinkValidationResult | null {
    const cached = this.cache.get(url);
    
    if (cached && cached.expiresAt > new Date()) {
      return cached.result;
    }
    
    // Remove expired entry
    if (cached) {
      this.cache.delete(url);
    }
    
    return null;
  }

  /**
   * Cache validation result
   */
  private cacheValidation(url: string, result: LinkValidationResult) {
    this.cache.set(url, {
      url,
      result,
      expiresAt: new Date(Date.now() + this.cacheDuration)
    });
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache() {
    const now = new Date();
    for (const [url, cached] of this.cache.entries()) {
      if (cached.expiresAt <= now) {
        this.cache.delete(url);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      queueSize: this.queue.size,
      isProcessing: this.isProcessing
    };
  }
}

// Export singleton instance
export const linkValidator = new LinkValidatorService();

// Export types
export type { LinkValidationResult };

// Helper hook for React components
export function useLinkValidation(url: string | undefined): LinkValidationResult | null {
  const [result, setResult] = useState<LinkValidationResult | null>(null);

  useEffect(() => {
    if (!url) return;

    linkValidator.validateUrl(url).then(setResult);
  }, [url]);

  return result;
}