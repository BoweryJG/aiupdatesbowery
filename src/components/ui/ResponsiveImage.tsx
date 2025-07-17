import { useState, useCallback } from 'react';
import { ImageOff } from 'lucide-react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  aspectRatio?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function ResponsiveImage({
  src,
  alt,
  className = '',
  fallback,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  loading = 'lazy',
  aspectRatio = '16/10',
  onLoad,
  onError,
}: ResponsiveImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
    onError?.();
  }, [onError]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    onLoad?.();
  }, [onLoad]);

  // Generate responsive image URLs (if we had a CDN)
  const generateSrcSet = (baseSrc: string) => {
    // For now, just use the original image
    // In a real app, you'd generate different sizes from your CDN
    return baseSrc;
  };

  const defaultFallback = `data:image/svg+xml,%3Csvg width='800' height='450' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='gradient' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23111827;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%231f2937;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='450' fill='url(%23gradient)'/%3E%3Ctext x='50%25' y='50%25' font-family='system-ui' font-size='18' fill='%236b7280' text-anchor='middle' dominant-baseline='middle'%3EAI Updates%3C/text%3E%3C/svg%3E`;

  const shouldShowImage = src && !imageError;

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio }}>
      {/* Loading skeleton */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-800/50">
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/30 to-transparent animate-pulse"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite',
            }}
          />
        </div>
      )}

      {/* Image */}
      <img
        src={shouldShowImage ? src : fallback || defaultFallback}
        srcSet={shouldShowImage ? generateSrcSet(src) : undefined}
        sizes={sizes}
        alt={alt}
        loading={loading}
        decoding="async"
        onError={handleImageError}
        onLoad={handleImageLoad}
        className={`w-full h-full object-cover transition-all duration-700 ${
          imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        }`}
        style={{
          imageRendering: 'auto',
          maxWidth: '100%',
          height: 'auto',
        }}
      />

      {/* Error state */}
      {imageError && !shouldShowImage && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
          <div className="text-center">
            <ImageOff className="w-6 h-6 text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Add shimmer keyframes to global CSS
const shimmerCSS = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
`;

// Inject CSS if not already present
if (typeof document !== 'undefined') {
  const styleId = 'responsive-image-shimmer';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = shimmerCSS;
    document.head.appendChild(style);
  }
}