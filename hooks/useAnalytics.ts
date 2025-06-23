import { usePostHog } from 'posthog-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

export const useAnalytics = () => {
  const posthog = usePostHog();
  const [isReady, setIsReady] = useState(false);

  // Check if PostHog is ready - FIX: Add proper cleanup and guards
  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsReady(true);
      return;
    }

    // Handle case where PostHog is not initialized at all
    if (!posthog) {
      setIsReady(true);
      return;
    }

    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const checkReady = () => {
      if (!isMounted) return;
      
      if (posthog && typeof posthog.capture === 'function') {
        setIsReady(true);
      } else {
        // Limit retries to prevent infinite loops
        timeoutId = setTimeout(checkReady, 100);
      }
    };

    // Only start checking if not already ready
    if (!isReady) {
      timeoutId = setTimeout(checkReady, 500);
    }

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [posthog]); // Remove isReady from dependencies to prevent loops

  const capture = useCallback((event: string, properties?: Record<string, any>) => {
    try {
      if (Platform.OS === 'web') {
        console.log(`Analytics (web): ${event}`, properties);
        return;
      }

      if (!posthog) {
        console.log(`Analytics (not available): ${event}`, properties);
        return;
      }

      if (!isReady || typeof posthog.capture !== 'function') {
        console.log(`Analytics (not ready): ${event}`, properties);
        return;
      }

      posthog.capture(event, properties);
    } catch (error) {
      console.log('Analytics capture failed:', error);
    }
  }, [posthog, isReady]);

  const identify = useCallback((userId: string, properties?: Record<string, any>) => {
    try {
      if (Platform.OS === 'web') {
        console.log(`Analytics identify (web): ${userId}`, properties);
        return;
      }

      if (!posthog) {
        console.log(`Analytics identify (not available): ${userId}`, properties);
        return;
      }

      if (!isReady || typeof posthog.identify !== 'function') {
        console.log(`Analytics identify (not ready): ${userId}`, properties);
        return;
      }

      posthog.identify(userId, properties);
    } catch (error) {
      console.log('Analytics identify failed:', error);
    }
  }, [posthog, isReady]);

  return { capture, identify, isReady: isReady || !posthog };
};
