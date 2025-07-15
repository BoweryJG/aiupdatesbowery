/**
 * Haptic feedback utilities for mobile devices
 */

// Check if the device supports haptic feedback
export const supportsHaptics = () => {
  return 'vibrate' in navigator || 'VibrationAPI' in window;
};

// Haptic feedback patterns
export const haptics = {
  // Light tap - for button presses
  light: () => {
    if (supportsHaptics()) {
      navigator.vibrate?.(10);
    }
  },
  
  // Medium tap - for selections
  medium: () => {
    if (supportsHaptics()) {
      navigator.vibrate?.(20);
    }
  },
  
  // Heavy tap - for important actions
  heavy: () => {
    if (supportsHaptics()) {
      navigator.vibrate?.(30);
    }
  },
  
  // Success pattern
  success: () => {
    if (supportsHaptics()) {
      navigator.vibrate?.([10, 50, 10]);
    }
  },
  
  // Error pattern
  error: () => {
    if (supportsHaptics()) {
      navigator.vibrate?.([50, 100, 50]);
    }
  },
  
  // Selection pattern
  selection: () => {
    if (supportsHaptics()) {
      navigator.vibrate?.([5, 10, 5]);
    }
  }
};

// Hook for haptic feedback
export const useHaptics = () => {
  return haptics;
};