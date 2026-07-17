import { useCallback, useRef } from 'react';
import { usePostHog } from 'posthog-react-native';
import { Platform } from 'react-native';

export const useAnalytics = () => {
  // Use a ref to hold posthog - prevents capture/identify identity from
  // changing on every render. Without this, usePostHog() returns a new
  // object reference each render, causing useCallback deps to invalidate
  // and cascading duplicate events through useEffect([capture]) chains.
  const posthogRef = useRef<ReturnType<typeof usePostHog> | null>(null);
  
  try {
    posthogRef.current = usePostHog();
  } catch {
    // PostHogProvider is not available - this is expected when credentials are missing
    posthogRef.current = null;
  }

  const capture = useCallback((event: string, properties?: Record<string, any>) => {
    try {
      if (Platform.OS === 'web') {
        console.log(`Analytics (web): ${event}`, properties);
        return;
      }

      const posthog = posthogRef.current;
      if (!posthog) {
        return;
      }

      // PostHog is safe to call even before ready - it queues events internally
      posthog.capture(event, properties);
    } catch {
      // Analytics errors are non-critical and should not interrupt user experience
      // Fail silently to maintain smooth UX
    }
  }, []); // Empty deps - stable identity, no re-render cascade

  const identify = useCallback((userId: string, properties?: Record<string, any>) => {
    try {
      if (Platform.OS === 'web') {
        console.log(`Analytics identify (web): ${userId}`, properties);
        return;
      }

      const posthog = posthogRef.current;
      if (!posthog) {
        return;
      }

      // PostHog is safe to call even before ready - it queues events internally
      posthog.identify(userId, properties);
    } catch {
      // Analytics errors are non-critical and should not interrupt user experience
      // Fail silently to maintain smooth UX
    }
  }, []);

  return { capture, identify };
};