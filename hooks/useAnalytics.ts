import { usePostHog } from 'posthog-react-native';
import { useCallback } from 'react';

export const useAnalytics = () => {
  const posthog = usePostHog();

  const capture = useCallback((event: string, properties?: Record<string, any>) => {
    try {
      if (posthog && typeof posthog.capture === 'function') {
        posthog.capture(event, properties);
      }
    } catch (error) {
      // Silently fail - don't crash the app if analytics fails
      console.log('Analytics capture failed (offline?):', error);
    }
  }, [posthog]);

  const identify = useCallback((userId: string, properties?: Record<string, any>) => {
    try {
      if (posthog && typeof posthog.identify === 'function') {
        posthog.identify(userId, properties);
      }
    } catch (error) {
      console.log('Analytics identify failed (offline?):', error);
    }
  }, [posthog]);

  return { capture, identify };
};
