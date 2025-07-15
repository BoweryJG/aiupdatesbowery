import { useRef, useEffect } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeConfig {
  threshold?: number;
  preventScroll?: boolean;
  trackMouse?: boolean;
}

export function useSwipeGesture(
  handlers: SwipeHandlers,
  config: SwipeConfig = {}
) {
  const {
    threshold = 50,
    preventScroll = true,
    trackMouse = true
  } = config;

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let touchStartX = 0;
    let touchStartY = 0;

    const handleStart = (x: number, y: number) => {
      touchStartX = x;
      touchStartY = y;
      touchStartRef.current = { x, y };
    };

    const handleEnd = (x: number, y: number) => {
      if (!touchStartRef.current) return;

      const deltaX = x - touchStartX;
      const deltaY = y - touchStartY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Determine if it's a horizontal or vertical swipe
      if (absDeltaX > absDeltaY && absDeltaX > threshold) {
        // Horizontal swipe
        if (deltaX > 0) {
          handlers.onSwipeRight?.();
        } else {
          handlers.onSwipeLeft?.();
        }
      } else if (absDeltaY > absDeltaX && absDeltaY > threshold) {
        // Vertical swipe
        if (deltaY > 0) {
          handlers.onSwipeDown?.();
        } else {
          handlers.onSwipeUp?.();
        }
      }

      touchStartRef.current = null;
    };

    // Touch event handlers
    const handleTouchStart = (e: TouchEvent) => {
      if (preventScroll) e.preventDefault();
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (preventScroll) e.preventDefault();
      const touch = e.changedTouches[0];
      handleEnd(touch.clientX, touch.clientY);
    };

    // Mouse event handlers (for desktop testing)
    const handleMouseDown = (e: MouseEvent) => {
      if (!trackMouse) return;
      handleStart(e.clientX, e.clientY);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!trackMouse) return;
      handleEnd(e.clientX, e.clientY);
    };

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll });
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventScroll });
    
    if (trackMouse) {
      element.addEventListener('mousedown', handleMouseDown);
      element.addEventListener('mouseup', handleMouseUp);
    }

    // Cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      
      if (trackMouse) {
        element.removeEventListener('mousedown', handleMouseDown);
        element.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [handlers, threshold, preventScroll, trackMouse]);

  return elementRef;
}

// Alternative hook that returns handlers to attach to any element
export function useSwipeHandlers(
  handlers: SwipeHandlers,
  config: SwipeConfig = {}
) {
  const {
    threshold = 50,
    preventScroll = true,
    trackMouse = true
  } = config;

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleStart = (x: number, y: number) => {
    touchStartRef.current = { x, y };
  };

  const handleEnd = (x: number, y: number) => {
    if (!touchStartRef.current) return;

    const deltaX = x - touchStartRef.current.x;
    const deltaY = y - touchStartRef.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > absDeltaY && absDeltaX > threshold) {
      if (deltaX > 0) {
        handlers.onSwipeRight?.();
      } else {
        handlers.onSwipeLeft?.();
      }
    } else if (absDeltaY > absDeltaX && absDeltaY > threshold) {
      if (deltaY > 0) {
        handlers.onSwipeDown?.();
      } else {
        handlers.onSwipeUp?.();
      }
    }

    touchStartRef.current = null;
  };

  const swipeProps = {
    onTouchStart: (e: React.TouchEvent) => {
      if (preventScroll) e.preventDefault();
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (preventScroll) e.preventDefault();
      const touch = e.changedTouches[0];
      handleEnd(touch.clientX, touch.clientY);
    },
    ...(trackMouse && {
      onMouseDown: (e: React.MouseEvent) => {
        handleStart(e.clientX, e.clientY);
      },
      onMouseUp: (e: React.MouseEvent) => {
        handleEnd(e.clientX, e.clientY);
      }
    })
  };

  return swipeProps;
}