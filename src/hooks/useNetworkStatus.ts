import { useEffect, useState } from 'react';
import { useNewsStore } from '../store/newsStore';
import { useAIStore } from '../store/aiStore';

/**
 * Custom hook to monitor network status and handle online/offline events
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionSpeed, setConnectionSpeed] = useState<'slow' | 'fast' | 'unknown'>('unknown');
  
  const newsStore = useNewsStore();
  const aiStore = useAIStore();

  useEffect(() => {
    // Check connection speed if available
    const checkConnectionSpeed = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;
      
      if (connection) {
        const effectiveType = connection.effectiveType;
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          setConnectionSpeed('slow');
        } else {
          setConnectionSpeed('fast');
        }
        
        // Listen for connection changes
        connection.addEventListener('change', checkConnectionSpeed);
      }
    };
    
    checkConnectionSpeed();

    const handleOnline = () => {
      setIsOnline(true);
      newsStore.checkOnlineStatus();
      aiStore.checkOnlineStatus();
      
      console.log('Network status: Online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      newsStore.checkOnlineStatus();
      aiStore.checkOnlineStatus();
      
      console.log('Network status: Offline');
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    if (navigator.onLine !== isOnline) {
      setIsOnline(navigator.onLine);
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;
      if (connection) {
        connection.removeEventListener('change', checkConnectionSpeed);
      }
    };
  }, []);

  return { isOnline, connectionSpeed };
}

/**
 * Hook to periodically check if the app can reach the server
 */
export function useServerHealthCheck(intervalMs: number = 60000) {
  const [isServerReachable, setIsServerReachable] = useState(true);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        // Simple health check - just try to fetch with a short timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/health`, {
          method: 'HEAD',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        setIsServerReachable(response.ok || response.status === 404); // 404 is ok, means we reached the server
        setLastCheckTime(new Date());
      } catch (error) {
        setIsServerReachable(false);
        setLastCheckTime(new Date());
      }
    };

    // Initial check
    checkServerHealth();

    // Set up interval
    const interval = setInterval(checkServerHealth, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return { isServerReachable, lastCheckTime };
}